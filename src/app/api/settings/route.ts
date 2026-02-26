import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
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

    const body = await request.json();

    // Remove fields that shouldn't be updated directly
    delete body.id;
    delete body.updatedAt;

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
