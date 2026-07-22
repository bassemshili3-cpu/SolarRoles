// app/dashboard/employer/new/post-job-form.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, Check } from 'lucide-react'

type SalaryPeriod = 'year' | 'hour'

const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship']

const MIN_DESCRIPTION_LENGTH = 1500

const fieldClass =
  'h-11 px-3.5 w-full bg-white border border-slate-200 rounded-md text-[15px] text-[#1a2340] placeholder:text-slate-400 focus:border-[#1a2340] focus:ring-0 outline-none transition-colors'

const inputClass =
  'h-11 rounded-md border-slate-200 focus-visible:ring-[#1a2340] focus-visible:ring-offset-1'

export default function PostJobForm() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [employmentType, setEmploymentType] = useState(employmentTypes[0])
  const [remote, setRemote] = useState(false)
  const [city, setCity] = useState('')
  const [stateCode, setStateCode] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [salaryPeriod, setSalaryPeriod] = useState<SalaryPeriod>('year')
  const [description, setDescription] = useState('')
  const [notificationEmail, setNotificationEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const descriptionLength = description.trim().length
  const descriptionReached = descriptionLength >= MIN_DESCRIPTION_LENGTH
  const descriptionProgress = Math.min(descriptionLength / MIN_DESCRIPTION_LENGTH, 1)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!company.trim()) return setError('Add your company name.')
    if (!title.trim()) return setError('Add a job title.')
    if (!remote && (!city.trim() || !stateCode.trim()))
      return setError('Add a location, or mark this job as remote.')
    if (!remote && zipCode.trim() && !/^\d{5}(-\d{4})?$/.test(zipCode.trim()))
      return setError('Enter a valid ZIP code.')
    if (!salaryMin || !salaryMax)
      return setError('Add a salary range. It is required on every listing.')
    if (Number(salaryMin) > Number(salaryMax))
      return setError('Minimum salary cannot be higher than the maximum.')
    if (!description.trim() || description.trim().length < MIN_DESCRIPTION_LENGTH)
      return setError(
        `Add a description of at least ${MIN_DESCRIPTION_LENGTH.toLocaleString()} characters.`
      )
    if (!notificationEmail.trim())
      return setError('Add the email where you want to receive applications.')
    if (!/^\S+@\S+\.\S+$/.test(notificationEmail.trim()))
      return setError('Enter a valid email address.')

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/employer/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          company: company.trim(),
          employmentType,
          remote,
          city: remote ? null : city.trim(),
          state: remote ? null : stateCode.trim(),
          zipCode: remote ? null : zipCode.trim() || null,
          salaryMin: Number(salaryMin),
          salaryMax: Number(salaryMax),
          salaryPeriod,
          description: description.trim(),
          notificationEmail: notificationEmail.trim(),
        }),
      })
      if (!res.ok) throw new Error('Something went wrong. Try again.')
      router.push('/dashboard/employer')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 md:py-14">
      {/* Header */}
      <header className="mb-10 md:mb-12">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-slate-500 font-medium mb-5">
          <Link
            href="/dashboard/employer"
            className="hover:text-[#1a2340] transition-colors"
          >
            Employer
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-[#1a2340]">Post a job</span>
        </div>
        <h1 className="text-[32px] md:text-[36px] leading-[1.1] font-semibold tracking-[-0.02em] text-[#1a2340]">
          Post a new job
        </h1>
        <p className="text-[15px] text-slate-500 mt-2.5 leading-relaxed">
          Free, no credit card. Your listing goes live as soon as you submit it.
        </p>
      </header>

      {error && (
        <div className="mb-8 px-4 py-3 border border-red-200 rounded-md bg-red-50">
          <p className="text-[13px] text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* 01 — Job basics */}
        <section>
          <SectionHeader number="01" title="Job basics" />
          <div className="space-y-5">
            <div>
              <FieldLabel required>Job title</FieldLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Warehouse Associate"
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel required>Company name</FieldLabel>
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Acme Logistics"
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel>Employment type</FieldLabel>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className={fieldClass}
              >
                {employmentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* 02 — Location */}
        <section>
          <SectionHeader number="02" title="Location" />
          <div className="space-y-4">
            <label className="flex items-center gap-2.5 text-[13px] text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remote}
                onChange={(e) => setRemote(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#1a2340] focus:ring-[#1a2340] focus:ring-offset-1"
              />
              This is a remote position
            </label>
            {!remote && (
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-2">
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className={inputClass}
                  />
                </div>
                <Input
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value)}
                  placeholder="State (e.g. OH)"
                  className={inputClass}
                />
                <Input
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="ZIP code"
                  className={inputClass}
                />
              </div>
            )}
            {!remote && (
              <p className="text-[12.5px] text-slate-400">
                Adding a ZIP code helps your listing rank better in nearby search results.
              </p>
            )}
          </div>
        </section>

        {/* 03 — Compensation */}
        <section>
          <SectionHeader number="03" title="Compensation" />
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <FieldLabel required className="mb-0">
                Salary range
              </FieldLabel>
              <div className="flex gap-0.5 bg-slate-100 rounded-md p-0.5">
                {(['year', 'hour'] as SalaryPeriod[]).map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setSalaryPeriod(period)}
                    className={`px-2.5 py-1 rounded text-[12px] font-medium transition-colors ${
                      salaryPeriod === period
                        ? 'bg-white text-[#1a2340]'
                        : 'text-slate-500 hover:text-[#1a2340]'
                    }`}
                  >
                    Per {period}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[15px] pointer-events-none">
                  $
                </span>
                <Input
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="Min"
                  className={`${inputClass} pl-8`}
                />
              </div>
              <ArrowRight size={14} className="text-slate-300" />
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[15px] pointer-events-none">
                  $
                </span>
                <Input
                  type="number"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="Max"
                  className={`${inputClass} pl-8`}
                />
              </div>
            </div>
            <p className="text-[12.5px] text-slate-400">
              Required on every listing. Show candidates what you actually pay.
            </p>
          </div>
        </section>

        {/* 04 — Description */}
        <section>
          <SectionHeader number="04" title="Description" />
          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell candidates about the role, what a typical day looks like, who they'd work with, and what makes this a great opportunity..."
              className="w-full bg-white border border-slate-200 rounded-md text-[15px] text-[#1a2340] placeholder:text-slate-400 focus:border-[#1a2340] focus:ring-0 outline-none transition-colors px-3.5 min-h-[320px] py-3 leading-relaxed resize-y"
            />
            <div className="mt-2.5 flex items-center justify-between gap-4 flex-wrap">
              <p className="text-[12.5px] text-slate-400">
                Cover the role, day-to-day, team, and what you&apos;re looking for.
              </p>
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      descriptionReached ? 'bg-emerald-500' : 'bg-[#1a2340]'
                    }`}
                    style={{ width: `${descriptionProgress * 100}%` }}
                  />
                </div>
                <span
                  className={`text-[12px] tabular-nums font-medium ${
                    descriptionReached ? 'text-emerald-600' : 'text-slate-500'
                  }`}
                >
                  {descriptionLength.toLocaleString()} /{' '}
                  {MIN_DESCRIPTION_LENGTH.toLocaleString()}
                </span>
                {descriptionReached && (
                  <Check size={14} className="text-emerald-600" strokeWidth={2.5} />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 05 — Notifications */}
        <section>
          <SectionHeader number="05" title="Notifications" />
          <div>
            <FieldLabel required>Where should we send new applications?</FieldLabel>
            <Input
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              placeholder="jobs@yourcompany.com"
              type="email"
              className={inputClass}
            />
            <p className="text-[12.5px] text-slate-400 mt-1.5">
              Candidates apply on Oh My Job. We&apos;ll email every application to this
              address.
            </p>
          </div>
        </section>

        {/* Submit */}
        <div className="pt-2">
          <Button type="submit" className="w-full h-12 rounded-md" disabled={isSubmitting}>
            {isSubmitting ? 'Posting your job...' : 'Post job'}
          </Button>
        </div>
      </form>
    </div>
  )
}

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-5">
      <span className="text-[11px] font-mono text-slate-300 tabular-nums">{number}</span>
      <h2 className="text-[15px] font-semibold tracking-[-0.005em] text-[#1a2340]">
        {title}
      </h2>
    </div>
  )
}

function FieldLabel({
  children,
  required,
  className = '',
}: {
  children: React.ReactNode
  required?: boolean
  className?: string
}) {
  return (
    <label
      className={`text-[13px] font-medium text-slate-700 mb-1.5 block ${className}`}
    >
      {children}
      {required && <span className="text-slate-400"> *</span>}
    </label>
  )
}