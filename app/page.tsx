import type { Metadata } from 'next'
import SearchHero from '@/components/SearchHero'
import NewsletterForm from '@/components/NewsletterForm'
import { BLOG_ARTICLES } from '@/lib/blog-articles'
import { prisma } from '@/lib/prisma' // ⚠️ adapte le chemin si ton client Prisma est exporté ailleurs
import Link from 'next/link'
import {
  DollarSign, Search, Zap, ShieldCheck,
  BarChart2, Award, Globe, Users, ArrowRight, Briefcase,
  Plane, ClipboardList, HeartPulse, Headphones, Stethoscope, Building2,
  Clock, MapPin,
} from 'lucide-react'

import { abbrToSlug, abbrToStateName } from '@/lib/states'
import CompanyLogo from '@/components/CompanyLogo'
import { matchRoleCategory, getRoleKeywords } from '@/lib/roleCategories'
import { resolveStateName } from '@/lib/usStates'
import { getRoleLocationStats } from '@/lib/roleLocationStats'

async function getTopStates() {
  const results = await prisma.job.groupBy({
    by: ['addressRegion'] as const,
    where: { addressRegion: { not: '' } },
    _count: { addressRegion: true },
    orderBy: { _count: { addressRegion: 'desc' } },
    take: 12, // marge pour filtrer les states sans page dédiée (ex: DC) sans tomber sous 8
  })
  return results
    .map(r => ({ state: r.addressRegion, count: r._count.addressRegion }))
    .filter(({ state }) => abbrToSlug(state) !== null)
    .slice(0, 8)
}

export const metadata: Metadata = {
  title: 'Oh My Job | US Job Board with Salary Ranges & Smart Filters',
  description:
    'Search 400 000+ US job listings updated daily, with salaries shown upfront. Filter by title, location, job type, and experience level. No account is required.',
}

// Revalidation horaire — les requêtes ci-dessous tapent une table de 400k+ lignes,
// pas question de les relancer à chaque requête utilisateur
export const revalidate = 3600

// ── Data ──────────────────────────────────────────────────────────────────────

const stats = [
  { value: '400k+', label: 'Active listings' },
  { value: '$78K', label: 'Median salary shown' },
  { value: '50',   label: 'States covered' },
]

const strengths = [
  {
    icon: DollarSign,
    title: 'Salary on every listing',
    body: 'No "competitive salary" guessing games. Every job on Oh My Job displays a pay range before you click so you apply with numbers in hand.',
  },
  {
    icon: Search,
    title: 'No account required',
    body: 'Browse freely. Search like you would Google and create a profile only when you decide it makes sense.',
  },
  {
    icon: Zap,
    title: 'Multi-source in real time',
    body: 'We pull from multiple job feeds across all 50 states and deduplicate in real time.',
  },
  {
    icon: ShieldCheck,
    title: 'AI-assisted matching',
    body: 'Our matching layer surfaces roles that fit your actual skills and situation.',
  },
]

const credentialFeatures = [
  { icon: Award,  label: 'Verified skill assessments' },
  { icon: Globe,  label: 'Open credential standards' },
  { icon: ShieldCheck, label: 'Anti-fraud verification' },
  { icon: Users,  label: 'Portable across employers' },
]

// Remplace les anciens liens /jobs?what=X par tes vraies landing pages
const categories = [
  { label: 'FIFO Jobs',           icon: Plane,         bg: 'bg-blue-600',   href: '/fifo-jobs' },
  { label: 'Executive Assistant', icon: ClipboardList, bg: 'bg-pink-600',   href: '/executive-assistant-jobs' },
  { label: 'CNA Jobs',            icon: HeartPulse,    bg: 'bg-green-600',  href: '/cna-jobs' },
  { label: 'Electrician',         icon: Zap,           bg: 'bg-orange-600', href: '/electrician-jobs' },
  { label: 'Customer Service',    icon: Headphones,    bg: 'bg-purple-600', href: '/customer-service-jobs' },
  { label: 'Data Analyst',        icon: BarChart2,     bg: 'bg-yellow-600', href: '/entry-level-data-analyst-jobs' }, // ⚠️ vérifie l'orthographe de ce slug
  { label: 'Dental Assistant',    icon: Stethoscope,   bg: 'bg-red-600',    href: '/dental-assistant-jobs' },
  { label: 'Property Management', icon: Building2,     bg: 'bg-slate-600',  href: '/jobs-at-property-management' },
]

