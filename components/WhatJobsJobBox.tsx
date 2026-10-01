'use client'

import { useEffect, useState } from 'react'
import { Clock3, ExternalLink, MapPin } from 'lucide-react'
import type { WhatJobsJob, WhatJobsResponse } from '@/lib/whatjobs'
import { getRelatedWhatJobsSearches, isRelatedWhatJobsResult } from '@/lib/whatjobsRelatedSearch'
import { isNewWhatJobsJob } from '@/lib/whatjobsNew'

type FeedState = 'loading' | 'ready' | 'empty' | 'error'

function getTrackingToken(onmousedown: string | null): string | null {
  const match = onmousedown?.match(/^\s*pnpClick\(this,\s*['"]([^'"]+)['"]\);?\s*$/)
  return match?.[1] || null
}

export default function WhatJobsJobBox({ search, location }: { search: string; location: string }) {
  const [isDesktop, setIsDesktop] = useState(false)
  const [state, setState] = useState<FeedState>('loading')
  const [jobs, setJobs] = useState<WhatJobsJob[]>([])
  const [selectedSearch, setSelectedSearch] = useState(() => getRelatedWhatJobsSearches(search, location)[0])

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)')
    const update = () => setIsDesktop(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!isDesktop) return

    const controller = new AbortController()
    const searches = getRelatedWhatJobsSearches(search, location)
    setState('loading')
    setSelectedSearch(searches[0])
    const loadRelatedJobs = async () => {
      for (const query of searches) {
        const params = new URLSearchParams({ keyword: query.keyword })
        if (query.location) params.set('location', query.location)
        const response = await fetch(`/api/whatjobs?${params.toString()}`, { signal: controller.signal })
        if (!response.ok) throw new Error(`WhatJobs request failed: ${response.status}`)
        const data = await response.json() as WhatJobsResponse
        const matches = (data.data || []).filter((job) => isRelatedWhatJobsResult(job, search)).slice(0, 6)
        if (matches.length) {
          setJobs(matches)
          setSelectedSearch(query)
          setState('ready')
          return
        }
      }
      setJobs([])
      setSelectedSearch(searches[searches.length - 1])
      setState('empty')
    }

    loadRelatedJobs()
      .catch((error: unknown) => {
        if ((error as { name?: string }).name !== 'AbortError') setState('error')
      })

    return () => controller.abort()
  }, [isDesktop, location, search])

  if (!isDesktop) return null

  return (
    <section className="w-full border border-slate-200 bg-white p-4 text-left" aria-label="Related jobs from WhatJobs">
      {state === 'loading' ? (
        <div className="space-y-3 py-4">
          {[0, 1, 2, 3, 4, 5].map((index) => <div key={index} className="h-14 animate-pulse bg-slate-100" />)}
        </div>
      ) : state === 'ready' ? (
        <ul className="divide-y divide-slate-200">
          {jobs.map((job) => {
            const trackingToken = getTrackingToken(job.onmousedown)
            const isNew = isNewWhatJobsJob(job)
            const postingAge = job.age || (job.age_days !== null && job.age_days >= 0
              ? job.age_days === 0 ? 'Today' : `${job.age_days} ${job.age_days === 1 ? 'day' : 'days'} ago`
              : null)
            return (
              <li key={job.url}>
                <a
                  href={job.url}
                  rel="nofollow sponsored"
                  onMouseDown={(event) => {
                    const tracker = (window as Window & {
                      pnpClick?: (element: HTMLAnchorElement, token: string) => void
                    }).pnpClick
                    if (trackingToken && typeof tracker === 'function') tracker(event.currentTarget, trackingToken)
                  }}
                  className="block py-3 transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-start gap-2">
                    <p className="min-w-0 flex-1 line-clamp-2 text-sm font-semibold leading-5 text-slate-900 hover:text-[#ef2626]">{job.title}</p>
                    {isNew && (
                      <span className="mt-0.5 inline-flex shrink-0 items-center rounded-full border border-[#F4B7BD] bg-[#FFF1F2] px-1.5 py-0.5 text-[10px] font-bold leading-none tracking-wide text-[#B91C2B]">
                        NEW
                      </span>
                    )}
                  </div>
                  {job.company && <p className="mt-1 truncate text-xs text-slate-600">{job.company}</p>}
                  {job.location && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </p>
                  )}
                  {(job.salary || postingAge) && (
                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                      {job.salary && <span className="font-semibold text-emerald-700">{job.salary}</span>}
                      {postingAge && (
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <Clock3 className="h-3 w-3 shrink-0" />
                          {postingAge}
                        </span>
                      )}
                    </div>
                  )}
                  {!job.salary && !postingAge && job.snippet && (
                    <p className="mt-2 line-clamp-2 text-xs leading-4 text-slate-500">{job.snippet}</p>
                  )}
                </a>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="py-4 text-sm text-slate-600">
          {state === 'empty' ? 'No related jobs found for this search.' : 'Related jobs are temporarily unavailable.'}
        </p>
      )}

      <form method="post" action="https://www.whatjobs.com/searchbox" target="_blank" className="mt-3 border-t border-slate-200 pt-3">
        <input type="hidden" name="keyword" value={selectedSearch.keyword} />
        <input type="hidden" name="location" value={selectedSearch.location} />
        <input type="hidden" name="utm_source" value="7186" />
        <button type="submit" className="inline-flex w-full items-center justify-center gap-2 border border-slate-900 px-3 py-2 text-xs font-semibold text-slate-900 transition-colors hover:bg-slate-900 hover:text-white">
          Search more jobs <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </form>

      <div className="mt-3 flex items-center justify-end gap-1.5 text-[11px] text-slate-500">
        <span>Jobs by</span>
        <a href="https://www.whatjobs.com" target="_blank" rel="nofollow sponsored noopener noreferrer" aria-label="WhatJobs job search">
          <img
            src="https://static.whatjobs.com/static/ajSite/publisher/img/logo/default.svg"
            width="82"
            height="18"
            alt="WhatJobs"
            className="h-[18px] w-[82px]"
          />
        </a>
      </div>
    </section>
  )
}
