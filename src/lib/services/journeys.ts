import { prisma } from "@/lib/prisma";
import { sendProactive } from "@/lib/services/channels";
import { OPT_OUT_TAG } from "@/lib/services/consent";

/**
 * Lifecycle journeys: automated, deduplicated messages triggered by
 * player data (birthday, inactivity, membership renewal, visits).
 * Dedupe is enforced by the JourneyLog unique constraint
 * (playerId + type + dedupeKey), so running the engine multiple times
 * a day is safe and idempotent.
 */

export interface JourneyConfig {
  birthday: { enabled: boolean; message: string };
  welcome: { enabled: boolean; message: string };
  winback: { enabled: boolean; days: number; message: string };
  renewal: { enabled: boolean; daysBefore: number; message: string };
  postVisit: { enabled: boolean; message: string };
}

export const DEFAULT_JOURNEYS: JourneyConfig = {
  birthday: {
    enabled: true,
    message:
      "🎂 ¡Feliz cumpleaños, {{nombre}}! Todo el equipo de {{club}} te desea un gran día. Pásate por el club esta semana: tenemos un detalle para ti.",
  },
  welcome: {
    enabled: false,
    message:
      "👋 ¡Bienvenido a {{club}}, {{nombre}}! Estamos encantados de tenerte. Si quieres reservar una salida o conocer nuestras actividades, escríbenos por aquí.",
  },
  winback: {
    enabled: true,
    days: 75,
    message:
      "⛳ {{nombre}}, hace tiempo que no te vemos por {{club}} y el campo está estupendo. ¿Te reservamos una salida esta semana?",
  },
  renewal: {
    enabled: true,
    daysBefore: 30,
    message:
      "📅 Hola {{nombre}}, tu membresía de {{club}} vence el {{fecha}}. Responde a este mensaje y te gestionamos la renovación en un minuto.",
  },
  postVisit: {
    enabled: true,
    message:
      "Hola {{nombre}}, ¡gracias por tu visita de ayer a {{club}}! ¿Qué tal encontraste el campo? Tu opinión nos ayuda a mejorar.",
  },
};

export async function getJourneysConfig(): Promise<JourneyConfig> {
  const settings = await prisma.clubSettings.findUnique({
    where: { id: "default" },
    select: { journeysConfig: true },
  });
  const stored = (settings?.journeysConfig as any) || {};
  return {
    birthday: { ...DEFAULT_JOURNEYS.birthday, ...(stored.birthday || {}) },
    welcome: { ...DEFAULT_JOURNEYS.welcome, ...(stored.welcome || {}) },
    winback: { ...DEFAULT_JOURNEYS.winback, ...(stored.winback || {}) },
    renewal: { ...DEFAULT_JOURNEYS.renewal, ...(stored.renewal || {}) },
    postVisit: { ...DEFAULT_JOURNEYS.postVisit, ...(stored.postVisit || {}) },
  };
}

function fill(template: string, vars: Record<string, string>): string {
  let out = template;
  for (const [key, value] of Object.entries(vars)) {
    out = out.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "gi"), value);
  }
  return out;
}

const PLAYER_CHANNEL_SELECT = {
  id: true,
  firstName: true,
  phone: true,
  email: true,
  telegramChatId: true,
  facebookPsid: true,
  instagramId: true,
} as const;

async function trySendJourney(
  player: any,
  type: string,
  dedupeKey: string,
  text: string,
  emailSubject: string
): Promise<boolean> {
  // Claim the dedupe slot first; unique constraint prevents duplicates
  try {
    await prisma.journeyLog.create({
      data: { playerId: player.id, type, dedupeKey },
    });
  } catch {
    return false; // already sent
  }

  try {
    const channel = await sendProactive(player, text, emailSubject);
    await prisma.journeyLog.updateMany({
      where: { playerId: player.id, type, dedupeKey },
      data: { channel },
    });
    console.log(`[Journeys] ${type} sent to ${player.id} via ${channel}`);
    return true;
  } catch (err) {
    // Send failed (no channel / WA window closed): release the slot so a
    // future run can retry once the player has a usable channel.
    await prisma.journeyLog.deleteMany({
      where: { playerId: player.id, type, dedupeKey },
    });
    console.error(`[Journeys] ${type} failed for ${player.id}:`, err);
    return false;
  }
}

/** Base filter: active players who haven't opted out. */
const activeOptedIn = {
  isActive: true,
  tags: { none: { tag: OPT_OUT_TAG } },
};

