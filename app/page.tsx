import type { Metadata } from 'next'

import SearchHero from '@/components/SearchHero'

import NewsletterForm from '@/components/NewsletterForm'

import { prisma } from '@/lib/prisma'

import Link from 'next/link'

import {

  DollarSign,

  Search,

  ShieldCheck,

  Award,

  Globe,

  Users,

  Briefcase,

  MapPin,

  HardHat,

  TrendingUp,

  ArrowRight,

  Eye,

} from 'lucide-react'

import { STATE_CODE_TO_NAME, codeToSlug } from '@/lib/usStates'

import { matchRoleCategory } from '@/lib/roleCategories'

import CompanyLogo from '@/components/CompanyLogo'
import HeroTagline from '@/components/HeroTagline'


// Sources we no longer aggregate from. Any job in the DB with one of these

// sources is hidden from the homepage sections below.

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Solar Roles',
  url: 'https://www.solarroles.com',
  logo: 'https://www.solarroles.com/logo-square.svg', 
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Solar Roles',
  url: 'https://www.solarroles.com',
  description:
    'Solar industry jobs across the US — installer, electrician, service, and sales roles, with pay ranges on every listing.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://www.solarroles.com/jobs?what={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

const EXCLUDED_SOURCES = ['careerjet', 'jooble', 'lens', 'adzuna', 'greenhouse']


async function getTopStates() {

  const results = await prisma.job.groupBy({

    by: ['addressRegion'] as const,

    where: {

      addressRegion: { not: '' },

      source: { notIn: EXCLUDED_SOURCES },

    },

    _count: { addressRegion: true },

    orderBy: { _count: { addressRegion: 'desc' } },

    take: 12,

  })

  return results

    .map(r => ({ state: r.addressRegion, count: r._count.addressRegion }))

    .filter(({ state }) => codeToSlug(state) !== null)

    .slice(0, 8)

}


export const metadata: Metadata = {
  title: 'Solar Roles | Jobs & Career Paths in the US Solar Industry',
  description:
    'Solar industry jobs across the US — installer, electrician, service, and sales roles, with pay ranges on every listing. Independent guides on certifications, career paths, and how to land the right role.',
  keywords: 'solar jobs, solar installer jobs, solar career, solar electrician jobs, solar sales jobs, NABCEP jobs, solar industry careers',
  alternates: { canonical: 'https://www.solarroles.com' },
  openGraph: {
    title: 'Solar Roles | Jobs & Career Paths in the US Solar Industry',
    description:
      'Solar industry jobs across the US — installer, electrician, service, and sales roles, with pay ranges on every listing.',
    url: 'https://www.solarroles.com',
    siteName: 'Solar Roles',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solar Roles | Jobs & Career Paths in the US Solar Industry',
    description:
      'Solar industry jobs across the US — installer, electrician, service, and sales roles, with pay ranges on every listing.',
  },
}

export const revalidate = 3600


const featuredValueProps = [

  { icon: DollarSign, title: 'Wages on every listing', body: 'Pay range before you click. No "competitive" guessing.' },

  { icon: Search, title: 'Filters for solar work', body: 'NABCEP cert, system type, region, travel per diem.' },

  { icon: Eye, title: 'Browse without an account', body: 'Create a profile only when you decide to apply.' },

]



const credentialFeatures = [

  { icon: Award, label: 'NABCEP-aligned assessments' },

  { icon: Globe, label: 'Open credential standards' },

  { icon: ShieldCheck, label: 'License & OSHA verification' },

  { icon: Users, label: 'Portable across employers' },

]


const categories = [
  { label: 'PV Installer', icon: HardHat, bg: 'bg-[#0B1A2E]', href: '/solar-pv-installer-jobs' },
  { label: 'Lead Installer', icon: Award, bg: 'bg-[#1E3A5F]', href: '/lead-solar-installer-jobs' },
  { label: 'No Experience', icon: TrendingUp, bg: 'bg-[#B45309]', href: '/solar-jobs-no-experience' },
  { label: 'Solar Sales', icon: Briefcase, bg: 'bg-[#0F2440]', href: '/solar-sales-jobs' },
  { label: 'Bess Technician', icon: Briefcase, bg: 'bg-[#0F2440]', href: '/bess-technician-jobs' },
]


