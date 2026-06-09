import { NextRequest } from "next/server";
import { processDueScheduledCampaigns } from "@/lib/services/campaign-sender";

export const maxDuration = 60;

// GET /api/cron/send-scheduled — Vercel Cron job
// Sends every SCHEDULED campaign whose scheduledAt date has passed.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processDueScheduledCampaigns();
    return Response.json({
      ok: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] send-scheduled error:", error);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
