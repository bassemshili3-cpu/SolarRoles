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

  const hideFooter = ['/dashboard/candidate', '/dashboard/employer'].some(
    (route) => pathname === route || pathname?.startsWith(`${route}/`),
  )

  return (
    <>
      {header}
      <div className="min-h-[calc(100vh-4rem)]">{children}</div>
      {!hideFooter && footer}
      <Analytics />
      <WhatJobsTracking />
    </>
  )
}
