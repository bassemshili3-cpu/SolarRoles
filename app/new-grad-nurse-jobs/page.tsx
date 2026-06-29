import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, AlertTriangle, BookOpen, Users, Heart, TrendingUp, Award, Stethoscope } from 'lucide-react'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'New Grad Nurse Jobs | Entry-Level RN Openings',
  description: 'Nurse residency programs, mentored med-surg placements, and direct-hire new grad RN openings — organized by specialty and health system size.',
  keywords: 'new grad nurse jobs, new graduate nurse positions, entry level RN jobs, nurse residency programs, new grad RN hiring, first nursing job, BSN new grad jobs',
  openGraph: {
    title: 'New Grad Nurse Jobs | RN Residency Programs',
    description: 'Thousands of new grad nurse openings with residency support, competitive pay, and mentorship. Start your nursing career today.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'New Grad Nurse Jobs | Residency & Entry-Level RN Roles',
    description: 'Hospitals and health systems urgently hiring new graduate nurses. Residency programs, sign-on bonuses, all specialties.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/new-grad-nurse-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'New Grad Nurse Jobs',
  description: 'Find new graduate nurse jobs hiring across the United States. Browse entry-level RN positions with residency programs and mentorship.',
  url: 'https://www.oh-my-job.com/new-grad-nurse-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available New Grad Nurse Positions',
    description: 'Current job listings for newly graduated registered nurses',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How soon after passing the NCLEX can I start applying for new grad nurse jobs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can begin applying as soon as you have your NCLEX scheduled. Many hospitals interview candidates before exam results are available, with offers contingent on passing. Some residency programs accept applications months in advance of graduation.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is a nurse residency program and should new grads prioritize it?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A nurse residency program is a structured transition period, typically 6 to 18 months, that pairs new graduates with experienced preceptors and includes classroom education alongside clinical rotations. These programs significantly reduce early career burnout and are strongly recommended for first-year nurses.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the average starting salary for a new grad nurse?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The national average starting salary for a new graduate registered nurse falls between $58,000 and $82,000 annually depending on state, facility type, and shift differentials. States like California, New York, and Massachusetts tend to offer the highest entry-level compensation.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is it harder to get hired as a new grad nurse without a BSN?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Many hospitals strongly prefer or require a BSN for new graduate hires, especially large academic medical centers and Magnet-designated facilities. ADN graduates can still find positions at community hospitals, long-term care facilities, and outpatient clinics, and many employers offer tuition assistance to complete a BSN within a set timeframe.',
      },
    },
    {
      '@type': 'Question',
      name: 'What specialties are most accessible for new grad nurses?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Medical-surgical, telemetry, and general medicine floors are the most common entry points. Some facilities also hire new grads into emergency departments, labor and delivery, and ICU through dedicated residency tracks. Outpatient clinics, home health, and school nursing are additional options that do not always require acute care experience.',
      },
    },
  ],
}

/* ─── SECTION DATA ──────────────────────────────────────────── */

const residencyTimeline = [
  { phase: 'Months 1 to 3', title: 'Orientation and Preceptorship', description: 'Daily work alongside a dedicated preceptor who models clinical decision making, time management, and documentation workflows specific to your unit.', icon: Users },
  { phase: 'Months 3 to 6', title: 'Increasing Independence', description: 'Gradual transition to carrying a full patient assignment. Preceptor shifts to an advisory role while you lead care planning and medication administration.', icon: TrendingUp },
  { phase: 'Months 6 to 12', title: 'Consolidation and Evaluation', description: 'Independent practice with periodic check-ins, continuing education sessions, and a formal competency review. Most programs include an evidence-based capstone project.', icon: Award },
  { phase: 'Beyond Year 1', title: 'Specialty Certification Pathway', description: 'Eligibility opens for unit-specific certifications (CCRN, CEN, RNC-OB) that increase both clinical authority and compensation.', icon: Stethoscope },
]

