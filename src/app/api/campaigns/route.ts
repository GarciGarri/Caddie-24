import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createCampaignSchema } from "@/lib/validations/campaign";

// GET /api/campaigns — List campaigns with filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return new Response(JSON.stringify({ error: "No autenticado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};
    if (status) where.status = status;

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: {
          createdBy: { select: { name: true } },
          _count: { select: { recipients: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.campaign.count({ where }),
    ]);

    return NextResponse.json({
      campaigns,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Error al obtener campañas" },
      { status: 500 }
    );
  }
}

// POST /api/campaigns — Create new campaign (draft)
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth();
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createCampaignSchema.parse(body);

    const campaign = await prisma.campaign.create({
      data: {
        name: validated.name,
        description: validated.description || null,
        templateName: validated.templateName,
        segmentQuery: validated.segmentQuery,
        createdById: userId,
        status: "DRAFT",
      },
      include: {
        createdBy: { select: { name: true } },
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { error: "Error al crear campaña" },
      { status: 500 }
    );
  }
}
