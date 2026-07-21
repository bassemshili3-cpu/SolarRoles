// app/sitemap.ts

import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma"; // adapte à ton import habituel

const BASE_URL = 'https://www.oh-my-job.com'
const LAST_MAJOR_UPDATE = new Date('2026-07-08')

// ── Landing pages SEO prioritaires ──────────────────────────
const priorityLandingPages: string[] = [
  '/jobs-for-14-year-olds',
  '/jobs-for-15-year-olds',
  '/jobs-for-16-year-olds',
  '/fifo-jobs',
  '/allied-universal-jobs',
  '/cna-jobs',
  '/dental-assistant-jobs',
  '/dignity-health-jobs',
  '/oil-rig-jobs',
  '/pharmacy-technician-jobs',
  '/project-manager-jobs',
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

// ── Articles / FAQ hors blog ─────────────────────────────────
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
const dataPages: string[] = ['/data']

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

// ── Config par section : priorité, fréquence, date ─────────
// IMPORTANT : ne mets ici QUE des pages à forte valeur ajoutée.
// Les pages job listing agrégées (/jobs/{source}-{id}...),
// CareerJet/Jooble/Lensa/Adzuna, ne doivent PAS apparaître dans
// ce sitemap : elles sont en noindex + bloquées au crawl (voir
// robots.ts) tant que le domaine récupère la confiance de Google.
// Les jobs "own" (postés par les employeurs, isOwn: true) sont
// injectés dynamiquement plus bas, eux sont indexables.
const sections: {
  routes: string[]
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]
  priority: number
  lastModified?: Date
}[] = [
  { routes: priorityLandingPages, changeFrequency: "monthly", priority: 0.8 },
  { routes: faqArticles, changeFrequency: "yearly", priority: 0.5 },
  { routes: topJobsPages, changeFrequency: "monthly", priority: 0.7 },
  { routes: paycheckPages, changeFrequency: "monthly", priority: 0.6 },
  { routes: dataPages, changeFrequency: "weekly", priority: 0.9 },
  { routes: dataStatePages, changeFrequency: "weekly", priority: 0.8 },
  { routes: dataSalaryPages, changeFrequency: "weekly", priority: 0.8 },
  { routes: blogPosts, changeFrequency: "monthly", priority: 0.6 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: LAST_MAJOR_UPDATE,
      changeFrequency: "weekly",
      priority: 1,
    },
  ]

  for (const section of sections) {
    for (const route of section.routes) {
      entries.push({
        url: `${BASE_URL}${route}`,
        lastModified: section.lastModified ?? LAST_MAJOR_UPDATE,
        changeFrequency: section.changeFrequency,
        priority: section.priority,
      })
    }
  }

  // ── Jobs "own" (indexables) ──────────────────────────────
  // Adapte le `where` à ton schema exact (status actif, etc.)
const ownJobs = await prisma.job.findMany({
  where: { postedByUserId: { not: null }, active: true },
  select: { id: true, postedAt: true, fetchedAt: true },
})

for (const job of ownJobs) {
  entries.push({
    url: `${BASE_URL}/jobs/${job.id}`,
    lastModified: job.postedAt ?? job.fetchedAt,
    changeFrequency: "daily",
    priority: 0.7,
  })
}

  // Sécurité anti-doublons si jamais une route apparaît dans
  // deux tableaux/sources par erreur
  const seen = new Set<string>()
  return entries.filter((entry) => {
    if (seen.has(entry.url)) return false
    seen.add(entry.url)
    return true
  })
}