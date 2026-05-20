import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
import {
  Briefcase,
  DollarSign,
  CheckCircle,
  Shield,
  TrendingUp,
  AlertTriangle,
  FileText,
  Star,
  GraduationCap,
  Clock,
} from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna, } from '@/lib/jobs'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'EMT Jobs | Emergency Medical Technician Openings',
  description:
    'EMT positions in urban EMS, rural fire, and private transport. Certification paths, pay bands, and advancement opportunities listed by state.',
  keywords:
    'EMT jobs, emergency medical technician jobs, EMT hiring, EMT jobs near me, EMT careers, paramedic jobs, EMT positions, emergency medical services jobs',
  openGraph: {
    title: 'EMT Jobs | Full & Part-Time EMT Positions Nationwide',
    description:
      'Emergency services are urgently hiring EMTs across the US. Full-time and part-time roles available. Competitive salaries, strong benefits, and real career advancement. Apply now.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EMT Jobs | Meaningful Work & Career Growth',
    description:
      'EMTs are urgently needed across the country. Find your next emergency medical technician role today. Great pay, meaningful work, and career growth. Apply now.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/emt-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'EMT Jobs',
  description:
    'Browse current EMT and Emergency Medical Technician job openings across the United States. Full-time, part-time, and per-diem positions available.',
  url: 'https://www.oh-my-job.com/emt-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available EMT Jobs',
    description: 'Current Emergency Medical Technician job listings across the United States',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What are the requirements to become an EMT in the United States?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'According to the National Highway Traffic Safety Administration (NHTSA), which oversees EMS education standards, becoming an EMT requires completing a state-approved EMT training program, passing the National Registry of Emergency Medical Technicians (NREMT) cognitive and psychomotor exams, and obtaining state licensure or certification. Most EMT-Basic programs require 120 to 150 hours of training. Requirements vary by state.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between an EMT and a Paramedic?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'According to the U.S. Bureau of Labor Statistics, EMTs provide basic emergency medical care and transportation, while paramedics provide more advanced care including administering medications, performing advanced airway management, and interpreting EKGs. Paramedics complete significantly more training, typically 1,200 to 1,800 hours compared to 120 to 150 hours for EMT-Basic certification.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much do EMTs earn in the United States?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'According to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, the median annual wage for EMTs and paramedics was $38,930 as of the most recent national estimate. The lowest 10 percent earned less than $27,000, while the highest 10 percent earned more than $64,000. Wages vary significantly by employer type, location, and certification level.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is there strong job growth for EMTs in the US?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. According to the U.S. Bureau of Labor Statistics, employment of EMTs and paramedics is projected to grow 7 percent from 2022 to 2032, faster than the average for all occupations. Demand is driven by an aging population, increasing emergency call volumes, and continued need for emergency medical services in both urban and rural communities.',
      },
    },
    {
      '@type': 'Question',
      name: 'What types of employers hire EMTs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'EMTs are employed by a wide range of organizations including local government fire and EMS departments, private ambulance companies, hospitals and healthcare systems, air medical transport services, event medical staffing companies, and industrial or occupational health facilities. Some EMTs also work as volunteers with community EMS agencies.',
      },
    },
  ],
}

const emtLevels = [
  {
    title: 'EMT-Basic',
    description: 'Entry-level certification. Provides foundational emergency care including CPR, basic airway management, hemorrhage control, and patient transport.',
    icon: Shield,
  },
  {
    title: 'Advanced EMT (AEMT)',
    description: 'Intermediate level with added skills such as IV access, limited medication administration, and advanced airway adjuncts.',
    icon: Star,
  },
  {
    title: 'Paramedic',
    description: 'Highest EMS certification level. Administers medications, interprets cardiac rhythms, performs advanced procedures, and leads scene management.',
    icon: TrendingUp,
  },
  {
    title: 'Flight EMT / Flight Medic',
    description: 'Specialized role in air medical transport requiring advanced clinical skills and the ability to manage critically ill patients in a flight environment.',
    icon: Briefcase,
  },
  {
    title: 'Wilderness EMT',
    description: 'EMT trained for remote and backcountry emergencies where traditional EMS response may be delayed for hours or days.',
    icon: CheckCircle,
  },
  {
    title: 'Tactical EMT',
    description: 'Works alongside law enforcement in high-risk situations, providing medical support during tactical operations and mass casualty incidents.',
    icon: AlertTriangle,
  },
]