const specialtyComparison = [
  {
    specialty: 'Medical-Surgical',
    newGradFriendly: 'Very High',
    typicalShift: '3x12 hours, rotating days/nights',
    learningCurve: 'Broad exposure to multiple conditions. Widely considered the strongest foundation for any future specialty.',
    avgStartPay: '$60,000 to $75,000',
  },
  {
    specialty: 'Telemetry / Step-Down',
    newGradFriendly: 'High',
    typicalShift: '3x12 hours',
    learningCurve: 'Cardiac monitoring adds complexity. Excellent bridge to ICU or cath lab roles within 1 to 2 years.',
    avgStartPay: '$62,000 to $78,000',
  },
  {
    specialty: 'Emergency Department',
    newGradFriendly: 'Moderate (residency required)',
    typicalShift: '3x12 hours, variable',
    learningCurve: 'Fast-paced triage environment. Programs with structured ED residencies produce well-prepared nurses; without that structure the transition is difficult.',
    avgStartPay: '$63,000 to $80,000',
  },
  {
    specialty: 'ICU / Critical Care',
    newGradFriendly: 'Moderate (residency required)',
    typicalShift: '3x12 hours',
    learningCurve: 'Ventilators, vasopressors, and hemodynamic monitoring from day one. Residency programs with a 6+ month orientation are essential for safe onboarding.',
    avgStartPay: '$65,000 to $85,000',
  },
  {
    specialty: 'Labor and Delivery',
    newGradFriendly: 'Moderate',
    typicalShift: '3x12 hours',
    learningCurve: 'Highly specialized skill set including fetal monitoring and emergency delivery protocols. Fewer openings but dedicated new grad tracks exist at major centers.',
    avgStartPay: '$62,000 to $80,000',
  },
  {
    specialty: 'Outpatient / Clinic',
    newGradFriendly: 'High',
    typicalShift: 'Monday to Friday, 8 to 10 hours',
    learningCurve: 'Lower acuity patients. Predictable hours and no night shifts make it appealing, though clinical skill development is slower than in acute care.',
    avgStartPay: '$55,000 to $70,000',
  },
]

const salaryByRegion = [
  { region: 'West Coast (CA, WA, OR)', range: '$75,000 to $95,000', note: 'Highest nominal pay nationally, offset by elevated cost of living in metro areas. California mandates nurse-to-patient ratios, which shapes workload.' },
  { region: 'Northeast (NY, MA, NJ, CT)', range: '$68,000 to $90,000', note: 'Major academic medical centers cluster here and compete aggressively for new grads. Sign-on bonuses of $5,000 to $15,000 are common.' },
  { region: 'Midwest (IL, OH, MI, MN)', range: '$55,000 to $72,000', note: 'Lower cost of living means take-home purchasing power often rivals coastal states. Rural hospitals may offer loan repayment in exchange for a 2 year commitment.' },
  { region: 'South (TX, FL, GA, NC)', range: '$52,000 to $70,000', note: 'Fastest-growing healthcare markets in the country. Rapid population growth is creating sustained demand and upward pressure on wages.' },
  { region: 'Mountain West (CO, AZ, UT)', range: '$58,000 to $75,000', note: 'Emerging healthcare hubs with newer facilities. Several systems are expanding residency cohorts to keep up with regional population influx.' },
]

const applicationMistakes = [
  {
    mistake: 'Applying Exclusively to Dream Units',
    reality: 'ICU, ER, and L&D attract the highest volume of new grad applicants. Limiting your search to a single specialty dramatically reduces your callback rate. Apply broadly and transfer internally once you have a year of experience.',
  },
  {
    mistake: 'Ignoring Smaller Health Systems',
    reality: 'Community hospitals and regional health networks often have less competition for their residency spots and provide more hands-on training because the teams are smaller. These positions build clinical confidence faster than being one of 80 residents in a large cohort.',
  },
  {
    mistake: 'Submitting a Generic Resume to Every Facility',
    reality: 'Hiring managers at hospitals scan for clinical rotations, certifications, and skills relevant to the unit. Customize your resume for each application, highlighting the practicum hours and patient populations that match the role.',
  },
  {
    mistake: 'Waiting for the NCLEX Result Before Starting the Search',
    reality: 'Residency cohorts fill months before their start dates. Begin applying while your exam is scheduled. Most offers are contingent on licensure, and hospitals expect to interview candidates before results are in.',
  },
  {
    mistake: 'Undervaluing Non-Hospital Settings',
    reality: 'Ambulatory surgery centers, home health agencies, school districts, and urgent care clinics hire new grads with fewer barriers. These roles build real-world clinical judgment and often offer weekday schedules that hospital floors cannot match.',
  },
]

