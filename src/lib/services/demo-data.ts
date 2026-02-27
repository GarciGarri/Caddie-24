import { prisma } from "@/lib/prisma";

// ============================================================
// DEMO MODE HELPER
// ============================================================

export async function isDemoMode(): Promise<boolean> {
  try {
    const settings = await prisma.clubSettings.findUnique({
      where: { id: "default" },
      select: { demoMode: true },
    });
    return settings?.demoMode === true;
  } catch {
    return false;
  }
}

// ============================================================
// DEMO PLAYERS (20 jugadores españoles)
// ============================================================

const DEMO_PLAYERS = [
  { id: "demo-p01", firstName: "Carlos", lastName: "Garcia Martinez", phone: "+34612345001", email: "carlos.garcia@email.com", handicap: 12.4, engagementLevel: "VIP", preferredLanguage: "ES", tags: [{ id: "t1", tag: "socio_premium", playerId: "demo-p01" }], _count: { visits: 45, conversations: 8 }, createdAt: "2024-06-15T10:00:00Z" },
  { id: "demo-p02", firstName: "Maria", lastName: "Lopez Fernandez", phone: "+34612345002", email: "maria.lopez@email.com", handicap: 18.6, engagementLevel: "HIGH", preferredLanguage: "ES", tags: [{ id: "t2", tag: "jugadora_matutina", playerId: "demo-p02" }], _count: { visits: 32, conversations: 5 }, createdAt: "2024-08-20T10:00:00Z" },
  { id: "demo-p03", firstName: "Alejandro", lastName: "Ruiz Torres", phone: "+34612345003", email: "alejandro.ruiz@email.com", handicap: 5.2, engagementLevel: "VIP", preferredLanguage: "ES", tags: [{ id: "t3", tag: "competidor", playerId: "demo-p03" }, { id: "t3b", tag: "socio_premium", playerId: "demo-p03" }], _count: { visits: 78, conversations: 12 }, createdAt: "2023-03-10T10:00:00Z" },
  { id: "demo-p04", firstName: "Isabel", lastName: "Moreno Diaz", phone: "+34612345004", email: "isabel.moreno@email.com", handicap: 22.1, engagementLevel: "MEDIUM", preferredLanguage: "ES", tags: [{ id: "t4", tag: "principiante", playerId: "demo-p04" }], _count: { visits: 12, conversations: 3 }, createdAt: "2025-01-05T10:00:00Z" },
  { id: "demo-p05", firstName: "Fernando", lastName: "Navarro Gil", phone: "+34612345005", email: "fernando.navarro@email.com", handicap: 8.8, engagementLevel: "HIGH", preferredLanguage: "ES", tags: [{ id: "t5", tag: "apasionado_torneos", playerId: "demo-p05" }], _count: { visits: 56, conversations: 9 }, createdAt: "2024-02-18T10:00:00Z" },
  { id: "demo-p06", firstName: "Ana Belen", lastName: "Santos Rivas", phone: "+34612345006", email: "anabelen.santos@email.com", handicap: 15.3, engagementLevel: "MEDIUM", preferredLanguage: "ES", tags: [{ id: "t6", tag: "jugadora_fin_semana", playerId: "demo-p06" }], _count: { visits: 18, conversations: 4 }, createdAt: "2025-03-22T10:00:00Z" },
  { id: "demo-p07", firstName: "Pablo", lastName: "Jimenez Ortega", phone: "+34612345007", email: "pablo.jimenez@email.com", handicap: 28.4, engagementLevel: "NEW", preferredLanguage: "ES", tags: [{ id: "t7", tag: "principiante", playerId: "demo-p07" }], _count: { visits: 3, conversations: 1 }, createdAt: "2026-02-10T10:00:00Z" },
  { id: "demo-p08", firstName: "Elena", lastName: "Rodriguez Blanco", phone: "+34612345008", email: "elena.rodriguez@email.com", handicap: 10.1, engagementLevel: "VIP", preferredLanguage: "ES", tags: [{ id: "t8", tag: "socio_premium", playerId: "demo-p08" }, { id: "t8b", tag: "comprador_frecuente", playerId: "demo-p08" }], _count: { visits: 64, conversations: 7 }, createdAt: "2023-11-08T10:00:00Z" },
  { id: "demo-p09", firstName: "Miguel Angel", lastName: "Herrera Castillo", phone: "+34612345009", email: "miguelangel.herrera@email.com", handicap: 3.7, engagementLevel: "VIP", preferredLanguage: "ES", tags: [{ id: "t9", tag: "competidor", playerId: "demo-p09" }, { id: "t9b", tag: "socio_premium", playerId: "demo-p09" }], _count: { visits: 92, conversations: 15 }, createdAt: "2022-09-01T10:00:00Z" },
  { id: "demo-p10", firstName: "Carmen", lastName: "Delgado Vega", phone: "+34612345010", email: "carmen.delgado@email.com", handicap: 19.9, engagementLevel: "LOW", preferredLanguage: "ES", tags: [], _count: { visits: 6, conversations: 2 }, createdAt: "2025-06-14T10:00:00Z" },
  { id: "demo-p11", firstName: "Javier", lastName: "Martin Perez", phone: "+34612345011", email: "javier.martin@email.com", handicap: 14.2, engagementLevel: "HIGH", preferredLanguage: "ES", tags: [{ id: "t11", tag: "apasionado_torneos", playerId: "demo-p11" }], _count: { visits: 38, conversations: 6 }, createdAt: "2024-04-30T10:00:00Z" },
  { id: "demo-p12", firstName: "Lucia", lastName: "Hernandez Ruiz", phone: "+34612345012", email: "lucia.hernandez@email.com", handicap: 24.5, engagementLevel: "MEDIUM", preferredLanguage: "ES", tags: [{ id: "t12", tag: "principiante", playerId: "demo-p12" }], _count: { visits: 10, conversations: 2 }, createdAt: "2025-09-18T10:00:00Z" },
  { id: "demo-p13", firstName: "David", lastName: "Sanchez Lopez", phone: "+34612345013", email: "david.sanchez@email.com", handicap: 7.6, engagementLevel: "HIGH", preferredLanguage: "ES", tags: [{ id: "t13", tag: "competidor", playerId: "demo-p13" }], _count: { visits: 51, conversations: 8 }, createdAt: "2024-01-12T10:00:00Z" },
  { id: "demo-p14", firstName: "Patricia", lastName: "Gomez Alvarez", phone: "+34612345014", email: "patricia.gomez@email.com", handicap: 16.8, engagementLevel: "MEDIUM", preferredLanguage: "ES", tags: [{ id: "t14", tag: "jugadora_matutina", playerId: "demo-p14" }], _count: { visits: 22, conversations: 4 }, createdAt: "2025-05-07T10:00:00Z" },
  { id: "demo-p15", firstName: "Roberto", lastName: "Diaz Fernandez", phone: "+34612345015", email: "roberto.diaz@email.com", handicap: 11.3, engagementLevel: "HIGH", preferredLanguage: "ES", tags: [{ id: "t15", tag: "socio_premium", playerId: "demo-p15" }], _count: { visits: 41, conversations: 7 }, createdAt: "2024-07-25T10:00:00Z" },
  { id: "demo-p16", firstName: "James", lastName: "Smith", phone: "+44712345001", email: "james.smith@email.com", handicap: 9.4, engagementLevel: "MEDIUM", preferredLanguage: "EN", tags: [{ id: "t16", tag: "visitante_extranjero", playerId: "demo-p16" }], _count: { visits: 8, conversations: 3 }, createdAt: "2025-11-20T10:00:00Z" },
  { id: "demo-p17", firstName: "Hans", lastName: "Mueller", phone: "+49171345001", email: "hans.mueller@email.com", handicap: 13.7, engagementLevel: "LOW", preferredLanguage: "DE", tags: [{ id: "t17", tag: "visitante_extranjero", playerId: "demo-p17" }], _count: { visits: 4, conversations: 1 }, createdAt: "2026-01-08T10:00:00Z" },
  { id: "demo-p18", firstName: "Rosa", lastName: "Alonso Campos", phone: "+34612345018", email: "rosa.alonso@email.com", handicap: 20.6, engagementLevel: "NEW", preferredLanguage: "ES", tags: [{ id: "t18", tag: "principiante", playerId: "demo-p18" }], _count: { visits: 2, conversations: 1 }, createdAt: "2026-02-20T10:00:00Z" },
  { id: "demo-p19", firstName: "Antonio", lastName: "Romero Gil", phone: "+34612345019", email: "antonio.romero@email.com", handicap: 6.1, engagementLevel: "VIP", preferredLanguage: "ES", tags: [{ id: "t19", tag: "socio_premium", playerId: "demo-p19" }, { id: "t19b", tag: "competidor", playerId: "demo-p19" }], _count: { visits: 85, conversations: 11 }, createdAt: "2023-05-15T10:00:00Z" },
  { id: "demo-p20", firstName: "Laura", lastName: "Torres Medina", phone: "+34612345020", email: "laura.torres@email.com", handicap: 17.2, engagementLevel: "MEDIUM", preferredLanguage: "ES", tags: [{ id: "t20", tag: "jugadora_fin_semana", playerId: "demo-p20" }], _count: { visits: 15, conversations: 3 }, createdAt: "2025-08-03T10:00:00Z" },
].map((p) => ({
  ...p,
  isActive: true,
  avatarUrl: null,
  birthday: null,
  notes: null,
  source: "whatsapp",
  updatedAt: p.createdAt,
}));

