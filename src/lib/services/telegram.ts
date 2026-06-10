import { prisma } from "@/lib/prisma";

const TG_API = "https://api.telegram.org";

async function getBotToken(): Promise<string> {
  const settings = await prisma.clubSettings.findUnique({
    where: { id: "default" },
    select: { telegramBotToken: true },
  });
  if (!settings?.telegramBotToken) {
    throw new Error(
      "Telegram no configurado. Ve a Configuración → Canales para añadir el token del bot."
    );
  }
  return settings.telegramBotToken;
}

async function callTelegram(
  token: string,
  method: string,
  payload: Record<string, unknown>
): Promise<any> {
  const res = await fetch(`${TG_API}/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.ok) {
    throw new Error(data.description || `Telegram API error (${method})`);
  }
  return data.result;
}

/** Send a plain text message to a Telegram chat. */
export async function sendTelegramMessage(
  chatId: string,
  text: string
): Promise<{ externalId: string }> {
  const token = await getBotToken();
  const result = await callTelegram(token, "sendMessage", {
    chat_id: chatId,
    text,
  });
  return { externalId: String(result.message_id) };
}

/**
 * Register this deployment as the bot's webhook and store the secret.
 * Returns the bot username for display.
 */
export async function setupTelegramWebhook(
  appUrl: string
): Promise<{ botUsername: string; webhookUrl: string }> {
  const token = await getBotToken();

  // Generate and persist a webhook secret if missing
  let settings = await prisma.clubSettings.findUnique({
    where: { id: "default" },
    select: { telegramWebhookSecret: true },
  });
  let secret = settings?.telegramWebhookSecret;
  if (!secret) {
    secret = Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    await prisma.clubSettings.update({
      where: { id: "default" },
      data: { telegramWebhookSecret: secret },
    });
  }

  const webhookUrl = `${appUrl.replace(/\/$/, "")}/api/webhook/telegram`;
  await callTelegram(token, "setWebhook", {
    url: webhookUrl,
    secret_token: secret,
    allowed_updates: ["message"],
  });

  const me = await callTelegram(token, "getMe", {});
  return { botUsername: me.username || "", webhookUrl };
}

/** Verify bot token works (for the settings test button). */
export async function testTelegramConnection(): Promise<{
  success: boolean;
  botUsername?: string;
  error?: string;
}> {
  try {
    const token = await getBotToken();
    const me = await callTelegram(token, "getMe", {});
    return { success: true, botUsername: me.username };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error de conexión",
    };
  }
}
