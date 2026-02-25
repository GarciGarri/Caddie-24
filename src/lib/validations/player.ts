import { z } from "zod";

export const createPlayerSchema = z.object({
  firstName: z.string().min(1, "El nombre es obligatorio").max(100),
  lastName: z.string().min(1, "El apellido es obligatorio").max(100),
  phone: z
    .string()
    .min(1, "El teléfono es obligatorio")
    .regex(/^\+?[0-9\s-]{7,20}$/, "Formato de teléfono inválido"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  handicap: z.coerce.number().min(0).max(54).optional().or(z.literal("")),
  birthday: z.string().optional().or(z.literal("")),
  preferredLanguage: z.enum(["ES", "EN", "DE", "FR"]).default("ES"),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export const updatePlayerSchema = createPlayerSchema.partial();

export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;
