import { NextRequest } from "next/server";
import { checkUnansweredMessages } from "@/lib/services/notifications";

// GET /api/cron/check-unanswered — Vercel Cron job (every 15 min)
// Checks for OPEN conversations with INBOUND messages >1h without response
export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const notified = await checkUnansweredMessages();
    return Response.json({
      ok: true,
      notified,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] check-unanswered error:", error);
    return Response.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
