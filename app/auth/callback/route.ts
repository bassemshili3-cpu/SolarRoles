import { createServerSupabase } from '@/lib/supabase-server'
import {
  AUTH_ACCOUNT_TYPE_COOKIE,
  AUTH_REDIRECT_COOKIE,
  safeAuthAccountType,
  safeAuthRedirect,
} from '@/lib/authRedirect'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function authFailureRedirect(request: Request, redirectTo: string, reason: string) {
  const loginUrl = new URL('/auth/login', request.url)
  loginUrl.searchParams.set('error', reason)
  loginUrl.searchParams.set('redirectTo', redirectTo)
  return NextResponse.redirect(loginUrl)
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const cookieStore = await cookies()
  const redirectTo = safeAuthRedirect(
    cookieStore.get(AUTH_REDIRECT_COOKIE)?.value || requestUrl.searchParams.get('redirectTo'),
  )
  const accountType = safeAuthAccountType(cookieStore.get(AUTH_ACCOUNT_TYPE_COOKIE)?.value)

  if (!code) {
    const providerError = requestUrl.searchParams.get('error_code') || requestUrl.searchParams.get('error')
    return authFailureRedirect(request, redirectTo, providerError ? `oauth_${providerError}` : 'missing_code')
  }

  const supabase = await createServerSupabase()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('Auth error:', error.message)
    return authFailureRedirect(request, redirectTo, `exchange_${error.code || 'failed'}`)
  }

  if (accountType) {
    const { error: metadataError } = await supabase.auth.updateUser({ data: { accountType } })
    if (metadataError) console.error('Could not persist account type:', metadataError.message)
  }

  cookieStore.delete(AUTH_REDIRECT_COOKIE)
  cookieStore.delete(AUTH_ACCOUNT_TYPE_COOKIE)
  return NextResponse.redirect(new URL(redirectTo, request.url))
}
