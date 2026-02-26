import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { sendTextMessage, sendTemplateMessage, sendMediaMessage, mapLanguageCode } from "@/lib/services/whatsapp";
import type { TemplateComponent } from "@/lib/services/whatsapp";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const before = searchParams.get("before"); // cursor: message ID
  const limit = parseInt(searchParams.get("limit") || "50");

  const where: any = { conversationId: params.id };
  if (before) {
    const cursorMsg = await prisma.message.findUnique({
      where: { id: before },
      select: { timestamp: true },
    });
    if (cursorMsg) {
      where.timestamp = { lt: cursorMsg.timestamp };
    }
  }

  const messages = await prisma.message.findMany({
    where,
    orderBy: { timestamp: "asc" },
    take: limit,
  });

  const total = await prisma.message.count({
    where: { conversationId: params.id },
  });

  return NextResponse.json({
    messages,
    hasMore: total > messages.length + (before ? 1 : 0),
    total,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const {
    content,
    type = "TEXT",
    mediaUrl,
    templateName,
    templateLanguage,
    templateComponents,
  } = body;

  // Validate conversation exists and get player phone
  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: {
      player: {
        select: { id: true, phone: true, firstName: true },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversación no encontrada" }, { status: 404 });
  }

  const playerPhone = conversation.player.phone;
  if (!playerPhone) {
    return NextResponse.json({ error: "El jugador no tiene teléfono registrado" }, { status: 400 });
  }

  // Send via WhatsApp API
  let whatsappMessageId: string;

  try {
    if (type === "TEMPLATE" && templateName) {
      const result = await sendTemplateMessage(
        playerPhone,
        templateName,
        templateLanguage || "es",
        templateComponents as TemplateComponent[] | undefined
      );
      whatsappMessageId = result.whatsappMessageId;
    } else if (["IMAGE", "VIDEO", "DOCUMENT", "AUDIO"].includes(type) && mediaUrl) {
      const result = await sendMediaMessage(
        playerPhone,
        type.toLowerCase() as "image" | "video" | "document" | "audio",
        mediaUrl,
        content
      );
      whatsappMessageId = result.whatsappMessageId;
    } else {
      // Default: text message
      if (!content?.trim()) {
        return NextResponse.json({ error: "El mensaje no puede estar vacío" }, { status: 400 });
      }
      const result = await sendTextMessage(playerPhone, content);
      whatsappMessageId = result.whatsappMessageId;
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Error al enviar";
    return NextResponse.json({ error: errMsg }, { status: 502 });
  }

  // Create message record
  const userId = (session as any)?.user?.id;
  const message = await prisma.message.create({
    data: {
      conversationId: params.id,
      whatsappMessageId,
      direction: "OUTBOUND",
      type: type as any,
      content: content || `[${type.toLowerCase()}]`,
      mediaUrl: mediaUrl || null,
      templateName: templateName || null,
      status: "SENT",
      sentBy: userId || "agent",
      timestamp: new Date(),
    },
  });

  // Update conversation
  await prisma.conversation.update({
    where: { id: params.id },
    data: {
      lastMessageAt: new Date(),
      lastMessagePreview: (content || `[${type}]`).substring(0, 255),
      unreadCount: 0, // Agent is actively chatting
    },
  });

  return NextResponse.json(message, { status: 201 });
}
