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
    { id: "modules", label: "Módulos", icon: LayoutDashboard },
    { id: "tech", label: "Tecnologías", icon: Cpu },
    { id: "architecture", label: "Arquitectura", icon: Workflow },
    { id: "bestpractices", label: "Buenas Prácticas", icon: Target },
    { id: "faq", label: "FAQ", icon: HelpCircle },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Guía del Sistema
        </h1>
        <p className="text-muted-foreground mt-1">
          Documentación completa de Caddie 24 — CRM inteligente para campos de golf
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
                ¿Qué es Caddie 24?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Caddie 24</strong> es un CRM (Customer Relationship Management)
                inteligente diseñado específicamente para la gestión de campos de golf. Integra comunicación
                por WhatsApp, análisis meteorológico, gestión de torneos y análisis de datos impulsado por
                inteligencia artificial.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border p-4 text-center">
                  <div className="text-2xl mb-1">🏌️</div>
                  <p className="font-medium text-foreground text-xs">Gestión de Jugadores</p>
                  <p className="text-[11px] mt-1">Perfiles completos, engagement tracking, segmentación inteligente</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <div className="text-2xl mb-1">💬</div>
                  <p className="font-medium text-foreground text-xs">WhatsApp Business</p>
                  <p className="text-[11px] mt-1">Comunicación directa, chatbot IA, campañas masivas</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <div className="text-2xl mb-1">🤖</div>
                  <p className="font-medium text-foreground text-xs">IA Integrada</p>
                  <p className="text-[11px] mt-1">Análisis de sentimiento, predicciones, asistente Caddie AI</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5 text-blue-500" />
                ¿Cómo funciona?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="font-medium text-blue-700 text-xs mb-2">1. Entrada de Datos</p>
                  <ul className="space-y-1 text-xs">
                    <li>- Jugadores se registran manualmente o vía WhatsApp</li>
                    <li>- Mensajes WhatsApp se reciben vía webhook (Meta Cloud API)</li>
                    <li>- Datos meteorológicos se obtienen de Open-Meteo API</li>
                    <li>- El staff introduce datos de ocupación/revenue diarios</li>
                  </ul>
                </div>
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="font-medium text-green-700 text-xs mb-2">2. Procesamiento IA</p>
                  <ul className="space-y-1 text-xs">
                    <li>- Análisis de sentimiento en conversaciones</li>
                    <li>- Detección de intención del mensaje</li>
                    <li>- Generación de respuestas automáticas</li>
                    <li>- Predicción de demanda basada en meteorología</li>
                  </ul>
                </div>
                <div className="rounded-lg bg-purple-50 p-4">
                  <p className="font-medium text-purple-700 text-xs mb-2">3. Acciones y Campañas</p>
                  <ul className="space-y-1 text-xs">
                    <li>- Campañas segmentadas por WhatsApp</li>
                    <li>- A/B Testing automático</li>
                    <li>- Templates aprobados por Meta</li>
                    <li>- Alertas meteorológicas a jugadores</li>
                  </ul>
                </div>
                <div className="rounded-lg bg-orange-50 p-4">
                  <p className="font-medium text-orange-700 text-xs mb-2">4. Análisis y Mejora</p>
                  <ul className="space-y-1 text-xs">
                    <li>- Dashboard con KPIs en tiempo real</li>
                    <li>- Precisión de predicciones vs realidad</li>
                    <li>- Caddie AI para consultas inteligentes</li>
                    <li>- Sugerencias de comunicación personalizadas</li>
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
              <p>El sistema utiliza autenticación JWT con 3 niveles de acceso:</p>
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <Badge className="bg-red-100 text-red-700 mb-2">ADMIN</Badge>
                  <p className="text-xs">Acceso total. Configuración del sistema, gestión de usuarios, API keys, automatizaciones.</p>
                </div>
                <div className="rounded-lg border p-3">
                  <Badge className="bg-yellow-100 text-yellow-700 mb-2">MANAGER</Badge>
                  <p className="text-xs">Gestión de campañas, torneos, jugadores. Sin acceso a configuración del sistema.</p>
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
            description="Panel principal con KPIs, actividad reciente, previsión meteorológica y acciones rápidas."
            route="/dashboard"
            color="bg-slate-600"
            features={[
              "4 KPIs principales: jugadores, conversaciones, campañas, VIP",
              "Widget meteorológico con previsión 3 días",
              "Actividad reciente de WhatsApp con indicador de sentimiento",
              "Acciones rápidas para tareas frecuentes",
              "Caddie AI: chatbot con acceso a todos los datos del CRM",
            ]}
          />
          <ModuleCard
            icon={Users}
            title="Jugadores"
            description="Gestión completa de perfiles de jugadores con historial de visitas, consumos y tags."
            route="/players"
            color="bg-blue-600"
            features={[
              "Perfil completo: handicap, idioma, preferencias de juego",
              "Historial de visitas y consumos con categorías",
              "Nivel de engagement: NEW, LOW, MEDIUM, HIGH, VIP",
              "Tags automáticos por IA y manuales",
              "Sugerencias de comunicación generadas por IA",
            ]}
          />
          <ModuleCard
            icon={MessageSquare}
            title="Bandeja de Entrada"
            description="Centro de comunicaciones WhatsApp con soporte multicanal y chatbot IA."
            route="/inbox"
            color="bg-green-600"
            features={[
              "Conversaciones en tiempo real vía WhatsApp Business Cloud API",
              "Chatbot IA con respuestas automáticas",
              "Análisis de sentimiento (POSITIVE, NEUTRAL, NEGATIVE, FRUSTRATED)",
              "Detección de intención del mensaje",
              "Ventana de 24h de WhatsApp y envío de templates",
              "Notas internas entre agentes",
            ]}
          />
          <ModuleCard
            icon={Megaphone}
            title="Campañas"
            description="Creación y envío de campañas masivas segmentadas por WhatsApp."
            route="/campaigns"
            color="bg-purple-600"
            features={[
              "Segmentación por engagement, idioma, tags, actividad",
              "A/B Testing con análisis automático del ganador",
              "Programación de envío con hora óptima",
              "Métricas: enviados, entregados, leídos, respondidos",
              "Templates aprobados por Meta con variables dinámicas",
            ]}
          />
          <ModuleCard
            icon={Trophy}
            title="Torneos"
            description="Gestión completa del ciclo de vida de torneos: creación, inscripción, resultados."
            route="/tournaments"
            color="bg-amber-600"
            features={[
              "Formatos: Stableford, Medal, Scramble, Match Play, Best Ball, Fourball",
              "Categorías con rangos de handicap y género",
              "Inscripción con lista de espera y control de pagos",
              "Resultados con scorecard detallado por hoyo",
              "Comunicación automática a participantes",
            ]}
          />
          <ModuleCard
            icon={CloudSun}
            title="Meteorología"
            description="Previsión meteorológica, predicción de demanda y tracking de precisión."
            route="/weather"
            color="bg-cyan-600"
            features={[
              "Mapa de calor con Golf Score (0-100) basado en clima",
              "Predicción de demanda: 40% clima + 35% calendario + 25% histórico",
              "Rango configurable: 1-4 semanas, pasado/futuro/ambos",
              "Datos históricos vía Open-Meteo Archive API",
              "Input diario de ocupación real vs predicha",
              "Tracking de precisión con badges de acierto",
            ]}
          />
          <ModuleCard
            icon={FileText}
            title="Templates"
            description="Gestión de plantillas de mensajes WhatsApp aprobadas por Meta."
            route="/templates"
            color="bg-rose-600"
            features={[
              "Generación de templates con IA (GPT-4o-mini)",
              "Variables dinámicas con placeholder {{1}}, {{2}}...",
              "Modos: generar, mejorar, añadir emojis, más formal, más casual",
              "Estado de aprobación: PENDING, APPROVED, REJECTED",
              "Multi-idioma: ES, EN, DE, FR",
            ]}
          />
          <ModuleCard
            icon={Bot}
            title="IA Insights"
            description="Centro de inteligencia artificial con análisis avanzado y métricas de uso."
            route="/ai"
            color="bg-orange-600"
            features={[
              "Métricas de uso de IA: mensajes generados, sentimiento medio",
              "Log de análisis: tipo, tokens, modelo, duración",
              "Escalaciones automáticas por sentimiento negativo",
              "Tasa de resolución automática",
            ]}
          />
          <ModuleCard
            icon={Settings}
            title="Configuración"
            description="Ajustes del club, conexión WhatsApp, voz de marca y automatizaciones."
            route="/settings"
            color="bg-gray-600"
            features={[
              "Datos del club: nombre, ubicación, capacidad, tarifas",
              "Conexión WhatsApp Business: Phone ID, Token, Webhook",
              "Voz de marca: tono, valores, estilo, ejemplos",
              "Horas de silencio y días sin mensajes",
              "Nivel de automatización: manual, asistido, semi-auto, auto completo",
              "Umbrales de escalación y palabras clave",
            ]}
          />
          <ModuleCard
            icon={Bot}
            title="Caddie AI (Chatbot)"
            description="Asistente inteligente integrado en el dashboard con acceso a todos los datos."
            route="/dashboard (botón flotante)"
            color="bg-emerald-600"
            features={[
              "Consulta en tiempo real: jugadores, campañas, torneos, weather, revenue",
              "Respuestas streaming con GPT-4o-mini",
              "Listado completo de jugadores con datos individuales",
              "Sugerencias rápidas predefinidas",
              "Accesible desde cualquier página del dashboard",
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
                Stack Tecnológico
              </CardTitle>
              <CardDescription>
                Caddie 24 está construido con tecnologías modernas y probadas en producción
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <TechCard name="Next.js" version="14.2" description="Framework React full-stack con App Router, API Routes y Server Components" category="Framework" />
              <TechCard name="React" version="18.3" description="Biblioteca UI con hooks, Suspense y concurrent rendering" category="Framework" />
              <TechCard name="TypeScript" version="5.6" description="Superset de JavaScript con tipado estático para mayor seguridad" category="Lenguaje" />
              <TechCard name="PostgreSQL" version="15+" description="Base de datos relacional alojada en Supabase con connection pooling" category="Base de Datos" />
              <TechCard name="Prisma ORM" version="5.22" description="ORM type-safe con migraciones, introspection y Prisma Studio" category="Base de Datos" />
              <TechCard name="OpenAI GPT-4o-mini" version="API v6" description="Modelo de lenguaje para chatbot, templates, análisis de sentimiento" category="IA" />
              <TechCard name="Anthropic Claude" version="SDK 0.32" description="Modelo alternativo disponible para análisis avanzado" category="IA" />
              <TechCard name="Tailwind CSS" version="3.4" description="Framework CSS utility-first para diseño rápido y consistente" category="UI" />
              <TechCard name="shadcn/ui" version="—" description="Componentes accesibles basados en Radix UI con Tailwind" category="UI" />
              <TechCard name="NextAuth.js" version="5 beta" description="Autenticación JWT con adaptador Prisma y soporte multi-proveedor" category="Auth" />
              <TechCard name="Zustand" version="5.0" description="Gestión de estado minimalista y performante" category="Estado/Datos" />
              <TechCard name="React Query" version="5.62" description="Cache de datos del servidor con refetch automático" category="Estado/Datos" />
              <TechCard name="WhatsApp Cloud API" version="v21.0" description="API oficial de Meta para mensajería empresarial" category="Comunicaciones" />
              <TechCard name="Open-Meteo" version="API" description="API meteorológica gratuita con forecast y archivo histórico" category="Estado/Datos" />
              <TechCard name="Recharts" version="2.14" description="Gráficos y visualizaciones para analytics y dashboards" category="UI" />
              <TechCard name="Zod" version="3.23" description="Validación de esquemas TypeScript-first en API routes" category="Estado/Datos" />
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
                  { name: "campaign_recipients", desc: "Destinatarios con métricas" },
                  { name: "whatsapp_templates", desc: "Templates de mensajes" },
                  { name: "tournaments", desc: "Torneos y competiciones" },
                  { name: "tournament_registrations", desc: "Inscripciones a torneos" },
                  { name: "tournament_results", desc: "Resultados y scorecards" },
                  { name: "weather_daily_records", desc: "Datos meteo y ocupación diaria" },
                  { name: "club_settings", desc: "Configuración global del club" },
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
                  <p className="text-xs">Envío y recepción de mensajes, templates, webhooks. Requiere: Phone Number ID, Business Account ID, Access Token.</p>
                  <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded mt-1 inline-block">POST graph.facebook.com/v21.0/PHONE_ID/messages</code>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">🤖</span>
                    <span className="font-medium text-foreground">OpenAI API</span>
                  </div>
                  <p className="text-xs">GPT-4o-mini para: generación de templates, sugerencias de comunicación, chatbot Caddie AI, análisis de sentimiento.</p>
                  <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded mt-1 inline-block">POST api.openai.com/v1/chat/completions</code>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">🌤️</span>
                    <span className="font-medium text-foreground">Open-Meteo API</span>
                  </div>
                  <p className="text-xs">Previsión meteorológica (16 días) y archivo histórico. Sin API key requerida. Datos: temperatura, viento, precipitación, código meteo.</p>
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
              <CardDescription>Organización de directorios siguiendo las convenciones de Next.js 14 App Router</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto leading-relaxed">
{`src/
├── app/
│   ├── (dashboard)/          # Layout con sidebar (rutas protegidas)
│   │   ├── dashboard/        # Panel principal + Caddie AI
│   │   ├── players/          # Gestión de jugadores
│   │   ├── inbox/            # Bandeja WhatsApp
│   │   ├── campaigns/        # Campañas de marketing
│   │   ├── tournaments/      # Gestión de torneos
│   │   ├── weather/          # Meteorología y ocupación
│   │   │   ├── page.tsx      # Mapa de calor
│   │   │   ├── analytics/    # Analytics meteorológicos
│   │   │   └── daily-input/  # Input diario ocupación
│   │   ├── templates/        # Templates WhatsApp
│   │   ├── ai/               # IA Insights
│   │   ├── settings/         # Configuración
│   │   ├── guide/            # Esta guía
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
│   ├── login/                # Página de login (pública)
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
│       ├── weather.ts        # Lógica meteorológica + predicciones
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
                  <Badge variant="outline">Enviar vía Cloud API</Badge>
                  <span>→</span>
                  <Badge variant="outline">Track delivery/read</Badge>
                  <span>→</span>
                  <Badge variant="outline">Análisis resultados</Badge>
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
              <CardDescription>Configuración necesaria en .env</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto leading-relaxed">
{`# Base de datos (Supabase PostgreSQL)
DATABASE_URL="postgresql://...?pgbouncer=true"
DIRECT_URL="postgresql://..."

# Autenticación
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
                Gestión de Jugadores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Accordion title="Mantener perfiles actualizados" defaultOpen>
                <ul className="space-y-1.5 mt-2">
                  <li>- Actualiza el <strong>handicap</strong> tras cada torneo o revisión oficial</li>
                  <li>- Registra las <strong>visitas</strong> y <strong>consumos</strong> para tener un historial preciso</li>
                  <li>- Añade <strong>tags</strong> manuales que complementen los automáticos de la IA</li>
                  <li>- Revisa el <strong>engagement level</strong> regularmente — es clave para segmentación</li>
                </ul>
              </Accordion>
              <Accordion title="Engagement y retención">
                <ul className="space-y-1.5 mt-2">
                  <li>- Contacta jugadores <strong>NEW</strong> en su primera semana para dar la bienvenida</li>
                  <li>- Si un jugador no visita en +30 días, envíale un incentivo personalizado</li>
                  <li>- Los jugadores <strong>VIP</strong> merecen comunicaciones exclusivas y trato preferente</li>
                  <li>- Usa las <strong>sugerencias de IA</strong> (botón en perfil del jugador) para ideas de comunicación</li>
                  <li>- Revisa semanalmente los jugadores con <strong>sentimiento NEGATIVE o FRUSTRATED</strong></li>
                </ul>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-500" />
                WhatsApp y Comunicación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Accordion title="Ventana de 24 horas de WhatsApp" defaultOpen>
                <div className="mt-2 space-y-1.5">
                  <p>Meta permite respuestas libres solo dentro de las <strong>24 horas</strong> tras el último mensaje del cliente. Después, debes usar <strong>templates aprobados</strong>.</p>
                  <ul className="space-y-1">
                    <li>- Responde rápido a mensajes entrantes para aprovechar la ventana</li>
                    <li>- Ten templates preparados para reactivar conversaciones</li>
                    <li>- El chatbot IA respeta automáticamente esta ventana</li>
                  </ul>
                </div>
              </Accordion>
              <Accordion title="Templates efectivos">
                <ul className="space-y-1.5 mt-2">
                  <li>- Usa <strong>variables</strong> ({"{{1}}"}, {"{{2}}"}) para personalizar: nombre, fecha, oferta</li>
                  <li>- Mantén el tono de marca configurado en Ajustes → Voz de Marca</li>
                  <li>- Templates cortos (2-3 frases) tienen mejor tasa de lectura</li>
                  <li>- Incluye un <strong>CTA claro</strong>: &quot;Reserva ahora&quot;, &quot;Responde SI&quot;</li>
                  <li>- Usa el generador IA para crear y mejorar templates rápidamente</li>
                </ul>
              </Accordion>
              <Accordion title="Campañas efectivas">
                <ul className="space-y-1.5 mt-2">
                  <li>- <strong>Segmenta</strong> siempre: no envíes lo mismo a todos</li>
                  <li>- Usa <strong>A/B testing</strong> para descubrir qué funciona mejor</li>
                  <li>- Programa envíos en <strong>horas óptimas</strong> (mañana 9-11h, tarde 16-18h)</li>
                  <li>- No superes 2-3 campañas por semana para evitar fatiga</li>
                  <li>- Analiza métricas: si open rate baja del 30%, revisa el contenido</li>
                </ul>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudSun className="h-5 w-5 text-cyan-500" />
                Meteorología y Predicciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Accordion title="Mejorar la precisión de predicciones" defaultOpen>
                <ul className="space-y-1.5 mt-2">
                  <li>- <strong>Introduce datos diarios</strong> de ocupación real (Meteorología → Input Diario)</li>
                  <li>- Cuantos más datos reales, mejor será la precisión de las predicciones</li>
                  <li>- El sistema necesita ~30 días de datos para ser fiable</li>
                  <li>- Marca los <strong>días cerrados</strong> y su razón para excluirlos del análisis</li>
                  <li>- Usa el <strong>botón de snapshot</strong> para capturar la predicción del día</li>
                </ul>
              </Accordion>
              <Accordion title="Golf Score y demanda">
                <div className="mt-2 space-y-1.5">
                  <p>El <strong>Golf Score</strong> (0-100) evalúa las condiciones para jugar basándose en:</p>
                  <ul className="space-y-1">
                    <li>- Temperatura: óptima 18-25°C</li>
                    <li>- Viento: penaliza a partir de 20 km/h</li>
                    <li>- Precipitación: penaliza desde 1mm</li>
                    <li>- Código meteorológico: cielo despejado vs tormenta</li>
                    <li>- Horas de luz: más horas = mejor score</li>
                  </ul>
                  <p className="mt-2">La <strong>predicción de demanda</strong> combina: 40% clima + 35% calendario (día semana, festivos, temporada) + 25% datos históricos.</p>
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
                  <p>Caddie AI tiene acceso a todos los datos del CRM en tiempo real. Ejemplos de preguntas útiles:</p>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {[
                      "¿Qué jugadores están en riesgo de irse?",
                      "¿Cómo van las campañas activas?",
                      "¿Quién son los top spenders?",
                      "¿Cuál es la ocupación media este mes?",
                      "Analiza las tendencias de revenue",
                      "¿Qué jugadores VIP no vienen hace tiempo?",
                      "Resume la actividad de esta semana",
                      "¿Qué torneo tiene más inscripciones?",
                      "¿Cuál es el sentimiento general de los mensajes?",
                      "Sugiere acciones para mejorar la retención",
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
              <Accordion title="¿Cómo conecto WhatsApp Business?" defaultOpen>
                <div className="mt-2 space-y-2">
                  <ol className="space-y-1.5 list-decimal list-inside">
                    <li>Ve a <strong>developers.facebook.com</strong> y crea una app tipo &quot;Business&quot;</li>
                    <li>Selecciona el caso de uso &quot;WhatsApp&quot;</li>
                    <li>En API Setup, obtiene tu <strong>Phone Number ID</strong> y <strong>Access Token</strong></li>
                    <li>Configura el webhook con tu URL: <code className="text-[10px] bg-muted px-1 rounded">https://tu-app.vercel.app/api/webhook/whatsapp</code></li>
                    <li>Usa el verify token: <code className="text-[10px] bg-muted px-1 rounded">caddie24-webhook-2024</code></li>
                    <li>Suscríbete a: messages, message_deliveries, message_reads</li>
                    <li>Pega las credenciales en <strong>Configuración → WhatsApp</strong></li>
                  </ol>
                </div>
              </Accordion>
              <Accordion title="¿Qué necesito para que funcione Caddie AI?">
                <div className="mt-2 space-y-1.5">
                  <p>Solo necesitas una <strong>OPENAI_API_KEY</strong> válida en las variables de entorno. El chatbot usa GPT-4o-mini que es rápido y económico (~$0.15/1M tokens input).</p>
                  <p>El chatbot consulta la base de datos en cada pregunta, así que siempre tiene datos actualizados.</p>
                </div>
              </Accordion>
              <Accordion title="¿Cómo funciona el sistema de engagement?">
                <div className="mt-2 space-y-1.5">
                  <p>Cada jugador tiene un nivel de engagement que indica su vinculación con el club:</p>
                  <ul className="space-y-1">
                    <li><strong>NEW</strong> — Recién registrado, aún sin historial significativo</li>
                    <li><strong>LOW</strong> — Poca actividad o respuesta</li>
                    <li><strong>MEDIUM</strong> — Actividad regular, responde a campañas</li>
                    <li><strong>HIGH</strong> — Muy activo, visitas frecuentes, buen gasto</li>
                    <li><strong>VIP</strong> — Máxima lealtad, alto gasto, embajador del club</li>
                  </ul>
                  <p>Puedes cambiar el nivel manualmente o dejar que el sistema lo ajuste basándose en visitas, gasto y comunicaciones.</p>
                </div>
              </Accordion>
              <Accordion title="¿Puedo usar el sistema en otros idiomas?">
                <div className="mt-2 space-y-1.5">
                  <p>El sistema soporta 4 idiomas para jugadores: <strong>Español (ES), Inglés (EN), Alemán (DE), Francés (FR)</strong>.</p>
                  <p>Los templates de WhatsApp pueden crearse en cualquier idioma. La IA puede generar y traducir contenido automáticamente.</p>
                  <p>La interfaz de administración está actualmente en español.</p>
                </div>
              </Accordion>
              <Accordion title="¿Qué pasa si el campo cierra por mal tiempo?">
                <div className="mt-2 space-y-1.5">
                  <p>El módulo de meteorología permite:</p>
                  <ul className="space-y-1">
                    <li>- Configurar <strong>umbrales de cierre</strong> (lluvia &gt;10mm, viento &gt;50km/h)</li>
                    <li>- Marcar días como <strong>cerrados</strong> con motivo</li>
                    <li>- Configurar <strong>automatizaciones</strong> para avisar a jugadores con reserva</li>
                    <li>- Los días cerrados se excluyen del cálculo de precisión</li>
                  </ul>
                </div>
              </Accordion>
              <Accordion title="¿Cómo se despliega en producción?">
                <div className="mt-2 space-y-1.5">
                  <p>Caddie 24 está optimizado para <strong>Vercel</strong>:</p>
                  <ol className="space-y-1 list-decimal list-inside">
                    <li>Conecta tu repo de GitHub a Vercel</li>
                    <li>Configura las variables de entorno (.env)</li>
                    <li>Ejecuta la migración de Prisma contra tu Supabase</li>
                    <li>Cada push a <code className="text-[10px] bg-muted px-1 rounded">main</code> despliega automáticamente</li>
                  </ol>
                  <p className="mt-1.5">Para la base de datos, usamos <strong>Supabase</strong> con PostgreSQL y connection pooling vía PgBouncer.</p>
                </div>
              </Accordion>
              <Accordion title="¿Cuál es el coste de funcionamiento?">
                <div className="mt-2 space-y-1.5">
                  <ul className="space-y-1">
                    <li><strong>Vercel</strong>: Plan gratuito suficiente para empezar (100GB bandwidth)</li>
                    <li><strong>Supabase</strong>: Plan gratuito con 500MB DB y 1GB transfer</li>
                    <li><strong>OpenAI</strong>: ~$0.15/1M tokens input con GPT-4o-mini (muy bajo coste)</li>
                    <li><strong>WhatsApp Cloud API</strong>: 1,000 conversaciones gratis/mes. Después ~$0.05-0.08/conversación</li>
                    <li><strong>Open-Meteo</strong>: Gratuito para uso no comercial</li>
                  </ul>
                  <p className="mt-1.5">Para un club medio (~200 jugadores), el coste mensual estimado es de <strong>$5-20/mes</strong>.</p>
                </div>
              </Accordion>
              <Accordion title="¿Se pueden exportar los datos?">
                <div className="mt-2 space-y-1.5">
                  <p>Sí, los datos están en PostgreSQL y pueden exportarse:</p>
                  <ul className="space-y-1">
                    <li>- <strong>Prisma Studio</strong> (<code className="text-[10px] bg-muted px-1 rounded">npm run db:studio</code>): interfaz visual para explorar y exportar datos</li>
                    <li>- <strong>SQL directo</strong>: acceso vía Supabase dashboard</li>
                    <li>- <strong>API REST</strong>: todos los endpoints devuelven JSON</li>
                    <li>- <strong>Caddie AI</strong>: puedes pedir resúmenes y análisis en lenguaje natural</li>
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
              <p>Para soporte técnico, consulta el repositorio del proyecto o contacta al equipo de desarrollo.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded border p-3">
                  <p className="font-medium text-foreground text-xs">Caddie AI</p>
                  <p className="text-[11px] mt-1">Usa el chatbot integrado para consultas rápidas sobre datos del sistema.</p>
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
