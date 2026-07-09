CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_job_title_trgm ON "Job" USING gin (title gin_trgm_ops);
CREATE INDEX idx_job_description_trgm ON "Job" USING gin (description gin_trgm_ops);
CREATE INDEX idx_job_company_trgm ON "Job" USING gin (company gin_trgm_ops);
CREATE INDEX idx_job_location_trgm ON "Job" USING gin (location gin_trgm_ops);
CREATE INDEX idx_job_address_region_trgm ON "Job" USING gin ("addressRegion" gin_trgm_ops);