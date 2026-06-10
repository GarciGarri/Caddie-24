import { prisma } from "@/lib/prisma";
import { sendTextMessage } from "@/lib/services/whatsapp";
import { sendTelegramMessage } from "@/lib/services/telegram";
import { sendMetaMessage } from "@/lib/services/meta-messenger";
import { sendEmail } from "@/lib/services/email";

export type Channel = "whatsapp" | "telegram" | "messenger" | "instagram" | "email";

export const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  messenger: "Messenger",
  instagram: "Instagram",
  email: "Email",
};

export interface PlayerChannelInfo {
  id: string;
  phone: string | null;
  email: string | null;
  telegramChatId: string | null;
  facebookPsid: string | null;
  instagramId: string | null;
}

/**
 * Send a plain text message to a player on the given channel.
 * Returns an external message id (prefixed per channel so the unique
 * whatsappMessageId column can store ids from any provider).
 */
export async function sendViaChannel(
  player: PlayerChannelInfo,
  channel: Channel,
  text: string,
  emailSubject?: string
): Promise<{ externalId: string | null }> {
  switch (channel) {
    case "whatsapp": {
      if (!player.phone || player.phone.includes(":")) {
        throw new Error("El jugador no tiene teléfono para WhatsApp");
      }
      const r = await sendTextMessage(player.phone, text);
      return { externalId: r.whatsappMessageId };
    }
    case "telegram": {
      if (!player.telegramChatId) {
        throw new Error("El jugador no tiene Telegram vinculado");
      }
      const r = await sendTelegramMessage(player.telegramChatId, text);
      return { externalId: `tg:${r.externalId}` };
    }
    case "messenger": {
      if (!player.facebookPsid) {
        throw new Error("El jugador no tiene Messenger vinculado");
      }
      const r = await sendMetaMessage(player.facebookPsid, text);
      return { externalId: r.externalId ? `fb:${r.externalId}` : null };
    }
    case "instagram": {
      if (!player.instagramId) {
        throw new Error("El jugador no tiene Instagram vinculado");
      }
      const r = await sendMetaMessage(player.instagramId, text);
      return { externalId: r.externalId ? `ig:${r.externalId}` : null };
    }
    case "email": {
      if (!player.email) {
        throw new Error("El jugador no tiene email");
      }
      const subject = emailSubject || "Mensaje de tu club de golf";
      const r = await sendEmail(player.email, subject, text);
      return { externalId: r.externalId ? `em:${r.externalId}` : null };
    }
    default:
      throw new Error(`Canal desconocido: ${channel}`);
  }
}

/**
 * Send a text reply inside an existing conversation using the
 * conversation's own channel, recording the Message and updating
 * the conversation preview. Central path for staff replies, AI
 * auto-replies and system confirmations.
 */
export async function sendToConversation(
  conversationId: string,
  text: string,
  sentBy: string,
  options?: { isAiGenerated?: boolean }
): Promise<{ messageId: string }> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      player: {
        select: {
          id: true,
          phone: true,
          email: true,
          telegramChatId: true,
          facebookPsid: true,
          instagramId: true,
        },
      },
    },
  });
  if (!conversation) throw new Error("Conversación no encontrada");

  const channel = (conversation.channel || "whatsapp") as Channel;
  const { externalId } = await sendViaChannel(conversation.player, channel, text);

  const message = await prisma.message.create({
    data: {
      conversationId,
      whatsappMessageId: externalId,
      direction: "OUTBOUND",
      type: "TEXT",
      content: text,
      status: "SENT",
      sentBy,
      isAiGenerated: options?.isAiGenerated || false,
      timestamp: new Date(),
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageAt: new Date(),
      lastMessagePreview: text.substring(0, 255),
    },
  });

  return { messageId: message.id };
}

/**
 * Pick the best channel for proactive messages (journeys, reminders,
 * start lists). Telegram and email have no messaging window; WhatsApp
 * plain text only works inside the 24h customer-service window, so it
 * goes last and may fail outside it (callers catch per-player errors).
 */
export function pickProactiveChannel(player: PlayerChannelInfo): Channel | null {
  if (player.telegramChatId) return "telegram";
  if (player.email) return "email";
  if (player.phone && !player.phone.includes(":")) return "whatsapp";
  if (player.facebookPsid) return "messenger";
  if (player.instagramId) return "instagram";
  return null;
}

/**
 * Send a proactive message picking the best available channel.
 * Returns the channel used, or throws if none available / send failed.
 */
export async function sendProactive(
  player: PlayerChannelInfo,
  text: string,
  emailSubject?: string
): Promise<Channel> {
  const channel = pickProactiveChannel(player);
  if (!channel) throw new Error("El jugador no tiene ningún canal de contacto");
  await sendViaChannel(player, channel, text, emailSubject);
  return channel;
}
