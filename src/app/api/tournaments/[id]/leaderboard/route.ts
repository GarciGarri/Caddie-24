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

    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
      select: { name: true, format: true, categories: true },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Torneo no encontrado" },
        { status: 404 }
      );
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
            engagementLevel: true,
          },
        },
      },
      orderBy: [
        { positionOverall: "asc" },
        { netScore: "asc" },
        { grossScore: "asc" },
      ],
    });

    // Group by category
    const byCategory: Record<string, any[]> = {};
    const overall: any[] = [];

    for (const result of results) {
      overall.push(result);
      if (result.categoryName) {
        if (!byCategory[result.categoryName]) {
          byCategory[result.categoryName] = [];
        }
        byCategory[result.categoryName].push(result);
      }
    }

    return NextResponse.json({
      tournament: {
        name: tournament.name,
        format: tournament.format,
      },
      overall,
      byCategory,
      categories: tournament.categories,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Error al obtener leaderboard" },
      { status: 500 }
    );
  }
}
