import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, DollarSign, CheckCircle, Shield, Clock, Users, TrendingUp, FileText, Award, Star, AlertTriangle } from 'lucide-react'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna

export const metadata: Metadata = {
  title: 'Case Manager Jobs — Clinical, Social Work & Remote Openings Near You',
  description: 'Case manager roles in hospitals, managed care, behavioral health, and child welfare. Filter by license type, salary, and remote eligibility.',
  keywords: 'case-manager-jobs, clinical case manager openings, remote case management, RN case manager hiring, LCSW case manager, utilization review careers, care coordinator positions',
  openGraph: {
    title: 'Case Manager Jobs: RN, LCSW & Non-Clinical Roles Hiring Now | Oh My Job',
    description: 'Search case-manager-jobs across every care setting — acute inpatient, telephonic UR, foster care, and substance-abuse recovery. Compare salaries and apply in minutes.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Case Manager Jobs — Hospital, Insurance & Community Openings',
    description: 'Thousands of case-manager-jobs updated this week. Find your niche by license, setting, and work model — on-site, hybrid, or fully remote.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/case-manager-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Case Manager Jobs Board',
  description: 'Daily-updated feed of case-manager-jobs spanning clinical healthcare, insurance utilization review, behavioral health, and community social services across all US states.',
  url: 'https://www.oh-my-job.com/case-manager-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Active Case Manager Job Listings',
    description: 'Searchable directory of case-manager-jobs from entry-level community coordinators to director-level utilization management positions.',
  },
}

const caseManagerRoles = [
  {
    title: 'Acute-Care Hospital Case Manager',
    description: 'Work inside the discharge-planning engine of a hospital, reviewing length-of-stay data, coordinating post-acute placements, and running daily interdisciplinary rounds with physicians and social workers.',
    icon: Shield,
  },
  {
    title: 'Community & Social Services Case Manager',
    description: 'Carry a caseload of individuals facing housing instability, food insecurity, or domestic-violence situations — connecting them to public benefits, shelters, and legal-aid resources.',
    icon: Users,
  },
  {
    title: 'Behavioral Health Case Manager',
    description: 'Support clients living with serious mental illness or co-occurring disorders by coordinating outpatient therapy, medication management, and crisis-safety planning across providers.',
    icon: Star,
  },
  {
    title: 'Utilization Review / Managed Care Case Manager',
    description: 'Sit on the payer side evaluating medical-necessity requests, applying InterQual or Milliman criteria, and negotiating continued-stay authorizations with hospital teams.',
    icon: FileText,
  },
  {
    title: 'Substance Use Disorder Recovery Coordinator',
    description: 'Guide clients through the continuum from medically supervised detox to intensive outpatient programming, tracking relapse indicators and adjusting care plans in real time.',
    icon: CheckCircle,
  },
  {
    title: 'Child Welfare & Protective Services Case Manager',
    description: 'Investigate referrals, conduct home-safety evaluations, manage foster-care placements, and prepare court reports that directly influence custody and reunification decisions.',
    icon: Briefcase,
  },
]

const keyDuties = [
  'Conduct intake interviews that capture medical history, psychosocial stressors, and immediate safety concerns in a single structured session',
  'Build individualized care plans with measurable goals, realistic timelines, and contingency steps for when circumstances change',
  'Broker referrals across fragmented provider networks — scheduling specialist appointments, DME deliveries, and home-health visits in sequence',
  'Track client progress through scheduled reassessments and adjust interventions before small setbacks become costly readmissions',
  'Advocate on behalf of patients or clients when insurance denials, housing waitlists, or system gaps threaten their care continuity',
  'Document every encounter, authorization, and outcome in the EHR with enough detail to satisfy both clinical audits and billing compliance',
  'Facilitate multidisciplinary team meetings that align physicians, therapists, family members, and payers around a shared discharge or recovery goal',
  'Coordinate day-of-discharge logistics — transportation, medication reconciliation, follow-up scheduling — so no patient leaves without a next step',
]

const salaryData = [
  { role: 'RN Hospital Case Manager', low: '$65,000', high: '$108,000', median: '$83,000' },
  { role: 'Licensed Clinical Social Worker (LCSW)', low: '$48,000', high: '$78,000', median: '$60,000' },
  { role: 'Psychiatric / Behavioral Health CM', low: '$44,000', high: '$72,000', median: '$55,000' },
  { role: 'Managed Care / UR Case Manager', low: '$62,000', high: '$98,000', median: '$76,000' },
  { role: 'Child Welfare Case Manager', low: '$38,000', high: '$62,000', median: '$48,000' },
  { role: 'Community Health Coordinator', low: '$42,000', high: '$68,000', median: '$53,000' },
]

