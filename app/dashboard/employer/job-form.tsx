// app/dashboard/employer/job-form.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, Check } from 'lucide-react'
import { STATES } from '@/lib/usStates'
import { createClient } from '@/lib/supabase'

type SalaryPeriod = 'year' | 'hour'

const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship']
const stateOptions = Object.entries(STATES).sort(([a], [b]) => a.localeCompare(b))
const MIN_DESCRIPTION_LENGTH = 1000
const DRAFT_KEY = 'ohMyJob_jobDraft'

const fieldClass =
  'h-11 px-3.5 w-full bg-white border border-slate-300 rounded-md text-base text-[#1a2340] placeholder:text-slate-500 focus:border-[#1a2340] focus:ring-0 outline-none transition-colors'

const inputClass =
  'h-11 text-base rounded-md border-slate-300 focus-visible:ring-[#1a2340] focus-visible:ring-offset-1'

export type JobFormInitialData = {
  title: string
  company: string
  employmentType: string
  remote: boolean
  city: string
  stateName: string
  zipCode: string
  salaryMin: string
  salaryMax: string
  salaryPeriod: SalaryPeriod
  description: string
  notificationEmail: string
}

type DraftPayload = JobFormInitialData

export default function JobForm({
  mode,
  jobId,
  initialData,
}: {
  mode: 'create' | 'edit'
  jobId?: string
  initialData?: JobFormInitialData
}) {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [company, setCompany] = useState(initialData?.company ?? '')
  const [employmentType, setEmploymentType] = useState(initialData?.employmentType ?? employmentTypes[0])
  const [remote, setRemote] = useState(initialData?.remote ?? false)
  const [city, setCity] = useState(initialData?.city ?? '')
  const [stateName, setStateName] = useState(initialData?.stateName ?? '')
  const [zipCode, setZipCode] = useState(initialData?.zipCode ?? '')
  const [salaryMin, setSalaryMin] = useState(initialData?.salaryMin ?? '')
  const [salaryMax, setSalaryMax] = useState(initialData?.salaryMax ?? '')
  const [salaryPeriod, setSalaryPeriod] = useState<SalaryPeriod>(initialData?.salaryPeriod ?? 'year')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [notificationEmail, setNotificationEmail] = useState(initialData?.notificationEmail ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [autoSubmitting, setAutoSubmitting] = useState(false)

  async function submitPayload(payload: Record<string, unknown>) {
    const res =
      mode === 'create'
        ? await fetch('/api/employer/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/employer/jobs/${jobId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      throw new Error(data?.error || 'Something went wrong. Try again.')
    }
  }

  function buildPayload(values: {
    title: string
    company: string
    employmentType: string
    remote: boolean
    city: string
    stateName: string
    zipCode: string
    salaryMin: string
    salaryMax: string
    salaryPeriod: SalaryPeriod
    description: string
    notificationEmail: string
  }) {
    const resolvedStateCode = values.remote ? null : STATES[values.stateName.trim()]
    return {
      title: values.title.trim(),
      company: values.company.trim(),
      employmentType: values.employmentType,
      remote: values.remote,
      city: values.remote ? null : values.city.trim(),
      state: resolvedStateCode,
      zipCode: values.remote ? null : values.zipCode.trim(),
      salaryMin: Number(values.salaryMin),
      salaryMax: Number(values.salaryMax),
      salaryPeriod: values.salaryPeriod,
      description: values.description.trim(),
      notificationEmail: values.notificationEmail.trim(),
    }
  }

  function validateValues(values: {
    title: string
    company: string
    remote: boolean
    city: string
    stateName: string
    zipCode: string
    salaryMin: string
    salaryMax: string
    description: string
    notificationEmail: string
  }): string | null {
    if (!values.company.trim()) return 'Add your company name.'
    if (!values.title.trim()) return 'Add a job title.'
    if (!values.remote && (!values.city.trim() || !values.stateName.trim()))
      return 'Add a location, or mark this job as remote.'
    if (!values.remote && !STATES[values.stateName.trim()]) return 'Select a valid US state from the list.'
    if (!values.remote && !values.zipCode.trim()) return 'Add a ZIP code.'
    if (!values.remote && !/^\d{5}(-\d{4})?$/.test(values.zipCode.trim()))
      return 'Enter a valid US ZIP code (e.g. 90210 or 90210-1234).'
    if (!values.salaryMin || !values.salaryMax) return 'Add a salary range. It is required on every listing.'
    if (Number(values.salaryMin) > Number(values.salaryMax))
      return 'Minimum salary cannot be higher than the maximum.'
    if (!values.description.trim() || values.description.trim().length < MIN_DESCRIPTION_LENGTH)
      return `Add a description of at least ${MIN_DESCRIPTION_LENGTH.toLocaleString()} characters.`
    if (!values.notificationEmail.trim())
      return 'Add the email where you want to receive applications.'
    if (!/^\S+@\S+\.\S+$/.test(values.notificationEmail.trim())) return 'Enter a valid email address.'
    return null
  }

  function validate(): string | null {
    return validateValues({
      title, company, remote, city, stateName, zipCode,
      salaryMin, salaryMax, description, notificationEmail,
    })
  }

  function saveDraft() {
    const draft: DraftPayload = {
      title, company, employmentType, remote, city, stateName, zipCode,
      salaryMin, salaryMax, salaryPeriod, description, notificationEmail,
    }
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  }

  // Restore a draft saved before being sent to login, and auto-submit it —
  // the user already clicked "Post job" once before being redirected to auth.
  useEffect(() => {
    if (mode !== 'create') return
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return

    let draft: DraftPayload
    try {
      draft = JSON.parse(raw)
    } catch {
      sessionStorage.removeItem(DRAFT_KEY)
      return
    }
    sessionStorage.removeItem(DRAFT_KEY)

    // Prefill fields in case auto-submit fails and the user needs to retry manually.
    setTitle(draft.title)
    setCompany(draft.company)
    setEmploymentType(draft.employmentType)
    setRemote(draft.remote)
    setCity(draft.city)
    setStateName(draft.stateName)
    setZipCode(draft.zipCode)
    setSalaryMin(draft.salaryMin)
    setSalaryMax(draft.salaryMax)
    setSalaryPeriod(draft.salaryPeriod)
    setDescription(draft.description)
    setNotificationEmail(draft.notificationEmail)

    const validationError = validateValues(draft)
    if (validationError) {
      setError(validationError)
      return
    }

    setAutoSubmitting(true)
    setIsSubmitting(true)
    submitPayload(buildPayload(draft))
      .then(() => {
        router.push('/dashboard/employer?posted=1')
        router.refresh()
      })
      .catch((err) => {
        setAutoSubmitting(false)
        setIsSubmitting(false)
        setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  const descriptionLength = description.trim().length
  const descriptionReached = descriptionLength >= MIN_DESCRIPTION_LENGTH
  const descriptionProgress = Math.min(descriptionLength / MIN_DESCRIPTION_LENGTH, 1)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const validationError = validate()
    if (validationError) return setError(validationError)

    setIsSubmitting(true)

    if (mode === 'create') {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        saveDraft()
        router.push('/auth/login?redirectTo=/dashboard/employer/new')
        return
      }
    }

    try {
      await submitPayload(
        buildPayload({
          title, company, employmentType, remote, city, stateName, zipCode,
          salaryMin, salaryMax, salaryPeriod, description, notificationEmail,
        })
      )
      router.push(mode === 'create' ? '/dashboard/employer?posted=1' : '/dashboard/employer')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
      setIsSubmitting(false)
    }
  }

  if (autoSubmitting) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <p className="text-slate-500">Publishing your job...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 md:py-14">
      <header className="mb-10 md:mb-12">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-500 font-medium mb-5">
          <Link href="/dashboard/employer" className="hover:text-[#1a2340] transition-colors">
            Employer
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-[#1a2340]">{mode === 'create' ? 'Post a job' : 'Edit job'}</span>
        </div>
        <h1 className="text-[32px] md:text-[36px] leading-[1.1] font-semibold tracking-[-0.02em] text-[#1a2340]">
          {mode === 'create' ? 'Post a new job' : 'Edit your job posting'}
        </h1>
      </header>

      {error && (
        <div className="mb-8 px-4 py-3 border border-red-200 rounded-md bg-red-50">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-12">
        <section>
          <SectionHeader number="01" title="Job basics" />
          <div className="space-y-5">
            <div>
              <FieldLabel required>Job title</FieldLabel>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Warehouse Associate" className={inputClass} />
            </div>
            <div>
              <FieldLabel required>Company name</FieldLabel>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Acme Logistics" className={inputClass} />
            </div>
            <div>
              <FieldLabel required>Employment type</FieldLabel>
              <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className={fieldClass}>
                {employmentTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section>
          <SectionHeader number="02" title="Location" />
          <div className="space-y-4">
            <label className="flex items-center gap-2.5 text-sm text-slate-600 cursor-pointer select-none">
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
                  <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className={inputClass} />
                </div>
                <div>
                  <Input
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    onBlur={() => {
                      if (stateName.trim() && !STATES[stateName.trim()]) setStateName('')
                    }}
                    placeholder="State"
                    list="state-suggestions"
                    className={inputClass}
                  />
                  <datalist id="state-suggestions">
                    {stateOptions.map(([name]) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </div>
                <Input
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.replace(/[^\d-]/g, ''))}
                  placeholder="ZIP code *"
                  inputMode="numeric"
                  maxLength={10}
                  className={inputClass}
                />
              </div>
            )}
            {!remote && (
              <p className="text-sm text-slate-400">
                Required — helps your listing rank better in nearby search results.
              </p>
            )}
          </div>
        </section>

        <section>
          <SectionHeader number="03" title="Compensation" />
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <FieldLabel required className="mb-0">Salary range</FieldLabel>
              <div className="flex gap-0.5 bg-slate-100 rounded-md p-0.5">
                {(['year', 'hour'] as SalaryPeriod[]).map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setSalaryPeriod(period)}
                    className={`px-2.5 py-1 rounded text-sm font-medium transition-colors ${
                      salaryPeriod === period ? 'bg-white text-[#1a2340]' : 'text-slate-500 hover:text-[#1a2340]'
                    }`}
                  >
                    Per {period}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">$</span>
                <Input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="Min" className={`${inputClass} pl-8`} />
              </div>
              <ArrowRight size={14} className="text-slate-300" />
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">$</span>
                <Input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="Max" className={`${inputClass} pl-8`} />
              </div>
            </div>
            <p className="text-sm text-slate-400">Required on every listing. Show candidates what you actually pay.</p>
          </div>
        </section>

        <section>
          <SectionHeader number="04" title="Description" />
          <div>
            <FieldLabel required className="sr-only">Description</FieldLabel>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell candidates about the role, what a typical day looks like, who they'd work with, and what makes this a great opportunity..."
              className="w-full bg-white border border-slate-300 rounded-md text-base text-[#1a2340] placeholder:text-slate-500 focus:border-[#1a2340] focus:ring-0 outline-none transition-colors px-3.5 min-h-[320px] py-3 leading-relaxed resize-y"
            />
            <div className="mt-2.5 flex items-center justify-between gap-4 flex-wrap">
              <p className="text-sm text-slate-400">Cover the role, day-to-day, team, and what you&apos;re looking for.</p>
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${descriptionReached ? 'bg-emerald-500' : 'bg-[#1a2340]'}`}
                    style={{ width: `${descriptionProgress * 100}%` }}
                  />
                </div>
                <span className={`text-sm tabular-nums font-medium ${descriptionReached ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {descriptionLength.toLocaleString()} / {MIN_DESCRIPTION_LENGTH.toLocaleString()}
                </span>
                {descriptionReached && <Check size={14} className="text-emerald-600" strokeWidth={2.5} />}
              </div>
            </div>
          </div>
        </section>

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
            <p className="text-sm text-slate-400 mt-1.5">
              Candidates apply on Oh My Job. We&apos;ll email every application to this address.
            </p>
          </div>
        </section>

        <div className="pt-2">
          <Button type="submit" className="w-full h-12 rounded-md text-base" disabled={isSubmitting}>
            {isSubmitting
              ? mode === 'create' ? 'Posting your job...' : 'Saving changes...'
              : mode === 'create' ? 'Post job' : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-5">
      <span className="text-xs font-mono text-slate-300 tabular-nums">{number}</span>
      <h2 className="text-base font-semibold tracking-[-0.005em] text-[#1a2340]">{title}</h2>
    </div>
  )
}

function FieldLabel({ children, required, className = '' }: { children: React.ReactNode; required?: boolean; className?: string }) {
  return (
    <label className={`text-sm font-medium text-slate-700 mb-1.5 block ${className}`}>
      {children}
      {required && <span className="text-slate-400"> *</span>}
    </label>
  )
}