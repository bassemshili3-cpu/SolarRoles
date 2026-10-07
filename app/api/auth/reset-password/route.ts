import { validRecoveryGrant } from '@/lib/recoveryGrant'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
export async function POST(request: Request) {
 const client = await createServerSupabase()
 const { data: { user } } = await client.auth.getUser()
 const { data: { session } } = await client.auth.getSession()
 if (!user || !session || !validRecoveryGrant(cookies().get('solarroles_recovery')?.value, user.id, session.access_token)) return NextResponse.json({ error: 'This reset link is invalid or expired. Request a new one.' }, { status: 401 })
 const body = await request.json().catch(() => null)
 if (typeof body?.password !== 'string' || body.password.length < 8 || body.password !== body.confirmPassword) return NextResponse.json({ error: 'Passwords must match and contain at least 8 characters.' }, { status: 400 })
 const { error } = await client.auth.updateUser({ password: body.password })
 if (error) return NextResponse.json({ error: 'Could not change password. Request a new reset link or use a different password.' }, { status: 400 })
 cookies().delete('solarroles_recovery')
 await client.auth.signOut()
 return NextResponse.json({ ok: true })
}
