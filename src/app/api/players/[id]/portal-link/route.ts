import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createPortalToken } from "@/lib/services/portal-token";
import { sendProactive } from "@/lib/services/channels";

// POST /api/players/[id]/portal-link — generate the magic link and
// send it to the player through their best channel. Returns the URL
// so staff can also copy it manually.
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const player = await prisma.player.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        firstName: true,
        phone: true,
        email: true,
        telegramChatId: true,
        facebookPsid: true,
        instagramId: true,
      },
    });
    if (!player) {
      return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 });
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    const token = createPortalToken(player.id);
    const url = `${appUrl.replace(/\/$/, "")}/p/${encodeURIComponent(token)}`;

    const settings = await prisma.clubSettings.findUnique({
      where: { id: "default" },
      select: { clubName: true },
    });
    const clubName = settings?.clubName || "tu club de golf";

    let sent = false;
    let channel: string | null = null;
    try {
      channel = await sendProactive(
        player,
        `⛳ ${player.firstName}, este es tu acceso personal al portal de ${clubName}: ${url}\nDesde ahí puedes ver tus reservas, torneos y bonos.`,
        `Tu portal de jugador — ${clubName}`
      );
      sent = true;
    } catch {
      // No channel available — staff can copy the link manually
    }

    return NextResponse.json({ url, sent, channel });
  } catch (error) {
    console.error("Error generating portal link:", error);
    return NextResponse.json(
      { error: "Error al generar el enlace" },
      { status: 500 }
    );
  }
}
