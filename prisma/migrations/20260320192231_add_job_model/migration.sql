/*
  Warnings:

  - A unique constraint covering the columns `[email,what,where]` on the table `JobAlert` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "JobAlert" ADD COLUMN     "frequency" TEXT NOT NULL DEFAULT 'WEEKLY';

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT '',
    "addressRegion" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "applyUrl" TEXT NOT NULL DEFAULT '',
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "salary" TEXT,
    "contractType" TEXT,
    "contractTime" TEXT,
    "postedAt" TIMESTAMP(3),
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Job_source_idx" ON "Job"("source");

-- CreateIndex
CREATE INDEX "Job_active_idx" ON "Job"("active");

-- CreateIndex
CREATE INDEX "Job_fetchedAt_idx" ON "Job"("fetchedAt");

-- CreateIndex
CREATE INDEX "Job_title_company_idx" ON "Job"("title", "company");

-- CreateIndex
CREATE UNIQUE INDEX "JobAlert_email_what_where_key" ON "JobAlert"("email", "what", "where");