const CATEGORY_BADGE_COLORS: Record<string, { bg: string; color: string }> = {

  'Career Advice': { bg: '#EAF1F1', color: '#1E3A5F' },

  'Interview Tips': { bg: '#F0FDF4', color: '#16A34A' },

  'Salary Insights': { bg: '#FDEEE3', color: '#B45309' },

  'Remote Work': { bg: '#F0F9FF', color: '#0369A1' },

  'Tech Jobs': { bg: '#FAF5FF', color: '#7C3AED' },

  'Industry Trends': { bg: '#FDF2F8', color: '#BE185D' },

  'Solar Careers': { bg: '#FEF3C7', color: '#B45309' },

}


const FEATURED_ARTICLE = {

  category: 'Solar Careers',

  title: 'How to Land Your First Solar Job in 2026 (Even Without Experience)',

  subtitle:

    'Breaking into solar doesn\u2019t require a 4-year degree, a NABCEP cert, or years of rooftop experience. Here\u2019s the playbook for landing your first PV installer role \u2014 from the apprenticeship route to the direct-hire path.',

  author: 'Solar Roles Editorial Team',

  date: 'July 2026',

  readTime: '8 min read',

  url: '/blog/how-to-land-first-solar-job',

  image: '/solar-featured.jpg',

}



async function getLatestJobs() {

  const jobs = await prisma.job.findMany({

    where: { source: { notIn: EXCLUDED_SOURCES } },

    orderBy: { postedAt: 'desc' },

    take: 50,

    select: {

      id: true,

      title: true,

      description: true,

      company: true,

      addressRegion: true,

      postedAt: true,

    },

  })


  return jobs

    .filter(job => matchRoleCategory(job.title, job.description || '') !== null)

    .slice(0, 6)

    .map(({ description, ...job }) => job)

}


function timeAgo(date: Date | null) {

  if (!date) return 'Recently'

  const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))

  if (days <= 0) return 'Today'

  if (days === 1) return '1d ago'

  return `${days}d ago`

}


