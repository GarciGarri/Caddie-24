"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Megaphone,
  Trophy,
  CloudSun,
  Bot,
  Settings,
  FileText,
  ChevronDown,
  ChevronRight,
  Zap,
  Shield,
  Database,
  Globe,
  Cpu,
  Palette,
  BarChart3,
  Target,
  Lightbulb,
  HelpCircle,
  BookOpen,
  Workflow,
  Lock,
  Bell,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ─── Accordion Component ────────────────────────────────────────
function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-lg">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-3 text-left text-sm font-medium hover:bg-accent/50 transition-colors"
      >
        {title}
        {open ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {open && <div className="px-4 pb-4 text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}

// ─── Module Card ────────────────────────────────────────────────
function ModuleCard({
  icon: Icon,
  title,
  description,
  features,
  route,
  color,
}: {
  icon: any;
  title: string;
  description: string;
  features: string[];
  route: string;
  color: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <code className="text-[11px] text-muted-foreground">{route}</code>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">{description}</p>
        <ul className="space-y-1">
          {features.map((f, i) => (
            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
              <span className="text-primary mt-0.5">-</span>
              {f}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// ─── Tech Badge ─────────────────────────────────────────────────
function TechCard({
  name,
  version,
  description,
  category,
}: {
  name: string;
  version: string;
  description: string;
  category: string;
}) {
  const catColor: Record<string, string> = {
    Framework: "bg-blue-100 text-blue-700",
    Lenguaje: "bg-purple-100 text-purple-700",
    "Base de Datos": "bg-green-100 text-green-700",
    IA: "bg-orange-100 text-orange-700",
    UI: "bg-pink-100 text-pink-700",
    Auth: "bg-red-100 text-red-700",
    "Estado/Datos": "bg-cyan-100 text-cyan-700",
    Comunicaciones: "bg-emerald-100 text-emerald-700",
  };
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{name}</span>
          <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{version}</code>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Badge variant="secondary" className={`text-[10px] shrink-0 ${catColor[category] || ""}`}>
        {category}
      </Badge>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────
export default function GuidePage() {
  const [activeTab, setActiveTab] = useState<string>("overview");

  const tabs = [
    { id: "overview", label: "Vista General", icon: BookOpen },
    { id: "modules", label: "Modulos", icon: LayoutDashboard },
    { id: "tech", label: "Tecnologias", icon: Cpu },
    { id: "architecture", label: "Arquitectura", icon: Workflow },
    { id: "bestpractices", label: "Buenas Practicas", icon: Target },
    { id: "faq", label: "FAQ", icon: HelpCircle },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Guia del Sistema
        </h1>
        <p className="text-muted-foreground mt-1">
          Documentacion completa de Caddie 24 — CRM inteligente para campos de golf
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 border-b pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-[1px] ${
              activeTab === tab.id
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── VISTA GENERAL ─── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Que es Caddie 24?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Caddie 24</strong> es un CRM (Customer Relationship Management)
                inteligente disenado especificamente para la gestion de campos de golf. Integra comunicacion
                por WhatsApp, analisis meteorologico, gestion de torneos y analisis de datos impulsado por
                inteligencia artificial.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border p-4 text-center">
                  <div className="text-2xl mb-1">🏌️</div>
                  <p className="font-medium text-foreground text-xs">Gestion de Jugadores</p>
                  <p className="text-[11px] mt-1">Perfiles completos, engagement tracking, segmentacion inteligente</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <div className="text-2xl mb-1">💬</div>
                  <p className="font-medium text-foreground text-xs">WhatsApp Business</p>
                  <p className="text-[11px] mt-1">Comunicacion directa, chatbot IA, campañas masivas</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <div className="text-2xl mb-1">🤖</div>
                  <p className="font-medium text-foreground text-xs">IA Integrada</p>
                  <p className="text-[11px] mt-1">Analisis de sentimiento, predicciones, asistente Caddie AI</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5 text-blue-500" />
                Como funciona?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="font-medium text-blue-700 text-xs mb-2">1. Entrada de Datos</p>
                  <ul className="space-y-1 text-xs">
                    <li>- Jugadores se registran manualmente o via WhatsApp</li>
                    <li>- Mensajes WhatsApp se reciben via webhook (Meta Cloud API)</li>
                    <li>- Datos meteorologicos se obtienen de Open-Meteo API</li>
                    <li>- El staff introduce datos de ocupacion/revenue diarios</li>
                  </ul>
                </div>
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="font-medium text-green-700 text-xs mb-2">2. Procesamiento IA</p>
                  <ul className="space-y-1 text-xs">
                    <li>- Analisis de sentimiento en conversaciones</li>
                    <li>- Deteccion de intencion del mensaje</li>
                    <li>- Generacion de respuestas automaticas</li>
                    <li>- Prediccion de demanda basada en meteorologia</li>
                  </ul>
                </div>
                <div className="rounded-lg bg-purple-50 p-4">
                  <p className="font-medium text-purple-700 text-xs mb-2">3. Acciones y Campañas</p>
                  <ul className="space-y-1 text-xs">
                    <li>- Campañas segmentadas por WhatsApp</li>
                    <li>- A/B Testing automatico</li>
                    <li>- Templates aprobados por Meta</li>
                    <li>- Alertas meteorologicas a jugadores</li>
                  </ul>
                </div>
                <div className="rounded-lg bg-orange-50 p-4">
                  <p className="font-medium text-orange-700 text-xs mb-2">4. Analisis y Mejora</p>
                  <ul className="space-y-1 text-xs">
                    <li>- Dashboard con KPIs en tiempo real</li>
                    <li>- Precision de predicciones vs realidad</li>
                    <li>- Caddie AI para consultas inteligentes</li>
                    <li>- Sugerencias de comunicacion personalizadas</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Seguridad y Roles
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>El sistema utiliza autenticacion JWT con 3 niveles de acceso:</p>
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <Badge className="bg-red-100 text-red-700 mb-2">ADMIN</Badge>
                  <p className="text-xs">Acceso total. Configuracion del sistema, gestion de usuarios, API keys, automatizaciones.</p>
                </div>
                <div className="rounded-lg border p-3">
                  <Badge className="bg-yellow-100 text-yellow-700 mb-2">MANAGER</Badge>
                  <p className="text-xs">Gestion de campañas, torneos, jugadores. Sin acceso a configuracion del sistema.</p>
                </div>
                <div className="rounded-lg border p-3">
                  <Badge className="bg-blue-100 text-blue-700 mb-2">AGENT</Badge>
                  <p className="text-xs">Responder conversaciones, gestionar jugadores asignados. Acceso limitado.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── MODULOS ─── */}
      {activeTab === "modules" && (
        <div className="grid gap-4 md:grid-cols-2">
          <ModuleCard
            icon={LayoutDashboard}
            title="Dashboard"
            description="Panel principal con KPIs, actividad reciente, prevision meteorologica y acciones rapidas."
            route="/dashboard"
            color="bg-slate-600"
            features={[
              "4 KPIs principales: jugadores, conversaciones, campañas, VIP",
              "Widget meteorologico con prevision 3 dias",
              "Actividad reciente de WhatsApp con indicador de sentimiento",
              "Acciones rapidas para tareas frecuentes",
              "Caddie AI: chatbot con acceso a todos los datos del CRM",
            ]}
          />
          <ModuleCard
            icon={Users}
            title="Jugadores"
            description="Gestion completa de perfiles de jugadores con historial de visitas, consumos y tags."
            route="/players"
            color="bg-blue-600"
            features={[
              "Perfil completo: handicap, idioma, preferencias de juego",
              "Historial de visitas y consumos con categorias",
              "Nivel de engagement: NEW, LOW, MEDIUM, HIGH, VIP",
              "Tags automaticos por IA y manuales",
              "Sugerencias de comunicacion generadas por IA",
            ]}
          />
          <ModuleCard
            icon={MessageSquare}
            title="Bandeja de Entrada"
            description="Centro de comunicaciones WhatsApp con soporte multicanal y chatbot IA."
            route="/inbox"
            color="bg-green-600"
            features={[
              "Conversaciones en tiempo real via WhatsApp Business Cloud API",
              "Chatbot IA con respuestas automaticas",
              "Analisis de sentimiento (POSITIVE, NEUTRAL, NEGATIVE, FRUSTRATED)",
              "Deteccion de intencion del mensaje",
              "Ventana de 24h de WhatsApp y envio de templates",
              "Notas internas entre agentes",
            ]}
          />
          <ModuleCard
            icon={Megaphone}
            title="Campañas"
            description="Creacion y envio de campañas masivas segmentadas por WhatsApp."
            route="/campaigns"
            color="bg-purple-600"
            features={[
              "Segmentacion por engagement, idioma, tags, actividad",
              "A/B Testing con analisis automatico del ganador",
              "Programacion de envio con hora optima",
              "Metricas: enviados, entregados, leidos, respondidos",
              "Templates aprobados por Meta con variables dinamicas",
            ]}
          />
          <ModuleCard
            icon={Trophy}
            title="Torneos"
            description="Gestion completa del ciclo de vida de torneos: creacion, inscripcion, resultados."
            route="/tournaments"
            color="bg-amber-600"
            features={[
              "Formatos: Stableford, Medal, Scramble, Match Play, Best Ball, Fourball",
              "Categorias con rangos de handicap y genero",
              "Inscripcion con lista de espera y control de pagos",
              "Resultados con scorecard detallado por hoyo",
              "Comunicacion automatica a participantes",
            ]}
          />
          <ModuleCard
            icon={CloudSun}
            title="Meteorologia"
            description="Prevision meteorologica, prediccion de demanda y tracking de precision."
            route="/weather"
            color="bg-cyan-600"
            features={[
              "Mapa de calor con Golf Score (0-100) basado en clima",
              "Prediccion de demanda: 40% clima + 35% calendario + 25% historico",
              "Rango configurable: 1-4 semanas, pasado/futuro/ambos",
              "Datos historicos via Open-Meteo Archive API",
              "Input diario de ocupacion real vs predicha",
              "Tracking de precision con badges de acierto",
            ]}
          />
          <ModuleCard
            icon={FileText}
            title="Templates"
            description="Gestion de plantillas de mensajes WhatsApp aprobadas por Meta."
            route="/templates"
            color="bg-rose-600"
            features={[
              "Generacion de templates con IA (GPT-4o-mini)",
              "Variables dinamicas con placeholder {{1}}, {{2}}...",
              "Modos: generar, mejorar, anadir emojis, mas formal, mas casual",
              "Estado de aprobacion: PENDING, APPROVED, REJECTED",
              "Multi-idioma: ES, EN, DE, FR",
            ]}
          />
          <ModuleCard
            icon={Bot}
            title="IA Insights"
            description="Centro de inteligencia artificial con analisis avanzado y metricas de uso."
            route="/ai"
            color="bg-orange-600"
            features={[
              "Metricas de uso de IA: mensajes generados, sentimiento medio",
              "Log de analisis: tipo, tokens, modelo, duracion",
              "Escalaciones automaticas por sentimiento negativo",
              "Tasa de resolucion automatica",
            ]}
          />
          <ModuleCard
            icon={Settings}
            title="Configuracion"
            description="Ajustes del club, conexion WhatsApp, voz de marca y automatizaciones."
            route="/settings"
            color="bg-gray-600"
            features={[
              "Datos del club: nombre, ubicacion, capacidad, tarifas",
              "Conexion WhatsApp Business: Phone ID, Token, Webhook",
              "Voz de marca: tono, valores, estilo, ejemplos",
              "Horas de silencio y dias sin mensajes",
              "Nivel de automatizacion: manual, asistido, semi-auto, auto completo",
              "Umbrales de escalacion y palabras clave",
            ]}
          />
          <ModuleCard
            icon={Bot}
            title="Caddie AI (Chatbot)"
            description="Asistente inteligente integrado en el dashboard con acceso a todos los datos."
            route="/dashboard (boton flotante)"
            color="bg-emerald-600"
            features={[
              "Consulta en tiempo real: jugadores, campañas, torneos, weather, revenue",
              "Respuestas streaming con GPT-4o-mini",
              "Listado completo de jugadores con datos individuales",
              "Sugerencias rapidas predefinidas",
              "Accesible desde cualquier pagina del dashboard",
            ]}
          />
        </div>
      )}

      {/* ─── TECNOLOGIAS ─── */}
      {activeTab === "tech" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-blue-500" />
                Stack Tecnologico
              </CardTitle>
              <CardDescription>
                Caddie 24 esta construido con tecnologias modernas y probadas en produccion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <TechCard name="Next.js" version="14.2" description="Framework React full-stack con App Router, API Routes y Server Components" category="Framework" />
              <TechCard name="React" version="18.3" description="Biblioteca UI con hooks, Suspense y concurrent rendering" category="Framework" />
              <TechCard name="TypeScript" version="5.6" description="Superset de JavaScript con tipado estatico para mayor seguridad" category="Lenguaje" />
              <TechCard name="PostgreSQL" version="15+" description="Base de datos relacional alojada en Supabase con connection pooling" category="Base de Datos" />
              <TechCard name="Prisma ORM" version="5.22" description="ORM type-safe con migraciones, introspection y Prisma Studio" category="Base de Datos" />
              <TechCard name="OpenAI GPT-4o-mini" version="API v6" description="Modelo de lenguaje para chatbot, templates, analisis de sentimiento" category="IA" />
              <TechCard name="Anthropic Claude" version="SDK 0.32" description="Modelo alternativo disponible para analisis avanzado" category="IA" />
              <TechCard name="Tailwind CSS" version="3.4" description="Framework CSS utility-first para diseno rapido y consistente" category="UI" />
              <TechCard name="shadcn/ui" version="—" description="Componentes accesibles basados en Radix UI con Tailwind" category="UI" />
              <TechCard name="NextAuth.js" version="5 beta" description="Autenticacion JWT con adaptador Prisma y soporte multi-proveedor" category="Auth" />
              <TechCard name="Zustand" version="5.0" description="Gestion de estado minimalista y performante" category="Estado/Datos" />
              <TechCard name="React Query" version="5.62" description="Cache de datos del servidor con refetch automatico" category="Estado/Datos" />
              <TechCard name="WhatsApp Cloud API" version="v21.0" description="API oficial de Meta para mensajeria empresarial" category="Comunicaciones" />
              <TechCard name="Open-Meteo" version="API" description="API meteorologica gratuita con forecast y archivo historico" category="Estado/Datos" />
              <TechCard name="Recharts" version="2.14" description="Graficos y visualizaciones para analytics y dashboards" category="UI" />
              <TechCard name="Zod" version="3.23" description="Validacion de esquemas TypeScript-first en API routes" category="Estado/Datos" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-green-500" />
                Estructura de Base de Datos
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>La base de datos PostgreSQL contiene las siguientes tablas principales:</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { name: "users", desc: "Usuarios del sistema (admin, manager, agent)" },
                  { name: "players", desc: "Perfiles de jugadores del club" },
                  { name: "visits", desc: "Historial de visitas al campo" },
                  { name: "consumptions", desc: "Gastos: green fee, restaurante, shop..." },
                  { name: "player_tags", desc: "Etiquetas IA/manuales por jugador" },
                  { name: "conversations", desc: "Conversaciones WhatsApp" },
                  { name: "messages", desc: "Mensajes individuales" },
                  { name: "campaigns", desc: "Campañas de marketing" },
                  { name: "campaign_recipients", desc: "Destinatarios con metricas" },
                  { name: "whatsapp_templates", desc: "Templates de mensajes" },
                  { name: "tournaments", desc: "Torneos y competiciones" },
                  { name: "tournament_registrations", desc: "Inscripciones a torneos" },
                  { name: "tournament_results", desc: "Resultados y scorecards" },
                  { name: "weather_daily_records", desc: "Datos meteo y ocupacion diaria" },
                  { name: "club_settings", desc: "Configuracion global del club" },
                  { name: "ai_analysis_logs", desc: "Log de todas las operaciones IA" },
                ].map((table) => (
                  <div key={table.name} className="rounded border p-2">
                    <code className="text-xs font-medium text-foreground">{table.name}</code>
                    <p className="text-[11px] mt-0.5">{table.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-500" />
                APIs Externas
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <div className="space-y-2">
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">💬</span>
                    <span className="font-medium text-foreground">WhatsApp Business Cloud API (Meta)</span>
                  </div>
                  <p className="text-xs">Envio y recepcion de mensajes, templates, webhooks. Requiere: Phone Number ID, Business Account ID, Access Token.</p>
                  <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded mt-1 inline-block">POST graph.facebook.com/v21.0/PHONE_ID/messages</code>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">🤖</span>
                    <span className="font-medium text-foreground">OpenAI API</span>
                  </div>
                  <p className="text-xs">GPT-4o-mini para: generacion de templates, sugerencias de comunicacion, chatbot Caddie AI, analisis de sentimiento.</p>
                  <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded mt-1 inline-block">POST api.openai.com/v1/chat/completions</code>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">🌤️</span>
                    <span className="font-medium text-foreground">Open-Meteo API</span>
                  </div>
                  <p className="text-xs">Prevision meteorologica (16 dias) y archivo historico. Sin API key requerida. Datos: temperatura, viento, precipitacion, codigo meteo.</p>
                  <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded mt-1 inline-block">GET api.open-meteo.com/v1/forecast</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── ARQUITECTURA ─── */}
      {activeTab === "architecture" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estructura del Proyecto</CardTitle>
              <CardDescription>Organizacion de directorios siguiendo las convenciones de Next.js 14 App Router</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto leading-relaxed">
{`src/
├── app/
│   ├── (dashboard)/          # Layout con sidebar (rutas protegidas)
│   │   ├── dashboard/        # Panel principal + Caddie AI
│   │   ├── players/          # Gestion de jugadores
│   │   ├── inbox/            # Bandeja WhatsApp
│   │   ├── campaigns/        # Campañas de marketing
│   │   ├── tournaments/      # Gestion de torneos
│   │   ├── weather/          # Meteorologia y ocupacion
│   │   │   ├── page.tsx      # Mapa de calor
│   │   │   ├── analytics/    # Analytics meteorologicos
│   │   │   └── daily-input/  # Input diario ocupacion
│   │   ├── templates/        # Templates WhatsApp
│   │   ├── ai/               # IA Insights
│   │   ├── settings/         # Configuracion
│   │   ├── guide/            # Esta guia
│   │   └── layout.tsx        # Layout compartido
│   ├── api/
│   │   ├── auth/             # NextAuth endpoints
│   │   ├── chat/             # Caddie AI chatbot API
│   │   ├── conversations/    # CRUD conversaciones
│   │   ├── campaigns/        # CRUD campañas
│   │   ├── dashboard/        # Stats del dashboard
│   │   ├── players/          # CRUD jugadores + IA suggestions
│   │   ├── settings/         # Config del club
│   │   ├── templates/        # CRUD templates
│   │   ├── tournaments/      # CRUD torneos
│   │   ├── weather/          # Forecast, analytics, records
│   │   └── webhook/          # WhatsApp webhook receiver
│   ├── login/                # Pagina de login (publica)
│   └── layout.tsx            # Root layout
├── components/
│   ├── chat/                 # Chatbot Caddie AI
│   ├── layout/               # Sidebar + Header
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── auth.ts               # Config NextAuth v5
│   ├── prisma.ts             # Singleton Prisma client
│   ├── utils.ts              # Utilidades (cn, etc.)
│   └── services/
│       ├── weather.ts        # Logica meteorologica + predicciones
│       └── chat-context.ts   # Contexto DB para Caddie AI
└── middleware.ts              # Auth middleware (protege rutas)`}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Flujo de Datos</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="font-medium text-foreground text-xs mb-2">WhatsApp Inbound (mensaje entrante)</p>
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <Badge variant="outline">Meta Webhook</Badge>
                  <span>→</span>
                  <Badge variant="outline">/api/webhook/whatsapp</Badge>
                  <span>→</span>
                  <Badge variant="outline">Verificar firma</Badge>
                  <span>→</span>
                  <Badge variant="outline">Guardar en DB</Badge>
                  <span>→</span>
                  <Badge variant="outline">IA: sentimiento + intent</Badge>
                  <span>→</span>
                  <Badge variant="outline">Auto-respuesta (si activo)</Badge>
                </div>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="font-medium text-foreground text-xs mb-2">Campaña Outbound (envio masivo)</p>
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <Badge variant="outline">Crear campaña</Badge>
                  <span>→</span>
                  <Badge variant="outline">Segmentar jugadores</Badge>
                  <span>→</span>
                  <Badge variant="outline">A/B Split (opcional)</Badge>
                  <span>→</span>
                  <Badge variant="outline">Enviar via Cloud API</Badge>
                  <span>→</span>
                  <Badge variant="outline">Track delivery/read</Badge>
                  <span>→</span>
                  <Badge variant="outline">Analisis resultados</Badge>
                </div>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="font-medium text-foreground text-xs mb-2">Caddie AI (chatbot)</p>
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <Badge variant="outline">Pregunta del admin</Badge>
                  <span>→</span>
                  <Badge variant="outline">POST /api/chat</Badge>
                  <span>→</span>
                  <Badge variant="outline">20+ queries Prisma en paralelo</Badge>
                  <span>→</span>
                  <Badge variant="outline">System prompt + datos</Badge>
                  <span>→</span>
                  <Badge variant="outline">GPT-4o-mini streaming</Badge>
                  <span>→</span>
                  <Badge variant="outline">Respuesta en tiempo real</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-red-500" />
                Variables de Entorno
              </CardTitle>
              <CardDescription>Configuracion necesaria en .env</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto leading-relaxed">
{`# Base de datos (Supabase PostgreSQL)
DATABASE_URL="postgresql://...?pgbouncer=true"
DIRECT_URL="postgresql://..."

# Autenticacion
AUTH_SECRET="tu-secreto-seguro"
NEXTAUTH_URL="http://localhost:3000"

# WhatsApp Business Cloud API (Meta)
WHATSAPP_ACCESS_TOKEN="EAAUwhG..."
WHATSAPP_PHONE_NUMBER_ID="618341268039291"
WHATSAPP_BUSINESS_ACCOUNT_ID="1448552002821172"
WHATSAPP_WEBHOOK_VERIFY_TOKEN="caddie24-webhook-2024"

# IA
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."  # Opcional

# App
NEXT_PUBLIC_APP_URL="https://tu-dominio.vercel.app"`}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── BUENAS PRACTICAS ─── */}
      {activeTab === "bestpractices" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                Gestion de Jugadores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Accordion title="Mantener perfiles actualizados" defaultOpen>
                <ul className="space-y-1.5 mt-2">
                  <li>- Actualiza el <strong>handicap</strong> tras cada torneo o revision oficial</li>
                  <li>- Registra las <strong>visitas</strong> y <strong>consumos</strong> para tener un historial preciso</li>
                  <li>- Anade <strong>tags</strong> manuales que complementen los automaticos de la IA</li>
                  <li>- Revisa el <strong>engagement level</strong> regularmente — es clave para segmentacion</li>
                </ul>
              </Accordion>
              <Accordion title="Engagement y retencion">
                <ul className="space-y-1.5 mt-2">
                  <li>- Contacta jugadores <strong>NEW</strong> en su primera semana para dar la bienvenida</li>
                  <li>- Si un jugador no visita en +30 dias, enviale un incentivo personalizado</li>
                  <li>- Los jugadores <strong>VIP</strong> merecen comunicaciones exclusivas y trato preferente</li>
                  <li>- Usa las <strong>sugerencias de IA</strong> (boton en perfil del jugador) para ideas de comunicacion</li>
                  <li>- Revisa semanalmente los jugadores con <strong>sentimiento NEGATIVE o FRUSTRATED</strong></li>
                </ul>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-500" />
                WhatsApp y Comunicacion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Accordion title="Ventana de 24 horas de WhatsApp" defaultOpen>
                <div className="mt-2 space-y-1.5">
                  <p>Meta permite respuestas libres solo dentro de las <strong>24 horas</strong> tras el ultimo mensaje del cliente. Despues, debes usar <strong>templates aprobados</strong>.</p>
                  <ul className="space-y-1">
                    <li>- Responde rapido a mensajes entrantes para aprovechar la ventana</li>
                    <li>- Ten templates preparados para reactivar conversaciones</li>
                    <li>- El chatbot IA respeta automaticamente esta ventana</li>
                  </ul>
                </div>
              </Accordion>
              <Accordion title="Templates efectivos">
                <ul className="space-y-1.5 mt-2">
                  <li>- Usa <strong>variables</strong> ({"{{1}}"}, {"{{2}}"}) para personalizar: nombre, fecha, oferta</li>
                  <li>- Manten el tono de marca configurado en Ajustes → Voz de Marca</li>
                  <li>- Templates cortos (2-3 frases) tienen mejor tasa de lectura</li>
                  <li>- Incluye un <strong>CTA claro</strong>: &quot;Reserva ahora&quot;, &quot;Responde SI&quot;</li>
                  <li>- Usa el generador IA para crear y mejorar templates rapidamente</li>
                </ul>
              </Accordion>
              <Accordion title="Campañas efectivas">
                <ul className="space-y-1.5 mt-2">
                  <li>- <strong>Segmenta</strong> siempre: no envies lo mismo a todos</li>
                  <li>- Usa <strong>A/B testing</strong> para descubrir que funciona mejor</li>
                  <li>- Programa envios en <strong>horas optimas</strong> (manana 9-11h, tarde 16-18h)</li>
                  <li>- No superes 2-3 campañas por semana para evitar fatiga</li>
                  <li>- Analiza metricas: si open rate baja del 30%, revisa el contenido</li>
                </ul>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudSun className="h-5 w-5 text-cyan-500" />
                Meteorologia y Predicciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Accordion title="Mejorar la precision de predicciones" defaultOpen>
                <ul className="space-y-1.5 mt-2">
                  <li>- <strong>Introduce datos diarios</strong> de ocupacion real (Meteorologia → Input Diario)</li>
                  <li>- Cuantos mas datos reales, mejor sera la precision de las predicciones</li>
                  <li>- El sistema necesita ~30 dias de datos para ser fiable</li>
                  <li>- Marca los <strong>dias cerrados</strong> y su razon para excluirlos del analisis</li>
                  <li>- Usa el <strong>boton de snapshot</strong> para capturar la prediccion del dia</li>
                </ul>
              </Accordion>
              <Accordion title="Golf Score y demanda">
                <div className="mt-2 space-y-1.5">
                  <p>El <strong>Golf Score</strong> (0-100) evalua las condiciones para jugar basandose en:</p>
                  <ul className="space-y-1">
                    <li>- Temperatura: optima 18-25°C</li>
                    <li>- Viento: penaliza a partir de 20 km/h</li>
                    <li>- Precipitacion: penaliza desde 1mm</li>
                    <li>- Codigo meteorologico: cielo despejado vs tormenta</li>
                    <li>- Horas de luz: mas horas = mejor score</li>
                  </ul>
                  <p className="mt-2">La <strong>prediccion de demanda</strong> combina: 40% clima + 35% calendario (dia semana, festivos, temporada) + 25% datos historicos.</p>
                </div>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-orange-500" />
                Uso de Caddie AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Accordion title="Preguntas efectivas al chatbot" defaultOpen>
                <div className="mt-2 space-y-2">
                  <p>Caddie AI tiene acceso a todos los datos del CRM en tiempo real. Ejemplos de preguntas utiles:</p>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {[
                      "¿Que jugadores estan en riesgo de irse?",
                      "¿Como van las campañas activas?",
                      "¿Quien son los top spenders?",
                      "¿Cual es la ocupacion media este mes?",
                      "Analiza las tendencias de revenue",
                      "¿Que jugadores VIP no vienen hace tiempo?",
                      "Resume la actividad de esta semana",
                      "¿Que torneo tiene mas inscripciones?",
                      "¿Cual es el sentimiento general de los mensajes?",
                      "Sugiere acciones para mejorar la retencion",
                    ].map((q, i) => (
                      <div key={i} className="text-xs bg-muted rounded px-2 py-1.5">&quot;{q}&quot;</div>
                    ))}
                  </div>
                </div>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── FAQ ─── */}
      {activeTab === "faq" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-500" />
                Preguntas Frecuentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Accordion title="¿Como conecto WhatsApp Business?" defaultOpen>
                <div className="mt-2 space-y-2">
                  <ol className="space-y-1.5 list-decimal list-inside">
                    <li>Ve a <strong>developers.facebook.com</strong> y crea una app tipo &quot;Business&quot;</li>
                    <li>Selecciona el caso de uso &quot;WhatsApp&quot;</li>
                    <li>En API Setup, obtiene tu <strong>Phone Number ID</strong> y <strong>Access Token</strong></li>
                    <li>Configura el webhook con tu URL: <code className="text-[10px] bg-muted px-1 rounded">https://tu-app.vercel.app/api/webhook/whatsapp</code></li>
                    <li>Usa el verify token: <code className="text-[10px] bg-muted px-1 rounded">caddie24-webhook-2024</code></li>
                    <li>Suscribete a: messages, message_deliveries, message_reads</li>
                    <li>Pega las credenciales en <strong>Configuracion → WhatsApp</strong></li>
                  </ol>
                </div>
              </Accordion>
              <Accordion title="¿Que necesito para que funcione Caddie AI?">
                <div className="mt-2 space-y-1.5">
                  <p>Solo necesitas una <strong>OPENAI_API_KEY</strong> valida en las variables de entorno. El chatbot usa GPT-4o-mini que es rapido y economico (~$0.15/1M tokens input).</p>
                  <p>El chatbot consulta la base de datos en cada pregunta, asi que siempre tiene datos actualizados.</p>
                </div>
              </Accordion>
              <Accordion title="¿Como funciona el sistema de engagement?">
                <div className="mt-2 space-y-1.5">
                  <p>Cada jugador tiene un nivel de engagement que indica su vinculacion con el club:</p>
                  <ul className="space-y-1">
                    <li><strong>NEW</strong> — Recien registrado, aun sin historial significativo</li>
                    <li><strong>LOW</strong> — Poca actividad o respuesta</li>
                    <li><strong>MEDIUM</strong> — Actividad regular, responde a campañas</li>
                    <li><strong>HIGH</strong> — Muy activo, visitas frecuentes, buen gasto</li>
                    <li><strong>VIP</strong> — Maxima lealtad, alto gasto, embajador del club</li>
                  </ul>
                  <p>Puedes cambiar el nivel manualmente o dejar que el sistema lo ajuste basandose en visitas, gasto y comunicaciones.</p>
                </div>
              </Accordion>
              <Accordion title="¿Puedo usar el sistema en otros idiomas?">
                <div className="mt-2 space-y-1.5">
                  <p>El sistema soporta 4 idiomas para jugadores: <strong>Espanol (ES), Ingles (EN), Aleman (DE), Frances (FR)</strong>.</p>
                  <p>Los templates de WhatsApp pueden crearse en cualquier idioma. La IA puede generar y traducir contenido automaticamente.</p>
                  <p>La interfaz de administracion esta actualmente en espanol.</p>
                </div>
              </Accordion>
              <Accordion title="¿Que pasa si el campo cierra por mal tiempo?">
                <div className="mt-2 space-y-1.5">
                  <p>El modulo de meteorologia permite:</p>
                  <ul className="space-y-1">
                    <li>- Configurar <strong>umbrales de cierre</strong> (lluvia &gt;10mm, viento &gt;50km/h)</li>
                    <li>- Marcar dias como <strong>cerrados</strong> con motivo</li>
                    <li>- Configurar <strong>automatizaciones</strong> para avisar a jugadores con reserva</li>
                    <li>- Los dias cerrados se excluyen del calculo de precision</li>
                  </ul>
                </div>
              </Accordion>
              <Accordion title="¿Como se despliega en produccion?">
                <div className="mt-2 space-y-1.5">
                  <p>Caddie 24 esta optimizado para <strong>Vercel</strong>:</p>
                  <ol className="space-y-1 list-decimal list-inside">
                    <li>Conecta tu repo de GitHub a Vercel</li>
                    <li>Configura las variables de entorno (.env)</li>
                    <li>Ejecuta la migracion de Prisma contra tu Supabase</li>
                    <li>Cada push a <code className="text-[10px] bg-muted px-1 rounded">main</code> despliega automaticamente</li>
                  </ol>
                  <p className="mt-1.5">Para la base de datos, usamos <strong>Supabase</strong> con PostgreSQL y connection pooling via PgBouncer.</p>
                </div>
              </Accordion>
              <Accordion title="¿Cual es el coste de funcionamiento?">
                <div className="mt-2 space-y-1.5">
                  <ul className="space-y-1">
                    <li><strong>Vercel</strong>: Plan gratuito suficiente para empezar (100GB bandwidth)</li>
                    <li><strong>Supabase</strong>: Plan gratuito con 500MB DB y 1GB transfer</li>
                    <li><strong>OpenAI</strong>: ~$0.15/1M tokens input con GPT-4o-mini (muy bajo coste)</li>
                    <li><strong>WhatsApp Cloud API</strong>: 1,000 conversaciones gratis/mes. Despues ~$0.05-0.08/conversacion</li>
                    <li><strong>Open-Meteo</strong>: Gratuito para uso no comercial</li>
                  </ul>
                  <p className="mt-1.5">Para un club medio (~200 jugadores), el coste mensual estimado es de <strong>$5-20/mes</strong>.</p>
                </div>
              </Accordion>
              <Accordion title="¿Se pueden exportar los datos?">
                <div className="mt-2 space-y-1.5">
                  <p>Si, los datos estan en PostgreSQL y pueden exportarse:</p>
                  <ul className="space-y-1">
                    <li>- <strong>Prisma Studio</strong> (<code className="text-[10px] bg-muted px-1 rounded">npm run db:studio</code>): interfaz visual para explorar y exportar datos</li>
                    <li>- <strong>SQL directo</strong>: acceso via Supabase dashboard</li>
                    <li>- <strong>API REST</strong>: todos los endpoints devuelven JSON</li>
                    <li>- <strong>Caddie AI</strong>: puedes pedir resumenes y analisis en lenguaje natural</li>
                  </ul>
                </div>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-yellow-500" />
                Soporte y Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>Para soporte tecnico, consulta el repositorio del proyecto o contacta al equipo de desarrollo.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded border p-3">
                  <p className="font-medium text-foreground text-xs">Caddie AI</p>
                  <p className="text-[11px] mt-1">Usa el chatbot integrado para consultas rapidas sobre datos del sistema.</p>
                </div>
                <div className="rounded border p-3">
                  <p className="font-medium text-foreground text-xs">Prisma Studio</p>
                  <p className="text-[11px] mt-1">Ejecuta <code className="bg-muted px-1 rounded">npm run db:studio</code> para explorar la base de datos visualmente.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
