import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  markAsRead as markAsReadOnWhatsApp,
  getMediaUrl,
  normalizePhoneForDb,
  sendTextMessage,
} from "@/lib/services/whatsapp";
import { triggerAutoReply } from "@/lib/services/ai-reply";
import { createNotificationForAllAdmins } from "@/lib/services/notifications";
import {
  isOptOutMessage,
  isOptInMessage,
  optOutPlayer,
  optInPlayer,
  OPT_OUT_CONFIRMATION,
  OPT_IN_CONFIRMATION,
} from "@/lib/services/consent";

// --- GET: Webhook verification ---
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && challenge) {
    const settings = await prisma.clubSettings.findUnique({
      where: { id: "default" },
      select: { webhookVerifyToken: true },
    });

    if (settings?.webhookVerifyToken && token === settings.webhookVerifyToken) {
      // Meta requires plain text response with the challenge
      return new Response(challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }
  }

  return new Response("Forbidden", { status: 403 });
}

// --- POST: Incoming notifications ---
export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Always respond 200 immediately (Meta requirement to avoid retries)
  // Process asynchronously
  processWebhookPayload(body).catch((err) =>
    console.error("[Webhook] Error processing:", err)
  );

  return NextResponse.json({ status: "ok" });
}

// --- Webhook processing ---

async function processWebhookPayload(body: any): Promise<void> {
  if (!body.entry) return;

  for (const entry of body.entry) {
    for (const change of entry.changes || []) {
      const value = change.value;
      if (!value || change.field !== "messages") continue;

      // Process incoming messages
      if (value.messages) {
        for (const msg of value.messages) {
          await handleIncomingMessage(msg, value.contacts?.[0]);
        }
      }

      // Process status updates (sent, delivered, read, failed)
      if (value.statuses) {
        for (const status of value.statuses) {
          await handleStatusUpdate(status);
        }
      }
    }
  }
}

// --- Handle incoming message ---

async function handleIncomingMessage(
  msg: any,
  contact: any
): Promise<void> {
  const senderPhone = normalizePhoneForDb(msg.from);
  const whatsappId = msg.from;

  // 1. Find or create player
  let player = await prisma.player.findFirst({
    where: {
      OR: [{ phone: senderPhone }, { whatsappId }],
    },
  });

  if (!player) {
    const contactName = contact?.profile?.name || "";
    const nameParts = contactName.split(" ");
    const firstName = nameParts[0] || "WhatsApp";
    const lastName = nameParts.slice(1).join(" ") || senderPhone;

    player = await prisma.player.create({
      data: {
        firstName,
        lastName,
        phone: senderPhone,
        whatsappId,
        source: "whatsapp",
        engagementLevel: "NEW",
        preferredLanguage: "ES",
      },
    });
    console.log(`[Webhook] Auto-created player: ${firstName} ${lastName} (${senderPhone})`);
  } else if (!player.whatsappId) {
    // Update whatsappId if missing
    await prisma.player.update({
      where: { id: player.id },
      data: { whatsappId },
    });
  }

  // 2. Find or create conversation
  let conversation = await prisma.conversation.findFirst({
    where: {
      playerId: player.id,
      status: { in: ["OPEN", "PENDING"] },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        playerId: player.id,
        status: "OPEN",
        channel: "whatsapp",
        lastMessageAt: new Date(),
        isAiBotActive: true,
      },
    });
  }

  // 3. Determine message type and extract content
  const { type, content, mediaUrl, mediaMimeType } = await extractMessageContent(msg);

  // 4. Check for duplicate (idempotency via whatsappMessageId unique constraint)
  const existing = await prisma.message.findUnique({
    where: { whatsappMessageId: msg.id },
  });
  if (existing) return; // Already processed

  // 5. Create message record
  const timestamp = msg.timestamp
    ? new Date(parseInt(msg.timestamp) * 1000)
    : new Date();

  const inboundMessage = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      whatsappMessageId: msg.id,
      direction: "INBOUND",
      type: type as any,
      content,
      mediaUrl,
      mediaMimeType,
      status: "DELIVERED",
      timestamp,
    },
  });

  // 6. Update conversation
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      lastMessageAt: timestamp,
      lastMessagePreview: (content || "").substring(0, 255),
      unreadCount: { increment: 1 },
      status: "OPEN",
    },
  });

  // 7. Send read receipt back to WhatsApp
  try {
    await markAsReadOnWhatsApp(msg.id);
  } catch {
    // Non-critical, don't fail the webhook
  }

  console.log(
    `[Webhook] Incoming ${type} from ${senderPhone}: ${(content || "").substring(0, 50)}`
  );

  // 8. RGPD: handle unsubscribe / re-subscribe requests before any auto-reply
  if (type === "TEXT" && isOptOutMessage(content)) {
    await handleConsentChange(conversation.id, player, senderPhone, "OUT");
    return;
  }
  if (type === "TEXT" && isOptInMessage(content)) {
    await handleConsentChange(conversation.id, player, senderPhone, "IN");
    return;
  }

  // 9. Trigger AI auto-reply (non-blocking)
  triggerAutoReply(
    conversation.id,
    content,
    player.id,
    inboundMessage.id,
    senderPhone,
    type
  ).catch((err) =>
    console.error("[Webhook] Auto-reply error:", err)
  );
}

