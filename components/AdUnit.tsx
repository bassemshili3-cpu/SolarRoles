'use client'

type AdUnitProps = {
  slot: string
  format?: 'auto' | 'fluid'
  className?: string
}

export function AdUnit({ slot, format = 'auto', className }: AdUnitProps) {
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