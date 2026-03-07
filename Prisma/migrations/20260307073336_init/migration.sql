-- CreateTable
CREATE TABLE "JobAlert" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "what" TEXT NOT NULL,
    "where" TEXT NOT NULL,
    "salaryMin" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobAlert_pkey" PRIMARY KEY ("id")
);
