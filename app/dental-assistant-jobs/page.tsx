import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, AlertTriangle, BookOpen, TrendingUp, ShieldCheck, Heart } from 'lucide-react'
import { searchJobs, getCachedJobCount, AdzunaSearchResult } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Dental Assistant Jobs Hiring Immediately | Positions Open Across the US',
  description: 'Dental offices across the United States are urgently hiring dental assistants right now. Chairside, orthodontic, and oral surgery positions available with competitive pay and benefits. No degree required for many roles. Apply today before these positions are filled.',
  keywords: 'dental assistant jobs, dental assistant hiring now, dental assistant positions, chairside dental assistant, orthodontic assistant jobs, oral surgery assistant, dental assistant near me, dental assistant careers',
  openGraph: {
    title: 'Dental Assistant Jobs Hiring Now | Positions Needed Urgently Across the US',
    description: 'Hundreds of dental offices are actively hiring dental assistants. Browse full-time and part-time positions with competitive pay and immediate start dates. Apply today.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dental Assistant Jobs | Hiring Immediately Near You',
    description: 'Find dental assistant jobs hiring now in your area. Chairside, ortho, and oral surgery positions available across all 50 states. Apply today.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/dental-assistant-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Dental Assistant Jobs',
  description: 'Find dental assistant jobs hiring now across the United States. Browse chairside, orthodontic, oral surgery, and pediatric dental assistant positions.',
  url: 'https://www.oh-my-job.com/dental-assistant-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Dental Assistant Jobs',
    description: 'Current dental assistant job listings across the United States',
  },
}

const workSettings = [
  {
    title: 'General Dentistry',
    description: 'The most common setting for dental assistants. Chairside assistants in general practices support dentists during cleanings, fillings, extractions, and crown placements, while also managing patient records and sterilization.',
    icon: Heart,
  },
  {
    title: 'Orthodontics',
    description: 'Orthodontic assistants work alongside orthodontists during braces placements, wire adjustments, and Invisalign fittings. Patient volume tends to be high and the pace is fast, with strong earning potential.',
    icon: ShieldCheck,
  },
  {
    title: 'Oral and Maxillofacial Surgery',
    description: 'Oral surgery assistants support complex procedures including wisdom tooth extractions, implant placements, and jaw surgeries. These roles often require additional training and command higher wages.',
    icon: Briefcase,
  },
  {
    title: 'Pediatric Dentistry',
    description: 'Pediatric dental assistants work exclusively with children and adolescents, requiring strong interpersonal skills and patience. These practices often offer family-friendly scheduling.',
    icon: MapPin,
  },
  {
    title: 'Periodontics',
    description: 'Periodontic assistants support gum disease treatment, scaling and root planing procedures, and gum graft surgeries under the direction of a licensed periodontist.',
    icon: Shield,
  },
  {
    title: 'Corporate Dental Groups',
    description: 'Large dental service organizations such as Aspen Dental, Heartland Dental, and Pacific Dental Services employ dental assistants at scale, offering standardized training, benefits, and advancement pathways.',
    icon: TrendingUp,
  },
]

const certificationSteps = [
  {
    step: '1',
    title: 'Complete a Dental Assistant Training Program or On-the-Job Training',
    description: 'According to the American Dental Association (ADA), dental assistants may enter the field through formal education programs accredited by the Commission on Dental Accreditation (CODA), or through on-the-job training in states that permit it. CODA-accredited programs typically take nine to eleven months and are offered at community colleges and vocational schools nationwide.',
  },
  {
    step: '2',
    title: 'Meet Your State Licensing or Registration Requirements',
    description: 'Dental assistant requirements are set at the state level. According to the Dental Assisting National Board (DANB), some states require licensure, registration, or a state-specific certification before a dental assistant may perform expanded functions such as coronal polishing or placing sealants. Other states allow dental assistants to work without a license under dentist supervision.',
  },
  {
    step: '3',
    title: 'Obtain Radiation Health and Safety (RHS) Certification if Required',
    description: 'Most states that permit dental assistants to take dental radiographs require proof of radiography training or a passing score on the DANB Radiation Health and Safety exam. The RHS is one of the three components of the Certified Dental Assistant (CDA) credential and is widely recognized by state boards across the country.',
  },
  {
    step: '4',
    title: 'Pursue the Certified Dental Assistant (CDA) Credential',
    description: 'The CDA credential, administered by the Dental Assisting National Board, is the nationally recognized standard for dental assistant competency. Achieving the CDA requires passing the Infection Control (ICE), Radiation Health and Safety (RHS), and General Chairside (GC) components. According to DANB, CDA-credentialed assistants consistently earn higher wages and are preferred by employers in competitive markets.',
  },
]

