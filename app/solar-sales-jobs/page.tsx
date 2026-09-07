import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import { Phone, Home, DollarSign, ShieldCheck, Award, Users, TrendingUp, Scale } from 'lucide-react'
import { getJobs } from '@/lib/getJobs'
import Link from 'next/link'
import { formatSalaryK, getRoleSalaryStats, MIN_SALARY_LISTINGS } from '@/lib/roleSalary'
import { getLandingCanonical, getLandingJobCount, getLandingPageNumber, withLandingJobCount } from '@/lib/landingJobTitle'


export const revalidate = 3600

const SALES_LANDING_FILTERS = {
  descriptionContainsAny: ['solar sales', 'sales representative', 'sales consultant', 'sales engineer', 'account executive', 'door to door', 'd2d'],
  requiredDomainTerms: ['sales', 'Sales'],
}

export async function generateMetadata({ searchParams }: any): Promise<Metadata> {
  const params = await searchParams
  const [stats, jobCount] = await Promise.all([
    getRoleSalaryStats('solar-sales-representative'),
    getLandingJobCount(SALES_LANDING_FILTERS),
  ])
  const salarySuffix =
    stats && stats.count >= MIN_SALARY_LISTINGS && stats.avgMax > 0
      ? ` — Up to ${formatSalaryK(stats.avgMax)}/yr`
      : ''

  return {
    title: withLandingJobCount(
      salarySuffix
        ? `Solar Sales Jobs${salarySuffix}`
        : 'Solar Sales Jobs | D2D, In-Home & Technical Sales Openings',
      jobCount,
    ),
    description: 'Solar sales positions across the United States, door-to-door, in-home, inside sales, and technical sales roles. Commission structures, what employers screen for, and realistic pay ranges.',
    keywords: 'solar sales jobs, solar sales rep jobs, door to door solar sales, in home solar sales, solar sales consultant, solar technical sales, solar sales engineer jobs',
    openGraph: {
      title: 'Solar Sales Jobs | Now Hiring Nationwide',
      description: 'Browse open solar sales positions, D2D, in-home, inside sales, and technical sales roles with commission structures explained.',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Solar Sales Jobs',
      description: 'Find solar sales openings across the US. D2D, in-home, inside sales, and technical sales employers hiring now.',
    },
    alternates: { canonical: getLandingCanonical('https://www.solarroles.com/solar-sales-jobs', params) },
  }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Solar Sales Jobs',
  description: 'Solar sales job listings across the United States, covering door-to-door, in-home, inside sales, and technical sales roles.',
  url: 'https://www.solarroles.com/solar-sales-jobs',
}

const salesRoles = [
  {
    title: 'Door-to-Door (D2D) Sales Rep',
    description: "D2D reps canvass a territory and track visits in an app. They generate their own leads and may close at the door. Commission creates the highest ceiling on this list, along with the highest turnover.",
    icon: Phone,
  },
  {
    title: 'In-Home Sales Consultant',
    description: "In-home consultants run the sales appointment and explain the system design. They also present financing and close the contract. A setter or marketing team usually supplies the lead.",
    icon: Home,
  },
  {
    title: 'Inside Sales / Call Center Rep',
    description: "Inside-sales reps work leads by phone. They book appointments or close smaller deals remotely. The ceiling is lower than field sales, but hours are steadier and entry is easier.",
    icon: Phone,
  },
  {
    title: 'Solar Sales Engineer / Technical Sales',
    description: "Technical sales pairs selling with system design. Reps size systems and explain production estimates. They also answer objections that a generalist would escalate. NABCEP PV Technical Sales appears in this track.",
    icon: Award,
  },
  {
    title: 'Channel / Partner Sales Manager',
    description: "Manages relationships with roofing companies, electricians, or other contractors who refer solar leads. A common step up after a few years closing deals individually.",
    icon: Users,
  },
]

