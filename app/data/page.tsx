// app/data/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { BarChart2, Building2, MapPin, DollarSign, TrendingUp, Briefcase } from 'lucide-react'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'US Job Market Data Center | Salary Stats, Hiring Trends & More',
  description: 'Live job market data pulled from thousands of active listings across the US. Average salaries by state, top hiring companies, job market snapshots, and more. Updated daily.',
  keywords: 'US job market data, average salary by state, top hiring companies, job market statistics 2026, employment data',
  alternates: { canonical: 'https://www.oh-my-job.com/data' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'US Job Market Data Center',
  description: 'Live job market statistics from active US job listings. Updated daily.',
  url: 'https://www.oh-my-job.com/data',
}

// ── States list ──
const STATES: Record<string, string> = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA',
  Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', Florida: 'FL', Georgia: 'GA',
  Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA',
  Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD',
  Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS', Missouri: 'MO',
  Montana: 'MT', Nebraska: 'NE', Nevada: 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND',
  Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI',
  'South Carolina': 'SC', 'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT',
  Vermont: 'VT', Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV',
  Wisconsin: 'WI', Wyoming: 'WY',
}

function stateToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}

export default async function DataCenterPage() {
  // ── Aggregate stats for hero ──
  const [totalJobs, avgSalaryResult, topStates] = await Promise.all([
    prisma.job.count({ where: { active: true } }),
    prisma.job.aggregate({
      where: { active: true, salaryMin: { not: null }, salaryMax: { not: null } },
      _avg: { salaryMin: true, salaryMax: true },
    }),
    prisma.job.groupBy({
      by: ['addressRegion'],
      where: { active: true, addressRegion: { not: '' } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
  ])

  const avgSalary = Math.round(
    ((avgSalaryResult._avg.salaryMin || 0) + (avgSalaryResult._avg.salaryMax || 0)) / 2
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* ── HEADER ── */}
        <header className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            US Job Market Data Center
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Live statistics pulled from {totalJobs.toLocaleString()} active job listings across the United States. Every number on this page is computed from real postings in our database, not estimates or projections. Updated daily.
          </p>
        </header>

        {/* ── LIVE STATS BAR ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{totalJobs.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Active listings</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">${avgSalary.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Avg. listed salary</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{topStates.length > 0 ? topStates[0].addressRegion : '—'}</p>
            <p className="text-sm text-gray-500 mt-1">Top hiring state</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">50</p>
            <p className="text-sm text-gray-500 mt-1">States covered</p>
          </div>
        </div>

        {/* ── SECTION: Job Market by State ── */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Job Market by State</h2>
              <p className="text-sm text-gray-500">Active listings, average salary, and top employers for each state</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Object.entries(STATES).map(([name, code]) => (
              <Link
                key={code}
                href={`/data/states/${stateToSlug(name)}`}
                className="px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition-all"
              >
                {name}
              </Link>
            ))}
          </div>
        </section>

        {/* ── SECTION: Top Hiring States ── */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Top 10 Hiring States Right Now</h2>
              <p className="text-sm text-gray-500">Ranked by number of active job listings</p>
            </div>
          </div>
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            {topStates.map((state, i) => (
              <div key={state.addressRegion} className={`flex items-center justify-between px-5 py-3.5 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-400 w-6">{i + 1}</span>
                  <Link
                    href={`/data/states/${stateToSlug(state.addressRegion)}`}
                    className="text-sm font-medium text-gray-900 hover:text-blue-600"
                  >
                    {state.addressRegion}
                  </Link>
                </div>
                <span className="text-sm text-gray-500">{state._count.id.toLocaleString()} listings</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION: Salary Reports ── */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Salary Reports by Job Title</h2>
              <p className="text-sm text-gray-500">Average pay across states for popular roles</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              'Registered Nurse', 'Software Engineer', 'Data Analyst',
              'Project Manager', 'Dental Assistant', 'Electrician',
              'Medical Assistant', 'Truck Driver', 'Accountant',
              'Customer Service', 'Sales Associate', 'Pharmacy Technician',
            ].map((title) => (
              <Link
                key={title}
                href={`/data/salaries/${title.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700 transition-all flex items-center gap-2"
              >
                <Briefcase className="w-3.5 h-3.5" />
                {title}
              </Link>
            ))}
          </div>
        </section>

        {/* ── SECTION: Top Employers ── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Top Employers Reports</h2>
              <p className="text-sm text-gray-500">Which companies are hiring the most in each state</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Select a state above to see the top hiring companies in that region.
          </p>
        </section>

        {/* ── DISCLAIMER ── */}
        <footer className="border-t border-gray-200 pt-8">
          <p className="text-xs text-gray-400 text-center max-w-2xl mx-auto">
            All data is computed from active job listings in the Oh My Job database sourced from third-party APIs. Salary figures reflect listed compensation ranges and may not include bonuses, equity, or benefits. Numbers update daily and represent a snapshot, not a comprehensive census of the US labor market.
          </p>
        </footer>
      </div>
    </>
  )
}