import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, AlertTriangle, BookOpen, TrendingUp, ShieldCheck, Pill } from 'lucide-react'
import { searchJobs, getCachedJobCount, AdzunaSearchResult } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Pharmacy Technician Jobs | Retail & Hospital Openings',
  description: 'Thousands of pharmacy technician jobs are open right now across the United States. Retail, hospital, and compounding pharmacies are actively hiring. Competitive pay, benefits, and flexible shifts. Submit your application today before these positions are gone.',
  keywords: 'pharmacy technician jobs, pharmacy tech jobs, pharmacy technician hiring now, pharm tech jobs, hospital pharmacy technician, retail pharmacy technician jobs, pharmacy technician positions',
  openGraph: {
    title: 'Pharmacy Technician Jobs | Retail, Hospital & Specialty',
    description: 'Pharmacies across the US are urgently hiring technicians. Browse hundreds of pharmacy tech jobs with competitive pay and immediate start dates. Apply today.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pharmacy Technician Jobs | Full-Time & Part-Time Shifts',
    description: 'Find pharmacy technician jobs hiring now near you. Full-time, part-time, and per diem positions available in retail, hospital, and specialty pharmacy settings.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/pharmacy-technician-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Pharmacy Technician Jobs',
  description: 'Find pharmacy technician jobs hiring now across the United States. Browse positions in retail, hospital, compounding, and specialty pharmacy settings.',
  url: 'https://www.oh-my-job.com/pharmacy-technician-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Pharmacy Technician Jobs',
    description: 'Current pharmacy technician job listings across the United States',
  },
}

const workSettings = [
  {
    title: 'Retail Pharmacy',
    description: 'Chain pharmacies such as CVS, Walgreens, and Rite Aid employ the largest share of pharmacy technicians, offering consistent scheduling and employee benefits.',
    icon: Briefcase,
  },
  {
    title: 'Hospital Pharmacy',
    description: 'Inpatient hospital pharmacy technicians prepare IV medications, assist clinical pharmacists, and support dispensing in acute care environments with premium pay scales.',
    icon: ShieldCheck,
  },
  {
    title: 'Compounding Pharmacy',
    description: 'Compounding technicians prepare customized medications for patients with unique dosing requirements, working in highly specialized and regulated settings.',
    icon: Pill,
  },
  {
    title: 'Mail Order and Specialty Pharmacy',
    description: 'Specialty pharmacy technicians manage high-cost biologic and oncology medications, often coordinating directly with insurance providers and patient assistance programs.',
    icon: MapPin,
  },
  {
    title: 'Long Term Care Pharmacy',
    description: 'LTC pharmacy technicians prepare and package medications for nursing homes and assisted living facilities, typically working in central dispensing operations.',
    icon: Clock,
  },
  {
    title: 'Government and Federal Pharmacy',
    description: 'VA hospitals, military installations, and Indian Health Service facilities employ pharmacy technicians under federal civil service classifications with strong benefits packages.',
    icon: Shield,
  },
]

const certificationSteps = [
  {
    step: '1',
    title: 'Meet the Basic Eligibility Requirements',
    description: 'According to the Pharmacy Technician Certification Board (PTCB), candidates must hold a high school diploma or equivalent and have no felony convictions. Some states impose additional requirements, so checking your state board of pharmacy regulations is essential before applying.',
  },
  {
    step: '2',
    title: 'Complete a Training Program or Gain Work Experience',
    description: 'Candidates may qualify through either a PTCB-recognized education or training program, or through equivalent work experience. The American Society of Health-System Pharmacists (ASHP) accredits programs at community colleges and vocational schools across the country.',
  },
  {
    step: '3',
    title: 'Pass the PTCE or ExCPT Exam',
    description: 'The two nationally recognized certification exams are the Pharmacy Technician Certification Exam (PTCE), administered by the PTCB, and the Exam for Certification of Pharmacy Technicians (ExCPT), administered by the National Healthcareer Association. Both are accepted by most employers and state boards.',
  },
  {
    step: '4',
    title: 'Register with Your State Board of Pharmacy',
    description: 'Most states require pharmacy technicians to register or obtain a license through the state board of pharmacy. Requirements vary significantly; some states mandate certification before registration while others allow on-the-job training pathways. The National Association of Boards of Pharmacy (NABP) provides a directory of all state board requirements.',
  },
]

const salaryByState = [
  { state: 'California', salary: '$52,000' },
  { state: 'Washington', salary: '$50,000' },
  { state: 'Alaska', salary: '$49,000' },
  { state: 'Oregon', salary: '$47,000' },
  { state: 'New York', salary: '$46,000' },
  { state: 'Texas', salary: '$38,000' },
]

