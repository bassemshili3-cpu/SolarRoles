// lib/job-db.ts
// ─── Lecture des jobs depuis la base PostgreSQL ──────────────────────────────
//
// Remplace les appels API en temps réel.
// Toutes les lectures passent par la base, zéro appel API côté utilisateur.
//
// Adzuna paused: only Jooble, Lensa, and Careerjet are active.

import { prisma } from './prisma'

const ACTIVE_SOURCES = ['jooble', 'lensa', 'careerjet']

export interface DbJob {
  id: string
  source: string
  title: string
  company: string
  location: string
  addressRegion: string
  description: string
  url: string
  applyUrl: string
  salaryMin: number | null
  salaryMax: number | null
  salary: string | null
  contractType: string | null
  contractTime: string | null
  postedAt: Date | null
  fetchedAt: Date
  active: boolean
}

// ─── Recherche dans la base ──────────────────────────────────────────────────
export async function searchJobsFromDb(params: {
  what?: string
  where?: string
  page?: number
  results_per_page?: number
  salary_min?: number
}): Promise<{ results: DbJob[]; count: number }> {
  const page = params.page || 1
  const limit = params.results_per_page || 30
  const skip = (page - 1) * limit

  const where: any = {
    active: true,
    source: { in: ACTIVE_SOURCES },
  }

  if (params.what) {
    where.OR = [
      { title: { contains: params.what, mode: 'insensitive' } },
      { company: { contains: params.what, mode: 'insensitive' } },
      { description: { contains: params.what, mode: 'insensitive' } },
    ]
  }

  if (params.where) {
    where.location = { contains: params.where, mode: 'insensitive' }
  }

  if (params.salary_min) {
    where.salaryMin = { gte: params.salary_min }
  }

  const [results, count] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { fetchedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.job.count({ where }),
  ])

  return { results: results as DbJob[], count }
}

// ─── Récupère un job par ID ──────────────────────────────────────────────────
export async function getJobFromDb(id: string): Promise<DbJob | null> {
  const job = await prisma.job.findUnique({
    where: { id },
  })

  if (!job || !job.active) return null
  if (!ACTIVE_SOURCES.includes(job.source)) return null

  return job as DbJob
}

// ─── URLs actives pour Google Indexing API ───────────────────────────────────
// Distribution: ~50% Jooble, ~30% Lensa, ~20% Careerjet
export async function getActiveJobUrls(limit: number = 200): Promise<string[]> {
  const joobleQuota = Math.floor(limit * 0.5)
  const lensaQuota = Math.floor(limit * 0.3)
  const careerjetQuota = limit - joobleQuota - lensaQuota

  const [joobleJobs, lensaJobs, careerjetJobs] = await Promise.all([
    prisma.job.findMany({
      where: { active: true, source: 'jooble' },
      select: { id: true },
      orderBy: { fetchedAt: 'desc' },
      take: joobleQuota,
    }),
    prisma.job.findMany({
      where: { active: true, source: 'lensa' },
      select: { id: true },
      orderBy: { fetchedAt: 'desc' },
      take: lensaQuota,
    }),
    prisma.job.findMany({
      where: { active: true, source: 'careerjet' },
      select: { id: true },
      orderBy: { fetchedAt: 'desc' },
      take: careerjetQuota,
    }),
  ])

  const all = [...joobleJobs, ...lensaJobs, ...careerjetJobs]
  return all.map((j) => `https://www.oh-my-job.com/jobs/${j.id}`)
}

// ─── Stats pour le dashboard ─────────────────────────────────────────────────
export async function getJobStats() {
  const [total, jooble, lensa, careerjet, active] = await Promise.all([
    prisma.job.count(),
    prisma.job.count({ where: { source: 'jooble' } }),
    prisma.job.count({ where: { source: 'lensa' } }),
    prisma.job.count({ where: { source: 'careerjet' } }),
    prisma.job.count({ where: { active: true, source: { in: ACTIVE_SOURCES } } }),
  ])

  return { total, jooble, lensa, careerjet, active, expired: total - active }
}