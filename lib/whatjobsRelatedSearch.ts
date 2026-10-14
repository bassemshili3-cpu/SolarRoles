import { resolveStateName } from './usStates'
import type { WhatJobsJob } from './whatjobs'

type RelatedSearch = { keyword: string; location: string }

function isSolarInstaller(title: string): boolean {
  return /\b(?:solar|pv|photovoltaic)\b/i.test(title) && /\binstall\w*\b/i.test(title)
}

const SOLAR = /\b(?:solar|photovoltaic|pv)\b/i
const SALES = /\b(?:sales|advisor|adviser|consultant|representative|account\s+(?:executive|manager)|business\s+development|appointment\s+setter|canvasser|canvassing|door[- ]to[- ]door|closer)\b/i

function isSolarSales(title: string): boolean {
  return SOLAR.test(title) && SALES.test(title)
}

function solarSalesSearches(location: string): RelatedSearch[] {
  // Provider location searches expect a city or state, not "City, SC, US".
  const place = location.trim().replace(/,\s*(?:US|USA|United States)\s*$/i, '')
  const state = resolveStateName(place)
  const city = place.split(',')[0]?.trim() || place
  const locations = [...new Set([city, ...(state ? [state] : [])])]
  return ['solar sales', 'solar'].flatMap(keyword => locations.map(location => ({ keyword, location })))
}

export function getRelatedWhatJobsSearches(title: string, location: string): RelatedSearch[] {
  const keyword = title.trim() || 'solar'
  const place = location.trim()
  if (isSolarSales(keyword)) return solarSalesSearches(place)
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
  if (isSolarSales(title)) {
    // "Sales Representative" can be solar even when its title omits the
    // sector. Require explicit solar context in the provider's own snippet.
    const context = [job.title, job.snippet].filter(Boolean).join(' ')
    // An advisor/representative opening should not recommend regional sales
    // leadership just because both titles contain "sales" and "solar".
    const leadership = /\b(?:manager|director|head|vice\s+president|vp)\b/i
    const unrelatedSeniority = !leadership.test(title) && leadership.test(job.title)
      && !/\baccount\s+manager\b/i.test(job.title)
    return SALES.test(job.title) && SOLAR.test(context)
      && !unrelatedSeniority
      && !/\b(?:pharmac\w*|nurse|medical|insurance|underwrit\w*|engineer|project\s+manager|land\s+solutions)\b/i.test(job.title)
  }
  if (!isSolarInstaller(title)) return true
  return /\b(?:solar|pv|photovoltaic)\b/i.test(job.title)
    && /\b(?:install\w*|technician|electrician|roof\w*|crew)\b/i.test(job.title)
}
