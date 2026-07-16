// app/dashboard/employer/new/post-job-form.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft } from 'lucide-react'

type ApplyMethod = 'url' | 'email'
type SalaryPeriod = 'year' | 'hour'

const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship']

const fieldClass =
  'h-12 px-4 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-400 transition-all outline-none text-[#1a2340]'

export default function PostJobForm() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [employmentType, setEmploymentType] = useState(employmentTypes[0])
  const [remote, setRemote] = useState(false)
  const [city, setCity] = useState('')
  const [stateCode, setStateCode] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [salaryPeriod, setSalaryPeriod] = useState<SalaryPeriod>('year')
  const [description, setDescription] = useState('')
  const [applyMethod, setApplyMethod] = useState<ApplyMethod>('url')
  const [applyValue, setApplyValue] = useState('')
const [company, setCompany] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
if (!company.trim()) return setError('Add your company name.')
    if (!title.trim()) return setError('Add a job title.')

      
    if (!remote && (!city.trim() || !stateCode.trim())) return setError('Add a location, or mark this job as remote.')
    if (!salaryMin || !salaryMax) return setError('Add a salary range. It is required on every listing.')
    if (Number(salaryMin) > Number(salaryMax)) return setError('Minimum salary cannot be higher than the maximum.')
    if (!description.trim() || description.trim().length < 50) return setError('Add a description of at least 50 characters.')
    if (!applyValue.trim()) return setError(applyMethod === 'url' ? 'Add the application link.' : 'Add the application email.')
    if (applyMethod === 'url' && !/^https?:\/\//.test(applyValue.trim())) return setError('The application link must start with http:// or https://')
    if (applyMethod === 'email' && !/^\S+@\S+\.\S+$/.test(applyValue.trim())) return setError('Enter a valid application email.')

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
          salaryMin: Number(salaryMin),
          salaryMax: Number(salaryMax),
          salaryPeriod,
          description: description.trim(),
          applyMethod,
          applyValue: applyValue.trim(),
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
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link href="/dashboard/employer" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1a2340] transition-colors mb-6">
        <ArrowLeft size={16} />
        Back to your postings
      </Link>

      <h1 className="text-3xl font-bold text-[#1a2340] mb-1">Post a job</h1>
      <p className="text-gray-500 mb-10">Free, no credit card required. Your listing goes live as soon as you submit it.</p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Job details */}
        <section className="space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Job details</h2>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Job title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Warehouse Associate"
              className="h-12 rounded-xl border-gray-200"
            />
          </div>

          <div>
  <label className="text-sm font-semibold text-gray-700 mb-2 block">Company name</label>
  <Input
    value={company}
    onChange={(e) => setCompany(e.target.value)}
    placeholder="e.g. Acme Logistics"
    className="h-12 rounded-xl border-gray-200"
  />
</div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Employment type</label>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              className={fieldClass}
            >
              {employmentTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">Location</label>
              <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remote}
                  onChange={(e) => setRemote(e.target.checked)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-400"
                />
                This is a remote position
              </label>
            </div>
            {!remote && (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="h-12 rounded-xl border-gray-200"
                />
                <Input
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value)}
                  placeholder="State (e.g. OH)"
                  className="h-12 rounded-xl border-gray-200"
                />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">Salary range</label>
              <div className="flex gap-1 bg-gray-100 rounded-full p-1">
                {(['year', 'hour'] as SalaryPeriod[]).map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setSalaryPeriod(period)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      salaryPeriod === period ? 'bg-white text-[#1a2340] shadow-sm' : 'text-gray-500'
                    }`}
                  >
                    Per {period}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <Input
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="Min"
                  className="h-12 rounded-xl border-gray-200 pl-8"
                />
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <Input
                  type="number"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="Max"
                  className="h-12 rounded-xl border-gray-200 pl-8"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Required. Every listing on Oh My Job shows a salary range to job seekers.</p>
          </div>
        </section>

        {/* Description */}
        <section className="space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Description</h2>
          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the role, responsibilities, and what makes a good fit."
              rows={8}
              className={`${fieldClass} h-auto py-3 resize-y`}
            />
            <p className="text-xs text-gray-400 mt-2">{description.trim().length} characters (minimum 50)</p>
          </div>
        </section>

        {/* How to apply */}
        <section className="space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">How to apply</h2>
          <div className="flex gap-1 bg-gray-100 rounded-full p-1 w-fit">
            <button
              type="button"
              onClick={() => setApplyMethod('url')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                applyMethod === 'url' ? 'bg-white text-[#1a2340] shadow-sm' : 'text-gray-500'
              }`}
            >
              Application link
            </button>
            <button
              type="button"
              onClick={() => setApplyMethod('email')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                applyMethod === 'email' ? 'bg-white text-[#1a2340] shadow-sm' : 'text-gray-500'
              }`}
            >
              Application email
            </button>
          </div>
          <Input
            value={applyValue}
            onChange={(e) => setApplyValue(e.target.value)}
            placeholder={applyMethod === 'url' ? 'https://yourcompany.com/careers/apply' : 'jobs@yourcompany.com'}
            type={applyMethod === 'url' ? 'url' : 'email'}
            className="h-12 rounded-xl border-gray-200"
          />
          <p className="text-xs text-gray-400">
            {applyMethod === 'url'
              ? 'Candidates are sent to this link when they click apply.'
              : 'Candidates are shown this email address to send their application.'}
          </p>
        </section>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Posting your job...' : 'Post job'}
        </Button>
      </form>
    </div>
  )
}