const topEmployers = [
  { name: 'Centene Corporation', type: 'Medicaid Managed Care', positions: 'Telephonic UR Nurse, Behavioral Health Care Coordinator' },
  { name: 'Elevance Health (Anthem)', type: 'Commercial & Medicare Plans', positions: 'Complex Case Manager RN, Prior-Auth Clinical Reviewer' },
  { name: 'Kaiser Permanente', type: 'Integrated Health System', positions: 'Inpatient Transition Planner, Oncology Navigation Case Manager' },
  { name: 'Veterans Health Administration', type: 'Federal Government', positions: 'HUD-VASH Housing Case Manager, PTSD Recovery Coordinator' },
  { name: 'Humana', type: 'Medicare Advantage Insurer', positions: 'Field-Based Assessment RN, Chronic-Condition Telephonic CM' },
  { name: 'County DCFS / DHS Agencies', type: 'State & Local Government', positions: 'Protective-Services Investigator, Foster-Care Permanency Planner' },
]

const certifications = [
  {
    name: 'Certified Case Manager (CCM)',
    issuer: 'Commission for Case Manager Certification',
    description: 'The most broadly recognized credential in the field. Eligibility requires a qualifying license or degree plus 12 months of supervised case-management experience. Passing the 180-question exam signals mastery of care delivery, reimbursement, and ethical practice — and typically adds $5K-$10K to base salary offers.',
  },
  {
    name: 'Accredited Case Manager (ACM)',
    issuer: 'American Case Management Association',
    description: 'Purpose-built for hospital and health-system professionals. The ACM emphasizes transitions-of-care methodology, readmission-risk scoring, and payor-navigation skills that are tested daily on inpatient units — making it the go-to certification for acute-care case managers.',
  },
  {
    name: 'Nursing Case Management (RN-BC)',
    issuer: 'American Nurses Credentialing Center',
    description: 'Exclusively available to registered nurses with 2,000+ hours of case-management practice. Validates advanced competencies in patient education, population-health stratification, and interprofessional collaboration inside complex clinical environments.',
  },
  {
    name: 'Certified Managed Care Nurse (CMCN)',
    issuer: 'American Board of Managed Care Nursing',
    description: 'Targets RNs working inside HMOs, PPOs, and Medicare Advantage plans. Exam content centers on utilization management regulations, claims adjudication logic, and the financial architecture of risk-based contracts — knowledge that directly translates into higher-paying payer-side roles.',
  },
]

const faqs = [
  {
    question: 'Why are case-manager-jobs growing faster than most healthcare roles?',
    answer: 'The shift to value-based reimbursement means hospitals and insurers lose revenue when patients are readmitted or receive unnecessary services. Case managers are the frontline defense against both outcomes — coordinating transitions, flagging high-risk patients early, and ensuring follow-up happens. As more contracts tie payment to quality metrics rather than volume, the demand for skilled coordinators keeps climbing.',
  },
  {
    question: 'Can I work as a case manager without a nursing license?',
    answer: 'Yes. Clinical hospital and UR roles typically require an RN or LCSW, but a large share of case-manager-jobs — particularly in child welfare, housing assistance, substance-use recovery, and disability services — are open to candidates with a bachelor\'s in social work, psychology, or a related human-services field. Some community agencies hire with no degree at all if you bring relevant lived or volunteer experience.',
  },
  {
    question: 'How is telehealth changing the day-to-day of case management?',
    answer: 'Payer-side and chronic-disease case managers now conduct the majority of their assessments by phone or video, which eliminated geography as a hiring constraint. That said, telehealth also raised documentation expectations — insurers want timestamped call logs, screen-captured consent forms, and EHR entries completed in real time. The workload did not shrink; it shifted from driving between client homes to navigating multiple software platforms simultaneously.',
  },
  {
    question: 'What is the single fastest way to raise my salary in this field?',
    answer: 'Earn the CCM certification and move from a nonprofit or government role into managed care. Payer-side case-manager-jobs at companies like Centene, Elevance, or Humana consistently pay 20-40% more than equivalent positions at community agencies, and the CCM is the credential most hiring managers filter for when filling those seats.',
  },
  {
    question: 'Will employers hire new graduates into case management?',
    answer: 'Community mental-health centers, county child-welfare agencies, and substance-abuse treatment programs regularly hire BSW and MSW graduates with no prior case-management experience. These organizations provide structured supervision and on-the-job training. Acute-care hospital roles are harder to land out of school — most require at least one to two years of clinical or social-work practice before you qualify.',
  },
  {
    question: 'Which soft skills actually separate top-performing case managers from average ones?',
    answer: 'The ability to sit with ambiguity and stay effective. Caseloads rarely go according to plan — a housing placement falls through, a client relapses, an insurer denies a critical authorization. The case managers who last and advance are those who can absorb those setbacks without emotional burnout, pivot quickly, and maintain trust with clients who have every reason to distrust the system.',
  },
]

