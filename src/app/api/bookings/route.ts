import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { getTeeSheet, getBookingConfig } from "@/lib/services/bookings";

const createBookingSchema = z.object({
  playerId: z.string().min(1, "Selecciona un jugador"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  teeTime: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
  playersCount: z.coerce.number().int().min(1).max(4).default(1),
  holes: z.coerce.number().int().refine((v) => v === 9 || v === 18, "9 o 18 hoyos").default(18),
  buggy: z.boolean().default(false),
  notes: z.string().max(300).optional().or(z.literal("")),
});

// GET /api/bookings?date=YYYY-MM-DD — full tee sheet for a day
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const dateStr =
      request.nextUrl.searchParams.get("date") ||
      new Date().toISOString().split("T")[0];

    const teeSheet = await getTeeSheet(dateStr);
    return NextResponse.json(teeSheet);
  } catch (error) {
    console.error("Error fetching tee sheet:", error);
    return NextResponse.json(
      { error: "Error al obtener las reservas" },
      { status: 500 }
    );
  }
}

// POST /api/bookings — create a booking with capacity check
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createBookingSchema.parse(body);

    const player = await prisma.player.findUnique({
      where: { id: validated.playerId },
      select: { id: true },
    });
    if (!player) {
      return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 });
    }

    // Capacity check on the slot
    const config = await getBookingConfig();
    const existing = await prisma.booking.aggregate({
      where: {
        date: new Date(validated.date),
        teeTime: validated.teeTime,
        status: "CONFIRMED",
      },
      _sum: { playersCount: true },
    });
    const used = existing._sum.playersCount || 0;
    if (used + validated.playersCount > config.slotCapacity) {
      return NextResponse.json(
        {
          error: `La salida de las ${validated.teeTime} solo tiene ${config.slotCapacity - used} plazas libres`,
        },
        { status: 409 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        playerId: validated.playerId,
        date: new Date(validated.date),
        teeTime: validated.teeTime,
        playersCount: validated.playersCount,
        holes: validated.holes,
        buggy: validated.buggy,
        notes: validated.notes || null,
        source: "manual",
      },
      include: {
        player: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors?.[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Error al crear la reserva" },
      { status: 500 }
    );
  }
}