export default async function Home() {

  const [latestJobs, topStates] = await Promise.all([getLatestJobs(), getTopStates()])

  const badge = CATEGORY_BADGE_COLORS[FEATURED_ARTICLE.category] || { bg: '#FEF3C7', color: '#B45309' }


  return (

    <>

    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />

     <section className="relative bg-[#0B1A2E] text-white pt-24 pb-40 overflow-hidden">
      
  {/* Vidéo de fond en boucle, zoomée pour créer de la marge horizontale,
      sujet cadré plus à droite */}
  <div className="absolute inset-0 overflow-hidden">
    <video
      autoPlay
      loop
      muted
      playsInline
      poster="/solar-hero-poster.png"
      className="absolute inset-0 w-full h-full object-cover scale-100"
      style={{ objectPosition: '100% center' }}
    >
      <source src="/solar-hero.mp4" type="video/mp4" />
    </video>
  </div>

  {/* Un seul voile : dégradé gauche→droite, fort à gauche pour la lisibilité
      du texte, quasi nul à droite pour laisser respirer le sujet */}
  <div className="absolute inset-0 bg-gradient-to-r from-[#0B1A2E] via-[#0B1A2E]/60 to-[#0B1A2E]/10" />

  {/* Rayon de lumière signature qui balaie la hero, comme un reflet
      de soleil sur un panneau — se met en pause si l'utilisateur
      préfère moins d'animation */}


  <div className="relative z-10 max-w-6xl mx-auto px-6">
    <div className="max-w-2xl">
      <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-[1.05]">
        Solar Jobs<br />across the US
      </h1>
      <HeroTagline />
      <SearchHero />
    </div>
  </div>
</section>


      <section className="bg-white py-16 px-6">

        <div className="max-w-6xl mx-auto">

          <div className="flex items-end justify-between mb-8">

            <h2 className="text-2xl font-bold text-[#0B1A2E]">Latest jobs</h2>

            <Link

              href="/jobs"

              className="text-sm font-semibold text-[#1E3A5F] hover:text-[#0B1A2E] inline-flex items-center gap-1"

            >

              View all jobs <ArrowRight size={14} />

            </Link>

          </div>

          {latestJobs.length > 0 ? (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {latestJobs.map(job => (

                <Link

                  key={job.id}

                  href={`/jobs/${job.id}`}

                  className="flex items-start gap-4 p-5 rounded-2xl border border-gray-200 hover:border-[#F5B819]/50 hover:shadow-sm transition-all bg-white"

                >

                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">

                    <CompanyLogo company={job.company} size={40} />

                  </div>

                  <div className="min-w-0 flex-1">

                    <h3 className="font-semibold text-[#0B1A2E] text-sm leading-snug mb-1 truncate">

                      {job.title}

                    </h3>

                    <p className="text-sm text-gray-600 mb-2 truncate">

                      {job.company}{job.addressRegion ? ` \u00b7 ${job.addressRegion}` : ''}

                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap">

                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium">

                        Full-time

                      </span>

                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium">

                        On-site

                      </span>

                      <span className="text-xs text-gray-500 ml-auto">{timeAgo(job.postedAt)}</span>

                    </div>

                  </div>

                </Link>

              ))}

            </div>

          ) : (

            <p className="text-center text-gray-400 text-sm">No listings yet \u2014 check back soon.</p>

          )}

        </div>

      </section>


      <section className="bg-gray-50 border-y border-gray-100 py-10 px-6">

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

          {featuredValueProps.map(({ icon: Icon, title, body }) => (

            <div key={title} className="flex items-start gap-3">

              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#F5B819]/15 flex items-center justify-center">

                <Icon className="text-[#B45309]" size={20} />

              </div>

              <div className="min-w-0">

                <h3 className="font-semibold text-[#0B1A2E] text-sm mb-0.5">{title}</h3>

                <p className="text-sm text-gray-600 leading-relaxed">{body}</p>

              </div>

            </div>

          ))}

        </div>

      </section>

<section className="bg-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-bold tracking-widest text-[#B45309] uppercase mb-4">
                Why now
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0B1A2E] leading-tight tracking-tight mb-5">
                Solar is short on hands, right when demand is spiking.
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Federal tax-credit deadlines are pulling installation
                timelines forward across the country, and the workforce
                hasn&apos;t caught up. That means faster hiring, real
                urgency behind job postings, and more room to move up
                without waiting years for the &ldquo;next opening.&rdquo;
              </p>
              <p className="text-gray-500 text-sm">
                Source: 2025 U.S. Energy &amp; Employment Report (USEER) &amp;
                IREC National Solar Jobs Census
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#FEF3C7] rounded-2xl p-6 border border-[#F5B819]/20">
                <p className="text-4xl font-bold text-[#0B1A2E] tracking-tight mb-1">
                  53,000
                </p>
                <p className="text-sm text-[#B45309] font-semibold leading-snug">
                  worker shortfall projected by late 2026
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <p className="text-4xl font-bold text-[#0B1A2E] tracking-tight mb-1">
                  86%
                </p>
                <p className="text-sm text-gray-600 font-semibold leading-snug">
                  of solar employers say hiring is difficult right now
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      

     <section className="bg-gray-50 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-3xl mb-14">
            <p className="text-xs font-bold tracking-widest text-[#B45309] uppercase mb-4">Who we are</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0B1A2E] leading-tight mb-8 tracking-tight">
              A job board built and maintained for the US solar workforce.
            </h2>
            <div className="space-y-5 text-gray-600 text-lg leading-relaxed">
             <p>
  Solar Roles tracks installer, electrician, service, and sales
  openings across all 50 states &mdash; every listing is
  solar-specific, not a generic &ldquo;renewable energy&rdquo; tag
  pulled from a multi-industry board. Sign in with Google to save
  searches and apply faster &mdash; we only use your name and email
  to set up your profile, nothing more.
