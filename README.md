# ⛳ Caddie 24 — CRM para campos de golf

CRM de marketing y comunicación para campos de golf con **WhatsApp Business + IA**.
Centraliza jugadores, conversaciones, campañas segmentadas, torneos y previsión
meteorológica de ocupación en una sola herramienta.

**Demo:** https://caddie-24.vercel.app

## Funcionalidades

- **Jugadores (CRM):** fichas con hándicap, idioma, preferencias de juego, etiquetas IA,
  visitas, consumos y nivel de engagement. Importación/exportación CSV.
- **Bandeja de entrada WhatsApp:** conversaciones en tiempo real vía Meta Cloud API, con
  respuestas IA en 4 niveles de automatización (manual → asistido → semiautomático → total),
  reglas de escalado y horarios de silencio.
- **Campañas segmentadas:** plantillas de WhatsApp aprobadas por Meta, segmentación por
  engagement/idioma/hándicap/etiquetas/torneos, envío inmediato o programado, métricas de
  entrega y lectura.
- **RGPD:** baja automática de comunicaciones cuando el jugador responde BAJA/STOP
  (y alta con ALTA); exclusión automática en todas las campañas; gestión manual desde la ficha.
- **Torneos:** inscripciones, categorías, lista de espera, resultados y leaderboard.
- **Meteorología:** previsión Open-Meteo, score de jugabilidad, predicción de ocupación e
  ingresos, registro diario real vs. predicho y automatizaciones.
- **Equipo:** usuarios con roles (Administrador / Manager / Agente), activación y contraseñas
  gestionadas desde Configuración → Equipo.
- **Modo demo:** datos ficticios para enseñar el producto sin tocar datos reales.

## Stack

Next.js 14 (App Router) · TypeScript · Prisma + PostgreSQL · NextAuth v5 ·
Tailwind + shadcn/ui · OpenAI (gpt-4o-mini) · Meta WhatsApp Cloud API · Vercel

## Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar entorno
cp .env.example .env   # rellena DATABASE_URL, AUTH_SECRET, OPENAI_API_KEY...

# 3. Base de datos
npm run db:migrate     # aplica migraciones
npm run db:seed        # usuarios y datos de ejemplo

# 4. Desarrollo
npm run dev
```

Usuarios del seed: `admin@caddie24.com / admin123` · `manager@caddie24.com / manager123` ·
`agent@caddie24.com / agent123`. **Cambia las contraseñas en producción** desde
Configuración → Equipo.

## Configurar WhatsApp Business

1. Crea una app en [Meta for Developers](https://developers.facebook.com/) con el producto WhatsApp.
2. En **Configuración → WhatsApp** del CRM introduce: Phone Number ID, Business Account ID,
   Access Token (permanente) y un Verify Token que tú elijas.
3. En Meta, configura el webhook apuntando a `https://tu-dominio/api/webhook/whatsapp`
   con ese mismo Verify Token y suscríbete al campo `messages`.
4. Usa el botón **Probar conexión** del CRM para verificar.

Las plantillas de campaña deben estar aprobadas en Meta con el mismo nombre que en
la sección Templates.

## Crons (Vercel)

| Endpoint | Horario | Función |
|---|---|---|
| `/api/cron/check-unanswered` | 9:00 diario | Avisa de conversaciones sin responder |
| `/api/cron/send-scheduled` | 8:00 diario | Envía campañas programadas vencidas |

Las campañas programadas también se despachan automáticamente al abrir la sección
Campañas, por lo que no dependen únicamente del cron. Define `CRON_SECRET` para
proteger ambos endpoints.

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run db:migrate` | Migraciones (desarrollo) |
| `npm run db:push` | Sincroniza esquema sin migración |
| `npm run db:seed` | Datos de ejemplo |
| `npm run db:studio` | Prisma Studio |
