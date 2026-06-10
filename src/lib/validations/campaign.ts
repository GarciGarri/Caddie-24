import { z } from "zod";

export const segmentQuerySchema = z.object({
  engagementLevels: z.array(z.enum(["VIP", "HIGH", "MEDIUM", "LOW", "NEW"])).optional(),
  languages: z.array(z.enum(["ES", "EN", "DE", "FR"])).optional(),
  handicapMin: z.coerce.number().min(0).max(54).optional(),
  handicapMax: z.coerce.number().min(0).max(54).optional(),
  tags: z.array(z.string()).optional(),
  tournamentIds: z.array(z.string()).optional(),
  membersOnly: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.handicapMin !== undefined && data.handicapMax !== undefined) {
      return data.handicapMin <= data.handicapMax;
    }
    return true;
  },
  { message: "El handicap mínimo debe ser menor o igual al máximo", path: ["handicapMax"] }
);

const campaignBaseSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(200),
  description: z.string().max(2000).optional().or(z.literal("")),
  channel: z.enum(["WHATSAPP", "TELEGRAM", "EMAIL"]).optional(),
  templateName: z.string().max(200).optional().or(z.literal("")),
  messageBody: z.string().max(4000).optional().or(z.literal("")),
  emailSubject: z.string().max(200).optional().or(z.literal("")),
  segmentQuery: segmentQuerySchema,
  scheduledAt: z
    .string()
    .datetime({ offset: true, message: "Fecha de programación inválida" })
    .nullable()
    .optional(),
});

export const createCampaignSchema = campaignBaseSchema.superRefine((data, ctx) => {
  const channel = data.channel || "WHATSAPP";
  if (channel === "WHATSAPP" && !data.templateName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["templateName"],
      message: "Selecciona un template de WhatsApp",
    });
  }
  if (channel !== "WHATSAPP" && !data.messageBody?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["messageBody"],
      message: "Escribe el mensaje de la campaña",
    });
  }
  if (channel === "EMAIL" && !data.emailSubject?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["emailSubject"],
      message: "Escribe el asunto del email",
    });
  }
});

export const updateCampaignSchema = campaignBaseSchema.partial();

export type SegmentQuery = z.infer<typeof segmentQuerySchema>;
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
