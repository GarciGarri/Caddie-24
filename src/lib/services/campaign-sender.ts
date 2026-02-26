import { prisma } from "@/lib/prisma";
import type { SegmentQuery } from "@/lib/validations/campaign";

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
 * Simulated campaign send
 * Creates recipients, simulates delivery statuses, updates campaign counters
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
    select: { id: true, firstName: true, lastName: true },
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
    console.log(`[SIMULATED] Campaign "${campaign.name}" — no recipients matched`);
    return { sent: 0 };
  }

  // 3. Create recipients
  await prisma.campaignRecipient.createMany({
    data: players.map((p) => ({
      campaignId,
      playerId: p.id,
      status: "SENT",
      sentAt: new Date(),
    })),
    skipDuplicates: true,
  });

  // 4. Simulate delivery outcomes
  const now = new Date();
  let delivered = 0;
  let read = 0;
  let failed = 0;

  const recipients = await prisma.campaignRecipient.findMany({
    where: { campaignId },
  });

  for (const r of recipients) {
    const rand = Math.random();
    if (rand < 0.05) {
      // 5% fail
      await prisma.campaignRecipient.update({
        where: { id: r.id },
        data: { status: "FAILED", failureReason: "Simulado: número no válido" },
      });
      failed++;
    } else if (rand < 0.35) {
      // 30% read
      await prisma.campaignRecipient.update({
        where: { id: r.id },
        data: { status: "READ", deliveredAt: now, readAt: now },
      });
      delivered++;
      read++;
    } else {
      // 65% delivered but not read
      await prisma.campaignRecipient.update({
        where: { id: r.id },
        data: { status: "DELIVERED", deliveredAt: now },
      });
      delivered++;
    }
  }

  // 5. Update campaign counters
  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      totalRecipients: players.length,
      totalSent: players.length - failed,
      totalDelivered: delivered,
      totalRead: read,
      totalFailed: failed,
    },
  });

  console.log(
    `[SIMULATED] Campaign "${campaign.name}" sent to ${players.length} recipients — ` +
    `${delivered} delivered, ${read} read, ${failed} failed`
  );

  return { sent: players.length, delivered, read, failed };
}
