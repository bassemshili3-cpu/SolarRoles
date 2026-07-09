import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
import {
  Heart,
  TrendingUp,
  DollarSign,
  MapPin,
  AlertTriangle,
  Award,
  Clock,
  Briefcase,
  ShieldCheck,
  Users,
  BookOpen,
} from 'lucide-react'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Labor & Delivery Nurse Jobs | L&D RN Positions',
  description:
    'L&D RN positions at teaching hospitals, community birth centers, and travel assignments. Pay starts above $75K with shift differentials and sign-on incentives.',
  keywords:
    'labor and delivery nurse jobs, L&D nurse jobs, labor and delivery RN jobs, L&D nurse hiring now, labor delivery nurse positions, OB nurse jobs, maternity nurse jobs',
  openGraph: {
    title: 'Labor & Delivery Nurse Jobs | Staff & Travel L&D Roles',
    description:
      'L&D RN positions with immediate openings across the US. Staff and travel roles, competitive pay, sign-on bonuses. Apply now.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Labor & Delivery Nurse Jobs | $75K to $130K+',
    description:
      'Immediate openings for L&D RNs. Staff and travel positions available. Earn $75K to $130K+ depending on role and location. Apply today.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/labor-and-delivery-nurse-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Labor and Delivery Nurse Jobs',
  description:
    'Find labor and delivery nurse jobs hiring now across the United States. Browse staff RN, travel nurse, and per diem L&D positions with immediate openings.',
  url: 'https://www.oh-my-job.com/labor-and-delivery-nurse-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Labor and Delivery Nurse Job Listings',
    description: 'Current L&D RN job openings across the US',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What does a labor and delivery nurse do?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Labor and delivery nurses care for patients throughout the entire birthing process, from early labor through postpartum recovery. They monitor fetal heart rate patterns, administer pain management including epidural support, assist with vaginal and cesarean deliveries, perform newborn assessments, and provide emotional support to patients and families. They also respond to obstetric emergencies such as shoulder dystocia, hemorrhage, and fetal distress.',
      },
    },
    {
      '@type': 'Question',
      name: 'What education and license do you need to work as a labor and delivery nurse?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You must hold an active RN license in the state where you work. An ADN qualifies you legally, but the majority of hospital employers now require or strongly prefer a BSN. Most L&D units also require BLS certification from the start and NRP (Neonatal Resuscitation Program) certification within the first few months of hire.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much do labor and delivery nurses earn?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Staff L&D RNs earn a national average of approximately $75,000 to $81,000 per year. Top earners with RNC-OB certification and several years of experience can earn $90,000 to $106,000. Travel L&D nurses typically earn significantly more through a combination of base pay and tax-free housing and meal stipends, with total compensation commonly reaching $100,000 to $130,000 or more per year.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can a new graduate RN become a labor and delivery nurse?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, though it requires deliberate strategy. Most hospitals with new graduate nurse residency programs offer L&D tracks. Applying directly to a residency program is the most reliable path. New grads who completed clinical rotations in OB or mother-baby units, or who completed a dedicated OB simulation course, have a meaningful advantage over candidates without any maternal health clinical hours.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between a staff L&D nurse and a travel L&D nurse?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Staff L&D nurses are permanent employees of a hospital or health system, with full benefits, consistent scheduling, and a clear promotion path. Travel L&D nurses take short-term contracts of 8 to 26 weeks at facilities that need temporary coverage, typically earning 30 to 50 percent more in total compensation. Travel roles require at least one to two years of L&D experience and comfort adapting quickly to new environments.',
      },
    },
    {
      '@type': 'Question',
      name: 'What certifications increase a labor and delivery nurse salary?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The RNC-OB (Inpatient Obstetric Nursing certification from the National Certification Corporation) is the most impactful, associated with average salaries $15,000 to $20,000 higher than non-certified peers. The Electronic Fetal Monitoring (C-EFM) credential is also highly valued. ACLS and NRP are expected by most employers and affect initial eligibility rather than pay differentials.',
      },
    },
  ],
}

