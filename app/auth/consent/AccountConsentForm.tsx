'use client'

import { useState, type FormEvent } from 'react'
import AccountConsentFields from '@/components/AccountConsentFields'
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
  const [accountType, setAccountType] = useState<'candidate' | 'employer'>(redirectTo.startsWith('/dashboard/employer') ? 'employer' : 'candidate')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!ageConfirmed || !termsAccepted || !privacyAcknowledged || saving) return
    setSaving(true)
    setError('')
    try {
      const response = await fetch('/api/account-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ageConfirmed, termsAccepted, privacyAcknowledged, accountType }),
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
          <label className="block text-sm">Account type<select className="ml-3 rounded border p-2" value={accountType} onChange={e => setAccountType(e.target.value as 'candidate' | 'employer')}><option value="candidate">Job seeker</option><option value="employer">Employer</option></select></label>
          <AccountConsentFields value={{ ageConfirmed, termsAccepted, privacyAcknowledged }} onChange={value => {
            setAgeConfirmed(value.ageConfirmed); setTermsAccepted(value.termsAccepted); setPrivacyAcknowledged(value.privacyAcknowledged)
          }} />
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
