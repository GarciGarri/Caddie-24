import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  setupTelegramWebhook,
  testTelegramConnection,
} from "@/lib/services/telegram";

// POST /api/settings/telegram-setup — register the webhook with Telegram
// body: { action: "setup" | "test" }
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    if ((session.user as any)?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Solo administradores" },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));

    if (body.action === "test") {
      const result = await testTelegramConnection();
      return NextResponse.json(result);
    }

    // Default action: setup webhook against this deployment's public URL
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    const result = await setupTelegramWebhook(appUrl);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error de configuración",
      },
      { status: 400 }
    );
  }
}