/* ─── SECTION DATA ──────────────────────────────────────────── */

const roleComparison = [
  {
    type: 'Staff RN (Permanent)',
    icon: Heart,
    color: 'text-rose-600',
    bg: 'bg-rose-50 border-rose-200',
    annualComp: '$68,000 – $106,000',
    schedule: '12-hour shifts, rotating days/nights, on-call',
    benefits: 'Full health, PTO, retirement match, tuition reimbursement',
    pros: 'Consistency, team relationships, promotion path, benefits',
    cons: 'Lower base pay than travel, mandatory overtime common in understaffed units',
    bestFor: 'Nurses who value stability, community, and long-term career building at one facility.',
  },
  {
    type: 'Travel Nurse (Contract)',
    icon: MapPin,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    annualComp: '$95,000 – $130,000+',
    schedule: 'Fixed-term contracts of 8 to 26 weeks, typically 3 x 12-hour shifts per week',
    benefits: 'Tax-free housing and meal stipends, travel reimbursement, health coverage',
    pros: 'Significantly higher total pay, new environments, schedule flexibility between contracts',
    cons: 'Constant adaptation, credentialing admin per state, no long-term PTO or retirement',
    bestFor: 'Experienced L&D nurses with 1 to 2 or more years who want to maximize income or explore regions.',
  },
  {
    type: 'Per Diem / PRN',
    icon: Clock,
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-200',
    annualComp: '$42 – $65/hr (premium hourly rate)',
    schedule: 'Self-scheduled, as-needed. Usually minimum shift commitments per pay period.',
    benefits: 'Minimal or none — compensation is reflected in higher hourly rate',
    pros: 'Maximum scheduling control, highest hourly rate of the three models',
    cons: 'No guaranteed hours, no benefits, income variability, last priority during low census',
    bestFor: 'Nurses who have a primary income source and want supplemental high-rate shifts around it.',
  },
]

const certifications = [
  {
    name: 'RNC-OB (Inpatient Obstetric Nursing)',
    body: 'National Certification Corporation (NCC)',
    requirement: 'Minimum 2,000 hours of L&D experience before eligibility',
    payImpact: '+$15,000 – $20,000/yr vs. non-certified peers',
    description:
      'The gold-standard credential for L&D nurses. Validates expert-level competency across labor support, fetal monitoring interpretation, hemorrhage management, and obstetric emergency response. Most competitive travel assignments list it as preferred or required.',
  },
  {
    name: 'C-EFM (Electronic Fetal Monitoring)',
    body: 'National Certification Corporation (NCC)',
    requirement: 'Open to RNs with qualifying clinical hours; no minimum years required',
    payImpact: '+$3,000 – $8,000/yr, stronger salary negotiation position',
    description:
      'Fetal heart rate interpretation is the core clinical skill of L&D nursing. Holding the C-EFM credential signals a higher-than-average level of rigor in this competency and is increasingly listed as preferred on hospital postings and travel contracts.',
  },
  {
    name: 'NRP (Neonatal Resuscitation Program)',
    body: 'American Academy of Pediatrics (AAP)',
    requirement: 'Required at most facilities within 90 days of hire; many require it at start',
    payImpact: 'Eligibility credential — required to work L&D at most hospitals',
    description:
      'Covers the recognition and management of newborns who require resuscitation at birth. This is a baseline expectation at virtually every hospital L&D unit in the US. Obtaining it before applying removes a common hiring bottleneck.',
  },
  {
    name: 'ACLS (Advanced Cardiovascular Life Support)',
    body: 'American Heart Association (AHA)',
    requirement: 'Required by most L&D units; BLS is the absolute minimum',
    payImpact: 'Eligibility credential for high-acuity and ICU-adjacent roles',
    description:
      'Required for management of maternal cardiac emergencies and for eligibility on most travel L&D contracts and Level III or IV maternity center postings. Completing it before applying significantly expands the number of roles available.',
  },
  {
    name: 'RNC-MNN (Maternal Newborn Nursing)',
    body: 'National Certification Corporation (NCC)',
    requirement: '2,000 hours of maternal-newborn nursing experience',
    payImpact: '+$5,000 – $12,000/yr; widens scope to mother-baby and postpartum units',
    description:
      'Covers both maternal and newborn care in the immediate postpartum period. Nurses who hold both RNC-OB and RNC-MNN are among the most versatile in the specialty and qualify for the broadest range of OB unit assignments.',
  },
]

