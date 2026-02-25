import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updatePlayerSchema } from "@/lib/validations/player";

// GET /api/players/[id] — Get single player with full details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const player = await prisma.player.findUnique({
      where: { id: params.id },
      include: {
        tags: true,
        visits: {
          orderBy: { date: "desc" },
          take: 20,
        },
        consumptions: {
          orderBy: { date: "desc" },
          take: 20,
        },
        conversations: {
          orderBy: { lastMessageAt: "desc" },
          take: 5,
          include: {
            _count: { select: { messages: true } },
          },
        },
        _count: {
          select: {
            visits: true,
            conversations: true,
            consumptions: true,
          },
        },
      },
    });

    if (!player) {
      return NextResponse.json(
        { error: "Jugador no encontrado" },
        { status: 404 }
      );
    }

    // Calculate total spending
    const totalSpending = await prisma.consumption.aggregate({
      where: { playerId: params.id },
      _sum: { amount: true },
    });

    return NextResponse.json({
      ...player,
      totalSpending: totalSpending._sum.amount || 0,
    });
  } catch (error) {
    console.error("Error fetching player:", error);
    return NextResponse.json(
      { error: "Error al obtener jugador" },
      { status: 500 }
    );
  }
}

// PUT /api/players/[id] — Update player
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validated = updatePlayerSchema.parse(body);

    // Build update data, only include non-empty fields
    const data: any = {};

    if (validated.firstName !== undefined) data.firstName = validated.firstName;
    if (validated.lastName !== undefined) data.lastName = validated.lastName;
    if (validated.phone !== undefined)
      data.phone = validated.phone.replace(/\s/g, "");
    if (validated.preferredLanguage !== undefined)
      data.preferredLanguage = validated.preferredLanguage;
    if (validated.email !== undefined) {
      data.email = validated.email === "" ? null : validated.email;
    }
    if (validated.handicap !== undefined) {
      data.handicap =
        validated.handicap === "" ? null : Number(validated.handicap);
    }
    if (validated.birthday !== undefined) {
      data.birthday =
        validated.birthday === "" ? null : new Date(validated.birthday);
    }
    if (validated.notes !== undefined) {
      data.notes = validated.notes === "" ? null : validated.notes;
    }

    const player = await prisma.player.update({
      where: { id: params.id },
      data,
      include: { tags: true },
    });

    return NextResponse.json(player);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Jugador no encontrado" },
        { status: 404 }
      );
    }
    if (error.code === "P2002") {
      const field = error.meta?.target?.[0];
      return NextResponse.json(
        {
          error:
            field === "phone"
              ? "Ya existe un jugador con ese teléfono"
              : "Ya existe un jugador con ese email",
        },
        { status: 409 }
      );
    }
    console.error("Error updating player:", error);
    return NextResponse.json(
      { error: "Error al actualizar jugador" },
      { status: 500 }
    );
  }
}

// DELETE /api/players/[id] — Soft delete (set isActive = false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.player.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Jugador no encontrado" },
        { status: 404 }
      );
    }
    console.error("Error deleting player:", error);
    return NextResponse.json(
      { error: "Error al eliminar jugador" },
      { status: 500 }
    );
  }
}
