import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkUnansweredMessages } from "@/lib/services/notifications";

// In-memory throttle: run unanswered check at most once every 10 minutes
let lastUnansweredCheck = 0;
const UNANSWERED_CHECK_INTERVAL = 10 * 60 * 1000; // 10 min

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

  // Piggyback: check unanswered messages (throttled to every 10 min)
  const now = Date.now();
  if (now - lastUnansweredCheck > UNANSWERED_CHECK_INTERVAL) {
    lastUnansweredCheck = now;
    // Fire and forget — don't block the response
    checkUnansweredMessages().catch((err) =>
      console.error("[Notifications] Unanswered check error:", err)
    );
  }

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