const applicationTips = [
  {
    title: 'Put Outcomes on Your Resume, Not Just Tasks',
    description: 'Every hiring manager knows case managers "coordinate care." What catches their eye is proof of impact: a 12% reduction in 30-day readmissions, 90+ clients housed in a fiscal year, or an average discharge turnaround time that beat the unit benchmark. Numbers get interviews.',
  },
  {
    title: 'Name the EHR Platforms You Know',
    description: 'Epic, Cerner, Netsmart, and Salesforce Health Cloud each have different workflows. Listing your proficiency by name saves the employer weeks of onboarding — and for remote case-manager-jobs, EHR fluency is often a hard prerequisite because there is no one sitting next to you to troubleshoot.',
  },
  {
    title: 'Prove You Can Translate Between Audiences',
    description: 'A case manager speaks doctor on morning rounds, speaks insurance on an afternoon peer-to-peer call, and speaks human when a frightened family asks what happens next. Your cover letter should demonstrate that range — show one example where you bridged a communication gap that changed an outcome.',
  },
  {
    title: 'Tailor Keywords for Remote Applications',
    description: 'If you are targeting remote case-manager-jobs at large insurers, their ATS will scan for terms like "telephonic assessment," "virtual care coordination," "InterQual criteria," and "autonomous caseload management." Mirror the exact phrasing from the job posting — synonym creativity hurts you here.',
  },
]

