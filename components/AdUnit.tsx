'use client'

import { useEffect } from 'react'

type AdUnitProps = {
  slot: string
  format?: 'auto' | 'fluid'
  className?: string
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

export function AdUnit({ slot, format = 'auto', className }: AdUnitProps) {
  useEffect(() => {
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (err) {
      console.error('AdSense push error:', err)
    }
  }, [])

  return (
    <ins
      className={`adsbygoogle ${className ?? ''}`}
      style={{ display: 'block' }}
      data-ad-client="ca-pub-3314706503607251"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  )
}