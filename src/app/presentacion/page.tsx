"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ─── Slide Data ──────────────────────────────────────────────

const slides = [
  { id: "hero" },
  { id: "pain" },
  { id: "multichannel" },
  { id: "ai" },
  { id: "campaigns" },
  { id: "tournaments" },
  { id: "weather" },
  { id: "results" },
  { id: "cta" },
];

// ─── Main Component ─────────────────────────────────────────

export default function PresentacionPage() {
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState<"next" | "prev">("next");
  const [lock, setLock] = useState(false);

  const go = useCallback(
    (i: number) => {
      if (lock || i === current || i < 0 || i >= slides.length) return;
      setDir(i > current ? "next" : "prev");
      setLock(true);
      setCurrent(i);
      setTimeout(() => setLock(false), 400);
    },
    [current, lock]
  );

  const next = useCallback(() => go(current + 1), [current, go]);
  const prev = useCallback(() => go(current - 1), [current, go]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [next, prev]);

  // Touch swipe
  useEffect(() => {
    let startX = 0;
    const onStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const onEnd = (e: TouchEvent) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => { window.removeEventListener("touchstart", onStart); window.removeEventListener("touchend", onEnd); };
  }, [next, prev]);

  const pct = ((current + 1) / slides.length) * 100;

  const S = [
    <HeroSlide key="hero" onNext={next} />,
    <PainSlide key="pain" />,
    <MultichannelSlide key="multi" />,
    <AiSlide key="ai" />,
    <CampaignsSlide key="camp" />,
    <TournamentsSlide key="tourn" />,
    <WeatherSlide key="weather" />,
    <ResultsSlide key="results" />,
    <CtaSlide key="cta" />,
  ];

  return (
    <div className="fixed inset-0 bg-[#0a0f0d] text-white overflow-hidden select-none">
      {/* Progress */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-white/10">
        <div className="h-full bg-gradient-to-r from-green-400 to-emerald-400 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      {/* Nav */}
      <nav className="fixed top-[3px] left-0 right-0 z-40 flex items-center justify-between px-4 sm:px-6 py-3 bg-[#0a0f0d]/80 backdrop-blur-md">
        <div className="flex items-center gap-2 font-bold text-base">
          <Image src="/logo.svg" alt="" width={28} height={28} />
          <span className="text-white">Caddie <span className="text-green-400">24</span></span>
        </div>
        <Link href="/login">
          <Button size="sm" className="text-xs h-8 bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur">
            Acceder
          </Button>
        </Link>
      </nav>

      {/* Slide */}
      <div className="h-full flex items-center justify-center pt-12 pb-14 px-5 sm:px-8">
        <div key={current} className={`w-full max-w-5xl mx-auto anim-${dir}`}>
          {S[current]}
        </div>
      </div>

      {/* Arrows — hidden on mobile, visible on desktop */}
      {current > 0 && (
        <button onClick={prev} className="hidden sm:flex fixed left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors" aria-label="Anterior">
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      {current < slides.length - 1 && (
        <button onClick={next} className="hidden sm:flex fixed right-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors" aria-label="Siguiente">
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      {/* Dots */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current ? "w-6 h-2 bg-green-400" : "w-2 h-2 bg-white/25 hover:bg-white/40"
            }`}
          />
        ))}
      </div>

      <style jsx global>{`
        @keyframes aN { from { opacity:0; transform:translateX(40px) } to { opacity:1; transform:translateX(0) } }
        @keyframes aP { from { opacity:0; transform:translateX(-40px) } to { opacity:1; transform:translateX(0) } }
        .anim-next { animation: aN .4s ease-out }
        .anim-prev { animation: aP .4s ease-out }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        .fade-up { animation: fadeUp .6s ease-out both }
        .fade-up-d1 { animation: fadeUp .6s .1s ease-out both }
        .fade-up-d2 { animation: fadeUp .6s .2s ease-out both }
        .fade-up-d3 { animation: fadeUp .6s .3s ease-out both }
        .fade-up-d4 { animation: fadeUp .6s .4s ease-out both }
        @keyframes pulse-soft { 0%,100% { opacity:.6 } 50% { opacity:1 } }
        .pulse-soft { animation: pulse-soft 3s ease-in-out infinite }
      `}</style>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────

function GlowCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-5 ${className}`}>
      {children}
    </div>
  );
}

function StatBig({ value, label, icon: Icon }: { value: string; label: string; icon: React.ElementType }) {
  return (
    <div className="text-center">
      <Icon className="h-5 w-5 text-green-400 mx-auto mb-1" />
      <div className="text-2xl sm:text-3xl font-black">{value}</div>
      <div className="text-[10px] sm:text-xs text-white/50">{label}</div>
    </div>
  );
}

function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium px-2.5 py-1 rounded-full ${className}`}>
      {children}
    </span>
  );
}

// ─── Slide 1: Hero ──────────────────────────────────────────

function HeroSlide({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-6 sm:gap-8">
      {/* Glow background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="fade-up relative">
        <Image src="/logo.svg" alt="Caddie 24" width={100} height={100} className="sm:w-[130px] sm:h-[130px]" />
      </div>

      <h1 className="fade-up-d1 text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]">
        Tu club de golf,
        <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-green-400">
          siempre conectado
        </span>
      </h1>

      <p className="fade-up-d2 text-base sm:text-lg text-white/60 max-w-lg leading-relaxed">
        CRM multicanal con inteligencia artificial. WhatsApp, Instagram, Facebook y Email en una sola plataforma.
      </p>

      {/* Channel pills */}
      <div className="fade-up-d3 flex flex-wrap justify-center gap-2">
        {[
          { icon: MessageSquare, label: "WhatsApp", c: "bg-green-500/20 text-green-300" },
          { icon: Instagram, label: "Instagram", c: "bg-pink-500/20 text-pink-300" },
          { icon: Facebook, label: "Facebook", c: "bg-blue-500/20 text-blue-300" },
          { icon: Mail, label: "Email", c: "bg-amber-500/20 text-amber-300" },
        ].map((ch) => (
          <Pill key={ch.label} className={ch.c}>
            <ch.icon className="h-3 w-3" /> {ch.label}
          </Pill>
        ))}
      </div>

      <div className="fade-up-d4 flex flex-col sm:flex-row gap-3 pt-2">
        <Button size="lg" onClick={onNext} className="gap-2 bg-green-500 hover:bg-green-400 text-black font-bold px-8 rounded-full h-12 text-base">
          Ver cómo funciona <ArrowRight className="h-4 w-4" />
        </Button>
        <Link href="/login">
          <Button variant="outline" size="lg" className="rounded-full h-12 border-white/20 text-white hover:bg-white/10 bg-transparent">
            Iniciar Sesión
          </Button>
        </Link>
      </div>

      <p className="text-[10px] text-white/30 pt-2">
        Desliza o usa ← → para navegar
      </p>
    </div>
  );
}

// ─── Slide 2: Pain Points ───────────────────────────────────

function PainSlide() {
  const pains = [
    { emoji: "📱", title: "Mensajes sin responder", desc: "Jugadores que escriben por WhatsApp, Instagram, email... y nadie contesta a tiempo." },
    { emoji: "📊", title: "Datos dispersos", desc: "Excels, libretas, sistemas distintos. Sin visión unificada de tus jugadores." },
    { emoji: "🌧️", title: "Cancelaciones inesperadas", desc: "Sin alertas meteorológicas ni comunicación proactiva cuando cambia el tiempo." },
    { emoji: "📢", title: "Marketing manual", desc: "Horas creando mensajes uno a uno. Sin segmentación, sin métricas, sin IA." },
  ];

  return (
    <div className="flex flex-col items-center text-center gap-6">
      <Pill className="bg-red-500/20 text-red-300 fade-up">
        <Zap className="h-3 w-3" /> El problema
      </Pill>
      <h2 className="fade-up-d1 text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
        ¿Te suena<br className="sm:hidden" /> familiar?
      </h2>
      <div className="fade-up-d2 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl pt-2">
        {pains.map((p) => (
          <GlowCard key={p.title} className="text-left hover:border-red-500/30 transition-colors">
            <div className="text-2xl mb-2">{p.emoji}</div>
            <div className="font-bold text-sm sm:text-base mb-1">{p.title}</div>
            <div className="text-xs sm:text-sm text-white/50 leading-relaxed">{p.desc}</div>
          </GlowCard>
        ))}
      </div>
      <p className="fade-up-d3 text-sm text-white/40 pt-2">
        Caddie 24 resuelve todo esto con una sola herramienta.
      </p>
    </div>
  );
}

// ─── Slide 3: Multichannel ──────────────────────────────────

function MultichannelSlide() {
  const channels = [
    { icon: MessageSquare, name: "WhatsApp", color: "from-green-500 to-green-600", stat: "68% lectura", desc: "API Business oficial" },
    { icon: Instagram, name: "Instagram", color: "from-pink-500 to-purple-600", stat: "Jugadores jóvenes", desc: "DMs y comentarios" },
    { icon: Facebook, name: "Facebook", color: "from-blue-500 to-blue-600", stat: "45% activos", desc: "Messenger directo" },
    { icon: Mail, name: "Email", color: "from-amber-500 to-orange-500", stat: "Docs y facturas", desc: "Newsletters y confirmaciones" },
  ];

  return (
    <div className="flex flex-col items-center text-center gap-6">
      <Pill className="bg-green-500/20 text-green-300 fade-up">
        <MessageSquare className="h-3 w-3" /> Comunicación
      </Pill>
      <h2 className="fade-up-d1 text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
        Todos los canales,<br />
        <span className="text-green-400">una sola bandeja</span>
      </h2>
      <p className="fade-up-d2 text-sm sm:text-base text-white/50 max-w-md">
        Cada jugador elige cómo quiere que le contactes. La IA responde en todos.
      </p>

      <div className="fade-up-d3 grid grid-cols-2 gap-3 w-full max-w-md pt-2">
        {channels.map((ch) => (
          <GlowCard key={ch.name} className="text-left hover:border-white/20 transition-colors">
            <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${ch.color} mb-3`}>
              <ch.icon className="h-5 w-5 text-white" />
            </div>
            <div className="font-bold text-sm">{ch.name}</div>
            <div className="text-[10px] text-white/40 mt-0.5">{ch.desc}</div>
            <div className="text-[10px] font-medium text-green-400 mt-1">{ch.stat}</div>
          </GlowCard>
        ))}
      </div>

      {/* Unified inbox mockup */}
      <GlowCard className="fade-up-d4 w-full max-w-md">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-2 w-2 rounded-full bg-green-400 pulse-soft" />
          <span className="text-xs font-medium text-white/70">Bandeja unificada — 3 nuevos</span>
        </div>
        {[
          { ch: MessageSquare, chColor: "text-green-400", name: "Carlos M.", msg: "Quiero reservar para el sábado", time: "10:32" },
          { ch: Instagram, chColor: "text-pink-400", name: "Ana López", msg: "¿Hay torneos este mes?", time: "10:28" },
          { ch: Mail, chColor: "text-amber-400", name: "Miguel F.", msg: "Envíame la factura del mes", time: "09:45" },
        ].map((m, i) => (
          <div key={i} className="flex items-center gap-3 py-2 border-t border-white/5">
            <m.ch className={`h-4 w-4 ${m.chColor} shrink-0`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium truncate">{m.name}</span>
                <span className="text-[9px] text-white/30 shrink-0">{m.time}</span>
              </div>
              <span className="text-[11px] text-white/40 truncate block">{m.msg}</span>
            </div>
          </div>
        ))}
      </GlowCard>
    </div>
  );
}

