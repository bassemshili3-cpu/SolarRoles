import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import { accountConsentPath } from '@/lib/accountConsent'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirectTo=/dashboard')

  const { data: consent, error } = await supabase
    .from('account_consents')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) throw new Error('Could not check account consent.')
  if (!consent) redirect(accountConsentPath('/dashboard'))

  return children
}
