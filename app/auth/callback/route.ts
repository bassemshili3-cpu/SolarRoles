import { issueRecoveryGrant } from '@/lib/recoveryGrant'
import { createServerSupabase } from '@/lib/supabase-server'
import { AUTH_ACCOUNT_TYPE_COOKIE, AUTH_REDIRECT_COOKIE, AUTH_CONSENT_COOKIE, safeAuthAccountType, safeAuthRedirect } from '@/lib/authRedirect'
import { getAccountRole, roleDestination } from '@/lib/accountRole'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { accountConsentPath } from '@/lib/accountConsent'
export async function GET(request: Request) {
  const url = new URL(request.url)
  const store = cookies()
  const supabase = await createServerSupabase()
  const code = url.searchParams.get('code')
  const token_hash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type')
  const recovery = type === 'recovery'
  if (recovery && !token_hash) return NextResponse.redirect(new URL('/auth/forgot-password?error=expired', request.url))
  const result = token_hash && (type === 'email' || type === 'signup' || recovery)
    ? await supabase.auth.verifyOtp({ token_hash, type: type as 'email' | 'signup' | 'recovery' })
    : code ? await supabase.auth.exchangeCodeForSession(code) : null
  if (!result || result.error) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!recovery && user?.email_confirmed_at) {
      const role = await getAccountRole(supabase, user.id)
      if (role) return NextResponse.redirect(new URL(roleDestination(role), request.url))
    }
    return NextResponse.redirect(new URL(recovery ? '/auth/forgot-password?error=expired' : '/auth/login?error=verification_expired', request.url))
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/auth/login?error=session', request.url))
  if (recovery) {
    store.set('solarroles_recovery', issueRecoveryGrant(user.id, result.data.session!.access_token), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 600 })
    return NextResponse.redirect(new URL('/auth/reset-password', request.url))
  }
  const choice = safeAuthAccountType(store.get(AUTH_ACCOUNT_TYPE_COOKIE)?.value)
  if (choice && store.get(AUTH_CONSENT_COOKIE)?.value === 'accepted') {
    const { error } = await supabase.rpc('complete_account_setup', { chosen_role: choice, age_confirmed: true, terms_accepted: true, privacy_acknowledged: true })
    if (error) return NextResponse.redirect(new URL('/auth/consent', request.url))
  }
  const role = await getAccountRole(supabase, user.id)
  const requested = store.get(AUTH_REDIRECT_COOKIE)?.value || user.user_metadata?.signupRedirect
  store.delete(AUTH_REDIRECT_COOKIE); store.delete(AUTH_ACCOUNT_TYPE_COOKIE); store.delete(AUTH_CONSENT_COOKIE)
  const destination = role ? roleDestination(role, safeAuthRedirect(requested)) : accountConsentPath(safeAuthRedirect(requested))
  if (token_hash) store.set('solarroles_verified', user.id, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 300 })
  return NextResponse.redirect(new URL(destination, request.url))
}
