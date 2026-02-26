"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  ArrowLeft,
  Users,
  CalendarDays,
  Clock,
  DollarSign,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  CreditCard,
  UserPlus,
  Search,
  Save,
  Medal,
  Crown,
  Award,
  Send,
  Sparkles,
  RefreshCw,
  Copy,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const FORMAT_LABELS: Record<string, string> = {
  STABLEFORD: "Stableford",
  MEDAL: "Medal Play",
  SCRAMBLE: "Scramble",
  MATCH_PLAY: "Match Play",
  BEST_BALL: "Best Ball",
  FOURBALL: "Fourball",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: "Borrador", color: "text-gray-700", bg: "bg-gray-100" },
  OPEN: { label: "Inscripciones abiertas", color: "text-green-700", bg: "bg-green-100" },
  CLOSED: { label: "Inscripciones cerradas", color: "text-yellow-700", bg: "bg-yellow-100" },
  IN_PROGRESS: { label: "En curso", color: "text-blue-700", bg: "bg-blue-100" },
  COMPLETED: { label: "Completado", color: "text-purple-700", bg: "bg-purple-100" },
  CANCELLED: { label: "Cancelado", color: "text-red-700", bg: "bg-red-100" },
};

const PAYMENT_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  PAID: { label: "Pagado", color: "bg-green-100 text-green-800" },
  REFUNDED: { label: "Reembolsado", color: "bg-red-100 text-red-800" },
  WAIVED: { label: "Exento", color: "bg-blue-100 text-blue-800" },
};

const REG_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  REGISTERED: { label: "Inscrito", color: "bg-green-100 text-green-800" },
  WAITLIST: { label: "Lista de espera", color: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "Confirmado", color: "bg-blue-100 text-blue-800" },
  CANCELLED: { label: "Cancelado", color: "bg-red-100 text-red-800" },
  NO_SHOW: { label: "No presentado", color: "bg-gray-100 text-gray-800" },
};

const TABS = [
  { key: "overview", label: "Resumen" },
  { key: "registrations", label: "Inscritos" },
  { key: "results", label: "Resultados" },
  { key: "leaderboard", label: "Leaderboard" },
  { key: "communication", label: "Comunicación" },
];

