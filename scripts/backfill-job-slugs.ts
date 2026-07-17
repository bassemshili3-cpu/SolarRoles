// scripts/backfill-job-slugs.ts
import { Redis } from '@upstash/redis'
import { buildJobSlug } from '../lib/slugify'   // ← chemin relatif
import { prisma } from '../lib/prisma'          // ← chemin relatif

const KEY_PREFIX = 'job:slug:'
const TTL_SECONDS = 60 * 60 * 24 * 7
const BATCH_SIZE = 50
const BATCH_DELAY_MS = 100
const MAX_RETRIES = 3

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T | null> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn()
    } catch (err: any) {
      const is429 = err?.status === 429 || err?.message?.includes('429')
      if (is429 && attempt < MAX_RETRIES) {
        const backoff = 1000 * attempt
        console.warn(`⚠️  429 sur ${label}, retry ${attempt}/${MAX_RETRIES} dans ${backoff}ms`)
        await sleep(backoff)
      } else {
        console.error(`❌ ${label} failed:`, err?.message || err)
        return null
      }
    }
  }
  return null
}

async function* iterateAllJobIds(batchSize = 1000): AsyncGenerator<string[]> {
  let cursor: string | undefined
  while (true) {
    const jobs = await prisma.job.findMany({
      select: { id: true },
      take: batchSize,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' },
    })
    if (jobs.length === 0) break
    yield jobs.map((j) => j.id)
    if (jobs.length < batchSize) break
    cursor = jobs[jobs.length - 1].id
  }
}

async function cacheJobSlug(jobId: string): Promise<boolean> {
  return await withRetry(async () => {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, title: true, company: true, location: true, addressRegion: true, source: true },
    })
    if (!job) return null
    const slug = buildJobSlug(job as any)
    await kv.set(`${KEY_PREFIX}${job.id}`, slug, { ex: TTL_SECONDS })
    return slug
  }, jobId) !== null
}

async function processBatch(ids: string[]): Promise<{ ok: number; failed: number }> {
  const results = await Promise.allSettled(ids.map((id) => cacheJobSlug(id)))
  const ok = results.filter((r) => r.status === 'fulfilled' && r.value).length
  return { ok, failed: ids.length - ok }
}

async function main() {
  console.log('🚀 Backfill des slugs dans Upstash...')
  const startTime = Date.now()

  const total = await prisma.job.count()
  console.log(`📦 ${total} jobs en base`)

  let processed = 0
  let totalOk = 0
  let totalFailed = 0

  for await (const idBatch of iterateAllJobIds(1000)) {
    for (let i = 0; i < idBatch.length; i += BATCH_SIZE) {
      const subBatch = idBatch.slice(i, i + BATCH_SIZE)
      const { ok, failed } = await processBatch(subBatch)
      totalOk += ok
      totalFailed += failed
      processed += subBatch.length

      const pct = ((processed / total) * 100).toFixed(1)
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
      const eta = processed > 0
        ? (((Date.now() - startTime) / processed) * (total - processed) / 1000).toFixed(0)
        : '?'
      console.log(
        `✅ ${processed}/${total} (${pct}%) — OK: ${totalOk} | Failed: ${totalFailed} | Elapsed: ${elapsed}s | ETA: ${eta}s`
      )

      if (i + BATCH_SIZE < idBatch.length) {
        await sleep(BATCH_DELAY_MS)
      }
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(0)
  console.log(`\n🎉 Backfill terminé en ${totalTime}s`)
  console.log(`   ✅ ${totalOk} succès`)
  console.log(`   ❌ ${totalFailed} échecs`)
}

main()
  .catch((err) => {
    console.error('💥 Script crashed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())