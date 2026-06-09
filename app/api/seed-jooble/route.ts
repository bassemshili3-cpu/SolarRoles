import { NextRequest, NextResponse } from 'next/server'
import { searchJooble } from '@/lib/jooble'
import { normalizeJooble } from '@/lib/jobs'
import { prisma } from '@/lib/prisma'

const KEYWORDS = [
  // FIFO / rotational US (more specific to reduce aviation noise)
  'rotational shift mining',
  'remote site mining jobs',
  'oil rig 14/14',
  'oil rig 21/7',
  'offshore rotation jobs',
  'Bakken oil field jobs',
  'Permian basin rotation',
  'Alaska mining rotation',
  'remote camp jobs',
  'mining camp operator',
  // Trades & Labor
  'electrician',
  'hvac',
  'lineman',
  'welder',
  'heavy equipment operator',
  'truck driver',
  'school bus driver',
  'oil rig',
  'general labor',
  // Healthcare
  'certified nursing assistant',
  'patient care technician',
  'nursing assistant',
  'medical assistant',
  'respiratory therapist',
  'surgical tech',
  'pharmacy technician',
  'new grad nurse',
  'labor and delivery nurse',
  'school nurse',
  'dental assistant',
  // Education
  'substitute teacher',
  'special education teacher',
  'art teacher',
  'social studies teacher',
  'paraprofessional',
  'summer camp counselor',
  'childcare',
  'daycare',
  'nanny',
  // Office & Professional
  'call center',
  'customer service',
  'project manager',
  'case manager',
  'executive assistant',
  'front desk',
  'remote hr',
  // Food & Retail
  'barista',
  'bartending',
  'planet fitness',
  // Teen / schedule
  'jobs for 16 year olds',
  'part time',
  'evening jobs',
  'weekend jobs',
  'weekly paying jobs',
]

const EXPIRY_DAYS = 30

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const keyword = searchParams.get('keyword')
  const keywords = keyword ? [keyword] : KEYWORDS

  let totalSaved = 0
  let totalErrors = 0
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS)

  for (const kw of keywords) {
    for (let page = 1; page <= 2; page++) {
      try {
        const data = await searchJooble({
          keywords: kw,
          location: 'USA',
          page,
          resultsOnPage: 50,
        })

        if (!data?.jobs?.length) continue

        for (const rawJob of data.jobs) {
          const job = normalizeJooble(rawJob)
          try {
            await prisma.job.upsert({
              where: { id: job.id },
              update: {
                title: job.title,
                company: job.company,
                location: job.location,
                description: job.description,
                applyUrl: job.apply_url,
                salaryMin: job.salary_min || null,
                salaryMax: job.salary_max || null,
                fetchedAt: new Date(),
                expiresAt,
                active: true,
              },
              create: {
                id: job.id,
                source: 'jooble',
                title: job.title,
                company: job.company,
                location: job.location,
                addressRegion: job.addressRegion || '',
                description: job.description,
                url: job.url,
                applyUrl: job.apply_url,
                salaryMin: job.salary_min || null,
                salaryMax: job.salary_max || null,
                postedAt: job.created ? new Date(job.created) : null,
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
        console.error(`Jooble seed error (${kw}, p${page}):`, e.message)
        totalErrors++
      }
    }
  }

  return NextResponse.json({
    success: true,
    saved: totalSaved,
    errors: totalErrors,
    keywords: keywords.length,
  })
}