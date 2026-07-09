import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, AlertTriangle, BookOpen, TrendingUp, ShieldCheck, Wrench } from 'lucide-react'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Sterile Processing Technician Jobs Hiring Now | SPT Positions Open Across the US',
  description: 'Sterile processing technician roles in hospital CSDs and surgical centers — CRCST certification valued, but many employers train entry-level candidates on the job.',
  keywords: 'sterile processing technician jobs, sterile processing tech hiring now, SPT jobs, central sterile technician, CRCST jobs, sterile processing department jobs, hospital sterile processing, surgical instrument technician',
  openGraph: {
    title: 'Sterile Processing Technician Jobs Hiring Immediately | SPT Positions Needed Now',
    description: 'Hospitals across the US are urgently hiring sterile processing technicians. Entry-level to lead SPT positions available with competitive pay and immediate start dates. Apply today.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sterile Processing Technician Jobs | Hiring Immediately Across the US',
    description: 'Find sterile processing technician jobs hiring now near you. Entry-level, certified, and lead SPT positions available in hospitals and surgical centers nationwide.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/sterile-processing-technician-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Sterile Processing Technician Jobs',
  description: 'Find sterile processing technician jobs hiring now across the United States. Browse entry-level, certified, and lead SPT positions in hospitals, surgical centers, and outpatient facilities.',
  url: 'https://www.oh-my-job.com/sterile-processing-technician-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Sterile Processing Technician Jobs',
    description: 'Current sterile processing technician job listings across the United States',
  },
}

const workSettings = [
  {
    title: 'Hospital Central Sterile Department',
    description: 'The largest employer of sterile processing technicians. Hospital SPDs decontaminate, inspect, assemble, and sterilize surgical instruments and medical devices used across all operating room and procedural units.',
    icon: ShieldCheck,
  },
  {
    title: 'Ambulatory Surgical Centers',
    description: 'Outpatient surgical centers require dedicated SPTs to maintain instrument sets between procedures. These facilities typically offer day shift schedules with lower patient acuity than inpatient hospital environments.',
    icon: Briefcase,
  },
  {
    title: 'Endoscopy and GI Units',
    description: 'Endoscopy units employ sterile processing technicians to reprocess flexible endoscopes according to manufacturer instructions and AAMI standards, following strict high-level disinfection protocols.',
    icon: MapPin,
  },
  {
    title: 'Dental and Oral Surgery Clinics',
    description: 'Dental practices and oral surgery centers rely on sterile processing professionals to sterilize handpieces, instruments, and cassettes between patient appointments in compliance with CDC infection control guidelines.',
    icon: CheckCircle,
  },
  {
    title: 'Long Term Acute Care Hospitals',
    description: 'LTACH facilities and specialty hospitals maintain sterile processing departments that require technically proficient SPTs capable of handling complex instrument sets across multiple care units.',
    icon: TrendingUp,
  },
  {
    title: 'Contract and Traveling SPT Positions',
    description: 'Staffing agencies specializing in healthcare place traveling sterile processing technicians at short-staffed facilities nationwide, offering significantly higher compensation and housing stipends for certified SPTs willing to travel.',
    icon: Clock,
  },
]

const certificationSteps = [
  {
    step: '1',
    title: 'Complete an Entry-Level SPT Training Program or Begin On-the-Job Training',
    description: 'According to the International Association of Healthcare Central Service Materiel Management (IAHCSMM), sterile processing technicians may enter the field through formal education programs at community colleges and vocational schools, or through on-the-job training offered by many hospital systems. IAHCSMM-recognized programs typically take three to six months to complete and cover decontamination, instrument inspection, sterilization methods, and quality assurance.',
  },
  {
    step: '2',
    title: 'Obtain the CRCST Certification from IAHCSMM',
    description: 'The Certified Registered Central Service Technician (CRCST) credential, issued by IAHCSMM, is the most widely recognized certification in the sterile processing profession. Candidates must complete 400 hours of hands-on work experience in a central service or sterile processing department and pass the CRCST examination. Many states and healthcare systems now require or strongly prefer CRCST certification for employment.',
  },
  {
    step: '3',
    title: 'Consider the CBSPD Certification as an Alternative',
    description: 'The Certification Board for Sterile Processing and Distribution (CBSPD) offers the Certified Sterile Processing and Distribution Technician (CSPDT) credential, which is recognized by employers across the United States. The CBSPD also offers technician-in-training pathways for candidates who are completing their required work hours while employed in an SPD department.',
  },
  {
    step: '4',
    title: 'Pursue Advanced Credentials to Increase Earning Potential',
    description: 'IAHCSMM offers advanced credentials including the Certified Instrument Specialist (CIS) and Certified Healthcare Leader (CHL) for experienced technicians and supervisors. The CIS is particularly valued by employers handling complex surgical robotics and loaner instrumentation. According to IAHCSMM, advanced credential holders consistently earn above the national median for the occupation.',
  },
]

