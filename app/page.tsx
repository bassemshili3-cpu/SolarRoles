import type { Metadata } from 'next'
import { Suspense } from 'react'

import SearchHero from '@/components/SearchHero'

import NewsletterForm from '@/components/NewsletterForm'

import { prisma } from '@/lib/prisma'
import { retainedJobWhere } from '@/lib/jobRetention'

import Link from 'next/link'

import { DollarSign, Search, ShieldCheck, Award, Users, Briefcase, MapPin, HardHat, TrendingUp, Eye, Zap } from 'lucide-react'

import { STATE_CODE_TO_NAME, codeToSlug } from '@/lib/usStates'


import HeroTagline from '@/components/HeroTagline'


// Sources we no longer aggregate from. Any job in the DB with one of these

// sources is hidden from the homepage sections below.

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Solar Roles',
  url: 'https://solarroles.com',
  logo: 'https://solarroles.com/logo-square.svg',
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Solar Roles',
  url: 'https://solarroles.com',
  description:
    'Solar industry jobs across the US — installer, electrician, service, and sales roles, with pay ranges on every listing.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://solarroles.com/jobs?what={search_term_string}',
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
      active: true,
      expiresAt: { gt: new Date() },
      ...retainedJobWhere(),

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
  alternates: { canonical: 'https://solarroles.com' },
  openGraph: {
    title: 'Solar Roles | Jobs & Career Paths in the US Solar Industry',
    description:
      'Solar industry jobs across the US — installer, electrician, service, and sales roles, with pay ranges on every listing.',
    url: 'https://solarroles.com',
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



const workforceFeatures = [
  {
    icon: MapPin,
    title: 'Compare demand by state',
    body: 'See active openings and explicitly entry-level hiring across all 50 states.',
    href: '/workforce-resources/solar-job-market-by-state',
  },
  {
    icon: TrendingUp,
    title: 'Find where beginners are hired',
    body: 'Review the employers, roles and locations currently open to new entrants.',
    href: '/workforce-resources/entry-level-solar-jobs',
  },
  {
    icon: Award,
    title: 'Connect training to occupations',
    body: 'Use current salary, skills, certification and career-pathway references.',
    href: '/workforce-resources/solar-career-pathways',
  },
  {
    icon: Briefcase,
    title: 'Publish current solar openings',
    body: 'Add a filtered jobs feed to a college or workforce-program website.',
    href: '/workforce-resources/jobs-widget',
  },
]


const categories = [
  { label: 'PV Installer', icon: HardHat, bg: 'bg-[#0B1A2E]', href: '/solar-pv-installer-jobs' },
  { label: 'Lead Installer', icon: Award, bg: 'bg-[#1E3A5F]', href: '/lead-solar-installer-jobs' },
  { label: 'No Experience', icon: TrendingUp, bg: 'bg-[#B45309]', href: '/solar-jobs-no-experience' },
  { label: 'Solar Sales', icon: Briefcase, bg: 'bg-[#0F2440]', href: '/solar-sales-jobs' },
  { label: 'Bess Technician', icon: Briefcase, bg: 'bg-[#0F2440]', href: '/bess-technician-jobs' },
  { label: 'Solar Electrician', icon: Zap, bg: 'bg-[#1E3A5F]', href: '/solar-electrician-jobs' },
  { label: 'Solar Engineer', icon: Zap, bg: 'bg-[#1E3A5F]', href: '/solar-engineer-jobs' },
  { label: 'Solar Technician', icon: Zap, bg: 'bg-[#1E3A5F]', href: '/solar-technician-jobs' },
]


async function TopStatesContent() {
  const topStates = await getTopStates()
  return topStates.map(({ state, count }) => (
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
  ))
}


export default function Home() {




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
        <div className="max-w-5xl mx-auto grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-bold tracking-widest text-[#B45309] uppercase mb-4">Put your skills to work</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0B1A2E] leading-tight tracking-tight mb-5">Solar runs on skilled hands.</h2>
            <p className="text-gray-600 leading-relaxed mb-6">4,200 PV installer openings a year are projected across the US. Build the systems. Keep them running. Find your place in the workforce powering solar.</p>
            <Link href="/jobs" className="text-sm font-semibold text-[#1E3A5F] underline underline-offset-4">Find your next solar role</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#FEF3C7] rounded-2xl p-6 border border-[#F5B819]/20">
              <p className="text-4xl font-bold text-[#0B1A2E] tracking-tight mb-2">37%</p>
              <p className="text-sm text-[#B45309] font-semibold leading-snug">Projected growth in PV installer employment, 2025–35</p>
            </div>
            <div className="rounded-2xl p-6 border border-gray-200">
              <p className="text-4xl font-bold text-[#0B1A2E] tracking-tight mb-2">4,200</p>
              <p className="text-sm text-gray-600 font-semibold leading-snug">Projected PV installer openings per year, including replacement hiring</p>
            </div>
            <a href="https://www.bls.gov/ooh/construction-and-extraction/solar-photovoltaic-installers.htm" target="_blank" rel="noopener noreferrer" className="col-span-2 text-xs text-gray-500 underline underline-offset-2">Source: US Bureau of Labor Statistics, 2025–35 projections</a>
          </div>
        </div>
      </section>


     <section className="bg-gray-50 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-3xl mb-14">
            <p className="text-xs font-bold tracking-widest text-[#B45309] uppercase mb-4">Who we are</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0B1A2E] leading-tight mb-8 tracking-tight">
              Solar work. A place of its own.
            </h2>
            <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
              <p>Installer, electrician, technician, engineer and sales openings, gathered in one place. Solar Roles connects the people who build and maintain solar with the employers hiring them.</p>
              <p>Find an opening. Check the requirements. Plan your next step with our certification guides and career tools.</p>
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
                See the table
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
                Read the guide
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
                Learn more
              </span>
            </Link>
          </div>

          <div className="mt-8">
            <Link
              href="/resources"
              className="inline-flex items-center gap-2 bg-[#0B1A2E] text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-[#1E3A5F] transition-colors"
            >
              Browse all resources
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#0B1A2E] py-24 px-6" aria-labelledby="workforce-resources-heading">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-14 lg:gap-16 items-start">
            <div>
              <p className="text-xs font-bold tracking-widest text-[#F5B819] uppercase mb-4">
                For educators and workforce programs
              </p>
              <h2 id="workforce-resources-heading" className="text-4xl font-bold text-white leading-tight mb-6 tracking-tight">
                Public tools connect solar training to current hiring.
              </h2>
              <p className="text-gray-300 leading-relaxed mb-5">
                Community colleges, workforce boards, apprenticeship programs and career counselors can compare local demand, explain occupational pathways and show students the requirements employers are publishing now.
              </p>
              <p className="text-sm leading-6 text-gray-400 mb-7">
                The resource center brings state-level openings, entry-level trends, salaries, employers, licensing references and a live jobs widget into one place. Data refreshes daily.
              </p>
              <Link
                href="/workforce-resources"
                className="inline-flex items-center gap-2 rounded-full bg-[#F5B819] px-6 py-3 text-sm font-bold text-[#0B1A2E] transition-colors hover:bg-[#FFD45C]"
              >
                Open workforce resources
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {workforceFeatures.map(({ icon: Icon, title, body, href }) => (
                <Link
                  key={title}
                  href={href}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-[#F5B819]/50 hover:bg-white/10"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F5B819]/20 flex items-center justify-center">
                    <Icon className="text-[#F5B819]" size={20} />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold leading-snug text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-400">{body}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#F5B819] transition-all group-hover:gap-2.5">
                    Open tool
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>


      <section className="bg-gray-50 py-24 px-6">

        <div className="max-w-5xl mx-auto">

          <div className="grid grid-cols-1 gap-6">

            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">

              <div className="w-12 h-12 rounded-2xl bg-[#F5B819]/15 flex items-center justify-center mb-5">

                <Briefcase className="text-[#B45309]" size={24} />

              </div>

              <h3 className="text-xl font-bold text-[#0B1A2E] mb-3">For employers</h3>

              <p className="text-gray-500 leading-relaxed mb-5">

                Reach installers actively looking. From apprentices to NABCEP-certified leads.

              </p>

              <Link

                href="/dashboard/post-a-job"

                className="text-[#B45309] font-semibold text-sm inline-flex items-center gap-1.5 hover:gap-2.5 transition-all"

              >

                Post a job

              </Link>

            </div>

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

            <Suspense fallback={<div className="col-span-full h-24" aria-hidden="true" />}>
              <TopStatesContent />
            </Suspense>

          </div>

          <div className="text-center">

            <Link

              href="/data"

              className="text-[#1E3A5F] font-semibold text-sm inline-flex items-center gap-1.5 hover:gap-2.5 transition-all"

            >

              See full job market data

            </Link>

          </div>

        </div>

      </section>





      <section className="bg-[#F3F1EB] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl border-t-4 border-[#0B1A2E] pt-8">
          <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-center">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#B45309]">The Solar Roles newsletter</p>
              <h2 className="mb-5 text-5xl font-bold tracking-tighter text-[#0B1A2E] md:text-6xl">Solar Crew<span className="text-[#B45309]">.</span></h2>
              <p className="max-w-md text-base leading-7 text-slate-700">Solar careers, training and industry news. One email every Tuesday, written for the people doing the work.</p>
            </div>
            <div className="border-t border-[#0B1A2E]/20 pt-6 md:border-l md:border-t-0 md:pl-10 md:pt-0">
              <p className="mb-4 text-sm font-semibold text-[#0B1A2E]">Get the next edition</p>
              <NewsletterForm />
              <p className="mt-4 text-xs text-slate-500">Free to subscribe. Unsubscribe anytime. <Link href="/privacy" className="underline underline-offset-2">Privacy policy</Link></p>
            </div>
          </div>
        </div>
      </section>

    </>

  )

}
