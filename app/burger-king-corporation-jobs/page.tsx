import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, Users, Award } from 'lucide-react'
import { searchJobs, getCachedJobCount, AdzunaSearchResult } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna

export const metadata: Metadata = {
  title: 'Burger King Corporation Jobs — Open Roles From Crew to GM Near You',
  description: 'Browse Burger King Corporation Jobs posted this week. Filter crew, kitchen, shift-lead, and management openings by zip code, pay range, and schedule — apply in minutes.',
  keywords: 'Burger King Corporation Jobs, BK crew member hiring, Burger King shift lead, QSR careers, fast food manager jobs, Burger King apply online, flame-grill jobs',
  openGraph: {
    title: 'Burger King Corporation Jobs: Crew to Management — All Shifts | Oh My Job',
    description: 'Find Burger King Corporation Jobs that fit your schedule. Entry-level and leadership openings with same-week start dates across thousands of US locations.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Burger King Corporation Jobs — New Listings Added Daily',
    description: 'Crew, cook, cashier, or GM — search live Burger King Corporation Jobs by location and shift preference. Many locations interview within 48 hours.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/burger-king-corporation-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Burger King Corporation Jobs Listings',
  description: 'Searchable directory of Burger King Corporation Jobs refreshed daily. Covers hourly crew positions through salaried district management across all fifty states.',
  url: 'https://www.oh-my-job.com/burger-king-corporation-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Current Burger King Corporation Job Openings',
    description: 'Real-time feed of Burger King Corporation Jobs at franchise and corporate-owned restaurants nationwide.',
  },
}

const popularRoles = [
  { title: 'Crew Member', description: 'Run the flame-broiler, assemble orders against the timer, and keep the dining room guest-ready — all while learning the operational rhythm that underpins every QSR career.', icon: Users },
  { title: 'Cashier', description: 'Own the front counter and drive-thru headset simultaneously, processing payment splits, coupon stacks, and mobile pick-ups without breaking the service-time target.', icon: Briefcase },
  { title: 'Cook / Broiler Operator', description: 'Manage the flame-grill line from raw patty to finished sandwich, hitting internal-temp standards and portioning condiments so every Whopper leaves the window identical.', icon: Award },
  { title: 'Shift Supervisor', description: 'Coordinate a crew of six to twelve across stations, authorize voids and refunds, run speed-of-service reports, and close the register with a balanced till.', icon: Shield },
  { title: 'Assistant Manager', description: 'Partner with the GM on weekly labor scheduling, food-cost variance reviews, and local store marketing while stepping in as acting manager on their days off.', icon: MapPin },
]

const benefits = [
  { title: 'Schedule-First Flexibility', description: 'Most franchise locations publish shifts two weeks out and accommodate swap requests, making it practical to hold a second job, attend classes, or manage childcare.' },
  { title: 'Free or Discounted Meals Every Shift', description: 'A complimentary crew meal per shift plus a standing employee discount on off-duty visits — a tangible daily savings that adds up to hundreds of dollars a year.' },
  { title: 'Paid Training From Day One', description: 'Clock in for every minute of onboarding. Training covers food safety certification, register operation, and broiler technique so you earn while you learn the ropes.' },
  { title: 'Visible Promotion Ladder', description: 'BK franchises fill the majority of supervisor and management seats internally. Crew members who demonstrate consistency often move to shift lead within six to twelve months.' },
  { title: 'Performance Bonuses & Referral Pay', description: 'Many operators run monthly contests tied to drive-thru speed or mystery-shopper scores, plus cash bonuses for every successful crew referral you bring in.' },
]

const faqs = [
  {
    question: 'Can I get hired at Burger King with zero work experience?',
    answer: 'Yes — and it happens constantly. Burger King Corporation Jobs at the crew level are designed as true entry points. Franchisees invest in structured onboarding precisely because they expect to train people from scratch. Showing up on time, staying composed during a lunch rush, and being coachable matter far more than a resume full of past jobs.',
  },
  {
    question: 'What does hourly pay actually look like for Burger King Corporation Jobs?',
    answer: 'Crew-level pay typically starts between $13 and $16 per hour depending on your state and metro area, with many high-cost markets already above $17. Shift leads generally earn $1.50-$3.00 more per hour than crew, and salaried managers at busy locations can reach $50K-$65K annually once quarterly bonuses are factored in.',
  },
  {
    question: 'How many Burger King locations are actively hiring right now?',
    answer: 'Burger King operates roughly 7,000 restaurants across the US, the vast majority franchise-owned. Because QSR turnover is naturally high, a significant share of these locations carry open requisitions at any given time — particularly for early-morning and late-night shifts that are harder to staff.',
  },
  {
    question: 'How quickly can I start working after I apply?',
    answer: 'The turnaround is one of the fastest in any industry. Many franchise managers conduct phone screens the same day an application lands, schedule a brief in-person meeting within 48 hours, and have new hires on the floor by the following week after a short orientation and food-safety module.',
  },
  {
    question: 'What benefits are available for part-time Burger King employees?',
    answer: 'Part-time crew typically receive meal discounts, flexible scheduling, and access to employee-assistance programs. Full-time associates at participating franchises can qualify for medical, dental, vision, and sometimes tuition-reimbursement or 401(k) contributions — though exact packages depend on the franchise group, not Burger King corporate directly.',
  },
]

