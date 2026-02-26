import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const registrations = await prisma.tournamentRegistration.findMany({
      where: { tournamentId: params.id },
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
            playStylePreference: true,
          },
        },
      },
      orderBy: [
        { status: "asc" },
        { registeredAt: "asc" },
      ],
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { error: "Error al obtener inscripciones" },
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
    const { playerId, categoryName } = body;

    if (!playerId) {
      return NextResponse.json(
        { error: "Jugador obligatorio" },
        { status: 400 }
      );
    }

    // Check tournament exists and is open
    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            registrations: {
              where: { status: { in: ["REGISTERED", "CONFIRMED"] } },
            },
          },
        },
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Torneo no encontrado" },
        { status: 404 }
      );
    }

    // Check if already registered
    const existing = await prisma.tournamentRegistration.findUnique({
      where: {
        tournamentId_playerId: {
          tournamentId: params.id,
          playerId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "El jugador ya está inscrito" },
        { status: 409 }
      );
    }

    // Determine if waitlist
    const currentCount = tournament._count.registrations;
    const isWaitlist = currentCount >= tournament.maxParticipants;

    // Get player handicap
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      select: { handicap: true },
    });

    const registration = await prisma.tournamentRegistration.create({
      data: {
        tournamentId: params.id,
        playerId,
        categoryName: categoryName || null,
        status: isWaitlist ? "WAITLIST" : "REGISTERED",
        waitlistPosition: isWaitlist ? currentCount - tournament.maxParticipants + 1 : null,
        handicapAtRegistration: player?.handicap ?? null,
      },
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
    });

    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    console.error("Error creating registration:", error);
    return NextResponse.json(
      { error: "Error al inscribir jugador" },
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
    const { registrationId, paymentStatus, status } = body;

    if (!registrationId) {
      return NextResponse.json(
        { error: "ID de inscripción obligatorio" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (status) {
      updateData.status = status;
      if (status === "CANCELLED") updateData.cancelledAt = new Date();
    }

    const registration = await prisma.tournamentRegistration.update({
      where: { id: registrationId },
      data: updateData,
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
    });

    // If a registration is cancelled, promote first waitlisted player
    if (status === "CANCELLED") {
      const nextWaitlisted = await prisma.tournamentRegistration.findFirst({
        where: {
          tournamentId: params.id,
          status: "WAITLIST",
        },
        orderBy: { waitlistPosition: "asc" },
      });

      if (nextWaitlisted) {
        await prisma.tournamentRegistration.update({
          where: { id: nextWaitlisted.id },
          data: { status: "REGISTERED", waitlistPosition: null },
        });
      }
    }

    return NextResponse.json(registration);
  } catch (error) {
    console.error("Error updating registration:", error);
    return NextResponse.json(
      { error: "Error al actualizar inscripción" },
      { status: 500 }
    );
  }
}
