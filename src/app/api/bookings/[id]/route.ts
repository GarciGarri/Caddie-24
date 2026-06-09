import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateBookingSchema = z.object({
  status: z.enum(["CONFIRMED", "CANCELLED", "NO_SHOW", "COMPLETED"]).optional(),
  teeTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  playersCount: z.coerce.number().int().min(1).max(4).optional(),
  buggy: z.boolean().optional(),
  notes: z.string().max(300).optional().or(z.literal("")),
});

// PATCH /api/bookings/[id] — update status or details
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateBookingSchema.parse(body);

    const existing = await prisma.booking.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }

    const data: any = {};
    if (validated.status !== undefined) data.status = validated.status;
    if (validated.teeTime !== undefined) data.teeTime = validated.teeTime;
    if (validated.playersCount !== undefined) data.playersCount = validated.playersCount;
    if (validated.buggy !== undefined) data.buggy = validated.buggy;
    if (validated.notes !== undefined) data.notes = validated.notes || null;

    const booking = await prisma.booking.update({
      where: { id: params.id },
      data,
      include: {
        player: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json(booking);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors?.[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Error al actualizar la reserva" },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings/[id] — cancel
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    await prisma.booking.update({
      where: { id: params.id },
      data: { status: "CANCELLED" },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { error: "Error al cancelar la reserva" },
      { status: 500 }
    );
  }
}