const faqs = [
  {
    question: 'Is solar sales all commission, or is there a base salary?',
    answer: "Most postings combine modest base pay with commission. The split varies by employer and sales channel. Pure-commission plans appear most often in D2D work. In-home and inside-sales roles are more likely to include a salary.",
  },
  {
    question: 'How much can top performers earn?',
    answer: "Top D2D and in-home reps can clear $100,000 to $150,000+ in strong markets. Commission is often paid per watt or system. Median performers earn much less, leaving a wide gap between typical and top pay.",
  },
  {
    question: 'Do you need a license to sell solar?',
    answer: "It depends on the state. Some require a home-improvement or contractor-sales license for D2D and in-home work. Discussing financing may trigger another license. Check the rules where you plan to sell.",
  },
  {
    question: "What's the difference between D2D and in-home sales?",
    answer: "D2D reps generate leads by knocking doors. They may close immediately or book a follow-up. In-home consultants usually receive qualified appointments and focus on the sale. D2D offers a higher ceiling with more volatility. In-home work is steadier.",
  },
  {
    question: 'Do you need technical solar knowledge to get hired?',
    answer: "Most entry-level roles provide training in system basics, financing and objections. Technical sales is different. Sales engineers need design knowledge from the first day.",
  },
  {
    question: 'Is solar sales a good way to break into the industry with no experience?',
    answer: "Solar sales is an accessible entry point. Many companies hire for sales ability and teach the technical material. Installation follows a different track. Moving from sales into field work usually requires additional training.",
  },
]

