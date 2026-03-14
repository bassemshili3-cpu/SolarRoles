import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import {
  Briefcase,
  DollarSign,
  Star,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Shield,
  Clock,
  Award,
  TrendingUp,
  Stethoscope,
  FileText,
} from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Urgently Hiring: Medical Assistant Jobs Near You | Apply Today',
  description:
    'Medical assistant jobs hiring immediately across the United States. Certified and entry-level openings at clinics, hospitals, and private practices. Competitive pay, great benefits, and real career growth. Apply now!',
  keywords:
    'medical assistant jobs, medical assistant jobs near me, CMA jobs, certified medical assistant jobs, entry level medical assistant jobs, medical assistant hiring now, clinical medical assistant jobs, administrative medical assistant jobs',
  openGraph: {
    title: 'Immediate Opening: Medical Assistant Jobs | Apply Now',
    description:
      'Find medical assistant jobs hiring immediately near you. Certified and non-certified openings at leading healthcare employers. Excellent pay, benefits, and advancement opportunities. Start your application today.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Now Hiring: Medical Assistants | Find Your Next Role',
    description:
      'Hundreds of medical assistant positions open right now. Clinics, hospitals, and private practices actively hiring. Apply today and join one of the fastest-growing healthcare professions in the U.S.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/medical-assistant-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Medical Assistant Jobs',
  description:
    'Find medical assistant jobs hiring near you. Browse hundreds of openings at clinics, hospitals, physician offices, and specialty practices across the United States.',
  url: 'https://www.oh-my-job.com/medical-assistant-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Medical Assistant Jobs',
    description: 'Current medical assistant job listings across the United States',
  },
}

const maRoles = [
  {
    title: 'Clinical Medical Assistant',
    description:
      'Take patient vital signs, prepare exam rooms, assist physicians during procedures, administer injections, and perform EKGs and phlebotomy.',
    icon: Stethoscope,
  },
  {
    title: 'Administrative Medical Assistant',
    description:
      'Manage patient scheduling, insurance verification, medical billing, and front-desk operations in a physician office or clinic setting.',
    icon: FileText,
  },
  {
    title: 'Certified Medical Assistant (CMA)',
    description:
      'Holds a national certification such as CMA (AAMA) or RMA (AMT). Preferred by most employers and typically commands a higher starting wage.',
    icon: Award,
  },
  {
    title: 'Specialty Practice Medical Assistant',
    description:
      'Works in a specific clinical environment such as orthopedics, dermatology, cardiology, or pediatrics, developing focused procedural skills.',
    icon: Briefcase,
  },
  {
    title: 'Outpatient Clinic Medical Assistant',
    description:
      'Provides support in community health centers, urgent care clinics, and federally qualified health centers (FQHCs), often serving high patient volumes.',
    icon: TrendingUp,
  },
  {
    title: 'Hospital-Based Medical Assistant',
    description:
      'Assists in hospital outpatient departments and ambulatory care units. Often eligible for hospital benefits packages including tuition reimbursement.',
    icon: Star,
  },
]

const certificationPaths = [
  {
    name: 'CMA (AAMA) — Certified Medical Assistant',
    body: 'American Association of Medical Assistants (AAMA)',
    requirement: 'Must graduate from a CAAHEP or ABHES accredited medical assisting program. Exam-based certification renewed every 60 continuing education hours.',
  },
  {
    name: 'RMA — Registered Medical Assistant',
    body: 'American Medical Technologists (AMT)',
    requirement: 'Available to graduates of accredited programs or candidates with qualifying work experience. Exam-based with continuing education renewal requirements.',
  },
  {
    name: 'NCMA — National Certified Medical Assistant',
    body: 'National Center for Competency Testing (NCCT)',
    requirement: 'Open to graduates of accredited programs or those with documented work experience. Exam administered at testing centers nationwide.',
  },
  {
    name: 'CCMA — Certified Clinical Medical Assistant',
    body: 'National Healthcareer Association (NHA)',
    requirement: 'No formal education prerequisite for candidates with healthcare work experience. One of the more accessible certification pathways for career changers.',
  },
]

