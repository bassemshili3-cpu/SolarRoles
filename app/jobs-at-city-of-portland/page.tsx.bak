import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
import {
  Briefcase,
  Clock,
  Shield,
  FileText,
  DollarSign,
  MapPin,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Users,
  Building2,
  TrendingUp,
  Star,
  ChevronRight,
} from 'lucide-react'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'City of Portland Jobs | Municipal & Government Openings',
  description: 'Portland bureau roles spanning transportation, water, housing, and parks. Union-backed positions with Oregon PERS retirement and strong salary transparency.',
  keywords: 'jobs at city of portland, city of portland jobs, portland municipal jobs, city of portland hiring, portland government jobs, city of portland careers, portland oregon city jobs',
  openGraph: {
    title: 'City of Portland Jobs | Bureau Positions & Public Roles',
    description: 'Explore current City of Portland job openings. From public works to parks, administrative to public safety — Portland is actively hiring across all departments.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'City of Portland Jobs | All Bureaus & Departments',
    description: 'Portland municipal positions open across multiple bureaus. Strong benefits, union protections, and career growth. Search available roles today.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/jobs-at-city-of-portland',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Jobs at City of Portland',
  description: 'Browse current job openings at the City of Portland. Municipal positions across all bureaus with competitive pay and full benefits.',
  url: 'https://www.oh-my-job.com/jobs-at-city-of-portland',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Jobs at City of Portland',
    description: 'Current City of Portland job listings across all municipal departments and bureaus',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I apply for a job at the City of Portland?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Applications for City of Portland positions are submitted through the city\'s online recruitment portal. Most roles require a city-specific application form, a cover letter, and a resume. Some classifications also require supplemental questionnaires. Civil service positions may include written exams or performance assessments as part of the selection process.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does the City of Portland offer union representation?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The majority of City of Portland employees are represented by one of several bargaining units, including the District Council of Trade Unions, the Portland Police Association, the Portland Fire Fighters Association, and the Professional Technical Employees union. Union membership provides collective bargaining rights, grievance procedures, and negotiated wage schedules.',
      },
    },
    {
      '@type': 'Question',
      name: 'What benefits does the City of Portland offer employees?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'City of Portland employees receive a comprehensive benefits package that includes medical, dental, and vision coverage, enrollment in the Oregon Public Employees Retirement System (PERS), paid vacation and sick leave, an Employee Assistance Program, and access to professional development resources. Some classifications also include a deferred compensation plan.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is a civil service position at the City of Portland?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Civil service positions are regulated by the City Charter and require candidates to pass a merit-based examination process. These roles offer enhanced job protections and are governed by the City\'s Human Resources administrative rules. Exempt positions operate outside civil service rules and are appointed by bureau directors or elected officials.',
      },
    },
    {
      '@type': 'Question',
      name: 'How has Portland\'s new city government structure affected hiring?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Portland\'s new charter, which took effect in January 2025, replaced the traditional commission form of government with a professional city administrator model. Under the new structure, bureau directors report to a City Administrator rather than to individual elected commissioners. This has created new administrative and coordination roles while consolidating management responsibilities across bureaus.',
      },
    },
  ],
}

/* ─── SECTION DATA ──────────────────────────────────────────── */

const bureauOverview = [
  {
    bureau: 'Bureau of Transportation (PBOT)',
    roles: 'Traffic engineers, project managers, street maintenance workers, planners',
    focus: 'Active transportation infrastructure, Vision Zero safety program, bridge maintenance',
    icon: MapPin,
    color: 'blue',
  },
  {
    bureau: 'Bureau of Environmental Services (BES)',
    roles: 'Environmental engineers, wastewater operators, GIS analysts, field inspectors',
    focus: 'Combined sewer overflow reduction, stormwater management, watershed restoration',
    icon: Shield,
    color: 'green',
  },
  {
    bureau: 'Portland Parks & Recreation',
    roles: 'Recreation coordinators, park rangers, maintenance technicians, program staff',
    focus: 'Expanding equitable park access, urban forestry, youth programming',
    icon: BookOpen,
    color: 'emerald',
  },
  {
    bureau: 'Portland Water Bureau',
    roles: 'Water quality analysts, treatment plant operators, distribution technicians',
    focus: 'Bull Run Watershed protection, system resilience, lead service line replacement',
    icon: Building2,
    color: 'cyan',
  },
  {
    bureau: 'Bureau of Development Services (BDS)',
    roles: 'Building inspectors, permit technicians, code compliance officers, planners',
    focus: 'Streamlining permitting, housing production support, code modernization',
    icon: FileText,
    color: 'purple',
  },
  {
    bureau: 'Portland Fire & Rescue',
    roles: 'Firefighters, paramedics, fire inspectors, emergency management staff',
    focus: 'Community paramedicine expansion, wildfire preparedness, equity in emergency response',
    icon: AlertTriangle,
    color: 'red',
  },
]

