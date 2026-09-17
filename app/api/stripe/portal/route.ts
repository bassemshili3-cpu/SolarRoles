import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { createServerSupabase } from '@/lib/supabase-server'
import { getAppUrl, getStripe } from '@/lib/stripe'

export const runtime = 'nodejs'

export async function POST() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const subscription = await prisma.employerSubscription.findUnique({ where: { userId: user.id } })
  if (!subscription?.stripeCustomerId) {
    return NextResponse.json({ error: 'No Stripe billing account was found.' }, { status: 404 })
  }

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${getAppUrl()}/dashboard/employer`,
    })
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe portal creation failed:', error)
    return NextResponse.json({ error: 'Billing management is temporarily unavailable.' }, { status: 500 })
  }
}