// ============================================================
// DEMO TOURNAMENTS (5)
// ============================================================

const DEMO_TOURNAMENTS = [
  {
    id: "demo-t01",
    name: "Torneo de Primavera 2026",
    description: "Gran torneo de apertura de temporada. Stableford individual con premios en todas las categorías.",
    date: "2026-04-15T08:00:00Z",
    teeTime: "08:30",
    format: "STABLEFORD",
    handicapSystem: "EGA",
    maxParticipants: 48,
    entryFee: 35,
    totalPrize: 2000,
    status: "OPEN",
    isActive: true,
    sponsors: ["Titleist", "Bar El Hoyo 19"],
    preferredChannel: "whatsapp",
    cancellationPolicy: "Cancelación gratuita hasta 48h antes del torneo",
    categories: [
      { id: "demo-tc01", name: "Primera", type: "HANDICAP", handicapMin: 0, handicapMax: 12, gender: null, maxPlayers: 16, prizeAmount: 800, tournamentId: "demo-t01" },
      { id: "demo-tc02", name: "Segunda", type: "HANDICAP", handicapMin: 12.1, handicapMax: 24, gender: null, maxPlayers: 16, prizeAmount: 600, tournamentId: "demo-t01" },
      { id: "demo-tc03", name: "Tercera", type: "HANDICAP", handicapMin: 24.1, handicapMax: 54, gender: null, maxPlayers: 16, prizeAmount: 400, tournamentId: "demo-t01" },
    ],
    _count: { registrations: 32, results: 0 },
    createdAt: "2026-02-01T10:00:00Z",
    updatedAt: "2026-02-15T10:00:00Z",
  },
  {
    id: "demo-t02",
    name: "Copa del Presidente",
    description: "Competición anual medal play. El trofeo más prestigioso del club.",
    date: "2026-05-20T07:30:00Z",
    teeTime: "08:00",
    format: "MEDAL",
    handicapSystem: "EGA",
    maxParticipants: 60,
    entryFee: 50,
    totalPrize: 3500,
    status: "OPEN",
    isActive: true,
    sponsors: ["Callaway", "Banco Santander"],
    preferredChannel: "whatsapp",
    cancellationPolicy: null,
    categories: [
      { id: "demo-tc04", name: "Scratch", type: "HANDICAP", handicapMin: 0, handicapMax: 10, gender: null, maxPlayers: 20, prizeAmount: 1500, tournamentId: "demo-t02" },
      { id: "demo-tc05", name: "Handicap", type: "HANDICAP", handicapMin: 10.1, handicapMax: 36, gender: null, maxPlayers: 40, prizeAmount: 1500, tournamentId: "demo-t02" },
    ],
    _count: { registrations: 45, results: 0 },
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-02-20T10:00:00Z",
  },
  {
    id: "demo-t03",
    name: "Campeonato de Parejas",
    description: "Torneo best ball por parejas. Forma tu equipo y compite por grandes premios.",
    date: "2026-06-10T08:00:00Z",
    teeTime: "09:00",
    format: "BEST_BALL",
    handicapSystem: "EGA",
    maxParticipants: 40,
    entryFee: 60,
    totalPrize: 2500,
    status: "DRAFT",
    isActive: true,
    sponsors: ["TaylorMade"],
    preferredChannel: "whatsapp",
    cancellationPolicy: null,
    categories: [],
    _count: { registrations: 12, results: 0 },
    createdAt: "2026-02-10T10:00:00Z",
    updatedAt: "2026-02-10T10:00:00Z",
  },
  {
    id: "demo-t04",
    name: "Torneo Nocturno de Verano",
    description: "Scramble por equipos de 4 con cena y fiesta posterior. El evento social del año.",
    date: "2026-07-18T18:00:00Z",
    teeTime: "18:30",
    format: "SCRAMBLE",
    handicapSystem: "EGA",
    maxParticipants: 36,
    entryFee: 80,
    totalPrize: 1000,
    status: "DRAFT",
    isActive: true,
    sponsors: ["Mahou", "Bar El Hoyo 19"],
    preferredChannel: "whatsapp",
    cancellationPolicy: null,
    categories: [],
    _count: { registrations: 0, results: 0 },
    createdAt: "2026-02-25T10:00:00Z",
    updatedAt: "2026-02-25T10:00:00Z",
  },
  {
    id: "demo-t05",
    name: "Memorial Don Alfonso",
    description: "Torneo homenaje al fundador del club. Stableford con premios especiales.",
    date: "2026-02-15T08:00:00Z",
    teeTime: "08:30",
    format: "STABLEFORD",
    handicapSystem: "EGA",
    maxParticipants: 52,
    entryFee: 30,
    totalPrize: 1800,
    status: "COMPLETED",
    isActive: true,
    sponsors: ["Ping", "Iberdrola"],
    preferredChannel: "whatsapp",
    cancellationPolicy: null,
    categories: [
      { id: "demo-tc06", name: "Caballeros", type: "GENDER", handicapMin: null, handicapMax: null, gender: "MALE", maxPlayers: 36, prizeAmount: 1000, tournamentId: "demo-t05" },
      { id: "demo-tc07", name: "Damas", type: "GENDER", handicapMin: null, handicapMax: null, gender: "FEMALE", maxPlayers: 16, prizeAmount: 800, tournamentId: "demo-t05" },
    ],
    _count: { registrations: 52, results: 48 },
    createdAt: "2025-12-01T10:00:00Z",
    updatedAt: "2026-02-16T10:00:00Z",
  },
];