export default async function CaseManagerJobsPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'case manager', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'case manager', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
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
            Case Manager Jobs — Clinical, Insurance, Social Services & Remote Openings
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="case manager" />
          </aside>
          <div className="flex-1">

            <AIJobMatcherWrapper />

            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'case manager'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Types of Case Manager Roles */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Six Distinct Tracks Within Case Manager Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            "Case manager" is an umbrella title that covers radically different day-to-day realities depending on the setting. An RN reviewing length-of-stay data in a hospital shares a job title with a social worker conducting home visits for child-protective services — yet the skills, licenses, and emotional demands barely overlap. Understanding which track matches your background and tolerance for ambiguity is the first step to a sustainable career in case-manager-jobs.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caseManagerRoles.map((role, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <role.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Key Duties */}
        <section className="mt-20">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What Case Managers Do on a Typical Day</h2>
                <p className="text-gray-700 mb-5">
                  Regardless of whether you sit in a hospital war room or work from a home office reviewing insurance claims, these eight responsibilities form the operational core of nearly every case-manager-jobs listing you will encounter. Mastering them is what separates a coordinator who clears tasks from a case manager who actually changes outcomes.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {keyDuties.map((duty, index) => (
                    <div key={index} className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{duty}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Salary Data */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">What Case Manager Jobs Pay by Specialty</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Salary spread in case-manager-jobs is unusually wide because the field spans government-funded social services at one end and corporate insurance at the other. The single biggest pay lever is your license: an RN doing utilization review for a national insurer can earn double what a BSW-level child-welfare worker takes home in the same metro. The table below breaks down national ranges by specialty so you can benchmark before negotiating.
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 font-semibold text-gray-900">Specialty Role</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-900">Entry Level</th>
                  <th className="text-center px-6 py-4 font-semibold text-green-700">National Median</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-900">Senior Level</th>
                </tr>
              </thead>
              <tbody>
                {salaryData.map((row, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{row.role}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{row.low}</td>
                    <td className="px-6 py-4 text-center font-bold text-green-600">{row.median}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{row.high}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Ranges derived from BLS Occupational Employment & Wage Statistics and verified employer-reported data. Actual offers vary by metro cost-of-living, employer type (nonprofit vs. payer vs. health system), and individual negotiation.
          </p>
        </section>

        {/* Top Employers */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Who Hires the Most Case Managers — and Why It Matters</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The employer behind a case-manager-jobs listing shapes everything from your caseload size to your earning ceiling. Managed-care insurers offer the highest base salaries and remote flexibility but expect high-volume telephonic throughput. Health systems pay well and give you clinical variety, yet almost always require on-site presence. Government and nonprofit agencies provide mission-driven work and public-sector benefits, often at lower base pay. Knowing the trade-offs helps you target the right column.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {topEmployers.map((employer, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{employer.name}</p>
                <span className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full mb-2">{employer.type}</span>
                <p className="text-gray-600 text-sm">{employer.positions}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-amber-600" />
            <h2 className="text-2xl font-bold text-gray-900">Certifications That Move the Needle on Case Manager Job Offers</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            In a field where most applicants hold the same degree and license, a nationally recognized certification is the clearest tiebreaker. Each credential below targets a different slice of case-manager-jobs — choose the one that aligns with the setting you want to work in, not just the one with the most name recognition.
          </p>
          <div className="space-y-4">
            {certifications.map((cert, index) => (
              <div key={index} className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <Award className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-0.5">{cert.name}</p>
                    <p className="text-xs text-amber-700 font-medium mb-2">Issued by: {cert.issuer}</p>
                    <p className="text-gray-600 text-sm">{cert.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Career Growth */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-teal-600" />
            <h2 className="text-2xl font-bold text-gray-900">Where Case Manager Jobs Lead Over a 10-Year Career</h2>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              Case management is one of the few healthcare disciplines where you can start with a generalist caseload and, within a decade, sit in a director-level seat influencing hospital-wide policy and seven-figure budgets. The progression is not automatic — it requires stacking certifications, building a track record of measurable outcomes, and eventually choosing between the clinical-expert track and the operations-leadership track. Here is how the ladder typically unfolds.
            </p>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { step: '1', title: 'Generalist Case Manager', desc: 'Carry a mixed caseload, learn the EHR inside-out, and build your referral network across providers, payers, and community agencies.' },
                { step: '2', title: 'Complex-Care or Specialty CM', desc: 'Manage high-acuity patients with multiple chronic conditions or behavioral-health overlays — the cases that require the deepest clinical judgment.' },
                { step: '3', title: 'Team Lead / Clinical Supervisor', desc: 'Oversee a pod of five to ten case managers, audit documentation quality, run performance huddles, and serve as the escalation point for denied authorizations.' },
                { step: '4', title: 'Director of Care Management', desc: 'Own the department P&L, set readmission-reduction targets, negotiate payer contracts alongside finance, and present utilization data to the C-suite.' },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Remote Work Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Remote vs. On-Site: Knowing Which Case Manager Jobs Go Where</h2>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              The telehealth acceleration permanently split case-manager-jobs into two camps. Payer-side utilization review and chronic-disease coaching migrated almost entirely to remote models — insurers discovered they could hire experienced RNs in lower-cost states and maintain the same throughput. Meanwhile, hospital discharge planning, child-protective fieldwork, and in-person behavioral-health support stayed firmly on-site because the work depends on physical presence. Before you apply, confirm which camp the listing falls into — the interview process, schedule expectations, and tech requirements differ sharply.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Roles That Are Typically Remote</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Insurance prior-authorization and concurrent-review nursing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Telephonic chronic-condition coaching (diabetes, CHF, COPD programs)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Workers' compensation and disability-claims case management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Virtual behavioral-health follow-up and medication-adherence calls</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Roles That Require Physical Presence</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Hospital inpatient rounding, discharge coordination, and ER diversion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Child-protective-services home investigations and court testimony</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Street outreach for unhoused individuals and mobile crisis teams</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Skilled-nursing and long-term-care facility assessments</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Application Tips */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-7 h-7 text-rose-600" />
            <h2 className="text-2xl font-bold text-gray-900">Four Moves That Land Case Manager Job Interviews</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Case-manager-jobs attract dozens of qualified applicants per posting — especially remote roles at national insurers. The candidates who consistently land interviews do four specific things that the rest skip. Here is the playbook.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {applicationTips.map((tip, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-rose-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-rose-100 text-rose-700 font-bold rounded-full text-sm mb-4">
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
            <h2 className="text-2xl font-bold text-gray-900">Case Manager Jobs — Straight Answers to Common Questions</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Whether you are a new-grad social worker weighing your first offer or an experienced RN exploring the payer side, these are the questions that come up most when people research case-manager-jobs online.
          </p>
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
            <strong>Disclaimer:</strong> Salary ranges, role descriptions, and labor-market projections on this page are drawn from BLS Occupational Employment & Wage Statistics, O*NET OnLine, and employer-reported data. Actual compensation for case-manager-jobs depends on your license type, geographic market, employer sector, and individual negotiation. Oh My Job is an independent job search platform — always verify credential requirements and offer terms directly with the hiring organization before accepting a position.
          </p>
        </section>
      </div>
    </>
  )
}