import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const maxDuration = 120 // ajuste selon le temps réel observé

const BASE_URL = 'https://www.oh-my-job.com'
const JOBS_PER_SITEMAP = 10000
const BATCH_SIZE = 3 // évite de spammer la DB avec 29+ requêtes simultanées

function getJobCutoff(): Date {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 14)
  return cutoff
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const count = await prisma.job.count({
    where: {
      active: true,
      expiresAt: { gt: new Date() },
      fetchedAt: { gt: getJobCutoff() },
    },
  })
  const chunkCount = Math.ceil(count / JOBS_PER_SITEMAP)

  const urls = [
    `${BASE_URL}/sitemap.xml`,
    `${BASE_URL}/sitemap-pages.xml`,
    ...Array.from({ length: chunkCount }, (_, i) => `${BASE_URL}/sitemap/${i + 1}.xml`),
  ]

  let succeeded = 0
  let failed = 0

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE)
    const results = await Promise.allSettled(
      batch.map((url) => fetch(url, { cache: 'no-store' }))
    )
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value.ok) succeeded++
      else failed++
    }
  }

  console.log(`🔥 Sitemap warm-up: ${succeeded}/${urls.length} OK, ${failed} échec(s)`)

  return NextResponse.json({ warmed: succeeded, failed, total: urls.length })
}