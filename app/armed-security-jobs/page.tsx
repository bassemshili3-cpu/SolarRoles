import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, BookOpen, Users } from 'lucide-react'
import { searchJobs, getCachedJobCount } from '@/lib/adzuna'

export const metadata: Metadata = {
  title: 'Urgent Armed Security Jobs Needed Right Now | Start Today',
  description: 'Discover thousands of armed security jobs hiring immediately across the United States. Earn $18–$25+ per hour with flexible shifts and full benefits. State licensed positions open now. Apply in minutes and launch your high demand security career!',
  keywords: 'armed security jobs, armed security guard jobs, armed security officer positions, armed guard jobs, armed protection jobs',
  openGraph: {
    title: 'Armed Security Jobs Hiring Now | Up to $25+ Per Hour',
    description: 'Flexible armed security positions available immediately nationwide. Competitive pay, benefits, and rapid hiring. Start protecting communities and properties today!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Urgent Armed Security Jobs | Hiring Immediately',
    description: 'Thousands of armed security jobs open right now. Earn competitive hourly rates with flexible schedules. State licensed roles available across America!',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/armed-security-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Armed Security Jobs',
  description: 'Find armed security jobs hiring now across the United States. Licensed positions with competitive pay and flexible schedules.',
  url: 'https://www.oh-my-job.com/armed-security-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Armed Security Jobs',
    description: 'Current job listings for armed security officers and guards',
  },
}

const popularRoles = [
  { title: 'Armed Security Officer', description: 'Patrol commercial buildings, retail centers and offices with firearms', icon: Shield },
  { title: 'Hospital Armed Security', description: 'Provide protection in medical facilities and emergency departments', icon: Users },
  { title: 'Executive Protection Specialist', description: 'Safeguard high profile clients and VIPs during travel and events', icon: Briefcase },
  { title: 'Event Armed Security', description: 'Secure concerts, sports venues and large public gatherings', icon: MapPin },
  { title: 'Retail Armed Guard', description: 'Prevent theft and maintain safety in high value stores', icon: Briefcase },
  { title: 'Residential Armed Patrol', description: 'Protect gated communities and luxury properties', icon: Users },
]

const outlookStats = [
  { label: 'Median Annual Pay', value: '$38,370', note: 'May 2024 BLS' },
  { label: 'Annual Openings', value: '162,300', note: 'Average per year' },
  { label: 'Job Outlook', value: 'Little or no change', note: '2024–2034' },
]

const salaryBreakdown = [
  { level: 'Median Annual Wage', amount: '$38,370', source: 'BLS May 2024' },
  { level: 'Mean Hourly Wage', amount: '$18.46', source: 'BLS May 2024' },
  { level: 'Armed Premium', amount: '$21–$25+', source: 'Common market rates' },
]

const faqs = [
  {
    question: 'What are the requirements for armed security jobs?',
    answer: 'Requirements vary by state. According to state licensing authorities, most armed security positions require applicants to be at least 21 years old, pass a thorough criminal background check, complete firearms training, and obtain a state issued armed security guard license or permit.',
  },
  {
    question: 'How much do armed security guards earn?',
    answer: 'According to the U.S. Bureau of Labor Statistics, the median annual wage for security guards was $38,370 in May 2024. Armed positions typically pay higher hourly rates, often $21 to $25 or more depending on location, experience, and specific duties.',
  },
  {
    question: 'Do I need a firearm permit for armed security jobs?',
    answer: 'Yes. Every state that allows armed security requires a specific armed guard license or firearms qualification. This usually involves classroom training, range qualification, and passing a written exam. Employers will only consider candidates who already hold or can quickly obtain the proper credentials.',
  },
  {
    question: 'Is prior law enforcement experience required?',
    answer: 'No. Many armed security jobs are open to candidates without military or police backgrounds. However, veterans and former officers are highly valued. A clean record, reliable transportation, and the ability to obtain an armed license are usually the main requirements.',
  },
  {
    question: 'How do I get licensed for armed security work?',
    answer: 'The process begins with your state’s licensing board or department of public safety. Most states require an application, background check, training course, and firearms qualification. Official state websites provide the exact steps and approved training providers.',
  },
]

const tips = [
  {
    title: 'Obtain Your Armed License First',
    description: 'Complete state required firearms training and apply for your armed security guard permit before applying to jobs. This dramatically increases your chances of getting hired quickly.',
  },
  {
    title: 'Apply to Multiple Companies',
    description: 'Major security firms and local agencies hire year round. Submit applications to several employers to maximize daily opportunities.',
  },
  {
    title: 'Highlight Reliability and Fitness',
    description: 'Emphasize punctuality, physical fitness, and customer service skills. Many employers value steady, professional candidates who can represent their brand.',
  },
  {
    title: 'Prepare for Background Checks',
    description: 'Ensure your record is clean and gather identification documents early. Most armed positions require fingerprinting and a full criminal history review.',
  },
]

export default async function ArmedSecurityJobsPage({ searchParams }: any) {
  const params = await searchParams

   const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'Armed Security', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'Armed Security', where: params.where || '', results_per_page: 30, page: 1 }),
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
            Armed Security Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="armed security" />
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
                what={params.what || 'armed security'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Job Outlook Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Job Outlook for Armed Security Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the official U.S. Bureau of Labor Statistics website, demand for security guards remains steady with thousands of openings each year due to high turnover. Armed positions are especially needed in high risk environments.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {outlookStats.map((stat, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
                <p className="text-4xl font-bold text-blue-600 mb-1">{stat.value}</p>
                <p className="font-semibold text-gray-900 mb-1">{stat.label}</p>
                <p className="text-sm text-gray-500">{stat.note}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Source: U.S. Bureau of Labor Statistics, Occupational Outlook Handbook, Security Guards and Gambling Surveillance Officers
          </p>
        </section>

        {/* Popular Roles Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Armed Security Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Armed security offers a wide variety of roles to match different interests and schedules. The positions below are currently in high demand and provide excellent pay and career growth.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularRoles.map((role, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <role.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Salary Expectations Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Salary Guide for Armed Security Jobs</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics, the median annual wage for security guards reached $38,370 in May 2024. Armed security roles typically command higher pay due to the added responsibility of carrying a firearm.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {salaryBreakdown.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-5 text-center">
                  <p className="text-3xl font-bold text-green-600 mb-2">{item.amount}</p>
                  <p className="font-semibold text-gray-900 text-sm mb-1">{item.level}</p>
                  <p className="text-xs text-gray-500">{item.source}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Note: Actual earnings vary by state, experience, shift type, and employer. Overtime and hazard pay can significantly increase take home income.
            </p>
          </div>
        </section>

        {/* Requirements and Licensing Section */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Licensing and Requirements for Armed Security Jobs</h2>
              <p className="text-gray-700 mb-6">
                Armed security work is strictly regulated. According to state departments of public safety and licensing boards, candidates must meet specific age, training, and background requirements before carrying a firearm on duty.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Basic Requirements</h3>
                  <ul className="text-gray-600 text-sm space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Minimum age 21 in most states
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Clean criminal background check
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Valid driver license and reliable transportation
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Armed License Steps</h3>
                  <ul className="text-gray-600 text-sm space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Complete state approved firearms training
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Pass written exam and range qualification
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Submit fingerprints and application to state board
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
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing Armed Security Jobs</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {tips.map((tip, index) => (
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Armed Security Jobs</h2>
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
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and does not constitute legal or professional advice. Licensing requirements, pay rates, and hiring processes vary by state. Always verify the latest regulations directly with your state licensing board or department of public safety before applying.
          </p>
        </section>
      </div>
    </>
  )
}