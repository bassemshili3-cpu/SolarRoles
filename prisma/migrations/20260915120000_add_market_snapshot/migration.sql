CREATE TABLE "MarketSnapshot" (
    "id" TEXT NOT NULL,
    "snapshotDate" DATE NOT NULL,
    "totalJobs" INTEGER NOT NULL,
    "employerCount" INTEGER NOT NULL,
    "metrics" JSONB NOT NULL,
    "activeJobIds" JSONB NOT NULL,
    "employerCounts" JSONB NOT NULL,
    "stateCounts" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MarketSnapshot_snapshotDate_key" ON "MarketSnapshot"("snapshotDate");
