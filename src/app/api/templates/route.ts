import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createTemplateSchema } from "@/lib/validations/template";

// GET /api/templates — List all templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const language = searchParams.get("language");

    const where: any = {};
    if (status) where.status = status;
    if (language) where.language = language;

    const templates = await prisma.whatsAppTemplate.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Error al obtener templates" },
      { status: 500 }
    );
  }
}

// POST /api/templates — Create new template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createTemplateSchema.parse(body);

    const template = await prisma.whatsAppTemplate.create({
      data: {
        name: validated.name,
        language: validated.language,
        category: validated.category,
        status: "APPROVED", // Simulated — auto-approve without Meta
        components: {
          body: { text: validated.bodyText },
        },
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      const fieldErrors = error.errors.map((e: any) => `${e.path.join(".")}: ${e.message}`).join(". ");
      return NextResponse.json(
        { error: `Datos inválidos: ${fieldErrors}`, details: error.errors },
        { status: 400 }
      );
    }
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe un template con ese nombre" },
        { status: 409 }
      );
    }
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Error al crear template" },
      { status: 500 }
    );
  }
}
