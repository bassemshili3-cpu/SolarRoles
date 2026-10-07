import { getAppUrl } from '@/lib/stripe'
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { safeAuthAccountType, safeAuthRedirect } from '@/lib/authRedirect'
import { PRIVACY_VERSION, TERMS_VERSION } from '@/lib/accountConsent'
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const role = safeAuthAccountType(body?.accountType)
  if (!role || typeof body?.email !== 'string' || !/^\S+@\S+\.\S+$/.test(body.email.trim()) || typeof body.password !== 'string' || body.password.length < 8 || body.password !== body.confirmPassword) {
    return NextResponse.json({ error: 'Enter a valid email and matching passwords of at least 8 characters.' }, { status: 400 })
  }
  const consent = body.consent
  if (consent?.ageConfirmed !== true || consent?.termsAccepted !== true || consent?.privacyAcknowledged !== true) {
    return NextResponse.json({ error: 'Confirm the account requirements before continuing.' }, { status: 400 })
  }
  const client = await createServerSupabase()
  const origin = getAppUrl()
  const { data, error } = await client.auth.signUp({ email: body.email.trim(), password: body.password, options: {
    emailRedirectTo: origin + '/auth/callback',
    data: { accountType: role, signupRedirect: safeAuthRedirect(body.redirectTo), consent: { ...consent, termsVersion: TERMS_VERSION, privacyVersion: PRIVACY_VERSION } },
  } })
  if (error) return NextResponse.json({ error: 'Could not create your account. Please try again or log in.' }, { status: 400 })
  return NextResponse.json({ authenticated: Boolean(data.session) })
}