// ============================================================
// DEMO CAMPAIGNS (4)
// ============================================================

const DEMO_CAMPAIGNS = [
  {
    id: "demo-c01",
    name: "Bienvenida Nuevos Socios - Marzo",
    description: "Mensaje de bienvenida personalizado para los nuevos socios del mes de marzo",
    templateName: "bienvenida_nuevo_socio",
    segmentQuery: { engagementLevel: "NEW" },
    status: "COMPLETED",
    totalRecipients: 28,
    totalSent: 28,
    totalDelivered: 25,
    totalRead: 18,
    totalFailed: 3,
    totalReplied: 8,
    createdBy: { name: "Admin Demo" },
    createdById: "demo-user",
    _count: { recipients: 28 },
    scheduledAt: "2026-02-01T09:00:00Z",
    completedAt: "2026-02-01T09:15:00Z",
    createdAt: "2026-01-28T14:00:00Z",
    updatedAt: "2026-02-01T09:15:00Z",
  },
  {
    id: "demo-c02",
    name: "Promoción Green Fee Primavera",
    description: "Oferta especial de green fee para la temporada de primavera: 20% descuento entre semana",
    templateName: "promocion_green_fee",
    segmentQuery: { engagementLevel: { in: ["MEDIUM", "LOW"] } },
    status: "DRAFT",
    totalRecipients: 0,
    totalSent: 0,
    totalDelivered: 0,
    totalRead: 0,
    totalFailed: 0,
    totalReplied: 0,
    createdBy: { name: "Admin Demo" },
    createdById: "demo-user",
    _count: { recipients: 0 },
    scheduledAt: null,
    completedAt: null,
    createdAt: "2026-02-25T11:00:00Z",
    updatedAt: "2026-02-25T11:00:00Z",
  },
  {
    id: "demo-c03",
    name: "Recordatorio Torneo Primavera",
    description: "Recordatorio de inscripción para el Torneo de Primavera 2026 con fecha límite",
    templateName: "recordatorio_torneo",
    segmentQuery: { engagementLevel: { in: ["VIP", "HIGH", "MEDIUM"] } },
    status: "COMPLETED",
    totalRecipients: 45,
    totalSent: 45,
    totalDelivered: 43,
    totalRead: 38,
    totalFailed: 2,
    totalReplied: 12,
    createdBy: { name: "Admin Demo" },
    createdById: "demo-user",
    _count: { recipients: 45 },
    scheduledAt: "2026-02-20T10:00:00Z",
    completedAt: "2026-02-20T10:20:00Z",
    createdAt: "2026-02-18T16:00:00Z",
    updatedAt: "2026-02-20T10:20:00Z",
  },
  {
    id: "demo-c04",
    name: "Encuesta Satisfacción Q1 2026",
    description: "Encuesta trimestral de satisfacción para todos los socios activos",
    templateName: "encuesta_satisfaccion",
    segmentQuery: {},
    status: "SENDING",
    totalRecipients: 120,
    totalSent: 80,
    totalDelivered: 72,
    totalRead: 45,
    totalFailed: 5,
    totalReplied: 20,
    createdBy: { name: "Admin Demo" },
    createdById: "demo-user",
    _count: { recipients: 120 },
    scheduledAt: "2026-02-27T08:00:00Z",
    completedAt: null,
    createdAt: "2026-02-26T15:00:00Z",
    updatedAt: "2026-02-27T12:00:00Z",
  },
];

