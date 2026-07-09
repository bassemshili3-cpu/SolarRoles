import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import {
  Stethoscope,
  Award,
  MapPin,
  DollarSign,
  Clock,
  TrendingUp,
  FileText,
  ShieldCheck,
  Plane,
  BookOpen,
  AlertCircle,
  Users,
  Heart,
} from 'lucide-react'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Pediatric Nurse Practitioner Jobs | PNP Openings',
  description:
    'CPNP-PC and CPNP-AC openings in pediatric primary care, urgent care, inpatient units, and telehealth — sign-on bonuses noted where available by employer.',
  keywords:
    'pediatric nurse practitioner jobs, PNP jobs, CPNP-PC jobs, CPNP-AC jobs, pediatric NP hiring, pediatric nurse practitioner positions, pediatric NP urgent care, pediatric nurse practitioner salary',
  openGraph: {
    title: 'Pediatric Nurse Practitioner Jobs | CPNP & PNP Roles',
    description:
      'PNP shortages are acute across primary care, urgent care, and inpatient settings. Browse open roles with competitive salaries and sign-on bonuses.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pediatric NP Jobs | Primary Care, Urgent Care & Telehealth',
    description:
      'Critical PNP shortages nationwide. Full-time, part-time, locum tenens, and telehealth roles available. Competitive pay and benefits. Find your next position now.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/pediatric-nurse-practitioner-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Pediatric Nurse Practitioner Jobs',
  description:
    'Browse pediatric nurse practitioner jobs hiring now across the United States. Roles span primary care, urgent care, inpatient, specialty, and telehealth settings.',
  url: 'https://www.oh-my-job.com/pediatric-nurse-practitioner-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Pediatric Nurse Practitioner Jobs',
    description: 'Current PNP job listings across all practice settings in the United States',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the difference between CPNP-PC and CPNP-AC certification?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The CPNP-PC (Primary Care) credential, issued by the Pediatric Nursing Certification Board, qualifies nurse practitioners to manage the full spectrum of pediatric health needs in outpatient and community settings. The CPNP-AC (Acute Care) credential qualifies practitioners for high-acuity inpatient environments such as PICUs, NICUs, and pediatric emergency departments. Each certification opens distinct job markets, and some employers require one specifically.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much do pediatric nurse practitioners earn?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Median annual compensation for pediatric nurse practitioners in the United States falls between $105,000 and $130,000 depending on setting, geography, and experience. Acute care and specialty roles (cardiology, oncology, critical care) typically exceed primary care rates. Locum tenens and travel assignments frequently offer day rates equivalent to $140,000 to $180,000 annualized.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does the Nurse Licensure Compact apply to pediatric nurse practitioners?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Enhanced Nurse Licensure Compact (eNLC) allows RN and APRN licensure portability across member states, meaning a PNP licensed in one compact state can practice in other compact states without obtaining individual state licenses. As of 2025, over 40 states participate. This is particularly valuable for locum tenens and telehealth PNP roles that cross state lines.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are there telehealth-only pediatric nurse practitioner jobs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Telehealth-only and hybrid telehealth PNP roles have expanded significantly since 2020. These positions typically involve managing follow-up appointments, behavioral health consultations, chronic disease management, and parental counseling virtually. A compact RN and APRN license substantially increases the geographic scope of telehealth PNP jobs available to a given candidate.',
      },
    },
    {
      '@type': 'Question',
      name: 'What sign-on bonuses can pediatric nurse practitioners expect?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sign-on bonuses for PNP roles currently range from $5,000 to $30,000 depending on setting acuity and geographic need. Rural and underserved areas, inpatient acute care, and pediatric subspecialty roles tend to offer the highest bonuses. Bonuses typically include a 1 to 2 year service commitment and are paid in installments or as a lump sum upon start.',
      },
    },
  ],
}

/* ─── SECTION DATA ──────────────────────────────────────────── */