const careerLadder = [
  {
    level: 'New Grad L&D RN (via Residency)',
    timeframe: 'Entry — Year 1',
    pay: '$65,000 – $75,000',
    what:
      'Most new L&D nurses enter through formal nurse residency programs lasting 12 to 18 months. The first 3 to 6 months involve supervised practice with a preceptor. Units look for nurses who completed OB clinical rotations, show emotional steadiness under pressure, and demonstrate genuine interest in the specialty.',
  },
  {
    level: 'Staff L&D RN',
    timeframe: 'Year 1 to Year 5',
    pay: '$72,000 – $92,000',
    what:
      'Independent practice managing a full patient assignment. Typically 2 to 3 laboring patients per nurse depending on acuity. NRP, BLS, and ACLS expected. RNC-OB or C-EFM certification is strongly encouraged and typically rewarded with a pay differential. Travel eligibility usually begins at 1 to 2 years.',
  },
  {
    level: 'Charge Nurse / Senior L&D RN',
    timeframe: 'Year 3 to Year 7',
    pay: '$85,000 – $105,000',
    what:
      'Responsible for staffing coordination, patient flow, and unit safety during a shift. Acts as the first resource for less experienced nurses and manages communication with physicians and midwives on complex cases. RNC-OB is standard at this level.',
  },
  {
    level: 'Perinatal Clinical Nurse Specialist or Educator',
    timeframe: 'Year 5+',
    pay: '$92,000 – $115,000',
    what:
      'Clinical nurse specialists lead quality improvement initiatives, conduct obstetric emergency drills, and manage competency education for the unit. Educators onboard new hires and run in-service training. Both paths require an MSN and a track record in the specialty.',
  },
  {
    level: 'Certified Nurse-Midwife (CNM) or NP in Women\'s Health',
    timeframe: 'Year 5+ with graduate degree',
    pay: '$110,000 – $135,000',
    what:
      'The most direct advanced practice trajectory from L&D nursing. CNMs provide independent delivery care, prenatal management, and postpartum oversight. Requires an MSN and national certification. Many hospitals actively fund this pathway for experienced L&D RNs.',
  },
]

const shiftRealities = [
  {
    title: 'Census Fluctuation Is the Defining Scheduling Challenge',
    description:
      'Unlike most nursing units, L&D volume is impossible to predict. A shift can go from one laboring patient to a full unit in two hours. Conversely, slow days mean on-call assignments or mandatory low-census time off without pay. Understanding how each facility manages low census before accepting an offer is one of the most important due-diligence steps in an L&D job search.',
  },
  {
    title: 'On-Call Requirements Are Nearly Universal',
    description:
      'Most L&D units require nursing staff to hold on-call availability on a rotating basis, sometimes one or two shifts per month. On-call pay ranges from $3 to $10/hr and converts to a full shift rate when called in. This affects lifestyle significantly and should be clarified in the offer letter before signing.',
  },
  {
    title: 'Nurse-to-Patient Ratios Vary Widely and Signal Unit Health',
    description:
      'A 1:2 ratio during active labor is the standard associated with safe care. Ratios of 1:3 or higher during active labor are a red flag indicating chronic understaffing. California mandates 1:2 by law. Most other states do not regulate this. Asking for the unit\'s typical assignment load and how it is managed during surge is a non-negotiable step before accepting any L&D offer.',
  },
  {
    title: 'Emotional Demands Require Real Preparation',
    description:
      'L&D nurses experience both the highest highs and some of the most acute losses in nursing. Fetal demise, maternal hemorrhage emergencies, and unexpected complications are a real part of the role. Facilities with strong debriefing protocols, peer support structures, and mental health resources for nursing staff are better places to build a sustainable career. Ask about these explicitly.',
  },
]

