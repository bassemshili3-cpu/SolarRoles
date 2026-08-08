// app/data/states/[state]/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Building2, Briefcase, MapPin, ArrowLeft, Clock, TrendingUp } from 'lucide-react'
import { STATES, SLUG_TO_STATE } from '@/lib/usStates'

export const revalidate = 86400

// Bornes de sanité salaire — élimine les valeurs horaires ($15) et mensuelles
// ($1 500) qui tirent les moyennes vers le bas, et les outliers extrêmes en haut.
const SALARY_MIN_THRESHOLD = 20_000
const SALARY_MAX_THRESHOLD = 600_000

// En dessous de ce seuil, la page est trop mince pour être indexée : trop peu
// de données pour que les stats (moyennes, top employers...) soient
// représentatives, ce qui ressemble à du thin content aux yeux de Google.
// Filtre à la fois generateStaticParams (build) et le rendu runtime (ISR
// peut faire retomber un état sous le seuil après le build initial).
const MIN_JOBS_THRESHOLD = 20

// Les 2 rôles core du site, mêmes que /data/salaries — pour donner un aperçu
// du pay gap installer -> lead directement depuis la page state.
const CORE_ROLES = [
  { slug: 'solar-photovoltaic-installers', title: 'Solar Photovoltaic Installer' },
  { slug: 'lead-solar-installer', title: 'Lead Solar Installer' },
]

