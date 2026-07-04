// app/api/cron/backfill-address-region/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractStateFromLocation } from '@/lib/usStates'
import { extractSalaryFromText } from '@/lib/extractSalary'
import { SALARY_MIN_THRESHOLD, SALARY_MAX_THRESHOLD } from '@/lib/salaryBounds'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const dryRun = searchParams.get('dry_run') !== 'false'
  const limit = parseInt(searchParams.get('limit') || '500')

  const candidates = await prisma.job.findMany({
    where: {
      OR: [
        { addressRegion: '' },
        { salaryMin: null },
        { salaryMax: null },
      ],
    },
    select: {
      id: true,
      location: true,
      title: true,
      description: true,
      addressRegion: true,
      salaryMin: true,
      salaryMax: true,
    },
    take: limit,
  })

  let regionMatched = 0
  let salaryMatched = 0
  const preview: any[] = []

  for (const job of candidates) {
    const data: any = {}

    if (!job.addressRegion) {
      const resolved = extractStateFromLocation(job.location)
      if (resolved) {
        data.addressRegion = resolved
        regionMatched++
      }
    }

    if (job.salaryMin == null || job.salaryMax == null) {
      const extracted = extractSalaryFromText(job.title, job.description || '')
      const min = extracted?.min
      const max = extracted?.max

      if (
        min != null &&
        max != null &&
        min >= SALARY_MIN_THRESHOLD &&
        max <= SALARY_MAX_THRESHOLD
      ) {
        data.salaryMin = min
        data.salaryMax = max
        salaryMatched++
      }
    }

    if (Object.keys(data).length > 0) {
      if (preview.length < 20) preview.push({ id: job.id, title: job.title, ...data })
      if (!dryRun) {
        await prisma.job.update({ where: { id: job.id }, data })
      }
    }
  }

  return NextResponse.json({
    dryRun,
    candidatesFound: candidates.length,
    regionMatched,
    salaryMatched,
    preview,
  })
}