const salaryBands = [
  {
    category: 'Administrative Support',
    range: '$45,000 – $62,000/year',
    examples: 'Office specialists, administrative assistants, permit technicians',
    unionRep: 'DCTU represented',
  },
  {
    category: 'Technical / Skilled Trades',
    range: '$58,000 – $85,000/year',
    examples: 'Electricians, plumbers, equipment operators, maintenance technicians',
    unionRep: 'Trade-specific bargaining units',
  },
  {
    category: 'Professional / Analyst',
    range: '$70,000 – $105,000/year',
    examples: 'Engineers, planners, budget analysts, GIS specialists, program managers',
    unionRep: 'PTE represented (many classifications)',
  },
  {
    category: 'Public Safety',
    range: '$75,000 – $115,000/year',
    examples: 'Police officers, firefighters, paramedics, 911 dispatchers',
    unionRep: 'PPA / PFFA represented',
  },
  {
    category: 'Management / Director Level',
    range: '$110,000 – $175,000+/year',
    examples: 'Bureau directors, senior managers, division supervisors, city officials',
    unionRep: 'Non-represented (exempt)',
  },
]

const charterChangeImpact = [
  {
    change: 'City Administrator Model',
    detail: 'Portland\'s 2025 charter reform replaced elected commissioner-led bureaus with a professional City Administrator overseeing all operational bureaus. This restructuring has opened roles in coordination, policy analysis, and executive support that did not previously exist.',
  },
  {
    change: 'Expanded City Council',
    detail: 'The council expanded from 5 to 12 members elected from four geographic districts. Supporting a larger council requires additional legislative staff, communications personnel, and constituent services roles.',
  },
  {
    change: 'Ranked-Choice Voting Administration',
    detail: 'Portland now uses ranked-choice voting for city elections, creating new demand for elections coordination staff, public outreach specialists, and technology support within Multnomah County and city offices.',
  },
  {
    change: 'Bureau Reorganization',
    detail: 'Some bureaus have consolidated functions while others are building out capacity. The Office of Community Technology, the Office of Equity and Human Rights, and the Office of Management and Finance are among those actively expanding their teams.',
  },
]

const hiringProcess = [
  {
    step: 1,
    title: 'Job Announcement Opens',
    detail: 'Postings go live on the city\'s recruitment portal and often on aggregator sites like this one. Announcements typically stay open for two to three weeks. Civil service positions may post for a shorter window to build an eligibility list.',
  },
  {
    step: 2,
    title: 'Application Submission',
    detail: 'Submit a completed city application form, resume, and any required supplemental materials before the closing date. Late or incomplete applications are generally not accepted. Pay close attention to minimum qualifications listed in the announcement.',
  },
  {
    step: 3,
    title: 'Minimum Qualifications Review',
    detail: 'HR staff review every application against the stated minimum qualifications. Applicants who do not meet minimums are removed before the competitive review stage. This step is pass/fail based on what is in your application.',
  },
  {
    step: 4,
    title: 'Competitive Review or Exam',
    detail: 'Depending on the classification, the competitive step may be a scored resume review, a written examination, a practical skills test, or a structured interview panel. Civil service positions use an exam process that results in a ranked eligibility list.',
  },
  {
    step: 5,
    title: 'Departmental Interview',
    detail: 'Candidates from the eligible pool are invited for panel interviews with bureau staff. City interviews are typically structured and behaviorally based, with questions tied directly to the competencies listed in the job announcement.',
  },
  {
    step: 6,
    title: 'Background Check and Offer',
    detail: 'Conditional offers are extended pending a background investigation, which may include employment verification, criminal history review, and for some roles, a medical evaluation or psychological assessment. Onboarding typically follows within two to four weeks of a cleared background.',
  },
]

const benefitsHighlights = [
  {
    benefit: 'Oregon PERS Enrollment',
    detail: 'City employees are enrolled in the Oregon Public Employees Retirement System, one of the stronger defined-benefit pension plans available to public sector workers in the Pacific Northwest.',
  },
  {
    benefit: 'Comprehensive Medical Coverage',
    detail: 'Multiple health plan options through the city\'s group plan, with employer contributions covering a substantial portion of premiums for both employees and dependents.',
  },
  {
    benefit: 'Paid Leave Structure',
    detail: 'New employees typically accrue vacation leave starting from day one. Sick leave accrual, paid holidays (11 annually), and personal days are included across most bargaining units.',
  },
  {
    benefit: 'Transit and Commuter Benefits',
    detail: 'Many city employees receive TriMet passes or commuter subsidies as part of their compensation package, reflecting Portland\'s institutional commitment to public transit use among its own workforce.',
  },
]

