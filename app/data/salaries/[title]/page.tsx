import { Metadata } from 'next'
import Link from 'next/link'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ArrowLeft, DollarSign, TrendingUp, Clock, Zap } from 'lucide-react'

export const revalidate = 86400

// ─────────────────────────────────────────────────────────────────────────
// SOURCE DE VÉRITÉ UNIQUE : un seul slug par métier, utilisé pour la route,
// le career path, l'éditorial ET le matching DB. Plus de maps séparées qui
// peuvent diverger.
//
// `include` / `exclude` sont construits à partir d'un audit réel des titres
// en base (voir conversation) — pas de "Solar Photovoltaic Installer" en
// toutes lettres dans les offres, donc on matche des fragments courants et
// on exclut explicitement les rôles voisins + le bruit (management,
// formation, RH...) pour éviter les chevauchements entre buckets.
// ─────────────────────────────────────────────────────────────────────────

type Role = {
  title: string
  include: string[]
  exclude: string[]
  careerPath?: { slug: string; title: string; direction: 'up' | 'down' }
  editorial: { dayToDay: string; certification: string; progression: string }
}

// Bruit générique à exclure de tous les rôles : ce sont des offres qui
// contiennent "solar installer" dans le titre mais ne sont pas un poste
// d'installateur terrain (ex. "Director of Solar Installer Partnerships").
const NOISE = [
  'manager',
  'instructor',
  'trainer',
  'facilitator',
  'director',
  'partnership',
  'material handler',
  'superintendent',
]

const ROLES: Record<string, Role> = {
  'solar-photovoltaic-installer': {
    title: 'Solar Photovoltaic Installer',
    include: [
      'solar installer',
      'pv installer',
      'solar panel installer',
      'installation technician',
      'install technician',
      'solar / pv installer',
    ],
    exclude: [
      'lead',
      'foreman',
      'crew lead',
      'second in command',
      'sr.',
      'senior',
      'electrician',
      ...NOISE,
    ],
    careerPath: { slug: 'lead-solar-installer', title: 'Lead Solar Installer', direction: 'up' },
    editorial: {
      dayToDay:
        'A Solar Photovoltaic Installer mounts racking, places panels, runs conduit, and wires arrays on residential and commercial roofs or ground mounts. Most of the day is physical: carrying panels, working at height, and following an electrician or lead installer\'s directions on wiring and layout. Crews typically run 3 to 5 installs a week depending on system size and season.',
      certification:
        'Entry into the role rarely requires a license. Many installers start through an employer\'s in-house training or a community college solar program lasting a few weeks. A NABCEP PV Associate credential is a common early milestone and signals baseline knowledge of system design and safety to employers, even before full installer certification.',
      progression:
        'Installers typically move up after 1 to 3 years on the tools, once they can run a crew, read a permit set unsupervised, and troubleshoot a string fault without escalating. That track usually leads to Lead Installer, then site supervisor or a design role.',
    },
  },
  'lead-solar-installer': {
    title: 'Lead Solar Installer',
    include: [
      'lead solar installer',
      'crew lead',
      'foreman',
      'second in command',
      'sr. solar installer',
      'senior solar installer',
    ],
    exclude: [...NOISE],
    careerPath: {
      slug: 'solar-photovoltaic-installer',
      title: 'Solar Photovoltaic Installer',
      direction: 'down',
    },
    editorial: {
      dayToDay:
        'A Lead Solar Installer runs the crew on site: assigns tasks, checks the install against the permit set and engineering plans, handles the trickier electrical terminations, and is the point of contact for the inspector or the project manager. Less time on the roof carrying panels, more time making sure the job passes inspection the first time.',
      certification:
        'Most leads hold a NABCEP PV Installation Professional certification or are actively working toward one, plus several years of hands-on installs. Some states also require an electrical license or a state-specific solar contractor credential to sign off on certain work — this varies enough by state that it is worth checking with your state licensing board directly.',
      progression:
        'From Lead Installer, the common next steps are site supervisor, install operations manager, or moving into system design and permitting, where the NABCEP PV Design Specialist credential becomes relevant.',
    },
  },
  'solar-electrician': {
    title: 'Solar Electrician',
    include: ['electrician'],
    exclude: [...NOISE],
    editorial: {
      dayToDay:
        'A Solar Electrician handles the electrical side of an install: DC and AC wiring, combiner boxes, inverters, rapid shutdown devices, and the interconnection to the grid or to a battery system. On mixed crews they often work alongside mechanical installers who handle racking and panel placement, stepping in for terminations, troubleshooting, and code compliance.',
      certification:
        'Unlike a general PV installer role, this one typically requires a state electrical license (journeyman or master, depending on the state and the scope of work) on top of solar-specific knowledge. A NABCEP PV Installation Professional credential is common in addition to the electrical license, especially for anyone signing off on system design.',
      progression:
        'Solar Electricians often move toward electrical foreman roles, solar-specific master electrician status, or into system design and commissioning, where the electrical license combined with NABCEP credentials opens up higher-paying design and QA positions.',
    },
  },
}

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

