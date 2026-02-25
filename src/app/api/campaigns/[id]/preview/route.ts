import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { segmentQuerySchema } from "@/lib/validations/campaign";
import { previewRecipients } from "@/lib/services/campaign-sender";

// POST /api/campaigns/[id]/preview — Preview recipients for a segment
// Also works standalone: POST /api/campaigns/preview with segmentQuery in body
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let segment;

    if (params.id === "preview") {
      // Standalone preview — segment from body
      const body = await request.json();
      segment = segmentQuerySchema.parse(body);
    } else {
      // Campaign-specific preview
      const campaign = await prisma.campaign.findUnique({
        where: { id: params.id },
      });
      if (!campaign) {
        return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
      }
      segment = campaign.segmentQuery as any;
    }

    const result = await previewRecipients(segment);
    return NextResponse.json(result);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Segmento inválido", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error previewing recipients:", error);
    return NextResponse.json(
      { error: "Error al previsualizar destinatarios" },
      { status: 500 }
    );
  }
}
