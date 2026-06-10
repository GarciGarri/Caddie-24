"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";

const JOURNEY_META: Record<
  string,
  { title: string; description: string; hasDays?: "days" | "daysBefore" }
> = {
  birthday: {
    title: "🎂 Cumpleaños",
    description: "Felicitación automática el día del cumpleaños del jugador.",
  },
  winback: {
    title: "⛳ Recuperación de inactivos (winback)",
    description:
      "Mensaje a jugadores sin visitas en los últimos N días (máximo uno por trimestre).",
    hasDays: "days",
  },
  renewal: {
    title: "📅 Renovación de membresía",
    description:
      "Aviso a los socios cuya membresía vence en los próximos N días.",
    hasDays: "daysBefore",
  },
  postVisit: {
    title: "💬 Encuesta post-visita",
    description: "Mensaje de agradecimiento y feedback el día después de cada visita.",
  },
  welcome: {
    title: "👋 Bienvenida",
    description:
      "Mensaje a jugadores creados en las últimas 48h. Desactivado por defecto: actívalo solo si tus altas son orgánicas (no importaciones masivas).",
  },
};

const DEFAULTS: any = {
  birthday: { enabled: true, message: "" },
  winback: { enabled: true, days: 75, message: "" },
  renewal: { enabled: true, daysBefore: 30, message: "" },
  postVisit: { enabled: true, message: "" },
  welcome: { enabled: false, message: "" },
};

export default function JourneysSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    // The API merges stored config with defaults via the journeys service,
    // but settings only stores the raw JSON; fetch defaults from a dedicated shape
    fetch("/api/settings")
      .then((r) => r.json())
      .then(async (data) => {
        // Fetch effective config (with defaults) from the journeys helper endpoint
        const res = await fetch("/api/settings/journeys-config");
        if (res.ok) {
          setConfig(await res.json());
        } else {
          setConfig({ ...DEFAULTS, ...(data.journeysConfig || {}) });
        }
      })
      .catch(() => toast.error("Error al cargar"))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ journeysConfig: config }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Error al guardar");
        return;
      }
      toast.success("Journeys guardados");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Journeys automáticos
          </h1>
          <p className="text-muted-foreground">
            Mensajes de ciclo de vida que se envían solos cada día por el mejor canal
            disponible de cada jugador (Telegram → Email → WhatsApp). Los jugadores
            dados de baja nunca los reciben.
          </p>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Guardar
        </Button>
      </div>

      {Object.entries(JOURNEY_META).map(([key, meta]) => {
        const j = config[key] || DEFAULTS[key];
        return (
          <Card key={key} className={!j.enabled ? "opacity-70" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base">{meta.title}</CardTitle>
                  <CardDescription>{meta.description}</CardDescription>
                </div>
                <button
                  onClick={() =>
                    setConfig((p: any) => ({
                      ...p,
                      [key]: { ...j, enabled: !j.enabled },
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                    j.enabled ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                >
                  <span
                    className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-md transition-transform ${
                      j.enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {meta.hasDays && (
                <div className="flex items-center gap-2">
                  <Label className="text-sm whitespace-nowrap">
                    {meta.hasDays === "days"
                      ? "Días sin visitas:"
                      : "Días de antelación:"}
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={j[meta.hasDays] ?? ""}
                    onChange={(e) =>
                      setConfig((p: any) => ({
                        ...p,
                        [key]: { ...j, [meta.hasDays!]: Number(e.target.value) },
                      }))
                    }
                    className="w-24"
                  />
                </div>
              )}
              <div className="space-y-1">
                <Label className="text-xs">
                  Mensaje — variables: {"{{nombre}}"}, {"{{club}}"}
                  {key === "renewal" && `, {{fecha}}`}
                </Label>
                <textarea
                  value={j.message}
                  onChange={(e) =>
                    setConfig((p: any) => ({
                      ...p,
                      [key]: { ...j, message: e.target.value },
                    }))
                  }
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm resize-none"
                />
              </div>
            </CardContent>
          </Card>
        );
      })}

      <p className="text-xs text-muted-foreground">
        Los journeys se ejecutan automáticamente cada mañana y también al abrir el
        dashboard. Cada jugador recibe cada mensaje una sola vez (control
        antiduplicados por jugador y evento). Nota WhatsApp: fuera de la ventana de
        24h, Meta solo entrega plantillas aprobadas, así que estos mensajes llegan
        mejor por Telegram o email.
      </p>
    </div>
  );
}