// --- RGPD consent handling (BAJA / ALTA keywords) ---

async function handleConsentChange(
  conversationId: string,
  player: { id: string; firstName: string; lastName: string; preferredLanguage: string },
  senderPhone: string,
  direction: "OUT" | "IN"
): Promise<void> {
  try {
    if (direction === "OUT") {
      await optOutPlayer(player.id);
    } else {
      await optInPlayer(player.id);
    }

    const lang = player.preferredLanguage || "ES";
    const confirmation =
      direction === "OUT"
        ? OPT_OUT_CONFIRMATION[lang] || OPT_OUT_CONFIRMATION.ES
        : OPT_IN_CONFIRMATION[lang] || OPT_IN_CONFIRMATION.ES;

    // Confirm inside the 24h customer-service window we just opened
    try {
      const { whatsappMessageId } = await sendTextMessage(senderPhone, confirmation);
      await prisma.message.create({
        data: {
          conversationId,
          whatsappMessageId,
          direction: "OUTBOUND",
          type: "TEXT",
          content: confirmation,
          status: "SENT",
          sentBy: "system",
          timestamp: new Date(),
        },
      });
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageAt: new Date(),
          lastMessagePreview: confirmation.substring(0, 255),
        },
      });
    } catch (err) {
      // WhatsApp not configured or send failed — opt-out is still recorded
      console.error("[Webhook] Consent confirmation send failed:", err);
    }

    if (direction === "OUT") {
      createNotificationForAllAdmins({
        type: "NEW_MESSAGE",
        title: "Baja de comunicaciones",
        body: `${player.firstName} ${player.lastName} se ha dado de baja de las comunicaciones comerciales.`,
        link: `/players/${player.id}`,
        data: { playerId: player.id },
      }).catch(() => {});
    }

    console.log(
      `[Webhook] Player ${player.id} opted ${direction === "OUT" ? "out of" : "into"} marketing communications`
    );
  } catch (err) {
    console.error("[Webhook] Consent change error:", err);
  }
}

// --- Extract message content by type ---

async function extractMessageContent(msg: any): Promise<{
  type: string;
  content: string;
  mediaUrl: string | null;
  mediaMimeType: string | null;
}> {
  switch (msg.type) {
    case "text":
      return {
        type: "TEXT",
        content: msg.text?.body || "",
        mediaUrl: null,
        mediaMimeType: null,
      };

    case "image":
    case "video":
    case "document":
    case "audio": {
      const media = msg[msg.type];
      let url: string | null = null;
      try {
        url = await getMediaUrl(media.id);
      } catch {
        // Store without URL if fetch fails
      }
      return {
        type: msg.type.toUpperCase(),
        content: media.caption || `[${msg.type}]`,
        mediaUrl: url,
        mediaMimeType: media.mime_type || null,
      };
    }

    case "location":
      return {
        type: "LOCATION",
        content: JSON.stringify({
          latitude: msg.location?.latitude,
          longitude: msg.location?.longitude,
          name: msg.location?.name,
          address: msg.location?.address,
        }),
        mediaUrl: null,
        mediaMimeType: null,
      };

    case "reaction":
      return {
        type: "REACTION",
        content: msg.reaction?.emoji || "",
        mediaUrl: null,
        mediaMimeType: null,
      };

    case "interactive":
      return {
        type: "INTERACTIVE",
        content:
          msg.interactive?.button_reply?.title ||
          msg.interactive?.list_reply?.title ||
          "[interactive]",
        mediaUrl: null,
        mediaMimeType: null,
      };

    default:
      return {
        type: "TEXT",
        content: `[${msg.type || "unknown"}]`,
        mediaUrl: null,
        mediaMimeType: null,
      };
  }
}

