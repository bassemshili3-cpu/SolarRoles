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
import { extractSalaryFromText } from './extractSalary'
import { isFifoJob } from './classifyJob'
import { setCanonicalSlugFromJob, deleteCanonicalSlug } from '@/lib/jobSlugCache'

const EXPIRY_DAYS = 30

const SOURCE_PRIORITY: Record<string, number> = {
  careerjet: 1,
  lensa: 2,
  jooble: 3,
}

export interface SyncResult {
  jooble: { fetched: number; saved: number; errors: number; queriesRun: number }
  lensa: { fetched: number; saved: number; errors: number; queriesRun: number }
  careerjet: { fetched: number; saved: number; errors: number; queriesRun: number }
  expired: number
}

// ─── Keyword pool ────────────────────────────────────────────────────────────
const KEYWORDS = [
  'software engineer', 'developer', 'data analyst', 'data scientist',
  'devops engineer', 'product manager', 'ux designer', 'it support',
  'cybersecurity', 'cloud engineer',
  'nursing assistant', 'medical assistant', 'physical therapist',
  'home health aide', 'medical receptionist', 'mental health counselor',
  'radiologic technologist', 'plumber', 'carpenter', 'welder',
  'auto mechanic', 'construction worker', 'landscaper',
  'accountant', 'bookkeeper', 'financial analyst', 'human resources',
  'administrative assistant', 'operations manager', 'office manager',
  'business analyst', 'sales associate', 'cashier',
  'retail manager', 'server', 'hostess', 'school counselor',
  'tutor', 'preschool teacher', 'warehouse worker', 'forklift operator',
  'delivery driver', 'shipping clerk', 'inventory specialist',
  'marketing manager', 'digital marketing', 'content writer',
  'social media manager', 'account executive', 'sales representative',
  'jobs for 14 year olds', 'jobs for 15 year olds', 'jobs for 16 year olds',
  'part time', 'evening jobs', 'weekend jobs', 'weekly paying jobs',
  'barista', 'bartending', 'burger king', 'chick-fil-a', 'sonic',
  'planet fitness',
  'certified nursing assistant', 'certified nursing assistant hospital',
  'patient care technician', 'patient transporter', 'pharmacy technician',
  'pediatric nurse practitioner', 'new grad nurse', 'labor and delivery nurse',
  'school nurse', 'respiratory therapist', 'surgical tech',
  'sterile processing technician', 'emt', 'ekg technician',
  'dental assistant', 'language pathologist', 'dignity health',
  'assisted reproductive technology', 'healthcare administration',
  'art teacher', 'substitute teacher', 'special education teacher',
  'social studies teacher', 'paraprofessional', 'summer camp counselor',
  'childcare', 'daycare', 'nanny',
  'electrician', 'hvac', 'truck driver', 'lineman',
  'heavy equipment operator', 'welding', 'general labor',
  'school bus driver', 'fly in fly out mining',
  'fly in fly out roster',
  'fly in fly out rotation schedule',
  'fly in fly out oil gas',
  'allied universal', 'amgen', 'cardinal health', 'cintas',
  'chase bank', 'doordash', 'exelon', 'honda', 'live nation',
  'national grid', 'press association',
  'city of grand rapids', 'city of reno', 'city of laredo', 'city of portland',
  'public work commission', 'university of california san diego',
  'call center', 'customer service', 'executive assistant',
  'front desk', 'project manager', 'case manager', 'talent acquisition',
  'remote hr', 'quality assurance', 'engineering', 'entry level data analyst',
  'social media supervisor', 'marketing chef', 'property management',
  'housekeeping', 'dog walking', 'christian', 'event organization',
]

function getKeywordsForRun(page: number, count: number = 8): string[] {
  const startIdx = (page * count) % KEYWORDS.length
  const selected: string[] = []
  for (let i = 0; i < count; i++) {
    selected.push(KEYWORDS[(startIdx + i) % KEYWORDS.length])
  }
  return selected
}

