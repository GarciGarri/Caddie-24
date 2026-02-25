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

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setActivity(data.recentActivity || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
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
                      <p className="text-sm">
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
                      </p>
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
              <div className="space-y-4">
                {[
                  {
                    color: "bg-blue-500",
                    text: "Sistema CRM iniciado. Configura tu campo en Ajustes.",
                    time: "Ahora",
                  },
                  {
                    color: "bg-yellow-500",
                    text: "Conecta WhatsApp Business API para recibir mensajes.",
                    time: "Pendiente",
                  },
                  {
                    color: "bg-yellow-500",
                    text: "Añade tu primer jugador para comenzar.",
                    time: "Pendiente",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className={`mt-1.5 h-2 w-2 rounded-full ${item.color}`}
                    />
                    <div className="flex-1">
                      <p className="text-sm">{item.text}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
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
    </div>
  );
}
