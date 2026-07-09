import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, TrendingUp, DollarSign, FileText, Shield, CheckCircle, Users } from 'lucide-react'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Patient Care Technician Jobs | PCT Roles in Hospitals & Clinics',
  description: 'PCT openings at hospitals, clinics, and long-term care — entry-level positions with on-the-job training and first-day benefit eligibility.',
  keywords: 'patient care technician jobs, pct jobs, patient care tech careers, hospital pct jobs, cna pct jobs, dialysis technician jobs, hiring now, healthcare jobs',
  openGraph: {
    title: 'Patient Care Technician Jobs | PCT Openings Nationwide',
    description: 'Explore thousands of Patient Care Technician positions available right now in the US. Hospitals and clinics actively hiring. Competitive salaries and immediate start dates. Apply today!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Patient Care Technician Jobs | Entry-Level Healthcare',
    description: 'Ready to start a rewarding healthcare career? Thousands of Patient Care Technician jobs available immediately. Apply now!',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/pct-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Patient Care Technician Jobs',
  description: 'Find urgent Patient Care Technician jobs hiring now across the United States. Browse hospital, clinic and long-term care positions with immediate openings.',
  url: 'https://www.oh-my-job.com/pct-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Patient Care Technician Jobs',
    description: 'Current Patient Care Technician job listings with immediate hiring needs',
  },
}

const popularRoles = [
  { title: 'Hospital Patient Care Technician', description: 'Assist nurses with vital signs, blood draws and patient mobility in acute care settings' },
  { title: 'Dialysis Patient Care Technician', description: 'Operate dialysis machines and monitor patients during treatments' },
  { title: 'Long-Term Care PCT', description: 'Provide daily care and support for residents in nursing homes and assisted living' },
  { title: 'Emergency Department PCT', description: 'Support fast-paced ER teams with triage and basic life support' },
  { title: 'Telemetry Patient Care Technician', description: 'Monitor cardiac rhythms and assist with cardiac patients' },
  { title: 'Pediatric Patient Care Technician', description: 'Specialized care for children in pediatric units and clinics' },
]

const jobOutlookData = [
  { fact: 'Annual Openings', value: 'Hundreds of thousands', details: 'In nursing assistant and PCT roles' },
  { fact: 'Job Growth', value: '4%', details: 'From 2024 to 2034' },
  { fact: 'Median Salary', value: '$38,200', details: 'National average for nursing assistants and orderlies' },
]

const salaryData = [
  { role: 'Patient Care Technicians', salary: '$38,200', note: 'Median annual wage (2024)' },
  { role: 'Experienced / Certified PCTs', salary: '$48,000–$65,000', note: 'In high-demand hospitals' },
]

const faqs = [
  {
    question: 'Do I need a degree for Patient Care Technician jobs?',
    answer: 'According to the U.S. Bureau of Labor Statistics, most Patient Care Technician positions require only a high school diploma plus short-term on-the-job training or a state-approved certification program.',
  },
  {
    question: 'What is the average salary for Patient Care Technician jobs?',
    answer: 'The U.S. Bureau of Labor Statistics reports a median annual wage of $38,200 for nursing assistants and orderlies as of May 2024. Certified Patient Care Technicians in hospitals and dialysis centers often earn significantly more.',
  },
  {
    question: 'What certifications are required for PCT jobs?',
    answer: 'Most employers require Basic Life Support (BLS) certification and a state nursing assistant or Patient Care Technician certification. According to the U.S. Department of Labor, many states also require phlebotomy or EKG training for advanced PCT roles.',
  },
  {
    question: 'Can I become a Patient Care Technician without experience?',
    answer: 'Yes. Many hospitals offer paid training programs for entry-level candidates. The U.S. Bureau of Labor Statistics notes that formal education is not always required, making this an accessible entry point into healthcare.',
  },
  {
    question: 'Are Patient Care Technician jobs in high demand?',
    answer: 'Yes. The U.S. Bureau of Labor Statistics projects steady growth for nursing assistants and orderlies through 2034 due to an aging population and increased need for hospital and long-term care staff.',
  },
]

const applicationTips = [
  {
    title: 'Get Certified Quickly',
    description: 'Complete a state-approved CNA or PCT program (often 4–12 weeks) and obtain BLS certification. Many employers reimburse training costs.',
  },
  {
    title: 'Highlight Healthcare Experience',
    description: 'Include any volunteer work, caregiving or customer service roles. Hospitals value compassion and reliability even without prior medical experience.',
  },
  {
    title: 'Prepare for Background Checks',
    description: 'Most facilities require a clean criminal background check and drug screening. Having these ready speeds up the hiring process.',
  },
  {
    title: 'Target High-Volume Employers',
    description: 'Apply directly to major hospital systems and dialysis centers. Many post hundreds of Patient Care Technician openings each month.',
  },
]



  export default async function PatientCareTechnicianJobsPage(props: {
  searchParams: Promise<{
    what?: string
    where?: string
    salary_min?: string   // ← uniquement string | undefined (natif Next.js)
  }>
}) {
  const params = await props.searchParams


    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'Patient Care Technician', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'Patient Care Technician', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
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
            Patient Care Technician Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="Patient Care Technician" />
          </aside>
          <div className="flex-1">

            {/* Count */}

            {/* AI Matcher */}
            

            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'Patient Care Technician'}
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
            <TrendingUp className="w-7 h-7 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-900">Patient Care Technician Job Outlook</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics, employment of nursing assistants and orderlies is projected to grow 4 percent from 2024 to 2034. Patient Care Technicians remain in high demand in hospitals, dialysis centers and long-term care facilities.
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
            Source: U.S. Bureau of Labor Statistics, Occupational Outlook Handbook, Nursing Assistants and Orderlies, updated 2025
          </p>
        </section>

        {/* Popular Roles Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Popular Patient Care Technician Roles</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Patient Care Technicians work in a variety of healthcare settings. The following roles currently offer the highest number of immediate openings.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularRoles.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <Users className="w-10 h-10 text-blue-600 mb-4" />
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
            <h2 className="text-2xl font-bold text-gray-900">Patient Care Technician Salaries</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              The U.S. Bureau of Labor Statistics reports strong earning potential for certified Patient Care Technicians, especially in specialized units or high-demand regions.
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

        {/* Certifications Section */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <FileText className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Certifications for Patient Care Technician Jobs</h2>
              <p className="text-gray-700 mb-4">
                According to the U.S. Bureau of Labor Statistics, most employers require Basic Life Support (BLS) certification and a state-approved nursing assistant or Patient Care Technician credential.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Essential Certifications</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Basic Life Support (BLS) / CPR</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>State CNA or PCT certification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Phlebotomy certification (preferred)</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Valuable Additional Credentials</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>EKG / Telemetry certification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Dialysis technician certification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Patient Safety and HIPAA training</span>
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
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing Patient Care Technician Jobs</h2>
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Patient Care Technician Jobs</h2>
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

        {/* General Disclaimer */}
        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and is based on data from the U.S. Bureau of Labor Statistics. Job market conditions, salaries and requirements can vary by location and employer. Always verify the latest details directly on bls.gov or with the specific employer before applying.
          </p>
        </section>
      </div>
    </>
  )
}