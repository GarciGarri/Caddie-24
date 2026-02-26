import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  request: Request,
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

    const results = await prisma.tournamentResult.findMany({
      where: { tournamentId: params.id },
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            handicap: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { positionOverall: "asc" },
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { error: "Error al obtener resultados" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { results } = body;

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: "Se requiere al menos un resultado" },
        { status: 400 }
      );
    }

    // Upsert results in a transaction
    const saved = await prisma.$transaction(
      results.map((r: any) =>
        prisma.tournamentResult.upsert({
          where: {
            tournamentId_playerId: {
              tournamentId: params.id,
              playerId: r.playerId,
            },
          },
          create: {
            tournamentId: params.id,
            playerId: r.playerId,
            grossScore: r.grossScore ?? null,
            netScore: r.netScore ?? null,
            handicapUsed: r.handicapUsed ?? null,
            positionOverall: r.positionOverall ?? null,
            positionCategory: r.positionCategory ?? null,
            categoryName: r.categoryName ?? null,
            prizeWon: r.prizeWon ?? null,
          },
          update: {
            grossScore: r.grossScore ?? null,
            netScore: r.netScore ?? null,
            handicapUsed: r.handicapUsed ?? null,
            positionOverall: r.positionOverall ?? null,
            positionCategory: r.positionCategory ?? null,
            categoryName: r.categoryName ?? null,
            prizeWon: r.prizeWon ?? null,
          },
        })
      )
    );

    // Mark no-shows: registered players with no results
    const playersWithResults = results.map((r: any) => r.playerId);
    await prisma.tournamentRegistration.updateMany({
      where: {
        tournamentId: params.id,
        status: { in: ["REGISTERED", "CONFIRMED"] },
        playerId: { notIn: playersWithResults },
      },
      data: { status: "NO_SHOW" },
    });

    return NextResponse.json({ saved: saved.length });
  } catch (error) {
    console.error("Error saving results:", error);
    return NextResponse.json(
      { error: "Error al guardar resultados" },
      { status: 500 }
    );
  }
}
