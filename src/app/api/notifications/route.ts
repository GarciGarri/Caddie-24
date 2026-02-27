import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/notifications — list user notifications
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { searchParams } = req.nextUrl;
  const unreadOnly = searchParams.get("unreadOnly") === "true";
  const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 100);

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.notification.count({
      where: { userId, isRead: false },
    }),
  ]);

  return Response.json({ notifications, unreadCount });
}
