"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, CheckCircle2, Shield, Plus, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const AUTOMATION_LEVELS = [
  { value: "MANUAL", label: "Manual", desc: "Sin respuestas automáticas. Todo lo gestiona el equipo.", color: "bg-gray-100 text-gray-800" },
  { value: "ASSISTED", label: "Asistido", desc: "La IA sugiere respuestas pero el equipo las aprueba.", color: "bg-blue-100 text-blue-800" },
  { value: "SEMI_AUTO", label: "Semi-automático", desc: "La IA responde a preguntas simples. Escala las complejas.", color: "bg-yellow-100 text-yellow-800" },
  { value: "FULL_AUTO", label: "Totalmente automático", desc: "La IA responde a todo. Escala solo sentimiento negativo.", color: "bg-green-100 text-green-800" },
];

interface AutomationSettings {
  automationLevel: string;
  escalationSentimentThreshold: number;
  escalationKeywords: string[];
  maxAutoReplies: number;
}

export default function AutomationPage() {
  const [settings, setSettings] = useState<AutomationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newKeyword, setNewKeyword] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          setSettings(await res.json());
        } else {
          setError("Error al cargar los ajustes de automatización");
        }
      } catch (err) {
        console.error("Error loading automation settings:", err);
        setError("Error al cargar los ajustes de automatización");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const keywords = settings?.escalationKeywords || [];

  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    setSettings({ ...settings!, escalationKeywords: [...keywords, newKeyword.trim()] });
    setNewKeyword("");
  };

  const removeKeyword = (idx: number) => {
    setSettings({ ...settings!, escalationKeywords: keywords.filter((_: string, i: number) => i !== idx) });
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          automationLevel: settings?.automationLevel,
          escalationSentimentThreshold: settings?.escalationSentimentThreshold,
          escalationKeywords: settings?.escalationKeywords || [],
          maxAutoReplies: settings?.maxAutoReplies,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError("Error al guardar los ajustes de automatización");
      }
    } catch (err) {
      console.error("Error saving automation settings:", err);
      setError("Error al guardar los ajustes de automatización");
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
          <h1 className="text-2xl font-bold">Automatización</h1>
          <p className="text-muted-foreground">Nivel de automatización IA y reglas de escalado</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" />Nivel de automatización</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {AUTOMATION_LEVELS.map((level) => (
            <button key={level.value} onClick={() => setSettings({ ...settings!, automationLevel: level.value })} className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${settings?.automationLevel === level.value ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-muted hover:border-primary/30"}`}>
              <div className="mt-0.5">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${settings?.automationLevel === level.value ? "border-primary" : "border-muted-foreground/30"}`}>
                  {settings?.automationLevel === level.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{level.label}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${level.color}`}>{level.value}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{level.desc}</p>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Reglas de escalado</CardTitle>
          <CardDescription>Define cuándo la IA debe escalar a un humano</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Umbral de sentimiento negativo</Label>
              <Input type="number" value={settings?.escalationSentimentThreshold ?? 0.3} onChange={(e) => setSettings({ ...settings!, escalationSentimentThreshold: parseFloat(e.target.value) || 0.3 })} min={0} max={1} step={0.1} />
              <p className="text-xs text-muted-foreground mt-1">0 = escalar siempre, 1 = nunca escalar</p>
            </div>
            <div>
              <Label>Máx. respuestas automáticas</Label>
              <Input type="number" value={settings?.maxAutoReplies ?? 5} onChange={(e) => setSettings({ ...settings!, maxAutoReplies: parseInt(e.target.value) || 5 })} min={1} max={50} />
              <p className="text-xs text-muted-foreground mt-1">por conversación antes de escalar</p>
            </div>
          </div>
          <div>
            <Label>Palabras clave de escalado</Label>
            <p className="text-xs text-muted-foreground mb-2">Si el mensaje contiene estas palabras, se escalará automáticamente</p>
            <div className="flex gap-2">
              <Input value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} placeholder="ej. queja, cancelar, urgente..." onKeyDown={(e) => e.key === "Enter" && addKeyword()} className="flex-1" />
              <Button variant="outline" onClick={addKeyword}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {keywords.map((kw: string, idx: number) => (
                <Badge key={idx} variant="secondary" className="cursor-pointer gap-1" onClick={() => removeKeyword(idx)}>
                  {kw} <Trash2 className="h-3 w-3" />
                </Badge>
              ))}
            </div>
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
