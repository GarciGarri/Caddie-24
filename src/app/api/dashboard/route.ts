import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/dashboard — Dashboard KPIs
export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalPlayers,
      newPlayersThisMonth,
      vipPlayers,
      activeConversations,
      unreadConversations,
      totalCampaigns,
      recentActivity,
    ] = await Promise.all([
      // Total active players
      prisma.player.count({ where: { isActive: true } }),

      // New players this month
      prisma.player.count({
        where: {
          isActive: true,
          createdAt: { gte: startOfMonth },
        },
      }),

      // VIP players
      prisma.player.count({
        where: { isActive: true, engagementLevel: "VIP" },
      }),

      // Active conversations
      prisma.conversation.count({
        where: { status: { in: ["OPEN", "PENDING"] } },
      }),

      // Unread conversations
      prisma.conversation.count({
        where: { unreadCount: { gt: 0 } },
      }),

      // Campaigns this month
      prisma.campaign.count({
        where: { createdAt: { gte: startOfMonth } },
      }),

      // Recent messages for activity feed
      prisma.message.findMany({
        orderBy: { timestamp: "desc" },
        take: 5,
        include: {
          conversation: {
            include: {
              player: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalPlayers,
        newPlayersThisMonth,
        vipPlayers,
        activeConversations,
        unreadConversations,
        totalCampaigns,
      },
      recentActivity: recentActivity.map((msg) => ({
        id: msg.id,
        type: msg.direction === "INBOUND" ? "message_in" : "message_out",
        playerName: msg.conversation?.player
          ? `${msg.conversation.player.firstName} ${msg.conversation.player.lastName}`
          : "Desconocido",
        preview:
          msg.content.length > 60
            ? msg.content.substring(0, 60) + "..."
            : msg.content,
        timestamp: msg.timestamp,
        isAi: msg.isAiGenerated,
      })),
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}