// ─── Slide 4: AI ────────────────────────────────────────────

function AiSlide() {
  return (
    <div className="flex flex-col items-center text-center gap-6">
      <Pill className="bg-purple-500/20 text-purple-300 fade-up">
        <Sparkles className="h-3 w-3" /> Inteligencia Artificial
      </Pill>
      <h2 className="fade-up-d1 text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
        Tu caddie virtual<br />
        <span className="text-purple-400">trabaja 24/7</span>
      </h2>
      <p className="fade-up-d2 text-sm sm:text-base text-white/50 max-w-md">
        La IA conoce tu club, tus jugadores, tus horarios y tarifas. Responde como lo haría tu mejor empleado.
      </p>

      {/* Chat mockup */}
      <div className="fade-up-d3 w-full max-w-sm">
        <GlowCard className="!p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">CM</div>
            <div className="flex-1">
              <div className="text-sm font-medium">Carlos Martínez</div>
              <div className="text-[10px] text-green-200 flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-green-300" />
                WhatsApp · Sentimiento: Positivo
              </div>
            </div>
            <Badge className="bg-white/20 text-white text-[8px] border-0">VIP</Badge>
          </div>
          <div className="p-3 space-y-2.5 bg-[#0d1411]">
            {[
              { text: "Hola, quiero reservar green fee para 4 el sábado", dir: "in" },
              { text: "¡Hola Carlos! Tenemos huecos a las 9:00, 9:30 y 10:30. ¿Cuál te viene mejor? 🏌️", dir: "out", ai: true },
              { text: "Las 9:30 perfecto!", dir: "in" },
              { text: "Reservado para 4 personas, sábado 9:30. Os esperamos. ¡Buen juego! ⛳", dir: "out", ai: true },
            ].map((m, i) => (
              <div key={i} className={`flex ${m.dir === "out" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-[11px] sm:text-xs ${
                  m.dir === "out" ? "bg-green-600/30 text-green-100 rounded-br-sm" : "bg-white/10 rounded-bl-sm"
                }`}>
                  {m.ai && (
                    <div className="flex items-center gap-1 mb-0.5 text-[9px] text-green-400 font-medium">
                      <Bot className="h-3 w-3" /> Caddie IA
                    </div>
                  )}
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        </GlowCard>
      </div>

      {/* AI capabilities */}
      <div className="fade-up-d4 grid grid-cols-2 gap-2 w-full max-w-sm">
        {[
          { icon: Bot, text: "Respuestas automáticas" },
          { icon: Shield, text: "Análisis de sentimiento" },
          { icon: Target, text: "Etiquetas inteligentes" },
          { icon: Clock, text: "Horarios de silencio" },
        ].map((f) => (
          <div key={f.text} className="flex items-center gap-2 text-[11px] text-white/50">
            <f.icon className="h-3.5 w-3.5 text-purple-400 shrink-0" />
            {f.text}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Slide 5: Campaigns ─────────────────────────────────────

function CampaignsSlide() {
  return (
    <div className="flex flex-col items-center text-center gap-6">
      <Pill className="bg-blue-500/20 text-blue-300 fade-up">
        <Megaphone className="h-3 w-3" /> Marketing
      </Pill>
      <h2 className="fade-up-d1 text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
        Campañas que<br />
        <span className="text-blue-400">llegan de verdad</span>
      </h2>
      <p className="fade-up-d2 text-sm sm:text-base text-white/50 max-w-md">
        Segmenta, personaliza y envía por el canal preferido de cada jugador. Con métricas en tiempo real.
      </p>

      {/* Campaign mockup */}
      <GlowCard className="fade-up-d3 w-full max-w-md text-left">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-bold text-sm">Torneo de Primavera 2025</div>
            <div className="text-[10px] text-white/40">HCP &lt; 20 · Canal preferido</div>
          </div>
          <Pill className="bg-green-500/20 text-green-300">Completada</Pill>
        </div>

        {/* Channel breakdown bar */}
        <div className="flex h-2 rounded-full overflow-hidden mb-3">
          <div className="bg-green-500 w-[61%]" title="WhatsApp 61%" />
          <div className="bg-amber-500 w-[23%]" title="Email 23%" />
          <div className="bg-pink-500 w-[10%]" title="Instagram 10%" />
          <div className="bg-blue-500 w-[6%]" title="Facebook 6%" />
        </div>
        <div className="flex items-center gap-3 text-[9px] text-white/40 mb-4">
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />WhatsApp 87</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />Email 32</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-pink-500" />Instagram 15</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" />Facebook 8</span>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { v: "142", l: "Enviados" },
            { v: "138", l: "Entregados" },
            { v: "94", l: "Leídos" },
            { v: "23", l: "Respondidos" },
          ].map((m) => (
            <div key={m.l} className="text-center">
              <div className="text-xl sm:text-2xl font-black text-green-400">{m.v}</div>
              <div className="text-[8px] sm:text-[9px] text-white/40">{m.l}</div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex justify-between items-center text-[9px] text-white/40">
          <span>Tasa de lectura</span>
          <span className="font-bold text-green-400">68%</span>
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-1">
          <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: "68%" }} />
        </div>
      </GlowCard>

      <div className="fade-up-d4 flex flex-wrap justify-center gap-2">
        {["A/B Testing", "Programación", "Templates Meta", "Segmentación IA"].map((t) => (
          <Pill key={t} className="bg-white/5 text-white/50"><Zap className="h-2.5 w-2.5 text-blue-400" /> {t}</Pill>
        ))}
      </div>
    </div>
  );
}

// ─── Slide 6: Tournaments ───────────────────────────────────

function TournamentsSlide() {
  const lb = [
    { pos: "🥇", name: "Laura Sánchez", hcp: 8, stb: 38 },
    { pos: "🥈", name: "Carlos Martínez", hcp: 12, stb: 36 },
    { pos: "🥉", name: "Miguel Fernández", hcp: 24, stb: 35 },
    { pos: "4", name: "Ana López", hcp: 18, stb: 33 },
  ];

  return (
    <div className="flex flex-col items-center text-center gap-6">
      <Pill className="bg-yellow-500/20 text-yellow-300 fade-up">
        <Trophy className="h-3 w-3" /> Competición
      </Pill>
      <h2 className="fade-up-d1 text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
        Torneos<br />
        <span className="text-yellow-400">profesionales</span>
      </h2>
      <p className="fade-up-d2 text-sm sm:text-base text-white/50 max-w-md">
        Inscripciones online, leaderboard en vivo, categorías y resultados enviados al canal de cada jugador.
      </p>

      <GlowCard className="fade-up-d3 w-full max-w-sm !p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-600/30 to-amber-600/30 px-4 py-3 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-400" />
          <div>
            <div className="text-sm font-bold">Torneo de Primavera</div>
            <div className="text-[10px] text-white/50">Stableford · 42 inscritos</div>
          </div>
        </div>
        <div className="divide-y divide-white/5">
          {lb.map((p, i) => (
            <div key={i} className={`flex items-center px-4 py-2.5 ${i === 0 ? "bg-yellow-500/5" : ""}`}>
              <span className="w-8 text-sm font-bold">{p.pos}</span>
              <span className="flex-1 text-xs font-medium">{p.name}</span>
              <span className="text-[10px] text-white/30 w-12 text-center">HCP {p.hcp}</span>
              <span className="text-sm font-black text-green-400 w-10 text-right">{p.stb}</span>
            </div>
          ))}
        </div>
      </GlowCard>

      <div className="fade-up-d4 flex flex-wrap justify-center gap-2">
        {["Stableford", "Medal", "Scramble", "Match Play", "Best Ball"].map((f) => (
          <Pill key={f} className="bg-white/5 text-white/40">{f}</Pill>
        ))}
      </div>
    </div>
  );
}

// ─── Slide 7: Weather ───────────────────────────────────────

function WeatherSlide() {
  const days = [
    { day: "Hoy", emoji: "☀️", max: 22, min: 12, wind: 15, rain: 0, score: 92, demand: "Alta", dc: "text-green-400" },
    { day: "Mañana", emoji: "⛅", max: 19, min: 11, wind: 22, rain: 2, score: 74, demand: "Media", dc: "text-yellow-400" },
    { day: "Miércoles", emoji: "🌧️", max: 14, min: 8, wind: 35, rain: 18, score: 28, demand: "Baja", dc: "text-red-400" },
  ];

  return (
    <div className="flex flex-col items-center text-center gap-6">
      <Pill className="bg-cyan-500/20 text-cyan-300 fade-up">
        <CloudSun className="h-3 w-3" /> Meteorología
      </Pill>
      <h2 className="fade-up-d1 text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
        El tiempo, tu<br />
        <span className="text-cyan-400">mejor aliado</span>
      </h2>
      <p className="fade-up-d2 text-sm sm:text-base text-white/50 max-w-md">
        Previsión a 14 días con score golf, alertas de cierre y promos automáticas cuando hace buen tiempo.
      </p>

      <div className="fade-up-d3 flex flex-col sm:flex-row gap-3 w-full max-w-md">
        {days.map((d) => (
          <GlowCard key={d.day} className="flex-1 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">{d.day}</span>
              <span className="text-xl">{d.emoji}</span>
            </div>
            <div className="text-xl font-black mt-1">{d.max}°<span className="text-sm text-white/30">/{d.min}°</span></div>
            <div className="flex items-center gap-2 text-[9px] text-white/30 mt-1">
              <Wind className="h-3 w-3" />{d.wind}km/h
              <Droplets className="h-3 w-3" />{d.rain}mm
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1">
                <div className={`h-1.5 w-1.5 rounded-full ${d.score >= 80 ? "bg-green-400" : d.score >= 50 ? "bg-yellow-400" : "bg-red-400"}`} />
                <span className="text-[10px] font-bold">Score {d.score}</span>
              </div>
              <span className={`text-[9px] font-medium ${d.dc}`}>{d.demand}</span>
            </div>
          </GlowCard>
        ))}
      </div>

      <GlowCard className="fade-up-d4 w-full max-w-md !bg-cyan-500/5 !border-cyan-500/20 text-left">
        <div className="flex items-center gap-2 text-xs">
          <Zap className="h-4 w-4 text-cyan-400" />
          <span className="font-medium text-cyan-300">Automatización activa:</span>
          <span className="text-white/50">Si score &gt; 80 → enviar promo fin de semana</span>
        </div>
      </GlowCard>
    </div>
  );
}

// ─── Slide 8: Results / Social Proof ────────────────────────

function ResultsSlide() {
  return (
    <div className="flex flex-col items-center text-center gap-6">
      <Pill className="bg-green-500/20 text-green-300 fade-up">
        <BarChart3 className="h-3 w-3" /> Resultados
      </Pill>
      <h2 className="fade-up-d1 text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
        Números que<br />
        <span className="text-green-400">hablan solos</span>
      </h2>

      <div className="fade-up-d2 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-lg pt-2">
        <StatBig value="70%" label="Ahorro de tiempo" icon={Clock} />
        <StatBig value="+35%" label="Retención jugadores" icon={TrendingUp} />
        <StatBig value="<2min" label="Tiempo de respuesta" icon={Zap} />
        <StatBig value="68%" label="Tasa de lectura" icon={CheckCircle2} />
      </div>

      {/* Feature summary */}
      <div className="fade-up-d3 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg pt-4">
        {[
          { icon: Users, title: "CRM Completo", desc: "Perfiles, handicap, engagement, historial y etiquetas IA", color: "text-green-400" },
          { icon: MessageSquare, title: "4 Canales + IA", desc: "WhatsApp, Instagram, Facebook, Email con respuestas automáticas", color: "text-blue-400" },
          { icon: CloudSun, title: "Clima + Torneos", desc: "Previsión 14 días, score golf, leaderboards y alertas", color: "text-cyan-400" },
        ].map((f) => (
          <GlowCard key={f.title} className="text-left">
            <f.icon className={`h-5 w-5 ${f.color} mb-2`} />
            <div className="text-xs font-bold mb-1">{f.title}</div>
            <div className="text-[10px] text-white/40 leading-relaxed">{f.desc}</div>
          </GlowCard>
        ))}
      </div>

      <p className="fade-up-d4 text-xs text-white/30 pt-2 max-w-sm">
        Todo integrado en una única plataforma diseñada específicamente para campos de golf.
      </p>
    </div>
  );
}

// ─── Slide 9: CTA ───────────────────────────────────────────

function CtaSlide() {
  const [form, setForm] = useState({ name: "", club: "", email: "", phone: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSent(true);
    } catch {
      const s = encodeURIComponent(`Demo Caddie 24 - ${form.club}`);
      const b = encodeURIComponent(`Nombre: ${form.name}\nClub: ${form.club}\nEmail: ${form.email}\nTeléfono: ${form.phone}`);
      window.open(`mailto:omkagency@gmail.com?subject=${s}&body=${b}`);
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center gap-6">
      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-green-500/10 rounded-full blur-[100px] pointer-events-none" />

      <h2 className="fade-up text-3xl sm:text-4xl lg:text-5xl font-black leading-tight relative">
        ¿Listo para dar el<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">primer golpe</span>?
      </h2>

      <p className="fade-up-d1 text-sm text-white/50 max-w-sm">
        Solicita una demo personalizada. Sin compromiso, te contactamos en menos de 24h.
      </p>

      <div className="fade-up-d2 w-full max-w-sm relative">
        <GlowCard className="!border-green-500/20">
          {sent ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto" />
              <div className="text-lg font-bold">¡Recibido!</div>
              <p className="text-sm text-white/50">Nos pondremos en contacto contigo pronto.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3 text-left">
              <div>
                <Label htmlFor="n" className="text-xs text-white/50">Nombre</Label>
                <Input id="n" placeholder="Tu nombre" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required disabled={sending}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-green-500/50 h-10" />
              </div>
              <div>
                <Label htmlFor="c" className="text-xs text-white/50">Club de Golf</Label>
                <Input id="c" placeholder="Nombre de tu club" value={form.club} onChange={(e) => setForm((p) => ({ ...p, club: e.target.value }))} required disabled={sending}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-green-500/50 h-10" />
              </div>
              <div>
                <Label htmlFor="e" className="text-xs text-white/50">Email</Label>
                <Input id="e" type="email" placeholder="tu@email.com" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required disabled={sending}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-green-500/50 h-10" />
              </div>
              <div>
                <Label htmlFor="p" className="text-xs text-white/50">Teléfono <span className="text-white/20">(opcional)</span></Label>
                <Input id="p" type="tel" placeholder="+34 600 000 000" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} disabled={sending}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-green-500/50 h-10" />
              </div>
              <Button type="submit" disabled={sending} className="w-full gap-2 bg-green-500 hover:bg-green-400 text-black font-bold h-11 rounded-xl text-sm">
                {sending ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</> : <>Solicitar Demo <Send className="h-4 w-4" /></>}
              </Button>
              <p className="text-[9px] text-white/25 text-center pt-1">
                Sin compromiso. Tus datos están seguros.
              </p>
            </form>
          )}
        </GlowCard>
      </div>
    </div>
  );
}
