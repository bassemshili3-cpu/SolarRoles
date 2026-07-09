import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Stethoscope, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, AlertTriangle, BookOpen, Users, Briefcase, Award, TrendingUp, Heart, Activity, UserCheck } from 'lucide-react'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Physician Assistant Jobs | PA Openings in Every Specialty',
  description: 'PA openings in emergency medicine, orthopedics, dermatology, surgery, and primary care. New grad and experienced PAs welcome — compensation and specialty shown.',
  keywords: 'physician assistant jobs, PA jobs, physician associate jobs, surgical PA jobs, emergency medicine PA, dermatology PA, primary care PA, new grad physician assistant, hospitalist PA jobs',
  openGraph: {
    title: 'Physician Assistant Jobs | PA Roles in Every Specialty',
    description: 'Browse open physician assistant positions across every medical specialty. Hospital, outpatient, surgical, and primary care PA roles nationwide.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Physician Assistant Jobs | All Specialties',
    description: 'Hundreds of PA positions open across the United States. Surgical, medical, primary care, and specialty practice roles. Competitive compensation and benefits.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/physician-assistant-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Physician Assistant Jobs',
  description: 'Find physician assistant jobs hiring across the United States in every medical specialty.',
  url: 'https://www.oh-my-job.com/physician-assistant-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Physician Assistant Jobs',
    description: 'Current physician assistant positions across surgical, medical, and primary care specialties in the US',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How much do physician assistants earn in the United States?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Median PA compensation in 2026 sits around $128,000 to $135,000 annually, with significant variation by specialty and region. Primary care PAs typically earn $105,000 to $125,000. Emergency medicine, dermatology, and surgical subspecialty PAs often earn $140,000 to $185,000. Surgical first assistants and PAs in high-demand rural areas can clear $200,000 with productivity bonuses and call pay.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between a PA and a Nurse Practitioner?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'PAs train under a medical model similar to physicians, with a generalist clinical education that allows movement between specialties throughout a career. NPs train under a nursing model with specialty focus from the start (family, acute care, pediatric, etc.) and stay within that specialty. PAs typically work under physician supervision in collaborative practice agreements, while NPs have full practice authority in roughly half of US states. Compensation is similar in most settings.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can a new graduate PA work in any specialty?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, this is one of the defining advantages of the PA profession. Unlike physicians who must complete specialty-specific residencies, PAs train as generalists and can enter any specialty directly after passing the PANCE. Most new graduates accept positions in primary care, emergency medicine, hospital medicine, or surgery. Switching specialties later in a career is also relatively common, though some specialties (cardiothoracic surgery, dermatology) increasingly prefer experienced applicants.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the PANCE and how often do PAs recertify?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The PANCE (Physician Assistant National Certifying Examination) is the initial certification exam taken at the end of PA school. To maintain certification, PAs must complete 100 hours of continuing medical education every two years and pass the PANRE (Physician Assistant National Recertifying Examination) every ten years. As of 2026, NCCPA also offers an alternative pathway: PANRE-LA, a longitudinal assessment taken in quarterly segments instead of a single comprehensive exam.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which US states give physician assistants the most autonomy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'As of 2026, more than ten states have moved toward Optimal Team Practice (OTP) frameworks that eliminate the requirement for a specific supervising physician agreement. North Dakota, Utah, Wyoming, and Washington offer some of the most progressive practice environments. Other states retain strict supervision requirements with mandatory chart review percentages and on-site supervision rules. Practice environment is a critical factor that affects daily work satisfaction more than candidates typically realize.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is the title "Physician Associate" replacing "Physician Assistant"?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The American Academy of Physician Associates (AAPA) voted in 2021 to officially change the profession title from "Physician Assistant" to "Physician Associate." Implementation is happening gradually as each state must update its licensing statutes individually. Most clinical job listings still use "Physician Assistant" because it remains the legally recognized title in most states, but expect to see both titles used interchangeably through the late 2020s.',
      },
    },
  ],
}

