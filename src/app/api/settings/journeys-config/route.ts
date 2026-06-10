import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getJourneysConfig } from "@/lib/services/journeys";

// GET /api/settings/journeys-config — effective config (stored + defaults)
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const config = await getJourneysConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error("Error fetching journeys config:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
