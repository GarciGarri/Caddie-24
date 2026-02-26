"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  MessageSquare,
  Megaphone,
  TrendingUp,
  UserPlus,
  Bot,
  ArrowUpRight,
  Loader2,
  CloudSun,
  Wind,
  Droplets,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
  totalPlayers: number;
  newPlayersThisMonth: number;
  vipPlayers: number;
  activeConversations: number;
  unreadConversations: number;
  totalCampaigns: number;
}

interface ActivityItem {
  id: string;
  type: string;
  playerName: string;
  preview: string;
  timestamp: string;
  isAi: boolean;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);

  useEffect(() => {
    fetchDashboard();
    fetchWeather();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setActivity(data.recentActivity || []);
        setError(null);
      } else {
        setError("Error al cargar el dashboard");
      }
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setError("Error al cargar el dashboard. Comprueba tu conexión e inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async () => {
    try {
      const res = await fetch("/api/weather/forecast");
      if (res.ok) {
        const data = await res.json();
        setWeatherData(data);
      }
    } catch (e) {
      // Weather widget is optional
    }
  };

  const statCards = [
    {
      title: "Total Jugadores",
      value: stats?.totalPlayers?.toString() || "0",
      change: `+${stats?.newPlayersThisMonth || 0} este mes`,
      icon: Users,
    },
    {
      title: "Conversaciones Activas",
      value: stats?.activeConversations?.toString() || "0",
      change: `${stats?.unreadConversations || 0} sin leer`,
      icon: MessageSquare,
    },
    {
      title: "Campañas Este Mes",
      value: stats?.totalCampaigns?.toString() || "0",
      change: "0 enviadas",
      icon: Megaphone,
    },
    {
      title: "Jugadores VIP",
      value: stats?.vipPlayers?.toString() || "0",
      change: "Engagement máximo",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Bienvenido al CRM de Golf — Caddie 24
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.change}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actividad Reciente</CardTitle>
            <CardDescription>
              Últimas conversaciones de WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : activity.length > 0 ? (
              <div className="space-y-4">
                {activity.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div
                      className={`mt-1.5 h-2 w-2 rounded-full ${
                        item.type === "message_in"
                          ? "bg-blue-500"
                          : "bg-green-500"
                      }`}
                    />
                    <div className="flex-1">
                      <span className="text-sm block">
                        <span className="font-medium">{item.playerName}</span>
                        {": "}
                        {item.preview}
                        {item.isAi && (
                          <Badge
                            variant="secondary"
                            className="ml-2 text-[10px]"
                          >
                            IA
                          </Badge>
                        )}
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(item.timestamp).toLocaleString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="text-center text-sm text-muted-foreground py-4 mb-4">
                  No hay actividad reciente
                </div>
                <p className="text-xs font-medium text-muted-foreground mb-3">Pasos de configuración:</p>
                <div className="space-y-3">
                  {[
                    "Configura tu campo en Ajustes.",
                    "Conecta WhatsApp Business API para recibir mensajes.",
                    "Añade tu primer jugador para comenzar.",
                  ].map((text, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 h-4 w-4 rounded border border-muted-foreground/30 shrink-0" />
                      <p className="text-sm text-muted-foreground">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
            <CardDescription>Empieza a configurar tu CRM</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {[
                {
                  href: "/players/new",
                  icon: UserPlus,
                  title: "Añadir Jugador",
                  desc: "Crea un nuevo perfil de jugador",
                },
                {
                  href: "/campaigns/new",
                  icon: Megaphone,
                  title: "Nueva Campaña",
                  desc: "Envía mensajes segmentados por WhatsApp",
                },
                {
                  href: "/settings",
                  icon: Bot,
                  title: "Configurar IA",
                  desc: "Define el perfil de voz de tu club",
                },
                {
                  href: "/settings",
                  icon: MessageSquare,
                  title: "Conectar WhatsApp",
                  desc: "Vincula tu número de WhatsApp Business",
                },
              ].map((item) => (
                <Link
                  key={item.href + item.title}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
                >
                  <item.icon className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weather Widget — Next 3 Days */}
      {weatherData && weatherData.daily && weatherData.daily.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <CloudSun className="h-5 w-5 text-blue-500" />
                Próximos 3 Días
              </CardTitle>
              <CardDescription>Previsión y demanda estimada</CardDescription>
            </div>
            <Link href="/weather" className="text-xs text-primary hover:underline">
              Ver 14 días
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {weatherData.daily.slice(0, 3).map((day: any, idx: number) => {
                const pred = weatherData.predictions?.[idx];
                return (
                  <div key={day.date} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {idx === 0 ? "Hoy" : idx === 1 ? "Mañana" : formatDayName(day.date)}
                      </span>
                      <span className="text-lg">{day.weatherEmoji}</span>
                    </div>
                    <p className="text-lg font-bold mt-1">{Math.round(day.temperatureMax)}° / {Math.round(day.temperatureMin)}°</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Wind className="h-3 w-3" />{Math.round(day.windspeedMax)}km/h
                      <Droplets className="h-3 w-3 ml-1" />{day.precipitationSum}mm
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div className={`h-2 w-2 rounded-full ${getScoreColor(day.golfScore)}`} />
                        <span className="text-xs font-medium">Score {day.golfScore}</span>
                      </div>
                      {pred && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getDemandColor(pred.demandaPredecida)}`}>
                          {pred.demandaPredecida}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Active alert if any */}
            {weatherData.alerts && weatherData.alerts.length > 0 && (
              <div className={`mt-3 text-xs p-2 rounded-lg ${
                weatherData.alerts[0].level === "critical" ? "bg-red-50 text-red-700" :
                weatherData.alerts[0].level === "opportunity" ? "bg-emerald-50 text-emerald-700" :
                "bg-orange-50 text-orange-700"
              }`}>
                {weatherData.alerts[0].title}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function formatDayName(dateStr: string): string {
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  return days[new Date(dateStr).getDay()];
}

function getScoreColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-lime-500";
  if (score >= 40) return "bg-yellow-500";
  if (score >= 20) return "bg-orange-500";
  return "bg-red-500";
}

function getDemandColor(level: string): string {
  if (level.includes("Alta")) return "bg-green-100 text-green-700";
  if (level === "Media") return "bg-yellow-100 text-yellow-700";
  if (level.includes("Baja")) return "bg-orange-100 text-orange-700";
  return "bg-red-100 text-red-700";
}
