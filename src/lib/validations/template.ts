import { z } from "zod";

export const createTemplateSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(100)
    .regex(/^[a-z0-9_]+$/, "Solo letras minúsculas, números y guiones bajos"),
  language: z.enum(["ES", "EN", "DE", "FR"]).default("ES"),
  category: z.enum(["MARKETING", "UTILITY", "AUTHENTICATION"]).default("MARKETING"),
  bodyText: z.string().min(1, "El texto del template es obligatorio").max(4096),
});

export const updateTemplateSchema = createTemplateSchema.partial();

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
