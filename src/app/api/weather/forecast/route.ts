import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  fetchWeatherForecast,
  predictDemand,
  generateAlerts,
} from "@/lib/services/weather";

export async function GET() {
  try {
    // Get field config from settings
    const settings = await prisma.clubSettings.findUnique({
      where: { id: "default" },
    });

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

    // Fetch real weather from Open-Meteo
    const { daily, hourly } = await fetchWeatherForecast(lat, lon, 14);

    // Get tournament dates for the forecast period
    const startDate = new Date(daily[0]?.date || new Date());
    const endDate = new Date(daily[daily.length - 1]?.date || new Date());
    const tournaments = await prisma.tournament.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        status: { in: ["OPEN", "IN_PROGRESS"] },
        isActive: true,
      },
      select: { date: true, name: true },
    });
    const tournamentDates = tournaments.map((t) =>
      t.date.toISOString().split("T")[0]
    );

    // Predict demand
    const fieldConfig = {
      capacity,
      rateWeekday,
      rateWeekend,
      rateHoliday,
      customHolidays,
      seasonConfig,
      seasonMultipliers,
      rainClosureThreshold: rainThreshold,
      windClosureThreshold: windThreshold,
    };

    const predictions = predictDemand(daily, fieldConfig, tournamentDates);
    const alerts = generateAlerts(daily, predictions, fieldConfig);

    // Filter hourly data for today
    const todayStr = new Date().toISOString().split("T")[0];
    const todayHourly = hourly.filter((h) => h.time.startsWith(todayStr));

    return NextResponse.json({
      daily,
      predictions,
      alerts,
      todayHourly,
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
