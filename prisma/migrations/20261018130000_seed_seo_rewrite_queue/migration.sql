CREATE TABLE "SeoRewriteTask" (
  "jobId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastError" TEXT,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SeoRewriteTask_pkey" PRIMARY KEY ("jobId"),
  CONSTRAINT "SeoRewriteTask_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "SeoRewriteTask_status_nextAttemptAt_createdAt_idx" ON "SeoRewriteTask"("status", "nextAttemptAt", "createdAt");

CREATE TABLE "SeoRewriteControl" (
  "id" TEXT NOT NULL,
  "leaseOwner" TEXT,
  "leaseUntil" TIMESTAMP(3),
  "nextRequestAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "budgetDay" TEXT NOT NULL DEFAULT '',
  "reservedTokens" INTEGER NOT NULL DEFAULT 0,
  "requestCount" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "SeoRewriteControl_pkey" PRIMARY KEY ("id")
);
