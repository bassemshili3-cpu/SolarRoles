import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import {
  Briefcase, DollarSign, Shield, FileText,
  CheckCircle, AlertTriangle, BarChart2, Users, HardHat, Landmark
} from 'lucide-react'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Public Works Commission Jobs | Government & Civil Service',
  description: 'Civil engineering, utilities, planning, and operations at public works commissions — government pay scales, pension eligibility, and exam requirements shown per posting.',
  keywords: 'public works commission jobs, public works jobs, government public works, civil service jobs, infrastructure jobs, public works department jobs, municipal jobs',
  openGraph: {
    title: 'Public Works Commission Jobs | Engineering & Utilities Roles',
    description: 'Browse open public works commission roles in engineering, utilities, planning, and operations. Government pay, full benefits, and long-term stability.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Public Works Commission Jobs | Civil Service Positions',
    description: 'Immediate openings at public works commissions across the U.S. Civil engineering, operations, utilities, and more. Competitive government pay and benefits.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/public-works-commission-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Public Works Commission Jobs',
  description: 'Find public works commission job openings across the United States. Browse civil engineering, infrastructure, utilities, and operations roles.',
  url: 'https://www.oh-my-job.com/public-works-commission-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Public Works Commission Jobs',
    description: 'Current job listings at public works commissions and government infrastructure agencies in the U.S.',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What does a public works commission do?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A public works commission is a government body responsible for planning, building, and maintaining public infrastructure. This includes roads, bridges, stormwater systems, water and wastewater utilities, public buildings, and transportation networks. Commissions operate at the city, county, and regional level and employ a wide range of professionals from engineers and project managers to equipment operators and administrative staff.',
      },
    },
    {
      '@type': 'Question',
      name: 'What types of jobs are available at a public works commission?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Public works commissions hire across a broad range of functions including civil and structural engineering, project management, utilities operations, equipment and fleet maintenance, environmental compliance, urban planning, GIS and mapping, contract administration, and public administration. Entry-level trade and operations roles are often available without a degree.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does public works pay compare to the private sector in 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Base salaries at public works commissions are typically 5 to 15 percent below private sector equivalents for engineering and technical roles. However, total compensation — including defined-benefit pensions, subsidized health insurance, paid leave, and job security — frequently makes the public sector more competitive over a full career, particularly for workers who stay 10 or more years.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you need a PE license to work at a public works commission?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A Professional Engineer (PE) license is required for roles that involve signing off on engineering designs, stamping drawings, or serving as the engineer of record on public projects. Many entry and mid-level engineering positions, however, hire EITs (Engineers in Training) who are working toward licensure. Non-engineering roles such as project coordinator, inspector, and operations technician do not require a PE.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do you apply for a public works commission job?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most public works commission positions are posted through the city or county human resources portal, state civil service job boards, or platforms like NEOGOV, GovernmentJobs.com, and USAJOBS for federal roles. Applications typically require a formal government application form in addition to a resume. Some jurisdictions use civil service exams or scored evaluations as part of the selection process.',
      },
    },
  ],
}

/* ─── SECTION DATA ──────────────────────────────────────────── */