function fmt(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function timeAgo(date: Date): string {
  const hours = Math.floor((Date.now() - date.getTime()) / 3_600_000)
  if (hours < 1) return 'less than an hour ago'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export async function generateStaticParams() {
  // On ne pré-génère que les états qui passent le seuil au moment du build.
  // Les autres restent accessibles dynamiquement si dynamicParams n'est pas
  // désactivé (comportement par défaut de Next) — c'est le check runtime
  // dans le composant qui décide alors s'il faut les 404.
  const allSlugs = Object.keys(SLUG_TO_STATE)

  try {
    const counts = await Promise.all(
      allSlugs.map(async (slug) => {
        const stateName = SLUG_TO_STATE[slug]
        const stateCode = STATES[stateName]
        const count = await prisma.job.count({
          where: { active: true, addressRegion: { in: [stateName, stateCode] } },
        })
        return { slug, count }
      })
    )
    return counts.filter((c) => c.count >= MIN_JOBS_THRESHOLD).map((c) => ({ state: c.slug }))
  } catch (err) {
    console.error('generateStaticParams state count error:', err)
    // Si la requête échoue au build, on ne bloque pas le build entier —
    // on retombe sur tous les slugs, et c'est le check runtime dans la page
    // qui filtrera correctement à la demande.
    return allSlugs.map((slug) => ({ state: slug }))
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ state: string }> }
): Promise<Metadata> {
  const { state: slug } = await params
  const stateName = SLUG_TO_STATE[slug]
  if (!stateName) return { title: 'Not Found' }

  return {
    title: `${stateName} Solar Installer Jobs & Salaries 2026 | Job Market Data`,
    description: `How much do Solar Photovoltaic Installers and Lead Solar Installers earn in ${stateName}? Live salary data, top hiring companies, and open listings. Updated daily.`,
    keywords: `${stateName} solar installer salary, ${stateName} solar jobs, solar photovoltaic installer ${stateName}, lead solar installer ${stateName}, ${stateName} solar job market 2026`,
    alternates: { canonical: `https://www.solarroles.com/data/states/${slug}` },
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

  const stateCode = STATES[stateName]
  const addressRegionFilter = { in: [stateName, stateCode] }

  // ── Stats principales de l'état ──
  let totalJobs = 0
  let salaryAgg = {
    _avg: { salaryMin: null as number | null, salaryMax: null as number | null },
    _min: { salaryMin: null as number | null },
    _max: { salaryMax: null as number | null },
    _count: { id: 0 },
  }
  let topCompanies: { company: string; _count: { id: number } }[] = []
  let topTitles: { title: string; _count: { id: number } }[] = []
  let contractBreakdown: { contractTime: string | null; _count: { id: number } }[] = []
  // Distingue "0 job réel" de "la requête a échoué" — sans ça, une erreur DB
  // transitoire ferait 404 une page qui devrait exister.
  let coreQuerySucceeded = false

  try {
    ;[totalJobs, salaryAgg, topCompanies, topTitles, contractBreakdown] = await Promise.all([
      prisma.job.count({
        where: { active: true, addressRegion: addressRegionFilter },
      }),
      prisma.job.aggregate({
        where: {
          active: true,
          addressRegion: addressRegionFilter,
          salaryMin: { gte: SALARY_MIN_THRESHOLD, lte: SALARY_MAX_THRESHOLD },
          salaryMax: { gte: SALARY_MIN_THRESHOLD, lte: SALARY_MAX_THRESHOLD },
        },
        _avg: { salaryMin: true, salaryMax: true },
        _min: { salaryMin: true },
        _max: { salaryMax: true },
        _count: { id: true },
      }),
      prisma.job.groupBy({
        by: ['company'],
        where: { active: true, addressRegion: addressRegionFilter, company: { not: '' } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 15,
      }),
      prisma.job.groupBy({
        by: ['title'],
        where: { active: true, addressRegion: addressRegionFilter },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 15,
      }),
      prisma.job.groupBy({
        by: ['contractTime'],
        where: { active: true, addressRegion: addressRegionFilter },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
    ])
    coreQuerySucceeded = true
  } catch (err) {
    console.error(`StateDataPage core query error (${stateName}):`, err)
    // Fallbacks déjà initialisés — la page se génère avec des valeurs neutres.
  }

  // Seuil de contenu mince : ne 404 que si on est sûr du chiffre (requête
  // réussie). Une erreur DB transitoire ne doit jamais se traduire par un
  // 404 côté SEO.
  if (coreQuerySucceeded && totalJobs < MIN_JOBS_THRESHOLD) {
    notFound()
  }

  // ── Breakdown par rôle (Installer vs Lead) dans cet état ──
  // Isolé du bloc principal : si ça échoue, le reste de la page reste intact.
  let roleBreakdown: { slug: string; title: string; avgSalary: number | null; count: number }[] = []
  try {
    const roleResults = await Promise.all(
      CORE_ROLES.map(async (role) => {
        const agg = await prisma.job.aggregate({
          where: {
            active: true,
            addressRegion: addressRegionFilter,
            title: { contains: role.title, mode: 'insensitive' },
            salaryMin: { not: null, gt: 0 },
            salaryMax: { not: null, gt: 0 },
          },
          _avg: { salaryMin: true, salaryMax: true },
          _count: { id: true },
        })
        const avg =
          agg._avg.salaryMin != null && agg._avg.salaryMax != null
            ? Math.round((agg._avg.salaryMin + agg._avg.salaryMax) / 2)
            : null
        return { slug: role.slug, title: role.title, avgSalary: avg, count: agg._count.id }
      })
    )
    roleBreakdown = roleResults.filter((r) => r.count > 0)
  } catch (err) {
    console.error(`StateDataPage role breakdown error (${stateName}):`, err)
  }

  // ── Moyenne nationale — pour situer l'état dans son contexte ──
  let nationalAvg: number | null = null
  try {
    const nationalAgg = await prisma.job.aggregate({
      where: {
        active: true,
        salaryMin: { gte: SALARY_MIN_THRESHOLD, lte: SALARY_MAX_THRESHOLD },
        salaryMax: { gte: SALARY_MIN_THRESHOLD, lte: SALARY_MAX_THRESHOLD },
      },
      _avg: { salaryMin: true, salaryMax: true },
    })
    nationalAvg =
      nationalAgg._avg.salaryMin != null && nationalAgg._avg.salaryMax != null
        ? Math.round((nationalAgg._avg.salaryMin + nationalAgg._avg.salaryMax) / 2)
        : null
  } catch (err) {
    console.error(`StateDataPage national avg error (${stateName}):`, err)
  }

  // ── Fraîcheur ──
  let latestPostedAt: Date | null = null
  let newThisWeek = 0
  try {
    const [latestJob, newCount] = await Promise.all([
      prisma.job.findFirst({
        where: { active: true, addressRegion: addressRegionFilter, postedAt: { not: null } },
        orderBy: { postedAt: 'desc' },
        select: { postedAt: true },
      }),
      prisma.job.count({
        where: {
          active: true,
          addressRegion: addressRegionFilter,
          postedAt: { gte: new Date(Date.now() - 7 * 86_400_000) },
        },
      }),
    ])
    latestPostedAt = latestJob?.postedAt ?? null
    newThisWeek = newCount
  } catch (err) {
    console.error(`StateDataPage freshness error (${stateName}):`, err)
  }

  const avgSalary =
    salaryAgg._avg.salaryMin != null && salaryAgg._avg.salaryMax != null
      ? Math.round((salaryAgg._avg.salaryMin + salaryAgg._avg.salaryMax) / 2)
      : null

  const minSalary = salaryAgg._min.salaryMin ?? null
  const maxSalary = salaryAgg._max.salaryMax ?? null
  const salaryCount = salaryAgg._count.id

  const fullTimeCount = contractBreakdown.find((c) => c.contractTime === 'full_time')?._count.id || 0
  const partTimeCount = contractBreakdown.find((c) => c.contractTime === 'part_time')?._count.id || 0

  const salaryDiffPct =
    avgSalary != null && nationalAvg != null && nationalAvg > 0
      ? Math.round(((avgSalary - nationalAvg) / nationalAvg) * 100)
      : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${stateName} Solar Installer Jobs & Salaries`,
    description: `Live job market statistics for ${stateName} including solar installer salary data and top employers.`,
    url: `https://www.solarroles.com/data/states/${slug}`,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-5xl mx-auto px-6 py-16">
        <Link href="/data" className="flex items-center gap-2 text-gray-500 hover:text-[#C9991F] mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Data Center
        </Link>

        {/* HEADER */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <MapPin className="w-6 h-6 text-[#3D1654]" />
            <h1 className="text-3xl md:text-4xl font-bold text-[#3D1654]">
              {stateName} Job Market Data
            </h1>
          </div>
          <p className="text-gray-500 max-w-2xl">
            Live snapshot of the {stateName} solar job market, based on {fmt(totalJobs)} active listings in our database. Figures update daily as new listings come in and old ones expire.
          </p>
        </header>

        {/* FRESHNESS STRIP */}
        {latestPostedAt && (
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
            <Clock className="w-3.5 h-3.5" />
            <span>
              Last listing added {timeAgo(latestPostedAt)}
              {newThisWeek > 0 && ` · ${newThisWeek} new listing${newThisWeek > 1 ? 's' : ''} this week`}
            </span>
          </div>
        )}

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="border border-[#EDE5F0] rounded-xl p-5 text-center">
            <p className="text-2xl font-bold text-[#3D1654]">{fmt(totalJobs)}</p>
            <p className="text-xs text-gray-500 mt-1">Active listings</p>
          </div>

          <div className="border border-[#EDE5F0] rounded-xl p-5 text-center">
            {avgSalary != null ? (
              <>
                <p className="text-2xl font-bold text-[#3D1654]">${fmt(avgSalary)}</p>
                <p className="text-xs text-gray-500 mt-1">Avg. salary ({fmt(salaryCount)} with data)</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-400">—</p>
                <p className="text-xs text-gray-400 mt-1">Avg. salary (no data)</p>
              </>
            )}
          </div>

          <div className="border border-[#EDE5F0] rounded-xl p-5 text-center">
            {minSalary != null ? (
              <>
                <p className="text-2xl font-bold text-[#3D1654]">${fmt(minSalary)}</p>
                <p className="text-xs text-gray-500 mt-1">Lowest listed</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-400">—</p>
                <p className="text-xs text-gray-400 mt-1">Lowest listed</p>
              </>
            )}
          </div>

          <div className="border border-[#EDE5F0] rounded-xl p-5 text-center">
            {maxSalary != null ? (
              <>
                <p className="text-2xl font-bold text-[#3D1654]">${fmt(maxSalary)}</p>
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

        {/* VS MOYENNE NATIONALE */}
        {salaryDiffPct !== null && (
          <p className="text-sm text-gray-500 mb-10">
            That's{' '}
            <span className={`font-semibold ${salaryDiffPct >= 0 ? 'text-[#3D1654]' : 'text-gray-600'}`}>
              {salaryDiffPct >= 0 ? `${salaryDiffPct}% above` : `${Math.abs(salaryDiffPct)}% below`}
            </span>{' '}
            the national average across all active solar listings.
          </p>
        )}

        {/* ROLE BREAKDOWN — Installer vs Lead, dans cet état */}
        {roleBreakdown.length > 0 && (
          <section className="mb-12 bg-[#F5EEF7] border border-[#E8D5F0] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-[#C9991F]" />
              <h2 className="font-bold text-[#3D1654]">Solar installer pay in {stateName}</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {roleBreakdown.map((role) => (
                <Link
                  key={role.slug}
                  href={`/data/salaries/${role.slug}`}
                  className="block bg-white border border-[#EDE5F0] rounded-xl p-4 hover:border-[#C9991F] transition-colors"
                >
                  <p className="text-sm text-gray-500 mb-1">{role.title}</p>
                  <p className="text-xl font-bold text-[#3D1654]">
                    {role.avgSalary != null ? `$${fmt(role.avgSalary)}` : '—'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {role.count} listing{role.count > 1 ? 's' : ''} in {stateName} · see salary by state →
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="grid lg:grid-cols-2 gap-10">
          {/* TOP EMPLOYERS */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-[#C9991F]" />
              <h2 className="text-xl font-bold text-[#3D1654]">Top Hiring Companies</h2>
            </div>
            <div className="border border-[#EDE5F0] rounded-xl overflow-hidden">
              {topCompanies.map((company, i) => (
                <div
                  key={company.company}
                  className={`flex items-center justify-between px-4 py-3 ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAF7FC]'}`}
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

          {/* TOP JOB TITLES */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-[#3D1654]" />
              <h2 className="text-xl font-bold text-[#3D1654]">Most In-Demand Roles</h2>
            </div>
            <div className="border border-[#EDE5F0] rounded-xl overflow-hidden">
              {topTitles.map((title, i) => (
                <div
                  key={title.title}
                  className={`flex items-center justify-between px-4 py-3 ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAF7FC]'}`}
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

        {/* CONTRACT TYPE BREAKDOWN */}
        {totalJobs > 0 && (fullTimeCount > 0 || partTimeCount > 0) && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-[#3D1654] mb-4">Employment Type Breakdown</h2>
            <div className="flex gap-4">
              {fullTimeCount > 0 && (
                <div className="flex-1 border border-[#EDE5F0] rounded-xl p-5 text-center">
                  <p className="text-2xl font-bold text-[#3D1654]">{fmt(fullTimeCount)}</p>
                  <p className="text-xs text-gray-500 mt-1">Full-time</p>
                  <div className="mt-2 h-2 bg-[#F5EEF7] rounded-full overflow-hidden">
                    <div className="h-full bg-[#3D1654] rounded-full" style={{ width: `${(fullTimeCount / totalJobs) * 100}%` }} />
                  </div>
                </div>
              )}
              {partTimeCount > 0 && (
                <div className="flex-1 border border-[#EDE5F0] rounded-xl p-5 text-center">
                  <p className="text-2xl font-bold text-[#3D1654]">{fmt(partTimeCount)}</p>
                  <p className="text-xs text-gray-500 mt-1">Part-time</p>
                  <div className="mt-2 h-2 bg-[#F5EEF7] rounded-full overflow-hidden">
                    <div className="h-full bg-[#C9991F] rounded-full" style={{ width: `${(partTimeCount / totalJobs) * 100}%` }} />
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="mt-16 bg-[#F5EEF7] border border-[#E8D5F0] rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-[#3D1654] mb-2">Browse {stateName} Jobs</h2>
          <p className="text-sm text-gray-500 mb-4">See all {fmt(totalJobs)} active listings in {stateName}</p>
          <Link
            href={`/jobs?where=${encodeURIComponent(stateName)}`}
            className="inline-block bg-[#C9991F] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#B0841A] transition-colors"
          >
            View {stateName} Jobs
          </Link>
        </section>

        {/* DISCLAIMER */}
        <footer className="mt-16 border-t border-[#EDE5F0] pt-8">
          <p className="text-xs text-gray-400 text-center max-w-2xl mx-auto">
            Data computed from active job listings in the Solar Roles database. Salary figures reflect listed annual compensation ($20k–$600k range) and may not include bonuses, equity, or benefits. Updated daily. This page does not constitute employment or financial advice.
          </p>
        </footer>
      </div>
    </>
  )
}