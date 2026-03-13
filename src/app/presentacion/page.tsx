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
  Facebook,
  Instagram,
  Mail,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

// ─── Slide Data ──────────────────────────────────────────────

const slides = [
  { id: "hero", label: "Inicio" },
  { id: "dashboard", label: "Dashboard" },
  { id: "players", label: "Jugadores" },
  { id: "multichannel", label: "Multicanal" },
  { id: "campaigns", label: "Campañas" },
  { id: "tournaments", label: "Torneos" },
  { id: "weather", label: "Meteorología" },
  { id: "cta", label: "Contacto" },
];

// ─── Channel icon helper ────────────────────────────────────

function ChannelIcon({ channel, className }: { channel: string; className?: string }) {
  switch (channel) {
    case "whatsapp":
      return <MessageSquare className={className} />;
    case "facebook":
      return <Facebook className={className} />;
    case "instagram":
      return <Instagram className={className} />;
    case "email":
      return <Mail className={className} />;
    default:
      return <MessageSquare className={className} />;
  }
}

const channelColors: Record<string, string> = {
  whatsapp: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  facebook: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  instagram: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  email: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

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

      {/* Top nav — solid background */}
      <nav className="fixed top-1 left-0 right-0 z-40 flex items-center justify-between px-4 sm:px-8 py-3 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-bold text-lg">
          <Image src="/logo.svg" alt="Caddie 24" width={32} height={32} /> Caddie 24
        </div>
        <Link href="/login">
          <Button variant="outline" size="sm" className="text-xs">
            Iniciar Sesión
          </Button>
        </Link>
      </nav>

      {/* Slide content */}
      <div className="flex-1 flex items-center justify-center pt-16 pb-16 px-4 sm:px-8">
        <div
          key={current}
          className={`w-full max-w-6xl mx-auto animate-slide-${direction}`}
        >
          {current === 0 && <HeroSlide onNext={next} />}
          {current === 1 && <DashboardSlide />}
          {current === 2 && <PlayersSlide />}
          {current === 3 && <MultichannelSlide />}
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
        <Image src="/logo.svg" alt="Caddie 24" width={140} height={140} className="mb-4" />
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
        El CRM multicanal para campos de golf con{" "}
        <span className="font-semibold text-green-600 dark:text-green-400">
          IA
        </span>{" "}
        integrada
      </p>
      {/* Channel icons */}
      <div className="flex items-center justify-center gap-3 pt-2">
        {[
          { icon: MessageSquare, label: "WhatsApp", color: "text-green-600" },
          { icon: Facebook, label: "Facebook", color: "text-blue-600" },
          { icon: Instagram, label: "Instagram", color: "text-pink-600" },
          { icon: Mail, label: "Email", color: "text-amber-600" },
        ].map((ch) => (
          <div
            key={ch.label}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <ch.icon className={`h-4 w-4 ${ch.color}`} />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {ch.label}
            </span>
          </div>
        ))}
      </div>
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
              { name: "Carlos M.", msg: "Quiero reservar para el sábado", color: "bg-blue-500", channel: "whatsapp" },
              { name: "Ana López", msg: "¿Hay torneos este mes?", color: "bg-pink-500", channel: "instagram" },
              { name: "Caddie IA", msg: "Sí, hay huecos a las 9:30...", color: "bg-green-500", ai: true, channel: "whatsapp" },
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
    { name: "Carlos Martínez", handicap: 12, level: "VIP", levelColor: "bg-purple-100 text-purple-700", tags: ["Mañanas", "Pro Shop"], prefChannel: "whatsapp" },
    { name: "Ana López García", handicap: 18, level: "HIGH", levelColor: "bg-green-100 text-green-700", tags: ["Tardes", "Torneos"], prefChannel: "instagram" },
    { name: "Miguel Fernández", handicap: 24, level: "MEDIUM", levelColor: "bg-blue-100 text-blue-700", tags: ["Fin de semana"], prefChannel: "email" },
    { name: "Laura Sánchez", handicap: 8, level: "VIP", levelColor: "bg-purple-100 text-purple-700", tags: ["Competidora"], prefChannel: "facebook" },
  ];

  return (
    <SlideLayout
      tag="CRM de Jugadores"
      title="Gestión de Jugadores"
      description="Perfiles completos con historial, handicap, nivel de engagement, etiquetas IA y canal de comunicación preferido."
      bullets={[
        { icon: Users, text: "Perfiles con handicap, preferencias y consumo" },
        { icon: Bot, text: "Etiquetas automáticas generadas por IA" },
        { icon: TrendingUp, text: "Niveles de engagement: NEW → VIP" },
        { icon: Target, text: "Canal preferido por jugador: WhatsApp, Instagram, Facebook o Email" },
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
                  <span className={`inline-flex items-center gap-0.5 text-[8px] px-1.5 py-0.5 rounded-full ${channelColors[p.prefChannel]}`}>
                    <ChannelIcon channel={p.prefChannel} className="h-2.5 w-2.5" />
                    {p.prefChannel === "whatsapp" ? "WhatsApp" : p.prefChannel === "facebook" ? "Facebook" : p.prefChannel === "instagram" ? "Instagram" : "Email"}
                  </span>
                  {p.tags.slice(0, 1).map((t) => (
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

// ─── Slide 4: Multichannel ──────────────────────────────────

function MultichannelSlide() {
  const channels = [
    {
      name: "WhatsApp",
      icon: MessageSquare,
      color: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20",
      iconColor: "text-green-600",
      desc: "API Business oficial con templates aprobados por Meta",
      stats: "68% tasa de lectura",
    },
    {
      name: "Facebook Messenger",
      icon: Facebook,
      color: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20",
      iconColor: "text-blue-600",
      desc: "Mensajes directos y respuestas automáticas en tu página",
      stats: "45% de jugadores activos",
    },
    {
      name: "Instagram DM",
      icon: Instagram,
      color: "border-pink-200 bg-pink-50 dark:border-pink-800 dark:bg-pink-900/20",
      iconColor: "text-pink-600",
      desc: "Responde a DMs, stories y comentarios desde el CRM",
      stats: "Ideal para jugadores jóvenes",
    },
    {
      name: "Email",
      icon: Mail,
      color: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20",
      iconColor: "text-amber-600",
      desc: "Newsletters, confirmaciones y comunicaciones formales",
      stats: "Facturas y documentos",
    },
  ];

  return (
    <SlideLayout
      tag="Comunicación Multicanal"
      title="Todos los Canales en Uno"
      description="Comunícate con cada jugador por su canal preferido. WhatsApp, Facebook, Instagram o Email: una sola bandeja, respuestas con IA en todos."
      bullets={[
        { icon: MessageSquare, text: "Bandeja unificada para todos los canales" },
        { icon: Bot, text: "IA que responde en el canal adecuado automáticamente" },
        { icon: Target, text: "Cada jugador elige cómo quiere que le contactes" },
        { icon: BarChart3, text: "Métricas de engagement por canal" },
      ]}
    >
      <div className="w-full max-w-sm space-y-2.5">
        {channels.map((ch) => (
          <Card key={ch.name} className={`shadow-sm border ${ch.color}`}>
            <CardContent className="flex items-center gap-3 p-3">
              <div className="shrink-0">
                <ch.icon className={`h-6 w-6 ${ch.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{ch.name}</div>
                <div className="text-[10px] text-muted-foreground">{ch.desc}</div>
                <div className="text-[9px] font-medium text-green-600 dark:text-green-400 mt-0.5">
                  {ch.stats}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </SlideLayout>
  );
}

// ─── Slide 5: Campaigns ─────────────────────────────────────

function CampaignsSlide() {
  return (
    <SlideLayout
      tag="Marketing Multicanal"
      title="Campañas de Marketing"
      description="Crea campañas segmentadas enviadas por el canal preferido de cada jugador: WhatsApp, Facebook, Instagram o Email. Con A/B testing y métricas detalladas."
      bullets={[
        { icon: Target, text: "Segmentación por handicap, engagement, canal preferido" },
        { icon: Send, text: "Envío automático al canal que cada jugador prefiere" },
        { icon: BarChart3, text: "Métricas por canal: enviados, leídos, respondidos" },
        { icon: Zap, text: "A/B testing multicanal para optimizar resultados" },
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
            {/* Channel breakdown */}
            <div className="flex items-center gap-2">
              {[
                { ch: "whatsapp", count: 87, color: "bg-green-500" },
                { ch: "email", count: 32, color: "bg-amber-500" },
                { ch: "instagram", count: 15, color: "bg-pink-500" },
                { ch: "facebook", count: 8, color: "bg-blue-500" },
              ].map((c) => (
                <div key={c.ch} className="flex items-center gap-1">
                  <div className={`h-2 w-2 rounded-full ${c.color}`} />
                  <span className="text-[9px] text-muted-foreground">{c.count}</span>
                </div>
              ))}
              <span className="text-[9px] text-muted-foreground ml-auto">142 total</span>
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
              Viernes 14:00 · 87 destinatarios ·
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-2.5 w-2.5 text-green-500" />
                <Instagram className="h-2.5 w-2.5 text-pink-500" />
                <Mail className="h-2.5 w-2.5 text-amber-500" />
              </span>
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
      description="Organiza torneos con inscripciones online, categorías por handicap, leaderboard en vivo y publicación automática de resultados por el canal preferido."
      bullets={[
        { icon: Trophy, text: "Formatos: Stableford, Medal, Scramble, Match Play" },
        { icon: Users, text: "Inscripciones con lista de espera y pagos" },
        { icon: Star, text: "Leaderboard en tiempo real por categorías" },
        { icon: Send, text: "Resultados enviados por WhatsApp, Email o redes sociales" },
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
      description="Previsión a 14 días con score de jugabilidad golf, predicción de demanda, cierres automáticos y alertas enviadas al canal preferido de cada jugador."
      bullets={[
        { icon: CloudSun, text: "Previsión a 14 días con score golf 0-100" },
        { icon: Zap, text: "Alertas automáticas de cierre por condiciones adversas" },
        { icon: BarChart3, text: "Predicción de demanda basada en clima" },
        { icon: Bot, text: "Promos automáticas por WhatsApp, Email o redes si buen tiempo" },
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

// ─── Slide 8: CTA with Contact Form ─────────────────────────

function CtaSlide() {
  const [formData, setFormData] = useState({
    name: "",
    club: "",
    email: "",
    phone: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setSent(true);
    } catch {
      // Fallback: open mailto
      const subject = encodeURIComponent(`Solicitud demo Caddie 24 - ${formData.club}`);
      const body = encodeURIComponent(
        `Nombre: ${formData.name}\nClub: ${formData.club}\nEmail: ${formData.email}\nTeléfono: ${formData.phone}`
      );
      window.open(`mailto:omkagency@gmail.com?subject=${subject}&body=${body}`);
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-5xl mx-auto">
      {/* Left side — value prop */}
      <div className="space-y-6 text-center lg:text-left">
        <div className="text-5xl">🏌️</div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          ¿Listo para transformar{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
            tu club
          </span>
          ?
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-300">
          Caddie 24 automatiza la comunicación multicanal, potencia el marketing
          y mejora la experiencia de tus jugadores con inteligencia artificial.
        </p>
        <div className="grid grid-cols-2 gap-4 pt-2">
          {[
            { icon: Clock, label: "Ahorro de tiempo", value: "70%" },
            { icon: TrendingUp, label: "Más retención", value: "+35%" },
            { icon: MessageSquare, label: "Respuesta media", value: "<2min" },
            { icon: CheckCircle2, label: "Tasa de lectura", value: "68%" },
          ].map((b) => (
            <div key={b.label} className="text-center lg:text-left">
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <b.icon className="h-4 w-4 text-green-500" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {b.value}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground">{b.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right side — Contact form */}
      <div>
        <Card className="shadow-lg border-green-100 dark:border-green-900/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Solicita una Demo</CardTitle>
            <p className="text-sm text-muted-foreground">
              Te contactamos sin compromiso
            </p>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                <div className="text-lg font-semibold">¡Recibido!</div>
                <p className="text-sm text-muted-foreground">
                  Nos pondremos en contacto contigo pronto.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-name" className="text-sm">
                    Nombre
                  </Label>
                  <Input
                    id="contact-name"
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                    disabled={sending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-club" className="text-sm">
                    Club de Golf
                  </Label>
                  <Input
                    id="contact-club"
                    placeholder="Nombre de tu club"
                    value={formData.club}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, club: e.target.value }))
                    }
                    required
                    disabled={sending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email" className="text-sm">
                    Email
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    required
                    disabled={sending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-phone" className="text-sm">
                    Teléfono <span className="text-muted-foreground">(opcional)</span>
                  </Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    placeholder="+34 600 000 000"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    disabled={sending}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                  disabled={sending}
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Solicitar Demo <Send className="h-4 w-4" />
                    </>
                  )}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground">
                  Sin compromiso. Te contactamos en menos de 24h.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
