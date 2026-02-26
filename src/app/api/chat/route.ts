import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import OpenAI from "openai";
import { fetchChatContext, buildSystemPrompt } from "@/lib/services/chat-context";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return new Response(JSON.stringify({ error: "No autenticado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error:
          "OPENAI_API_KEY no configurada. Añade tu clave de API en las variables de entorno.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Se requiere al menos un mensaje" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch live data from DB for context
    const context = await fetchChatContext();
    const systemPrompt = buildSystemPrompt(context);

    const openai = new OpenAI({ apiKey });

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
      max_tokens: 1500,
      temperature: 0.7,
      stream: true,
    });

    // Convert OpenAI stream to ReadableStream for the client
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);

    if (error?.status === 401) {
      return new Response(
        JSON.stringify({ error: "API key de OpenAI inválida" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Error al procesar el mensaje" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
