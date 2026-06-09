"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  X,
  CloudSun,
  Users,
  Car,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface SlotBooking {
  id: string;
  playersCount: number;
  holes: number;
  buggy: boolean;
  status: string;
  notes: string | null;
  player: { id: string; firstName: string; lastName: string; phone: string };
}

interface Slot {
  time: string;
  capacity: number;
  used: number;
  bookings: SlotBooking[];
}

interface TeeSheet {
  date: string;
  slots: Slot[];
  config: { openTime: string; closeTime: string; intervalMinutes: number; slotCapacity: number };
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export default function BookingsPage() {
  const [date, setDate] = useState(todayStr());
  const [sheet, setSheet] = useState<TeeSheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingSlot, setAddingSlot] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchSheet = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings?date=${date}`);
      if (!res.ok) throw new Error();
      setSheet(await res.json());
    } catch {
      toast.error("Error al cargar las reservas");
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchSheet();
  }, [fetchSheet]);

  const cancelBooking = async (b: SlotBooking) => {
    if (
      !confirm(
        `¿Cancelar la reserva de ${b.player.firstName} ${b.player.lastName}?`
      )
    )
      return;
    setBusyId(b.id);
    try {
      const res = await fetch(`/api/bookings/${b.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Error al cancelar");
        return;
      }
      toast.success("Reserva cancelada");
      fetchSheet();
    } catch {
      toast.error("Error al cancelar");
    } finally {
      setBusyId(null);
    }
  };

  const dateLabel = new Date(date).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const totalPlayers =
    sheet?.slots.reduce((sum, s) => sum + s.used, 0) || 0;
  const occupiedSlots = sheet?.slots.filter((s) => s.used > 0) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarCheck className="h-6 w-6" />
            Reservas
          </h1>
          <p className="text-muted-foreground mt-1 capitalize">{dateLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setDate(shiftDate(date, -1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Input
            type="date"
            value={date}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            className="w-40"
          />
          <Button variant="outline" size="icon" onClick={() => setDate(shiftDate(date, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDate(todayStr())}>
            Hoy
          </Button>
        </div>
      </div>

      {/* Course status for the day */}
      <CourseStatusCard date={date} />

      {/* Day summary */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          {totalPlayers} jugadores · {occupiedSlots.length} salidas ocupadas
        </span>
      </div>

      {/* Tee sheet */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : sheet ? (
        <div className="rounded-lg border divide-y">
          {sheet.slots.map((slot) => {
            const isFull = slot.used >= slot.capacity;
            return (
              <div
                key={slot.time}
                className={`flex flex-wrap items-center gap-3 px-3 sm:px-4 py-2 ${
                  slot.used > 0 ? "bg-muted/20" : ""
                }`}
              >
                <span className="font-mono text-sm font-medium w-12">{slot.time}</span>
                <span
                  className={`text-xs w-10 ${
                    isFull
                      ? "text-red-600 font-semibold"
                      : slot.used > 0
                        ? "text-amber-600"
                        : "text-muted-foreground"
                  }`}
                >
                  {slot.used}/{slot.capacity}
                </span>
                <div className="flex-1 flex flex-wrap items-center gap-2">
                  {slot.bookings.map((b) => (
                    <span
                      key={b.id}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${
                        b.status === "CANCELLED" ? "opacity-50 line-through" : "bg-background"
                      }`}
                      title={b.notes || undefined}
                    >
                      {b.player.firstName} {b.player.lastName}
                      <span className="text-muted-foreground">
                        ×{b.playersCount} · {b.holes}h{b.buggy ? " · buggy" : ""}
                      </span>
                      <button
                        onClick={() => cancelBooking(b)}
                        disabled={busyId === b.id}
                        className="text-muted-foreground hover:text-destructive"
                        title="Cancelar reserva"
                      >
                        {busyId === b.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </button>
                    </span>
                  ))}
                  {!isFull && addingSlot !== slot.time && (
                    <button
                      onClick={() => setAddingSlot(slot.time)}
                      className="inline-flex items-center gap-1 rounded-full border border-dashed px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-solid transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      Reservar
                    </button>
                  )}
                </div>
                {addingSlot === slot.time && (
                  <NewBookingForm
                    date={date}
                    teeTime={slot.time}
                    maxPlayers={slot.capacity - slot.used}
                    onClose={() => setAddingSlot(null)}
                    onCreated={() => {
                      setAddingSlot(null);
                      fetchSheet();
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

// --- Course status editor ---

function CourseStatusCard({ date }: { date: string }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/course-status?date=${date}`)
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});
  }, [date]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/course-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          buggiesAllowed: status.buggiesAllowed,
          trolleysAllowed: status.trolleysAllowed,
          greensStatus: status.greensStatus || "",
          holesClosed: status.holesClosed || "",
          notes: status.notes || "",
        }),
      });
      if (!res.ok) {
        toast.error("Error al guardar el estado del campo");
        return;
      }
      toast.success("Estado del campo actualizado — la IA ya responde con estos datos");
      setOpen(false);
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (!status) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <CloudSun className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-[200px]">
            <p className="text-sm font-medium">Estado del campo</p>
            <p className="text-xs text-muted-foreground">
              <span className={status.buggiesAllowed ? "" : "text-red-600 font-medium"}>
                Buggies {status.buggiesAllowed ? "sí" : "NO"}
              </span>
              {" · "}
              <span className={status.trolleysAllowed ? "" : "text-red-600 font-medium"}>
                Carros {status.trolleysAllowed ? "sí" : "NO"}
              </span>
              {status.greensStatus && ` · Greens: ${status.greensStatus}`}
              {status.holesClosed && ` · Hoyos cerrados: ${status.holesClosed}`}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
            {open ? "Cerrar" : "Editar"}
          </Button>
        </div>

        {open && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={status.buggiesAllowed}
                onChange={(e) =>
                  setStatus((p: any) => ({ ...p, buggiesAllowed: e.target.checked }))
                }
              />
              <Car className="h-4 w-4" /> Buggies
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={status.trolleysAllowed}
                onChange={(e) =>
                  setStatus((p: any) => ({ ...p, trolleysAllowed: e.target.checked }))
                }
              />
              Carros
            </label>
            <div className="space-y-1">
              <Label className="text-xs">Greens</Label>
              <select
                value={status.greensStatus || ""}
                onChange={(e) =>
                  setStatus((p: any) => ({ ...p, greensStatus: e.target.value }))
                }
                className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
              >
                <option value="">Normales</option>
                <option value="greens de invierno">Greens de invierno</option>
                <option value="greens pinchados">Pinchados (aireados)</option>
                <option value="greens recién segados">Recién segados</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Hoyos cerrados</Label>
              <Input
                placeholder="Ej. 7 y 8"
                value={status.holesClosed || ""}
                onChange={(e) =>
                  setStatus((p: any) => ({ ...p, holesClosed: e.target.value }))
                }
              />
            </div>
            <div className="col-span-2 sm:col-span-3 space-y-1">
              <Label className="text-xs">Notas (visibles para la IA)</Label>
              <Input
                placeholder="Ej. calles encharcadas en la zona baja"
                value={status.notes || ""}
                onChange={(e) => setStatus((p: any) => ({ ...p, notes: e.target.value }))}
              />
            </div>
            <Button size="sm" onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Guardar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// --- New booking inline form ---

function NewBookingForm({
  date,
  teeTime,
  maxPlayers,
  onClose,
  onCreated,
}: {
  date: string;
  teeTime: string;
  maxPlayers: number;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [playersCount, setPlayersCount] = useState("1");
  const [holes, setHoles] = useState("18");
  const [buggy, setBuggy] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (search.length < 2 || selected) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/players?search=${encodeURIComponent(search)}&limit=6`
        );
        const data = await res.json();
        setResults(data.players || []);
      } catch {
        setResults([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selected]);

  const create = async () => {
    if (!selected) {
      toast.error("Selecciona un jugador");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: selected.id,
          date,
          teeTime,
          playersCount: Number(playersCount),
          holes: Number(holes),
          buggy,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al crear la reserva");
        return;
      }
      toast.success(`Reserva creada: ${teeTime}`);
      onCreated();
    } catch {
      toast.error("Error al crear la reserva");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full mt-2 p-3 border rounded-md bg-muted/20 space-y-2">
      <div className="relative">
        <Input
          placeholder="Buscar jugador por nombre o teléfono..."
          value={selected ? `${selected.firstName} ${selected.lastName}` : search}
          onChange={(e) => {
            setSelected(null);
            setSearch(e.target.value);
          }}
          autoFocus
        />
        {results.length > 0 && !selected && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-md border bg-background shadow-lg max-h-48 overflow-y-auto">
            {results.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelected(p);
                  setResults([]);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
              >
                {p.firstName} {p.lastName}
                <span className="text-xs text-muted-foreground ml-2">{p.phone}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={playersCount}
          onChange={(e) => setPlayersCount(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          {Array.from({ length: maxPlayers }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} jugador{n > 1 ? "es" : ""}
            </option>
          ))}
        </select>
        <select
          value={holes}
          onChange={(e) => setHoles(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          <option value="18">18 hoyos</option>
          <option value="9">9 hoyos</option>
        </select>
        <label className="flex items-center gap-1.5 text-sm">
          <input
            type="checkbox"
            checked={buggy}
            onChange={(e) => setBuggy(e.target.checked)}
          />
          Buggy
        </label>
        <div className="flex-1" />
        <Button size="sm" onClick={create} disabled={saving || !selected}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Confirmar
        </Button>
        <Button size="sm" variant="ghost" onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
