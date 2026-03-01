'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Moon, Sun, User } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const supabase = createClient()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
  <img src="/logo.svg" alt="Oh My Job" className="h-11 w-auto" />
</Link>
          <Link href="/jobs" className="font-medium hover:text-primary">Find Jobs</Link>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun /> : <Moon />}
          </Button>

          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="outline" className="gap-2"><User className="w-4 h-4" /> Dashboard</Button>
              </Link>
              <Button variant="ghost" onClick={signOut}>Log out</Button>
            </>
          ) : (
            <Link href="/auth/login">
              <Button>Sign in</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}