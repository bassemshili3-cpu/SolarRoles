'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import ProfileAvatar from '@/components/ProfileAvatar'
import { CertificationsNavCta } from '@/components/CertificationsNavCta'

export default function Navbar() {
  const supabase = createClient()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const navLinks = [
    { href: '/jobs',       label: 'Find Jobs' },
    { href: '/resources',  label: 'Resources' },
    { href: '/dashboard/post-a-job',  label: 'Post a Job' },
  ]
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white md:static">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center gap-2 max-[360px]:gap-1">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-8">
          <Link
            href="/"
            className="flex items-center shrink-0 gap-2 max-[360px]:gap-1"
            aria-label="Solar Roles home"
          >
            <svg
              className="h-6 w-auto shrink-0 max-[360px]:h-5 sm:h-8"
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
            <span className="inline whitespace-nowrap text-[16.1px] max-[360px]:text-[15px] font-bold tracking-tight text-[#0B1A2E] sm:text-lg">
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

          <div className="ml-[16px] flex min-w-0 items-center gap-3.5 max-[360px]:ml-[11px] max-[360px]:gap-2 lg:hidden">
            {navLinks.slice(0, 2).map(({ href, label }) => {
              const isActive = pathname === href || pathname?.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={`whitespace-nowrap text-[12px] max-[360px]:text-[10px] font-medium transition-colors ${
                    isActive ? 'text-[#0B1A2E]' : 'text-gray-600 hover:text-[#0B1A2E]'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </div>
        </div>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-3">
            <span className="hidden md:inline-flex">
              <CertificationsNavCta />
            </span>

          {user ? (
            <Link href="/dashboard" title="Dashboard" aria-label="Open dashboard" className="inline-flex shrink-0 items-center gap-2 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700">
              <ProfileAvatar user={user} className="h-[27px] w-[27px] sm:h-8 sm:w-8" />
              <span className="hidden sm:inline text-sm font-medium text-[#0B1A2E]">Dashboard</span>
            </Link>
          ) : (
            <>
            <div className="flex items-center gap-1.5 md:hidden">
              <Link href="/auth/login" className="whitespace-nowrap text-xs max-[360px]:text-[11px] font-medium text-[#0B1A2E] hover:text-[#1E3A5F]">
                Log in
              </Link>
            </div>
            <Link href="/auth/login" className="hidden md:inline-flex">
              <Button
                variant="ghost"
                size="sm"
                className="px-2 sm:px-3 h-9 text-[#0B1A2E] hover:text-[#1E3A5F] font-medium"
              >
                Log in
              </Button>
            </Link>
            </>
          )}
          </div>
        </div>
        </div>
    </nav>
  )
}
