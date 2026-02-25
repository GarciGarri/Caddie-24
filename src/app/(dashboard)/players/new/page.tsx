"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewPlayerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    handicap: "",
    birthday: "",
    preferredLanguage: "ES",
    notes: "",
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear field error on change
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          // Zod validation errors
          const errors: Record<string, string> = {};
          data.details.forEach((d: any) => {
            if (d.path?.[0]) {
              errors[d.path[0]] = d.message;
            }
          });
          setFieldErrors(errors);
        } else {
          setError(data.error || "Error al crear jugador");
        }
        return;
      }

      // Success — redirect to player detail
      router.push(`/players/${data.id}`);
    } catch (err) {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/players">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nuevo Jugador</h1>
          <p className="text-muted-foreground mt-1">
            Registra un nuevo jugador en el sistema
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* General error */}
        {error && (
          <div className="rounded-lg bg-destructive/10 text-destructive px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  Nombre <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="Carlos"
                  value={form.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  className={fieldErrors.firstName ? "border-destructive" : ""}
                />
                {fieldErrors.firstName && (
                  <p className="text-xs text-destructive">
                    {fieldErrors.firstName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Apellido <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="García"
                  value={form.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  className={fieldErrors.lastName ? "border-destructive" : ""}
                />
                {fieldErrors.lastName && (
                  <p className="text-xs text-destructive">
                    {fieldErrors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Teléfono <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  placeholder="+34 612 345 678"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className={fieldErrors.phone ? "border-destructive" : ""}
                />
                {fieldErrors.phone && (
                  <p className="text-xs text-destructive">
                    {fieldErrors.phone}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="carlos@email.com"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={fieldErrors.email ? "border-destructive" : ""}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-destructive">
                    {fieldErrors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="handicap">Hándicap</Label>
                <Input
                  id="handicap"
                  type="number"
                  step="0.1"
                  min="0"
                  max="54"
                  placeholder="12.4"
                  value={form.handicap}
                  onChange={(e) => updateField("handicap", e.target.value)}
                  className={fieldErrors.handicap ? "border-destructive" : ""}
                />
                {fieldErrors.handicap && (
                  <p className="text-xs text-destructive">
                    {fieldErrors.handicap}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthday">Fecha de Nacimiento</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={form.birthday}
                  onChange={(e) => updateField("birthday", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredLanguage">Idioma</Label>
                <select
                  id="preferredLanguage"
                  value={form.preferredLanguage}
                  onChange={(e) =>
                    updateField("preferredLanguage", e.target.value)
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="ES">Español</option>
                  <option value="EN">English</option>
                  <option value="DE">Deutsch</option>
                  <option value="FR">Français</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <textarea
                id="notes"
                placeholder="Notas internas sobre el jugador..."
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href="/players">
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Guardar Jugador
          </Button>
        </div>
      </form>
    </div>
  );
}