// Construit le WHERE (title LIKE p1 OR title LIKE p2 ...) AND NOT (title LIKE e1 OR ...)
// pour la requête raw, à partir des patterns include/exclude d'un rôle.
function titleFilterSql(role: Role) {
  const include = Prisma.join(
    role.include.map((p) => Prisma.sql`LOWER(title) LIKE ${'%' + p.toLowerCase() + '%'}`),
    ' OR '
  )
  const exclude = role.exclude.length
    ? Prisma.sql`AND NOT (${Prisma.join(
        role.exclude.map((p) => Prisma.sql`LOWER(title) LIKE ${'%' + p.toLowerCase() + '%'}`),
        ' OR '
      )})`
    : Prisma.empty

  return Prisma.sql`(${include}) ${exclude}`
}

// Équivalent include/exclude pour les requêtes Prisma classiques (aggregate, findFirst, count).
function titleFilterPrisma(role: Role) {
  return {
    AND: [
      { OR: role.include.map((p) => ({ title: { contains: p, mode: 'insensitive' as const } })) },
      role.exclude.length
        ? { NOT: { OR: role.exclude.map((p) => ({ title: { contains: p, mode: 'insensitive' as const } })) } }
        : {},
    ],
  }
}

// Regroupement census region — sert de repli quand un state a moins de 3 listings
// pour être affiché seul de façon fiable. Basé sur les regions officielles du US Census Bureau.
const STATE_TO_REGION: Record<string, string> = {
  CT: 'Northeast', ME: 'Northeast', MA: 'Northeast', NH: 'Northeast', RI: 'Northeast', VT: 'Northeast',
  NJ: 'Northeast', NY: 'Northeast', PA: 'Northeast',
  IL: 'Midwest', IN: 'Midwest', MI: 'Midwest', OH: 'Midwest', WI: 'Midwest',
  IA: 'Midwest', KS: 'Midwest', MN: 'Midwest', MO: 'Midwest', NE: 'Midwest', ND: 'Midwest', SD: 'Midwest',
  DE: 'South', FL: 'South', GA: 'South', MD: 'South', NC: 'South', SC: 'South', VA: 'South', WV: 'South', DC: 'South',
  AL: 'South', KY: 'South', MS: 'South', TN: 'South',
  AR: 'South', LA: 'South', OK: 'South', TX: 'South',
  AZ: 'West', CO: 'West', ID: 'West', MT: 'West', NV: 'West', NM: 'West', UT: 'West', WY: 'West',
  AK: 'West', CA: 'West', HI: 'West', OR: 'West', WA: 'West',
}

