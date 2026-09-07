// app/data/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ArrowRight, Building2, MapPin, DollarSign, TrendingUp, Briefcase } from 'lucide-react'
import { STATES, STATE_CODE_TO_NAME, stateToSlug, codeToSlug } from '@/lib/usStates'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'US Solar Job Market Data | Hiring Reports & Salaries',
  description: 'Original research and live US solar job market data, including hiring reports, salaries by state and active job-market snapshots.',
  keywords: 'US solar job market data, solar hiring reports, solar salary by state, solar employment data',
  alternates: { canonical: 'https://www.solarroles.com/data' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'US Solar Job Market Data',
  description: 'Original research and live statistics from active US solar job listings.',
  url: 'https://www.solarroles.com/data',
}

// ── Salary sanity bounds ──
const SALARY_MIN_THRESHOLD = 20_000
const SALARY_MAX_THRESHOLD = 600_000

// Slug réel de la page salaire -> libellé affiché sur la carte
const SALARY_REPORTS: Record<string, string> = {
  'solar-photovoltaic-installer': 'Solar Photovoltaic Installer',
  'lead-solar-installer': 'Lead Solar Installer',
  'solar-electrician': 'Solar Electrician',
  'solar-sales-representative': 'Solar Sales Representative',
  'solar-engineer': 'Solar Engineer',
  'solar-technician': 'Solar Technician',
}

// ── Skills: mots-clés utilisés pour compter les mentions dans description ──
// Chaque entrée = liste de variantes/synonymes matchées en OR (insensitive).
// NB: on évite "license"/"licensed" seuls car ça matche trop souvent
// "driver's license" dans les annonces d'installeurs terrain -> faux positifs.
const SKILL_KEYWORDS: Record<string, string[]> = {
  'Certifications required': [
    'certification',
    'certified',
    'nabcep',
    'osha 10',
    'osha 30',
    'osha-10',
    'osha-30',
    'licensed electrician',
    'state license',
  ],
  'Communication skills': [
    'communication skills',
    'strong communicator',
    'verbal and written',
    'interpersonal skills',
  ],
  'Customer service': [
    'customer service',
    'customer-facing',
    'client-facing',
  ],
  'Bilingual': [
    'bilingual',
    'spanish speaking',
    'fluent in spanish',
  ],
  'Empathy': [
    'empathy',
    'empathetic',
    'compassionate',
  ],
}

// Couleurs statiques (ordre = ordre d'affichage), indépendantes des données
const SKILL_COLORS: Record<string, string> = {
  'Certifications required': 'bg-violet-500',
  'Communication skills': 'bg-violet-400',
  'Customer service': 'bg-violet-300',
  'Bilingual': 'bg-green-500',
  'Empathy': 'bg-green-400',
}

