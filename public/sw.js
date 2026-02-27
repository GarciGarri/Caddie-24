// Service Worker for Push Notifications — Caddie 24

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = {
      title: "Caddie 24",
      body: event.data.text(),
      url: "/",
    };
  }

  const options = {
    body: data.body || "",
    icon: data.icon || "/icon-192x192.png",
    badge: "/icon-192x192.png",
    tag: data.type || "general",
    renotify: true,
    data: { url: data.url || "/" },
    actions: [{ action: "open", title: "Ver" }],
  };

  event.waitUntil(self.registration.showNotification(data.title || "Caddie 24", options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    // Try to focus an existing window, or open a new one
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        return self.clients.openWindow(url);
      })
  );
});
