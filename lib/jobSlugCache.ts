// lib/jobSlugCache.ts
import { Redis } from '@upstash/redis'
import { buildJobSlug } from '@/lib/slugify'
import type { JobDetail } from '@/lib/jobDetail'

const KEY_PREFIX = 'job:slug:'
const TTL_SECONDS = 60 * 60 * 24 * 7

// ✅ Edge-compatible grâce aux env vars REST
const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function getCanonicalSlugFromCache(id: string): Promise<string | null> {
  try {
    return await kv.get<string>(`${KEY_PREFIX}${id}`)
  } catch (err) {
    console.error('[jobSlugCache] get failed', { id, err })
    return null
  }
}

export async function setCanonicalSlugFromJob(job: JobDetail): Promise<string> {
  const slug = buildJobSlug(job)
  try {
    await kv.set(`${KEY_PREFIX}${job.id}`, slug, { ex: TTL_SECONDS })
  } catch (err) {
    console.error('[jobSlugCache] set failed', { id: job.id, err })
  }
  return slug
}

export async function deleteCanonicalSlug(id: string): Promise<void> {
  try {
    await kv.del(`${KEY_PREFIX}${id}`)
  } catch (err) {
    console.error('[jobSlugCache] del failed', { id, err })
  }
}