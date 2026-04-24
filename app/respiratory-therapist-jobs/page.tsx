import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, DollarSign, CheckCircle, Shield, Clock, Users, TrendingUp, FileText, Award, Star, AlertTriangle } from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Respiratory Therapist Jobs Needed ASAP | Hospitals Urgently Hiring RT Professionals',
  description: 'Respiratory therapist positions are critically needed at hospitals and healthcare facilities across the US! Browse 800+ immediate openings for RTs, CRTs, and RRTs. Competitive salaries, sign-on bonuses, and strong career growth. Apply today!',
  keywords: 'respiratory therapist jobs, RT jobs, respiratory therapist hiring, CRT jobs, RRT jobs, respiratory care jobs, respiratory therapist positions, travel respiratory therapist jobs',
  openGraph: {
    title: 'Respiratory Therapist Jobs Needed ASAP | Urgently Hiring RTs Nationwide',
    description: 'Hospitals and health systems across the US urgently need respiratory therapists. 800+ immediate openings for CRTs and RRTs. Excellent pay, sign-on bonuses, and travel options. Apply now!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Respiratory Therapist Jobs | Urgently Hiring Nationwide',
    description: 'Urgent demand for respiratory therapists at hospitals across the US. CRT and RRT openings with competitive pay and sign-on bonuses. Find your role today.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/respiratory-therapist-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Respiratory Therapist Jobs',
  description: 'Find respiratory therapist jobs hiring now across the United States. Browse CRT, RRT, and travel respiratory therapist openings at hospitals, ICUs, and pulmonary care settings.',
  url: 'https://www.oh-my-job.com/respiratory-therapist-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Respiratory Therapist Job Opportunities',
    description: 'Current respiratory therapist job listings across hospitals, health systems, and specialty care settings in the United States',
  },
}

const rtRoles = [
  {
    title: 'Staff Respiratory Therapist',
    description: 'Provide day to day respiratory care including ventilator management, oxygen therapy, and bronchodilator treatments in hospital settings',
    icon: Briefcase,
  },
  {
    title: 'ICU Respiratory Therapist',
    description: 'Manage critically ill patients on mechanical ventilation in intensive care units, collaborating closely with intensivists and critical care nurses',
    icon: AlertTriangle,
  },
  {
    title: 'Neonatal and Pediatric RT',
    description: 'Deliver specialized respiratory care to premature infants, newborns, and pediatric patients in NICUs and pediatric ICUs',
    icon: Users,
  },
  {
    title: 'Pulmonary Rehabilitation Therapist',
    description: 'Design and implement exercise and education programs for patients with chronic obstructive pulmonary disease, asthma, and other lung conditions',
    icon: TrendingUp,
  },
  {
    title: 'Sleep Disorder Specialist RT',
    description: 'Conduct polysomnography studies and manage CPAP and BiPAP therapy for patients diagnosed with sleep apnea and related disorders',
    icon: Star,
  },
  {
    title: 'Travel Respiratory Therapist',
    description: 'Work temporary assignments at hospitals nationwide through staffing agencies, often earning significantly higher compensation than permanent staff',
    icon: Shield,
  },
]

const keyDuties = [
  'Assess patients with breathing or cardiopulmonary disorders and develop individualized care plans',
  'Initiate, manage, and wean patients from mechanical ventilation in acute and critical care settings',
  'Administer aerosol medications, bronchodilators, and oxygen therapy as prescribed',
  'Perform and interpret pulmonary function tests and arterial blood gas analyses',
  'Respond to and assist in managing respiratory emergencies and code events',
  'Educate patients and families on disease management, inhaler technique, and home oxygen use',
  'Collaborate with physicians, nurses, and interdisciplinary teams on respiratory care protocols',
  'Maintain and troubleshoot ventilators, CPAP machines, and other respiratory equipment',
]

const salaryData = [
  { role: 'Entry Level CRT', low: '$48,000', high: '$68,000', median: '$57,000' },
  { role: 'Staff RRT (Hospital)', low: '$58,000', high: '$88,000', median: '$72,000' },
  { role: 'ICU Respiratory Therapist', low: '$65,000', high: '$100,000', median: '$80,000' },
  { role: 'Neonatal RT (NICU)', low: '$68,000', high: '$105,000', median: '$84,000' },
  { role: 'Travel Respiratory Therapist', low: '$80,000', high: '$130,000', median: '$105,000' },
  { role: 'Lead RT / Supervisor', low: '$72,000', high: '$110,000', median: '$88,000' },
]