const practiceSettings = [
  {
    setting: 'Pediatric Primary Care',
    icon: Heart,
    color: 'blue',
    description:
      'The largest employment segment for PNPs. Roles center on well-child visits, immunizations, developmental screenings, and management of common acute illnesses. Schedules are largely predictable, with minimal overnight call. Private practices, federally qualified health centers, and large multispecialty groups are the primary employers.',
    certification: 'CPNP-PC strongly preferred; FNP accepted at many sites',
    schedule: 'Monday to Friday; occasional Saturday hours',
    salary: '$100,000–$125,000',
    outlook: 'Consistently high demand; strong hiring across rural and suburban markets',
  },
  {
    setting: 'Pediatric Urgent Care',
    icon: Clock,
    color: 'orange',
    description:
      'Urgent care PNP roles require comfort managing acute presentations across the full age range from newborns to adolescents, including lacerations, respiratory distress, and fracture management. Patient volume is high and pace is fast. Chains like PM Pediatrics operate nationally and hire PNPs at volume. Sign-on bonuses are common in this segment.',
    certification: 'CPNP-PC or FNP; CPNP-AC valued for complex acute presentations',
    schedule: 'Evenings, weekends, and holidays standard',
    salary: '$110,000–$135,000',
    outlook: 'Rapidly growing; urgent care expansion continues in most metro markets',
  },
  {
    setting: 'Inpatient Hospital (PICU / NICU / General)',
    icon: Stethoscope,
    color: 'red',
    description:
      'Inpatient PNP roles require acute care certification and comfort with high-acuity patients, complex procedures, and interdisciplinary team coordination. These positions carry the highest compensation in the field and are concentrated at children\'s hospitals and academic medical centers. The clinical stakes are significant, and employers screen extensively.',
    certification: 'CPNP-AC required; PALS, NRP, and BLS mandatory',
    schedule: '12-hour shifts; rotating days, nights, and weekends',
    salary: '$120,000–$155,000',
    outlook: 'Critically understaffed; highest sign-on bonuses in the PNP market',
  },
  {
    setting: 'Pediatric Subspecialty Clinics',
    icon: Award,
    color: 'purple',
    description:
      'Subspecialty PNP roles span cardiology, oncology, endocrinology, pulmonology, neurology, and more. Each subspecialty has its own learning curve, but these positions offer deep clinical expertise and strong compensation. Academic medical center affiliation is common, and some positions include teaching or research components.',
    certification: 'CPNP-PC or CPNP-AC depending on specialty; subspecialty experience valued',
    schedule: 'Primarily outpatient, Monday to Friday; some inpatient rounding',
    salary: '$115,000–$145,000',
    outlook: 'Steady demand; cardiology and oncology NPs face the tightest supply gaps',
  },
  {
    setting: 'Telehealth and Virtual Care',
    icon: Users,
    color: 'teal',
    description:
      'Virtual-only and hybrid telehealth PNP roles have become a permanent fixture of the hiring market. Employers include direct-to-consumer telehealth platforms, insurance-aligned care programs, and pediatric practices that have formalized their virtual visit capacity. eNLC participation dramatically expands the candidate pool for these roles, and many positions are fully remote.',
    certification: 'CPNP-PC or FNP; compact state license essential for multi-state telehealth',
    schedule: 'Variable; many positions offer flexible or self-scheduled hours',
    salary: '$95,000–$120,000',
    outlook: 'Growing rapidly; demand driven by access gaps and post-pandemic care model shifts',
  },
  {
    setting: 'School-Based and Community Health',
    icon: BookOpen,
    color: 'green',
    description:
      'School-based PNP roles are funded through district health programs, state agencies, and federally qualified health center grants. These positions prioritize access for underserved children and typically involve preventive care, chronic disease management, mental health triage, and family education. Compensation is below hospital rates but schedules are highly predictable.',
    certification: 'CPNP-PC; additional school nurse or public health credentials valued',
    schedule: 'School year calendar with summers off in many positions',
    salary: '$85,000–$108,000',
    outlook: 'Stable; strongest in urban districts with established health program funding',
  },
]

const colorMap: Record<string, { bg: string; border: string; icon: string; badge: string; badgeText: string }> = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500', badge: 'bg-blue-100', badgeText: 'text-blue-700' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-500', badge: 'bg-orange-100', badgeText: 'text-orange-700' },
  red: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500', badge: 'bg-red-100', badgeText: 'text-red-700' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-500', badge: 'bg-purple-100', badgeText: 'text-purple-700' },
  teal: { bg: 'bg-teal-50', border: 'border-teal-200', icon: 'text-teal-500', badge: 'bg-teal-100', badgeText: 'text-teal-700' },
  green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-500', badge: 'bg-green-100', badgeText: 'text-green-700' },
}

