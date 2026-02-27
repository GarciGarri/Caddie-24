import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { generateAiReply } from "@/lib/services/ai-reply";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return new Response(JSON.stringify({ error: "No autenticado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { id: conversationId } = await params;

  try {
    const draft = await generateAiReply(conversationId);

    return new Response(JSON.stringify({ draft }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[GenerateDraft] Error:", error);
    const message =
      error instanceof Error ? error.message : "Error al generar borrador";

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
