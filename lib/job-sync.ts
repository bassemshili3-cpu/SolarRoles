// lib/job-sync.ts
// ─── Synchronise les jobs depuis les APIs vers la base PostgreSQL ─────────────
//
// Ce module est appelé par le cron. Il :
//   1. Fetch les jobs depuis Adzuna + Jooble (+ Lensa si actif)
//   2. Les normalise
//   3. Les upsert en base (insert ou update si déjà existant)
//   4. Désactive les jobs expirés

import { prisma } from './prisma'
import { searchJobs as searchAdzuna } from './adzuna'
import { searchJooble } from './jooble'
import { normalizeAdzuna, normalizeJooble, UnifiedJob } from './jobs'

const EXPIRY_DAYS = 30

interface SyncResult {
  adzuna: { fetched: number; saved: number; errors: number }
  jooble: { fetched: number; saved: number; errors: number }
  expired: number
}

// ─── Upsert un batch de jobs en base ─────────────────────────────────────────
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

// ─── Désactive les jobs expirés ──────────────────────────────────────────────
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

// ─── Sync principal ──────────────────────────────────────────────────────────
export async function syncAllJobs(page: number = 1, limit: number = 50): Promise<SyncResult> {
  const result: SyncResult = {
    adzuna: { fetched: 0, saved: 0, errors: 0 },
    jooble: { fetched: 0, saved: 0, errors: 0 },
    expired: 0,
  }

  // ─── Fetch Adzuna ────────────────────────────────────────────────────────
  try {
    const adzunaData = await searchAdzuna({
      what: '',
      where: '',
      page,
      results_per_page: limit,
    })

    if (adzunaData?.results) {
      const jobs = adzunaData.results.map(normalizeAdzuna)
      result.adzuna.fetched = jobs.length
      result.adzuna.saved = await upsertJobs(jobs, 'adzuna')
      console.log(`✅ Adzuna sync: ${result.adzuna.fetched} fetched, ${result.adzuna.saved} saved`)
    }
  } catch (e: any) {
    console.error('❌ Adzuna sync error:', e.message)
    result.adzuna.errors = 1
  }

  // ─── Fetch Jooble ────────────────────────────────────────────────────────
  try {
    const joobleData = await searchJooble({
      keywords: '',
      location: '',
      page,
      resultsOnPage: limit,
    })

    if (joobleData?.jobs) {
      const jobs = joobleData.jobs.map(normalizeJooble)
      result.jooble.fetched = jobs.length
      result.jooble.saved = await upsertJobs(jobs, 'jooble')
      console.log(`✅ Jooble sync: ${result.jooble.fetched} fetched, ${result.jooble.saved} saved`)
    }
  } catch (e: any) {
    console.error('❌ Jooble sync error:', e.message)
    result.jooble.errors = 1
  }

  // ─── Nettoyage des expirés ───────────────────────────────────────────────
  result.expired = await deactivateExpired()
  if (result.expired > 0) {
    console.log(`🗑️ ${result.expired} expired jobs deactivated`)
  }

  return result
}