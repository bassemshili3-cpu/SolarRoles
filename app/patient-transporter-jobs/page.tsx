import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, DollarSign, CheckCircle, Shield, Clock, Users, TrendingUp, FileText, Award, Star, AlertTriangle } from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs, } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Patient Transporter Jobs | Hospital & Healthcare Roles',
  description: 'Patient transporter positions are urgently needed at hospitals and healthcare facilities across the US! Browse 800+ immediate openings. No degree required, paid training available, and benefits from day one. Apply today and start your healthcare career!',
  keywords: 'patient transporter jobs, patient transport jobs, hospital transporter jobs, patient transporter hiring, healthcare transporter jobs, patient escort jobs, hospital porter jobs, patient transporter positions',
  openGraph: {
    title: 'Patient Transporter Jobs | 800+ Hospital Openings',
    description: 'Hospitals across the US urgently need patient transporters. 800+ openings with paid training, competitive hourly pay, and full benefits. No experience required. Apply now!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Patient Transporter Jobs | Entry-Level, Paid Training',
    description: 'Urgent demand for patient transporters at hospitals and clinics across the US. Entry level, paid training, benefits included. Find your role and apply today!',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/patient-transporter-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Patient Transporter Jobs',
  description: 'Find patient transporter jobs hiring now across the United States. Browse openings at hospitals, surgery centers, rehabilitation facilities, and long term care settings.',
  url: 'https://www.oh-my-job.com/patient-transporter-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Patient Transporter Job Opportunities',
    description: 'Current patient transporter job listings across hospitals and healthcare settings in the United States',
  },
}

const transporterRoles = [
  {
    title: 'Hospital Patient Transporter',
    description: 'Move patients between departments, diagnostic areas, operating rooms, and patient floors using wheelchairs, stretchers, and hospital beds',
    icon: Briefcase,
  },
  {
    title: 'Emergency Department Transporter',
    description: 'Support fast paced ED operations by rapidly moving patients to imaging, labs, and inpatient units while maintaining safety protocols',
    icon: AlertTriangle,
  },
  {
    title: 'Surgical Suite Transporter',
    description: 'Transport patients to and from pre op, operating rooms, and recovery areas with strict adherence to sterile and safety standards',
    icon: Shield,
  },
  {
    title: 'Rehabilitation Facility Transporter',
    description: 'Assist patients in long term acute care, rehab, and skilled nursing facilities with scheduled and on demand transport needs',
    icon: Users,
  },
  {
    title: 'Imaging and Radiology Transporter',
    description: 'Escort patients to MRI, CT, X ray, and other diagnostic imaging departments and safely position them for procedures',
    icon: Star,
  },
  {
    title: 'Discharge Escort',
    description: 'Assist patients with safe exit from the facility at discharge, coordinating with nursing staff and family members',
    icon: CheckCircle,
  },
]

const keyDuties = [
  'Transport patients safely by wheelchair, gurney, or hospital bed between departments',
  'Verify patient identity and transport orders before each move',
  'Communicate clearly with nursing and clinical staff about patient status',
  'Maintain patient dignity and comfort throughout transport',
  'Document transport activities accurately in hospital information systems',
  'Follow all infection control, isolation, and safety protocols',
  'Assist patients in transferring to and from beds, chairs, and imaging tables',
  'Respond promptly to STAT and urgent transport requests',
]

const topEmployers = [
  { name: 'HCA Healthcare', type: 'Hospital System', positions: 'Patient Transporter, Orderly, Transport Aide' },
  { name: 'CommonSpirit Health', type: 'Hospital System', positions: 'Patient Escort, Transport Technician, Floor Assistant' },
  { name: 'Ascension Health', type: 'Hospital System', positions: 'Patient Transporter, Rehabilitation Transport Aide' },
  { name: 'Tenet Healthcare', type: 'Hospital System', positions: 'Patient Transporter, Clinical Support Tech' },
  { name: 'CHRISTUS Health', type: 'Regional Health System', positions: 'Transport Aide, Patient Services Assistant' },
  { name: 'Kaiser Permanente', type: 'Integrated Health System', positions: 'Patient Transporter, Escort and Transport Specialist' },
]

const salaryData = [
  { role: 'Entry Level Transporter', low: '$13', high: '$18', median: '$15' },
  { role: 'Hospital Transporter', low: '$14', high: '$20', median: '$17' },
  { role: 'Emergency Dept Transporter', low: '$15', high: '$22', median: '$18' },
  { role: 'Surgical Suite Transporter', low: '$16', high: '$24', median: '$19' },
  { role: 'Lead Transport Coordinator', low: '$18', high: '$28', median: '$22' },
]

