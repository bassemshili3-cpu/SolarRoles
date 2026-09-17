import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Check,
  CircleDollarSign,
  RefreshCw,
  Search,
  ShieldCheck,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

const CANONICAL_URL = 'https://solarroles.com/employers/post-a-job'

export const metadata: Metadata = {
  title: 'Solar Job Posting Pricing for Employers | Solar Roles',
  description:
    'Post a featured solar job for $39 for 30 days, or use Hiring Partner for $99/month with up to 10 active jobs, 3 featured jobs, automatic job sync, an employer profile and analytics.',
  keywords: [
    'solar job posting pricing',
    'post a solar job',
    'solar job board employers',
    'solar recruiting',
    'hire solar installers',
    'solar hiring',
    'solar EPC hiring',
    'solar company hiring',
    'solar installer recruitment',
    'solar electrician hiring',
    'battery storage hiring',
  ],
  alternates: {
    canonical: CANONICAL_URL,
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Solar Job Posting Pricing for Employers | Solar Roles',
    description:
      'Featured Job: $39 for 30 days. Hiring Partner: $99/month for ongoing solar hiring.',
    url: CANONICAL_URL,
    siteName: 'Solar Roles',
    type: 'website',
    images: [
      {
        url: 'https://solarroles.com/og-employer.png',
        width: 1200,
        height: 630,
        alt: 'Solar Roles employer job posting plans',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solar Job Posting Pricing for Employers | Solar Roles',
    description: 'Featured Job: $39 for 30 days. Hiring Partner: $99/month.',
  },
}

const plans = [
  {
    name: 'Featured Job',
    price: '$39',
    cadence: '/ 30 days',
    description: 'For one priority opening.',
    href: '/dashboard/employer/new?plan=featured',
    cta: 'Post a featured job',
    featured: false,
    features: [
      '1 active job for 30 days',
      'Featured badge',
      'Priority placement in relevant Solar Roles searches',
      'Placement on relevant role and location pages',
      'Direct applications through Solar Roles',
      'Editable from your employer dashboard',
    ],
  },
  {
    name: 'Hiring Partner',
    price: '$99',
    cadence: '/ month',
    description: 'For companies with ongoing hiring.',
    href: '/dashboard/employer/new?plan=partner',
    cta: 'Start Hiring Partner',
    featured: true,
    features: [
      'Up to 10 active jobs',
      '3 featured jobs at a time',
      'Automatic job sync from your ATS or careers page',
      'Employer profile',
      'Hiring analytics',
      'Direct applications through Solar Roles',
    ],
  },
]

const comparisonRows = [
  { label: 'Price', featured: '$39 / 30 days', partner: '$99 / month' },
  { label: 'Active jobs', featured: '1', partner: 'Up to 10' },
  { label: 'Featured jobs', featured: '1', partner: '3 at a time' },
  { label: 'Automatic job sync', featured: '—', partner: 'Included' },
  { label: 'Employer profile', featured: '—', partner: 'Included' },
  { label: 'Hiring analytics', featured: '—', partner: 'Included' },
  { label: 'Direct applications', featured: 'Included', partner: 'Included' },
  { label: 'Placement fee', featured: 'None', partner: 'None' },
]

const steps = [
  {
    title: 'Choose how you hire',
    description:
      'Use Featured Job for a single opening. Use Hiring Partner when you want multiple live roles and automatic syncing.',
  },
  {
    title: 'Publish or connect your jobs',
    description:
      'Create the listing directly on Solar Roles, or connect the careers page or ATS used for your Hiring Partner account.',
  },
  {
    title: 'Manage applications and visibility',
    description:
      'Edit active roles from the employer dashboard. Hiring Partner accounts can choose which three openings are featured at a given time.',
  },
]

const acceptedRoles = [
  'Solar installer',
  'Solar electrician',
  'Solar technician',
  'O&M technician',
  'Solar engineer',
  'Project manager',
  'Solar sales',
  'Site assessor',
  'Construction manager',
  'Battery storage / BESS',
  'Utility-scale solar',
  'Apprenticeship',
]

const faqs = [
  {
    question: 'How much does it cost to post a job on Solar Roles?',
    answer:
      'A Featured Job costs $39 and stays active for 30 days. Hiring Partner costs $99 per month and includes up to 10 active jobs, with 3 featured jobs at a time.',
  },
  {
    question: 'What is included in a Featured Job?',
    answer:
      'A Featured Job includes one 30-day listing, a featured badge, priority placement in relevant Solar Roles searches and visibility on relevant role and location pages. Candidates can apply through Solar Roles.',
  },
  {
    question: 'What is included in Hiring Partner?',
    answer:
      'Hiring Partner includes up to 10 active jobs, 3 featured jobs at a time, automatic job sync from your ATS or careers page, an employer profile and hiring analytics.',
  },
  {
    question: 'How does automatic job sync work?',
    answer:
      'Solar Roles uses your public careers page or supported recruiting system as the source for your open roles. Jobs included in the Hiring Partner plan can be added and refreshed without your team recreating every listing manually.',
  },
  {
    question: 'Can candidates apply directly on Solar Roles?',
    answer:
      'Yes. Employer-posted roles can accept applications directly through Solar Roles so you can review submissions associated with the job.',
  },
  {
    question: 'Can I edit or close a job before the 30 days are over?',
    answer:
      'Yes. You can edit, pause or close an employer-posted job from your dashboard. Closing a role early does not require you to keep it live for the full 30 days.',
  },
  {
    question: 'Does Solar Roles guarantee placement in Google for Jobs?',
    answer:
      'No job board can guarantee inclusion. Solar Roles creates indexable job pages and uses JobPosting structured data for eligible listings, but search engines decide whether and where a job appears.',
  },
  {
    question: 'What kinds of jobs can I post?',
    answer:
      'Solar Roles accepts legitimate US roles related to solar energy and adjacent storage work, including installation, electrical, engineering, O&M, project management, construction, sales and battery storage positions.',
  },
  {
    question: 'Do you charge a placement fee when someone is hired?',
    answer:
      'No. Solar Roles charges for the job posting or the Hiring Partner subscription shown on this page. There is no placement fee tied to a hire.',
  },
]

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Solar Roles employer job posting',
    serviceType: 'Solar job advertising and employer hiring services',
    provider: {
      '@type': 'Organization',
      name: 'Solar Roles',
      url: 'https://solarroles.com',
    },
    areaServed: {
      '@type': 'Country',
      name: 'United States',
    },
    url: CANONICAL_URL,
    offers: [
      {
        '@type': 'Offer',
        name: 'Featured Job',
        price: '39',
        priceCurrency: 'USD',
        description: 'One featured solar job listing for 30 days.',
        url: `${CANONICAL_URL}#pricing`,
      },
      {
        '@type': 'Offer',
        name: 'Hiring Partner',
        price: '99',
        priceCurrency: 'USD',
        description:
          'Monthly employer plan with up to 10 active jobs, 3 featured jobs, automatic job sync, employer profile and analytics.',
        url: `${CANONICAL_URL}#pricing`,
      },
    ],
  },
]

