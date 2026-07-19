// app/api/cron/backfill-header-images/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { matchRoleCategory } from '@/lib/roleCategories'

// Pexels: respecte un rythme raisonnable pour rester sous les rate limits
const BATCH_SIZE = 40
const DELAY_MS = 300

async function fetchPexelsImage(query: string): Promise<string | null> {
  const PEXELS_API_KEY = process.env.PEXELS_API_KEY
  if (!PEXELS_API_KEY) return null

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(`${query} professional`)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: PEXELS_API_KEY } }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.photos?.[0]?.src?.landscape ?? null
  } catch (err: any) {
    console.error('Pexels error:', err.message)
    return null
  }
}

export async function GET(req: Request) {
  // Sécurise le cron (pattern standard Vercel Cron)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const jobs = await prisma.job.findMany({
    where: { needsHeaderImage: true, headerImage: null, active: true },
    select: { id: true, title: true, description: true },
    take: BATCH_SIZE,
  })

  let updated = 0
  let skipped = 0

  for (const job of jobs) {
    const roleMatch = matchRoleCategory(job.title, job.description)
    const query = roleMatch?.label || job.title

    const imageUrl = await fetchPexelsImage(query)

    // Qu'on ait trouvé une image ou non, on marque comme traité
    // pour ne pas re-taper Pexels indéfiniment sur les mêmes jobs sans résultat.
    await prisma.job.update({
      where: { id: job.id },
      data: {
        headerImage: imageUrl,
        needsHeaderImage: false,
      },
    })

    if (imageUrl) updated++
    else skipped++

    await new Promise((r) => setTimeout(r, DELAY_MS))
  }

  return NextResponse.json({
    processed: jobs.length,
    updated,
    skipped,
  })
}