const CATEGORY_BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  'Career Advice':    { bg: '#EEF2FF', color: '#2B4ACB' },
  'Interview Tips':   { bg: '#F0FDF4', color: '#16A34A' },
  'Salary Insights':  { bg: '#FFF7ED', color: '#C2410C' },
  'Remote Work':      { bg: '#F0F9FF', color: '#0369A1' },
  'Tech Jobs':        { bg: '#FAF5FF', color: '#7C3AED' },
  'Industry Trends':  { bg: '#FDF2F8', color: '#BE185D' },
}

// ── Data fetching ─────────────────────────────────────────────────────────────

async function getLatestJobs() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const candidateSelect = {
    id: true,
    title: true,
    description: true,      // nécessaire pour matchRoleCategory
    company: true,
    addressRegion: true,
    postedAt: true,
  }

  const CANDIDATE_POOL_SIZE = 40

  // Pools de candidats (plus large que le besoin final de 6, car tous ne passeront pas le filtre SEO)
  const [careerjetCandidates, allCandidates] = await Promise.all([
    prisma.job.findMany({
      where: { source: 'careerjet', postedAt: { gte: sevenDaysAgo } },
      orderBy: { postedAt: 'desc' },
      take: CANDIDATE_POOL_SIZE,
      select: candidateSelect,
    }),
    prisma.job.findMany({
      where: { source: { in: ['careerjet', 'jooble'] }, postedAt: { gte: sevenDaysAgo } },
      orderBy: { postedAt: 'desc' },
      take: CANDIDATE_POOL_SIZE,
      select: candidateSelect,
    }),
  ])

  // Reproduit exactement la condition d'affichage du bloc SEO bleu sur la page détail
  async function isEligibleForSeoBlock(job: { title: string; description: string | null; addressRegion: string | null }) {
    const roleMatch = matchRoleCategory(job.title, job.description || '')
    if (!roleMatch) return false
    const stateName = resolveStateName(job.addressRegion)
    if (!stateName) return false
    const roleStats = await getRoleLocationStats(
      getRoleKeywords(roleMatch),
      stateName,
      !!roleMatch.matchInDescription
    )
    return !!roleStats
  }

  async function filterEligible<T extends { title: string; description: string | null; addressRegion: string | null }>(jobs: T[]) {
    const flags = await Promise.all(jobs.map(isEligibleForSeoBlock))
    return jobs.filter((_, i) => flags[i])
  }

  const eligibleCareerjet = (await filterEligible(careerjetCandidates)).slice(0, 2)

  const eligibleOthers = (await filterEligible(allCandidates))
    .filter(job => !eligibleCareerjet.some(cj => cj.id === job.id))
    .slice(0, 6 - eligibleCareerjet.length)

  return [...eligibleCareerjet, ...eligibleOthers]
    .sort((a, b) => new Date(b.postedAt ?? 0).getTime() - new Date(a.postedAt ?? 0).getTime())
    .map(({ description, ...job }) => job) // nettoie le champ ajouté juste pour le filtre, inutile côté affichage
}

  



function stateSlug(state: string) {
  return state.toLowerCase().trim().replace(/\s+/g, '-')
}

