// app/dashboard/employer/page.tsx
import { prisma } from '@/lib/prisma'
import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { deriveStatus } from '@/lib/employerJobStatus'
import EmployerDashboard from './employer-dashboard'
import { hasPartnerAccess, PARTNER_ACTIVE_JOB_LIMIT, PARTNER_FEATURED_JOB_LIMIT } from '@/lib/employerBilling'
import { getStripe } from '@/lib/stripe'
import type Stripe from 'stripe'

function stripeId(value: string | { id: string } | null | undefined) {
  return typeof value === 'string' ? value : value?.id ?? null
}

function subscriptionPeriodEnd(subscription: Stripe.Subscription) {
  const timestamps = subscription.items.data
    .map((item) => item.current_period_end)
    .filter((value): value is number => Number.isFinite(value))
  return timestamps.length ? new Date(Math.max(...timestamps) * 1000) : null
}

async function reconcilePartnerCheckout(userId: string, checkoutSessionId?: string) {
  const stripe = getStripe()
  let session: Stripe.Checkout.Session | undefined

  if (checkoutSessionId) {
    session = await stripe.checkout.sessions.retrieve(checkoutSessionId)
  } else {
    // Compatibility for Checkouts created before the session ID was added to
    // the success URL. Only inspect a small, recent window for this user.
    const recentSessions = await stripe.checkout.sessions.list({ limit: 10 })
    const oneDayAgo = Math.floor(Date.now() / 1000) - 24 * 60 * 60
    session = recentSessions.data.find((candidate) =>
      candidate.created >= oneDayAgo &&
      candidate.metadata?.plan === 'partner' &&
      (candidate.metadata?.userId || candidate.client_reference_id) === userId &&
      candidate.status === 'complete' &&
      candidate.payment_status === 'paid'
    )
  }

  const sessionUserId = session?.metadata?.userId || session?.client_reference_id
  if (
    !session ||
    session.metadata?.plan !== 'partner' ||
    sessionUserId !== userId ||
    session.status !== 'complete' ||
    session.payment_status !== 'paid' ||
    !session.subscription
  ) {
    return false
  }

  const subscriptionId = stripeId(session.subscription)
  if (!subscriptionId) return false
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  await prisma.employerSubscription.upsert({
    where: { userId },
    update: {
      stripeCustomerId: stripeId(subscription.customer),
      stripeSubscriptionId: subscription.id,
      plan: 'PARTNER',
      status: subscription.status,
      currentPeriodEnd: subscriptionPeriodEnd(subscription),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    create: {
      userId,
      stripeCustomerId: stripeId(subscription.customer),
      stripeSubscriptionId: subscription.id,
      plan: 'PARTNER',
      status: subscription.status,
      currentPeriodEnd: subscriptionPeriodEnd(subscription),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  })
  return true
}

export default async function EmployerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgrade?: string; payment?: string; plan?: string; session_id?: string }>
}) {
  const { upgrade, payment, plan, session_id: checkoutSessionId } = await searchParams
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const returnPath = upgrade === 'partner'
      ? '/dashboard/employer?upgrade=partner'
      : '/dashboard/employer'
    redirect(`/auth/login?redirectTo=${encodeURIComponent(returnPath)}`)
  }

  if (payment === 'success' && (plan === 'partner' || !plan)) {
    try {
      await reconcilePartnerCheckout(user.id, checkoutSessionId)
    } catch (error) {
      console.error('Could not reconcile Hiring Partner Checkout:', error)
    }
  }

  let [jobs, subscription] = await Promise.all([
    prisma.job.findMany({
      where: { postedByUserId: user.id },
      orderBy: [{ postedAt: 'desc' }, { fetchedAt: 'desc' }],
    }),
    prisma.employerSubscription.findUnique({ where: { userId: user.id } }),
  ])

  // Stripe webhooks remain authoritative, but reconciling a paid Checkout
  // session here prevents a paid listing from remaining a private draft when
  // webhook delivery is delayed.
  if (payment === 'success') {
    const pendingJobs = jobs.filter((job) =>
      job.listingPlan === 'FEATURED' &&
      job.paymentStatus === 'pending' &&
      Boolean(job.stripeCheckoutId)
    )

    const reconciled = await Promise.all(pendingJobs.map(async (job) => {
      try {
        const session = await getStripe().checkout.sessions.retrieve(job.stripeCheckoutId!)
        const sessionUserId = session.metadata?.userId || session.client_reference_id
        if (
          session.status !== 'complete' ||
          session.payment_status !== 'paid' ||
          session.metadata?.plan !== 'featured' ||
          session.metadata?.jobId !== job.id ||
          sessionUserId !== user.id
        ) {
          return false
        }

        const now = new Date()
        const featuredUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        const updated = await prisma.job.updateMany({
          where: {
            id: job.id,
            postedByUserId: user.id,
            paymentStatus: { not: 'paid' },
          },
          data: {
            active: true,
            postedAt: now,
            expiresAt: featuredUntil,
            featured: true,
            featuredUntil,
            paymentStatus: 'paid',
            stripePaymentId: typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent?.id ?? null,
          },
        })
        return updated.count === 1
      } catch (error) {
        console.error(`Could not reconcile Stripe Checkout for job ${job.id}:`, error)
        return false
      }
    }))

    if (reconciled.some(Boolean)) {
      jobs = await prisma.job.findMany({
        where: { postedByUserId: user.id },
        orderBy: [{ postedAt: 'desc' }, { fetchedAt: 'desc' }],
      })
    }
  }

  const mappedJobs = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    location: job.location,
    postedAt: job.postedAt ?? job.fetchedAt,
    status: deriveStatus(job),
    clicks: job.clickCount,
    applications: 0,
    paymentStatus: job.paymentStatus,
    featuredUntil: job.featuredUntil,
    expiresAt: job.expiresAt,
  }))

  const partnerAccess = hasPartnerAccess(subscription)
  const activeFeaturedJobs = jobs.filter((job) =>
    job.active && job.featured && job.featuredUntil && job.featuredUntil > new Date()
  ).length

  return (
    <EmployerDashboard
      initialJobs={mappedJobs}
      billing={{
        partnerAccess,
        status: subscription?.status ?? null,
        cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
        currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
        activeJobLimit: partnerAccess ? PARTNER_ACTIVE_JOB_LIMIT : 1,
        featuredJobLimit: partnerAccess ? PARTNER_FEATURED_JOB_LIMIT : 1,
        activeFeaturedJobs,
      }}
    />
  )
}
