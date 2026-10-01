import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { PRIVACY_VERSION, TERMS_VERSION } from '@/lib/accountConsent'

export async function POST(request: Request) {
  const supabase = await createServerSupabase()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 })
  }

  let body: { termsAccepted?: boolean; privacyAcknowledged?: boolean; ageConfirmed?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  if (body.termsAccepted !== true || body.privacyAcknowledged !== true || body.ageConfirmed !== true) {
    return NextResponse.json({ error: 'Confirm all three items to continue.' }, { status: 400 })
  }

  const { data: existing, error: readError } = await supabase
    .from('account_consents')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (readError) {
    console.error('Could not read account consent:', readError)
    return NextResponse.json({ error: 'Could not save your choices. Please try again.' }, { status: 500 })
  }
  if (existing) return NextResponse.json({ ok: true })

  const { error } = await supabase.from('account_consents').insert({
    user_id: user.id,
    terms_version: TERMS_VERSION,
    privacy_version: PRIVACY_VERSION,
    age_confirmed: true,
    provider: user.app_metadata?.provider === 'google' ? 'google' : 'email',
  })
  if (error) {
    console.error('Could not save account consent:', error)
    return NextResponse.json({ error: 'Could not save your choices. Please try again.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
