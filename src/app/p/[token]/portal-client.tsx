"use client";

import { useState } from "react";

interface PortalData {
  token: string;
  clubName: string;
  player: {
    firstName: string;
    lastName: string;
    handicap: number | null;
    federationLicense: string | null;
    optedOut: boolean;
    membership: { type: string; status: string; renewalDate: string | null } | null;
    packs: Array<{
      id: string;
      name: string;
      remainingUses: number;
      totalUses: number;
      expiresAt: string | null;
    }>;
    results: Array<{
      id: string;
      tournament: string;
      date: string;
      position: number | null;
      netScore: number | null;
      grossScore: number | null;
    }>;
  };
  bookings: Array<{
    id: string;
    date: string;
    teeTime: string;
    playersCount: number;
    holes: number;
    buggy: boolean;
  }>;
  registrations: Array<{
    id: string;
    tournament: string;
    date: string;
    status: string;
    teeTime: string | null;
    groupNumber: number | null;
  }>;
}

const MEMBERSHIP_LABELS: Record<string, string> = {
  INDIVIDUAL: "Individual",
  FAMILIAR: "Familiar",
  JOVEN: "Joven",
  SENIOR: "Senior",
  SEMANA: "De semana",
  CORPORATIVO: "Corporativo",
  HONORIFICO: "Honorífico",
  OTRO: "Socio",
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function PortalClient({ data }: { data: PortalData }) {
  const [bookings, setBookings] = useState(data.bookings);
  const [optedOut, setOptedOut] = useState(data.player.optedOut);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const action = async (payload: Record<string, unknown>): Promise<boolean> => {
    try {
      const res = await fetch("/api/portal/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: data.token, ...payload }),
      });
      const result = await res.json();
      if (!res.ok) {
        setMessage(result.error || "Error");
        return false;
      }
      return true;
    } catch {
      setMessage("Error de conexión");
      return false;
    }
  };

  const cancelBooking = async (id: string, label: string) => {
    if (!confirm(`¿Cancelar tu reserva del ${label}?`)) return;
    setBusy(id);
    const ok = await action({ action: "cancel-booking", bookingId: id });
    if (ok) {
      setBookings((prev) => prev.filter((b) => b.id !== id));
      setMessage("Reserva cancelada. ¡Te esperamos en otra ocasión!");
    }
    setBusy(null);
  };

  const toggleConsent = async () => {
    setBusy("consent");
    const ok = await action({ action: "consent", optOut: !optedOut });
    if (ok) {
      setOptedOut(!optedOut);
      setMessage(
        !optedOut
          ? "No recibirás más comunicaciones comerciales."
          : "Volverás a recibir nuestras novedades."
      );
    }
    setBusy(null);
  };

  const m = data.player.membership;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-md mx-auto px-4 py-8 space-y-5">
        {/* Header */}
        <div className="text-center">
          <p className="text-3xl">⛳</p>
          <h1 className="text-lg font-bold text-green-900">{data.clubName}</h1>
          <p className="text-2xl font-bold mt-3">
            Hola, {data.player.firstName} 👋
          </p>
          <div className="flex items-center justify-center gap-2 mt-1 text-xs text-gray-500 flex-wrap">
            {data.player.handicap != null && <span>Hcp {data.player.handicap}</span>}
            {data.player.federationLicense && (
              <span>· Licencia {data.player.federationLicense}</span>
            )}
            {m && m.status === "ACTIVE" && (
              <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 font-medium">
                Socio {MEMBERSHIP_LABELS[m.type]}
              </span>
            )}
          </div>
          {m?.renewalDate && m.status === "ACTIVE" && (
            <p className="text-xs text-gray-400 mt-1">
              Membresía válida hasta el{" "}
              {new Date(m.renewalDate).toLocaleDateString("es-ES")}
            </p>
          )}
        </div>

        {message && (
          <div className="rounded-lg bg-green-100 text-green-800 text-sm px-4 py-3 text-center">
            {message}
          </div>
        )}

        {/* Próximas reservas */}
        <section className="bg-white rounded-xl shadow-sm border p-4">
          <h2 className="text-sm font-semibold mb-3">📅 Mis próximas reservas</h2>
          {bookings.length === 0 ? (
            <p className="text-sm text-gray-400">
              No tienes reservas. Escríbenos por WhatsApp o Telegram para reservar.
            </p>
          ) : (
            <ul className="space-y-2">
              {bookings.map((b) => {
                const label = `${fmtDate(b.date)} a las ${b.teeTime}`;
                return (
                  <li
                    key={b.id}
                    className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium capitalize">{label}</p>
                      <p className="text-xs text-gray-500">
                        {b.playersCount} jugador{b.playersCount > 1 ? "es" : ""} ·{" "}
                        {b.holes} hoyos{b.buggy ? " · buggy" : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => cancelBooking(b.id, label)}
                      disabled={busy === b.id}
                      className="text-xs text-red-600 border border-red-200 rounded-md px-2.5 py-1.5 hover:bg-red-50 disabled:opacity-50"
                    >
                      {busy === b.id ? "..." : "Cancelar"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Torneos */}
        <section className="bg-white rounded-xl shadow-sm border p-4">
          <h2 className="text-sm font-semibold mb-3">🏆 Mis torneos</h2>
          {data.registrations.length === 0 ? (
            <p className="text-sm text-gray-400">No estás inscrito en ningún torneo próximo.</p>
          ) : (
            <ul className="space-y-2">
              {data.registrations.map((r) => (
                <li key={r.id} className="rounded-lg border px-3 py-2">
                  <p className="text-sm font-medium">{r.tournament}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {fmtDate(r.date)}
                    {r.status === "WAITLIST" && " · en lista de espera"}
                    {r.teeTime &&
                      ` · salida ${r.teeTime}${r.groupNumber ? ` (partida ${r.groupNumber})` : ""}`}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Bonos */}
        {data.player.packs.length > 0 && (
          <section className="bg-white rounded-xl shadow-sm border p-4">
            <h2 className="text-sm font-semibold mb-3">🎟️ Mis bonos</h2>
            <ul className="space-y-2">
              {data.player.packs.map((p) => (
                <li key={p.id} className="rounded-lg border px-3 py-2">
                  <p className="text-sm font-medium">{p.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{
                          width: `${Math.round((p.remainingUses / p.totalUses) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {p.remainingUses}/{p.totalUses}
                    </span>
                  </div>
                  {p.expiresAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Caduca el {new Date(p.expiresAt).toLocaleDateString("es-ES")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Últimos resultados */}
        {data.player.results.length > 0 && (
          <section className="bg-white rounded-xl shadow-sm border p-4">
            <h2 className="text-sm font-semibold mb-3">📊 Mis últimos resultados</h2>
            <ul className="space-y-2">
              {data.player.results.map((r) => (
                <li key={r.id} className="flex items-center justify-between text-sm">
                  <span className="truncate mr-2">{r.tournament}</span>
                  <span className="text-gray-500 shrink-0">
                    {r.position ? `${r.position}º` : "—"}
                    {r.netScore != null && ` · ${r.netScore} ptos`}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Consentimiento */}
        <section className="bg-white rounded-xl shadow-sm border p-4">
          <h2 className="text-sm font-semibold mb-2">✉️ Comunicaciones comerciales</h2>
          <p className="text-xs text-gray-500 mb-3">
            {optedOut
              ? "No recibes ofertas ni novedades del club."
              : "Recibes ofertas y novedades del club por mensajería."}
          </p>
          <button
            onClick={toggleConsent}
            disabled={busy === "consent"}
            className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium border transition-colors disabled:opacity-50 ${
              optedOut
                ? "bg-green-600 text-white border-green-600 hover:bg-green-700"
                : "text-red-600 border-red-200 hover:bg-red-50"
            }`}
          >
            {busy === "consent"
              ? "..."
              : optedOut
                ? "Volver a recibir comunicaciones"
                : "Darme de baja de comunicaciones"}
          </button>
        </section>

        <p className="text-center text-xs text-gray-400 pt-2">
          {data.clubName} · Portal del jugador
        </p>
      </div>
    </div>
  );
}
