import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/notifications/push-subscribe — save push subscription
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  let body: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  };

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return Response.json(
      { error: "Missing endpoint or keys" },
      { status: 400 }
    );
  }

  // Upsert by endpoint (same browser re-subscribing)
  await prisma.pushSubscription.upsert({
    where: { endpoint: body.endpoint },
    create: {
      userId,
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
    },
    update: {
      userId,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
    },
  });

  return Response.json({ ok: true });
}

// DELETE /api/notifications/push-subscribe — remove push subscription
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  let body: { endpoint: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.endpoint) {
    return Response.json({ error: "Missing endpoint" }, { status: 400 });
  }

  await prisma.pushSubscription
    .delete({ where: { endpoint: body.endpoint } })
    .catch(() => {
      // May not exist, that's OK
    });

  return Response.json({ ok: true });
}
