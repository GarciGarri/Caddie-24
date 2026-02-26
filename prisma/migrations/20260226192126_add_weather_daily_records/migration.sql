-- CreateTable
CREATE TABLE "weather_daily_records" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "golfScore" DOUBLE PRECISION NOT NULL,
    "tempMax" DOUBLE PRECISION,
    "tempMin" DOUBLE PRECISION,
    "precipitation" DOUBLE PRECISION,
    "windMax" DOUBLE PRECISION,
    "weatherCode" INTEGER,
    "daylightHours" DOUBLE PRECISION,
    "predictedOccupancy" DOUBLE PRECISION,
    "predictedReservas" INTEGER,
    "predictedRevenue" DOUBLE PRECISION,
    "confidence" DOUBLE PRECISION,
    "actualOccupancy" DOUBLE PRECISION,
    "actualReservas" INTEGER,
    "actualRevenue" DOUBLE PRECISION,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "closureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weather_daily_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "weather_daily_records_date_key" ON "weather_daily_records"("date");

-- CreateIndex
CREATE INDEX "weather_daily_records_date_idx" ON "weather_daily_records"("date");
