import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPortalToken } from "@/lib/services/portal-token";
import { optOutPlayer, optInPlayer } from "@/lib/services/consent";

/**
 * POST /api/portal/action — public, token-authenticated player actions.
 * body: { token, action: "cancel-booking", bookingId }
 *     | { token, action: "consent", optOut: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const playerId = verifyPortalToken(body?.token || "");
    if (!playerId) {
      return NextResponse.json({ error: "Enlace no válido o caducado" }, { status: 401 });
    }

    if (body.action === "cancel-booking") {
      const booking = await prisma.booking.findUnique({
        where: { id: body.bookingId || "" },
      });
      if (!booking || booking.playerId !== playerId) {
        return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
      }
      if (booking.status !== "CONFIRMED") {
        return NextResponse.json({ error: "La reserva ya no está activa" }, { status: 400 });
      }
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "CANCELLED" },
      });
      return NextResponse.json({ success: true });
    }

    if (body.action === "consent") {
      if (body.optOut === true) {
        await optOutPlayer(playerId);
      } else {
        await optInPlayer(playerId);
      }
      return NextResponse.json({ success: true, optedOut: body.optOut === true });
    }

    return NextResponse.json({ error: "Acción desconocida" }, { status: 400 });
  } catch (error) {
    console.error("Error in portal action:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
