'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'

const SUBJECTS = [
  'General inquiry',
  'Job listing issue',
  'Partnership or advertising',
  'Press inquiry',
  'Bug report',
  'Other',
]

type Status = 'idle' | 'sending' | 'success' | 'error'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Something went wrong.')
      }
      setStatus('success')
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
    } catch (err: unknown) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  return (
    <main className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-[#1a2340] text-white">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <p className="text-[#6b8cff] text-sm font-semibold tracking-wider uppercase mb-5">Get in touch</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">
            We read every message.<br />
            <span className="text-[#6b8cff]">Every single one.</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl leading-relaxed">
            Whether you have a question about job listings, a partnership idea, or just want to say hello — we are here.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-5 gap-12">

        {/* Left: info */}
        <aside className="md:col-span-2 space-y-8">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Contact</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              For all inquiries, reach us directly at:
            </p>
            <a
              href="mailto:contact@oh-my-job.com"
              className="inline-flex items-center gap-2 text-[#2B4ACB] font-semibold text-sm hover:underline"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              contact@oh-my-job.com
            </a>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Response time</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              We typically respond within <span className="font-semibold text-gray-800">1–2 business days</span>. For urgent issues, include "URGENT" in your subject line.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Common topics</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              {[
                ['Job listing inaccuracy', 'Missing salary, wrong location, expired post'],
                ['Partnerships', 'Sponsored content, API access, employer packages'],
                ['Press', 'Data requests, interviews, media inquiries'],
                ['Bug reports', 'Something broken? Tell us exactly what happened'],
              ].map(([title, desc]) => (
                <li key={title} className="flex gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#2B4ACB] flex-shrink-0" />
                  <span><span className="font-medium text-gray-800">{title}</span> — {desc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Other pages</h2>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-[#2B4ACB] hover:underline">About Oh My Job</Link></li>
              <li><Link href="/privacy" className="text-[#2B4ACB] hover:underline">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-[#2B4ACB] hover:underline">Terms of Service</Link></li>
            </ul>
          </div>
        </aside>

        {/* Right: form */}
        <div className="md:col-span-3">
          {status === 'success' ? (
            <div className="rounded-xl border border-green-200 bg-green-50 px-8 py-10 flex flex-col items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-green-800">Message sent successfully!</h2>
              </div>
              <p className="text-green-700 text-sm leading-relaxed">
                Thanks for reaching out. We have received your message and will get back to you within 1–2 business days at the email address you provided.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="mt-2 text-sm font-semibold text-green-700 hover:text-green-900 underline underline-offset-2"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Full name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#2B4ACB] focus:ring-2 focus:ring-[#2B4ACB]/20"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#2B4ACB] focus:ring-2 focus:ring-[#2B4ACB]/20"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Subject <span className="text-red-500">*</span>
                </label>
                <select
                  id="subject"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#2B4ACB] focus:ring-2 focus:ring-[#2B4ACB]/20 appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select a topic...</option>
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's on your mind..."
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#2B4ACB] focus:ring-2 focus:ring-[#2B4ACB]/20 resize-none"
                />
              </div>

              {status === 'error' && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="inline-flex items-center gap-2 bg-[#2B4ACB] text-white font-semibold text-sm px-6 py-3 rounded-lg hover:bg-[#1a2340] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === 'sending' ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    Send message
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m22 2-7 20-4-9-9-4Z" />
                      <path d="M22 2 11 13" />
                    </svg>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400">
                By submitting this form you agree to our{' '}
                <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
                We will never share your email with third parties.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#1a2340] py-14">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Looking for a job?</h2>
          <p className="text-white/60 mb-7 max-w-md mx-auto text-sm">
            Browse hundreds of thousands of US job listings updated daily.
          </p>
          <Link
            href="/jobs"
            className="inline-block bg-white text-[#1a2340] font-semibold px-8 py-3 rounded-lg hover:bg-white/90 transition-colors text-sm"
          >
            Search jobs
          </Link>
        </div>
      </section>

    </main>
  )
}
