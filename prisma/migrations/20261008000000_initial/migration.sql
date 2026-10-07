-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Classification" AS ENUM ('weed', 'not_weed');

-- CreateTable
CREATE TABLE "Garden" (
    "id" UUID NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "widthM" DOUBLE PRECISION NOT NULL,
    "lengthM" DOUBLE PRECISION NOT NULL,
    "crops" TEXT[],
    "plan" JSONB NOT NULL,
    "planId" UUID NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Garden_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Identification" (
    "id" UUID NOT NULL,
    "gardenId" UUID NOT NULL,
    "gardenRevision" INTEGER NOT NULL,
    "requestId" UUID NOT NULL,
    "classification" "Classification" NOT NULL,
    "commonName" TEXT,
    "scientificName" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL,
    "explanation" TEXT NOT NULL,
    "guidance" JSONB NOT NULL,
    "identifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Identification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Garden_clerkUserId_key" ON "Garden"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Identification_requestId_key" ON "Identification"("requestId");

-- CreateIndex
CREATE INDEX "Identification_gardenId_identifiedAt_idx" ON "Identification"("gardenId", "identifiedAt");

-- AddForeignKey
ALTER TABLE "Identification" ADD CONSTRAINT "Identification_gardenId_fkey" FOREIGN KEY ("gardenId") REFERENCES "Garden"("id") ON DELETE CASCADE ON UPDATE CASCADE;

