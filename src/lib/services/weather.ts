// ============================================================
// WEATHER SERVICE — Open-Meteo API + Golf Score + Demand Engine
// ============================================================

export interface WeatherDay {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitationSum: number;
  windspeedMax: number;
  weatherCode: number;
  sunrise: string;
  sunset: string;
  // computed
  weatherLabel: string;
  weatherEmoji: string;
  golfScore: number;
  demandLevel: "MUY_ALTA" | "ALTA" | "MEDIA" | "BAJA" | "MUY_BAJA" | "CIERRE";
  daylightHours: number;
}

export interface WeatherHour {
  time: string;
  temperature: number;
  precipitation: number;
  windspeed: number;
  cloudcover: number;
  weatherCode: number;
  isOptimal: boolean;
}

export interface DemandPrediction {
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
  seasonMultiplier: number;
}

export interface WeatherAlert {
  id: string;
  type: "OPORTUNIDAD" | "SOBREDEMANDA" | "CRITICO" | "VENTANA_DORADA" | "TEMPORADA" | "INFO";
  level: "info" | "warning" | "opportunity" | "critical";
  title: string;
  description: string;
  date: string;
  daysAhead: number;
  actionLabel?: string;
  actionType?: string;
  dismissed: boolean;
}

// WMO Weather Code mappings
const WEATHER_CODES: Record<number, { label: string; emoji: string; golfPenalty: number }> = {
  0: { label: "Cielo despejado", emoji: "☀️", golfPenalty: 0 },
  1: { label: "Parcialmente nublado", emoji: "⛅", golfPenalty: 2 },
  2: { label: "Parcialmente nublado", emoji: "⛅", golfPenalty: 5 },
  3: { label: "Cubierto", emoji: "☁️", golfPenalty: 10 },
  45: { label: "Niebla", emoji: "🌫️", golfPenalty: 20 },
  48: { label: "Niebla helada", emoji: "🌫️", golfPenalty: 30 },
  51: { label: "Llovizna ligera", emoji: "🌧️", golfPenalty: 25 },
  53: { label: "Llovizna moderada", emoji: "🌧️", golfPenalty: 35 },
  55: { label: "Llovizna intensa", emoji: "🌧️", golfPenalty: 45 },
  61: { label: "Lluvia ligera", emoji: "🌧️", golfPenalty: 40 },
  63: { label: "Lluvia moderada", emoji: "🌧️", golfPenalty: 55 },
  65: { label: "Lluvia intensa", emoji: "🌧️", golfPenalty: 75 },
  71: { label: "Nieve ligera", emoji: "❄️", golfPenalty: 70 },
  73: { label: "Nieve moderada", emoji: "❄️", golfPenalty: 85 },
  75: { label: "Nieve intensa", emoji: "❄️", golfPenalty: 95 },
  80: { label: "Chubascos ligeros", emoji: "🌦️", golfPenalty: 35 },
  81: { label: "Chubascos moderados", emoji: "🌦️", golfPenalty: 50 },
  82: { label: "Chubascos fuertes", emoji: "🌦️", golfPenalty: 65 },
  95: { label: "Tormenta", emoji: "⛈️", golfPenalty: 90 },
  96: { label: "Tormenta con granizo", emoji: "⛈️", golfPenalty: 95 },
  99: { label: "Tormenta con granizo fuerte", emoji: "⛈️", golfPenalty: 100 },
};

function getWeatherInfo(code: number) {
  return WEATHER_CODES[code] || { label: "Desconocido", emoji: "❓", golfPenalty: 15 };
}

// ============================================================
// GOLF SCORE CALCULATOR (0-100)
// ============================================================

