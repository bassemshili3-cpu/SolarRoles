-- AlterTable
ALTER TABLE "Job" ADD COLUMN "isFifo" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Job_isFifo_idx" ON "Job"("isFifo");