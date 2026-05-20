import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, TrendingUp, DollarSign, FileText, Shield, CheckCircle } from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Live Nation Jobs | Concerts, Events & Venue Careers',
  description: 'Concert ops, venue management, marketing, and ticketing at one of entertainment's biggest employers. Live Nation listings organized by city and department.',
  keywords: 'live nation jobs, live nation careers, live nation hiring now, concert promoter jobs, event production jobs, venue manager jobs, ticketmaster jobs, live events jobs',
  openGraph: {
    title: 'Live Nation Jobs | Entertainment Industry Openings',
    description: 'Explore thousands of Live Nation positions available right now in the US. Top roles in concerts, events and entertainment. Competitive salaries and immediate start dates. Apply today!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live Nation Jobs | Event Production & Venue Operations',
    description: 'Ready to work in live music and entertainment? Thousands of Live Nation jobs available immediately. Apply now!',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/live-nation-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Live Nation Jobs',
  description: 'Find urgent Live Nation jobs hiring now across the United States. Browse concert, event production, marketing and venue operations positions with immediate openings.',
  url: 'https://www.oh-my-job.com/live-nation-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Live Nation Jobs',
    description: 'Current Live Nation job listings with immediate hiring needs',
  },
}

const popularRoles = [
  { title: 'Event Coordinator', description: 'Plan and execute concerts, festivals and live events nationwide' },
  { title: 'Venue Operations Manager', description: 'Oversee daily operations at iconic Live Nation and Ticketmaster venues' },
  { title: 'Marketing Specialist', description: 'Promote tours, shows and experiences across social media and digital platforms' },
  { title: 'Talent Buyer', description: 'Book artists and negotiate contracts for Live Nation concerts' },
  { title: 'Ticket Sales & Operations', description: 'Manage ticketing strategy and customer experience through Ticketmaster' },
  { title: 'Production Technician', description: 'Support stage setup, lighting and sound for major live events' },
]

const jobOutlookData = [
  { fact: 'Annual Openings', value: 'Thousands', details: 'In live entertainment sector' },
  { fact: 'Job Growth', value: '5%', details: 'For event planners through 2034' },
  { fact: 'Current Demand', value: 'Strong', details: 'Driven by post-pandemic concert boom' },
]

const salaryData = [
  { role: 'Event Coordinators', salary: '$59,410', note: 'Median annual wage (2024)' },
  { role: 'Venue Managers', salary: '$85,000+', note: 'With experience at major promoters' },
]

const faqs = [
  {
    question: 'What kinds of jobs does Live Nation offer?',
    answer: 'Live Nation offers roles in event production, venue operations, marketing, talent booking, ticketing through Ticketmaster, and corporate support. According to public career data, the company hires thousands of people annually across the United States for full-time, part-time and seasonal positions.',
  },
  {
    question: 'Do I need experience for Live Nation jobs?',
    answer: 'Many entry-level positions require only a high school diploma and passion for live music. According to the U.S. Bureau of Labor Statistics, event planning and coordination roles often value relevant experience, internships or a degree in hospitality or communications.',
  },
  {
    question: 'What is the average salary for Live Nation jobs?',
    answer: 'Salaries vary by role and location. The U.S. Bureau of Labor Statistics reports a median of $59,410 for meeting, convention and event planners as of May 2024. Senior venue and production roles at major promoters like Live Nation often exceed $85,000.',
  },
  {
    question: 'Are Live Nation jobs available remotely?',
    answer: 'Some corporate and marketing positions are remote or hybrid. Most venue and event production roles require on-site presence at concerts and festivals. Live Nation has expanded flexible options since 2020 according to industry reports.',
  },
  {
    question: 'How do I apply to Live Nation jobs?',
    answer: 'The easiest way is through their official careers portal. Many openings also appear on major job boards. Highlight any event, customer service or entertainment experience on your resume to stand out.',
  },
]