export default async function DataCenterPage() {
  let totalJobs = 0
  let avgSalaryResult: { _avg: { salaryMin: number | null; salaryMax: number | null } } = {
    _avg: { salaryMin: null, salaryMax: null },
  }
  let topStatesRaw: { addressRegion: string | null; _count: { id: number } }[] = []
  let entryLevelCount = 0
  let degreeCount = 0
  let skillCounts: number[] = new Array(Object.keys(SKILL_KEYWORDS).length).fill(0)

  const skillNames = Object.keys(SKILL_KEYWORDS)

  try {
    const results = await Promise.all([
      prisma.job.count({ where: { active: true } }),

      prisma.job.aggregate({
        where: {
          active: true,
          salaryMin: { gte: SALARY_MIN_THRESHOLD, lte: SALARY_MAX_THRESHOLD },
          salaryMax: { gte: SALARY_MIN_THRESHOLD, lte: SALARY_MAX_THRESHOLD },
        },
        _avg: { salaryMin: true, salaryMax: true },
      }),

      // FIX Ln 86: on ne peut pas passer `not: null` sur un champ String? avec Prisma.
      // On filtre côté JS après coup en excluant les valeurs null/vides.
      // Rappel: addressRegion contient un code à 2 lettres ("TX"), pas le nom complet.
      prisma.job.groupBy({
        by: ['addressRegion'],
        where: {
          active: true,
          addressRegion: { not: '' },
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 15, // on prend 15 pour avoir de la marge après filtre JS
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

      // Nombre d'annonces demandant un diplôme (bachelor/degree), affiché
      // en comparaison du nombre de certifs demandées.
      prisma.job.count({
        where: {
          active: true,
          OR: [
            { description: { contains: "bachelor's degree", mode: 'insensitive' } },
            { description: { contains: 'bachelor degree',   mode: 'insensitive' } },
            { description: { contains: 'college degree',    mode: 'insensitive' } },
          ],
        },
      }),

      // Un count par skill, dans le même ordre que skillNames
      ...skillNames.map((skill) =>
        prisma.job.count({
          where: {
            active: true,
            OR: SKILL_KEYWORDS[skill].map((kw) => ({
              description: { contains: kw, mode: 'insensitive' as const },
            })),
          },
        })
      ),
    ])

    totalJobs = results[0] as number
    avgSalaryResult = results[1] as typeof avgSalaryResult
    topStatesRaw = results[2] as typeof topStatesRaw
    entryLevelCount = results[3] as number
    degreeCount = results[4] as number
    skillCounts = results.slice(5) as number[]
  } catch (err) {
    console.error('DataCenterPage query error:', err)
    // Fallbacks déjà initialisés ci-dessus — la page se génère quand même,
    // avec des valeurs neutres. La prochaine revalidation (24h) réessaiera.
  }

  // FIX Ln 219: filtre null côté JS + résout code -> nom complet + slug de route.
  // Les states sans page dédiée (ex: codes non reconnus comme "DC" selon config)
  // sont écartés plutôt que de générer un lien mort.
  const topStates = topStatesRaw
    .filter((s): s is typeof s & { addressRegion: string } =>
      typeof s.addressRegion === 'string' && s.addressRegion.length > 0
    )
    .map((s) => ({
      ...s,
      fullName: STATE_CODE_TO_NAME[s.addressRegion.toUpperCase()] ?? s.addressRegion,
      slug: codeToSlug(s.addressRegion),
    }))
    .filter((s) => s.slug !== null)
    .slice(0, 10)

  const avgSalary =
    avgSalaryResult._avg.salaryMin != null && avgSalaryResult._avg.salaryMax != null
      ? Math.round((avgSalaryResult._avg.salaryMin + avgSalaryResult._avg.salaryMax) / 2)
      : null

  const entryLevelPct = totalJobs > 0
    ? ((entryLevelCount / totalJobs) * 100).toFixed(1)
    : '0.0'

  const topHiringState = topStates.length > 0 ? topStates[0].fullName : '—'

  // Construction du tableau SKILL_BARS à partir des counts DB.
  // pct = mentions du skill / mentions du skill le plus fréquent, en %
  // (le skill le plus fréquent affiche donc toujours une barre à 100%).
  const maxSkillMentions = Math.max(...skillCounts, 1)
  const skillBars = skillNames
    .map((skill, i) => ({
      skill,
      mentions: skillCounts[i] ?? 0,
      pct: Math.round(((skillCounts[i] ?? 0) / maxSkillMentions) * 100),
      color: SKILL_COLORS[skill],
    }))
    .sort((a, b) => b.mentions - a.mentions)

  const topSkill = skillBars.length > 0 ? skillBars[0] : null

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* ── HEADER ── */}
        <header className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            US Solar Job Market Data
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Original reports and live statistics drawn from {totalJobs.toLocaleString('en-US')} active solar job listings across the United States.
          </p>
        </header>

        {/* ── LIVE STATS BAR ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{totalJobs.toLocaleString('en-US')}</p>
            <p className="text-sm text-gray-500 mt-1">Active listings</p>
          </div>
          <div className="text-center">
            {avgSalary != null ? (
              <>
                <p className="text-3xl font-bold text-gray-900">${avgSalary.toLocaleString('en-US')}</p>
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
            <p className="text-3xl font-bold text-gray-900">{topHiringState}</p>
            <p className="text-sm text-gray-500 mt-1">Top hiring state</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">50</p>
            <p className="text-sm text-gray-500 mt-1">States covered</p>
          </div>
        </div>

        <Link href="/data/solar-sales-jobs-business-expenses" className="group mb-6 block rounded-3xl border border-amber-200 bg-[#FFF8EC] p-6 transition hover:border-amber-300 hover:bg-amber-100/70 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">Latest Solar Roles data report</p>
          <h2 className="mt-3 max-w-2xl text-2xl font-bold leading-tight text-gray-900">A solar sales job—or a business you have to fund?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">One listing puts the ad budget on the rep. Six selected job descriptions show who supplies leads, equipment and income support.</p>
          <p className="mt-4 text-sm font-semibold text-amber-800">Read the report →</p>
        </Link>

        <Link href="/data/remote-solar-jobs-travel-requirements" className="group mb-6 block rounded-3xl border border-amber-200 bg-[#FFF8EC] p-6 transition hover:border-amber-300 hover:bg-amber-100/70 sm:p-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">Solar Roles data report</p>
              <h2 className="mt-3 max-w-2xl text-2xl font-bold leading-tight text-gray-900">Remote solar jobs can still require 90% travel</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">40 of 54 remote-advertised roles in our review mentioned travel or site visits. Read the requirements behind the labels.</p>
            </div>
            <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-amber-700 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </div>
        </Link>

        <Link
          href="/data/solar-installer-salary-rent-report"
          className="group mb-6 block rounded-3xl border border-amber-200 bg-[#FFF8EC] p-6 transition hover:border-amber-300 hover:bg-amber-100/70 sm:p-8"
        >
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">Solar Roles data report</p>
              <h2 className="mt-3 max-w-2xl text-2xl font-bold leading-tight text-gray-900">Where solar installer pay goes furthest on rent</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">A one-bedroom rent takes 41 hours of installer pay in Albuquerque and 99 in Santa Cruz. Compare pay and housing costs across 28 US metros.</p>
            </div>
            <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-amber-700 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </div>
        </Link>

        <Link
          href="/data/battery-storage-leads-segment-specific-solar-hiring"
          className="group mb-20 block rounded-3xl border border-amber-200 bg-[#FFF8EC] p-6 transition hover:border-amber-300 hover:bg-amber-100/70 sm:p-8"
        >
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">
                Solar Roles data report
              </p>
              <h2 className="mt-3 max-w-2xl text-2xl font-bold leading-tight text-gray-900">
                Battery storage leads the solar jobs that name a market segment
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
                Of 370 unique US openings with a segment in the title, 174 named
                battery storage and 158 named utility-scale solar.
              </p>
            </div>
            <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-amber-700 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

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
            {Object.keys(STATES).map((name) => (
              <Link
                key={name}
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
                    href={`/data/states/${state.slug}`}
                    className="text-sm font-medium text-gray-900 hover:text-blue-600"
                  >
                    {state.fullName}
                  </Link>
                </div>
                {/* FIX Ln 219: _count.id peut être undefined selon la version Prisma */}
                <span className="text-sm text-gray-500">
                  {(state._count.id ?? 0).toLocaleString('en-US')} listings
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION: Entry-Level Hiring Insights ── */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Entry-Level Hiring Insights</h2>
              <p className="text-sm text-gray-500">
                Based on {totalJobs.toLocaleString('en-US')} active US listings
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="border border-gray-200 rounded-2xl p-6 bg-white">
              <p className="text-4xl font-bold text-violet-600">{entryLevelPct}%</p>
              <p className="text-sm font-medium text-gray-800 mt-2">
                of listings explicitly mention &ldquo;entry-level&rdquo; or &ldquo;no experience required&rdquo;
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {entryLevelCount.toLocaleString('en-US')} out of {totalJobs.toLocaleString('en-US')} active postings
              </p>
            </div>
            <div className="border border-gray-200 rounded-2xl p-6 bg-white">
              <p className="text-4xl font-bold text-violet-600">
                {(topSkill?.mentions ?? 0).toLocaleString('en-US')}
              </p>
              <p className="text-sm font-medium text-gray-800 mt-2">
                listings require {topSkill?.skill.toLowerCase() ?? 'certifications'} — the #1 demanded qualifier, ahead of communication skills
              </p>
              <p className="text-xs text-gray-400 mt-2">
                vs. only {degreeCount.toLocaleString('en-US')} requiring a degree
              </p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-2xl p-6 bg-white mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-5">
              Most demanded skills in active US listings
            </h3>
            <div className="space-y-4">
              {skillBars.map(({ skill, mentions, pct, color }) => (
                <div key={skill}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">{skill}</span>
                    <span className="text-gray-400">{mentions.toLocaleString('en-US')} listings</span>
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

          <div className="bg-violet-50 border border-violet-100 rounded-2xl p-6">
            <p className="text-sm text-violet-800 leading-relaxed">
              <span className="font-semibold">What the data suggests: </span>
              With only {entryLevelPct}% of US job postings explicitly open to candidates without experience,
              the traditional entry point into the workforce has narrowed significantly. Meanwhile, demand for
              certifications and communication skills is rising — signaling a shift toward
              skills-based and credential-based hiring over experience requirements.
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
              <p className="text-sm text-gray-500">Average pay across states for solar industry roles</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(SALARY_REPORTS).map(([slug, label]) => (
              <Link
                key={slug}
                href={`/data/salaries/${slug}`}
                className="px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700 transition-all flex items-center gap-2"
              >
                <Briefcase className="w-3.5 h-3.5" />
                {label}
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
            All data is computed from active job listings in the Solar Roles database sourced from third-party APIs.
            Salary figures reflect listed annual compensation ($20k–$600k range) and may not include bonuses, equity, or benefits.
            Numbers update daily and represent a snapshot.
          </p>
        </footer>

      </div>
    </>
  )
}
