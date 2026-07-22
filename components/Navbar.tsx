'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Moon, Sun, User } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { FilterDrawerTrigger } from '@/components/filter-drawer-trigger'

export default function Navbar() {
  const supabase = createClient()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <nav className="border-b bg-white sticky top-0 z-50 md:static">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 sm:gap-8 min-w-0">
          <Link href="/" className="flex items-center shrink-0">
            <img src="/logo.svg" alt="Oh My Job" className="h-8 sm:h-11 w-auto" />
          </Link>

          <Link
            href="/jobs"
            className="font-medium hover:text-primary text-sm sm:text-base whitespace-nowrap transition-colors"
          >
            Find Jobs
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="px-3 sm:px-4">
                  <User className="w-4 h-4 mr-1.5" />
                  Dashboard
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="px-3 sm:px-4" onClick={signOut}>
                Log out
              </Button>
            </>
          ) : (
            <Link href="/auth/login">
              <Button size="sm" className="px-3 sm:px-4">Sign in</Button>
            </Link>
          )}
          <FilterDrawerTrigger />
        </div>
      </div>
    </nav>
  )
}