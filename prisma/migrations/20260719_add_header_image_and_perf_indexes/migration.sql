-- AlterTable
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "headerImage" TEXT;

-- CreateIndex (employerProfile: count + groupBy + aggregate sur company)
CREATE INDEX IF NOT EXISTS "Job_active_company_idx"
  ON "Job" ("active", "company");

-- CreateIndex (similarJobs + roleLocationStats)
CREATE INDEX IF NOT EXISTS "Job_active_addressRegion_postedAt_idx"
  ON "Job" ("active", "addressRegion", "postedAt" DESC);

-- Bonus : trigram index pour les ILIKE sur title (similarJobs, roleLocationStats)
-- Sans ça, le OR title contains reste un seq scan même avec les autres index.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS "Job_title_trgm_idx"
  ON "Job" USING gin ("title" gin_trgm_ops);

-- Bonus : trigram index pour le ILIKE sur company (employerProfile)
CREATE INDEX IF NOT EXISTS "Job_company_trgm_idx"
  ON "Job" USING gin ("company" gin_trgm_ops);