"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Plus,
  Loader2,
  Trash2,
  Pencil,
  X,
  Save,
  Globe,
  Sparkles,
  RefreshCw,
  SmilePlus,
  ArrowUpCircle,
  ArrowDownCircle,
  Wand2,
  ChevronDown,
  ChevronUp,
  Zap,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Template {
  id: string;
  name: string;
  language: string;
  category: string;
  status: string;
  components: any;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  REJECTED: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  APPROVED: "Aprobado",
  PENDING: "Pendiente",
  REJECTED: "Rechazado",
};

const langLabels: Record<string, string> = {
  ES: "Espanol",
  EN: "English",
  DE: "Deutsch",
  FR: "Francais",
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    language: "ES",
    category: "MARKETING",
    bodyText: "",
  });

  // AI Assistant state
  const [showAi, setShowAi] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiTone, setAiTone] = useState<"formal" | "casual" | "friendly" | "urgent">("friendly");
  const [aiEmojis, setAiEmojis] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiHistory, setAiHistory] = useState<string[]>([]);
  const [aiHistoryIndex, setAiHistoryIndex] = useState(-1);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const resetForm = () => {
    setForm({ name: "", language: "ES", category: "MARKETING", bodyText: "" });
    setEditingId(null);
    setShowForm(false);
    setError(null);
    setShowAi(false);
    setAiPrompt("");
    setAiError(null);
    setAiHistory([]);
    setAiHistoryIndex(-1);
  };

  const startEdit = (t: Template) => {
    setForm({
      name: t.name,
      language: t.language,
      category: t.category,
      bodyText: t.components?.body?.text || "",
    });
    setEditingId(t.id);
    setShowForm(true);
    setError(null);
    setShowAi(false);
    setAiHistory([]);
    setAiHistoryIndex(-1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = editingId ? `/api/templates/${editingId}` : "/api/templates";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al guardar");
        return;
      }

      resetForm();
      fetchTemplates();
    } catch (err) {
      setError("Error de conexion");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Eliminar template "${name}"?`)) return;
    setDeleting(id);
    try {
      await fetch(`/api/templates/${id}`, { method: "DELETE" });
      fetchTemplates();
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setDeleting(null);
    }
  };

  // AI generation functions
  const callAiGenerate = async (mode: string, extraParams: Record<string, any> = {}) => {
    setAiLoading(true);
    setAiError(null);

    try {
      const res = await fetch("/api/templates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          tone: aiTone,
          language: form.language,
          category: form.category,
          addEmojis: aiEmojis,
          currentText: form.bodyText,
          mode,
          ...extraParams,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error || "Error al generar");
        return;
      }

      // Save to history before replacing
      if (form.bodyText) {
        setAiHistory((prev) => [...prev, form.bodyText]);
        setAiHistoryIndex(-1);
      }

      setForm((prev) => ({ ...prev, bodyText: data.text }));
    } catch (err) {
      setAiError("Error de conexion con la IA");
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerate = () => {
    if (!aiPrompt.trim()) {
      setAiError("Escribe una descripcion del mensaje que quieres generar");
      return;
    }
    callAiGenerate("generate");
  };

  const handleRegenerate = () => {
    if (!aiPrompt.trim()) {
      setAiError("Escribe una descripcion para regenerar");
      return;
    }
    callAiGenerate("generate");
  };

  const handleImprove = () => {
    if (!form.bodyText.trim()) {
      setAiError("Necesitas tener texto para mejorar");
      return;
    }
    callAiGenerate("improve");
  };

  const handleAddEmojis = () => {
    if (!form.bodyText.trim()) {
      setAiError("Necesitas tener texto para anadir emojis");
      return;
    }
    callAiGenerate("add_emojis");
  };

  const handleMoreFormal = () => {
    if (!form.bodyText.trim()) {
      setAiError("Necesitas tener texto para cambiar el tono");
      return;
    }
    callAiGenerate("more_formal");
  };

  const handleMoreCasual = () => {
    if (!form.bodyText.trim()) {
      setAiError("Necesitas tener texto para cambiar el tono");
      return;
    }
    callAiGenerate("more_casual");
  };

  const handleUndo = () => {
    if (aiHistory.length > 0) {
      const lastText = aiHistory[aiHistory.length - 1];
      setAiHistory((prev) => prev.slice(0, -1));
      setForm((prev) => ({ ...prev, bodyText: lastText }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Templates WhatsApp
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus plantillas de mensajes
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Template
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {editingId ? "Editar Template" : "Nuevo Template"}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 text-destructive px-4 py-3 text-sm">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nombre (slug) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="promo_weekend"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    disabled={!!editingId}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Solo minusculas, numeros y _
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <select
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="ES">Espanol</option>
                    <option value="EN">English</option>
                    <option value="DE">Deutsch</option>
                    <option value="FR">Francais</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="MARKETING">Marketing</option>
                    <option value="UTILITY">Utilidad</option>
                    <option value="AUTHENTICATION">Autenticacion</option>
                  </select>
                </div>
              </div>

              {/* AI Assistant Panel */}
              <div className="rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowAi(!showAi)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-purple-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                      <Sparkles className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="font-medium text-sm">Asistente IA</span>
                    <Badge variant="secondary" className="text-[10px] bg-purple-100 text-purple-700">
                      GPT-4o
                    </Badge>
                  </div>
                  {showAi ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                {showAi && (
                  <div className="px-4 pb-4 space-y-3 border-t border-purple-100">
                    {aiError && (
                      <div className="rounded-lg bg-red-50 text-red-600 px-3 py-2 text-xs mt-3">
                        {aiError}
                      </div>
                    )}

                    {/* Prompt input */}
                    <div className="space-y-1.5 mt-3">
                      <Label className="text-xs text-purple-700">
                        Describe el mensaje que quieres generar
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ej: Promocion de green fee de fin de semana con descuento del 20%..."
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          className="flex-1 text-sm border-purple-200 focus-visible:ring-purple-400"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleGenerate();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={handleGenerate}
                          disabled={aiLoading}
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                          size="sm"
                        >
                          {aiLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Wand2 className="h-4 w-4 mr-1" />
                              Generar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Tone and Emoji options */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Label className="text-[11px] text-muted-foreground whitespace-nowrap">Tono:</Label>
                        <div className="flex gap-1">
                          {[
                            { value: "friendly", label: "Amigable", icon: "😊" },
                            { value: "formal", label: "Formal", icon: "👔" },
                            { value: "casual", label: "Casual", icon: "✌️" },
                            { value: "urgent", label: "Urgente", icon: "⚡" },
                          ].map((t) => (
                            <button
                              key={t.value}
                              type="button"
                              onClick={() => setAiTone(t.value as typeof aiTone)}
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                                aiTone === t.value
                                  ? "bg-purple-600 text-white"
                                  : "bg-white text-gray-600 hover:bg-purple-50 border border-gray-200"
                              }`}
                            >
                              <span>{t.icon}</span>
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setAiEmojis(!aiEmojis)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                            aiEmojis
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-white text-gray-500 border border-gray-200"
                          }`}
                        >
                          <SmilePlus className="h-3 w-3" />
                          Emojis {aiEmojis ? "ON" : "OFF"}
                        </button>
                      </div>
                    </div>

                    {/* Action buttons for existing text */}
                    {form.bodyText && (
                      <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                        <span className="text-[11px] text-muted-foreground mr-1">Acciones:</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleRegenerate}
                          disabled={aiLoading}
                          className="h-7 text-[11px] gap-1 border-purple-200 hover:bg-purple-50"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Regenerar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleImprove}
                          disabled={aiLoading}
                          className="h-7 text-[11px] gap-1 border-purple-200 hover:bg-purple-50"
                        >
                          <Zap className="h-3 w-3" />
                          Mejorar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddEmojis}
                          disabled={aiLoading}
                          className="h-7 text-[11px] gap-1 border-purple-200 hover:bg-purple-50"
                        >
                          <SmilePlus className="h-3 w-3" />
                          Emojis
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleMoreFormal}
                          disabled={aiLoading}
                          className="h-7 text-[11px] gap-1 border-purple-200 hover:bg-purple-50"
                        >
                          <ArrowUpCircle className="h-3 w-3" />
                          Formal
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleMoreCasual}
                          disabled={aiLoading}
                          className="h-7 text-[11px] gap-1 border-purple-200 hover:bg-purple-50"
                        >
                          <ArrowDownCircle className="h-3 w-3" />
                          Casual
                        </Button>
                        {aiHistory.length > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleUndo}
                            className="h-7 text-[11px] gap-1 text-muted-foreground"
                          >
                            Deshacer
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Loading indicator */}
                    {aiLoading && (
                      <div className="flex items-center gap-2 py-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                        <span className="text-xs text-purple-600">Generando con IA...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Body text textarea */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bodyText">
                    Texto del mensaje <span className="text-destructive">*</span>
                  </Label>
                  {form.bodyText && (
                    <span className="text-[11px] text-muted-foreground">
                      {form.bodyText.length} / 4096 caracteres
                    </span>
                  )}
                </div>
                <textarea
                  id="bodyText"
                  placeholder={"Hola {{1}}! Te invitamos a {{2}} este fin de semana..."}
                  value={form.bodyText}
                  onChange={(e) => setForm({ ...form, bodyText: e.target.value })}
                  rows={5}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm resize-none"
                />
                <p className="text-[11px] text-muted-foreground">
                  {"Usa {{1}}, {{2}}, etc. para variables dinamicas. {{1}} = nombre del jugador."}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {editingId ? "Actualizar" : "Crear Template"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Templates grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : templates.length === 0 && !showForm ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground/20 mb-3" />
            <p className="text-muted-foreground mb-4">
              No hay templates aun. Crea el primero.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <Card key={t.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium font-mono">
                    {t.name}
                  </CardTitle>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      statusColors[t.status] || ""
                    }`}
                  >
                    {statusLabels[t.status] || t.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-[10px]">
                    {t.category}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {langLabels[t.language] || t.language}
                  </span>
                </div>
                <div className="p-2 rounded bg-muted text-xs leading-relaxed">
                  {t.components?.body?.text || "Sin contenido"}
                </div>
                <div className="flex items-center justify-end gap-1 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => startEdit(t)}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive"
                    onClick={() => handleDelete(t.id, t.name)}
                    disabled={deleting === t.id}
                  >
                    {deleting === t.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3 mr-1" />
                    )}
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
