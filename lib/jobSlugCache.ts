
import { Redis } from '@upstash/redis'
import { buildJobSlug } from '@/lib/slugify'
import type { JobDetail } from '@/lib/jobDetail'

const KEY_PREFIX = 'job:slug:'
const TTL_SECONDS = 60 * 60 * 24 * 7 // 7 jours, large

/**
 * Lookup edge-compatible d'un slug canonique (utilisé par le middleware).
 * Retourne null si pas en cache ou si KV est down.
 *
 */
const kv = new Redis({

  url: process.env.UPSTASH_REDIS_REST_URL!,

  token: process.env.UPSTASH_REDIS_REST_TOKEN!,

})

export async function getCanonicalSlugFromCache(id: string): Promise<string | null> {
  try {
    const cached = await kv.get<string>(`${KEY_PREFIX}${id}`)
    return cached
  } catch (err) {
    console.error('[jobSlugCache] get failed', { id, err })
    return null
  }
}

/**
 * Calcule le slug canonique d'un job et l'écrit dans le cache.
 * À appeler à chaque création / update d'un job.
 */
export async function setCanonicalSlugFromJob(job: JobDetail): Promise<string> {
  const slug = buildJobSlug(job)
  try {
    await kv.set(`${KEY_PREFIX}${job.id}`, slug, { ex: TTL_SECONDS })
  } catch (err) {
    console.error('[jobSlugCache] set failed', { id: job.id, err })
  }
  return slug
}

/**
 * Supprime l'entrée cache. À appeler quand un job est supprimé.
 */
export async function deleteCanonicalSlug(id: string): Promise<void> {
  try {
    await kv.del(`${KEY_PREFIX}${id}`)
  } catch (err) {
    console.error('[jobSlugCache] del failed', { id, err })
  }
}