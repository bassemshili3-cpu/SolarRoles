ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "needsHeaderImage" BOOLEAN NOT NULL DEFAULT true;

UPDATE "Job" SET "needsHeaderImage" = false WHERE "headerImage" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "Job_needsHeaderImage_active_idx"
  ON "Job" ("needsHeaderImage", "active")
  WHERE "needsHeaderImage" = true;