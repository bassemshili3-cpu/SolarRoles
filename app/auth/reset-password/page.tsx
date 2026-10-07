import { validRecoveryGrant } from '@/lib/recoveryGrant'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase-server'
import ResetPasswordForm from './reset-password-form'
export default async function ResetPassword() {
 const client = await createServerSupabase()
 const { data: { user } } = await client.auth.getUser()
 const { data: { session } } = await client.auth.getSession()
 if (!user || !session || !validRecoveryGrant(cookies().get('solarroles_recovery')?.value, user.id, session.access_token)) return <main className="mx-auto min-h-[70vh] max-w-md px-4 py-16"><h1 className="text-2xl font-bold">This reset link is invalid or has expired.</h1><Link className="mt-4 block underline" href="/auth/forgot-password">Request a new link</Link></main>
 return <ResetPasswordForm />
}
