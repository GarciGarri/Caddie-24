import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  fetchHistoricalWeather,
  predictDemand,
  calculateAccuracy,
  calculateGolfScore,
} from "@/lib/services/weather";

// GET /api/weather/history?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const startDate = req.nextUrl.searchParams.get("startDate");
  const endDate = req.nextUrl.searchParams.get("endDate");

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: "Parámetros 'startDate' y 'endDate' requeridos" },
      { status: 400 }
    );
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // 1. Get existing records from DB
  const existingRecords = await prisma.weatherDailyRecord.findMany({
    where: { date: { gte: start, lte: end } },
    orderBy: { date: "asc" },
  });

  const existingDates = new Set(
    existingRecords.map((r) => r.date.toISOString().split("T")[0])
  );

  // 2. Find missing dates
  const missingDates: string[] = [];
  const current = new Date(start);
  while (current <= end) {
    const dateStr = current.toISOString().split("T")[0];
    if (!existingDates.has(dateStr)) {
      missingDates.push(dateStr);
    }
    current.setDate(current.getDate() + 1);
  }

  // 3. Backfill missing dates from Open-Meteo Archive API
  let newRecords: any[] = [];
  if (missingDates.length > 0) {
    try {
      // Get field config
      const settings = await prisma.clubSettings.findFirst();
      const lat = settings?.fieldLatitude ?? 40.9651;
      const lon = settings?.fieldLongitude ?? -5.664;
      const capacity = settings?.fieldCapacity ?? 80;
      const config = {
        capacity,
        rateWeekday: settings?.rateWeekday ?? 45,
        rateWeekend: settings?.rateWeekend ?? 65,
        rateHoliday: settings?.rateHoliday ?? 75,
        customHolidays: (settings?.customHolidays as any[]) || [],
        seasonConfig: (settings?.seasonConfig as any) || {
          high: ["04", "05", "06", "07", "08", "09", "10"],
          medium: ["03", "11"],
          low: ["12", "01", "02"],
        },
        seasonMultipliers: (settings?.seasonMultipliers as any) || {
          high: 1.2,
          medium: 1.0,
          low: 0.7,
        },
        rainClosureThreshold: settings?.rainClosureThreshold ?? 10,
        windClosureThreshold: settings?.windClosureThreshold ?? 50,
      };

      // Only fetch historical weather for dates that are truly in the past
      // (Archive API has a ~5 day delay)
      const safeEndDate = new Date();
      safeEndDate.setDate(safeEndDate.getDate() - 6);
      const safeEndStr = safeEndDate.toISOString().split("T")[0];

      const fetchableDates = missingDates.filter((d) => d <= safeEndStr);

      if (fetchableDates.length > 0) {
        const firstDate = fetchableDates[0];
        const lastDate = fetchableDates[fetchableDates.length - 1];

        const weatherDays = await fetchHistoricalWeather(
          lat,
          lon,
          firstDate,
          lastDate
        );

        // Get tournaments in the range
        const tournaments = await prisma.tournament.findMany({
          where: {
            date: { gte: new Date(firstDate), lte: new Date(lastDate) },
            status: { in: ["OPEN", "CLOSED", "IN_PROGRESS", "COMPLETED"] },
          },
          select: { date: true },
        });
        const tournamentDates = tournaments.map(
          (t) => t.date.toISOString().split("T")[0]
        );

        // Predict demand for historical days
        const predictions = predictDemand(weatherDays, config, tournamentDates);

        // Save to DB
        for (let i = 0; i < weatherDays.length; i++) {
          const day = weatherDays[i];
          const pred = predictions[i];
          if (!day || !fetchableDates.includes(day.date)) continue;

          const ocupacion = pred ? parseInt(pred.ocupacionEstimada) : 0;

          try {
            const record = await prisma.weatherDailyRecord.create({
              data: {
                date: new Date(day.date),
                golfScore: day.golfScore,
                tempMax: day.temperatureMax,
                tempMin: day.temperatureMin,
                precipitation: day.precipitationSum,
                windMax: day.windspeedMax,
                weatherCode: day.weatherCode,
                daylightHours: day.daylightHours,
                predictedOccupancy: ocupacion,
                predictedReservas: pred?.reservasEsperadas ?? 0,
                predictedRevenue: pred?.revenueEstimado ?? 0,
                confidence: pred ? parseInt(pred.confianza) : 50,
              },
            });
            newRecords.push(record);
          } catch {
            // Record might already exist (race condition), skip
          }
        }
      }
    } catch (error) {
      console.error("Error backfilling historical weather:", error);
      // Continue with what we have — don't fail the whole request
    }
  }

  // 4. Merge all records and compute accuracy
  const allRecords = [...existingRecords, ...newRecords].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  // Remove duplicates (by date)
  const uniqueMap = new Map<string, any>();
  for (const r of allRecords) {
    const key = r.date.toISOString().split("T")[0];
    uniqueMap.set(key, r);
  }
  const uniqueRecords = Array.from(uniqueMap.values());

  // 5. Build response with accuracy info
  const WEATHER_CODES: Record<number, string> = {
    0: "☀️", 1: "⛅", 2: "⛅", 3: "☁️", 45: "🌫️", 48: "🌫️",
    51: "🌧️", 53: "🌧️", 55: "🌧️", 61: "🌧️", 63: "🌧️", 65: "🌧️",
    71: "❄️", 73: "❄️", 75: "❄️", 80: "🌦️", 81: "🌦️", 82: "🌦️",
    95: "⛈️", 96: "⛈️", 99: "⛈️",
  };

  const records = uniqueRecords.map((r) => {
    const accuracy =
      r.predictedOccupancy != null && r.actualOccupancy != null
        ? calculateAccuracy(r.predictedOccupancy, r.actualOccupancy)
        : null;

    return {
      date: r.date.toISOString().split("T")[0],
      golfScore: r.golfScore,
      tempMax: r.tempMax,
      tempMin: r.tempMin,
      precipitation: r.precipitation,
      windMax: r.windMax,
      weatherCode: r.weatherCode,
      weatherEmoji: WEATHER_CODES[r.weatherCode ?? 2] || "❓",
      daylightHours: r.daylightHours,
      predictedOccupancy: r.predictedOccupancy,
      actualOccupancy: r.actualOccupancy,
      predictedRevenue: r.predictedRevenue,
      actualRevenue: r.actualRevenue,
      predictedReservas: r.predictedReservas,
      actualReservas: r.actualReservas,
      confidence: r.confidence,
      isClosed: r.isClosed,
      accuracy,
    };
  });

  // 6. Summary
  const tracked = records.filter(
    (r) => r.predictedOccupancy != null && r.actualOccupancy != null
  );
  const avgDelta =
    tracked.length > 0
      ? tracked.reduce((s, r) => s + (r.accuracy?.delta ?? 0), 0) /
        tracked.length
      : 0;

  const summary = {
    totalDays: records.length,
    daysWithActuals: tracked.length,
    avgAccuracy: Math.round((100 - avgDelta) * 10) / 10,
    avgDelta: Math.round(avgDelta * 10) / 10,
    accurateCount: tracked.filter((r) => r.accuracy?.badge === "accurate").length,
    closeCount: tracked.filter((r) => r.accuracy?.badge === "close").length,
    missedCount: tracked.filter((r) => r.accuracy?.badge === "missed").length,
  };

  return NextResponse.json({ records, summary });
}
