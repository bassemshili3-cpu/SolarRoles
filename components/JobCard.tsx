'use client'

import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'

interface JobCardProps {
  job: {
    id: string
    title: string
    company: string
    url?: string
    apply_url?: string
    source?: 'lensa' | 'adzuna'
    location?: string | { display_name?: string }
    salary_min?: number
    salary_max?: number
    salary_period?: string
    category?: { label?: string }
    created?: string
    company_logo?: string
  }
}

export default function JobCard({ job }: JobCardProps) {
  const formatSalary = (min?: number, max?: number, period?: string) => {
    if (!min && !max) return null
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    })
    const periodLabel = period === 'monthly' ? '/mo' : period === 'yearly' ? '/yr' : ''
    if (min && max) return `${formatter.format(min)} - ${formatter.format(max)}${periodLabel}`
    if (min) return `From ${formatter.format(min)}${periodLabel}`
    if (max) return `Up to ${formatter.format(max)}${periodLabel}`
    return null
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently posted'
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'Recently posted'
    }
  }

  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_period)
  const logoSrc = job.company_logo ?? null
  const jobUrl = job.apply_url || job.url || '#'

  const locationLabel =
    typeof job.location === 'string'
      ? job.location
      : job.location?.display_name || 'United States'

  return (
    
      <a href={jobUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-200">
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt={job.company}
              width={48}
              height={48}
              className="w-full h-full object-contain"
              unoptimized
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          ) : (
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 truncate">
            {job.company}
          </p>
          {job.source === 'lensa' && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-600 font-medium mt-1">
              Featured
            </span>
          )}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-slate-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
        {job.title}
      </h3>

      <div className="flex items-center gap-1.5 text-slate-500 mb-4">
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-sm truncate">{locationLabel}</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {salary ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-sm font-medium">
              {salary}
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-sm font-medium">
              Competitive
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {job.category?.label && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
              {job.category.label}
            </span>
          )}
          <span className="text-xs text-slate-400">
            {formatDate(job.created)}
          </span>
        </div>
      </div>
    </a>
  )
}