const topEmployers = [
  { name: 'HCA Healthcare', type: 'Hospital System', positions: 'Staff RT, ICU RT, Respiratory Care Supervisor' },
  { name: 'Ascension Health', type: 'Hospital System', positions: 'Respiratory Therapist, Pulmonary Rehab Specialist' },
  { name: 'CommonSpirit Health', type: 'Hospital System', positions: 'CRT, RRT, Neonatal Respiratory Therapist' },
  { name: 'Kaiser Permanente', type: 'Integrated Health System', positions: 'Respiratory Care Practitioner, Sleep Lab RT' },
  { name: 'AMR / Global Medical Response', type: 'Emergency Services', positions: 'Critical Care Transport RT, Air Medical RT' },
  { name: 'Aya Healthcare / AMN Healthcare', type: 'Travel Staffing', positions: 'Travel RT, Contract Respiratory Therapist' },
]

const certifications = [
  {
    name: 'Certified Respiratory Therapist (CRT)',
    issuer: 'National Board for Respiratory Care (NBRC)',
    description: 'The entry level national credential for respiratory therapists in the United States, required for licensure in most states. According to the NBRC, the CRT exam validates foundational clinical competency in respiratory care practice.',
  },
  {
    name: 'Registered Respiratory Therapist (RRT)',
    issuer: 'National Board for Respiratory Care (NBRC)',
    description: 'The advanced national credential that most hospitals require for ICU, neonatal, and supervisory roles. RRT certified therapists consistently earn higher salaries and have access to a broader range of specialized positions.',
  },
  {
    name: 'Neonatal and Pediatric Specialty (NPS)',
    issuer: 'National Board for Respiratory Care (NBRC)',
    description: 'A specialty credential for respiratory therapists working in NICUs and pediatric critical care units. The NPS designation is highly valued by children\'s hospitals and level III and IV neonatal centers nationwide.',
  },
  {
    name: 'Adult Critical Care Specialty (ACCS)',
    issuer: 'National Board for Respiratory Care (NBRC)',
    description: 'Demonstrates advanced competency in the management of adult critically ill patients requiring mechanical ventilation and complex cardiopulmonary support. Widely sought by ICUs and trauma centers.',
  },
]

const stateRequirements = [
  {
    requirement: 'State Licensure',
    detail: 'According to the American Association for Respiratory Care (AARC), all 50 states and the District of Columbia require respiratory therapists to be licensed or registered to practice. Licensing requirements vary by state but typically require passing the NBRC CRT or RRT examination.',
  },
  {
    requirement: 'Education Requirement',
    detail: 'According to the U.S. Bureau of Labor Statistics, respiratory therapists must complete an accredited associate or bachelor\'s degree program in respiratory therapy. Programs are accredited by the Commission on Accreditation for Respiratory Care (CoARC).',
  },
  {
    requirement: 'Continuing Education',
    detail: 'Most state licensing boards require respiratory therapists to complete continuing education units (CEUs) as a condition of license renewal, typically every two years. Requirements vary by state.',
  },
  {
    requirement: 'BLS and ACLS Certification',
    detail: 'Basic Life Support (BLS) certification is required before clinical practice in virtually all settings. Advanced Cardiovascular Life Support (ACLS) is required for ICU and critical care roles by the majority of hospital employers.',
  },
]

