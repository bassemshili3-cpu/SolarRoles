import type { SupabaseClient } from '@supabase/supabase-js'
import { getAccountRole } from './accountRole'
import type { AuthAccountType } from './authRedirect'
export async function hasAccountPermission(client: SupabaseClient, userId: string, role: AuthAccountType) {
 if (await getAccountRole(client, userId) !== role) return false
 const { data, error } = await client.from('account_consents').select('user_id').eq('user_id', userId).maybeSingle()
 if (error) throw new Error('Could not check account consent.')
 return !!data
}