const faqs = [
  {
    question: 'Do pharmacy technicians need to be licensed in every state?',
    answer: 'Licensing and registration requirements for pharmacy technicians are determined at the state level. According to the National Association of Boards of Pharmacy (NABP), the majority of states require technicians to register with the state board of pharmacy before beginning work. Some states additionally require national certification through the PTCB or NHA. You can review your specific state requirements through the NABP directory at nabp.pharmacy.',
  },
  {
    question: 'What is the difference between a registered and a certified pharmacy technician?',
    answer: 'Registration means the state board of pharmacy has recorded your information and authorized you to work as a technician in that state. Certification refers to passing a national competency exam, either the PTCE from the Pharmacy Technician Certification Board or the ExCPT from the National Healthcareer Association. Many states now require or strongly prefer certified technicians, and certified technicians typically earn higher wages.',
  },
  {
    question: 'How much do pharmacy technicians earn on average in the United States?',
    answer: 'According to the U.S. Bureau of Labor Statistics Occupational Employment and Wage Statistics program, the median annual wage for pharmacy technicians was $40,300 in May 2023, equivalent to approximately $19.37 per hour. Hospital pharmacy technicians and those in specialty settings consistently earn above the national median, with top earners exceeding $57,000 per year.',
  },
  {
    question: 'Is demand for pharmacy technicians expected to grow?',
    answer: 'According to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, employment of pharmacy technicians is projected to grow 6 percent from 2022 to 2032, faster than the average for all occupations. The aging U.S. population, expansion of pharmacist clinical roles, and growth in specialty and mail-order pharmacy are all cited as key drivers of sustained hiring demand.',
  },
  {
    question: 'Can pharmacy technicians work in states other than where they were certified?',
    answer: 'National certification through the PTCB or NHA is recognized across state lines, but state registration or licensure is jurisdiction-specific. If you relocate, you will generally need to apply for registration or licensure in your new state. Some states have streamlined reciprocity or endorsement processes for technicians in good standing. The NABP can assist with verifying credentials across states.',
  },
  {
    question: 'What tasks can a pharmacy technician legally perform?',
    answer: 'The scope of practice for pharmacy technicians is defined by state law and varies by jurisdiction. Common duties include receiving and processing prescription orders, counting and labeling medications, managing inventory, processing insurance claims, and preparing sterile compounded preparations under pharmacist supervision. According to the PTCB, technicians may not perform clinical judgment tasks, which are reserved for licensed pharmacists.',
  },
]

const tips = [
  {
    title: 'Obtain National Certification Before Applying',
    description: 'Even in states where certification is not yet mandatory, holding a CPhT credential from the PTCB or NHA significantly strengthens your application and positions you for higher starting wages. Many employers offer pay differentials for certified technicians.',
  },
  {
    title: 'Familiarize Yourself with Pharmacy Software',
    description: 'Employers frequently list experience with pharmacy management systems such as QS1, PioneerRx, or Epic Willow as a preferred qualification. Free tutorials and community college courses can help you build familiarity before your first interview.',
  },
  {
    title: 'Highlight Attention to Detail and Math Skills',
    description: 'Accuracy in medication preparation is a non-negotiable requirement in pharmacy settings. In your resume and interviews, give concrete examples of situations where precision and methodical work prevented errors or improved outcomes.',
  },
  {
    title: 'Ask About Employer-Sponsored Certification Programs',
    description: 'Many large pharmacy chains and health systems offer tuition reimbursement or paid study time for technicians pursuing the PTCE. Starting a position as an unregistered trainee and earning certification on the job is a recognized and common pathway into the profession.',
  },
]

