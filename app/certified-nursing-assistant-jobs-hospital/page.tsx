import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, DollarSign, MapPin, AlertTriangle, HeartPulse, Wrench, Users, TrendingUp, Building2, GraduationCap } from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Hospital CNA Jobs | $19–$30/hr + Shift Differentials',
  description: 'Hospital CNA positions pay $19–$30/hr with shift differentials. Many employers fund RN education — openings sorted by state and unit.',
  keywords: 'certified nursing assistant jobs hospital, CNA hospital jobs, hospital CNA hiring, CNA jobs near me hospital, certified nursing assistant hospital positions 2026',
  openGraph: {
    title: 'Hospital CNA Jobs | Nationwide Openings',
    description: 'Hospitals are hiring CNAs at higher rates than nursing homes. Shift differentials, tuition reimbursement, and a direct path to RN. Apply now.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hospital CNA Jobs 2026 | $19 to $30/hr + Shift Differentials',
    description: 'Certified nursing assistant positions in hospitals across the US. Better pay, faster pace, bigger career ceiling than long-term care.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/certified-nursing-assistant-jobs-hospital',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Certified Nursing Assistant Jobs in Hospitals',
  description: 'Find CNA positions in hospital settings across the United States. Browse openings and apply directly.',
  url: 'https://www.oh-my-job.com/certified-nursing-assistant-jobs-hospital',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Hospital CNA Jobs',
    description: 'Current hospital-based certified nursing assistant job listings',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How much do hospital CNAs make compared to nursing home CNAs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Hospital CNAs earn $19 to $30 per hour depending on location and shift. Nursing home CNAs typically earn $15 to $22 per hour. The hospital premium reflects higher acuity patients, a faster pace, and the expectation that you can respond to rapidly changing clinical situations.',
      },
    },
    {
      '@type': 'Question',
      name: 'What certifications do you need to work as a CNA in a hospital?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You need an active CNA certification in your state and current BLS certification through the American Heart Association. Some hospitals also require or prefer phlebotomy training, EKG competency, or completion of a Patient Care Technician program.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do hospitals hire new CNAs with no experience?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Many hospitals hire newly certified CNAs, particularly for med-surg and telemetry units. Most provide an orientation period of 4 to 12 weeks that includes unit-specific training and supervised patient care.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can a hospital CNA become a registered nurse?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, and hospitals actively encourage this path. Many hospital systems offer tuition reimbursement or full tuition coverage for CNAs pursuing an RN degree. The CNA experience gives you a clinical foundation that nursing students without it do not have.',
      },
    },
  ],
}

const hospitalVsNursingHome = [
  { category: 'Base hourly pay', hospital: '$19 to $30/hr', nursingHome: '$15 to $22/hr' },
  { category: 'Shift differentials', hospital: '$2 to $6/hr extra for evenings, nights, weekends', nursingHome: '$0.50 to $2/hr if offered at all' },
  { category: 'Patient ratio', hospital: '5 to 8 patients per CNA (varies by unit)', nursingHome: '10 to 20+ residents per CNA' },
  { category: 'Pace of work', hospital: 'Fast. Patients are acutely ill, conditions change rapidly, admissions and discharges happen every shift', nursingHome: 'Routine-driven. Same residents daily, care plans change slowly' },
  { category: 'Tuition reimbursement', hospital: 'Common. Many systems cover $3,000 to $10,000/year toward RN or BSN programs', nursingHome: 'Rare. Some chains offer partial reimbursement but amounts are lower' },
  { category: 'Career ceiling', hospital: 'Direct path to PCT, surgical tech, RN, and beyond within the same system', nursingHome: 'Advancement options are limited without changing employers' },
]