function PlanCard({ plan }: { plan: (typeof plans)[number] }) {
  return (
    <article
      className={`relative rounded-2xl border bg-white p-7 md:p-8 ${
        plan.featured
          ? 'border-[#1E3A5F] shadow-sm shadow-[#1E3A5F]/10'
          : 'border-slate-200'
      }`}
    >
      {plan.featured ? (
        <div className="absolute -top-3 left-6 rounded-full bg-[#0B1A2E] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white">
          Ongoing hiring
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0B1A2E]">{plan.name}</h2>
          <p className="mt-2 text-sm text-slate-600">{plan.description}</p>
        </div>
      </div>

      <div className="mt-6 flex items-end gap-2">
        <span className="text-4xl font-bold tracking-tight text-[#0B1A2E]">{plan.price}</span>
        <span className="pb-1 text-sm text-slate-500">{plan.cadence}</span>
      </div>

      <Button
        asChild
        className={`mt-7 w-full py-5 font-semibold ${
          plan.featured
            ? 'bg-[#0B1A2E] text-white hover:bg-[#1E3A5F]'
            : 'bg-white text-[#0B1A2E] border border-[#0B1A2E] hover:bg-slate-50'
        }`}
      >
        <Link href={plan.href}>
          {plan.cta}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>

      <div className="mt-7 border-t border-slate-100 pt-6">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Included</p>
        <ul className="mt-4 space-y-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm leading-5 text-slate-700">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

export default function EmployerPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pb-10 pt-16 text-center md:pt-20">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#B45309]">Employer pricing</p>
        <h1 className="mx-auto mt-4 max-w-4xl text-4xl font-bold tracking-tight text-[#0B1A2E] md:text-6xl">
          Post solar jobs on Solar Roles
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          Post one featured opening for $39, or manage ongoing hiring for $99 per month.
        </p>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-5xl scroll-mt-24 px-6 pb-16">
        <div className="grid gap-5 md:grid-cols-2">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
          <span>No placement fee</span>
          <span className="hidden sm:inline">·</span>
          <span>US solar roles only</span>
          <span className="hidden sm:inline">·</span>
          <span>Employer-posted jobs can accept direct applications</span>
        </div>
      </section>

      {/* Compare plans */}
      <section className="border-y border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Plan comparison</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#0B1A2E]">
              Featured Job or Hiring Partner
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              The difference is volume and workflow: one promoted opening versus an ongoing employer account with sync and reporting.
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="grid grid-cols-[1.25fr_1fr_1fr] border-b border-slate-200 bg-slate-50 text-sm">
              <div className="px-5 py-4 font-semibold text-slate-500">Feature</div>
              <div className="px-5 py-4 font-bold text-[#0B1A2E]">Featured Job</div>
              <div className="px-5 py-4 font-bold text-[#0B1A2E]">Hiring Partner</div>
            </div>

            <div className="divide-y divide-slate-100">
              {comparisonRows.map((row) => (
                <div key={row.label} className="grid grid-cols-[1.25fr_1fr_1fr] text-sm">
                  <div className="px-5 py-4 font-medium text-slate-700">{row.label}</div>
                  <div className="px-5 py-4 text-slate-600">{row.featured}</div>
                  <div className="px-5 py-4 text-slate-600">{row.partner}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What featured means */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Featured placement</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#0B1A2E]">
              What a featured job changes
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Featured jobs are given priority placement inside Solar Roles. The underlying job page remains a normal, indexable job listing with the same application flow.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <Search className="h-5 w-5 text-[#1E3A5F]" />
              <h3 className="mt-4 font-bold text-[#0B1A2E]">Search placement</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Featured openings receive priority placement in relevant Solar Roles search results.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <BriefcaseBusiness className="h-5 w-5 text-[#1E3A5F]" />
              <h3 className="mt-4 font-bold text-[#0B1A2E]">Featured label</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                The listing is marked as featured so candidates can distinguish promoted employer posts.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <ShieldCheck className="h-5 w-5 text-[#1E3A5F]" />
              <h3 className="mt-4 font-bold text-[#0B1A2E]">Direct application</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Employer-posted roles can collect applications directly through Solar Roles.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <Building2 className="h-5 w-5 text-[#1E3A5F]" />
              <h3 className="mt-4 font-bold text-[#0B1A2E]">Solar-only context</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Jobs are organized alongside solar-specific role, location and market-segment pages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hiring Partner */}
      <section className="border-y border-slate-200 bg-[#0B1A2E] py-16 text-white">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#F5B819]">Hiring Partner</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Keep recurring hiring in sync</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
              Hiring Partner is for employers whose openings change throughout the month. Solar Roles can use your ATS or careers page as the source instead of requiring every role to be recreated manually.
            </p>
            <Button asChild className="mt-7 bg-white text-[#0B1A2E] hover:bg-slate-100">
              <Link href="/dashboard/employer/new?plan=partner">
                Start Hiring Partner
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
              <RefreshCw className="h-5 w-5 text-[#F5B819]" />
              <p className="mt-4 text-2xl font-bold">10</p>
              <p className="mt-1 text-xs leading-5 text-slate-300">active jobs included</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
              <BriefcaseBusiness className="h-5 w-5 text-[#F5B819]" />
              <p className="mt-4 text-2xl font-bold">3</p>
              <p className="mt-1 text-xs leading-5 text-slate-300">featured jobs at a time</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
              <BarChart3 className="h-5 w-5 text-[#F5B819]" />
              <p className="mt-4 text-2xl font-bold">1</p>
              <p className="mt-1 text-xs leading-5 text-slate-300">employer account and analytics view</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Process</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#0B1A2E]">How employer posting works</h2>
        </div>

        <div className="mt-9 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="border-t border-slate-300 pt-5">
              <p className="text-xs font-bold text-slate-400">0{index + 1}</p>
              <h3 className="mt-3 text-lg font-bold text-[#0B1A2E]">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="border-y border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Scope</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#0B1A2E]">US solar and storage roles</h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Solar Roles is limited to legitimate US jobs connected to solar energy and adjacent battery-storage work.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {acceptedRoles.map((role) => (
                <span
                  key={role}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Search / structured data note */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <CircleDollarSign className="h-5 w-5 text-[#1E3A5F]" />
            <h2 className="mt-4 text-xl font-bold text-[#0B1A2E]">The price is fixed</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Featured Job is $39 for a 30-day listing. Hiring Partner is $99 per month. Solar Roles does not charge a placement fee when an employer makes a hire.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <Search className="h-5 w-5 text-[#1E3A5F]" />
            <h2 className="mt-4 text-xl font-bold text-[#0B1A2E]">Job pages are built for indexing</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Eligible employer listings use JobPosting structured data and indexable job URLs. Inclusion in Google for Jobs or other search products is determined by the search engine and is not guaranteed.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-200 py-16">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">FAQ</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#0B1A2E]">Employer pricing questions</h2>
          </div>

          <div className="mt-9 divide-y divide-slate-200 border-y border-slate-200">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-semibold text-[#0B1A2E]">
                  <span>{faq.question}</span>
                  <span className="text-xl font-normal text-slate-400 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 pr-10 text-sm leading-6 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Employer resources */}
      <section className="border-t border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Employer resources</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#0B1A2E]">Solar hiring data</h2>
            </div>
            <Link href="/data" className="text-sm font-semibold text-[#1E3A5F] hover:underline">
              View all market data
            </Link>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            <Link
              href="/data/salaries/solar-photovoltaic-installer"
              className="block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#B45309]">Salary data</span>
              <h3 className="mt-2 font-bold leading-6 text-[#0B1A2E]">Solar photovoltaic installer pay</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Review advertised pay data before setting compensation for an installer opening.</p>
            </Link>

            <Link
              href="/data"
              className="block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#B45309]">Hiring market</span>
              <h3 className="mt-2 font-bold leading-6 text-[#0B1A2E]">US solar hiring data</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Track active openings, employer participation, market segments and workforce signals.</p>
            </Link>

            <Link
              href="/jobs"
              className="block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#B45309]">Market check</span>
              <h3 className="mt-2 font-bold leading-6 text-[#0B1A2E]">Browse current solar jobs</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">See the titles, locations and employers currently competing for solar workers.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-7 md:flex md:items-center md:justify-between md:gap-8 md:p-9">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#0B1A2E]">Choose an employer plan</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              $39 for one featured 30-day post. $99/month for up to 10 active jobs and ongoing job sync.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row md:mt-0">
            <Button asChild variant="outline" className="border-[#0B1A2E] text-[#0B1A2E] hover:bg-slate-50">
              <Link href="/dashboard/employer/new?plan=featured">Featured Job — $39</Link>
            </Button>
            <Button asChild className="bg-[#0B1A2E] text-white hover:bg-[#1E3A5F]">
              <Link href="/dashboard/employer/new?plan=partner">Hiring Partner — $99/mo</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
