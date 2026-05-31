'use client'

import { useQuery } from '@tanstack/react-query'
import JobCard from './JobCard'
import { Button } from '@/components/ui/button'
import { useState, useRef, useEffect, useMemo } from 'react'
import { Bell, Check, ChevronDown } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

const JOB_TYPES = [
  'All job types',
  'Full-time',
  'Part-time',
  'Contract',
  'Remote',
  'Hybrid',
  'Internship',
  'Temporary',
  'Per diem',
]

const US_LOCATIONS = [
  'All locations',
  'New York, NY',
  'Los Angeles, CA',
  'Chicago, IL',
  'Houston, TX',
  'Phoenix, AZ',
  'Philadelphia, PA',
  'San Antonio, TX',
  'San Diego, CA',
  'Dallas, TX',
  'San Jose, CA',
  'Austin, TX',
  'Jacksonville, FL',
  'Fort Worth, TX',
  'Columbus, OH',
  'Charlotte, NC',
  'Indianapolis, IN',
  'San Francisco, CA',
  'Seattle, WA',
  'Denver, CO',
  'Nashville, TN',
  'Oklahoma City, OK',
  'El Paso, TX',
  'Washington, DC',
  'Las Vegas, NV',
  'Louisville, KY',
  'Memphis, TN',
  'Portland, OR',
  'Baltimore, MD',
  'Milwaukee, WI',
  'Atlanta, GA',
  'Miami, FL',
  'Minneapolis, MN',
  'Boston, MA',
  'Remote (US)',
]

const JOB_CATEGORIES = [
  'All categories',
  'Technology & Software',
  'Healthcare & Nursing',
  'Finance & Accounting',
  'Sales & Business Dev.',
  'Marketing & Advertising',
  'Education & Teaching',
  'Engineering',
  'Customer Service',
  'Administrative & Office',
  'Manufacturing & Logistics',
  'Construction & Trades',
  'Retail & Hospitality',
  'Legal',
  'Human Resources',
  'Creative & Design',
  'Science & Research',
  'Transportation & Delivery',
  'Government & Public Sector',
  'Non-profit & Social Services',
]

const EXPERIENCE_LEVELS = [
  'All levels',
  'Internship',
  'Entry / Junior',
  'Mid-Level',
  'Senior',
  'Manager / Lead',
  'Director',
  'Executive / VP+',
]

const WORK_ARRANGEMENTS = [
  'All arrangements',
  'Remote',
  'Hybrid',
  'On-site',
]

interface JobListProps {
  what: string
  where: string
  salary_min?: string
  initialData?: { results: any[]; count: number } // ← données SSR pour Googlebot
}

function AlertDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isActive = value !== options[0]

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
          isActive
            ? 'bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <span className="max-w-[140px] truncate">{isActive ? value : label}</span>
        <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[200px] max-h-64 overflow-y-auto"
          style={{ top: '100%', left: 0 }}
        >
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false) }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                value === opt
                  ? 'bg-gray-900 text-white font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function JobList({ what, where, salary_min, initialData }: JobListProps) {
  const searchParams = useSearchParams()
  const [page, setPage] = useState(1)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [frequency, setFrequency] = useState<'weekly' | 'twice'>('weekly')
  const [alertJobType, setAlertJobType] = useState(JOB_TYPES[0])
  const [alertLocation, setAlertLocation] = useState(US_LOCATIONS[0])
  const [alertCategory, setAlertCategory] = useState(JOB_CATEGORIES[0])
  const [alertExperience, setAlertExperience] = useState(EXPERIENCE_LEVELS[0])
  const [alertArrangement, setAlertArrangement] = useState(WORK_ARRANGEMENTS[0])

  const resolvedWhat = what || ''
  const resolvedWhere = where || ''

  // Build back URL preserving all current filters + current page
  const backUrl = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (page > 1) {
      params.set('page', page.toString())
    } else {
      params.delete('page')
    }
    const qs = params.toString()
    return qs ? `/jobs?${qs}` : '/jobs'
  }, [searchParams, page])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['jobs', resolvedWhat, resolvedWhere, salary_min, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        what: resolvedWhat,
        where: resolvedWhere,
        page: page.toString(),
        results_per_page: '30',
      })
      if (salary_min) params.set('salary_min', salary_min)
      const res = await fetch(`/api/jobs-all?${params}`)
      if (!res.ok) throw new Error('Failed to fetch jobs')
      return res.json()
    },
    // ← Page 1 : on utilise les données SSR directement, pas de fetch client
    // Page 2+ : fetch client normal
    initialData: page === 1 && initialData ? initialData : undefined,
    retry: 1,
  })

  const totalPages = data?.count ? Math.ceil(data.count / 30) : 1
  const jobType = resolvedWhat ? `${resolvedWhat} ` : ''

  // Loading state — ne s'affiche pas sur page 1 grâce à initialData
  if (isLoading) {
    return (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-80 bg-muted rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  // Error state
  if (isError && !data?.results) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Unable to load jobs. Please try again.</p>
        <Button variant="outline" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* Jobs */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
        {(data?.results || []).map((job: any) => (
          <JobCard key={job.id} job={job} backUrl={backUrl} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4 mt-10">
        <Button
          variant="outline"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          ← Previous
        </Button>
        <span className="text-sm text-muted-foreground">Page {page}</span>
        <Button
          variant="outline"
          onClick={() => setPage(p => p + 1)}
          disabled={page >= totalPages}
        >
          Next →
        </Button>
      </div>

      {/* Newsletter */}
      <div className="mt-16 bg-white border border-gray-200 shadow-sm text-gray-900 rounded-3xl p-10">
        <div className="flex items-center gap-5 mb-8">
          <Bell className="w-12 h-10 flex-shrink-0 text-gray-900" />
          <div>
            <h3 className="text-xl font-bold tracking-tight text-gray-900">
              Get the newest {jobType}jobs in your inbox 📧
            </h3>
            <p className="text-gray-400 mt-1">Weekly updates delivered straight to you.</p>
          </div>
        </div>

        {/* Fréquence */}
        <div className="flex flex-wrap gap-3 mb-10">
          <button
            onClick={() => setFrequency('weekly')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              frequency === 'weekly'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setFrequency('twice')}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
              frequency === 'twice'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            2x / Week
          </button>
          <AlertDropdown
            label="All job types"
            options={JOB_TYPES}
            value={alertJobType}
            onChange={setAlertJobType}
          />
          <AlertDropdown
            label="All locations"
            options={US_LOCATIONS}
            value={alertLocation}
            onChange={setAlertLocation}
          />
          <AlertDropdown
            label="All categories"
            options={JOB_CATEGORIES}
            value={alertCategory}
            onChange={setAlertCategory}
          />
          <AlertDropdown
            label="All levels"
            options={EXPERIENCE_LEVELS}
            value={alertExperience}
            onChange={setAlertExperience}
          />
          <AlertDropdown
            label="All arrangements"
            options={WORK_ARRANGEMENTS}
            value={alertArrangement}
            onChange={setAlertArrangement}
          />
        </div>

        {/* Formulaire */}
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            if (!email) return
            const res = await fetch('/api/alerts/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email,
                frequency,
                what: resolvedWhat,
                where: alertLocation !== US_LOCATIONS[0] ? alertLocation : resolvedWhere,
                salaryMin: salary_min,
                jobType: alertJobType !== JOB_TYPES[0] ? alertJobType : undefined,
                category: alertCategory !== JOB_CATEGORIES[0] ? alertCategory : undefined,
                experience: alertExperience !== EXPERIENCE_LEVELS[0] ? alertExperience : undefined,
                arrangement: alertArrangement !== WORK_ARRANGEMENTS[0] ? alertArrangement : undefined,
              }),
            })
            if (res.ok) {
              setSubscribed(true)
            } else {
              alert("Error subscribing. Please try again.")
            }
          }}
          className="flex gap-1"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 bg-gray-50 border border-gray-200 focus:border-emerald-400 rounded-md px-2 py-3 text-xs text-gray-700 placeholder:text-gray-300 outline-none"
          />
          <button
            type="submit"
            className="bg-emerald-400 hover:bg-emerald-500 text-white font-medium px-2.5 py-1 rounded-md flex items-center gap-1 text-xs transition-all active:scale-95"
          >
            Subscribe
            <Check className="w-3 h-3" />
          </button>
        </form>

        {subscribed && (
          <p className="mt-4 text-emerald-400 flex items-center gap-2 text-sm font-medium">
            ✅ Thanks! you are now subscribed.
          </p>
        )}
      </div>
    </div>
  )
}