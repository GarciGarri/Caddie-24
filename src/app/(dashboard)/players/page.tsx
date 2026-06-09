"use client";

import { useState, useEffect, useCallback, Suspense, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Phone,
  Mail,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2,
  Eye,
  Pencil,
  Download,
  Upload,
  FileText,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

interface PlayerTag {
  id: string;
  tag: string;
}

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  handicap: number | null;
  engagementLevel: string;
  preferredLanguage: string;
  tags: PlayerTag[];
  _count: {
    visits: number;
    conversations: number;
  };
  createdAt: string;
}

interface PlayersResponse {
  players: Player[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    vipCount: number;
    highCount: number;
    newCount: number;
  };
}

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

const LANGUAGE_LABELS: Record<string, string> = {
  ES: "Español",
  EN: "English",
  DE: "Deutsch",
  FR: "Français",
};

function formatPhone(phone: string): string {
  if (!phone) return "";
  const clean = phone.replace(/\s/g, "");
  if (clean.startsWith("+34") && clean.length === 12) {
    return `+34 ${clean.slice(3, 6)} ${clean.slice(6, 9)} ${clean.slice(9)}`;
  }
  // Generic: add space every 3 digits after country code
  if (clean.startsWith("+")) {
    const cc = clean.slice(0, clean.length > 11 ? 3 : 2);
    const rest = clean.slice(cc.length);
    return `${cc} ${rest.replace(/(\d{3})/g, "$1 ").trim()}`;
  }
  return phone;
}

function PlayersPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PlayersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [engagementFilter, setEngagementFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);

  // Sync search/filter from URL (e.g. header global search navigates here)
  useEffect(() => {
    const q = searchParams.get("search");
    if (q !== null) setSearch(q);
    const eng = searchParams.get("engagement");
    if (eng !== null) setEngagementFilter(eng);
  }, [searchParams]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        sortBy: "lastName",
        sortOrder: "asc",
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (engagementFilter) params.set("engagement", engagementFilter);

      const res = await fetch(`/api/players?${params}`);
      if (!res.ok) throw new Error("Error fetching players");
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, engagementFilter]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar a ${name}? El jugador será desactivado y dejará de aparecer en listados.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/players/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Jugador desactivado correctamente");
        fetchPlayers();
      } else {
        toast.error("Error al eliminar el jugador");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Error al eliminar el jugador");
    } finally {
      setDeleting(null);
    }
  };

  const players = data?.players || [];
  const pagination = data?.pagination;

  // Count stats from pagination total (all active) + filter locally for quick stats
  const totalCount = pagination?.total || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Jugadores</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los perfiles de tus jugadores
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a href="/api/players/export" download>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </a>
          </Button>
          <Button
            variant={showImport ? "default" : "outline"}
            onClick={() => setShowImport((v) => !v)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Link href="/players/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Jugador
            </Button>
          </Link>
        </div>
      </div>

      {/* CSV import panel */}
      {showImport && (
        <ImportPlayersPanel
          onClose={() => setShowImport(false)}
          onImported={() => {
            fetchPlayers();
          }}
        />
      )}

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalCount}</p>
              <p className="text-xs text-muted-foreground">Total Activos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full bg-purple-100 p-2">
              <Trophy className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {data?.stats?.vipCount ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">VIP</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-2">
              <Users className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {data?.stats?.highCount ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">Alto Engagement</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full bg-gray-100 p-2">
              <Users className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {data?.stats?.newCount ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">Nuevos este mes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, teléfono o email..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {engagementFilter && (
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Engagement:</span>
          {["", "VIP", "HIGH", "MEDIUM", "LOW", "NEW"].map((level) => (
            <Button
              key={level}
              variant={engagementFilter === level ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setEngagementFilter(level);
                setPage(1);
              }}
              className="text-xs"
            >
              {level === "" ? "Todos" : engagementLabels[level] || level}
            </Button>
          ))}
        </div>
      )}

      {/* Players table */}
      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Jugador
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden md:table-cell">
                  Contacto
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden sm:table-cell">
                  Hándicap
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Engagement
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden lg:table-cell">
                  Etiquetas
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden lg:table-cell">
                  Visitas
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Cargando jugadores...
                    </p>
                  </td>
                </tr>
              ) : players.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Users className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {debouncedSearch || engagementFilter
                        ? "No se encontraron jugadores con esos filtros"
                        : "No hay jugadores aún. ¡Crea el primero!"}
                    </p>
                  </td>
                </tr>
              ) : (
                players.map((player) => (
                  <tr
                    key={player.id}
                    className="border-b hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/players/${player.id}`}
                        className="flex items-center gap-3 hover:underline"
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                            {player.firstName[0]}
                            {player.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {player.firstName} {player.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {LANGUAGE_LABELS[player.preferredLanguage] || player.preferredLanguage}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {formatPhone(player.phone)}
                        </div>
                        {player.email && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {player.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono hidden sm:table-cell">
                      {player.handicap ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          engagementColors[player.engagementLevel] || ""
                        }`}
                      >
                        {engagementLabels[player.engagementLevel] ||
                          player.engagementLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex gap-1 flex-wrap">
                        {player.tags.map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag.tag}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                      {player._count.visits}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => router.push(`/players/${player.id}`)}
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() =>
                            handleDelete(
                              player.id,
                              `${player.firstName} ${player.lastName}`
                            )
                          }
                          disabled={deleting === player.id}
                          title="Eliminar"
                        >
                          {deleting === player.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">
              Mostrando {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
              {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- CSV import ---

const HEADER_ALIASES: Record<string, string> = {
  firstname: "firstName",
  nombre: "firstName",
  "first name": "firstName",
  lastname: "lastName",
  apellido: "lastName",
  apellidos: "lastName",
  "last name": "lastName",
  phone: "phone",
  telefono: "phone",
  "teléfono": "phone",
  movil: "phone",
  "móvil": "phone",
  tel: "phone",
  email: "email",
  correo: "email",
  "e-mail": "email",
  handicap: "handicap",
  "hándicap": "handicap",
  hcp: "handicap",
  language: "language",
  idioma: "language",
  birthday: "birthday",
  nacimiento: "birthday",
  "fecha nacimiento": "birthday",
  "fecha de nacimiento": "birthday",
  notes: "notes",
  notas: "notes",
};

const VALID_LANGUAGES = ["ES", "EN", "DE", "FR"];

function parseCsv(text: string): Record<string, string>[] {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const firstLine = text.split(/\r?\n/, 1)[0] || "";
  const delimiter =
    (firstLine.match(/;/g)?.length || 0) > (firstLine.match(/,/g)?.length || 0)
      ? ";"
      : ",";

  const rows: string[][] = [];
  let cur = "";
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(cur);
      cur = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cur);
      cur = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else {
      cur += ch;
    }
  }
  if (cur !== "" || row.length > 0) {
    row.push(cur);
    if (row.some((c) => c.trim() !== "")) rows.push(row);
  }

  if (rows.length < 2) return [];

  const header = rows[0].map(
    (h) => HEADER_ALIASES[h.trim().toLowerCase()] || h.trim()
  );

  return rows.slice(1).map((cols) => {
    const obj: Record<string, string> = {};
    header.forEach((key, idx) => {
      if (key) obj[key] = (cols[idx] || "").trim();
    });
    return obj;
  });
}

interface ImportResult {
  created: number;
  skipped: number;
  errors: Array<{ row: number; error: string }>;
  total: number;
}

function ImportPlayersPanel({
  onClose,
  onImported,
}: {
  onClose: () => void;
  onImported: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const templateCsv =
    "data:text/csv;charset=utf-8," +
    encodeURIComponent(
      "firstName,lastName,phone,email,handicap,language,birthday,notes\r\n" +
        "Carlos,García,+34612345678,carlos@email.com,12.4,ES,1985-03-15,Socio desde 2020\r\n" +
        "Mary,Smith,+447911123456,mary@email.com,18,EN,,\r\n"
    );

  const handleFile = async (file: File) => {
    setResult(null);
    setParseError(null);
    setFileName(file.name);
    try {
      const text = await file.text();
      const parsed = parseCsv(text);
      if (parsed.length === 0) {
        setParseError(
          "No se encontraron filas. El CSV debe tener una cabecera (firstName, lastName, phone...) y al menos una fila."
        );
        setRows([]);
        return;
      }
      const missing = ["firstName", "lastName", "phone"].filter(
        (key) => !(key in parsed[0])
      );
      if (missing.length > 0) {
        setParseError(
          `Faltan columnas obligatorias: ${missing.join(", ")}. Descarga la plantilla para ver el formato.`
        );
        setRows([]);
        return;
      }
      setRows(parsed);
    } catch {
      setParseError("No se pudo leer el archivo");
      setRows([]);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      // Normalize values that Spanish spreadsheets commonly mangle
      const cleanRows = rows.map((r) => {
        const out: Record<string, string> = { ...r };
        if (out.handicap) out.handicap = out.handicap.replace(",", ".");
        if (out.language) {
          const lang = out.language.toUpperCase().slice(0, 2);
          out.language = VALID_LANGUAGES.includes(lang) ? lang : "";
        }
        Object.keys(out).forEach((k) => {
          if (out[k] === "") delete out[k];
        });
        return out;
      });

      const res = await fetch("/api/players/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: cleanRows }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al importar");
        return;
      }
      setResult(data);
      if (data.created > 0) {
        toast.success(`${data.created} jugadores importados`);
        onImported();
      } else {
        toast.info("No se importó ningún jugador nuevo");
      }
    } catch {
      toast.error("Error al importar");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Importar jugadores desde CSV
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Columnas obligatorias: <code>firstName</code>, <code>lastName</code>,{" "}
              <code>phone</code>. Opcionales: email, handicap, language (ES/EN/DE/FR),
              birthday, notes. Acepta separador coma o punto y coma. Los teléfonos
              españoles de 9 dígitos reciben +34 automáticamente; los jugadores cuyo
              teléfono ya existe se omiten.
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <FileText className="h-4 w-4 mr-2" />
            Seleccionar archivo CSV
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href={templateCsv} download="plantilla-jugadores.csv">
              <Download className="h-4 w-4 mr-2" />
              Descargar plantilla
            </a>
          </Button>
          {fileName && (
            <span className="text-sm text-muted-foreground">
              {fileName} {rows.length > 0 && `— ${rows.length} filas detectadas`}
            </span>
          )}
        </div>

        {parseError && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {parseError}
          </div>
        )}

        {rows.length > 0 && !result && (
          <Button onClick={handleImport} disabled={importing}>
            {importing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Importar {rows.length} jugadores
          </Button>
        )}

        {result && (
          <div className="rounded-md border p-4 space-y-2 text-sm">
            <p>
              <strong className="text-green-600">{result.created}</strong> creados ·{" "}
              <strong>{result.skipped}</strong> omitidos (ya existían) ·{" "}
              <strong className={result.errors.length > 0 ? "text-destructive" : ""}>
                {result.errors.length}
              </strong>{" "}
              con errores
            </p>
            {result.errors.length > 0 && (
              <div className="max-h-40 overflow-y-auto space-y-1">
                {result.errors.map((err, i) => (
                  <p key={i} className="text-xs text-destructive">
                    Fila {err.row}: {err.error}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function PlayersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <PlayersPageInner />
    </Suspense>
  );
}