const payByRegion = [
  {
    region: 'California',
    avgStaff: '$100,000 – $130,000',
    avgTravel: '$130,000 – $160,000+',
    notes: 'Mandatory 1:2 ratio law, highest base pay in the nation. High cost of living in most metro areas.',
  },
  {
    region: 'Pacific Northwest (WA, OR)',
    avgStaff: '$85,000 – $110,000',
    avgTravel: '$110,000 – $140,000',
    notes: 'Strong union presence, robust benefits packages, active travel market near Seattle and Portland.',
  },
  {
    region: 'Northeast (NY, NJ, MA, CT)',
    avgStaff: '$80,000 – $108,000',
    avgTravel: '$105,000 – $135,000',
    notes: 'Major academic medical centers drive top pay. NYC metro commands the highest rates in the region.',
  },
  {
    region: 'Sun Belt (TX, FL, AZ, GA)',
    avgStaff: '$65,000 – $90,000',
    avgTravel: '$90,000 – $120,000',
    notes: 'High volume of openings due to population growth. Travel contracts in FL and TX are among the most active nationally.',
  },
  {
    region: 'Midwest (IL, OH, MN, MO)',
    avgStaff: '$62,000 – $85,000',
    avgTravel: '$85,000 – $115,000',
    notes: 'Lower cost of living significantly increases real purchasing power vs. coastal salaries. Strong academic hospital systems.',
  },
  {
    region: 'Mountain West (CO, NV, UT)',
    avgStaff: '$68,000 – $92,000',
    avgTravel: '$95,000 – $125,000',
    notes: 'Rapidly growing region with expanding hospital systems. Nevada travel rates are elevated due to persistent nursing shortages.',
  },
]

const newGradStrategies = [
  {
    title: 'Apply Directly to New Graduate Nurse Residency Programs',
    description:
      'Most large hospital systems run structured nurse residency programs with dedicated L&D tracks. These 12 to 18-month programs provide preceptored experience specifically designed for specialty entry. They are the single most reliable way to land an L&D role as a new grad. Applications typically open 3 to 6 months before graduation.',
  },
  {
    title: 'Target OB Clinical Rotations Before Graduating',
    description:
      'Nursing students who actively request OB clinical rotations, even if they are not the default assignment, graduate with a distinct advantage. Time in labor and delivery or postpartum during school directly addresses the "no L&D experience" objection every new grad faces.',
  },
  {
    title: 'Consider Starting in Mother-Baby Then Transitioning',
    description:
      'Mother-baby (postpartum) units are easier to enter as a new grad and provide close proximity to the L&D team, familiarity with maternal-newborn care, and a foundation that makes the L&D transition after 12 to 18 months much smoother. Many experienced L&D nurses followed this exact path.',
  },
  {
    title: 'Complete an OB Simulation or Transitional Course Before Applying',
    description:
      'Several nursing education platforms offer dedicated OB simulation courses covering fetal monitoring, labor support, and obstetric emergency skills. Completing one and listing it prominently on your resume signals initiative that distinguishes a new grad application from the dozens of generic submissions hiring managers receive.',
  },
]

const redFlags = [
  'The posting lists nurse-to-patient ratios of 1:3 or higher during active labor without acknowledging it as a surge circumstance',
  'No mention of a structured orientation or preceptor program for new-to-specialty hires',
  'The description states "must be comfortable with mandatory overtime" as a routine expectation rather than an exception',
  'On-call requirements are not disclosed in the posting — ask before accepting any offer',
  'The unit has a high proportion of agency or travel staff replacing permanent positions, which signals chronic retention problems',
  'The facility does not mention or cannot describe its obstetric emergency response protocols when asked',
  'Sign-on bonuses come with payback clauses of more than 2 years, which significantly reduces their real value',
  'The posting does not specify whether the RN license is compact or single-state and whether relocation assistance is available',
]