// ============================================================
// DEMO CONVERSATIONS (8) con mensajes
// ============================================================

const now = new Date();
const h = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 3600000).toISOString();
const m = (minsAgo: number) => new Date(now.getTime() - minsAgo * 60000).toISOString();

const DEMO_CONVERSATIONS = [
  {
    id: "demo-conv01",
    playerId: "demo-p01",
    player: { id: "demo-p01", firstName: "Carlos", lastName: "Garcia Martinez", phone: "+34612345001", avatarUrl: null, engagementLevel: "VIP" },
    status: "OPEN",
    lastMessageAt: m(5),
    lastMessagePreview: "Perfecto, entonces reservo para las 9:00 del sábado",
    unreadCount: 1,
    currentSentiment: "POSITIVE",
    isAiBotActive: true,
    assignedTo: null,
    assignedToId: null,
    createdAt: h(48),
    updatedAt: m(5),
  },
  {
    id: "demo-conv02",
    playerId: "demo-p02",
    player: { id: "demo-p02", firstName: "Maria", lastName: "Lopez Fernandez", phone: "+34612345002", avatarUrl: null, engagementLevel: "HIGH" },
    status: "OPEN",
    lastMessageAt: m(30),
    lastMessagePreview: "Me gustaría inscribirme en el Torneo de Primavera",
    unreadCount: 1,
    currentSentiment: "POSITIVE",
    isAiBotActive: true,
    assignedTo: null,
    assignedToId: null,
    createdAt: h(72),
    updatedAt: m(30),
  },
  {
    id: "demo-conv03",
    playerId: "demo-p05",
    player: { id: "demo-p05", firstName: "Fernando", lastName: "Navarro Gil", phone: "+34612345005", avatarUrl: null, engagementLevel: "HIGH" },
    status: "PENDING",
    lastMessageAt: h(2),
    lastMessagePreview: "No estoy nada contento con el estado del green del hoyo 7",
    unreadCount: 2,
    currentSentiment: "NEGATIVE",
    isAiBotActive: false,
    assignedTo: { id: "demo-user", name: "Admin Demo" },
    assignedToId: "demo-user",
    createdAt: h(96),
    updatedAt: h(2),
  },
  {
    id: "demo-conv04",
    playerId: "demo-p07",
    player: { id: "demo-p07", firstName: "Pablo", lastName: "Jimenez Ortega", phone: "+34612345007", avatarUrl: null, engagementLevel: "NEW" },
    status: "OPEN",
    lastMessageAt: h(1),
    lastMessagePreview: "Hola, soy nuevo en el club. Cómo puedo reservar un tee time?",
    unreadCount: 1,
    currentSentiment: "NEUTRAL",
    isAiBotActive: true,
    assignedTo: null,
    assignedToId: null,
    createdAt: h(1),
    updatedAt: h(1),
  },
  {
    id: "demo-conv05",
    playerId: "demo-p09",
    player: { id: "demo-p09", firstName: "Miguel Angel", lastName: "Herrera Castillo", phone: "+34612345009", avatarUrl: null, engagementLevel: "VIP" },
    status: "RESOLVED",
    lastMessageAt: h(24),
    lastMessagePreview: "Gracias por la información. Nos vemos en el torneo!",
    unreadCount: 0,
    currentSentiment: "POSITIVE",
    isAiBotActive: true,
    assignedTo: null,
    assignedToId: null,
    createdAt: h(168),
    updatedAt: h(24),
  },
  {
    id: "demo-conv06",
    playerId: "demo-p16",
    player: { id: "demo-p16", firstName: "James", lastName: "Smith", phone: "+44712345001", avatarUrl: null, engagementLevel: "MEDIUM" },
    status: "OPEN",
    lastMessageAt: h(3),
    lastMessagePreview: "I would like to book a tee time for Saturday morning",
    unreadCount: 1,
    currentSentiment: "NEUTRAL",
    isAiBotActive: true,
    assignedTo: null,
    assignedToId: null,
    createdAt: h(48),
    updatedAt: h(3),
  },
  {
    id: "demo-conv07",
    playerId: "demo-p08",
    player: { id: "demo-p08", firstName: "Elena", lastName: "Rodriguez Blanco", phone: "+34612345008", avatarUrl: null, engagementLevel: "VIP" },
    status: "RESOLVED",
    lastMessageAt: h(48),
    lastMessagePreview: "Perfecto, muchas gracias por todo!",
    unreadCount: 0,
    currentSentiment: "POSITIVE",
    isAiBotActive: true,
    assignedTo: null,
    assignedToId: null,
    createdAt: h(120),
    updatedAt: h(48),
  },
  {
    id: "demo-conv08",
    playerId: "demo-p11",
    player: { id: "demo-p11", firstName: "Javier", lastName: "Martin Perez", phone: "+34612345011", avatarUrl: null, engagementLevel: "HIGH" },
    status: "OPEN",
    lastMessageAt: m(45),
    lastMessagePreview: "Puedo cambiar mi horario de clase a las 17:00?",
    unreadCount: 1,
    currentSentiment: "NEUTRAL",
    isAiBotActive: true,
    assignedTo: null,
    assignedToId: null,
    createdAt: h(72),
    updatedAt: m(45),
  },
];

// ============================================================
// DEMO MESSAGES per conversation
// ============================================================

type DemoMessage = {
  id: string;
  conversationId: string;
  whatsappMessageId: string;
  direction: "INBOUND" | "OUTBOUND";
  type: string;
  content: string;
  status: string;
  isAiGenerated: boolean;
  timestamp: string;
  mediaUrl: null;
  templateName: null;
  aiDraft: null;
  sentBy: null | string;
  deliveredAt: null | string;
  readAt: null | string;
};