export default function TournamentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTournament = useCallback(async () => {
    try {
      const res = await fetch(`/api/tournaments/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTournament(data);
    } catch {
      console.error("Error fetching tournament");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTournament();
  }, [fetchTournament]);

  const updateStatus = async (status: string) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/tournaments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success("Estado actualizado");
        fetchTournament();
      } else {
        toast.error("Error al actualizar el estado");
      }
    } catch {
      toast.error("Error al actualizar el estado");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Torneo no encontrado</p>
        <Link href="/tournaments">
          <Button className="mt-4">Volver a torneos</Button>
        </Link>
      </div>
    );
  }

  const statusConf = STATUS_CONFIG[tournament.status] || STATUS_CONFIG.DRAFT;
  const registeredCount = tournament.registrations?.filter(
    (r: any) => r.status === "REGISTERED" || r.status === "CONFIRMED"
  ).length || 0;
  const waitlistCount = tournament.registrations?.filter(
    (r: any) => r.status === "WAITLIST"
  ).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Link href="/tournaments">
            <Button variant="ghost" size="icon" className="mt-1">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">{tournament.name}</h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConf.bg} ${statusConf.color}`}
              >
                {statusConf.label}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {new Date(tournament.date).toLocaleDateString("es-ES", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              {tournament.teeTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {tournament.teeTime}
                </span>
              )}
              <Badge variant="secondary">
                {FORMAT_LABELS[tournament.format]}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {tournament.status === "DRAFT" && (
            <Button
              onClick={() => updateStatus("OPEN")}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Abrir inscripciones
            </Button>
          )}
          {tournament.status === "OPEN" && (
            <>
              <Button
                variant="outline"
                onClick={() => updateStatus("CLOSED")}
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Cerrar inscripciones
              </Button>
              <Button onClick={() => updateStatus("IN_PROGRESS")} disabled={actionLoading}>
                {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Iniciar torneo
              </Button>
            </>
          )}
          {tournament.status === "CLOSED" && (
            <Button onClick={() => updateStatus("IN_PROGRESS")} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Iniciar torneo
            </Button>
          )}
          {tournament.status === "IN_PROGRESS" && (
            <Button onClick={() => updateStatus("COMPLETED")} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Finalizar torneo
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.key === "registrations" && (
                <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.5 rounded-full">
                  {registeredCount}
                </span>
              )}
              {tab.key === "results" && tournament.results?.length > 0 && (
                <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.5 rounded-full">
                  {tournament.results.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <OverviewTab tournament={tournament} />
      )}
      {activeTab === "registrations" && (
        <RegistrationsTab
          tournament={tournament}
          onRefresh={fetchTournament}
        />
      )}
      {activeTab === "results" && (
        <ResultsTab tournament={tournament} onRefresh={fetchTournament} />
      )}
      {activeTab === "leaderboard" && (
        <LeaderboardTab tournamentId={tournament.id} />
      )}
      {activeTab === "communication" && (
        <CommunicationTab tournament={tournament} />
      )}
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────
function OverviewTab({ tournament }: { tournament: any }) {
  const registeredCount = tournament.registrations?.filter(
    (r: any) => r.status === "REGISTERED" || r.status === "CONFIRMED"
  ).length || 0;
  const revenueEstimate = registeredCount * Number(tournament.entryFee || 0);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <p className="text-2xl font-bold">{registeredCount}</p>
              <p className="text-xs text-muted-foreground">
                / {tournament.maxParticipants} inscritos
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <DollarSign className="h-5 w-5 text-green-500 mx-auto mb-1" />
              <p className="text-2xl font-bold">{revenueEstimate}€</p>
              <p className="text-xs text-muted-foreground">Recaudación est.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Trophy className="h-5 w-5 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-bold">
                {tournament.totalPrize ? `${Number(tournament.totalPrize)}€` : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Premio total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <CreditCard className="h-5 w-5 text-purple-500 mx-auto mb-1" />
              <p className="text-2xl font-bold">
                {tournament.entryFee ? `${Number(tournament.entryFee)}€` : "Gratis"}
              </p>
              <p className="text-xs text-muted-foreground">Cuota inscripción</p>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        {tournament.description && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">
                {tournament.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Categories */}
        {tournament.categories?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Categorías ({tournament.categories.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tournament.categories.map((cat: any) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {cat.type === "HANDICAP_RANGE" &&
                          `Hcp ${cat.handicapMin ?? 0} — ${cat.handicapMax ?? 54}`}
                        {cat.type === "GENDER" && `Género: ${cat.gender}`}
                        {cat.type === "NET" && "Clasificación Neto"}
                        {cat.type === "GROSS" && "Clasificación Bruto"}
                      </p>
                    </div>
                    {cat.prizeAmount && (
                      <Badge variant="secondary">
                        {Number(cat.prizeAmount)}€
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right sidebar info */}
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Formato</p>
              <p className="font-medium">
                {FORMAT_LABELS[tournament.format]}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground">
                Sistema Handicap
              </p>
              <p className="font-medium">
                {tournament.handicapSystem || "EGA"}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground">
                Canal comunicación
              </p>
              <Badge variant="secondary">
                {tournament.preferredChannel || "whatsapp"}
              </Badge>
            </div>
            {tournament.cancellationPolicy && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Política cancelación
                  </p>
                  <p className="text-sm">{tournament.cancellationPolicy}</p>
                </div>
              </>
            )}
            {tournament.sponsors && (tournament.sponsors as any[]).length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Patrocinadores
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(tournament.sponsors as any[]).map(
                      (s: any, i: number) => (
                        <Badge key={i} variant="secondary">
                          {s.name}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Top 3 Winners (if completed) */}
        {tournament.results?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Medal className="h-4 w-4 text-amber-500" />
                Podio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tournament.results
                .filter((r: any) => r.positionOverall && r.positionOverall <= 3)
                .sort((a: any, b: any) => a.positionOverall - b.positionOverall)
                .map((r: any) => {
                  const icons = [Crown, Medal, Award];
                  const colors = [
                    "text-amber-500",
                    "text-gray-400",
                    "text-amber-700",
                  ];
                  const Icon = icons[r.positionOverall - 1] || Award;
                  return (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          colors[r.positionOverall - 1]
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {r.player.firstName} {r.player.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {r.netScore
                            ? `Neto: ${r.netScore}`
                            : r.grossScore
                            ? `Bruto: ${r.grossScore}`
                            : ""}
                        </p>
                      </div>
                      {r.prizeWon && (
                        <Badge variant="secondary">
                          {Number(r.prizeWon)}€
                        </Badge>
                      )}
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ── Registrations Tab ─────────────────────────────────────────
function RegistrationsTab({
  tournament,
  onRefresh,
}: {
  tournament: any;
  onRefresh: () => void;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [playerSearch, setPlayerSearch] = useState("");
  const [adding, setAdding] = useState("");

  const registrations = tournament.registrations || [];
  const registered = registrations.filter(
    (r: any) => r.status !== "WAITLIST" && r.status !== "CANCELLED"
  );
  const waitlist = registrations.filter((r: any) => r.status === "WAITLIST");
  const cancelled = registrations.filter((r: any) => r.status === "CANCELLED");

  const filtered = registrations.filter((r: any) => {
    if (!search) return true;
    const name = `${r.player.firstName} ${r.player.lastName}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const searchPlayers = useCallback(async () => {
    if (!playerSearch.trim()) return;
    setLoadingPlayers(true);
    try {
      const res = await fetch(`/api/players?search=${playerSearch}&limit=10`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPlayers(data.players || []);
    } catch {
      console.error("Error searching players");
    } finally {
      setLoadingPlayers(false);
    }
  }, [playerSearch]);

  useEffect(() => {
    if (!showAddPlayer) return;
    const t = setTimeout(searchPlayers, 300);
    return () => clearTimeout(t);
  }, [playerSearch, searchPlayers, showAddPlayer]);

  const addPlayer = async (playerId: string) => {
    setAdding(playerId);
    try {
      const res = await fetch(`/api/tournaments/${tournament.id}/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Error al inscribir jugador");
        return;
      }
      toast.success("Jugador inscrito");
      onRefresh();
      setShowAddPlayer(false);
      setPlayerSearch("");
    } finally {
      setAdding("");
    }
  };

  const updateRegistration = async (
    regId: string,
    data: { paymentStatus?: string; status?: string }
  ) => {
    await fetch(`/api/tournaments/${tournament.id}/registrations`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrationId: regId, ...data }),
    });
    onRefresh();
  };

  const registeredIds = registrations.map((r: any) => r.player.id);

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <strong>{registered.length}</strong> inscritos
        </span>
        {waitlist.length > 0 && (
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-yellow-500" />
            <strong>{waitlist.length}</strong> en lista de espera
          </span>
        )}
        {cancelled.length > 0 && (
          <span className="flex items-center gap-1">
            <XCircle className="h-4 w-4 text-red-500" />
            <strong>{cancelled.length}</strong> cancelados
          </span>
        )}
        <span className="text-muted-foreground">
          Aforo: {registered.length}/{tournament.maxParticipants}
        </span>
      </div>

      {/* Search + Add */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar inscrito..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {(tournament.status === "OPEN" || tournament.status === "DRAFT") && (
          <Button onClick={() => setShowAddPlayer(!showAddPlayer)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Inscribir jugador
          </Button>
        )}
      </div>

      {/* Add player panel */}
      {showAddPlayer && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar jugador por nombre, teléfono..."
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>
            {loadingPlayers && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            )}
            {players.length > 0 && (
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {players.map((p) => {
                  const alreadyRegistered = registeredIds.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {p.firstName[0]}
                            {p.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {p.firstName} {p.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Hcp: {p.handicap ?? "N/A"} · {p.engagementLevel}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={alreadyRegistered ? "ghost" : "default"}
                        disabled={alreadyRegistered || adding === p.id}
                        onClick={() => addPlayer(p.id)}
                      >
                        {adding === p.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : alreadyRegistered ? (
                          "Ya inscrito"
                        ) : (
                          <>
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Inscribir
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Registrations table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground">No hay inscritos</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 text-sm font-medium">
                  Jugador
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium hidden md:table-cell">
                  Handicap
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium hidden sm:table-cell">
                  Categoría
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium">
                  Estado
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium hidden sm:table-cell">
                  Pago
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((reg: any) => {
                const regConf = REG_STATUS_CONFIG[reg.status] || REG_STATUS_CONFIG.REGISTERED;
                const payConf = PAYMENT_CONFIG[reg.paymentStatus] || PAYMENT_CONFIG.PENDING;
                return (
                  <tr
                    key={reg.id}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/players/${reg.player.id}`}
                        className="flex items-center gap-3 hover:underline"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {reg.player.firstName[0]}
                            {reg.player.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {reg.player.firstName} {reg.player.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {reg.player.engagementLevel}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm">
                      {reg.handicapAtRegistration ?? reg.player.handicap ?? "—"}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-sm">
                      {reg.categoryName || "General"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${regConf.color}`}
                      >
                        {regConf.label}
                        {reg.status === "WAITLIST" &&
                          reg.waitlistPosition &&
                          ` #${reg.waitlistPosition}`}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer ${payConf.color}`}
                        onClick={() => {
                          const next =
                            reg.paymentStatus === "PENDING"
                              ? "PAID"
                              : reg.paymentStatus === "PAID"
                              ? "PENDING"
                              : reg.paymentStatus;
                          updateRegistration(reg.id, {
                            paymentStatus: next,
                          });
                        }}
                      >
                        {payConf.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            router.push(`/players/${reg.player.id}`)
                          }
                          title="Ver jugador"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {reg.status !== "CANCELLED" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() =>
                              updateRegistration(reg.id, {
                                status: "CANCELLED",
                              })
                            }
                            title="Cancelar inscripción"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Results Tab ───────────────────────────────────────────────
function ResultsTab({
  tournament,
  onRefresh,
}: {
  tournament: any;
  onRefresh: () => void;
}) {
  const registeredPlayers = (tournament.registrations || [])
    .filter((r: any) => r.status === "REGISTERED" || r.status === "CONFIRMED")
    .map((r: any) => r.player);

  const existingResults = tournament.results || [];
  const [results, setResults] = useState<Record<string, any>>(() => {
    const map: Record<string, any> = {};
    for (const r of existingResults) {
      map[r.player.id] = {
        grossScore: r.grossScore ?? "",
        netScore: r.netScore ?? "",
        handicapUsed: r.handicapUsed ?? "",
        categoryName: r.categoryName ?? "",
        positionOverall: r.positionOverall ?? "",
        prizeWon: r.prizeWon ? Number(r.prizeWon) : "",
      };
    }
    // Pre-fill registered players not yet in results
    for (const p of registeredPlayers) {
      if (!map[p.id]) {
        map[p.id] = {
          grossScore: "",
          netScore: "",
          handicapUsed: p.handicap ?? "",
          categoryName: "",
          positionOverall: "",
          prizeWon: "",
        };
      }
    }
    return map;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateResult = (playerId: string, field: string, value: any) => {
    setResults((prev) => ({
      ...prev,
      [playerId]: { ...prev[playerId], [field]: value },
    }));
    setSaved(false);
  };

  const calculateNet = (playerId: string) => {
    const r = results[playerId];
    if (r.grossScore && r.handicapUsed) {
      const net = Math.round(Number(r.grossScore) - Number(r.handicapUsed));
      updateResult(playerId, "netScore", net);
    }
  };

  const autoRank = () => {
    const entries = Object.entries(results)
      .filter(([, r]) => r.netScore || r.grossScore)
      .sort((a, b) => {
        const scoreA = Number(a[1].netScore || a[1].grossScore || 999);
        const scoreB = Number(b[1].netScore || b[1].grossScore || 999);
        return scoreA - scoreB;
      });

    const updated = { ...results };
    entries.forEach(([id], idx) => {
      updated[id] = { ...updated[id], positionOverall: idx + 1 };
    });
    setResults(updated);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = Object.entries(results)
        .filter(([, r]) => r.grossScore || r.netScore)
        .map(([playerId, r]) => ({
          playerId,
          grossScore: r.grossScore ? Number(r.grossScore) : null,
          netScore: r.netScore ? Number(r.netScore) : null,
          handicapUsed: r.handicapUsed ? Number(r.handicapUsed) : null,
          positionOverall: r.positionOverall ? Number(r.positionOverall) : null,
          categoryName: r.categoryName || null,
          prizeWon: r.prizeWon ? Number(r.prizeWon) : null,
        }));

      const res = await fetch(`/api/tournaments/${tournament.id}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results: payload }),
      });

      if (!res.ok) throw new Error();
      toast.success("Resultados guardados");
      setSaved(true);
      onRefresh();
    } catch {
      toast.error("Error al guardar resultados");
    } finally {
      setSaving(false);
    }
  };

  const allPlayers = [
    ...registeredPlayers,
    ...existingResults
      .filter((r: any) => !registeredPlayers.find((p: any) => p.id === r.player.id))
      .map((r: any) => r.player),
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Introduce los resultados de cada jugador
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={autoRank}>
            <ChevronUp className="h-3.5 w-3.5 mr-1" />
            Auto-clasificar
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className={saved ? "bg-green-600" : ""}
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : saved ? (
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            ) : (
              <Save className="h-3.5 w-3.5 mr-1" />
            )}
            {saved ? "Guardado" : "Guardar"}
          </Button>
        </div>
      </div>

      {allPlayers.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground">
            No hay jugadores inscritos
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-3 py-2 text-xs font-medium">
                  Pos.
                </th>
                <th className="text-left px-3 py-2 text-xs font-medium">
                  Jugador
                </th>
                <th className="text-left px-3 py-2 text-xs font-medium">
                  Hcp
                </th>
                <th className="text-left px-3 py-2 text-xs font-medium">
                  Bruto
                </th>
                <th className="text-left px-3 py-2 text-xs font-medium">
                  Neto
                </th>
                <th className="text-left px-3 py-2 text-xs font-medium hidden md:table-cell">
                  Categoría
                </th>
                <th className="text-left px-3 py-2 text-xs font-medium hidden md:table-cell">
                  Premio
                </th>
              </tr>
            </thead>
            <tbody>
              {allPlayers.map((p: any) => {
                const r = results[p.id] || {};
                return (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        value={r.positionOverall ?? ""}
                        onChange={(e) =>
                          updateResult(p.id, "positionOverall", e.target.value)
                        }
                        className="h-7 w-14 text-xs text-center"
                        min={1}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-sm font-medium">
                        {p.firstName} {p.lastName}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        value={r.handicapUsed ?? ""}
                        onChange={(e) =>
                          updateResult(p.id, "handicapUsed", e.target.value)
                        }
                        className="h-7 w-16 text-xs"
                        step={0.1}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        value={r.grossScore ?? ""}
                        onChange={(e) =>
                          updateResult(p.id, "grossScore", e.target.value)
                        }
                        onBlur={() => calculateNet(p.id)}
                        className="h-7 w-16 text-xs"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        value={r.netScore ?? ""}
                        onChange={(e) =>
                          updateResult(p.id, "netScore", e.target.value)
                        }
                        className="h-7 w-16 text-xs"
                      />
                    </td>
                    <td className="px-3 py-2 hidden md:table-cell">
                      <Input
                        value={r.categoryName ?? ""}
                        onChange={(e) =>
                          updateResult(p.id, "categoryName", e.target.value)
                        }
                        className="h-7 w-32 text-xs"
                        placeholder="General"
                      />
                    </td>
                    <td className="px-3 py-2 hidden md:table-cell">
                      <Input
                        type="number"
                        value={r.prizeWon ?? ""}
                        onChange={(e) =>
                          updateResult(p.id, "prizeWon", e.target.value)
                        }
                        className="h-7 w-20 text-xs"
                        placeholder="€"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Leaderboard Tab ───────────────────────────────────────────
function LeaderboardTab({ tournamentId }: { tournamentId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"overall" | string>("overall");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `/api/tournaments/${tournamentId}/leaderboard`
        );
        if (!res.ok) throw new Error();
        const d = await res.json();
        setData(d);
      } catch {
        console.error("Error fetching leaderboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [tournamentId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data || data.overall.length === 0) {
    return (
      <div className="text-center py-12">
        <Medal className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
        <p className="text-muted-foreground">
          No hay resultados todavía
        </p>
      </div>
    );
  }

  const categoryNames = Object.keys(data.byCategory);
  const currentResults =
    view === "overall" ? data.overall : data.byCategory[view] || [];

  return (
    <div className="space-y-4">
      {/* View selector */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={view === "overall" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("overall")}
        >
          General
        </Button>
        {categoryNames.map((name) => (
          <Button
            key={name}
            variant={view === name ? "default" : "outline"}
            size="sm"
            onClick={() => setView(name)}
          >
            {name}
          </Button>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="space-y-2">
        {currentResults.map((r: any, idx: number) => {
          const pos = view === "overall" ? r.positionOverall : r.positionCategory;
          const isTop3 = pos && pos <= 3;
          const bgColors = [
            "bg-amber-50 border-amber-200",
            "bg-gray-50 border-gray-200",
            "bg-orange-50 border-orange-200",
          ];
          const icons = [Crown, Medal, Award];
          const iconColors = [
            "text-amber-500",
            "text-gray-400",
            "text-amber-700",
          ];

          return (
            <div
              key={r.id}
              className={`flex items-center gap-4 p-3 rounded-lg border ${
                isTop3
                  ? bgColors[(pos || 1) - 1] || "bg-muted/20 border-muted"
                  : "bg-muted/20 border-muted"
              }`}
            >
              <div className="w-10 text-center shrink-0">
                {isTop3 ? (
                  (() => {
                    const Icon = icons[(pos || 1) - 1] || Award;
                    return (
                      <Icon
                        className={`h-6 w-6 mx-auto ${
                          iconColors[(pos || 1) - 1]
                        }`}
                      />
                    );
                  })()
                ) : (
                  <span className="text-lg font-bold text-muted-foreground">
                    {pos || idx + 1}
                  </span>
                )}
              </div>

              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {r.player.firstName[0]}
                  {r.player.lastName[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="font-medium">
                  {r.player.firstName} {r.player.lastName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Hcp: {r.handicapUsed ?? r.player.handicap ?? "—"}
                  {r.categoryName && ` · ${r.categoryName}`}
                </p>
              </div>

              <div className="text-right shrink-0">
                {r.netScore && (
                  <p className="font-bold text-lg">{r.netScore}</p>
                )}
                {r.grossScore && (
                  <p className="text-xs text-muted-foreground">
                    Bruto: {r.grossScore}
                  </p>
                )}
              </div>

              {r.prizeWon && Number(r.prizeWon) > 0 && (
                <Badge className="bg-green-100 text-green-800 shrink-0">
                  {Number(r.prizeWon)}€
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Communication Tab ─────────────────────────────────────────
function CommunicationTab({ tournament }: { tournament: any }) {
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [copied, setCopied] = useState("");

  const registeredCount = (tournament.registrations || []).filter(
    (r: any) => r.status === "REGISTERED" || r.status === "CONFIRMED"
  ).length;

  const generateSuggestions = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch("/api/templates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Genera 5 mensajes de comunicación para el torneo "${tournament.name}" (formato ${FORMAT_LABELS[tournament.format]}, fecha ${new Date(tournament.date).toLocaleDateString("es-ES")}, ${registeredCount}/${tournament.maxParticipants} inscritos, cuota ${tournament.entryFee ? Number(tournament.entryFee) + "€" : "gratuita"}).

Estado actual: ${STATUS_CONFIG[tournament.status]?.label}.

Genera mensajes para:
1. PRE-TORNEO: Recordatorio/promoción para atraer más inscritos
2. PRE-TORNEO: Recordatorio de hora de salida para inscritos (24h antes)
3. POST-TORNEO: Felicitación al ganador
4. POST-TORNEO: Mensaje a los que no ganaron animándoles al próximo
5. NO PARTICIPANTES: Resumen post-torneo con invitación al próximo

Formato JSON array: [{ "tipo": "pre|post|no_participante", "asunto": "...", "mensaje": "...", "canal": "whatsapp|email", "destinatarios": "..." }]`,
          tone: "friendly",
          language: "ES",
          category: "MARKETING",
        }),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();

      // Try to parse JSON from the AI response
      try {
        const text = data.text;
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          setAiSuggestions(JSON.parse(jsonMatch[0]));
        } else {
          setAiSuggestions([{ tipo: "info", asunto: "Respuesta IA", mensaje: text, canal: "whatsapp", destinatarios: "todos" }]);
        }
      } catch {
        setAiSuggestions([{ tipo: "info", asunto: "Respuesta IA", mensaje: data.text, canal: "whatsapp", destinatarios: "todos" }]);
      }
    } catch {
      toast.error("Error al generar sugerencias");
    } finally {
      setLoadingAi(false);
    }
  };

  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  };

  const tipoConfig: Record<string, { label: string; color: string }> = {
    pre: { label: "Pre-torneo", color: "bg-blue-100 text-blue-800" },
    post: { label: "Post-torneo", color: "bg-green-100 text-green-800" },
    no_participante: { label: "No participantes", color: "bg-orange-100 text-orange-800" },
    info: { label: "Info", color: "bg-gray-100 text-gray-800" },
  };

  return (
    <div className="space-y-6">
      {/* Quick send info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Panel de comunicación del torneo</p>
              <p className="text-sm text-muted-foreground">
                {registeredCount} inscritos recibirán las comunicaciones por{" "}
                {tournament.preferredChannel || "whatsapp"}
              </p>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Send className="h-3 w-3" />
              {tournament.preferredChannel || "whatsapp"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Campañas sugeridas por IA
          </CardTitle>
          <CardDescription>
            Genera mensajes pre-torneo, post-torneo y para no participantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!aiSuggestions ? (
            <Button
              onClick={generateSuggestions}
              disabled={loadingAi}
              className="w-full"
              variant="outline"
            >
              {loadingAi ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando sugerencias...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generar sugerencias de campañas
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateSuggestions}
                  disabled={loadingAi}
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 mr-1 ${
                      loadingAi ? "animate-spin" : ""
                    }`}
                  />
                  Regenerar
                </Button>
              </div>
              {aiSuggestions.map((sug: any, idx: number) => {
                const tc = tipoConfig[sug.tipo] || tipoConfig.info;
                return (
                  <div
                    key={idx}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${tc.color}`}
                        >
                          {tc.label}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {sug.canal || "whatsapp"}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {sug.destinatarios}
                      </span>
                    </div>
                    {sug.asunto && (
                      <p className="font-medium text-sm">{sug.asunto}</p>
                    )}
                    <div className="relative group">
                      <p className="text-sm bg-muted/30 rounded-lg p-3 whitespace-pre-wrap">
                        {sug.mensaje}
                      </p>
                      <button
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded bg-background/80 hover:bg-background border"
                        onClick={() =>
                          copyMessage(sug.mensaje, `sug-${idx}`)
                        }
                      >
                        {copied === `sug-${idx}` ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pre-configured campaign triggers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Triggers automáticos de campaña
          </CardTitle>
          <CardDescription>
            Configura envíos automáticos basados en el estado del torneo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                trigger: "Quedan pocas plazas",
                timing: `Cuando quedan < 10 plazas`,
                target: "Jugadores activos no inscritos",
                active: registeredCount > tournament.maxParticipants - 10,
              },
              {
                trigger: "Recordatorio 24h antes",
                timing: "24h antes del torneo",
                target: "Todos los inscritos",
                active: false,
              },
              {
                trigger: "Felicitación al ganador",
                timing: "Al completar el torneo",
                target: "Top 3 del torneo",
                active: tournament.status === "COMPLETED",
              },
              {
                trigger: "Encuesta de satisfacción",
                timing: "48h post-torneo",
                target: "Todos los participantes",
                active: false,
              },
              {
                trigger: "Invitación early bird",
                timing: "1 semana post-torneo",
                target: "Participantes + lista de espera",
                active: false,
              },
            ].map((t, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium">{t.trigger}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.timing} · {t.target}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={
                    t.active
                      ? "bg-green-100 text-green-800"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {t.active ? "Activo" : "Pendiente"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
