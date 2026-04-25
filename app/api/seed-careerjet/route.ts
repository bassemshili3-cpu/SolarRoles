import { NextRequest, NextResponse } from 'next/server'
import { searchCareerjetJobs, normalizeCareerjet } from '@/lib/careerjet'
import { prisma } from '@/lib/prisma'

const KEYWORDS = [
  'allied universal', 'amgen', 'cardinal health', 'cintas',
  'chase bank', 'doordash', 'exelon', 'honda',
  'city of grand rapids', 'city of reno', 'city of laredo', 'city of portland',
  'certified nursing assistant', 'patient care technician',
  'social studies teacher', 'special education teacher',
  'call center', 'customer service', 'truck driver',
  'electrician', 'lineman', 'school bus driver',
  'art teacher', 'substitute teacher', 'paraprofessional',
  'language pathologist', 'new grad nurse', 'school nurse',
  'summer camp counselor', 'childcare', 'daycare', 'nanny',
  // ajoute autant que tu veux
]

const EXPIRY_DAYS = 30

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let totalSaved = 0
  let totalErrors = 0
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS)

  for (const keyword of KEYWORDS) {
    for (let page = 1; page <= 3; page++) {
      try {
        const data = await searchCareerjetJobs({
          keywords: keyword,
          page,
          page_size: 20,
        })

        if (!data?.jobs?.length) continue

        for (const rawJob of data.jobs) {
          const job = normalizeCareerjet(rawJob)
          try {
            await prisma.job.upsert({
              where: { id: job.id },
              update: {
                title: job.title,
                company: job.company,
                location: job.location,
                description: job.description,
                applyUrl: job.applyUrl,
                salaryMin: job.salaryMin || null,
                salaryMax: job.salaryMax || null,
                fetchedAt: new Date(),
                expiresAt,
                active: true,
              },
              create: {
                id: job.id,
                source: 'careerjet',
                title: job.title,
                company: job.company,
                location: job.location,
                addressRegion: '',
                description: job.description,
                url: job.url,
                applyUrl: job.applyUrl,
                salaryMin: job.salaryMin || null,
                salaryMax: job.salaryMax || null,
                postedAt: job.postedAt ? new Date(job.postedAt) : null,
                fetchedAt: new Date(),
                expiresAt,
                active: true,
              },
            })
            totalSaved++
          } catch {
            totalErrors++
          }
        }

        await new Promise((r) => setTimeout(r, 300))
      } catch (e: any) {
        console.error(`Careerjet error (${keyword}, p${page}):`, e.message)
        totalErrors++
      }
    }
  }

  return NextResponse.json({
    success: true,
    saved: totalSaved,
    errors: totalErrors,
    keywords: KEYWORDS.length,
  })
}