export default async function SolarSalesJobsPage({ searchParams }: any) {
  const params = await searchParams
  const page = getLandingPageNumber(params.page)

  const initialData = await getJobs({
    // Scopes this landing page to sales roles via a keyword AND-filter,
    // independent of the user's own `what` search box below — same
    // pattern used on /lead-solar-installer-jobs and
    // /solar-jobs-no-experience.
    ...SALES_LANDING_FILTERS,
    ...(params.what ? { what: params.what } : {}),
    where: params.where || '',
    page,
    resultsPerPage: 30,
    salaryMin: params.salary_min ? Number(params.salary_min) : undefined,
    postedWithin: params.posted_within ? Number(params.posted_within) : undefined,
    jobTypes: params.job_type ? params.job_type.split(',') : undefined,
    arrangements: params.arrangement ? params.arrangement.split(',') : undefined,
    experience: params.experience || undefined,
    education: params.education || undefined,
    companySizes: params.company_size ? params.company_size.split(',') : undefined,
    benefits: params.benefits ? params.benefits.split(',') : undefined,
    easyApply: params.easy_apply === 'true',
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Solar Sales Jobs</h1>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">

          <aside className="lg:w-80"><JobFilters /></aside>
          <div className="flex-1">
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || ''}
                searchLabel="solar sales "
                where={params.where || ''}
                salary_min={params.salary_min}
                    descriptionContainsAny= {['solar sales', 'sales representative', 'sales consultant', 'sales engineer', 'account executive', 'door to door', 'd2d']}
    requiredDomainTerms= {['sales', 'Sales']}
                initialData={initialData}
                initialPage={page}
                landingPageSeo
                whatJobsTitleIncludesAll={['solar', 'sales']}
              />
            </Suspense>
          </div>
        </div>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><Phone className="w-7 h-7 text-orange-500" /><h2 className="text-2xl font-bold text-gray-900">Types of Solar Sales Roles</h2></div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Solar-sales roles use different workflows and pay structures. Lead
            source changes almost everything. A self-generated door lead is
            different from a setter handoff or inbound inquiry.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {salesRoles.map((role, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <role.icon className="w-10 h-10 text-orange-500 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><ShieldCheck className="w-7 h-7 text-blue-600" /><h2 className="text-2xl font-bold text-gray-900">What These Roles Actually Require</h2></div>
          <p className="text-gray-600 mb-4 max-w-4xl">
            Most solar-sales postings do not require technical experience. They
            screen for sales ability and resilience during cold outreach.
            Candidates must also explain loans, leases or PPAs. Companies
            usually teach the technical material during onboarding.
          </p>
          <p className="text-gray-600 max-w-4xl">
            Technical sales is the exception. These roles expect system-design
            knowledge from the start, and NABCEP PV Technical Sales can help.
            Some states also license home-improvement or contractor sales.
            Check local rules before accepting a D2D or in-home role.
          </p>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><DollarSign className="w-7 h-7 text-green-600" /><h2 className="text-2xl font-bold text-gray-900">Solar Sales Pay & Commission</h2></div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            BLS does not track solar sales as a separate occupation. The ranges
            below come from industry postings and should be treated as
            directional. Company, region and lead source create wide variation.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-5 text-center border border-gray-200">
              <p className="text-3xl font-bold text-green-600 mb-2">$40-60K</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">Inside Sales / New Reps</p>
              <p className="text-xs text-gray-500">Base + commission, first year typical</p>
            </div>
            <div className="bg-white rounded-xl p-5 text-center border border-gray-200">
              <p className="text-3xl font-bold text-blue-600 mb-2">$70-100K</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">Established D2D / In-Home Reps</p>
              <p className="text-xs text-gray-500">Consistent closer, steady lead flow</p>
            </div>
            <div className="bg-white rounded-xl p-5 text-center border border-gray-200">
              <p className="text-3xl font-bold text-purple-600 mb-2">$100-150K+</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">Top Performers</p>
              <p className="text-xs text-gray-500">Strong markets, high close rate</p>
            </div>
          </div>
        </section>

<section className="mt-20">
  <div className="flex items-center gap-3 mb-6"><Scale className="w-7 h-7 text-green-600" /><h2 className="text-2xl font-bold text-gray-900">1099 vs. W2: Which Pay Structure Fits You</h2></div>
  <p className="text-gray-600 mb-4 max-w-4xl">
    A 1099 rep usually works on commission and handles their own taxes. The
    schedule may be flexible, but benefits and guaranteed pay are absent. A W2
    employee receives payroll withholding and may get benefits. Base pay lowers
    risk, though commission ceilings and schedule control are often reduced.
  </p>
  <p className="text-gray-600 max-w-4xl">
    Choose based on the income volatility you can absorb and the value of
    benefits to you. Our guide covers taxes and the practical differences. It
    also shows how to identify the structure in a posting:{' '}
    <a href="/resources/solar-sales-1099-vs-w2-pay" className="text-green-700 font-semibold underline hover:text-green-800">
      1099 vs. W2 solar sales pay guide
    </a>.
  </p>
</section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><TrendingUp className="w-7 h-7 text-orange-500" /><h2 className="text-2xl font-bold text-gray-900">Job Outlook</h2></div>
          <p className="text-gray-600 max-w-4xl">
            BLS projects 42% growth for PV installers from 2024 to 2034. Sales
            is a different occupation, but new installation volume begins with
            closed contracts. Sales hiring tends to follow that growth.
          </p>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><Award className="w-7 h-7 text-blue-600" /><h2 className="text-2xl font-bold text-gray-900">Solar Sales Job FAQ</h2></div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group bg-white border border-gray-200 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                  <h3 className="font-semibold text-gray-900 pr-4">{faq.question}</h3>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-20 bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Related Roles &amp; Resources</h2>
          <p className="text-gray-600 max-w-3xl mx-auto mb-6">
            Solar-sales compensation differs from field pay. Compare structures
            in our{' '}
            <Link href="/resources/solar-sales-1099-vs-w2-pay" className="text-blue-700 underline hover:text-blue-900">1099 vs W-2 solar sales pay guide</Link>.
            Then check the numbers on the{' '}
            <Link href="/data/salaries/solar-sales-representative" className="text-blue-700 underline hover:text-blue-900">Solar Sales Representative salary page</Link>.
            Prefer technical work? Explore{' '}
            <Link href="/solar-technician-jobs" className="text-blue-700 underline hover:text-blue-900">solar technician jobs</Link>{' '}
            or{' '}
            <Link href="/solar-engineer-jobs" className="text-blue-700 underline hover:text-blue-900">solar engineer jobs</Link>.
          </p>
        </section>

        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> Pay ranges reflect figures in industry
            postings. Solar sales is not a distinct BLS category. Compensation
            depends on the employer, lead source and region. Individual
            performance also matters. Verify licensing with your state.
          </p>
        </section>
      </div>
    </>
  )
}
