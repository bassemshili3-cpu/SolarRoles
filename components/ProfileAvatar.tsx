'use client'

import { useState } from 'react'

export default function ProfileAvatar({ user, className = '' }: {
  user: { user_metadata?: Record<string, unknown>; email?: string }
  className?: string
}) {
  const metadata = user.user_metadata
  const name = String(metadata?.full_name || metadata?.name || user.email?.split('@')[0] || 'You')
  const photo = metadata?.avatar_url || metadata?.picture
  const photoUrl = typeof photo === 'string' ? photo : ''
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null)
  const initials = name.trim().split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()

  return (
    <span className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1a2340] text-sm font-bold text-white ${className}`}>
      {photoUrl && failedPhoto !== photoUrl ? (
        // Provider avatars can come from any authenticated user's image host.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" onError={() => setFailedPhoto(photoUrl)} />
      ) : initials}
    </span>
  )
}
