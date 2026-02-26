import { NextResponse } from "next/server";
import {
  generateHistoricalData,
  DEFAULT_AUTOMATIONS,
  calculateAccuracy,
} from "@/lib/services/weather";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.clubSettings.findFirst();
    const automations =
      (settings?.weatherAutomations as any[]) || DEFAULT_AUTOMATIONS;

    // Try to get real historical data from DB
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const realRecords = await prisma.weatherDailyRecord.findMany({
      where: { date: { gte: sixMonthsAgo } },
      orderBy: { date: "asc" },
    });

    // Use real data if we have enough, otherwise fallback to simulated
    const useRealData = realRecords.length >= 30;
    const isSimulated = !useRealData;

    let historicalData: any[];
    if (useRealData) {
      historicalData = realRecords.map((r) => {
        const d = r.date;
        const dayOfWeek = d.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const occupancy = r.actualOccupancy ?? r.predictedOccupancy ?? 50;
        const revenue = r.actualRevenue ?? r.predictedRevenue ?? 0;

        let weatherCategory: string;
        if (r.golfScore >= 75) weatherCategory = "Soleado";
        else if (r.golfScore >= 55) weatherCategory = "Nublado";
        else if (r.golfScore >= 30) weatherCategory = "Lluvia";
        else weatherCategory = "Viento/Tormenta";

        return {
          date: r.date.toISOString().split("T")[0],
          golfScore: r.golfScore,
          occupancy: Math.round(occupancy),
          revenue: Math.round(revenue),
          weatherCategory,
          isWeekend,
        };
      });
    } else {
      historicalData = generateHistoricalData();
    }

    // Compute analytics KPIs
    const totalDays = historicalData.length;
    const daysLostByWeather = historicalData.filter(
      (d) => d.golfScore < 30
    ).length;
    const goodWeatherDays = historicalData.filter((d) => d.golfScore >= 70);
    const badWeatherDays = historicalData.filter((d) => d.golfScore < 40);
    const avgOccupancyGoodWeather =
      goodWeatherDays.reduce((s, d) => s + d.occupancy, 0) /
      Math.max(1, goodWeatherDays.length);
    const avgOccupancyBadWeather =
      badWeatherDays.reduce((s, d) => s + d.occupancy, 0) /
      Math.max(1, badWeatherDays.length);
    const totalRevenue = historicalData.reduce((s, d) => s + d.revenue, 0);
    const capacity = settings?.fieldCapacity ?? 80;
    const avgRate = (settings?.rateWeekday ?? 45 + (settings?.rateWeekend ?? 65)) / 2;
    const revenueLostEstimate = daysLostByWeather * capacity * avgRate;

    // Correlation data for scatter plot
    const correlationData = historicalData.map((d) => ({
      golfScore: d.golfScore,
      occupancy: d.occupancy,
      dayType: d.isWeekend ? "Fin de semana" : "Laboral",
    }));

    // Revenue by weather category
    const revenueByWeather: Record<
      string,
      { current: number; count: number }
    > = {};
    historicalData.forEach((d) => {
      if (!revenueByWeather[d.weatherCategory]) {
        revenueByWeather[d.weatherCategory] = { current: 0, count: 0 };
      }
      revenueByWeather[d.weatherCategory].current += d.revenue;
      revenueByWeather[d.weatherCategory].count += 1;
    });

    // Prediction accuracy from real records
    const trackedRecords = realRecords.filter(
      (r) => r.predictedOccupancy != null && r.actualOccupancy != null
    );

    const accuracyTimeline = trackedRecords.map((r) => {
      const acc = calculateAccuracy(
        r.predictedOccupancy!,
        r.actualOccupancy!
      );
      return {
        date: r.date.toISOString().split("T")[0],
        predicted: r.predictedOccupancy,
        actual: r.actualOccupancy,
        delta: acc.delta,
        badge: acc.badge,
      };
    });

    const avgDelta =
      trackedRecords.length > 0
        ? trackedRecords.reduce((s, r) => {
            const acc = calculateAccuracy(
              r.predictedOccupancy!,
              r.actualOccupancy!
            );
            return s + acc.delta;
          }, 0) / trackedRecords.length
        : 0;

    const accurateCount = accuracyTimeline.filter(
      (a) => a.badge === "accurate"
    ).length;
    const closeCount = accuracyTimeline.filter(
      (a) => a.badge === "close"
    ).length;
    const missedCount = accuracyTimeline.filter(
      (a) => a.badge === "missed"
    ).length;

    const predictionAccuracy =
      trackedRecords.length > 0
        ? Math.round((100 - avgDelta) * 10) / 10
        : isSimulated
        ? 87
        : null;

    // Automations summary
    const automationStats = {
      totalSent: automations.reduce(
        (s: number, a: any) => s + (a.stats?.sent || 0),
        0
      ),
      totalBookings: automations.reduce(
        (s: number, a: any) => s + (a.stats?.bookings || 0),
        0
      ),
      totalRevenue: automations.reduce(
        (s: number, a: any) => s + (a.stats?.revenue || 0),
        0
      ),
      avgOpenRate: Math.round(
        automations.reduce(
          (s: number, a: any) => s + (a.stats?.openRate || 0),
          0
        ) / Math.max(1, automations.length)
      ),
    };

    return NextResponse.json({
      historicalData,
      correlationData,
      revenueByWeather: Object.entries(revenueByWeather).map(
        ([cat, data]) => ({
          category: cat,
          revenue: data.current,
          avgRevenue: Math.round(data.current / data.count),
          days: data.count,
        })
      ),
      kpis: {
        totalDays,
        daysLostByWeather,
        avgOccupancyGoodWeather: Math.round(avgOccupancyGoodWeather),
        avgOccupancyBadWeather: Math.round(avgOccupancyBadWeather),
        totalRevenue,
        revenueLostEstimate,
        predictionAccuracy,
      },
      accuracy: {
        totalTrackedDays: trackedRecords.length,
        avgDelta: Math.round(avgDelta * 10) / 10,
        accuracyScore: predictionAccuracy,
        distribution: {
          accurate: accurateCount,
          close: closeCount,
          missed: missedCount,
        },
        timeline: accuracyTimeline,
      },
      isSimulated,
      automationStats,
      automations,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Error al obtener analytics" },
      { status: 500 }
    );
  }
}