const certifications = [
  {
    name: 'CPR and Basic Life Support (BLS)',
    issuer: 'American Heart Association / American Red Cross',
    description: 'Required by the vast majority of hospital employers before starting work as a patient transporter. BLS certification demonstrates your ability to respond to cardiac and respiratory emergencies during transport.',
  },
  {
    name: 'HIPAA Compliance Training',
    issuer: 'Healthcare employer or accredited online provider',
    description: 'As required by federal law under the Health Insurance Portability and Accountability Act, all healthcare workers including transporters must complete training on patient privacy and confidentiality.',
  },
  {
    name: 'Safe Patient Handling and Mobility (SPHM)',
    issuer: 'American Nurses Association / employer based training',
    description: 'Covers proper body mechanics, lift equipment operation, and safe transfer techniques. According to the Occupational Safety and Health Administration (OSHA), musculoskeletal injuries are among the most common in healthcare settings, making this training essential.',
  },
  {
    name: 'Infection Control and Bloodborne Pathogens',
    issuer: 'Occupational Safety and Health Administration (OSHA)',
    description: 'Federally required for all workers with potential exposure to bodily fluids or infectious materials. Patient transporters routinely encounter isolation patients and contaminated equipment, making this certification mandatory.',
  },
]

const faqs = [
  {
    question: 'What does a patient transporter do?',
    answer: 'A patient transporter is a healthcare support worker responsible for safely moving patients within a medical facility. According to O*NET OnLine, managed by the U.S. Department of Labor, this role involves transporting patients by wheelchair or stretcher, assisting with transfers, communicating with clinical staff, and ensuring patient comfort and safety throughout each move. Transporters are a critical link in hospital workflow and patient care delivery.',
  },
  {
    question: 'Do I need experience to become a patient transporter?',
    answer: 'Most patient transporter positions are entry level and do not require prior healthcare experience. According to the U.S. Bureau of Labor Statistics, many healthcare support positions provide on the job training. Employers typically look for candidates with a high school diploma or GED, a customer service mindset, physical stamina, and the ability to follow instructions and safety protocols.',
  },
  {
    question: 'What is the average pay for a patient transporter?',
    answer: 'According to the U.S. Bureau of Labor Statistics Occupational Employment and Wage Statistics program, healthcare support workers including patient transporters earn median hourly wages ranging from approximately $14 to $20 per hour depending on location, facility type, and experience. Union hospitals and large health systems in metropolitan areas typically offer the highest compensation.',
  },
  {
    question: 'Is patient transporting physically demanding?',
    answer: 'Yes. According to O*NET OnLine, managed by the U.S. Department of Labor, patient transporter roles are classified as medium to heavy physical work. The job requires standing and walking for most of a shift, pushing wheelchairs and gurneys, and assisting patients with transfers. Most employers provide ergonomic training and assistive equipment to reduce injury risk.',
  },
  {
    question: 'What certifications do I need as a patient transporter?',
    answer: 'While requirements vary by employer, most hospitals require CPR and Basic Life Support (BLS) certification before the start date, and federal law under OSHA mandates bloodborne pathogen and infection control training for all healthcare workers. Many facilities also require HIPAA compliance training and safe patient handling instruction as part of onboarding.',
  },
  {
    question: 'Can a patient transporter advance in a healthcare career?',
    answer: 'Absolutely. Many healthcare professionals began as patient transporters or in similar support roles. Common advancement paths include becoming a certified nursing assistant (CNA), emergency medical technician (EMT), surgical technician, or healthcare administrator. According to the U.S. Department of Labor, the healthcare sector is one of the fastest growing industries in the country, with extensive internal promotion opportunities.',
  },
]

const applicationTips = [
  {
    title: 'Get CPR Certified Before Applying',
    description: 'Most hospitals require BLS certification before your first day. Completing an American Heart Association or Red Cross BLS course in advance shows initiative and removes a common hiring barrier. Courses are widely available and typically take only a few hours.',
  },
  {
    title: 'Emphasize Physical Fitness and Reliability',
    description: 'Recruiters for patient transporter roles prioritize candidates who can demonstrate physical stamina, dependability, and a strong attendance record. Highlight any background in active or service roles such as athletics, caregiving, food service, or warehouse work.',
  },
  {
    title: 'Highlight Customer Service and Communication Skills',
    description: 'Patient transporters interact with patients who are often scared, in pain, or vulnerable. Demonstrating empathy, clear communication, and a calm demeanor in your application and interview significantly strengthens your candidacy.',
  },
  {
    title: 'Apply to Multiple Hospital Systems Directly',
    description: 'Large health systems such as HCA, CommonSpirit, and Ascension maintain dedicated careers portals and frequently post transporter openings. Applying directly to system websites in addition to job boards increases your chances of being seen by recruiters.',
  },
]

