import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const revalidate = 86400

const BASE_URL = 'https://www.oh-my-job.com'
const JOBS_PER_SITEMAP = 10000

// ── Helper date : jobs des 14 derniers jours uniquement ──────
function getJobCutoff(): Date {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 14)
  return cutoff
}

// ── Landing pages SEO prioritaires ──────────────────────────
const priorityLandingPages: string[] = [
  '/jobs-for-14-year-olds',
  '/jobs-for-15-year-olds',
  '/jobs-for-16-year-olds',
  '/fifo-jobs',
]

// ── Landing pages SEO standard ──────────────────────────────
const landingPages: string[] = [
  '/allied-universal-jobs',
  '/cna-jobs',
  '/dental-assistant-jobs',
  '/dignity-health-jobs',
  '/oil-rig-jobs',
  '/pharmacy-technician-jobs',
  '/project-manager-jobs',
  '/amgen-jobs',
  '/armed-security-jobs',
  '/city-of-reno-jobs',
  '/healthcare-administration-jobs',
  '/press-association-jobs',
  '/substitute-teacher-jobs',
  '/ucsd-jobs',
  '/burger-king-corporation-jobs',
  '/ekg-technician-jobs',
  '/engineering-jobs',
  '/executive-assistant-jobs',
  '/heavy-equipment-operator-jobs',
  '/hvac-jobs',
  '/jobs-at-property-management',
  '/live-nation-jobs',
  '/nanny-jobs',
  '/pct-jobs',
  '/barista-jobs',
  '/bartending-jobs',
  '/cintas-company-jobs',
  '/customer-service-jobs',
  '/daycare-jobs',
  '/electrician-jobs',
  '/medical-assistant-jobs',
  '/front-desk-jobs',
  '/part-time-jobs',
  '/planet-fitness-jobs',
  '/welding-jobs',
  '/assisted-reproductive-technology-jobs',
  '/chick-fil-a-careers',
  '/exelon-careers',
  '/housekeeping-jobs-near-you',
  '/honda-careers',
  '/school-nurse-jobs',
  '/paraprofessional-jobs',
  '/sonic-careers',
  '/national-grid-careers',
  '/cardinal-health-careers',
  '/patient-transporter-jobs',
  '/doordash-careers',
  '/art-teacher-jobs',
  '/case-manager-jobs',
  '/evening-jobs',
  '/event-organization-jobs',
  '/entry-level-data-analyst-jobs',
  '/quality-assurance-jobs',
  '/remote-hr-jobs',
  '/respiratory-therapist-jobs',
  '/weekly-paying-jobs',
  '/surgical-tech-jobs',
  '/chase-bank-jobs',
  '/dog-walking-jobs',
  '/emt-jobs',
  '/sales-job',
  '/social-media-supervisor',
  '/weekend-jobs',
  '/talent-acquisition-jobs',
]

// ── Articles de blog ─────────────────────────────────────────
const blogPosts: string[] = [
  '/blog/how-to-quit-a-job',
  '/blog/return-to-office-mandates-backfiring',
  '/blog/the-30-second-rule',
  '/blog/what-six-figures-really-means',
  '/blog/job-interview-questions',
]

// ── Helper ───────────────────────────────────────────────────
function toSitemapEntry(
  slug: string,
  options: {
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
    priority: number
  }
): MetadataRoute.Sitemap[number] {
  return {
    url: `${BASE_URL}${slug}`,
    lastModified: new Date(),
    changeFrequency: options.changeFrequency,
    priority: options.priority,
  }
}

// ── generateSitemaps ─────────────────────────────────────────
export async function generateSitemaps() {
  const count = await prisma.job.count({
    where: {
      active: true,
      expiresAt: { gt: new Date() },
      fetchedAt: { gt: getJobCutoff() },
    },
  })

  const jobBatchCount = Math.ceil(count / JOBS_PER_SITEMAP)

  return [
    { id: 0 },
    ...Array.from({ length: jobBatchCount }, (_, i) => ({ id: i + 1 })),
  ]
}

// ── Sitemap par id ───────────────────────────────────────────
export default async function sitemap({
  id,
}: {
  id: number
}): Promise<MetadataRoute.Sitemap> {

  // id=0 : toutes les pages statiques
  if (id === 0) {
    const core: MetadataRoute.Sitemap = [
      { url: `${BASE_URL}`,      changeFrequency: 'daily',  priority: 1.0 },
      { url: `${BASE_URL}/jobs`, changeFrequency: 'hourly', priority: 0.9 },
    ]

    const priority = priorityLandingPages.map((slug) =>
      toSitemapEntry(slug, { changeFrequency: 'weekly', priority: 0.8 })
    )

    const standard = landingPages.map((slug) =>
      toSitemapEntry(slug, { changeFrequency: 'weekly', priority: 0.6 })
    )

    const blog = blogPosts.map((slug) =>
      toSitemapEntry(slug, { changeFrequency: 'monthly', priority: 0.5 })
    )

    return [...core, ...priority, ...standard, ...blog]
  }

  // id=1+ : batches de job detail pages (14 derniers jours uniquement)
  const jobs = await prisma.job.findMany({
    where: {
      active: true,
      expiresAt: { gt: new Date() },
      fetchedAt: { gt: getJobCutoff() },
    },
    select: {
      id: true,
      fetchedAt: true,
    },
    orderBy: { fetchedAt: 'desc' },
    skip: (id - 1) * JOBS_PER_SITEMAP,
    take: JOBS_PER_SITEMAP,
  })

  return jobs.map((job) => ({
    url: `${BASE_URL}/jobs/${job.id}`,
    lastModified: job.fetchedAt,
    changeFrequency: 'daily' as const,
    priority: 0.4,
  }))
}