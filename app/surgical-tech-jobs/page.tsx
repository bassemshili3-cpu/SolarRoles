import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Heart, DollarSign, MapPin, CheckCircle, BookOpen, Users, Award, TrendingUp, FileText, Briefcase, Shield, Clock, GraduationCap, Stethoscope, AlertTriangle } from 'lucide-react'
import { searchJobs, getCachedJobCount, AdzunaSearchResult } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Urgently Hiring Surgical Tech Roles | Apply Today',
  description: 'Hundreds of surgical tech jobs hiring immediately in hospitals and surgical centers across the U.S. Competitive pay, sign on bonuses, and full benefits. Browse openings and start your operating room career now!',
  keywords: 'surgical tech jobs, surgical technologist jobs, surgical technician jobs, operating room tech jobs, scrub tech jobs, surgical tech hiring now, certified surgical technologist jobs',
  openGraph: {
    title: 'Surgical Tech Jobs Hiring Now | Immediate Openings Nationwide',
    description: 'Hospitals and surgical centers urgently seeking surgical technologists. Competitive salaries, full benefits, and sign on bonuses available. Find your next OR position today!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Surgical Tech Jobs | Urgent Need Nationwide',
    description: 'Surgical tech positions needed ASAP in hospitals across America. Competitive pay and benefits. Browse hundreds of openings and apply in minutes!',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/surgical-tech-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Surgical Tech Jobs',
  description: 'Find surgical tech jobs hiring across the United States. Browse hundreds of positions in hospitals, ambulatory surgery centers, and specialty clinics.',
  url: 'https://www.oh-my-job.com/surgical-tech-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Surgical Tech Jobs',
    description: 'Current job listings for surgical technologists and scrub techs nationwide',
  },
}

const surgicalTechRoles = [
  { title: 'Hospital Surgical Technologist', description: 'Assist surgeons during operations in hospital operating rooms, handling instruments, sutures, and sterile supplies across multiple surgical specialties', icon: Heart },
  { title: 'Ambulatory Surgery Center Tech', description: 'Work in outpatient surgical facilities performing same day procedures with a focus on fast paced patient turnover and efficient room preparation', icon: Briefcase },
  { title: 'Travel Surgical Tech', description: 'Take short term assignments at hospitals and surgical centers across the country, often with premium pay, housing stipends, and travel reimbursement', icon: MapPin },
  { title: 'Orthopedic Surgical Tech', description: 'Specialize in bone and joint surgeries including replacements, fracture repairs, and arthroscopic procedures, managing specialized orthopedic instruments', icon: Shield },
  { title: 'Cardiovascular Surgical Tech', description: 'Assist in open heart surgeries, valve replacements, and vascular procedures in high acuity operating rooms with specialized cardiac instrumentation', icon: Stethoscope },
  { title: 'First Assistant Surgical Tech', description: 'Take on an expanded role by providing direct surgical assistance including tissue retraction, hemostasis, and wound closure under surgeon supervision', icon: Award },
]

const educationPathway = [
  { step: 'Complete an Accredited Surgical Technology Program', detail: 'According to the Bureau of Labor Statistics, surgical technologists typically need a postsecondary certificate or an associate\'s degree from an accredited program. The Commission on Accreditation of Allied Health Education Programs (CAAHEP) accredits over 450 surgical technology programs across the United States.' },
  { step: 'Complete Clinical Rotations', detail: 'Accredited programs include supervised clinical rotations in hospital operating rooms where students gain hands on experience assisting in real surgical procedures across multiple specialties.' },
  { step: 'Earn National Certification', detail: 'According to the National Board of Surgical Technology and Surgical Assisting (NBSTSA), graduates can earn the Certified Surgical Technologist (CST) credential by passing a national certification examination. Many employers require or strongly prefer CST certification.' },
  { step: 'Obtain State Credentials if Required', detail: 'According to the Association of Surgical Technologists (AST), several states have enacted legislation requiring surgical technologists to hold specific credentials. Requirements vary by state and may include certification, registration, or licensure.' },
  { step: 'Maintain Continuing Education', detail: 'The NBSTSA requires CST holders to complete continuing education credits for recertification. This ensures surgical techs stay current with evolving surgical techniques, instruments, and safety protocols.' },
]

