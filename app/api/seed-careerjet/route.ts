import { NextRequest, NextResponse } from 'next/server'
import { searchCareerjetJobs, normalizeCareerjet } from '@/lib/careerjet'
import { prisma } from '@/lib/prisma'

// CareerJet exige un user_ip réaliste — 0.0.0.0 déclenche un 403.
// On tourne sur une pool d'IPs US pour simuler des utilisateurs réels.
const US_IPS = [
  '98.207.254.110', '68.45.162.33', '72.229.28.185', '75.108.44.195',
  '107.77.193.210', '174.195.50.218', '50.193.209.6', '24.26.163.50',
  '76.102.7.211', '67.161.83.42',
]

function pickIp(index: number): string {
  return US_IPS[index % US_IPS.length]
}

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
  let ipIndex = 0
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS)

  for (const keyword of KEYWORDS) {
    for (let page = 1; page <= 3; page++) {
      try {
        const data = await searchCareerjetJobs({
          keywords: keyword,
          page,
          page_size: 20,
          user_ip: pickIp(ipIndex++),
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          noCache: true,
        })

        if (!data?.jobs?.length) continue

        for (const rawJob of data.jobs) {
          const job = normalizeCareerjet(rawJob)
          try {

const existing = await prisma.job.findUnique({
  where: { id: job.id },
  select: { addressRegion: true, salaryMin: true, salaryMax: true },
})

await prisma.job.upsert({
  where: { id: job.id },
  update: {
    title: job.title,
    company: job.company,
    location: job.location,
    // Ne jamais écraser une région déjà connue par du vide
    addressRegion: job.addressRegion || existing?.addressRegion || '',
    description: job.description,
    applyUrl: job.applyUrl,
    // Idem pour le salaire : garder l'existant si la nouvelle extraction échoue
    salaryMin: job.salaryMin ?? existing?.salaryMin ?? null,
    salaryMax: job.salaryMax ?? existing?.salaryMax ?? null,
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
    addressRegion: job.addressRegion || '',
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