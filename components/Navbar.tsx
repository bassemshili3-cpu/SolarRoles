'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Moon, Sun, User, Menu, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import { usePathname, useRouter } from 'next/navigation'
import { FilterDrawerTrigger } from '@/components/filter-drawer-trigger'

export default function Navbar() {
  const supabase = createClient()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const signOut = async () => {
    await supabase.auth.signOut()
    if (pathname?.startsWith('/dashboard')) {
      router.push('/')
    } else {
      router.refresh()
    }
  }

  const navLinks = [
    { href: '/jobs',       label: 'Find Jobs' },
    { href: '/dashboard/post-a-job-free',  label: 'Employers' },
    { href: '/resources',  label: 'Resources' },
    { href: '/about',      label: 'About' },
  ]

  return (
    <nav className="border-b border-gray-100 bg-white sticky top-0 z-50 md:static">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 sm:gap-8 min-w-0">
          <Link
            href="/"
            className="flex items-center shrink-0 gap-2"
            aria-label="Solar Roles home"
          >
            <svg
              className="h-7 sm:h-8 w-auto shrink-0"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle cx="16" cy="16" r="6" fill="#F5B819" />
              <g stroke="#F5B819" strokeWidth="2" strokeLinecap="round">
                <line x1="16" y1="2"  x2="16" y2="6"  />
                <line x1="16" y1="26" x2="16" y2="30" />
                <line x1="2"  y1="16" x2="6"  y2="16" />
                <line x1="26" y1="16" x2="30" y2="16" />
                <line x1="6.1"  y1="6.1"  x2="8.9"  y2="8.9"  />
                <line x1="23.1" y1="23.1" x2="25.9" y2="25.9" />
                <line x1="6.1"  y1="25.9" x2="8.9"  y2="23.1" />
                <line x1="23.1" y1="8.9"  x2="25.9" y2="6.1"  />
              </g>
            </svg>
            <span className="hidden sm:inline text-base sm:text-lg font-bold text-[#0B1A2E] tracking-tight whitespace-nowrap">
              Solar<span className="text-[#F5B819]">Roles</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname === href || pathname?.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={`font-medium text-sm whitespace-nowrap transition-colors ${
                    isActive
                      ? 'text-[#0B1A2E]'
                      : 'text-gray-600 hover:text-[#0B1A2E]'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <Link href="/post-a-job-free" className="hidden sm:inline-flex">
            <Button
              size="sm"
              className="bg-[#F5B819] hover:bg-[#E5A810] active:bg-[#D4960D] text-[#0B1A2E] font-semibold rounded-full px-4 h-9"
            >
              Post a Job
            </Button>
          </Link>

          {user ? (
            <>
              <Link href="/dashboard" title="Dashboard" className="hidden sm:inline-flex">
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-2 sm:px-3 h-9 text-[#0B1A2E] hover:text-[#1E3A5F]"
                >
                  <User className="w-4 h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex px-2 sm:px-3 h-9 text-gray-600 hover:text-[#0B1A2E]"
                onClick={signOut}
              >
                Log out
              </Button>
            </>
          ) : (
            <Link href="/auth/login" className="hidden sm:inline-flex">
              <Button
                variant="ghost"
                size="sm"
                className="px-2 sm:px-3 h-9 text-[#0B1A2E] hover:text-[#1E3A5F] font-medium"
              >
                Log in
              </Button>
            </Link>
          )}


          <FilterDrawerTrigger />

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9 text-[#0B1A2E]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#F5B819]/10 text-[#0B1A2E]'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
            <div className="pt-2 mt-2 border-t border-gray-100 space-y-1">
              <Link
                href="/dashboard/post-a-job-free"
                className="block px-3 py-2.5 rounded-full text-sm font-semibold bg-[#F5B819] hover:bg-[#E5A810] text-[#0B1A2E] text-center transition-colors"
              >
                Post a Job
              </Link>
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={signOut}
                    className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Log in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}