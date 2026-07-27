// lib/greenhouse.ts
// ─── Greenhouse Job Board API ──────────────────────────────────────────────
// API publique (pas de clé requise pour GET)
// Chaque entreprise a son propre "board token"
// Doc: https://developers.greenhouse.io/job-board.html

const GREENHOUSE_BASE_URL = 'https://boards-api.greenhouse.io/v1/boards'

export interface GreenhouseJobLocation {
  name: string
}

export interface GreenhouseJobDepartment {
  id: number
  name: string
}

export interface GreenhouseJobOffice {
  id: number
  name: string
  location: string
}

export interface GreenhouseJob {
  id: number
  title: string
  location: GreenhouseJobLocation
  absolute_url: string
  updated_at: string
  content?: string
  departments: GreenhouseJobDepartment[]
  offices: GreenhouseJobOffice[]
}

export interface GreenhouseJobsResponse {
  jobs: GreenhouseJob[]
  meta: {
    total: number
  }
}

export async function fetchGreenhouseJobs(boardToken: string): Promise<GreenhouseJobsResponse> {
  const url = `${GREENHOUSE_BASE_URL}/${boardToken}/jobs?content=true`

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Solar Roles/1.0 (+https://www.solarroles.com)',
      Accept: 'application/json',
    },
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    throw new Error(`Greenhouse API error for board "${boardToken}": ${res.status}`)
  }

  return res.json()
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeGreenhouse(job: GreenhouseJob, companyName: string) {
  const id = `greenhouse-${job.id}`
  const description = job.content ? stripHtml(job.content).slice(0, 3000) : ''

  return {
    id,
    title: job.title,
    company: companyName,
    location: job.location?.name || '',
    description,
    url: `/jobs/${id}`,
    applyUrl: job.absolute_url,
    source: 'greenhouse' as const,
    postedAt: job.updated_at ? new Date(job.updated_at) : null,
  }
}
