ALTER TABLE "Job" ADD COLUMN "compensationType" TEXT NOT NULL DEFAULT 'FIXED', ADD COLUMN "commissionDetails" TEXT;
ALTER TABLE "Job" ADD CONSTRAINT "Job_compensation_type_check" CHECK ("compensationType" IN ('FIXED','COMMISSION_ONLY','BASE_COMMISSION'));
ALTER TABLE "Job" ADD COLUMN "workSetting" TEXT;
ALTER TABLE "Job" ADD CONSTRAINT "Job_work_setting_check" CHECK ("workSetting" IS NULL OR "workSetting" IN ('REMOTE','HYBRID','ON_SITE'));
-- Existing rows remain null and use the same conservative location fallback.