const hospitalUnits = [
  { unit: 'Med-Surg (Medical Surgical)', pace: 'Moderate to high', patientType: 'Post-operative recovery, infections, chronic disease management, general admissions', cnaRole: 'Vitals every 4 hours, ambulation, feeding, bathing, I&O tracking, blood glucose monitoring. This is where most hospital CNAs start because the skills are broadly applicable.', bestFor: 'New CNAs who want a solid clinical foundation before specializing' },
  { unit: 'Emergency Department', pace: 'Unpredictable and intense', patientType: 'Trauma, chest pain, strokes, psychiatric emergencies, everything that walks through the door', cnaRole: 'Room turnover between patients, EKG placement, splint assistance, stocking, 1:1 observation for psych holds, vitals on new arrivals. The ER moves faster than any other unit and the variety is unmatched.', bestFor: 'CNAs who thrive in chaos and want exposure to the widest range of clinical situations' },
  { unit: 'ICU (Intensive Care Unit)', pace: 'High intensity, slower rhythm', patientType: 'Ventilated patients, post-cardiac surgery, sepsis, multi-organ failure, neurological emergencies', cnaRole: 'Turning and repositioning every 2 hours, oral care, bed baths, strict I&O measurement, continuous monitoring assistance. Patient ratios are lower (1:2 or 1:3) but the acuity is the highest in the hospital.', bestFor: 'CNAs considering a future in critical care nursing or anesthesia (CRNA pipeline)' },
  { unit: 'Labor & Delivery / Postpartum', pace: 'Variable with sudden surges', patientType: 'Laboring mothers, postpartum recovery, newborns, high-risk pregnancies', cnaRole: 'Vitals on postpartum patients, newborn weight checks, room setup for deliveries, patient transport, stocking delivery suites. Emotional environment ranges from joyful to critical within the same shift.', bestFor: 'CNAs interested in midwifery, OB nursing, or neonatal care' },
  { unit: 'Orthopedics / Rehabilitation', pace: 'Moderate and physical', patientType: 'Hip and knee replacements, spinal surgeries, fracture recovery, post-stroke rehabilitation', cnaRole: 'Heavy lifting and ambulation are the core of this unit. You help patients stand for the first time after surgery, assist with transfers, and support physical therapy exercises between PT sessions.', bestFor: 'Physically strong CNAs who prefer predictable routines and measurable patient progress' },
]

const shiftDifferentialMath = [
  { scenario: 'Day shift CNA, 36 hours/week', baseRate: '$22/hr', differential: 'None', weeklyGross: '$792', annualEstimate: '$41,184' },
  { scenario: 'Night shift CNA, 36 hours/week', baseRate: '$22/hr + $4/hr night diff', differential: '+$4/hr', weeklyGross: '$936', annualEstimate: '$48,672' },
  { scenario: 'Weekend nights, 24 hours/week', baseRate: '$22/hr + $4 night + $3 weekend', differential: '+$7/hr total', weeklyGross: '$696', annualEstimate: '$36,192 (24 hrs/wk)' },
]

const first90Days = [
  { phase: 'Week 1 to 2: Orientation', detail: 'Hospital-wide orientation covers policies, EMR training (Epic, Cerner, or Meditech depending on the system), infection control, HIPAA, fire safety, and facility navigation. You will not touch a patient during this phase. It feels slow and bureaucratic. It is also where you learn the systems that prevent errors once you are on the floor.' },
  { phase: 'Week 3 to 6: Precepted Floor Time', detail: 'You are assigned to a unit and paired with an experienced CNA who shadows your every move. You perform all CNA tasks but with someone watching, correcting, and teaching. The preceptor evaluates your competence on a checklist: vitals, transfers, bed changes, documentation, fall prevention protocols, and communication with nurses.' },
  { phase: 'Week 7 to 10: Supervised Independence', detail: 'You take your own patient assignment but the preceptor remains on the unit and checks your work periodically. This is where most new CNAs feel the weight of the job for the first time. Managing six patients alone, responding to call lights while charting, and prioritizing tasks that all feel urgent is a skill that only develops through repetition.' },
  { phase: 'Week 11 to 12+: Full Independence', detail: 'You are on your own. The charge nurse and your fellow CNAs are available for questions, but you carry your own assignment and manage your own time. Most hospital CNAs report that confidence arrives around month three, and genuine comfort around month six.' },
]