const salaryData = [
  {
    role: 'Primary Care PNP',
    low: '$98,000',
    mid: '$112,000',
    high: '$125,000',
    notes: 'FQHCs and underserved area practices may add NHSC loan repayment on top of base salary',
  },
  {
    role: 'Urgent Care PNP',
    low: '$108,000',
    mid: '$122,000',
    high: '$138,000',
    notes: 'Shift differentials for evenings and weekends add $8,000–$15,000 to total compensation',
  },
  {
    role: 'PICU / Inpatient Acute Care PNP',
    low: '$118,000',
    mid: '$137,000',
    high: '$158,000',
    notes: 'Night shift and weekend differentials significant; sign-on bonuses of $15,000–$30,000 common',
  },
  {
    role: 'Pediatric Subspecialty NP',
    low: '$112,000',
    mid: '$128,000',
    high: '$148,000',
    notes: 'Academic center roles may include RVU bonuses tied to clinical productivity',
  },
  {
    role: 'Telehealth PNP',
    low: '$92,000',
    mid: '$108,000',
    high: '$122,000',
    notes: 'Fully remote positions often offer lower base but eliminate commute and cost-of-living exposure',
  },
  {
    role: 'Locum Tenens PNP',
    low: '$130,000',
    mid: '$160,000',
    high: '$185,000+',
    notes: 'Annualized equivalent based on typical day rates; housing and travel covered separately',
  },
]

const certificationComparison = [
  {
    cert: 'CPNP-PC (Primary Care)',
    body: 'Pediatric Nursing Certification Board (PNCB)',
    scope: 'Outpatient primary and preventive care, health promotion, management of common acute and chronic conditions in children from birth through young adulthood',
    eligibility: 'MSN or DNP with pediatric primary care focus; minimum clinical hours in pediatric primary care setting',
    jobsUnlocked: 'Private practice, FQHC, urgent care, telehealth, school-based care, retail health clinics',
    renewalCycle: 'Every 7 years; 30 CE credits required',
  },
  {
    cert: 'CPNP-AC (Acute Care)',
    body: 'Pediatric Nursing Certification Board (PNCB)',
    scope: 'High-acuity inpatient management, complex chronic and critical illness, advanced procedures, post-operative care in pediatric hospital settings',
    eligibility: 'MSN or DNP with acute care pediatric focus; minimum 500 clinical hours in acute or critical care setting',
    jobsUnlocked: 'PICU, NICU, pediatric emergency, cardiothoracic surgery units, inpatient subspecialty teams',
    renewalCycle: 'Every 7 years; 30 CE credits required',
  },
]

const locumTenensGuide = [
  {
    aspect: 'How it works',
    detail:
      'Locum tenens PNPs contract through a staffing agency to fill temporary coverage gaps at facilities that are short-staffed or between permanent hires. Assignments range from one week to six months or longer, with extension options common at sites where the match is strong.',
  },
  {
    aspect: 'What the pay structure looks like',
    detail:
      'Locum PNPs are paid an hourly or daily rate that is substantially higher than permanent roles to compensate for the lack of benefits. Most agencies also cover housing, travel, and malpractice insurance. The annualized equivalent typically lands 20 to 40 percent above comparable permanent salaries.',
  },
  {
    aspect: 'Licensing requirements',
    detail:
      'Locum tenens work often requires holding licenses in multiple states. Compact state licensure (eNLC) simplifies this significantly for RN-level work. APRN compact participation is expanding but not yet universal — check the current compact membership list before accepting an out-of-state assignment.',
  },
  {
    aspect: 'Who it suits',
    detail:
      'Locum tenens is best suited for experienced PNPs who are comfortable adapting quickly to new EHR systems, team dynamics, and protocols. New graduates and those within their first two years of practice generally benefit more from permanent roles where mentorship and structured onboarding are available.',
  },
]

const nlcStates = {
  compact: [
    'Alabama', 'Arizona', 'Arkansas', 'Colorado', 'Delaware', 'Florida', 'Georgia',
    'Idaho', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'New Hampshire', 'New Jersey',
    'New Mexico', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'South Carolina',
    'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'West Virginia',
    'Wisconsin', 'Wyoming',
  ],
  note: 'Compact membership expands periodically. Always verify current status through the NCSBN before accepting a multi-state role.',
}

