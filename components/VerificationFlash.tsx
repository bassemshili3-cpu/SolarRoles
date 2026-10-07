'use client'
import { useEffect, useRef, useState } from 'react'
export default function VerificationFlash({ initialVerified = false }: { initialVerified?: boolean }) {
 const started = useRef(false)
 const [verified, setVerified] = useState(initialVerified)
 useEffect(() => {
  if (started.current) return
  started.current = true
  fetch('/api/auth/verification-flash', { method: 'POST' }).then(r => r.json()).then(v => setVerified(v.verified)).catch(() => {})
 }, [])
 return verified ? <p role="status" className="fixed left-4 right-4 top-20 z-50 mx-auto max-w-xl rounded-lg shadow-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Your email has been verified successfully.</p> : null
}
