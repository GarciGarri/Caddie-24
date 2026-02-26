import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/weather/daily-record?date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const dateStr = req.nextUrl.searchParams.get("date");
  if (!dateStr) {
    return NextResponse.json({ error: "Parámetro 'date' requerido" }, { status: 400 });
  }

  const record = await prisma.weatherDailyRecord.findUnique({
    where: { date: new Date(dateStr) },
  });

  return NextResponse.json({ record });
}

// POST /api/weather/daily-record — Staff inputs actual daily data
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const {
    date,
    actualOccupancy,
    actualReservas,
    actualRevenue,
    isClosed = false,
    closureReason,
  } = body;

  if (!date) {
    return NextResponse.json({ error: "Fecha requerida" }, { status: 400 });
  }

  const dateObj = new Date(date);

  // Upsert: update if exists (from snapshot/backfill), create if not
  const record = await prisma.weatherDailyRecord.upsert({
    where: { date: dateObj },
    update: {
      actualOccupancy: actualOccupancy ?? undefined,
      actualReservas: actualReservas ?? undefined,
      actualRevenue: actualRevenue ?? undefined,
      isClosed,
      closureReason: closureReason || null,
    },
    create: {
      date: dateObj,
      golfScore: 0, // Will be filled by backfill if needed
      actualOccupancy,
      actualReservas,
      actualRevenue,
      isClosed,
      closureReason: closureReason || null,
    },
  });

  return NextResponse.json({ record });
}
