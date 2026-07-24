import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'

export default async function Dashboard() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  const accountType = user?.user_metadata?.accountType

  redirect(accountType === 'employer' ? '/dashboard/employer' : '/dashboard/candidate')
}