function timeAgo(date: Date | null) {
  if (!date) return 'Recently'
  const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'Today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function Home() {
  const recentArticles = BLOG_ARTICLES.slice(0, 3)
  const [latestJobs, topStates] = await Promise.all([
    getLatestJobs(),
    getTopStates(),
  ])

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white pt-24 pb-36">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-blue-200 text-sm font-semibold tracking-widest uppercase mb-4">
            Smart job search across all 50 states
          </p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight">
            Your next opportunity<br />is one click away
          </h1>
          <SearchHero />
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-12 flex flex-wrap justify-center gap-x-12 gap-y-8">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center min-w-[100px]">
              <p className="text-4xl font-extrabold text-[#1a2340] tracking-tight">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Vision ── */}
      <section className="bg-gray-50 py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold tracking-widest text-teal-600 uppercase mb-4">Our take</p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a2340] leading-tight mb-8 tracking-tight">
            Getting a first job shouldn't require having had a first job.
          </h2>
          <div className="space-y-5 text-gray-600 text-lg leading-relaxed">
            <p>
              Oh My Job is a job board built on a different premise. Because the best hire isn't always the most experienced one, but rather the most capable one.
              And the only way to find that person is to actually look at what they can do.
            </p>
          </div>
          <div className="mt-10 flex gap-4 flex-wrap">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 bg-[#1a2340] text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-[#1a2340]/90 transition-colors"
            >
              Browse open roles 
            </Link>
            {/* Bouton "Career resources" retiré ici — doublon avec le lien /blog
                de la section "Blog preview" plus bas. */}
          </div>
        </div>
      </section>

      

      {/* ── Skills & Credentials ── */}
      <section className="bg-[#1a2340] py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-bold tracking-widest text-indigo-400 uppercase mb-4">Where we're headed</p>
              <h2 className="text-4xl font-bold text-white leading-tight mb-6 tracking-tight">
                Your skills matters.
              </h2>
              <p className="text-gray-400 leading-relaxed mb-5">
                A résumé tells people what you've done and we want employers to see what you can actually do.
                That means real skill assessments, verifiable credentials, and badges that carry weight over time.
              </p>
              <p className="text-gray-400 leading-relaxed mb-10">
                We're building a credential layer for Oh My Job aligned with open industry standards, so what you prove here belongs to you and follows you.
                Our team is currently actively working on integrations with the leading digital credential platforms, and will share details as partnerships are confirmed.
              </p>
              <p className="text-indigo-300 text-sm font-medium">
                Credential partnerships in progress. More soon.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {credentialFeatures.map(({ icon: Icon, label }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                    <Icon className="text-indigo-300" size={20} />
                  </div>
                  <p className="text-white text-sm font-semibold leading-snug">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── For who ── */}
      <section className="bg-gray-50 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest text-teal-600 uppercase mb-3">Who it's for</p>
            <h2 className="text-4xl font-bold text-[#1a2340] tracking-tight">Two sides, one goal</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Candidates */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-5">
                <Users className="text-indigo-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#1a2340] mb-3">If you're starting out or switching lanes</h3>
              <p className="text-gray-500 leading-relaxed mb-5">
                Fresh grad, career changer, or someone returning to the workforce after a break. We believe in your potential and the skills you bring.
              
              </p>
              {/* Lien "Find your role → /jobs" retiré ici — même destination que le CTA
                  "Browse open roles" du hero, juste au-dessus du pli. */}
            </div>

            {/* Employers */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mb-5">
                <Briefcase className="text-teal-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#1a2340] mb-3">If you're hiring and tired of screening the same profiles</h3>
              <p className="text-gray-500 leading-relaxed mb-5">
                Posting on Oh My Job connects you with people who've actively proven their skills.
                Our platform saves you time filtering and find better fits.
              </p>
              <a href="mailto:contact@oh-my-job.com" className="text-teal-600 font-semibold text-sm inline-flex items-center gap-1.5 hover:gap-2.5 transition-all">
                Talk to us 
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ── Latest jobs posted (NOUVEAU) ── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-widest text-teal-600 uppercase mb-3">Fresh listings</p>
            <h2 className="text-4xl font-bold text-[#1a2340] tracking-tight mb-3">Latest jobs posted</h2>
           
          </div>
          {latestJobs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {latestJobs.map(job => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-sm transition-all"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <CompanyLogo company={job.company} size={40} />
                    
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[#1a2340] text-sm leading-snug truncate">{job.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {job.company}{job.addressRegion ? ` · ${job.addressRegion}` : ''}
                    </p>
                    <p className="text-xs text-indigo-600 font-medium mt-1">{timeAgo(job.postedAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 text-sm">No new listings in the last 7 days — check back soon.</p>
          )}
        </div>
      </section>

      {/* ── Browse categories ── */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-widest text-teal-600 uppercase mb-3">Explore by field</p>
            <h2 className="text-4xl font-bold text-[#1a2340] tracking-tight mb-3">Browse top job categories</h2>
            <p className="text-gray-500">From software engineering to healthcare, find opportunities across every industry.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            {categories.map(({ label, icon: Icon, bg, href }) => (
              <Link
                key={label}
                href={href}
                className={`relative overflow-hidden rounded-2xl h-32 flex flex-col items-start p-5 group ${bg}`}
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <div className="relative z-10 flex flex-col gap-2.5">
                  <Icon className="text-white drop-shadow" size={22} />
                  <span className="text-sm font-bold text-white drop-shadow">{label}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link
              href="/jobs"
              className="border border-[#1a2340] text-[#1a2340] rounded-full px-6 py-2.5 text-sm font-semibold hover:bg-[#1a2340] hover:text-white transition-colors inline-block"
            >
              View all jobs
            </Link>
          </div>
        </div>
      </section>

      {/* ── Job market data (NOUVEAU) ── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-widest text-teal-600 uppercase mb-3">Job market data</p>
            <h2 className="text-2xl font-bold text-[#1a2340] tracking-tight mb-3">States with the most active listings right now</h2>
           
            
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {topStates.map(({ state, count }) => (
  <Link
    key={state}
    href={`/jobs/state/${abbrToSlug(state)}`}
    className="flex flex-col gap-2 p-5 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-sm transition-all"
  >
    <MapPin className="text-indigo-600" size={18} />
    <span className="font-semibold text-[#1a2340] text-sm">{abbrToStateName(state)}</span>
    <span className="text-xs text-gray-500">{count.toLocaleString()} jobs</span>
  </Link>
))}
          </div>
          <div className="text-center">
            <Link
              href="/data"
              className="text-indigo-600 font-semibold text-sm inline-flex items-center gap-1.5 hover:gap-2.5 transition-all"
            >
              See full job market data <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Blog preview ── */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold tracking-widest text-teal-600 uppercase mb-2">Career resources</p>
              <h2 className="text-3xl font-bold text-[#1a2340] tracking-tight">From the blog</h2>
            </div>
            <Link href="/blog" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 transition-colors">
              All articles <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {recentArticles.map(article => {
              const badge = CATEGORY_BADGE_COLORS[article.category] || { bg: '#F3F4F6', color: '#374151' }
              return (
                <Link
                  key={article.slug}
                  href={article.url}
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-indigo-100 hover:shadow-sm transition-all flex flex-col gap-4"
                >
                  <span
                    style={{ background: badge.bg, color: badge.color }}
                    className="self-start text-xs font-semibold px-2.5 py-1 rounded-md"
                  >
                    {article.category}
                  </span>
                  <h3 className="font-semibold text-[#1a2340] leading-snug text-base">{article.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed flex-1">{article.excerpt}</p>
                  <span className="text-indigo-600 text-sm font-semibold inline-flex items-center gap-1">
                    Read more <ArrowRight size={13} />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="bg-gradient-to-br from-indigo-700 to-blue-600 py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
            Oh My News
          </h2>
          <p className="text-blue-100 leading-relaxed mb-8 text-base">
            Every Tuesday, one piece from our career resources blog. Practical advice on the employment field & market data.
          </p>
          <NewsletterForm />
          <p className="text-blue-200/60 text-xs mt-5">No spam. Unsubscribe anytime.</p>
        </div>
      </section>
    </>
  )
}