const applicationTips = [
  {
    title: 'Walk In Between 2 and 4 PM',
    description: 'The post-lunch, pre-dinner window is when the shift manager is most likely to have five minutes for an on-the-spot conversation. Bring a printed resume even if you already applied online — it signals initiative.',
  },
  {
    title: 'Lead With Your Schedule, Not Your Story',
    description: 'Franchise operators fill shifts, not roles. Telling a manager "I can work opens Monday through Friday and any closing shift" is more compelling than a paragraph about your career goals.',
  },
  {
    title: 'Prepare for a Working Interview',
    description: 'Some locations ask finalists to shadow a short rush before making an offer. Wear closed-toe, non-slip shoes and tie back long hair — arriving ready to jump on the line makes an immediate impression.',
  },
  {
    title: 'Follow Up by Phone, Not Email',
    description: 'Restaurant managers rarely check email between rushes. A polite 30-second call the next business day keeps your name at the top of the pile and shows you understand how the industry communicates.',
  },
]

export default async function BurgerKingCorporationJobsPage(props: {
  searchParams: Promise<{
    what?: string
    where?: string
    salary_min?: string   // ← uniquement string | undefined (natif Next.js)
  }>
}) {
  const params = await props.searchParams

  // 2. Conversion parseInt sécurisée UNIQUEMENT pour getCachedJobCount
  let salaryMinNum: number | undefined = undefined
  if (params.salary_min) {
    const parsed = Number.parseInt(params.salary_min, 10)
    salaryMinNum = Number.isNaN(parsed) ? undefined : parsed
  }

 const [{ count }, initialData] = await Promise.all([
  getMergedJobCount(params.what || 'Burger-king-corporation-jobs', params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
  searchMergedJobs({ what: params.what || 'Burger-king-corporation-jobs', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
])

  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Simple Header */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Burger King Corporation Jobs — Crew, Kitchen & Management Openings Across the US
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="burger-king-corporation-jobs" />
          </aside>
          <div className="flex-1">
            {count > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">{count.toLocaleString()}</span> positions available
              </p>
            )}

            <AIJobMatcherWrapper />

            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'burger-king-corporation-jobs'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Popular Roles */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Roles You Will Find in Burger King Corporation Jobs Listings</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            A single Burger King restaurant runs on five to six distinct positions, each with its own skill track. Understanding what each role actually involves day to day helps you target the opening that matches your current ability and the growth direction you want — rather than applying blind and hoping the manager slots you somewhere.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularRoles.map((role, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <role.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Salary Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">What Burger King Corporation Jobs Pay in Practice</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              Hourly rates for Burger King Corporation Jobs are set by each franchise operator, not by BK corporate, which means pay can swing several dollars per hour between a rural location and a downtown restaurant ten miles away. The numbers below reflect national medians drawn from federal labor data — use them as a baseline, then check the specific listing for your zip code to see where a given franchise falls on the range.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">$14 – $17</p>
                <p className="text-sm text-gray-600">Crew Hourly Range (BLS median)</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-blue-600 mb-2">$50K – $65K</p>
                <p className="text-sm text-gray-600">GM Salary (incl. quarterly bonus)</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-purple-600 mb-2">+ Meal Perk</p>
                <p className="text-sm text-gray-600">Free shift meal at most locations</p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">What You Get Beyond the Paycheck at Burger King</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Pay is only part of the equation. The real draw for many people exploring Burger King Corporation Jobs is the combination of schedule control, zero-cost skill building, and a promotion timeline that moves faster than almost any other industry. Here is what to expect once you are on the team.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Application Tips */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">How to Actually Get Hired — Not Just Apply</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Submitting an online application for Burger King Corporation Jobs takes two minutes. Getting a callback takes strategy. Franchise managers sift through dozens of applications a week — these four moves put yours near the top of the stack.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {applicationTips.map((tip, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-700 font-bold rounded-full text-sm mb-4">
                  {index + 1}
                </span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{tip.title}</h3>
                <p className="text-gray-600 text-sm">{tip.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Burger King Corporation Jobs — Questions People Actually Ask</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Before you hit "submit" on that application, here are straight answers to the five questions we see most often from people researching Burger King Corporation Jobs for the first time.
          </p>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group bg-white border border-gray-200 rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                  <h3 className="font-semibold text-gray-900 pr-4">{faq.question}</h3>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Legal Disclaimer */}
        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> Oh My Job is an independent job search platform with no corporate affiliation to Burger King Corporation, Restaurant Brands International, or any individual BK franchise operator. Listings shown on this page are sourced from publicly available job feeds and third-party data providers. All hiring decisions, compensation packages, benefit eligibility, and scheduling terms are determined exclusively by the local franchise or corporate restaurant extending the offer. Verify every detail directly with the hiring location before accepting employment.
          </p>
        </section>
      </div>
    </>
  )
}