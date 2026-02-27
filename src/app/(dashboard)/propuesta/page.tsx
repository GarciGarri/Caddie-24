"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  BarChart3,
  Brain,
  MessageSquare,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  MapPin,
  Trophy,
  Utensils,
  Target,
  Zap,
  CalendarDays,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PropuestaPage() {
  const router = useRouter();
  const [demoMode, setDemoMode] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (!data.demoMode) {
          router.push("/dashboard");
        } else {
          setDemoMode(true);
        }
      })
      .catch(() => router.push("/dashboard"));
  }, [router]);

  if (demoMode === null) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      {/* Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium">
          <Zap className="h-4 w-4" />
          Propuesta Personalizada
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          GreenCRM para La Valmuza Golf
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          CRM inteligente con IA + gestión operativa dedicada diaria
        </p>
      </div>

      {/* Contexto del Cliente */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MapPin className="h-5 w-5 text-emerald-600" />
          La Valmuza Golf — Datos clave
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <span>San Julian de la Valmuza, Salamanca (5 min del centro)</span>
              </div>
              <div className="flex items-start gap-2">
                <Trophy className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <span>18 hoyos, Par 72, 6.040 yardas. Diseño: <strong>Severiano Ballesteros</strong> (2005)</span>
              </div>
              <div className="flex items-start gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <span>Reapertura sept. 2021 tras 7 años cerrado. Nueva propiedad e inversión</span>
              </div>
              <div className="flex items-start gap-2">
                <Utensils className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <span>Restaurante <strong>Aire by Tapas</strong> — gastronomía con terraza y vistas al lago</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <span>Cancha TopTracer, academia de golf, putting green, approach</span>
              </div>
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <span>~2.600 seguidores en Instagram (@lavalmuzagolf)</span>
              </div>
              <div className="flex items-start gap-2">
                <Star className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <span>Terreno llano, encinas centenarias, lago estratégico en hoyos 3, 9 y 18</span>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <span>Competencia: Salamanca Golf (a 13 km)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Retos */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Target className="h-5 w-5 text-amber-600" />
          Retos identificados
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            "Consolidar la base de abonados tras la reapertura de 2021",
            "Incrementar green fees de visitantes en horarios de baja demanda",
            "Fidelizar jugadores para evitar fuga a competencia",
            "Maximizar sinergias campo + restaurante Aire by Tapas",
            "Profesionalizar la comunicación y el marketing digital",
            "Explotar datos de jugadores que actualmente no se analizan",
          ].map((reto, i) => (
            <Card key={i} className="border-amber-200 bg-amber-50/30">
              <CardContent className="p-3 flex gap-2 items-start">
                <span className="text-amber-600 font-bold text-sm shrink-0">{i + 1}.</span>
                <span className="text-sm">{reto}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Modulos */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          GreenCRM — Plan Managed (Tier 2)
        </h2>
        <p className="text-muted-foreground text-sm">
          CRM inteligente con IA + gestión operativa dedicada diaria. No es solo software: es una persona de nuestro equipo dedicando <strong>1 hora cada día laborable</strong> exclusivamente a gestionar la plataforma y ejecutar acciones para La Valmuza.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: BarChart3, title: "Dashboard inteligente", desc: "Visión 360 en tiempo real: jugadores, reservas, ingresos, tendencias", value: "Control total del negocio sin informes manuales" },
            { icon: Users, title: "Gestión de jugadores", desc: "Perfiles completos con handicap, frecuencia, gasto, preferencias", value: "Conocer a cada abonado individualmente" },
            { icon: Zap, title: "Segmentación automática", desc: "Clasificación VIP / Premium / Standard basada en comportamiento", value: "Comunicaciones personalizadas según valor" },
            { icon: Shield, title: "Predicción de churn", desc: "IA que detecta jugadores en riesgo de abandono con semanas de antelación", value: "Actuar antes de que el abonado se vaya" },
            { icon: TrendingUp, title: "Predicción de demanda", desc: "Forecast basado en clima, estacionalidad, eventos y patrones históricos", value: "Optimizar precios y disponibilidad" },
            { icon: MessageSquare, title: "Campañas automatizadas", desc: "Email marketing + WhatsApp interactivo con segmentación dinámica", value: "Ofertas green fee, torneos, eventos Aire" },
            { icon: Star, title: "Análisis de sentimiento", desc: "Monitorización de Google Reviews, Instagram, encuestas, email", value: "Detectar problemas antes de que escalen" },
            { icon: Brain, title: "AI Copilot", desc: "Asistente conversacional para consultar métricas y lanzar campañas", value: "Cualquiera del equipo usa el CRM sin formación" },
          ].map((mod, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                    <mod.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{mod.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{mod.desc}</p>
                    <p className="text-xs text-emerald-600 font-medium mt-1">{mod.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Gestión operativa */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Gestión operativa incluida
        </h2>
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="p-4 space-y-2">
            <p className="font-semibold text-sm text-blue-800">1 hora/día laborable dedicada (~22 horas/mes)</p>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              {[
                "Operación diaria de la plataforma",
                "Ejecución y supervisión de campañas de marketing",
                "Revisión de alertas de churn y acciones correctivas",
                "Monitorización de sentimiento y respuesta a tendencias",
                "Informe mensual con KPIs, ROI y recomendaciones",
                "Reunión mensual de seguimiento con dirección",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Precios */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Estructura de precios</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Precio estándar */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Plan Estándar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-3xl font-bold">990</span>
                <span className="text-muted-foreground"> euros/mes</span>
                <span className="text-xs text-muted-foreground block mt-0.5">IVA no incluido</span>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Setup / onboarding: 0 euros</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Facturación mensual</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Compromiso mínimo: 6 meses</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Precio anual: 9.900 euros (2 meses gratis)</div>
              </div>
            </CardContent>
          </Card>

          {/* Oferta piloto */}
          <Card className="border-2 border-emerald-400 bg-emerald-50/30 relative">
            <div className="absolute -top-3 left-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              OFERTA PILOTO
            </div>
            <CardHeader className="pb-2 pt-5">
              <CardTitle className="text-base">Piloto de Lanzamiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-3xl font-bold text-emerald-700">590</span>
                <span className="text-muted-foreground"> euros/mes</span>
                <span className="text-xs text-emerald-600 font-medium block mt-0.5">40% de descuento durante 3 meses</span>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Sin compromiso de permanencia</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Cancelación sin penalización</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Mismo servicio completo</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Demostrar valor con datos reales</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Costes cero */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <p className="font-semibold text-sm mb-2">Costes adicionales para el cliente: CERO</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
              {[
                "Sin coste de setup",
                "Sin migración de datos",
                "Sin coste de formación",
                "Sin licencias adicionales",
                "Sin límite de usuarios",
                "Sin costes ocultos",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ROI */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-600" />
          Justificación Económica / ROI
        </h2>

        <Card className="bg-emerald-50/50 border-emerald-200">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm">
              <strong>Facturación estimada La Valmuza:</strong> 500.000 — 1.500.000 euros/año
            </p>
            <p className="text-sm">
              <strong>Coste GreenCRM:</strong> 11.880 euros/año = <span className="text-emerald-700 font-bold">0,8% — 2,4% de facturación</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Solo necesita generar ~12.000 euros adicionales/año para cubrir la inversión.
              Equivale a ~240 green fees adicionales a 50 euros o retener 10 abonados.
            </p>
          </CardContent>
        </Card>

        {/* Proyecciones */}
        <h3 className="font-semibold text-base">Proyecciones de impacto (12 meses)</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { metric: "Reducción abandono abonados", value: "+15%", detail: "Detección temprana de churn + campañas de retención" },
            { metric: "Green fees en horarios valle", value: "+22%", detail: "Predicción de demanda + ofertas dinámicas" },
            { metric: "ROI campañas marketing", value: "8.4x", detail: "Segmentación precisa + personalización por IA" },
            { metric: "Ahorro tiempo gestión", value: "~30h/mes", detail: "Automatización de tareas repetitivas" },
            { metric: "Ticket medio (cross-sell)", value: "+12%", detail: "Campañas cruzadas con Aire by Tapas" },
          ].map((item, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-emerald-700">{item.value}</p>
                <p className="text-sm font-medium mt-1">{item.metric}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Escenario conservador */}
        <Card className="border-emerald-300 bg-emerald-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Escenario conservador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-1 border-b border-emerald-200/50">
              <span>Retener 8 abonados/año (cuota media 1.200 euros)</span>
              <span className="font-semibold text-emerald-700">+9.600 euros</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-emerald-200/50">
              <span>200 green fees adicionales en valle a 40 euros</span>
              <span className="font-semibold text-emerald-700">+8.000 euros</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-emerald-200/50">
              <span>+15 comensales/mes en Aire by Tapas a 25 euros</span>
              <span className="font-semibold text-emerald-700">+4.500 euros</span>
            </div>
            <div className="flex justify-between items-center py-1 pt-2 font-bold">
              <span>Total conservador vs inversión 11.880 euros</span>
              <span className="text-emerald-700">+22.100 euros (ROI 1.86x)</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Plan de implantación */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Plan de Implantación
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { week: "Semana 1", title: "Auditoría y migración", items: ["Análisis de base de datos actual", "Importación de abonados y jugadores", "Configuración de integraciones"] },
            { week: "Semana 2", title: "Configuración", items: ["Dashboard personalizado La Valmuza", "Segmentos de jugadores", "Setup análisis de sentimiento"] },
            { week: "Semana 3", title: "Campaña piloto", items: ["Reactivación de jugadores inactivos", "Medición en tiempo real", "Ajustes del modelo predictivo"] },
            { week: "Semana 4", title: "Operación autónoma", items: ["Inicio gestión diaria", "Primer informe con métricas base", "Plan de acción mes 2"] },
          ].map((phase, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{phase.week}</p>
                    <p className="text-sm font-semibold">{phase.title}</p>
                  </div>
                </div>
                <div className="space-y-1.5 ml-9">
                  {phase.items.map((item, j) => (
                    <div key={j} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <ArrowRight className="h-3 w-3 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
