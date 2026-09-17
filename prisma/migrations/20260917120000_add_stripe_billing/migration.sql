ALTER TABLE "Job"
ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "featuredUntil" TIMESTAMP(3),
ADD COLUMN "listingPlan" TEXT,
ADD COLUMN "paymentStatus" TEXT NOT NULL DEFAULT 'not_required',
ADD COLUMN "stripeCheckoutId" TEXT,
ADD COLUMN "stripePaymentId" TEXT;

CREATE UNIQUE INDEX "Job_stripeCheckoutId_key" ON "Job"("stripeCheckoutId");
CREATE INDEX "Job_active_featured_expiresAt_postedAt_idx" ON "Job"("active", "featured", "expiresAt", "postedAt" DESC);

CREATE TABLE "EmployerSubscription" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "stripeCustomerId" TEXT,
  "stripeSubscriptionId" TEXT,
  "plan" TEXT NOT NULL DEFAULT 'PARTNER',
  "status" TEXT NOT NULL,
  "currentPeriodEnd" TIMESTAMP(3),
  "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmployerSubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EmployerSubscription_userId_key" ON "EmployerSubscription"("userId");
CREATE UNIQUE INDEX "EmployerSubscription_stripeCustomerId_key" ON "EmployerSubscription"("stripeCustomerId");
CREATE UNIQUE INDEX "EmployerSubscription_stripeSubscriptionId_key" ON "EmployerSubscription"("stripeSubscriptionId");
CREATE INDEX "EmployerSubscription_status_idx" ON "EmployerSubscription"("status");

CREATE TABLE "StripeWebhookEvent" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StripeWebhookEvent_pkey" PRIMARY KEY ("id")
);
