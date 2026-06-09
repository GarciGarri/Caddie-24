import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const CONSUMPTION_CATEGORIES = [
  "GREEN_FEE",
  "SUBSCRIPTION",
  "CLASS",
  "RESTAURANT",
  "SHOP",
  "RENTAL",
  "EVENT",
  "OTHER",
] as const;

const createConsumptionSchema = z.object({
  date: z.string().min(1, "La fecha es obligatoria"),
  category: z.enum(CONSUMPTION_CATEGORIES),
  description: z.string().min(1, "La descripción es obligatoria").max(200),
  amount: z.coerce.number().min(0, "El importe no puede ser negativo").max(1000000),
});

// POST /api/players/[id]/consumptions — Register a consumption
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
    const validated = createConsumptionSchema.parse(body);

    const player = await prisma.player.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!player) {
      return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 });
    }

    const consumption = await prisma.consumption.create({
      data: {
        playerId: params.id,
        date: new Date(validated.date),
        category: validated.category,
        description: validated.description,
        amount: validated.amount,
      },
    });

    return NextResponse.json(consumption, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors?.[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }
    console.error("Error creating consumption:", error);
    return NextResponse.json(
      { error: "Error al registrar el consumo" },
      { status: 500 }
    );
  }
}

// DELETE /api/players/[id]/consumptions?consumptionId=xxx — Remove a consumption
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const consumptionId = request.nextUrl.searchParams.get("consumptionId");
    if (!consumptionId) {
      return NextResponse.json({ error: "consumptionId requerido" }, { status: 400 });
    }

    const consumption = await prisma.consumption.findUnique({
      where: { id: consumptionId },
    });
    if (!consumption || consumption.playerId !== params.id) {
      return NextResponse.json({ error: "Consumo no encontrado" }, { status: 404 });
    }

    await prisma.consumption.delete({ where: { id: consumptionId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting consumption:", error);
    return NextResponse.json(
      { error: "Error al eliminar el consumo" },
      { status: 500 }
    );
  }
}