const salaryByState = [
  { state: 'California', salary: '$56,000' },
  { state: 'Washington', salary: '$54,000' },
  { state: 'Alaska', salary: '$53,000' },
  { state: 'New York', salary: '$51,000' },
  { state: 'Massachusetts', salary: '$50,000' },
  { state: 'Texas', salary: '$40,000' },
]

const sterilizationMethods = [
  'Steam sterilization (autoclaving) under AAMI ST79 standards',
  'Ethylene oxide (EtO) sterilization for heat and moisture sensitive devices',
  'Hydrogen peroxide gas plasma sterilization using STERRAD systems',
  'Peracetic acid liquid sterilization for heat-sensitive immersible devices',
  'Low-temperature steam and formaldehyde sterilization',
  'Immediate Use Steam Sterilization (IUSS) for emergency instrument needs',
  'High-level disinfection with glutaraldehyde or ortho-phthalaldehyde (OPA)',
  'Biological and chemical indicator monitoring for sterilization cycle validation',
]

const faqs = [
  {
    question: 'Do sterile processing technicians need to be certified to work in the United States?',
    answer: 'Certification requirements for sterile processing technicians vary by state and employer. According to IAHCSMM, a growing number of states including New York, New Jersey, and Tennessee have enacted legislation requiring SPTs to hold a recognized certification such as the CRCST within a defined period after hire. Many hospital systems require certification as a condition of continued employment regardless of state law. Candidates who are not yet certified should confirm the requirements of their state and prospective employer before applying.',
  },
  {
    question: 'How much do sterile processing technicians earn on average in the United States?',
    answer: 'According to the U.S. Bureau of Labor Statistics Occupational Employment and Wage Statistics program, the median annual wage for medical equipment preparers, which includes sterile processing technicians, was $42,510 in May 2023, equivalent to approximately $20.44 per hour. Certified technicians, traveling SPTs, and those working in high-cost metropolitan areas consistently earn above the national median, with experienced lead technicians in major markets earning $55,000 to $65,000 annually.',
  },
  {
    question: 'What is the job outlook for sterile processing technicians?',
    answer: 'According to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, employment of medical equipment preparers is projected to grow 5 percent from 2022 to 2032, in line with the average for all occupations. Healthcare industry growth, surgical volume increases driven by an aging U.S. population, and expanded regulatory requirements around instrument reprocessing are all contributing to sustained demand for qualified SPTs. The shortage of certified technicians in many regions has made traveling SPT positions particularly well-compensated.',
  },
  {
    question: 'What does AAMI ST79 require of sterile processing technicians?',
    answer: 'AAMI ST79 is the comprehensive guide for steam sterilization published by the Association for the Advancement of Medical Instrumentation. According to AAMI, healthcare facilities that perform steam sterilization must follow documented procedures for cleaning, decontamination, preparation, packaging, sterilization, and storage of sterile items. SPTs are responsible for implementing and documenting compliance with these procedures, including the proper use of biological and chemical indicators, sterilizer maintenance records, and load documentation.',
  },
  {
    question: 'Can sterile processing technicians advance into management or surgical technology roles?',
    answer: 'Yes. Experienced SPTs frequently advance into lead technician, supervisor, and central service manager roles. The IAHCSMM Certified Healthcare Leader (CHL) credential supports this advancement pathway. Some sterile processing technicians also transition into surgical technology, infection prevention, or materials management careers. According to IAHCSMM, the SPT role provides foundational knowledge in anatomy, surgical procedures, and sterility assurance that is directly applicable to surgical tech and perioperative support careers.',
  },
  {
    question: 'Which states currently require sterile processing technicians to be certified?',
    answer: 'As of current reporting, New York, New Jersey, Tennessee, and a growing number of other states have enacted legislation requiring sterile processing technicians working in licensed healthcare facilities to obtain and maintain a nationally recognized certification. According to IAHCSMM, additional states are actively advancing similar legislation. Technicians working in states without a mandate are still strongly encouraged to obtain certification, as most major health systems require it regardless of state law as part of their accreditation and quality standards.',
  },
]