const salaryByState = [
  { state: 'Alaska', salary: '$54,000' },
  { state: 'Minnesota', salary: '$50,000' },
  { state: 'Washington', salary: '$49,000' },
  { state: 'Massachusetts', salary: '$48,000' },
  { state: 'California', salary: '$47,000' },
  { state: 'Florida', salary: '$36,000' },
]

const expandedFunctions = [
  'Coronal polishing and prophylaxis preparation',
  'Application of pit and fissure sealants',
  'Placing and removing rubber dams',
  'Taking final impressions under dentist supervision',
  'Removing sutures after dentist evaluation',
  'Applying topical anesthetics before injections',
  'Placing temporary restorations',
  'Performing pulp vitality testing',
]

const faqs = [
  {
    question: 'Do dental assistants need to be licensed in every state?',
    answer: 'Licensing and registration requirements for dental assistants vary significantly by state. According to the Dental Assisting National Board (DANB), some states require dental assistants to hold a state-issued license or registration before performing any clinical duties, while others allow dental assistants to work under direct dentist supervision without a license. A complete breakdown of state-by-state requirements is available through DANB at danb.org.',
  },
  {
    question: 'How long does it take to become a dental assistant?',
    answer: 'The time required depends on your state requirements and the pathway you choose. CODA-accredited dental assisting programs typically take nine to eleven months for a certificate or diploma, or two years for an associate degree. In states that allow on-the-job training, it is possible to begin working as a trainee and earn credentials while employed. According to the U.S. Bureau of Labor Statistics, most practicing dental assistants receive some combination of formal education and hands-on workplace training.',
  },
  {
    question: 'How much do dental assistants earn on average in the United States?',
    answer: 'According to the U.S. Bureau of Labor Statistics Occupational Employment and Wage Statistics program, the median annual wage for dental assistants was $46,540 in May 2023, equivalent to approximately $22.37 per hour. Dental assistants in oral surgery and orthodontic settings typically earn above the national median, and those with expanded function certifications command a premium in competitive markets.',
  },
  {
    question: 'What is the job outlook for dental assistants?',
    answer: 'According to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, employment of dental assistants is projected to grow 7 percent from 2022 to 2032, faster than the average for all occupations. The aging U.S. population, growing awareness of preventive dental care, and the expansion of dental service organizations are all cited as key drivers of sustained hiring demand. The BLS estimates approximately 60,400 openings per year over the decade.',
  },
  {
    question: 'What is an Expanded Function Dental Assistant (EFDA)?',
    answer: 'An Expanded Function Dental Assistant (EFDA) is a dental assistant who has received additional training and state authorization to perform clinical procedures that go beyond the standard scope of practice. According to the American Dental Association, EFDA tasks vary by state and may include placing composite restorations, taking impressions, or performing coronal polishing. EFDAs typically earn significantly more than standard dental assistants and are in high demand in states with active EFDA programs.',
  },
  {
    question: 'Can a dental assistant advance into dental hygiene or dentistry?',
    answer: 'Yes. Working as a dental assistant is a well-recognized entry point into the broader dental profession. Many community colleges offer dental hygiene programs that give credit for prior dental assisting coursework or experience. According to the American Dental Hygienists Association, dental assistants who pursue a dental hygiene associate degree can typically complete the program in two years. Some dental assistants also go on to earn a Doctor of Dental Surgery (DDS) or Doctor of Dental Medicine (DMD) degree.',
  },
]