const currentHiringPriorities = [
  {
    area: 'Public Safety Staffing',
    context: 'The Portland Police Bureau has maintained active recruitment following years of staffing attrition. Portland Fire & Rescue is also running ongoing lateral and entry-level recruitment campaigns to address response capacity.',
  },
  {
    area: 'Housing and Permitting Acceleration',
    context: 'Portland\'s housing production goals under state-mandated zoning reforms have increased pressure on the Bureau of Development Services to process permits faster, driving demand for permit technicians and plan reviewers.',
  },
  {
    area: 'Infrastructure Maintenance',
    context: 'Aging infrastructure across PBOT, BES, and the Water Bureau has created consistent demand for skilled trades workers, engineers, and field operations staff. Federal infrastructure funding is supporting additional project-based hiring.',
  },
  {
    area: 'Administrative Restructuring Roles',
    context: 'The transition to a city administrator model under the new charter has opened positions in policy coordination, intergovernmental relations, and executive administration that did not exist under the previous commission structure.',
  },
]

const faqs = [
  {
    question: 'How do I apply for a job at the City of Portland?',
    answer: 'Applications are submitted through the city\'s online recruitment platform. Most roles require a city-specific application form, a resume, and occasionally supplemental questionnaires. Civil service positions may include an examination component. Paying close attention to minimum qualification language in each announcement is the most important step, as applications that do not clearly demonstrate those qualifications are screened out before the competitive review.',
  },
  {
    question: 'What changed about Portland\'s city government in 2025?',
    answer: 'Portland\'s voter-approved charter reform took effect in January 2025, replacing the commission form of government with a council-manager structure. The council expanded from five to twelve members, and operational authority over bureaus shifted to a professional City Administrator. For job seekers, this matters because it reshaped the reporting structures, created new coordination roles, and initiated a period of active administrative staffing across multiple offices.',
  },
  {
    question: 'Are City of Portland jobs union jobs?',
    answer: 'Most are. The majority of career positions are represented by bargaining units including the District Council of Trade Unions, the Professional Technical Employees union, the Portland Police Association, and the Portland Fire Fighters Association. Union status means your compensation is governed by a negotiated agreement, you have access to grievance procedures, and wages follow a defined step schedule. Management and director-level positions are generally non-represented.',
  },
  {
    question: 'What is the Oregon PERS and why does it matter for city jobs?',
    answer: 'The Oregon Public Employees Retirement System is a defined-benefit pension program covering most Oregon public sector workers, including City of Portland employees. Unlike a 401(k), a defined-benefit pension guarantees a specific retirement income based on years of service and final salary rather than investment performance. For workers who plan to stay in public sector employment long-term, PERS enrollment is a significant part of the total compensation picture.',
  },
  {
    question: 'What is the difference between civil service and exempt positions?',
    answer: 'Civil service positions are merit-based roles governed by the City Charter and HR administrative rules. Hiring requires passing a formal examination process, and employees in these roles have enhanced job protections. Exempt positions are not bound by civil service rules and can be appointed or released with fewer procedural requirements. Director-level and politically appointed roles are typically exempt. The distinction affects both how you are hired and the job security you have once in the role.',
  },
  {
    question: 'Does Portland hire for entry-level roles without prior government experience?',
    answer: 'Yes. Many City of Portland classifications, particularly in parks maintenance, utilities, administrative support, and public works, are designed for candidates without prior government experience. The city runs apprenticeship programs and sometimes partners with workforce development organizations to recruit entry-level candidates. For these roles, demonstrating reliability, physical capability where applicable, and familiarity with the specific bureau\'s mission tends to matter more than prior municipal experience.',
  },
]

/* ─── PAGE ──────────────────────────────────────────────────── */

export default async function JobsAtCityOfPortlandPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'jobs at city of portland', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'jobs at city of portland', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            City of Portland Jobs Hiring Now — Urgent Openings Across All Bureaus
          </h1>
        </header>

        {/* ── JOB BOARD ── */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="jobs at city of portland" />
          </aside>
          <div className="flex-1">
            <AIJobMatcherWrapper />
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList what={params.what || 'jobs at city of portland'} where={params.where || ''} salary_min={params.salary_min} initialData={initialData} />
            </Suspense>
          </div>
        </div>

        {/* ── PORTLAND'S NEW GOVERNMENT STRUCTURE ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Portland's New City Structure and What It Means for Job Seekers</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Portland entered 2025 operating under its most significant governmental restructuring in nearly a century. The charter reform passed by voters in November 2022 replaced the commission model with a professional city administrator structure and expanded the council from five to twelve members. For anyone looking at municipal employment, this matters directly: the transition opened roles that did not previously exist and shifted reporting lines across every major bureau.
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            {charterChangeImpact.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 font-bold rounded-full text-sm flex-shrink-0">{index + 1}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{item.change}</h3>
                    <p className="text-gray-600 text-sm">{item.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── BUREAUS OVERVIEW ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Where City of Portland Jobs Are Concentrated</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Portland's workforce is distributed across more than two dozen bureaus and offices. The largest employers within city government are the operational bureaus that manage physical infrastructure and direct services. Here is where the majority of open roles tend to cluster.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {bureauOverview.map((bureau, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <bureau.icon className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 text-sm">{bureau.bureau}</h3>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <p className="font-medium text-gray-700">Common roles</p>
                    <p className="text-gray-500">{bureau.roles}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Current focus</p>
                    <p className="text-gray-500">{bureau.focus}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SALARY BANDS ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">City of Portland Salary Ranges by Job Category</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Pay at the City of Portland is set through negotiated collective bargaining agreements or, for non-represented roles, through administrative salary schedules reviewed periodically by the Office of Management and Finance. The ranges below reflect typical annual figures across major job families.
          </p>
          <div className="space-y-4">
            {salaryBands.map((band, index) => (
              <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{band.category}</h3>
                    <p className="text-gray-500 text-sm mt-1">{band.examples}</p>
                  </div>
                  <div className="flex flex-col md:items-end gap-1">
                    <span className="text-lg font-bold text-green-700">{band.range}</span>
                    <span className="text-xs text-gray-500 bg-white border border-gray-200 rounded-full px-3 py-0.5">{band.unionRep}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Figures are approximate and reflect current salary schedules. Actual compensation depends on step placement within the classification, applicable collective bargaining agreement, and any special pays. Verify current rates with the City of Portland's Human Resources division.
          </p>
        </section>

        {/* ── CURRENT HIRING PRIORITIES ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Where Portland Is Hiring Most Urgently Right Now</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Not all city departments hire at the same pace. As of early 2026, several specific areas are driving the bulk of active recruitment. Understanding these priorities helps you target your application where demand is highest.
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            {currentHiringPriorities.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <ChevronRight className="w-4 h-4 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">{item.area}</h3>
                </div>
                <p className="text-gray-600 text-sm">{item.context}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── HIRING PROCESS ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-7 h-7 text-amber-600" />
            <h2 className="text-2xl font-bold text-gray-900">How Portland's Hiring Process Actually Works</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Municipal hiring is more structured than private sector recruitment. The City of Portland follows a defined process that is designed to be merit-based and auditable. Knowing what each stage involves significantly increases your chance of getting through it successfully.
          </p>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 hidden md:block" />
            <div className="space-y-5">
              {hiringProcess.map((step, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 md:ml-12 relative">
                  <div className="hidden md:flex absolute -left-16 top-6 w-8 h-8 bg-amber-100 text-amber-700 font-bold rounded-full items-center justify-center text-sm border-2 border-white">{step.step}</div>
                  <div className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 bg-amber-100 text-amber-700 font-bold rounded-full text-xs flex-shrink-0 md:hidden">{step.step}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600 text-sm">{step.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BENEFITS ── */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Star className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Benefits of Working for the City of Portland</h2>
              <p className="text-gray-700 mb-6">
                Total compensation at the City of Portland extends well beyond base salary. The benefits package, particularly for long-tenured employees, often represents a substantial portion of overall value — especially given PERS enrollment, which is increasingly rare in the broader labor market.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {benefitsHighlights.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <h3 className="font-semibold text-gray-900 text-sm">{item.benefit}</h3>
                    </div>
                    <p className="text-gray-600 text-sm">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About City of Portland Jobs</h2>
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
                <div className="px-6 pb-6 text-gray-600 text-sm">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>

        {/* ── DISCLAIMER ── */}
        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> Oh My Job is an independent job search platform and is not affiliated with, endorsed by, or associated with the City of Portland or any of its bureaus, offices, or departments. Job listings displayed on this page are aggregated from third-party sources and may not reflect all current openings posted directly through the City of Portland's official recruitment portal. For the most complete and current listing of City of Portland positions, candidates should also consult the city's official Human Resources website.
          </p>
        </section>
      </div>
    </>
  )
}