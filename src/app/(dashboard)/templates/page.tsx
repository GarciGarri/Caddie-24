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
  ES: "Español",
  EN: "English",
  DE: "Deutsch",
  FR: "Français",
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
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar template "${name}"?`)) return;
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
                    Solo minúsculas, números y _
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <select
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="ES">Español</option>
                    <option value="EN">English</option>
                    <option value="DE">Deutsch</option>
                    <option value="FR">Français</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="MARKETING">Marketing</option>
                    <option value="UTILITY">Utilidad</option>
                    <option value="AUTHENTICATION">Autenticación</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bodyText">
                  Texto del mensaje <span className="text-destructive">*</span>
                </Label>
                <textarea
                  id="bodyText"
                  placeholder={"¡Hola {{1}}! Te invitamos a {{2}} este fin de semana..."}
                  value={form.bodyText}
                  onChange={(e) => setForm({ ...form, bodyText: e.target.value })}
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm resize-none"
                />
                <p className="text-[11px] text-muted-foreground">
                  {"Usa {{1}}, {{2}}, etc. para variables dinámicas"}
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
              No hay templates aún. Crea el primero.
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
