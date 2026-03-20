// lib/jooble-cache.ts
// ─── Cache en mémoire pour les jobs Jooble ──────────────────────────────────
// Jooble n'a pas d'endpoint "get by ID", donc on cache les jobs
// quand ils apparaissent dans les résultats de recherche.
// Sur Vercel, ce cache vit dans l'instance serverless — il survit
// entre les requêtes du même instance mais pas aux cold starts.

import { UnifiedJob } from './jobs'

interface CachedJob {
  job: UnifiedJob
  cachedAt: number
}

const CACHE_TTL = 24 * 60 * 60 * 1000 // 24h
const jobCache = new Map<string, CachedJob>()

export function cacheJoobleJob(job: UnifiedJob) {
  if (job.source !== 'jooble') return
  jobCache.set(job.id, { job, cachedAt: Date.now() })
}

export function cacheJoobleJobs(jobs: UnifiedJob[]) {
  jobs.filter((j) => j.source === 'jooble').forEach(cacheJoobleJob)
}

export function getCachedJoobleJob(id: string): UnifiedJob | null {
  const entry = jobCache.get(id)
  if (!entry) return null

  // Expire après TTL
  if (Date.now() - entry.cachedAt > CACHE_TTL) {
    jobCache.delete(id)
    return null
  }

  return entry.job
}