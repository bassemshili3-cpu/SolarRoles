// lib/job-sync.ts
// ─── Sync jobs from Jooble + Lensa + Careerjet into PostgreSQL ───────────────
// Adzuna paused.
//
// Each run rotates through a subset of keywords to progressively cover
// the full pool across multiple executions.

import { prisma } from './prisma'
import { searchJooble } from './jooble'
import { searchLensaJobs } from './lensa'
import { searchCareerjetJobs, normalizeCareerjet } from './careerjet'
import { normalizeJooble, UnifiedJob } from './jobs'

const EXPIRY_DAYS = 30

export interface SyncResult {
  jooble: { fetched: number; saved: number; errors: number; queriesRun: number }
  lensa: { fetched: number; saved: number; errors: number; queriesRun: number }
  careerjet: { fetched: number; saved: number; errors: number; queriesRun: number }
  expired: number
}

// ─── Keyword pool ────────────────────────────────────────────────────────────
const KEYWORDS = [
  // Tech
  'software engineer', 'developer', 'data analyst', 'data scientist',
  'devops engineer', 'product manager', 'ux designer', 'it support',
  'cybersecurity', 'cloud engineer',

  // Healthcare
  'registered nurse', 'nursing assistant', 'medical assistant', 'pharmacy technician',
  'physical therapist', 'dental assistant', 'home health aide', 'medical receptionist',
  'mental health counselor', 'radiologic technologist',

  // Trades & Services
  'electrician', 'plumber', 'hvac technician', 'carpenter',
  'welder', 'auto mechanic', 'truck driver', 'construction worker',
  'landscaper', 'maintenance technician',

  // Business & Admin
  'accountant', 'bookkeeper', 'financial analyst', 'human resources',
  'administrative assistant', 'project manager', 'operations manager', 'office manager',
  'executive assistant', 'business analyst',

  // Retail & Customer Service
  'customer service', 'call center', 'sales associate', 'cashier',
  'retail manager', 'barista', 'server', 'hostess',

  // Education
  'teacher', 'substitute teacher', 'special education teacher', 'school counselor',
  'tutor', 'daycare worker', 'preschool teacher',

  // Logistics & Warehouse
  'warehouse worker', 'forklift operator', 'delivery driver', 'shipping clerk',
  'inventory specialist',

  // Marketing & Sales
  'marketing manager', 'digital marketing', 'content writer', 'social media manager',
  'account executive', 'sales representative',
]

function getKeywordsForRun(page: number, count: number = 8): string[] {
  const startIdx = (page * count) % KEYWORDS.length
  const selected: string[] = []
  for (let i = 0; i < count; i++) {
    selected.push(KEYWORDS[(startIdx + i) % KEYWORDS.length])
  }
  return selected
}

// ─── Upsert helper ───────────────────────────────────────────────────────────
async function upsertJobs(jobs: UnifiedJob[], source: string): Promise<number> {
  let saved = 0

  for (const job of jobs) {
    try {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS)

      await prisma.job.upsert({
        where: { id: job.id },
        update: {
          title: job.title,
          company: job.company,
          location: job.location,
          description: job.description,
          applyUrl: job.apply_url,
          salaryMin: job.salary_min || null,
          salaryMax: job.salary_max || null,
          addressRegion: job.addressRegion || '',
          fetchedAt: new Date(),
          expiresAt,
          active: true,
        },
        create: {
          id: job.id,
          source,
          title: job.title,
          company: job.company,
          location: job.location,
          addressRegion: job.addressRegion || '',
          description: job.description,
          url: job.url,
          applyUrl: job.apply_url,
          salaryMin: job.salary_min || null,
          salaryMax: job.salary_max || null,
          postedAt: job.created ? new Date(job.created) : null,
          fetchedAt: new Date(),
          expiresAt,
          active: true,
        },
      })
      saved++
    } catch (e: any) {
      console.error(`❌ Upsert failed for ${job.id}:`, e.message)
    }
  }

  return saved
}

// ─── Upsert for Careerjet (different shape) ──────────────────────────────────
async function upsertCareerjetJobs(jobs: ReturnType<typeof normalizeCareerjet>[]): Promise<number> {
  let saved = 0

  for (const job of jobs) {
    try {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS)

      await prisma.job.upsert({
        where: { id: job.id },
        update: {
          title: job.title,
          company: job.company,
          location: job.location,
          description: job.description,
          applyUrl: job.applyUrl,
          salaryMin: job.salaryMin || null,
          salaryMax: job.salaryMax || null,
          fetchedAt: new Date(),
          expiresAt,
          active: true,
        },
        create: {
          id: job.id,
          source: 'careerjet',
          title: job.title,
          company: job.company,
          location: job.location,
          addressRegion: '',
          description: job.description,
          url: job.url,
          applyUrl: job.applyUrl,
          salaryMin: job.salaryMin || null,
          salaryMax: job.salaryMax || null,
          postedAt: job.postedAt ? new Date(job.postedAt) : null,
          fetchedAt: new Date(),
          expiresAt,
          active: true,
        },
      })
      saved++
    } catch (e: any) {
      console.error(`❌ Upsert failed for ${job.id}:`, e.message)
    }
  }

  return saved
}

