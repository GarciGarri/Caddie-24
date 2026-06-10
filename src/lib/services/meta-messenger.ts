import { prisma } from "@/lib/prisma";

const GRAPH_API = "https://graph.facebook.com/v21.0";

async function getPageToken(): Promise<string> {
  const settings = await prisma.clubSettings.findUnique({
    where: { id: "default" },
    select: { metaPageAccessToken: true },
  });
  if (!settings?.metaPageAccessToken) {
    throw new Error(
      "Messenger/Instagram no configurado. Ve a Configuración → Canales para añadir el token de página de Meta."
    );
  }
  return settings.metaPageAccessToken;
}

/**
 * Send a text message to a Messenger PSID or Instagram-scoped user ID.
 * Both Messenger and Instagram DMs use the same /me/messages endpoint
 * with the page access token.
 */
export async function sendMetaMessage(
  recipientId: string,
  text: string
): Promise<{ externalId: string }> {
  const token = await getPageToken();

  const res = await fetch(`${GRAPH_API}/me/messages?access_token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: recipientId },
      messaging_type: "RESPONSE",
      message: { text },
    }),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || `Meta API error (${res.status})`);
  }
  return { externalId: data.message_id || "" };
}
