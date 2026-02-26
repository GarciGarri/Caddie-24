import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST /api/players/[id]/ai-suggestions — Generate AI communication suggestions
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return new Response(JSON.stringify({ error: "No autenticado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY no configurada" },
        { status: 500 }
      );
    }

    // Fetch player with all relevant data
    const player = await prisma.player.findUnique({
      where: { id: params.id },
      include: {
        tags: true,
        visits: {
          orderBy: { date: "desc" },
          take: 10,
        },
        consumptions: {
          orderBy: { date: "desc" },
          take: 10,
        },
        conversations: {
          orderBy: { lastMessageAt: "desc" },
          take: 3,
          include: {
            messages: {
              orderBy: { timestamp: "desc" },
              take: 5,
              select: { content: true, direction: true, timestamp: true },
            },
          },
        },
        _count: {
          select: { visits: true, consumptions: true, conversations: true },
        },
      },
    });

    if (!player) {
      return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 });
    }

    // Cast to any for easier access to included relations
    const p = player as any;

    // Calculate derived data
    const totalSpending = await prisma.consumption.aggregate({
      where: { playerId: params.id },
      _sum: { amount: true },
    });

    const lastVisit = p.visits?.[0];
    const daysSinceLastVisit = lastVisit
      ? Math.floor((Date.now() - new Date(lastVisit.date).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const visitCount = p._count?.visits || 0;
    const avgSpendingPerVisit = visitCount > 0
      ? Number(totalSpending._sum.amount || 0) / visitCount
      : 0;

    // Build player profile for AI
    const playerProfile = {
      nombre: `${p.firstName} ${p.lastName}`,
      idioma: p.preferredLanguage,
      engagement: p.engagementLevel,
      handicap: p.handicap,
      totalVisitas: visitCount,
      totalGasto: Number(totalSpending._sum.amount || 0).toFixed(2),
      gastoMedioPorVisita: avgSpendingPerVisit.toFixed(2),
      diasDesdeUltimaVisita: daysSinceLastVisit,
      ultimaVisita: lastVisit ? new Date(lastVisit.date).toLocaleDateString("es-ES") : "nunca",
      horarioPreferido: p.preferredPlayTime || "desconocido",
      diasPreferidos: p.playDayPreference || "desconocido",
      estiloJuego: p.playStylePreference || "desconocido",
      cumpleanos: p.birthday ? new Date(p.birthday).toLocaleDateString("es-ES") : null,
      tags: p.tags?.map((t: any) => t.tag).join(", ") || "ninguno",
      categoriaConsumo: p.consumptions?.length > 0
        ? Array.from(new Set(p.consumptions.map((c: any) => c.category))).join(", ")
        : "sin datos",
      notas: p.notes || "sin notas",
      conversacionesRecientes: p.conversations?.length || 0,
      ultimosMensajes: (p.conversations || []).flatMap((c: any) =>
        (c.messages || []).map((m: any) => `[${m.direction}] ${m.content?.substring(0, 80) || ""}`)
      ).slice(0, 5),
    };

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres un experto en CRM y marketing para campos de golf de lujo. Analiza el perfil de un jugador y genera sugerencias de comunicacion personalizadas.

CONTEXTO: Eres el asistente IA del CRM "Caddie 24" para un campo de golf. Tu objetivo es maximizar la retencion, el gasto medio y la satisfaccion del jugador.

RESPONDE EN JSON con exactamente esta estructura (sin markdown, sin backticks, solo JSON puro):
{
  "resumen": "Analisis breve del perfil del jugador (2-3 frases)",
  "riesgo": "BAJO|MEDIO|ALTO",
  "razonRiesgo": "Explicacion breve del nivel de riesgo",
  "oportunidades": ["oportunidad 1", "oportunidad 2", "oportunidad 3"],
  "sugerencias": [
    {
      "tipo": "whatsapp|email|llamada",
      "prioridad": "alta|media|baja",
      "asunto": "titulo corto de la accion",
      "mensaje": "texto sugerido del mensaje (WhatsApp-friendly, con emojis si es whatsapp)",
      "momento": "cuando enviar (ej: 'manana a las 10h', 'viernes por la tarde', 'inmediatamente')",
      "razon": "por que esta comunicacion es relevante"
    }
  ]
}

Genera entre 3 y 5 sugerencias de comunicacion. Cada una debe ser:
- Personalizada al perfil del jugador
- Accionable e inmediata
- Con un mensaje listo para copiar y enviar
- Contextualizada al momento (si no viene hace tiempo, si es VIP, si gasta mucho en restaurante, etc.)

TIPOS DE SUGERENCIAS SEGUN PERFIL:
- Si no viene hace >30 dias: reactivacion con oferta
- Si es VIP/HIGH: invitacion exclusiva, trato preferente
- Si gasta mucho en restaurante: evento gastronomico
- Si handicap mejora: felicitacion + torneo
- Si cumpleanos proximo: felicitacion personalizada
- Si es nuevo: bienvenida + oferta primera vez
- Si engagement bajo: encuesta de satisfaccion
- Si juega en grupo: ofertas grupales
- Si juega fines de semana: promos de entre semana para diversificar`
        },
        {
          role: "user",
          content: `Analiza este jugador y genera sugerencias de comunicacion:\n\n${JSON.stringify(playerProfile, null, 2)}`
        },
      ],
      max_tokens: 1200,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content?.trim() || "";

    // Parse JSON response
    let suggestions;
    try {
      // Remove potential markdown backticks
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      suggestions = JSON.parse(cleanContent);
    } catch {
      console.error("Failed to parse AI response:", content);
      return NextResponse.json(
        { error: "Error al procesar respuesta de IA" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...suggestions,
      playerName: `${p.firstName} ${p.lastName}`,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    if (error?.status === 401) {
      return NextResponse.json(
        { error: "API key de OpenAI invalida" },
        { status: 401 }
      );
    }
    console.error("Error generating AI suggestions:", error);
    return NextResponse.json(
      { error: "Error al generar sugerencias" },
      { status: 500 }
    );
  }
}
