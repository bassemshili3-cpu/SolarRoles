'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import {
  Sun, Mail, Clock, MessageCircle, Send, ArrowRight, Check,
} from 'lucide-react'

// ----------------------------------------------------------------------------
// Solar grid pattern - meme style que la page resources
// ----------------------------------------------------------------------------

const SOLAR_GRID_STYLE: React.CSSProperties = {
  backgroundImage: `
    linear-gradient(to right, rgba(242, 169, 59, 0.18) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(242, 169, 59, 0.18) 1px, transparent 1px)
  `,
  backgroundSize: '24px 24px',
}

const SUBJECTS = [
  'General inquiry',
  'Job listing issue',
  'Partnership or advertising',
  'Press inquiry',
  'Bug report',
  'Other',
]

const SUBJECT_ICONS: Record<string, typeof Sun> = {
  'General inquiry': MessageCircle,
  'Job listing issue': Sun,
  'Partnership or advertising': Mail,
  'Press inquiry': Mail,
  'Bug report': MessageCircle,
  'Other': MessageCircle,
}

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
    <div className="min-h-screen bg-[#FAFAFA]">

      {/* HERO - meme style que la page resources, avec solar grid pattern en background */}
      <section className="relative overflow-hidden border-b border-[#F2A93B]/10">
        <div className="absolute inset-0 opacity-50" style={SOLAR_GRID_STYLE} />
        <div className="relative max-w-3xl mx-auto px-6 py-20">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#1C2126]/50 mb-5">
            <Sun className="h-3.5 w-3.5 text-[#F2A93B]" />
            <span>Solar Roles / Contact</span>
          </div>
         <h1 className="text-4xl md:text-5xl font-bold text-[#1C2126] leading-[1.05] tracking-tight">
  Contact{' '}
  <span className="text-[#F2A93B]">form</span>
