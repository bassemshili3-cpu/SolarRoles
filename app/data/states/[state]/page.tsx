// app/data/states/[state]/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ArrowLeft, Building2, Briefcase, DollarSign, MapPin } from 'lucide-react'
import { STATES, SLUG_TO_STATE } from '@/lib/usStates'

export const revalidate = 86400

// ── Salary sanity bounds — values outside this range are hourly/monthly/corrupt ──
// $20 000 minimum : élimine les valeurs horaires ($15) et mensuelles ($1 500)
// $600 000 maximum : élimine les outliers extrêmes (CEO packages mal encodés)
const SALARY_MIN_THRESHOLD = 20_000
const SALARY_MAX_THRESHOLD = 600_000

function fmt(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

export async function generateStaticParams() {
  return Object.keys(SLUG_TO_STATE).map((slug) => ({ state: slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ state: string }> }
): Promise<Metadata> {
  const { state: slug } = await params
  const stateName = SLUG_TO_STATE[slug]
  if (!stateName) return { title: 'Not Found' }

  return {
    title: `${stateName} Job Market Data 2026 | Salaries, Top Employers & Hiring Trends`,
    description: `Live job market statistics for ${stateName}. Average salaries, top hiring companies, most in-demand roles, and more. Computed from real job listings. Updated daily.`,
    keywords: `${stateName} job market, ${stateName} average salary, ${stateName} hiring companies, ${stateName} employment data 2026`,
    alternates: { canonical: `https://www.oh-my-job.com/data/states/${slug}` },
  }
}

export default async function StateDataPage({
  params,
}: {
  params: Promise<{ state: string }>
}) {
  const { state: slug } = await params
  const stateName = SLUG_TO_STATE[slug]
  if (!stateName) notFound()

  // addressRegion en base stocke le code à 2 lettres ("MA"), pas le nom complet
  // ("Massachusetts") — on filtre sur les deux formats par sécurité, au cas où
  // une source aurait stocké le nom complet sans passer par extractStateFromLocation.
  const stateCode = STATES[stateName]
  const addressRegionFilter = { in: [stateName, stateCode] }

  // ── Queries ──
  const [
    totalJobs,
    salaryAgg,
    topCompanies,
    topTitles,
    contractBreakdown,
  ] = await Promise.all([
    // Total active jobs in this state
    prisma.job.count({
      where: { active: true, addressRegion: addressRegionFilter },
    }),

    // Average salary — annuel uniquement
    // FIX: filtre gte 20 000 et lte 600 000 pour exclure les valeurs horaires,
    // mensuelles et les outliers. Sans ce filtre, les salaires horaires ($15)
    // et mensuels ($1 200) tirent la moyenne vers le bas (ex: $11 957 affiché).
    prisma.job.aggregate({
      where: {
        active: true,
        addressRegion: addressRegionFilter,
        salaryMin: {
          gte: SALARY_MIN_THRESHOLD,
          lte: SALARY_MAX_THRESHOLD,
        },
        salaryMax: {
          gte: SALARY_MIN_THRESHOLD,
          lte: SALARY_MAX_THRESHOLD,
        },
      },
      _avg: { salaryMin: true, salaryMax: true },
      _min: { salaryMin: true },
      _max: { salaryMax: true },
      _count: { id: true },
    }),

    // Top 15 hiring companies
    prisma.job.groupBy({
      by: ['company'],
      where: { active: true, addressRegion: addressRegionFilter, company: { not: '' } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 15,
    }),

    // Top 15 job titles
    prisma.job.groupBy({
      by: ['title'],
      where: { active: true, addressRegion: addressRegionFilter },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 15,
    }),

    // Contract type breakdown
    prisma.job.groupBy({
      by: ['contractTime'],
      where: { active: true, addressRegion: addressRegionFilter },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),
  ])

  // Moyenne de (salaryMin + salaryMax) / 2 — uniquement sur les valeurs filtrées
  const avgSalary =
    salaryAgg._avg.salaryMin != null && salaryAgg._avg.salaryMax != null
      ? Math.round((salaryAgg._avg.salaryMin + salaryAgg._avg.salaryMax) / 2)
      : null

  const minSalary = salaryAgg._min.salaryMin ?? null
  const maxSalary = salaryAgg._max.salaryMax ?? null
  const salaryCount = salaryAgg._count.id

  const fullTimeCount = contractBreakdown.find(c => c.contractTime === 'full_time')?._count.id || 0
  const partTimeCount = contractBreakdown.find(c => c.contractTime === 'part_time')?._count.id || 0

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${stateName} Job Market Data 2026`,
    description: `Live job market statistics for ${stateName} including salary data and top employers.`,
    url: `https://www.oh-my-job.com/data/states/${slug}`,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-5xl mx-auto px-6 py-16">

        <Link href="/data" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Data Center
        </Link>

        {/* ── HEADER ── */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <MapPin className="w-6 h-6 text-blue-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {stateName} Job Market Data
            </h1>
          </div>
          <p className="text-gray-500 max-w-2xl">
            Live snapshot of the {stateName} job market based on {fmt(totalJobs)} active listings in our database. All figures are computed from real postings and update daily.
          </p>
        </header>

        {/* ── STATS CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <div className="border border-gray-200 rounded-xl p-5 text-center">
            <p className="text-2xl font-bold text-gray-900">{fmt(totalJobs)}</p>
            <p className="text-xs text-gray-500 mt-1">Active listings</p>
          </div>

          <div className="border border-gray-200 rounded-xl p-5 text-center">
            {avgSalary != null ? (
              <>
                <p className="text-2xl font-bold text-gray-900">${fmt(avgSalary)}</p>
                <p className="text-xs text-gray-500 mt-1">Avg. salary ({fmt(salaryCount)} with data)</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-400">—</p>
                <p className="text-xs text-gray-400 mt-1">Avg. salary (no data)</p>
              </>
            )}
          </div>

          <div className="border border-gray-200 rounded-xl p-5 text-center">
            {minSalary != null ? (
              <>
                <p className="text-2xl font-bold text-gray-900">${fmt(minSalary)}</p>
                <p className="text-xs text-gray-500 mt-1">Lowest listed</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-400">—</p>
                <p className="text-xs text-gray-400 mt-1">Lowest listed</p>
              </>
            )}
          </div>

          <div className="border border-gray-200 rounded-xl p-5 text-center">
            {maxSalary != null ? (
              <>
                <p className="text-2xl font-bold text-gray-900">${fmt(maxSalary)}</p>
                <p className="text-xs text-gray-500 mt-1">Highest listed</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-400">—</p>
                <p className="text-xs text-gray-400 mt-1">Highest listed</p>
              </>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">

          {/* ── TOP EMPLOYERS ── */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-amber-600" />
              <h2 className="text-xl font-bold text-gray-900">Top Hiring Companies</h2>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {topCompanies.map((company, i) => (
                <div
                  key={company.company}
                  className={`flex items-center justify-between px-4 py-3 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                    <span className="text-sm text-gray-800">{company.company}</span>
                  </div>
                  <span className="text-xs text-gray-500">{company._count.id} openings</span>
                </div>
              ))}
              {topCompanies.length === 0 && (
                <p className="px-4 py-6 text-sm text-gray-400 text-center">No data available</p>
              )}
            </div>
          </section>

          {/* ── TOP JOB TITLES ── */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Most In-Demand Roles</h2>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {topTitles.map((title, i) => (
                <div
                  key={title.title}
                  className={`flex items-center justify-between px-4 py-3 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                    <span className="text-sm text-gray-800">{title.title}</span>
                  </div>
                  <span className="text-xs text-gray-500">{title._count.id} listings</span>
                </div>
              ))}
              {topTitles.length === 0 && (
                <p className="px-4 py-6 text-sm text-gray-400 text-center">No data available</p>
              )}
            </div>
          </section>
        </div>

        {/* ── CONTRACT TYPE BREAKDOWN ── */}
        {totalJobs > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Employment Type Breakdown</h2>
            <div className="flex gap-4">
              {fullTimeCount > 0 && (
                <div className="flex-1 border border-gray-200 rounded-xl p-5 text-center">
                  <p className="text-2xl font-bold text-gray-900">{fmt(fullTimeCount)}</p>
                  <p className="text-xs text-gray-500 mt-1">Full-time</p>
                  <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(fullTimeCount / totalJobs) * 100}%` }} />
                  </div>
                </div>
              )}
              {partTimeCount > 0 && (
                <div className="flex-1 border border-gray-200 rounded-xl p-5 text-center">
                  <p className="text-2xl font-bold text-gray-900">{fmt(partTimeCount)}</p>
                  <p className="text-xs text-gray-500 mt-1">Part-time</p>
                  <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${(partTimeCount / totalJobs) * 100}%` }} />
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── CTA ── */}
        <section className="mt-16 bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Browse {stateName} Jobs</h2>
          <p className="text-sm text-gray-500 mb-4">See all {fmt(totalJobs)} active listings in {stateName}</p>
          <Link
            href={`/jobs?where=${encodeURIComponent(stateName)}`}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            View {stateName} Jobs
          </Link>
        </section>

        {/* ── DISCLAIMER ── */}
        <footer className="mt-16 border-t border-gray-200 pt-8">
          <p className="text-xs text-gray-400 text-center max-w-2xl mx-auto">
            Data computed from active job listings in the Oh My Job database. Salary figures reflect listed annual compensation ($20k–$600k range) and may not include bonuses, equity, or benefits. Updated daily. This page does not constitute employment or financial advice.
          </p>
        </footer>
      </div>
    </>
  )
}