const careerProgression = [
  {
    stage: 'New Graduate PNP (0–2 years)',
    focus:
      'Clinical consolidation and protocol mastery. New graduate PNPs benefit most from primary care or structured inpatient residency programs where orientation is formalized and preceptorship is available. Prioritize settings with low patient-to-provider ratios and strong attending physician support.',
    compensation: '$95,000–$108,000',
    priority: 'Mentorship quality over pay premium',
  },
  {
    stage: 'Experienced PNP (3–7 years)',
    focus:
      'Specialization and credential expansion. By this stage, most PNPs have identified the setting that fits their clinical interests. This is the window to add a subspecialty focus, pursue locum tenens on a trial basis, or begin building toward a leadership track. A DNP, if not already held, becomes an asset for senior roles.',
    compensation: '$112,000–$135,000',
    priority: 'Specialty depth, geographic flexibility, or leadership exposure',
  },
  {
    stage: 'Senior PNP / Lead APP (8+ years)',
    focus:
      'Clinical leadership, team management, and program development. Senior PNPs at large health systems increasingly hold formal APP director or team lead titles, with partial administrative responsibilities and influence over clinical protocol development. These roles carry compensation that overlaps with mid-level physician salaries at some institutions.',
    compensation: '$135,000–$165,000',
    priority: 'Institutional influence, RVU compensation structures, and professional recognition',
  },
]

const faqs = [
  {
    question: 'What is the difference between CPNP-PC and CPNP-AC, and which should I pursue?',
    answer:
      'The choice between CPNP-PC and CPNP-AC should be driven by where you intend to practice, not by which certification is easier to obtain. If your goal is outpatient primary care, urgent care, telehealth, or school-based work, CPNP-PC is the right credential and opens the broadest range of positions. If you are drawn to inpatient acute care, PICU, NICU, or pediatric emergency work, CPNP-AC is required by most hospital employers for those settings. Some PNPs hold both certifications, which maximizes flexibility, but the dual credential path requires graduate education that explicitly covers both practice scopes.',
  },
  {
    question: 'How does the Nurse Licensure Compact affect PNP job options?',
    answer:
      'The enhanced Nurse Licensure Compact (eNLC) allows nurses with a compact state license to practice in other compact member states without obtaining an additional license. For PNPs, this is especially relevant for telehealth roles (where the patient\'s physical location determines which state license is required) and for locum tenens assignments across state lines. Compact APRN licensure is expanding but is not yet as uniformly recognized as compact RN licensure — always verify that the specific compact covers your APRN role in the destination state before accepting an assignment.',
  },
  {
    question: 'Are sign-on bonuses negotiable for pediatric nurse practitioner positions?',
    answer:
      'Yes. Sign-on bonuses are among the most negotiable elements of a PNP employment package, particularly in high-demand settings. Acute care, PICU, and rural primary care roles have the most leverage. If the posted bonus is lower than market for your specialty, it is appropriate to counter. Be aware that most sign-on agreements include a repayment clause requiring partial or full repayment if you leave before completing a defined service period, typically 12 to 24 months. Read that clause carefully before signing.',
  },
  {
    question: 'What does a pediatric nurse practitioner interview typically involve?',
    answer:
      'PNP interviews at most employers combine a clinical case component with a traditional behavioral interview. For inpatient and acute care roles, expect to walk through a complex case scenario — vital signs, differential diagnosis, and initial management steps. Primary care interviews focus more on developmental milestones, well-child protocols, and family communication. Behavioral questions tend to center on handling a deteriorating patient, managing a difficult family conversation, and describing a clinical disagreement with a physician colleague. Know your setting-specific protocols and be ready to discuss your documentation habits in detail.',
  },
  {
    question: 'Can a family nurse practitioner (FNP) work in pediatric roles?',
    answer:
      'In many outpatient and urgent care settings, yes. FNP certification covers the full lifespan, and employers at pediatric urgent care chains, family medicine practices with significant pediatric volume, and some school-based programs will accept FNP credentials in lieu of CPNP-PC. Inpatient children\'s hospital roles almost universally require pediatric-specific certification (CPNP-AC for acute care settings). If you hold an FNP and want to work exclusively in pediatrics long term, adding the CPNP-PC credential strengthens your candidacy and opens employer categories that would otherwise screen you out.',
  },
  {
    question: 'What states have the highest demand for pediatric nurse practitioners right now?',
    answer:
      'States with the largest absolute shortages include Texas, Florida, California, and New York, where the pediatric population is largest and provider-to-patient ratios are most strained. Rural states including Montana, Wyoming, South Dakota, and Mississippi show the highest per-capita shortages relative to pediatric population. These rural markets often offer stronger sign-on bonuses and loan repayment programs through NHSC or state-specific funding to attract qualified PNPs.',
  },
]

export default async function PediatricNursePractitionerJobsPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'pediatric nurse practitioner', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'pediatric nurse practitioner', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
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
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Pediatric Nurse Practitioner Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="pediatric nurse practitioner" />
          </aside>
          <div className="flex-1">
            
            <Suspense
              fallback={
                <div className="animate-pulse bg-gray-100 rounded-lg h-96" />
              }
            >
              <InfiniteJobList
                what={params.what || 'pediatric nurse practitioner'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData}
              />
            </Suspense>
          </div>
        </div>

        {/* ── PRACTICE SETTINGS ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Stethoscope className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Where Pediatric Nurse Practitioners Work — Six Settings, Six Different Realities
            </h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            "Pediatric nurse practitioner" is a credential, not a job description. The day-to-day experience, required certification, schedule, and compensation vary considerably depending on where you practice. Understanding each setting before you apply prevents mismatches that lead to early turnover — one of the most costly outcomes in PNP hiring.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {practiceSettings.map((s, index) => {
              const c = colorMap[s.color]
              return (
                <div
                  key={index}
                  className={`bg-white border ${c.border} rounded-2xl p-6 hover:shadow-md transition-all`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <s.icon className={`w-6 h-6 ${c.icon}`} />
                    <h3 className="font-bold text-gray-900 text-lg">{s.setting}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{s.description}</p>
                  <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                    <div className="flex gap-2">
                      <span className="text-gray-500 flex-shrink-0">Certification</span>
                      <span className="text-gray-700 font-medium">{s.certification}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gray-500 flex-shrink-0">Schedule</span>
                      <span className="text-gray-700">{s.schedule}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Salary range</span>
                      <span className={`font-semibold ${c.icon}`}>{s.salary}</span>
                    </div>
                    <div className={`${c.bg} rounded-lg px-3 py-2 mt-2`}>
                      <p className={`text-xs ${c.badgeText}`}>{s.outlook}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── CPNP-PC VS CPNP-AC ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              CPNP-PC vs. CPNP-AC: Which Certification Opens Which Jobs
            </h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Both credentials are issued by the Pediatric Nursing Certification Board and demonstrate advanced pediatric clinical competency — but they are not interchangeable in the job market. Many employers specify which certification they require, and applying with the wrong one is a common rejection point that candidates rarely realize was the issue.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {certificationComparison.map((cert, index) => (
              <div
                key={index}
                className="bg-white border border-purple-200 rounded-2xl p-6"
              >
                <div className="inline-block bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
                  {cert.body}
                </div>
                <h3 className="font-bold text-gray-900 text-xl mb-4">{cert.cert}</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Clinical scope</p>
                    <p className="text-gray-600">{cert.scope}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Eligibility</p>
                    <p className="text-gray-600">{cert.eligibility}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Job categories it unlocks</p>
                    <p className="text-gray-600">{cert.jobsUnlocked}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Renewal cycle</p>
                    <p className="text-gray-600">{cert.renewalCycle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            A small number of positions — particularly at large academic children\'s hospitals — accept candidates who hold both certifications and prefer them for roles that bridge inpatient and outpatient care continuums.
          </p>
        </section>

        {/* ── SALARY TABLE ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Pediatric Nurse Practitioner Salaries by Setting — What the Market Is Paying
            </h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            PNP compensation varies more by practice setting than by geography in most regions of the country. The figures below reflect current advertised ranges and reported compensation data, with notes on additional pay components that frequently move total compensation well above the base salary figure.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Setting</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Entry</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Mid</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Senior</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Additional compensation</th>
                </tr>
              </thead>
              <tbody>
                {salaryData.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{row.role}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{row.low}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{row.mid}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-green-700">{row.high}</td>
                    <td className="px-4 py-4 text-xs text-gray-500 max-w-xs">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Salary data reflects 2024 to 2025 U.S. market figures. Metro markets in California, New York, Massachusetts, and Washington typically add 15 to 25 percent above these ranges. NHSC loan repayment eligibility in underserved areas can add the equivalent of $25,000 to $50,000 in after-tax value to primary care and school-based roles.
          </p>
        </section>

        {/* ── NLC COMPACT ── */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <MapPin className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div className="w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                The Nurse Licensure Compact and What It Means for Your PNP Job Search
              </h2>
              <p className="text-gray-700 mb-6">
                The enhanced Nurse Licensure Compact (eNLC) allows nurses with a home state compact license to practice in any other compact member state without a separate license. For pediatric nurse practitioners, compact participation is especially relevant for telehealth roles and locum tenens assignments — both of which frequently cross state lines.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Current compact member states (as of 2025)
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {nlcStates.compact.map((state) => (
                      <span
                        key={state}
                        className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded"
                      >
                        {state}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">{nlcStates.note}</p>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">
                    How compact status affects your search
                  </h3>
                  {[
                    {
                      point: 'Telehealth eligibility',
                      detail:
                        'Most telehealth PNP platforms require licensure in the state where the patient is physically located. Compact licensure allows you to cover patients across 40+ states from a single license.',
                    },
                    {
                      point: 'Locum tenens flexibility',
                      detail:
                        'Locum assignments across state lines are dramatically easier to accept with compact licensure. Single-state licensure can add weeks of delay and hundreds of dollars in fees per assignment.',
                    },
                    {
                      point: 'APRN compact is different from RN compact',
                      detail:
                        'The RN compact and APRN compact are separate agreements. Not all compact states include APRN-level practice — verify both your home state and destination state APRN compact status before accepting multi-state work.',
                    },
                  ].map((item, i) => (
                    <div key={i} className="bg-white rounded-lg p-4">
                      <p className="font-semibold text-gray-900 text-sm mb-1">{item.point}</p>
                      <p className="text-gray-600 text-sm">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── LOCUM TENENS ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Plane className="w-7 h-7 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Locum Tenens for Pediatric Nurse Practitioners — Higher Pay, Different Trade-Offs
            </h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Locum tenens assignments have become a mainstream career option for experienced PNPs, not just a stopgap between permanent roles. The pay premium is substantial, but the structure and demands are meaningfully different from permanent employment. Here is what the arrangement actually involves.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {locumTenensGuide.map((item, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.aspect}</h3>
                <p className="text-gray-600 text-sm">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CAREER PROGRESSION ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              PNP Career Stages — What to Prioritize at Each Level
            </h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            The decisions that matter most in a PNP career change significantly as experience accumulates. A framework that serves a new graduate badly — chasing the highest initial salary — often costs the clinical depth that eventually drives senior compensation. These three stages reflect how most successful PNP careers actually develop.
          </p>
          <div className="space-y-4">
            {careerProgression.map((stage, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 font-bold rounded-full text-sm flex-shrink-0">
                      {index + 1}
                    </span>
                    <h3 className="font-semibold text-gray-900 text-lg">{stage.stage}</h3>
                  </div>
                  <span className="font-semibold text-green-700 text-sm">{stage.compensation}</span>
                </div>
                <p className="text-gray-600 text-sm pl-11 mb-2">{stage.focus}</p>
                <div className="pl-11">
                  <span className="inline-block bg-purple-50 text-purple-700 text-xs font-medium px-2 py-1 rounded">
                    Priority: {stage.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SIGN-ON BONUSES ── */}
        <section className="mt-20">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <FileText className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Sign-On Bonuses for PNP Roles — What Is Available and What to Watch For
                </h2>
                <p className="text-gray-700 mb-6">
                  Sign-on bonuses have become a standard feature of PNP recruitment in high-demand settings. They are also one of the most frequently misunderstood elements of an employment package. Understanding how bonuses are structured — and what repayment obligations they carry — matters as much as the headline dollar amount.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    {
                      label: 'Inpatient / PICU roles',
                      range: '$15,000–$30,000',
                      context:
                        'Highest bonuses in the PNP market. Driven by acute nationwide shortages of CPNP-AC certified practitioners willing to work nights and rotating shifts.',
                    },
                    {
                      label: 'Pediatric urgent care chains',
                      range: '$10,000–$20,000',
                      context:
                        'Major chains including PM Pediatrics advertise consistent sign-on packages. Evening and weekend availability increases bonus size at most locations.',
                    },
                    {
                      label: 'Rural primary care / FQHCs',
                      range: '$5,000–$15,000 + NHSC',
                      context:
                        'Cash bonus tends to be lower, but NHSC loan repayment programs can add $50,000 in value over two years of service in qualifying underserved areas.',
                    },
                    {
                      label: 'Academic children\'s hospitals',
                      range: '$10,000–$25,000',
                      context:
                        'Bonuses appear for specialty and subspecialty roles. General inpatient roles at academic centers may offer lower bonuses but higher base and RVU compensation structures.',
                    },
                    {
                      label: 'Telehealth platforms',
                      range: '$3,000–$10,000',
                      context:
                        'Smaller bonuses than inpatient settings, but the fully remote structure and flexible scheduling offset part of the cash differential for many candidates.',
                    },
                    {
                      label: 'Repayment clause: what to check',
                      range: 'Repayment risk',
                      context:
                        'Most bonuses carry a 12 to 24 month service commitment with prorated repayment if you leave early. Clarify whether repayment is gross or net-of-tax, and whether it applies to voluntary departure only or also involuntary termination.',
                    },
                  ].map((item, i) => (
                    <div key={i} className="bg-white rounded-lg p-4">
                      <p className="font-semibold text-gray-900 text-sm mb-1">{item.label}</p>
                      <p className="text-amber-700 font-bold text-sm mb-2">{item.range}</p>
                      <p className="text-gray-600 text-xs">{item.context}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── GEOGRAPHIC DEMAND ── */}
        <section className="mt-20">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <ShieldCheck className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Where PNP Demand Is Strongest — Geographic Markets to Know
                </h2>
                <p className="text-gray-700 mb-6">
                  Pediatric nurse practitioner shortages are nationwide, but the severity and character of the gap vary by region. Understanding where demand is most acute helps you evaluate leverage — particularly when negotiating compensation, sign-on terms, or relocation packages.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    {
                      region: 'Texas, Florida, and Georgia',
                      detail:
                        'High absolute volume of open roles driven by pediatric population size and rapid urban and suburban growth. Urban urgent care and inpatient roles are the most numerous, but rural markets within these states face the sharpest shortages on a per-child basis.',
                    },
                    {
                      region: 'Rural Mountain West and Great Plains',
                      detail:
                        'Montana, Wyoming, South Dakota, and North Dakota have the highest per-capita PNP shortages in the country. NHSC loan repayment eligibility is nearly universal in these markets. Sign-on bonuses are strong, and the competitive pool of applicants is thin.',
                    },
                    {
                      region: 'Northeast Corridor',
                      detail:
                        'New York, New Jersey, Massachusetts, and Pennsylvania offer the highest absolute salaries — particularly at academic children\'s hospitals and large health systems. Competition for these roles is stronger, and credentialing timelines can be lengthy due to state licensing complexity.',
                    },
                    {
                      region: 'Pacific Coast and Southwest',
                      detail:
                        'California and Washington offer strong compensation and large employer networks. California does not participate in the compact, which limits multi-state telehealth and locum flexibility but does not affect permanent in-state roles. Arizona and Nevada offer growing markets with compact licensure portability.',
                    },
                  ].map((item, i) => (
                    <div key={i} className="bg-white rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 text-sm mb-2">{item.region}</h3>
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
            <AlertCircle className="w-7 h-7 text-gray-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Frequently Asked Questions About Pediatric Nurse Practitioner Jobs
            </h2>
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

        {/* ── DISCLAIMER ── */}
        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> Salary figures, licensure compact membership, and sign-on bonus ranges on this page are based on publicly available job postings and industry reporting as of 2024 to 2025. Licensure compact participation and state-specific APRN regulations change periodically. Always verify current requirements through the NCSBN, your state board of nursing, and the specific employer before accepting any position. Oh My Job is not affiliated with any healthcare employer and does not guarantee employment outcomes.
          </p>
        </section>
      </div>
    </>
  )
}