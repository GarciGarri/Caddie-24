import { prisma } from "@/lib/prisma";
import type { SegmentQuery } from "@/lib/validations/campaign";
import {
  sendTemplateMessage,
  mapLanguageCode,
} from "@/lib/services/whatsapp";
import type { TemplateComponent } from "@/lib/services/whatsapp";

/**
 * Build Prisma where clause from a campaign's segmentQuery
 */
export function buildPlayerFilter(segment: SegmentQuery) {
  const where: any = { isActive: true };

  if (segment.engagementLevels && segment.engagementLevels.length > 0) {
    where.engagementLevel = { in: segment.engagementLevels };
  }

  if (segment.languages && segment.languages.length > 0) {
    where.preferredLanguage = { in: segment.languages };
  }

  if (segment.handicapMin !== undefined || segment.handicapMax !== undefined) {
    where.handicap = {};
    if (segment.handicapMin !== undefined) where.handicap.gte = segment.handicapMin;
    if (segment.handicapMax !== undefined) where.handicap.lte = segment.handicapMax;
  }

  if (segment.tags && segment.tags.length > 0) {
    where.tags = {
      some: {
        tag: { in: segment.tags },
      },
    };
  }

  if (segment.tournamentIds && segment.tournamentIds.length > 0) {
    where.tournamentRegistrations = {
      some: {
        tournamentId: { in: segment.tournamentIds },
        status: { in: ["REGISTERED", "CONFIRMED"] },
      },
    };
  }

  return where;
}

/**
 * Preview recipients matching a segment query
 */
export async function previewRecipients(segment: SegmentQuery) {
  const where = buildPlayerFilter(segment);

  const players = await prisma.player.findMany({
    where,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      engagementLevel: true,
      preferredLanguage: true,
    },
    orderBy: { lastName: "asc" },
  });

  return { players, total: players.length };
}

/**
 * Build template components with player-specific data
 */
function buildTemplateComponents(
  template: { components: any },
  player: { firstName: string; lastName?: string }
): TemplateComponent[] | undefined {
  // If template has body with {{1}} placeholder, substitute with player name
  const body = template.components?.body?.text;
  if (!body || !body.includes("{{")) return undefined;

  // Count placeholders
  const matches = body.match(/\{\{\d+\}\}/g);
  if (!matches) return undefined;

  const params = matches.map((_match: string, idx: number) => {
    if (idx === 0) return { type: "text" as const, text: player.firstName };
    return { type: "text" as const, text: "" };
  });

  return [{ type: "body", parameters: params }];
}

/**
 * Send campaign via WhatsApp Business API
 * Creates recipients, sends template messages, tracks status
 */
export async function sendCampaign(campaignId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) throw new Error("Campaña no encontrada");
  if (campaign.status !== "DRAFT" && campaign.status !== "SCHEDULED") {
    throw new Error("La campaña ya fue enviada o está en progreso");
  }

  // 1. Set status to SENDING
  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: "SENDING", sentAt: new Date() },
  });

  // 2. Find matching players
  const segment = campaign.segmentQuery as SegmentQuery;
  const where = buildPlayerFilter(segment);
  const players = await prisma.player.findMany({
    where,
    select: { id: true, firstName: true, lastName: true, phone: true },
  });

  if (players.length === 0) {
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        totalRecipients: 0,
      },
    });
    console.log(`[Campaign] "${campaign.name}" — no recipients matched`);
    return { sent: 0, failed: 0, total: 0 };
  }

  // 3. Fetch template
  const template = await prisma.whatsAppTemplate.findUnique({
    where: { name: campaign.templateName },
  });

  if (!template) {
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: "DRAFT" },
    });
    throw new Error(`Template "${campaign.templateName}" no encontrado`);
  }

  const languageCode = mapLanguageCode(template.language);

  // 4. Create recipients (all PENDING initially)
  await prisma.campaignRecipient.createMany({
    data: players.map((p) => ({
      campaignId,
      playerId: p.id,
      status: "PENDING",
    })),
    skipDuplicates: true,
  });

  // 5. Send template messages
  const recipients = await prisma.campaignRecipient.findMany({
    where: { campaignId },
    include: {
      player: { select: { id: true, phone: true, firstName: true, lastName: true } },
    },
  });

  let sent = 0;
  let failed = 0;

  for (const r of recipients) {
    if (!r.player.phone) {
      await prisma.campaignRecipient.update({
        where: { id: r.id },
        data: { status: "FAILED", failureReason: "Sin número de teléfono" },
      });
      failed++;
      continue;
    }

    try {
      const components = buildTemplateComponents(
        template as any,
        { firstName: r.player.firstName, lastName: r.player.lastName || undefined }
      );

      const result = await sendTemplateMessage(
        r.player.phone,
        template.name,
        languageCode,
        components
      );

      await prisma.campaignRecipient.update({
        where: { id: r.id },
        data: { status: "SENT", sentAt: new Date() },
      });

      // Create message record in conversation so it shows in inbox
      await createCampaignMessageRecord(
        r.player.id,
        result.whatsappMessageId,
        template,
        campaignId
      );

      sent++;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Error desconocido";
      await prisma.campaignRecipient.update({
        where: { id: r.id },
        data: { status: "FAILED", failureReason: errMsg },
      });
      failed++;
    }

    // Rate limiting: small delay between sends
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  // 6. Update campaign counters
  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      status: "SENT",
      totalRecipients: recipients.length,
      totalSent: sent,
      totalFailed: failed,
      // totalDelivered and totalRead will be updated via webhook status updates
    },
  });

  console.log(
    `[Campaign] "${campaign.name}" sent to ${recipients.length} recipients — ` +
      `${sent} sent, ${failed} failed`
  );

  return { sent, failed, total: recipients.length };
}

/**
 * Create a Message record in the player's conversation for campaign messages
 * so they appear in the inbox.
 */
async function createCampaignMessageRecord(
  playerId: string,
  whatsappMessageId: string,
  template: { name: string; components: any },
  campaignId: string
): Promise<void> {
  try {
    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        playerId,
        status: { in: ["OPEN", "PENDING"] },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          playerId,
          status: "OPEN",
          channel: "whatsapp",
          lastMessageAt: new Date(),
          isAiBotActive: true,
        },
      });
    }

    const content =
      template.components?.body?.text || `[Template: ${template.name}]`;

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        whatsappMessageId,
        direction: "OUTBOUND",
        type: "TEMPLATE",
        content,
        templateName: template.name,
        status: "SENT",
        sentBy: "campaign",
        timestamp: new Date(),
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: content.substring(0, 255),
      },
    });
  } catch (err) {
    console.error("[Campaign] Error creating message record:", err);
  }
}
