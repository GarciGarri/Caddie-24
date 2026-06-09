import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendProactive } from "@/lib/services/channels";

// POST /api/tournaments/[id]/results/notify — send each player their result
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
    });
    if (!tournament) {
      return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });
    }

    const results = await prisma.tournamentResult.findMany({
      where: { tournamentId: params.id, positionOverall: { not: null } },
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
      orderBy: { positionOverall: "asc" },
    });

    if (results.length === 0) {
      return NextResponse.json(
        { error: "No hay resultados con posición que notificar" },
        { status: 400 }
      );
    }

    let sent = 0;
    let failed = 0;
    for (const r of results) {
      const pos = r.positionOverall!;
      const medal = pos === 1 ? "🥇" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : "⛳";
      const catPart =
        r.positionCategory && r.categoryName
          ? ` (${r.positionCategory}º en ${r.categoryName})`
          : "";
      const scorePart =
        r.netScore != null
          ? ` con ${r.netScore} puntos netos`
          : r.grossScore != null
            ? ` con ${r.grossScore} golpes`
            : "";
      const prizePart = r.prizeWon
        ? ` ¡Has ganado un premio! Pásate por recepción para recogerlo.`
        : "";

      const text =
        `${medal} ${r.player.firstName}, resultados del ${tournament.name}: ` +
        `has quedado en la posición ${pos}${catPart}${scorePart}.${prizePart} ` +
        `¡Gracias por participar!`;

      try {
        await sendProactive(r.player, text, `Resultados — ${tournament.name}`);
        sent++;
      } catch (err) {
        failed++;
        console.error(`[Results] Notify failed for ${r.player.id}:`, err);
      }
      await new Promise((res) => setTimeout(res, 50));
    }

    return NextResponse.json({ success: true, sent, failed });
  } catch (error) {
    console.error("Error notifying results:", error);
    return NextResponse.json(
      { error: "Error al notificar resultados" },
      { status: 500 }
    );
  }
}
