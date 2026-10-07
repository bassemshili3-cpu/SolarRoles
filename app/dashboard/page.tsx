import { getAccountRole } from '@/lib/accountRole'
import { accountConsentPath } from '@/lib/accountConsent'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'

export default async function Dashboard() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirectTo=/dashboard')
  const accountType = await getAccountRole(supabase, user.id)
  if (!accountType) redirect(accountConsentPath('/dashboard'))

  redirect(accountType === 'employer' ? '/dashboard/employer' : '/dashboard/candidate')
}