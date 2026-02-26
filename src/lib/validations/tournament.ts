import { z } from "zod";

export const tournamentCategorySchema = z.object({
  name: z.string().min(1, "Nombre de categoría obligatorio"),
  type: z.enum(["GROSS", "NET", "HANDICAP_RANGE", "GENDER"]),
  handicapMin: z.coerce.number().min(0).max(54).optional().nullable(),
  handicapMax: z.coerce.number().min(0).max(54).optional().nullable(),
  gender: z.enum(["M", "F", "MIXED"]).optional().nullable(),
  maxPlayers: z.coerce.number().min(1).optional().nullable(),
  prizeAmount: z.coerce.number().min(0).optional().nullable(),
});

export const createTournamentSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(200),
  description: z.string().max(5000).optional().or(z.literal("")),
  date: z.string().min(1, "La fecha es obligatoria"),
  teeTime: z.string().optional().or(z.literal("")),
  format: z.enum(["STABLEFORD", "MEDAL", "SCRAMBLE", "MATCH_PLAY", "BEST_BALL", "FOURBALL"]),
  handicapSystem: z.string().optional().or(z.literal("")),
  maxParticipants: z.coerce.number().min(2, "Mínimo 2 participantes").max(500),
  entryFee: z.coerce.number().min(0).optional().nullable(),
  totalPrize: z.coerce.number().min(0).optional().nullable(),
  cancellationPolicy: z.string().max(2000).optional().or(z.literal("")),
  sponsors: z.array(z.object({
    name: z.string(),
    contribution: z.coerce.number().optional(),
  })).optional(),
  preferredChannel: z.enum(["whatsapp", "email", "sms"]).optional(),
  categories: z.array(tournamentCategorySchema).optional(),
});

export const updateTournamentSchema = createTournamentSchema.partial();

export const addRegistrationSchema = z.object({
  playerId: z.string().min(1, "Jugador obligatorio"),
  categoryName: z.string().optional(),
});

export const updateResultSchema = z.object({
  playerId: z.string().min(1),
  grossScore: z.coerce.number().min(18).max(200).optional().nullable(),
  netScore: z.coerce.number().min(18).max(200).optional().nullable(),
  handicapUsed: z.coerce.number().min(0).max(54).optional().nullable(),
  positionOverall: z.coerce.number().min(1).optional().nullable(),
  positionCategory: z.coerce.number().min(1).optional().nullable(),
  categoryName: z.string().optional(),
  prizeWon: z.coerce.number().min(0).optional().nullable(),
});

export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;
export type UpdateTournamentInput = z.infer<typeof updateTournamentSchema>;
export type TournamentCategoryInput = z.infer<typeof tournamentCategorySchema>;
