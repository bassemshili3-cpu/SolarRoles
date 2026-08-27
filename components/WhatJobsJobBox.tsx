'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, MapPin } from 'lucide-react'
import type { WhatJobsJob, WhatJobsResponse } from '@/lib/whatjobs'

type FeedState = 'loading' | 'ready' | 'empty' | 'error'

function getTrackingToken(onmousedown: string | null): string | null {
  const match = onmousedown?.match(/^\s*pnpClick\(this,\s*['"]([^'"]+)['"]\);?\s*$/)
  return match?.[1] || null
}

export default function WhatJobsJobBox({ search, location }: { search: string; location: string }) {
  const [isDesktop, setIsDesktop] = useState(false)
  const [state, setState] = useState<FeedState>('loading')
  const [jobs, setJobs] = useState<WhatJobsJob[]>([])

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
    const params = new URLSearchParams({ keyword: search.trim() || 'solar' })
    if (location.trim()) params.set('location', location.trim())

    setState('loading')
    fetch(`/api/whatjobs?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('WhatJobs request failed')
        return response.json() as Promise<WhatJobsResponse>
      })
      .then((data) => {
        const matches = (data.data || []).slice(0, 6)
        setJobs(matches)
        setState(matches.length > 0 ? 'ready' : 'empty')
      })
      .catch((error: unknown) => {
        if ((error as { name?: string }).name !== 'AbortError') setState('error')
      })

    return () => controller.abort()
  }, [isDesktop, location, search])

  if (!isDesktop || state === 'empty' || state === 'error') return null

  return (
    <section className="w-full border border-slate-200 bg-white p-4 text-left" aria-label="Related jobs from WhatJobs">
      {state === 'loading' ? (
        <div className="space-y-3 py-4">
          {[0, 1, 2, 3, 4, 5].map((index) => <div key={index} className="h-14 animate-pulse bg-slate-100" />)}
        </div>
      ) : (
        <ul className="divide-y divide-slate-200">
          {jobs.map((job) => {
            const trackingToken = getTrackingToken(job.onmousedown)
            return (
              <li key={job.url}>
                <a
                  href={job.url}
                  target="_blank"
                  rel="nofollow sponsored noopener noreferrer"
                  onMouseDown={(event) => {
                    const tracker = (window as Window & {
                      pnpClick?: (element: HTMLAnchorElement, token: string) => void
                    }).pnpClick
                    if (trackingToken && typeof tracker === 'function') tracker(event.currentTarget, trackingToken)
                  }}
                  className="block py-3 transition-colors hover:bg-slate-50"
                >
                  <p className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900 hover:text-[#ef2626]">{job.title}</p>
                  {job.company && <p className="mt-1 truncate text-xs text-slate-600">{job.company}</p>}
                  {job.location && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </p>
                  )}
                </a>
              </li>
            )
          })}
        </ul>
      )}

      <form method="post" action="https://www.whatjobs.com/searchbox" target="_blank" className="mt-3 border-t border-slate-200 pt-3">
        <input type="hidden" name="keyword" value={search} />
        <input type="hidden" name="location" value={location} />
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