const DEMO_MESSAGES: Record<string, DemoMessage[]> = {
  "demo-conv01": [
    { id: "dm01-1", conversationId: "demo-conv01", whatsappMessageId: "wam01-1", direction: "INBOUND", type: "TEXT", content: "Hola, buenos dias! Quería preguntar por disponibilidad para el sabado", status: "READ", isAiGenerated: false, timestamp: h(48), mediaUrl: null, templateName: null, aiDraft: null, sentBy: null, deliveredAt: null, readAt: null },
    { id: "dm01-2", conversationId: "demo-conv01", whatsappMessageId: "wam01-2", direction: "OUTBOUND", type: "TEXT", content: "Hola Carlos! Claro, el sabado tenemos disponibilidad a las 8:00, 9:00, 10:30 y 12:00. Qué horario te viene mejor?", status: "READ", isAiGenerated: true, timestamp: h(47.9), mediaUrl: null, templateName: null, aiDraft: null, sentBy: null, deliveredAt: h(47.9), readAt: h(47) },
    { id: "dm01-3", conversationId: "demo-conv01", whatsappMessageId: "wam01-3", direction: "INBOUND", type: "TEXT", content: "A las 9:00 estaria perfecto. Somos 3 jugadores", status: "READ", isAiGenerated: false, timestamp: h(46), mediaUrl: null, templateName: null, aiDraft: null, sentBy: null, deliveredAt: null, readAt: null },
    { id: "dm01-4", conversationId: "demo-conv01", whatsappMessageId: "wam01-4", direction: "OUTBOUND", type: "TEXT", content: "Perfecto! Te reservo para las 9:00 del sábado, 3 jugadores. El green fee es de 45 euros por persona entre semana y 65 euros fin de semana. Necesitas alquilar buggy o carro?", status: "READ", isAiGenerated: true, timestamp: h(45.9), mediaUrl: null, templateName: null, aiDraft: null, sentBy: null, deliveredAt: h(45.9), readAt: h(45) },
    { id: "dm01-5", conversationId: "demo-conv01", whatsappMessageId: "wam01-5", direction: "INBOUND", type: "TEXT", content: "Perfecto, entonces reservo para las 9:00 del sábado", status: "DELIVERED", isAiGenerated: false, timestamp: m(5), mediaUrl: null, templateName: null, aiDraft: null, sentBy: null, deliveredAt: null, readAt: null },
  ],
  "demo-conv02": [
    { id: "dm02-1", conversationId: "demo-conv02", whatsappMessageId: "wam02-1", direction: "INBOUND", type: "TEXT", content: "Hola! He visto que hay un torneo en abril. Qué hay que hacer para apuntarse?", status: "READ", isAiGenerated: false, timestamp: h(72), mediaUrl: null, templateName: null, aiDraft: null, sentBy: null, deliveredAt: null, readAt: null },
    { id: "dm02-2", conversationId: "demo-conv02", whatsappMessageId: "wam02-2", direction: "OUTBOUND", type: "TEXT", content: "Hola Maria! Si, el Torneo de Primavera 2026 es el 15 de abril. Es un Stableford individual con inscripción de 35 euros. Hay premios en 3 categorías. Quieres que te inscriba?", status: "READ", isAiGenerated: true, timestamp: h(71.9), mediaUrl: null, templateName: null, aiDraft: null, sentBy: null, deliveredAt: h(71.9), readAt: h(71) },
    { id: "dm02-3", conversationId: "demo-conv02", whatsappMessageId: "wam02-3", direction: "INBOUND", type: "TEXT", content: "Me gustaría inscribirme en el Torneo de Primavera", status: "DELIVERED", isAiGenerated: false, timestamp: m(30), mediaUrl: null, templateName: null, aiDraft: null, sentBy: null, deliveredAt: null, readAt: null },
  ],
  "demo-conv03": [
    { id: "dm03-1", conversationId: "demo-conv03", whatsappMessageId: "wam03-1", direction: "INBOUND", type: "TEXT", content: "Buenos días", status: "READ", isAiGenerated: false, timestamp: h(6), mediaUrl: null, templateName: null, aiDraft: null, sentBy: null, deliveredAt: null, readAt: null },
    { id: "dm03-2", conversationId: "demo-conv03", whatsappMessageId: "wam03-2", direction: "OUTBOUND", type: "TEXT", content: "Hola Fernando! Buenos días. En que puedo ayudarte?", status: "READ", isAiGenerated: true, timestamp: h(5.9), mediaUrl: null, templateName: null, aiDraft: null, sentBy: null, deliveredAt: h(5.9), readAt: h(5) },
    { id: "dm03-3", conversationId: "demo-conv03", whatsappMessageId: "wam03-3", direction: "INBOUND", type: "TEXT", content: "Mira, llevo varias semanas jugando y el green del hoyo 7 está fatal. Tiene calvas por todos lados.", status: "READ", isAiGenerated: false, timestamp: h(4), mediaUrl: null, templateName: null, aiDraft: null, sentBy: null, deliveredAt: null, readAt: null },
    { id: "dm03-4", conversationId: "demo-conv03", whatsappMessageId: "wam03-4", direction: "INBOUND", type: "TEXT", content: "No estoy nada contento con el estado del green del hoyo 7", status: "DELIVERED", isAiGenerated: false, timestamp: h(2), mediaUrl: null, templateName: null, aiDraft: null, sentBy: null, deliveredAt: null, readAt: null },
  ],
  "demo-conv04": [
    { id: "dm04-1", conversationId: "demo-conv04", whatsappMessageId: "wam04-1", direction: "INBOUND", type: "TEXT", content: "Hola, soy nuevo en el club. Cómo puedo reservar un tee time?", status: "DELIVERED", isAiGenerated: false, timestamp: h(1), mediaUrl: null, templateName: null, aiDraft: null, sentBy: null, deliveredAt: null, readAt: null },
  ],
  "demo-conv05": [
    { id: "dm05-1", conversationId: "demo-conv05", whatsappMessageId: "wam05-1", direction: "INBOUND", type: "TEXT", content: "Miguel Angel por aquí. Quería saber los premios del Memorial Don Alfonso", status: "READ", isAiGenerated: false, timestamp: h(50), mediaUrl: null, templateName: null, aiDraft: null, sentBy: null, deliveredAt: null, readAt: null },
    { id: "dm05-2", conversationId: "demo-conv05", whatsappMessageId: "wam05-2", direction: "OUTBOUND", type: "TEXT", content: "Hola Miguel Angel! El Memorial tiene un prize pool total de 1.800 euros: 1.000 euros para Caballeros y 800 euros para Damas. Además hay premios especiales al drive más largo y approach más cercano.", status: "READ", isAiGenerated: true, timestamp: h(49.9), mediaUrl: null, templateName: null, aiDraft: null, sentBy: null, deliveredAt: h(49.9), readAt: h(49) },
    { id: "dm05-3", conversationId: "demo-conv05", whatsappMessageId: "wam05-3", direction: "INBOUND", type: "TEXT", content: "Gracias por la información. Nos vemos en el torneo!", status: "READ", isAiGenerated: false, timestamp: h(24), mediaUrl: null, templateName: null, aiDraft: null, sentBy: null, deliveredAt: null, readAt: null },
  ],
  "demo-conv06": [
    { id: "dm06-1", conversationId: "demo-conv06", whatsappMessageId: "wam06-1", direction: "INBOUND", type: "TEXT", content: "Hello! I would like to book a tee time for Saturday morning. Is there availability?", status: "READ", isAiGenerated: false, timestamp: h(5), mediaUrl: null, templateName: null, aiDraft: null, sentBy: null, deliveredAt: null, readAt: null },
    { id: "dm06-2", conversationId: "demo-conv06", whatsappMessageId: "wam06-2", direction: "OUTBOUND", type: "TEXT", content: "Hi James! Yes, we have availability on Saturday morning at 8:00, 9:30 and 11:00. Weekend green fee is 65 euros. Would you like to book?", status: "READ", isAiGenerated: true, timestamp: h(4.9), mediaUrl: null, templateName: null, aiDraft: null, sentBy: null, deliveredAt: h(4.9), readAt: h(4) },
    { id: "dm06-3", conversationId: "demo-conv06", whatsappMessageId: "wam06-3", direction: "INBOUND", type: "TEXT", content: "I would like to book a tee time for Saturday morning", status: "DELIVERED", isAiGenerated: false, timestamp: h(3), mediaUrl: null, templateName: null, aiDraft: null, sentBy: null, deliveredAt: null, readAt: null },
  ],
  "demo-conv07": [
    { id: "dm07-1", conversationId: "demo-conv07", whatsappMessageId: "wam07-1", direction: "INBOUND", type: "TEXT", content: "Hola! Quería preguntar por las clases de golf para mejorar mi swing", status: "READ", isAiGenerated: false, timestamp: h(72), mediaUrl: null, templateName: null, aiDraft: null, sentBy: null, deliveredAt: null, readAt: null },
    { id: "dm07-2", conversationId: "demo-conv07", whatsappMessageId: "wam07-2", direction: "OUTBOUND", type: "TEXT", content: "Hola Elena! Tenemos clases individuales con nuestro pro, Juan Carlos. Las sesiones son de 1 hora a 40 euros. Hay disponibilidad martes y jueves por la mañana. Te interesa?", status: "READ", isAiGenerated: true, timestamp: h(71), mediaUrl: null, templateName: null, aiDraft: null, sentBy: null, deliveredAt: h(71), readAt: h(70) },
    { id: "dm07-3", conversationId: "demo-conv07", whatsappMessageId: "wam07-3", direction: "INBOUND", type: "TEXT", content: "Si! El jueves a las 10:00 me va genial", status: "READ", isAiGenerated: false, timestamp: h(69), mediaUrl: null, templateName: null, aiDraft: null, sentBy: null, deliveredAt: null, readAt: null },
    { id: "dm07-4", conversationId: "demo-conv07", whatsappMessageId: "wam07-4", direction: "OUTBOUND", type: "TEXT", content: "Apuntado! Clase con Juan Carlos el jueves a las 10:00. Trae tus palos y ropa cómoda. Te esperamos!", status: "READ", isAiGenerated: false, timestamp: h(68), mediaUrl: null, templateName: null, aiDraft: null, sentBy: "demo-user", deliveredAt: h(68), readAt: h(67) },
    { id: "dm07-5", conversationId: "demo-conv07", whatsappMessageId: "wam07-5", direction: "INBOUND", type: "TEXT", content: "Perfecto, muchas gracias por todo!", status: "READ", isAiGenerated: false, timestamp: h(48), mediaUrl: null, templateName: null, aiDraft: null, sentBy: null, deliveredAt: null, readAt: null },
  ],
  "demo-conv08": [
    { id: "dm08-1", conversationId: "demo-conv08", whatsappMessageId: "wam08-1", direction: "INBOUND", type: "TEXT", content: "Buenas tardes, tengo clase los miércoles a las 16:00 pero esta semana no puedo. Puedo cambiar mi horario de clase a las 17:00?", status: "READ", isAiGenerated: false, timestamp: h(2), mediaUrl: null, templateName: null, aiDraft: null, sentBy: null, deliveredAt: null, readAt: null },
    { id: "dm08-2", conversationId: "demo-conv08", whatsappMessageId: "wam08-2", direction: "OUTBOUND", type: "TEXT", content: "Hola Javier! Deja que consulte la disponibilidad del profesor a las 17:00 y te confirmo enseguida.", status: "READ", isAiGenerated: true, timestamp: h(1.9), mediaUrl: null, templateName: null, aiDraft: null, sentBy: null, deliveredAt: h(1.9), readAt: h(1.5) },
    { id: "dm08-3", conversationId: "demo-conv08", whatsappMessageId: "wam08-3", direction: "INBOUND", type: "TEXT", content: "Puedo cambiar mi horario de clase a las 17:00?", status: "DELIVERED", isAiGenerated: false, timestamp: m(45), mediaUrl: null, templateName: null, aiDraft: null, sentBy: null, deliveredAt: null, readAt: null },
  ],
};

