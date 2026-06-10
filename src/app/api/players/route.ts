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
          language: searchParams.get("language") || undefined,
          members: searchParams.get("members") || undefined,
          membershipType: searchParams.get("membershipType") || undefined,
          renewing: searchParams.get("renewing") || undefined,
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
    const membersParam = searchParams.get("members"); // "1" socios, "0" visitantes
    const membershipType = searchParams.get("membershipType"); // INDIVIDUAL, FAMILIAR...
    const renewingParam = searchParams.get("renewing"); // "1" socios que renuevan <30 días

    const where: any = { isActive: true };

    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (membersParam === "1" || membershipType || renewingParam === "1") {
      where.membership = { is: { status: "ACTIVE" } };
      if (membershipType) where.membership.is.type = membershipType;
      if (renewingParam === "1") {
        where.membership.is.renewalDate = { gte: now, lte: in30Days };
      }
    } else if (membersParam === "0") {
      where.membership = null;
    }

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

    const baseActive = { isActive: true };
    const activeMember = { is: { status: "ACTIVE" as const } };

    const [
      players,
      total,
      vipCount,
      highCount,
      newCount,
      memberCount,
      visitorCount,
      upcomingRenewals,
    ] = await Promise.all([
      prisma.player.findMany({
        where,
        include: {
          tags: true,
          membership: { select: { type: true, status: true, renewalDate: true } },
          visits: { select: { date: true }, orderBy: { date: "desc" }, take: 1 },
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
      prisma.player.count({ where: { ...baseActive, engagementLevel: "VIP" } }),
      prisma.player.count({ where: { ...baseActive, engagementLevel: "HIGH" } }),
      prisma.player.count({
        where: {
          ...baseActive,
          engagementLevel: { in: ["NEW"] },
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth(), 1),
          },
        },
      }),
      prisma.player.count({ where: { ...baseActive, membership: activeMember } }),
      prisma.player.count({ where: { ...baseActive, membership: null } }),
      prisma.player.count({
        where: {
          ...baseActive,
          membership: { is: { status: "ACTIVE", renewalDate: { gte: now, lte: in30Days } } },
        },
      }),
    ]);

    // Flatten the latest visit date for the table
    const playersOut = players.map((p) => {
      const { visits, ...rest } = p as any;
      return { ...rest, lastVisitAt: visits?.[0]?.date || null };
    });

    return NextResponse.json({
      players: playersOut,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        vipCount,
        highCount,
        newCount,
        memberCount,
        visitorCount,
        upcomingRenewals,
      },
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
    if (validated.federationLicense && validated.federationLicense !== "")
      data.federationLicense = validated.federationLicense;

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