const salaryData = [
  { label: 'Entry-Level Medical Assistant', range: '$16 to $20/hr' },
  { label: 'Certified Medical Assistant (CMA)', range: '$19 to $25/hr' },
  { label: 'Clinical Medical Assistant', range: '$18 to $24/hr' },
  { label: 'Specialty Practice Medical Assistant', range: '$20 to $28/hr' },
  { label: 'Hospital-Based Medical Assistant', range: '$21 to $30/hr' },
  { label: 'Lead or Senior Medical Assistant', range: '$24 to $32/hr' },
]

const hipaaFacts = [
  'According to the U.S. Department of Health and Human Services (HHS), the Health Insurance Portability and Accountability Act (HIPAA) requires all healthcare workforce members, including medical assistants, to protect the privacy and security of patient health information.',
  'Medical assistants who improperly disclose protected health information (PHI) can expose their employer to civil and criminal penalties under HIPAA, and may be personally disciplined or terminated.',
  'OSHA Standard 29 CFR 1910.1030, the Bloodborne Pathogens Standard, requires employers to provide medical assistants with appropriate personal protective equipment, training on exposure control, and access to hepatitis B vaccination at no cost.',
  'According to the Centers for Disease Control and Prevention (CDC), standard precautions including hand hygiene, PPE use, and safe injection practices are required for all patient care activities regardless of a patient\'s known or suspected infection status.',
]

const careerGrowth = [
  { title: 'Medical Office Manager', detail: 'Oversee the administrative and operational functions of a physician practice or clinic. Often requires additional education or years of MA experience.' },
  { title: 'Licensed Practical Nurse (LPN)', detail: 'Many medical assistants use their clinical exposure as a foundation to pursue LPN licensure through an accredited nursing program.' },
  { title: 'Phlebotomy Technician', detail: 'Specialize in venipuncture and blood collection. A separate credential that can increase hourly pay and expand job options.' },
  { title: 'Healthcare Administrator', detail: 'Advance into practice management, coding and billing, or health information management with additional training or a degree.' },
]

const faqs = [
  {
    question: 'Do I need to be certified to work as a medical assistant?',
    answer:
      'Certification is not federally required to work as a medical assistant. According to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, most medical assistants are trained on the job or complete a postsecondary certificate or associate degree program. However, many employers strongly prefer or require a national certification such as the CMA (AAMA) or CCMA (NHA). Certification typically results in higher starting pay and a broader selection of job opportunities.',
  },
  {
    question: 'What is the job outlook for medical assistants?',
    answer:
      'The job outlook is excellent. According to the U.S. Bureau of Labor Statistics, employment of medical assistants is projected to grow 14 percent from 2022 to 2032, much faster than the average for all occupations. About 114,600 openings for medical assistants are projected each year on average. Growth is driven by an aging population, expanding primary care demand, and the ongoing shift toward outpatient care settings.',
  },
  {
    question: 'How much do medical assistants earn?',
    answer:
      'According to the U.S. Bureau of Labor Statistics, the median annual wage for medical assistants was $37,190 in May 2023. Certified medical assistants, those working in hospital settings, and those with specialty practice experience typically earn above the median. Geographic location also has a significant impact, with states such as Alaska, Washington, and California reporting the highest average wages.',
  },
  {
    question: 'What duties can a medical assistant legally perform?',
    answer:
      'The scope of practice for medical assistants is determined at the state level and varies across jurisdictions. According to the American Association of Medical Assistants (AAMA), medical assistants typically perform both administrative tasks such as scheduling and insurance verification and clinical tasks such as taking vital signs, preparing patients for examination, and administering medications as directed by a physician. Some states restrict or require physician supervision for specific clinical procedures. Always verify the rules in your state before accepting duties that exceed your training.',
  },
  {
    question: 'Is HIPAA training required for medical assistants?',
    answer:
      'Yes. According to the U.S. Department of Health and Human Services (HHS), all members of a covered healthcare entity\'s workforce must receive HIPAA training. As a medical assistant, you will be required to complete HIPAA privacy and security training before or shortly after starting a new position. Failure to comply with HIPAA regulations can result in disciplinary action and, in serious cases, federal civil or criminal penalties.',
  },
  {
    question: 'Can I become a medical assistant without a degree?',
    answer:
      'Yes. While many medical assistants complete a formal certificate or associate degree program, some employers hire candidates without a degree and provide on-the-job training. According to the BLS, training for medical assistants can range from employer-based programs to one-year certificate programs and two-year associate degrees. Earning a national certification such as the CCMA from the National Healthcareer Association (NHA) does not require a formal degree and can be pursued by candidates with relevant work experience.',
  },
]

