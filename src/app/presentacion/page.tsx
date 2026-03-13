"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  MessageSquare,
  Megaphone,
  TrendingUp,
  Trophy,
  CloudSun,
  Bot,
  Wind,
  Droplets,
  Star,
  Send,
  BarChart3,
  Target,
  Zap,
  Shield,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ─── Slide Data ──────────────────────────────────────────────

const slides = [
  { id: "hero", label: "Inicio" },
  { id: "dashboard", label: "Dashboard" },
  { id: "players", label: "Jugadores" },
  { id: "inbox", label: "WhatsApp" },
  { id: "campaigns", label: "Campañas" },
  { id: "tournaments", label: "Torneos" },
  { id: "weather", label: "Meteorología" },
  { id: "cta", label: "Empieza" },
];

// ─── Main Component ─────────────────────────────────────────

export default function PresentacionPage() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isAnimating, setIsAnimating] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating || index === current) return;
      setDirection(index > current ? "next" : "prev");
      setIsAnimating(true);
      setCurrent(index);
      setTimeout(() => setIsAnimating(false), 500);
    },
    [current, isAnimating]
  );

  const next = useCallback(() => {
    if (current < slides.length - 1) goTo(current + 1);
  }, [current, goTo]);

  const prev = useCallback(() => {
    if (current > 0) goTo(current - 1);
  }, [current, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  const progress = ((current + 1) / slides.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col overflow-hidden">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-green-100 dark:bg-gray-800">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Top nav */}
      <nav className="fixed top-1 left-0 right-0 z-40 flex items-center justify-between px-4 sm:px-8 py-3">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-bold text-lg">
          <span className="text-2xl">⛳</span> Caddie 24
        </div>
        <Link href="/login">
          <Button variant="outline" size="sm" className="text-xs">
            Iniciar Sesión
          </Button>
        </Link>
      </nav>

      {/* Slide content */}
      <div className="flex-1 flex items-center justify-center pt-14 pb-16 px-4 sm:px-8">
        <div
          key={current}
          className={`w-full max-w-6xl mx-auto animate-slide-${direction}`}
        >
          {current === 0 && <HeroSlide onNext={next} />}
          {current === 1 && <DashboardSlide />}
          {current === 2 && <PlayersSlide />}
          {current === 3 && <InboxSlide />}
          {current === 4 && <CampaignsSlide />}
          {current === 5 && <TournamentsSlide />}
          {current === 6 && <WeatherSlide />}
          {current === 7 && <CtaSlide />}
        </div>
      </div>

      {/* Navigation arrows */}
      {current > 0 && (
        <button
          onClick={prev}
          className="fixed left-2 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-lg backdrop-blur hover:bg-white dark:hover:bg-gray-700 transition-colors"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 dark:text-gray-200" />
        </button>
      )}
      {current < slides.length - 1 && (
        <button
          onClick={next}
          className="fixed right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-lg backdrop-blur hover:bg-white dark:hover:bg-gray-700 transition-colors"
          aria-label="Siguiente"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 dark:text-gray-200" />
        </button>
      )}

      {/* Dots */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-full px-4 py-2 shadow-lg">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            className={`transition-all duration-300 rounded-full ${
              i === current
                ? "w-6 h-2.5 bg-green-500"
                : "w-2.5 h-2.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400"
            }`}
            aria-label={s.label}
            title={s.label}
          />
        ))}
      </div>

      {/* CSS animations */}
      <style jsx global>{`
        @keyframes slideNext {
          from {
            opacity: 0;
            transform: translateX(60px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slidePrev {
          from {
            opacity: 0;
            transform: translateX(-60px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-next {
          animation: slideNext 0.45s ease-out;
        }
        .animate-slide-prev {
          animation: slidePrev 0.45s ease-out;
        }
      `}</style>
    </div>
  );
}

// ─── Shared Layout ──────────────────────────────────────────

function SlideLayout({
  tag,
  title,
  description,
  bullets,
  children,
}: {
  tag: string;
  title: string;
  description: string;
  bullets: { icon: React.ElementType; text: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
      {/* Text side */}
      <div className="space-y-5">
        <Badge variant="secondary" className="text-xs font-medium px-3 py-1">
          {tag}
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h2>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          {description}
        </p>
        <ul className="space-y-3 pt-2">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="mt-0.5 p-1.5 rounded-lg bg-green-100 dark:bg-green-900/40">
                <b.icon className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {b.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
      {/* Mockup side */}
      <div className="flex justify-center">{children}</div>
    </div>
  );
}

// ─── Slide 1: Hero ──────────────────────────────────────────

function HeroSlide({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center space-y-8 max-w-3xl mx-auto">
      <div className="relative inline-block">
        <div className="text-8xl sm:text-9xl mb-4">⛳</div>
        <div className="absolute -top-4 -right-8 w-20 h-20 bg-green-200/40 dark:bg-green-800/20 rounded-full blur-xl" />
        <div className="absolute -bottom-4 -left-8 w-16 h-16 bg-emerald-200/40 dark:bg-emerald-800/20 rounded-full blur-xl" />
      </div>
      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white">
        Caddie{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
          24
        </span>
      </h1>
      <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
        El CRM de marketing y comunicación para campos de golf con{" "}
        <span className="font-semibold text-green-600 dark:text-green-400">
          WhatsApp
        </span>{" "}
        +{" "}
        <span className="font-semibold text-green-600 dark:text-green-400">
          Inteligencia Artificial
        </span>
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Button
          size="lg"
          onClick={onNext}
          className="gap-2 bg-green-600 hover:bg-green-700 text-white px-8"
        >
          Comenzar Tour <ArrowRight className="h-4 w-4" />
        </Button>
        <Link href="/login">
          <Button variant="outline" size="lg">
            Iniciar Sesión
          </Button>
        </Link>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 pt-4">
        Usa las flechas ← → o haz clic para navegar
      </p>
    </div>
  );
}

// ─── Slide 2: Dashboard ─────────────────────────────────────

function DashboardSlide() {
  const kpis = [
    { label: "Total Jugadores", value: "187", sub: "+12 este mes", icon: Users },
    { label: "Conversaciones", value: "14", sub: "3 sin leer", icon: MessageSquare },
    { label: "Campañas", value: "6", sub: "2 activas", icon: Megaphone },
    { label: "Jugadores VIP", value: "23", sub: "Engagement máximo", icon: TrendingUp },
  ];

  return (
    <SlideLayout
      tag="Panel Central"
      title="Dashboard Inteligente"
      description="Visualiza el estado de tu club de un vistazo. KPIs en tiempo real, actividad reciente y previsión meteorológica integrada."
      bullets={[
        { icon: BarChart3, text: "Métricas clave actualizadas en tiempo real" },
        { icon: Zap, text: "Acciones rápidas para gestión diaria" },
        { icon: CloudSun, text: "Pronóstico con score de jugabilidad integrado" },
      ]}
    >
      <div className="w-full max-w-md space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <Card key={k.label} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-3">
                <span className="text-[10px] text-muted-foreground font-medium">
                  {k.label}
                </span>
                <k.icon className="h-3.5 w-3.5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="text-2xl font-bold">{k.value}</div>
                <p className="text-[10px] text-muted-foreground">{k.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Mini activity mockup */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-xs">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 space-y-2">
            {[
              { name: "Carlos M.", msg: "Quiero reservar para el sábado", color: "bg-blue-500" },
              { name: "Ana López", msg: "¿Hay disponibilidad mañana?", color: "bg-blue-500" },
              { name: "Caddie IA", msg: "Sí, hay huecos a las 9:30...", color: "bg-green-500", ai: true },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className={`mt-1.5 h-1.5 w-1.5 rounded-full ${a.color}`} />
                <div>
                  <span className="text-[11px]">
                    <span className="font-medium">{a.name}</span>: {a.msg}
                    {a.ai && (
                      <Badge variant="secondary" className="ml-1 text-[8px] py-0 px-1">
                        IA
                      </Badge>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </SlideLayout>
  );
}

// ─── Slide 3: Players ───────────────────────────────────────

function PlayersSlide() {
  const players = [
    { name: "Carlos Martínez", handicap: 12, level: "VIP", levelColor: "bg-purple-100 text-purple-700", tags: ["Mañanas", "Pro Shop"] },
    { name: "Ana López García", handicap: 18, level: "HIGH", levelColor: "bg-green-100 text-green-700", tags: ["Tardes", "Torneos"] },
    { name: "Miguel Fernández", handicap: 24, level: "MEDIUM", levelColor: "bg-blue-100 text-blue-700", tags: ["Fin de semana"] },
    { name: "Laura Sánchez", handicap: 8, level: "VIP", levelColor: "bg-purple-100 text-purple-700", tags: ["Competidora", "Pro Shop"] },
  ];

  return (
    <SlideLayout
      tag="CRM de Jugadores"
      title="Gestión de Jugadores"
      description="Perfiles completos con historial, handicap, nivel de engagement y etiquetas inteligentes generadas por IA."
      bullets={[
        { icon: Users, text: "Perfiles con handicap, preferencias y consumo" },
        { icon: Bot, text: "Etiquetas automáticas generadas por IA" },
        { icon: TrendingUp, text: "Niveles de engagement: NEW → VIP" },
        { icon: Target, text: "Segmentación avanzada para campañas" },
      ]}
    >
      <div className="w-full max-w-sm space-y-2">
        {players.map((p) => (
          <Card key={p.name} className="shadow-sm">
            <CardContent className="flex items-center gap-3 p-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{p.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${p.levelColor}`}>
                    {p.level}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">
                    HCP {p.handicap}
                  </span>
                  {p.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="text-[8px] py-0 px-1">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </SlideLayout>
  );
}

// ─── Slide 4: Inbox ─────────────────────────────────────────

function InboxSlide() {
  const messages = [
    { from: "Carlos M.", text: "Hola, quiero reservar green fee para el sábado 4 personas", time: "10:32", dir: "in" as const },
    { from: "Caddie IA", text: "¡Hola Carlos! Tenemos disponibilidad el sábado a las 9:00, 9:30 y 10:30. ¿Qué horario te viene mejor? 🏌️", time: "10:32", dir: "out" as const, ai: true },
    { from: "Carlos M.", text: "Las 9:30 perfecto, gracias!", time: "10:35", dir: "in" as const },
    { from: "Caddie IA", text: "Perfecto, reservado para 4 personas el sábado a las 9:30. Os esperamos. ¡Buen juego! ⛳", time: "10:35", dir: "out" as const, ai: true },
  ];

  return (
    <SlideLayout
      tag="WhatsApp + IA"
      title="Bandeja de Entrada Inteligente"
      description="Todas las conversaciones de WhatsApp en un solo lugar. La IA responde automáticamente, analiza el sentimiento y sugiere borradores."
      bullets={[
        { icon: MessageSquare, text: "Conversaciones centralizadas de WhatsApp Business" },
        { icon: Bot, text: "Respuestas automáticas con IA que conoce tu club" },
        { icon: Shield, text: "Análisis de sentimiento en cada conversación" },
        { icon: Clock, text: "Horarios de silencio y reglas de prioridad" },
      ]}
    >
      <div className="w-full max-w-sm">
        <Card className="shadow-sm overflow-hidden">
          {/* Chat header */}
          <div className="bg-green-600 text-white px-4 py-2.5 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
              CM
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Carlos Martínez</div>
              <div className="text-[10px] text-green-100 flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-green-300" />
                Sentimiento: Positivo
              </div>
            </div>
            <Badge className="bg-green-500 text-white text-[8px] border-0">
              VIP
            </Badge>
          </div>
          {/* Messages */}
          <CardContent className="p-3 space-y-2.5 bg-gray-50 dark:bg-gray-900/50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.dir === "out" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-[11px] ${
                    m.dir === "out"
                      ? "bg-green-100 dark:bg-green-900/40 text-green-900 dark:text-green-100"
                      : "bg-white dark:bg-gray-800 shadow-sm"
                  }`}
                >
                  {m.ai && (
                    <div className="flex items-center gap-1 mb-0.5">
                      <Bot className="h-3 w-3 text-green-600" />
                      <span className="text-[9px] font-medium text-green-600 dark:text-green-400">
                        Caddie IA
                      </span>
                    </div>
                  )}
                  {m.text}
                  <div className="text-[9px] text-gray-400 mt-1 text-right">
                    {m.time}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </SlideLayout>
  );
}

// ─── Slide 5: Campaigns ─────────────────────────────────────

function CampaignsSlide() {
  return (
    <SlideLayout
      tag="Marketing"
      title="Campañas de Marketing"
      description="Crea campañas segmentadas por WhatsApp con templates aprobados por Meta, A/B testing y métricas detalladas de entrega."
      bullets={[
        { icon: Target, text: "Segmentación por handicap, engagement, preferencias" },
        { icon: Send, text: "Templates aprobados por Meta WhatsApp Business" },
        { icon: BarChart3, text: "Métricas: enviados, entregados, leídos, respondidos" },
        { icon: Zap, text: "A/B testing para optimizar tus mensajes" },
      ]}
    >
      <div className="w-full max-w-sm space-y-3">
        <Card className="shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Torneo de Primavera</div>
                <div className="text-[10px] text-muted-foreground">
                  Jugadores con HCP &lt; 20
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700 text-[10px]">
                Completada
              </Badge>
            </div>
            {/* Metrics */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Enviados", value: "142" },
                { label: "Entregados", value: "138" },
                { label: "Leídos", value: "94" },
                { label: "Respondidos", value: "23" },
              ].map((m) => (
                <div key={m.label} className="text-center">
                  <div className="text-lg font-bold text-green-600">{m.value}</div>
                  <div className="text-[8px] text-muted-foreground">{m.label}</div>
                </div>
              ))}
            </div>
            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] text-muted-foreground">
                <span>Tasa de lectura</span>
                <span>68%</span>
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: "68%" }} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Oferta Fin de Semana</div>
                <div className="text-[10px] text-muted-foreground">
                  Green fees con descuento -20%
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-700 text-[10px]">
                Programada
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              Envío: Viernes 14:00 · 87 destinatarios
            </div>
          </CardContent>
        </Card>
      </div>
    </SlideLayout>
  );
}

// ─── Slide 6: Tournaments ───────────────────────────────────

function TournamentsSlide() {
  const leaderboard = [
    { pos: 1, name: "Laura Sánchez", hcp: 8, score: 72, stb: 38 },
    { pos: 2, name: "Carlos Martínez", hcp: 12, score: 76, stb: 36 },
    { pos: 3, name: "Miguel Fernández", hcp: 24, score: 89, stb: 35 },
    { pos: 4, name: "Ana López", hcp: 18, score: 84, stb: 33 },
  ];

  return (
    <SlideLayout
      tag="Competición"
      title="Gestión de Torneos"
      description="Organiza torneos con inscripciones online, categorías por handicap, leaderboard en vivo y publicación automática de resultados."
      bullets={[
        { icon: Trophy, text: "Formatos: Stableford, Medal, Scramble, Match Play" },
        { icon: Users, text: "Inscripciones con lista de espera y pagos" },
        { icon: Star, text: "Leaderboard en tiempo real por categorías" },
        { icon: Send, text: "Notificaciones automáticas a participantes" },
      ]}
    >
      <div className="w-full max-w-sm">
        <Card className="shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <div>
                <div className="text-sm font-semibold">Torneo de Primavera</div>
                <div className="text-[10px] text-green-100">
                  Stableford · 42 inscritos · 15 mar 2025
                </div>
              </div>
            </div>
          </div>
          <CardContent className="p-0">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left px-3 py-2 font-medium">#</th>
                  <th className="text-left py-2 font-medium">Jugador</th>
                  <th className="text-center py-2 font-medium">HCP</th>
                  <th className="text-center py-2 font-medium">Score</th>
                  <th className="text-center px-3 py-2 font-medium">Stb</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((p) => (
                  <tr
                    key={p.pos}
                    className={`border-b last:border-0 ${
                      p.pos === 1 ? "bg-yellow-50 dark:bg-yellow-900/10" : ""
                    }`}
                  >
                    <td className="px-3 py-2.5 font-bold">
                      {p.pos === 1 ? "🥇" : p.pos === 2 ? "🥈" : p.pos === 3 ? "🥉" : p.pos}
                    </td>
                    <td className="py-2.5 font-medium">{p.name}</td>
                    <td className="text-center py-2.5 text-muted-foreground">
                      {p.hcp}
                    </td>
                    <td className="text-center py-2.5">{p.score}</td>
                    <td className="text-center px-3 py-2.5 font-bold text-green-600">
                      {p.stb}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </SlideLayout>
  );
}

// ─── Slide 7: Weather ───────────────────────────────────────

function WeatherSlide() {
  const days = [
    { day: "Hoy", emoji: "☀️", max: 22, min: 12, wind: 15, rain: 0, score: 92, demand: "Alta" },
    { day: "Mañana", emoji: "⛅", max: 19, min: 11, wind: 22, rain: 2, score: 74, demand: "Media" },
    { day: "Miércoles", emoji: "🌧️", max: 14, min: 8, wind: 35, rain: 18, score: 28, demand: "Baja" },
  ];

  return (
    <SlideLayout
      tag="Clima"
      title="Meteorología Integrada"
      description="Previsión a 14 días con score de jugabilidad golf, predicción de demanda, cierres automáticos por lluvia/viento y alertas inteligentes."
      bullets={[
        { icon: CloudSun, text: "Previsión a 14 días con score golf 0-100" },
        { icon: Zap, text: "Alertas automáticas de cierre por condiciones adversas" },
        { icon: BarChart3, text: "Predicción de demanda basada en clima" },
        { icon: Bot, text: "Automatizaciones: enviar promos si buen tiempo" },
      ]}
    >
      <div className="w-full max-w-sm space-y-3">
        {days.map((d) => (
          <Card key={d.day} className="shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{d.day}</span>
                <span className="text-xl">{d.emoji}</span>
              </div>
              <div className="text-lg font-bold mt-1">
                {d.max}° / {d.min}°
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Wind className="h-3 w-3" />
                  {d.wind}km/h
                </span>
                <span className="flex items-center gap-1">
                  <Droplets className="h-3 w-3" />
                  {d.rain}mm
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      d.score >= 80
                        ? "bg-green-500"
                        : d.score >= 50
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  />
                  <span className="text-[10px] font-medium">
                    Score {d.score}
                  </span>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                    d.demand === "Alta"
                      ? "bg-green-100 text-green-700"
                      : d.demand === "Media"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  Demanda {d.demand}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </SlideLayout>
  );
}

// ─── Slide 8: CTA ───────────────────────────────────────────

function CtaSlide() {
  return (
    <div className="text-center space-y-8 max-w-3xl mx-auto">
      <div className="text-6xl">🏌️</div>
      <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
        ¿Listo para transformar{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
          tu club
        </span>
        ?
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
        Caddie 24 automatiza la comunicación, potencia el marketing y mejora la
        experiencia de tus jugadores con inteligencia artificial.
      </p>

      {/* Benefits summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto pt-4">
        {[
          { icon: Clock, label: "Ahorro de tiempo", value: "70%" },
          { icon: TrendingUp, label: "Más retención", value: "+35%" },
          { icon: MessageSquare, label: "Respuesta media", value: "<2min" },
          { icon: CheckCircle2, label: "Tasa de lectura", value: "68%" },
        ].map((b) => (
          <div key={b.label} className="text-center">
            <b.icon className="h-6 w-6 text-green-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {b.value}
            </div>
            <div className="text-[10px] text-muted-foreground">{b.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
        <Link href="/login">
          <Button
            size="lg"
            className="gap-2 bg-green-600 hover:bg-green-700 text-white px-8"
          >
            Iniciar Sesión <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <a href="mailto:info@caddie24.com">
          <Button variant="outline" size="lg" className="gap-2">
            Solicitar Demo <Send className="h-4 w-4" />
          </Button>
        </a>
      </div>
    </div>
  );
}
