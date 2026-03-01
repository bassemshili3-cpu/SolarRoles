import { stripe } from '@/lib/stripe'
import { createServerSupabase } from '@/lib/supabase-server'
import { NextRequest } from 'next/server'
import { headers } from 'next/headers'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = (await headers()).get('stripe-signature')!

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    return new Response(`Webhook Error: ${err}`, { status: 400 })
  }

  // TODO: update user subscription in Prisma
  if (event.type === 'checkout.session.completed') {
    console.log('✅ Subscription active for user')
  }

  return new Response('OK', { status: 200 })
}