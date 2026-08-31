-- Title and location are source data and may legitimately change after an
-- offer has been discovered. The public job slug must remain permanent.
ALTER TABLE "Job" ADD COLUMN "canonicalSlug" TEXT;
