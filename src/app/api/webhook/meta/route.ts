import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { triggerAutoReply } from "@/lib/services/ai-reply";
import { processInboundConsent } from "@/lib/services/consent";

// Shared webhook for Facebook Messenger (object: "page") and
// Instagram DMs (object: "instagram") — both delivered by Meta
// with the same messaging payload shape.

// --- GET: webhook verification ---
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && challenge) {
    const settings = await prisma.clubSettings.findUnique({
      where: { id: "default" },
      select: { metaWebhookVerifyToken: true },
    });
    if (
      settings?.metaWebhookVerifyToken &&
      token === settings.metaWebhookVerifyToken
    ) {
      return new Response(challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }
  }
  return new Response("Forbidden", { status: 403 });
}

// --- POST: incoming events ---
export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  processMetaPayload(body).catch((err) =>
    console.error("[Meta] Error processing webhook:", err)
  );

  return NextResponse.json({ status: "ok" });
}

async function processMetaPayload(body: any): Promise<void> {
  const channel =
    body.object === "instagram"
      ? "instagram"
      : body.object === "page"
        ? "messenger"
        : null;
  if (!channel || !body.entry) return;

  for (const entry of body.entry) {
    for (const event of entry.messaging || []) {
      // Ignore echoes of our own messages and non-message events
      if (!event.message || event.message.is_echo) continue;
      await handleMetaMessage(event, channel);
    }
  }
}

async function handleMetaMessage(
  event: any,
  channel: "messenger" | "instagram"
): Promise<void> {
  const senderId = String(event.sender?.id || "");
  const text: string = event.message?.text || "";
  const mid: string = event.message?.mid || "";
  if (!senderId || !text) return;

  const idField = channel === "messenger" ? "facebookPsid" : "instagramId";
  const prefix = channel === "messenger" ? "fb" : "ig";

  // 1. Find or create player
  let player = await prisma.player.findFirst({
    where: { [idField]: senderId },
  });

  if (!player) {
    player = await prisma.player.create({
      data: {
        firstName: channel === "messenger" ? "Messenger" : "Instagram",
        lastName: senderId.slice(-8),
        phone: `${prefix}:${senderId}`,
        [idField]: senderId,
        source: channel,
        engagementLevel: "NEW",
        preferredLanguage: "ES",
      },
    });
    console.log(`[Meta] Auto-created ${channel} player (${senderId})`);
  }

  // 2. Find or create conversation on this channel
  let conversation = await prisma.conversation.findFirst({
    where: {
      playerId: player.id,
      channel,
      status: { in: ["OPEN", "PENDING"] },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        playerId: player.id,
        status: "OPEN",
        channel,
        lastMessageAt: new Date(),
        isAiBotActive: true,
      },
    });
  }

  // 3. Idempotency
  const externalId = `${prefix}:${mid || `${senderId}:${event.timestamp}`}`;
  const existing = await prisma.message.findUnique({
    where: { whatsappMessageId: externalId },
  });
  if (existing) return;

  const timestamp = event.timestamp ? new Date(event.timestamp) : new Date();

  const inboundMessage = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      whatsappMessageId: externalId,
      direction: "INBOUND",
      type: "TEXT",
      content: text,
      status: "DELIVERED",
      timestamp,
    },
  });

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      lastMessageAt: timestamp,
      lastMessagePreview: text.substring(0, 255),
      unreadCount: { increment: 1 },
      status: "OPEN",
    },
  });

  console.log(`[Meta] Incoming ${channel} from ${senderId}: ${text.substring(0, 50)}`);

  // 4. RGPD consent keywords
  const consentHandled = await processInboundConsent(
    conversation.id,
    player,
    text
  );
  if (consentHandled) return;

  // 5. AI auto-reply
  triggerAutoReply(
    conversation.id,
    text,
    player.id,
    inboundMessage.id,
    "TEXT"
  ).catch((err) => console.error("[Meta] Auto-reply error:", err));
}
