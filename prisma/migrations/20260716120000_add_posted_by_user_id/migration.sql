-- AlterTable
ALTER TABLE "Job" ADD COLUMN "postedByUserId" TEXT;

-- CreateIndex
CREATE INDEX "Job_postedByUserId_idx" ON "Job"("postedByUserId");