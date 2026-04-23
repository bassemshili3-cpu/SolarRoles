// lib/job-sync.ts
// ─── Synchronise les jobs Jooble vers la base PostgreSQL ──────────────────────
// Adzuna paused — only Jooble fetched here
// Careerjet has its own dedicated cron (sync-careerjet)
//
// Strategy:
//   - Rotate through a large pool of keywords (50+)
//   - Multiple pages per keyword per run
//   - Target ~500-1000 new jobs per execution

import { prisma } from './prisma'
import { searchJooble } from './jooble'
import { normalizeJooble, UnifiedJob } from './jobs'

const EXPIRY_DAYS = 30

interface SyncResult {
  jooble: { fetched: number; saved: number; errors: number; queriesRun: number }
  expired: number
}

// ─── Large keyword pool for broad coverage ───────────────────────────────────
const JOOBLE_KEYWORDS = [
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

// ─── Rotation helper: select a subset of keywords based on run ─────────────
function getKeywordsForRun(page: number, keywordsPerRun: number = 8): string[] {
  const startIdx = (page * keywordsPerRun) % JOOBLE_KEYWORDS.length
  const selected: string[] = []
  for (let i = 0; i < keywordsPerRun; i++) {
    selected.push(JOOBLE_KEYWORDS[(startIdx + i) % JOOBLE_KEYWORDS.length])
  }
  return selected
}

// ─── Main sync ───────────────────────────────────────────────────────────────
export async function syncAllJobs(
  page: number = 1,
  limit: number = 50
): Promise<SyncResult> {
  const result: SyncResult = {
    jooble: { fetched: 0, saved: 0, errors: 0, queriesRun: 0 },
    expired: 0,
  }

  // Select 8 keywords per run; rotate through the full pool on subsequent runs
  const keywords = getKeywordsForRun(page, 8)

  for (const keyword of keywords) {
    // Fetch 2 pages per keyword
    for (let p = 1; p <= 2; p++) {
      try {
        const joobleData = await searchJooble({
          keywords: keyword,
          location: 'USA',
          page: p,
          resultsOnPage: limit,
        })

        if (joobleData?.jobs && joobleData.jobs.length > 0) {
          const jobs = joobleData.jobs.map(normalizeJooble)
          result.jooble.fetched += jobs.length
          result.jooble.saved += await upsertJobs(jobs, 'jooble')
          result.jooble.queriesRun++
        }

        // Rate limit: 300ms between pages
        await new Promise((resolve) => setTimeout(resolve, 300))
      } catch (e: any) {
        console.error(`❌ Jooble sync error (${keyword}, page ${p}):`, e.message)
        result.jooble.errors++
      }
    }

    // Rate limit: 500ms between keywords
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  console.log(
    `✅ Jooble sync: ${result.jooble.fetched} fetched, ${result.jooble.saved} saved, ${result.jooble.queriesRun} queries ran across ${keywords.length} keywords`
  )

  // ─── Cleanup expired ────────────────────────────────────────────────────
  result.expired = await deactivateExpired()
  if (result.expired > 0) {
    console.log(`🗑️ ${result.expired} expired jobs deactivated`)
  }

  return result
}