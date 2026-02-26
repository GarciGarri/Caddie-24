import { NextResponse } from "next/server";
import { generateHistoricalData, DEFAULT_AUTOMATIONS } from "@/lib/services/weather";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.clubSettings.findUnique({
      where: { id: "default" },
    });

    const automations = (settings?.weatherAutomations as any[]) || DEFAULT_AUTOMATIONS;

    // Generate historical data (in production, this would come from DB)
    const historicalData = generateHistoricalData();

    // Compute analytics KPIs
    const totalDays = historicalData.length;
    const daysLostByWeather = historicalData.filter((d) => d.golfScore < 30).length;
    const avgOccupancyGoodWeather =
      historicalData.filter((d) => d.golfScore >= 70).reduce((s, d) => s + d.occupancy, 0) /
      Math.max(1, historicalData.filter((d) => d.golfScore >= 70).length);
    const avgOccupancyBadWeather =
      historicalData.filter((d) => d.golfScore < 40).reduce((s, d) => s + d.occupancy, 0) /
      Math.max(1, historicalData.filter((d) => d.golfScore < 40).length);
    const totalRevenue = historicalData.reduce((s, d) => s + d.revenue, 0);
    const revenueLostEstimate = daysLostByWeather * 80 * 45; // capacity * avg rate

    // Correlation data for scatter plot
    const correlationData = historicalData.map((d) => ({
      golfScore: d.golfScore,
      occupancy: d.occupancy,
      dayType: d.isWeekend ? "Fin de semana" : "Laboral",
    }));

    // Revenue by weather category
    const revenueByWeather: Record<string, { current: number; count: number }> = {};
    historicalData.forEach((d) => {
      if (!revenueByWeather[d.weatherCategory]) {
        revenueByWeather[d.weatherCategory] = { current: 0, count: 0 };
      }
      revenueByWeather[d.weatherCategory].current += d.revenue;
      revenueByWeather[d.weatherCategory].count += 1;
    });

    // Automations summary
    const automationStats = {
      totalSent: automations.reduce((s: number, a: any) => s + (a.stats?.sent || 0), 0),
      totalBookings: automations.reduce((s: number, a: any) => s + (a.stats?.bookings || 0), 0),
      totalRevenue: automations.reduce((s: number, a: any) => s + (a.stats?.revenue || 0), 0),
      avgOpenRate: Math.round(
        automations.reduce((s: number, a: any) => s + (a.stats?.openRate || 0), 0) /
          Math.max(1, automations.length)
      ),
    };

    return NextResponse.json({
      historicalData,
      correlationData,
      revenueByWeather: Object.entries(revenueByWeather).map(([cat, data]) => ({
        category: cat,
        revenue: data.current,
        avgRevenue: Math.round(data.current / data.count),
        days: data.count,
      })),
      kpis: {
        totalDays,
        daysLostByWeather,
        avgOccupancyGoodWeather: Math.round(avgOccupancyGoodWeather),
        avgOccupancyBadWeather: Math.round(avgOccupancyBadWeather),
        totalRevenue,
        revenueLostEstimate,
        predictionAccuracy: 87, // demo
      },
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