// ============================================================
// DEMO WEATHER (14 days)
// ============================================================

function getDemoWeatherDays() {
  const days = [];
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);

  const weatherPatterns = [
    { code: 0, emoji: "☀️", tempMax: 22, tempMin: 8, precip: 0, wind: 12, score: 92, demand: "ALTA" },
    { code: 1, emoji: "🌤️", tempMax: 20, tempMin: 7, precip: 0, wind: 15, score: 88, demand: "ALTA" },
    { code: 2, emoji: "⛅", tempMax: 18, tempMin: 9, precip: 0.2, wind: 18, score: 82, demand: "MEDIA" },
    { code: 0, emoji: "☀️", tempMax: 24, tempMin: 10, precip: 0, wind: 8, score: 95, demand: "ALTA" },
    { code: 3, emoji: "☁️", tempMax: 16, tempMin: 8, precip: 1.5, wind: 22, score: 70, demand: "MEDIA" },
    { code: 61, emoji: "🌧️", tempMax: 14, tempMin: 7, precip: 12, wind: 25, score: 35, demand: "BAJA" },
    { code: 2, emoji: "⛅", tempMax: 17, tempMin: 6, precip: 0.5, wind: 20, score: 75, demand: "MEDIA" },
    { code: 0, emoji: "☀️", tempMax: 23, tempMin: 9, precip: 0, wind: 10, score: 93, demand: "ALTA" },
    { code: 1, emoji: "🌤️", tempMax: 21, tempMin: 8, precip: 0, wind: 14, score: 89, demand: "ALTA" },
    { code: 0, emoji: "☀️", tempMax: 25, tempMin: 11, precip: 0, wind: 7, score: 96, demand: "ALTA" },
    { code: 2, emoji: "⛅", tempMax: 19, tempMin: 9, precip: 0.3, wind: 16, score: 83, demand: "MEDIA" },
    { code: 71, emoji: "🌧️", tempMax: 13, tempMin: 5, precip: 15, wind: 55, score: 20, demand: "CERRADO" },
    { code: 3, emoji: "☁️", tempMax: 15, tempMin: 7, precip: 2, wind: 28, score: 65, demand: "MEDIA" },
    { code: 1, emoji: "🌤️", tempMax: 20, tempMin: 8, precip: 0, wind: 12, score: 87, demand: "ALTA" },
  ];

  for (let i = 0; i < 14; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    const p = weatherPatterns[i];
    days.push({
      date: date.toISOString().split("T")[0],
      weatherCode: p.code,
      weatherEmoji: p.emoji,
      tempMax: p.tempMax,
      tempMin: p.tempMin,
      precipitation: p.precip,
      windSpeed: p.wind,
      golfScore: p.score,
      demandLevel: p.demand,
    });
  }
  return days;
}

