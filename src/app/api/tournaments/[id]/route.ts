import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updateTournamentSchema } from "@/lib/validations/tournament";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
      include: {
        categories: true,
        registrations: {
          include: {
            player: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                handicap: true,
                engagementLevel: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { registeredAt: "asc" },
        },
        results: {
          include: {
            player: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                handicap: true,
              },
            },
          },
          orderBy: { positionOverall: "asc" },
        },
        _count: {
          select: { registrations: true, results: true },
        },
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Torneo no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(tournament);
  } catch (error) {
    console.error("Error fetching tournament:", error);
    return NextResponse.json(
      { error: "Error al obtener torneo" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Handle status-only updates
    if (body.status && Object.keys(body).length === 1) {
      const tournament = await prisma.tournament.update({
        where: { id: params.id },
        data: { status: body.status },
        include: {
          categories: true,
          _count: { select: { registrations: true, results: true } },
        },
      });
      return NextResponse.json(tournament);
    }

    const validated = updateTournamentSchema.parse(body);
    const { categories, ...tournamentData } = validated;

    const updateData: any = {};
    if (tournamentData.name !== undefined) updateData.name = tournamentData.name;
    if (tournamentData.description !== undefined) updateData.description = tournamentData.description || null;
    if (tournamentData.date !== undefined) updateData.date = new Date(tournamentData.date);
    if (tournamentData.teeTime !== undefined) updateData.teeTime = tournamentData.teeTime || null;
    if (tournamentData.format !== undefined) updateData.format = tournamentData.format;
    if (tournamentData.handicapSystem !== undefined) updateData.handicapSystem = tournamentData.handicapSystem;
    if (tournamentData.maxParticipants !== undefined) updateData.maxParticipants = tournamentData.maxParticipants;
    if (tournamentData.entryFee !== undefined) updateData.entryFee = tournamentData.entryFee;
    if (tournamentData.totalPrize !== undefined) updateData.totalPrize = tournamentData.totalPrize;
    if (tournamentData.cancellationPolicy !== undefined) updateData.cancellationPolicy = tournamentData.cancellationPolicy;
    if (tournamentData.sponsors !== undefined) updateData.sponsors = tournamentData.sponsors;
    if (tournamentData.preferredChannel !== undefined) updateData.preferredChannel = tournamentData.preferredChannel;

    // If categories are provided, replace all
    if (categories) {
      await prisma.tournamentCategory.deleteMany({
        where: { tournamentId: params.id },
      });
      if (categories.length > 0) {
        await prisma.tournamentCategory.createMany({
          data: categories.map((cat) => ({
            tournamentId: params.id,
            name: cat.name,
            type: cat.type,
            handicapMin: cat.handicapMin ?? null,
            handicapMax: cat.handicapMax ?? null,
            gender: cat.gender ?? null,
            maxPlayers: cat.maxPlayers ?? null,
            prizeAmount: cat.prizeAmount ?? null,
          })),
        });
      }
    }

    const tournament = await prisma.tournament.update({
      where: { id: params.id },
      data: updateData,
      include: {
        categories: true,
        _count: { select: { registrations: true, results: true } },
      },
    });

    return NextResponse.json(tournament);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      );
    }
    console.error("Error updating tournament:", error);
    return NextResponse.json(
      { error: "Error al actualizar torneo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await prisma.tournament.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tournament:", error);
    return NextResponse.json(
      { error: "Error al eliminar torneo" },
      { status: 500 }
    );
  }
}