const negotiationPoints = [
  { item: 'Shift Differentials', detail: 'Night and weekend premiums add $3 to $8 per hour on top of base pay. Over a full year of night shifts, this can represent $6,000 to $15,000 in additional income that is often overlooked during offer evaluation.' },
  { item: 'Sign-On Bonuses', detail: 'Common in regions with acute shortages, ranging from $5,000 to $20,000. Read the fine print: most require you to stay for 1 to 2 years or repay a prorated amount if you leave early.' },
  { item: 'Tuition Reimbursement', detail: 'Many health systems cover $3,000 to $10,000 per year toward an advanced degree (BSN completion, MSN, or NP). This benefit compounds over time and should factor heavily into facility comparison.' },
  { item: 'Student Loan Assistance', detail: 'Separate from tuition reimbursement, some employers contribute directly to outstanding student loan balances. Federal programs like NURSE Corps and state-level loan repayment initiatives add another layer worth researching.' },
  { item: 'PTO and Scheduling Flexibility', detail: 'New grads at some facilities start with 3 weeks of PTO; others offer 4 or more plus the ability to self-schedule within a framework. The value of an extra week off per year is roughly equivalent to a $1,500 to $2,000 raise.' },
  { item: 'Certification Reimbursement', detail: 'Facilities that cover the cost of specialty certifications (exam fees plus prep courses) save you $500 to $1,500 per credential and signal that they invest in long-term professional growth.' },
]

const burnoutSignals = [
  { signal: 'Persistent dread before every shift that does not improve after the first 3 months', action: 'Distinguish between normal adjustment anxiety and a genuine mismatch. If the feeling intensifies rather than fades, discuss a unit transfer with your manager before making an external move.' },
  { signal: 'Physical symptoms tied to work (insomnia, headaches, GI issues) that resolve on days off', action: 'Track the pattern for 2 weeks. If there is a clear on/off correlation, this is a physiological stress response, not a personal failing. Bring it up with employee health or your residency coordinator.' },
  { signal: 'Feeling unsafe due to staffing ratios or lack of support during critical situations', action: 'Document specific incidents with dates and patient outcomes. Report through your chain of command and, if unresolved, through your state board of nursing. Patient safety concerns override loyalty to a facility.' },
  { signal: 'Loss of empathy or emotional numbness toward patients', action: 'Compassion fatigue is clinically recognized and treatable. Most hospital systems offer free employee assistance programs with licensed counselors who specialize in healthcare worker stress.' },
]

const faqs = [
  {
    question: 'How soon after passing the NCLEX can I start applying for new grad nurse jobs?',
    answer: 'You can start applying before you even sit for the exam. Many residency programs open applications 3 to 6 months ahead of their cohort start date, and most hospitals will interview candidates with a scheduled NCLEX date. Offers are typically contingent on passing, so there is no reason to wait.',
  },
  {
    question: 'What is a nurse residency program and why does it matter?',
    answer: 'A residency program is a structured 6 to 18 month transition framework that pairs you with experienced preceptors, provides classroom sessions on clinical topics, and gradually increases your independence. Research consistently shows that nurses who complete residencies have lower turnover rates and higher confidence scores at the one year mark compared to those who go through standard orientation alone.',
  },
  {
    question: 'Is it possible to go directly into a specialty like ICU or ER as a new grad?',
    answer: 'Yes, but only through a dedicated residency track for that specialty. Going straight into critical care without a structured program is not recommended because the acuity gap between nursing school and independent ICU practice is significant. Facilities that offer these tracks invest 6 to 12 months of training before you carry a full patient load.',
  },
  {
    question: 'How much does a new grad nurse earn in the first year?',
    answer: 'National averages range from approximately $58,000 to $82,000 annually depending on geographic location, facility type, and shift schedule. Add night and weekend differentials, and actual take-home pay is often 10% to 20% higher than the stated base salary. States on the West Coast and in the Northeast tend to pay the most, though cost of living adjustments narrow the gap.',
  },
  {
    question: 'Does having an ADN instead of a BSN limit my job options?',
    answer: 'It narrows the field but does not close it. Many community hospitals, long-term care facilities, and outpatient settings hire ADN graduates. Large academic medical centers and Magnet-designated hospitals usually require a BSN, though some offer conditional employment with a requirement to complete BSN coursework within 2 to 4 years. Employer-funded tuition programs make this path financially manageable.',
  },
  {
    question: 'What should I include on my resume if I have zero nursing experience?',
    answer: 'Focus on clinical rotation hours, the patient populations you worked with, specific skills performed (IV starts, Foley catheter insertion, wound care), and any relevant certifications beyond BLS such as ACLS or PALS. Capstone or practicum details carry more weight than generic coursework. If you held a CNA or patient care tech position during school, highlight it prominently.',
  },
]