// --- Handle status update ---

async function handleStatusUpdate(status: any): Promise<void> {
  if (!status.id) return;

  const message = await prisma.message.findUnique({
    where: { whatsappMessageId: status.id },
  });

  if (!message) return;

  const statusMap: Record<string, string> = {
    sent: "SENT",
    delivered: "DELIVERED",
    read: "READ",
    failed: "FAILED",
  };

  const newStatus = statusMap[status.status];
  if (!newStatus) return;

  const updateData: any = { status: newStatus };

  if (status.status === "delivered") {
    updateData.deliveredAt = status.timestamp
      ? new Date(parseInt(status.timestamp) * 1000)
      : new Date();
  }

  if (status.status === "read") {
    updateData.readAt = status.timestamp
      ? new Date(parseInt(status.timestamp) * 1000)
      : new Date();
    // Also set deliveredAt if not already set
    if (!message.deliveredAt) {
      updateData.deliveredAt = updateData.readAt;
    }
  }

  await prisma.message.update({
    where: { id: message.id },
    data: updateData,
  });

  // If failed, log the error + notify admins
  if (status.status === "failed" && status.errors?.length > 0) {
    const errorMsg = status.errors[0].title || status.errors[0].message || "Error desconocido";
    console.error(`[Webhook] Message ${status.id} failed:`, errorMsg);

    // Notify admins about the failure
    createNotificationForAllAdmins({
      type: "CAMPAIGN_ERROR",
      title: "Error en envio de mensaje",
      body: `Mensaje ${status.id.substring(0, 12)}... fallo: ${errorMsg}`,
      link: "/campaigns",
      data: { whatsappMessageId: status.id, error: errorMsg },
    }).catch((err) =>
      console.error("[Webhook] Notification error:", err)
    );
  }

  // Update campaign recipient status if applicable
  if (message.direction === "OUTBOUND" && message.templateName) {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id: message.conversationId },
        select: { playerId: true },
      });

      if (conversation) {
        // Find the most recent campaign recipient for this player
        const recipient = await prisma.campaignRecipient.findFirst({
          where: {
            playerId: conversation.playerId,
            status: { in: ["SENT", "DELIVERED"] },
          },
          orderBy: { sentAt: "desc" },
        });

        if (recipient) {
          await prisma.campaignRecipient.update({
            where: { id: recipient.id },
            data: {
              status: newStatus as any,
              ...(newStatus === "DELIVERED" ? { deliveredAt: updateData.deliveredAt } : {}),
              ...(newStatus === "READ" ? { readAt: updateData.readAt, deliveredAt: updateData.deliveredAt } : {}),
              ...(newStatus === "FAILED" ? { failureReason: status.errors?.[0]?.title || "Error" } : {}),
            },
          });

          // Update campaign aggregate counters
          const campaign = await prisma.campaign.findUnique({
            where: { id: recipient.campaignId },
          });
          if (campaign) {
            const counts = await prisma.campaignRecipient.groupBy({
              by: ["status"],
              where: { campaignId: campaign.id },
              _count: true,
            });
            const countMap: Record<string, number> = {};
            counts.forEach((c) => (countMap[c.status] = c._count));

            await prisma.campaign.update({
              where: { id: campaign.id },
              data: {
                totalDelivered: (countMap["DELIVERED"] || 0) + (countMap["READ"] || 0),
                totalRead: countMap["READ"] || 0,
                totalFailed: countMap["FAILED"] || 0,
              },
            });
          }
        }
      }
    } catch (err) {
      console.error("[Webhook] Error updating campaign recipient:", err);
    }
  }
}
