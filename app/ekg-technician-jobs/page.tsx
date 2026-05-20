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
  title: 'EKG Technician Jobs | Earn $67K+ as a Cardiac Tech',
  description: 'EKG technician positions at hospitals and cardiology clinics, paying up to $67K. Paid training included — no prior clinical experience needed.',
  keywords: 'ekg technician jobs, ekg tech jobs, electrocardiogram technician jobs, cardiac monitor tech jobs, ekg technician hiring now, telemetry technician jobs',
  openGraph: {
    title: 'EKG Technician Jobs | $67K+ Cardiac Tech Positions',
    description: 'Real EKG technician positions available right now. Competitive wages, benefits and quick advancement. Get hired fast!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EKG Technician Jobs | Hospital & Clinic Openings',
    description: 'Hundreds of EKG technician jobs open today. $67k+ potential, paid training and immediate start dates. Apply in minutes!',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/ekg-technician-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'EKG Technician Jobs',
  description: 'Find EKG technician jobs hiring now across the United States. High demand healthcare positions with excellent pay and benefits.',
  url: 'https://www.oh-my-job.com/ekg-technician-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available EKG Technician Jobs',
    description: 'Current EKG technician and cardiac monitor positions hiring immediately',
  },
}

const popularRoles = [
  { title: 'EKG Technician', description: 'Perform electrocardiogram tests and assist cardiologists in clinics and hospitals', icon: Briefcase },
  { title: 'Cardiac Monitor Technician', description: 'Monitor patient heart rhythms in telemetry units', icon: Users },
  { title: 'Holter Monitor Specialist', description: 'Apply and analyze 24-48 hour ambulatory heart monitors', icon: Award },
  { title: 'Stress Test Technician', description: 'Assist with exercise and pharmacological stress testing', icon: Shield },
  { title: 'Telemetry Technician', description: 'Remote monitoring of multiple patients in critical care', icon: FileText },
]

const benefits = [
  { title: 'High Demand', description: 'Steady work in hospitals, clinics and diagnostic centers' },
  { title: 'Competitive Pay', description: 'Above-average wages plus shift differentials and overtime' },
  { title: 'Paid Training', description: 'Company-sponsored certification and on-the-job training' },
  { title: 'Healthcare Benefits', description: 'Medical, dental, vision and retirement plans' },
  { title: 'Career Growth', description: 'Path to senior tech, lead or cardiology management roles' },
]

const faqs = [
  {
    question: 'Do EKG technician jobs require prior experience?',
    answer: 'Many entry-level EKG technician positions do not require previous experience. Employers often provide paid training and help you obtain the necessary certifications.',
  },
  {
    question: 'What is the average salary for EKG technicians?',
    answer: 'According to the U.S. Bureau of Labor Statistics, the median annual wage for cardiovascular technologists and technicians (including EKG technicians) was $67,260 in May 2024. Pay varies by location, experience and certifications.',
  },
  {
    question: 'Is certification required for EKG technician jobs?',
    answer: 'While not always mandatory, certification is highly preferred. The two main credentials are the Certified Cardiographic Technician (CCT) from Cardiovascular Credentialing International (CCI) and the Certified EKG Technician (CET) from the National Healthcareer Association (NHA).',
  },
  {
    question: 'Are EKG technician jobs available nationwide?',
    answer: 'Yes. Hospitals, clinics and diagnostic centers across all 50 states hire EKG technicians daily, with strong demand in both urban and rural areas.',
  },
  {
    question: 'How quickly can I start an EKG technician job?',
    answer: 'Many candidates complete the application, interview and basic training within 1-2 weeks. Some facilities offer immediate start dates while you finish certification.',
  },
]

const applicationTips = [
  {
    title: 'Get Certified First',
    description: 'Obtain your BLS (CPR) from the American Heart Association and pursue CCT or CET certification. Many employers reimburse the cost after hiring.',
  },
  {
    title: 'Highlight Healthcare Experience',
    description: 'Mention any patient care, customer service or medical assistant background even if not in cardiology.',
  },
  {
    title: 'Apply to Hospitals and Clinics',
    description: 'Large health systems and outpatient diagnostic centers hire year-round. Check both hospital career pages and major job boards.',
  },
  {
    title: 'Prepare for Background and Drug Screening',
    description: 'Most healthcare roles require a clean background check, drug screening and proof of immunizations.',
  },
]




  export default async function EKGTechnicianJobsPage(props: {
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
  getMergedJobCount(params.what || 'ekg technician jobs', params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
  searchMergedJobs({ what: params.what || 'ekg technician jobs', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
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
            EKG Technician Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="ekg technician jobs" />
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
                what={params.what || 'ekg technician jobs'}
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
            <h2 className="text-2xl font-bold text-gray-900">Popular EKG Technician Job Roles</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            EKG technicians work in hospitals, clinics and diagnostic centers performing critical heart monitoring tests.
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
            <h2 className="text-2xl font-bold text-gray-900">How Much Can You Earn as an EKG Technician?</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics, the median annual wage for cardiovascular technologists and technicians (including EKG technicians) was $67,260 in May 2024. Many technicians earn more with overtime, night shifts and certifications.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">$67,260</p>
                <p className="text-sm text-gray-600">Median Annual (BLS 2024)</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-blue-600 mb-2">$32.34</p>
                <p className="text-sm text-gray-600">Median Hourly</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-purple-600 mb-2">Strong</p>
                <p className="text-sm text-gray-600">Demand Nationwide</p>
              </div>
            </div>
          </div>
        </section>

        {/* Certifications Section */}
        <section className="mt-20 bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <FileText className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Required Certifications for EKG Technician Jobs</h2>
              <p className="text-gray-700 mb-4">
                Certification is the fastest way to stand out. The two most recognized credentials are the Certified Cardiographic Technician (CCT) from Cardiovascular Credentialing International (CCI) and the Certified EKG Technician (CET) from the National Healthcareer Association (NHA).
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white rounded-lg p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">Essential Certifications</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" /> Basic Life Support (BLS) – American Heart Association</li>
                    <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" /> CCT – Cardiovascular Credentialing International</li>
                    <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" /> CET – National Healthcareer Association</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">Employer Support</h3>
                  <p className="text-gray-600 text-sm">Many hospitals and clinics reimburse certification costs and provide paid training to help you become certified quickly.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Benefits of EKG Technician Careers</h2>
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
            <h2 className="text-2xl font-bold text-gray-900">Tips to Get Hired as an EKG Technician Fast</h2>
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About EKG Technician Jobs</h2>
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
            The information provided on this page is for general informational purposes only and does not constitute legal or career advice. Salary data is from the U.S. Bureau of Labor Statistics (May 2024). Certification requirements are governed by the National Healthcareer Association and Cardiovascular Credentialing International. Always verify current licensing, pay rates and job details directly with employers or official sources.
          </p>
        </section>
      </div>
    </>
  )
}