import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ============================================================
  // 1. Create admin user
  // ============================================================
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@caddie24.com" },
    update: {},
    create: {
      email: "admin@caddie24.com",
      name: "Administrador",
      hashedPassword,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create a manager
  const manager = await prisma.user.upsert({
    where: { email: "manager@caddie24.com" },
    update: {},
    create: {
      email: "manager@caddie24.com",
      name: "Director de Golf",
      hashedPassword: await bcrypt.hash("manager123", 12),
      role: "MANAGER",
    },
  });
  console.log("✅ Manager user created:", manager.email);

  // Create an agent
  const agent = await prisma.user.upsert({
    where: { email: "agent@caddie24.com" },
    update: {},
    create: {
      email: "agent@caddie24.com",
      name: "Agente de Atención",
      hashedPassword: await bcrypt.hash("agent123", 12),
      role: "AGENT",
    },
  });
  console.log("✅ Agent user created:", agent.email);

  // ============================================================
  // 2. Create club settings
  // ============================================================
  await prisma.clubSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      clubName: "Real Club de Golf Caddie 24",
      timezone: "Europe/Madrid",
      defaultLanguage: "ES",
      currency: "EUR",
      voiceTone:
        "Cercano y profesional. Usamos un tono cálido pero respetuoso, como el de un caddie experimentado que conoce a cada jugador por su nombre.",
      voiceValues:
        "Excelencia en el servicio, tradición golfista, innovación tecnológica, respeto por el entorno.",
      voiceStyle:
        "Conversacional pero cuidado. Tuteo con jugadores habituales, usted con nuevos contactos. Emojis con moderación (máximo 1-2 por mensaje).",
      silenceHoursStart: "22:00",
      silenceHoursEnd: "08:00",
      automationLevel: "ASSISTED",
      maxAutoReplies: 5,
      escalationSentimentThreshold: 0.3,
      bookingConflictHours: 24,
    },
  });
  console.log("✅ Club settings created");

  // ============================================================
  // 3. Create demo players
  // ============================================================
  const players = [
    {
      firstName: "Carlos",
      lastName: "García",
      phone: "+34612345678",
      email: "carlos.garcia@email.com",
      handicap: 12.4,
      birthday: new Date("1985-03-15"),
      preferredLanguage: "ES" as const,
      preferredPlayTime: "EARLY_MORNING" as const,
      playDayPreference: "WEEKEND" as const,
      playStylePreference: "DUO" as const,
      engagementLevel: "HIGH" as const,
      source: "manual",
    },
    {
      firstName: "James",
      lastName: "Smith",
      phone: "+447911123456",
      email: "james.smith@email.com",
      handicap: 8.2,
      birthday: new Date("1978-07-22"),
      preferredLanguage: "EN" as const,
      preferredPlayTime: "MORNING" as const,
      playDayPreference: "BOTH" as const,
      playStylePreference: "GROUP" as const,
      engagementLevel: "VIP" as const,
      source: "whatsapp",
    },
    {
      firstName: "Hans",
      lastName: "Müller",
      phone: "+491711234567",
      email: "hans.muller@email.com",
      handicap: 18.6,
      birthday: new Date("1965-11-08"),
      preferredLanguage: "DE" as const,
      preferredPlayTime: "AFTERNOON" as const,
      playDayPreference: "WEEKDAY" as const,
      playStylePreference: "SOLO" as const,
      engagementLevel: "MEDIUM" as const,
      source: "import",
    },
    {
      firstName: "María",
      lastName: "López",
      phone: "+34698765432",
      email: "maria.lopez@email.com",
      handicap: 22.1,
      birthday: new Date("1992-01-30"),
      preferredLanguage: "ES" as const,
      preferredPlayTime: "MORNING" as const,
      playDayPreference: "WEEKEND" as const,
      playStylePreference: "GROUP" as const,
      engagementLevel: "NEW" as const,
      source: "manual",
    },
    {
      firstName: "Sophie",
      lastName: "Dupont",
      phone: "+33612345678",
      email: "sophie.dupont@email.com",
      handicap: 15.3,
      birthday: new Date("1988-05-12"),
      preferredLanguage: "FR" as const,
      preferredPlayTime: "MORNING" as const,
      playDayPreference: "BOTH" as const,
      playStylePreference: "DUO" as const,
      engagementLevel: "HIGH" as const,
      source: "whatsapp",
    },
    {
      firstName: "Antonio",
      lastName: "Fernández",
      phone: "+34655443322",
      email: "antonio.fernandez@email.com",
      handicap: 5.8,
      birthday: new Date("1970-09-18"),
      preferredLanguage: "ES" as const,
      preferredPlayTime: "EARLY_MORNING" as const,
      playDayPreference: "BOTH" as const,
      playStylePreference: "SOLO" as const,
      engagementLevel: "VIP" as const,
      source: "manual",
    },
  ];

  for (const playerData of players) {
    const player = await prisma.player.upsert({
      where: { phone: playerData.phone },
      update: {},
      create: playerData,
    });
    console.log(`✅ Player created: ${player.firstName} ${player.lastName}`);

    // Add tags for each player
    const tags = getTagsForPlayer(playerData);
    for (const tag of tags) {
      await prisma.playerTag.upsert({
        where: {
          playerId_tag: { playerId: player.id, tag: tag.tag },
        },
        update: {},
        create: {
          playerId: player.id,
          tag: tag.tag,
          source: tag.source as any,
          confidence: tag.confidence,
        },
      });
    }

    // Add some visits
    const visits = getVisitsForPlayer(player.id, playerData);
    for (const visit of visits) {
      await prisma.visit.create({ data: visit });
    }

    // Add some consumption
    const consumptions = getConsumptionsForPlayer(player.id, playerData);
    for (const consumption of consumptions) {
      await prisma.consumption.create({ data: consumption });
    }
  }

  // ============================================================
  // 4. Create demo conversations
  // ============================================================
  const carlos = await prisma.player.findUnique({
    where: { phone: "+34612345678" },
  });
  const james = await prisma.player.findUnique({
    where: { phone: "+447911123456" },
  });

  if (carlos) {
    const conv = await prisma.conversation.create({
      data: {
        playerId: carlos.id,
        status: "OPEN",
        isAiBotActive: true,
        lastMessageAt: new Date(),
        lastMessagePreview:
          "Hola, ¿tienen disponibilidad para mañana a las 9?",
        unreadCount: 2,
        currentSentiment: "POSITIVE",
      },
    });

    await prisma.message.createMany({
      data: [
        {
          conversationId: conv.id,
          direction: "INBOUND",
          content: "Hola, buenas tardes!",
          status: "READ",
          timestamp: new Date("2026-02-25T14:30:00"),
          sentiment: "POSITIVE",
          intent: "greeting",
          language: "ES",
        },
        {
          conversationId: conv.id,
          direction: "INBOUND",
          content:
            "¿Tienen disponibilidad para mañana a las 9 de la mañana? Seríamos 2 jugadores.",
          status: "READ",
          timestamp: new Date("2026-02-25T14:31:00"),
          sentiment: "POSITIVE",
          intent: "booking",
          language: "ES",
        },
        {
          conversationId: conv.id,
          direction: "OUTBOUND",
          content:
            "¡Hola Carlos! 👋 Sí, tenemos disponibilidad mañana a las 9:00 para 2 jugadores. ¿Quieres que te reserve?",
          status: "READ",
          isAiGenerated: true,
          timestamp: new Date("2026-02-25T14:32:00"),
          language: "ES",
        },
        {
          conversationId: conv.id,
          direction: "INBOUND",
          content:
            "Perfecto, sí por favor. ¿Cuál es el precio del green fee?",
          status: "DELIVERED",
          timestamp: new Date("2026-02-25T14:35:00"),
          sentiment: "POSITIVE",
          intent: "pricing",
          language: "ES",
        },
      ],
    });
    console.log("✅ Conversation created for Carlos");
  }

  if (james) {
    const conv = await prisma.conversation.create({
      data: {
        playerId: james.id,
        status: "OPEN",
        isAiBotActive: true,
        lastMessageAt: new Date(Date.now() - 15 * 60 * 1000),
        lastMessagePreview:
          "I would like to book a tee time for Saturday morning",
        unreadCount: 1,
        currentSentiment: "NEUTRAL",
      },
    });

    await prisma.message.createMany({
      data: [
        {
          conversationId: conv.id,
          direction: "INBOUND",
          content:
            "Hello, I would like to book a tee time for Saturday morning. Preferably around 10am for 4 players.",
          status: "READ",
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          sentiment: "NEUTRAL",
          intent: "booking",
          language: "EN",
        },
      ],
    });
    console.log("✅ Conversation created for James");
  }

  // ============================================================
  // 5. Create WhatsApp templates
  // ============================================================
  const templateData = [
    {
      name: "bienvenida_nuevo",
      language: "ES" as const,
      category: "MARKETING",
      status: "APPROVED" as const,
      components: {
        body: {
          text: "¡Hola {{1}}! 👋 Bienvenido a {{2}}. Estamos encantados de tenerte como nuevo jugador. ¿Te gustaría conocer nuestras ofertas especiales para nuevos miembros?",
        },
      },
    },
    {
      name: "promo_weekend",
      language: "ES" as const,
      category: "MARKETING",
      status: "APPROVED" as const,
      components: {
        body: {
          text: "¡Hola {{1}}! 🏌️ Este fin de semana tenemos una oferta especial: green fee 18 hoyos + buggy por solo {{2}}€. ¡Reserva antes del viernes! Responde SÍ para reservar.",
        },
      },
    },
    {
      name: "invitacion_torneo",
      language: "ES" as const,
      category: "MARKETING",
      status: "APPROVED" as const,
      components: {
        body: {
          text: "🏆 {{1}}, estás invitado al {{2}}. Fecha: {{3}}. Inscripción abierta hasta el {{4}}. Plazas limitadas. ¿Quieres apuntarte?",
        },
      },
    },
    {
      name: "recordatorio_reserva",
      language: "ES" as const,
      category: "UTILITY",
      status: "APPROVED" as const,
      components: {
        body: {
          text: "📅 Recordatorio: {{1}}, tienes reserva mañana {{2}} a las {{3}}. Si necesitas modificar o cancelar, responde a este mensaje. ¡Nos vemos en el campo!",
        },
      },
    },
  ];

  for (const tpl of templateData) {
    await prisma.whatsAppTemplate.upsert({
      where: { name: tpl.name },
      update: {},
      create: tpl,
    });
  }
  console.log("✅ WhatsApp templates created:", templateData.length);

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📋 Login credentials:");
  console.log("   Admin:   admin@caddie24.com / admin123");
  console.log("   Manager: manager@caddie24.com / manager123");
  console.log("   Agent:   agent@caddie24.com / agent123");
}

