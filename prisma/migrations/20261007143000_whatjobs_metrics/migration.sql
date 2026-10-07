CREATE TABLE "WhatJobsMetric" (
  "id" UUID NOT NULL,
  "viewId" UUID NOT NULL,
  "receivedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "surface" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "pagePath" TEXT NOT NULL,
  "jobId" TEXT,
  "publisher" TEXT,
  "device" TEXT NOT NULL,
  "activation" TEXT,
  "pnpAvailable" BOOLEAN NOT NULL,
  "tokenPresent" BOOLEAN NOT NULL,
  "isTest" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "WhatJobsMetric_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "WhatJobsMetric_receivedAt_surface_type_idx" ON "WhatJobsMetric"("receivedAt", "surface", "type");
