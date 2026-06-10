# ⛳ Caddie 24 — CRM para campos de golf

CRM de marketing y comunicación para campos de golf con **WhatsApp Business + IA**.
Centraliza jugadores, conversaciones, campañas segmentadas, torneos y previsión
meteorológica de ocupación en una sola herramienta.

**Demo:** https://caddie-24.vercel.app

## Funcionalidades

- **Bandeja de entrada omnicanal:** WhatsApp (Meta Cloud API), **Telegram**, **Instagram DM**,
  **Facebook Messenger** y **email** en una sola bandeja, con respuestas IA en 4 niveles de
  automatización (manual → asistido → semiautomático → total), reglas de escalado y horarios
  de silencio. La IA responde con datos reales: disponibilidad de salidas, estado del campo
  y torneos abiertos.
- **Reservas (tee sheet):** hoja de salidas diaria con capacidad por slot, creación y
  cancelación, y recordatorios automáticos la víspera por el mejor canal de cada jugador.
- **Estado del campo:** parte diario (buggies, carros, greens, hoyos cerrados) que alimenta
  a la IA y se muestra en Reservas.
- **Jugadores (CRM):** fichas con hándicap, licencia federativa, idioma, etiquetas IA,
  visitas, consumos y engagement. Importación/exportación CSV.
- **Socios:** membresías (tipo, cuota, periodicidad, renovación, estado), filtro
  socios/visitantes y recordatorio automático de renovación.
- **Bonos:** venta y consumo de bonos de green fees/clases con control de usos y caducidad.
- **Campañas multicanal:** WhatsApp (plantilla aprobada), Telegram o email; segmentación por
  engagement/idioma/hándicap/etiquetas/torneos/socios; envío inmediato o programado; métricas.
- **Journeys automáticos:** cumpleaños, winback de inactivos, renovación de socios, encuesta
  post-visita y bienvenida — configurables y con control antiduplicados.
- **Torneos:** inscripciones, categorías, lista de espera, **horarios de salida generados y
  enviados a cada jugador**, resultados con notificación personal y leaderboard.
- **Portal del jugador:** enlace mágico (sin contraseña) donde el jugador ve sus reservas
  (y puede cancelarlas), torneos, bonos, resultados y gestiona su consentimiento RGPD.
- **RGPD:** baja automática respondiendo BAJA/STOP en cualquier canal (alta con ALTA);
  exclusión en todas las campañas y journeys.
- **Meteorología:** previsión Open-Meteo, score de jugabilidad, predicción de ocupación.
- **Equipo:** usuarios con roles (Administrador / Manager / Agente).
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

## Canales

- **Telegram:** crea un bot con @BotFather, pega el token en Configuración → Canales y
  pulsa "Conectar bot" (el webhook se registra solo). Ideal para probar todo el flujo.
- **Instagram/Messenger:** app de Meta con productos Messenger e Instagram; webhook a
  `/api/webhook/meta` con el verify token definido en Configuración → Canales.
- **Email (salida):** API key de [Resend](https://resend.com) + remitente verificado.

## Crons (Vercel)

| Endpoint | Horario | Función |
|---|---|---|
| `/api/cron/check-unanswered` | 9:00 diario | Avisa de conversaciones sin responder |
| `/api/cron/daily` | 7:00 diario | Campañas programadas + journeys + recordatorios de reserva |

Todo lo del cron diario es idempotente y también se dispara al abrir el dashboard,
por lo que las automatizaciones funcionan aunque el cron falle. Define `CRON_SECRET`
para proteger los endpoints.

## Despliegue

En Vercel, el build ejecuta `prisma db push` para sincronizar el esquema con la base
de datos (requiere `DATABASE_URL` y `DIRECT_URL` en las variables de entorno del
proyecto). Los cambios de esquema de este repo son aditivos.

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run db:migrate` | Migraciones (desarrollo) |
| `npm run db:push` | Sincroniza esquema sin migración |
| `npm run db:seed` | Datos de ejemplo |
| `npm run db:studio` | Prisma Studio |
