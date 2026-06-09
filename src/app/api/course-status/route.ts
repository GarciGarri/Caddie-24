import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const statusSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  buggiesAllowed: z.boolean(),
  trolleysAllowed: z.boolean(),
  greensStatus: z.string().max(50).optional().or(z.literal("")),
  holesClosed: z.string().max(100).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

// GET /api/course-status?date=YYYY-MM-DD — today's (or given day's) course status
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const dateStr =
      request.nextUrl.searchParams.get("date") ||
      new Date().toISOString().split("T")[0];

    const status = await prisma.courseDailyStatus.findUnique({
      where: { date: new Date(dateStr) },
    });

    return NextResponse.json(
      status || {
        date: dateStr,
        buggiesAllowed: true,
        trolleysAllowed: true,
        greensStatus: "",
        holesClosed: "",
        notes: "",
        isDefault: true,
      }
    );
  } catch (error) {
    console.error("Error fetching course status:", error);
    return NextResponse.json(
      { error: "Error al obtener el estado del campo" },
      { status: 500 }
    );
  }
}

// PUT /api/course-status — upsert the day's status
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const validated = statusSchema.parse(body);
    const dateStr = validated.date || new Date().toISOString().split("T")[0];
    const date = new Date(dateStr);

    const data = {
      buggiesAllowed: validated.buggiesAllowed,
      trolleysAllowed: validated.trolleysAllowed,
      greensStatus: validated.greensStatus || null,
      holesClosed: validated.holesClosed || null,
      notes: validated.notes || null,
    };

    const status = await prisma.courseDailyStatus.upsert({
      where: { date },
      update: data,
      create: { date, ...data },
    });

    return NextResponse.json(status);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors?.[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }
    console.error("Error saving course status:", error);
    return NextResponse.json(
      { error: "Error al guardar el estado del campo" },
      { status: 500 }
    );
  }
}
