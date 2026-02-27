import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { sendTextMessage } from "@/lib/services/whatsapp";
import { createNotificationForAllAdmins } from "@/lib/services/notifications";

// --- Types ---

interface PlayerContext {
  firstName: string;
  lastName: string;
  phone: string;
  handicap: number | null;
  preferredLanguage: string;
  engagementLevel: string;
  tags: string[];
  totalVisits: number;
  memberSince: string;
}

interface ClubPublicInfo {
  clubName: string;
  openTime: string | null;
  closeTime: string | null;
  voiceTone: string | null;
  voiceValues: string | null;
  voiceStyle: string | null;
  voiceExamples: unknown;
  activeTournaments: Array<{
    name: string;
    date: string;
    format: string | null;
    maxPlayers: number | null;
    registeredCount: number;
  }>;
}

interface EscalationResult {
  shouldEscalate: boolean;
  reason: string | null;
}

// --- Context fetchers ---

async function fetchPlayerContext(playerId: string): Promise<PlayerContext> {
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: {
      tags: true,
      visits: { take: 5, orderBy: { date: "desc" } },
    },
  });

  if (!player) throw new Error(`Player ${playerId} not found`);

  return {
    firstName: player.firstName,
    lastName: player.lastName,
    phone: player.phone,
    handicap: player.handicap,
    preferredLanguage: player.preferredLanguage || "ES",
    engagementLevel: player.engagementLevel,
    tags: player.tags.map((t) => t.tag),
    totalVisits: player.visits.length,
    memberSince: player.createdAt.toISOString().split("T")[0],
  };
}

async function fetchClubPublicInfo(): Promise<ClubPublicInfo> {
  const settings = await prisma.clubSettings.findUnique({
    where: { id: "default" },
  });

  const activeTournaments = await prisma.tournament.findMany({
    where: {
      date: { gte: new Date() },
      status: { in: ["DRAFT", "OPEN"] },
    },
    include: {
      registrations: { select: { id: true } },
    },
    orderBy: { date: "asc" },
    take: 5,
  });

  return {
    clubName: settings?.clubName || "el club",
    openTime: settings?.fieldOpenTime || null,
    closeTime: settings?.fieldCloseTime || null,
    voiceTone: settings?.voiceTone || null,
    voiceValues: settings?.voiceValues || null,
    voiceStyle: settings?.voiceStyle || null,
    voiceExamples: settings?.voiceExamples || null,
    activeTournaments: activeTournaments.map((t) => ({
      name: t.name,
      date: t.date.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
      format: t.format,
      maxPlayers: null,
      registeredCount: t.registrations.length,
    })),
  };
}

// --- Prompt builders ---

function buildWhatsAppSystemPrompt(
  club: ClubPublicInfo,
  player: PlayerContext
): string {
  const langInstruction =
    player.preferredLanguage === "EN"
      ? "Respond in English."
      : player.preferredLanguage === "DE"
        ? "Respond in German."
        : player.preferredLanguage === "FR"
          ? "Respond in French."
          : "Responde en español.";

  let voiceInstructions = "";
  if (club.voiceTone) voiceInstructions += `\nTono: ${club.voiceTone}`;
  if (club.voiceStyle) voiceInstructions += `\nEstilo: ${club.voiceStyle}`;
  if (club.voiceValues) voiceInstructions += `\nValores: ${club.voiceValues}`;
  if (
    club.voiceExamples &&
    Array.isArray(club.voiceExamples) &&
    club.voiceExamples.length > 0
  ) {
    voiceInstructions += `\nEjemplos de mensajes: ${JSON.stringify(club.voiceExamples)}`;
  }

  let tournamentInfo = "";
  if (club.activeTournaments.length > 0) {
    tournamentInfo = "\n\nTorneos próximos:";
    for (const t of club.activeTournaments) {
      tournamentInfo += `\n- ${t.name} (${t.date}, formato: ${t.format || "N/A"}, inscritos: ${t.registeredCount}${t.maxPlayers ? `/${t.maxPlayers}` : ""})`;
    }
  }

  return `Eres el asistente virtual de ${club.clubName} por WhatsApp. Tu rol es atender a los clientes del club de golf de forma amable, profesional y concisa.

REGLAS IMPORTANTES:
- Mensajes CORTOS (1-3 frases máximo). Es WhatsApp, no un email.
- Sé amable pero directo. No uses lenguaje corporativo excesivo.
- Si no sabes algo con certeza, di que consultarás con el equipo y les responderán pronto.
- NUNCA inventes datos de precios, horarios o disponibilidad si no los tienes.
- Si la consulta es compleja (reclamaciones, cancelaciones, problemas técnicos), indica que un miembro del equipo les atenderá personalmente.
${langInstruction}
${voiceInstructions}

INFORMACIÓN DEL CLUB:
- Nombre: ${club.clubName}
${club.openTime ? `- Horario: ${club.openTime} - ${club.closeTime}` : ""}
${tournamentInfo}

INFORMACIÓN DEL CLIENTE:
- Nombre: ${player.firstName} ${player.lastName}
${player.handicap !== null ? `- Handicap: ${player.handicap}` : ""}
- Miembro desde: ${player.memberSince}
- Nivel: ${player.engagementLevel}
${player.tags.length > 0 ? `- Tags: ${player.tags.join(", ")}` : ""}`;
}

