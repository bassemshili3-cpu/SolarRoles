import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import { safeAuthRedirect } from '@/lib/authRedirect'
import { PRIVACY_VERSION, TERMS_VERSION } from '@/lib/accountConsent'
import AccountConsentForm from './AccountConsentForm'

export default async function AccountConsentPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>
}) {
  const { redirectTo: requestedRedirect } = await searchParams
  const redirectTo = safeAuthRedirect(requestedRedirect)
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`)
  }

  const { data: consent, error } = await supabase
    .from('account_consents')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) throw new Error('Could not check account consent.')
  if (consent) redirect(redirectTo)

  return (
    <AccountConsentForm
      email={user.email || ''}
      redirectTo={redirectTo}
      termsVersion={TERMS_VERSION}
      privacyVersion={PRIVACY_VERSION}
    />
  )
}
