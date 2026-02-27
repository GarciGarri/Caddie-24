"use client";

import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { DashboardChatbot } from "@/components/chat/dashboard-chatbot";

// Register service worker and subscribe to push notifications
function usePushNotifications() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    async function registerPush() {
      try {
        // Register service worker
        const registration = await navigator.serviceWorker.register("/sw.js");

        // Check if already subscribed
        const existingSub = await registration.pushManager.getSubscription();
        if (existingSub) return; // Already subscribed

        // Get VAPID public key from env
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey) return;

        // Request permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        // Subscribe
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
        });

        // Send subscription to server
        const subJson = subscription.toJSON();
        await fetch("/api/notifications/push-subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: subJson.endpoint,
            keys: {
              p256dh: subJson.keys?.p256dh,
              auth: subJson.keys?.auth,
            },
          }),
        });

        console.log("[Push] Subscribed successfully");
      } catch (err) {
        console.warn("[Push] Registration failed:", err);
      }
    }

    // Delay registration to not block initial render
    const timer = setTimeout(registerPush, 5000);
    return () => clearTimeout(timer);
  }, []);
}

// Helper: Convert VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Check demo mode status
function useDemoMode() {
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setDemoMode(data.demoMode === true))
      .catch(() => {});

    // Re-check every 30s (in case toggled from settings page)
    const interval = setInterval(() => {
      fetch("/api/settings")
        .then((res) => res.json())
        .then((data) => setDemoMode(data.demoMode === true))
        .catch(() => {});
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return demoMode;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const demoMode = useDemoMode();

  // Register push notifications
  usePushNotifications();

  return (
    <div className="flex min-h-screen">
      <AppSidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex flex-1 flex-col min-w-0 overflow-visible">
        {demoMode && (
          <div className="bg-amber-400 text-amber-950 text-xs font-medium text-center py-1.5 px-4 flex items-center justify-center gap-2 shrink-0">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-700 animate-pulse" />
            MODO DEMO ACTIVO — Los datos mostrados son ficticios
            <a
              href="/settings"
              className="underline hover:text-amber-800 ml-1"
            >
              Desactivar
            </a>
          </div>
        )}
        <Header onMobileMenuToggle={() => setMobileMenuOpen((v) => !v)} />
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">{children}</main>
      </div>
      <DashboardChatbot />
      <Toaster richColors position="top-right" />
    </div>
  );
}
