import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchWeatherForecast, predictDemand } from "@/lib/services/weather";

// POST /api/weather/snapshot — Capture today's prediction for accuracy tracking
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Get field config
  const settings = await prisma.clubSettings.findFirst();
  const lat = settings?.fieldLatitude ?? 40.9651;
  const lon = settings?.fieldLongitude ?? -5.664;
  const capacity = settings?.fieldCapacity ?? 80;
  const rateWeekday = settings?.rateWeekday ?? 45;
  const rateWeekend = settings?.rateWeekend ?? 65;
  const rateHoliday = settings?.rateHoliday ?? 75;
  const customHolidays = (settings?.customHolidays as any[]) || [];
  const seasonConfig = (settings?.seasonConfig as any) || undefined;
  const seasonMultipliers = (settings?.seasonMultipliers as any) || undefined;
  const rainThreshold = settings?.rainClosureThreshold ?? 10;
  const windThreshold = settings?.windClosureThreshold ?? 50;

  const config = {
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

  try {
    // Fetch today's weather (just 1 day)
    const { daily } = await fetchWeatherForecast(lat, lon, 1);
    const today = daily[0];
    if (!today) {
      return NextResponse.json({ error: "No se pudo obtener el pronóstico" }, { status: 502 });
    }

    // Get tournaments for today
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const tomorrowDate = new Date(todayDate);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    const tournaments = await prisma.tournament.findMany({
      where: {
        date: { gte: todayDate, lt: tomorrowDate },
        status: { in: ["OPEN", "CLOSED", "IN_PROGRESS"] },
      },
      select: { date: true },
    });
    const tournamentDates = tournaments.map(
      (t) => t.date.toISOString().split("T")[0]
    );

    // Predict demand
    const predictions = predictDemand([today], config, tournamentDates);
    const prediction = predictions[0];

    const ocupacion = prediction
      ? parseInt(prediction.ocupacionEstimada)
      : 0;

    // Upsert today's record
    const record = await prisma.weatherDailyRecord.upsert({
      where: { date: todayDate },
      update: {
        golfScore: today.golfScore,
        tempMax: today.temperatureMax,
        tempMin: today.temperatureMin,
        precipitation: today.precipitationSum,
        windMax: today.windspeedMax,
        weatherCode: today.weatherCode,
        daylightHours: today.daylightHours,
        predictedOccupancy: ocupacion,
        predictedReservas: prediction?.reservasEsperadas ?? 0,
        predictedRevenue: prediction?.revenueEstimado ?? 0,
        confidence: prediction ? parseInt(prediction.confianza) : 0,
      },
      create: {
        date: todayDate,
        golfScore: today.golfScore,
        tempMax: today.temperatureMax,
        tempMin: today.temperatureMin,
        precipitation: today.precipitationSum,
        windMax: today.windspeedMax,
        weatherCode: today.weatherCode,
        daylightHours: today.daylightHours,
        predictedOccupancy: ocupacion,
        predictedReservas: prediction?.reservasEsperadas ?? 0,
        predictedRevenue: prediction?.revenueEstimado ?? 0,
        confidence: prediction ? parseInt(prediction.confianza) : 0,
      },
    });

    return NextResponse.json({ record, message: "Snapshot guardado" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
