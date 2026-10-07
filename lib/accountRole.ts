import type { SupabaseClient } from '@supabase/supabase-js'
import { safeAuthRedirect, type AuthAccountType } from './authRedirect'
export async function getAccountRole(client: SupabaseClient, userId: string): Promise<AuthAccountType | null> {
  const { data, error } = await client.from('account_roles').select('role').eq('user_id', userId).maybeSingle()
  if (error) throw new Error('Could not check account permissions.')
  return data?.role === 'candidate' || data?.role === 'employer' ? data.role : null
}
export function roleDestination(role: AuthAccountType, requested?: string | null) {
  const home = '/dashboard/' + role
  const target = safeAuthRedirect(requested, home)
  if (target === '/dashboard' || target.startsWith('/auth/')) return home
  if (role === 'candidate' && target.startsWith('/dashboard/employer')) return home
  if (role === 'employer' && target.startsWith('/dashboard/candidate')) return home
  return target
}
