import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { NotificationType } from "@prisma/client";

// --- Types ---

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  data?: Record<string, unknown>;
}

// --- Core: Create notification + push ---

export async function createNotification(
  params: CreateNotificationParams
) {
  const notification = await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      link: params.link || null,
      data: params.data ? (params.data as Prisma.InputJsonValue) : Prisma.DbNull,
    },
  });

  // Send push to all subscriptions of this user (non-blocking)
  sendPushToUser(params.userId, {
    title: params.title,
    body: params.body,
    url: params.link || "/",
    type: params.type,
  }).catch((err) =>
    console.error("[Notifications] Push error:", err)
  );

  return notification;
}

// --- Create notification for all admins/managers ---

export async function createNotificationForAllAdmins(
  params: Omit<CreateNotificationParams, "userId">
) {
  const admins = await prisma.user.findMany({
    where: {
      role: { in: ["ADMIN", "MANAGER"] },
      isActive: true,
    },
    select: { id: true },
  });

  const notifications = await Promise.allSettled(
    admins.map((admin) =>
      createNotification({ ...params, userId: admin.id })
    )
  );

  const failed = notifications.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    console.error(
      `[Notifications] ${failed.length}/${admins.length} admin notifications failed`
    );
  }
}

// --- Web Push ---

interface PushPayload {
  title: string;
  body: string;
  url: string;
  type: string;
}

async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<void> {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) return;

  // Lazy-load web-push only when needed (server-side only)
  let webpush: typeof import("web-push");
  try {
    webpush = await import("web-push");
  } catch {
    console.warn("[Notifications] web-push not available");
    return;
  }

  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn("[Notifications] VAPID keys not configured, skipping push");
    return;
  }

  webpush.setVapidDetails(
    "mailto:admin@caddie24.com",
    vapidPublicKey,
    vapidPrivateKey
  );

  const pushData = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: "/icon-192x192.png",
    url: payload.url,
    type: payload.type,
  });

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          pushData
        );
      } catch (err: unknown) {
        // 410 Gone = subscription expired, clean up
        const statusCode =
          err && typeof err === "object" && "statusCode" in err
            ? (err as { statusCode: number }).statusCode
            : 0;
        if (statusCode === 410 || statusCode === 404) {
          console.log(
            `[Notifications] Removing expired push subscription: ${sub.endpoint.substring(0, 50)}...`
          );
          await prisma.pushSubscription
            .delete({ where: { id: sub.id } })
            .catch(() => {});
        } else {
          console.error(
            `[Notifications] Push failed for ${sub.endpoint.substring(0, 50)}:`,
            err
          );
        }
      }
    })
  );
}

// --- Check unanswered messages (for cron) ---

export async function checkUnansweredMessages(): Promise<number> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  // Find OPEN conversations where:
  // - Last message is INBOUND
  // - Last message is >1h old
  // - No OUTBOUND message after the last INBOUND
  const conversations = await prisma.conversation.findMany({
    where: {
      status: "OPEN",
      lastMessageAt: { lt: oneHourAgo },
    },
    include: {
      player: { select: { firstName: true, lastName: true, phone: true } },
      messages: {
        orderBy: { timestamp: "desc" },
        take: 1,
        select: { direction: true, timestamp: true },
      },
    },
  });

  let notified = 0;

  for (const conv of conversations) {
    const lastMessage = conv.messages[0];
    if (!lastMessage || lastMessage.direction !== "INBOUND") continue;

    // Check we haven't already sent an UNANSWERED notification for this conversation recently (last 2h)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const existingNotification = await prisma.notification.findFirst({
      where: {
        type: "UNANSWERED",
        createdAt: { gt: twoHoursAgo },
        data: {
          path: ["conversationId"],
          equals: conv.id,
        },
      },
    });

    if (existingNotification) continue;

    await createNotificationForAllAdmins({
      type: "UNANSWERED",
      title: "Mensaje sin responder",
      body: `${conv.player.firstName} ${conv.player.lastName} lleva >1h esperando respuesta`,
      link: "/inbox",
      data: { conversationId: conv.id, playerPhone: conv.player.phone },
    });

    notified++;
  }

  return notified;
}
