import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, Users, Award } from 'lucide-react'
import { searchJobs, getCachedJobCount } from '@/lib/adzuna'

export const metadata: Metadata = {
  title: 'Urgent Burger King Corporation Jobs Hiring Now | Apply Today',
  description: 'Hundreds of Burger King Corporation jobs open right now across the United States. Flexible shifts, free meals, paid training and fast career growth. No experience needed for most positions. Start earning this week!',
  keywords: 'burger king corporation jobs, burger king jobs, bk jobs, burger king hiring now, fast food jobs burger king, burger king careers',
  openGraph: {
    title: 'Burger King Corporation Jobs Hiring Immediately | Earn Fast',
    description: 'Real Burger King positions available today. Great pay, flexible hours, employee meals and quick advancement. Apply in minutes and get hired fast!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Urgent Burger King Corporation Jobs | Hiring Now',
    description: 'Hundreds of Burger King jobs open across America. Competitive wages, benefits and immediate openings. Start your fast food career today!',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/burger-king-corporation-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Burger King Corporation Jobs',
  description: 'Find Burger King Corporation jobs hiring now across the United States. Flexible hours, training and competitive pay.',
  url: 'https://www.oh-my-job.com/burger-king-corporation-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Burger King Corporation Jobs',
    description: 'Current Burger King positions hiring immediately',
  },
}

const popularRoles = [
  { title: 'Crew Member', description: 'Take orders, prepare food and deliver friendly service', icon: Users },
  { title: 'Cashier', description: 'Handle transactions and provide excellent customer experience', icon: Briefcase },
  { title: 'Cook', description: 'Prepare burgers, fries and menu items in a fast paced kitchen', icon: Award },
  { title: 'Shift Supervisor', description: 'Lead the team and ensure smooth restaurant operations', icon: Shield },
  { title: 'Assistant Manager', description: 'Support daily management and drive team performance', icon: MapPin },
]

const benefits = [
  { title: 'Flexible Schedules', description: 'Full time, part time, day or night shifts to fit your life' },
  { title: 'Free Employee Meals', description: 'Discounted or free meals while on shift at most locations' },
  { title: 'Paid Training', description: 'Comprehensive on the job training from day one' },
  { title: 'Career Growth', description: 'Clear path to supervisor and management roles' },
  { title: 'Performance Bonuses', description: 'Extra pay for top performers in many restaurants' },
]

const faqs = [
  {
    question: 'Do Burger King Corporation jobs require experience?',
    answer: 'Most entry level positions do not require previous experience. Burger King provides full paid training for new team members.',
  },
  {
    question: 'What is the average pay for Burger King jobs?',
    answer: 'According to the U.S. Bureau of Labor Statistics, the median hourly wage for fast food and counter workers is $14.20 as of May 2023. Actual pay at Burger King varies by location, position and experience.',
  },
  {
    question: 'Are Burger King jobs available nationwide?',
    answer: 'Yes. Burger King Corporation and its franchise partners operate thousands of locations across all 50 states with positions open every day.',
  },
  {
    question: 'How long does the hiring process take?',
    answer: 'Many candidates complete the online application, interview and start training within a few days. Some locations offer same week onboarding.',
  },
  {
    question: 'Do Burger King employees get benefits?',
    answer: 'Benefits vary by location and position. Most team members receive flexible hours, meal discounts and training. Management roles often include health insurance and paid time off.',
  },
]

const applicationTips = [
  {
    title: 'Apply Online in Minutes',
    description: 'Complete the quick application on the Burger King careers site or directly at your local restaurant.',
  },
  {
    title: 'Highlight Availability',
    description: 'Be clear about the hours you can work. Flexible availability helps you get hired faster.',
  },
  {
    title: 'Prepare for a Quick Interview',
    description: 'Managers often ask about teamwork, customer service and reliability. Smile and show enthusiasm.',
  },
  {
    title: 'Follow Up if Needed',
    description: 'If you do not hear back within 48 hours, call the restaurant to check on your application.',
  },
]

export default async function BurgerKingCorporationJobsPage({ searchParams }: any) {
  const params = await searchParams

  const { count } = await getCachedJobCount(
    params.what || 'burger-king-corporation-jobs',
    params.where || '',
    params.salary_min
  )

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
            Burger King Corporation Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters />
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
              />
            </Suspense>
          </div>
        </div>

        {/* Popular Roles */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Popular Burger King Corporation Job Roles</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Burger King offers entry level and management opportunities in a fast paced restaurant environment.
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
            <h2 className="text-2xl font-bold text-gray-900">How Much Can You Earn at Burger King Corporation?</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics, the median hourly wage for fast food and counter workers is $14.20 as of May 2023. Many Burger King locations offer competitive pay plus shift differentials and performance bonuses.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">$14.20</p>
                <p className="text-sm text-gray-600">Median Hourly (BLS)</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-blue-600 mb-2">$29,540</p>
                <p className="text-sm text-gray-600">Median Annual</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-purple-600 mb-2">+ Meals</p>
                <p className="text-sm text-gray-600">Plus Bonuses &amp; Perks</p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Benefits of Working at Burger King Corporation</h2>
          </div>
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
            <h2 className="text-2xl font-bold text-gray-900">Tips to Get Hired at Burger King Fast</h2>
          </div>
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Burger King Corporation Jobs</h2>
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

        {/* Legal Disclaimer */}
        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> This page is provided for informational purposes only. Oh My Job is not affiliated with, owned by, or operated by Burger King Corporation or any of its franchisees. All job listings come from public sources and third party partners. Actual employment terms, benefits and hiring decisions are handled directly by each restaurant location. Always verify details directly with the employer.
          </p>
        </section>
      </div>
    </>
  )
}