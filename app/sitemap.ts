import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const revalidate = 86400

const BASE_URL = 'https://www.oh-my-job.com'
const JOBS_PER_SITEMAP = 10000

// ── Date de dernière refonte connue ──────────────────────────
// À bumper manuellement à chaque changement structurel notable
// (nouveau bloc, nouvelle section, refonte de template...).
// Sert de lastModified plancher pour signaler à Bing/Google que
// le contenu a changé, même quand les données Prisma sous-jacentes
// n'ont pas été re-synchronisées.
const LAST_MAJOR_UPDATE = new Date('2026-07-08')

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
  // ── New keyword landing pages ──
  '/new-grad-nurse-jobs',
  '/language-pathologist-jobs',
  '/school-bus-driver-jobs',
  '/special-education-teacher-jobs',
  '/summer-camp-counselor-jobs',
  '/public-works-commission-jobs',
   '/manufacturing-jobs',
  '/physician-assistant-jobs',
  '/hr-jobs',
  '/preschool-jobs',
  '/local-truck-driving-jobs',
]

// ── Articles / FAQ hors blog (URL racine, sans préfixe /blog/) ──
const faqArticles: string[] = [
  '/could-you-collect-unemployment-if-you-quit-your-job',
  '/could-someone-get-fired-from-a-job-for-being-sick',
]

// ── Top Jobs ranking pages ───────────────────────────────────
const topJobsPages: string[] = [
  '/best-jobs-in-united-states-2026',
  '/best-jobs-without-a-degree-2026',
  '/best-paying-jobs-in-finance-2026',
  '/best-paying-easy-jobs-us',
  '/best-paying-blue-collar-jobs',
  '/best-paying-entry-level-jobs',
  '/best-paying-nursing-jobs-2026',
]

// ── Paycheck calculator pages ────────────────────────────────
const paycheckPages: string[] = [
  '/paycheck-calculator',
  '/paycheck-calculator/california',
  '/paycheck-calculator/illinois',
  '/paycheck-calculator/ohio',
  '/paycheck-calculator/michigan',
  '/paycheck-calculator/washington',
  '/paycheck-calculator/maryland',
  '/paycheck-calculator/new-york',
  '/paycheck-calculator/virginia',
  '/paycheck-calculator/nevada',
  '/paycheck-calculator/utah',
]

// ── Data Center pages ────────────────────────────────────────
const dataPages: string[] = [
  '/data',
]

const dataStatePages: string[] = [
  'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado',
  'connecticut', 'delaware', 'florida', 'georgia', 'hawaii', 'idaho',
  'illinois', 'indiana', 'iowa', 'kansas', 'kentucky', 'louisiana',
  'maine', 'maryland', 'massachusetts', 'michigan', 'minnesota',
  'mississippi', 'missouri', 'montana', 'nebraska', 'nevada',
  'new-hampshire', 'new-jersey', 'new-mexico', 'new-york',
  'north-carolina', 'north-dakota', 'ohio', 'oklahoma', 'oregon',
  'pennsylvania', 'rhode-island', 'south-carolina', 'south-dakota',
  'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington',
  'west-virginia', 'wisconsin', 'wyoming',
].map(s => `/data/states/${s}`)

const dataSalaryPages: string[] = [
  'registered-nurse', 'software-engineer', 'data-analyst',
  'project-manager', 'dental-assistant', 'electrician',
  'medical-assistant', 'truck-driver', 'accountant',
  'customer-service', 'sales-associate', 'pharmacy-technician',
].map(s => `/data/salaries/${s}`)

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
    lastModified?: Date // optionnel : surcharge ponctuelle si une page précise a changé récemment
  }
): MetadataRoute.Sitemap[number] {
  return {
    url: `${BASE_URL}${slug}`,
    lastModified: options.lastModified ?? LAST_MAJOR_UPDATE,
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
      { url: `${BASE_URL}`,      lastModified: LAST_MAJOR_UPDATE, changeFrequency: 'daily',  priority: 1.0 },
      { url: `${BASE_URL}/jobs`, lastModified: LAST_MAJOR_UPDATE, changeFrequency: 'hourly', priority: 0.9 },
    ]

    const priority = priorityLandingPages.map((slug) =>
      toSitemapEntry(slug, { changeFrequency: 'weekly', priority: 0.8 })
    )

    const standard = landingPages.map((slug) =>
      toSitemapEntry(slug, { changeFrequency: 'weekly', priority: 0.6 })
    )

    const topJobs = topJobsPages.map((slug) =>
      toSitemapEntry(slug, { changeFrequency: 'weekly', priority: 0.7 })
    )

    const paycheck = paycheckPages.map((slug) =>
      toSitemapEntry(slug, { changeFrequency: 'monthly', priority: 0.7 })
    )

    const data = [...dataPages, ...dataStatePages, ...dataSalaryPages].map((slug) =>
      toSitemapEntry(slug, { changeFrequency: 'daily', priority: 0.7 })
    )

    const blog = blogPosts.map((slug) =>
      toSitemapEntry(slug, { changeFrequency: 'monthly', priority: 0.5 })
    )
     const faq = faqArticles.map((slug) =>
      toSitemapEntry(slug, { changeFrequency: 'monthly', priority: 0.5 })
    )

    return [...core, ...priority, ...standard, ...topJobs, ...paycheck, ...data, ...blog, ...faq]
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
    // On prend le plus récent entre la vraie date de synchro des données
    // et la date de dernière refonte du template. Ça évite qu'une offre
    // non re-synchronisée depuis la refonte affiche un lastmod obsolète
    // qui ne reflète pas le nouveau rendu HTML (bloc salaire, Similar positions...).
    lastModified: job.fetchedAt > LAST_MAJOR_UPDATE ? job.fetchedAt : LAST_MAJOR_UPDATE,
    changeFrequency: 'daily' as const,
    priority: 0.4,
  }))
}