const tips = [
  {
    title: 'Begin the CRCST Application Before You Start Your Job Search',
    description: 'The CRCST examination requires 400 hours of documented hands-on experience in a sterile processing department. If you are currently employed in an SPD, begin tracking your hours immediately and submit your IAHCSMM application as soon as you are eligible. Many employers will accelerate your hiring process or increase your offered wage if you can confirm an active certification application.',
  },
  {
    title: 'Highlight Specific Sterilization Technologies on Your Resume',
    description: 'Hiring managers in sterile processing look for technicians who can operate specific sterilization equipment including STERRAD hydrogen peroxide plasma sterilizers, Getinge and AMSCO autoclaves, and OER-Pro endoscope reprocessors. Listing specific equipment by brand name on your resume demonstrates hands-on competency rather than general familiarity and significantly increases your response rate from hospital recruiters.',
  },
  {
    title: 'Consider a Traveling SPT Position to Accelerate Your Earnings',
    description: 'Certified sterile processing technicians willing to accept 13-week travel contracts can earn significantly above local market rates due to the widespread nationwide shortage of qualified SPTs. Travelers with CRCST or CSPDT credentials and experience in complex robotic or orthopedic instrument sets are particularly in demand and can access housing stipends, completion bonuses, and hourly rates that substantially exceed permanent staff compensation.',
  },
  {
    title: 'Learn Surgical Instrumentation Nomenclature for Your Target Specialty',
    description: 'SPTs who can accurately identify and assemble instrument sets for orthopedic, cardiac, neurosurgical, and laparoscopic procedures command higher wages and are preferred for surgical center and robotic surgery program positions. Investing time in learning the names and functions of instruments in your target specialty before your interview demonstrates initiative and significantly differentiates you from candidates without that preparation.',
  },
]

export default async function SterileProcessingTechnicianJobsPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'sterile processing technician', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'sterile processing technician', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
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
            Sterile Processing Technician Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="sterile processing technician" />
          </aside>
          <div className="flex-1">
            
            {/* Client wrapper isolé — pas de use client sur la page */}
                       

            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'sterile processing technician'}
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
            <h2 className="text-2xl font-bold text-gray-900">Where Sterile Processing Technicians Work Across the United States</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics, medical equipment preparers including sterile processing technicians are employed across a wide range of inpatient and outpatient healthcare settings. Each environment presents distinct instrument complexity, scheduling structure, and compensation levels.
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
            <h2 className="text-2xl font-bold text-gray-900">How to Become a Certified Sterile Processing Technician</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Sterile processing technician certification is administered by two nationally recognized bodies: the International Association of Healthcare Central Service Materiel Management (IAHCSMM) and the Certification Board for Sterile Processing and Distribution (CBSPD). Both credentials are accepted by employers across the United States and are increasingly required by state law and hospital accreditation standards.
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
            <h2 className="text-2xl font-bold text-gray-900">How Much Do Sterile Processing Technicians Earn?</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics Occupational Employment and Wage Statistics program, the median annual wage for medical equipment preparers was $42,510 in May 2023. Certified technicians, those working in high-cost metropolitan markets, and traveling SPTs consistently earn above this figure. Lead and supervisor roles in major health systems frequently offer compensation in excess of $60,000 annually.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">$42,510</p>
                <p className="text-sm text-gray-600">Median Annual Wage (BLS 2023)</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-blue-600 mb-2">$20.44</p>
                <p className="text-sm text-gray-600">Median Hourly Rate</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-purple-600 mb-2">$62,000+</p>
                <p className="text-sm text-gray-600">Lead and Supervisor Roles</p>
              </div>
            </div>
            <h3 className="font-semibold text-gray-800 mb-4">Average SPT Salary by State</h3>
            <div className="grid md:grid-cols-3 gap-3">
              {salaryByState.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-3 flex justify-between items-center">
                  <span className="text-sm text-gray-700 font-medium">{item.state}</span>
                  <span className="text-sm font-bold text-green-600">{item.salary}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics, May 2023. Figures are approximations and vary by employer, setting, certification status, and experience level.
            </p>
          </div>
        </section>

        {/* Career Ladder */}
        <section className="mt-20">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <TrendingUp className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Career Advancement for Sterile Processing Technicians</h2>
                <p className="text-gray-700 mb-4">
                  The sterile processing profession offers a defined advancement pathway from entry-level technician to department director. According to IAHCSMM, the profession has seen growing recognition within hospital leadership over the past decade as healthcare-associated infection prevention has become a primary quality and accreditation focus. Technicians who invest in advanced credentials and cross-training in surgical instrumentation advance significantly faster than uncredentialed peers.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-6 flex-wrap">
                  {['SPT Trainee', 'SPT I (Entry)', 'SPT II (Certified)', 'Lead Technician', 'SPD Supervisor', 'CS Manager / Director'].map((level, index, arr) => (
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

        {/* Sterilization Methods */}
        <section className="mt-20">
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <Wrench className="w-8 h-8 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Sterilization Methods and Standards SPTs Must Know</h2>
                <p className="text-gray-700 mb-6">
                  According to the Association for the Advancement of Medical Instrumentation (AAMI) and the Centers for Disease Control and Prevention (CDC) Guidelines for Disinfection and Sterilization in Healthcare Facilities, sterile processing technicians are required to be competent in multiple sterilization and disinfection methods. Employers increasingly assess technical knowledge of specific modalities during the hiring process. The following methods are standard across U.S. hospital sterile processing departments:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {sterilizationMethods.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Regulatory Requirements */}
        <section className="mt-20">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Regulatory Standards Governing Sterile Processing in the United States</h2>
                <p className="text-gray-700 mb-6">
                  Sterile processing departments in the United States operate under a complex framework of federal, accreditation, and manufacturer-specific standards. According to The Joint Commission, healthcare facilities must demonstrate compliance with established instrument reprocessing standards as part of their accreditation survey process. Non-compliance can result in citations, corrective action requirements, and in serious cases, suspension of surgical services.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Key Standards SPTs Work Under</h3>
                    <ul className="text-gray-600 text-sm space-y-2">
                      {[
                        'AAMI ST79: Comprehensive guide for steam sterilization and sterility assurance',
                        'AAMI ST58: Chemical sterilization and high-level disinfection',
                        'CDC Guidelines for Disinfection and Sterilization in Healthcare Facilities',
                        'FDA device-specific reprocessing instructions (Instructions for Use)',
                        'The Joint Commission Environment of Care and Infection Control standards',
                        'OSHA Bloodborne Pathogens standard (29 CFR 1910.1030)',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Shift Types in Sterile Processing</h3>
                    <ul className="text-gray-600 text-sm space-y-2">
                      {[
                        'Day shift: Typically 6:00 AM to 2:30 PM; highest instrument volume',
                        'Evening shift: 2:00 PM to 10:30 PM; shift differential pay in most facilities',
                        'Night shift: 10:00 PM to 6:30 AM; differential pay; lower supervision ratio',
                        'Weekend and on-call: Premium pay for covering surgical emergency needs',
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
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing a Sterile Processing Technician Job Quickly</h2>
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Sterile Processing Technician Jobs</h2>
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
            <strong>Disclaimer:</strong> The salary figures, employment projections, certification requirements, and regulatory information provided on this page are for general informational purposes only and do not constitute legal or career advice. Sterile processing technician licensing and certification requirements vary by state and employer. Always consult the International Association of Healthcare Central Service Materiel Management at iahcsmm.org, the Certification Board for Sterile Processing and Distribution at sterileprocessing.org, the Association for the Advancement of Medical Instrumentation at aami.org, the U.S. Bureau of Labor Statistics at bls.gov, and OSHA at osha.gov for the most current and applicable information.
          </p>
        </section>
      </div>
    </>
  )
}