const faqs = [
  {
    question: 'What does a respiratory therapist do?',
    answer: 'According to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, respiratory therapists evaluate, treat, and care for patients with breathing and cardiopulmonary disorders. They work under the direction of physicians to manage patients on mechanical ventilators, administer inhaled medications, conduct pulmonary function tests, and respond to respiratory emergencies in hospitals and other healthcare settings.',
  },
  {
    question: 'How do I become a respiratory therapist in the United States?',
    answer: 'According to the U.S. Bureau of Labor Statistics, becoming a respiratory therapist requires completing an accredited associate or bachelor\'s degree program in respiratory therapy, passing the National Board for Respiratory Care (NBRC) CRT examination, and obtaining a state license. Most employers additionally require or strongly prefer the advanced RRT credential. The entire process from enrollment to first job typically takes two to four years.',
  },
  {
    question: 'How much do respiratory therapists earn?',
    answer: 'According to the U.S. Bureau of Labor Statistics Occupational Employment and Wage Statistics program, the median annual wage for respiratory therapists is approximately $70,000 to $75,000 nationally. Specialized roles in neonatal ICUs and adult critical care units, as well as travel positions, command significantly higher compensation, with experienced RRTs often earning $85,000 to $130,000 per year.',
  },
  {
    question: 'Is there a shortage of respiratory therapists in the US?',
    answer: 'Yes. According to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, employment of respiratory therapists is projected to grow much faster than the average for all occupations through 2032. An aging population, high prevalence of chronic lung diseases such as COPD and asthma, and sustained demand for critical care staffing are all driving significant shortages of qualified RTs across the country.',
  },
  {
    question: 'What is the difference between a CRT and an RRT?',
    answer: 'According to the National Board for Respiratory Care (NBRC), the Certified Respiratory Therapist (CRT) is the entry level credential while the Registered Respiratory Therapist (RRT) is the advanced credential requiring additional clinical knowledge and examination performance. Most ICU, neonatal, and supervisory positions require the RRT. Many states accept the CRT for licensure but employers in high acuity settings typically require or strongly prefer the RRT designation.',
  },
  {
    question: 'Are travel respiratory therapist jobs worth it?',
    answer: 'Travel respiratory therapist positions are among the highest paying in the profession. According to industry data, travel RTs frequently earn 30% to 60% more than permanent staff in equivalent roles, particularly at facilities experiencing critical staffing shortages. Benefits typically include housing stipends, travel reimbursements, and completion bonuses. Travel positions are best suited for experienced RRTs with at least one to two years of staff experience.',
  },
]

const applicationTips = [
  {
    title: 'Pursue the RRT Credential as Early as Possible',
    description: 'While the CRT allows you to begin working, the RRT credential from the National Board for Respiratory Care unlocks significantly higher paying positions and is required by most ICU and specialty employers. Prioritizing the RRT exam shortly after graduation dramatically expands your career options.',
  },
  {
    title: 'Specialize in High Demand Areas',
    description: 'Neonatal and pediatric respiratory therapy (NPS) and adult critical care (ACCS) are among the most in demand and highest compensated specialties. Pursuing these credentials after earning your RRT signals to employers that you are ready for complex patient care environments.',
  },
  {
    title: 'Consider Travel Assignments to Boost Earnings',
    description: 'With at least one to two years of staff experience, transitioning to travel respiratory therapy through agencies such as Aya Healthcare or AMN Healthcare can significantly increase your income through higher base rates, housing stipends, and completion bonuses.',
  },
  {
    title: 'Verify State Licensure Requirements Before Applying',
    description: 'Because licensure requirements differ by state, confirm you meet the specific requirements for the state where you are applying before submitting your application. The American Association for Respiratory Care maintains a state by state licensure resource that can help you navigate each state\'s process.',
  },
]