function getTagsForPlayer(player: (typeof players)[number]) {
  const tags: { tag: string; source: string; confidence: number }[] = [];

  if (
    player.preferredPlayTime === "EARLY_MORNING" ||
    player.preferredPlayTime === "MORNING"
  ) {
    tags.push({ tag: "madrugador", source: "AI", confidence: 0.9 });
  }
  if (player.engagementLevel === "VIP") {
    tags.push({ tag: "alto_valor", source: "AI", confidence: 0.95 });
  }
  if (player.playDayPreference === "WEEKEND") {
    tags.push({ tag: "fin_de_semana", source: "AI", confidence: 0.85 });
  }
  if (player.handicap && player.handicap < 10) {
    tags.push({ tag: "jugador_torneo", source: "AI", confidence: 0.88 });
  }
  if (player.handicap && player.handicap > 20) {
    tags.push({ tag: "principiante", source: "AI", confidence: 0.82 });
  }
  if (player.preferredLanguage !== "ES") {
    tags.push({ tag: "internacional", source: "AI", confidence: 0.99 });
  }

  return tags;
}

function getVisitsForPlayer(playerId: string, player: any) {
  const visits = [];
  const now = new Date();
  const count =
    player.engagementLevel === "VIP"
      ? 8
      : player.engagementLevel === "HIGH"
      ? 5
      : 2;

  for (let i = 0; i < count; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 7 - Math.floor(Math.random() * 3));
    visits.push({
      playerId,
      date,
      courseType: Math.random() > 0.3 ? "18-holes" : "9-holes",
      companions: [],
      duration: Math.random() > 0.5 ? 240 : 150,
    });
  }
  return visits;
}

