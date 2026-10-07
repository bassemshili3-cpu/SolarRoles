/** Extract attribution identifiers without storing provider tokens or full URLs. */
export function whatJobsDestination(url: string): { jobId: string | null; publisher: string | null } | null {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' || !['www.whatjobs.com', 'whatjobs.com'].includes(parsed.hostname)) return null
    const match = parsed.pathname.match(/^\/pub_api__[a-z]+__(\d{1,20})__(\d{1,10})$/)
    if (match) return { jobId: match[1], publisher: match[2] }
    if (parsed.pathname === '/searchbox') return { jobId: null, publisher: null }
  } catch { /* Unsupported destinations are not counted. */ }
  return null
}
