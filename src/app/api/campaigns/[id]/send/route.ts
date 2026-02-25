import { NextRequest, NextResponse } from "next/server";
import { sendCampaign } from "@/lib/services/campaign-sender";

// POST /api/campaigns/[id]/send — Execute campaign send (simulated)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await sendCampaign(params.id);
    return NextResponse.json({
      success: true,
      message: `Campaña enviada a ${result.sent} destinatarios (simulado)`,
      ...result,
    });
  } catch (error: any) {
    console.error("Error sending campaign:", error);
    return NextResponse.json(
      { error: error.message || "Error al enviar campaña" },
      { status: 400 }
    );
  }
}