const tips = [
  {
    title: 'Obtain Your State Radiography Permit Before Applying',
    description: 'In most states that require dental assistants to hold a radiography authorization, having your X-ray permit already in hand when you apply eliminates a major bottleneck in the hiring process. Many dental offices will not schedule a start date until this requirement is confirmed, so completing it proactively puts you ahead of most applicants.',
  },
  {
    title: 'Highlight Infection Control Knowledge on Your Resume',
    description: 'Dental employers consistently rank infection control competency as a top hiring criterion. Referencing your knowledge of OSHA Bloodborne Pathogens standards and CDC Guidelines for Infection Control in Dental Health Care Settings in your application materials signals professional readiness and reduces onboarding risk for the practice.',
  },
  {
    title: 'Consider the CDA Credential Even If Not Required in Your State',
    description: 'Even in states where CDA certification is not mandated, holding the credential demonstrates a verified level of competency that sets you apart from uncredentialed applicants. DANB data consistently shows that CDA holders earn higher starting wages and receive more interview callbacks per application than non-certified candidates.',
  },
  {
    title: 'Target Dental Service Organizations for Faster Hiring',
    description: 'Large dental service organizations (DSOs) such as Aspen Dental, Heartland Dental, and Western Dental maintain centralized recruiting operations and hire at significantly higher volume than independent practices. If your goal is to get hired quickly, applying to DSO openings alongside independent office roles maximizes your number of active opportunities.',
  },
]

