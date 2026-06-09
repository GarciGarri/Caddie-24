import { NextRequest } from "next/server";
import { processDueScheduledCampaigns } from "@/lib/services/campaign-sender";
import { runDailyJourneys } from "@/lib/services/journeys";
import { sendBookingReminders } from "@/lib/services/bookings";

export const maxDuration = 300;

/**
 * GET /api/cron/daily — consolidated daily job (Vercel Hobby allows
 * few cron entries, so everything proactive runs here):
 *  - due scheduled campaigns
 *  - lifecycle journeys (birthday, winback, renewals, post-visit)
 *  - booking reminders for tomorrow
 * All sub-tasks are idempotent, so the opportunistic trigger from the
 * dashboard can also call this logic safely.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result: Record<string, unknown> = {};

  try {
    result.campaigns = await processDueScheduledCampaigns();
  } catch (err) {
    console.error("[Cron daily] campaigns error:", err);
    result.campaigns = "error";
  }

  try {
    result.journeys = await runDailyJourneys();
  } catch (err) {
    console.error("[Cron daily] journeys error:", err);
    result.journeys = "error";
  }

  try {
    result.bookingReminders = await sendBookingReminders();
  } catch (err) {
    console.error("[Cron daily] booking reminders error:", err);
    result.bookingReminders = "error";
  }

  return Response.json({
    ok: true,
    ...result,
    timestamp: new Date().toISOString(),
  });
}
