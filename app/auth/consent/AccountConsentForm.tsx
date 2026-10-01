'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AccountConsentForm({
  email,
  redirectTo,
  termsVersion,
  privacyVersion,
}: {
  email: string
  redirectTo: string
  termsVersion: string
  privacyVersion: string
}) {
  const router = useRouter()
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const policyDate = (value: string) => new Intl.DateTimeFormat('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${value}T12:00:00Z`))

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!ageConfirmed || !termsAccepted || !privacyAcknowledged || saving) return
    setSaving(true)
    setError('')
    try {
      const response = await fetch('/api/account-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ageConfirmed, termsAccepted, privacyAcknowledged }),
      })
      if (!response.ok) {
        const result = await response.json().catch(() => ({}))
        throw new Error(result.error || 'Could not save your choices. Please try again.')
      }
      router.replace(redirectTo)
      router.refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save your choices. Please try again.')
      setSaving(false)
    }
  }

  async function leave() {
    await createClient().auth.signOut()
    router.replace('/auth/login')
    router.refresh()
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-12 sm:py-20">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Account setup</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Review your Solar Roles account</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          You are signed in as <strong>{email}</strong>. Solar Roles uses your email to manage your account.
          Saved jobs and a resume are stored only when you choose to add them.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 text-sm text-slate-800">
            <input type="checkbox" checked={ageConfirmed} onChange={event => setAgeConfirmed(event.target.checked)} className="mt-1 h-4 w-4 accent-amber-600" />
            <span>I am at least 18 years old and meet the eligibility requirements for an account.</span>
          </label>
          <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 text-sm text-slate-800">
            <input id="consent-terms" type="checkbox" checked={termsAccepted} onChange={event => setTermsAccepted(event.target.checked)} className="mt-1 h-4 w-4 accent-amber-600" />
            <div><label htmlFor="consent-terms" className="cursor-pointer">I agree to the Terms of Service</label> (<Link href="/terms" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-700 underline">read terms</Link>, updated {policyDate(termsVersion)}).</div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 text-sm text-slate-800">
            <input id="consent-privacy" type="checkbox" checked={privacyAcknowledged} onChange={event => setPrivacyAcknowledged(event.target.checked)} className="mt-1 h-4 w-4 accent-amber-600" />
            <div><label htmlFor="consent-privacy" className="cursor-pointer">I have read the Privacy Policy and understand how my account information is used</label> (<Link href="/privacy" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-700 underline">read policy</Link>, updated {policyDate(privacyVersion)}).</div>
          </div>

          <p className="text-xs leading-5 text-slate-500">
            These confirmations do not subscribe you to promotional emails or job alerts. You can choose those separately.
          </p>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={!ageConfirmed || !termsAccepted || !privacyAcknowledged || saving} className="w-full rounded-lg bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? 'Saving...' : 'Continue to Solar Roles'}
          </button>
          <button type="button" onClick={leave} className="w-full py-2 text-sm text-slate-500 hover:text-slate-800">
            I do not agree — sign out
          </button>
        </form>
      </div>
    </main>
  )
}
