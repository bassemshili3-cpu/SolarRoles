'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
export default function ForgotPassword() {
 const [email, setEmail] = useState(''), [busy, setBusy] = useState(false), [sent, setSent] = useState(false), [error, setError] = useState('')
 return <main className="mx-auto min-h-[70vh] max-w-md px-4 py-16"><h1 className="text-3xl font-bold text-slate-900">Reset your password</h1><p className="mt-3 text-sm text-slate-600">Enter your account email to request a new reset link.</p><form className="mt-6 space-y-4" onSubmit={async e => {
 e.preventDefault(); if (busy) return; setBusy(true); setError('')
 try { const r = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }); if (!r.ok) throw new Error('Please try again later.'); setSent(true) } catch { setError('Could not request a reset link. Please try again.') } finally { setBusy(false) }
 }}><label htmlFor="email">Email</label><Input id="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /><Button disabled={busy || sent} type="submit" className="w-full">{busy ? 'Sending...' : 'Send reset instructions'}</Button>{sent && <p role="status">If an account exists for this email, we&apos;ve sent password reset instructions.</p>}{error && <p role="alert">{error}</p>}</form><Link href="/auth/login" className="mt-6 inline-block text-amber-700 underline">Back to login</Link></main>
}
