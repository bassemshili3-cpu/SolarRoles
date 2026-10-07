'use client'
import Link from 'next/link'
export type ConsentChoices = { ageConfirmed: boolean; termsAccepted: boolean; privacyAcknowledged: boolean }
export const emptyConsent: ConsentChoices = { ageConfirmed: false, termsAccepted: false, privacyAcknowledged: false }
export function hasRequiredConsent(value: ConsentChoices) {
  return value.ageConfirmed === true && value.termsAccepted === true && value.privacyAcknowledged === true
}
export default function AccountConsentFields({ value, onChange }: { value: ConsentChoices; onChange: (value: ConsentChoices) => void }) {
  return <fieldset className="space-y-3 text-sm text-slate-700">
    <legend className="mb-2 font-semibold">Account requirements</legend>
    <label className="flex items-start gap-3"><input required type="checkbox" checked={value.ageConfirmed} onChange={e => onChange({ ...value, ageConfirmed: e.target.checked })} className="mt-1 accent-amber-600" />I am at least 18 years old.</label>
    <div className="flex items-start gap-3"><input required id="signup-terms" type="checkbox" checked={value.termsAccepted} onChange={e => onChange({ ...value, termsAccepted: e.target.checked })} className="mt-1 accent-amber-600" /><span><label htmlFor="signup-terms">I agree to the </label><Link href="/terms" target="_blank" rel="noopener noreferrer" className="underline text-amber-800">Terms of Service</Link>.</span></div>
    <div className="flex items-start gap-3"><input required id="signup-privacy" type="checkbox" checked={value.privacyAcknowledged} onChange={e => onChange({ ...value, privacyAcknowledged: e.target.checked })} className="mt-1 accent-amber-600" /><span><label htmlFor="signup-privacy">I have read the </label><Link href="/privacy" target="_blank" rel="noopener noreferrer" className="underline text-amber-800">Privacy Policy</Link> and understand how my account information is used.</span></div>
    <p className="text-xs text-slate-500">Job alerts and promotional emails are separate, optional choices.</p>
  </fieldset>
}