const cnaToRnPath = [
  { title: 'Tuition Reimbursement', detail: 'Most large hospital systems (HCA, Ascension, CommonSpirit, Kaiser, Providence) offer $3,000 to $10,000 per year in tuition reimbursement for employees pursuing nursing degrees. Some require a minimum of 24 hours per week and satisfactory academic standing. The benefit is available from day one at many systems.' },
  { title: 'Earn-While-You-Learn Programs', detail: 'A growing number of hospitals run internal programs where you work as a CNA during nursing school and transition directly into an RN residency upon graduation. These programs effectively guarantee a nursing job at the same hospital, eliminate the new-grad job search, and pay you throughout the process.' },
  { title: 'The Clinical Advantage You Already Have', detail: 'CNA experience in a hospital gives you fluency in the clinical environment that no textbook can. You already know how to read a monitor alarm, communicate during a rapid response, manage your time on a busy unit, and talk to scared patients. Nursing students without CNA experience spend their first clinical rotation learning what you already do instinctively.' },
  { title: 'Timeline: CNA to RN', detail: 'Start as a CNA today and enroll in an ADN program: you can be a registered nurse in approximately 2.5 to 3 years. A BSN takes 3.5 to 4 years. During that time, your CNA income covers living expenses, your hospital tuition benefit covers a significant portion of school costs, and your clinical experience makes you a stronger candidate than classmates who have never worked in a hospital.' },
]

const faqs = [
  { question: 'How much do hospital CNAs make compared to nursing home CNAs?', answer: 'Hospital CNAs earn $19 to $30 per hour depending on location, shift, and hospital system. Nursing home CNAs typically earn $15 to $22 per hour. When you add shift differentials ($2 to $6/hr for nights and weekends), the annual gap can exceed $8,000 to $12,000.' },
  { question: 'Do hospitals hire CNAs with no hospital experience?', answer: 'Yes. Many hospitals hire newly certified CNAs, particularly for med-surg and telemetry units. The orientation period (4 to 12 weeks) bridges the gap between classroom certification and hospital-level competence. Some hospital systems run their own CNA training programs that guarantee employment upon completion.' },
  { question: 'What is the difference between a CNA and a Patient Care Technician?', answer: 'A PCT performs all CNA duties plus additional clinical tasks like phlebotomy (drawing blood), EKG placement, and bladder scanning. Some hospitals use the titles interchangeably. Others require PCTs to hold a separate certification. PCT positions typically pay $1 to $3 per hour more than CNA-only roles at the same hospital.' },
  { question: 'What shifts do hospital CNAs work?', answer: 'Most hospital CNAs work 12-hour shifts (7 AM to 7 PM or 7 PM to 7 AM), three shifts per week for a total of 36 hours. Some hospitals also offer 8-hour rotations. Night and weekend shifts pay more due to differentials. The 12-hour model gives you four days off per week.' },
  { question: 'Can working as a hospital CNA help me get into nursing school?', answer: 'Significantly. Hospital CNA experience strengthens your nursing school application because admissions committees see you have direct patient care hours in an acute setting. Many hospitals also offer tuition reimbursement or scholarships specifically for employees pursuing nursing degrees.' },
  { question: 'What are the hardest parts of being a hospital CNA?', answer: 'The physical demands are the most cited challenge: 12 hours on your feet, lifting and turning patients, and walking miles per shift. The emotional load is second: hospitals serve patients at their most vulnerable. The third is the pace. A hospital unit can go from manageable to overwhelming within minutes when multiple admissions arrive simultaneously.' },
]