// ─── Upsert helper (Jooble) ──────────────────────────────────────────────────
async function upsertJobs(jobs: UnifiedJob[], source: string): Promise<number> {
  let saved = 0

  for (const job of jobs) {
    try {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS)
      const isFifo = isFifoJob(job.title, job.description)

      const upserted = await prisma.job.upsert({
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
          isFifo,
        },
        create: {
          id: job.id,
          source,
          sourcePriority: SOURCE_PRIORITY[source] ?? 99,
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
          isFifo,
        },
      })
      saved++

      // ← AJOUT : sync du slug dans le cache KV
      try {
        await setCanonicalSlugFromJob(upserted as any)
      } catch (cacheErr: any) {
        console.error(`[slugCache] upsert failed for ${job.id}:`, cacheErr.message)
      }
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
      const isFifo = isFifoJob(job.title, job.description)

      const upserted = await prisma.job.upsert({
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
          isFifo,
        },
        create: {
          id: job.id,
          source: 'careerjet',
          sourcePriority: SOURCE_PRIORITY.careerjet,
          title: job.title,
          company: job.company,
          location: job.location,
          addressRegion: job.addressRegion || '',
          description: job.description,
          url: job.url,
          applyUrl: job.applyUrl,
          salaryMin: job.salaryMin || null,
          salaryMax: job.salaryMax || null,
          postedAt: job.postedAt ? new Date(job.postedAt) : null,
          fetchedAt: new Date(),
          expiresAt,
          active: true,
          isFifo,
        },
      })
      saved++

      // ← AJOUT : sync du slug dans le cache KV
      try {
        await setCanonicalSlugFromJob(upserted as any)
      } catch (cacheErr: any) {
        console.error(`[slugCache] upsert failed for ${job.id}:`, cacheErr.message)
      }
    } catch (e: any) {
      console.error(`❌ Upsert failed for ${job.id}:`, e.message)
    }
  }

  return saved
}
// ─── Upsert for Lensa ────────────────────────────────────────────────────────
async function upsertLensaJobs(adverts: any[]): Promise<number> {
  let saved = 0
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS)

  for (const advert of adverts) {
    try {
      const id = `lensa-${advert.unique_id}`
      const location = [advert.city, advert.state].filter(Boolean).join(', ')

      const extracted = extractSalaryFromText(
        advert.cleaned_job_title || '',
        advert.description_digest || ''
      )
      const isFifo = isFifoJob(advert.cleaned_job_title, advert.description_digest)

      const upserted = await prisma.job.upsert({
        where: { id },
        update: {
          title: advert.cleaned_job_title,
          company: advert.company || '',
          location,
          addressRegion: advert.state || '',
          description: advert.description_digest || '',
          applyUrl: advert.incoming_click_url,
          salaryMin: extracted?.min ?? null,
          salaryMax: extracted?.max ?? null,
          fetchedAt: new Date(),
          expiresAt,
          active: true,
          isFifo,
        },
        create: {
          id,
          source: 'lensa',
          sourcePriority: SOURCE_PRIORITY.lensa,
          title: advert.cleaned_job_title,
          company: advert.company || '',
          location,
          addressRegion: advert.state || '',
          description: advert.description_digest || '',
          url: advert.incoming_click_url,
          applyUrl: advert.incoming_click_url,
          salaryMin: extracted?.min ?? null,
          salaryMax: extracted?.max ?? null,
          postedAt: null,
          fetchedAt: new Date(),
          expiresAt,
          active: true,
          isFifo,
        },
      })
      saved++

      // ← AJOUT : sync du slug dans le cache KV
      try {
        await setCanonicalSlugFromJob(upserted as any)
      } catch (cacheErr: any) {
        console.error(`[slugCache] upsert failed for ${id}:`, cacheErr.message)
      }
    } catch (e: any) {
      console.error(`❌ Lensa upsert failed:`, e.message)
    }
  }

  return saved
}

// ─── Deactivate expired ──────────────────────────────────────────────────────
async function deactivateExpired(): Promise<number> {
  // Récupérer les IDs avant de désactiver (pour le cache)
  const expiringJobs = await prisma.job.findMany({
    where: {
      active: true,
      expiresAt: { lt: new Date() },
    },
    select: { id: true },
  })

  const result = await prisma.job.updateMany({
    where: {
      active: true,
      expiresAt: { lt: new Date() },
    },
    data: { active: false },
  })

  // ← AJOUT : purger le cache pour les jobs expirés
  for (const job of expiringJobs) {
    try {
      await deleteCanonicalSlug(job.id)
    } catch (err: any) {
      console.error(`[slugCache] delete failed for ${job.id}:`, err.message)
    }
  }

  return result.count
}

async function getPublicIp(): Promise<string> {
  try {
    const res = await fetch('https://api.ipify.org?format=json', { cache: 'no-store' })
    const data = await res.json()
    return data.ip as string
  } catch {
    return '1.2.3.4'
  }
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

  const publicIp = await getPublicIp()
  console.log(`🌐 Public IP détectée : ${publicIp}`)

  const keywords = getKeywordsForRun(page, 6)

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
      const data = await searchLensaJobs({ job_title: keyword, limit })
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
          user_ip: publicIp,
          noCache: true,
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