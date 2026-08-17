// app/resources/layout.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isMainPage = pathname === '/resources'

  return (
    <>
      {children}

      {!isMainPage && (
        <section className="border-t border-[#0B1A2E]/10 bg-white">
          <div className="max-w-3xl mx-auto px-6 py-16 flex flex-col items-left">
            <p
              className="text-xs font-bold tracking-[0.2em] uppercase text-[#0B1A2E]/50 mb-4"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Written by
            </p>
            <Link href="/about/bassem-shili" className="flex items-center gap-4 group">
              <img
                src="/profile_pic.png"
                alt="Bassem Shili"
                width={56}
                height={56}
                className="rounded-2xl object-cover w-14 h-14 transition-opacity group-hover:opacity-80"
              />
              <div>
                <p className="text-sm font-medium text-[#0B1A2E]" style={{ fontFamily: 'var(--font-display)' }}>
                  Bassem Shili
                </p>
                <p className="text-sm text-[#5B6472]">
                  Founder of Solar Roles.
                </p>
              </div>
            </Link>
          </div>
        </section>
      )}
    </>
  )
}