const faqs = [
  {
    question: 'What makes labor and delivery nursing different from other nursing specialties?',
    answer:
      'L&D nursing is distinctive in several ways. You are simultaneously caring for two patients — the mother and the baby — whose conditions can diverge rapidly and independently. The work combines long stretches of attentive monitoring with sudden high-acuity moments requiring immediate clinical response. Unlike most specialties, you also witness the full spectrum of human emotion compressed into a single shift, from profound joy to acute grief. Nurses who thrive in L&D tend to have a high tolerance for uncertainty, a calm presence under pressure, and a genuine connection to the meaning of the work.',
  },
  {
    question: 'How does travel L&D nursing actually work in practice?',
    answer:
      'A travel L&D nurse signs a contract with a staffing agency to fill a temporary position at a specific hospital, typically for 13 weeks with the option to extend. The agency negotiates the contract, handles licensing verification, arranges housing stipends, and manages payroll. The nurse works the facility\'s schedule like a staff member but earns a higher total package. Between contracts, you can take time off or immediately begin the next assignment. The practical challenges are adapting quickly to new EMR systems, learning unfamiliar unit cultures, and managing state license applications when working in non-compact states.',
  },
  {
    question: 'What is the RNC-OB and how important is it?',
    answer:
      'The RNC-OB is the Inpatient Obstetric Nursing certification administered by the National Certification Corporation. It is the most recognized credential in the L&D specialty and validates a higher standard of clinical competency across all phases of intrapartum and immediate postpartum care. It requires a minimum of 2,000 hours of L&D experience before eligibility. Certified nurses consistently earn more than non-certified peers at every experience level, and most competitive travel contracts list it as preferred or required. Preparing for and passing the RNC-OB is the most impactful single career move available to a working L&D nurse.',
  },
  {
    question: 'How do L&D nurse salaries compare to other nursing specialties?',
    answer:
      'L&D nursing pays at approximately the same level as medical-surgical and pediatric nursing for staff positions, with a national average near $75,000 to $81,000 annually. The meaningful pay differentiation happens through certification (RNC-OB can add $15,000 to $20,000), travel nursing (total packages of $100,000 to $130,000 or more), and geographic choice. ICU and emergency nursing tend to pay slightly more at the staff level due to broader critical care scope, but L&D travel contracts in high-demand markets are among the highest-compensated short-term nursing assignments available.',
  },
  {
    question: 'What should I ask a hiring manager before accepting an L&D offer?',
    answer:
      'The most important questions are: What is the typical nurse-to-patient ratio during active labor and how is surge managed? What does the on-call requirement look like and how is low-census time handled? What does the orientation program include and how long is it? Is there a structured preceptor relationship and for how many weeks? Does the facility offer certification reimbursement for RNC-OB or C-EFM? What peer support or debriefing resources exist after difficult outcomes? The answers to these questions tell you more about the quality of the work environment than anything on the job posting.',
  },
  {
    question: 'Is L&D nursing a sustainable long-term career?',
    answer:
      'For nurses who are well-matched to the specialty, yes. The emotional weight is real but manageable with the right support structures in place. Career longevity in L&D tends to correlate with three things: choosing facilities that invest in their staff, building clinical mastery through certification, and having honest awareness of personal coping needs after difficult outcomes. L&D nurses who stay in the specialty often describe it as the only unit they would want to work, and many remain in maternal health for their entire career, eventually transitioning into education, coordination, or advanced practice roles rather than leaving nursing entirely.',
  },
]

export default async function LaborAndDeliveryNurseJobsPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'labor and delivery nurse', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'labor and delivery nurse', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Labor and Delivery Nurse Jobs Hiring Now Across the United States
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="labor and delivery nurse" />
          </aside>
          <div className="flex-1">
            
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'labor and delivery nurse'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData}
              />
            </Suspense>
          </div>
        </div>

        {/* ── THREE EMPLOYMENT MODELS ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-rose-600" />
            <h2 className="text-2xl font-bold text-gray-900">Three Ways to Work as an L&D Nurse: Staff, Travel, and Per Diem</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Labor and delivery nurse job postings fall into three fundamentally different employment models, each with its own pay structure, lifestyle implications, and career fit. Understanding the real differences before applying saves significant time and prevents costly mismatches.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {roleComparison.map((role, index) => (
              <div key={index} className={`border rounded-2xl p-6 flex flex-col ${role.bg}`}>
                <div className="flex items-center gap-2 mb-4">
                  <role.icon className={`w-5 h-5 ${role.color}`} />
                  <h3 className="font-bold text-gray-900">{role.type}</h3>
                </div>
                <div className="space-y-3 text-sm flex-1">
                  <div>
                    <p className="font-medium text-gray-700">Annual compensation</p>
                    <p className="font-semibold text-gray-900">{role.annualComp}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Schedule</p>
                    <p className="text-gray-600">{role.schedule}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Benefits</p>
                    <p className="text-gray-600">{role.benefits}</p>
                  </div>
                  <div>
                    <p className="font-medium text-green-700">Advantages</p>
                    <p className="text-gray-600">{role.pros}</p>
                  </div>
                  <div>
                    <p className="font-medium text-amber-700">Trade-offs</p>
                    <p className="text-gray-600">{role.cons}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/60">
                  <p className="text-xs text-gray-500">
                    <span className="font-medium text-gray-700">Best for:</span> {role.bestFor}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PAY BY REGION ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Labor and Delivery Nurse Pay by Region: Staff and Travel Compared</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Geography is one of the most significant variables in L&D nurse compensation. The difference between the lowest and highest-paying states can exceed $40,000 per year for the same role and the same level of experience. These figures reflect current market rates for both staff and travel positions.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 pr-6 font-semibold text-gray-700">Region</th>
                  <th className="text-left py-3 pr-6 font-semibold text-gray-700">Staff RN annual pay</th>
                  <th className="text-left py-3 pr-6 font-semibold text-gray-700">Travel total compensation</th>
                  <th className="text-left py-3 font-semibold text-gray-700">Notes</th>
                </tr>
              </thead>
              <tbody>
                {payByRegion.map((row, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 pr-6 font-medium text-gray-900">{row.region}</td>
                    <td className="py-4 pr-6 font-semibold text-green-700">{row.avgStaff}</td>
                    <td className="py-4 pr-6 font-semibold text-blue-700">{row.avgTravel}</td>
                    <td className="py-4 text-gray-500 text-xs max-w-xs">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Travel figures include base pay plus tax-free housing and meal stipends. Actual totals vary by agency, contract length, and market conditions. Staff pay reflects 2025 market data.
          </p>
        </section>

        {/* ── CERTIFICATIONS ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-yellow-600" />
            <h2 className="text-2xl font-bold text-gray-900">Certifications That Matter for L&D Nurses: What Each One Does for Your Career</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Not all nursing credentials have the same return on investment. In L&D specifically, the market draws a sharp distinction between eligibility credentials that are required to work the unit at all, and mastery credentials that increase pay and access to competitive positions. Here is the full picture.
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            {certifications.map((cert, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{cert.body}</p>
                  </div>
                  <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                    {cert.payImpact}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{cert.description}</p>
                <p className="text-xs text-gray-400">Eligibility: {cert.requirement}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CAREER LADDER ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">The L&D Nursing Career Path: From New Grad to Advanced Practice</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Labor and delivery nursing has one of the clearest upward trajectories in all of nursing. Each stage builds on the last with concrete experience, credential, and compensation milestones. Here is what the full arc looks like.
          </p>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-blue-200 hidden md:block" />
            <div className="space-y-4">
              {careerLadder.map((step, index) => (
                <div key={index} className="relative flex gap-6">
                  <div className="hidden md:flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm z-10 flex-shrink-0">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{step.level}</h3>
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{step.timeframe}</span>
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">{step.pay}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{step.what}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SHIFT REALITIES ── */}
        <section className="mt-20">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <Clock className="w-8 h-8 text-slate-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What Working L&D Shifts Actually Looks Like</h2>
                <p className="text-gray-700 mb-6">
                  Job postings describe the role. What they rarely describe is the operational reality of working the unit day to day. These are the factors that experienced L&D nurses consistently say matter most when choosing a position.
                </p>
                <div className="grid md:grid-cols-2 gap-5">
                  {shiftRealities.map((item, index) => (
                    <div key={index} className="bg-white rounded-xl p-5">
                      <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── NEW GRAD STRATEGIES ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">How to Break Into L&D Nursing as a New Graduate</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            L&D is a competitive specialty to enter without prior obstetric experience. But it is not closed to new grads. These four strategies represent the paths that actually work in the current hiring environment.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {newGradStrategies.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 font-bold rounded-full text-sm mb-4">
                  {index + 1}
                </span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── RED FLAGS ── */}
        <section className="mt-20">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Red Flags in L&D Nurse Job Postings</h2>
                <p className="text-gray-700 mb-6">
                  The nursing shortage means hospitals sometimes post roles that reflect structural problems rather than genuine opportunity. These signals suggest a position worth scrutinizing carefully before committing.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {redFlags.map((flag, index) => (
                    <div key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1.5" />
                      <span className="text-sm">{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PROFESSIONAL ASSOCIATIONS ── */}
        <section className="mt-20">
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <Users className="w-8 h-8 text-teal-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Professional Organizations Every L&D Nurse Should Know</h2>
                <p className="text-gray-700 mb-4">
                  Membership in the right professional associations accelerates career development, provides access to continuing education, and signals commitment to the specialty to hiring managers and promotion committees.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  {[
                    {
                      name: 'AWHONN (Association of Women\'s Health, Obstetric and Neonatal Nurses)',
                      detail: 'The primary professional body for L&D and maternal health nursing. Publishes evidence-based practice guidelines, runs continuing education programs, and advocates for staffing standards. Membership is considered standard for career-serious L&D nurses.',
                    },
                    {
                      name: 'NCC (National Certification Corporation)',
                      detail: 'The credentialing body for RNC-OB, RNC-MNN, C-EFM, and several other maternal and newborn nursing certifications. Creating an account and tracking eligibility requirements is a practical first step for any nurse targeting certification.',
                    },
                    {
                      name: 'ACNM (American College of Nurse-Midwives)',
                      detail: 'Relevant for L&D nurses considering the CNM advanced practice pathway. Publishes scope-of-practice standards, accredits midwifery programs, and is the professional home for the advanced practice trajectory most accessible from an L&D background.',
                    },
                    {
                      name: 'ANA (American Nurses Association)',
                      detail: 'The broad professional association for all US nurses. Membership provides access to professional liability insurance options, legislative advocacy participation, and a nationwide professional network that supports career mobility across specialties and settings.',
                    },
                  ].map((item, index) => (
                    <div key={index} className="bg-white rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm">{item.name}</h3>
                      <p className="text-gray-600 text-sm">{item.detail}</p>
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
            <ShieldCheck className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Labor and Delivery Nurse Jobs</h2>
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
            <strong>Disclaimer:</strong> Salary figures and compensation ranges on this page are derived from aggregated public data sources including Payscale, ZipRecruiter, and employer postings as of 2025. Actual compensation varies by employer, facility type, location, experience level, certification status, and contract terms. oh-my-job.com does not guarantee specific pay outcomes and recommends verifying compensation details directly with each employer.
          </p>
        </section>
      </div>
    </>
  )
}