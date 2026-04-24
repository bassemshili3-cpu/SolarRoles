import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, DollarSign, FileText, CheckCircle, Award, Users, Shield } from 'lucide-react'
import { searchJobs, getCachedJobCount, AdzunaSearchResult } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Urgent HVAC Jobs Hiring Now | Earn $60k+ Starting Today',
  description: 'Hundreds of HVAC jobs open immediately across the United States. High pay up to $60k+, benefits, paid training and fast hiring. No experience needed for many entry-level positions. Apply today and start your high-demand career!',
  keywords: 'hvac jobs, hvac technician jobs, hvac careers, heating ventilation air conditioning jobs, hvac hiring now, hvac technician hiring',
  openGraph: {
    title: 'HVAC Jobs Hiring Immediately | High Pay & Benefits',
    description: 'Real HVAC positions available right now. Earn competitive wages with overtime, benefits and quick advancement. Get hired fast!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Urgent HVAC Jobs | Hiring Now Across the US',
    description: 'Hundreds of HVAC technician jobs open today. $60k+ potential, paid training and immediate start dates. Apply in minutes!',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/hvac-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'HVAC Jobs',
  description: 'Find HVAC jobs hiring now across the United States. High demand positions with excellent pay and benefits.',
  url: 'https://www.oh-my-job.com/hvac-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available HVAC Jobs',
    description: 'Current HVAC technician and installer positions hiring immediately',
  },
}

const popularRoles = [
  { title: 'HVAC Technician', description: 'Service, repair and maintain residential and commercial heating and cooling systems', icon: Briefcase },
  { title: 'Installation Specialist', description: 'Install new HVAC units and ductwork in homes and businesses', icon: Users },
  { title: 'Refrigeration Mechanic', description: 'Work on commercial refrigeration and supermarket equipment', icon: Award },
  { title: 'Service Manager', description: 'Lead teams and oversee HVAC maintenance contracts', icon: Shield },
  { title: 'Controls Technician', description: 'Program and troubleshoot building automation systems', icon: FileText },
]

const benefits = [
  { title: 'High Demand', description: 'Steady work year round with overtime opportunities' },
  { title: 'Competitive Pay', description: 'Above average wages plus performance bonuses' },
  { title: 'Paid Training', description: 'Company sponsored EPA certification and ongoing education' },
  { title: 'Benefits Package', description: 'Health insurance, retirement plans and paid time off' },
  { title: 'Career Growth', description: 'Clear path to senior technician and management roles' },
]

const faqs = [
  {
    question: 'Do HVAC jobs require prior experience?',
    answer: 'Many entry level HVAC positions do not require previous experience. Employers often provide paid training and help new hires obtain the necessary EPA certification.',
  },
  {
    question: 'What is the average salary for HVAC technicians?',
    answer: 'According to the U.S. Bureau of Labor Statistics, the median annual wage for heating, air conditioning and refrigeration mechanics and installers was $59,810 in May 2024. Pay varies by location, experience and certifications.',
  },
  {
    question: 'Is EPA certification required for HVAC jobs?',
    answer: 'Yes. According to the official U.S. Environmental Protection Agency website, any technician who purchases, handles or works on equipment containing refrigerants must hold EPA Section 608 certification under the Clean Air Act.',
  },
  {
    question: 'Are HVAC jobs available nationwide?',
    answer: 'Yes. HVAC technicians are in high demand in every state, with thousands of openings from residential service to large commercial and industrial projects.',
  },
  {
    question: 'How quickly can I start an HVAC job?',
    answer: 'Many candidates complete the application, interview and basic training within 1-2 weeks. Some locations offer immediate start dates for helpers while you complete certification.',
  },
]

const applicationTips = [
  {
    title: 'Get Your EPA 608 Certification',
    description: 'Start with the Universal or Type II certification. Many employers reimburse the cost after hiring.',
  },
  {
    title: 'Highlight Technical Skills',
    description: 'Mention any experience with tools, electrical work, customer service or mechanical repairs even if not in HVAC.',
  },
  {
    title: 'Apply to Multiple Locations',
    description: 'Large contractors and local shops hire year round. Apply directly on company sites and job boards.',
  },
  {
    title: 'Prepare for Background and Drug Screening',
    description: 'Most HVAC roles require a clean background check and valid driver license.',
  },
]



  export default async function HVACJobsPage(props: {
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
  getMergedJobCount(params.what || 'hvac-jobs', params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
  searchMergedJobs({ what: params.what || 'hvac-jobs', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
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
            HVAC Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="hvac-jobs" />
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
                what={params.what || 'hvac-jobs'}
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
            <h2 className="text-2xl font-bold text-gray-900">Popular HVAC Job Roles</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            HVAC offers diverse opportunities from entry level installation to advanced service and management positions.
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
            <h2 className="text-2xl font-bold text-gray-900">How Much Can You Earn in HVAC?</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics, the median annual wage for heating, air conditioning and refrigeration mechanics and installers was $59,810 in May 2024. Many experienced technicians earn well above this with overtime and bonuses.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">$59,810</p>
                <p className="text-sm text-gray-600">Median Annual (BLS 2024)</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-blue-600 mb-2">$28.75</p>
                <p className="text-sm text-gray-600">Median Hourly</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-purple-600 mb-2">8%</p>
                <p className="text-sm text-gray-600">Projected Growth 2023-2033</p>
              </div>
            </div>
          </div>
        </section>

        {/* Certifications Section */}
        <section className="mt-20 bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <FileText className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Required Certifications for HVAC Jobs</h2>
              <p className="text-gray-700 mb-4">
                According to the official U.S. Environmental Protection Agency (EPA) under the Clean Air Act, any technician who works with refrigerants must hold EPA Section 608 certification.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white rounded-lg p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">EPA 608 Types</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" /> Type I – Small appliances</li>
                    <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" /> Type II – High pressure systems</li>
                    <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" /> Type III – Low pressure systems</li>
                    <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" /> Universal – All types (most popular)</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">Additional Credentials</h3>
                  <p className="text-gray-600 text-sm">Many states require a contractor license. NATE certification is voluntary but highly valued by employers for career advancement.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Benefits of HVAC Careers</h2>
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
            <h2 className="text-2xl font-bold text-gray-900">Tips to Get Hired in HVAC Fast</h2>
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About HVAC Jobs</h2>
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
            The information provided on this page is for general informational purposes only and does not constitute legal or career advice. Salary data is from the U.S. Bureau of Labor Statistics. Certification requirements are governed by the EPA and state regulations. Always verify current licensing, pay rates and job details directly with employers or official government sources.
          </p>
        </section>
      </div>
    </>
  )
}