export default async function DentalAssistantJobsPage({ searchParams }: any) {
  const params = await searchParams

 const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'dental assistant', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'dental assistant', where: params.where || '', results_per_page: 30, page: 1 })
  .then((data: AdzunaSearchResult) => ({ ...data, results: data.results.map(normalizeAdzuna) })),
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
            Dental Assistant Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="dental assistant" />
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
                what={params.what || 'dental assistant'}
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
            <h2 className="text-2xl font-bold text-gray-900">Where Dental Assistants Work Across the United States</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics, approximately 352,000 dental assistants are employed across the United States. The role spans a wide variety of practice types, each offering a distinct clinical environment, patient population, and compensation structure.
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
            <h2 className="text-2xl font-bold text-gray-900">How to Become a Dental Assistant in the United States</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            The pathway to becoming a dental assistant is among the most accessible in healthcare. Requirements are set at the state level and range from on-the-job training to formal licensure, depending on jurisdiction and the clinical duties involved.
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
            <h2 className="text-2xl font-bold text-gray-900">How Much Do Dental Assistants Earn?</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics Occupational Employment and Wage Statistics program, the median annual wage for dental assistants was $46,540 in May 2023. Dental assistants working in oral surgery, orthodontics, and government-funded dental programs consistently earn above the national median. Expanded function certifications can add several dollars per hour to base pay in eligible states.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">$46,540</p>
                <p className="text-sm text-gray-600">Median Annual Wage (BLS 2023)</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-blue-600 mb-2">$22.37</p>
                <p className="text-sm text-gray-600">Median Hourly Rate</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-purple-600 mb-2">$60,000+</p>
                <p className="text-sm text-gray-600">Top 10% of Earners</p>
              </div>
            </div>
            <h3 className="font-semibold text-gray-800 mb-4">Average Dental Assistant Salary by State</h3>
            <div className="grid md:grid-cols-3 gap-3">
              {salaryByState.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-3 flex justify-between items-center">
                  <span className="text-sm text-gray-700 font-medium">{item.state}</span>
                  <span className="text-sm font-bold text-green-600">{item.salary}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics, May 2023. Figures are approximations and vary by employer, specialty, and experience level.
            </p>
          </div>
        </section>

        {/* Career Ladder */}
        <section className="mt-20">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <TrendingUp className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Career Advancement for Dental Assistants</h2>
                <p className="text-gray-700 mb-4">
                  A dental assistant position is both a stable career and a proven entry point into the broader dental profession. Many dental hygienists, dental office managers, and even dentists began as dental assistants. Employers across the industry actively support continuing education and advanced credentialing for high-performing assistants.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-6 flex-wrap">
                  {['Dental Assistant', 'CDA (Certified)', 'EFDA (Expanded Function)', 'Dental Hygienist', 'Office Manager', 'DDS / DMD'].map((level, index, arr) => (
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

        {/* Expanded Functions */}
        <section className="mt-20">
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <FileText className="w-8 h-8 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Expanded Function Dental Assistants (EFDA)</h2>
                <p className="text-gray-700 mb-6">
                  According to the American Dental Association, expanded function dental assistants are authorized in many states to perform clinical procedures beyond the standard dental assisting scope, under direct dentist supervision. EFDA status significantly increases earning potential and is one of the most in-demand specializations in the dental assisting workforce. Authorized expanded functions vary by state and may include:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {expandedFunctions.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Always verify which expanded functions are permitted in your state through your state dental board before performing any procedure beyond your authorized scope.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* OSHA / Infection Control */}
        <section className="mt-20">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">OSHA and Infection Control Requirements for Dental Assistants</h2>
                <p className="text-gray-700 mb-4">
                  Dental assistants are subject to federal OSHA Bloodborne Pathogens standards (29 CFR 1910.1030) due to occupational exposure to blood and other potentially infectious materials. According to the U.S. Occupational Safety and Health Administration, employers are required to provide training, personal protective equipment, and hepatitis B vaccination at no cost to dental workers in occupationally exposed roles.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Employer Obligations Under OSHA</h3>
                    <ul className="text-gray-600 text-sm space-y-2">
                      {[
                        'Annual Bloodborne Pathogens training for all exposed staff',
                        'Written Exposure Control Plan updated annually',
                        'Hepatitis B vaccination offered at no cost within 10 days of hire',
                        'Provision of gloves, masks, eyewear, and protective clothing',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">CDC Guidelines Dental Assistants Must Follow</h3>
                    <ul className="text-gray-600 text-sm space-y-2">
                      {[
                        'Standard precautions for all patient contact regardless of known infection status',
                        'Proper hand hygiene before and after each patient encounter',
                        'Sterilization of reusable instruments using validated sterilization cycles',
                        'Single-use items must never be reprocessed or reused between patients',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
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

        {/* Shift Types */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Dental Assistant Work Schedules</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Dental assistant scheduling varies widely by practice type and employer. Most private dental offices operate during standard business hours, but corporate dental groups and urgent care dental clinics are increasingly offering evening and weekend shifts to meet patient demand.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { shift: 'Full Time', time: 'Monday to Friday, 8 to 5', note: 'Standard schedule in most general dental practices' },
              { shift: 'Part Time', time: '2 to 4 days per week', note: 'Common in practices with multiple part-time assistants' },
              { shift: 'Extended Hours', time: 'Evenings and Saturdays', note: 'Offered by corporate DSOs and high-volume practices' },
              { shift: 'Temp and Per Diem', time: 'Variable by assignment', note: 'Higher hourly rate; placed through dental staffing agencies' },
            ].map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{item.shift}</p>
                <p className="text-blue-600 text-sm font-medium mb-2">{item.time}</p>
                <p className="text-gray-500 text-xs">{item.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing a Dental Assistant Job Quickly</h2>
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Dental Assistant Jobs</h2>
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
            <strong>Disclaimer:</strong> The salary figures, employment projections, and regulatory information provided on this page are for general informational purposes only and do not constitute legal or career advice. Dental assistant licensing requirements, scope of practice, and wage rates vary by state and employer. Always consult your state dental board, the Dental Assisting National Board at danb.org, the American Dental Association at ada.org, the U.S. Bureau of Labor Statistics at bls.gov, and OSHA at osha.gov for the most current and applicable information.
          </p>
        </section>
      </div>
    </>
  )
}