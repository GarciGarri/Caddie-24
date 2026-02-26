import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  fetchWeatherForecast,
  predictDemand,
  generateAlerts,
  generateCalendarOnlyPredictions,
} from "@/lib/services/weather";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const range = Math.min(60, Math.max(7, parseInt(searchParams.get("range") || "14")));
    const direction = searchParams.get("direction") || "future"; // future | past | both

    // Get field config from settings
    const settings = await prisma.clubSettings.findFirst();

    const lat = settings?.fieldLatitude ?? 40.9651;
    const lon = settings?.fieldLongitude ?? -5.664;
    const capacity = settings?.fieldCapacity ?? 80;
    const rateWeekday = settings?.rateWeekday ?? 45;
    const rateWeekend = settings?.rateWeekend ?? 65;
    const rateHoliday = settings?.rateHoliday ?? 75;
    const rainThreshold = settings?.rainClosureThreshold ?? 10;
    const windThreshold = settings?.windClosureThreshold ?? 50;
    const customHolidays = (settings?.customHolidays as any[]) || [];
    const seasonConfig = settings?.seasonConfig as any;
    const seasonMultipliers = settings?.seasonMultipliers as any;

    const fieldConfig = {
      capacity,
      rateWeekday,
      rateWeekend,
      rateHoliday,
      customHolidays,
      seasonConfig: seasonConfig || {
        high: ["04", "05", "06", "07", "08", "09", "10"],
        medium: ["03", "11"],
        low: ["12", "01", "02"],
      },
      seasonMultipliers: seasonMultipliers || { high: 1.2, medium: 1.0, low: 0.7 },
      rainClosureThreshold: rainThreshold,
      windClosureThreshold: windThreshold,
    };

    // Fetch real weather (max 16 days from Open-Meteo)
    const forecastDays = Math.min(range, 16);
    const { daily, hourly } = await fetchWeatherForecast(lat, lon, forecastDays);

    // Get tournament dates for extended range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureEnd = new Date(today);
    futureEnd.setDate(futureEnd.getDate() + range);

    const tournaments = await prisma.tournament.findMany({
      where: {
        date: { gte: today, lte: futureEnd },
        status: { in: ["OPEN", "IN_PROGRESS"] },
        isActive: true,
      },
      select: { date: true, name: true },
    });
    const tournamentDates = tournaments.map((t) =>
      t.date.toISOString().split("T")[0]
    );

    // Predict demand for real forecast days
    const predictions = predictDemand(daily, fieldConfig, tournamentDates);
    const alerts = generateAlerts(daily, predictions, fieldConfig);

    // Calendar-only predictions for days beyond forecast range
    let calendarOnlyDays: any[] = [];
    let calendarOnlyPredictions: any[] = [];
    if (range > forecastDays) {
      const extraDates: string[] = [];
      for (let i = forecastDays; i < range; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        extraDates.push(d.toISOString().split("T")[0]);
      }
      calendarOnlyPredictions = generateCalendarOnlyPredictions(
        extraDates,
        fieldConfig,
        tournamentDates
      );
      calendarOnlyDays = extraDates.map((date) => ({
        date,
        temperatureMax: null,
        temperatureMin: null,
        precipitationSum: null,
        windspeedMax: null,
        weatherCode: null,
        sunrise: "",
        sunset: "",
        weatherLabel: "Sin datos meteorológicos",
        weatherEmoji: "📅",
        golfScore: null,
        demandLevel: null,
        daylightHours: null,
        isCalendarOnly: true,
      }));
    }

    // Historical records for "past" or "both" directions
    let historicalRecords: any[] = [];
    if (direction === "past" || direction === "both") {
      const pastStart = new Date(today);
      pastStart.setDate(pastStart.getDate() - range);

      const pastEnd = new Date(today);
      pastEnd.setDate(pastEnd.getDate() - 1);

      historicalRecords = await prisma.weatherDailyRecord.findMany({
        where: { date: { gte: pastStart, lte: pastEnd } },
        orderBy: { date: "asc" },
      });

      // Transform for frontend
      const WEATHER_EMOJIS: Record<number, string> = {
        0: "☀️", 1: "⛅", 2: "⛅", 3: "☁️", 45: "🌫️", 48: "🌫️",
        51: "🌧️", 53: "🌧️", 55: "🌧️", 61: "🌧️", 63: "🌧️", 65: "🌧️",
        71: "❄️", 73: "❄️", 75: "❄️", 80: "🌦️", 81: "🌦️", 82: "🌦️",
        95: "⛈️", 96: "⛈️", 99: "⛈️",
      };

      historicalRecords = historicalRecords.map((r) => ({
        date: r.date.toISOString().split("T")[0],
        golfScore: r.golfScore,
        tempMax: r.tempMax,
        tempMin: r.tempMin,
        precipitation: r.precipitation,
        windMax: r.windMax,
        weatherCode: r.weatherCode,
        weatherEmoji: WEATHER_EMOJIS[r.weatherCode ?? 2] || "❓",
        daylightHours: r.daylightHours,
        predictedOccupancy: r.predictedOccupancy,
        actualOccupancy: r.actualOccupancy,
        predictedRevenue: r.predictedRevenue,
        actualRevenue: r.actualRevenue,
        isClosed: r.isClosed,
        isPast: true,
      }));
    }

    // Filter hourly data for today
    const todayStr = today.toISOString().split("T")[0];
    const todayHourly = hourly.filter((h) => h.time.startsWith(todayStr));

    return NextResponse.json({
      daily,
      predictions,
      alerts,
      todayHourly,
      calendarOnlyDays,
      calendarOnlyPredictions,
      historicalRecords,
      range,
      direction,
      fieldConfig: {
        name: settings?.fieldName || "Campo de Golf",
        capacity,
        latitude: lat,
        longitude: lon,
      },
      tournaments: tournaments.map((t) => ({
        date: t.date.toISOString().split("T")[0],
        name: t.name,
      })),
    });
  } catch (error) {
    console.error("Error fetching weather forecast:", error);
    return NextResponse.json(
      { error: "Error al obtener previsión meteorológica" },
      { status: 500 }
    );
  }
}
