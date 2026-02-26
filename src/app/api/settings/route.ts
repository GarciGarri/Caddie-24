import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return new Response(JSON.stringify({ error: "No autenticado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    let settings = await prisma.clubSettings.findUnique({
      where: { id: "default" },
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await prisma.clubSettings.create({
        data: {
          id: "default",
          clubName: "Mi Club de Golf",
          timezone: "Europe/Madrid",
          defaultLanguage: "ES",
          currency: "EUR",
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Error al obtener configuración" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if ((session!.user as any).role !== "ADMIN") {
      return new Response(JSON.stringify({ error: "Solo administradores pueden modificar ajustes" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();

    // Remove fields that shouldn't be updated directly
    delete body.id;
    delete body.updatedAt;

    // Validate clubName if provided
    if (body.clubName !== undefined && (typeof body.clubName !== "string" || body.clubName.trim().length === 0)) {
      return new Response(JSON.stringify({ error: "El nombre del club es obligatorio" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate numeric fields are non-negative numbers if present
    const numericFields = ["fieldCapacity", "weekdayRate", "weekendRate", "holidayRate"] as const;
    for (const field of numericFields) {
      if (body[field] !== undefined) {
        const value = Number(body[field]);
        if (isNaN(value) || value < 0) {
          return new Response(
            JSON.stringify({ error: `El campo ${field} debe ser un número no negativo` }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      }
    }

    const settings = await prisma.clubSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        clubName: body.clubName || "Mi Club de Golf",
        ...body,
      },
      update: body,
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Error al actualizar configuración" },
      { status: 500 }
    );
  }
}
