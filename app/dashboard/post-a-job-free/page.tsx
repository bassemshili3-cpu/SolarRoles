import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

import {
  Zap, Users, BarChart3, DollarSign, Globe2, Sparkles, Clock, ShieldCheck
} from 'lucide-react'

const CANONICAL_URL = 'https://solarroles.com/employers/post-a-job'

export const metadata: Metadata = {
  title: 'Post a Solar Job for Free — No Credit Card, No Subscription | Solar Roles',
  description:
    'Post a solar job for free on Solar Roles and reach thousands of US solar installers, from apprentices to NABCEP-certified leads. No credit card. No subscription. Your listing goes live in minutes.',
  keywords: [
    'post a solar job',
    'solar job posting',
    'hire solar installers',
    'solar installer jobs',
    'solar hiring',
    'solar EPC hiring',
    'solar company hiring',
    'solar installer recruitment',
    'NABCEP installer jobs',
    'solar PV installer hiring',
    'free solar job board',
    'battery storage installer jobs',
  ],
  alternates: {
    canonical: CANONICAL_URL,
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Post a Solar Job for Free — No Credit Card | Solar Roles',
    description:
      'Reach thousands of active US solar installers. Post a job for free on Solar Roles — no credit card, no subscription, live in minutes.',
    url: CANONICAL_URL,
    siteName: 'Solar Roles',
    type: 'website',
    images: [
      {
        url: 'https://solarroles.com/og-employer.png',
        width: 1200,
        height: 630,
        alt: 'Post a solar job for free on Solar Roles',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Post a Solar Job for Free — No Credit Card | Solar Roles',
    description:
      'Reach thousands of active US solar installers. Post a job for free with no subscription.',
  },
}

const steps = [
  {
    title: 'Create your free employer account',
    description:
      'Sign up with your work email in under a minute. Tell us if you’re a residential installer, commercial EPC, or O&M company so we can route candidates to the right roles.',
  },
  {
    title: 'Post your job in five minutes',
    description:
      'Add the title, NABCEP level required, location, pay range, and a description. Tag it as residential, commercial, battery storage, or utility-scale so it lands in front of the right installers.',
  },
  {
    title: 'Track applications in real time',
    description:
      'Keep track of key statistics from your employer dashboard as installers apply. Filter by certification level, years of experience, and willingness to travel.',
  },
]

const benefits = [
  {
    icon: DollarSign,
    title: '100% free, no surprises',
    description:
      'Post as many solar roles as you want, for as long as the position is open. No pay-per-post, no recruiter cut, no sponsored-only visibility traps.',
  },
  {
    icon: Users,
    title: 'Reach installers other boards miss',
    description:
      'Our audience is solar-only: apprentices, journeymen, NABCEP-certified leads, and electricians crossing into PV. Not random job seekers, not residential sales reps.',
  },
  {
    icon: BarChart3,
    title: 'Track every click and application',
    description:
      'See how each posting performs from a clean dashboard. Compare roles, regions, and certification requirements side by side.',
  },
  {
    icon: Zap,
    title: 'Live in minutes, indexed in hours',
    description:
      'No approval queue. Your solar job goes live the moment you publish it and shows up on Google and Bing within hours.',
  },
]

const audiences = [
  { title: 'Residential solar installers', desc: 'Regional and national rooftop solar companies hiring installers, sales reps, and site assessors.' },
  { title: 'Commercial EPCs', desc: 'Engineering, procurement, and construction firms running commercial and industrial solar projects.' },
  { title: 'Utility-scale developers', desc: 'Large-scale solar farm developers hiring foremen, electricians, and project managers for multi-MW builds.' },
  { title: 'Battery storage companies', desc: 'Residential and commercial battery installation teams — Tesla Powerwall, Enphase, Franklin, and beyond.' },
  { title: 'Solar O&M providers', desc: 'Operations and maintenance companies staffing service techs, performance analysts, and truck rolls.' },
  { title: 'Solar recruiting agencies', desc: 'Specialized solar recruiters managing multiple client listings from a single dashboard.' },
]

const jobTypes = [
  'Full-time', 'Part-time', 'Contract', 'Apprenticeship',
  'Travel Crew', 'Remote', 'Hybrid', 'Entry level',
]

const faqs = [
  { question: 'Is it really free to post a solar job on Solar Roles?', answer: 'Yes. Posting a solar job is completely free, with no credit card, no subscription, and no hidden fees. You can post as many listings as you want and only pay if you choose to upgrade to a sponsored post later.' },
  { question: 'How long does my solar job listing stay active?', answer: 'Each listing stays live for 30 days. You can repost it anytime from your employer dashboard, or set it to auto-repost while the role is still open.' },
  { question: 'Do I need an account to post a solar job?', answer: 'Yes. You need a free employer account to post, edit, and track your jobs. Signing up takes about a minute and you can post your first role right after.' },
  { question: 'Can I edit or remove my solar job listing after posting it?', answer: 'Yes. You can edit, pause, or remove any of your listings anytime from your employer dashboard. Changes go live immediately.' },
  { question: 'What kinds of solar jobs can I post?', answer: 'You can post any legitimate US solar role — PV installer, lead installer, NABCEP-certified, apprentice, solar electrician, service tech, project manager, solar designer, solar sales. The platform works especially well for full-time residential, commercial, and utility-scale roles.' },
  { question: 'Is Solar Roles a good fit for small solar companies?', answer: 'Yes. Most of our employers are small and mid-size solar companies — regional installers, family-run EPCs, and growing O&M providers. You do not need a careers page, an in-house recruiter, or a hiring budget to get started.' },
  { question: 'Where will my solar job listing appear?', answer: 'Your job shows up on Solar Roles, in our role and state pages, in search engine results through Google and Bing, and in our weekly Solar Pulse newsletter to active solar job seekers across the US.' },
  { question: 'How is Solar Roles different from Indeed, LinkedIn, or ZipRecruiter for solar hiring?', answer: 'Indeed, LinkedIn, and ZipRecruiter are general-purpose boards where solar roles compete with every other job. Solar Roles is solar-only — our audience is actively searching for PV installer, solar electrician, and battery storage roles, not generic sales positions. We don’t charge per posting and we don’t hide listings behind a paywall.' },
  { question: 'How long does it take for my solar job to go live?', answer: 'Your job is live within minutes of posting. There is no approval queue and no waiting period. It usually shows up on Google and Bing within a few hours.' },
  { question: 'Do you offer sponsored or featured solar job listings?', answer: 'Yes, but only as an option. Every job gets equal visibility by default. Employers who want more reach can promote a single listing to the top of search results and category pages.' },
]

export default function EmployerPage() {
  return (
    <div>
      {/* Structured data: FAQ + Service + Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: { '@type': 'Answer', text: faq.answer },
              })),
            },
            {
              '@context': 'https://schema.org',
              '@type': 'Service',
              serviceType: 'Free Solar Job Posting',
              provider: {
                '@type': 'Organization',
                name: 'Solar Roles',
                url: 'https://solarroles.com',
              },
              areaServed: { '@type': 'Country', name: 'United States' },
              description: 'Post a solar job for free on Solar Roles and reach thousands of active US solar installers.',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
              },
            },
          ]),
        }}
      />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-[#B45309] mb-5">
          <Sparkles className="w-3.5 h-3.5" />
          No credit card
        </span>
        <h1 className="text-5xl md:text-6xl font-bold text-[#0B1A2E] mb-6 tracking-tighter leading-[1.05]">
          Post a solar job for free on Solar Roles
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          Reach the US solar workforce — from apprentices to NABCEP-certified leads. Our audience is solar-only: PV installers, solar electricians, and battery storage techs actively looking for their next role.
        </p>
        <Button
          size="lg"
          asChild
          className="px-8 py-6 text-lg font-semibold bg-[#0B1A2E] hover:bg-[#1E3A5F] text-white"
        >
          <Link href="/dashboard/employer/new">Post a solar job</Link>
        </Button>
      </section>

      {/* Google for Jobs structured data */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-br from-[#F5B819]/10 to-white border border-[#F5B819]/30 rounded-3xl p-8 md:p-12 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-[#B45309] mb-4">
            <Globe2 className="w-3.5 h-3.5" />
            Structured for Google for Jobs
          </span>
          <h2 className="text-3xl font-bold text-[#0B1A2E] mb-4 tracking-tight">
            Your listing is built to Google’s job search standard
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Every job posted on Solar Roles is automatically formatted with Google’s official job posting markup — so your solar roles show up in front of installers searching Google for their next gig.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 text-left max-w-3xl mx-auto">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-sm font-semibold text-[#0B1A2E] mb-1">Automatic</p>
              <p className="text-xs text-muted-foreground">Structured data added so your listing appears on Google Jobs the moment you publish.</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-sm font-semibold text-[#0B1A2E] mb-1">Solar-specific fields</p>
              <p className="text-xs text-muted-foreground">NABCEP level, OSHA, residential vs commercial, battery storage, travel required — all indexable.</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-sm font-semibold text-[#0B1A2E] mb-1">SEO-optimized</p>
              <p className="text-xs text-muted-foreground">Each listing is built to rank for “solar installer jobs in [state]” type queries.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-[#0B1A2E] mb-3 text-center tracking-tight">
          How posting a solar job works
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
          Three steps from sign up to your first installer application.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={step.title} className="text-center">
              <div className="w-10 h-10 rounded-full bg-[#1E3A5F]/10 text-[#1E3A5F] font-bold flex items-center justify-center mx-auto mb-4">
                {i + 1}
              </div>
              <h3 className="text-lg font-semibold text-[#0B1A2E] mb-2">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#0B1A2E] mb-3 text-center tracking-tight">
            Why solar employers post on Solar Roles
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Built for solar hiring teams that want to fill roles without paying per posting.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-white rounded-2xl p-6 border border-gray-100">
                <benefit.icon className="text-[#1E3A5F] mb-3" size={24} />
                <h3 className="text-lg font-semibold text-[#0B1A2E] mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who posts with us */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-[#0B1A2E] mb-3 text-center tracking-tight">
          Built for any solar employer
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {audiences.map((item) => (
            <div key={item.title} className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#1E3A5F]/25 transition-colors">
              <h3 className="text-base font-semibold text-[#0B1A2E] mb-1.5">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Solar job types you can post for free:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {jobTypes.map((type) => (
              <span key={type} className="text-xs font-medium text-[#0B1A2E] bg-white border border-gray-200 rounded-full px-3 py-1.5">
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="max-w-5xl mx-auto px-6 py-10">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-center gap-6">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#1E3A5F]/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#1E3A5F]" />
            </div>
            <div>
              <p className="font-semibold text-[#0B1A2E] text-sm">No off-trade applicants</p>
              <p className="text-xs text-muted-foreground">We screen for duplicate applications and generic SEO résumés. You get solar installers, not random job seekers.</p>
            </div>
          </div>
          <div className="hidden md:block w-px h-12 bg-gray-200" />
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#1E3A5F]/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#1E3A5F]" />
            </div>
            <div>
              <p className="font-semibold text-[#0B1A2E] text-sm">Time to first installer application</p>
              <p className="text-xs text-muted-foreground">Less than 72 hours for most entry level and journeyman roles.</p>
            </div>
          </div>
          <div className="hidden md:block w-px h-12 bg-gray-200" />
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#1E3A5F]/10 flex items-center justify-center">
              <Globe2 className="w-5 h-5 text-[#1E3A5F]" />
            </div>
            <div>
              <p className="font-semibold text-[#0B1A2E] text-sm">US-wide reach</p>
              <p className="text-xs text-muted-foreground">Indexed on Google, Bing, and our weekly Solar Pulse newsletter.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-[#0B1A2E] mb-3 text-center tracking-tight">
          Frequently asked questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details key={faq.question} className="bg-white border border-gray-100 rounded-2xl p-6 group">
              <summary className="font-semibold text-[#0B1A2E] cursor-pointer list-none flex justify-between items-center">
                {faq.question}
                <span className="text-[#B45309] group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <p className="text-muted-foreground mt-3 leading-relaxed">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Related content */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-[#0B1A2E] mb-6 text-center tracking-tight">
          Resources for solar employers
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/blog/solar-installer-salary-2026" className="block bg-white border border-gray-100 rounded-2xl p-5 hover:border-[#1E3A5F]/25 transition-colors">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#B45309]">Salary Insights</span>
            <h3 className="text-base font-semibold text-[#0B1A2E] mt-2 mb-1.5 leading-snug">What PV installers actually earn in 2026.</h3>
            <p className="text-sm text-muted-foreground">Real salary data by state, certification level, and residential vs commercial — so you can offer competitive pay.</p>
          </Link>
          <Link href="/blog/solar-apprenticeship-guide" className="block bg-white border border-gray-100 rounded-2xl p-5 hover:border-[#1E3A5F]/25 transition-colors">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#B45309]">Hiring Playbook</span>
            <h3 className="text-base font-semibold text-[#0B1A2E] mt-2 mb-1.5 leading-snug">How to structure a solar apprenticeship that doesn’t lose people in week 3.</h3>
            <p className="text-sm text-muted-foreground">The retention playbook used by the residential installers with the lowest first-90-day turnover.</p>
          </Link>
          <Link href="/data" className="block bg-white border border-gray-100 rounded-2xl p-5 hover:border-[#1E3A5F]/25 transition-colors">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#B45309]">Market Data</span>
            <h3 className="text-base font-semibold text-[#0B1A2E] mt-2 mb-1.5 leading-snug">See where solar demand is spiking in your state.</h3>
            <p className="text-sm text-muted-foreground">Browse active solar listings by state, title, and salary to understand local installer competition.</p>
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-[#0B1A2E] mb-4 tracking-tight">Ready to hire installers?</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Your next great solar hire is one free job post away.</p>
        <Button size="lg" asChild className="bg-[#0B1A2E] hover:bg-[#1E3A5F] text-white">
          <Link href="/dashboard/employer/new">Post a solar job for free</Link>
        </Button>
      </section>
    </div>
  )
}