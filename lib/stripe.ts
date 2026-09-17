import 'server-only'

import Stripe from 'stripe'

let stripeClient: Stripe | null = null

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY || process.env.solarroles_STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY or solarroles_STRIPE_SECRET_KEY is not configured.')
  }

  stripeClient ??= new Stripe(secretKey)
  return stripeClient
}

export function getStripePrice(plan: 'featured' | 'partner'): string {
  const key = plan === 'partner' ? 'STRIPE_PRICE_PARTNER' : 'STRIPE_PRICE_FEATURED'
  const price = process.env[key]
  if (!price) throw new Error(`${key} is not configured.`)
  return price
}

export function getAppUrl(): string {
  const value = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL
  if (!value) throw new Error('NEXT_PUBLIC_APP_URL is not configured.')
  return value.replace(/\/$/, '')
}
