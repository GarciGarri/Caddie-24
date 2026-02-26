"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Save,
  Loader2,
  Check,
  CloudSun,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DailyInputPage() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const defaultDate = yesterday.toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [actualOccupancy, setActualOccupancy] = useState("");
  const [actualReservas, setActualReservas] = useState("");
  const [actualRevenue, setActualRevenue] = useState("");
  const [isClosed, setIsClosed] = useState(false);
  const [closureReason, setClosureReason] = useState("");

  useEffect(() => {
    fetchRecord();
  }, [selectedDate]);

  const fetchRecord = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/weather/daily-record?date=${selectedDate}`);
      if (res.ok) {
        const data = await res.json();
        setRecord(data.record);
        if (data.record) {
          setActualOccupancy(data.record.actualOccupancy?.toString() || "");
          setActualReservas(data.record.actualReservas?.toString() || "");
          setActualRevenue(data.record.actualRevenue?.toString() || "");
          setIsClosed(data.record.isClosed || false);
          setClosureReason(data.record.closureReason || "");
        } else {
          // Reset form
          setActualOccupancy("");
          setActualReservas("");
          setActualRevenue("");
          setIsClosed(false);
          setClosureReason("");
        }
      }
    } catch (err) {
      console.error("Error fetching record:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/weather/daily-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          actualOccupancy: actualOccupancy ? parseFloat(actualOccupancy) : null,
          actualReservas: actualReservas ? parseInt(actualReservas) : null,
          actualRevenue: actualRevenue ? parseFloat(actualRevenue) : null,
          isClosed,
          closureReason: isClosed ? closureReason : null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRecord(data.record);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError("Error al guardar. Inténtalo de nuevo.");
      }
    } catch (err) {
      setError("Error de conexión.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return `${days[d.getDay()]} ${d.getDate()} de ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  // Calculate accuracy if we have both predicted and actual
  const hasAccuracy = record?.predictedOccupancy != null && actualOccupancy;
  const delta = hasAccuracy
    ? Math.abs(record.predictedOccupancy - parseFloat(actualOccupancy))
    : null;
  const accuracyBadge = delta != null
    ? delta <= 15 ? { label: "Preciso", emoji: "✓", color: "bg-green-100 text-green-700" }
    : delta <= 30 ? { label: "Cercano", emoji: "≈", color: "bg-yellow-100 text-yellow-700" }
    : { label: "Fallido", emoji: "✗", color: "bg-red-100 text-red-700" }
    : null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/weather">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CloudSun className="h-6 w-6 text-blue-500" />
            Registro Diario de Ocupación
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Introduce los datos reales para medir la precisión de las predicciones
          </p>
        </div>
      </div>

      {/* Date selector */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="border rounded-md px-3 py-2 text-sm"
            />
            <span className="text-sm text-muted-foreground">
              {formatDate(selectedDate)}
            </span>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Prediction info (readonly) */}
          {record && record.golfScore > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Predicción del Día</CardTitle>
                <CardDescription>Datos capturados por el sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Golf Score</p>
                    <p className="font-medium text-lg">{record.golfScore}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ocupación Predicha</p>
                    <p className="font-medium text-lg">
                      {record.predictedOccupancy != null ? `${record.predictedOccupancy}%` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Reservas Predichas</p>
                    <p className="font-medium text-lg">{record.predictedReservas ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Revenue Predicho</p>
                    <p className="font-medium text-lg">
                      {record.predictedRevenue != null
                        ? `${record.predictedRevenue.toLocaleString("es-ES")}€`
                        : "—"}
                    </p>
                  </div>
                </div>
                {record.tempMax != null && (
                  <div className="mt-3 pt-3 border-t flex gap-4 text-xs text-muted-foreground">
                    <span>🌡️ {record.tempMax}° / {record.tempMin}°</span>
                    <span>💧 {record.precipitation}mm</span>
                    <span>💨 {record.windMax} km/h</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!record?.golfScore && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Sin predicción para este día</p>
                <p className="text-xs text-yellow-700 mt-1">
                  No se capturó un snapshot de predicción. Los datos históricos del clima
                  se backfillean automáticamente al consultar el historial.
                </p>
              </div>
            </div>
          )}

          {/* Actual data form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Datos Reales</CardTitle>
              <CardDescription>Introduce lo que realmente ocurrió este día</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                    Ocupación Real (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={actualOccupancy}
                    onChange={(e) => setActualOccupancy(e.target.value)}
                    placeholder="0 - 100"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                    Reservas Reales
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={actualReservas}
                    onChange={(e) => setActualReservas(e.target.value)}
                    placeholder="Número de reservas"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                    Revenue Real (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={actualRevenue}
                    onChange={(e) => setActualRevenue(e.target.value)}
                    placeholder="0.00"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Closed toggle */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isClosed}
                    onChange={(e) => setIsClosed(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Campo cerrado este día</span>
                </label>
              </div>

              {isClosed && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                    Motivo de cierre
                  </label>
                  <input
                    type="text"
                    value={closureReason}
                    onChange={(e) => setClosureReason(e.target.value)}
                    placeholder="Ej: Lluvia intensa, mantenimiento..."
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />
                </div>
              )}

              {/* Accuracy indicator */}
              {accuracyBadge && (
                <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                  <Badge className={accuracyBadge.color}>
                    {accuracyBadge.emoji} {accuracyBadge.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Diferencia: {delta?.toFixed(1)} puntos porcentuales
                    (Predicción {record?.predictedOccupancy}% → Real {actualOccupancy}%)
                  </span>
                </div>
              )}

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : saved ? (
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {saved ? "Guardado" : "Guardar Registro"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