const jobCategories = [
  {
    category: 'Civil and Structural Engineering',
    license: 'EIT or PE preferred; PE required for senior roles',
    salary: '$72,000 to $115,000/year',
    scope: 'Design, review, and oversight of roads, bridges, drainage systems, and public facilities. Senior engineers serve as engineer of record on capital projects.',
    demand: 'Consistently high demand across municipalities of all sizes. Aging infrastructure drives sustained hiring.',
  },
  {
    category: 'Project and Construction Management',
    license: 'PMP or CCM preferred; engineering degree common',
    salary: '$68,000 to $105,000/year',
    scope: 'Managing public infrastructure projects from design through construction closeout. Includes contractor oversight, budget tracking, and public stakeholder coordination.',
    demand: 'Infrastructure funding from federal programs has expanded the project pipeline significantly through 2026 and beyond.',
  },
  {
    category: 'Utilities Operations (Water and Wastewater)',
    license: 'State water or wastewater operator certification required',
    salary: '$52,000 to $80,000/year',
    scope: 'Operating and maintaining water treatment plants, distribution systems, lift stations, and wastewater facilities. Includes compliance reporting and emergency response.',
    demand: 'High and growing. Water system workforce aging out is a documented national challenge.',
  },
  {
    category: 'Environmental Compliance and Planning',
    license: 'Environmental science or engineering degree; permits experience valued',
    salary: '$60,000 to $90,000/year',
    scope: 'Managing stormwater programs, NPDES permit compliance, environmental impact assessments, and sustainability initiatives for public infrastructure.',
    demand: 'Expanding due to increasing federal stormwater and clean water mandates.',
  },
  {
    category: 'GIS and Infrastructure Data',
    license: 'GIS certification or geographic information systems degree',
    salary: '$55,000 to $82,000/year',
    scope: 'Maintaining asset inventories, mapping infrastructure networks, supporting capital planning with spatial data, and building public-facing map applications.',
    demand: 'Rising sharply as commissions modernize asset management systems and adopt digital twin approaches.',
  },
  {
    category: 'Equipment and Fleet Operations',
    license: 'CDL-A or CDL-B depending on equipment; equipment operator certifications',
    salary: '$46,000 to $68,000/year',
    scope: 'Operating heavy equipment including graders, excavators, street sweepers, and utility trucks. Performing maintenance on the municipal fleet.',
    demand: 'Stable and entry-accessible. Many commissions provide training for equipment certifications after hire.',
  },
  {
    category: 'Contract and Procurement Administration',
    license: 'Public procurement certification (CPPO or CPPB) valued',
    salary: '$58,000 to $88,000/year',
    scope: 'Managing the procurement lifecycle for public works contracts including bid preparation, vendor evaluation, contract compliance, and change order processing.',
    demand: 'Strong demand as public agencies face increased scrutiny on procurement transparency and efficiency.',
  },
  {
    category: 'Administrative and Program Coordination',
    license: 'No specific license required; public administration background helpful',
    salary: '$42,000 to $65,000/year',
    scope: 'Supporting commission operations through grant administration, public records management, budget coordination, and community engagement programs.',
    demand: 'Consistent. Strong entry point for those seeking a government career without a technical background.',
  },
]

const infrastructureFunding2026 = [
  {
    program: 'Infrastructure Investment and Jobs Act (IIJA) — Continued Deployment',
    detail: 'The bulk of IIJA funding allocated in 2021 is still flowing through state and local agencies as of 2026. Road, bridge, water, and broadband projects funded under this legislation are generating sustained hiring at public works commissions in virtually every state. Agencies that received large allocations are the most active employers right now.',
    icon: Landmark,
  },
  {
    program: 'Lead Pipe Replacement Mandate',
    detail: 'The EPA\'s final rule requiring all lead service lines to be identified and replaced within 10 years has triggered a major wave of water utility hiring. Commissions managing older distribution systems are building dedicated project teams for this work, creating openings across engineering, operations, and community outreach.',
    icon: Shield,
  },
  {
    program: 'Climate Resilience Infrastructure Programs',
    detail: 'Federal and state programs targeting flood resilience, stormwater management, and extreme heat infrastructure have added a new category of capital projects at the local level. Environmental planners and civil engineers with experience in climate adaptation are among the most sought-after professionals in the public sector right now.',
    icon: BarChart2,
  },
  {
    program: 'State Revolving Fund Expansion',
    detail: 'State revolving funds for drinking water and clean water infrastructure have been significantly recapitalized. This is generating sustained project activity at the utility and municipal level, with direct translation into hiring for operators, engineers, and project managers at local commissions.',
    icon: HardHat,
  },
]

