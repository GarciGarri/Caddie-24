import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  await prisma.conversation.update({
    where: { id: params.id },
    data: { unreadCount: 0 },
  });

  return NextResponse.json({ ok: true });
}
