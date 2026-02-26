import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const GET = auth(async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(req as any).auth) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: {
      player: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatarUrl: true,
          engagementLevel: true,
          whatsappId: true,
        },
      },
      assignedTo: {
        select: { id: true, name: true },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversación no encontrada" }, { status: 404 });
  }

  return NextResponse.json(conversation);
} as any);

export const PATCH = auth(async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(req as any).auth) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const { status, assignedToId, isAiBotActive } = body;

  const data: any = {};
  if (status) data.status = status;
  if (assignedToId !== undefined) data.assignedToId = assignedToId || null;
  if (isAiBotActive !== undefined) data.isAiBotActive = isAiBotActive;

  const conversation = await prisma.conversation.update({
    where: { id: params.id },
    data,
    include: {
      player: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
    },
  });

  return NextResponse.json(conversation);
} as any);
