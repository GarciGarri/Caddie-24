import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updateTemplateSchema } from "@/lib/validations/template";

// GET /api/templates/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return new Response(JSON.stringify({ error: "No autenticado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const template = await prisma.whatsAppTemplate.findUnique({
      where: { id: params.id },
    });

    if (!template) {
      return NextResponse.json({ error: "Template no encontrado" }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json({ error: "Error al obtener template" }, { status: 500 });
  }
}

// PUT /api/templates/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return new Response(JSON.stringify({ error: "No autenticado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const validated = updateTemplateSchema.parse(body);

    const data: any = {};
    if (validated.name !== undefined) data.name = validated.name;
    if (validated.language !== undefined) data.language = validated.language;
    if (validated.category !== undefined) data.category = validated.category;
    if (validated.bodyText !== undefined) {
      data.components = { body: { text: validated.bodyText } };
    }

    const template = await prisma.whatsAppTemplate.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(template);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Template no encontrado" }, { status: 404 });
    }
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe un template con ese nombre" },
        { status: 409 }
      );
    }
    console.error("Error updating template:", error);
    return NextResponse.json({ error: "Error al actualizar template" }, { status: 500 });
  }
}

// DELETE /api/templates/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return new Response(JSON.stringify({ error: "No autenticado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    await prisma.whatsAppTemplate.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Template no encontrado" }, { status: 404 });
    }
    console.error("Error deleting template:", error);
    return NextResponse.json({ error: "Error al eliminar template" }, { status: 500 });
  }
}