export default async function NewGradNurseJobsPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'new grad nurse', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'new grad nurse', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
  ])
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {count > 0 ? count.toLocaleString() : 'Thousands of'} New Grad Nurse Jobs Available Across the United States
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="new grad nurse" />
          </aside>
          <div className="flex-1">
            {count > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">{count.toLocaleString()}</span> positions available
              </p>
            )}
            <AIJobMatcherWrapper />
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList what={params.what || 'new grad nurse'} where={params.where || ''} salary_min={params.salary_min} initialData={initialData} />
            </Suspense>
          </div>
        </div>

        {/* ── WHAT A RESIDENCY ACTUALLY LOOKS LIKE ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Inside a Nurse Residency Program: What the First Year Really Looks Like</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Most job listings mention "residency program" without explaining what that means in practice. The structure varies by hospital, but the general arc follows a predictable pattern that every new grad should understand before committing to a position.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {residencyTimeline.map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <item.icon className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">{item.phase}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SPECIALTY COMPARISON ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Stethoscope className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Specialty Breakdown: Where New Grads Actually Get Hired</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Not every specialty is equally open to new graduates. The table below compares the most common entry points by how welcoming they are to first-year nurses, what the schedule looks like, and what you can expect to earn at the start.
          </p>
          <div className="space-y-4">
            {specialtyComparison.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-green-300 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{item.specialty}</h3>
                    <p className="text-sm text-gray-600 mt-1">{item.learningCurve}</p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="min-w-[120px]">
                      <p className="text-gray-500">New Grad Friendly</p>
                      <p className="font-medium text-gray-800">{item.newGradFriendly}</p>
                    </div>
                    <div className="min-w-[140px]">
                      <p className="text-gray-500">Typical Shift</p>
                      <p className="font-medium text-gray-800">{item.typicalShift}</p>
                    </div>
                    <div className="min-w-[140px]">
                      <p className="text-gray-500">Starting Pay Range</p>
                      <p className="font-medium text-green-700">{item.avgStartPay}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Pay ranges reflect national averages for new graduate positions. Actual compensation varies by state, facility, and shift differential. Sources: BLS Occupational Employment and Wage Statistics, Salary.com, Glassdoor aggregate data.
          </p>
        </section>

        {/* ── SALARY BY REGION ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">New Grad Nurse Pay by Region: What the Numbers Actually Mean</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            A $90,000 salary in San Francisco and a $60,000 salary in Indianapolis are not as different as they appear once housing, taxes, and daily expenses are factored in. Regional context matters more than the number on the offer letter.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {salaryByRegion.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-1">{item.region}</h3>
                <p className="text-green-700 font-bold text-lg mb-3">{item.range}</p>
                <p className="text-gray-600 text-sm">{item.note}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Ranges reflect base salary for new graduate RN positions. Night and weekend differentials, sign-on bonuses, and benefits packages are not included. Data compiled from BLS, Glassdoor, and Salary.com as of early 2026.
          </p>
        </section>

        {/* ── APPLICATION MISTAKES ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-7 h-7 text-amber-600" />
            <h2 className="text-2xl font-bold text-gray-900">Five Application Mistakes That Cost New Grads Interviews</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The new grad nursing job market is competitive. Hundreds of applicants per residency cohort is normal at large medical centers. The following patterns consistently separate candidates who get callbacks from those who do not.
          </p>
          <div className="space-y-4">
            {applicationMistakes.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-amber-100 text-amber-700 font-bold rounded-full text-sm flex-shrink-0 mt-0.5">{index + 1}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{item.mistake}</h3>
                    <p className="text-gray-600 text-sm">{item.reality}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── NEGOTIATION ── */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <DollarSign className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Beyond Base Pay: What to Evaluate in a New Grad Offer</h2>
              <p className="text-gray-700 mb-6">
                New graduates often focus exclusively on the hourly rate when comparing offers. In healthcare, the total compensation package includes multiple components that can add tens of thousands of dollars in annual value. Here is what to look at before signing.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {negotiationPoints.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm">{item.item}</h3>
                    <p className="text-gray-600 text-sm">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── BURNOUT AWARENESS ── */}
        <section className="mt-20">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <Heart className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Recognizing Burnout Before It Becomes a Career Crisis</h2>
                <p className="text-gray-700 mb-6">
                  The first year of nursing has the highest attrition rate in the profession. Roughly 17% to 25% of new graduate nurses leave their initial position within 12 months. Not all departures are avoidable, but many result from warning signs that go unaddressed. Knowing what to watch for gives you the ability to intervene early.
                </p>
                <div className="space-y-4">
                  {burnoutSignals.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{item.signal}</p>
                          <p className="text-gray-600 text-sm mt-1">{item.action}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── NCLEX TO HIRE TIMELINE ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">The Realistic Timeline From Graduation to First Paycheck</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            One of the most common sources of anxiety for nursing graduates is the gap between finishing school and starting work. Understanding the actual sequence and typical durations helps set expectations and reduces the panic that comes from comparing yourself to classmates who seem to be moving faster.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" /> Aggressive Timeline
              </h3>
              <p className="text-gray-500 text-sm mb-4">For graduates who applied to residencies before finishing school</p>
              <div className="space-y-3 text-sm">
                {[
                  { step: 'Applications submitted', time: '2 to 4 months before graduation' },
                  { step: 'Interviews completed', time: '1 to 2 months before graduation' },
                  { step: 'Conditional offer accepted', time: 'Around graduation' },
                  { step: 'NCLEX passed', time: '2 to 6 weeks after graduation' },
                  { step: 'State license issued', time: '1 to 4 weeks after NCLEX' },
                  { step: 'Residency start date', time: '4 to 8 weeks after licensure' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800">{item.step}</p>
                      <p className="text-gray-500">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" /> Standard Timeline
              </h3>
              <p className="text-gray-500 text-sm mb-4">For graduates who begin searching after passing the NCLEX</p>
              <div className="space-y-3 text-sm">
                {[
                  { step: 'NCLEX passed', time: 'Month 1' },
                  { step: 'Resume and applications prepared', time: 'Month 1 to 2' },
                  { step: 'Applications submitted', time: 'Month 2 to 3' },
                  { step: 'Interviews scheduled', time: 'Month 3 to 4' },
                  { step: 'Offer received and accepted', time: 'Month 4 to 5' },
                  { step: 'Onboarding and residency start', time: 'Month 5 to 7' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800">{item.step}</p>
                      <p className="text-gray-500">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Both timelines are normal. The difference is planning, not ability. Starting the application process early is the single most impactful thing you can do to shorten time to employment.
          </p>
        </section>

        {/* ── FAQ ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About New Grad Nurse Jobs</h2>
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

        {/* ── DISCLAIMER ── */}
        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> Oh My Job is an independent job search platform and is not affiliated with, endorsed by, or connected to any hospital, health system, or employer listed on this page. Job listings are sourced from third-party APIs and partner networks. Salary figures are estimates based on publicly available data and may not reflect specific offers. Verify all compensation details, licensing requirements, and program specifics directly with the hiring facility before making employment decisions. This page is for informational purposes only and does not constitute career or legal advice.
          </p>
        </section>
      </div>
    </>
  )
}