export default async function PatientTransporterJobsPage({ searchParams }: any) {
  const params = await searchParams

  const [{ count }, initialData] = await Promise.all([
  getMergedJobCount(params.what || 'patient transporter', params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
  searchMergedJobs({ what: params.what || 'patient transporter', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
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
            Patient Transporter Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="patient transporter" />
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
                what={params.what || 'patient transporter'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Types of Patient Transporter Roles */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Patient Transporter Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to O*NET OnLine, managed by the U.S. Department of Labor, patient transporters work across a wide range of healthcare settings. From fast paced emergency departments to scheduled rehabilitation transfers, the role varies significantly by facility type and patient population.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {transporterRoles.map((role, index) => (
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Core Responsibilities of a Patient Transporter</h2>
                <p className="text-gray-700 mb-5">
                  According to the U.S. Department of Labor's O*NET program, patient transporters perform a defined set of core tasks essential to hospital operations. Understanding these duties helps candidates prepare strong applications and ace interviews.
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
            <h2 className="text-2xl font-bold text-gray-900">Patient Transporter Pay Rates</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics Occupational Employment and Wage Statistics (OEWS) program, compensation for patient transporters and healthcare support workers varies by setting, region, and experience level. The following figures reflect approximate national ranges.
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
                    <td className="px-6 py-4 text-center text-gray-600">{row.low}/hr</td>
                    <td className="px-6 py-4 text-center font-bold text-green-600">{row.median}/hr</td>
                    <td className="px-6 py-4 text-center text-gray-600">{row.high}/hr</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics. Figures are approximate national averages and may vary by location, facility type, and union status.
          </p>
        </section>

        {/* Top Employers */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Top Employers Hiring Patient Transporters</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Patient transporters are in demand across health systems of all sizes. The following hospital systems and healthcare organizations are among the most consistent employers of transport staff across the United States.
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

        {/* Required Certifications */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-amber-600" />
            <h2 className="text-2xl font-bold text-gray-900">Certifications Required for Patient Transporter Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            While patient transporter roles are entry level, healthcare facilities require specific safety and compliance certifications before employment. Obtaining these credentials in advance demonstrates professionalism and speeds up the hiring process.
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

        {/* Career Growth */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-teal-600" />
            <h2 className="text-2xl font-bold text-gray-900">Career Growth From Patient Transporter</h2>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, employment in healthcare support occupations is projected to grow much faster than the average for all occupations through 2032, driven by an aging population and expanding healthcare infrastructure. A patient transporter role is a recognized entry point into a broad and growing industry.
            </p>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { step: '1', title: 'Patient Transporter', desc: 'Entry level hospital support and patient movement' },
                { step: '2', title: 'Certified Nursing Assistant', desc: 'Direct patient care with CNA certification' },
                { step: '3', title: 'EMT or Surgical Tech', desc: 'Specialized clinical role with additional training' },
                { step: '4', title: 'Nurse or Healthcare Manager', desc: 'Advanced clinical or administrative career path' },
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

        {/* Physical and Work Environment */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Work Environment and Physical Requirements</h2>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the Occupational Safety and Health Administration (OSHA), healthcare workers face some of the highest rates of work related musculoskeletal disorders in any industry. Patient transporters are specifically covered by OSHA guidelines on safe patient handling, and most hospitals now provide training and mechanical lifting aids to reduce injury risk.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Physical Demands</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Standing and walking for most of an 8 to 12 hour shift</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Pushing stretchers and wheelchairs, sometimes over long distances</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Assisting patients with transfers weighing up to 50 pounds or more with aids</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Bending, reaching, and repositioning patients as directed by clinical staff</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Work Settings</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Acute care hospitals and trauma centers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Outpatient surgery and ambulatory care centers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Rehabilitation hospitals and skilled nursing facilities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Behavioral health units and long term care campuses</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Application Tips */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-7 h-7 text-rose-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing a Patient Transporter Job</h2>
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Patient Transporter Jobs</h2>
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
            <strong>Disclaimer:</strong> The salary figures, employment projections, and occupational data cited on this page are sourced from publicly available reports by the U.S. Bureau of Labor Statistics, the U.S. Department of Labor, and O*NET OnLine. Actual wages and job availability may vary by location, employer, and experience level. Oh My Job is an independent job search platform and aggregates listings from third party sources. Always verify job details, pay rates, certification requirements, and conditions of employment directly with the hiring organization before applying.
          </p>
        </section>
      </div>
    </>
  )
}