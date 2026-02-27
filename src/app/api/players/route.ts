import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createPlayerSchema } from "@/lib/validations/player";
import { isDemoMode, getDemoPlayersData } from "@/lib/services/demo-data";

// GET /api/players — List players with search, filter, pagination
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

    // Demo mode intercept
    if (await isDemoMode()) {
      return NextResponse.json(
        getDemoPlayersData({
          page: parseInt(searchParams.get("page") || "1"),
          limit: parseInt(searchParams.get("limit") || "50"),
          search: searchParams.get("search") || "",
          engagement: searchParams.get("engagement") || undefined,
        })
      );
    }
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const ALLOWED_SORT_FIELDS = ["lastName", "firstName", "createdAt", "engagementLevel", "handicap", "phone"];
    const sortBy = ALLOWED_SORT_FIELDS.includes(searchParams.get("sortBy") || "")
      ? searchParams.get("sortBy")!
      : "lastName";
    const ALLOWED_SORT_ORDERS = ["asc", "desc"];
    const sortOrder = ALLOWED_SORT_ORDERS.includes(searchParams.get("sortOrder") || "")
      ? searchParams.get("sortOrder")!
      : "asc";
    const engagement = searchParams.get("engagement");
    const language = searchParams.get("language");

    const where: any = { isActive: true };

    // Search by name, phone, or email
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filter by engagement level
    if (engagement) {
      where.engagementLevel = engagement;
    }

    // Filter by language
    if (language) {
      where.preferredLanguage = language;
    }

    const [players, total, vipCount, highCount, newCount] = await Promise.all([
      prisma.player.findMany({
        where,
        include: {
          tags: true,
          _count: {
            select: {
              visits: true,
              conversations: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.player.count({ where }),
      prisma.player.count({ where: { isActive: true, engagementLevel: "VIP" } }),
      prisma.player.count({ where: { isActive: true, engagementLevel: "HIGH" } }),
      prisma.player.count({
        where: {
          isActive: true,
          engagementLevel: { in: ["NEW"] },
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    return NextResponse.json({
      players,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: { vipCount, highCount, newCount },
    });
  } catch (error) {
    console.error("Error fetching players:", error);
    return NextResponse.json(
      { error: "Error al obtener jugadores" },
      { status: 500 }
    );
  }
}

// POST /api/players — Create new player
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return new Response(JSON.stringify({ error: "No autenticado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const validated = createPlayerSchema.parse(body);

    // Clean up optional fields
    const data: any = {
      firstName: validated.firstName,
      lastName: validated.lastName,
      phone: validated.phone.replace(/\s/g, ""),
      preferredLanguage: validated.preferredLanguage,
      source: "manual",
    };

    if (validated.email && validated.email !== "") data.email = validated.email;
    if (validated.handicap !== undefined && validated.handicap !== "")
      data.handicap = Number(validated.handicap);
    if (validated.birthday && validated.birthday !== "")
      data.birthday = new Date(validated.birthday);
    if (validated.notes && validated.notes !== "") data.notes = validated.notes;

    const player = await prisma.player.create({
      data,
      include: { tags: true },
    });

    return NextResponse.json(player, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    if (error.code === "P2002") {
      const field = error.meta?.target?.[0];
      return NextResponse.json(
        {
          error:
            field === "phone"
              ? "Ya existe un jugador con ese teléfono"
              : "Ya existe un jugador con ese email",
        },
        { status: 409 }
      );
    }
    console.error("Error creating player:", error);
    return NextResponse.json(
      { error: "Error al crear jugador" },
      { status: 500 }
    );
  }
}