const specialties = [
  {
    name: 'Emergency Medicine',
    description: 'High-acuity, fast-paced practice in hospital EDs and freestanding emergency centers. Procedural variety, shift-based schedules, no continuity of care. Often pays significant shift differential for nights and weekends.',
    payRange: '$130,000 to $175,000',
    icon: Activity,
  },
  {
    name: 'Surgery and Surgical Subspecialties',
    description: 'First-assist in the OR, preoperative and postoperative management, inpatient rounding. Subspecialties include orthopedic, cardiothoracic, neurosurgery, plastic, and general surgery. Often involves call coverage.',
    payRange: '$135,000 to $195,000',
    icon: Stethoscope,
  },
  {
    name: 'Dermatology',
    description: 'Skin cancer screenings, biopsies, minor surgical procedures, cosmetic injectables in some practices. Among the most competitive PA specialties to enter, with strong work-life balance and outpatient-only practice.',
    payRange: '$140,000 to $185,000',
    icon: UserCheck,
  },
  {
    name: 'Primary Care',
    description: 'Family medicine, internal medicine, and pediatric outpatient practice. Continuity with patients across years, broad clinical scope, predictable schedule. Pay typically lower than specialty practice but lifestyle is more sustainable.',
    payRange: '$105,000 to $130,000',
    icon: Heart,
  },
  {
    name: 'Hospital Medicine',
    description: 'Inpatient management of medical patients on a hospitalist service. Block scheduling (often 7 on, 7 off) is common. Includes admissions, daily rounding, discharge planning, and procedural work.',
    payRange: '$125,000 to $165,000',
    icon: Stethoscope,
  },
  {
    name: 'Cardiology',
    description: 'Outpatient cardiology clinics or inpatient consultation services. Procedure assist in catheterization labs and electrophysiology in some practices. Strong growth area as cardiovascular disease prevalence rises.',
    payRange: '$130,000 to $170,000',
    icon: Activity,
  },
  {
    name: 'Orthopedics',
    description: 'Outpatient clinic, fracture management, surgical first-assist, postoperative care, joint injections. One of the most popular PA specialties with strong demand in both academic centers and private practice.',
    payRange: '$130,000 to $175,000',
    icon: Stethoscope,
  },
  {
    name: 'Psychiatry and Behavioral Health',
    description: 'Mental health evaluation, medication management, psychotherapy in some settings. Increasing demand driven by mental health access crisis. Telehealth opportunities are particularly strong in this specialty.',
    payRange: '$115,000 to $160,000',
    icon: Heart,
  },
  {
    name: 'Oncology and Hematology',
    description: 'Cancer treatment management, chemotherapy administration oversight, survivorship care, palliative coordination. Emotionally demanding but deeply meaningful work. Strong demand at academic cancer centers and community oncology practices.',
    payRange: '$125,000 to $170,000',
    icon: Heart,
  },
]

const paVsOthersComparison = [
  {
    aspect: 'Training Model',
    pa: 'Medical model, generalist (3-year master\'s)',
    np: 'Nursing model, specialty-focused',
    physician: 'Medical model, then specialty residency',
  },
  {
    aspect: 'Total Years of Training Post-HS',
    pa: '6 to 7 years',
    np: '6 to 8 years',
    physician: '11 to 16 years',
  },
  {
    aspect: 'Practice Authority',
    pa: 'Collaborative agreement in most states',
    np: 'Full practice authority in 27 states',
    physician: 'Full independent practice',
  },
  {
    aspect: 'Specialty Mobility',
    pa: 'High (can change specialties)',
    np: 'Limited (tied to certification specialty)',
    physician: 'Low (requires new residency)',
  },
  {
    aspect: 'Median Compensation (2026)',
    pa: '$128,000 to $135,000',
    np: '$125,000 to $135,000',
    physician: '$240,000 to $400,000+',
  },
  {
    aspect: 'Typical Work Setting',
    pa: 'Hospitals, surgical practices, clinics',
    np: 'Clinics, hospitals, primary care',
    physician: 'Varies widely by specialty',
  },
  {
    aspect: 'Prescriptive Authority',
    pa: 'Yes, in all 50 states',
    np: 'Yes, in all 50 states',
    physician: 'Yes, in all 50 states',
  },
]