</h1>
          
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-5 gap-10">

          {/* LEFT: Info aside - 3 mini-cards style SolarCard */}
          <aside className="md:col-span-2 space-y-4">
            {/* Direct email */}
            <div className="group rounded-2xl border border-[#F2A93B]/10 bg-white p-5 transition-all duration-300 hover:border-[#F2A93B]/30 hover:shadow-[0_8px_24px_-8px_rgba(242,169,59,0.2)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#FEF7EB] border border-[#F2A93B]/20 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-[#F2A93B]" />
                </div>
                <h2 className="text-base font-bold text-[#1C2126]">Direct email</h2>
              </div>
              <p className="text-sm text-[#1C2126]/65 leading-relaxed mb-3">
                For anything that doesn't fit the form, reach us directly at:
              </p>
              <a
                href="mailto:contact@solarroles.com"
                className="inline-flex items-center gap-1.5 text-[#F2A93B] font-semibold text-sm hover:gap-2 transition-all"
              >
                <span>contact@solarroles.com</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Response time */}
            <div className="group rounded-2xl border border-[#F2A93B]/10 bg-white p-5 transition-all duration-300 hover:border-[#F2A93B]/30 hover:shadow-[0_8px_24px_-8px_rgba(242,169,59,0.2)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#FEF7EB] border border-[#F2A93B]/20 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-[#F2A93B]" />
                </div>
                <h2 className="text-base font-bold text-[#1C2126]">Response time</h2>
              </div>
              <p className="text-sm text-[#1C2126]/65 leading-relaxed">
                We typically respond within{' '}
                <span className="font-bold text-[#1C2126]">1–2 business days</span>.
                For urgent issues, include <span className="font-mono text-[#F2A93B] font-semibold">"URGENT"</span> in
                your subject.
              </p>
            </div>

            {/* Common topics */}
            <div className="group rounded-2xl border border-[#F2A93B]/10 bg-white p-5 transition-all duration-300 hover:border-[#F2A93B]/30 hover:shadow-[0_8px_24px_-8px_rgba(242,169,59,0.2)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#FEF7EB] border border-[#F2A93B]/20 flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-[#F2A93B]" />
                </div>
                <h2 className="text-base font-bold text-[#1C2126]">Common topics</h2>
              </div>
              <ul className="space-y-2.5 text-sm">
                {[
                  ['Job listing inaccuracy', 'Wrong location, missing salary, expired post'],
                  ['Partnerships', 'Sponsored content, API access, employer packages'],
                  ['Press', 'Data requests, interviews, media inquiries'],
                  ['Bug reports', 'Something broken? Tell us exactly what happened'],
                ].map(([title, desc]) => (
                  <li key={title} className="flex gap-2.5">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#F2A93B] flex-shrink-0" />
                    <span>
                      <span className="font-semibold text-[#1C2126]">{title}</span>
                      {' '}
                      <span className="text-[#1C2126]/55">— {desc}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* RIGHT: Form - carte-panneau avec header dark + grid pattern */}
          <div className="md:col-span-3">
            {status === 'success' ? (
              // SUCCESS STATE - carte avec header gold + check icon
              <div className="rounded-2xl border border-[#F2A93B]/20 bg-white overflow-hidden">
                <div className="relative bg-gradient-to-br from-[#1C2126] to-[#2A323B] px-6 py-5 overflow-hidden">
                  <div className="absolute inset-0 opacity-25" style={SOLAR_GRID_STYLE} />
                  <div className="relative flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F2A93B] flex items-center justify-center flex-shrink-0">
                      <Check className="h-5 w-5 text-[#1C2126] stroke-[3]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#F2A93B]">Message sent</div>
                      <div className="text-sm text-white/80">Thanks for reaching out</div>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <h2 className="text-xl font-bold text-[#1C2126]">We got it.</h2>
                  <p className="text-sm text-[#1C2126]/70 leading-relaxed">
                    Thanks for reaching out. We received your message and will get back
                    to you within 1–2 business days at the email address you provided.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#F2A93B] hover:gap-2.5 transition-all"
                  >
                    Send another message
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              // FORM
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl border border-[#F2A93B]/20 bg-white overflow-hidden"
              >
                {/* Header "solar panel" - dark gradient + grid pattern + send icon */}
                <div className="relative bg-gradient-to-br from-[#1C2126] to-[#2A323B] px-6 py-5 overflow-hidden">
                  <div className="absolute inset-0 opacity-20" style={SOLAR_GRID_STYLE} />
                  <div className="relative flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F2A93B] flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
                      <Send className="h-4 w-4 text-[#1C2126]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#F2A93B]">
                        Send a message
                      </div>
                      <div className="text-sm text-white/80">
                        We typically respond within 1–2 business days
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5">

                  {/* Subject pills - remplace le select */}
                  <div>
                    <label className="block text-sm font-semibold text-[#1C2126] mb-2.5">
                      Subject <span className="text-[#F2A93B]">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SUBJECTS.map((s) => {
                        const isSelected = subject === s
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSubject(s)}
                            className={
                              isSelected
                                ? 'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#F2A93B] text-[#1C2126] border border-[#F2A93B] shadow-[0_2px_8px_-2px_rgba(242,169,59,0.5)] transition-all'
                                : 'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white text-[#1C2126]/75 border border-[#1C2126]/15 hover:border-[#F2A93B]/50 hover:text-[#1C2126] transition-all'
                            }
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                            {s}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Name + email */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-[#1C2126] mb-1.5">
                        Full name <span className="text-[#F2A93B]">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jane Smith"
                        className="w-full rounded-lg border border-[#1C2126]/15 bg-white px-4 py-2.5 text-sm text-[#1C2126] placeholder:text-[#1C2126]/35 outline-none transition focus:border-[#F2A93B] focus:ring-2 focus:ring-[#F2A93B]/20"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-[#1C2126] mb-1.5">
                        Email address <span className="text-[#F2A93B]">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jane@example.com"
                        className="w-full rounded-lg border border-[#1C2126]/15 bg-white px-4 py-2.5 text-sm text-[#1C2126] placeholder:text-[#1C2126]/35 outline-none transition focus:border-[#F2A93B] focus:ring-2 focus:ring-[#F2A93B]/20"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-[#1C2126] mb-1.5">
                      Message <span className="text-[#F2A93B]">*</span>
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us what's on your mind..."
                      className="w-full rounded-lg border border-[#1C2126]/15 bg-white px-4 py-2.5 text-sm text-[#1C2126] placeholder:text-[#1C2126]/35 outline-none transition focus:border-[#F2A93B] focus:ring-2 focus:ring-[#F2A93B]/20 resize-none"
                    />
                  </div>

                  {status === 'error' && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                      {errorMsg}
                    </p>
                  )}

                  {/* Submit button - gold CTA */}
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="group inline-flex items-center gap-2 bg-[#F2A93B] text-[#1C2126] font-semibold text-sm px-6 py-3 rounded-lg hover:bg-[#E0A030] hover:shadow-[0_8px_24px_-4px_rgba(242,169,59,0.4)] active:scale-[0.97] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none"
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
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <p className="text-xs text-[#1C2126]/45 pt-2">
                    By submitting this form you agree to our{' '}
                    <Link href="/privacy" className="underline hover:text-[#1C2126] transition-colors">
                      Privacy Policy
                    </Link>
                    . We will never share your email with third parties.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}