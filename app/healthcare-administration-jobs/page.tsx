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
  title: 'Urgent Healthcare Administration Jobs Needed Right Now | Apply Today',
  description: 'Discover thousands of healthcare administration jobs hiring immediately across the United States. Competitive salaries up to $117k+. Entry level and experienced roles available in hospitals, clinics and more. Start your high impact career today!',
  keywords: 'healthcare administration jobs, healthcare admin jobs, medical administration jobs, health services manager positions, healthcare management careers, hospital administrator jobs',
  openGraph: {
    title: 'Healthcare Administration Jobs Hiring Now | Earn Up to $117k',
    description: 'Find urgent healthcare administration positions available today. High paying roles with excellent benefits and rapid career growth. Apply in minutes and join the booming healthcare management field.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Urgent Healthcare Administration Jobs | Hiring Immediately',
    description: 'Thousands of healthcare admin jobs open right now. Median salary $117,960. Fastest growing field according to BLS. Start applying today!',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/healthcare-administration-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Healthcare Administration Jobs',
  description: 'Find healthcare administration jobs hiring now across the United States. High paying positions in hospitals, clinics, and healthcare organizations.',
  url: 'https://www.oh-my-job.com/healthcare-administration-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Healthcare Administration Jobs',
    description: 'Current job listings for healthcare administrators and managers',
  },
}

const popularRoles = [
  { title: 'Hospital Administrator', description: 'Oversee daily operations in hospitals and medical centers', icon: Briefcase },
  { title: 'Medical Office Manager', description: 'Manage staff and patient services in clinics and private practices', icon: Users },
  { title: 'Health Information Manager', description: 'Ensure accurate patient records and compliance with privacy laws', icon: FileText },
  { title: 'Nursing Home Administrator', description: 'Lead long term care facilities and senior living communities', icon: Users },
  { title: 'Clinical Manager', description: 'Coordinate medical staff and healthcare services in specialized departments', icon: Shield },
  { title: 'Public Health Administrator', description: 'Direct community health programs and government initiatives', icon: MapPin },
]

const outlookStats = [
  { label: 'Projected Growth', value: '23%', note: '2024 to 2034' },
  { label: 'Annual Openings', value: '62,100', note: 'Average per year' },
  { label: 'Current Jobs', value: '616,200', note: 'as of 2024' },
]

const salaryBreakdown = [
  { level: 'Median Annual Salary', amount: '$117,960', source: 'BLS May 2024' },
  { level: 'Top 10 Percent', amount: '$216,750+', source: 'BLS May 2024' },
  { level: 'Entry Level', amount: '$67,900', source: 'BLS May 2024' },
]

const faqs = [
  {
    question: 'What is the job outlook for healthcare administration jobs?',
    answer: 'According to the official U.S. Bureau of Labor Statistics website, employment of medical and health services managers is projected to grow 23 percent from 2024 to 2034, much faster than the average for all occupations. This growth is driven by an aging population and expanding healthcare needs.',
  },
  {
    question: 'How much can I earn in healthcare administration?',
    answer: 'The median annual wage for medical and health services managers was $117,960 in May 2024 according to the U.S. Bureau of Labor Statistics. Top earners make over $216,750 while entry level positions often start around $67,900 depending on location and experience.',
  },
  {
    question: 'Do I need a degree for healthcare administration jobs?',
    answer: 'Most employers prefer candidates with at least a bachelor’s degree in health administration, business, or a related field. Many senior roles require a master’s degree. Relevant work experience in healthcare settings can sometimes substitute for advanced education.',
  },
  {
    question: 'Are certifications required for healthcare administration roles?',
    answer: 'While not always mandatory, certifications such as the Certified Healthcare Executive (CHE) from the American College of Healthcare Executives significantly improve job prospects and earning potential. State specific licenses may also be required for certain facilities like nursing homes.',
  },
  {
    question: 'What skills are most important for healthcare administration jobs?',
    answer: 'Key skills include leadership, communication, knowledge of healthcare laws and regulations, financial management, and data analysis. Familiarity with electronic health records systems and patient privacy rules is essential for success in this field.',
  },
]

