-- CreateEnum
CREATE TYPE "TournamentFormat" AS ENUM ('STABLEFORD', 'MEDAL', 'SCRAMBLE', 'MATCH_PLAY', 'BEST_BALL', 'FOURBALL');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('REGISTERED', 'WAITLIST', 'CONFIRMED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'REFUNDED', 'WAIVED');

-- CreateTable
CREATE TABLE "tournaments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "teeTime" TEXT,
    "format" "TournamentFormat" NOT NULL,
    "handicapSystem" TEXT DEFAULT 'EGA',
    "maxParticipants" INTEGER NOT NULL,
    "entryFee" DECIMAL(10,2),
    "totalPrize" DECIMAL(10,2),
    "cancellationPolicy" TEXT,
    "sponsors" JSONB,
    "preferredChannel" TEXT DEFAULT 'whatsapp',
    "status" "TournamentStatus" NOT NULL DEFAULT 'DRAFT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_categories" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "handicapMin" DOUBLE PRECISION,
    "handicapMax" DOUBLE PRECISION,
    "gender" TEXT,
    "maxPlayers" INTEGER,
    "prizeAmount" DECIMAL(10,2),

    CONSTRAINT "tournament_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_registrations" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "categoryName" TEXT,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'REGISTERED',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "waitlistPosition" INTEGER,
    "handicapAtRegistration" DOUBLE PRECISION,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "tournament_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_results" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "grossScore" INTEGER,
    "netScore" INTEGER,
    "handicapUsed" DOUBLE PRECISION,
    "scorecardJson" JSONB,
    "positionOverall" INTEGER,
    "positionCategory" INTEGER,
    "categoryName" TEXT,
    "prizeWon" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournament_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tournaments_date_idx" ON "tournaments"("date");

-- CreateIndex
CREATE INDEX "tournaments_status_idx" ON "tournaments"("status");

-- CreateIndex
CREATE INDEX "tournament_categories_tournamentId_idx" ON "tournament_categories"("tournamentId");

-- CreateIndex
CREATE INDEX "tournament_registrations_tournamentId_status_idx" ON "tournament_registrations"("tournamentId", "status");

-- CreateIndex
CREATE INDEX "tournament_registrations_playerId_idx" ON "tournament_registrations"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "tournament_registrations_tournamentId_playerId_key" ON "tournament_registrations"("tournamentId", "playerId");

-- CreateIndex
CREATE INDEX "tournament_results_tournamentId_positionOverall_idx" ON "tournament_results"("tournamentId", "positionOverall");

-- CreateIndex
CREATE INDEX "tournament_results_playerId_idx" ON "tournament_results"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "tournament_results_tournamentId_playerId_key" ON "tournament_results"("tournamentId", "playerId");

-- AddForeignKey
ALTER TABLE "tournament_categories" ADD CONSTRAINT "tournament_categories_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_registrations" ADD CONSTRAINT "tournament_registrations_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_registrations" ADD CONSTRAINT "tournament_registrations_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_results" ADD CONSTRAINT "tournament_results_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_results" ADD CONSTRAINT "tournament_results_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
