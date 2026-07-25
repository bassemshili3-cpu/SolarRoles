import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE_NAME, signAdminToken } from '@/lib/adminAuth'

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  const expectedPassword = process.env.ADMIN_PASSWORD
  if (!expectedPassword) {
    console.error('ADMIN_PASSWORD is not set in the environment')
    return NextResponse.json({ error: 'Admin login is not configured' }, { status: 500 })
  }

  if (password !== expectedPassword) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const token = signAdminToken()
  if (!token) {
    return NextResponse.json({ error: 'Admin login is not configured' }, { status: 500 })
  }

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  })

  return NextResponse.json({ ok: true })
}