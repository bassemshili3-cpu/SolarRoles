'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Analytics } from '@vercel/analytics/next'
import WhatJobsTracking from './WhatJobsTracking'

export default function SiteChrome({
  children,
  header,
  footer,
}: {
  children: ReactNode
  header: ReactNode
  footer: ReactNode
}) {
  const pathname = usePathname()

  if (pathname?.startsWith('/embed/')) return children

  return (
    <>
      {header}
      <div className="min-h-[calc(100vh-4rem)]">{children}</div>
      {footer}
      <Analytics />
      <WhatJobsTracking />
    </>
  )
}
