import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const membershipSchema = z.object({
  type: z.enum([
    "INDIVIDUAL",
    "FAMILIAR",
    "JOVEN",
    "SENIOR",
    "SEMANA",
    "CORPORATIVO",
    "HONORIFICO",
    "OTRO",
  ]),
  fee: z.coerce.number().min(0).optional().nullable(),
  billingPeriod: z.enum(["MONTHLY", "QUARTERLY", "ANNUAL"]).default("ANNUAL"),
  startDate: z.string().optional().or(z.literal("")),
  renewalDate: z.string().optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "SUSPENDED", "CANCELLED"]).default("ACTIVE"),
  autoRenew: z.boolean().default(true),
  notes: z.string().max(500).optional().or(z.literal("")),
});

// PUT /api/players/[id]/membership — create or update the player's membership
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const validated = membershipSchema.parse(body);

    const player = await prisma.player.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!player) {
      return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 });
    }

    const data = {
      type: validated.type,
      fee: validated.fee ?? null,
      billingPeriod: validated.billingPeriod,
      startDate: validated.startDate ? new Date(validated.startDate) : null,
      renewalDate: validated.renewalDate ? new Date(validated.renewalDate) : null,
      status: validated.status,
      autoRenew: validated.autoRenew,
      notes: validated.notes || null,
    };

    const membership = await prisma.membership.upsert({
      where: { playerId: params.id },
      update: data,
      create: { playerId: params.id, ...data },
    });

    return NextResponse.json(membership);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors?.[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }
    console.error("Error saving membership:", error);
    return NextResponse.json(
      { error: "Error al guardar la membresía" },
      { status: 500 }
    );
  }
}

// DELETE /api/players/[id]/membership — remove membership (back to visitor)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    await prisma.membership.deleteMany({ where: { playerId: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting membership:", error);
    return NextResponse.json(
      { error: "Error al eliminar la membresía" },
      { status: 500 }
    );
  }
}
