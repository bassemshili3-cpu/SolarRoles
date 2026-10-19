ALTER TABLE "SeoRewriteControl" ADD COLUMN "consecutiveRateLimits" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "SeoRewriteControl" ADD COLUMN "lastProviderError" TEXT;