const tips = [
  {
    title: 'Earn a National Certification Before Applying',
    description:
      'Even if a posting does not require it, holding a CMA (AAMA), CCMA (NHA), or RMA (AMT) credential sets your application apart immediately and opens access to higher-paying roles at hospitals and specialty practices.',
  },
  {
    title: 'Complete a HIPAA Training Course',
    description:
      'Free and low-cost HIPAA training courses are available online through the HHS Office for Civil Rights. Listing HIPAA compliance training on your resume signals professionalism and readiness to work in a clinical environment.',
  },
  {
    title: 'Highlight Both Clinical and Administrative Experience',
    description:
      'Medical assistant roles are uniquely dual-function. Employers value candidates who can move between the front desk and the exam room. Be specific about both skillsets on your resume and in your interview.',
  },
  {
    title: 'Apply to Federally Qualified Health Centers (FQHCs)',
    description:
      'FQHCs, which receive federal funding through the Health Resources and Services Administration (HRSA), are among the largest employers of medical assistants in the country. They often offer loan repayment programs, strong benefits, and mission-driven work.',
  },
]

export default async function MedicalAssistantJobsPage({ searchParams }: any) {
  const params = await searchParams

const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'medical assistant', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'medical assistant', where: params.where || '', results_per_page: 30, page: 1 })
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
            Medical Assistant Jobs Hiring Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="medical assistant" />
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
                what={params.what || 'medical assistant'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Types of Roles */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Stethoscope className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Medical Assistant Jobs Available</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Medical assisting is one of the most versatile roles in healthcare. Depending on the practice setting and employer, duties can range from entirely clinical to largely administrative, or a combination of both. The listings on this page cover the full range of medical assistant positions currently open across the country.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {maRoles.map((role, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <role.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Job Outlook */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Medical Assistant Job Outlook: One of the Fastest-Growing Roles in Healthcare</h2>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, employment of medical assistants is projected to grow 14 percent from 2022 to 2032, far outpacing the average growth rate for all occupations. The demand is driven by an aging U.S. population requiring more medical services, a continued shift toward outpatient and ambulatory care, and the expansion of primary care access through federally qualified health centers and community clinics.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-blue-600 mb-2">14%</p>
                <p className="text-sm text-gray-600">Projected Job Growth (2022 to 2032)</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">114,600</p>
                <p className="text-sm text-gray-600">Average Annual Job Openings</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-purple-600 mb-2">$37,190</p>
                <p className="text-sm text-gray-600">Median Annual Wage (BLS, May 2023)</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-5">
              Source: U.S. Bureau of Labor Statistics, Occupational Outlook Handbook, Medical Assistants.
            </p>
          </div>
        </section>

        {/* Salary Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">How Much Do Medical Assistants Earn?</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics, the median annual wage for medical assistants was $37,190 in May 2023. Certified medical assistants, those employed in hospital settings, and those working in specialty practices consistently earn above the national median. The ranges below reflect typical rates seen across current U.S. job postings.
            </p>
            <div className="space-y-3">
              {salaryData.map((row, index) => (
                <div key={index} className="flex items-center justify-between bg-white rounded-xl px-5 py-4">
                  <span className="font-medium text-gray-800">{row.label}</span>
                  <span className="text-green-700 font-semibold text-sm">{row.range}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-5">
              Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics (OEWS), May 2023. Ranges are illustrative and vary by location, certification status, employer, and experience level.
            </p>
          </div>
        </section>

        {/* Certification Section */}
        <section className="mt-20 bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Award className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Medical Assistant Certifications That Employers Look For</h2>
              <p className="text-gray-700 mb-6">
                While no federal law mandates certification for medical assistants, the American Association of Medical Assistants (AAMA) and other credentialing bodies offer nationally recognized designations that significantly improve hiring prospects and starting pay. Here are the four most widely recognized credentials in the field.
              </p>
              <div className="grid md:grid-cols-2 gap-5">
                {certificationPaths.map((cert, index) => (
                  <div key={index} className="bg-white rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-1">{cert.name}</h3>
                    <p className="text-amber-700 text-xs font-medium mb-2">{cert.body}</p>
                    <p className="text-gray-600 text-sm">{cert.requirement}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* HIPAA and Safety Compliance */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">HIPAA, OSHA, and Clinical Compliance Every Medical Assistant Must Know</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Working in a clinical environment comes with federally mandated compliance obligations. According to the U.S. Department of Health and Human Services and OSHA, medical assistants are directly subject to several key regulatory frameworks from their first day on the job.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {hipaaFacts.map((fact, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-3 hover:shadow-md transition-shadow">
                <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-600 text-sm">{fact}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Career Growth */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Where Can a Medical Assistant Career Take You?</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Medical assisting provides a strong foundation for advancement within healthcare. Many professionals in nursing, health administration, and clinical specializations began their careers as medical assistants. The clinical exposure, patient communication skills, and regulatory knowledge gained in these roles translate directly into a wide range of higher-paying positions.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {careerGrowth.map((role, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-blue-700 mb-1">{role.title}</p>
                <p className="text-gray-600 text-sm">{role.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Scope of Practice Warning */}
        <section className="mt-20">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Scope of Practice: What Medical Assistants Cannot Do</h2>
                <p className="text-gray-700 mb-4">
                  According to the American Association of Medical Assistants (AAMA) and individual state medical boards, medical assistants must operate strictly within their authorized scope of practice. The following tasks are generally outside the legal scope of a medical assistant in most U.S. jurisdictions:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    'Diagnosing a patient or interpreting diagnostic test results independently',
                    'Prescribing, dispensing, or independently administering medications without physician direction',
                    'Performing procedures that require a nursing or physician license',
                    'Ordering laboratory tests or imaging studies without a provider order',
                    'Providing medical advice or treatment recommendations to patients',
                    'Signing or countersigning medical orders or prescriptions',
                    'Operating as a licensed practical nurse or registered nurse without the appropriate license',
                    'Disclosing patient health information in violation of HIPAA regulations',
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing Your Next Medical Assistant Job</h2>
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
            <Clock className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Medical Assistant Jobs</h2>
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
                <div className="px-6 pb-6 text-gray-600">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>

        {/* Legal Disclaimer */}
        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and does not constitute legal, medical, or professional advice. Medical assistant scope of practice, certification requirements, and workplace regulations vary by state, employer, and clinical setting. Always consult your state medical board, the American Association of Medical Assistants at aama-ntl.org, the U.S. Department of Health and Human Services at hhs.gov, and OSHA at osha.gov for the most current and applicable standards. Oh My Job is a job aggregation platform and is not responsible for the accuracy of individual job listings.
          </p>
        </section>
      </div>
    </>
  )
}