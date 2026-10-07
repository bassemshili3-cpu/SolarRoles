import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
export async function POST() {
 const store = cookies()
 const { data: { user } } = await (await createServerSupabase()).auth.getUser()
 const verified = !!user && store.get('solarroles_verified')?.value === user.id
 store.delete('solarroles_verified')
 return NextResponse.json({ verified })
}
