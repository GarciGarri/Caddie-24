"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Loader2,
  CloudSun,
  Thermometer,
  Wind,
  Droplets,
  Sun,
  Sunset,
  AlertTriangle,
  TrendingUp,
  Calendar,
  BarChart3,
  Zap,
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
  weatherCode: number;
  weatherLabel: string;
  weatherEmoji: string;
  golfScore: number;
  demandLevel: string;
  daylightHours: number;
  sunrise: string;
  sunset: string;
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

interface HourlyData {
  time: string;
  temperature: number;
  precipitation: number;
  windspeed: number;
  cloudcover: number;
  isOptimal: boolean;
}

interface WeatherAlert {
  id: string;
  type: string;
  level: string;
  title: string;
  description: string;
  date: string;
  daysAhead: number;
  actionLabel?: string;
}

export default function WeatherDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [daily, setDaily] = useState<WeatherDay[]>([]);
  const [predictions, setPredictions] = useState<DemandPrediction[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [todayHourly, setTodayHourly] = useState<HourlyData[]>([]);
  const [fieldConfig, setFieldConfig] = useState<any>(null);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(0);

  useEffect(() => {
    fetchForecast();
  }, []);

  const fetchForecast = async () => {
    try {
      const res = await fetch("/api/weather/forecast");
      if (res.ok) {
        const data = await res.json();
        setDaily(data.daily || []);
        setPredictions(data.predictions || []);
        setAlerts(data.alerts || []);
        setTodayHourly(data.todayHourly || []);
        setFieldConfig(data.fieldConfig);
        setTournaments(data.tournaments || []);
      }
    } catch (error) {
      console.error("Error fetching forecast:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Cargando datos meteorológicos...</p>
      </div>
    );
  }

  const today = daily[0];
  const todayPred = predictions[0];
  const selectedWeather = daily[selectedDay];
  const selectedPred = predictions[selectedDay];

  // Summary KPIs
  const totalRevenueWeek = predictions.slice(0, 7).reduce((s, p) => s + p.revenueEstimado, 0);
  const avgGolfScoreWeek = Math.round(daily.slice(0, 7).reduce((s, d) => s + d.golfScore, 0) / Math.min(7, daily.length));
  const goodDays = daily.filter((d) => d.golfScore >= 70).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CloudSun className="h-6 w-6 text-blue-500" />
            Meteorología y Predicción
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {fieldConfig?.name} — Próximos 14 días con predicción de demanda
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/weather/calendar">
            <Button variant="outline" size="sm"><Calendar className="h-4 w-4 mr-1" /> Calendario</Button>
          </Link>
          <Link href="/weather/analytics">
            <Button variant="outline" size="sm"><BarChart3 className="h-4 w-4 mr-1" /> Analytics</Button>
          </Link>
          <Link href="/weather/automations">
            <Button variant="outline" size="sm"><Zap className="h-4 w-4 mr-1" /> Automaciones</Button>
          </Link>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.slice(0, 3).map((alert) => (
            <div key={alert.id} className={`flex items-start gap-3 rounded-lg border p-3 ${
              alert.level === "critical" ? "bg-red-50 border-red-200" :
              alert.level === "warning" ? "bg-orange-50 border-orange-200" :
              alert.level === "opportunity" ? "bg-emerald-50 border-emerald-200" :
              "bg-blue-50 border-blue-200"
            }`}>
              <AlertTriangle className={`h-5 w-5 mt-0.5 shrink-0 ${
                alert.level === "critical" ? "text-red-500" :
                alert.level === "warning" ? "text-orange-500" :
                alert.level === "opportunity" ? "text-emerald-500" :
                "text-blue-500"
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{alert.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
              </div>
              {alert.actionLabel && (
                <Button size="sm" variant="outline" className="shrink-0 text-xs">
                  {alert.actionLabel}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-muted-foreground">Golf Score Hoy</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-3xl font-bold">{today?.golfScore || 0}</span>
              <span className="text-lg mb-0.5">/100</span>
            </div>
            <GolfScoreBar score={today?.golfScore || 0} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-muted-foreground">Demanda Hoy</p>
            <p className="text-xl font-bold mt-1">{todayPred?.demandaPredecida || "—"}</p>
            <p className="text-xs text-muted-foreground">{todayPred?.ocupacionEstimada} ocupación est.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-muted-foreground">Revenue Semana</p>
            <p className="text-xl font-bold mt-1">{totalRevenueWeek.toLocaleString("es-ES")}€</p>
            <p className="text-xs text-muted-foreground">{goodDays} de 14 días buenos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-muted-foreground">Score Medio Semana</p>
            <p className="text-xl font-bold mt-1">{avgGolfScoreWeek}</p>
            <GolfScoreBar score={avgGolfScoreWeek} />
          </CardContent>
        </Card>
      </div>

      {/* 14-Day Forecast Strip */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Próximos 14 Días</CardTitle>
          <CardDescription>Haz click en un día para ver detalle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-2 min-w-max pb-2">
              {daily.map((day, idx) => {
                const pred = predictions[idx];
                const isToday = idx === 0;
                const isSelected = idx === selectedDay;
                const hasTournament = tournaments.some((t: any) => t.date === day.date);
                return (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDay(idx)}
                    className={`flex flex-col items-center p-2 rounded-lg border min-w-[72px] transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-[10px] text-muted-foreground">
                      {isToday ? "Hoy" : formatDayShort(day.date)}
                    </span>
                    <span className="text-[10px] font-medium">
                      {new Date(day.date).getDate()}/{new Date(day.date).getMonth() + 1}
                    </span>
                    <span className="text-xl my-1">{day.weatherEmoji}</span>
                    <span className="text-xs font-medium">
                      {Math.round(day.temperatureMax)}° / {Math.round(day.temperatureMin)}°
                    </span>
                    <GolfScoreDot score={day.golfScore} />
                    <span className="text-[9px] text-muted-foreground mt-1">
                      {pred?.demandaPredecida?.replace("Muy ", "M.") || "—"}
                    </span>
                    {hasTournament && <span className="text-[10px]">🏆</span>}
                    {pred?.isHoliday && <span className="text-[10px]">🎉</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Detail + Today Widget */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Selected Day Detail */}
        {selectedWeather && selectedPred && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-2xl">{selectedWeather.weatherEmoji}</span>
                {selectedDay === 0 ? "Hoy" : formatDayLong(selectedWeather.date)}
              </CardTitle>
              <CardDescription>{selectedWeather.weatherLabel} — Golf Score {selectedWeather.golfScore}/100</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">{Math.round(selectedWeather.temperatureMax)}°C / {Math.round(selectedWeather.temperatureMin)}°C</p>
                    <p className="text-xs text-muted-foreground">Máx / Mín</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">{Math.round(selectedWeather.windspeedMax)} km/h</p>
                    <p className="text-xs text-muted-foreground">Viento máx</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-400" />
                  <div>
                    <p className="text-sm font-medium">{selectedWeather.precipitationSum} mm</p>
                    <p className="text-xs text-muted-foreground">Precipitación</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium">{selectedWeather.daylightHours}h</p>
                    <p className="text-xs text-muted-foreground">Luz solar</p>
                  </div>
                </div>
              </div>
              <Separator />
              {/* Demand prediction */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Demanda Predicha</span>
                  <DemandBadge level={selectedPred.demandaPredecida} />
                </div>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ocupación estimada</span>
                    <span className="font-medium">{selectedPred.ocupacionEstimada}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reservas esperadas</span>
                    <span className="font-medium">{selectedPred.reservasEsperadas} / {fieldConfig?.capacity || 80}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Revenue estimado</span>
                    <span className="font-medium">{selectedPred.revenueEstimado.toLocaleString("es-ES")}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Confianza</span>
                    <span className="font-medium">{selectedPred.confianza}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  Factor principal: {selectedPred.factorPrincipal}
                </p>
              </div>
              {/* Actions */}
              {selectedPred.accionesRecomendadas.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Acciones Recomendadas</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPred.accionesRecomendadas.map((action, i) => (
                        <Badge key={i} variant="outline" className="text-xs cursor-pointer hover:bg-primary/10">
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Today's Hourly Widget */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              Hoy en el Campo
            </CardTitle>
            <CardDescription>
              <Sun className="h-3 w-3 inline mr-1" />{today?.sunrise} — <Sunset className="h-3 w-3 inline mr-1" />{today?.sunset}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayHourly.length > 0 ? (
              <div className="space-y-1 max-h-[340px] overflow-y-auto">
                {todayHourly
                  .filter((h) => {
                    const hour = new Date(h.time).getHours();
                    return hour >= 6 && hour <= 21;
                  })
                  .map((h) => {
                    const hour = new Date(h.time).getHours();
                    return (
                      <div
                        key={h.time}
                        className={`flex items-center gap-3 px-3 py-1.5 rounded text-sm ${
                          h.isOptimal ? "bg-green-50 border border-green-100" : ""
                        }`}
                      >
                        <span className="w-12 text-muted-foreground text-xs">{hour}:00</span>
                        <span className="w-12 font-medium">{Math.round(h.temperature)}°C</span>
                        <span className="w-16 text-xs text-muted-foreground">
                          <Wind className="h-3 w-3 inline mr-0.5" />{Math.round(h.windspeed)}
                        </span>
                        <span className="w-14 text-xs text-muted-foreground">
                          <Droplets className="h-3 w-3 inline mr-0.5" />{h.precipitation}mm
                        </span>
                        {h.isOptimal && (
                          <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 ml-auto">
                            Óptimo
                          </Badge>
                        )}
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Datos horarios no disponibles
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Heatmap */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Mapa de Calor — Próximas 2 Semanas</CardTitle>
          <CardDescription>Rojo = mal tiempo/baja demanda, Verde = perfecto/alta demanda</CardDescription>
        </CardHeader>
        <CardContent>
          <WeeklyHeatmap daily={daily} predictions={predictions} />
        </CardContent>
      </Card>
    </div>
  );
}

// ---- Helper Components ----

function GolfScoreBar({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-green-500" :
    score >= 60 ? "bg-lime-500" :
    score >= 40 ? "bg-yellow-500" :
    score >= 20 ? "bg-orange-500" :
    "bg-red-500";
  return (
    <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1.5">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
    </div>
  );
}

function GolfScoreDot({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-green-500" :
    score >= 60 ? "bg-lime-500" :
    score >= 40 ? "bg-yellow-500" :
    score >= 20 ? "bg-orange-500" :
    "bg-red-500";
  return (
    <div className="flex items-center gap-1 mt-1">
      <div className={`h-2 w-2 rounded-full ${color}`} />
      <span className="text-[10px] font-medium">{score}</span>
    </div>
  );
}

function DemandBadge({ level }: { level: string }) {
  const variant = level.includes("Alta") || level === "Muy Alta"
    ? "bg-green-100 text-green-700"
    : level === "Media"
    ? "bg-yellow-100 text-yellow-700"
    : level.includes("Baja") || level === "Muy Baja"
    ? "bg-orange-100 text-orange-700"
    : "bg-red-100 text-red-700";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${variant}`}>
      {level}
    </span>
  );
}

function WeeklyHeatmap({ daily, predictions }: { daily: WeatherDay[]; predictions: DemandPrediction[] }) {
  const dayLabels = ["L", "M", "X", "J", "V", "S", "D"];

  // Group by weeks
  const weeks: Array<Array<{ day: WeatherDay; pred: DemandPrediction } | null>> = [];
  let currentWeek: Array<{ day: WeatherDay; pred: DemandPrediction } | null> = [];

  daily.forEach((day, idx) => {
    const d = new Date(day.date);
    const dow = d.getDay() === 0 ? 6 : d.getDay() - 1; // Mon=0, Sun=6

    // Pad first week with nulls
    if (idx === 0) {
      for (let i = 0; i < dow; i++) currentWeek.push(null);
    }

    currentWeek.push({ day, pred: predictions[idx] });

    if (dow === 6 || idx === daily.length - 1) {
      // Pad remaining days of week
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex gap-1 mb-2">
        <div className="w-16" />
        {dayLabels.map((l) => (
          <div key={l} className="flex-1 text-center text-xs text-muted-foreground font-medium">
            {l}
          </div>
        ))}
      </div>
      {/* Rows */}
      {weeks.map((week, wi) => (
        <div key={wi} className="flex gap-1">
          <div className="w-16 text-xs text-muted-foreground flex items-center">
            {week.find((d) => d)?.day.date
              ? `Sem ${getWeekNumber(week.find((d) => d)!.day.date)}`
              : ""}
          </div>
          {week.map((cell, ci) => {
            if (!cell) {
              return <div key={ci} className="flex-1 h-14 rounded bg-gray-50" />;
            }
            const { day, pred } = cell;
            const score = day.golfScore;
            const bgColor = getHeatmapColor(score);
            const ocupacion = parseInt(pred.ocupacionEstimada);
            return (
              <div
                key={ci}
                className={`flex-1 h-14 rounded flex flex-col items-center justify-center text-[10px] gap-0.5 ${bgColor}`}
                title={`${formatDayLong(day.date)}: Score ${score}, ${pred.demandaPredecida}`}
              >
                <span>{day.weatherEmoji}</span>
                <span className="font-medium">{score}</span>
                <span className="opacity-75">{ocupacion}%</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function getHeatmapColor(score: number): string {
  if (score >= 80) return "bg-green-200 text-green-800";
  if (score >= 65) return "bg-lime-200 text-lime-800";
  if (score >= 50) return "bg-yellow-200 text-yellow-800";
  if (score >= 35) return "bg-orange-200 text-orange-800";
  return "bg-red-200 text-red-800";
}

function getWeekNumber(dateStr: string): number {
  const d = new Date(dateStr);
  const start = new Date(d.getFullYear(), 0, 1);
  const diff = d.getTime() - start.getTime();
  return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
}

function formatDayShort(dateStr: string): string {
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  return days[new Date(dateStr).getDay()];
}

function formatDayLong(dateStr: string): string {
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const d = new Date(dateStr);
  return `${days[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
}