export default async function CertifiedNursingAssistantHospitalJobsPage({ searchParams }: any) {
  const params = await searchParams

 const [{ count }, initialData] = await Promise.all([
  getMergedJobCount(params.what || 'certified nursing assistant hospital', params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
  searchMergedJobs({ what: params.what || 'certified nursing assistant hospital', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
])


  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {count > 0 ? count.toLocaleString() : ''} Certified Nursing Assistant Hospital Jobs Available Now
          </h1>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="certified nursing assistant hospital" />
          </aside>
          <div className="flex-1">
            {count > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">{count.toLocaleString()}</span> positions available
              </p>
            )}
            <AIJobMatcherWrapper />
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList what={params.what || 'certified nursing assistant hospital'} where={params.where || ''} salary_min={params.salary_min} initialData={initialData} />
            </Suspense>
          </div>
        </div>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Hospital CNA vs. Nursing Home CNA: The Numbers Side by Side</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            The CNA certification is the same regardless of setting, but the job, the pay, and the career trajectory are not. Hospital positions pay more, move faster, and open doors that long-term care positions cannot.
          </p>
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 gap-px bg-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="bg-white px-5 py-3">Category</div>
              <div className="bg-white px-5 py-3">Hospital</div>
              <div className="bg-white px-5 py-3">Nursing Home</div>
            </div>
            {hospitalVsNursingHome.map((row, i) => (
              <div key={i} className="grid grid-cols-3 gap-px bg-gray-100">
                <div className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-5 py-4 text-sm font-medium text-gray-800`}>{row.category}</div>
                <div className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-5 py-4 text-sm text-gray-600`}>{row.hospital}</div>
                <div className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-5 py-4 text-sm text-gray-500`}>{row.nursingHome}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <HeartPulse className="w-7 h-7 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">Choosing Your Unit: What Each Department Actually Feels Like as a CNA</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Not all hospital CNA jobs are the same. The unit you work on determines your daily tasks, your pace, your patient population, and the direction your career takes next.
          </p>
          <div className="space-y-4">
            {hospitalUnits.map((unit, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h3 className="font-bold text-gray-900 text-lg">{unit.unit}</h3>
                  <span className="text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full">Pace: {unit.pace}</span>
                </div>
                <p className="text-gray-600 text-sm mb-2"><span className="font-medium text-gray-800">Patients:</span> {unit.patientType}</p>
                <p className="text-gray-600 text-sm mb-2"><span className="font-medium text-gray-800">Your role:</span> {unit.cnaRole}</p>
                <p className="text-xs text-green-700 font-medium">Best for: {unit.bestFor}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">The Shift Differential Math That Changes Everything</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Most CNA job postings list the base hourly rate. What they do not show is how shift selection changes your annual income by thousands of dollars.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {shiftDifferentialMath.map((item, i) => (
              <div key={i} className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">{item.scenario}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Base rate</span><span className="font-medium text-gray-800">{item.baseRate}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Differential</span><span className="font-medium text-green-700">{item.differential}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Weekly gross</span><span className="font-medium text-gray-800">{item.weeklyGross}</span></div>
                  <div className="flex justify-between border-t border-green-200 pt-2 mt-2"><span className="text-gray-700 font-medium">Annual estimate</span><span className="font-bold text-green-800">{item.annualEstimate}</span></div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">The night shift CNA earning $48,672 and the day shift CNA earning $41,184 hold the same certification and work the same hours. The $7,488 difference is entirely determined by shift selection.</p>
        </section>

        <section className="mt-20">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <Clock className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your First 90 Days as a Hospital CNA</h2>
                <p className="text-gray-700 mb-6">The transition from CNA classroom to hospital floor is steeper than most new hires expect. Knowing the phases in advance helps you calibrate expectations and avoid the discouragement that causes many new hospital CNAs to quit before they reach competence.</p>
                <div className="space-y-4">
                  {first90Days.map((phase, i) => (
                    <div key={i} className="bg-white rounded-lg p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-amber-100 text-amber-700 font-bold rounded-full text-xs">{i + 1}</span>
                        <h3 className="font-semibold text-gray-900 text-sm">{phase.phase}</h3>
                      </div>
                      <p className="text-gray-600 text-sm">{phase.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <GraduationCap className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">The CNA to RN Pipeline That Hospitals Are Actively Funding</h2>
                <p className="text-gray-700 mb-6">The smartest reason to take a hospital CNA job is not the paycheck. It is the fact that hospitals will pay for your nursing degree while you work.</p>
                <div className="grid md:grid-cols-2 gap-4">
                  {cnaToRnPath.map((item, i) => (
                    <div key={i} className="bg-white rounded-lg p-5">
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Hospital CNA Jobs</h2>
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

        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> Oh My Job is an independent job search platform and is not affiliated with any hospital, health system, or nursing certification body. Job listings are sourced from third-party APIs. Salary figures and shift differentials are estimates based on industry data and may not reflect specific offers. CNA certification requirements and scope of practice vary by state. Consult your state board of nursing for current regulations. This page is for informational purposes only.
          </p>
        </section>
      </div>
    </>
  )
}