export function calculateGolfScore(day: {
  temperatureMax: number;
  temperatureMin: number;
  precipitationSum: number;
  windspeedMax: number;
  weatherCode: number;
  daylightHours: number;
}): number {
  let score = 100;

  // Temperature penalty (ideal: 15-25°C based on max temp)
  const avgTemp = (day.temperatureMax + day.temperatureMin) / 2;
  if (avgTemp >= 15 && avgTemp <= 25) {
    // Ideal range — no penalty
  } else if (avgTemp < 15) {
    const diff = 15 - avgTemp;
    score -= diff * 2.5; // -2.5 per degree below 15
  } else {
    const diff = avgTemp - 25;
    score -= diff * 3; // -3 per degree above 25
  }

  // Cold extreme penalty
  if (day.temperatureMin < 2) score -= 15;
  else if (day.temperatureMin < 5) score -= 8;

  // Heat extreme penalty
  if (day.temperatureMax > 38) score -= 20;
  else if (day.temperatureMax > 35) score -= 10;

  // Wind penalty
  if (day.windspeedMax > 50) score -= 35;
  else if (day.windspeedMax > 40) score -= 25;
  else if (day.windspeedMax > 30) score -= 15;
  else if (day.windspeedMax > 20) score -= 5;

  // Precipitation penalty
  if (day.precipitationSum > 10) score -= 40;
  else if (day.precipitationSum > 5) score -= 25;
  else if (day.precipitationSum > 2) score -= 15;
  else if (day.precipitationSum > 0.5) score -= 5;

  // Weather code penalty
  const weatherInfo = getWeatherInfo(day.weatherCode);
  score -= weatherInfo.golfPenalty * 0.3; // Weighted to avoid double-counting

  // Daylight bonus (ideal ~14h)
  if (day.daylightHours >= 13) score += 3;
  else if (day.daylightHours < 9) score -= 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function getDemandLevel(golfScore: number): WeatherDay["demandLevel"] {
  if (golfScore >= 85) return "MUY_ALTA";
  if (golfScore >= 70) return "ALTA";
  if (golfScore >= 50) return "MEDIA";
  if (golfScore >= 30) return "BAJA";
  if (golfScore >= 15) return "MUY_BAJA";
  return "CIERRE";
}

// ============================================================
// OPEN-METEO API CLIENT
// ============================================================

export async function fetchWeatherForecast(
  lat: number,
  lon: number,
  days: number = 14
): Promise<{ daily: WeatherDay[]; hourly: WeatherHour[] }> {
  const url =
    `https://api.open-meteo.com/v1/forecast?` +
    `latitude=${lat}&longitude=${lon}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,` +
    `windspeed_10m_max,weathercode,sunrise,sunset` +
    `&hourly=temperature_2m,precipitation,windspeed_10m,cloudcover,weathercode` +
    `&forecast_days=${days}` +
    `&timezone=Europe%2FMadrid`;

  const response = await fetch(url, { next: { revalidate: 1800 } }); // cache 30 min
  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.status}`);
  }
  const data = await response.json();

  // Parse daily data
  const daily: WeatherDay[] = data.daily.time.map((date: string, i: number) => {
    const sunrise = data.daily.sunrise[i];
    const sunset = data.daily.sunset[i];
    const sunriseDate = new Date(sunrise);
    const sunsetDate = new Date(sunset);
    const daylightHours = (sunsetDate.getTime() - sunriseDate.getTime()) / (1000 * 60 * 60);

    const dayData = {
      temperatureMax: data.daily.temperature_2m_max[i],
      temperatureMin: data.daily.temperature_2m_min[i],
      precipitationSum: data.daily.precipitation_sum[i],
      windspeedMax: data.daily.windspeed_10m_max[i],
      weatherCode: data.daily.weathercode[i],
      daylightHours,
    };

    const golfScore = calculateGolfScore(dayData);
    const weatherInfo = getWeatherInfo(dayData.weatherCode);

    return {
      date,
      ...dayData,
      sunrise: sunrise.split("T")[1] || sunrise,
      sunset: sunset.split("T")[1] || sunset,
      weatherLabel: weatherInfo.label,
      weatherEmoji: weatherInfo.emoji,
      golfScore,
      demandLevel: getDemandLevel(golfScore),
      daylightHours: Math.round(daylightHours * 10) / 10,
    };
  });

  // Parse hourly data
  const hourly: WeatherHour[] = data.hourly.time.map((time: string, i: number) => {
    const hour = new Date(time).getHours();
    const temp = data.hourly.temperature_2m[i];
    const precip = data.hourly.precipitation[i];
    const wind = data.hourly.windspeed_10m[i];
    const isOptimal =
      hour >= 7 &&
      hour <= 19 &&
      temp >= 12 &&
      temp <= 30 &&
      precip < 0.5 &&
      wind < 30;

    return {
      time,
      temperature: temp,
      precipitation: precip,
      windspeed: wind,
      cloudcover: data.hourly.cloudcover[i],
      weatherCode: data.hourly.weathercode[i],
      isOptimal,
    };
  });

  return { daily, hourly };
}

// ============================================================
// DEMAND PREDICTION ENGINE
// ============================================================

// Spanish national holidays + Castilla y León
const DEFAULT_HOLIDAYS_2026 = [
  { date: "2026-01-01", name: "Año Nuevo" },
  { date: "2026-01-06", name: "Reyes Magos" },
  { date: "2026-04-02", name: "Jueves Santo" },
  { date: "2026-04-03", name: "Viernes Santo" },
  { date: "2026-04-23", name: "Día de Castilla y León" },
  { date: "2026-05-01", name: "Día del Trabajador" },
  { date: "2026-06-15", name: "Corpus Christi (CyL)" },
  { date: "2026-08-15", name: "Asunción de la Virgen" },
  { date: "2026-10-12", name: "Día de la Hispanidad" },
  { date: "2026-11-01", name: "Todos los Santos" },
  { date: "2026-12-06", name: "Día de la Constitución" },
  { date: "2026-12-08", name: "Inmaculada Concepción" },
  { date: "2026-12-25", name: "Navidad" },
];

const DEFAULT_SEASON_CONFIG = {
  high: ["04", "05", "06", "07", "08", "09", "10"],
  medium: ["03", "11"],
  low: ["12", "01", "02"],
};

const DEFAULT_SEASON_MULTIPLIERS = { high: 1.2, medium: 1.0, low: 0.7 };

interface FieldConfig {
  capacity: number;
  rateWeekday: number;
  rateWeekend: number;
  rateHoliday: number;
  customHolidays: Array<{ date: string; name: string }>;
  seasonConfig: typeof DEFAULT_SEASON_CONFIG;
  seasonMultipliers: typeof DEFAULT_SEASON_MULTIPLIERS;
  rainClosureThreshold: number;
  windClosureThreshold: number;
}

function isWeekend(dateStr: string): boolean {
  const d = new Date(dateStr);
  return d.getDay() === 0 || d.getDay() === 6;
}

function isHoliday(dateStr: string, holidays: Array<{ date: string }>): boolean {
  return holidays.some((h) => h.date === dateStr);
}

function isBridgeDay(dateStr: string, holidays: Array<{ date: string }>): boolean {
  const d = new Date(dateStr);
  const dow = d.getDay();
  // Monday between Sunday holiday and...
  // Friday between Thursday holiday and weekend
  const prevDay = new Date(d);
  prevDay.setDate(prevDay.getDate() - 1);
  const nextDay = new Date(d);
  nextDay.setDate(nextDay.getDate() + 1);
  const prevStr = prevDay.toISOString().split("T")[0];
  const nextStr = nextDay.toISOString().split("T")[0];

  if (dow === 1 && isHoliday(nextStr, holidays)) return false; // not bridge if Tuesday is holiday
  if (dow === 5 && isHoliday(prevStr, holidays)) return true; // Friday after Thursday holiday
  if (dow === 1 && isHoliday(prevStr, holidays)) return false;
  // Check if day is between two non-working days
  const prevIsOff = isHoliday(prevStr, holidays) || [0, 6].includes(prevDay.getDay());
  const nextIsOff = isHoliday(nextStr, holidays) || [0, 6].includes(nextDay.getDay());
  if (prevIsOff && nextIsOff && !isWeekend(dateStr) && !isHoliday(dateStr, holidays)) return true;
  return false;
}

function getSeasonForMonth(
  month: string,
  config: typeof DEFAULT_SEASON_CONFIG
): "high" | "medium" | "low" {
  if (config.high.includes(month)) return "high";
  if (config.medium.includes(month)) return "medium";
  return "low";
}

export function predictDemand(
  weatherDays: WeatherDay[],
  config: FieldConfig,
  tournamentDates: string[] = []
): DemandPrediction[] {
  const allHolidays = [
    ...DEFAULT_HOLIDAYS_2026,
    ...(config.customHolidays || []),
  ];

  return weatherDays.map((day, idx) => {
    const dateStr = day.date;
    const weekend = isWeekend(dateStr);
    const holiday = isHoliday(dateStr, allHolidays);
    const bridge = isBridgeDay(dateStr, allHolidays);
    const hasTournament = tournamentDates.includes(dateStr);
    const month = dateStr.substring(5, 7);
    const season = getSeasonForMonth(month, config.seasonConfig || DEFAULT_SEASON_CONFIG);
    const multipliers = config.seasonMultipliers || DEFAULT_SEASON_MULTIPLIERS;
    const seasonMult = multipliers[season];

    // === WEATHER SCORE (40%) ===
    let weatherScore = day.golfScore;

    // Trend: look at surrounding days
    const prevDays = weatherDays.slice(Math.max(0, idx - 3), idx);
    const nextDays = weatherDays.slice(idx + 1, Math.min(weatherDays.length, idx + 4));
    const avgPrevRain = prevDays.length > 0
      ? prevDays.reduce((s, d) => s + d.precipitationSum, 0) / prevDays.length
      : 0;

    // Waterlogged field penalty (rain in last 3 days)
    if (avgPrevRain > 5) weatherScore -= 10;
    else if (avgPrevRain > 2) weatherScore -= 5;

    // Contrast bonus (good day after bad days)
    if (prevDays.length > 0) {
      const avgPrevScore = prevDays.reduce((s, d) => s + d.golfScore, 0) / prevDays.length;
      if (weatherScore > avgPrevScore + 20) weatherScore += 5; // bounce-back
    }

    weatherScore = Math.max(0, Math.min(100, weatherScore));

    // === CALENDAR SCORE (35%) ===
    let calendarScore = 50; // base weekday
    if (weekend) calendarScore = 70;
    if (holiday) calendarScore = 75;
    if (bridge) calendarScore = 80;

    // Special periods
    const monthNum = parseInt(month);
    // Semana Santa (approx early April)
    if (month === "04" && parseInt(dateStr.substring(8, 10)) <= 10) calendarScore += 10;
    // August
    if (month === "08") calendarScore += 8;
    // Christmas period
    if ((month === "12" && parseInt(dateStr.substring(8, 10)) >= 20) ||
        (month === "01" && parseInt(dateStr.substring(8, 10)) <= 6)) calendarScore += 5;

    // Tournament redistribution
    if (hasTournament) calendarScore += 10;

    calendarScore = Math.min(100, calendarScore);

    // === HISTORICAL SCORE (25%) — simulated ===
    // Use season + day type as proxy for historical behavior
    let historicalScore = 50;
    if (season === "high") historicalScore = 70;
    else if (season === "medium") historicalScore = 50;
    else historicalScore = 35;
    if (weekend) historicalScore += 15;

    historicalScore = Math.min(100, historicalScore);

    // === COMBINED SCORE ===
    const combinedScore = Math.round(
      weatherScore * 0.4 + calendarScore * 0.35 + historicalScore * 0.25
    );

    // Apply season multiplier
    const adjustedScore = Math.min(100, Math.round(combinedScore * seasonMult));

    // Closure check
    const isClosure =
      day.precipitationSum >= config.rainClosureThreshold ||
      day.windspeedMax >= config.windClosureThreshold ||
      day.golfScore < 15;

    // Calculate outputs
    const ocupacionPct = isClosure ? 0 : Math.min(100, Math.round(adjustedScore * 1.05));
    const reservasEsperadas = isClosure
      ? 0
      : Math.round((config.capacity * ocupacionPct) / 100);

    const rate = holiday
      ? config.rateHoliday
      : weekend
      ? config.rateWeekend
      : config.rateWeekday;
    const revenueEstimado = Math.round(reservasEsperadas * rate);

    const confianza = idx < 3 ? 90 : idx < 7 ? 80 : idx < 10 ? 65 : 50;

    // Determine demand label
    let demandaPredecida: string;
    if (isClosure) demandaPredecida = "Cierre recomendado";
    else if (ocupacionPct >= 85) demandaPredecida = "Muy Alta";
    else if (ocupacionPct >= 65) demandaPredecida = "Alta";
    else if (ocupacionPct >= 40) demandaPredecida = "Media";
    else if (ocupacionPct >= 20) demandaPredecida = "Baja";
    else demandaPredecida = "Muy Baja";

    // Determine main factor
    const factors: string[] = [];
    if (weekend) factors.push("Fin de semana");
    if (holiday) factors.push("Festivo");
    if (bridge) factors.push("Puente");
    if (hasTournament) factors.push("Torneo programado");
    if (day.golfScore >= 80) factors.push("Tiempo excelente");
    else if (day.golfScore >= 60) factors.push("Buen tiempo");
    else if (day.golfScore < 30) factors.push("Mal tiempo");
    if (season === "high") factors.push("Temporada alta");
    if (avgPrevRain > 5) factors.push("Campo encharcado");

    const factorPrincipal =
      factors.length > 0 ? factors.slice(0, 2).join(" + ") : "Día laboral estándar";

    // Alerts
    const alertas: string[] = [];
    const accionesRecomendadas: string[] = [];

    if (day.golfScore > 75 && ocupacionPct < 40 && idx >= 3 && idx <= 5) {
      alertas.push("Oportunidad: buen tiempo con baja ocupación esperada");
      accionesRecomendadas.push("Lanzar campaña last-minute");
    }
    if (ocupacionPct > 90 && weekend) {
      alertas.push("Capacidad casi al límite");
      accionesRecomendadas.push("Activar lista de espera VIP");
    }
    if (day.precipitationSum > 10 && idx <= 1) {
      alertas.push("Lluvia intensa inminente — posibles cancelaciones");
      accionesRecomendadas.push("Enviar comunicación proactiva");
    }
    if (isClosure) {
      alertas.push("Cierre operativo recomendado");
      accionesRecomendadas.push("Notificar a jugadores con reserva");
    }

    return {
      fecha: dateStr,
      golfScore: day.golfScore,
      demandaPredecida,
      ocupacionEstimada: `${ocupacionPct}%`,
      reservasEsperadas,
      revenueEstimado,
      confianza: `${confianza}%`,
      factorPrincipal,
      alertas,
      accionesRecomendadas,
      isWeekend: weekend,
      isHoliday: holiday,
      hasTournament,
      seasonMultiplier: seasonMult,
    };
  });
}

// ============================================================
// ALERT GENERATOR
// ============================================================

export function generateAlerts(
  weatherDays: WeatherDay[],
  predictions: DemandPrediction[],
  config: FieldConfig
): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const today = new Date().toISOString().split("T")[0];

  predictions.forEach((pred, idx) => {
    const day = weatherDays[idx];
    if (!day) return;
    const daysAhead = Math.round(
      (new Date(pred.fecha).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24)
    );

    // OPORTUNIDAD: buen tiempo + baja ocupación + 3-5 días
    const ocupacion = parseInt(pred.ocupacionEstimada);
    if (day.golfScore > 75 && ocupacion < 40 && daysAhead >= 3 && daysAhead <= 5) {
      alerts.push({
        id: `opp-${pred.fecha}`,
        type: "OPORTUNIDAD",
        level: "opportunity",
        title: `Oportunidad: ${getDayLabel(pred.fecha)} perfecto con solo ${ocupacion}% de ocupación`,
        description: `Golf Score ${day.golfScore}, ${day.weatherLabel}. Ideal para campaña last-minute.`,
        date: pred.fecha,
        daysAhead,
        actionLabel: "Crear Campaña",
        actionType: "campaign",
        dismissed: false,
      });
    }

    // SOBREDEMANDA: fin de semana + buen tiempo + alta ocupación
    if (pred.isWeekend && day.golfScore > 80 && ocupacion > 90) {
      alerts.push({
        id: `over-${pred.fecha}`,
        type: "SOBREDEMANDA",
        level: "warning",
        title: `${getDayLabel(pred.fecha)} casi completo — activa lista de espera VIP`,
        description: `Ocupación estimada ${ocupacion}% con Golf Score ${day.golfScore}.`,
        date: pred.fecha,
        daysAhead,
        actionLabel: "Notificar VIPs",
        actionType: "vip_notify",
        dismissed: false,
      });
    }

    // CRITICO: lluvia/viento severo en <24h
    if (
      (day.precipitationSum > 10 || day.windspeedMax > 50) &&
      daysAhead <= 1 &&
      daysAhead >= 0
    ) {
      alerts.push({
        id: `crit-${pred.fecha}`,
        type: "CRITICO",
        level: "critical",
        title: `Condiciones adversas ${daysAhead === 0 ? "hoy" : "mañana"} — prepara comunicación`,
        description: `Precipitación: ${day.precipitationSum}mm, Viento: ${day.windspeedMax}km/h.`,
        date: pred.fecha,
        daysAhead,
        actionLabel: "Enviar Aviso",
        actionType: "weather_warning",
        dismissed: false,
      });
    }
  });

  // VENTANA DORADA: 3+ días consecutivos con Golf Score > 85
  for (let i = 0; i <= weatherDays.length - 3; i++) {
    const streak = [];
    let j = i;
    while (j < weatherDays.length && weatherDays[j].golfScore > 85) {
      streak.push(weatherDays[j]);
      j++;
    }
    if (streak.length >= 3) {
      const daysAhead = Math.round(
        (new Date(streak[0].date).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysAhead > 2) {
        alerts.push({
          id: `golden-${streak[0].date}`,
          type: "VENTANA_DORADA",
          level: "opportunity",
          title: `Semana perfecta en ${daysAhead} días — ideal para torneo express`,
          description: `${streak.length} días consecutivos con Golf Score >85. Del ${streak[0].date} al ${streak[streak.length - 1].date}.`,
          date: streak[0].date,
          daysAhead,
          actionLabel: "Crear Torneo Flash",
          actionType: "tournament",
          dismissed: false,
        });
      }
      break; // only report first golden window
    }
  }

  // TEMPORADA: primer día > 20°C
  const warmDay = weatherDays.find(
    (d) => d.temperatureMax > 20 && new Date(d.date).getMonth() >= 2 && new Date(d.date).getMonth() <= 4
  );
  if (warmDay) {
    const daysAhead = Math.round(
      (new Date(warmDay.date).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysAhead >= 0 && daysAhead <= 7) {
      alerts.push({
        id: `season-${warmDay.date}`,
        type: "TEMPORADA",
        level: "info",
        title: "Inicio de temporada alta detectado",
        description: `${warmDay.temperatureMax}°C el ${warmDay.date}. Ideal para campaña de bienvenida.`,
        date: warmDay.date,
        daysAhead,
        actionLabel: "Campaña Bienvenida",
        actionType: "campaign",
        dismissed: false,
      });
    }
  }

  return alerts.sort((a, b) => {
    const levelOrder = { critical: 0, warning: 1, opportunity: 2, info: 3 };
    return levelOrder[a.level] - levelOrder[b.level] || a.daysAhead - b.daysAhead;
  });
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  return days[d.getDay()];
}

// ============================================================
// DEFAULT AUTOMATIONS
// ============================================================

export const DEFAULT_AUTOMATIONS = [
  {
    id: "fin_de_semana_perfecto",
    name: "Fin de semana perfecto",
    emoji: "☀️",
    enabled: true,
    trigger: "Sáb/Dom + Golf Score >80 + 4 días antes",
    audience: "Premium + Standard no reservados",
    channel: "WhatsApp + Email",
    preview: "Este sábado el campo estará perfecto. Temperatura 22°C, sin viento. Quedan 8 plazas...",
    stats: { sent: 12, openRate: 78, bookings: 8, revenue: 520 },
  },
  {
    id: "recuperacion_post_lluvia",
    name: "Recuperación post-lluvia",
    emoji: "🌧️",
    enabled: true,
    trigger: "2 días lluvia + próximos 3 días despejados",
    audience: "VIP + Competidor Activo",
    channel: "WhatsApp",
    preview: "El campo se habrá recuperado perfectamente. El jueves el green estará en condiciones óptimas.",
    stats: { sent: 6, openRate: 85, bookings: 5, revenue: 375 },
  },
  {
    id: "puente_con_sol",
    name: "Puente con sol",
    emoji: "🎉",
    enabled: true,
    trigger: "Festivo + día anterior/posterior + Golf Score >70",
    audience: "Toda la base",
    channel: "Email + WhatsApp",
    preview: "Aprovecha el puente en el campo. Condiciones inmejorables para disfrutar del golf.",
    stats: { sent: 3, openRate: 65, bookings: 15, revenue: 1125 },
  },
  {
    id: "dia_invierno_indoor",
    name: "Día de invierno — oferta indoor",
    emoji: "❄️",
    enabled: false,
    trigger: "Temperatura <8°C o lluvia intensa",
    audience: "Jugadores con reserva activa ese día",
    channel: "WhatsApp",
    preview: "Hoy el campo no está en las mejores condiciones. Te ofrecemos acceso gratuito al simulador.",
    stats: { sent: 8, openRate: 92, bookings: 3, revenue: 0 },
  },
];

// ============================================================
// DEMO HISTORICAL DATA (6 months)
// ============================================================

export function generateHistoricalData(): Array<{
  date: string;
  golfScore: number;
  occupancy: number;
  revenue: number;
  weatherCategory: string;
  isWeekend: boolean;
}> {
  const data: Array<{
    date: string;
    golfScore: number;
    occupancy: number;
    revenue: number;
    weatherCategory: string;
    isWeekend: boolean;
  }> = [];

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);
  startDate.setHours(0, 0, 0, 0);

  // Simple seeded random
  let seed = 42;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < 180; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const month = d.getMonth();
    const weekend = d.getDay() === 0 || d.getDay() === 6;

    // Season-based golf score
    let baseScore: number;
    if (month >= 3 && month <= 9) baseScore = 65 + rand() * 30; // Apr-Oct
    else if (month === 2 || month === 10) baseScore = 45 + rand() * 35; // Mar, Nov
    else baseScore = 25 + rand() * 40; // Dec-Feb

    // Some bad weather days
    if (rand() < 0.15) baseScore = Math.max(10, baseScore - 30 - rand() * 20);

    const golfScore = Math.round(baseScore);

    // Occupancy correlates with golf score and weekend
    let baseOccupancy = golfScore * 0.85 + rand() * 15;
    if (weekend) baseOccupancy += 15;
    if (month >= 3 && month <= 9) baseOccupancy += 5;
    baseOccupancy = Math.max(5, Math.min(100, baseOccupancy));
    const occupancy = Math.round(baseOccupancy);

    const rate = weekend ? 65 : 45;
    const bookings = Math.round((80 * occupancy) / 100);
    const revenue = bookings * rate;

    let weatherCategory: string;
    if (golfScore >= 75) weatherCategory = "Soleado";
    else if (golfScore >= 55) weatherCategory = "Nublado";
    else if (golfScore >= 30) weatherCategory = "Lluvia";
    else weatherCategory = "Viento/Tormenta";

    data.push({ date: dateStr, golfScore, occupancy, revenue, weatherCategory, isWeekend: weekend });
  }

  return data;
}

// ============================================================
// HISTORICAL WEATHER — Open-Meteo Archive API
// ============================================================

export async function fetchHistoricalWeather(
  lat: number,
  lon: number,
  startDate: string,
  endDate: string
): Promise<WeatherDay[]> {
  const url =
    `https://archive-api.open-meteo.com/v1/archive?` +
    `latitude=${lat}&longitude=${lon}` +
    `&start_date=${startDate}&end_date=${endDate}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,` +
    `wind_speed_10m_max,weather_code,sunrise,sunset` +
    `&timezone=Europe%2FMadrid`;

  const response = await fetch(url, { next: { revalidate: 86400 } }); // cache 24h
  if (!response.ok) {
    throw new Error(`Open-Meteo Archive API error: ${response.status}`);
  }
  const data = await response.json();

  if (!data.daily?.time) return [];

  return data.daily.time.map((date: string, i: number) => {
    const sunrise = data.daily.sunrise?.[i] || "";
    const sunset = data.daily.sunset?.[i] || "";
    const sunriseDate = sunrise ? new Date(sunrise) : new Date();
    const sunsetDate = sunset ? new Date(sunset) : new Date();
    const daylightHours = (sunsetDate.getTime() - sunriseDate.getTime()) / (1000 * 60 * 60);

    const dayData = {
      temperatureMax: data.daily.temperature_2m_max[i] ?? 15,
      temperatureMin: data.daily.temperature_2m_min[i] ?? 8,
      precipitationSum: data.daily.precipitation_sum[i] ?? 0,
      windspeedMax: data.daily.wind_speed_10m_max[i] ?? 10,
      weatherCode: data.daily.weather_code[i] ?? 2,
      daylightHours: Math.max(0, daylightHours),
    };

    const golfScore = calculateGolfScore(dayData);
    const weatherInfo = getWeatherInfo(dayData.weatherCode);

    return {
      date,
      ...dayData,
      sunrise: sunrise.split("T")[1] || sunrise,
      sunset: sunset.split("T")[1] || sunset,
      weatherLabel: weatherInfo.label,
      weatherEmoji: weatherInfo.emoji,
      golfScore,
      demandLevel: getDemandLevel(golfScore),
      daylightHours: Math.round(Math.max(0, daylightHours) * 10) / 10,
    };
  });
}