export async function runDailyJourneys(): Promise<Record<string, number>> {
  const settings = await prisma.clubSettings.findUnique({
    where: { id: "default" },
    select: { demoMode: true, clubName: true },
  });
  if (settings?.demoMode) return {};

  const config = await getJourneysConfig();
  const clubName = settings?.clubName || "el club";
  const now = new Date();
  const counts: Record<string, number> = {
    birthday: 0,
    winback: 0,
    renewal: 0,
    postVisit: 0,
    welcome: 0,
  };

  // --- Birthdays (today) ---
  if (config.birthday.enabled) {
    const players = await prisma.player.findMany({
      where: { ...activeOptedIn, birthday: { not: null } },
      select: { ...PLAYER_CHANNEL_SELECT, birthday: true },
    });
    const todays = players.filter(
      (p) =>
        p.birthday &&
        p.birthday.getDate() === now.getDate() &&
        p.birthday.getMonth() === now.getMonth()
    );
    for (const p of todays) {
      const text = fill(config.birthday.message, {
        nombre: p.firstName,
        club: clubName,
      });
      if (
        await trySendJourney(
          p,
          "birthday",
          String(now.getFullYear()),
          text,
          `¡Feliz cumpleaños, ${p.firstName}!`
        )
      )
        counts.birthday++;
    }
  }

  // --- Winback (no visits in N days; max once per quarter) ---
  if (config.winback.enabled) {
    const threshold = new Date(now);
    threshold.setDate(threshold.getDate() - config.winback.days);
    const quarterKey = `${now.getFullYear()}-Q${Math.floor(now.getMonth() / 3) + 1}`;

    const candidates = await prisma.player.findMany({
      where: {
        ...activeOptedIn,
        engagementLevel: { not: "NEW" },
        createdAt: { lt: threshold },
        visits: { none: { date: { gte: threshold } } },
      },
      select: PLAYER_CHANNEL_SELECT,
      take: 50, // throttle per run
    });

    for (const p of candidates) {
      const text = fill(config.winback.message, {
        nombre: p.firstName,
        club: clubName,
      });
      if (
        await trySendJourney(p, "winback", quarterKey, text, "Te echamos de menos en el club")
      )
        counts.winback++;
    }
  }

  // --- Membership renewals (renewalDate within daysBefore) ---
  if (config.renewal.enabled) {
    const limit = new Date(now);
    limit.setDate(limit.getDate() + config.renewal.daysBefore);

    const memberships = await prisma.membership.findMany({
      where: {
        status: "ACTIVE",
        renewalDate: { gte: now, lte: limit },
        player: activeOptedIn,
      },
      include: { player: { select: PLAYER_CHANNEL_SELECT } },
    });

    for (const m of memberships) {
      const fecha = m.renewalDate!.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
      });
      const text = fill(config.renewal.message, {
        nombre: m.player.firstName,
        club: clubName,
        fecha,
      });
      if (
        await trySendJourney(
          m.player,
          "renewal",
          m.renewalDate!.toISOString().split("T")[0],
          text,
          "Renovación de tu membresía"
        )
      )
        counts.renewal++;
    }
  }

  // --- Post-visit feedback (visits from yesterday) ---
  if (config.postVisit.enabled) {
    const start = new Date(now);
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const visits = await prisma.visit.findMany({
      where: {
        date: { gte: start, lt: end },
        player: activeOptedIn,
      },
      include: { player: { select: PLAYER_CHANNEL_SELECT } },
    });

    for (const v of visits) {
      const text = fill(config.postVisit.message, {
        nombre: v.player.firstName,
        club: clubName,
      });
      if (await trySendJourney(v.player, "post_visit", v.id, text, "¿Qué tal tu visita?"))
        counts.postVisit++;
    }
  }

  // --- Welcome (players created in the last 48h) ---
  if (config.welcome.enabled) {
    const since = new Date(now);
    since.setHours(since.getHours() - 48);
    const newPlayers = await prisma.player.findMany({
      where: { ...activeOptedIn, createdAt: { gte: since } },
      select: PLAYER_CHANNEL_SELECT,
    });
    for (const p of newPlayers) {
      const text = fill(config.welcome.message, {
        nombre: p.firstName,
        club: clubName,
      });
      if (await trySendJourney(p, "welcome", "once", text, `Bienvenido a ${clubName}`))
        counts.welcome++;
    }
  }

  return counts;
}