function getConsumptionsForPlayer(playerId: string, player: any) {
  const consumptions: any[] = [];
  const now = new Date();

  // Green fees
  consumptions.push({
    playerId,
    date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    category: "GREEN_FEE",
    description: "Green fee 18 hoyos",
    amount: 65.0,
    currency: "EUR",
  });

  if (player.engagementLevel === "VIP" || player.engagementLevel === "HIGH") {
    consumptions.push({
      playerId,
      date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      category: "RESTAURANT",
      description: "Comida en restaurante del club",
      amount: 32.5,
      currency: "EUR",
    });
    consumptions.push({
      playerId,
      date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      category: "SHOP",
      description: "Guante de golf",
      amount: 25.0,
      currency: "EUR",
    });
  }

  if (player.engagementLevel === "VIP") {
    consumptions.push({
      playerId,
      date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      category: "SUBSCRIPTION",
      description: "Abono anual premium",
      amount: 2400.0,
      currency: "EUR",
    });
  }

  return consumptions;
}

const players = [
  {
    firstName: "Carlos",
    lastName: "García",
    phone: "+34612345678",
    handicap: 12.4,
    preferredPlayTime: "EARLY_MORNING",
    playDayPreference: "WEEKEND",
    engagementLevel: "HIGH",
    preferredLanguage: "ES",
  },
  {
    firstName: "James",
    lastName: "Smith",
    phone: "+447911123456",
    handicap: 8.2,
    preferredPlayTime: "MORNING",
    playDayPreference: "BOTH",
    engagementLevel: "VIP",
    preferredLanguage: "EN",
  },
  {
    firstName: "Hans",
    lastName: "Müller",
    phone: "+491711234567",
    handicap: 18.6,
    preferredPlayTime: "AFTERNOON",
    playDayPreference: "WEEKDAY",
    engagementLevel: "MEDIUM",
    preferredLanguage: "DE",
  },
  {
    firstName: "María",
    lastName: "López",
    phone: "+34698765432",
    handicap: 22.1,
    preferredPlayTime: "MORNING",
    playDayPreference: "WEEKEND",
    engagementLevel: "NEW",
    preferredLanguage: "ES",
  },
  {
    firstName: "Sophie",
    lastName: "Dupont",
    phone: "+33612345678",
    handicap: 15.3,
    preferredPlayTime: "MORNING",
    playDayPreference: "BOTH",
    engagementLevel: "HIGH",
    preferredLanguage: "FR",
  },
  {
    firstName: "Antonio",
    lastName: "Fernández",
    phone: "+34655443322",
    handicap: 5.8,
    preferredPlayTime: "EARLY_MORNING",
    playDayPreference: "BOTH",
    engagementLevel: "VIP",
    preferredLanguage: "ES",
  },
];

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