</p>
<p>
  We also publish independent guides on how these roles connect:
  which certifications are legally required versus which ones just
  help you get hired, how NABCEP compares to ETA International and
  state electrician licenses, and how apprenticeship paths stack up
  against paying for training up front. The goal is the same one
  that got us building the job board in the first place: help you
  find the right entry point into solar, and the next step after it.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/resources/solar-certifications-by-job-role"
              className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#F5B819]/50 hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F5B819]/15 flex items-center justify-center mb-4">
                <Award className="text-[#B45309]" size={20} />
              </div>
              <h3 className="font-semibold text-[#0B1A2E] text-sm mb-1.5">
                Certifications by job role
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-3">
                One table mapping each solar role to what&apos;s required,
                recommended, and optional.
              </p>
              <span className="text-[#1E3A5F] text-sm font-semibold inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                See the table <ArrowRight size={13} />
              </span>
            </Link>

            <Link
              href="/resources/osha-safety-guide-solar-installers"
              className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#F5B819]/50 hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1E3A5F]/10 flex items-center justify-center mb-4">
                <ShieldCheck className="text-[#1E3A5F]" size={20} />
              </div>
              <h3 className="font-semibold text-[#0B1A2E] text-sm mb-1.5">
                OSHA safety, explained
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-3">
                OSHA 10 vs 30, fall protection, and the electrical hazards
                specific to PV work.
              </p>
              <span className="text-[#1E3A5F] text-sm font-semibold inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                Read the guide <ArrowRight size={13} />
              </span>
            </Link>

            <Link
              href="/resources/solar-installer-apprenticeship-programs"
              className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#F5B819]/50 hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F5B819]/15 flex items-center justify-center mb-4">
                <Users className="text-[#B45309]" size={20} />
              </div>
              <h3 className="font-semibold text-[#0B1A2E] text-sm mb-1.5">
                Paid apprenticeship paths
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-3">
                How Registered Apprenticeship Programs work, and how to
                actually get into one.
              </p>
              <span className="text-[#1E3A5F] text-sm font-semibold inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                Learn more <ArrowRight size={13} />
              </span>
            </Link>
          </div>

          <div className="mt-8">
            <Link
              href="/resources"
              className="inline-flex items-center gap-2 bg-[#0B1A2E] text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-[#1E3A5F] transition-colors"
            >
              Browse all resources <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#0B1A2E] py-24 px-6">

        <div className="max-w-5xl mx-auto">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <div>

              <p className="text-xs font-bold tracking-widest text-[#F5B819] uppercase mb-4">Coming for job seekers</p>

              <h2 className="text-4xl font-bold text-white leading-tight mb-6 tracking-tight">

                Skills you can show, not just list.

              </h2>

              <p className="text-gray-300 leading-relaxed mb-5">

                A credential layer aligned with NABCEP and other open standards, so what you prove on Solar Roles follows you across employers.

              </p>

              <p className="text-[#F5B819] text-sm font-medium">

                Partnerships in progress.

              </p>

            </div>

            <div className="grid grid-cols-2 gap-4">

              {credentialFeatures.map(({ icon: Icon, label }) => (

                <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-3">

                  <div className="w-10 h-10 rounded-xl bg-[#F5B819]/20 flex items-center justify-center">

                    <Icon className="text-[#F5B819]" size={20} />

                  </div>

                  <p className="text-white text-sm font-semibold leading-snug">{label}</p>

                </div>

              ))}

            </div>

          </div>

        </div>

      </section>


      <section className="bg-gray-50 py-24 px-6">

        <div className="max-w-5xl mx-auto">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">

              <div className="w-12 h-12 rounded-2xl bg-[#1E3A5F]/10 flex items-center justify-center mb-5">

                <Users className="text-[#1E3A5F]" size={24} />

              </div>

              <h3 className="text-xl font-bold text-[#0B1A2E] mb-3">For Solar Job Seekers</h3>

              <p className="text-gray-500 leading-relaxed mb-5">

                Apprentices, journeymen, lead installers, electricians moving into PV. Browse free, apply when ready.

              </p>

              <Link

                href="/jobs"

                className="text-[#1E3A5F] font-semibold text-sm inline-flex items-center gap-1.5 hover:gap-2.5 transition-all"

              >

                Browse jobs <ArrowRight size={14} />

              </Link>

            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">

              <div className="w-12 h-12 rounded-2xl bg-[#F5B819]/15 flex items-center justify-center mb-5">

                <Briefcase className="text-[#B45309]" size={24} />

              </div>

              <h3 className="text-xl font-bold text-[#0B1A2E] mb-3">For employers</h3>

              <p className="text-gray-500 leading-relaxed mb-5">

                Reach installers actively looking. From apprentices to NABCEP-certified leads.

              </p>

              <Link

                href="/dashboard/post-a-job-free"

                className="text-[#B45309] font-semibold text-sm inline-flex items-center gap-1.5 hover:gap-2.5 transition-all"

              >

                Post a job <ArrowRight size={14} />

              </Link>

            </div>

          </div>

        </div>

      </section>


      <section className="bg-gray-50 py-20 px-6">

        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-12">

            <h2 className="text-4xl font-bold text-[#0B1A2E] tracking-tight">Browse by category</h2>

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

              className="border border-[#0B1A2E] text-[#0B1A2E] rounded-full px-6 py-2.5 text-sm font-semibold hover:bg-[#0B1A2E] hover:text-white transition-colors inline-block"

            >

              View all jobs

            </Link>

          </div>

        </div>

      </section>


      <section className="bg-white py-20 px-6">

        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-12">

            <p className="text-xs font-bold tracking-widest text-[#B45309] uppercase mb-3">Job market data</p>

            <h2 className="text-2xl font-bold text-[#0B1A2E] tracking-tight">States with the most active solar listings right now</h2>

          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">

            {topStates.map(({ state, count }) => (

              <Link

                key={state}

                href={`/data/states/${codeToSlug(state)}`}

                className="flex flex-col gap-2 p-5 rounded-2xl border border-gray-100 hover:border-[#1E3A5F]/30 hover:shadow-sm transition-all"

              >

                <MapPin className="text-[#1E3A5F]" size={18} />

                <span className="font-semibold text-[#0B1A2E] text-sm">

                  {STATE_CODE_TO_NAME[state.toUpperCase()] ?? state}

                </span>

                <span className="text-xs text-gray-500">{count.toLocaleString()} jobs</span>

              </Link>

            ))}

          </div>

          <div className="text-center">

            <Link

              href="/data"

              className="text-[#1E3A5F] font-semibold text-sm inline-flex items-center gap-1.5 hover:gap-2.5 transition-all"

            >

              See full job market data <ArrowRight size={14} />

            </Link>

          </div>

        </div>

      </section>


      <section className="bg-gray-50 py-20 px-6">

        <div className="max-w-5xl mx-auto">

          <div className="flex items-end justify-between mb-10">

            <div>

              <p className="text-xs font-bold tracking-widest text-[#B45309] uppercase mb-2">From the blog</p>

              <h2 className="text-3xl font-bold text-[#0B1A2E] tracking-tight">Career resources</h2>

            </div>

            <Link

              href="/blog"

              className="text-sm font-semibold text-[#1E3A5F] hover:text-[#0B1A2E] inline-flex items-center gap-1 transition-colors"

            >

              All articles <ArrowRight size={14} />

            </Link>

          </div>

          <Link

            href={FEATURED_ARTICLE.url}

            className="group block bg-white rounded-2xl border border-gray-100 hover:border-[#F5B819] hover:shadow-md transition-all overflow-hidden"

          >

            <div className="grid grid-cols-1 md:grid-cols-5">

              <div className="md:col-span-2 bg-gradient-to-br from-[#0B1A2E] via-[#0F2440] to-[#1E3A5F] min-h-[240px] md:min-h-[320px] flex items-center justify-center">

                {/* Replace with: <img src={FEATURED_ARTICLE.image} alt={FEATURED_ARTICLE.title} className="w-full h-full object-cover" /> */}

                <span className="text-[#F5B819]/30 text-xs font-bold tracking-[0.3em] uppercase">Cover</span>

              </div>

              <div className="md:col-span-3 p-8 md:p-10 flex flex-col justify-center">

                <div className="flex items-center gap-3 mb-4">

                  <span className="text-[11px] font-bold tracking-widest uppercase text-[#B45309]">Featured</span>

                  <span

                    style={{ background: badge.bg, color: badge.color }}

                    className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md"

                  >

                    {FEATURED_ARTICLE.category}

                  </span>

                </div>

                <h3 className="text-2xl md:text-[26px] font-bold text-[#0B1A2E] leading-tight mb-3 group-hover:text-[#B45309] transition-colors">

                  {FEATURED_ARTICLE.title}

                </h3>

                <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-4">

                  {FEATURED_ARTICLE.subtitle}

                </p>

                <div className="flex items-center gap-2 text-xs text-gray-500">

                  <strong className="text-gray-700 font-semibold">{FEATURED_ARTICLE.author}</strong>

                  <span className="text-gray-300">&middot;</span>

                  <span>{FEATURED_ARTICLE.date}</span>

                  <span className="text-gray-300">&middot;</span>

                  <span>{FEATURED_ARTICLE.readTime}</span>

                </div>

              </div>

            </div>

          </Link>

        </div>

      </section>


      <section className="bg-gradient-to-br from-[#0B1A2E] to-[#1E3A5F] py-20 px-6">

        <div className="max-w-2xl mx-auto text-center">

          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">

            Solar Crew

          </h2>

          <p className="text-[#F5B819]/80 leading-relaxed mb-8 text-base">

            One email every Tuesday. Receive guides, resources, and news in the solar field.

          </p>

          <NewsletterForm />

          <p className="text-[#F5B819]/60 text-xs mt-5">Unsubscribe anytime.</p>

        </div>

      </section>

    </>

  )

}

