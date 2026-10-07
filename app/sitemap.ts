// app/sitemap.ts

import type { MetadataRoute } from "next";
import { getCanonicalJobUrl } from "@/lib/job-url";
import { SITE_URL } from "@/lib/site-url";
import { NON_INDEXABLE_JOB_SOURCES } from "@/lib/job-indexing";
import { prisma } from "@/lib/prisma"; // adapte à ton import habituel
import { CERTIFICATIONS } from "@/app/certifications/[slug]/certifications-data"

const BASE_URL = SITE_URL
export const revalidate = 60


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
  '/data/solar-desk-job-illusion',
  '/data/remote-solar-jobs-travel-requirements',
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
// Job-detail URLs below must be available, recent and indexable.
// Aggregator exclusions are shared with job metadata.
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

  // Available, recent jobs from every indexable source.
const now = new Date()
const oneMonthAgo = new Date(now.getTime() - 30 * 86_400_000)

const indexableJobs = await prisma.job.findMany({
  where: {
    active: true,
    expiresAt: { gt: now },
    source: { notIn: NON_INDEXABLE_JOB_SOURCES },
    OR: [
      { postedAt: { gte: oneMonthAgo } },
      { postedAt: null, fetchedAt: { gte: oneMonthAgo } },
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

  for (const job of indexableJobs) {
    entries.push({
      url: getCanonicalJobUrl(job),
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
