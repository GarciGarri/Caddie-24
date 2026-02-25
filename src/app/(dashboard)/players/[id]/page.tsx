"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Phone,
  Mail,
  Calendar,
  Trophy,
  Globe,
  MessageSquare,
  MapPin,
  ShoppingBag,
  TrendingUp,
  Clock,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const engagementColors: Record<string, string> = {
  VIP: "bg-purple-100 text-purple-800",
  HIGH: "bg-green-100 text-green-800",
  MEDIUM: "bg-blue-100 text-blue-800",
  LOW: "bg-yellow-100 text-yellow-800",
  NEW: "bg-gray-100 text-gray-800",
};

const engagementLabels: Record<string, string> = {
  VIP: "VIP",
  HIGH: "Alto",
  MEDIUM: "Medio",
  LOW: "Bajo",
  NEW: "Nuevo",
};

const languageLabels: Record<string, string> = {
  ES: "Español",
  EN: "English",
  DE: "Deutsch",
  FR: "Français",
};

const consumptionCategoryLabels: Record<string, string> = {
  GREEN_FEE: "Green Fee",
  RESTAURANT: "Restaurante",
  SHOP: "Tienda Pro",
  SUBSCRIPTION: "Abono",
  LESSON: "Clase",
  EVENT: "Evento",
  OTHER: "Otro",
};

