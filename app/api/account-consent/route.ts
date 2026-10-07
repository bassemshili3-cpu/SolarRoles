import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { getAccountRole } from '@/lib/accountRole'
import { safeAuthAccountType } from '@/lib/authRedirect'
export async function POST(request: Request) {
 const client = await createServerSupabase()
 const { data: { user } } = await client.auth.getUser()
 if (!user) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 })
 const body = await request.json().catch(() => null)
 if (body?.termsAccepted !== true || body?.privacyAcknowledged !== true || body?.ageConfirmed !== true) return NextResponse.json({ error: 'Confirm all three items to continue.' }, { status: 400 })
 const role = await getAccountRole(client, user.id) || safeAuthAccountType(body.accountType)
 if (!role) return NextResponse.json({ error: 'Choose an account type.' }, { status: 400 })
 const { error } = await client.rpc('complete_account_setup', { chosen_role: role, age_confirmed: true, terms_accepted: true, privacy_acknowledged: true })
 if (error) return NextResponse.json({ error: 'Could not save your choices. Please try again.' }, { status: 500 })
 return NextResponse.json({ ok: true })
}
