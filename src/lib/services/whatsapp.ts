import { prisma } from "@/lib/prisma";

// --- Types ---

interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
}

interface WhatsAppSendResponse {
  messaging_product: string;
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{ id: string }>;
}

export interface TemplateComponent {
  type: "header" | "body" | "button";
  parameters: Array<{
    type: "text" | "currency" | "date_time" | "image" | "document" | "video";
    text?: string;
    image?: { link: string };
  }>;
}

const META_API_BASE = "https://graph.facebook.com/v21.0";

// --- Language mapping ---
const LANG_MAP: Record<string, string> = {
  ES: "es",
  EN: "en",
  DE: "de",
  FR: "fr",
};

export function mapLanguageCode(dbLang: string): string {
  return LANG_MAP[dbLang] || "es";
}

// --- Phone number normalization ---

/**
 * Normalize phone for WhatsApp API (strip +, spaces, dashes)
 * DB stores: +34612345678 → API needs: 34612345678
 */
export function normalizePhoneForApi(phone: string): string {
  return phone.replace(/[\s\-+()]/g, "");
}

/**
 * Normalize phone for DB lookup (ensure + prefix)
 * API sends: 34612345678 → DB has: +34612345678
 */
export function normalizePhoneForDb(phone: string): string {
  const clean = phone.replace(/[\s\-()]/g, "");
  return clean.startsWith("+") ? clean : `+${clean}`;
}

// --- Config helper ---

export async function getWhatsAppConfig(): Promise<WhatsAppConfig> {
  const settings = await prisma.clubSettings.findUnique({
    where: { id: "default" },
    select: {
      whatsappPhoneNumberId: true,
      whatsappAccessToken: true,
    },
  });

  if (!settings?.whatsappPhoneNumberId || !settings?.whatsappAccessToken) {
    throw new Error(
      "WhatsApp no configurado. Ve a Configuración → WhatsApp para añadir tus credenciales de Meta."
    );
  }

  return {
    phoneNumberId: settings.whatsappPhoneNumberId,
    accessToken: settings.whatsappAccessToken,
  };
}

// --- Core send function ---

async function sendToWhatsApp(
  config: WhatsAppConfig,
  payload: Record<string, unknown>
): Promise<WhatsAppSendResponse> {
  const url = `${META_API_BASE}/${config.phoneNumberId}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      ...payload,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const errMsg =
      data?.error?.message || `WhatsApp API error (${res.status})`;
    console.error("[WhatsApp API Error]", JSON.stringify(data, null, 2));
    throw new Error(errMsg);
  }

  return data as WhatsAppSendResponse;
}

// --- Public API ---

/**
 * Send a text message. Only works within 24h of customer's last message.
 */
export async function sendTextMessage(
  to: string,
  text: string
): Promise<{ whatsappMessageId: string }> {
  const config = await getWhatsAppConfig();
  const result = await sendToWhatsApp(config, {
    recipient_type: "individual",
    to: normalizePhoneForApi(to),
    type: "text",
    text: { body: text },
  });

  return { whatsappMessageId: result.messages[0].id };
}

/**
 * Send a template message. Works anytime (no 24h restriction).
 */
export async function sendTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string,
  components?: TemplateComponent[]
): Promise<{ whatsappMessageId: string }> {
  const config = await getWhatsAppConfig();

  const template: Record<string, unknown> = {
    name: templateName,
    language: { code: languageCode },
  };
  if (components && components.length > 0) {
    template.components = components;
  }

  const result = await sendToWhatsApp(config, {
    recipient_type: "individual",
    to: normalizePhoneForApi(to),
    type: "template",
    template,
  });

  return { whatsappMessageId: result.messages[0].id };
}

/**
 * Send a media message (image, video, document, audio).
 * Only works within 24h of customer's last message.
 */
export async function sendMediaMessage(
  to: string,
  type: "image" | "video" | "document" | "audio",
  mediaUrl: string,
  caption?: string
): Promise<{ whatsappMessageId: string }> {
  const config = await getWhatsAppConfig();

  const mediaPayload: Record<string, unknown> = { link: mediaUrl };
  if (caption) mediaPayload.caption = caption;

  const result = await sendToWhatsApp(config, {
    recipient_type: "individual",
    to: normalizePhoneForApi(to),
    type,
    [type]: mediaPayload,
  });

  return { whatsappMessageId: result.messages[0].id };
}

/**
 * Mark a message as read on WhatsApp (sends blue ticks).
 */
export async function markAsRead(
  whatsappMessageId: string
): Promise<void> {
  const config = await getWhatsAppConfig();

  await fetch(`${META_API_BASE}/${config.phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      status: "read",
      message_id: whatsappMessageId,
    }),
  });
}

/**
 * Get media download URL from a media ID (for inbound media messages).
 */
export async function getMediaUrl(mediaId: string): Promise<string> {
  const config = await getWhatsAppConfig();

  const res = await fetch(`${META_API_BASE}/${mediaId}`, {
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
    },
  });

  if (!res.ok) throw new Error(`Failed to get media URL for ${mediaId}`);
  const data = await res.json();
  return data.url;
}

/**
 * Test WhatsApp API connection by fetching phone number info.
 */
export async function testConnection(): Promise<{
  success: boolean;
  displayName?: string;
  error?: string;
}> {
  try {
    const config = await getWhatsAppConfig();

    const res = await fetch(`${META_API_BASE}/${config.phoneNumberId}`, {
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data?.error?.message || `Error ${res.status}`,
      };
    }

    return {
      success: true,
      displayName:
        data.verified_name || data.display_phone_number || "Conectado",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error de conexión",
    };
  }
}
