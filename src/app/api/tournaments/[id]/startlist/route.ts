import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { sendProactive } from "@/lib/services/channels";

const generateSchema = z.object({
  action: z.literal("generate"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  intervalMinutes: z.coerce.number().int().min(5).max(30).default(10),
  groupSize: z.coerce.number().int().min(2).max(4).default(4),
  orderBy: z.enum(["handicap", "random"]).default("handicap"),
});

const notifySchema = z.object({
  action: z.literal("notify"),
});

const editSchema = z.object({
  action: z.literal("edit"),
  registrationId: z.string(),
  teeTime: z.string().regex(/^\d{2}:\d{2}$/),
});

// POST /api/tournaments/[id]/startlist
// { action: "generate", ... } | { action: "notify" } | { action: "edit", ... }
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();

    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
    });
    if (!tournament) {
      return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });
    }

    if (body.action === "generate") {
      const opts = generateSchema.parse(body);

      const registrations = await prisma.tournamentRegistration.findMany({
        where: {
          tournamentId: params.id,
          status: { in: ["REGISTERED", "CONFIRMED"] },
        },
        include: {
          player: { select: { handicap: true, firstName: true, lastName: true } },
        },
      });

      if (registrations.length === 0) {
        return NextResponse.json(
          { error: "No hay inscritos para generar salidas" },
          { status: 400 }
        );
      }

      // Order: best handicap last (classic tournament order) or random
      let ordered = [...registrations];
      if (opts.orderBy === "handicap") {
        ordered.sort(
          (a, b) =>
            (b.player.handicap ?? 54) - (a.player.handicap ?? 54)
        );
      } else {
        ordered.sort(() => Math.random() - 0.5);
      }

      const startTime = opts.startTime || tournament.teeTime || "09:00";
      const [h, m] = startTime.split(":").map(Number);
      let minutes = h * 60 + m;

      let group = 1;
      for (let i = 0; i < ordered.length; i += opts.groupSize) {
        const slot = `${Math.floor(minutes / 60)
          .toString()
          .padStart(2, "0")}:${(minutes % 60).toString().padStart(2, "0")}`;
        const groupRegs = ordered.slice(i, i + opts.groupSize);
        await prisma.tournamentRegistration.updateMany({
          where: { id: { in: groupRegs.map((r) => r.id) } },
          data: { teeTime: slot, groupNumber: group, startHole: 1 },
        });
        minutes += opts.intervalMinutes;
        group++;
      }

      return NextResponse.json({
        success: true,
        groups: group - 1,
        players: ordered.length,
      });
    }

    if (body.action === "edit") {
      const opts = editSchema.parse(body);
      await prisma.tournamentRegistration.update({
        where: { id: opts.registrationId },
        data: { teeTime: opts.teeTime },
      });
      return NextResponse.json({ success: true });
    }

    if (body.action === "notify") {
      notifySchema.parse(body);

      const registrations = await prisma.tournamentRegistration.findMany({
        where: {
          tournamentId: params.id,
          status: { in: ["REGISTERED", "CONFIRMED"] },
          teeTime: { not: null },
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
        orderBy: { teeTime: "asc" },
      });

      if (registrations.length === 0) {
        return NextResponse.json(
          { error: "No hay salidas generadas que notificar" },
          { status: 400 }
        );
      }

      const dateLabel = tournament.date.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });

      let sent = 0;
      let failed = 0;
      for (const r of registrations) {
        const text =
          `🏆 ${r.player.firstName}, ya tienes tu horario para el ${tournament.name} ` +
          `(${dateLabel}): salida a las ${r.teeTime}` +
          `${r.startHole && r.startHole !== 1 ? ` por el hoyo ${r.startHole}` : ""}` +
          `${r.groupNumber ? `, partida ${r.groupNumber}` : ""}. ` +
          `Preséntate en el tee 10 minutos antes. ¡Suerte!`;
        try {
          await sendProactive(r.player, text, `Horario de salida — ${tournament.name}`);
          sent++;
        } catch (err) {
          failed++;
          console.error(`[StartList] Notify failed for ${r.player.id}:`, err);
        }
        await new Promise((res) => setTimeout(res, 50));
      }

      return NextResponse.json({ success: true, sent, failed });
    }

    return NextResponse.json({ error: "Acción desconocida" }, { status: 400 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors?.[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }
    console.error("Error in startlist:", error);
    return NextResponse.json(
      { error: "Error al gestionar las salidas" },
      { status: 500 }
    );
  }
}
