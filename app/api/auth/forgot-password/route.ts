import { getAppUrl } from '@/lib/stripe'
import { throttleRequest } from '@/lib/requestThrottle'
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
export async function POST(request: Request) {
 const body = await request.json().catch(() => null)
 if (typeof body?.email !== 'string' || !/^\S+@\S+\.\S+$/.test(body.email.trim())) return NextResponse.json({ error: 'Enter a valid email.' }, { status: 400 })
 if (!throttleRequest(request, 'password-reset')) return NextResponse.json({ ok: true })
 const client = await createServerSupabase()
 const origin = getAppUrl()
 const { error } = await client.auth.resetPasswordForEmail(body.email.trim(), { redirectTo: origin + '/auth/callback?type=recovery' })
 if (error) console.error('[password reset] Provider rejected request:', error.code || 'unknown')
 return NextResponse.json({ ok: true })
}
