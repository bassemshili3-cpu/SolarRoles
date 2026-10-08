// app/jobs/[id]/apply-form.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle2 } from 'lucide-react'
import ApplicationResumePicker, { type ApplicationResume } from '@/components/ApplicationResumePicker'

export default function ApplyForm({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [resume, setResume] = useState<ApplicationResume>({ mode: 'link', url: '' })
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim()) return setError('Add your name.')
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email address.')
    if (resume.mode === 'link' && !resume.url.trim()) return setError('Attach a resume or add a resume link.')
    if (resume.mode === 'link' && !/^https?:\/\//.test(resume.url.trim())) {
      return setError('The resume link must start with http:// or https://')
    }

    setIsSubmitting(true)
    try {
      const body = new FormData()
      body.set('name', name.trim())
      body.set('email', email.trim())
      body.set('message', message.trim())
      if (resume.mode === 'file') body.set('resumeFile', resume.file)
      else if (resume.mode === 'saved') body.set('resumePath', resume.path)
      else body.set('resumeUrl', resume.url.trim())
      const res = await fetch(`/api/jobs/${encodeURIComponent(jobId)}/apply`, {
        method: 'POST',
        body,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Something went wrong. Try again.')
      }
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="mx-auto text-emerald-600 mb-3" size={32} />
        <h3 className="text-lg font-semibold text-emerald-900 mb-1">Application sent</h3>
        <p className="text-sm text-emerald-700">
          Your application for {jobTitle} has been sent. The employer will reach out if it's a match.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border p-6 space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Apply for this job</h3>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div>
        <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Full name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
          className="h-11 rounded-xl"
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Email address</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="h-11 rounded-xl"
        />
      </div>

      <ApplicationResumePicker value={resume} onChange={setResume} disabled={isSubmitting} />

      <div>
        <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
          Message <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="A short note to the employer"
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-400 transition-all outline-none resize-y"
        />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Submit application'}
      </Button>
    </form>
  )
}
