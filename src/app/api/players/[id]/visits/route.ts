import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createVisitSchema = z.object({
  date: z.string().min(1, "La fecha es obligatoria"),
  courseType: z.string().max(50).optional().or(z.literal("")),
  duration: z.coerce.number().int().min(0).max(1440).optional(),
  notes: z.string().max(500).optional().or(z.literal("")),
});

// POST /api/players/[id]/visits — Register a visit
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
    const validated = createVisitSchema.parse(body);

    const player = await prisma.player.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!player) {
      return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 });
    }

    const visit = await prisma.visit.create({
      data: {
        playerId: params.id,
        date: new Date(validated.date),
        courseType: validated.courseType || null,
        duration: validated.duration ?? null,
        notes: validated.notes || null,
        companions: [],
      },
    });

    // A logged visit counts as recent contact with the club
    await prisma.player.update({
      where: { id: params.id },
      data: { lastContactAt: new Date(validated.date) },
    });

    return NextResponse.json(visit, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors?.[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }
    console.error("Error creating visit:", error);
    return NextResponse.json(
      { error: "Error al registrar la visita" },
      { status: 500 }
    );
  }
}

// DELETE /api/players/[id]/visits?visitId=xxx — Remove a visit
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const visitId = request.nextUrl.searchParams.get("visitId");
    if (!visitId) {
      return NextResponse.json({ error: "visitId requerido" }, { status: 400 });
    }

    const visit = await prisma.visit.findUnique({ where: { id: visitId } });
    if (!visit || visit.playerId !== params.id) {
      return NextResponse.json({ error: "Visita no encontrada" }, { status: 404 });
    }

    await prisma.visit.delete({ where: { id: visitId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting visit:", error);
    return NextResponse.json(
      { error: "Error al eliminar la visita" },
      { status: 500 }
    );
  }
}
