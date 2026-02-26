"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Loader2,
  ChevronLeft,
  BarChart3,
  TrendingUp,
  CloudOff,
  Target,
  DollarSign,
  CalendarCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

interface HistoricalDay {
  date: string;
  golfScore: number;
  occupancy: number;
  revenue: number;
  weatherCategory: string;
  isWeekend: boolean;
}

interface KPIs {
  totalDays: number;
  daysLostByWeather: number;
  avgOccupancyGoodWeather: number;
  avgOccupancyBadWeather: number;
  totalRevenue: number;
  revenueLostEstimate: number;
  predictionAccuracy: number;
}

export default function WeatherAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [historicalData, setHistoricalData] = useState<HistoricalDay[]>([]);
  const [correlationData, setCorrelationData] = useState<any[]>([]);
  const [revenueByWeather, setRevenueByWeather] = useState<any[]>([]);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [automationStats, setAutomationStats] = useState<any>(null);
  const [forecastRevenue, setForecastRevenue] = useState<any[]>([]);
  const [accuracy, setAccuracy] = useState<any>(null);
  const [isSimulated, setIsSimulated] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [analyticsRes, forecastRes] = await Promise.all([
        fetch("/api/weather/analytics"),
        fetch("/api/weather/forecast"),
      ]);
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setHistoricalData(data.historicalData || []);
        setCorrelationData(data.correlationData || []);
        setRevenueByWeather(data.revenueByWeather || []);
        setKpis(data.kpis);
        setAutomationStats(data.automationStats);
        setAccuracy(data.accuracy || null);
        setIsSimulated(data.isSimulated || false);
      }
      if (forecastRes.ok) {
        const data = await forecastRes.json();
        setForecastRevenue(
          (data.predictions || []).map((p: any) => ({
            date: p.fecha.substring(5),
            revenue: p.revenueEstimado,
            ocupacion: parseInt(p.ocupacionEstimada),
            golfScore: p.golfScore,
          }))
        );
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

  // Separate scatter data by type
  const weekendData = correlationData.filter((d) => d.dayType === "Fin de semana");
  const weekdayData = correlationData.filter((d) => d.dayType === "Laboral");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/weather">
          <Button variant="ghost" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-500" />
            Analytics Meteorológico
          </h1>
          <p className="text-muted-foreground text-sm">Correlación clima-negocio últimos 6 meses</p>
        </div>
      </div>

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Precisión Predicción</span>
              </div>
              <p className="text-2xl font-bold mt-1">{kpis.predictionAccuracy}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-2">
                <CloudOff className="h-4 w-4 text-red-500" />
                <span className="text-xs text-muted-foreground">Días Perdidos</span>
              </div>
              <p className="text-2xl font-bold mt-1">{kpis.daysLostByWeather}</p>
              <p className="text-xs text-muted-foreground">de {kpis.totalDays} días</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-orange-500" />
                <span className="text-xs text-muted-foreground">Revenue Perdido</span>
              </div>
              <p className="text-2xl font-bold mt-1">{(kpis.revenueLostEstimate / 1000).toFixed(1)}k€</p>
              <p className="text-xs text-muted-foreground">por clima adverso</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">Ocup. Buen Tiempo</span>
              </div>
              <p className="text-2xl font-bold mt-1">{kpis.avgOccupancyGoodWeather}%</p>
              <p className="text-xs text-muted-foreground">vs {kpis.avgOccupancyBadWeather}% mal tiempo</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Simulated data banner */}
      {isSimulated && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm flex items-center gap-2">
          <span className="text-yellow-600">⚠️</span>
          <span className="text-yellow-800">
            Datos simulados — Se usarán datos reales cuando haya ≥30 registros diarios.
            Usa el botón &quot;Snapshot&quot; diariamente y registra la ocupación real.
          </span>
        </div>
      )}

      {/* Accuracy Section */}
      {accuracy && accuracy.totalTrackedDays > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Grado de Acierto de Predicciones
            </CardTitle>
            <CardDescription>
              Comparación entre ocupación predicha y real — {accuracy.totalTrackedDays} días registrados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Accuracy KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 text-center border border-green-100">
                <p className="text-3xl font-bold text-green-700">
                  {accuracy.accuracyScore != null ? `${accuracy.accuracyScore}%` : "—"}
                </p>
                <p className="text-xs text-green-600 mt-1">Acierto General</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-700">{accuracy.distribution.accurate}</p>
                <p className="text-xs text-green-600 mt-1">✓ Precisos (±15%)</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-yellow-700">{accuracy.distribution.close}</p>
                <p className="text-xs text-yellow-600 mt-1">≈ Cercanos (±30%)</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-red-700">{accuracy.distribution.missed}</p>
                <p className="text-xs text-red-600 mt-1">✗ Fallidos (&gt;30%)</p>
              </div>
            </div>

            {/* Accuracy distribution bar */}
            {accuracy.totalTrackedDays > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Distribución</p>
                <div className="flex h-4 rounded-full overflow-hidden">
                  {accuracy.distribution.accurate > 0 && (
                    <div
                      className="bg-green-500 transition-all"
                      style={{
                        width: `${(accuracy.distribution.accurate / accuracy.totalTrackedDays) * 100}%`,
                      }}
                    />
                  )}
                  {accuracy.distribution.close > 0 && (
                    <div
                      className="bg-yellow-400 transition-all"
                      style={{
                        width: `${(accuracy.distribution.close / accuracy.totalTrackedDays) * 100}%`,
                      }}
                    />
                  )}
                  {accuracy.distribution.missed > 0 && (
                    <div
                      className="bg-red-500 transition-all"
                      style={{
                        width: `${(accuracy.distribution.missed / accuracy.totalTrackedDays) * 100}%`,
                      }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Accuracy timeline chart */}
            {accuracy.timeline.length > 3 && (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={accuracy.timeline}
                    margin={{ top: 10, right: 10, bottom: 20, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(val: number, name: string) => [`${val}%`, name]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      name="Predicción"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      name="Real"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Automation attribution */}
      {automationStats && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Revenue Atribuido a Automaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-green-700">{automationStats.totalSent}</p>
                <p className="text-xs text-green-600">Campañas Enviadas</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-blue-700">{automationStats.avgOpenRate}%</p>
                <p className="text-xs text-blue-600">Tasa Apertura</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-purple-700">{automationStats.totalBookings}</p>
                <p className="text-xs text-purple-600">Reservas Generadas</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-amber-700">{automationStats.totalRevenue}€</p>
                <p className="text-xs text-amber-600">Revenue Atribuido</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chart 1: Scatter — Golf Score vs Occupancy */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Correlación Golf Score vs Ocupación</CardTitle>
          <CardDescription>Últimos 6 meses — A partir de Golf Score 70, la ocupación sube significativamente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] sm:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="golfScore" name="Golf Score" domain={[0, 100]} tick={{ fontSize: 12 }} label={{ value: "Golf Score", position: "bottom", offset: 5, fontSize: 12 }} />
                <YAxis type="number" dataKey="occupancy" name="Ocupación" domain={[0, 100]} tick={{ fontSize: 12 }} label={{ value: "Ocupación %", angle: -90, position: "insideLeft", fontSize: 12 }} />
                <Tooltip
                  formatter={(val: number, name: string) => [`${val}${name === "Ocupación" ? "%" : ""}`, name]}
                  labelFormatter={() => ""}
                />
                <Legend />
                <Scatter name="Laboral" data={weekdayData} fill="#6366f1" opacity={0.6} />
                <Scatter name="Fin de semana" data={weekendData} fill="#f59e0b" opacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Chart 2: Bar — Revenue by Weather Category */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Revenue por Condición Meteorológica</CardTitle>
          <CardDescription>Revenue promedio diario y total por tipo de clima</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] sm:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByWeather} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(val: number) => [`${val.toLocaleString("es-ES")}€`]} />
                <Legend />
                <Bar dataKey="avgRevenue" name="Revenue Medio/Día" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="days" name="Nº Días" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Chart 3: Line — Revenue Forecast 14 Days */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Forecast Revenue — Próximos 14 Días</CardTitle>
          <CardDescription>Basado en predicción de demanda y tarifas medias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] sm:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastRevenue} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(val: number, name: string) => {
                    if (name === "Revenue") return [`${val.toLocaleString("es-ES")}€`, name];
                    return [`${val}`, name];
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
                <Line type="monotone" dataKey="golfScore" name="Golf Score" stroke="#6366f1" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Chart 4: Days Lost */}
      {kpis && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Impacto Económico — Días Perdidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 text-center">
                <p className="text-4xl font-bold text-red-600">{kpis.daysLostByWeather}</p>
                <p className="text-sm text-muted-foreground mt-1">Días con Golf Score &lt;30</p>
                <p className="text-xs text-muted-foreground">en los últimos 6 meses</p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <p className="text-4xl font-bold text-orange-600">{(kpis.revenueLostEstimate / 1000).toFixed(1)}k€</p>
                <p className="text-sm text-muted-foreground mt-1">Revenue no generado</p>
                <p className="text-xs text-muted-foreground">estimado por clima adverso</p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <p className="text-4xl font-bold text-green-600">{(kpis.totalRevenue / 1000).toFixed(0)}k€</p>
                <p className="text-sm text-muted-foreground mt-1">Revenue Total</p>
                <p className="text-xs text-muted-foreground">últimos 6 meses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
