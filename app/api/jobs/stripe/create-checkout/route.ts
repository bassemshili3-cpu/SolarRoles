import { stripe } from '@/lib/stripe'
import { createServerSupabase } from '@/lib/supabase'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const { priceId, plan } = await req.json()
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return new Response('Unauthorized', { status: 401 })

  const session = await stripe.checkout.sessions.create({
    customer_email: user.email!,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/employer?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/employer`,
    metadata: { userId: user.id, plan },
  })

  return Response.json({ url: session.url })
}