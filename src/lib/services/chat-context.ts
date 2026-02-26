import { prisma } from "@/lib/prisma";

export interface ChatContext {
  club: {
    name: string;
    capacity: number;
    location: string;
    rateWeekday: number;
    rateWeekend: number;
  };
  players: {
    total: number;
    active: number;
    byEngagement: Record<string, number>;
    newThisMonth: number;
    topSpenders: Array<{ name: string; total: number; visits: number }>;
    recentlyInactive: number;
    roster: Array<{
      name: string;
      phone: string;
      email: string | null;
      engagement: string;
      handicap: number | null;
      totalSpent: number;
      visitCount: number;
      lastVisit: string | null;
      lastContact: string | null;
      daysSinceLastVisit: number | null;
      daysSinceLastContact: number | null;
      tags: string[];
      language: string;
      playTime: string | null;
      dayPref: string | null;
      createdAt: string;
    }>;
  };
  conversations: {
    total: number;
    open: number;
    pending: number;
    resolved: number;
    unreadCount: number;
    sentimentDistribution: Record<string, number>;
    avgResponseTime: string;
    recentConversations: Array<{
      playerName: string;
      preview: string;
      status: string;
      sentiment: string | null;
      date: string;
    }>;
  };
  campaigns: {
    total: number;
    active: number;
    totalSent: number;
    totalDelivered: number;
    totalRead: number;
    totalReplied: number;
    avgOpenRate: number;
    recentCampaigns: Array<{
      name: string;
      status: string;
      recipients: number;
      sent: number;
      read: number;
      date: string;
    }>;
  };
  tournaments: {
    total: number;
    upcoming: Array<{
      name: string;
      date: string;
      format: string;
      registrations: number;
      maxParticipants: number;
      status: string;
    }>;
    completed: number;
    totalRegistrations: number;
  };
  weather: {
    recentRecords: number;
    avgOccupancy: number | null;
    avgGolfScore: number | null;
    closedDays: number;
    predictionAccuracy: number | null;
    recentDays: Array<{
      date: string;
      golfScore: number;
      predictedOccupancy: number | null;
      actualOccupancy: number | null;
      isClosed: boolean;
    }>;
  };
  revenue: {
    totalConsumptions: number;
    totalRevenue: number;
    byCategory: Record<string, number>;
    avgPerPlayer: number;
    thisMonth: number;
    lastMonth: number;
  };
}