export default async function PharmacyTechnicianJobsPage({ searchParams }: any) {
  const params = await searchParams

  const [{ count }, initialData] = await Promise.all([
  getMergedJobCount(params.what || 'pharmacy technician', params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
  searchMergedJobs({ what: params.what || 'pharmacy technician', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
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
            Pharmacy Technician Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="pharmacy technician" />
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
                what={params.what || 'pharmacy technician'}
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
            <h2 className="text-2xl font-bold text-gray-900">Where Pharmacy Technicians Work Across the United States</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics, approximately 421,000 pharmacy technicians are employed across the United States, working in a wide variety of settings. Each environment offers a distinct daily experience, compensation structure, and advancement path.
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
            <h2 className="text-2xl font-bold text-gray-900">How to Become a Certified Pharmacy Technician</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Pharmacy technician certification is administered nationally by the Pharmacy Technician Certification Board (PTCB) and the National Healthcareer Association (NHA), with additional licensing requirements set by each state board of pharmacy. The pathway is accessible and can be completed alongside employment in many states.
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
            <h2 className="text-2xl font-bold text-gray-900">How Much Do Pharmacy Technicians Earn?</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics Occupational Employment and Wage Statistics program, the median annual wage for pharmacy technicians was $40,300 in May 2023. Hospital and government pharmacy settings consistently pay above the national median, with top earners in specialized roles exceeding $57,000 annually.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">$40,300</p>
                <p className="text-sm text-gray-600">Median Annual Wage (BLS 2023)</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-blue-600 mb-2">$19.37</p>
                <p className="text-sm text-gray-600">Median Hourly Rate</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-purple-600 mb-2">$57,000+</p>
                <p className="text-sm text-gray-600">Top 10% of Earners</p>
              </div>
            </div>
            <h3 className="font-semibold text-gray-800 mb-4">Average Pharmacy Technician Salary by State</h3>
            <div className="grid md:grid-cols-3 gap-3">
              {salaryByState.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-3 flex justify-between items-center">
                  <span className="text-sm text-gray-700 font-medium">{item.state}</span>
                  <span className="text-sm font-bold text-green-600">{item.salary}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics, May 2023. Figures are approximations and vary by employer, setting, and experience level.
            </p>
          </div>
        </section>

        {/* Career Ladder */}
        <section className="mt-20">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <TrendingUp className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Career Advancement for Pharmacy Technicians</h2>
                <p className="text-gray-700 mb-4">
                  A pharmacy technician role is both a stable career in its own right and a recognized entry point toward pharmacist licensure. Many health systems offer tuition assistance for technicians pursuing a Doctor of Pharmacy (PharmD) degree. Advanced technician roles such as lead technician, sterile compounding specialist, and pharmacy informatics technician are also available to experienced professionals.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  {['Trainee Tech', 'Registered Tech', 'CPhT (Certified)', 'Lead / Specialist', 'PharmD'].map((level, index, arr) => (
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

        {/* Scope of Practice Warning */}
        <section className="mt-20">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Legal Scope of Practice for Pharmacy Technicians</h2>
                <p className="text-gray-700 mb-4">
                  The legal scope of practice for pharmacy technicians is governed by each state board of pharmacy and may not be exceeded regardless of employer instruction. According to the National Association of Boards of Pharmacy, the following tasks are universally reserved for licensed pharmacists and may not be delegated to technicians.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    'Final verification of a dispensed prescription',
                    'Clinical drug therapy review and counseling',
                    'Interpreting or clarifying a prescriber order without pharmacist oversight',
                    'Performing a drug utilization review',
                    'Providing patient counseling on drug interactions or side effects',
                    'Authorizing prescription transfers between pharmacies',
                    'Making therapeutic substitution decisions',
                    'Approving compounded preparation formulas without pharmacist sign-off',
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <span className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sterile Compounding */}
        <section className="mt-20">
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <FileText className="w-8 h-8 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">USP 797 and Sterile Compounding Compliance</h2>
                <p className="text-gray-700 mb-4">
                  Pharmacy technicians working in hospital or compounding settings are often required to be trained and tested under USP Chapter 797, the federal standard for sterile pharmaceutical compounding established by the United States Pharmacopeia. According to the Food and Drug Administration, compliance with USP 797 is mandatory for all facilities preparing sterile products.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">What USP 797 Training Covers</h3>
                    <ul className="text-gray-600 text-sm space-y-2">
                      {[
                        'Aseptic technique and cleanroom behavior',
                        'Garbing and hand hygiene protocols',
                        'Beyond-use dating and labeling requirements',
                        'Environmental monitoring and documentation',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Why This Skill Commands Higher Pay</h3>
                    <ul className="text-gray-600 text-sm space-y-2">
                      {[
                        'IV room technicians earn 15 to 25 percent above floor technician rates',
                        'Demand for sterile compounding expertise is growing in oncology and infusion',
                        'PTCB offers a dedicated Compounded Sterile Preparation Tech certification',
                        'Hospital systems prioritize USP 797 trained candidates in hiring',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
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
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing a Pharmacy Technician Job Quickly</h2>
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
            <Shield className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Pharmacy Technician Jobs</h2>
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
            <strong>Disclaimer:</strong> The salary figures, employment projections, and regulatory information provided on this page are for general informational purposes only and do not constitute legal or career advice. Pharmacy technician licensing requirements, scope of practice, and wage rates vary by state and employer. Always consult your state board of pharmacy, the National Association of Boards of Pharmacy at nabp.pharmacy, the Pharmacy Technician Certification Board at ptcb.org, and the U.S. Bureau of Labor Statistics at bls.gov for the most current and applicable information.
          </p>
        </section>
      </div>
    </>
  )
}