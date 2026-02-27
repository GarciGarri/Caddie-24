import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/notifications/read — mark notifications as read
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  let body: { ids?: string[]; all?: boolean };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.all) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  } else if (body.ids && Array.isArray(body.ids) && body.ids.length > 0) {
    await prisma.notification.updateMany({
      where: {
        id: { in: body.ids },
        userId, // Ensure user owns these notifications
      },
      data: { isRead: true },
    });
  } else {
    return Response.json(
      { error: "Provide 'ids' array or 'all: true'" },
      { status: 400 }
    );
  }

  return Response.json({ ok: true });
}
