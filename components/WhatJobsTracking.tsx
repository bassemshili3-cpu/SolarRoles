'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { startWhatJobsTracking } from '@/lib/whatjobsTrackingClient'

export default function WhatJobsTracking() {
  const pathname = usePathname()
  useEffect(() => {
    if (!pathname || pathname.startsWith('/embed/') || !('IntersectionObserver' in window)) return
    return startWhatJobsTracking(pathname)
  }, [pathname])
  return null
}