// ============================================================
// CALENDAR-ONLY PREDICTIONS (beyond forecast range)
// ============================================================

export function generateCalendarOnlyPredictions(
  dates: string[],
  config: FieldConfig,
  tournamentDates: string[] = []
): DemandPrediction[] {
  // Create synthetic WeatherDay with neutral golf score
  const syntheticDays: WeatherDay[] = dates.map((date) => ({
    date,
    temperatureMax: 20,
    temperatureMin: 12,
    precipitationSum: 0,
    windspeedMax: 10,
    weatherCode: 2,
    sunrise: "07:30",
    sunset: "20:30",
    weatherLabel: "Sin datos meteorológicos",
    weatherEmoji: "📅",
    golfScore: 60,
    demandLevel: "MEDIA" as const,
    daylightHours: 13,
  }));

  const predictions = predictDemand(syntheticDays, config, tournamentDates);

  return predictions.map((p) => ({
    ...p,
    confianza: "30%",
    factorPrincipal: p.factorPrincipal + " (solo calendario)",
  }));
}

// ============================================================
// ACCURACY CALCULATOR
// ============================================================

export interface AccuracyResult {
  delta: number;
  deltaPercent: number;
  badge: "accurate" | "close" | "missed";
  emoji: string;
  color: string;
}

export function calculateAccuracy(
  predicted: number,
  actual: number
): AccuracyResult {
  const delta = Math.abs(predicted - actual);
  if (delta <= 15) {
    return { delta, deltaPercent: delta, badge: "accurate", emoji: "✓", color: "green" };
  } else if (delta <= 30) {
    return { delta, deltaPercent: delta, badge: "close", emoji: "≈", color: "yellow" };
  } else {
    return { delta, deltaPercent: delta, badge: "missed", emoji: "✗", color: "red" };
  }
}

// Re-export FieldConfig for API routes
export type { FieldConfig };
