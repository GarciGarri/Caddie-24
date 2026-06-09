import { prisma } from "@/lib/prisma";
import { sendProactive } from "@/lib/services/channels";

export interface SlotInfo {
  time: string;
  capacity: number;
  used: number;
  bookings: Array<{
    id: string;
    playersCount: number;
    holes: number;
    buggy: boolean;
    status: string;
    notes: string | null;
    player: { id: string; firstName: string; lastName: string; phone: string };
  }>;
}

interface BookingConfig {
  openTime: string;
  closeTime: string;
  intervalMinutes: number;
  slotCapacity: number;
}

export async function getBookingConfig(): Promise<BookingConfig> {
  const settings = await prisma.clubSettings.findUnique({
    where: { id: "default" },
    select: {
      fieldOpenTime: true,
      fieldCloseTime: true,
      bookingIntervalMinutes: true,
      bookingSlotCapacity: true,
    },
  });
  return {
    openTime: settings?.fieldOpenTime || "08:00",
    closeTime: settings?.fieldCloseTime || "20:00",
    intervalMinutes: settings?.bookingIntervalMinutes || 10,
    slotCapacity: settings?.bookingSlotCapacity || 4,
  };
}

/** Generate all tee time slots for a day from the club config. */
export function generateSlots(config: BookingConfig): string[] {
  const [openH, openM] = config.openTime.split(":").map(Number);
  const [closeH, closeM] = config.closeTime.split(":").map(Number);
  const start = openH * 60 + (openM || 0);
  const end = closeH * 60 + (closeM || 0);

  const slots: string[] = [];
  for (let t = start; t < end; t += config.intervalMinutes) {
    const h = Math.floor(t / 60)
      .toString()
      .padStart(2, "0");
    const m = (t % 60).toString().padStart(2, "0");
    slots.push(`${h}:${m}`);
  }
  return slots;
}

/** Full tee sheet for a date: every slot with its bookings and occupancy. */
export async function getTeeSheet(dateStr: string): Promise<{
  date: string;
  slots: SlotInfo[];
  config: BookingConfig;
}> {
  const config = await getBookingConfig();
  const slots = generateSlots(config);
  const date = new Date(dateStr);

  const bookings = await prisma.booking.findMany({
    where: { date, status: { in: ["CONFIRMED", "COMPLETED", "NO_SHOW"] } },
    include: {
      player: {
        select: { id: true, firstName: true, lastName: true, phone: true },
      },
    },
    orderBy: { teeTime: "asc" },
  });

  const bySlot = new Map<string, typeof bookings>();
  for (const b of bookings) {
    const list = bySlot.get(b.teeTime) || [];
    list.push(b);
    bySlot.set(b.teeTime, list);
  }

  return {
    date: dateStr,
    config,
    slots: slots.map((time) => {
      const slotBookings = bySlot.get(time) || [];
      return {
        time,
        capacity: config.slotCapacity,
        used: slotBookings.reduce((sum, b) => sum + b.playersCount, 0),
        bookings: slotBookings.map((b) => ({
          id: b.id,
          playersCount: b.playersCount,
          holes: b.holes,
          buggy: b.buggy,
          status: b.status,
          notes: b.notes,
          player: b.player,
        })),
      };
    }),
  };
}

/**
 * Compact availability summary for the AI assistant (today + tomorrow):
 * lists full slots and overall occupancy so the bot answers with real data.
 */
export async function buildAvailabilitySummary(): Promise<string> {
  try {
    const config = await getBookingConfig();
    const slots = generateSlots(config);
    const totalCapacity = slots.length * config.slotCapacity;

    const days: string[] = [];
    for (const offset of [0, 1]) {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      const dateStr = d.toISOString().split("T")[0];
      const date = new Date(dateStr);

      const bookings = await prisma.booking.findMany({
        where: { date, status: "CONFIRMED" },
        select: { teeTime: true, playersCount: true },
      });

      const usedBySlot = new Map<string, number>();
      let totalUsed = 0;
      for (const b of bookings) {
        usedBySlot.set(b.teeTime, (usedBySlot.get(b.teeTime) || 0) + b.playersCount);
        totalUsed += b.playersCount;
      }

      const fullSlots = slots.filter(
        (s) => (usedBySlot.get(s) || 0) >= config.slotCapacity
      );

      const label = offset === 0 ? "Hoy" : "Mañana";
      days.push(
        `${label} (${dateStr}): ${totalUsed}/${totalCapacity} plazas ocupadas` +
          (fullSlots.length > 0
            ? `. Horas COMPLETAS (no ofrecer): ${fullSlots.join(", ")}`
            : ". Hay disponibilidad en casi todas las horas")
      );
    }

    return `Salidas cada ${config.intervalMinutes} min de ${config.openTime} a ${config.closeTime}, máx ${config.slotCapacity} jugadores por salida.\n${days.join("\n")}`;
  } catch {
    return "";
  }
}

/** Today's course status line for the AI assistant. */
export async function buildCourseStatusSummary(): Promise<string> {
  try {
    const today = new Date(new Date().toISOString().split("T")[0]);
    const status = await prisma.courseDailyStatus.findUnique({
      where: { date: today },
    });
    if (!status) return "";

    const parts: string[] = [];
    parts.push(`Buggies: ${status.buggiesAllowed ? "permitidos" : "NO permitidos hoy"}`);
    parts.push(`Carros: ${status.trolleysAllowed ? "permitidos" : "NO permitidos hoy"}`);
    if (status.greensStatus) parts.push(`Greens: ${status.greensStatus}`);
    if (status.holesClosed) parts.push(`Hoyos cerrados: ${status.holesClosed}`);
    if (status.notes) parts.push(`Notas: ${status.notes}`);
    return parts.join(". ");
  } catch {
    return "";
  }
}

/**
 * Send a reminder to every player with a CONFIRMED booking tomorrow
 * that hasn't been reminded yet. Returns the number of reminders sent.
 */
export async function sendBookingReminders(): Promise<number> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split("T")[0];

  const bookings = await prisma.booking.findMany({
    where: {
      date: new Date(dateStr),
      status: "CONFIRMED",
      reminderSentAt: null,
    },
    include: {
      player: {
        select: {
          id: true,
          firstName: true,
          phone: true,
          email: true,
          telegramChatId: true,
          facebookPsid: true,
          instagramId: true,
        },
      },
    },
  });

  let sent = 0;
  for (const b of bookings) {
    const dayLabel = tomorrow.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const text =
      `📅 Hola ${b.player.firstName}, te recordamos tu salida de mañana ${dayLabel} ` +
      `a las ${b.teeTime} (${b.playersCount} jugador${b.playersCount > 1 ? "es" : ""}, ` +
      `${b.holes} hoyos${b.buggy ? ", con buggy" : ""}). ` +
      `Si necesitas modificar o cancelar, responde a este mensaje. ¡Nos vemos en el campo!`;

    try {
      await sendProactive(b.player, text, "Recordatorio de tu reserva");
      await prisma.booking.update({
        where: { id: b.id },
        data: { reminderSentAt: new Date() },
      });
      sent++;
    } catch (err) {
      console.error(`[Bookings] Reminder failed for booking ${b.id}:`, err);
    }
  }

  return sent;
}
