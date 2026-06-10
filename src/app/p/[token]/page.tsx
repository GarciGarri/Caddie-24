import { prisma } from "@/lib/prisma";
import { verifyPortalToken } from "@/lib/services/portal-token";
import { OPT_OUT_TAG } from "@/lib/services/consent";
import { PortalClient } from "./portal-client";

export const dynamic = "force-dynamic";

export default async function PlayerPortalPage({
  params,
}: {
  params: { token: string };
}) {
  const playerId = verifyPortalToken(decodeURIComponent(params.token));

  if (!playerId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center">
          <p className="text-4xl mb-3">⛳</p>
          <h1 className="text-xl font-bold mb-2">Enlace no válido</h1>
          <p className="text-sm text-gray-500">
            Este enlace ha caducado o no es correcto. Pide uno nuevo al club.
          </p>
        </div>
      </div>
    );
  }

  const [player, settings, bookings, registrations] = await Promise.all([
    prisma.player.findUnique({
      where: { id: playerId },
      include: {
        membership: true,
        packs: { orderBy: { purchasedAt: "desc" } },
        tags: { where: { tag: OPT_OUT_TAG } },
        tournamentResults: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { tournament: { select: { name: true, date: true } } },
        },
      },
    }),
    prisma.clubSettings.findUnique({ where: { id: "default" } }),
    prisma.booking.findMany({
      where: {
        playerId,
        status: "CONFIRMED",
        date: { gte: new Date(new Date().toISOString().split("T")[0]) },
      },
      orderBy: [{ date: "asc" }, { teeTime: "asc" }],
      take: 10,
    }),
    prisma.tournamentRegistration.findMany({
      where: {
        playerId,
        status: { in: ["REGISTERED", "CONFIRMED", "WAITLIST"] },
        tournament: { date: { gte: new Date() } },
      },
      include: {
        tournament: { select: { name: true, date: true, status: true } },
      },
      orderBy: { tournament: { date: "asc" } },
    }),
  ]);

  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <p className="text-sm text-gray-500">Jugador no encontrado.</p>
      </div>
    );
  }

  const data = {
    token: decodeURIComponent(params.token),
    clubName: settings?.clubName || "Club de Golf",
    player: {
      firstName: player.firstName,
      lastName: player.lastName,
      handicap: player.handicap,
      federationLicense: player.federationLicense,
      optedOut: player.tags.length > 0,
      membership: player.membership
        ? {
            type: player.membership.type,
            status: player.membership.status,
            renewalDate: player.membership.renewalDate?.toISOString() || null,
          }
        : null,
      packs: player.packs.map((p) => ({
        id: p.id,
        name: p.name,
        remainingUses: p.remainingUses,
        totalUses: p.totalUses,
        expiresAt: p.expiresAt?.toISOString() || null,
      })),
      results: player.tournamentResults.map((r) => ({
        id: r.id,
        tournament: r.tournament.name,
        date: r.tournament.date.toISOString(),
        position: r.positionOverall,
        netScore: r.netScore,
        grossScore: r.grossScore,
      })),
    },
    bookings: bookings.map((b) => ({
      id: b.id,
      date: b.date.toISOString(),
      teeTime: b.teeTime,
      playersCount: b.playersCount,
      holes: b.holes,
      buggy: b.buggy,
    })),
    registrations: registrations.map((r) => ({
      id: r.id,
      tournament: r.tournament.name,
      date: r.tournament.date.toISOString(),
      status: r.status,
      teeTime: r.teeTime,
      groupNumber: r.groupNumber,
    })),
  };

  return <PortalClient data={data} />;
}