const practiceAuthorityTiers = [
  {
    tier: 'Optimal Team Practice States',
    description: 'States that have eliminated the requirement for a specific supervising physician agreement, allowing PAs to practice in collaboration with the broader medical team. Examples in 2026 include North Dakota, Utah, Wyoming, Arizona, Maine, Washington, and Wisconsin.',
    workReality: 'PA functions with the highest level of autonomy. Decisions about practice scope happen at the practice level rather than through state-mandated supervision requirements.',
  },
  {
    tier: 'Moderate Supervision States',
    description: 'Require collaborative agreements with a specific physician but with flexible terms. Chart review requirements are minimal or eliminated. Examples include Colorado, Michigan, New Mexico, and Iowa.',
    workReality: 'Day-to-day work feels autonomous. The supervision requirement matters mostly for paperwork and credentialing rather than clinical decision-making.',
  },
  {
    tier: 'Strict Supervision States',
    description: 'Require specific supervising physician designation, mandatory chart review percentages, and in some cases physical on-site supervision for certain procedures. Examples include California, Texas, and several Southeast states.',
    workReality: 'Affects practice administrative burden more than clinical work. Some procedures or prescriptive activities require additional oversight steps that slow workflow.',
  },
]

const compensationComponents = [
  {
    component: 'Base Salary',
    description: 'Annual salary paid regardless of patient volume or productivity. Varies by specialty, region, and years of experience.',
    typical: '$95,000 to $165,000',
  },
  {
    component: 'Productivity Bonus or RVU Compensation',
    description: 'Pay tied to relative value units (RVUs) generated or patient volume. Common in surgical, dermatology, and high-volume specialty practices.',
    typical: '+10 to +30 percent of base',
  },
  {
    component: 'Sign-On Bonus',
    description: 'One-time payment for accepting a position. Larger in underserved areas, rural settings, and specialties with severe shortages.',
    typical: '$5,000 to $50,000',
  },
  {
    component: 'Loan Repayment Programs',
    description: 'State and federal programs (NHSC, IHS, state-specific) that repay student loans in exchange for service commitments in shortage areas.',
    typical: '$30,000 to $80,000 over commitment period',
  },
  {
    component: 'Call Pay',
    description: 'Additional compensation for taking after-hours call coverage. Common in surgical, hospitalist, and inpatient specialties.',
    typical: '$500 to $1,500 per call shift',
  },
  {
    component: 'CME and Professional Development',
    description: 'Annual allowance for continuing medical education courses, conferences, and licensing fees. Often includes paid time off for CME activities.',
    typical: '$2,500 to $5,000 annually',
  },
  {
    component: 'Benefits Package',
    description: 'Health insurance, retirement (401k or 403b), malpractice insurance, paid time off, parental leave. Health system employers typically offer the strongest packages.',
    typical: '20 to 30 percent of base salary in value',
  },
]

const certificationCycle = [
  {
    step: '1',
    title: 'Graduate from an ARC-PA Accredited Program',
    description: 'Master\'s degree from a Physician Assistant program accredited by the Accreditation Review Commission on Education for the Physician Assistant. Typically 27 to 36 months including didactic and clinical rotations.',
  },
  {
    step: '2',
    title: 'Pass the PANCE',
    description: 'The Physician Assistant National Certifying Examination administered by NCCPA. Five-hour exam covering general medical knowledge across all specialties. Pass rate is approximately 92 to 95 percent for first-time test takers from accredited programs.',
  },
  {
    step: '3',
    title: 'Obtain State Licensure',
    description: 'Each state has its own licensing board with specific application requirements. Most states require PANCE certification, official transcripts, background check, and a state-specific application fee ranging from $150 to $400.',
  },
  {
    step: '4',
    title: 'Complete 100 CME Hours Every Two Years',
    description: 'NCCPA requires 100 hours of continuing medical education in each 2-year cycle, with at least 50 hours of Category 1 CME (peer-reviewed activities). Most states also have CME requirements that overlap with NCCPA standards.',
  },
  {
    step: '5',
    title: 'Recertify Every 10 Years',
    description: 'Pass the PANRE or complete the PANRE-LA (longitudinal assessment) every decade. The PANRE-LA option introduced in 2023 splits the recertification process into quarterly segments completed over 5 years.',
  },
]

