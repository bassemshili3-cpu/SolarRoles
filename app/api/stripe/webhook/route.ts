import { Prisma } from '@prisma/client'
import { headers } from 'next/headers'
import Stripe from 'stripe'

import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const FEATURED_DURATION_MS = 30 * 24 * 60 * 60 * 1000

function stripeId(value: string | { id: string } | null | undefined) {
  return typeof value === 'string' ? value : value?.id ?? null
}

function subscriptionPeriodEnd(subscription: Stripe.Subscription) {
  const timestamps = subscription.items.data
    .map((item) => item.current_period_end)
    .filter((value): value is number => Number.isFinite(value))
  return timestamps.length ? new Date(Math.max(...timestamps) * 1000) : null
}

function invoiceSubscriptionId(invoice: Stripe.Invoice) {
  return stripeId(invoice.parent?.subscription_details?.subscription)
}

async function syncSubscription(
  tx: Prisma.TransactionClient,
  subscription: Stripe.Subscription,
) {
  const subscriptionId = subscription.id
  const customerId = stripeId(subscription.customer)
  const metadataUserId = subscription.metadata.userId
  const existing = await tx.employerSubscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  })
  const userId = metadataUserId || existing?.userId
  if (!userId) return

  await tx.employerSubscription.upsert({
    where: { userId },
    update: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      plan: 'PARTNER',
      status: subscription.status,
      currentPeriodEnd: subscriptionPeriodEnd(subscription),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    create: {
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      plan: 'PARTNER',
      status: subscription.status,
      currentPeriodEnd: subscriptionPeriodEnd(subscription),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  })
}

async function processEvent(event: Stripe.Event) {
  await prisma.$transaction(async (tx) => {
    const alreadyProcessed = await tx.stripeWebhookEvent.findUnique({ where: { id: event.id } })
    if (alreadyProcessed) return

    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session
        const plan = session.metadata?.plan
        const userId = session.metadata?.userId || session.client_reference_id

        if (plan === 'featured' && session.metadata?.jobId && userId && session.payment_status === 'paid') {
          await tx.job.updateMany({
            where: {
              id: session.metadata.jobId,
              postedByUserId: userId,
              source: 'employer',
              listingPlan: 'FEATURED',
              paymentStatus: { not: 'paid' },
            },
            data: {
              active: true,
              postedAt: new Date(),
              expiresAt: new Date(Date.now() + FEATURED_DURATION_MS),
              featured: true,
              featuredUntil: new Date(Date.now() + FEATURED_DURATION_MS),
              paymentStatus: 'paid',
              stripeCheckoutId: session.id,
              stripePaymentId: stripeId(session.payment_intent),
            },
          })
        }

        if (plan === 'partner' && userId && session.subscription) {
          await tx.employerSubscription.upsert({
            where: { userId },
            update: {
              stripeCustomerId: stripeId(session.customer),
              stripeSubscriptionId: stripeId(session.subscription),
              plan: 'PARTNER',
              status: session.payment_status === 'unpaid' ? 'incomplete' : 'active',
            },
            create: {
              userId,
              stripeCustomerId: stripeId(session.customer),
              stripeSubscriptionId: stripeId(session.subscription),
              plan: 'PARTNER',
              status: session.payment_status === 'unpaid' ? 'incomplete' : 'active',
            },
          })
        }
        break
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.metadata?.plan === 'featured' && session.metadata.jobId) {
          await tx.job.updateMany({
            where: { id: session.metadata.jobId, paymentStatus: { not: 'paid' } },
            data: { paymentStatus: 'failed' },
          })
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await syncSubscription(tx, event.data.object as Stripe.Subscription)
        break

      case 'invoice.paid':
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoiceSubscriptionId(invoice)
        if (subscriptionId) {
          await tx.employerSubscription.updateMany({
            where: { stripeSubscriptionId: subscriptionId },
            data: { status: event.type === 'invoice.paid' ? 'active' : 'past_due' },
          })
        }
        break
      }
    }

    await tx.stripeWebhookEvent.create({ data: { id: event.id, type: event.type } })
  })
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) return new Response('Webhook is not configured', { status: 500 })

  const signature = (await headers()).get('stripe-signature')
  if (!signature) return new Response('Missing Stripe signature', { status: 400 })

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, webhookSecret)
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error)
    return new Response('Invalid Stripe signature', { status: 400 })
  }

  try {
    await processEvent(event)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return new Response('ok')
    }
    console.error(`Stripe webhook ${event.id} failed:`, error)
    return new Response('Webhook processing failed', { status: 500 })
  }

  return new Response('ok')
}
