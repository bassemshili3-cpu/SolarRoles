import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import {
  Briefcase,
  DollarSign,
  CheckCircle,
  Shield,
  TrendingUp,
  Clock,
  Star,
  FileText,
  Users,
  MapPin,
} from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Weekend Jobs Hiring Now | Immediate Openings Near You',
  description:
    'Hundreds of weekend jobs are available right now across the United States. Earn extra income on your days off with flexible Saturday and Sunday shifts. No experience required for many roles. Apply today!',
  keywords:
    'weekend jobs, weekend jobs near me, Saturday Sunday jobs, part time weekend jobs, weekend work, weekend employment, jobs on weekends, weekend shifts hiring',
  openGraph: {
    title: 'Weekend Jobs Available Now | Urgently Hiring Across the US',
    description:
      'Find flexible weekend jobs near you today. Retail, food service, healthcare, gig work, and more. Great pay, no long-term commitment required. Start earning this weekend.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Weekend Jobs | Immediate Openings Across the US',
    description:
      'Need extra income? Weekend jobs are hiring right now near you. Flexible shifts, competitive pay. Apply in minutes and work as soon as this weekend.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/weekend-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Weekend Jobs',
  description:
    'Browse current weekend job openings across the United States. Part-time Saturday and Sunday positions available in retail, food service, healthcare, and more.',
  url: 'https://www.oh-my-job.com/weekend-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Weekend Jobs',
    description: 'Current weekend job listings across the United States',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What types of jobs are most commonly available on weekends?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The most common weekend job categories include retail and customer service, food service and hospitality, healthcare and caregiving, delivery and logistics, event staffing, security, and gig economy work such as rideshare driving or food delivery. According to the U.S. Bureau of Labor Statistics, industries such as accommodation, food services, and retail trade have among the highest rates of weekend and irregular shift employment.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do weekend jobs pay more than weekday jobs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Weekend pay varies by employer and industry. Some employers offer a weekend differential, a pay premium for Saturday and Sunday shifts, particularly in healthcare, manufacturing, and transportation. According to the U.S. Department of Labor, the Fair Labor Standards Act does not require higher pay for weekend work unless those hours push a non-exempt employee over 40 hours in a workweek, triggering overtime at 1.5 times the regular rate.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I find weekend-only jobs that do not require weekday availability?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Many employers actively recruit workers specifically for Saturday and Sunday shifts. This is especially common in hospitality, retail, healthcare facilities such as nursing homes, and event venues. Gig economy platforms also allow workers to select only weekend availability. When applying, clearly state your weekend-only availability in your cover letter or during screening.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are weekend jobs good for students or people with full-time weekday jobs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Weekend jobs are one of the most popular options for students, parents, and full-time employees seeking supplemental income. The flexible scheduling allows people to maintain their primary commitments during the week while earning additional income on Saturdays and Sundays. Many weekend positions also offer per-diem or shift-based arrangements with no long-term contract required.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the average pay for weekend jobs in the United States?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pay for weekend jobs varies widely by industry and role. Entry-level positions such as retail associate or food service worker typically start at or near the applicable state or federal minimum wage. According to the U.S. Bureau of Labor Statistics, the federal minimum wage is $7.25 per hour, though most states have set higher minimums. Skilled weekend roles in healthcare, security, or skilled trades can pay $20 to $40 per hour or more.',
      },
    },
  ],
}

const jobCategories = [
  {
    title: 'Retail and Customer Service',
    description: 'Weekend shifts at grocery stores, clothing retailers, home improvement chains, and specialty shops are consistently in high demand.',
    icon: Briefcase,
  },
  {
    title: 'Food Service and Hospitality',
    description: 'Restaurants, cafes, hotels, and catering companies rely heavily on weekend staff for their busiest periods of the week.',
    icon: Star,
  },
  {
    title: 'Healthcare and Caregiving',
    description: 'Nursing homes, home health agencies, and hospitals offer weekend-only shifts with premium pay differentials for CNAs, nurses, and aides.',
    icon: CheckCircle,
  },
  {
    title: 'Delivery and Logistics',
    description: 'Package delivery, food delivery, and courier services see peak volume on weekends, creating strong demand for drivers and couriers.',
    icon: MapPin,
  },
  {
    title: 'Event and Venue Staffing',
    description: 'Sports arenas, concert halls, convention centers, and wedding venues regularly hire weekend event staff, ushers, and security personnel.',
    icon: Users,
  },
  {
    title: 'Gig and Freelance Work',
    description: 'Rideshare driving, task-based platforms, pet sitting, and on-demand services allow complete control over weekend work hours and earnings.',
    icon: TrendingUp,
  },
]