function formatConversationHistory(
  messages: Array<{
    direction: string;
    content: string;
    type: string;
    isAiGenerated: boolean;
  }>
): Array<{ role: "user" | "assistant"; content: string }> {
  return messages
    .filter((m) => m.content && m.content.length > 0)
    .map((m) => ({
      role: m.direction === "INBOUND" ? ("user" as const) : ("assistant" as const),
      content:
        m.type === "TEXT" || m.type === "TEMPLATE"
          ? m.content
          : `[${m.type.toLowerCase()} recibido]`,
    }));
}

// --- Core AI generation ---

export async function generateAiReply(
  conversationId: string
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  // Load conversation + player
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { player: true },
  });
  if (!conversation) throw new Error(`Conversation ${conversationId} not found`);

  // Load recent messages (last 20)
  const recentMessages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { timestamp: "asc" },
    take: 20,
    select: {
      direction: true,
      content: true,
      type: true,
      isAiGenerated: true,
    },
  });

  // Load player context and club info
  const [playerCtx, clubInfo] = await Promise.all([
    fetchPlayerContext(conversation.playerId),
    fetchClubPublicInfo(),
  ]);

  // Check demo mode
  const settings = await prisma.clubSettings.findUnique({
    where: { id: "default" },
    select: { demoMode: true },
  });

  let systemPrompt = buildWhatsAppSystemPrompt(clubInfo, playerCtx);

  if (settings?.demoMode) {
    systemPrompt += `\n\nMODO DEMO ACTIVO:
Estas en modo demostracion. Genera respuestas creativas y realistas como si fueras el asistente de un club de golf real.
Inventa disponibilidad de horarios, precios y detalles que suenen naturales.
Se amable, profesional y muestra las mejores capacidades de respuesta automatica.
Si preguntan por reservas, di que hay disponibilidad y ofrece horarios.
Si preguntan por torneos, menciona los proximos eventos del club.`;
  }

  const history = formatConversationHistory(recentMessages);

  const startTime = Date.now();
  const openai = new OpenAI({ apiKey });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      ...history,
    ],
    max_tokens: 300,
    temperature: 0.7,
  });

  const reply = completion.choices[0]?.message?.content || "";
  const durationMs = Date.now() - startTime;

  // Log to AiAnalysisLog
  try {
    await prisma.aiAnalysisLog.create({
      data: {
        type: "DRAFT_GENERATION",
        playerId: conversation.playerId,
        model: "gpt-4o-mini",
        inputTokens: completion.usage?.prompt_tokens || 0,
        outputTokens: completion.usage?.completion_tokens || 0,
        durationMs,
        result: { reply: reply.substring(0, 500) },
      },
    });
  } catch {
    // Non-critical logging
  }

  return reply;
}

// --- Escalation rules ---

const NEGATIVE_WORDS = [
  "queja",
  "reclamación",
  "reclamacion",
  "denuncia",
  "enfadado",
  "furioso",
  "indignado",
  "inaceptable",
  "vergüenza",
  "verguenza",
  "estafa",
  "robo",
  "horrible",
  "pésimo",
  "pesimo",
  "asco",
  "demanda",
  "abogado",
  "complaint",
  "angry",
  "unacceptable",
  "disgusting",
  "lawyer",
  "sue",
];