const dayInTheLifeOptions = [
  {
    setting: 'Emergency Medicine PA',
    schedule: '10-hour shifts, often three 12s with two days off',
    typicalDay: 'Triage assessment, procedure-heavy (sutures, splinting, central lines), high-volume patient management, frequent attending consultation, no continuity of care. Mental load is high but defined by the shift boundary.',
  },
  {
    setting: 'Surgical PA (Orthopedic)',
    schedule: 'Mixed clinic and OR days, 50 to 60 hour weeks common',
    typicalDay: 'Morning rounds on inpatients, clinic visits with fracture management and post-op follow-ups, afternoon OR for first-assisting, call coverage rotations. Highest procedural skill development in the PA profession.',
  },
  {
    setting: 'Primary Care PA',
    schedule: '40-hour week, predictable schedule, minimal call',
    typicalDay: 'Patient panel of established and new patients, mix of acute visits and chronic disease management, preventive care, time-pressured 15 to 20 minute appointments, significant documentation between visits.',
  },
  {
    setting: 'Hospitalist PA',
    schedule: '7 days on, 7 days off block scheduling',
    typicalDay: 'Morning rounds on 12 to 18 patients, admissions during the day, discharge planning, family meetings, procedure assistance, evening signout to night team. Intense work weeks with full recovery weeks off.',
  },
  {
    setting: 'Dermatology PA',
    schedule: 'Outpatient clinic, no call, predictable hours',
    typicalDay: 'Full-body skin exams, biopsies, cryotherapy, minor excisions, acne and eczema management, cosmetic procedures in some practices. Patient volume is high but visits are short and procedural.',
  },
]

const careerProgression = [
  {
    step: '1',
    title: 'New Graduate PA',
    description: 'First 1 to 2 years focus on consolidating clinical skills, developing efficiency, and building confidence in independent decision-making. New grad programs and structured onboarding are increasingly common.',
  },
  {
    step: '2',
    title: 'Experienced Clinical PA',
    description: 'Years 2 to 7 typically focus on deepening specialty expertise. Some PAs pursue postgraduate fellowships (cardiothoracic, dermatology, emergency medicine) to accelerate specialty mastery. Productivity bonuses become significant.',
  },
  {
    step: '3',
    title: 'Senior or Lead PA',
    description: 'After 5 to 10 years, opportunities open for clinical leadership: lead PA roles in surgical practices, chief PA positions on hospital services, or department-level leadership in larger organizations.',
  },
  {
    step: '4',
    title: 'Administrative or Educator Track',
    description: 'Some PAs transition into PA program faculty (teaching at PA schools), medical administration, clinical research, or healthcare consulting. These paths often combine reduced clinical hours with administrative responsibilities.',
  },
  {
    step: '5',
    title: 'Doctoral Track or Specialty Mastery',
    description: 'Doctor of Medical Science (DMSc) degrees are increasingly pursued for academic and leadership advancement. Other PAs choose to remain master clinicians, becoming the go-to senior PA in their specialty community.',
  },
]