export async function generateStaticParams() {
  return Object.keys(ROLES).map((slug) => ({ title: slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ title: string }> }
): Promise<Metadata> {
  const { title: slug } = await params
  const role = ROLES[slug]
  if (!role) return { title: 'Not Found' }

  return {
    title: `${role.title} Salary by State 2026 | Average Pay Across the US`,
    description: `How much does a ${role.title} make in each state? Live salary data from real solar job listings. Compare average pay across all 50 states. Updated daily.`,
    keywords: `${role.title} salary, ${role.title} average pay, ${role.title} salary by state, how much does a ${role.title} make 2026, ${role.title} pay 2026`,
    alternates: { canonical: `https://www.solarroles.com/data/salaries/${slug}` },
  }
}

export default async function SalaryReportPage({
  params,
}: {
  params: Promise<{ title: string }>
}) {
  const { title: slug } = await params
  const role = ROLES[slug]
  if (!role) notFound()

  const { title: jobTitle, careerPath, editorial } = role

  // Salaire moyen par state — pas de HAVING ici, on filtre en JS pour pouvoir
  // regrouper les states sous-représentés en région plutôt que de les faire disparaître.
  const rawSalaryByState = await prisma.$queryRaw<
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
      AND ${titleFilterSql(role)}
    GROUP BY "addressRegion"
    ORDER BY "avgSalary" DESC
  `

  const salaryByState = rawSalaryByState.filter((r) => r.count >= 3)
  const thinStates = rawSalaryByState.filter((r) => r.count < 3)

  // Repli régional: on agrège les states trop maigres par région census plutôt
  // que de les exclure silencieusement.
  const regionAgg: Record<string, { totalWeighted: number; count: number }> = {}
  for (const row of thinStates) {
    const region = STATE_TO_REGION[row.addressRegion.toUpperCase()]
    if (!region) continue
    if (!regionAgg[region]) regionAgg[region] = { totalWeighted: 0, count: 0 }
    regionAgg[region].totalWeighted += row.avgSalary * row.count
    regionAgg[region].count += row.count
  }
  const regionRows = Object.entries(regionAgg)
    .filter(([, v]) => v.count >= 3)
    .map(([region, v]) => ({ region, avgSalary: Math.round(v.totalWeighted / v.count), count: v.count }))
    .sort((a, b) => b.avgSalary - a.avgSalary)

  // National average
  const nationalAgg = await prisma.job.aggregate({
    where: {
      active: true,
      salaryMin: { not: null, gt: 0 },
      salaryMax: { not: null, gt: 0 },
      ...titleFilterPrisma(role),
    },
    _avg: { salaryMin: true, salaryMax: true },
    _count: { id: true },
  })

  const nationalAvg = Math.round(
    ((nationalAgg._avg.salaryMin || 0) + (nationalAgg._avg.salaryMax || 0)) / 2
  )
  const totalListings = nationalAgg._count.id

  // Career path differential — moyenne nationale du rôle "en face" (installer <-> lead)
  // pour donner un vrai signal de progression, calculé nulle part ailleurs.
  const partnerRole = careerPath ? ROLES[careerPath.slug] : null
  const partnerAgg = partnerRole
    ? await prisma.job.aggregate({
        where: {
          active: true,
          salaryMin: { not: null, gt: 0 },
          salaryMax: { not: null, gt: 0 },
          ...titleFilterPrisma(partnerRole),
        },
        _avg: { salaryMin: true, salaryMax: true },
        _count: { id: true },
      })
    : null

  const partnerAvg = partnerAgg
    ? Math.round(((partnerAgg._avg.salaryMin || 0) + (partnerAgg._avg.salaryMax || 0)) / 2)
    : 0
  const partnerCount = partnerAgg?._count.id || 0
  const showCareerPath = careerPath && partnerAvg > 0 && nationalAvg > 0
  const careerPathDiffPct = showCareerPath
    ? Math.round(((partnerAvg - nationalAvg) / nationalAvg) * 100)
    : 0

  // Fraîcheur — la donnée la plus récente sur ce rôle.
  const latestJob = await prisma.job.findFirst({
    where: {
      active: true,
      postedAt: { not: null },
      ...titleFilterPrisma(role),
    },
    orderBy: { postedAt: 'desc' },
    select: { postedAt: true },
  })
  const newThisWeek = await prisma.job.count({
    where: {
      active: true,
      postedAt: { gte: new Date(Date.now() - 7 * 86_400_000) },
      ...titleFilterPrisma(role),
    },
  })

  const topState = salaryByState.length > 0 ? salaryByState[0] : null
  const bottomState = salaryByState.length > 0 ? salaryByState[salaryByState.length - 1] : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${jobTitle} Salary by State 2026`,
    description: `Average ${jobTitle} salary across US states based on real solar job listings.`,
    url: `https://www.solarroles.com/data/salaries/${slug}`,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-5xl mx-auto px-6 py-16">

        <Link href="/data" className="flex items-center gap-2 text-gray-500 hover:text-[#F5B819] mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Data Center
        </Link>

        {/* HEADER */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-6 h-6 text-[#F5B819]" />
            <h1 className="text-3xl md:text-4xl font-bold text-[#0B1A2E]">
              {jobTitle} Salary by State
            </h1>
          </div>
          <p className="text-gray-500 max-w-2xl">
            Average listed salary for {jobTitle} positions across the United States, computed from {fmt(totalListings)} active solar job listings. States with fewer than 3 listings are grouped into their US Census region below instead of being excluded.
          </p>
        </header>

        {/* FRESHNESS STRIP */}
        {latestJob?.postedAt && (
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
            <Clock className="w-3.5 h-3.5" />
            <span>
              Last listing added {timeAgo(latestJob.postedAt)}
              {newThisWeek > 0 && ` · ${newThisWeek} new ${jobTitle} listing${newThisWeek > 1 ? 's' : ''} this week`}
            </span>
          </div>
        )}

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="border border-gray-200 rounded-xl p-5 text-center">
            <p className="text-2xl font-bold text-[#0B1A2E]">${fmt(nationalAvg)}</p>
            <p className="text-xs text-gray-500 mt-1">National avg.</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-5 text-center">
            <p className="text-2xl font-bold text-[#0B1A2E]">{fmt(totalListings)}</p>
            <p className="text-xs text-gray-500 mt-1">Active listings</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-5 text-center">
            <p className="text-2xl font-bold text-[#B45309]">{topState ? `$${fmt(topState.avgSalary)}` : '\u2014'}</p>
            <p className="text-xs text-gray-500 mt-1">Highest ({topState?.addressRegion || '\u2014'})</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-5 text-center">
            <p className="text-2xl font-bold text-gray-400">{bottomState ? `$${fmt(bottomState.avgSalary)}` : '\u2014'}</p>
            <p className="text-xs text-gray-500 mt-1">Lowest ({bottomState?.addressRegion || '\u2014'})</p>
          </div>
        </div>

        {/* CAREER PATH DIFFERENTIAL — donnée propriétaire, calculée nulle part ailleurs */}
        {showCareerPath && careerPath && (
          <section className="mb-12 bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-[#B45309]" />
              <h2 className="font-bold text-[#0B1A2E]">Career path: {jobTitle} → {careerPath.title}</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {careerPath.direction === 'up' ? (
                <>Based on {fmt(partnerCount)} active {careerPath.title} listings, moving up to Lead pays on average <span className="font-semibold text-[#B45309]">{careerPathDiffPct >= 0 ? '+' : ''}{careerPathDiffPct}%</span> more than the national {jobTitle} average.</>
              ) : (
                <>{careerPath.title} listings average <span className="font-semibold text-[#B45309]">{careerPathDiffPct >= 0 ? '+' : ''}{careerPathDiffPct}%</span> compared to the {jobTitle} national average, based on {fmt(partnerCount)} active listings.</>
              )}
            </p>
            <Link
              href={`/data/salaries/${careerPath.slug}`}
              className="text-sm font-semibold text-[#B45309] hover:underline"
            >
              See {careerPath.title} salary by state →
            </Link>
          </section>
        )}

        {/* EDITORIAL — contenu fixe, comble le vide quand la table de données est maigre */}
        <section className="mb-12 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-[#0B1A2E] mb-2">What a {jobTitle} actually does</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{editorial.dayToDay}</p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0B1A2E] mb-2">Certification and entry path</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{editorial.certification}</p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0B1A2E] mb-2">Where this role leads</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{editorial.progression}</p>
          </div>
        </section>

        {/* STATE TABLE */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[#0B1A2E] mb-4">
            {jobTitle} Average Salary by State
          </h2>
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 gap-px bg-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="bg-white px-4 py-3">Rank</div>
              <div className="bg-white px-4 py-3">State</div>
              <div className="bg-white px-4 py-3 text-right">Avg. Salary</div>
              <div className="bg-white px-4 py-3 text-right">Listings</div>
            </div>

            {salaryByState.map((row, i) => {
              const diff = nationalAvg > 0 ? ((row.avgSalary - nationalAvg) / nationalAvg) * 100 : 0
              return (
                <div key={row.addressRegion} className="grid grid-cols-4 gap-px bg-gray-200">
                  <div className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-4 py-3 text-sm font-bold text-gray-400`}>
                    {i + 1}
                  </div>
                  <div className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-4 py-3 text-sm`}>
                    <Link
                      href={`/data/states/${row.addressRegion.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-gray-800 hover:text-[#B45309]"
                    >
                      {row.addressRegion}
                    </Link>
                  </div>
                  <div className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-4 py-3 text-sm text-right`}>
                    <span className="font-semibold text-[#0B1A2E]">${fmt(row.avgSalary)}</span>
                    <span className={`ml-2 text-xs ${diff >= 0 ? 'text-[#B45309]' : 'text-gray-400'}`}>
                      {diff >= 0 ? '+' : ''}{diff.toFixed(0)}%
                    </span>
                  </div>
                  <div className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-4 py-3 text-sm text-right text-gray-500`}>
                    {row.count}
                  </div>
                </div>
              )
            })}

            {salaryByState.length === 0 && regionRows.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-gray-400 bg-white">
                Not enough salary data available for this role yet. Check back tomorrow as listings update daily.
              </div>
            )}
          </div>
        </section>

        {/* REGIONAL FALLBACK — states trop maigres pour être affichés seuls */}
        {regionRows.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-bold text-[#0B1A2E] mb-2">By region</h2>
            <p className="text-xs text-gray-400 mb-4">
              States with fewer than 3 individual listings, grouped by US Census region for a reliable average.
            </p>
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-3 gap-px bg-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="bg-white px-4 py-3">Region</div>
                <div className="bg-white px-4 py-3 text-right">Avg. Salary</div>
                <div className="bg-white px-4 py-3 text-right">Listings</div>
              </div>
              {regionRows.map((row, i) => (
                <div key={row.region} className="grid grid-cols-3 gap-px bg-gray-200">
                  <div className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-4 py-3 text-sm text-gray-800`}>
                    {row.region}
                  </div>
                  <div className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-4 py-3 text-sm text-right font-semibold text-[#0B1A2E]`}>
                    ${fmt(row.avgSalary)}
                  </div>
                  <div className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-4 py-3 text-sm text-right text-gray-500`}>
                    {row.count}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-[#0B1A2E] mb-2">Browse {jobTitle} Jobs</h2>
          <p className="text-sm text-gray-500 mb-4">See all {fmt(totalListings)} active {jobTitle} listings across the US</p>
          <Link
            href={`/jobs?what=${encodeURIComponent(jobTitle)}`}
            className="inline-block bg-[#0B1A2E] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#1E3A5F] transition-colors"
          >
            View {jobTitle} Jobs
          </Link>
        </section>

        {/* DISCLAIMER */}
        <footer className="mt-16 border-t border-gray-200 pt-8">
          <p className="text-xs text-gray-400 text-center max-w-2xl mx-auto">
            Salary data computed from active job listings in the Solar Roles database. Figures reflect listed compensation ranges and may not include bonuses, equity, or benefits. States with fewer than 3 listings for this role are grouped by region instead of shown individually. Updated daily.
          </p>
        </footer>
      </div>
    </>
  )
}