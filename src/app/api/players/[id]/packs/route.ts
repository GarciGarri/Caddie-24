import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createPackSchema = z.object({
  name: z.string().min(1, "El nombre del bono es obligatorio").max(100),
  totalUses: z.coerce.number().int().min(1).max(100),
  price: z.coerce.number().min(0).optional().nullable(),
  expiresAt: z.string().optional().or(z.literal("")),
  notes: z.string().max(300).optional().or(z.literal("")),
});

// POST /api/players/[id]/packs — sell a new pack to the player
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
    const validated = createPackSchema.parse(body);

    const player = await prisma.player.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!player) {
      return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 });
    }

    const pack = await prisma.playerPack.create({
      data: {
        playerId: params.id,
        name: validated.name,
        totalUses: validated.totalUses,
        remainingUses: validated.totalUses,
        price: validated.price ?? null,
        expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
        notes: validated.notes || null,
      },
    });

    // Record the sale as a consumption
    if (validated.price && validated.price > 0) {
      await prisma.consumption.create({
        data: {
          playerId: params.id,
          date: new Date(),
          category: "OTHER",
          description: `Bono: ${validated.name} (${validated.totalUses} usos)`,
          amount: validated.price,
        },
      });
    }

    return NextResponse.json(pack, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors?.[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }
    console.error("Error creating pack:", error);
    return NextResponse.json(
      { error: "Error al crear el bono" },
      { status: 500 }
    );
  }
}

// PATCH /api/players/[id]/packs?packId=xxx — body { action: "use" } consumes one use
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const packId = request.nextUrl.searchParams.get("packId");
    if (!packId) {
      return NextResponse.json({ error: "packId requerido" }, { status: 400 });
    }

    const pack = await prisma.playerPack.findUnique({ where: { id: packId } });
    if (!pack || pack.playerId !== params.id) {
      return NextResponse.json({ error: "Bono no encontrado" }, { status: 404 });
    }
    if (pack.remainingUses <= 0) {
      return NextResponse.json({ error: "El bono no tiene usos restantes" }, { status: 400 });
    }
    if (pack.expiresAt && pack.expiresAt < new Date()) {
      return NextResponse.json({ error: "El bono está caducado" }, { status: 400 });
    }

    const updated = await prisma.playerPack.update({
      where: { id: packId },
      data: { remainingUses: { decrement: 1 } },
    });

    // Log the use in the consumption history (no charge)
    await prisma.consumption.create({
      data: {
        playerId: params.id,
        date: new Date(),
        category: "OTHER",
        description: `Uso de bono: ${pack.name} (quedan ${updated.remainingUses})`,
        amount: 0,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error using pack:", error);
    return NextResponse.json(
      { error: "Error al usar el bono" },
      { status: 500 }
    );
  }
}

// DELETE /api/players/[id]/packs?packId=xxx
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const packId = request.nextUrl.searchParams.get("packId");
    if (!packId) {
      return NextResponse.json({ error: "packId requerido" }, { status: 400 });
    }

    const pack = await prisma.playerPack.findUnique({ where: { id: packId } });
    if (!pack || pack.playerId !== params.id) {
      return NextResponse.json({ error: "Bono no encontrado" }, { status: 404 });
    }

    await prisma.playerPack.delete({ where: { id: packId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting pack:", error);
    return NextResponse.json(
      { error: "Error al eliminar el bono" },
      { status: 500 }
    );
  }
}
