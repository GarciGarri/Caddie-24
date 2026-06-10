import { prisma } from "@/lib/prisma";

/**
 * Marketing opt-out is modelled as a reserved player tag so it requires
 * no schema migration, stays visible to staff as a badge, and is easy
 * to filter on in campaign segments.
 */
export const OPT_OUT_TAG = "baja_comunicaciones";

const OPT_OUT_PATTERNS = [
  /^baja$/i,
  /^stop$/i,
  /^unsubscribe$/i,
  /^cancelar\s+suscripci[oó]n$/i,
  /^no\s+enviar\s+m[aá]s$/i,
  /no\s+quiero\s+recibir\s+(m[aá]s\s+)?(mensajes|publicidad|promociones|comunicaciones)/i,
  /dej(a|ad|en?)\s+de\s+(enviarme|mandarme|escribirme)/i,
  /darme\s+de\s+baja/i,
  /quiero\s+darme\s+de\s+baja/i,
];

/** Detect if an inbound message is an unsubscribe request. */
export function isOptOutMessage(content: string): boolean {
  const text = (content || "").trim();
  if (!text || text.length > 120) return false;
  return OPT_OUT_PATTERNS.some((p) => p.test(text));
}

export async function isPlayerOptedOut(playerId: string): Promise<boolean> {
  const tag = await prisma.playerTag.findUnique({
    where: { playerId_tag: { playerId, tag: OPT_OUT_TAG } },
  });
  return !!tag;
}

export async function optOutPlayer(playerId: string): Promise<void> {
  await prisma.playerTag.upsert({
    where: { playerId_tag: { playerId, tag: OPT_OUT_TAG } },
    update: {},
    create: { playerId, tag: OPT_OUT_TAG, source: "MANUAL" },
  });
}

export async function optInPlayer(playerId: string): Promise<void> {
  await prisma.playerTag.deleteMany({
    where: { playerId, tag: OPT_OUT_TAG },
  });
}

export const OPT_OUT_CONFIRMATION: Record<string, string> = {
  ES: "Entendido, te hemos dado de baja de nuestras comunicaciones comerciales. Seguiremos atendiéndote por este canal si nos escribes. Para reactivarlas, responde ALTA.",
  EN: "Understood — you have been unsubscribed from our marketing messages. We will still reply if you write to us. To opt back in, reply ALTA.",
  DE: "Verstanden — Sie wurden von unseren Marketing-Nachrichten abgemeldet. Wir antworten Ihnen weiterhin, wenn Sie uns schreiben. Um sich wieder anzumelden, antworten Sie ALTA.",
  FR: "Compris — vous êtes désinscrit de nos messages marketing. Nous continuerons à vous répondre si vous nous écrivez. Pour vous réinscrire, répondez ALTA.",
};

const OPT_IN_PATTERN = /^alta$/i;

/** Detect if an inbound message is a re-subscribe request. */
export function isOptInMessage(content: string): boolean {
  return OPT_IN_PATTERN.test((content || "").trim());
}

export const OPT_IN_CONFIRMATION: Record<string, string> = {
  ES: "¡Perfecto! Volverás a recibir nuestras novedades y promociones. 👍",
  EN: "Great! You will receive our news and offers again. 👍",
  DE: "Super! Sie erhalten wieder unsere Neuigkeiten und Angebote. 👍",
  FR: "Parfait ! Vous recevrez à nouveau nos nouveautés et promotions. 👍",
};

/**
 * Channel-agnostic handling of BAJA/STOP and ALTA keywords for any
 * inbound message. Returns true if the message was a consent request
 * (callers should then skip AI auto-reply).
 */
export async function processInboundConsent(
  conversationId: string,
  player: {
    id: string;
    firstName: string;
    lastName: string;
    preferredLanguage: string | null;
  },
  content: string
): Promise<boolean> {
  const isOut = isOptOutMessage(content);
  const isIn = !isOut && isOptInMessage(content);
  if (!isOut && !isIn) return false;

  // Imported lazily to avoid a module cycle (channels → whatsapp → prisma)
  const { sendToConversation } = await import("@/lib/services/channels");
  const { createNotificationForAllAdmins } = await import(
    "@/lib/services/notifications"
  );

  try {
    if (isOut) {
      await optOutPlayer(player.id);
    } else {
      await optInPlayer(player.id);
    }

    const lang = player.preferredLanguage || "ES";
    const confirmation = isOut
      ? OPT_OUT_CONFIRMATION[lang] || OPT_OUT_CONFIRMATION.ES
      : OPT_IN_CONFIRMATION[lang] || OPT_IN_CONFIRMATION.ES;

    try {
      await sendToConversation(conversationId, confirmation, "system");
    } catch (err) {
      // Channel not configured or send failed — consent change still recorded
      console.error("[Consent] Confirmation send failed:", err);
    }

    if (isOut) {
      createNotificationForAllAdmins({
        type: "NEW_MESSAGE",
        title: "Baja de comunicaciones",
        body: `${player.firstName} ${player.lastName} se ha dado de baja de las comunicaciones comerciales.`,
        link: `/players/${player.id}`,
        data: { playerId: player.id },
      }).catch(() => {});
    }

    console.log(
      `[Consent] Player ${player.id} opted ${isOut ? "out of" : "into"} marketing communications`
    );
  } catch (err) {
    console.error("[Consent] Change error:", err);
  }

  return true;
}
