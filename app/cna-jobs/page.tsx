import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import {
  Briefcase,
  DollarSign,
  MapPin,
  CheckCircle,
  Heart,
  ShieldCheck,
  BookOpen,
  Clock,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'
import { searchJobs, getCachedJobCount } from '@/lib/adzuna'

export const metadata: Metadata = {
  title: 'CNA Jobs Hiring Immediately | Certified Nursing Assistant Positions Open Now',
  description: 'Thousands of CNA jobs are hiring right now across the United States. Certified Nursing Assistant positions available in hospitals, nursing homes, and home health agencies. Competitive pay, flexible shifts, and benefits. Apply today before these roles are filled.',
  keywords: 'cna jobs, certified nursing assistant jobs, cna jobs near me, cna hiring now, cna positions, nursing assistant jobs, cna jobs hospital, cna jobs nursing home',
  openGraph: {
    title: 'CNA Jobs Hiring Now | Certified Nursing Assistant Positions Needed Urgently',
    description: 'Hospitals and care facilities across the US are urgently hiring CNAs. Browse hundreds of Certified Nursing Assistant jobs with competitive pay and immediate start dates.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CNA Jobs | Certified Nursing Assistant Positions Hiring Now',
    description: 'Ready to make a difference? Find CNA jobs hiring immediately near you. Full-time, part-time, and per diem shifts available across all 50 states.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/cna-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'CNA Jobs',
  description: 'Find Certified Nursing Assistant jobs hiring now across the United States. Browse CNA positions in hospitals, nursing homes, and home health agencies.',
  url: 'https://www.oh-my-job.com/cna-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available CNA Jobs',
    description: 'Current Certified Nursing Assistant job listings across the United States',
  },
}

const workSettings = [
  {
    title: 'Hospitals',
    description: 'Acute care CNAs assist nurses and physicians in fast-paced hospital units including medical-surgical, ICU step-down, and emergency departments.',
    icon: Heart,
  },
  {
    title: 'Nursing Homes',
    description: 'Long-term care facilities consistently employ the largest share of CNAs, offering stable schedules and ongoing patient relationships.',
    icon: ShieldCheck,
  },
  {
    title: 'Home Health Agencies',
    description: 'Home health CNAs provide one-on-one care to patients in their residences, offering flexible scheduling and meaningful personal connections.',
    icon: MapPin,
  },
  {
    title: 'Assisted Living',
    description: 'Assisted living communities hire CNAs to support residents with daily activities while fostering independence and quality of life.',
    icon: Briefcase,
  },
  {
    title: 'Rehabilitation Centers',
    description: 'Short-term rehab facilities require CNAs to support patients recovering from surgery, stroke, or injury under the direction of physical and occupational therapists.',
    icon: TrendingUp,
  },
  {
    title: 'Hospice Care',
    description: 'Hospice CNAs provide compassionate end-of-life support to patients and their families, working within interdisciplinary care teams.',
    icon: Heart,
  },
]

const certificationSteps = [
  {
    step: '1',
    title: 'Complete a State-Approved Training Program',
    description: 'Federal law under the Omnibus Budget Reconciliation Act (OBRA) requires a minimum of 75 hours of training, though many states require significantly more. Programs are offered at community colleges, vocational schools, and healthcare facilities.',
  },
  {
    step: '2',
    title: 'Pass the Competency Evaluation',
    description: 'After training, candidates must pass a state competency exam consisting of a written or oral knowledge test and a hands-on skills evaluation. The National Nurse Aide Assessment Program (NNAAP) is used in most states.',
  },
  {
    step: '3',
    title: 'Get Listed on the State Registry',
    description: 'Upon passing the exam, your name is entered into your state Nurse Aide Registry. According to the Centers for Medicare and Medicaid Services (CMS), this registry is required for CNAs working in Medicare or Medicaid-certified facilities.',
  },
  {
    step: '4',
    title: 'Maintain Your Certification',
    description: 'CNA certifications must be renewed every two years in most states. Renewal typically requires proof of active employment as a CNA for at least eight hours during the renewal period.',
  },
]

const salaryByState = [
  { state: 'California', salary: '$42,000' },
  { state: 'New York', salary: '$39,000' },
  { state: 'Washington', salary: '$41,000' },
  { state: 'Massachusetts', salary: '$40,000' },
  { state: 'Texas', salary: '$31,000' },
  { state: 'Florida', salary: '$30,000' },
]

const faqs = [
  {
    question: 'How long does it take to become a CNA?',
    answer: 'Most CNA training programs take between four and twelve weeks to complete, depending on the state and whether you attend full-time or part-time. According to the U.S. Department of Labor, federal law mandates a minimum of 75 hours of combined classroom and clinical training before you can sit for the certification exam.',
  },
  {
    question: 'What does a Certified Nursing Assistant do every day?',
    answer: 'CNAs provide direct patient care under the supervision of licensed nurses. Daily responsibilities typically include assisting patients with bathing, dressing, grooming, and eating; measuring and recording vital signs; turning and repositioning bedridden patients to prevent pressure sores; and reporting changes in patient condition to nursing staff.',
  },
  {
    question: 'How much do CNAs earn on average in the United States?',
    answer: 'According to the U.S. Bureau of Labor Statistics Occupational Employment and Wage Statistics, the median annual wage for nursing assistants was $38,200 in May 2023. The highest-paid CNAs work in government settings and general medical and surgical hospitals, where median wages can exceed $45,000 per year.',
  },
  {
    question: 'Is CNA certification valid across all states?',
    answer: 'CNA certification is issued at the state level, meaning your certification is technically tied to the state where you tested. However, most states offer a reciprocity process that allows CNAs to transfer their certification without retesting, provided their registry status is in good standing and they have no substantiated findings of abuse, neglect, or misappropriation on their record.',
  },
  {
    question: 'Can a CNA work while studying to become an LPN or RN?',
    answer: 'Yes, and this is actually one of the most common career pathways in nursing. Many healthcare employers offer tuition reimbursement or education assistance programs specifically for CNAs who are pursuing LPN or RN licensure. Working as a CNA while in nursing school provides invaluable clinical experience and can make you a stronger candidate for nursing programs.',
  },
  {
    question: 'Are CNA jobs expected to grow in the coming years?',
    answer: 'According to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, employment of nursing assistants is projected to grow 4 percent from 2022 to 2032, roughly in line with the average for all occupations. An aging U.S. population and the resulting demand for long-term care services are key drivers of sustained hiring demand for CNAs nationwide.',
  },
]

const tips = [
  {
    title: 'Get CPR and First Aid Certified Before You Apply',
    description: 'Most employers require current CPR and Basic Life Support (BLS) certification before your first day. Having it ready when you apply makes you a more competitive candidate and can speed up your start date.',
  },
  {
    title: 'Highlight Soft Skills on Your Resume',
    description: 'Empathy, patience, attention to detail, and the ability to work under pressure are qualities hiring managers look for in CNAs. Even without clinical experience, examples from caregiving, volunteer work, or customer-facing roles demonstrate these qualities.',
  },
  {
    title: 'Consider Per Diem or Agency Work to Build Experience',
    description: 'Per diem and staffing agency CNA positions allow you to work in multiple care settings, build a broader skill set, and often earn a higher hourly rate. Many CNAs use agency work to find facilities they eventually join permanently.',
  },
  {
    title: 'Ask About Employer-Paid Training',
    description: 'Many hospitals and nursing homes offer free CNA training programs in exchange for a commitment to work at the facility for a set period. According to the American Health Care Association, this is one of the most common recruitment strategies in long-term care.',
  },
]

export default async function CnaJobsPage({ searchParams }: any) {
  const params = await searchParams

const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'certified nursing assistant', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'certified nursing assistant', where: params.where || '', results_per_page: 30, page: 1 }),
])
  

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            CNA Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="certified nursing assistant" />
          </aside>
          <div className="flex-1">
            {count > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">{count.toLocaleString()}</span> positions available
              </p>
            )}

            {/* Client wrapper isolé — pas de use client sur la page */}
                       <AIJobMatcherWrapper />
           
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'certified nursing assistant'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Work Settings */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Where CNAs Work Across the United States</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics, over 1.4 million nursing assistants are employed across a wide range of care settings in the United States. Whether you prefer the fast pace of a hospital or the relationship-focused environment of home health, there is a CNA role suited to your strengths.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workSettings.map((setting, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <setting.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{setting.title}</h3>
                <p className="text-gray-600 text-sm">{setting.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Certification Pathway */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">How to Become a Certified Nursing Assistant</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            CNA certification is governed at the state level but must meet federal minimum standards established by the Centers for Medicare and Medicaid Services (CMS). The pathway is straightforward and can be completed in a matter of weeks.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {certificationSteps.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-green-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 font-bold rounded-full text-sm mb-4">
                  {item.step}
                </span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Salary Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">How Much Do CNAs Earn?</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics Occupational Employment and Wage Statistics program, the median annual wage for nursing assistants in the United States was $38,200 in May 2023, equivalent to approximately $18.37 per hour. Pay varies significantly by state, employer type, and shift differential.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">$38,200</p>
                <p className="text-sm text-gray-600">Median Annual Wage (BLS 2023)</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-blue-600 mb-2">$18.37</p>
                <p className="text-sm text-gray-600">Median Hourly Rate</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-purple-600 mb-2">$49,000+</p>
                <p className="text-sm text-gray-600">Top 10% of Earners</p>
              </div>
            </div>
            <h3 className="font-semibold text-gray-800 mb-4">Average CNA Salary by State</h3>
            <div className="grid md:grid-cols-3 gap-3">
              {salaryByState.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-3 flex justify-between items-center">
                  <span className="text-sm text-gray-700 font-medium">{item.state}</span>
                  <span className="text-sm font-bold text-green-600">{item.salary}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics, May 2023. Figures are approximations and vary by employer, shift, and experience level.
            </p>
          </div>
        </section>

        {/* Career Ladder */}
        <section className="mt-20">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <TrendingUp className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">CNA as a Stepping Stone in Nursing</h2>
                <p className="text-gray-700 mb-4">
                  Working as a CNA is one of the most recognized entry points into a nursing career. Many employers offer tuition reimbursement and scheduling flexibility to support CNAs pursuing further education. The career ladder from CNA to licensed nurse is well-established across the U.S. healthcare system.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  {['CNA', 'LPN / LVN', 'RN (ADN or BSN)', 'RN Specialist / NP'].map((level, index, arr) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="bg-white border border-blue-200 rounded-lg px-4 py-2 text-sm font-semibold text-blue-700">
                        {level}
                      </div>
                      {index < arr.length - 1 && (
                        <span className="text-blue-400 font-bold hidden sm:block">→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Work Hours & Shifts */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">CNA Shift Types and Scheduling</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            CNA positions are available across a full range of shift types, making this one of the most schedule-flexible roles in healthcare. The shift you work will depend on the facility type and your personal availability.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { shift: 'Day Shift', time: '7:00 AM to 3:00 PM', note: 'Most common in nursing homes and rehab centers' },
              { shift: 'Evening Shift', time: '3:00 PM to 11:00 PM', note: 'Often includes a shift differential premium' },
              { shift: 'Night Shift', time: '11:00 PM to 7:00 AM', note: 'Higher differential pay; quieter environment' },
              { shift: 'Per Diem', time: 'Flexible / as needed', note: 'Higher hourly rate; choose your own schedule' },
            ].map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{item.shift}</p>
                <p className="text-blue-600 text-sm font-medium mb-2">{item.time}</p>
                <p className="text-gray-500 text-xs">{item.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Registry Warning */}
        <section className="mt-20">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Understanding the Nurse Aide Registry</h2>
                <p className="text-gray-700 mb-4">
                  Every state maintains a Nurse Aide Registry as required by federal law under the Nursing Home Reform Act. According to the Centers for Medicare and Medicaid Services, employers at Medicare or Medicaid-certified facilities are legally required to check this registry before hiring a CNA.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">What the Registry Tracks</h3>
                    <ul className="text-gray-600 text-sm space-y-2">
                      {[
                        'Active certification status and expiration date',
                        'Training program completed and test results',
                        'Substantiated findings of abuse or neglect',
                        'Employment history within certified facilities',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">How to Maintain Good Standing</h3>
                    <ul className="text-gray-600 text-sm space-y-2">
                      {[
                        'Renew your certification before it expires (every 2 years in most states)',
                        'Work at least 8 hours as a paid CNA during each renewal period',
                        'Complete any required continuing education for your state',
                        'Notify your state registry if your name or address changes',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing a CNA Job Quickly</h2>
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

        {/* FAQ */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About CNA Jobs</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group bg-white border border-gray-200 rounded-xl overflow-hidden">
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

        {/* Disclaimer */}
        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> The salary figures, employment projections, and regulatory information provided on this page are for general informational purposes only and do not constitute legal or career advice. CNA certification requirements, scope of practice, and wage rates vary by state and employer. Always consult your state Nurse Aide Registry, the Centers for Medicare and Medicaid Services at cms.gov, and the U.S. Bureau of Labor Statistics at bls.gov for the most current and applicable information.
          </p>
        </section>
      </div>
    </>
  )
}