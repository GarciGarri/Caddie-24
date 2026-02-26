import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { DEFAULT_AUTOMATIONS } from "@/lib/services/weather";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return new Response(JSON.stringify({ error: "No autenticado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const settings = await prisma.clubSettings.findUnique({
      where: { id: "default" },
    });
    const automations = (settings?.weatherAutomations as any[]) || DEFAULT_AUTOMATIONS;
    return NextResponse.json(automations);
  } catch (error) {
    console.error("Error fetching automations:", error);
    return NextResponse.json(
      { error: "Error al obtener automaciones" },
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

    const body = await request.json();
    const { automations } = body;

    if (!Array.isArray(automations)) {
      return NextResponse.json(
        { error: "Se requiere array de automaciones" },
        { status: 400 }
      );
    }

    const settings = await prisma.clubSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        clubName: "Mi Club de Golf",
        weatherAutomations: automations,
      },
      update: { weatherAutomations: automations },
    });

    return NextResponse.json(settings.weatherAutomations);
  } catch (error) {
    console.error("Error updating automations:", error);
    return NextResponse.json(
      { error: "Error al actualizar automaciones" },
      { status: 500 }
    );
  }
}
