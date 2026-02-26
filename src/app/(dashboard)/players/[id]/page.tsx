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
  Sparkles,
  Send,
  PhoneCall,
  AlertTriangle,
  CheckCircle,
  Copy,
  RefreshCw,
  Lightbulb,
  Medal,
  Crown,
  Award,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

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
    "overview" | "visits" | "consumption" | "conversations" | "tournaments"
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
        toast.success("Jugador actualizado");
        fetchPlayer(); // Refresh all data
      } else {
        const data = await res.json();
        toast.error(data.error || "Error al guardar los cambios");
      }
    } catch (err) {
      toast.error("Error al guardar los cambios");
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
    { key: "tournaments", label: "Torneos" },
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

      {/* AI Communication Suggestions — visible in overview */}
      {activeTab === "overview" && (
        <AiSuggestionsPanel playerId={id} />
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

      {activeTab === "tournaments" && (
        <PlayerTournamentsTab playerId={player.id} />
      )}
    </div>
  );
}

// --- Player Tournaments History Tab ---
function PlayerTournamentsTab({ playerId }: { playerId: string }) {
  const [data, setData] = useState<{
    registrations: any[];
    results: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Fetch all tournaments and filter by player
        const res = await fetch("/api/tournaments?limit=100");
        if (!res.ok) throw new Error();
        const tournamentsData = await res.json();
        const allTournaments = tournamentsData.tournaments || [];

        // For each tournament, check if player is registered or has results
        const registrations: any[] = [];
        const results: any[] = [];

        for (const t of allTournaments) {
          const detailRes = await fetch(`/api/tournaments/${t.id}`);
          if (!detailRes.ok) continue;
          const detail = await detailRes.json();

          const reg = (detail.registrations || []).find(
            (r: any) => r.player?.id === playerId || r.playerId === playerId
          );
          if (reg) {
            registrations.push({ ...reg, tournament: detail });
          }

          const result = (detail.results || []).find(
            (r: any) => r.player?.id === playerId || r.playerId === playerId
          );
          if (result) {
            results.push({ ...result, tournament: detail });
          }
        }

        setData({ registrations, results });
      } catch {
        console.error("Error fetching tournament history");
      } finally {
        setLoading(false);
      }
    })();
  }, [playerId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data || (data.registrations.length === 0 && data.results.length === 0)) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
        <p className="text-muted-foreground">
          Este jugador no ha participado en ningún torneo
        </p>
      </div>
    );
  }

  const posIcons = [Crown, Medal, Award];
  const posColors = ["text-amber-500", "text-gray-400", "text-amber-700"];

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Trophy className="h-5 w-5 text-indigo-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{data.registrations.length}</p>
            <p className="text-xs text-muted-foreground">Torneos jugados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Medal className="h-5 w-5 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">
              {data.results.filter((r) => r.positionOverall && r.positionOverall <= 3).length}
            </p>
            <p className="text-xs text-muted-foreground">Podios</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">
              {data.results.length > 0
                ? Math.min(...data.results.filter((r) => r.netScore).map((r) => r.netScore))
                : "—"}
            </p>
            <p className="text-xs text-muted-foreground">Mejor score neto</p>
          </CardContent>
        </Card>
      </div>

      {/* Tournament history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial de torneos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.registrations.map((reg) => {
              const result = data.results.find(
                (r) => r.tournament.id === reg.tournament.id
              );
              const isTop3 = result?.positionOverall && result.positionOverall <= 3;
              const PosIcon = isTop3 ? posIcons[result.positionOverall - 1] : null;

              return (
                <div
                  key={reg.id}
                  className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/30"
                >
                  {isTop3 && PosIcon ? (
                    <PosIcon
                      className={`h-6 w-6 shrink-0 ${
                        posColors[result.positionOverall - 1]
                      }`}
                    />
                  ) : (
                    <Trophy className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{reg.tournament.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {new Date(reg.tournament.date).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        {reg.tournament.format}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {result ? (
                      <>
                        {result.positionOverall && (
                          <p className="text-sm font-bold">
                            #{result.positionOverall}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {result.netScore
                            ? `Neto: ${result.netScore}`
                            : result.grossScore
                            ? `Bruto: ${result.grossScore}`
                            : ""}
                        </p>
                      </>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="text-[10px]"
                      >
                        {reg.status === "REGISTERED" ? "Inscrito" : reg.status}
                      </Badge>
                    )}
                  </div>
                  <Link href={`/tournaments/${reg.tournament.id}`}>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- AI Communication Suggestions Panel ---
function AiSuggestionsPanel({ playerId }: { playerId: string }) {
  const [suggestions, setSuggestions] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/players/${playerId}/ai-suggestions`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al generar sugerencias");
        return;
      }
      const data = await res.json();
      setSuggestions(data);
    } catch {
      setError("Error de conexion");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const riskConfig: Record<string, { color: string; bg: string; icon: any }> = {
    BAJO: { color: "text-green-700", bg: "bg-green-50 border-green-200", icon: CheckCircle },
    MEDIO: { color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", icon: AlertTriangle },
    ALTO: { color: "text-red-700", bg: "bg-red-50 border-red-200", icon: AlertTriangle },
  };

  const typeConfig: Record<string, { icon: any; label: string; color: string }> = {
    whatsapp: { icon: MessageSquare, label: "WhatsApp", color: "text-green-600 bg-green-50" },
    email: { icon: Mail, label: "Email", color: "text-blue-600 bg-blue-50" },
    llamada: { icon: PhoneCall, label: "Llamada", color: "text-orange-600 bg-orange-50" },
  };

  const priorityColors: Record<string, string> = {
    alta: "bg-red-100 text-red-700",
    media: "bg-yellow-100 text-yellow-700",
    baja: "bg-gray-100 text-gray-600",
  };

  // Not loaded yet — show CTA
  if (!suggestions && !loading && !error) {
    return (
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50/30 to-indigo-50/30">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-3">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Comunicacion Sugerida por IA</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
            Analiza el perfil, gasto, afluencia e historial de este jugador para generar
            sugerencias de comunicacion personalizadas
          </p>
          <Button
            onClick={fetchSuggestions}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generar Sugerencias
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Loading
  if (loading) {
    return (
      <Card className="border-purple-200">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="flex gap-1.5 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <p className="text-sm text-purple-600 font-medium">Analizando perfil del jugador...</p>
          <p className="text-xs text-muted-foreground mt-1">Generando sugerencias personalizadas con IA</p>
        </CardContent>
      </Card>
    );
  }

  // Error
  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <AlertTriangle className="h-8 w-8 text-red-400 mb-2" />
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchSuggestions}>
            <RefreshCw className="h-3 w-3 mr-1" /> Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Results
  const risk = riskConfig[suggestions.riesgo] || riskConfig.BAJO;
  const RiskIcon = risk.icon;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-purple-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <CardTitle className="text-lg">Comunicacion Sugerida por IA</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchSuggestions} disabled={loading}>
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
              Regenerar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary + Risk */}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Analisis del Perfil</p>
              <p className="text-sm leading-relaxed">{suggestions.resumen}</p>
            </div>
            <div className={`rounded-lg border p-3 ${risk.bg}`}>
              <div className="flex items-center gap-2 mb-1">
                <RiskIcon className={`h-4 w-4 ${risk.color}`} />
                <p className={`text-xs font-semibold ${risk.color}`}>
                  Riesgo de Abandono: {suggestions.riesgo}
                </p>
              </div>
              <p className="text-xs leading-relaxed">{suggestions.razonRiesgo}</p>
            </div>
          </div>

          {/* Opportunities */}
          {suggestions.oportunidades && suggestions.oportunidades.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Lightbulb className="h-3 w-3" /> Oportunidades detectadas
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.oportunidades.map((opp: string, i: number) => (
                  <span key={i} className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-xs text-purple-700 border border-purple-200">
                    {opp}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggestion Cards */}
      <div className="grid gap-3">
        {suggestions.sugerencias?.map((sug: any, idx: number) => {
          const tc = typeConfig[sug.tipo] || typeConfig.whatsapp;
          const TypeIcon = tc.icon;
          return (
            <Card key={idx} className="overflow-hidden">
              <div className="flex">
                {/* Left accent */}
                <div className={`w-1 ${sug.prioridad === "alta" ? "bg-red-500" : sug.prioridad === "media" ? "bg-yellow-500" : "bg-gray-300"}`} />
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      {/* Header row */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${tc.color}`}>
                          <TypeIcon className="h-3 w-3" />
                          {tc.label}
                        </span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityColors[sug.prioridad] || ""}`}>
                          {sug.prioridad === "alta" ? "Prioridad Alta" : sug.prioridad === "media" ? "Prioridad Media" : "Prioridad Baja"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {sug.momento}
                        </span>
                      </div>
                      {/* Title */}
                      <p className="text-sm font-semibold mb-1">{sug.asunto}</p>
                      {/* Reason */}
                      <p className="text-xs text-muted-foreground mb-2">{sug.razon}</p>
                      {/* Message */}
                      <div className="rounded-lg bg-muted/60 p-3 relative group">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap pr-8">{sug.mensaje}</p>
                        <button
                          onClick={() => handleCopy(sug.mensaje, idx)}
                          className="absolute top-2 right-2 p-1.5 rounded-md bg-white/80 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Copiar mensaje"
                        >
                          {copiedIdx === idx ? (
                            <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
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
