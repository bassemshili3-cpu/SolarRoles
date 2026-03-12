import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, DollarSign, CheckCircle, Shield, Clock, Users, TrendingUp, FileText, Award, Star, AlertTriangle } from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'

export const metadata: Metadata = {
  title: 'Urgent Demand for Case Manager Professionals | Hiring Immediately',
  description: 'Case manager positions are critically needed across the US! Browse 1,000+ immediate openings in healthcare, social services, mental health, and insurance. Competitive salaries, meaningful work, and strong career growth. Apply today!',
  keywords: 'case manager jobs, case management jobs, healthcare case manager, social work case manager, mental health case manager, insurance case manager jobs, case manager hiring now, care coordinator jobs',
  openGraph: {
    title: 'Urgent Demand for Case Manager Professionals | Apply Now',
    description: 'Hospitals, agencies, and insurers across the US urgently need case managers. 1,000+ openings in healthcare, social services, and mental health. Competitive pay and benefits. Apply now!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Case Manager Jobs | Urgently Hiring Nationwide',
    description: 'Urgent openings for case managers across healthcare, social work, and insurance sectors. Strong salaries, remote options, and career growth. Find your role today.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/case-manager-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Case Manager Jobs',
  description: 'Find case manager jobs hiring now across the United States. Browse openings in healthcare, social services, mental health, insurance, and government settings.',
  url: 'https://www.oh-my-job.com/case-manager-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Case Manager Job Opportunities',
    description: 'Current case manager job listings across healthcare, social work, and human services settings in the United States',
  },
}

const caseManagerRoles = [
  {
    title: 'Healthcare Case Manager',
    description: 'Coordinate patient care across hospital, outpatient, and post acute settings to ensure safe transitions and optimal health outcomes',
    icon: Shield,
  },
  {
    title: 'Social Work Case Manager',
    description: 'Assess client needs, connect individuals and families with community resources, and advocate for vulnerable populations',
    icon: Users,
  },
  {
    title: 'Mental Health Case Manager',
    description: 'Support individuals with psychiatric conditions in accessing treatment, housing, employment, and community integration services',
    icon: Star,
  },
  {
    title: 'Insurance and Utilization Review Case Manager',
    description: 'Review medical necessity, authorize care, and manage costs for health insurance and managed care organizations',
    icon: FileText,
  },
  {
    title: 'Substance Use and Recovery Case Manager',
    description: 'Guide clients through treatment programs, relapse prevention, and long term recovery planning and support',
    icon: CheckCircle,
  },
  {
    title: 'Child Welfare Case Manager',
    description: 'Investigate reports of abuse or neglect, develop safety plans, and manage foster care and family reunification cases',
    icon: Briefcase,
  },
]

const keyDuties = [
  'Conduct comprehensive assessments of client needs, strengths, and barriers',
  'Develop individualized care or service plans in collaboration with clients and families',
  'Coordinate referrals to medical, behavioral, housing, and social service providers',
  'Monitor client progress and adjust plans based on changing needs',
  'Advocate for clients within healthcare, legal, and government systems',
  'Maintain accurate and compliant case documentation and records',
  'Facilitate discharge planning and transitions between care settings',
  'Collaborate with multidisciplinary teams including physicians, therapists, and social workers',
]

const salaryData = [
  { role: 'Healthcare Case Manager (RN)', low: '$65,000', high: '$105,000', median: '$82,000' },
  { role: 'Social Work Case Manager (MSW)', low: '$45,000', high: '$72,000', median: '$56,000' },
  { role: 'Mental Health Case Manager', low: '$40,000', high: '$68,000', median: '$52,000' },
  { role: 'Insurance Case Manager', low: '$58,000', high: '$95,000', median: '$74,000' },
  { role: 'Child Welfare Case Manager', low: '$38,000', high: '$62,000', median: '$48,000' },
  { role: 'Care Coordinator', low: '$42,000', high: '$70,000', median: '$54,000' },
]

const topEmployers = [
  { name: 'UnitedHealth Group', type: 'Health Insurance', positions: 'Case Manager RN, Utilization Review Nurse, Care Coordinator' },
  { name: 'Aetna / CVS Health', type: 'Health Insurance', positions: 'Clinical Case Manager, Behavioral Health Case Manager' },
  { name: 'HCA Healthcare', type: 'Hospital System', positions: 'Inpatient Case Manager, Discharge Planner, Social Work CM' },
  { name: 'State and County DSS Agencies', type: 'Government', positions: 'Child Welfare CM, Adult Protective Services, Benefits CM' },
  { name: 'Molina Healthcare', type: 'Managed Care', positions: 'Field Case Manager, Complex Case Manager, LTSS Coordinator' },
  { name: 'Acacia Network / Community Agencies', type: 'Nonprofit', positions: 'Mental Health CM, Housing CM, Substance Use CM' },
]