export async function checkEscalationRules(
  conversationId: string,
  messageContent: string,
  settings: {
    escalationSentimentThreshold: number;
    escalationKeywords: string[];
    maxAutoReplies: number;
  }
): Promise<EscalationResult> {
  // 1. Keyword check (user-configured)
  const contentLower = messageContent.toLowerCase();
  for (const keyword of settings.escalationKeywords) {
    if (keyword && contentLower.includes(keyword.toLowerCase())) {
      return {
        shouldEscalate: true,
        reason: `Keyword de escalación detectado: "${keyword}"`,
      };
    }
  }

  // 2. Sentiment heuristic (negative language detection)
  const negativeCount = NEGATIVE_WORDS.filter((w) =>
    contentLower.includes(w)
  ).length;
  if (negativeCount >= 2) {
    return {
      shouldEscalate: true,
      reason: `Sentimiento negativo detectado (${negativeCount} indicadores)`,
    };
  }

  // 3. Consecutive AI reply limit
  const recentMessages = await prisma.message.findMany({
    where: {
      conversationId,
      direction: "OUTBOUND",
    },
    orderBy: { timestamp: "desc" },
    take: settings.maxAutoReplies + 1,
    select: { isAiGenerated: true },
  });

  let consecutiveAiReplies = 0;
  for (const msg of recentMessages) {
    if (msg.isAiGenerated) {
      consecutiveAiReplies++;
    } else {
      break;
    }
  }

  if (consecutiveAiReplies >= settings.maxAutoReplies) {
    return {
      shouldEscalate: true,
      reason: `Límite de ${settings.maxAutoReplies} respuestas automáticas consecutivas alcanzado`,
    };
  }

  return { shouldEscalate: false, reason: null };
}

// --- Complexity analysis for SEMI_AUTO ---

function isSimpleMessage(content: string): boolean {
  const simplePatternsES = [
    /^hola\b/i,
    /^buenos?\s*(días|tardes|noches)/i,
    /^buenas\b/i,
    /^gracias\b/i,
    /^ok\b/i,
    /^vale\b/i,
    /^perfecto\b/i,
    /^entendido\b/i,
    /^de acuerdo\b/i,
    /\bhorario/i,
    /\babierto/i,
    /\bcerrado/i,
    /\bprecio/i,
    /\btarifa/i,
    /\bdirección/i,
    /\bdónde\s+está/i,
    /\bcómo\s+llegar/i,
    /\btorneo/i,
    /\bcompetición/i,
    /\breserva/i,
    /\btee\s*time/i,
    /\bgreen\s*fee/i,
  ];

  const simplePatternsEN = [
    /^hi\b/i,
    /^hello\b/i,
    /^hey\b/i,
    /^thanks\b/i,
    /^thank you\b/i,
    /\bhours?\b/i,
    /\bopen\b/i,
    /\bprice/i,
    /\brate/i,
    /\btournament/i,
    /\bbooking/i,
    /\btee\s*time/i,
  ];

  const allPatterns = [...simplePatternsES, ...simplePatternsEN];

  // Short messages (< 50 chars) with a simple pattern match
  if (content.length < 50 && allPatterns.some((p) => p.test(content))) {
    return true;
  }

  // Very short messages are typically simple
  if (content.length < 20) return true;

  return false;
}

// --- Main auto-reply trigger ---

