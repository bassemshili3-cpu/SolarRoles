'use client'

import { useEffect, useState } from 'react'

const PREFIX = 'Your time to '
const GOLD = 'Shine.'
const STORAGE_KEY = 'hero-tagline-seen'
const TYPE_SPEED_MS = 55

export default function HeroTagline() {
  // Vide au premier rendu (SSR + premier rendu client identiques, pas
  // de mismatch d'hydratation), on decide dans l'effet ce qu'on affiche.
  const [displayCount, setDisplayCount] = useState(0)
  const [showCaret, setShowCaret] = useState(false)

  useEffect(() => {
    const fullLength = PREFIX.length + GOLD.length
    const alreadySeen = sessionStorage.getItem(STORAGE_KEY)
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (alreadySeen || prefersReducedMotion) {
      setDisplayCount(fullLength)
      return
    }

    sessionStorage.setItem(STORAGE_KEY, 'true')
    setShowCaret(true)

    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayCount(i)
      if (i >= fullLength) {
        clearInterval(interval)
        setShowCaret(false)
      }
    }, TYPE_SPEED_MS)

    return () => clearInterval(interval)
  }, [])

  const plainShown = PREFIX.slice(0, Math.min(displayCount, PREFIX.length))
  const goldShown = GOLD.slice(
    0,
    Math.max(0, displayCount - PREFIX.length)
  )

  return (
    <p className="text-lg text-white/80 mb-8 max-w-xl min-h-[1.75rem]">
      {plainShown}
      {goldShown && (
        <span className="text-[#F5B819] font-semibold">{goldShown}</span>
      )}
      {showCaret && (
        <span
          className="hero-tagline-caret inline-block w-[2px] h-[1em] bg-white/80 ml-0.5 align-middle"
          aria-hidden="true"
        />
      )}
    </p>
  )
}