export async function fetchChatContext(): Promise<ChatContext> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date(now);
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  // Fetch all data in parallel
  const [
    settings,
    playerCount,
    activePlayers,
    engagementCounts,
    newPlayersThisMonth,
    topSpenders,
    inactivePlayers,
    allPlayers,
    playerSpending,
    conversationCounts,
    openConversations,
    sentimentCounts,
    recentConversations,
    campaignStats,
    recentCampaigns,
    tournaments,
    completedTournaments,
    totalRegistrations,
    weatherRecords,
    consumptionTotal,
    consumptionByCategory,
    consumptionThisMonth,
    consumptionLastMonth,
  ] = await Promise.all([
    // Settings
    prisma.clubSettings.findFirst(),

    // Players
    prisma.player.count(),
    prisma.player.count({ where: { isActive: true } }),
    prisma.player.groupBy({
      by: ["engagementLevel"],
      _count: true,
    }),
    prisma.player.count({
      where: { createdAt: { gte: startOfMonth } },
    }),
    prisma.$queryRaw`
      SELECT p."firstName", p."lastName",
        COALESCE(SUM(c.amount), 0)::float as total,
        COUNT(DISTINCT v.id)::int as visits
      FROM players p
      LEFT JOIN consumptions c ON c."playerId" = p.id
      LEFT JOIN visits v ON v."playerId" = p.id
      GROUP BY p.id, p."firstName", p."lastName"
      ORDER BY total DESC
      LIMIT 10
    ` as unknown as Array<{ firstName: string; lastName: string; total: number; visits: number }>,
    prisma.player.count({
      where: {
        isActive: true,
        lastContactAt: { lt: thirtyDaysAgo },
      },
    }),
    // Full player roster with details
    prisma.player.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: {
        tags: { select: { tag: true } },
        visits: { orderBy: { date: "desc" }, take: 1, select: { date: true } },
        _count: { select: { visits: true, consumptions: true, conversations: true } },
      },
    }),
    // Per-player spending totals
    prisma.$queryRaw`
      SELECT p.id,
        COALESCE(SUM(c.amount), 0)::float as total
      FROM players p
      LEFT JOIN consumptions c ON c."playerId" = p.id
      GROUP BY p.id
    ` as unknown as Array<{ id: string; total: number }>,

    // Conversations
    prisma.conversation.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.conversation.count({
      where: { status: "OPEN", unreadCount: { gt: 0 } },
    }),
    prisma.conversation.groupBy({
      by: ["currentSentiment"],
      _count: true,
      where: { currentSentiment: { not: null } },
    }),
    prisma.conversation.findMany({
      take: 10,
      orderBy: { lastMessageAt: "desc" },
      include: {
        player: { select: { firstName: true, lastName: true } },
      },
    }),

    // Campaigns
    prisma.campaign.aggregate({
      _count: true,
      _sum: {
        totalSent: true,
        totalDelivered: true,
        totalRead: true,
        totalReplied: true,
        totalRecipients: true,
      },
    }),
    prisma.campaign.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        name: true,
        status: true,
        totalRecipients: true,
        totalSent: true,
        totalRead: true,
        createdAt: true,
      },
    }),

    // Tournaments
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
    prisma.tournament.count({ where: { status: "COMPLETED" } }),
    prisma.tournamentRegistration.count(),

    // Weather (table may not exist yet if migration hasn't run)
    prisma.weatherDailyRecord.findMany({
      where: { date: { gte: thirtyDaysAgo } },
      orderBy: { date: "desc" },
      take: 30,
    }).catch(() => [] as any[]),

    // Revenue/Consumptions
    prisma.consumption.aggregate({
      _sum: { amount: true },
      _count: true,
    }),
    prisma.consumption.groupBy({
      by: ["category"],
      _sum: { amount: true },
    }),
    prisma.consumption.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.consumption.aggregate({
      where: {
        date: { gte: startOfLastMonth, lt: startOfMonth },
      },
      _sum: { amount: true },
    }),
  ]);

  // Build spending map
  const spendingMap = new Map<string, number>();
  playerSpending.forEach((s) => spendingMap.set(s.id, Number(s.total)));

  // Build player roster
  const roster = allPlayers.map((p: any) => {
    const lastVisitDate = p.visits?.[0]?.date ? new Date(p.visits[0].date) : null;
    const lastContactDate = p.lastContactAt ? new Date(p.lastContactAt) : null;
    const nowMs = Date.now();
    return {
      name: `${p.firstName} ${p.lastName}`,
      phone: p.phone,
      email: p.email,
      engagement: p.engagementLevel,
      handicap: p.handicap,
      totalSpent: spendingMap.get(p.id) || 0,
      visitCount: p._count?.visits || 0,
      lastVisit: lastVisitDate?.toISOString().split("T")[0] || null,
      lastContact: lastContactDate?.toISOString().split("T")[0] || null,
      daysSinceLastVisit: lastVisitDate
        ? Math.floor((nowMs - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24))
        : null,
      daysSinceLastContact: lastContactDate
        ? Math.floor((nowMs - lastContactDate.getTime()) / (1000 * 60 * 60 * 24))
        : null,
      tags: (p.tags || []).map((t: any) => t.tag),
      language: p.preferredLanguage,
      playTime: p.preferredPlayTime,
      dayPref: p.playDayPreference,
      createdAt: p.createdAt?.toISOString().split("T")[0],
    };
  });

  // Process engagement counts
  const byEngagement: Record<string, number> = {};
  engagementCounts.forEach((e) => {
    byEngagement[e.engagementLevel] = e._count;
  });

  // Process conversation counts
  const convByStatus: Record<string, number> = {};
  let totalConversations = 0;
  conversationCounts.forEach((c) => {
    convByStatus[c.status] = c._count;
    totalConversations += c._count;
  });

  // Process sentiment
  const sentimentDist: Record<string, number> = {};
  sentimentCounts.forEach((s) => {
    if (s.currentSentiment) {
      sentimentDist[s.currentSentiment] = s._count;
    }
  });

  // Process weather
  const weatherWithActual = weatherRecords.filter(
    (r) => r.actualOccupancy != null
  );
  const weatherWithPrediction = weatherRecords.filter(
    (r) => r.predictedOccupancy != null && r.actualOccupancy != null
  );
  const avgOccupancy =
    weatherWithActual.length > 0
      ? weatherWithActual.reduce((s, r) => s + (r.actualOccupancy || 0), 0) /
        weatherWithActual.length
      : null;
  const avgGolfScore =
    weatherRecords.length > 0
      ? weatherRecords.reduce((s, r) => s + r.golfScore, 0) /
        weatherRecords.length
      : null;
  const predictionAccuracy =
    weatherWithPrediction.length > 0
      ? 100 -
        weatherWithPrediction.reduce(
          (s, r) =>
            s + Math.abs((r.predictedOccupancy || 0) - (r.actualOccupancy || 0)),
          0
        ) /
          weatherWithPrediction.length
      : null;

  // Process consumptions by category
  const byCat: Record<string, number> = {};
  consumptionByCategory.forEach((c) => {
    byCat[c.category] = Number(c._sum.amount || 0);
  });

  const totalRev = Number(consumptionTotal._sum.amount || 0);

  return {
    club: {
      name: settings?.clubName || "Campo de Golf",
      capacity: settings?.fieldCapacity || 80,
      location: settings?.fieldName || "el club",
      rateWeekday: settings?.rateWeekday || 45,
      rateWeekend: settings?.rateWeekend || 65,
    },
    players: {
      total: playerCount,
      active: activePlayers,
      byEngagement,
      newThisMonth: newPlayersThisMonth,
      topSpenders: topSpenders.map((s) => ({
        name: `${s.firstName} ${s.lastName}`,
        total: Number(s.total),
        visits: Number(s.visits),
      })),
      recentlyInactive: inactivePlayers,
      roster,
    },
    conversations: {
      total: totalConversations,
      open: convByStatus["OPEN"] || 0,
      pending: convByStatus["PENDING"] || 0,
      resolved: convByStatus["RESOLVED"] || 0,
      unreadCount: openConversations,
      sentimentDistribution: sentimentDist,
      avgResponseTime: "—",
      recentConversations: recentConversations.map((c) => ({
        playerName: `${c.player.firstName} ${c.player.lastName}`,
        preview: c.lastMessagePreview || "",
        status: c.status,
        sentiment: c.currentSentiment,
        date: c.lastMessageAt?.toISOString() || "",
      })),
    },
    campaigns: {
      total: campaignStats._count || 0,
      active: 0,
      totalSent: campaignStats._sum.totalSent || 0,
      totalDelivered: campaignStats._sum.totalDelivered || 0,
      totalRead: campaignStats._sum.totalRead || 0,
      totalReplied: campaignStats._sum.totalReplied || 0,
      avgOpenRate:
        (campaignStats._sum.totalSent || 0) > 0
          ? Math.round(
              ((campaignStats._sum.totalRead || 0) /
                (campaignStats._sum.totalSent || 1)) *
                100
            )
          : 0,
      recentCampaigns: recentCampaigns.map((c) => ({
        name: c.name,
        status: c.status,
        recipients: c.totalRecipients,
        sent: c.totalSent,
        read: c.totalRead,
        date: c.createdAt.toISOString(),
      })),
    },
    tournaments: {
      total: tournaments.length + completedTournaments,
      upcoming: tournaments.map((t) => ({
        name: t.name,
        date: t.date.toISOString().split("T")[0],
        format: t.format,
        registrations: t._count.registrations,
        maxParticipants: t.maxParticipants,
        status: t.status,
      })),
      completed: completedTournaments,
      totalRegistrations,
    },
    weather: {
      recentRecords: weatherRecords.length,
      avgOccupancy: avgOccupancy ? Math.round(avgOccupancy) : null,
      avgGolfScore: avgGolfScore ? Math.round(avgGolfScore) : null,
      closedDays: weatherRecords.filter((r) => r.isClosed).length,
      predictionAccuracy: predictionAccuracy
        ? Math.round(predictionAccuracy * 10) / 10
        : null,
      recentDays: weatherRecords.slice(0, 7).map((r) => ({
        date: r.date.toISOString().split("T")[0],
        golfScore: r.golfScore,
        predictedOccupancy: r.predictedOccupancy,
        actualOccupancy: r.actualOccupancy,
        isClosed: r.isClosed,
      })),
    },
    revenue: {
      totalConsumptions: consumptionTotal._count || 0,
      totalRevenue: totalRev,
      byCategory: byCat,
      avgPerPlayer: playerCount > 0 ? Math.round(totalRev / playerCount) : 0,
      thisMonth: Number(consumptionThisMonth._sum.amount || 0),
      lastMonth: Number(consumptionLastMonth._sum.amount || 0),
    },
  };
}

