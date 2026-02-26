import { z } from "zod";

export const segmentQuerySchema = z.object({
  engagementLevels: z.array(z.enum(["VIP", "HIGH", "MEDIUM", "LOW", "NEW"])).optional(),
  languages: z.array(z.enum(["ES", "EN", "DE", "FR"])).optional(),
  handicapMin: z.coerce.number().min(0).max(54).optional(),
  handicapMax: z.coerce.number().min(0).max(54).optional(),
  tags: z.array(z.string()).optional(),
  tournamentIds: z.array(z.string()).optional(),
}).refine(
  (data) => {
    if (data.handicapMin !== undefined && data.handicapMax !== undefined) {
      return data.handicapMin <= data.handicapMax;
    }
    return true;
  },
  { message: "El handicap mínimo debe ser menor o igual al máximo", path: ["handicapMax"] }
);

export const createCampaignSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(200),
  description: z.string().max(2000).optional().or(z.literal("")),
  templateName: z.string().min(1, "Selecciona un template"),
  segmentQuery: segmentQuerySchema,
});

export const updateCampaignSchema = createCampaignSchema.partial();

export type SegmentQuery = z.infer<typeof segmentQuerySchema>;
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
