import { STATES } from './usStates'

type LocationInput = {
  location?: string | null
  addressRegion?: string | null
  locationRegions?: string[] | null
  postalCode?: string | null
}

const regionCodes = new Map(Object.entries({ ...STATES, 'District of Columbia': 'DC' })
  .flatMap(([name, code]) => [[name.toLowerCase(), code], [code.toLowerCase(), code]] as [string, string][]))
const nonCity = /^(?:u\.?s\.?a?\.?|united states(?: of america)?|remote(?:\b.*)?|remote_us|wfh|work from home|anywhere|nationwide|multiple locations?|various locations?)$/i

/** Format existing US catalogue locations; never invent a city, state or street. */
export function buildJobPostingLocation(job: LocationInput) {
  const parts = (job.location || '').trim().split(/\s*[,;|]\s*|\s+[–—-]\s+/u)
    .map(part => part.trim()).filter(Boolean)
  const first = parts[0] || ''
  const countryFirst = /^(?:united states(?: of america)?|u\.?s\.?a?\.?)$/i.test(first)
  // "Georgia, VT" and "Washington, DC" start with cities, not states.
  const regionParts = !countryFirst && parts.slice(1).some(part => regionCodes.has(part.toLowerCase())) ? parts.slice(1) : parts
  const inferredRegions = [...new Set(regionParts.map(part => regionCodes.get(part.toLowerCase())).filter((value): value is string => !!value))]
  const storedRegions = [...new Set([job.addressRegion || '', ...(job.locationRegions || [])]
    .map(region => regionCodes.get(region.trim().toLowerCase())).filter((value): value is string => !!value))]
  const locationRegions = storedRegions.length ? storedRegions : inferredRegions
  const stateCode = locationRegions[0] || ''
  // Country-first ATS labels use country / state / city. City-first labels
  // use city / state / country. Only attach a city to its matching state.
  const cityCandidate = countryFirst
    ? parts.find((part, index) => index > 0 && !nonCity.test(part) && !regionCodes.has(part.toLowerCase())) || ''
    : first
  const candidateRegion = regionCodes.get(cityCandidate.toLowerCase())
  const city = cityCandidate && !nonCity.test(cityCandidate) && (!candidateRegion || candidateRegion !== stateCode) &&
    (!inferredRegions.length || !stateCode || inferredRegions[0] === stateCode) ? cityCandidate : ''
  const addresses = (locationRegions.length ? locationRegions : ['']).map(region => ({
    '@type': 'Place' as const,
    address: {
      '@type': 'PostalAddress' as const,
      addressCountry: 'US',
      ...(region ? { addressRegion: region } : {}),
      ...(region === stateCode && city ? { addressLocality: city } : {}),
      ...(region === stateCode && job.postalCode ? { postalCode: job.postalCode } : {}),
    },
  }))
  return { city, stateCode, locationRegions, jobLocation: addresses.length === 1 ? addresses[0] : addresses }
}