// ============================================================
// EXPORTED FUNCTIONS
// ============================================================

export function getDemoDashboardData() {
  const recentActivity = [
    { id: "da1", type: "message_in", playerName: "Carlos Garcia Martinez", preview: "Perfecto, entonces reservo para las 9:00 del sábado", timestamp: m(5), isAi: false },
    { id: "da2", type: "message_out", playerName: "Maria Lopez Fernandez", preview: "Hola Maria! Si, el Torneo de Primavera 2026 es el 15 de abr...", timestamp: m(30), isAi: true },
    { id: "da3", type: "message_in", playerName: "Javier Martin Perez", preview: "Puedo cambiar mi horario de clase a las 17:00?", timestamp: m(45), isAi: false },
    { id: "da4", type: "message_in", playerName: "Fernando Navarro Gil", preview: "No estoy nada contento con el estado del green del hoyo 7", timestamp: h(2), isAi: false },
    { id: "da5", type: "message_out", playerName: "James Smith", preview: "Hi James! Yes, we have availability on Saturday morning...", timestamp: h(3), isAi: true },
  ];

  return {
    stats: {
      totalPlayers: 187,
      newPlayersThisMonth: 12,
      vipPlayers: 23,
      activeConversations: 14,
      unreadConversations: 5,
      totalCampaigns: 4,
    },
    recentActivity,
  };
}

export function getDemoPlayersData(params: { page?: number; limit?: number; search?: string; engagement?: string }) {
  const { page = 1, limit = 50, search = "", engagement } = params;

  let filtered = [...DEMO_PLAYERS];

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.firstName.toLowerCase().includes(s) ||
        p.lastName.toLowerCase().includes(s) ||
        p.phone.includes(s) ||
        (p.email && p.email.toLowerCase().includes(s))
    );
  }

  if (engagement) {
    filtered = filtered.filter((p) => p.engagementLevel === engagement);
  }

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * limit, page * limit);

  return {
    players: paged,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    stats: {
      vipCount: DEMO_PLAYERS.filter((p) => p.engagementLevel === "VIP").length,
      highCount: DEMO_PLAYERS.filter((p) => p.engagementLevel === "HIGH").length,
      newCount: DEMO_PLAYERS.filter((p) => p.engagementLevel === "NEW").length,
    },
  };
}

