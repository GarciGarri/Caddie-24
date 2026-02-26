"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, CheckCircle2, Clock, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DAYS = [
  { value: "monday", label: "Lunes" },
  { value: "tuesday", label: "Martes" },
  { value: "wednesday", label: "Miércoles" },
  { value: "thursday", label: "Jueves" },
  { value: "friday", label: "Viernes" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
];

interface SchedulingSettings {
  silenceHoursStart: string;
  silenceHoursEnd: string;
  silenceDays: string[];
  bookingConflictHours: number;
}

export default function SchedulingPage() {
  const [settings, setSettings] = useState<SchedulingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          setSettings(await res.json());
        } else {
          setError("Error al cargar los ajustes de horarios");
        }
      } catch (err) {
        console.error("Error loading scheduling settings:", err);
        setError("Error al cargar los ajustes de horarios");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const silenceDays = settings?.silenceDays || [];

  const toggleDay = (day: string) => {
    const updated = silenceDays.includes(day)
      ? silenceDays.filter((d: string) => d !== day)
      : [...silenceDays, day];
    setSettings({ ...settings!, silenceDays: updated });
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          silenceHoursStart: settings?.silenceHoursStart,
          silenceHoursEnd: settings?.silenceHoursEnd,
          silenceDays: settings?.silenceDays || [],
          bookingConflictHours: settings?.bookingConflictHours,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError("Error al guardar los ajustes de horarios");
      }
    } catch (err) {
      console.error("Error saving scheduling settings:", err);
      setError("Error al guardar los ajustes de horarios");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/settings"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold">Horarios y Programación</h1>
          <p className="text-muted-foreground">Horas de silencio y reglas de envío</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Moon className="h-5 w-5" />Horas de silencio</CardTitle>
          <CardDescription>No se enviarán mensajes automáticos durante estas horas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Inicio del silencio</Label>
              <Input type="time" value={settings?.silenceHoursStart || "22:00"} onChange={(e) => setSettings({ ...settings!, silenceHoursStart: e.target.value })} />
            </div>
            <div>
              <Label>Fin del silencio</Label>
              <Input type="time" value={settings?.silenceHoursEnd || "08:00"} onChange={(e) => setSettings({ ...settings!, silenceHoursEnd: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Días sin envíos automáticos</Label>
            <p className="text-xs text-muted-foreground mb-2">Selecciona los días en los que no se enviarán mensajes automáticos</p>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <button key={day.value} onClick={() => toggleDay(day.value)} className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${silenceDays.includes(day.value) ? "bg-primary text-primary-foreground border-primary" : "bg-background border-input hover:bg-muted"}`}>
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Conflictos de reserva</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label>Horas de margen para conflictos de reserva</Label>
            <p className="text-xs text-muted-foreground mb-2">Si un jugador tiene una reserva dentro de estas horas, se priorizará la comunicación relacionada</p>
            <Input type="number" value={settings?.bookingConflictHours || 24} onChange={(e) => setSettings({ ...settings!, bookingConflictHours: parseInt(e.target.value) || 24 })} min={1} max={72} className="w-32" />
            <p className="text-xs text-muted-foreground mt-1">horas</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className={saved ? "bg-green-600" : ""}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : saved ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          {saved ? "Guardado" : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}
