"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Trash2,
  Loader2,
  CalendarDays,
  Users,
  DollarSign,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const FORMATS = [
  { value: "STABLEFORD", label: "Stableford", desc: "Puntos por hoyo basados en par" },
  { value: "MEDAL", label: "Medal Play", desc: "Menor número de golpes total" },
  { value: "SCRAMBLE", label: "Scramble", desc: "Equipos, mejor bola" },
  { value: "MATCH_PLAY", label: "Match Play", desc: "Hoyo a hoyo, 1 vs 1" },
  { value: "BEST_BALL", label: "Best Ball", desc: "Mejor resultado individual del equipo" },
  { value: "FOURBALL", label: "Fourball", desc: "4 jugadores, mejor bola por equipo" },
];

const CATEGORY_TYPES = [
  { value: "NET", label: "Neto" },
  { value: "GROSS", label: "Bruto" },
  { value: "HANDICAP_RANGE", label: "Por Handicap" },
  { value: "GENDER", label: "Por Género" },
];

type Category = {
  name: string;
  type: string;
  handicapMin: number | null;
  handicapMax: number | null;
  gender: string | null;
  maxPlayers: number | null;
  prizeAmount: number | null;
};

export default function NewTournamentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    date: "",
    teeTime: "09:00",
    format: "STABLEFORD",
    handicapSystem: "EGA",
    maxParticipants: 72,
    entryFee: 0,
    totalPrize: 0,
    cancellationPolicy: "",
    preferredChannel: "whatsapp",
    sponsors: [] as { name: string; contribution?: number }[],
  });

  const [categories, setCategories] = useState<Category[]>([
    {
      name: "1ª Categoría (Hcp 0-18.4)",
      type: "HANDICAP_RANGE",
      handicapMin: 0,
      handicapMax: 18.4,
      gender: null,
      maxPlayers: null,
      prizeAmount: null,
    },
    {
      name: "2ª Categoría (Hcp 18.5-36)",
      type: "HANDICAP_RANGE",
      handicapMin: 18.5,
      handicapMax: 36,
      gender: null,
      maxPlayers: null,
      prizeAmount: null,
    },
  ]);

  const [newSponsor, setNewSponsor] = useState("");

  const addCategory = () => {
    setCategories([
      ...categories,
      {
        name: "",
        type: "NET",
        handicapMin: null,
        handicapMax: null,
        gender: null,
        maxPlayers: null,
        prizeAmount: null,
      },
    ]);
  };

  const removeCategory = (idx: number) => {
    setCategories(categories.filter((_, i) => i !== idx));
  };

  const updateCategory = (idx: number, field: string, value: any) => {
    const updated = [...categories];
    (updated[idx] as any)[field] = value;
    setCategories(updated);
  };

  const addSponsor = () => {
    if (!newSponsor.trim()) return;
    setForm({
      ...form,
      sponsors: [...form.sponsors, { name: newSponsor.trim() }],
    });
    setNewSponsor("");
  };

  const removeSponsor = (idx: number) => {
    setForm({
      ...form,
      sponsors: form.sponsors.filter((_, i) => i !== idx),
    });
  };

  const handleSave = async (asDraft: boolean) => {
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          entryFee: form.entryFee || null,
          totalPrize: form.totalPrize || null,
          categories: categories.filter((c) => c.name.trim()),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al crear torneo");
        return;
      }

      const tournament = await res.json();

      // If not draft, open registrations
      if (!asDraft) {
        await fetch(`/api/tournaments/${tournament.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "OPEN" }),
        });
      }

      router.push(`/tournaments/${tournament.id}`);
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const canGoNext =
    step === 1
      ? form.name.trim() && form.date && form.format
      : step === 2
      ? form.maxParticipants >= 2
      : true;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/tournaments">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Crear Torneo</h1>
          <p className="text-muted-foreground">
            Configura todos los detalles del torneo
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {[
          { n: 1, label: "Información" },
          { n: 2, label: "Configuración" },
          { n: 3, label: "Revisión" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className={`h-px w-8 ${
                  step > i ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                step === s.n
                  ? "bg-primary text-primary-foreground"
                  : step > s.n
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s.n ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <span>{s.n}</span>
              )}
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Info */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Información del Torneo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nombre del torneo *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="ej. Torneo de Primavera 2026"
              />
            </div>
            <div>
              <Label>Descripción</Label>
              <textarea
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Descripción del torneo..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fecha *</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div>
                <Label>Hora de salida</Label>
                <Input
                  type="time"
                  value={form.teeTime}
                  onChange={(e) =>
                    setForm({ ...form, teeTime: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label>Formato de juego *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {FORMATS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setForm({ ...form, format: f.value })}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      form.format === f.value
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-muted hover:border-primary/30"
                    }`}
                  >
                    <p className="font-medium text-sm">{f.label}</p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Sistema de Handicap</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.handicapSystem}
                onChange={(e) =>
                  setForm({ ...form, handicapSystem: e.target.value })
                }
              >
                <option value="EGA">EGA (World Handicap System)</option>
                <option value="USGA">USGA</option>
                <option value="NONE">Sin handicap</option>
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Configuration */}
      {step === 2 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Participantes y Cuota
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Máx. participantes *</Label>
                  <Input
                    type="number"
                    value={form.maxParticipants}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        maxParticipants: parseInt(e.target.value) || 2,
                      })
                    }
                    min={2}
                    max={500}
                  />
                </div>
                <div>
                  <Label>Cuota inscripción (€)</Label>
                  <Input
                    type="number"
                    value={form.entryFee}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        entryFee: parseFloat(e.target.value) || 0,
                      })
                    }
                    min={0}
                    step={5}
                  />
                </div>
                <div>
                  <Label>Premio total (€)</Label>
                  <Input
                    type="number"
                    value={form.totalPrize}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        totalPrize: parseFloat(e.target.value) || 0,
                      })
                    }
                    min={0}
                    step={50}
                  />
                </div>
              </div>
              <div>
                <Label>Política de cancelación</Label>
                <textarea
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]"
                  value={form.cancellationPolicy}
                  onChange={(e) =>
                    setForm({ ...form, cancellationPolicy: e.target.value })
                  }
                  placeholder="ej. Cancelación gratuita hasta 48h antes del torneo..."
                />
              </div>
              <div>
                <Label>Canal de comunicación preferido</Label>
                <div className="flex gap-2 mt-1">
                  {["whatsapp", "email", "sms"].map((ch) => (
                    <Button
                      key={ch}
                      variant={
                        form.preferredChannel === ch ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setForm({ ...form, preferredChannel: ch })
                      }
                    >
                      {ch === "whatsapp"
                        ? "WhatsApp"
                        : ch === "email"
                        ? "Email"
                        : "SMS"}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Categorías</span>
                <Button variant="outline" size="sm" onClick={addCategory}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Añadir
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {categories.map((cat, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 border rounded-lg"
                >
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Nombre</Label>
                      <Input
                        value={cat.name}
                        onChange={(e) =>
                          updateCategory(idx, "name", e.target.value)
                        }
                        placeholder="Nombre de la categoría"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Tipo</Label>
                      <select
                        className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                        value={cat.type}
                        onChange={(e) =>
                          updateCategory(idx, "type", e.target.value)
                        }
                      >
                        {CATEGORY_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {(cat.type === "HANDICAP_RANGE" || cat.type === "NET") && (
                      <>
                        <div>
                          <Label className="text-xs">Hcp Mín</Label>
                          <Input
                            type="number"
                            value={cat.handicapMin ?? ""}
                            onChange={(e) =>
                              updateCategory(
                                idx,
                                "handicapMin",
                                e.target.value ? parseFloat(e.target.value) : null
                              )
                            }
                            className="h-8 text-sm"
                            step={0.1}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Hcp Máx</Label>
                          <Input
                            type="number"
                            value={cat.handicapMax ?? ""}
                            onChange={(e) =>
                              updateCategory(
                                idx,
                                "handicapMax",
                                e.target.value ? parseFloat(e.target.value) : null
                              )
                            }
                            className="h-8 text-sm"
                            step={0.1}
                          />
                        </div>
                      </>
                    )}
                    {cat.type === "GENDER" && (
                      <div>
                        <Label className="text-xs">Género</Label>
                        <select
                          className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                          value={cat.gender || "MIXED"}
                          onChange={(e) =>
                            updateCategory(idx, "gender", e.target.value)
                          }
                        >
                          <option value="M">Masculino</option>
                          <option value="F">Femenino</option>
                          <option value="MIXED">Mixto</option>
                        </select>
                      </div>
                    )}
                    <div>
                      <Label className="text-xs">Premio (€)</Label>
                      <Input
                        type="number"
                        value={cat.prizeAmount ?? ""}
                        onChange={(e) =>
                          updateCategory(
                            idx,
                            "prizeAmount",
                            e.target.value ? parseFloat(e.target.value) : null
                          )
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive shrink-0"
                    onClick={() => removeCategory(idx)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Sin categorías. Todos los jugadores competirán en categoría
                  única.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Patrocinadores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newSponsor}
                  onChange={(e) => setNewSponsor(e.target.value)}
                  placeholder="Nombre del patrocinador"
                  onKeyDown={(e) => e.key === "Enter" && addSponsor()}
                />
                <Button variant="outline" onClick={addSponsor}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.sponsors.map((s, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="gap-1 cursor-pointer"
                    onClick={() => removeSponsor(idx)}
                  >
                    {s.name}
                    <Trash2 className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Revisión del Torneo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium">{form.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium">
                    {form.date &&
                      new Date(form.date).toLocaleDateString("es-ES", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    {form.teeTime && ` a las ${form.teeTime}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Formato</p>
                  <Badge>
                    {FORMATS.find((f) => f.value === form.format)?.label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Sistema Handicap
                  </p>
                  <p className="font-medium">{form.handicapSystem}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Máx. Participantes
                  </p>
                  <p className="font-medium">{form.maxParticipants}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cuota</p>
                  <p className="font-medium">
                    {form.entryFee ? `${form.entryFee}€` : "Gratis"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Premio total</p>
                  <p className="font-medium">
                    {form.totalPrize ? `${form.totalPrize}€` : "Sin premio"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Canal</p>
                  <Badge variant="secondary">{form.preferredChannel}</Badge>
                </div>
              </div>
            </div>

            {categories.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Categorías ({categories.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c, i) => (
                    <Badge key={i} variant="secondary">
                      {c.name}
                      {c.prizeAmount ? ` — ${c.prizeAmount}€` : ""}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {form.sponsors.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Patrocinadores
                </p>
                <div className="flex flex-wrap gap-2">
                  {form.sponsors.map((s, i) => (
                    <Badge key={i} variant="secondary">
                      {s.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {form.description && (
              <div>
                <p className="text-sm text-muted-foreground">Descripción</p>
                <p className="text-sm">{form.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => (step > 1 ? setStep(step - 1) : router.push("/tournaments"))}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {step > 1 ? "Anterior" : "Cancelar"}
        </Button>

        <div className="flex gap-2">
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canGoNext}>
              Siguiente
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => handleSave(true)}
                disabled={saving}
              >
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Guardar borrador
              </Button>
              <Button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700"
              >
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Crear y abrir inscripciones
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
