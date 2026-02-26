import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updateCampaignSchema } from "@/lib/validations/campaign";

// GET /api/campaigns/[id] — Campaign detail with recipients
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

    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        createdBy: { select: { name: true, email: true } },
        recipients: {
          include: {
            player: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                engagementLevel: true,
              },
            },
          },
          orderBy: { sentAt: "desc" },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    }

    // Fetch associated template for message preview
    let template = null;
    if (campaign.templateName) {
      template = await prisma.whatsAppTemplate.findUnique({
        where: { name: campaign.templateName },
        select: { name: true, language: true, category: true, components: true },
      });
    }

    return NextResponse.json({ ...campaign, template });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json({ error: "Error al obtener campaña" }, { status: 500 });
  }
}

// PUT /api/campaigns/[id] — Update draft campaign
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

    // Only allow editing DRAFT campaigns
    const existing = await prisma.campaign.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    }

    if (existing.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Solo se pueden editar campañas en borrador" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = updateCampaignSchema.parse(body);

    const data: any = {};
    if (validated.name !== undefined) data.name = validated.name;
    if (validated.description !== undefined) {
      data.description = validated.description || null;
    }
    if (validated.templateName !== undefined) data.templateName = validated.templateName;
    if (validated.segmentQuery !== undefined) data.segmentQuery = validated.segmentQuery;

    const campaign = await prisma.campaign.update({
      where: { id: params.id },
      data,
      include: { createdBy: { select: { name: true } } },
    });

    return NextResponse.json(campaign);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating campaign:", error);
    return NextResponse.json({ error: "Error al actualizar campaña" }, { status: 500 });
  }
}

// DELETE /api/campaigns/[id]
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

    const existing = await prisma.campaign.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    }

    // Cancel instead of delete if already sent
    if (existing.status !== "DRAFT") {
      await prisma.campaign.update({
        where: { id: params.id },
        data: { status: "CANCELLED" },
      });
      return NextResponse.json({ success: true, cancelled: true });
    }

    // Hard delete drafts (cascade deletes recipients)
    await prisma.campaign.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    }
    console.error("Error deleting campaign:", error);
    return NextResponse.json({ error: "Error al eliminar campaña" }, { status: 500 });
  }
}
