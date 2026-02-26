import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { auth } from "@/lib/auth";

const generateSchema = z.object({
  prompt: z.string().min(3, "Describe qué tipo de mensaje quieres generar").max(500),
  tone: z.enum(["formal", "casual", "friendly", "urgent"]).default("friendly"),
  language: z.enum(["ES", "EN", "DE", "FR"]).default("ES"),
  category: z.enum(["MARKETING", "UTILITY", "AUTHENTICATION"]).default("MARKETING"),
  addEmojis: z.boolean().default(true),
  currentText: z.string().optional(), // For "improve" / "add emojis" modes
  mode: z.enum(["generate", "improve", "add_emojis", "more_formal", "more_casual"]).default("generate"),
});

const toneDescriptions: Record<string, string> = {
  formal: "tono profesional y formal, adecuado para comunicación corporativa",
  casual: "tono relajado e informal, cercano al cliente",
  friendly: "tono amigable y cálido, generando cercanía",
  urgent: "tono directo y con sentido de urgencia, motivando acción inmediata",
};

const languageNames: Record<string, string> = {
  ES: "español",
  EN: "inglés",
  DE: "alemán",
  FR: "francés",
};

const categoryContext: Record<string, string> = {
  MARKETING: "promoción, ofertas, invitaciones a eventos o campañas comerciales de un campo de golf",
  UTILITY: "información útil como confirmaciones de reservas, recordatorios o actualizaciones de un campo de golf",
  AUTHENTICATION: "verificación de identidad o códigos de seguridad",
};

export async function POST(request: NextRequest) {
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
        { error: "OPENAI_API_KEY no configurada. Añádela en tu archivo .env" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const body = await request.json();
    const validated = generateSchema.parse(body);

    let systemPrompt: string;
    let userPrompt: string;

    const baseContext = `Eres un experto en marketing y comunicación para campos de golf de lujo. Generas plantillas de mensajes de WhatsApp Business para el CRM "Caddie 24".

REGLAS IMPORTANTES:
- El mensaje debe ser para WhatsApp Business, máximo 1024 caracteres
- Usa variables dinámicas como {{1}} para el nombre del jugador, {{2}} para datos como precios, fechas, etc.
- {{1}} SIEMPRE es el nombre del jugador/cliente
- El mensaje debe empezar saludando usando {{1}}
- Mantén el mensaje conciso pero atractivo
- Incluye siempre un call-to-action claro al final
- El contexto es: ${categoryContext[validated.category]}
- Idioma: ${languageNames[validated.language]}`;

    switch (validated.mode) {
      case "generate":
        systemPrompt = baseContext + `\n- Tono: ${toneDescriptions[validated.tone]}` +
          (validated.addEmojis ? "\n- Incluye emojis relevantes para hacerlo más visual y atractivo" : "\n- NO uses emojis");
        userPrompt = `Genera una plantilla de mensaje de WhatsApp para: ${validated.prompt}\n\nDevuelve SOLO el texto del mensaje, sin explicaciones ni comillas.`;
        break;

      case "improve":
        systemPrompt = baseContext + "\n- Mejora el mensaje existente manteniendo la intención original pero haciéndolo más efectivo, claro y persuasivo";
        userPrompt = `Mejora este mensaje de WhatsApp manteniendo las variables {{1}}, {{2}}, etc.:\n\n${validated.currentText}\n\nDevuelve SOLO el texto mejorado, sin explicaciones ni comillas.`;
        break;

      case "add_emojis":
        systemPrompt = "Eres un experto en comunicación por WhatsApp. Añade emojis relevantes a mensajes existentes para hacerlos más visuales y atractivos, sin cambiar el texto ni las variables como {{1}}, {{2}}.";
        userPrompt = `Añade emojis apropiados a este mensaje de WhatsApp sin modificar el texto:\n\n${validated.currentText}\n\nDevuelve SOLO el texto con emojis añadidos, sin explicaciones ni comillas.`;
        break;

      case "more_formal":
        systemPrompt = baseContext + "\n- Reescribe el mensaje con un tono más profesional y formal, manteniendo la misma información y variables";
        userPrompt = `Reescribe este mensaje con un tono más formal y profesional:\n\n${validated.currentText}\n\nDevuelve SOLO el texto, sin explicaciones ni comillas.`;
        break;

      case "more_casual":
        systemPrompt = baseContext + "\n- Reescribe el mensaje con un tono más relajado, cercano e informal, manteniendo la misma información y variables";
        userPrompt = `Reescribe este mensaje con un tono más casual y cercano:\n\n${validated.currentText}\n\nDevuelve SOLO el texto, sin explicaciones ni comillas.`;
        break;

      default:
        systemPrompt = baseContext;
        userPrompt = validated.prompt;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 500,
      temperature: 0.8,
    });

    const generatedText = completion.choices[0]?.message?.content?.trim() || "";

    if (!generatedText) {
      return NextResponse.json(
        { error: "No se pudo generar el texto. Intenta de nuevo." },
        { status: 500 }
      );
    }

    // Log usage for analytics (optional - uses AiAnalysisLog model)
    // Could be implemented later for tracking token usage

    return NextResponse.json({
      text: generatedText,
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      },
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    if (error?.status === 401) {
      return NextResponse.json(
        { error: "API key de OpenAI inválida. Revisa tu OPENAI_API_KEY en .env" },
        { status: 401 }
      );
    }
    if (error?.status === 429) {
      return NextResponse.json(
        { error: "Límite de uso de OpenAI alcanzado. Espera un momento e intenta de nuevo." },
        { status: 429 }
      );
    }
    console.error("Error generating template:", error);
    return NextResponse.json(
      { error: "Error al generar el borrador. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