const salaryByExperience = [
  { level: 'Entry Level (0 to 2 years)', range: '$42,000 to $50,000', note: 'New graduates from accredited programs, many employers offer sign on bonuses' },
  { level: 'Mid Career (3 to 7 years)', range: '$50,000 to $60,000', note: 'Experienced techs with specialty skills command higher base pay' },
  { level: 'Senior (8+ years)', range: '$58,000 to $72,000', note: 'Lead surgical techs and those with first assistant credentials' },
  { level: 'Travel Surgical Tech', range: '$65,000 to $95,000+', note: 'Premium pay plus housing stipends, travel, and per diem allowances' },
]

const dailyResponsibilities = [
  { task: 'Prepare the Operating Room', description: 'Set up sterile fields, arrange surgical instruments, verify equipment functionality, and ensure all necessary supplies are available before the patient arrives' },
  { task: 'Scrub In and Maintain Sterile Technique', description: 'Perform surgical hand scrub procedures, gown and glove using aseptic technique, and maintain the sterile field throughout the entire surgical procedure' },
  { task: 'Pass Instruments and Supplies', description: 'Anticipate the surgeon\'s needs and hand off instruments, sutures, sponges, and other materials during the operation with precision and efficiency' },
  { task: 'Handle Surgical Specimens', description: 'Properly label, contain, and process tissue specimens removed during surgery according to facility protocols and pathology department requirements' },
  { task: 'Count Instruments and Sponges', description: 'Perform mandatory counts of all instruments, sponges, needles, and sharps before, during, and after the procedure to prevent retained foreign objects' },
  { task: 'Assist with Wound Closure', description: 'Prepare suture materials, apply dressings, and assist the surgical team during the closing phase of the operation' },
]

const topHiringStates = [
  { state: 'California', detail: 'Highest employment level for surgical techs with average salaries exceeding $65,000 annually' },
  { state: 'Texas', detail: 'Rapidly expanding hospital systems with consistent demand and competitive signing bonuses' },
  { state: 'New York', detail: 'High concentration of major medical centers and teaching hospitals with strong union representation' },
  { state: 'Florida', detail: 'Large retiree population drives high surgical volumes, especially in orthopedics and cardiovascular' },
  { state: 'Pennsylvania', detail: 'Dense network of hospital systems and surgical centers with strong educational pipeline programs' },
  { state: 'Ohio', detail: 'Major health systems like Cleveland Clinic and Ohio State create steady demand across the state' },
]

const workEnvironments = [
  { setting: 'Hospital Operating Rooms', percentage: '70%', description: 'The majority of surgical techs work in hospital ORs handling a wide variety of surgical specialties including general, orthopedic, cardiac, and neurological procedures' },
  { setting: 'Ambulatory Surgery Centers', percentage: '17%', description: 'Outpatient facilities performing same day surgeries often offer more predictable schedules with fewer nights, weekends, and on call shifts' },
  { setting: 'Physician Offices', percentage: '5%', description: 'Some surgical techs work in specialty physician offices that perform in office procedures such as dermatology, podiatry, or plastic surgery' },
  { setting: 'Dental and Specialty Clinics', percentage: '4%', description: 'Oral surgery practices and specialty clinics hire surgical techs to assist with complex procedures requiring sterile technique' },
  { setting: 'Travel and Agency Assignments', percentage: '4%', description: 'Staffing agencies place traveling surgical techs at facilities facing temporary shortages, often with premium compensation packages' },
]

const certifications = [
  { name: 'Certified Surgical Technologist (CST)', provider: 'National Board of Surgical Technology and Surgical Assisting (NBSTSA)', description: 'The gold standard certification for surgical techs. According to the NBSTSA, the CST exam tests knowledge in perioperative patient care, surgical procedures, sterile technique, and instrumentation. Many states and employers require this credential.' },
  { name: 'Tech in Surgery Certified (TS C)', provider: 'National Center for Competency Testing (NCCT)', description: 'An alternative national certification recognized by many employers. Validates competency in surgical technology principles, patient safety, and operating room procedures.' },
  { name: 'Certified Surgical First Assistant (CSFA)', provider: 'NBSTSA', description: 'An advanced credential for experienced surgical techs who perform expanded duties including tissue handling, hemostasis, and wound closure. Requires additional education and clinical experience beyond CST.' },
  { name: 'Basic Life Support (BLS)', provider: 'American Heart Association', description: 'Required by virtually all employers. According to the American Heart Association, BLS certification ensures healthcare professionals can perform high quality CPR and use an automated external defibrillator.' },
]

