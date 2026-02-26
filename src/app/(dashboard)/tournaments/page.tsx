"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Plus,
  Search,
  Eye,
  Trash2,
  CalendarDays,
  Users,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PlayCircle,
  CheckCircle2,
  Clock,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const FORMAT_LABELS: Record<string, string> = {
  STABLEFORD: "Stableford",
  MEDAL: "Medal Play",
  SCRAMBLE: "Scramble",
  MATCH_PLAY: "Match Play",
  BEST_BALL: "Best Ball",
  FOURBALL: "Fourball",
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Borrador", color: "bg-gray-100 text-gray-800" },
  OPEN: { label: "Inscripciones abiertas", color: "bg-green-100 text-green-800" },
  CLOSED: { label: "Inscripciones cerradas", color: "bg-yellow-100 text-yellow-800" },
  IN_PROGRESS: { label: "En curso", color: "bg-blue-100 text-blue-800" },
  COMPLETED: { label: "Completado", color: "bg-purple-100 text-purple-800" },
  CANCELLED: { label: "Cancelado", color: "bg-red-100 text-red-800" },
};

export default function TournamentsPage() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/tournaments?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTournaments(data.tournaments);
      setPagination(data.pagination);
    } catch {
      console.error("Error fetching tournaments");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => fetchTournaments(), 300);
    return () => clearTimeout(timer);
  }, [fetchTournaments]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este torneo?")) return;
    await fetch(`/api/tournaments/${id}`, { method: "DELETE" });
    fetchTournaments();
  };

  const now = new Date();
  const stats = {
    total: pagination.total,
    open: tournaments.filter((t) => t.status === "OPEN").length,
    inProgress: tournaments.filter((t) => t.status === "IN_PROGRESS").length,
    completed: tournaments.filter((t) => t.status === "COMPLETED").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Torneos</h1>
          <p className="text-muted-foreground">
            Gestión de torneos, inscripciones y resultados
          </p>
        </div>
        <Link href="/tournaments/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Torneo
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-100">
                <Trophy className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <PlayCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Abiertos</p>
                <p className="text-2xl font-bold">{stats.open}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En curso</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <CheckCircle2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completados</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar torneos..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["", "OPEN", "IN_PROGRESS", "COMPLETED", "DRAFT"].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
            >
              {s === "" ? "Todos" : STATUS_CONFIG[s]?.label || s}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : tournaments.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground">No hay torneos</p>
          <Link href="/tournaments/new">
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Crear primer torneo
            </Button>
          </Link>
        </div>
      ) : (
        <div className="border rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 text-sm font-medium">
                  Torneo
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium hidden md:table-cell">
                  Fecha
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium hidden md:table-cell">
                  Formato
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium hidden sm:table-cell">
                  Inscritos
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium hidden lg:table-cell">
                  Cuota
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium">
                  Estado
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {tournaments.map((t) => {
                const statusConf = STATUS_CONFIG[t.status] || STATUS_CONFIG.DRAFT;
                return (
                  <tr
                    key={t.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{t.name}</p>
                        {t.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {t.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-sm">
                        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                        {new Date(t.date).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        {t.teeTime && (
                          <span className="text-muted-foreground">
                            {t.teeTime}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge variant="secondary">
                        {FORMAT_LABELS[t.format] || t.format}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">
                          {t._count.registrations}
                        </span>
                        <span className="text-muted-foreground">
                          / {t.maxParticipants}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {t.entryFee ? (
                        <span className="text-sm font-medium">
                          {Number(t.entryFee).toFixed(0)}€
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Gratis
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConf.color}`}
                      >
                        {statusConf.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            router.push(`/tournaments/${t.id}`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(t.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Mostrando{" "}
                {Math.min((page - 1) * 20 + 1, pagination.total)}-
                {Math.min(page * 20, pagination.total)} de{" "}
                {pagination.total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  {page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
