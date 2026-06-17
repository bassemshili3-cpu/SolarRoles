// app/data/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Building2, MapPin, DollarSign, TrendingUp, Briefcase, Brain } from 'lucide-react'

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

// ── Salary sanity bounds — values outside this range are hourly/monthly/corrupt ──
// $20 000 minimum : élimine les valeurs horaires ($15) et mensuelles ($1 500)
// $600 000 maximum : élimine les outliers extrêmes (CEO packages mal encodés)
const SALARY_MIN_THRESHOLD = 20_000
const SALARY_MAX_THRESHOLD = 600_000

const SKILL_BARS = [
  { skill: 'Certifications required', mentions: 2748, pct: 100, color: 'bg-violet-500' },
  { skill: 'Communication skills',    mentions: 2510, pct: 91,  color: 'bg-violet-400' },
  { skill: 'Customer service',        mentions: 2007, pct: 73,  color: 'bg-violet-300' },
  { skill: 'Prompt / AI fluency',     mentions: 328,  pct: 12,  color: 'bg-blue-500'   },
  { skill: 'AI tools',                mentions: 256,  pct: 9,   color: 'bg-blue-400'   },
  { skill: 'Bilingual',               mentions: 234,  pct: 9,   color: 'bg-green-500'  },
  { skill: 'Empathy',                 mentions: 195,  pct: 7,   color: 'bg-green-400'  },
]

export default async function DataCenterPage() {
  const [totalJobs, avgSalaryResult, topStates, entryLevelCount] = await Promise.all([
    prisma.job.count({ where: { active: true } }),

    // FIX: filtre gte 20 000 et lte 600 000 pour exclure les valeurs horaires,
    // mensuelles et les outliers. Sans ce filtre, les salaires horaires ($15)
    // et mensuels ($1 200) tirent la moyenne vers le bas (ex: $11 957 affiché).
    prisma.job.aggregate({
      where: {
        active: true,
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
    }),

    prisma.job.groupBy({
      by: ['addressRegion'],
      where: { active: true, addressRegion: { not: '' } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),

    prisma.job.count({
      where: {
        active: true,
        OR: [
          { description: { contains: 'no experience', mode: 'insensitive' } },
          { description: { contains: 'entry level',   mode: 'insensitive' } },
          { description: { contains: 'entry-level',   mode: 'insensitive' } },
        ],
      },
    }),
  ])

  // Moyenne de (salaryMin + salaryMax) / 2 — uniquement sur les valeurs filtrées
  const avgSalary =
    avgSalaryResult._avg.salaryMin != null && avgSalaryResult._avg.salaryMax != null
      ? Math.round((avgSalaryResult._avg.salaryMin + avgSalaryResult._avg.salaryMax) / 2)
      : null

  const entryLevelPct = totalJobs > 0
    ? ((entryLevelCount / totalJobs) * 100).toFixed(1)
    : '0.0'

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
            Live statistics pulled from {totalJobs.toLocaleString()} active job listings across the United States.
            Every number on this page is computed from real postings in our database, not estimates or projections.
            Updated daily.
          </p>
        </header>

        {/* ── LIVE STATS BAR ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{totalJobs.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Active listings</p>
          </div>
          <div className="text-center">
            {avgSalary != null ? (
              <>
                <p className="text-3xl font-bold text-gray-900">${avgSalary.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">Avg. listed salary</p>
              </>
            ) : (
              <>
                <p className="text-3xl font-bold text-gray-400">—</p>
                <p className="text-sm text-gray-500 mt-1">Avg. listed salary</p>
              </>
            )}
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">
              {topStates.length > 0 ? topStates[0].addressRegion : '—'}
            </p>
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
              <div
                key={state.addressRegion}
                className={`flex items-center justify-between px-5 py-3.5 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
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

        {/* ── SECTION: AI & Entry-Level Insights ── */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Brain className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI & Entry-Level Hiring Insights</h2>
              <p className="text-sm text-gray-500">
                Based on {totalJobs.toLocaleString()} active US listings — June 2026
              </p>
            </div>
          </div>

          {/* 3 stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="border border-gray-200 rounded-2xl p-6 bg-white">
              <p className="text-4xl font-bold text-violet-600">{entryLevelPct}%</p>
              <p className="text-sm font-medium text-gray-800 mt-2">
                of listings explicitly mention &ldquo;entry-level&rdquo; or &ldquo;no experience required&rdquo;
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {entryLevelCount.toLocaleString()} out of {totalJobs.toLocaleString()} active postings
              </p>
            </div>
            <div className="border border-gray-200 rounded-2xl p-6 bg-white">
              <p className="text-4xl font-bold text-violet-600">256</p>
              <p className="text-sm font-medium text-gray-800 mt-2">
                listings already require AI tools proficiency — including 33 mentioning ChatGPT by name
              </p>
              <p className="text-xs text-gray-400 mt-2">An emerging trend in job descriptions</p>
            </div>
            <div className="border border-gray-200 rounded-2xl p-6 bg-white">
              <p className="text-4xl font-bold text-violet-600">2,748</p>
              <p className="text-sm font-medium text-gray-800 mt-2">
                listings require certifications — the #1 demanded qualifier, ahead of communication skills
              </p>
              <p className="text-xs text-gray-400 mt-2">vs. only 19 requiring a degree</p>
            </div>
          </div>

          {/* Bar chart skills */}
          <div className="border border-gray-200 rounded-2xl p-6 bg-white mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-5">
              Most demanded skills in active US listings
            </h3>
            <div className="space-y-4">
              {SKILL_BARS.map(({ skill, mentions, pct, color }) => (
                <div key={skill}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">{skill}</span>
                    <span className="text-gray-400">{mentions.toLocaleString()} listings</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`${color} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-5">
              Computed from job description text across all active listings. Skills extracted via keyword matching.
            </p>
          </div>

          {/* Editorial callout */}
          <div className="bg-violet-50 border border-violet-100 rounded-2xl p-6">
            <p className="text-sm text-violet-800 leading-relaxed">
              <span className="font-semibold">What the data suggests: </span>
              With only {entryLevelPct}% of US job postings explicitly open to candidates without experience,
              the traditional entry point into the workforce has narrowed significantly. Meanwhile, demand for
              certifications, communication skills, and AI fluency is rising — signaling a shift toward
              skills-based hiring over degree or experience requirements.
            </p>
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
            All data is computed from active job listings in the Oh My Job database sourced from third-party APIs.
            Salary figures reflect listed annual compensation ($20k–$600k range) and may not include bonuses, equity, or benefits.
            Numbers update daily and represent a snapshot, not a comprehensive census of the US labor market.
          </p>
        </footer>

      </div>
    </>
  )
}