const applicationTips = [
  {
    title: 'Show Your Passion for Live Music',
    description: 'Mention specific artists, tours or festivals you have attended or worked on. Live Nation values genuine enthusiasm for the entertainment industry.',
  },
  {
    title: 'Highlight Transferable Skills',
    description: 'Customer service, project coordination and social media experience are highly valued in event and marketing roles.',
  },
  {
    title: 'Follow Live Nation on LinkedIn',
    description: 'Many positions are posted directly on LinkedIn and filled quickly. Set job alerts for “Live Nation”.',
  },
  {
    title: 'Prepare for Event-Based Interviews',
    description: 'Be ready to discuss how you handle fast-paced environments, weekends and last-minute changes common in live events.',
  },
]

// Typage précis (remplace le "any" qui causait l'erreur de module)
export default async function LiveNationJobsPage({
  searchParams,
}: {
  searchParams: Promise<{
    what?: string
    where?: string
    salary_min?: string   // ← uniquement string | undefined (natif Next.js)
  }>
}) {
  const params = await searchParams

  // 2. Conversion parseInt sécurisée UNIQUEMENT pour getCachedJobCount
  let salaryMinNum: number | undefined = undefined
  if (params.salary_min) {
    const parsed = Number.parseInt(params.salary_min, 10)
    salaryMinNum = Number.isNaN(parsed) ? undefined : parsed
  }

  const [{ count }, initialData] = await Promise.all([
  getMergedJobCount(params.what || 'live nation', params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
  searchMergedJobs({ what: params.what || 'live nation', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
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
            Live Nation Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="live nation" />
          </aside>
          <div className="flex-1">

            {/* Count */}
            {count > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">{count.toLocaleString()}</span> positions available 
              </p>
            )}

            {/* AI Matcher */}
            <AIJobMatcherWrapper />

            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'live nation'}
                where={params.where || ''}
                salary_min={params.salary_min}  
                initialData={initialData} // ← ajouter 
              />
            </Suspense>
          </div>
        </div>

        {/* === TOUTES LES SECTIONS CI-DESSOUS SONT INCHANGÉES === */}
        {/* Job Outlook Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-900">Live Nation Job Outlook</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics, employment of meeting, convention and event planners is projected to grow 5 percent from 2024 to 2034. Live Nation continues to expand its global footprint with new venues and tours, creating strong demand for event professionals.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {jobOutlookData.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{item.fact}</p>
                <p className="text-emerald-600 text-2xl font-medium">{item.value}</p>
                <p className="text-gray-600 text-sm mt-2">{item.details}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Source: U.S. Bureau of Labor Statistics, Occupational Outlook Handbook, Meeting, Convention and Event Planners, updated 2025
          </p>
        </section>

        {/* Popular Roles Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Popular Live Nation Job Roles</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Live Nation offers exciting opportunities in the live entertainment industry. The following roles currently have high demand across the United States.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularRoles.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <Briefcase className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Salary Information Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Live Nation Salaries</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              Salaries at Live Nation vary by role and location but remain competitive within the entertainment industry.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {salaryData.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-5 text-center">
                  <p className="text-3xl font-bold text-green-600 mb-1">{item.salary}</p>
                  <p className="font-semibold text-gray-900">{item.role}</p>
                  <p className="text-sm text-gray-600">{item.note}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics, May 2024
            </p>
          </div>
        </section>

        {/* Requirements Section */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <FileText className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements for Live Nation Jobs</h2>
              <p className="text-gray-700 mb-4">
                According to the U.S. Bureau of Labor Statistics, most event and production roles require a high school diploma and relevant experience. Live Nation values candidates with a passion for music and the ability to thrive in a fast-paced environment.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Typical Requirements</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>High school diploma or equivalent</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Event, customer service or hospitality experience</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Availability for evenings and weekends</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Strong communication and teamwork skills</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Valuable Skills</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Live sound or stage production knowledge</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Social media and digital marketing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Project management tools</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing Live Nation Jobs</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {applicationTips.map((tip, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 font-bold rounded-full text-sm mb-4">
                  {index + 1}
                </span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{tip.title}</h3>
                <p className="text-gray-600 text-sm">{tip.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Live Nation Jobs</h2>
          </div>
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

        {/* Company Disclaimer */}
        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> oh-my-job.com is not affiliated with Live Nation. This page aggregates publicly available job listings and provides general information for informational purposes only. All applications should be submitted directly through Live Nation's official careers website.
          </p>
        </section>
      </div>
    </>
  )
}