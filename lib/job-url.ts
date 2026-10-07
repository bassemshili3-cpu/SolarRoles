import { getCanonicalJobSlug } from './slugify'
import { SITE_URL } from './site-url'

export type CanonicalJob = {
  id: string
  title: string
  location?: string | null
  canonicalSlug?: string | null
}

export function getCanonicalJobPath(job: CanonicalJob): string {
  return `/jobs/${encodeURIComponent(job.id)}/${encodeURIComponent(getCanonicalJobSlug(job))}`
}

export function getCanonicalJobUrl(job: CanonicalJob): string {
  return `${SITE_URL}${getCanonicalJobPath(job)}`
}

/** Only rewrite our own stored links; preserve ATS/source URLs as evidence. */
export function getPublicJobLink(job: CanonicalJob & { url: string; source?: string }): string {
  if (job.source === 'employer' || isInternalJobUrl(job.url)) return getCanonicalJobUrl(job)
  return job.url
}

export function isInternalJobUrl(value: string): boolean {
  try {
    const url = new URL(value, SITE_URL)
    return ['solarroles.com', 'www.solarroles.com'].includes(url.hostname) && url.pathname.startsWith('/jobs/')
  } catch {
    return false
  }
}
