"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Save,
  Send,
  Users,
  Check,
  FileText,
  Trophy,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Template {
  id: string;
  name: string;
  language: string;
  category: string;
  components: any;
}

interface PreviewPlayer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  engagementLevel: string;
  preferredLanguage: string;
}

const ENGAGEMENT_LEVELS = [
  { value: "VIP", label: "VIP", color: "bg-purple-100 text-purple-700" },
  { value: "HIGH", label: "Alto", color: "bg-green-100 text-green-700" },
  { value: "MEDIUM", label: "Medio", color: "bg-blue-100 text-blue-700" },
  { value: "LOW", label: "Bajo", color: "bg-yellow-100 text-yellow-700" },
  { value: "NEW", label: "Nuevo", color: "bg-gray-100 text-gray-700" },
];

const LANGUAGES = [
  { value: "ES", label: "Español" },
  { value: "EN", label: "English" },
  { value: "DE", label: "Deutsch" },
  { value: "FR", label: "Français" },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1=info, 2=segment, 3=preview
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Templates
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  // Form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");

  // Tournaments
  const [tournaments, setTournaments] = useState<Array<{ id: string; name: string; date: string; status: string }>>([]);
  const [loadingTournaments, setLoadingTournaments] = useState(true);

  // Segment
  const [engagementLevels, setEngagementLevels] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [handicapMin, setHandicapMin] = useState("");
  const [handicapMax, setHandicapMax] = useState("");
  const [selectedTournaments, setSelectedTournaments] = useState<string[]>([]);

  // Preview
  const [previewPlayers, setPreviewPlayers] = useState<PreviewPlayer[]>([]);
  const [previewTotal, setPreviewTotal] = useState(0);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    fetch("/api/templates?status=APPROVED")
      .then((r) => r.json())
      .then((data) => setTemplates(data.templates || []))
      .catch(() => {})
      .finally(() => setLoadingTemplates(false));

    fetch("/api/tournaments?limit=50")
      .then((r) => r.json())
      .then((data) => {
        const list = (data.tournaments || []).map((t: any) => ({
          id: t.id,
          name: t.name,
          date: t.date,
          status: t.status,
        }));
        setTournaments(list);
      })
      .catch(() => {})
      .finally(() => setLoadingTournaments(false));
  }, []);

  const toggleArrayItem = (arr: string[], item: string, setter: (v: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
  };

  const buildSegment = () => {
    const segment: any = {};
    if (engagementLevels.length > 0) segment.engagementLevels = engagementLevels;
    if (languages.length > 0) segment.languages = languages;
    if (handicapMin) segment.handicapMin = Number(handicapMin);
    if (handicapMax) segment.handicapMax = Number(handicapMax);
    if (selectedTournaments.length > 0) segment.tournamentIds = selectedTournaments;
    return segment;
  };

  const fetchPreview = async () => {
    setLoadingPreview(true);
    try {
      const res = await fetch("/api/campaigns/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildSegment()),
      });
      if (res.ok) {
        const data = await res.json();
        setPreviewPlayers(data.players);
        setPreviewTotal(data.total);
      }
    } catch (err) {
      console.error("Error previewing:", err);
    } finally {
      setLoadingPreview(false);
    }
  };

  const goToStep = (s: number) => {
    if (s === 3) fetchPreview();
    setStep(s);
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          templateName: selectedTemplate,
          segmentQuery: buildSegment(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al guardar");
        return;
      }
      router.push(`/campaigns/${data.id}`);
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleSendNow = async () => {
    setSending(true);
    setError(null);
    try {
      // Create campaign
      const createRes = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          templateName: selectedTemplate,
          segmentQuery: buildSegment(),
        }),
      });
      const campaign = await createRes.json();
      if (!createRes.ok) {
        setError(campaign.error || "Error al crear");
        return;
      }

      // Send immediately
      const sendRes = await fetch(`/api/campaigns/${campaign.id}/send`, {
        method: "POST",
      });
      const sendData = await sendRes.json();
      if (!sendRes.ok) {
        setError(sendData.error || "Error al enviar");
        return;
      }

      router.push(`/campaigns/${campaign.id}`);
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setSending(false);
    }
  };

  const selectedTemplateObj = templates.find((t) => t.name === selectedTemplate);
  const canProceedStep1 = name.trim() && selectedTemplate;
  const canProceedStep2 = true; // Segment can be empty (all players)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/campaigns">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nueva Campaña</h1>
          <p className="text-muted-foreground mt-1">
            Crea y envía una campaña de WhatsApp segmentada
          </p>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {[
          { n: 1, label: "Información" },
          { n: 2, label: "Segmento" },
          { n: 3, label: "Previsualizar" },
        ].map((s) => (
          <div key={s.n} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium ${
                step === s.n
                  ? "bg-primary text-primary-foreground"
                  : step > s.n
                  ? "bg-green-100 text-green-700"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s.n ? <Check className="h-4 w-4" /> : s.n}
            </div>
            <span className={`text-sm ${step === s.n ? "font-medium" : "text-muted-foreground"}`}>
              {s.label}
            </span>
            {s.n < 3 && <div className="w-8 h-px bg-muted" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Campaign info + template */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información de la Campaña</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre <span className="text-destructive">*</span></Label>
              <Input
                placeholder="Promo fin de semana"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <textarea
                placeholder="Descripción interna de la campaña..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>Template WhatsApp <span className="text-destructive">*</span></Label>
              {loadingTemplates ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando templates...
                </div>
              ) : templates.length === 0 ? (
                <div className="rounded-lg border border-dashed p-4 text-center">
                  <FileText className="h-6 w-6 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    No hay templates disponibles
                  </p>
                  <Link href="/templates">
                    <Button variant="outline" size="sm">
                      Crear Template
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-2">
                  {templates.map((t) => (
                    <div
                      key={t.id}
                      className={`rounded-lg border p-3 cursor-pointer transition-colors ${
                        selectedTemplate === t.name
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedTemplate(t.name)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono font-medium">
                          {t.name}
                        </span>
                        <Badge variant="secondary" className="text-[10px]">
                          {t.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {t.components?.body?.text || ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => goToStep(2)}
                disabled={!canProceedStep1}
              >
                Siguiente: Segmento
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Segment configuration */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Segmentación de Jugadores</CardTitle>
            <CardDescription>
              Filtra qué jugadores recibirán esta campaña. Deja vacío para enviar a todos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Nivel de Engagement</Label>
              <div className="flex flex-wrap gap-2">
                {ENGAGEMENT_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      engagementLevels.includes(level.value)
                        ? level.color + " ring-2 ring-offset-1 ring-primary/30"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                    onClick={() => toggleArrayItem(engagementLevels, level.value, setEngagementLevels)}
                  >
                    {engagementLevels.includes(level.value) && (
                      <Check className="h-3 w-3 mr-1" />
                    )}
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Idioma</Label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    type="button"
                    className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      languages.includes(lang.value)
                        ? "bg-primary/10 text-primary ring-2 ring-offset-1 ring-primary/30"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                    onClick={() => toggleArrayItem(languages, lang.value, setLanguages)}
                  >
                    {languages.includes(lang.value) && (
                      <Check className="h-3 w-3 mr-1" />
                    )}
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rango de Hándicap</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  placeholder="Min (0)"
                  min="0"
                  max="54"
                  value={handicapMin}
                  onChange={(e) => setHandicapMin(e.target.value)}
                  className="w-28"
                />
                <span className="text-muted-foreground">—</span>
                <Input
                  type="number"
                  placeholder="Max (54)"
                  min="0"
                  max="54"
                  value={handicapMax}
                  onChange={(e) => setHandicapMax(e.target.value)}
                  className="w-28"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5" />
                Inscritos en Torneos
              </Label>
              {loadingTournaments ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando torneos...
                </div>
              ) : tournaments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay torneos registrados</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tournaments.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedTournaments.includes(t.id)
                          ? "bg-purple-100 text-purple-700 ring-2 ring-offset-1 ring-primary/30"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                      onClick={() => toggleArrayItem(selectedTournaments, t.id, setSelectedTournaments)}
                    >
                      {selectedTournaments.includes(t.id) && (
                        <Check className="h-3 w-3 mr-1" />
                      )}
                      {t.name}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Selecciona torneos para enviar solo a jugadores inscritos/confirmados
              </p>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Atrás
              </Button>
              <Button onClick={() => goToStep(3)}>
                Siguiente: Previsualizar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Preview + Send */}
      {step === 3 && (
        <div className="space-y-4">
          {/* Campaign summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumen de la Campaña</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Nombre</p>
                  <p className="font-medium">{name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Template</p>
                  <p className="font-mono font-medium">{selectedTemplate}</p>
                </div>
              </div>
              {selectedTemplateObj && (
                <div className="p-3 rounded bg-muted text-sm">
                  {selectedTemplateObj.components?.body?.text}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {engagementLevels.length > 0 && (
                  <Badge variant="secondary">
                    Engagement: {engagementLevels.join(", ")}
                  </Badge>
                )}
                {languages.length > 0 && (
                  <Badge variant="secondary">
                    Idiomas: {languages.join(", ")}
                  </Badge>
                )}
                {(handicapMin || handicapMax) && (
                  <Badge variant="secondary">
                    Hándicap: {handicapMin || "0"}-{handicapMax || "54"}
                  </Badge>
                )}
                {selectedTournaments.length > 0 && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    {selectedTournaments.length} torneo{selectedTournaments.length > 1 ? "s" : ""}
                  </Badge>
                )}
                {engagementLevels.length === 0 && languages.length === 0 && !handicapMin && !handicapMax && selectedTournaments.length === 0 && (
                  <Badge variant="secondary">Todos los jugadores</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recipients preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Destinatarios ({previewTotal})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {loadingPreview ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : previewPlayers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">
                    No hay jugadores que coincidan con este segmento
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {previewPlayers.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {p.firstName[0]}{p.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {p.firstName} {p.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{p.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {p.preferredLanguage}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              Atrás
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={loading || sending}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar Borrador
              </Button>
              <Button
                onClick={handleSendNow}
                disabled={loading || sending || previewTotal === 0}
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Enviar Ahora ({previewTotal})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
