import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { optOutPlayer, optInPlayer } from "@/lib/services/consent";

// POST /api/players/[id]/optout — body { optOut: boolean }
// Toggle a player's marketing communications consent
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
    const optOut = body?.optOut === true;

    const player = await prisma.player.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!player) {
      return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 });
    }

    if (optOut) {
      await optOutPlayer(params.id);
    } else {
      await optInPlayer(params.id);
    }

    return NextResponse.json({ success: true, optedOut: optOut });
  } catch (error) {
    console.error("Error toggling opt-out:", error);
    return NextResponse.json(
      { error: "Error al actualizar el consentimiento" },
      { status: 500 }
    );
  }
}