export function getDemoTournamentsData(params: { page?: number; limit?: number; search?: string; status?: string }) {
  const { page = 1, limit = 50, search = "", status } = params;

  let filtered = [...DEMO_TOURNAMENTS];

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (t) => t.name.toLowerCase().includes(s) || (t.description && t.description.toLowerCase().includes(s))
    );
  }

  if (status) {
    filtered = filtered.filter((t) => t.status === status);
  }

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * limit, page * limit);

  return {
    tournaments: paged,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export function getDemoCampaignsData(params: { page?: number; limit?: number; status?: string }) {
  const { page = 1, limit = 20, status } = params;

  let filtered = [...DEMO_CAMPAIGNS];

  if (status) {
    filtered = filtered.filter((c) => c.status === status);
  }

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * limit, page * limit);

  return {
    campaigns: paged,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export function getDemoConversationsData(params: { page?: number; limit?: number; status?: string; search?: string }) {
  const { page = 1, limit = 50, status, search } = params;

  let filtered = [...DEMO_CONVERSATIONS];

  if (status) {
    const statuses = status.split(",").map((s) => s.trim());
    filtered = filtered.filter((c) => statuses.includes(c.status));
  }

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.player.firstName.toLowerCase().includes(s) ||
        c.player.lastName.toLowerCase().includes(s) ||
        c.player.phone.includes(s) ||
        (c.lastMessagePreview && c.lastMessagePreview.toLowerCase().includes(s))
    );
  }

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * limit, page * limit);

  return {
    conversations: paged,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export function getDemoConversationMessages(conversationId: string) {
  const messages = DEMO_MESSAGES[conversationId] || [];
  return {
    messages,
    hasMore: false,
    total: messages.length,
  };
}

export function getDemoWeatherForecast() {
  const daily = getDemoWeatherDays();
  const predictions = daily.map((d) => ({
    date: d.date,
    demandaPredecida: d.demandLevel,
    ocupacionPredecida: d.demandLevel === "ALTA" ? 85 : d.demandLevel === "MEDIA" ? 55 : d.demandLevel === "CERRADO" ? 0 : 25,
    ingresoPredecido: d.demandLevel === "ALTA" ? 4200 : d.demandLevel === "MEDIA" ? 2800 : d.demandLevel === "CERRADO" ? 0 : 1200,
  }));

  const alerts = [
    { title: "Lluvia intensa prevista el viernes - posible cierre", level: "warning" as const },
    { title: "Viento fuerte (55 km/h) el día 12 - cierre recomendado", level: "critical" as const },
    { title: "Excelente tiempo mañana - oportunidad para promoción green fee", level: "opportunity" as const },
  ];

  return {
    daily,
    predictions,
    alerts,
    todayHourly: [],
    calendarOnlyDays: [],
    calendarOnlyPredictions: [],
    historicalRecords: [],
    fieldConfig: {
      fieldName: "La Valmuza Golf Club",
      fieldCapacity: 80,
      fieldLatitude: 40.9651,
      fieldLongitude: -5.664,
    },
    tournaments: DEMO_TOURNAMENTS.filter((t) => t.status === "OPEN").map((t) => ({
      date: t.date.split("T")[0],
      name: t.name,
    })),
  };
}

export function getDemoChatContext() {
  return {
    clubInfo: {
      clubName: "La Valmuza Golf Club",
      timezone: "Europe/Madrid",
      defaultLanguage: "ES",
      currency: "EUR",
      fieldName: "La Valmuza Golf Club",
      fieldCapacity: 80,
      fieldLatitude: 40.9651,
      fieldLongitude: -5.664,
      rateWeekday: 45,
      rateWeekend: 65,
      rateHoliday: 75,
    },
    players: {
      total: 187,
      engagementDistribution: { VIP: 23, HIGH: 42, MEDIUM: 68, LOW: 32, NEW: 22 },
      topSpenders: DEMO_PLAYERS.filter((p) => p.engagementLevel === "VIP").map((p) => ({
        name: `${p.firstName} ${p.lastName}`,
        totalSpent: Math.floor(Math.random() * 3000) + 1500,
        visits: p._count.visits,
      })),
      recentPlayers: DEMO_PLAYERS.slice(0, 10).map((p) => ({
        name: `${p.firstName} ${p.lastName}`,
        handicap: p.handicap,
        engagement: p.engagementLevel,
        visits: p._count.visits,
        conversations: p._count.conversations,
      })),
    },
    conversations: {
      total: DEMO_CONVERSATIONS.length,
      open: DEMO_CONVERSATIONS.filter((c) => c.status === "OPEN").length,
      pending: DEMO_CONVERSATIONS.filter((c) => c.status === "PENDING").length,
      resolved: DEMO_CONVERSATIONS.filter((c) => c.status === "RESOLVED").length,
      avgSentiment: "POSITIVE",
      recent: DEMO_CONVERSATIONS.slice(0, 5).map((c) => ({
        player: `${c.player.firstName} ${c.player.lastName}`,
        status: c.status,
        lastMessage: c.lastMessagePreview,
        sentiment: c.currentSentiment,
      })),
    },
    campaigns: {
      total: DEMO_CAMPAIGNS.length,
      totalSent: DEMO_CAMPAIGNS.reduce((sum, c) => sum + c.totalSent, 0),
      totalDelivered: DEMO_CAMPAIGNS.reduce((sum, c) => sum + c.totalDelivered, 0),
      totalRead: DEMO_CAMPAIGNS.reduce((sum, c) => sum + c.totalRead, 0),
      recent: DEMO_CAMPAIGNS.map((c) => ({
        name: c.name,
        status: c.status,
        sent: c.totalSent,
        delivered: c.totalDelivered,
        read: c.totalRead,
      })),
    },
    tournaments: {
      upcoming: DEMO_TOURNAMENTS.filter((t) => ["OPEN", "DRAFT"].includes(t.status)).map((t) => ({
        name: t.name,
        date: t.date,
        format: t.format,
        registered: t._count.registrations,
        maxParticipants: t.maxParticipants,
        status: t.status,
      })),
      completed: DEMO_TOURNAMENTS.filter((t) => t.status === "COMPLETED").map((t) => ({
        name: t.name,
        date: t.date,
        participants: t._count.registrations,
      })),
    },
    weather: {
      forecast: getDemoWeatherDays().slice(0, 3),
    },
    revenue: {
      totalConsumptions: 1247,
      totalRevenue: 89340,
      byCategory: {
        GREEN_FEE: 42150,
        RESTAURANT: 18200,
        SHOP: 12400,
        LESSONS: 8790,
        BUGGY: 4300,
        OTHER: 3500,
      },
      avgPerPlayer: 478,
      thisMonth: 8940,
      lastMonth: 11200,
    },
  };
}
