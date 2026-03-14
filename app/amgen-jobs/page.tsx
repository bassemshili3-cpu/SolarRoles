import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, BookOpen, Users } from 'lucide-react'
import { searchJobs, getCachedJobCount, AdzunaSearchResult } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna

export const metadata: Metadata = {
  title: 'Urgent Amgen Jobs Needed Right Now | Apply Today',
  description: 'Discover thousands of Amgen jobs hiring immediately across the United States. High paying biotech roles in research, manufacturing and clinical operations. Competitive salaries up to $150k+. Join a global leader in innovative medicines today!',
  keywords: 'amgen jobs, jobs at amgen, amgen careers, amgen employment, biotech jobs amgen, amgen research jobs',
  openGraph: {
    title: 'Amgen Jobs Hiring Now | Up to $150k+ Salaries',
    description: 'Flexible Amgen positions available immediately nationwide. Innovative roles in biotechnology with excellent benefits and career growth. Start your future at Amgen today!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Urgent Amgen Jobs | Hiring Immediately',
    description: 'Thousands of Amgen jobs open right now. Earn competitive salaries in cutting edge biotech. Apply today and make a difference in patient lives!',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/amgen-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Amgen Jobs',
  description: 'Find Amgen jobs hiring now across the United States. Research, clinical and operations roles in biotechnology.',
  url: 'https://www.oh-my-job.com/amgen-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Amgen Jobs',
    description: 'Current job listings at Amgen',
  },
}

const popularRoles = [
  { title: 'Research Scientist', description: 'Conduct groundbreaking studies in oncology and inflammation', icon: BookOpen },
  { title: 'Clinical Research Associate', description: 'Oversee trials and ensure regulatory compliance', icon: Shield },
  { title: 'Manufacturing Associate', description: 'Produce lifesaving biologics in state of the art facilities', icon: Briefcase },
  { title: 'Medical Science Liaison', description: 'Bridge science and healthcare providers nationwide', icon: Users },
  { title: 'Data Scientist', description: 'Analyze complex datasets to advance drug development', icon: FileText },
  { title: 'Sales Representative', description: 'Promote innovative therapies to medical professionals', icon: MapPin },
]

const outlookStats = [
  { label: 'Projected Growth', value: '11%', note: '2024 to 2034' },
  { label: 'Median Salary', value: '$99,770', note: 'BLS May 2024' },
  { label: 'Annual Openings', value: '7,700', note: 'Average per year' },
]

const salaryBreakdown = [
  { level: 'Median Annual Salary', amount: '$99,770', source: 'BLS May 2024' },
  { level: 'Top 10 Percent', amount: '$168,000+', source: 'BLS May 2024' },
  { level: 'Entry Level', amount: '$65,000', source: 'Market average' },
]

const faqs = [
  {
    question: 'What is the job outlook for Amgen jobs?',
    answer: 'According to the official U.S. Bureau of Labor Statistics website, employment of medical scientists is projected to grow 11 percent from 2024 to 2034, much faster than the average for all occupations. This growth is driven by demand for new treatments in biotechnology.',
  },
  {
    question: 'How much can I earn at Amgen?',
    answer: 'According to the U.S. Bureau of Labor Statistics, the median annual wage for medical scientists was $99,770 in May 2024. Amgen roles often exceed this with competitive packages including bonuses and stock options.',
  },
  {
    question: 'What qualifications do I need for Amgen jobs?',
    answer: 'Most positions require a bachelor’s degree or higher in biology, chemistry, or a related field. According to industry standards from the Bureau of Labor Statistics, advanced degrees and relevant experience are preferred for research and clinical roles.',
  },
  {
    question: 'What benefits does Amgen offer?',
    answer: 'Amgen provides comprehensive benefits including health insurance, retirement plans, and professional development. Official company resources highlight wellness programs, flexible work options, and opportunities for career advancement.',
  },
  {
    question: 'How do I apply for Amgen jobs?',
    answer: 'Visit the official Amgen careers website to search and apply directly. Many positions are also listed on major job boards. Tailor your resume to highlight relevant biotech experience.',
  },
]

const tips = [
  {
    title: 'Tailor Your Application',
    description: 'Customize your resume and cover letter to match specific Amgen job descriptions. Highlight any experience in biotechnology or clinical research.',
  },
  {
    title: 'Gain Relevant Experience',
    description: 'Pursue internships or entry level roles in labs or pharma companies to build the skills Amgen values in candidates.',
  },
  {
    title: 'Network in Biotech',
    description: 'Attend industry conferences and connect with Amgen professionals on LinkedIn to learn about internal opportunities.',
  },
  {
    title: 'Prepare for Interviews',
    description: 'Research Amgen’s pipeline and values. Be ready to discuss how your background aligns with their mission to serve patients.',
  },
]

export default async function AmgenJobsPage({ searchParams }: any) {
  const params = await searchParams

const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'Amgen jobs', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'Amgen jobs', where: params.where || '', results_per_page: 30, page: 1 })
  .then((data: AdzunaSearchResult) => ({ ...data, results: data.results.map(normalizeAdzuna) })),
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
            Amgen Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="amgen jobs" />
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
                what={params.what || 'amgen jobs'}
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
            <h2 className="text-2xl font-bold text-gray-900">Job Outlook for Amgen Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the official website of the United States Bureau of Labor Statistics, biotechnology careers like those at Amgen are growing rapidly. Demand for skilled professionals in medical science and research continues to expand.
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
            Source: U.S. Bureau of Labor Statistics, Occupational Outlook Handbook, Medical Scientists
          </p>
        </section>

        {/* Popular Roles Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Popular Amgen Job Roles</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Amgen offers diverse opportunities in biotechnology. The roles below are frequently available and represent key areas where the company drives innovation in patient care.
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
            <h2 className="text-2xl font-bold text-gray-900">Salary Guide for Amgen Jobs</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics, the median annual wage for medical scientists was $99,770 in May 2024. Amgen positions often include additional compensation through bonuses and equity.
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
              Note: Actual salaries at Amgen vary based on role, location, and experience level.
            </p>
          </div>
        </section>

        {/* Requirements Section */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements for Amgen Jobs</h2>
              <p className="text-gray-700 mb-6">
                Amgen seeks talented individuals passionate about science and innovation. According to the Bureau of Labor Statistics, strong educational backgrounds in life sciences are essential for success in biotechnology roles.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Education and Skills</h3>
                  <ul className="text-gray-600 text-sm space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Bachelor’s or advanced degree in biology or related field
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Laboratory or clinical experience
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Strong analytical and communication skills
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Application Process</h3>
                  <ul className="text-gray-600 text-sm space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Apply via Amgen careers portal
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Prepare for behavioral interviews
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Highlight impact on patient outcomes
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
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing Amgen Jobs</h2>
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Amgen Jobs</h2>
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
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and does not constitute legal or professional advice. Salary figures and employment projections are based on the latest available data from the U.S. Bureau of Labor Statistics and may change. Oh My Job is not affiliated with Amgen. Always verify current job opportunities, requirements, and benefits directly on the official Amgen careers website before applying.
          </p>
        </section>
      </div>
    </>
  )
}