const salaryData = [
  { level: 'EMT-Basic (Entry)', range: '$30,000 – $40,000/yr' },
  { level: 'Advanced EMT', range: '$38,000 – $52,000/yr' },
  { level: 'Paramedic', range: '$45,000 – $65,000/yr' },
  { level: 'Fire-Based EMS', range: '$55,000 – $80,000/yr' },
  { level: 'Flight Paramedic', range: '$65,000 – $95,000/yr' },
  { level: 'Major Metro Markets', range: '$50,000 – $85,000/yr' },
]

const certificationSteps = [
  {
    step: 'Complete an Approved EMT Program',
    detail: 'Enroll in a state-approved EMT-Basic training program, typically offered at community colleges, fire academies, or hospitals. Programs generally require 120 to 150 hours of coursework and clinical training.',
  },
  {
    step: 'Pass the NREMT Exam',
    detail: 'The National Registry of Emergency Medical Technicians (NREMT) administers the national certification exam, which includes a cognitive (written) test and a psychomotor skills evaluation. Passing is required for certification in most states.',
  },
  {
    step: 'Obtain State Licensure',
    detail: 'After passing the NREMT exam, apply for your state EMS license or certification. Requirements vary by state and may include a background check, CPR certification, and proof of training completion.',
  },
  {
    step: 'Maintain Continuing Education',
    detail: 'EMTs must renew their certification every two years by completing continuing education requirements set by NREMT and their state EMS office, typically 36 hours for EMT-Basic recertification.',
  },
]

const employerTypes = [
  'Municipal fire departments with EMS units',
  'Private ambulance and medical transport companies',
  'Hospital-based EMS and emergency departments',
  'Air medical transport and helicopter EMS services',
  'Industrial and occupational health facilities',
  'Sports and event medical staffing companies',
  'Military and federal government EMS services',
  'Volunteer community EMS agencies',
]

const tips = [
  {
    title: 'Get NREMT Certified Before Applying',
    description:
      'National Registry certification through NREMT is accepted in most states and signals to employers that you meet a nationally recognized standard of competency. Many job listings require it as a baseline.',
  },
  {
    title: 'Gain Experience Through Volunteer EMS',
    description:
      'Volunteering with a local EMS agency is one of the most effective ways to build real-world experience, increase call volume exposure, and network with hiring supervisors at paid departments.',
  },
  {
    title: 'Consider Advancing to Paramedic',
    description:
      'Paramedics earn significantly more and have access to a wider range of employers and specializations. Many departments offer tuition assistance or paid training programs to support career advancement from EMT to paramedic.',
  },
  {
    title: 'Highlight Soft Skills in Your Application',
    description:
      'EMS employers value composure under pressure, teamwork, communication, and empathy just as much as clinical skills. Highlight real examples from training or volunteer experience that demonstrate these qualities.',
  },
]

const faqs = [
  {
    question: 'What are the requirements to become an EMT in the United States?',
    answer:
      'According to the National Highway Traffic Safety Administration (NHTSA), which oversees EMS education standards, becoming an EMT requires completing a state-approved EMT training program, passing the National Registry of Emergency Medical Technicians (NREMT) cognitive and psychomotor exams, and obtaining state licensure or certification. Most EMT-Basic programs require 120 to 150 hours of training. Requirements vary by state.',
  },
  {
    question: 'What is the difference between an EMT and a Paramedic?',
    answer:
      'According to the U.S. Bureau of Labor Statistics, EMTs provide basic emergency medical care and transportation, while paramedics provide more advanced care including administering medications, performing advanced airway management, and interpreting EKGs. Paramedics complete significantly more training, typically 1,200 to 1,800 hours compared to 120 to 150 hours for EMT-Basic certification.',
  },
  {
    question: 'How much do EMTs earn in the United States?',
    answer:
      'According to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, the median annual wage for EMTs and paramedics was $38,930 as of the most recent national estimate. The lowest 10 percent earned less than $27,000, while the highest 10 percent earned more than $64,000. Wages vary significantly by employer type, location, and certification level.',
  },
  {
    question: 'Is there strong job growth for EMTs in the US?',
    answer:
      'Yes. According to the U.S. Bureau of Labor Statistics, employment of EMTs and paramedics is projected to grow 7 percent from 2022 to 2032, faster than the average for all occupations. Demand is driven by an aging population, increasing emergency call volumes, and continued need for emergency medical services in both urban and rural communities.',
  },
  {
    question: 'What types of employers hire EMTs?',
    answer:
      'EMTs are employed by a wide range of organizations including local government fire and EMS departments, private ambulance companies, hospitals and healthcare systems, air medical transport services, event medical staffing companies, and industrial or occupational health facilities. Some EMTs also work as volunteers with community EMS agencies.',
  },
]