export function buildSystemPrompt(context: ChatContext): string {
  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `Eres "Caddie AI", el asistente inteligente del sistema CRM "Caddie 24" para la gestión de campos de golf. Hoy es ${today}.

Tu rol es ayudar al administrador del club a entender y gestionar su negocio usando los datos del sistema. Responde siempre en español, de forma concisa y profesional. Usa emojis cuando sea apropiado para hacer la conversación más amigable.

## DATOS ACTUALES DEL CLUB

### Información del Club
- Nombre: ${context.club.name}
- Campo: ${context.club.location}
- Capacidad diaria: ${context.club.capacity} jugadores
- Tarifas: ${context.club.rateWeekday}€ (L-V) / ${context.club.rateWeekend}€ (S-D)

### Jugadores (${context.players.total} total, ${context.players.active} activos)
- Distribución engagement: ${JSON.stringify(context.players.byEngagement)}
- Nuevos este mes: ${context.players.newThisMonth}
- Inactivos (>30 días sin contacto): ${context.players.recentlyInactive}

### Listado completo de jugadores
${context.players.roster.map((p) => `- **${p.name}** | Engagement: ${p.engagement} | Gasto total: ${p.totalSpent.toFixed(0)}€ | Visitas: ${p.visitCount} | Última visita: ${p.lastVisit || "nunca"} (${p.daysSinceLastVisit != null ? p.daysSinceLastVisit + " días" : "—"}) | Último contacto: ${p.lastContact || "nunca"} (${p.daysSinceLastContact != null ? p.daysSinceLastContact + " días" : "—"}) | Handicap: ${p.handicap ?? "—"} | Idioma: ${p.language} | Horario: ${p.playTime || "—"} | Días: ${p.dayPref || "—"} | Tags: ${p.tags.length > 0 ? p.tags.join(", ") : "ninguno"} | Tel: ${p.phone} | Email: ${p.email || "—"} | Alta: ${p.createdAt}`).join("\n")}

### Conversaciones WhatsApp (${context.conversations.total} total)
- Abiertas: ${context.conversations.open}
- Pendientes: ${context.conversations.pending}
- Resueltas: ${context.conversations.resolved}
- Sin leer: ${context.conversations.unreadCount}
- Sentimiento: ${JSON.stringify(context.conversations.sentimentDistribution)}
- Recientes: ${context.conversations.recentConversations.slice(0, 5).map((c) => `${c.playerName} (${c.status}${c.sentiment ? ", " + c.sentiment : ""}): "${c.preview?.substring(0, 60) || ""}"`).join("; ")}

### Campañas (${context.campaigns.total} total)
- Mensajes enviados: ${context.campaigns.totalSent}
- Entregados: ${context.campaigns.totalDelivered}
- Leídos: ${context.campaigns.totalRead} (${context.campaigns.avgOpenRate}% tasa apertura)
- Respondidos: ${context.campaigns.totalReplied}
- Recientes: ${context.campaigns.recentCampaigns.map((c) => `"${c.name}" (${c.status}): ${c.sent} enviados, ${c.read} leídos`).join("; ")}

### Torneos (${context.tournaments.total} total, ${context.tournaments.completed} completados)
- Inscripciones totales: ${context.tournaments.totalRegistrations}
- Próximos: ${context.tournaments.upcoming.length > 0 ? context.tournaments.upcoming.map((t) => `"${t.name}" ${t.date} (${t.format}, ${t.registrations}/${t.maxParticipants} inscritos, ${t.status})`).join("; ") : "Ninguno programado"}

### Meteorología y Ocupación (últimos 30 días: ${context.weather.recentRecords} registros)
- Ocupación media real: ${context.weather.avgOccupancy != null ? context.weather.avgOccupancy + "%" : "Sin datos"}
- Golf Score medio: ${context.weather.avgGolfScore ?? "Sin datos"}
- Días cerrados: ${context.weather.closedDays}
- Precisión predicciones: ${context.weather.predictionAccuracy != null ? context.weather.predictionAccuracy + "%" : "Sin datos suficientes"}
- Últimos días: ${context.weather.recentDays.map((d) => `${d.date}: Score ${d.golfScore}${d.actualOccupancy != null ? ", Ocupación " + d.actualOccupancy + "%" : ""}${d.isClosed ? " (CERRADO)" : ""}`).join("; ")}

### Revenue y Consumos
- Total: ${context.revenue.totalRevenue.toLocaleString("es-ES")}€ (${context.revenue.totalConsumptions} transacciones)
- Este mes: ${context.revenue.thisMonth.toLocaleString("es-ES")}€
- Mes anterior: ${context.revenue.lastMonth.toLocaleString("es-ES")}€
- Media por jugador: ${context.revenue.avgPerPlayer}€
- Por categoría: ${Object.entries(context.revenue.byCategory).map(([cat, amount]) => `${cat}: ${Number(amount).toLocaleString("es-ES")}€`).join(", ")}

## INSTRUCCIONES

1. Responde basándote SOLO en los datos proporcionados. Si no tienes datos para responder, dilo claramente.
2. Cuando el usuario pregunte por tendencias, analiza los datos disponibles y ofrece insights.
3. Si detectas problemas o oportunidades, menciónalos proactivamente.
4. Puedes sugerir acciones concretas (enviar campañas, contactar jugadores, etc.).
5. Formatea las respuestas de forma clara usando listas y negritas cuando sea útil.
6. Si el sistema no tiene datos suficientes (ej: sistema recién instalado), sugiere cómo mejorar la recopilación de datos.
7. Sé breve y directo. Evita respuestas excesivamente largas.`;
}
