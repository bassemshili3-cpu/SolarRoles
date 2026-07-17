-- AlterTable
ALTER TABLE "Job" ADD COLUMN "schemaDescription" TEXT;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN "schemaDescriptionVersion" INTEGER NOT NULL DEFAULT 0;