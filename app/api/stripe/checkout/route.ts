import { NextResponse } from 'next/server'

import { hasPartnerAccess } from '@/lib/employerBilling'
import { prisma } from '@/lib/prisma'
import { createServerSupabase } from '@/lib/supabase-server'
import { getAppUrl, getStripe, getStripePrice } from '@/lib/stripe'

export const runtime = 'nodejs'

type CheckoutPlan = 'featured' | 'partner'

export async function POST(request: Request) {
  const supabase = await createServerSupabase()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'You must be signed in to continue.' }, { status: 401 })
  }

  let body: { plan?: CheckoutPlan; jobId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  if (body.plan !== 'featured' && body.plan !== 'partner') {
    return NextResponse.json({ error: 'Invalid checkout plan.' }, { status: 400 })
  }

  let expectedStripeCheckoutId: string | null = null

  const subscription = await prisma.employerSubscription.findUnique({ where: { userId: user.id } })
  if (body.plan === 'partner' && hasPartnerAccess(subscription)) {
    return NextResponse.json({ error: 'Your Hiring Partner plan is already active.' }, { status: 409 })
  }

  if (body.plan === 'featured') {
    if (!body.jobId) {
      return NextResponse.json({ error: 'A draft job is required.' }, { status: 400 })
    }

    const job = await prisma.job.findFirst({
      where: { id: body.jobId, postedByUserId: user.id, source: 'employer' },
      select: { id: true, active: true, listingPlan: true, paymentStatus: true, stripeCheckoutId: true },
    })
    if (!job || job.listingPlan !== 'FEATURED') {
      return NextResponse.json({ error: 'Draft job not found.' }, { status: 404 })
    }
    if (job.active || job.paymentStatus === 'paid') {
      return NextResponse.json({ error: 'This job has already been published.' }, { status: 409 })
    }
    expectedStripeCheckoutId = job.stripeCheckoutId

    if (job.stripeCheckoutId && job.paymentStatus !== 'failed') {
      try {
        const existingSession = await getStripe().checkout.sessions.retrieve(job.stripeCheckoutId)
        if (existingSession.status === 'open' && existingSession.url) {
          return NextResponse.json({ url: existingSession.url })
        }
        if (existingSession.status === 'complete') {
          return NextResponse.json(
            { error: 'Stripe is still confirming this checkout. Refresh the dashboard shortly.' },
            { status: 409 },
          )
        }
      } catch (error) {
        console.warn(`Could not reuse Stripe Checkout session ${job.stripeCheckoutId}:`, error)
      }
    }
  }

  try {
    const stripe = getStripe()
    const appUrl = getAppUrl()
    const metadata = {
      userId: user.id,
      plan: body.plan,
      ...(body.jobId ? { jobId: body.jobId } : {}),
    }

    const customer = body.plan === 'partner' ? subscription?.stripeCustomerId : null
    const session = await stripe.checkout.sessions.create({
      mode: body.plan === 'partner' ? 'subscription' : 'payment',
      line_items: [{ price: getStripePrice(body.plan), quantity: 1 }],
      client_reference_id: user.id,
      metadata,
      ...(customer
        ? { customer }
        : user.email
          ? { customer_email: user.email }
          : {}),
      ...(body.plan === 'partner'
        ? { subscription_data: { metadata: { userId: user.id, plan: 'partner' } } }
        : { payment_intent_data: { metadata } }),
      success_url: `${appUrl}/dashboard/employer?payment=success&plan=${body.plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard/employer?payment=cancelled${body.jobId ? `&jobId=${encodeURIComponent(body.jobId)}` : ''}`,
    })

    if (!session.url) {
      return NextResponse.json({ error: 'Stripe did not return a checkout URL.' }, { status: 502 })
    }

    if (body.plan === 'featured' && body.jobId) {
      try {
        const reserved = await prisma.job.updateMany({
          where: {
            id: body.jobId,
            postedByUserId: user.id,
            paymentStatus: { not: 'paid' },
            stripeCheckoutId: expectedStripeCheckoutId,
          },
          data: { stripeCheckoutId: session.id, paymentStatus: 'pending' },
        })
        if (reserved.count !== 1) {
          await stripe.checkout.sessions.expire(session.id).catch(() => undefined)
          return NextResponse.json({ error: 'This draft is no longer available.' }, { status: 409 })
        }
      } catch (error) {
        await stripe.checkout.sessions.expire(session.id).catch(() => undefined)
        throw error
      }
    }
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe Checkout creation failed:', error)
    return NextResponse.json({ error: 'Checkout is temporarily unavailable.' }, { status: 500 })
  }
}
