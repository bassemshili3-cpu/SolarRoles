'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
export default function ResetPasswordForm() {
 const router = useRouter()
 const [password, setPassword] = useState(''), [confirmPassword, setConfirm] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState(''), [done, setDone] = useState(false)
 return <main className="mx-auto min-h-[70vh] max-w-md px-4 py-16"><h1 className="text-3xl font-bold">Choose a new password</h1>{done ? <div role="status" className="mt-6">Your password has been changed.<Button className="mt-4 w-full" onClick={() => { router.replace('/auth/login'); router.refresh() }}>Continue to login</Button></div> : <form className="mt-6 space-y-4" onSubmit={async e => {
 e.preventDefault(); if (busy) return
 if (password !== confirmPassword) return setError('Passwords do not match.')
 setBusy(true); setError('')
 try { const r = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password, confirmPassword }) }); const result = await r.json(); if (!r.ok) throw new Error(result.error); await createClient().auth.signOut(); setDone(true) } catch (e) { setError(e instanceof Error ? e.message : 'Could not reset password.') } finally { setBusy(false) }
 }}><label htmlFor="password">New password</label><Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} /><label htmlFor="confirm">Confirm password</label><Input id="confirm" name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} value={confirmPassword} onChange={e => setConfirm(e.target.value)} />{error && <p role="alert" className="text-red-700">{error}</p>}<Button className="w-full" disabled={busy}>{busy ? 'Saving...' : 'Change password'}</Button></form>}</main>
}
