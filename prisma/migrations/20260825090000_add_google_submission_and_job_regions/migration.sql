ALTER TABLE "Job"
  ADD COLUMN IF NOT EXISTS "locationRegions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "lastGoogleIndexingSubmittedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Job_active_lastGoogleIndexingSubmittedAt_idx"
  ON "Job" ("active", "lastGoogleIndexingSubmittedAt");

-- Earlier multi-state custom-scrape records used URL fragments (for example
-- #tx). A fragment is not a distinct employer offer; expire it so the regular
-- expiration cron can notify Google with URL_DELETED.
UPDATE "Job"
SET "expiresAt" = NOW()
WHERE "source" = 'custom-scrape'
  AND "active" = true
  AND "url" LIKE '%#%';