const payData = [
  { role: 'Retail Associate', range: '$13 – $18/hr' },
  { role: 'Food Service Worker', range: '$13 – $17/hr' },
  { role: 'CNA (Weekend Shift)', range: '$18 – $28/hr' },
  { role: 'Delivery Driver', range: '$16 – $25/hr' },
  { role: 'Event Staff', range: '$15 – $22/hr' },
  { role: 'Security Officer', range: '$17 – $26/hr' },
]

const scheduleTypes = [
  {
    label: 'Saturday Only',
    detail: 'Common in retail, farmers markets, and certain healthcare settings. Typically 6 to 10 hour shifts.',
  },
  {
    label: 'Sunday Only',
    detail: 'Often available at restaurants, grocery stores, and home care agencies with high Sunday demand.',
  },
  {
    label: 'Saturday and Sunday',
    detail: 'Full weekend coverage, often 16 to 20 hours total. Frequently offered as a standalone part-time role.',
  },
  {
    label: 'Weekend Overnight',
    detail: 'Friday or Saturday night shifts into early morning. Common in healthcare, security, and hospitality.',
  },
  {
    label: 'On-Call Weekend',
    detail: 'Available to be called in as needed. Common in healthcare and event staffing for experienced workers.',
  },
  {
    label: 'Gig Weekend Shifts',
    detail: 'Fully flexible. Log in and work when you choose through platforms like Instacart, DoorDash, or TaskRabbit.',
  },
]

const workerRights = [
  'The Fair Labor Standards Act does not require extra pay for weekend work unless overtime thresholds are triggered',
  'Non-exempt employees must be paid 1.5 times their regular rate for all hours over 40 in a workweek',
  'Some states have additional protections including mandatory rest periods between shifts',
  'Workers have the right to a safe workplace regardless of shift timing under OSHA regulations',
  'Part-time weekend workers are generally entitled to minimum wage protections under federal and state law',
  'Some employers are required to provide advance notice of scheduling changes under local predictive scheduling laws',
]

const tips = [
  {
    title: 'Be Explicit About Your Availability',
    description:
      'When applying for weekend jobs, clearly state the days and hours you are available in your application or cover letter. Employers hiring specifically for weekend coverage prioritize candidates who can commit to those shifts reliably.',
  },
  {
    title: 'Target High-Demand Weekend Industries',
    description:
      'Hospitality, healthcare, retail, and delivery services have the highest weekend hiring activity. Focusing your search on these sectors significantly increases your chances of finding immediate openings.',
  },
  {
    title: 'Ask About Weekend Differentials',
    description:
      'Before accepting a weekend role, ask the employer whether a pay differential applies for Saturday and Sunday shifts. In healthcare and manufacturing especially, weekend premiums can add $2 to $5 per hour to your base rate.',
  },
  {
    title: 'Consider Gig Platforms for Maximum Flexibility',
    description:
      'If a fixed weekend schedule does not suit your lifestyle, gig platforms allow you to work exactly when you choose. Apps like DoorDash, Rover, Instacart, and TaskRabbit are particularly active on weekends.',
  },
]

const faqs = [
  {
    question: 'What types of jobs are most commonly available on weekends?',
    answer:
      'The most common weekend job categories include retail and customer service, food service and hospitality, healthcare and caregiving, delivery and logistics, event staffing, security, and gig economy work such as rideshare driving or food delivery. According to the U.S. Bureau of Labor Statistics, industries such as accommodation, food services, and retail trade have among the highest rates of weekend and irregular shift employment.',
  },
  {
    question: 'Do weekend jobs pay more than weekday jobs?',
    answer:
      'Weekend pay varies by employer and industry. Some employers offer a weekend differential, a pay premium for Saturday and Sunday shifts, particularly in healthcare, manufacturing, and transportation. According to the U.S. Department of Labor, the Fair Labor Standards Act does not require higher pay for weekend work unless those hours push a non-exempt employee over 40 hours in a workweek, triggering overtime at 1.5 times the regular rate.',
  },
  {
    question: 'Can I find weekend-only jobs that do not require weekday availability?',
    answer:
      'Yes. Many employers actively recruit workers specifically for Saturday and Sunday shifts. This is especially common in hospitality, retail, healthcare facilities such as nursing homes, and event venues. Gig economy platforms also allow workers to select only weekend availability. When applying, clearly state your weekend-only availability in your cover letter or during screening.',
  },
  {
    question: 'Are weekend jobs good for students or people with full-time weekday jobs?',
    answer:
      'Weekend jobs are one of the most popular options for students, parents, and full-time employees seeking supplemental income. The flexible scheduling allows people to maintain their primary commitments during the week while earning additional income on Saturdays and Sundays. Many weekend positions also offer per-diem or shift-based arrangements with no long-term contract required.',
  },
  {
    question: 'What is the average pay for weekend jobs in the United States?',
    answer:
      'Pay for weekend jobs varies widely by industry and role. Entry-level positions such as retail associate or food service worker typically start at or near the applicable state or federal minimum wage. According to the U.S. Bureau of Labor Statistics, the federal minimum wage is $7.25 per hour, though most states have set higher minimums. Skilled weekend roles in healthcare, security, or skilled trades can pay $20 to $40 per hour or more.',
  },
]