const applicationProcess = [
  {
    step: 'Find the right posting',
    detail: 'Most public works commission positions are posted through the city or county HR portal, NEOGOV, GovernmentJobs.com, or a state civil service board. Federal public works roles appear on USAJOBS. Job titles vary significantly between jurisdictions for equivalent roles, so searching by function rather than title often yields better results.',
  },
  {
    step: 'Complete the government application form',
    detail: 'A resume alone is rarely sufficient. Most jurisdictions require a formal application that asks for detailed employment history, education, certifications, and supplemental questions. The information in this form — not your resume — is what screeners score. Incomplete applications are routinely disqualified.',
  },
  {
    step: 'Prepare for scored evaluations',
    detail: 'Many civil service positions use a merit-based scoring system. This may include a written exam, a structured interview with scored responses, or a panel review of your application materials. Preparing specific examples of past work that match the listed competencies is more effective than generic interview prep.',
  },
  {
    step: 'Understand the timeline',
    detail: 'Government hiring moves slower than the private sector. A typical public works commission hire from posting to offer can take six to sixteen weeks, sometimes longer for senior or specialized roles. Do not interpret silence as rejection. Following up through the HR contact listed in the posting is appropriate after four to six weeks.',
  },
  {
    step: 'Background check and verification',
    detail: 'Most public works roles require employment and education verification, a criminal background check, and for roles involving driving or equipment, a motor vehicle record check. Some utilities positions require drug screening due to safety-sensitive operations. Having your documentation organized in advance avoids delays.',
  },
]

const compensationBreakdown = [
  {
    element: 'Defined-benefit pension',
    detail: 'Most public works commissions participate in state or municipal pension systems that guarantee retirement income based on years of service and final salary. In 2026, this benefit is increasingly rare in the private sector and represents substantial long-term value for employees who stay 10 or more years.',
  },
  {
    element: 'Health and dental coverage',
    detail: 'Public sector health benefits typically cover a higher percentage of premium costs than private employers. Family coverage subsidized at 80 to 100 percent is common at larger commissions, representing several thousand dollars in annual compensation that does not appear in the base salary figure.',
  },
  {
    element: 'Paid leave accumulation',
    detail: 'Government employees in public works roles typically accrue vacation and sick leave at rates that increase with tenure. Many jurisdictions allow unused sick leave to count toward pension calculations or to be paid out at retirement, adding further long-term value.',
  },
  {
    element: 'Step pay increases',
    detail: 'Most civil service pay structures use a step system where employees receive automatic pay increases at defined intervals, independent of performance reviews. For entry-level hires, this provides a predictable income growth trajectory that can be modeled out over a 10-year period.',
  },
]

const faqs = [
  {
    question: 'What does a public works commission do?',
    answer: 'A public works commission is a government body responsible for the planning, construction, and ongoing maintenance of public infrastructure. Roads, bridges, stormwater systems, water distribution, wastewater treatment, public buildings, and transportation assets all fall within the typical scope. Commissions operate at the city, county, and regional level and range from small departments with a handful of staff to large agencies managing multi-billion-dollar capital programs.',
  },
  {
    question: 'What types of jobs are available at a public works commission?',
    answer: 'The range is wider than most people expect. Civil and structural engineering, project management, utilities operations, environmental compliance, GIS and data management, heavy equipment operation, fleet maintenance, contract administration, and general public administration are all common functions. Entry-level roles in operations and trades are accessible without a four-year degree, while engineering and management positions typically require relevant credentials.',
  },
  {
    question: 'How does public works pay compare to private sector in 2026?',
    answer: 'Base salaries at public works commissions run somewhat below private sector equivalents for engineering and technical roles, often by 5 to 15 percent depending on the market. However, total compensation including defined-benefit pensions, heavily subsidized health coverage, paid leave accrual, and job security frequently makes the public sector more competitive over a full career — particularly for professionals who plan to stay in the same region for a decade or more.',
  },
  {
    question: 'Do you need a PE license to work at a public works commission?',
    answer: 'A Professional Engineer license is required for roles that involve signing engineering documents as the engineer of record. Many entry and mid-level positions hire engineers working toward their PE, and non-engineering roles across operations, project coordination, compliance, and administration do not require licensure at all. If a PE is required, it is stated explicitly in the job posting.',
  },
  {
    question: 'How do you apply for a public works commission job?',
    answer: 'Positions are typically posted on the city or county HR portal, NEOGOV, GovernmentJobs.com, or state civil service boards. The application process usually requires a government-specific application form in addition to a resume. Many jurisdictions use a merit-based scoring system, so the quality and completeness of your application form is more important than in private sector hiring. Timelines from posting to offer commonly run six to sixteen weeks.',
  },
  {
    question: 'Why is public works hiring so active in 2026?',
    answer: 'Several converging factors are driving sustained hiring across public works commissions in 2026. Federal infrastructure funding from programs enacted in 2021 is still flowing through local agencies, expanding capital project pipelines. EPA mandates around lead pipe replacement and clean water compliance are generating dedicated hiring at water utilities. Simultaneously, a significant share of the existing public works workforce is at or near retirement age, creating openings at every level. The net result is one of the more active hiring environments the sector has seen in a decade.',
  },
]

export default async function PublicWorksCommissionJobsPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'public works commission', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'public works commission', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Public Works Commission Jobs Open Now Across the United States
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="public works commission" />
          </aside>
          <div className="flex-1">
            
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'public works commission'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData}
              />
            </Suspense>
          </div>
        </div>

        {/* ── JOB CATEGORIES ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <HardHat className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Every Role You Can Hold at a Public Works Commission</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Public works commissions employ a far broader range of professionals than most job seekers realize. Infrastructure delivery requires technical, operational, environmental, data, and administrative functions working in parallel. Here is what each major category actually involves and what it pays.
          </p>
          <div className="space-y-4">
            {jobCategories.map((job, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                  <h3 className="font-bold text-gray-900 text-lg">{job.category}</h3>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1">
                    <DollarSign className="w-4 h-4" /> {job.salary}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-1">
                  <span className="font-medium text-gray-700">Credentials:</span> {job.license}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  <span className="font-medium text-gray-700">Scope:</span> {job.scope}
                </p>
                <p className="text-sm text-blue-700 bg-blue-50 rounded-lg px-3 py-2">{job.demand}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── WHY HIRING IS ACTIVE IN 2026 ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <BarChart2 className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Why Public Works Commission Hiring Is Unusually Active in 2026</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            The current wave of public works hiring is not a typical cyclical uptick. Multiple structural forces are converging simultaneously, creating a sustained expansion of the workforce across commissions of every size. Understanding what is driving the demand helps you position your application more effectively.
          </p>
          <div className="space-y-4">
            {infrastructureFunding2026.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.program}</h3>
                  <p className="text-gray-600 text-sm">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── COMPENSATION BREAKDOWN ── */}
        <section className="mt-20 bg-green-50 border border-green-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <DollarSign className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
            <div className="w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What Public Works Compensation Actually Looks Like Beyond the Base Salary</h2>
              <p className="text-gray-700 mb-6">
                Comparing a public works salary to a private sector offer on base pay alone is misleading. The total compensation package at most commissions includes benefits that have largely disappeared from private employment, and their value compounds significantly over time. These are the elements worth factoring into any offer evaluation.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {compensationBreakdown.map((item, index) => (
                  <div key={index} className="bg-white rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-2">{item.element}</h3>
                    <p className="text-gray-600 text-sm">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── APPLICATION PROCESS ── */}
        <section className="mt-20 bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <FileText className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div className="w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How the Public Works Commission Application Process Works</h2>
              <p className="text-gray-700 mb-6">
                Government hiring operates differently from private sector recruiting in ways that catch many applicants off guard. Knowing the process before you start saves time and significantly improves your chances of advancing through the selection system.
              </p>
              <div className="space-y-4">
                {applicationProcess.map((item, index) => (
                  <div key={index} className="bg-white rounded-xl p-5 flex items-start gap-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-amber-100 text-amber-700 font-bold rounded-full text-sm flex-shrink-0">{index + 1}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{item.step}</h3>
                      <p className="text-gray-600 text-sm">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── WHAT STRONG CANDIDATES BRING ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">What Strong Public Works Commission Candidates Bring to the Table</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Public sector hiring panels evaluate candidates differently than private employers. The emphasis is on demonstrated competencies, public accountability, and the ability to work within regulatory and procurement constraints. These are the qualities that consistently move candidates forward.
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                title: 'Specific project experience with measurable outcomes',
                detail: 'Hiring panels want to see the scope of what you have managed, not just your job title. Dollar values of projects delivered, miles of infrastructure constructed or rehabilitated, and systems you have operated are the specifics that distinguish experienced candidates. Vague descriptions of responsibilities are filtered out early.',
              },
              {
                title: 'Familiarity with public procurement and compliance',
                detail: 'Working in the public sector requires operating within procurement rules, public contract laws, and regulatory frameworks that do not exist in the same form in private practice. Candidates who can speak to experience with competitive bidding, prevailing wage requirements, or permit compliance stand out in panels reviewing technical applications.',
              },
              {
                title: 'Community and stakeholder communication experience',
                detail: 'Public works projects affect residents, businesses, and elected officials. Commissions place real weight on candidates who have presented projects at public meetings, managed community feedback processes, or coordinated with neighborhood groups. This is especially true for project management and planning roles.',
              },
              {
                title: 'Commitment to public service and long tenure signals',
                detail: 'Government hiring panels are aware of turnover costs and the slow ramp-up for public sector roles. Candidates with a demonstrated pattern of building expertise in a single field or staying with employers for multiple years are viewed more favorably than those with frequent short-term transitions.',
              },
            ].map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.detail}</p>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Signs a Public Works Job Posting May Not Be Worth Your Time</h2>
                <p className="text-gray-700 mb-4">
                  Not every public works posting reflects a genuine, well-managed opportunity. Some are positions with structural issues that become apparent only after you have invested significant time in a lengthy government application process. These signals are worth evaluating before you apply.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    'The same role has been reposted multiple times in the past year with no explanation',
                    'The job description lists requirements that span two or three distinct job functions at a single salary band',
                    'The pay range is significantly below comparable civil service positions in the same state',
                    'The posting closes within 48 hours of going live, suggesting it may be a formality for an internal candidate',
                    'Supplemental questions are generic and do not reflect the actual technical requirements of the role',
                    'The hiring agency has a documented pattern of budget freezes that have interrupted hiring in recent years',
                    'The role involves managing a function that has been consistently understaffed with no plan to address the root cause',
                    'Benefits listed are vague or noticeably less comprehensive than comparable positions at neighboring jurisdictions',
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── WORKFORCE CONTEXT ── */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Users className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">The Public Works Workforce in 2026: What the Staffing Data Shows</h2>
              <p className="text-gray-700 mb-4">
                The public works sector is in the middle of a generational workforce transition. A large cohort of experienced engineers, operators, and managers hired during the infrastructure build-out of the 1980s and 1990s is now at or past retirement age. This is creating openings at the mid and senior level that are structurally different from typical job market fluctuations.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                {[
                  {
                    heading: 'Where the gaps are largest',
                    points: [
                      'Licensed water and wastewater operators',
                      'Senior civil engineers with PE licensure',
                      'Project managers with public contract experience',
                      'Environmental compliance specialists',
                    ],
                  },
                  {
                    heading: 'What commissions are doing to compete',
                    points: [
                      'Expanding apprenticeship and operator-in-training programs',
                      'Offering student loan repayment for technical hires',
                      'Remote and hybrid options for GIS, planning, and admin roles',
                      'Accelerated step increases to attract mid-career candidates',
                    ],
                  },
                  {
                    heading: 'Long-term career outlook',
                    points: [
                      'Infrastructure funding through at least 2028 under current legislation',
                      'Water system investment mandated for the next decade',
                      'Climate adaptation programs creating new permanent roles',
                      'Senior vacancies generating promotion opportunities faster than usual',
                    ],
                  },
                ].map((col, i) => (
                  <div key={i} className="bg-white rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm">{col.heading}</h3>
                    <ul className="space-y-2">
                      {col.points.map((point, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Public Works Commission Jobs</h2>
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
            <strong>Disclaimer:</strong> This page aggregates publicly available job listings from third-party sources for informational purposes. Oh My Job is an independent job search platform and is not affiliated with, endorsed by, or associated with any public works commission, municipal agency, county department, or government body referenced on this page. Salary ranges reflect general market data as of 2026 and may vary by jurisdiction. Always verify compensation, benefits, and application requirements directly with the hiring agency.
          </p>
        </section>
      </div>
    </>
  )
}