import { cookies } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase-server'
import VerificationFlash from '@/components/VerificationFlash'
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const flash = cookies().get('solarroles_verified')?.value
  let verified = false
  if (flash) {
    const { data: { user } } = await (await createServerSupabase()).auth.getUser()
    verified = !!user && user.id === flash
  }
  return <><VerificationFlash initialVerified={verified} />{children}</>
}
