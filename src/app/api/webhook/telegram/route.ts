import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { triggerAutoReply } from "@/lib/services/ai-reply";
import { processInboundConsent } from "@/lib/services/consent";

// POST /api/webhook/telegram — Telegram Bot API updates
export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Verify the secret token set during setWebhook
  const settings = await prisma.clubSettings.findUnique({
    where: { id: "default" },
    select: { telegramWebhookSecret: true },
  });
  const headerSecret = request.headers.get("x-telegram-bot-api-secret-token");
  if (
    settings?.telegramWebhookSecret &&
    headerSecret !== settings.telegramWebhookSecret
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Respond fast; process async (Telegram retries on non-200)
  processTelegramUpdate(body).catch((err) =>
    console.error("[Telegram] Error processing update:", err)
  );

  return NextResponse.json({ ok: true });
}

async function processTelegramUpdate(update: any): Promise<void> {
  const msg = update?.message;
  if (!msg || !msg.chat?.id) return;
  // Only private text chats for now
  if (msg.chat.type && msg.chat.type !== "private") return;

  const chatId = String(msg.chat.id);
  const text: string = msg.text || msg.caption || "";
  if (!text) return;

  // 1. Find or create player by Telegram chat id
  let player = await prisma.player.findUnique({
    where: { telegramChatId: chatId },
  });

  if (!player) {
    const firstName = msg.from?.first_name || "Telegram";
    const lastName =
      msg.from?.last_name || (msg.from?.username ? `@${msg.from.username}` : chatId);

    player = await prisma.player.create({
      data: {
        firstName,
        lastName,
        // Placeholder until staff fills in the real phone
        phone: `tg:${chatId}`,
        telegramChatId: chatId,
        source: "telegram",
        engagementLevel: "NEW",
        preferredLanguage: "ES",
      },
    });
    console.log(`[Telegram] Auto-created player ${firstName} ${lastName} (${chatId})`);
  }

  // 2. Find or create a telegram conversation
  let conversation = await prisma.conversation.findFirst({
    where: {
      playerId: player.id,
      channel: "telegram",
      status: { in: ["OPEN", "PENDING"] },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        playerId: player.id,
        status: "OPEN",
        channel: "telegram",
        lastMessageAt: new Date(),
        isAiBotActive: true,
      },
    });
  }

  // 3. Idempotency
  const externalId = `tg:${chatId}:${msg.message_id}`;
  const existing = await prisma.message.findUnique({
    where: { whatsappMessageId: externalId },
  });
  if (existing) return;

  const timestamp = msg.date ? new Date(msg.date * 1000) : new Date();

  const inboundMessage = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      whatsappMessageId: externalId,
      direction: "INBOUND",
      type: "TEXT",
      content: text,
      status: "DELIVERED",
      timestamp,
    },
  });

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      lastMessageAt: timestamp,
      lastMessagePreview: text.substring(0, 255),
      unreadCount: { increment: 1 },
      status: "OPEN",
    },
  });

  console.log(`[Telegram] Incoming from ${chatId}: ${text.substring(0, 50)}`);

  // 4. RGPD consent keywords
  const consentHandled = await processInboundConsent(
    conversation.id,
    player,
    text
  );
  if (consentHandled) return;

  // 5. AI auto-reply via the conversation's channel
  triggerAutoReply(
    conversation.id,
    text,
    player.id,
    inboundMessage.id,
    "TEXT"
  ).catch((err) => console.error("[Telegram] Auto-reply error:", err));
}
