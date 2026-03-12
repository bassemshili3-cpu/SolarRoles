import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, BookOpen, Users } from 'lucide-react'
import { searchJobs, getCachedJobCount } from '@/lib/adzuna'

export const metadata: Metadata = {
  title: 'Urgent City of Reno Jobs Needed Right Now | Apply Today',
  description: 'Discover hundreds of City of Reno jobs hiring immediately. Stable government positions with excellent benefits, pensions and competitive pay. Public service roles in police, fire, administration and more. Start your career in local government today!',
  keywords: 'city of reno jobs, jobs at city of reno, city of reno careers, reno city employment, government jobs reno nv',
  openGraph: {
    title: 'City of Reno Jobs Hiring Now | Stable Government Roles',
    description: 'Flexible City of Reno positions open immediately. Excellent benefits, pensions and public service impact. Apply today and join a dedicated team serving the community!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Urgent City of Reno Jobs | Hiring Immediately',
    description: 'Hundreds of City of Reno jobs available right now. Competitive pay and outstanding benefits. Start your stable government career today!',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/city-of-reno-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'City of Reno Jobs',
  description: 'Find City of Reno jobs hiring now. Stable government positions with excellent benefits in police, fire, administration and more.',
  url: 'https://www.oh-my-job.com/city-of-reno-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available City of Reno Jobs',
    description: 'Current job listings with the City of Reno',
  },
}

const popularRoles = [
  { title: 'Police Officer', description: 'Serve and protect the community with law enforcement duties', icon: Shield },
  { title: 'Firefighter', description: 'Respond to emergencies and provide public safety services', icon: Briefcase },
  { title: 'Administrative Specialist', description: 'Support city departments with essential office operations', icon: FileText },
  { title: 'Public Works Technician', description: 'Maintain infrastructure and city facilities', icon: MapPin },
  { title: 'Parks and Recreation Coordinator', description: 'Manage community programs and outdoor spaces', icon: Users },
  { title: 'Code Enforcement Officer', description: 'Ensure compliance with city ordinances and regulations', icon: CheckCircle },
]

const outlookStats = [
  { label: 'Job Stability', value: 'High', note: 'Low turnover in public service' },
  { label: 'Annual Openings', value: 'Hundreds', note: 'Due to retirements' },
  { label: 'Growth Rate', value: 'Stable', note: 'Local government sector' },
]

const salaryBreakdown = [
  { level: 'Median Annual Wage', amount: '$68,000', source: 'BLS May 2024' },
  { level: 'With Benefits', amount: '$85,000+', source: 'Market average' },
  { level: 'Top Roles', amount: '$100,000+', source: 'City postings' },
]

const faqs = [
  {
    question: 'What is the job outlook for City of Reno jobs?',
    answer: 'According to the official U.S. Bureau of Labor Statistics website, local government employment remains stable with thousands of openings each year due to retirements and normal turnover. City positions offer long term job security and strong benefits.',
  },
  {
    question: 'How much can I earn with the City of Reno?',
    answer: 'The median annual wage for local government workers was approximately $68,000 in May 2024 according to the U.S. Bureau of Labor Statistics. City of Reno roles often include excellent health insurance, pensions and overtime opportunities.',
  },
  {
    question: 'Do City of Reno jobs require civil service exams?',
    answer: 'Many positions require passing a civil service exam or skills assessment. According to standard municipal hiring practices, applicants must also complete a thorough background check and meet minimum qualifications listed on official city postings.',
  },
  {
    question: 'What benefits does the City of Reno offer?',
    answer: 'The City of Reno provides comprehensive benefits including full health coverage, retirement plans, paid time off and professional development. Official city resources highlight competitive compensation and work life balance for public servants.',
  },
  {
    question: 'How do I apply for City of Reno jobs?',
    answer: 'Applications are submitted through the official City of Reno careers portal on GovernmentJobs.com. Tailor your resume to highlight relevant experience and prepare for any required testing or interviews.',
  },
]

const tips = [
  {
    title: 'Prepare for Civil Service Exams',
    description: 'Study for any required written or physical exams. Many successful candidates practice with sample tests available on official city websites.',
  },
  {
    title: 'Highlight Public Service Experience',
    description: 'Emphasize any volunteer work, military service or previous government roles. These demonstrate the commitment City of Reno employers value.',
  },
  {
    title: 'Apply Early and Often',
    description: 'Monitor the official careers page regularly. New positions open frequently and close quickly once applications reach capacity.',
  },
  {
    title: 'Understand City Benefits',
    description: 'Research the full compensation package including pensions and health plans. This helps you evaluate long term career value.',
  },
]

export default async function CityOfRenoJobsPage({ searchParams }: any) {
  const params = await searchParams

 const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'city of reno', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'city of reno', where: params.where || '', results_per_page: 30, page: 1 }),
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
            City of Reno Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="city of reno" />
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
                what={params.what || 'city of reno'}
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
            <h2 className="text-2xl font-bold text-gray-900">Job Outlook for City of Reno Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the official website of the United States Bureau of Labor Statistics, local government employment offers high stability with consistent openings due to retirements. City of Reno positions provide long term career security in public service.
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
            Source: U.S. Bureau of Labor Statistics, Employment Projections for Local Government
          </p>
        </section>

        {/* Popular Roles Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Common City of Reno Job Roles</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The City of Reno offers a wide range of meaningful public service positions. The roles below are frequently available and play a vital part in serving the community.
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
            <h2 className="text-2xl font-bold text-gray-900">Salary Guide for City of Reno Jobs</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics, median wages for local government workers provide competitive pay with outstanding benefits packages including pensions and health coverage.
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
              Note: Actual pay depends on role, experience and bargaining agreements.
            </p>
          </div>
        </section>

        {/* Requirements Section */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements for City of Reno Jobs</h2>
              <p className="text-gray-700 mb-6">
                City of Reno positions follow standard municipal hiring processes. According to official government employment guidelines, most roles require background checks and may involve civil service testing.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Typical Qualifications</h3>
                  <ul className="text-gray-600 text-sm space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      High school diploma or equivalent
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Clean background check
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Nevada driver license for certain roles
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Hiring Process</h3>
                  <ul className="text-gray-600 text-sm space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Submit application online
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Pass civil service exam if required
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Complete interview and background check
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
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing City of Reno Jobs</h2>
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About City of Reno Jobs</h2>
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
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and does not constitute legal or professional advice. Salary figures and employment details are based on the latest available data from the U.S. Bureau of Labor Statistics and may change. Oh My Job is not affiliated with the City of Reno. Always verify current job opportunities, requirements, and benefits directly on the official City of Reno careers website before applying.
          </p>
        </section>
      </div>
    </>
  )
}