const certifications = [
  {
    name: 'Certified Case Manager (CCM)',
    issuer: 'Commission for Case Manager Certification (CCMC)',
    description: 'The gold standard credential in the case management field, recognized across healthcare, insurance, and social services. According to CCMC, CCM certified professionals demonstrate advanced competency in case management practice and ethics.',
  },
  {
    name: 'Accredited Case Manager (ACM)',
    issuer: 'American Case Management Association (ACMA)',
    description: 'Designed specifically for hospital and health system case managers, this credential validates expertise in care transitions, discharge planning, and utilization management.',
  },
  {
    name: 'Licensed Clinical Social Worker (LCSW)',
    issuer: 'State Boards of Social Work (varies by state)',
    description: 'Required for clinical case management roles in mental health and social services. According to the U.S. Bureau of Labor Statistics, LCSW licensure significantly increases earning potential and eligibility for supervisory roles.',
  },
  {
    name: 'Registered Nurse (RN) License',
    issuer: 'National Council of State Boards of Nursing (NCSBN)',
    description: 'Required for healthcare and insurance case manager roles that involve clinical assessments, utilization review, and care coordination in medical settings. RN case managers are among the highest paid in the profession.',
  },
]

const faqs = [
  {
    question: 'What does a case manager do?',
    answer: 'According to O*NET OnLine, managed by the U.S. Department of Labor, case managers assess client needs, coordinate services, develop care plans, and advocate for individuals to help them navigate complex healthcare, social service, or legal systems. The role spans many sectors including hospitals, insurance companies, government agencies, nonprofit organizations, and community mental health centers.',
  },
  {
    question: 'What qualifications are needed to become a case manager?',
    answer: 'Requirements vary by sector. Healthcare case manager positions typically require a bachelor\'s or master\'s degree in nursing or social work, plus relevant licensure. Social services case managers generally need at minimum a bachelor\'s degree in social work, psychology, or a related field. According to the U.S. Bureau of Labor Statistics, a master\'s degree in social work (MSW) is increasingly preferred for clinical and supervisory roles.',
  },
  {
    question: 'How much do case managers earn?',
    answer: 'According to the U.S. Bureau of Labor Statistics Occupational Employment and Wage Statistics program, median annual salaries for case managers range from approximately $48,000 for child welfare roles to over $82,000 for RN case managers in healthcare and insurance. Geographic location, sector, and credentials such as the CCM or LCSW significantly influence compensation.',
  },
  {
    question: 'Can case managers work remotely?',
    answer: 'Yes, many case manager roles now offer remote or hybrid work options, particularly in the insurance and managed care sectors. According to job market data from the U.S. Department of Labor, telephonic and virtual case management expanded significantly following the COVID 19 pandemic and has remained a permanent feature of many employer offerings, especially at national health insurers.',
  },
  {
    question: 'Is case management a growing field?',
    answer: 'Yes. According to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, employment of social workers and health services managers is projected to grow faster than the average for all occupations through 2032, driven by an aging population, expanding behavioral health needs, and increasing complexity of healthcare delivery. Case managers are central to managing these demands efficiently.',
  },
  {
    question: 'What is the difference between a case manager and a care coordinator?',
    answer: 'The titles are often used interchangeably, but in practice a case manager typically handles more complex, long term, or high acuity cases involving multiple systems, while a care coordinator generally focuses on scheduling, referrals, and follow up within a single care setting. Both roles are in high demand and share a foundation in patient advocacy and service coordination.',
  },
]

const applicationTips = [
  {
    title: 'Pursue the CCM Certification',
    description: 'The Certified Case Manager (CCM) credential issued by the Commission for Case Manager Certification is the most recognized in the field. Holding the CCM opens doors to higher paying roles in insurance, healthcare systems, and managed care organizations and demonstrates national competency standards.',
  },
  {
    title: 'Tailor Your Application to the Sector',
    description: 'Case management varies significantly between healthcare, child welfare, insurance, and community services. Customize your resume to highlight the most relevant experience for each sector. Clinical metrics, caseload sizes, and outcomes data are especially valued by healthcare and insurance employers.',
  },
  {
    title: 'Highlight Technology and Documentation Skills',
    description: 'Most case manager roles require proficiency in electronic health records (EHR) systems such as Epic or Cerner, or case management platforms like Salesforce Health Cloud. Demonstrating comfort with these tools significantly strengthens your candidacy in a field that increasingly relies on data driven care coordination.',
  },
  {
    title: 'Showcase Advocacy and Outcome Achievements',
    description: 'Employers value case managers who can demonstrate measurable impact. Quantify your results where possible, such as readmission reduction rates, successful housing placements, or percentage of caseload achieving treatment goals. Concrete outcomes set strong candidates apart.',
  },
]

