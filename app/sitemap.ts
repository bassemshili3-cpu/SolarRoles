// app/sitemap.ts

import type { MetadataRoute } from "next";
import { getCanonicalJobSlug } from "@/lib/slugify";
import { prisma } from "@/lib/prisma"; // adapte à ton import habituel
import { JobDetail } from "@/lib/jobDetail";
import { CERTIFICATIONS } from "@/app/certifications/[slug]/certifications-data"

const BASE_URL = 'https://www.solarroles.com'


const ATS_SOURCES = [
  'ashby',
  'smartrecruiters',
  'lever',
  'workable',
  'pinpoint',
  'jobvite',
  'greenhouse',
  'workday',
]

// ── Landing pages SEO prioritaires ──────────────────────────
const priorityLandingPages: string[] = [
  '/solar-pv-installer-jobs',
  '/solar-electrician-jobs',
  '/solar-technician-jobs',
  '/lead-solar-installer-jobs',
  '/solar-jobs-no-experience',
  '/solar-sales-jobs',
  '/bess-technician-jobs',
]

// ── Certifications (pages piliers affiliées) ────────────────
const certificationPages: string[] = CERTIFICATIONS.map(
  c => `/certifications/${c.slug}`
)

// ── Data Center pages ────────────────────────────────────────
const dataPages: string[] = [
  '/data',
  '/data/solar-sales-jobs-business-expenses',
  '/data/remote-solar-jobs-travel-requirements',
  '/data/solar-installer-salary-rent-report',
  '/data/battery-storage-leads-segment-specific-solar-hiring',
]

const dataSalaryPages: string[] = [
  'solar-photovoltaic-installer', 'lead-solar-installer',
'solar-electrician', 'solar-technician', 'solar-engineer', 'solar-sales-representative',
].map(s => `/data/salaries/${s}`)

// ── Resources (guides carrière / certifications) ────────────
const resourcePages: string[] = [
  'solar-engineer-jobs',
  'how-to-become-a-solar-installer',
  'how-to-get-a-solar-apprenticeship',
  'manufacturer-certifications-tesla-enphase-solaredge',
  'nabcep-training-providers-compared',
  'nabcep-vs-eta-vs-state-licenses',
  'osha-safety-guide-solar-installers',
  'solar-dc-safety-for-electricians',
  'solar-certifications-by-job-role',
  'solar-installer-apprenticeship-programs',
  'solar-installer-certification',
  'how-to-get-nabcep-certified',
  'nabcep-board-eligible-status',
'nabcep-project-credits-explained',
'nabcep-pvip-pass-rate',
'nabcep-pvis-vs-pvip',
'solar-sales-1099-vs-w2-pay',
'do-you-need-to-be-an-electrician-for-bess',
].map(s => `/resources/${s}`)

const workforceResourcePages: string[] = [
  '/workforce-resources',
  '/workforce-resources/entry-level-solar-jobs',
  '/workforce-resources/solar-career-pathways',
  '/workforce-resources/solar-apprenticeship-licensing',
  '/workforce-resources/solar-salary-explorer',
  '/workforce-resources/solar-job-market-by-state',
  '/workforce-resources/solar-skills-certifications',
  '/workforce-resources/solar-employers-hiring',
  '/workforce-resources/jobs-widget',
  '/workforce-resources/jobs-widget/privacy',
]

// ── Articles de blog ─────────────────────────────────────────
const blogPosts: string[] = [
  '/blog/how-to-land-first-solar-job',
  '/blog/become-solar-installer-no-experience',
  '/blog/what-does-a-solar-installer-do',
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
}[] = [
  { routes: priorityLandingPages, changeFrequency: "monthly", priority: 0.8 },
  { routes: certificationPages, changeFrequency: "monthly", priority: 0.8 },
  { routes: dataPages, changeFrequency: "weekly", priority: 0.9 },
  { routes: dataSalaryPages, changeFrequency: "weekly", priority: 0.8 },
  { routes: resourcePages, changeFrequency: "monthly", priority: 0.7 },
  { routes: workforceResourcePages, changeFrequency: "weekly", priority: 0.8 },
  { routes: blogPosts, changeFrequency: "monthly", priority: 0.6 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
  ]

  for (const section of sections) {
    for (const route of section.routes) {
      entries.push({
        url: `${BASE_URL}${route}`,
        changeFrequency: section.changeFrequency,
        priority: section.priority,
      })
    }
  }

  // State data pages are intentionally excluded from the sitemap.

  // ── Jobs "own" (indexables) ──────────────────────────────
const oneMonthAgo = new Date(Date.now() - 30 * 86_400_000)

const ownJobs = await prisma.job.findMany({
  where: {
    active: true,
    AND: [
      {
        OR: [
          { postedByUserId: { not: null } },
          { source: { in: ATS_SOURCES } },
          { source: 'custom-scrape' },
        ],
      },
      {
        OR: [
          { postedAt: { gte: oneMonthAgo } },
          { postedAt: null, fetchedAt: { gte: oneMonthAgo } },
        ],
      },
    ],
  },
  select: {
    id: true,
    title: true,
    canonicalSlug: true,
    location: true,
    postedAt: true,
    fetchedAt: true,
    updatedAt: true,
  },
})

  for (const job of ownJobs) {
    entries.push({
      url: `${BASE_URL}/jobs/${job.id}/${getCanonicalJobSlug(job)}`,
      lastModified: job.updatedAt,
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
