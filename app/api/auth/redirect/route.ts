import { NextResponse } from 'next/server'

import {
  AUTH_ACCOUNT_TYPE_COOKIE,
  AUTH_REDIRECT_COOKIE,
  safeAuthAccountType,
  safeAuthRedirect,
} from '@/lib/authRedirect'

export async function POST(request: Request) {
  let body: { redirectTo?: string; accountType?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const redirectTo = safeAuthRedirect(body.redirectTo)
  const accountType = safeAuthAccountType(body.accountType)
  if (!accountType) {
    return NextResponse.json({ error: 'Choose an account type.' }, { status: 400 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(AUTH_REDIRECT_COOKIE, redirectTo, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 10 * 60,
  })
  response.cookies.set(AUTH_ACCOUNT_TYPE_COOKIE, accountType, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 10 * 60,
  })
  return response
}
