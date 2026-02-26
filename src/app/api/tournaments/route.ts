import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createTournamentSchema } from "@/lib/validations/tournament";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new Response(JSON.stringify({ error: "No autenticado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [tournaments, total] = await Promise.all([
      prisma.tournament.findMany({
        where,
        include: {
          categories: true,
          _count: {
            select: {
              registrations: true,
              results: true,
            },
          },
        },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.tournament.count({ where }),
    ]);

    return NextResponse.json({
      tournaments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    return NextResponse.json(
      { error: "Error al obtener torneos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createTournamentSchema.parse(body);

    const { categories, ...tournamentData } = validated;

    const tournament = await prisma.tournament.create({
      data: {
        name: tournamentData.name,
        description: tournamentData.description || null,
        date: new Date(tournamentData.date),
        teeTime: tournamentData.teeTime || null,
        format: tournamentData.format,
        handicapSystem: tournamentData.handicapSystem || "EGA",
        maxParticipants: tournamentData.maxParticipants,
        entryFee: tournamentData.entryFee ?? null,
        totalPrize: tournamentData.totalPrize ?? null,
        cancellationPolicy: tournamentData.cancellationPolicy || null,
        sponsors: tournamentData.sponsors && tournamentData.sponsors.length > 0
          ? tournamentData.sponsors
          : undefined,
        preferredChannel: tournamentData.preferredChannel || "whatsapp",
        status: "DRAFT",
        categories: categories && categories.length > 0
          ? {
              create: categories.map((cat) => ({
                name: cat.name,
                type: cat.type,
                handicapMin: cat.handicapMin ?? null,
                handicapMax: cat.handicapMax ?? null,
                gender: cat.gender ?? null,
                maxPlayers: cat.maxPlayers ?? null,
                prizeAmount: cat.prizeAmount ?? null,
              })),
            }
          : undefined,
      },
      include: {
        categories: true,
        _count: { select: { registrations: true, results: true } },
      },
    });

    return NextResponse.json(tournament, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      const fieldErrors = error.errors
        .map((e: any) => `${e.path.join(".")}: ${e.message}`)
        .join(". ");
      return NextResponse.json(
        { error: `Datos inválidos: ${fieldErrors}` },
        { status: 400 }
      );
    }
    console.error("Error creating tournament:", error);
    return NextResponse.json(
      { error: "Error al crear torneo" },
      { status: 500 }
    );
  }
}
