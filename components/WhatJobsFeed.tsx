'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, MapPin } from 'lucide-react'
import type { WhatJobsJob, WhatJobsResponse } from '@/lib/whatjobs'

type FeedState = 'loading' | 'ready' | 'empty' | 'error'

function getTrackingToken(onmousedown: string | null): string | null {
  const match = onmousedown?.match(/^\s*pnpClick\(this,\s*['\"]([^'\"]+)['\"]\);?\s*$/)
  return match?.[1] || null
}

function WhatJobsCard({ job }: { job: WhatJobsJob }) {
  const trackingToken = getTrackingToken(job.onmousedown)
  const companyName = job.company || 'Company not listed'

  function trackMouseDown(event: React.MouseEvent<HTMLAnchorElement>) {
    // WhatJobs returns pnpClick(this, 'token'). Never evaluate a response as
    // JavaScript; invoke their tracker only when their integration script is
    // present and the returned format matches the documented signature.
    const tracker = (window as Window & {
      pnpClick?: (element: HTMLAnchorElement, token: string) => void
    }).pnpClick

    if (trackingToken && typeof tracker === 'function') {
      tracker(event.currentTarget, trackingToken)
    }
  }

  return (
    <article className="group relative rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 md:p-6">
      <a
        href={job.url}
        rel="nofollow sponsored"
        onMouseDown={trackMouseDown}
        className="absolute inset-0 z-0"
        aria-label={`View ${job.title} at ${companyName} on WhatJobs`}
      />

      <div className="relative z-10 mb-3 flex items-start gap-3 pointer-events-none">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 md:h-12 md:w-12">
          {job.logo ? (
            <img src={job.logo} alt="" className="h-full w-full object-contain" />
          ) : (
            <span className="text-base font-medium text-slate-500">{companyName.charAt(0).toUpperCase()}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium uppercase tracking-wider text-slate-500">{companyName}</p>
          <p className="mt-1 text-xs text-slate-400 md:hidden">{job.location || 'United States'}</p>
        </div>
      </div>

      <h3 className="relative z-10 mb-2 line-clamp-2 text-base font-semibold text-slate-900 transition-colors group-hover:text-blue-600 pointer-events-none md:mb-3 md:text-lg">
        {job.title}
      </h3>

      {job.location && (
        <p className="relative z-10 mb-4 hidden items-center gap-1.5 text-sm text-slate-500 pointer-events-none md:flex">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">{job.location}</span>
        </p>
      )}

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 pointer-events-none">
        <div>
          {job.salary ? (
            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 md:px-2.5 md:py-1 md:text-sm">
              {job.salary}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 md:px-2.5 md:py-1 md:text-sm">
              Salary not listed
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {job.age && <span className="text-xs text-slate-400">{job.age}</span>}
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
            View job <ExternalLink className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </article>
  )
}

export default function WhatJobsFeed({
  keyword,
  location,
  titleIncludesAny = [],
  titleIncludesAll = [],
  titleExcludes = [],
}: {
  keyword?: string
  location?: string
  titleIncludesAny?: string[]
  titleIncludesAll?: string[]
  titleExcludes?: string[]
}) {
  const [state, setState] = useState<FeedState>('loading')
  const [jobs, setJobs] = useState<WhatJobsJob[]>([])

  useEffect(() => {
    const controller = new AbortController()
    const query = new URLSearchParams({ keyword: keyword?.trim() || 'solar' })
    if (location?.trim()) query.set('location', location.trim())

    setState('loading')
    fetch(`/api/whatjobs?${query.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('WhatJobs request failed')
        return response.json() as Promise<WhatJobsResponse>
      })
      .then((data) => {
        const matchesTitleRule = (job: WhatJobsJob) => {
          const title = job.title.toLowerCase()
          const includesMatch = titleIncludesAny.length === 0 || titleIncludesAny.some((phrase) => title.includes(phrase.toLowerCase()))
          const includesAllMatch = titleIncludesAll.every((phrase) => title.includes(phrase.toLowerCase()))
          const excludesMatch = titleExcludes.some((phrase) => title.includes(phrase.toLowerCase()))
          return includesMatch && includesAllMatch && !excludesMatch
        }
        const matches = (data.data || []).filter(matchesTitleRule).slice(0, 6)
        setJobs(matches)
        setState(matches.length ? 'ready' : 'empty')
      })
      .catch((error: unknown) => {
        if ((error as { name?: string }).name !== 'AbortError') setState('error')
      })

    return () => controller.abort()
  }, [keyword, location, titleExcludes, titleIncludesAll, titleIncludesAny])

  if (state === 'empty' || state === 'error') return null

  // This component is rendered inside the main listing grid. Returning the
  // cards directly lets CSS grid fill any incomplete direct-job row.
  if (state === 'loading') {
    return <>{[0, 1, 2, 3, 4, 5].map((index) => <div key={index} className="h-56 animate-pulse rounded-xl bg-slate-100" />)}</>
  }

  return <>{jobs.map((job) => <WhatJobsCard key={job.url} job={job} />)}</>
}
