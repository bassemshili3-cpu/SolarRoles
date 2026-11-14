'use client'

import { useEffect, useState } from 'react'
import { highFetchPriority } from '@/lib/fetch-priority'

type ConnectionHints = { saveData?: boolean; effectiveType?: string }

// Home hero background.
// The first paint is a small WebP still (52 KB right-hand crop on phones, 45–86 KB on
// wider screens) instead of the 3 MB PNG poster, so it no longer delays the LCP.
// The 18 MB looping video is attached only on screens of 768 px and wider, after the
// page has loaded, and never with reduced motion or data saver: phones keep the still.
export default function HeroBackground() {
  const [playVideo, setPlayVideo] = useState(false)

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 768px)').matches
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const connection = (navigator as Navigator & { connection?: ConnectionHints }).connection
    const constrained = connection?.saveData === true || /2g$/.test(connection?.effectiveType ?? '')
    if (!wide || reducedMotion || constrained) return

    let timer: ReturnType<typeof setTimeout> | undefined
    const start = () => {
      timer = setTimeout(() => setPlayVideo(true), 1000)
    }
    if (document.readyState === 'complete') start()
    else window.addEventListener('load', start, { once: true })
    return () => {
      window.removeEventListener('load', start)
      if (timer) clearTimeout(timer)
    }
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <picture>
        <source media="(max-width: 767px)" srcSet="/img/solar-hero-mobile-v1.webp" type="image/webp" />
        <img
          src="/img/solar-hero-1920-v1.webp"
          srcSet="/img/solar-hero-1280-v1.webp 1280w, /img/solar-hero-1920-v1.webp 1920w, /img/solar-hero-2254-v1.webp 2254w"
          sizes="100vw"
          width={1920}
          height={1008}
          alt=""
          decoding="async"
          {...highFetchPriority}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: '100% center' }}
        />
      </picture>
      {playVideo && (
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: '100% center' }}
        >
          <source src="/solar-hero.mp4" type="video/mp4" />
        </video>
      )}
    </div>
  )
}
