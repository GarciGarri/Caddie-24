"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Zap,
  Trophy,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface WeatherDay {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitationSum: number;
  windspeedMax: number;
  weatherEmoji: string;
  weatherLabel: string;
  golfScore: number;
  demandLevel: string;
  sunrise: string;
  sunset: string;
  daylightHours: number;
}

interface DemandPrediction {
  fecha: string;
  golfScore: number;
  demandaPredecida: string;
  ocupacionEstimada: string;
  reservasEsperadas: number;
  revenueEstimado: number;
  confianza: string;
  factorPrincipal: string;
  alertas: string[];
  accionesRecomendadas: string[];
  isWeekend: boolean;
  isHoliday: boolean;
  hasTournament: boolean;
}

export default function WeatherCalendarPage() {
  const [loading, setLoading] = useState(true);
  const [daily, setDaily] = useState<WeatherDay[]>([]);
  const [predictions, setPredictions] = useState<DemandPrediction[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [fieldConfig, setFieldConfig] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/weather/forecast");
      if (res.ok) {
        const data = await res.json();
        setDaily(data.daily || []);
        setPredictions(data.predictions || []);
        setTournaments(data.tournaments || []);
        setFieldConfig(data.fieldConfig);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Build a lookup map
  const dayMap = new Map<string, { weather: WeatherDay; pred: DemandPrediction }>();
  daily.forEach((d, i) => {
    if (predictions[i]) {
      dayMap.set(d.date, { weather: d, pred: predictions[i] });
    }
  });
  const tournamentDates = new Set(tournaments.map((t: any) => t.date));

  // Build calendar grid for the forecast period
  const startDate = daily.length > 0 ? new Date(daily[0].date) : new Date();
  const year = startDate.getFullYear();
  const month = startDate.getMonth();

  // Full month that contains the start date
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const startDow = firstOfMonth.getDay() === 0 ? 6 : firstOfMonth.getDay() - 1; // Mon=0

  const calendarDays: Array<{ dateStr: string; day: number; inMonth: boolean } | null> = [];
  // Pad start
  for (let i = 0; i < startDow; i++) calendarDays.push(null);
  for (let d = 1; d <= lastOfMonth.getDate(); d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarDays.push({ dateStr, day: d, inMonth: true });
  }
  // Pad end
  while (calendarDays.length % 7 !== 0) calendarDays.push(null);

  const selected = selectedDate ? dayMap.get(selectedDate) : null;
  const selectedTournament = selectedDate ? tournaments.find((t: any) => t.date === selectedDate) : null;

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const dayHeaders = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/weather">
          <Button variant="ghost" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendario Inteligente</h1>
          <p className="text-muted-foreground text-sm">Demanda predicha por día con detalle meteorológico</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle>{monthNames[month]} {year}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayHeaders.map((h) => (
                <div key={h} className="text-center text-xs font-medium text-muted-foreground py-1">
                  {h}
                </div>
              ))}
            </div>
            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((cell, idx) => {
                if (!cell) {
                  return <div key={idx} className="h-20 rounded bg-gray-50/50" />;
                }
                const info = dayMap.get(cell.dateStr);
                const hasTournament = tournamentDates.has(cell.dateStr);
                const isSelected = selectedDate === cell.dateStr;
                const isToday = cell.dateStr === new Date().toISOString().split("T")[0];

                const bgColor = info
                  ? getCalendarColor(info.weather.golfScore)
                  : "bg-gray-50";

                return (
                  <button
                    key={idx}
                    onClick={() => info ? setSelectedDate(cell.dateStr) : null}
                    className={`h-20 rounded p-1 flex flex-col items-center justify-between text-[10px] transition-all ${bgColor} ${
                      isSelected ? "ring-2 ring-primary" : ""
                    } ${isToday ? "border-2 border-blue-400" : "border border-transparent"} ${
                      info ? "cursor-pointer hover:opacity-80" : "opacity-40 cursor-default"
                    }`}
                  >
                    <span className={`font-medium ${isToday ? "text-blue-600" : ""}`}>{cell.day}</span>
                    {info && (
                      <>
                        <span className="text-sm leading-none">{info.weather.weatherEmoji}</span>
                        <div className="flex items-center gap-0.5">
                          {getDemandArrow(info.pred.demandaPredecida)}
                          {info.pred.accionesRecomendadas.length > 0 && (
                            <Zap className="h-2.5 w-2.5 text-yellow-500" />
                          )}
                          {hasTournament && <Trophy className="h-2.5 w-2.5 text-purple-500" />}
                          {info.pred.isHoliday && <span>🎉</span>}
                        </div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-200" /> Score 80+</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-lime-200" /> Score 65-79</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-200" /> Score 50-64</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-200" /> Score 35-49</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-200" /> Score &lt;35</span>
              <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-yellow-500" /> Oportunidad</span>
              <span className="flex items-center gap-1"><Trophy className="h-3 w-3 text-purple-500" /> Torneo</span>
            </div>
          </CardContent>
        </Card>

        {/* Side Panel */}
        <div>
          {selected ? (
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-2xl">{selected.weather.weatherEmoji}</span>
                    {formatDateFull(selectedDate!)}
                  </CardTitle>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedDate(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>{selected.weather.weatherLabel}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Weather details */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-muted-foreground">Temperatura</p>
                    <p className="font-medium">{Math.round(selected.weather.temperatureMax)}° / {Math.round(selected.weather.temperatureMin)}°</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-muted-foreground">Viento</p>
                    <p className="font-medium">{Math.round(selected.weather.windspeedMax)} km/h</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-muted-foreground">Precipitación</p>
                    <p className="font-medium">{selected.weather.precipitationSum} mm</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-muted-foreground">Luz solar</p>
                    <p className="font-medium">{selected.weather.daylightHours}h</p>
                  </div>
                </div>

                {/* Golf Score */}
                <div className="text-center py-3">
                  <div className="text-4xl font-bold">{selected.weather.golfScore}</div>
                  <p className="text-xs text-muted-foreground">Golf Score /100</p>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                    <div
                      className={`h-full rounded-full ${getScoreBarColor(selected.weather.golfScore)}`}
                      style={{ width: `${selected.weather.golfScore}%` }}
                    />
                  </div>
                </div>

                <Separator />

                {/* Prediction breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Demanda</span>
                    <DemandBadge level={selected.pred.demandaPredecida} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ocupación est.</span>
                    <span className="font-medium">{selected.pred.ocupacionEstimada}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reservas</span>
                    <span className="font-medium">{selected.pred.reservasEsperadas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Revenue est.</span>
                    <span className="font-medium">{selected.pred.revenueEstimado.toLocaleString("es-ES")}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Confianza</span>
                    <span className="font-medium">{selected.pred.confianza}</span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    Factor: {selected.pred.factorPrincipal}
                  </p>
                </div>

                {/* Actions */}
                {selected.pred.accionesRecomendadas.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs font-medium mb-2">Acciones Recomendadas</p>
                      <div className="space-y-2">
                        {selected.pred.accionesRecomendadas.map((a, i) => (
                          <Button key={i} variant="outline" size="sm" className="w-full text-xs justify-start">
                            <Zap className="h-3 w-3 mr-2 text-yellow-500" />
                            {a}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {selectedTournament && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-2 text-sm">
                      <Trophy className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">Torneo: {selectedTournament.name}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  Haz click en un día del calendario para ver el detalle
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function getCalendarColor(score: number): string {
  if (score >= 80) return "bg-green-200";
  if (score >= 65) return "bg-lime-200";
  if (score >= 50) return "bg-yellow-200";
  if (score >= 35) return "bg-orange-200";
  return "bg-red-200";
}

function getScoreBarColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-lime-500";
  if (score >= 40) return "bg-yellow-500";
  if (score >= 20) return "bg-orange-500";
  return "bg-red-500";
}

function getDemandArrow(level: string) {
  if (level.includes("Alta") || level === "Muy Alta") {
    return <TrendingUp className="h-2.5 w-2.5 text-green-600" />;
  }
  if (level.includes("Baja") || level === "Cierre recomendado") {
    return <TrendingDown className="h-2.5 w-2.5 text-red-600" />;
  }
  return null;
}

function DemandBadge({ level }: { level: string }) {
  const variant = level.includes("Alta") || level === "Muy Alta"
    ? "bg-green-100 text-green-700"
    : level === "Media"
    ? "bg-yellow-100 text-yellow-700"
    : level.includes("Baja")
    ? "bg-orange-100 text-orange-700"
    : "bg-red-100 text-red-700";
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${variant}`}>{level}</span>;
}

function formatDateFull(dateStr: string): string {
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const d = new Date(dateStr);
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
}
