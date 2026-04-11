// app/data/salaries/[title]/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ArrowLeft, DollarSign, MapPin } from 'lucide-react'

export const revalidate = 86400

const SLUG_TO_TITLE: Record<string, string> = {
  'registered-nurse': 'Registered Nurse',
  'software-engineer': 'Software Engineer',
  'data-analyst': 'Data Analyst',
  'project-manager': 'Project Manager',
  'dental-assistant': 'Dental Assistant',
  'electrician': 'Electrician',
  'medical-assistant': 'Medical Assistant',
  'truck-driver': 'Truck Driver',
  'accountant': 'Accountant',
  'customer-service': 'Customer Service',
  'sales-associate': 'Sales Associate',
  'pharmacy-technician': 'Pharmacy Technician',
}

function fmt(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

export async function generateStaticParams() {
  return Object.keys(SLUG_TO_TITLE).map((slug) => ({ title: slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ title: string }> }
): Promise<Metadata> {
  const { title: slug } = await params
  const jobTitle = SLUG_TO_TITLE[slug]
  if (!jobTitle) return { title: 'Not Found' }

  return {
    title: `${jobTitle} Salary by State 2026 | Average Pay Across the US`,
    description: `How much does a ${jobTitle} make in each state? Live salary data from real job listings. Compare average pay across all 50 states. Updated daily.`,
    keywords: `${jobTitle} salary, ${jobTitle} average pay, ${jobTitle} salary by state, how much does a ${jobTitle} make 2026`,
    alternates: { canonical: `https://www.oh-my-job.com/data/salaries/${slug}` },
  }
}

export default async function SalaryReportPage({
  params,
}: {
  params: Promise<{ title: string }>
}) {
  const { title: slug } = await params
  const jobTitle = SLUG_TO_TITLE[slug]
  if (!jobTitle) notFound()

  // ── Query: average salary by state for this job title ──
  const salaryByState = await prisma.$queryRaw<
    { addressRegion: string; avgSalary: number; count: number }[]
  >`
    SELECT
      "addressRegion",
      ROUND(AVG(("salaryMin" + "salaryMax") / 2))::int AS "avgSalary",
      COUNT(*)::int AS "count"
    FROM "Job"
    WHERE
      active = true
      AND "addressRegion" != ''
      AND "salaryMin" IS NOT NULL
      AND "salaryMin" > 0
      AND "salaryMax" IS NOT NULL
      AND "salaryMax" > 0
      AND LOWER(title) LIKE ${`%${jobTitle.toLowerCase()}%`}
    GROUP BY "addressRegion"
    HAVING COUNT(*) >= 3
    ORDER BY "avgSalary" DESC
  `

  // ── National average ──
  const nationalAgg = await prisma.job.aggregate({
    where: {
      active: true,
      title: { contains: jobTitle, mode: 'insensitive' },
      salaryMin: { not: null, gt: 0 },
      salaryMax: { not: null, gt: 0 },
    },
    _avg: { salaryMin: true, salaryMax: true },
    _count: { id: true },
  })

  const nationalAvg = Math.round(
    ((nationalAgg._avg.salaryMin || 0) + (nationalAgg._avg.salaryMax || 0)) / 2
  )
  const totalListings = nationalAgg._count.id

  const topState = salaryByState.length > 0 ? salaryByState[0] : null
  const bottomState = salaryByState.length > 0 ? salaryByState[salaryByState.length - 1] : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${jobTitle} Salary by State 2026`,
    description: `Average ${jobTitle} salary across US states based on real job listings.`,
    url: `https://www.oh-my-job.com/data/salaries/${slug}`,
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
            <DollarSign className="w-6 h-6 text-green-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {jobTitle} Salary by State
            </h1>
          </div>
          <p className="text-gray-500 max-w-2xl">
            Average listed salary for {jobTitle} positions across the United States, computed from {fmt(totalListings)} active job listings. States with fewer than 3 listings are excluded for accuracy.
          </p>
        </header>

        {/* ── STATS CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <div className="border border-gray-200 rounded-xl p-5 text-center">
            <p className="text-2xl font-bold text-gray-900">${fmt(nationalAvg)}</p>
            <p className="text-xs text-gray-500 mt-1">National avg.</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-5 text-center">
            <p className="text-2xl font-bold text-gray-900">{fmt(totalListings)}</p>
            <p className="text-xs text-gray-500 mt-1">Active listings</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-5 text-center">
            <p className="text-2xl font-bold text-green-700">{topState ? `$${fmt(topState.avgSalary)}` : '—'}</p>
            <p className="text-xs text-gray-500 mt-1">Highest ({topState?.addressRegion || '—'})</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-5 text-center">
            <p className="text-2xl font-bold text-red-600">{bottomState ? `$${fmt(bottomState.avgSalary)}` : '—'}</p>
            <p className="text-xs text-gray-500 mt-1">Lowest ({bottomState?.addressRegion || '—'})</p>
          </div>
        </div>

        {/* ── STATE TABLE ── */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {jobTitle} Average Salary by State
          </h2>
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
           
            <div className="grid grid-cols-4 gap-px bg-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="bg-white px-4 py-3">Rank</div>
              <div className="bg-white px-4 py-3">State</div>
              <div className="bg-white px-4 py-3 text-right">Avg. Salary</div>
              <div className="bg-white px-4 py-3 text-right">Listings</div>
            </div>
            
            {salaryByState.map((row, i) => {
              const diff = nationalAvg > 0 ? ((row.avgSalary - nationalAvg) / nationalAvg) * 100 : 0
              return (
                <div
                  key={row.addressRegion}
                  className={`grid grid-cols-4 gap-px ${i % 2 === 0 ? 'bg-gray-100' : 'bg-gray-100'}`}
                >
                  <div className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-4 py-3 text-sm font-bold text-gray-400`}>
                    {i + 1}
                  </div>
                  <div className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-4 py-3 text-sm`}>
                    <Link
                      href={`/data/states/${row.addressRegion.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-gray-800 hover:text-blue-600"
                    >
                      {row.addressRegion}
                    </Link>
                  </div>
                  <div className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-4 py-3 text-sm text-right`}>
                    <span className="font-semibold text-gray-900">${fmt(row.avgSalary)}</span>
                    <span className={`ml-2 text-xs ${diff >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {diff >= 0 ? '+' : ''}{diff.toFixed(0)}%
                    </span>
                  </div>
                  <div className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-4 py-3 text-sm text-right text-gray-500`}>
                    {row.count}
                  </div>
                </div>
              )
            })}
            {salaryByState.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-gray-400 bg-white">
                Not enough salary data available for this role. Check back tomorrow as listings update daily.
              </div>
            )}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="mt-16 bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Browse {jobTitle} Jobs</h2>
          <p className="text-sm text-gray-500 mb-4">See all {fmt(totalListings)} active {jobTitle} listings across the US</p>
          <Link
            href={`/jobs?what=${encodeURIComponent(jobTitle)}`}
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
          >
            View {jobTitle} Jobs
          </Link>
        </section>

        {/* ── DISCLAIMER ── */}
        <footer className="mt-16 border-t border-gray-200 pt-8">
          <p className="text-xs text-gray-400 text-center max-w-2xl mx-auto">
            Salary data computed from active job listings in the Oh My Job database. Figures reflect listed compensation ranges and may not include bonuses, equity, or benefits. States with fewer than 3 listings for this role are excluded. Updated daily.
          </p>
        </footer>
      </div>
    </>
  )
}