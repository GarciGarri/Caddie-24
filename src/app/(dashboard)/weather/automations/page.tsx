"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Loader2,
  ChevronLeft,
  Zap,
  ToggleLeft,
  ToggleRight,
  Send,
  MousePointerClick,
  CalendarCheck,
  DollarSign,
  AlertTriangle,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Automation {
  id: string;
  name: string;
  emoji: string;
  enabled: boolean;
  trigger: string;
  audience: string;
  channel: string;
  preview: string;
  stats: {
    sent: number;
    openRate: number;
    bookings: number;
    revenue: number;
  };
}

interface WeatherAlert {
  id: string;
  type: string;
  level: string;
  title: string;
  description: string;
  date: string;
  daysAhead: number;
  actionLabel?: string;
}

export default function WeatherAutomationsPage() {
  const [loading, setLoading] = useState(true);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [autoRes, forecastRes] = await Promise.all([
        fetch("/api/weather/automations"),
        fetch("/api/weather/forecast"),
      ]);
      if (autoRes.ok) {
        setAutomations(await autoRes.json());
      }
      if (forecastRes.ok) {
        const data = await forecastRes.json();
        setAlerts(data.alerts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleAutomation = async (id: string) => {
    const updated = automations.map((a) =>
      a.id === id ? { ...a, enabled: !a.enabled } : a
    );
    setAutomations(updated);
    setSaving(true);
    try {
      await fetch("/api/weather/automations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ automations: updated }),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalSent = automations.reduce((s, a) => s + a.stats.sent, 0);
  const totalBookings = automations.reduce((s, a) => s + a.stats.bookings, 0);
  const totalRevenue = automations.reduce((s, a) => s + a.stats.revenue, 0);
  const avgOpenRate = Math.round(
    automations.reduce((s, a) => s + a.stats.openRate, 0) / Math.max(1, automations.length)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/weather">
          <Button variant="ghost" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            Alertas y Automaciones
          </h1>
          <p className="text-muted-foreground text-sm">Campañas meteorológicas automáticas y alertas activas</p>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Enviadas</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totalSent}</p>
            <p className="text-xs text-muted-foreground">este mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2">
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Tasa apertura</span>
            </div>
            <p className="text-2xl font-bold mt-1">{avgOpenRate}%</p>
            <p className="text-xs text-muted-foreground">promedio</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Reservas</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totalBookings}</p>
            <p className="text-xs text-muted-foreground">atribuidas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Revenue</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totalRevenue.toLocaleString("es-ES")}€</p>
            <p className="text-xs text-muted-foreground">generado</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alertas Activas ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 rounded-lg border p-3 ${
                  alert.level === "critical"
                    ? "bg-red-50 border-red-200"
                    : alert.level === "warning"
                    ? "bg-orange-50 border-orange-200"
                    : alert.level === "opportunity"
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                {alert.level === "critical" ? (
                  <AlertTriangle className="h-4 w-4 mt-0.5 text-red-500 shrink-0" />
                ) : alert.level === "opportunity" ? (
                  <Zap className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" />
                ) : (
                  <Info className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {alert.daysAhead === 0
                      ? "Hoy"
                      : alert.daysAhead === 1
                      ? "Mañana"
                      : `En ${alert.daysAhead} días`}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {alert.actionLabel && (
                    <Button size="sm" variant="outline" className="text-xs">
                      {alert.actionLabel}
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="text-xs text-muted-foreground">
                    Ignorar
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Automations List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Campañas Meteorológicas Automáticas</CardTitle>
          <CardDescription>Activa o desactiva reglas que disparan campañas según el clima</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {automations.map((auto) => (
            <div key={auto.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{auto.emoji}</span>
                    <h3 className="font-medium">{auto.name}</h3>
                    <Badge variant={auto.enabled ? "default" : "secondary"} className="text-[10px]">
                      {auto.enabled ? "ON" : "OFF"}
                    </Badge>
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <p><span className="font-medium text-foreground">Trigger:</span> {auto.trigger}</p>
                    <p><span className="font-medium text-foreground">Audiencia:</span> {auto.audience}</p>
                    <p><span className="font-medium text-foreground">Canal:</span> {auto.channel}</p>
                  </div>
                  <div className="mt-2 bg-gray-50 rounded p-2 text-sm italic text-muted-foreground">
                    &ldquo;{auto.preview}&rdquo;
                  </div>
                  {/* Stats */}
                  <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                    <span><Send className="h-3 w-3 inline mr-1" />{auto.stats.sent} enviadas</span>
                    <span><MousePointerClick className="h-3 w-3 inline mr-1" />{auto.stats.openRate}% apertura</span>
                    <span><CalendarCheck className="h-3 w-3 inline mr-1" />{auto.stats.bookings} reservas</span>
                    <span><DollarSign className="h-3 w-3 inline mr-1" />{auto.stats.revenue}€</span>
                  </div>
                </div>
                <button
                  onClick={() => toggleAutomation(auto.id)}
                  className="mt-1 shrink-0"
                >
                  {auto.enabled ? (
                    <ToggleRight className="h-8 w-8 text-green-500" />
                  ) : (
                    <ToggleLeft className="h-8 w-8 text-gray-300" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