export async function triggerAutoReply(
  conversationId: string,
  messageContent: string,
  playerId: string,
  inboundMessageId: string,
  playerPhone: string,
  messageType: string
): Promise<void> {
  // Only auto-reply to text messages
  if (messageType !== "TEXT") return;

  // Load settings
  const settings = await prisma.clubSettings.findUnique({
    where: { id: "default" },
  });
  if (!settings) return;

  // Check automation level
  if (settings.automationLevel === "MANUAL") return;

  // Demo mode: generate draft but never send via WhatsApp
  if (settings.demoMode) {
    try {
      const draft = await generateAiReply(conversationId);
      await prisma.message.update({
        where: { id: inboundMessageId },
        data: { aiDraft: draft },
      });
      console.log(`[AutoReply] DEMO MODE: Draft generated, not sent via WhatsApp`);
    } catch (err) {
      console.error("[AutoReply] DEMO MODE draft error:", err);
    }
    return;
  }

  // Check conversation bot status
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { isAiBotActive: true },
  });
  if (!conversation?.isAiBotActive) return;

  // Check silence hours
  if (isInSilenceHours(settings)) {
    console.log("[AutoReply] In silence hours, skipping");
    return;
  }

  // Check escalation rules
  const escalation = await checkEscalationRules(
    conversationId,
    messageContent,
    {
      escalationSentimentThreshold: settings.escalationSentimentThreshold,
      escalationKeywords: settings.escalationKeywords,
      maxAutoReplies: settings.maxAutoReplies,
    }
  );

  if (escalation.shouldEscalate) {
    console.log(`[AutoReply] Escalating: ${escalation.reason}`);
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { status: "PENDING" },
    });

    // Notify admins/managers about escalation
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      select: { firstName: true, lastName: true },
    });
    createNotificationForAllAdmins({
      type: "ESCALATION",
      title: "Conversacion escalada",
      body: `${player?.firstName || ""} ${player?.lastName || ""}: ${escalation.reason}`,
      link: "/inbox",
      data: { conversationId, playerId },
    }).catch((err) =>
      console.error("[AutoReply] Notification error:", err)
    );

    return;
  }

  // Branch by automation level
  switch (settings.automationLevel) {
    case "ASSISTED": {
      // Generate draft but don't send
      const draft = await generateAiReply(conversationId);
      await prisma.message.update({
        where: { id: inboundMessageId },
        data: { aiDraft: draft },
      });
      console.log(`[AutoReply] ASSISTED: Draft stored for message ${inboundMessageId}`);
      break;
    }

    case "SEMI_AUTO": {
      if (isSimpleMessage(messageContent)) {
        // Auto-send for simple messages
        await autoSendReply(conversationId, playerPhone);
        console.log(`[AutoReply] SEMI_AUTO: Auto-sent (simple message)`);
      } else {
        // Generate draft for complex messages
        const draft = await generateAiReply(conversationId);
        await prisma.message.update({
          where: { id: inboundMessageId },
          data: { aiDraft: draft },
        });
        console.log(`[AutoReply] SEMI_AUTO: Draft stored (complex message)`);
      }
      break;
    }

    case "FULL_AUTO": {
      await autoSendReply(conversationId, playerPhone);
      console.log(`[AutoReply] FULL_AUTO: Auto-sent reply`);
      break;
    }
  }
}

// --- Helper: Send auto-generated reply ---

async function autoSendReply(
  conversationId: string,
  playerPhone: string
): Promise<void> {
  const replyText = await generateAiReply(conversationId);
  if (!replyText) return;

  // Send via WhatsApp
  const { whatsappMessageId } = await sendTextMessage(playerPhone, replyText);

  // Create outbound message record
  await prisma.message.create({
    data: {
      conversationId,
      whatsappMessageId,
      direction: "OUTBOUND",
      type: "TEXT",
      content: replyText,
      status: "SENT",
      sentBy: "ai",
      isAiGenerated: true,
      timestamp: new Date(),
    },
  });

  // Update conversation
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageAt: new Date(),
      lastMessagePreview: replyText.substring(0, 255),
    },
  });
}

// --- Helper: Check silence hours ---

function isInSilenceHours(settings: {
  silenceHoursStart: string | null;
  silenceHoursEnd: string | null;
  silenceDays: string[];
  timezone: string | null;
}): boolean {
  if (!settings.silenceHoursStart || !settings.silenceHoursEnd) return false;

  const now = new Date();
  // Use timezone if available, otherwise use local
  const timeStr = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: settings.timezone || "Europe/Madrid",
  });

  const dayStr = now
    .toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: settings.timezone || "Europe/Madrid",
    })
    .toUpperCase();

  // Check if today is a silence day
  if (settings.silenceDays.includes(dayStr)) return true;

  // Check silence hours (handles overnight ranges like 22:00-08:00)
  const current = timeStr;
  const start = settings.silenceHoursStart;
  const end = settings.silenceHoursEnd;

  if (start <= end) {
    // Same day range (e.g., 08:00-17:00)
    return current >= start && current < end;
  } else {
    // Overnight range (e.g., 22:00-08:00)
    return current >= start || current < end;
  }
}