const faqs = [
  {
    question: 'How long does it take to become a surgical tech?',
    answer: 'According to the Bureau of Labor Statistics, most surgical technology programs take between 12 and 24 months to complete. Certificate programs can be finished in as few as 12 months, while associate\'s degree programs typically take two years. Both types include classroom instruction in anatomy, pharmacology, and surgical procedures, as well as supervised clinical rotations in hospital operating rooms.',
  },
  {
    question: 'What is the average salary for a surgical tech?',
    answer: 'According to the Bureau of Labor Statistics, the median annual wage for surgical technologists was approximately $60,610 as of the most recent data. The lowest 10 percent earned less than $40,400 and the highest 10 percent earned more than $77,590. Salaries vary based on geographic location, employer type, years of experience, and specialty certifications.',
  },
  {
    question: 'Is there a shortage of surgical techs in the United States?',
    answer: 'Yes. According to the Association of Surgical Technologists (AST), many hospitals and surgical centers across the country report difficulty filling surgical technologist positions. The Bureau of Labor Statistics projects 5 percent job growth for surgical technologists from 2022 to 2032, with approximately 8,600 openings expected each year due to growth and replacement needs.',
  },
  {
    question: 'Do surgical techs need to be certified?',
    answer: 'Certification requirements vary by state. According to the AST, several states have enacted credentialing legislation that requires surgical technologists to hold a CST or equivalent certification. Even in states without mandatory requirements, the majority of employers strongly prefer or require national certification. Earning the CST credential from the NBSTSA is the most common pathway.',
  },
  {
    question: 'What is the difference between a surgical tech and a surgical nurse?',
    answer: 'Surgical technologists (scrub techs) focus on maintaining the sterile field, passing instruments, and assisting the surgeon during operations. Surgical nurses, also known as perioperative nurses or circulating nurses, are registered nurses (RNs) who monitor the patient, administer medications, document the procedure, and coordinate the overall operating room. According to the BLS, surgical nurses require a nursing degree and RN licensure, while surgical techs complete a surgical technology program.',
  },
]

