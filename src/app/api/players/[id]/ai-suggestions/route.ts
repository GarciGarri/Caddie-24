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

    const now = new Date();

    // Fetch player + context data in parallel
    const [player, totalSpending, settings, upcomingTournaments, playerRegistrations, weatherForecast] = await Promise.all([
      // Player with all relevant data
      prisma.player.findUnique({
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
      }),
      // Total spending
      prisma.consumption.aggregate({
        where: { playerId: params.id },
        _sum: { amount: true },
      }),
      // Club settings
      prisma.clubSettings.findFirst(),
      // Upcoming tournaments (next 30 days)
      prisma.tournament.findMany({
        where: {
          date: { gte: now },
          status: { in: ["DRAFT", "OPEN", "CLOSED", "IN_PROGRESS"] },
          isActive: true,
        },
        orderBy: { date: "asc" },
        take: 5,
        include: {
          _count: { select: { registrations: true } },
        },
      }),
      // Player's tournament registrations
      prisma.tournamentRegistration.findMany({
        where: {
          playerId: params.id,
          status: { in: ["REGISTERED", "CONFIRMED", "WAITLIST"] },
        },
        include: {
          tournament: { select: { name: true, date: true, status: true } },
        },
      }),
      // Weather forecast (next 7 days)
      prisma.weatherDailyRecord.findMany({
        where: {
          date: { gte: now },
        },
        orderBy: { date: "asc" },
        take: 7,
      }).catch(() => [] as any[]),
    ]);

    if (!player) {
      return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 });
    }

    // Cast to any for easier access to included relations
    const p = player as any;

    const lastVisit = p.visits?.[0];
    const daysSinceLastVisit = lastVisit
      ? Math.floor((Date.now() - new Date(lastVisit.date).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const visitCount = p._count?.visits || 0;
    const avgSpendingPerVisit = visitCount > 0
      ? Number(totalSpending._sum.amount || 0) / visitCount
      : 0;

    // Check if birthday is within next 30 days
    let birthdayInDays: number | null = null;
    if (p.birthday) {
      const bday = new Date(p.birthday);
      const thisYearBday = new Date(now.getFullYear(), bday.getMonth(), bday.getDate());
      if (thisYearBday < now) {
        thisYearBday.setFullYear(thisYearBday.getFullYear() + 1);
      }
      birthdayInDays = Math.floor((thisYearBday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Build enriched player profile for AI
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
      cumpleaños: p.birthday ? new Date(p.birthday).toLocaleDateString("es-ES") : null,
      cumpleañosEnDias: birthdayInDays,
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

    // Build tournament context
    const torneosProximos = upcomingTournaments.map((t) => ({
      nombre: t.name,
      fecha: t.date.toLocaleDateString("es-ES"),
      formato: t.format,
      plazas: `${t._count.registrations}/${t.maxParticipants}`,
      precio: t.entryFee ? `${Number(t.entryFee)}€` : "Gratis",
      estado: t.status,
    }));

    const inscripcionesJugador = playerRegistrations.map((r: any) => ({
      torneo: r.tournament.name,
      fecha: r.tournament.date.toLocaleDateString("es-ES"),
      estado: r.status,
    }));

    // Build weather context
    const weatherCodeDescriptions: Record<number, string> = {
      0: "Despejado", 1: "Mayormente despejado", 2: "Parcialmente nublado", 3: "Nublado",
      45: "Niebla", 48: "Niebla helada",
      51: "Llovizna ligera", 53: "Llovizna moderada", 55: "Llovizna densa",
      61: "Lluvia ligera", 63: "Lluvia moderada", 65: "Lluvia fuerte",
      71: "Nieve ligera", 73: "Nieve moderada", 75: "Nieve fuerte",
      80: "Chubascos ligeros", 81: "Chubascos moderados", 82: "Chubascos fuertes",
      95: "Tormenta", 96: "Tormenta con granizo ligero", 99: "Tormenta con granizo fuerte",
    };

    const previsionMeteo = weatherForecast.map((w: any) => ({
      fecha: w.date.toLocaleDateString("es-ES"),
      golfScore: w.golfScore,
      tempMax: w.tempMax != null ? `${w.tempMax}°C` : null,
      tempMin: w.tempMin != null ? `${w.tempMin}°C` : null,
      condicion: w.weatherCode != null ? (weatherCodeDescriptions[w.weatherCode] || `Código ${w.weatherCode}`) : null,
      ocupacionPrevista: w.predictedOccupancy != null ? `${w.predictedOccupancy}%` : null,
    }));

    // Club info
    const clubInfo = {
      nombre: settings?.clubName || "Campo de Golf",
      campo: settings?.fieldName || "el club",
      tarifaEntresemana: settings?.rateWeekday ? `${settings.rateWeekday}€` : null,
      tarifaFinDeSemana: settings?.rateWeekend ? `${settings.rateWeekend}€` : null,
    };

    const today = now.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres un experto en CRM y marketing para campos de golf de lujo. Analiza el perfil de un jugador y genera sugerencias de comunicación personalizadas.

CONTEXTO: Eres el asistente IA del CRM "Caddie 24" para "${clubInfo.nombre}" (${clubInfo.campo}). Hoy es ${today}. Tu objetivo es maximizar la retención, el gasto medio y la satisfacción del jugador.${clubInfo.tarifaEntresemana ? `\nTarifas: ${clubInfo.tarifaEntresemana} (L-V) / ${clubInfo.tarifaFinDeSemana} (S-D)` : ""}

RESPONDE EN JSON con exactamente esta estructura (sin markdown, sin backticks, solo JSON puro):
{
  "resumen": "Análisis breve del perfil del jugador (2-3 frases)",
  "riesgo": "BAJO|MEDIO|ALTO",
  "razonRiesgo": "Explicación breve del nivel de riesgo",
  "oportunidades": ["oportunidad 1", "oportunidad 2", "oportunidad 3"],
  "sugerencias": [
    {
      "tipo": "whatsapp|email|llamada",
      "prioridad": "alta|media|baja",
      "asunto": "título corto de la acción",
      "mensaje": "texto sugerido del mensaje (WhatsApp-friendly, con emojis si es whatsapp)",
      "momento": "cuando enviar (ej: 'mañana a las 10h', 'viernes por la tarde', 'inmediatamente')",
      "razon": "por qué esta comunicación es relevante"
    }
  ]
}

Genera entre 3 y 5 sugerencias de comunicación. Cada una debe ser:
- Personalizada al perfil del jugador
- Accionable e inmediata
- Con un mensaje listo para copiar y enviar
- Contextualizada al momento actual (fecha, meteorología, torneos próximos)
- Usa el nombre de pila del jugador en los mensajes

TIPOS DE SUGERENCIAS SEGÚN PERFIL:
- Si no viene hace >30 días: reactivación con oferta
- Si es VIP/HIGH: invitación exclusiva, trato preferente
- Si gasta mucho en restaurante: evento gastronómico
- Si handicap mejora: felicitación + torneo
- Si cumpleaños próximo (cumpleañosEnDias < 30): felicitación personalizada
- Si es nuevo: bienvenida + oferta primera vez
- Si engagement bajo: encuesta de satisfacción
- Si juega en grupo: ofertas grupales
- Si juega fines de semana: promos de entre semana para diversificar
- Si hay torneo próximo y NO está inscrito: invitación al torneo con detalles reales
- Si el tiempo es bueno próximamente: aprovechar para contactar y sugerir partida
- Si hay conversación reciente: hacer seguimiento del tema tratado

IMPORTANTE:
- Menciona torneos REALES con sus nombres y fechas exactos (si los hay)
- Menciona previsión meteorológica REAL cuando sea relevante
- Si el jugador ya está inscrito en un torneo, no le sugieras inscribirse de nuevo
- Adapta el tono al idioma preferido del jugador`
        },
        {
          role: "user",
          content: `Analiza este jugador y genera sugerencias de comunicación:

## Perfil del Jugador
${JSON.stringify(playerProfile, null, 2)}

## Torneos Próximos
${torneosProximos.length > 0 ? JSON.stringify(torneosProximos, null, 2) : "No hay torneos programados"}

## Inscripciones del Jugador
${inscripcionesJugador.length > 0 ? JSON.stringify(inscripcionesJugador, null, 2) : "No está inscrito en ningún torneo"}

## Previsión Meteorológica (próximos días)
${previsionMeteo.length > 0 ? JSON.stringify(previsionMeteo, null, 2) : "Sin datos meteorológicos disponibles"}`
        },
      ],
      max_tokens: 1500,
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
        { error: "API key de OpenAI inválida" },
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
