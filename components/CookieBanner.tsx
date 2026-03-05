'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type ConsentState = 'accepted' | 'necessary' | null

const COOKIE_KEY = 'omj_cookie_consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_KEY)
    if (!stored) {
      // Small delay so it doesn't flash on first paint
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  const dismiss = (choice: ConsentState) => {
    if (!choice) return
    localStorage.setItem(COOKIE_KEY, choice)
    setLeaving(true)
    setTimeout(() => setVisible(false), 400)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4
        transition-all duration-400 ease-in-out
        ${leaving ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
      `}
      style={{
        animation: leaving ? undefined : 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0);    }
        }
      `}</style>

      <div
        style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(99,102,241,0.15)',
          boxShadow: '0 8px 32px rgba(59,65,210,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        }}
        className="rounded-2xl px-5 py-4"
      >
        {/* Top row */}
        <div className="flex items-start gap-3 mb-3">
          {/* Cookie icon */}
          <span className="text-xl mt-0.5 select-none" aria-hidden>🍪</span>

          <p className="text-sm text-gray-600 leading-relaxed flex-1">
            We use cookies to personalize job recommendations and improve your experience.{' '}
            <Link
              href="/cookie-policy"
              className="font-medium underline underline-offset-2 text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Cookie policy
            </Link>
            {' & '}
            <Link
              href="/privacy-policy"
              className="font-medium underline underline-offset-2 text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Privacy policy
            </Link>
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => dismiss('necessary')}
            className="
              px-4 py-1.5 rounded-lg text-sm font-medium
              text-gray-500 hover:text-gray-700
              border border-gray-200 hover:border-gray-300
              bg-white hover:bg-gray-50
              transition-all duration-150
            "
          >
            Necessary only
          </button>

          <button
            onClick={() => dismiss('accepted')}
            className="
              px-5 py-1.5 rounded-lg text-sm font-semibold
              text-white
              transition-all duration-150
              hover:opacity-90 active:scale-95
            "
            style={{
              background: 'linear-gradient(135deg, #3b41d2 0%, #4f46e5 100%)',
              boxShadow: '0 2px 8px rgba(79,70,229,0.35)',
            }}
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}