export default function PlayerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "visits" | "consumption" | "conversations"
  >("overview");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    fetchPlayer();
  }, [id]);

  const fetchPlayer = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/players/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("Jugador no encontrado");
          return;
        }
        throw new Error("Error");
      }
      const data = await res.json();
      setPlayer(data);
      setEditForm({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email || "",
        handicap: data.handicap ?? "",
        birthday: data.birthday
          ? new Date(data.birthday).toISOString().split("T")[0]
          : "",
        preferredLanguage: data.preferredLanguage,
        notes: data.notes || "",
      });
    } catch (err) {
      setError("Error al cargar jugador");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/players/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setPlayer((prev: any) => ({ ...prev, ...updated }));
        setEditing(false);
        fetchPlayer(); // Refresh all data
      } else {
        const data = await res.json();
        alert(data.error || "Error al guardar");
      }
    } catch (err) {
      alert("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground mb-4">{error}</p>
        <Link href="/players">
          <Button variant="outline">Volver a Jugadores</Button>
        </Link>
      </div>
    );
  }

  const tabs = [
    { key: "overview", label: "Resumen" },
    { key: "visits", label: `Visitas (${player._count?.visits || 0})` },
    {
      key: "consumption",
      label: `Consumo (${player._count?.consumptions || 0})`,
    },
    {
      key: "conversations",
      label: `Mensajes (${player._count?.conversations || 0})`,
    },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/players">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-4 flex-1">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {player.firstName[0]}
              {player.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {player.firstName} {player.lastName}
              </h1>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  engagementColors[player.engagementLevel] || ""
                }`}
              >
                {engagementLabels[player.engagementLevel] ||
                  player.engagementLevel}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" /> {player.phone}
              </span>
              {player.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {player.email}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" />{" "}
                {languageLabels[player.preferredLanguage] ||
                  player.preferredLanguage}
              </span>
            </div>
          </div>
          <div>
            {editing ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(false)}
                >
                  <X className="h-4 w-4 mr-1" /> Cancelar
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  Guardar
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
              >
                <Edit2 className="h-4 w-4 mr-1" /> Editar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tags */}
      {player.tags && player.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap pl-[4.5rem]">
          {player.tags.map((tag: any) => (
            <Badge key={tag.id} variant="secondary">
              {tag.tag}
              {tag.confidence && (
                <span className="ml-1 text-[10px] opacity-60">
                  {Math.round(tag.confidence * 100)}%
                </span>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              activeTab === tab.key
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Info */}
          <div className="lg:col-span-2 space-y-6">
            {editing ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Editar Información</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre</Label>
                      <Input
                        value={editForm.firstName}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            firstName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Apellido</Label>
                      <Input
                        value={editForm.lastName}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            lastName: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Teléfono</Label>
                      <Input
                        value={editForm.phone}
                        onChange={(e) =>
                          setEditForm({ ...editForm, phone: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Hándicap</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={editForm.handicap}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            handicap: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha de Nacimiento</Label>
                      <Input
                        type="date"
                        value={editForm.birthday}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            birthday: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Idioma</Label>
                      <select
                        value={editForm.preferredLanguage}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            preferredLanguage: e.target.value,
                          })
                        }
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                      >
                        <option value="ES">Español</option>
                        <option value="EN">English</option>
                        <option value="DE">Deutsch</option>
                        <option value="FR">Français</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Notas</Label>
                    <textarea
                      value={editForm.notes}
                      onChange={(e) =>
                        setEditForm({ ...editForm, notes: e.target.value })
                      }
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Información del Jugador
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                    <InfoRow
                      icon={<Trophy className="h-4 w-4" />}
                      label="Hándicap"
                      value={player.handicap?.toString() || "Sin definir"}
                    />
                    <InfoRow
                      icon={<Calendar className="h-4 w-4" />}
                      label="Cumpleaños"
                      value={
                        player.birthday
                          ? new Date(player.birthday).toLocaleDateString(
                              "es-ES",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "Sin definir"
                      }
                    />
                    <InfoRow
                      icon={<Clock className="h-4 w-4" />}
                      label="Horario Preferido"
                      value={player.preferredPlayTime || "Sin definir"}
                    />
                    <InfoRow
                      icon={<Calendar className="h-4 w-4" />}
                      label="Días Preferidos"
                      value={player.playDayPreference || "Sin definir"}
                    />
                    <InfoRow
                      icon={<Globe className="h-4 w-4" />}
                      label="Estilo de Juego"
                      value={player.playStylePreference || "Sin definir"}
                    />
                    <InfoRow
                      icon={<MapPin className="h-4 w-4" />}
                      label="Origen"
                      value={player.source || "manual"}
                    />
                  </div>
                  {player.notes && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Notas
                        </p>
                        <p className="text-sm">{player.notes}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Stats */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    {player._count?.visits || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Visitas totales
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {Number(player.totalSpending || 0).toFixed(2)}&euro;
                  </p>
                  <p className="text-sm text-muted-foreground">Gasto total</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-3xl font-bold">
                    {player._count?.conversations || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Conversaciones
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    Registrado
                  </p>
                  <p className="text-sm font-medium">
                    {new Date(player.createdAt).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "visits" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Historial de Visitas</CardTitle>
          </CardHeader>
          <CardContent>
            {player.visits && player.visits.length > 0 ? (
              <div className="space-y-3">
                {player.visits.map((visit: any) => (
                  <div
                    key={visit.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-green-100 p-2">
                        <MapPin className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {visit.courseType === "18-holes"
                            ? "18 Hoyos"
                            : "9 Hoyos"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(visit.date).toLocaleDateString("es-ES", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {visit.duration && (
                        <p className="text-sm text-muted-foreground">
                          {Math.floor(visit.duration / 60)}h{" "}
                          {visit.duration % 60}min
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No hay visitas registradas</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "consumption" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Historial de Consumo</CardTitle>
              <p className="text-sm font-medium text-green-600">
                Total: {Number(player.totalSpending || 0).toFixed(2)}&euro;
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {player.consumptions && player.consumptions.length > 0 ? (
              <div className="space-y-3">
                {player.consumptions.map((consumption: any) => (
                  <div
                    key={consumption.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-blue-100 p-2">
                        <ShoppingBag className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {consumption.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {consumptionCategoryLabels[consumption.category] ||
                            consumption.category}{" "}
                          &middot;{" "}
                          {new Date(consumption.date).toLocaleDateString(
                            "es-ES"
                          )}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold">
                      {Number(consumption.amount).toFixed(2)}&euro;
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No hay consumos registrados</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "conversations" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conversaciones WhatsApp</CardTitle>
          </CardHeader>
          <CardContent>
            {player.conversations && player.conversations.length > 0 ? (
              <div className="space-y-3">
                {player.conversations.map((conv: any) => (
                  <div
                    key={conv.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-green-100 p-2">
                        <MessageSquare className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {conv.lastMessagePreview || "Sin mensajes"}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge
                            variant={
                              conv.status === "OPEN" ? "default" : "secondary"
                            }
                            className="text-[10px]"
                          >
                            {conv.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {conv._count?.messages || 0} mensajes
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {conv.lastMessageAt
                          ? new Date(conv.lastMessageAt).toLocaleDateString(
                              "es-ES"
                            )
                          : ""}
                      </p>
                      {conv.unreadCount > 0 && (
                        <Badge variant="default" className="text-[10px] mt-1">
                          {conv.unreadCount} sin leer
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No hay conversaciones</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
