import { redirect } from 'next/navigation'
import { createServerSupabase } from './supabase-server'
import { getAccountRole, roleDestination } from './accountRole'
import { accountConsentPath } from './accountConsent'
import type { AuthAccountType } from './authRedirect'
export async function requireAccount(required: AuthAccountType, destination: string) {
 const client = await createServerSupabase()
 const { data: { user } } = await client.auth.getUser()
 if (!user) redirect('/auth/login?redirectTo=' + encodeURIComponent(destination))
 const role = await getAccountRole(client, user.id)
 const { data: consent, error } = await client.from('account_consents').select('user_id').eq('user_id', user.id).maybeSingle()
 if (error) throw new Error('Could not check account consent.')
 if (!role || !consent) redirect(accountConsentPath(destination))
 if (role !== required) redirect(roleDestination(role))
 return user
}
