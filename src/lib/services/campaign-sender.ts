import { prisma } from "@/lib/prisma";
import type { SegmentQuery } from "@/lib/validations/campaign";
import {
  sendTemplateMessage,
  mapLanguageCode,
} from "@/lib/services/whatsapp";
import type { TemplateComponent } from "@/lib/services/whatsapp";
import { sendTelegramMessage } from "@/lib/services/telegram";
import { sendEmail } from "@/lib/services/email";
import { OPT_OUT_TAG } from "@/lib/services/consent";

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

  where.tags = {};

  if (segment.tags && segment.tags.length > 0) {
    where.tags.some = {
      tag: { in: segment.tags },
    };
  }

  // RGPD: never include players who unsubscribed from communications
  where.tags.none = { tag: OPT_OUT_TAG };

  if (segment.membersOnly) {
    where.membership = { is: { status: "ACTIVE" } };
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

/** Replace {{1}} / {{nombre}} placeholders with the player's first name. */
function personalize(text: string, firstName: string): string {
  return text.replace(/\{\{\s*(1|nombre|name)\s*\}\}/gi, firstName);
}

/**
 * Send campaign through its channel (WhatsApp template, Telegram or Email).
 * Creates recipients, sends messages, tracks status.
 */
export async function sendCampaign(campaignId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) throw new Error("Campaña no encontrada");
  if (campaign.status !== "DRAFT" && campaign.status !== "SCHEDULED") {
    throw new Error("La campaña ya fue enviada o está en progreso");
  }

  const channel = campaign.channel || "WHATSAPP";

  // 1. Set status to SENDING
  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: "SENDING", sentAt: new Date() },
  });

  // 2. Find matching players, requiring the channel-specific identity
  const segment = campaign.segmentQuery as SegmentQuery;
  const where = buildPlayerFilter(segment);
  if (channel === "TELEGRAM") where.telegramChatId = { not: null };
  if (channel === "EMAIL") where.email = { not: null };

  const players = await prisma.player.findMany({
    where,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      telegramChatId: true,
    },
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

  // 3. WhatsApp needs its approved template
  let template: { name: string; language: any; components: any } | null = null;
  let languageCode = "es";
  if (channel === "WHATSAPP") {
    template = await prisma.whatsAppTemplate.findUnique({
      where: { name: campaign.templateName },
    });

    if (!template) {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: "DRAFT" },
      });
      throw new Error(`Template "${campaign.templateName}" no encontrado`);
    }
    languageCode = mapLanguageCode(template.language);
  }

  // 4. Create recipients (all PENDING initially)
  await prisma.campaignRecipient.createMany({
    data: players.map((p) => ({
      campaignId,
      playerId: p.id,
      status: "PENDING",
    })),
    skipDuplicates: true,
  });

  // 5. Send per recipient
  const recipients = await prisma.campaignRecipient.findMany({
    where: { campaignId },
    include: {
      player: {
        select: {
          id: true,
          phone: true,
          email: true,
          telegramChatId: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  let sent = 0;
  let failed = 0;

  for (const r of recipients) {
    try {
      if (channel === "WHATSAPP") {
        if (!r.player.phone || r.player.phone.includes(":")) {
          throw new Error("Sin número de teléfono");
        }
        const components = buildTemplateComponents(template as any, {
          firstName: r.player.firstName,
          lastName: r.player.lastName || undefined,
        });
        const result = await sendTemplateMessage(
          r.player.phone,
          template!.name,
          languageCode,
          components
        );
        await createCampaignMessageRecord(
          r.player.id,
          result.whatsappMessageId,
          (template as any).components?.body?.text ||
            `[Template: ${template!.name}]`,
          template!.name,
          "whatsapp"
        );
      } else if (channel === "TELEGRAM") {
        if (!r.player.telegramChatId) throw new Error("Sin Telegram vinculado");
        const body = personalize(campaign.messageBody || "", r.player.firstName);
        const result = await sendTelegramMessage(r.player.telegramChatId, body);
        await createCampaignMessageRecord(
          r.player.id,
          `tg:${r.player.telegramChatId}:${result.externalId}`,
          body,
          null,
          "telegram"
        );
      } else {
        // EMAIL
        if (!r.player.email) throw new Error("Sin email");
        const body = personalize(campaign.messageBody || "", r.player.firstName);
        const subject = personalize(
          campaign.emailSubject || campaign.name,
          r.player.firstName
        );
        await sendEmail(r.player.email, subject, body);
      }

      await prisma.campaignRecipient.update({
        where: { id: r.id },
        data: { status: "SENT", sentAt: new Date() },
      });
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
    `[Campaign] "${campaign.name}" (${channel}) sent to ${recipients.length} recipients — ` +
      `${sent} sent, ${failed} failed`
  );

  return { sent, failed, total: recipients.length };
}

/**
 * Send every SCHEDULED campaign whose scheduledAt is due.
 * Called from the daily cron and opportunistically when the campaign
 * list is loaded, so scheduled sends go out even on plans without
 * frequent cron executions.
 */
export async function processDueScheduledCampaigns(): Promise<{
  processed: number;
  results: Array<{ campaignId: string; name: string; sent: number; failed: number }>;
}> {
  const settings = await prisma.clubSettings.findUnique({
    where: { id: "default" },
    select: { demoMode: true },
  });
  if (settings?.demoMode) return { processed: 0, results: [] };

  const due = await prisma.campaign.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: new Date() },
    },
    select: { id: true, name: true },
    orderBy: { scheduledAt: "asc" },
  });

  const results: Array<{ campaignId: string; name: string; sent: number; failed: number }> = [];
  for (const campaign of due) {
    try {
      const result = await sendCampaign(campaign.id);
      results.push({
        campaignId: campaign.id,
        name: campaign.name,
        sent: result.sent,
        failed: result.failed,
      });
    } catch (error) {
      console.error(
        `[Campaign] Error sending scheduled campaign "${campaign.name}":`,
        error
      );
      results.push({ campaignId: campaign.id, name: campaign.name, sent: 0, failed: 0 });
    }
  }

  return { processed: due.length, results };
}

/**
 * Create a Message record in the player's conversation for campaign messages
 * so they appear in the inbox (WhatsApp and Telegram channels).
 */
async function createCampaignMessageRecord(
  playerId: string,
  externalMessageId: string,
  content: string,
  templateName: string | null,
  channel: string
): Promise<void> {
  try {
    // Find or create conversation on the campaign's channel
    let conversation = await prisma.conversation.findFirst({
      where: {
        playerId,
        channel,
        status: { in: ["OPEN", "PENDING"] },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          playerId,
          status: "OPEN",
          channel,
          lastMessageAt: new Date(),
          isAiBotActive: true,
        },
      });
    }

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        whatsappMessageId: externalMessageId,
        direction: "OUTBOUND",
        type: templateName ? "TEMPLATE" : "TEXT",
        content,
        templateName,
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
