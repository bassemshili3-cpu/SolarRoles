// scripts/backfill-job-slugs.ts
import { setCanonicalSlugFromJob } from '@/lib/jobSlugCache'
import { getJobDetail, getJobDetailWithSalary } from '@/lib/jobDetail'

const BATCH_SIZE = 50          // 50 SETs en parallèle = safe
const BATCH_DELAY_MS = 100     // 100ms entre chaque batch
const MAX_RETRIES = 3          // Retry sur 429

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T | null> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn()
    } catch (err: any) {
      const is429 = err?.status === 429 || err?.message?.includes('429')
      if (is429 && attempt < MAX_RETRIES) {
        const backoff = 1000 * attempt // 1s, 2s, 3s
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

async function processBatch(ids: string[]): Promise<{ ok: number; failed: number }> {
  const results = await Promise.allSettled(
    ids.map((id) =>
      withRetry(async () => {
        const raw = await getJobDetail(id)
        if (!raw) throw new Error('job not found')
        await setCanonicalSlugFromJob(getJobDetailWithSalary(raw))
      }, id)
    )
  )
  const ok = results.filter((r) => r.status === 'fulfilled' && r.value !== null).length
  const failed = ids.length - ok
  return { ok, failed }
}

async function main() {
  console.log('🚀 Backfill des slugs dans Upstash...')
  const startTime = Date.now()
  
  const allIds = await fetchAllJobIds()
  console.log(`📦 ${allIds.length} jobs à traiter`)
  
  let totalOk = 0
  let totalFailed = 0
  
  for (let i = 0; i < allIds.length; i += BATCH_SIZE) {
    const batch = allIds.slice(i, i + BATCH_SIZE)
    const { ok, failed } = await processBatch(batch)
    totalOk += ok
    totalFailed += failed
    
    const processed = i + batch.length
    const pct = ((processed / allIds.length) * 100).toFixed(1)
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
    const eta = (((Date.now() - startTime) / processed) * (allIds.length - processed) / 1000).toFixed(0)
    console.log(`✅ ${processed}/${allIds.length} (${pct}%) — OK: ${totalOk} | Failed: ${totalFailed} | Elapsed: ${elapsed}s | ETA: ${eta}s`)
    
    if (i + BATCH_SIZE < allIds.length) {
      await sleep(BATCH_DELAY_MS)
    }
  }
  
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(0)
  console.log(`\n🎉 Backfill terminé en ${totalTime}s`)
  console.log(`   ✅ ${totalOk} succès`)
  console.log(`   ❌ ${totalFailed} échecs`)
}

async function fetchAllJobIds(): Promise<string[]> {
  // Adapte à ta DB. Exemples :
  //
  // Prisma : const jobs = await prisma.job.findMany({ select: { id: true } })
  // Supabase : const { data } = await supabase.from('jobs').select('id')
  // Mongo : const jobs = await db.collection('jobs').find({}, { projection: { _id: 1 } }).toArray()
  //
  // 💡 Conseil : si > 100k jobs, fais un cursor/stream au lieu de tout charger d'un coup
  return []
}

main().catch((err) => {
  console.error('💥 Script crashed:', err)
  process.exit(1)
})