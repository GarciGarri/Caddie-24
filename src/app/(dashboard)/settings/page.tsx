"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Building2,
  MessageSquare,
  Bot,
  Clock,
  Shield,
  Users,
  ChevronRight,
  MapPin,
  Play,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const settingsSections = [
  {
    title: "General",
    description: "Nombre del club, zona horaria, idioma por defecto",
    icon: Building2,
    href: "/settings/general",
  },
  {
    title: "Campo y Meteorologia",
    description: "Coordenadas GPS, capacidad, tarifas, umbrales de cierre, festivos",
    icon: MapPin,
    href: "/settings/field",
  },
  {
    title: "WhatsApp",
    description: "Conexion con Meta, numero de telefono, templates",
    icon: MessageSquare,
    href: "/settings/whatsapp",
  },
  {
    title: "Perfil de Voz IA",
    description: "Tono, valores y estilo de comunicacion del club",
    icon: Bot,
    href: "/settings/voice-profile",
  },
  {
    title: "Horarios y Programacion",
    description: "Horas de silencio, reglas de prioridad",
    icon: Clock,
    href: "/settings/scheduling",
  },
  {
    title: "Automatizacion",
    description: "Niveles de automatizacion, umbrales de escalado",
    icon: Shield,
    href: "/settings/automation",
  },
  {
    title: "Equipo",
    description: "Miembros del equipo, roles y permisos",
    icon: Users,
    href: "/settings/team",
  },
];

export default function SettingsPage() {
  const [demoMode, setDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setDemoMode(data.demoMode === true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleToggleDemo = async () => {
    const newValue = !demoMode;
    setDemoMode(newValue); // Optimistic update
    setToggling(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demoMode: newValue }),
      });

      if (!res.ok) {
        setDemoMode(!newValue); // Revert
        toast.error("Error al cambiar el modo demo");
        return;
      }

      toast.success(
        newValue
          ? "Modo Demo activado — los datos son ficticios"
          : "Modo Demo desactivado — datos reales restaurados"
      );
    } catch {
      setDemoMode(!newValue); // Revert
      toast.error("Error de conexion");
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuracion</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona la configuracion de tu CRM
        </p>
      </div>

      {/* Demo Mode Toggle */}
      {!loading && (
        <Card
          className={`border-2 transition-all ${
            demoMode
              ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20"
              : "border-dashed border-muted-foreground/30"
          }`}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <div
              className={`rounded-lg p-2.5 ${
                demoMode ? "bg-amber-100 dark:bg-amber-900/40" : "bg-muted"
              }`}
            >
              <Play
                className={`h-5 w-5 ${
                  demoMode ? "text-amber-600" : "text-muted-foreground"
                }`}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">MODO DEMO</p>
              <p className="text-xs text-muted-foreground">
                {demoMode
                  ? "Activo — El dashboard, Caddie AI y WhatsApp muestran datos ficticios"
                  : "Activa datos ficticios para demostraciones y pruebas de concepto"}
              </p>
            </div>
            <button
              onClick={handleToggleDemo}
              disabled={toggling}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait ${
                demoMode ? "bg-amber-500" : "bg-muted-foreground/30"
              }`}
            >
              {toggling ? (
                <Loader2 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 animate-spin text-white" />
              ) : (
                <span
                  className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                    demoMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              )}
            </button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {settingsSections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{section.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {section.description}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
