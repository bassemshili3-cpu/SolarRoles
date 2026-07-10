-- CreateTable
CREATE TABLE "RoleStateDemand" (
    "id" TEXT NOT NULL,
    "roleSlug" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleStateDemand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoleStateDemand_roleSlug_idx" ON "RoleStateDemand"("roleSlug");

-- CreateIndex
CREATE UNIQUE INDEX "RoleStateDemand_roleSlug_state_key" ON "RoleStateDemand"("roleSlug", "state");