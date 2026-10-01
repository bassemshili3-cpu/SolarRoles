import { resolveStateName } from './usStates'
import type { WhatJobsJob } from './whatjobs'

type RelatedSearch = { keyword: string; location: string }

function isSolarInstaller(title: string): boolean {
  return /\b(?:solar|pv|photovoltaic)\b/i.test(title) && /\binstall\w*\b/i.test(title)
}

export function getRelatedWhatJobsSearches(title: string, location: string): RelatedSearch[] {
  const keyword = title.trim() || 'solar'
  const place = location.trim()
  if (!isSolarInstaller(keyword)) return [{ keyword, location: place }]

  const city = place.split(',')[0]?.trim() || ''
  const state = resolveStateName(place)
  const searches = [
    { keyword: 'solar installer', location: city || place },
    ...(state ? [{ keyword: 'solar installer', location: state }] : []),
  ]

  return searches.filter((search, index) =>
    searches.findIndex((candidate) => candidate.keyword === search.keyword && candidate.location === search.location) === index,
  )
}

export function isRelatedWhatJobsResult(job: WhatJobsJob, title: string): boolean {
  if (!isSolarInstaller(title)) return true
  return /\b(?:solar|pv|photovoltaic)\b/i.test(job.title)
    && /\b(?:install\w*|technician|electrician|roof\w*|crew)\b/i.test(job.title)
}