export default async function RespiratoryTherapistJobsPage({ searchParams }: any) {
  const params = await searchParams

  const [{ count }, initialData] = await Promise.all([
  getMergedJobCount(params.what || 'respiratory therapist', params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
  searchMergedJobs({ what: params.what || 'respiratory therapist', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
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
            Respiratory Therapist Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="respiratory therapist" />
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
                what={params.what || 'respiratory therapist'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Types of RT Roles */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Respiratory Therapist Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics, respiratory therapists work in a range of settings including hospitals, physicians offices, nursing care facilities, and home health agencies. Specialization significantly impacts both salary and career trajectory in this growing field.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rtRoles.map((role, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <role.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Key Duties */}
        <section className="mt-20">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Core Responsibilities of a Respiratory Therapist</h2>
                <p className="text-gray-700 mb-5">
                  According to O*NET OnLine, managed by the U.S. Department of Labor, respiratory therapists perform a defined set of clinical functions that span assessment, treatment, emergency response, and patient education. Understanding these responsibilities helps applicants present their experience in terms employers immediately recognize.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {keyDuties.map((duty, index) => (
                    <div key={index} className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{duty}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Salary Data */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Respiratory Therapist Salaries by Role</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics Occupational Employment and Wage Statistics (OEWS) program, respiratory therapist compensation varies by credential level, specialization, and geographic location. The following figures reflect approximate national annual salary ranges for common RT positions.
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 font-semibold text-gray-900">Role</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-900">Low End</th>
                  <th className="text-center px-6 py-4 font-semibold text-green-700">Median</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-900">High End</th>
                </tr>
              </thead>
              <tbody>
                {salaryData.map((row, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{row.role}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{row.low}</td>
                    <td className="px-6 py-4 text-center font-bold text-green-600">{row.median}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{row.high}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics. Figures are approximate annual salary ranges and may vary by state, employer, and credential level.
          </p>
        </section>

        {/* Top Employers */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Top Employers Hiring Respiratory Therapists</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Respiratory therapists are in demand across major hospital systems, specialty care centers, and travel staffing agencies. The following organizations are among the most active and consistent employers of RT talent in the United States.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {topEmployers.map((employer, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{employer.name}</p>
                <span className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full mb-2">{employer.type}</span>
                <p className="text-gray-600 text-sm">{employer.positions}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-amber-600" />
            <h2 className="text-2xl font-bold text-gray-900">NBRC Credentials for Respiratory Therapists</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the National Board for Respiratory Care (NBRC), credentialing is a critical component of professional practice for respiratory therapists in the United States. The following credentials are the national standard recognized by state licensing boards and hospital employers across the country.
          </p>
          <div className="space-y-4">
            {certifications.map((cert, index) => (
              <div key={index} className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <Award className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-0.5">{cert.name}</p>
                    <p className="text-xs text-amber-700 font-medium mb-2">Issued by: {cert.issuer}</p>
                    <p className="text-gray-600 text-sm">{cert.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Licensure and State Requirements */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Licensure and Requirements to Practice as an RT</h2>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the American Association for Respiratory Care (AARC), respiratory therapy is a licensed profession in all 50 states and the District of Columbia. Understanding and satisfying these requirements before applying is essential to avoiding delays in the hiring process.
            </p>
            <div className="space-y-4">
              {stateRequirements.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">{item.requirement}</p>
                      <p className="text-gray-600 text-sm">{item.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Career Growth */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-teal-600" />
            <h2 className="text-2xl font-bold text-gray-900">Career Growth for Respiratory Therapists</h2>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, employment of respiratory therapists is projected to grow 13% from 2022 to 2032, which is much faster than the average for all occupations. An aging population, increasing prevalence of respiratory conditions, and the lasting impact of the COVID-19 pandemic on pulmonary care demand are all accelerating this growth.
            </p>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { step: '1', title: 'CRT', desc: 'Entry level practice and general respiratory care' },
                { step: '2', title: 'RRT', desc: 'Advanced credential for ICU and specialty roles' },
                { step: '3', title: 'NPS or ACCS', desc: 'Specialty certification in neonatal or critical care' },
                { step: '4', title: 'Lead RT / Manager', desc: 'Department leadership and program management' },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Tips */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-7 h-7 text-rose-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing a Respiratory Therapist Job</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {applicationTips.map((tip, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-rose-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-rose-100 text-rose-700 font-bold rounded-full text-sm mb-4">
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
            <Clock className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Respiratory Therapist Jobs</h2>
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
            <strong>Disclaimer:</strong> The salary figures, employment projections, and licensure information cited on this page are sourced from publicly available reports by the U.S. Bureau of Labor Statistics, the U.S. Department of Labor, O*NET OnLine, the National Board for Respiratory Care (NBRC), and the American Association for Respiratory Care (AARC). Actual wages, licensure requirements, and job availability may vary by state, employer, and credential level. Oh My Job is an independent job search platform and aggregates listings from third party sources. Always verify job details, qualifications, and compensation directly with the hiring organization before applying.
          </p>
        </section>
      </div>
    </>
  )
}