export default async function SurgicalTechJobsPage({ searchParams }: any) {
  const params = await searchParams

  const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'surgical tech', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'surgical tech', where: params.where || '', results_per_page: 30, page: 1 })
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
            Surgical Tech Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="surgical tech" />
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
                what={params.what || 'surgical tech'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Types of Surgical Tech Roles */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Stethoscope className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Surgical Tech Positions</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Surgical technologists play a critical role in the operating room, and the profession offers diverse career paths depending on your interests and experience level. According to the Bureau of Labor Statistics, surgical technologists are employed across a variety of healthcare settings, from large teaching hospitals to specialized outpatient surgery centers.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {surgicalTechRoles.map((role, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <role.icon className="w-10 h-10 text-purple-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How to Become a Surgical Tech */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">How to Become a Certified Surgical Tech</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the Bureau of Labor Statistics, surgical technologists typically complete a postsecondary education program and earn national certification. The following steps outline the most common pathway into this rewarding healthcare career.
          </p>
          <div className="space-y-4">
            {educationPathway.map((item, index) => (
              <div key={index} className="flex items-start gap-4 bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <span className="inline-flex items-center justify-center w-9 h-9 bg-blue-100 text-blue-700 font-bold rounded-full text-sm flex-shrink-0">
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">{item.step}</p>
                  <p className="text-gray-600 text-sm">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Sources: U.S. Bureau of Labor Statistics, NBSTSA, and the Association of Surgical Technologists (AST)
          </p>
        </section>

        {/* Salary by Experience */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Surgical Tech Salary Overview</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the Bureau of Labor Statistics, the median annual wage for surgical technologists was approximately $60,610. Compensation increases with experience, specialty skills, and geographic location. Travel surgical techs often earn significantly more due to premium pay structures and additional stipends.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {salaryByExperience.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-5">
                  <p className="font-semibold text-gray-900 mb-1">{item.level}</p>
                  <p className="text-2xl font-bold text-green-600 mb-2">{item.range}</p>
                  <p className="text-gray-500 text-sm">{item.note}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics
            </p>
          </div>
        </section>

        {/* Daily Responsibilities */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">What Does a Surgical Tech Do Every Day?</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Surgical technologists are essential members of the surgical team, responsible for ensuring that every operation runs safely and efficiently. According to the Association of Surgical Technologists, the following core responsibilities define the daily work of a scrub tech in the operating room.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dailyResponsibilities.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-indigo-300 transition-colors">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.task}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Work Environments */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Briefcase className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Where Surgical Techs Work</h2>
              <p className="text-gray-700 mb-6">
                According to the Bureau of Labor Statistics, surgical technologists are employed in a variety of healthcare settings. The following breakdown shows the distribution of employment across the most common work environments.
              </p>
              <div className="space-y-3">
                {workEnvironments.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-5 flex flex-col md:flex-row md:items-center gap-4">
                    <span className="inline-flex items-center justify-center px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded-lg text-sm flex-shrink-0 min-w-[50px] text-center">
                      {item.percentage}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">{item.setting}</p>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Source: U.S. Bureau of Labor Statistics, Occupational Outlook Handbook
              </p>
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section className="mt-20 bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Award className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Certifications for Surgical Technologists</h2>
              <p className="text-gray-700 mb-6">
                National certification validates your competency and is required or preferred by the vast majority of employers. According to the Association of Surgical Technologists, holding a recognized credential significantly improves job prospects and earning potential.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {certifications.map((cert, index) => (
                  <div key={index} className="bg-white rounded-lg p-5">
                    <h3 className="font-semibold text-gray-900 mb-1">{cert.name}</h3>
                    <p className="text-amber-700 text-xs font-medium mb-2">Provider: {cert.provider}</p>
                    <p className="text-gray-600 text-sm">{cert.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Top Hiring States */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-7 h-7 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">Top States Hiring Surgical Techs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the Bureau of Labor Statistics, states with the highest employment levels for surgical technologists are those with large hospital networks and high surgical volumes. The following states consistently show the strongest demand for qualified scrub techs.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topHiringStates.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <p className="font-semibold text-gray-900">{item.state}</p>
                </div>
                <p className="text-gray-600 text-sm">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Job Market Outlook */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-rose-600" />
            <h2 className="text-2xl font-bold text-gray-900">Surgical Tech Job Market Outlook</h2>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the Bureau of Labor Statistics, the demand for surgical technologists is expected to remain strong as the volume of surgical procedures continues to rise. An aging population requiring more surgeries, advances in surgical techniques, and ongoing workforce shortages in operating rooms are all contributing to sustained hiring activity across the country.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <p className="text-3xl font-bold text-rose-600 mb-2">+5%</p>
                <p className="text-sm text-gray-600">Projected job growth for surgical technologists from 2022 to 2032 according to the BLS</p>
              </div>
              <div className="text-center p-4">
                <p className="text-3xl font-bold text-rose-600 mb-2">8,600</p>
                <p className="text-sm text-gray-600">Estimated annual openings for surgical techs due to growth and workforce replacement needs</p>
              </div>
              <div className="text-center p-4">
                <p className="text-3xl font-bold text-rose-600 mb-2">$60,610</p>
                <p className="text-sm text-gray-600">Median annual wage for surgical technologists per the Bureau of Labor Statistics</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Source: U.S. Bureau of Labor Statistics, Occupational Outlook Handbook, Surgical Technologists
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Surgical Tech Jobs</h2>
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
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and does not constitute professional, medical, or legal advice. Salary figures, job growth projections, certification requirements, and state regulations are based on publicly available data and may vary by employer, state, and individual circumstances. Always consult the U.S. Bureau of Labor Statistics at bls.gov, the Association of Surgical Technologists at ast.org, and the NBSTSA at nbstsa.org for the most current and applicable information. Job seekers should verify all position requirements directly with the hiring organization before applying.
          </p>
        </section>
      </div>
    </>
  )
}