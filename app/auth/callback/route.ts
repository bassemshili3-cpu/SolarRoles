// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/dashboard'

  if (code) {
    const supabase = createClient() // ← pas await ici !
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth error:', error.message)
      return NextResponse.redirect(new URL('/auth/login?error=auth_failed', request.url))
    }
  }

  // Redirect to the requested page or dashboard
  return NextResponse.redirect(new URL(redirectTo, request.url))
}