export default async function WeekendJobsPage({ searchParams }: any) {
  const params = await searchParams

const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'weekend jobs', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'weekend jobs', where: params.where || '', results_per_page: 30, page: 1 })
   .then((data: AdzunaSearchResult) => ({ ...data, results: data.results.map(normalizeAdzuna) })),
])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Simple Header */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Weekend Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="weekend jobs" />
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
                what={params.what || 'weekend jobs'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Why Weekend Jobs Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Why Weekend Jobs Are in High Demand Right Now</h2>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-4">
              According to the U.S. Bureau of Labor Statistics, approximately 26 percent of employed Americans work on an average weekend day, with the highest concentrations in food service, retail, and healthcare. Weekend staffing is a structural need for these industries, and demand consistently outpaces supply in most US markets.
            </p>
            <p className="text-gray-700 mb-4">
              The rise of the gig economy and flexible work arrangements has also expanded the definition of weekend employment. Beyond traditional shift work, platforms like DoorDash, Instacart, Rover, and TaskRabbit allow workers to earn on their own schedule, with Saturday and Sunday typically representing the highest earning potential of the week.
            </p>
            <p className="text-gray-700">
              Whether you are looking for supplemental income, a first job, a career transition, or simply more flexibility, the weekend job market in the United States offers a wide range of opportunities across industries, skill levels, and pay grades.
            </p>
          </div>
        </section>

        {/* Job Categories */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Most In-Demand Weekend Job Categories</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Weekend hiring is concentrated in industries that serve consumers directly. The following categories consistently post the highest volume of Saturday and Sunday openings across the United States.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobCategories.map((cat, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <cat.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{cat.title}</h3>
                <p className="text-gray-600 text-sm">{cat.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Schedule Types */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Weekend Work Schedules</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Weekend jobs come in many formats. Understanding the schedule types available helps you target the right opportunities for your lifestyle and availability.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scheduleTypes.map((item, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                <p className="font-semibold text-gray-900 mb-1">{item.label}</p>
                <p className="text-gray-600 text-sm">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pay Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">How Much Can You Earn Working Weekends?</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Department of Labor, the federal minimum wage is $7.25 per hour, but the majority of states have enacted higher minimums. Weekend differential pay, where employers add a premium to base wages for Saturday and Sunday shifts, is common in healthcare, manufacturing, and transportation. The table below reflects typical hourly ranges for common weekend roles based on current market data.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {payData.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-5 text-center border border-green-100">
                  <p className="text-xl font-bold text-green-600 mb-1">{item.range}</p>
                  <p className="text-sm text-gray-600">{item.role}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Note: Pay rates vary by state, city, employer size, and experience level. Always verify compensation details in individual job postings.
            </p>
          </div>
        </section>

        {/* Worker Rights Section */}
        <section className="mt-20 bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <FileText className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div className="w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights as a Weekend Worker</h2>
              <p className="text-gray-700 mb-6">
                According to the U.S. Department of Labor and the Fair Labor Standards Act (FLSA), weekend workers have the same federal protections as weekday employees. Here is what you should know before accepting a weekend position.
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {workerRights.map((item, index) => (
                  <div key={index} className="flex items-start gap-2 text-gray-700 bg-white rounded-lg p-3">
                    <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Source: U.S. Department of Labor, Wage and Hour Division, Fair Labor Standards Act. Some cities such as San Francisco, New York, and Seattle have adopted predictive scheduling ordinances that provide additional protections.
              </p>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Finding and Landing Weekend Jobs</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {tips.map((tip, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors"
              >
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Weekend Jobs</h2>
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
                <div className="px-6 pb-6 text-gray-600">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>

        {/* Legal Disclaimer */}
        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only. Pay rates, labor law protections, and scheduling rules vary by state, city, and employer. Always consult the U.S. Department of Labor at dol.gov and your state labor department for the most current and applicable regulations regarding weekend and part-time employment in your area.
          </p>
        </section>
      </div>
    </>
  )
}