// ─── Upsert for Lensa (also different shape) ─────────────────────────────────
async function upsertLensaJobs(adverts: any[]): Promise<number> {
  let saved = 0
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS)

  for (const advert of adverts) {
    try {
      const id = `lensa-${advert.unique_id}`
      const location = [advert.city, advert.state].filter(Boolean).join(', ')

      await prisma.job.upsert({
        where: { id },
        update: {
          title: advert.cleaned_job_title,
          company: advert.company || '',
          location,
          addressRegion: advert.state || '',
          description: advert.description_digest || '',
          applyUrl: advert.incoming_click_url,
          fetchedAt: new Date(),
          expiresAt,
          active: true,
        },
        create: {
          id,
          source: 'lensa',
          title: advert.cleaned_job_title,
          company: advert.company || '',
          location,
          addressRegion: advert.state || '',
          description: advert.description_digest || '',
          url: advert.incoming_click_url,
          applyUrl: advert.incoming_click_url,
          salaryMin: null,
          salaryMax: null,
          postedAt: null,
          fetchedAt: new Date(),
          expiresAt,
          active: true,
        },
      })
      saved++
    } catch (e: any) {
      console.error(`❌ Lensa upsert failed:`, e.message)
    }
  }

  return saved
}

// ─── Deactivate expired ──────────────────────────────────────────────────────
async function deactivateExpired(): Promise<number> {
  const result = await prisma.job.updateMany({
    where: {
      active: true,
      expiresAt: { lt: new Date() },
    },
    data: { active: false },
  })
  return result.count
}

// ─── Main sync ───────────────────────────────────────────────────────────────
export async function syncAllJobs(
  page: number = 1,
  limit: number = 50
): Promise<SyncResult> {
  const result: SyncResult = {
    jooble: { fetched: 0, saved: 0, errors: 0, queriesRun: 0 },
    lensa: { fetched: 0, saved: 0, errors: 0, queriesRun: 0 },
    careerjet: { fetched: 0, saved: 0, errors: 0, queriesRun: 0 },
    expired: 0,
  }

  const keywords = getKeywordsForRun(page, 6) // 6 keywords per source per run

  for (const keyword of keywords) {
    // ─── JOOBLE ───────────────────────────────────────────────────────
    for (let p = 1; p <= 2; p++) {
      try {
        const data = await searchJooble({
          keywords: keyword,
          location: 'USA',
          page: p,
          resultsOnPage: limit,
        })

        if (data?.jobs && data.jobs.length > 0) {
          const jobs = data.jobs.map(normalizeJooble)
          result.jooble.fetched += jobs.length
          result.jooble.saved += await upsertJobs(jobs, 'jooble')
          result.jooble.queriesRun++
        }

        await new Promise((r) => setTimeout(r, 300))
      } catch (e: any) {
        console.error(`❌ Jooble error (${keyword}, p${p}):`, e.message)
        result.jooble.errors++
      }
    }

    // ─── LENSA ────────────────────────────────────────────────────────
    try {
      const data = await searchLensaJobs({
        job_title: keyword,
        limit,
      })

      if (data?.job_adverts && data.job_adverts.length > 0) {
        result.lensa.fetched += data.job_adverts.length
        result.lensa.saved += await upsertLensaJobs(data.job_adverts)
        result.lensa.queriesRun++
      }

      await new Promise((r) => setTimeout(r, 300))
    } catch (e: any) {
      console.error(`❌ Lensa error (${keyword}):`, e.message)
      result.lensa.errors++
    }

    // ─── CAREERJET ────────────────────────────────────────────────────
    for (let p = 1; p <= 2; p++) {
      try {
        const data = await searchCareerjetJobs({
          keywords: keyword,
          page: p,
          page_size: 20,
        })

        if (data?.jobs && data.jobs.length > 0) {
          const normalized = data.jobs.map(normalizeCareerjet)
          result.careerjet.fetched += normalized.length
          result.careerjet.saved += await upsertCareerjetJobs(normalized)
          result.careerjet.queriesRun++
        }

        await new Promise((r) => setTimeout(r, 300))
      } catch (e: any) {
        console.error(`❌ Careerjet error (${keyword}, p${p}):`, e.message)
        result.careerjet.errors++
      }
    }

    // Pause between keywords
    await new Promise((r) => setTimeout(r, 500))
  }

  console.log(`✅ Sync complete:`)
  console.log(`   Jooble: ${result.jooble.saved} saved (${result.jooble.queriesRun} queries)`)
  console.log(`   Lensa: ${result.lensa.saved} saved (${result.lensa.queriesRun} queries)`)
  console.log(`   Careerjet: ${result.careerjet.saved} saved (${result.careerjet.queriesRun} queries)`)

  result.expired = await deactivateExpired()
  if (result.expired > 0) {
    console.log(`🗑️ ${result.expired} expired jobs deactivated`)
  }

  return result
}