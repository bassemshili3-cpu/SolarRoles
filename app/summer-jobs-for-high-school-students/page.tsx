import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
import { Briefcase, Clock, DollarSign, Star, CheckCircle, BookOpen } from 'lucide-react'

export const revalidate = 3600

const KEYWORDS = [
  'summer jobs high school',
  'summer teen jobs',
  'summer jobs 16 year old',
  'summer jobs 17 year old',
]

export const metadata: Metadata = {
  title: 'Summer Jobs for High School Students | Oh My Job',
  description: 'Find summer jobs for high school students — retail, food service, camps, tutoring, and more. No experience required for most roles. Browse openings near you.',
  keywords: 'summer jobs for high school students, summer jobs for teens, summer jobs 16 year old, summer jobs 17 year old, teen summer employment',
  alternates: { canonical: 'https://www.oh-my-job.com/summer-jobs-for-high-school-students' },
  openGraph: {
    title: 'Summer Jobs for High School Students | Oh My Job',
    description: 'Retail, food service, camps, lifeguarding, and more. Most roles require no prior experience.',
    type: 'website',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Summer Jobs for High School Students',
  description: 'Browse summer job listings for high school students across the United States.',
  url: 'https://www.oh-my-job.com/summer-jobs-for-high-school-students',
}

const jobTypes = [
  {
    icon: Star,
    title: 'Retail & Customer Service',
    description: 'Cashier, sales associate, and stock roles at grocery stores, clothing retailers, and big-box stores. Most hire at 16. Hours are flexible and schedules can work around summer plans. Good first job if you want structured shifts and a steady paycheck.',
  },
  {
    icon: Briefcase,
    title: 'Food Service',
    description: 'Fast food, cafés, and casual dining restaurants hire heavily in summer. Host, busser, and crew member roles typically start at 16, some at 15. Expect fast-paced shifts and tips if front-of-house. Managers often promote quickly when reliable workers show up consistently.',
  },
  {
    icon: BookOpen,
    title: 'Camps & Recreation',
    description: 'Day camps, sports camps, and park district programs hire counselors and program assistants through summer. Many roles accept 16-year-olds. Work is outdoors, schedule aligns with camp sessions, and you get genuine leadership experience that looks good on college applications.',
  },
  {
    icon: CheckCircle,
    title: 'Tutoring & Teaching Assistance',
    description: 'If you did well in a subject, local tutoring centers and summer school programs often hire high schoolers as peer tutors or teaching assistants. Typically pays above minimum wage and builds a different kind of experience than retail or food service.',
  },
  {
    icon: Clock,
    title: 'Delivery & Logistics',
    description: 'Warehouse associates, package handlers, and grocery delivery assistants. Most roles require 18, but some warehouse and stocking positions hire at 16 or 17 with parental consent. Physical work, often early morning or evening shifts, solid hourly rates.',
  },
  {
    icon: DollarSign,
    title: 'Landscaping & Outdoor Work',
    description: 'Lawn care, nurseries, and park maintenance crews hire seasonally. Most accept 16-year-olds. Work is physical and outside. If you can handle early starts and summer heat, these jobs pay competitively and often lead to repeat employment the following year.',
  },
]

const tips = [
  {
    title: 'Get your working papers sorted first',
    description: 'Most states require a work permit for anyone under 16, and some require them up to 18. Your school guidance office or local labor department website will have the form. Some employers won\'t schedule an interview until you can show the permit — handle it before you start applying.',
  },
  {
    title: 'Apply in March and April, not June',
    description: 'The best summer jobs fill before school ends. Retailers and camps start hiring in spring for summer shifts. If you wait until school is out, the good slots are gone and you\'re competing for what\'s left.',
  },
  {
    title: 'Ask your network before you apply online',
    description: 'A referral from someone who already works there is worth ten cold applications. Tell your neighbors, relatives, and coaches you\'re looking. Most first jobs for teenagers come through someone who knows someone.',
  },
  {
    title: 'Be specific about your availability',
    description: 'Employers hiring teens ask about summer availability upfront. Know exactly which weeks you\'re free and which you have commitments. A clear, reliable schedule is more valuable to a manager than flexibility that turns into last-minute cancellations.',
  },
]

const faqs = [
  {
    question: 'How old do I need to be to get a summer job?',
    answer: 'Most employers hire at 16 without restrictions. At 14 and 15, federal law limits the hours and types of work you can do — no hazardous jobs, limited evening hours during the school year. A few roles (lifeguarding, tutoring, babysitting) hire at 14 or 15 with fewer restrictions since they\'re not traditional employment.',
  },
  {
    question: 'Do I need a resume for a first job?',
    answer: 'Not always, but having one helps. A one-page document listing your school, any extracurriculars, volunteer work, and two references (a teacher and a neighbor or coach) is enough. Many employers for entry-level teen roles just want to see you\'re organized and showed up prepared.',
  },
  {
    question: 'How many hours can I work at 16?',
    answer: 'Federal law doesn\'t restrict hours for 16 and 17-year-olds outside of school periods. Your state may have its own rules — some cap hours or require rest breaks. Once school is out for summer, most 16-year-olds can work the same hours as adults in non-hazardous roles.',
  },
  {
    question: 'What should I expect to earn?',
    answer: 'Most entry-level teen jobs start at minimum wage, which varies by state from around $8 to $17 per hour. Customer-facing roles with tips (bussing tables, barista work) can push total hourly earnings significantly higher. Skilled seasonal work like lifeguarding often pays above minimum wage from day one.',
  },
  {
    question: 'What if I have no work experience at all?',
    answer: 'Everyone starts somewhere. Focus on roles that explicitly say "no experience required" or "will train." Show up on time to the interview, dress neatly, and be honest about what you can do. For a first job, attitude and reliability matter more to most managers than experience.',
  },
]

export default async function SummerJobsHighSchoolPage({ searchParams }: any) {
  const params = await searchParams

  const whatQuery = params.what || KEYWORDS

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'summer jobs high school', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'summer jobs high school', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* ── Header ── */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Summer Jobs for High School Students
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Most of these roles require no prior experience. Retail, food service, camps, and outdoor work all hire heavily in summer — and most start accepting applications months before school ends.
          </p>
        </header>

        {/* ── Job List ── */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="summer jobs high school" />
          </aside>
          <div className="flex-1">
            
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'summer jobs high school'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData}
              />
            </Suspense>
          </div>
        </div>

        {/* ── Job Types ── */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Types of Summer Jobs That Hire Teens</h2>
          <p className="text-gray-600 mb-8 max-w-2xl">
            Some industries hire teenagers far more reliably than others. These are the ones worth focusing on.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobTypes.map((type, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <type.icon className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{type.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{type.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Tips ── */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">How to Actually Get Hired</h2>
          <p className="text-gray-600 mb-8 max-w-2xl">
            Most teens apply too late or don't know what employers are actually looking for. These tips are worth reading before you send a single application.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {tips.map((tip, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-6">
                <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-700 font-bold rounded-full text-sm mb-4">
                  {i + 1}
                </span>
                <h3 className="font-semibold text-gray-900 mb-2">{tip.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{tip.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Pay Snapshot ── */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">What Summer Jobs Actually Pay</h2>
          <p className="text-gray-600 mb-8 max-w-2xl">
            Pay varies widely by state and role. These are realistic starting ranges for common teen summer jobs.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { role: 'Retail associate', range: '$10–$16/hr' },
              { role: 'Fast food crew', range: '$10–$15/hr' },
              { role: 'Camp counselor', range: '$12–$18/hr' },
              { role: 'Lifeguard', range: '$13–$20/hr' },
              { role: 'Warehouse / stocking', range: '$14–$18/hr' },
              { role: 'Landscaping', range: '$13–$17/hr' },
              { role: 'Tutoring', range: '$15–$25/hr' },
              { role: 'Delivery assistant', range: '$15–$19/hr' },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <p className="text-lg font-bold text-gray-900">{item.range}</p>
                <p className="text-xs text-gray-500 mt-1">{item.role}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Figures reflect typical starting pay. State minimum wage laws vary — check your state's rate before comparing offers.
          </p>
        </section>

        {/* ── FAQ ── */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Common Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-white border border-gray-200 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                  <h3 className="font-semibold text-gray-900 pr-4">{faq.question}</h3>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>

        {/* ── Disclaimer ── */}
        <footer className="mt-16 border-t border-gray-200 pt-8">
          <p className="text-xs text-gray-400 max-w-2xl">
            Job listings are sourced from third-party APIs and updated regularly. Age requirements, pay rates, and availability vary by employer and state. Always verify working permit requirements with your state's labor department before applying.
          </p>
        </footer>

      </div>
    </>
  )
}