const interviewQuestionsForPAs = [
  {
    title: 'How is the Collaborative Practice Agreement Structured?',
    description: 'The specific terms of the supervising physician relationship affect your daily autonomy more than any state law. Ask about chart review percentages, required co-signatures, on-site presence requirements, and how the relationship handles weekend and evening coverage. The answer reveals whether you will function as a true clinical partner or as an extension of one physician.',
  },
  {
    title: 'What Does the Onboarding Look Like for a New Hire?',
    description: 'Strong practices invest 4 to 12 weeks in structured onboarding even for experienced PAs. Weak practices throw you into a full patient load on day one and let you figure out the EMR, the workflow, and the unwritten rules through trial and error. Ask for specifics: who will be your point person, what cases will you see in the first month, how is feedback delivered?',
  },
  {
    title: 'How is Productivity Compensation Calculated?',
    description: 'If the offer includes RVU or productivity bonuses, ask for the specific formula. Some practices pay 100 percent of RVUs above a threshold. Others use a complex formula that pays little until very high volumes are reached. The headline number on a job posting can be misleading without the formula details.',
  },
  {
    title: 'What is the Tenure of the Current PA Team?',
    description: 'Practices with PAs who have been there 5 or more years are revealing something important about working conditions. Practices with constant PA turnover are also revealing something important. Ask directly: how long have your current PAs been with the practice, and why did the last PA leave? Hesitation in the answer is informative.',
  },
]

const industryShifts = [
  'AAPA voted in 2021 to officially rename the profession from "Physician Assistant" to "Physician Associate," with state-by-state implementation ongoing through the late 2020s',
  'Optimal Team Practice (OTP) frameworks are expanding, removing requirements for specific supervising physician agreements in a growing number of states',
  'PANRE-LA introduced in 2023 as an alternative to the traditional 10-year recertification exam, allowing longitudinal assessment over quarterly segments',
  'Postgraduate PA fellowships (1-year specialty training programs) have grown to over 100 programs as of 2026, particularly in surgery, EM, dermatology, and critical care',
  'Telehealth has expanded PA practice opportunities in psychiatry, primary care, and dermatology, with some PAs working fully remote positions',
  'Loan repayment programs through NHSC, IHS, and state-specific initiatives are paying up to $80,000 toward student loans for PAs serving in shortage areas',
  'Doctor of Medical Science (DMSc) programs have grown rapidly, offering clinical doctorates designed specifically for practicing PAs',
  'Insurance billing parity (PAs billing at 100 percent of physician rates) has expanded, particularly in Medicare and some state Medicaid programs',
]

const faqs = [
  {
    question: 'What is the actual scope of practice for a physician assistant?',
    answer: 'PAs perform virtually all clinical tasks performed by physicians within their training and specialty. This includes taking medical histories, conducting physical examinations, ordering and interpreting diagnostic tests, diagnosing conditions, prescribing medications (including controlled substances), performing procedures, assisting in surgery, providing patient counseling, and managing inpatients. Scope is determined by the specific collaborative practice agreement, state law, and the credentials granted by the employing institution.',
  },
  {
    question: 'How competitive is admission to PA school?',
    answer: 'PA school admissions have become significantly more competitive over the past decade. The average accepted student has a GPA above 3.6, more than 2,000 hours of healthcare experience, strong letters of recommendation from physicians and PAs, and competitive GRE scores. Many programs have acceptance rates below 5 percent. Applicants typically apply to 10 to 15 programs to maximize chances of acceptance somewhere.',
  },
  {
    question: 'Can PAs prescribe controlled substances?',
    answer: 'Yes, PAs have prescriptive authority for controlled substances in all 50 states, though specific scheduling restrictions vary. Most states allow PAs to prescribe Schedule II through Schedule V medications with appropriate DEA registration. Some states have additional restrictions on certain medications (such as buprenorphine for opioid use disorder) that require specific waivers, though these waivers were eliminated for most providers in 2023.',
  },
  {
    question: 'What is the job outlook for physician assistants?',
    answer: 'The Bureau of Labor Statistics projects 28 percent growth for PAs through 2031, among the fastest-growing professions in healthcare. The aging US population, physician shortages (particularly in primary care and rural areas), and expansion of healthcare access continue driving demand. New PA school graduates typically receive multiple job offers, particularly in non-metropolitan areas where the shortages are most acute.',
  },
  {
    question: 'Do physician assistants need malpractice insurance?',
    answer: 'Yes, though most employers provide malpractice coverage as part of the employment package. The two main types are occurrence-based policies (which cover claims related to events during the policy period regardless of when claims are filed) and claims-made policies (which require tail coverage when leaving an employer). Reading the malpractice provisions carefully is critical when accepting a position because tail coverage costs can be substantial if the employer does not provide it.',
  },
  {
    question: 'Can PAs become medical directors or have administrative leadership roles?',
    answer: 'Yes, increasingly. PAs serve as medical directors in some settings (particularly urgent care, dermatology, and surgical practices), as department leaders, and as healthcare executives. The Doctor of Medical Science (DMSc) degree has become a common credential for PAs pursuing leadership tracks. Some health systems have chief PA officer positions that operate at the executive level alongside chief medical officers.',
  },
]

export default async function PhysicianAssistantJobsPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'physician assistant', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'physician assistant', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Physician Assistant Jobs Hiring Now Across the United States
          </h1>
          <p className="text-gray-700">
            Browse open physician assistant positions across every medical specialty including emergency medicine, surgery, dermatology, primary care, hospital medicine, and behavioral health.
          </p>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="physician assistant" />
          </aside>
          <div className="flex-1">
            
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList what={params.what || 'physician assistant'} where={params.where || ''} salary_min={params.salary_min} initialData={initialData} />
            </Suspense>
          </div>
        </div>

        {/* ── SPECIALTIES LANDSCAPE ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Stethoscope className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Nine Specialty Tracks That Define PA Career Paths</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            One of the defining advantages of the PA profession is specialty mobility. Unlike physicians who commit to a specialty through residency, PAs can enter and move between specialties throughout a career. Each specialty offers a distinct combination of clinical content, lifestyle, and compensation. Here are the nine tracks where most PAs build their careers.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialties.map((spec, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <spec.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{spec.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{spec.description}</p>
                <p className="text-sm font-bold text-green-700">{spec.payRange}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── PA VS NP VS PHYSICIAN ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">PA vs Nurse Practitioner vs Physician: The Real Differences</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Candidates considering the PA path typically compare it to becoming a nurse practitioner or going to medical school. The training models, practice scope, mobility, and compensation differ in ways that matter for long-term career fit. This comparison cuts through the marketing copy from each profession.
          </p>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 gap-px bg-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="bg-white px-4 py-3">Aspect</div>
              <div className="bg-white px-4 py-3">Physician Assistant</div>
              <div className="bg-white px-4 py-3">Nurse Practitioner</div>
              <div className="bg-white px-4 py-3">Physician</div>
            </div>
            {paVsOthersComparison.map((row, i) => (
              <div key={i} className="grid grid-cols-4 gap-px bg-gray-100">
                <div className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-4 py-3.5 text-sm font-medium text-gray-800`}>{row.aspect}</div>
                <div className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-4 py-3.5 text-sm text-blue-700`}>{row.pa}</div>
                <div className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-4 py-3.5 text-sm text-gray-700`}>{row.np}</div>
                <div className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-4 py-3.5 text-sm text-gray-700`}>{row.physician}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── STATE PRACTICE AUTHORITY ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Where You Work Affects How You Work: State Practice Authority Tiers</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The state where you practice as a PA shapes your daily autonomy more than most candidates realize when accepting an offer. Practice authority is moving across a spectrum from strict supervision toward Optimal Team Practice, and where your state sits on that spectrum directly affects clinical decision-making, paperwork burden, and the texture of your relationship with supervising physicians.
          </p>
          <div className="space-y-4">
            {practiceAuthorityTiers.map((tier, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                <h3 className="font-bold text-gray-900 text-lg mb-3">{tier.tier}</h3>
                <p className="text-gray-600 text-sm mb-3">{tier.description}</p>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mt-3">
                  <p className="text-sm text-gray-700"><span className="font-semibold">Day-to-day reality: </span>{tier.workReality}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            State practice authority laws change frequently. Verify current rules through your state medical board before accepting a position in a new state.
          </p>
        </section>

        {/* ── COMPENSATION BREAKDOWN ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">What Actually Makes Up PA Compensation</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The salary headline on a PA job posting is rarely the whole picture. Real PA compensation is built from seven components that vary significantly by specialty, employer type, and region. Reading an offer letter accurately means understanding all of them.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {compensationComponents.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-2">{item.component}</h3>
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                <p className="text-sm font-bold text-green-700">{item.typical}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CERTIFICATION CYCLE ── */}
        <section className="mt-20 bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Award className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">The PA Certification Lifecycle: PANCE, CME, and PANRE</h2>
              <p className="text-gray-700 mb-6">
                Becoming and remaining a certified PA involves a defined sequence of credentialing steps that span the entire career. Understanding the full cycle helps with planning CME activities, anticipating recertification timing, and choosing between the traditional PANRE and the newer PANRE-LA pathway.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {certificationCycle.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-5">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-amber-100 text-amber-700 font-bold rounded-full text-sm mb-3">{item.step}</span>
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── DAY IN THE LIFE BY SPECIALTY ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Five Different Days, Five Different Specialties</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            "A day in the life" of a PA looks completely different depending on the specialty. The same person could thrive in one setting and burn out quickly in another. Below is what an actual day looks like across five common PA work environments, including scheduling patterns and the texture of the clinical work.
          </p>
          <div className="space-y-4">
            {dayInTheLifeOptions.map((option, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 mb-3">
                  <h3 className="font-bold text-gray-900 text-lg">{option.setting}</h3>
                  <span className="text-sm font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded whitespace-nowrap">{option.schedule}</span>
                </div>
                <p className="text-gray-600 text-sm">{option.typicalDay}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CAREER PROGRESSION ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">The Five-Stage PA Career Trajectory</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            PA careers do not follow a single template, but the progression from new graduate to senior clinician follows recognizable patterns. The decision points around years 3, 7, and 15 of practice shape long-term trajectory and earning potential significantly.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careerProgression.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 font-bold rounded-full text-sm mb-3">{item.step}</span>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── INTERVIEW QUESTIONS ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Four Questions Every PA Should Ask Before Accepting an Offer</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            PA job postings frequently look similar on paper. The real differences emerge from how the practice is structured, how supervision works in daily life, and how the PA team is treated. These four questions surface the truth about a position better than reading job descriptions ever can.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {interviewQuestionsForPAs.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 font-bold rounded-full text-sm mb-4">{index + 1}</span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── INDUSTRY SHIFTS ── */}
        <section className="mt-20">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <TrendingUp className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Eight Shifts Reshaping the PA Profession in 2026</h2>
                <p className="text-gray-700 mb-4">
                  The PA profession is in a period of significant evolution driven by regulatory changes, training innovations, and shifts in healthcare delivery. Candidates entering the field or considering job changes benefit from understanding the direction the profession is moving. Below are the eight shifts that matter most for PA careers in 2026.
                </p>
                <div className="grid md:grid-cols-2 gap-3 mt-4">
                  {industryShifts.map((item, index) => (
                    <div key={index} className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Physician Assistant Jobs</h2>
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
            <strong>Disclaimer:</strong> This page provides general information about physician assistant careers in the United States. Compensation figures are illustrative and reflect typical ranges reported by industry sources including AAPA salary data; actual pay depends on the employer, specialty, location, and experience level. Practice authority laws, certification requirements, and CME standards vary by state and are subject to change. Verify current requirements through the National Commission on Certification of Physician Assistants (NCCPA), your state medical or PA licensing board, and the American Academy of Physician Associates (AAPA). Oh My Job is not affiliated with NCCPA, AAPA, ARC-PA, or any of the healthcare organizations referenced on this page.
          </p>
        </section>
      </div>
    </>
  )
}