const tips = [
  {
    title: 'Earn Relevant Education',
    description: 'Pursue a bachelor’s or master’s degree in healthcare administration, public health, or business. Many top programs include internships that provide valuable real world experience.',
  },
  {
    title: 'Gain Healthcare Experience',
    description: 'Start with entry level roles in hospitals or clinics to understand daily operations. Even non administrative positions build the foundation employers look for in future managers.',
  },
  {
    title: 'Get Certified',
    description: 'Obtain professional certifications like the Certified Healthcare Executive credential to stand out from other candidates and demonstrate commitment to the field.',
  },
  {
    title: 'Build Your Network',
    description: 'Join professional organizations such as the American College of Healthcare Executives and attend industry conferences to connect with hiring managers and learn about new opportunities.',
  },
]

export default async function HealthcareAdministrationJobsPage({ searchParams }: any) {
  const params = await searchParams

const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'healthcare administration jobs', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'healthcare administration jobs', where: params.where || '', results_per_page: 30, page: 1 })
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
            Healthcare Administration Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="healthcare administration jobs" />
          </aside>
          <div className="flex-1">

            {/* ✅ Count ici, à droite, au-dessus de la map */}
            {count > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">{count.toLocaleString()}</span> positions available 
              </p>
            )}

            {/* Client wrapper isolé — pas de use client sur la page */}
            <AIJobMatcherWrapper />

            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'healthcare administration jobs'}
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
            <h2 className="text-2xl font-bold text-gray-900">Job Outlook for Healthcare Administration</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the official website of the United States Bureau of Labor Statistics, healthcare administration jobs are among the fastest growing occupations in the country. Demand continues to rise due to an aging population and expanding healthcare services.
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
            Source: U.S. Bureau of Labor Statistics, Occupational Outlook Handbook, Medical and Health Services Managers
          </p>
        </section>

        {/* Popular Roles Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Common Healthcare Administration Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Healthcare administration covers a wide range of leadership roles. The following positions are currently in high demand and offer excellent career progression opportunities across hospitals, clinics, and public health organizations.
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
            <h2 className="text-2xl font-bold text-gray-900">Salary Guide for Healthcare Administration Jobs</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics, the median annual salary for medical and health services managers reached $117,960 in May 2024. Salaries vary by experience, location, and facility type, with many professionals earning well above the national average.
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
              Note: Actual salaries depend on geographic location, organization size, and years of experience. Check current listings for the most accurate figures in your area.
            </p>
          </div>
        </section>

        {/* Requirements and Certifications Section */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Education and Certifications for Healthcare Administration Jobs</h2>
              <p className="text-gray-700 mb-6">
                Most healthcare administration positions require formal education and professional credentials. According to the Bureau of Labor Statistics, employers typically look for candidates with strong academic backgrounds combined with practical healthcare experience.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Typical Education Path</h3>
                  <ul className="text-gray-600 text-sm space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Bachelor’s degree in health administration or business
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Master’s degree (MHA, MBA, or MPH) preferred for senior roles
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Internships or entry level healthcare experience
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Recommended Certifications</h3>
                  <ul className="text-gray-600 text-sm space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Certified Healthcare Executive (CHE)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Fellow of the American College of Healthcare Executives (FACHE)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      State specific nursing home administrator license (if applicable)
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
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing Healthcare Administration Jobs</h2>
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Healthcare Administration Jobs</h2>
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
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and does not constitute professional or legal advice. Salary figures and employment projections are based on the latest available data from the U.S. Bureau of Labor Statistics and may change. Always verify current requirements, licensing, and job details directly with employers and official government sources before applying.
          </p>
        </section>
      </div>
    </>
  )
}