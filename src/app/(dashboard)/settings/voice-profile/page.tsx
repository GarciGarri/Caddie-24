"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, CheckCircle2, Bot, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface VoiceProfileSettings {
  voiceTone: string;
  voiceValues: string;
  voiceStyle: string;
  voiceExamples: string[];
}

export default function VoiceProfilePage() {
  const [settings, setSettings] = useState<VoiceProfileSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newExample, setNewExample] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          setSettings(await res.json());
        } else {
          setError("Error al cargar el perfil de voz");
        }
      } catch (err) {
        console.error("Error loading voice profile settings:", err);
        setError("Error al cargar el perfil de voz");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const examples = (settings?.voiceExamples as string[]) || [];

  const addExample = () => {
    if (!newExample.trim()) return;
    const updated = [...examples, newExample.trim()];
    setSettings({ ...settings!, voiceExamples: updated });
    setNewExample("");
  };

  const removeExample = (idx: number) => {
    setSettings({ ...settings!, voiceExamples: examples.filter((_: string, i: number) => i !== idx) });
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voiceTone: settings?.voiceTone,
          voiceValues: settings?.voiceValues,
          voiceStyle: settings?.voiceStyle,
          voiceExamples: settings?.voiceExamples || [],
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError("Error al guardar el perfil de voz");
      }
    } catch (err) {
      console.error("Error saving voice profile settings:", err);
      setError("Error al guardar el perfil de voz");
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
          <h1 className="text-2xl font-bold">Perfil de Voz IA</h1>
          <p className="text-muted-foreground">Define cómo se comunica la IA en nombre del club</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5" />Tono de comunicación</CardTitle>
          <CardDescription>La IA usará estas directrices al generar mensajes, borradores y respuestas automáticas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Tono general</Label>
            <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" value={settings?.voiceTone || ""} onChange={(e) => setSettings({ ...settings!, voiceTone: e.target.value })} placeholder="ej. Cercano y profesional. Trato de tú al jugador. Tono positivo y motivador. Evitar jerga excesivamente técnica." />
          </div>
          <div>
            <Label>Valores del club</Label>
            <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" value={settings?.voiceValues || ""} onChange={(e) => setSettings({ ...settings!, voiceValues: e.target.value })} placeholder="ej. Tradición, excelencia, comunidad deportiva, sostenibilidad, inclusión" />
          </div>
          <div>
            <Label>Estilo de escritura</Label>
            <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" value={settings?.voiceStyle || ""} onChange={(e) => setSettings({ ...settings!, voiceStyle: e.target.value })} placeholder="ej. Frases cortas. Párrafos de máximo 3 líneas. Usar emojis con moderación. Incluir call-to-action claro." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mensajes de ejemplo</CardTitle>
          <CardDescription>Añade ejemplos de mensajes que representen el tono deseado. La IA los usará como referencia.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input value={newExample} onChange={(e) => setNewExample(e.target.value)} placeholder="Escribe un mensaje de ejemplo..." onKeyDown={(e) => e.key === "Enter" && addExample()} className="flex-1" />
            <Button variant="outline" onClick={addExample}><Plus className="h-4 w-4" /></Button>
          </div>
          {examples.length > 0 ? (
            <div className="space-y-2">
              {examples.map((ex: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm flex-1">{ex}</p>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-destructive" onClick={() => removeExample(idx)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Sin ejemplos. Añade mensajes que representen el tono del club.</p>
          )}
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