export default async function EmtJobsPage({ searchParams }: any) {
  const params = await searchParams

  const [{ count }, initialData] = await Promise.all([
  getMergedJobCount(params.what || 'emt jobs', params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
  searchMergedJobs({ what: params.what || 'emt jobs', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Simple Header */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            EMT Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="emt jobs" />
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
                what={params.what || 'emt jobs'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Job Market Overview */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Why EMT Jobs Are in Critical Demand Right Now</h2>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-4">
              According to the U.S. Bureau of Labor Statistics, employment of EMTs and paramedics is projected to grow 7 percent from 2022 to 2032, faster than the average for all occupations. An aging US population, rising chronic disease rates, and increased emergency call volumes are driving sustained demand for qualified emergency medical professionals across the country.
            </p>
            <p className="text-gray-700 mb-4">
              The Health Resources and Services Administration (HRSA) has identified EMS workforce shortages as a critical concern in many rural and underserved communities, where EMTs are often the only trained medical responders available. Urban departments are equally stretched, with many fire and EMS agencies actively competing for certified candidates.
            </p>
            <p className="text-gray-700">
              Whether you are seeking your first EMT position or looking to advance to a specialized role, the current job market offers strong opportunities across all EMS settings, from municipal fire departments to air medical transport and private ambulance services.
            </p>
          </div>
        </section>

        {/* EMT Certification Levels */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">EMT Certification Levels and Career Tracks</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the National Highway Traffic Safety Administration EMS Education Standards, the US EMS system recognizes multiple certification levels, each with distinct scopes of practice and career opportunities.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {emtLevels.map((level, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <level.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{level.title}</h3>
                <p className="text-gray-600 text-sm">{level.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Certification Path */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">How to Become a Certified EMT in the US</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The path to EMT certification is well-defined and achievable in a matter of months. The following steps reflect the nationally recognized process as outlined by the National Registry of Emergency Medical Technicians (NREMT) and the NHTSA EMS Education Standards.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {certificationSteps.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-700 font-bold rounded-full text-sm mb-4">
                  {index + 1}
                </span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.step}</h3>
                <p className="text-gray-600 text-sm">{item.detail}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Source: National Registry of Emergency Medical Technicians (NREMT) and National Highway Traffic Safety Administration EMS Education Standards.
          </p>
        </section>

        {/* Salary Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">EMT Salary Ranges Across the United States</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, the median annual wage for EMTs and paramedics was $38,930 nationally. Compensation varies considerably based on certification level, employer type, and geographic market. Fire-based EMS positions and flight programs typically offer the highest total compensation packages.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {salaryData.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-5 text-center border border-green-100">
                  <p className="text-xl font-bold text-green-600 mb-1">{item.range}</p>
                  <p className="text-sm text-gray-600">{item.level}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Source: U.S. Bureau of Labor Statistics, Occupational Outlook Handbook, EMTs and Paramedics. Figures represent national estimates and may vary by state and employer.
            </p>
          </div>
        </section>

        {/* Who Hires EMTs */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <FileText className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div className="w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Who Hires EMTs in the United States?</h2>
              <p className="text-gray-700 mb-6">
                EMTs are in demand across a diverse range of employers in both the public and private sectors. According to the Bureau of Labor Statistics, local government is the largest employer of EMTs and paramedics, followed by ambulance services and hospitals.
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {employerTypes.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-700 bg-white rounded-lg p-3">
                    <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Work Schedule Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Typical EMT Work Schedules</h2>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              EMT schedules vary widely depending on the employer. Common arrangements in the EMS industry include the following patterns.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: '24-Hour Shifts', detail: 'Common in fire-based EMS. One day on, two days off rotation.' },
                { label: '12-Hour Shifts', detail: 'Standard at many private ambulance companies. Day and night rotations.' },
                { label: '8-Hour Shifts', detail: 'More common in hospital-based EMS and non-emergency transport.' },
                { label: 'Per Diem', detail: 'Flexible on-call work for experienced EMTs, often supplementing another role.' },
                { label: 'Part-Time', detail: 'Available at many agencies for students or those transitioning into the field.' },
                { label: 'Overtime Availability', detail: 'High call volumes and staffing shortages often make overtime readily accessible.' },
              ].map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <p className="font-semibold text-gray-900 mb-1">{item.label}</p>
                  <p className="text-gray-600 text-sm">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing Your First EMT Job</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {tips.map((tip, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors"
              >
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About EMT Jobs</h2>
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
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only. EMT certification requirements, salary figures, and licensing rules vary by state and may change over time. Always consult the National Registry of Emergency Medical Technicians at nremt.org, the National Highway Traffic Safety Administration at nhtsa.gov, and your state EMS regulatory office for the most current and applicable requirements in your area.
          </p>
        </section>
      </div>
    </>
  )
}