export default async function CaseManagerJobsPage({ searchParams }: any) {
  const params = await searchParams

const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'case manager', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'case manager', where: params.where || '', results_per_page: 30, page: 1 })
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
            Case Manager Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="case manager" />
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
            <h2 className="text-2xl font-bold text-gray-900">Types of Case Manager Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics, case managers work across a broad spectrum of industries and populations. From coordinating post acute care for hospital patients to managing housing placements for homeless individuals, the scope of case management is as diverse as the communities it serves.
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Core Responsibilities of a Case Manager</h2>
                <p className="text-gray-700 mb-5">
                  According to O*NET OnLine, managed by the U.S. Department of Labor, case managers perform a consistent set of core functions regardless of sector. Understanding these duties helps applicants demonstrate alignment with employer expectations from the first interaction.
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
            <h2 className="text-2xl font-bold text-gray-900">Case Manager Salaries by Specialization</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics Occupational Employment and Wage Statistics (OEWS) program, case manager compensation varies widely by setting, credentials, and geographic location. The following figures reflect approximate annual salary ranges across common case management specializations.
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 font-semibold text-gray-900">Role</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-900">Low End</th>
                  <th className="text-center px-6 py-4 font-semibold text-green-700">Median</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-900">High End</th>
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
            Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics. Figures are approximate annual salary ranges and may vary by state, employer, and credential level.
          </p>
        </section>

        {/* Top Employers */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Who Hires Case Managers?</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Case managers are employed across a wide range of organizations, from national health insurers to county government agencies and community nonprofits. The following represent some of the most active employers of case management talent in the United States.
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
            <h2 className="text-2xl font-bold text-gray-900">Key Certifications for Case Managers</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Earning a recognized case management credential significantly increases your earning potential and opens access to senior and specialized roles. The following certifications are the most widely recognized by employers across healthcare, insurance, and social services.
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
            <h2 className="text-2xl font-bold text-gray-900">Career Growth in Case Management</h2>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, employment in social work and health services management is projected to grow significantly faster than the national average through 2032. Case management offers clearly defined advancement pathways, with opportunities in clinical leadership, program management, and policy.
            </p>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { step: '1', title: 'Case Manager', desc: 'Direct service and care coordination with individual clients' },
                { step: '2', title: 'Senior Case Manager', desc: 'Complex case oversight and peer consultation' },
                { step: '3', title: 'Case Management Supervisor', desc: 'Team leadership, quality review, and caseload management' },
                { step: '4', title: 'Director of Case Management', desc: 'Program strategy, compliance, and organizational leadership' },
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
            <h2 className="text-2xl font-bold text-gray-900">Remote and Hybrid Case Manager Opportunities</h2>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              Case management is one of the healthcare professions most amenable to remote work. According to the U.S. Department of Labor, telephonic and virtual case management expanded dramatically after 2020 and has become a permanent feature of the field, particularly in managed care, insurance utilization review, and behavioral health coordination.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Roles Most Often Remote</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Insurance utilization review and prior authorization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Telephonic disease management and chronic care coordination</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Behavioral health and substance use case management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Workers compensation and disability case management</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Roles Typically On Site</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Hospital inpatient discharge planning and transitions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Child welfare and protective services field work</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Homeless services and housing first programs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Community mental health assertive outreach teams</span>
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
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing a Case Manager Job</h2>
          </div>
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Case Manager Jobs</h2>
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
            <strong>Disclaimer:</strong> The salary figures, employment projections, and occupational data cited on this page are sourced from publicly available reports by the U.S. Bureau of Labor Statistics, the U.S. Department of Labor, and O*NET OnLine. Actual wages and job availability may vary by location, employer, credential level, and sector. Oh My Job is an independent job search platform and aggregates listings from third party sources. Always verify job details, qualifications, and compensation directly with the hiring organization before applying.
          </p>
        </section>
      </div>
    </>
  )
}