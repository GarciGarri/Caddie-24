import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import OpenAI from "openai";
import { fetchChatContext, buildSystemPrompt } from "@/lib/services/chat-context";
import { isDemoMode, getDemoChatContext } from "@/lib/services/demo-data";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return new Response(JSON.stringify({ error: "No autenticado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error:
          "OPENAI_API_KEY no configurada. Añade tu clave de API en las variables de entorno.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Se requiere al menos un mensaje" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check demo mode and fetch appropriate context
    const demoActive = await isDemoMode();
    const context = demoActive ? buildDemoContext() : await fetchChatContext();
    const systemPrompt = buildSystemPrompt(context, demoActive);

    const openai = new OpenAI({ apiKey });

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
      max_tokens: 1500,
      temperature: 0.7,
      stream: true,
    });

    // Convert OpenAI stream to ReadableStream for the client
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);

    if (error?.status === 401) {
      return new Response(
        JSON.stringify({ error: "API key de OpenAI inválida" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Error al procesar el mensaje" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Build a ChatContext from demo data
function buildDemoContext() {
  const demoCtx = getDemoChatContext();
  return {
    club: {
      name: demoCtx.clubInfo.clubName,
      capacity: demoCtx.clubInfo.fieldCapacity,
      location: `${demoCtx.clubInfo.fieldName} (${demoCtx.clubInfo.fieldLatitude}, ${demoCtx.clubInfo.fieldLongitude})`,
      rateWeekday: demoCtx.clubInfo.rateWeekday,
      rateWeekend: demoCtx.clubInfo.rateWeekend,
    },
    players: {
      total: demoCtx.players.total,
      active: demoCtx.players.total,
      byEngagement: demoCtx.players.engagementDistribution,
      newThisMonth: 12,
      topSpenders: demoCtx.players.topSpenders.map((s: any) => ({
        name: s.name,
        total: s.totalSpent,
        visits: s.visits,
      })),
      recentlyInactive: 8,
      roster: demoCtx.players.recentPlayers.map((p: any) => ({
        name: p.name,
        phone: "+34612345XXX",
        email: null,
        engagement: p.engagement,
        handicap: p.handicap,
        totalSpent: Math.floor(Math.random() * 2000) + 500,
        visitCount: p.visits,
        lastVisit: null,
        lastContact: null,
        daysSinceLastVisit: null,
        daysSinceLastContact: null,
        tags: [],
        language: "ES",
        playTime: null,
        dayPref: null,
        createdAt: new Date().toISOString(),
      })),
    },
    conversations: {
      total: demoCtx.conversations.total,
      open: demoCtx.conversations.open,
      pending: demoCtx.conversations.pending,
      resolved: demoCtx.conversations.resolved,
      unreadCount: 5,
      sentimentDistribution: { POSITIVE: 4, NEUTRAL: 3, NEGATIVE: 1 },
      avgResponseTime: "2 minutos",
      recentConversations: demoCtx.conversations.recent.map((c: any) => ({
        playerName: c.player,
        preview: c.lastMessage,
        status: c.status,
        sentiment: c.sentiment,
        date: new Date().toISOString(),
      })),
    },
    campaigns: {
      total: demoCtx.campaigns.total,
      active: 1,
      totalSent: demoCtx.campaigns.totalSent,
      totalDelivered: demoCtx.campaigns.totalDelivered,
      totalRead: demoCtx.campaigns.totalRead,
      totalReplied: 40,
      avgOpenRate: 78,
      recentCampaigns: demoCtx.campaigns.recent.map((c: any) => ({
        name: c.name,
        status: c.status,
        recipients: c.sent,
        sent: c.sent,
        read: c.read,
        date: new Date().toISOString(),
      })),
    },
    tournaments: {
      total: 5,
      upcoming: demoCtx.tournaments.upcoming.map((t: any) => ({
        name: t.name,
        date: t.date,
        format: t.format,
        registrations: t.registered,
        maxParticipants: t.maxParticipants,
        status: t.status,
      })),
      completed: 1,
      totalRegistrations: 141,
    },
    weather: {
      recentRecords: 14,
      avgOccupancy: 62,
      avgGolfScore: 78,
      closedDays: 1,
      predictionAccuracy: 85,
      recentDays: demoCtx.weather.forecast.map((d: any) => ({
        date: d.date,
        golfScore: d.golfScore,
        predictedOccupancy: d.demandLevel === "ALTA" ? 85 : 55,
        actualOccupancy: null,
        isClosed: d.demandLevel === "CERRADO",
      })),
    },
    revenue: demoCtx.revenue,
  };
}
