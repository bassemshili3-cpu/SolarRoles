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
  TrendingUp,
  Building2,
  Users,
  Star,
  ChevronRight,
  Globe,
} from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Immediate Openings: Jobs at City of Laredo | Municipal Positions Hiring Now',
  description: 'City of Laredo jobs are open now across multiple departments. Competitive Texas pay, full benefits, and a growing municipal workforce. Browse current openings and apply today.',
  keywords: 'jobs at city of laredo, city of laredo jobs, laredo tx city jobs, city of laredo hiring, laredo municipal jobs, laredo texas government jobs, city of laredo careers',
  openGraph: {
    title: 'Jobs at City of Laredo | Urgent Municipal Openings in Texas',
    description: 'Explore active City of Laredo job postings. From public works to utilities, finance to public safety — Laredo is hiring across all departments right now.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'City of Laredo Jobs Hiring Now | Apply Today',
    description: 'Municipal positions open at the City of Laredo. Strong benefits, stable employment, and a fast-growing border economy. Search available roles now.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/jobs-at-city-of-laredo',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Jobs at City of Laredo',
  description: 'Browse current job openings at the City of Laredo, Texas. Municipal positions across all departments with competitive pay and full benefits.',
  url: 'https://www.oh-my-job.com/jobs-at-city-of-laredo',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Jobs at City of Laredo',
    description: 'Current City of Laredo job listings across all municipal departments',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I apply for a job at the City of Laredo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Applications for City of Laredo positions are submitted through the city\'s online Human Resources portal. Most postings require a completed city application form along with any supporting documents listed in the announcement. Resumes alone are typically not accepted as a substitute for the official application. Some positions may require additional certifications, bilingual proficiency verification, or physical testing depending on the department.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does the City of Laredo require bilingual applicants?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bilingual ability in English and Spanish is listed as a preferred or required qualification for many City of Laredo roles, particularly in public-facing departments such as utilities customer service, community development, and health. Laredo\'s population is over 95 percent Hispanic, and the ability to communicate in both languages is a practical requirement across much of the city\'s workforce.',
      },
    },
    {
      '@type': 'Question',
      name: 'What retirement benefits do City of Laredo employees receive?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'City of Laredo employees are enrolled in the Texas Municipal Retirement System (TMRS), a defined-benefit pension plan covering municipal workers across Texas. The city makes matching contributions on top of the employee\'s own contributions, and vesting typically occurs after five years of credited service. TMRS is considered one of the stronger public sector retirement programs available to Texas city employees.',
      },
    },
    {
      '@type': 'Question',
      name: 'Why is the City of Laredo hiring so actively?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Laredo is one of the fastest-growing cities in Texas, and municipal service demand has expanded in direct proportion. The city\'s role as the largest inland port in the United States also drives sustained investment in infrastructure, public safety, and utility services. Population growth, federal infrastructure funding, and ongoing trade expansion with Mexico have all increased the scope of city operations and the number of staff required to support them.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Texas have a state income tax for City of Laredo employees?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Texas does not levy a personal state income tax, which means City of Laredo employees keep a larger share of their paycheck compared to equivalent roles in most other states. This is a meaningful component of the total compensation picture when comparing city jobs across state lines.',
      },
    },
  ],
}

/* ─── SECTION DATA ──────────────────────────────────────────── */

const laredoContext = [
  {
    title: 'Largest Inland Port in the United States',
    detail: 'Laredo handles more cross-border trade volume than any other inland port in the country, processing hundreds of billions of dollars in goods annually through the Colombia and World Trade Bridge crossings. This trade infrastructure places constant demand on city services related to transportation planning, public works, and business development.',
  },
  {
    title: 'One of Texas\'s Fastest-Growing Cities',
    detail: 'Laredo\'s population has grown consistently over the past two decades and continues to expand. That growth translates directly into hiring: the city must staff services that keep pace with an expanding resident base, from utilities and street maintenance to parks, libraries, and public health.',
  },
  {
    title: 'Federal Infrastructure Investment',
    detail: 'Laredo has received substantial federal infrastructure funding tied to border modernization, road expansion, and utility upgrades. Project-based hiring across Public Works, the Utilities Department, and the Bridge System has increased significantly as these programs move into active implementation phases.',
  },
  {
    title: 'No State Income Tax Advantage',
    detail: 'As a Texas city, Laredo employees benefit from the absence of a state income tax. For a city worker earning $55,000 per year, this effectively adds several thousand dollars of net annual value compared to an equivalent position in a state with a standard income tax rate.',
  },
]

const departmentOverview = [
  {
    dept: 'Utilities Department',
    roles: 'Water treatment operators, meter technicians, distribution workers, environmental compliance officers',
    focus: 'Water supply management, wastewater treatment, infrastructure expansion to serve growing residential areas',
    icon: Globe,
  },
  {
    dept: 'Public Works',
    roles: 'Civil engineers, construction inspectors, equipment operators, street maintenance workers',
    focus: 'Street resurfacing, stormwater drainage, bridge maintenance, federal infrastructure project management',
    icon: Building2,
  },
  {
    dept: 'Laredo Police Department',
    roles: 'Police officers, dispatchers, evidence technicians, crime analysts',
    focus: 'Border security coordination, community policing initiatives, recruitment to address staffing gaps',
    icon: Shield,
  },
  {
    dept: 'Laredo Fire Department',
    roles: 'Firefighters, paramedics, fire inspectors, hazmat technicians',
    focus: 'EMS response capacity, industrial facility inspections, wildland-urban interface preparedness',
    icon: CheckCircle,
  },
  {
    dept: 'Community Development',
    roles: 'Planners, building inspectors, code enforcement officers, grant administrators',
    focus: 'Housing development support, zoning modernization, federal grant compliance and reporting',
    icon: MapPin,
  },
  {
    dept: 'Health Department',
    roles: 'Public health nurses, epidemiologists, environmental health inspectors, community health workers',
    focus: 'Communicable disease surveillance, maternal and child health programs, border health coordination with Mexico',
    icon: Users,
  },
]

const salaryBands = [
  {
    category: 'Administrative and Clerical',
    range: '$35,000 – $52,000/year',
    examples: 'Office clerks, administrative assistants, customer service representatives',
    note: 'Entry-level city positions; bilingual pay differential may apply',
  },
  {
    category: 'Skilled Trades and Field Operations',
    range: '$42,000 – $68,000/year',
    examples: 'Equipment operators, utility maintenance workers, building inspectors, park maintenance',
    note: 'CDL and trade certifications often required',
  },
  {
    category: 'Technical and Professional',
    range: '$58,000 – $90,000/year',
    examples: 'Civil engineers, IT specialists, budget analysts, planners, public health professionals',
    note: 'Degree and licensure requirements vary by classification',
  },
  {
    category: 'Public Safety',
    range: '$52,000 – $95,000/year',
    examples: 'Police officers, firefighters, paramedics, dispatchers',
    note: 'Separate pay scales; overtime and specialty pay common',
  },
  {
    category: 'Management and Director Level',
    range: '$85,000 – $145,000+/year',
    examples: 'Department directors, division managers, city engineers, assistant city managers',
    note: 'Appointed or competitive process; non-civil service in most cases',
  },
]

const hiringProcess = [
  {
    step: 1,
    title: 'Job Posting Goes Live',
    detail: 'City of Laredo positions are posted on the city\'s HR portal and on third-party job platforms. Postings typically remain open for two to three weeks. Public safety positions may have rolling recruitment periods. Watch for closing dates carefully, as the city does not extend deadlines for incomplete applications.',
  },
  {
    step: 2,
    title: 'Submit the Official City Application',
    detail: 'A resume alone does not substitute for the city\'s application form. Fill out the form completely, including all employment history. Gaps or vague entries are often flagged during review. Attach all required documents such as licenses, certifications, and college transcripts where specified in the announcement.',
  },
  {
    step: 3,
    title: 'Minimum Qualifications Screening',
    detail: 'HR staff review applications against the minimum requirements listed in the posting. This is a pass/fail step. Applicants who do not clearly demonstrate that they meet every minimum qualification are removed before the competitive review. Bilingual requirements, if listed as mandatory, are evaluated at this stage.',
  },
  {
    step: 4,
    title: 'Competitive Review or Testing',
    detail: 'Depending on the position, the competitive step may involve a scored application review, a written examination, a physical agility test for public safety roles, or a structured skills assessment. Civil service classifications use a ranked scoring system to establish an eligibility list from which the hiring department selects candidates.',
  },
  {
    step: 5,
    title: 'Department Interview',
    detail: 'Qualified candidates are invited for a panel interview conducted by the hiring department. City of Laredo interviews are typically structured and competency-based. Prepare to give specific examples from your work history. For public-facing roles, the ability to communicate in both English and Spanish may be assessed at this stage.',
  },
  {
    step: 6,
    title: 'Background Check and Offer',
    detail: 'A conditional offer is extended pending a background investigation. Public safety roles include a more comprehensive process covering polygraph, psychological evaluation, and medical clearance. For most civilian positions, the process covers employment verification and criminal history. Onboarding typically begins two to four weeks after clearance.',
  },
]

const tmrsHighlights = [
  {
    title: 'Defined Benefit Pension',
    detail: 'TMRS provides a guaranteed monthly retirement benefit calculated from years of service and final average salary. Unlike market-dependent 401(k) plans, the benefit amount does not fluctuate based on investment performance.',
  },
  {
    title: 'City Matching Contributions',
    detail: 'The City of Laredo contributes a matching amount on top of the employee\'s own TMRS deposits. The combined account grows with interest throughout the employee\'s career and is paid out as a lifetime annuity at retirement.',
  },
  {
    title: 'Vesting at Five Years',
    detail: 'Employees become vested in the city\'s matching contributions after five years of credited service, which is a shorter vesting window than many private sector retirement programs.',
  },
  {
    title: 'Disability and Survivor Protections',
    detail: 'TMRS includes disability retirement benefits for members who become unable to work, as well as survivor benefit options that continue payments to a designated beneficiary after the retiree\'s death.',
  },
]

const currentPriorities = [
  {
    area: 'Utilities Workforce Expansion',
    context: 'The Utilities Department is actively hiring to support infrastructure projects funded through federal water programs and to replace an aging workforce in treatment plant operations. Water and wastewater operator roles are among the most consistently open positions in the city.',
  },
  {
    area: 'Police Officer Recruitment',
    context: 'The Laredo Police Department has maintained a sustained recruitment push to address staffing levels. The city offers signing incentives and lateral transfer opportunities for certified officers from other jurisdictions. Bilingual candidates are particularly sought.',
  },
  {
    area: 'Bridge and Transportation Operations',
    context: 'Laredo\'s international bridges generate significant toll revenue and require dedicated operations, maintenance, and administrative staff. The Bridge System division has expanded hiring as cross-border traffic volumes have grown post-pandemic.',
  },
  {
    area: 'Public Health Capacity',
    context: 'Following federal investment in border health infrastructure, the Laredo Health Department is building out epidemiology, environmental health, and community health worker capacity. Spanish-English bilingual qualifications are standard for most health department roles.',
  },
]

const faqs = [
  {
    question: 'How do I apply for a job at the City of Laredo?',
    answer: 'Submit a completed city application form through Laredo\'s HR portal before the listed closing date. A resume alone is not accepted. Include all required attachments such as licenses and certifications. Applications that leave required fields blank or vague are typically disqualified before reaching the competitive review stage.',
  },
  {
    question: 'Is bilingual ability required for City of Laredo jobs?',
    answer: 'For many positions, yes. Laredo\'s population is predominantly Spanish-speaking, and a large share of city job announcements list bilingual English and Spanish proficiency as required or strongly preferred. Public-facing departments including Health, Utilities customer service, and Community Development list it most consistently. Some positions include a bilingual pay differential in the compensation structure.',
  },
  {
    question: 'What is TMRS and why does it matter?',
    answer: 'The Texas Municipal Retirement System is a defined-benefit pension plan covering most Texas city employees, including those at the City of Laredo. The city contributes a matching amount to your account each pay period, and after five years you are vested in those contributions. At retirement, TMRS pays a guaranteed monthly income for life rather than a lump sum that depends on market conditions. For long-term employees, this is one of the most valuable parts of city compensation.',
  },
  {
    question: 'Does Laredo pay a competitive wage compared to other Texas cities?',
    answer: 'Salary ranges at the City of Laredo are generally competitive within the South Texas market, though they tend to run below the pay scales of larger Texas metros like San Antonio or Austin. The compensation picture shifts significantly when factoring in Texas\'s zero state income tax, TMRS pension matching, city-subsidized health benefits, and stable employment. For candidates comparing offers within the region, total compensation rather than base salary alone is the more accurate comparison.',
  },
  {
    question: 'Can I transfer from another Texas city job to Laredo?',
    answer: 'Lateral transfers are possible for positions that recognize equivalent experience, and public safety roles in particular have formal lateral hire pathways. TMRS is also portable between member cities, meaning years of service and account balances transfer if you move between Texas municipalities that participate in the system. Verify portability terms with both the originating city and Laredo HR before accepting a lateral offer.',
  },
  {
    question: 'Why is the City of Laredo hiring so many people right now?',
    answer: 'Several factors are driving active recruitment simultaneously. Population growth has expanded demand for every municipal service. Federal infrastructure funding is financing capital projects that require field and engineering staff to execute. The Bridge System, which generates revenue tied to trade volume, has grown its operational needs as US-Mexico commerce has expanded. And like many mid-sized cities, Laredo faces retirement-driven attrition as long-tenured employees exit the workforce.',
  },
]

/* ─── PAGE ──────────────────────────────────────────────────── */

export default async function JobsAtCityOfLaredoPage({ searchParams }: any) {
  const params = await searchParams

  const [{ count }, initialData] = await Promise.all([
  getMergedJobCount(params.what || 'jobs at city of laredo', params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
  searchMergedJobs({ what: params.what || 'jobs at city of laredo', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            City of Laredo Jobs Hiring Now — Immediate Openings Across All Departments
          </h1>
        </header>

        {/* ── JOB BOARD ── */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="jobs at city of laredo" />
          </aside>
          <div className="flex-1">
            {count > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">{count.toLocaleString()}</span> positions available
              </p>
            )}
            <AIJobMatcherWrapper />
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList what={params.what || 'jobs at city of laredo'} where={params.where || ''} salary_min={params.salary_min} initialData={initialData} />
            </Suspense>
          </div>
        </div>

        {/* ── WHY LAREDO IS HIRING ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Why the City of Laredo Is Actively Hiring Right Now</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Laredo is not a typical mid-sized Texas city. Its position as the primary land gateway between the United States and Mexico shapes everything about how the municipality operates and staffs itself. Understanding the economic and demographic forces driving Laredo's growth is the clearest way to understand why so many city positions are open at any given time.
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            {laredoContext.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 font-bold rounded-full text-sm flex-shrink-0">{index + 1}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── DEPARTMENTS OVERVIEW ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Where City of Laredo Jobs Are Concentrated</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            The City of Laredo employs more than 3,000 full-time workers across its operating departments. The largest concentrations of open roles are typically in the departments that manage physical infrastructure and direct resident services.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {departmentOverview.map((dept, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <dept.icon className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900 text-sm">{dept.dept}</h3>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <p className="font-medium text-gray-700">Common roles</p>
                    <p className="text-gray-500">{dept.roles}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Current focus</p>
                    <p className="text-gray-500">{dept.focus}</p>
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
            <h2 className="text-2xl font-bold text-gray-900">City of Laredo Salary Ranges by Job Category</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Pay at the City of Laredo follows a classified salary schedule maintained by the Human Resources Department and reviewed during the annual budget process. The figures below reflect typical ranges across the major employment categories. Texas's zero state income tax increases the effective take-home value of every salary band listed.
          </p>
          <div className="space-y-4">
            {salaryBands.map((band, index) => (
              <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{band.category}</h3>
                    <p className="text-gray-500 text-sm mt-1">{band.examples}</p>
                    <p className="text-gray-400 text-xs mt-1 italic">{band.note}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-lg font-bold text-green-700">{band.range}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Figures are approximate. Actual compensation depends on step placement, applicable pay ordinance, and any specialty or bilingual differentials. Verify current salary schedules with the City of Laredo Human Resources Department.
          </p>
        </section>

        {/* ── CURRENT HIRING PRIORITIES ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Where Laredo Is Hiring Most Urgently in 2026</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Recruitment activity is not evenly distributed across city departments. These four areas are driving the highest volume of open postings right now, based on current operational needs and growth pressures.
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            {currentPriorities.map((item, index) => (
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
            <h2 className="text-2xl font-bold text-gray-900">How the City of Laredo Hiring Process Works</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Municipal hiring follows a structured sequence that differs from most private sector processes. Each step is designed to be merit-based and auditable. Knowing what to expect at each stage significantly reduces the chance of being eliminated on a technicality.
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

        {/* ── TMRS RETIREMENT ── */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Texas Municipal Retirement System: A Major Benefit of City Employment</h2>
              <p className="text-gray-700 mb-6">
                City of Laredo employees are enrolled in TMRS, a defined-benefit pension plan that sets municipal employment apart from most private sector alternatives. In an era when employer-funded pensions have become rare, TMRS remains one of the more compelling reasons to consider a long-term career in Texas city government.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {tmrsHighlights.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
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
            <Clock className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Jobs at the City of Laredo</h2>
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
            <strong>Disclaimer:</strong> Oh My Job is an independent job search platform and is not affiliated with, endorsed by, or associated with the City of Laredo or any of its departments, offices, or agencies. Job listings displayed on this page are aggregated from third-party sources and may not reflect all current openings posted directly through the City of Laredo's official Human Resources portal. For the most complete and up-to-date listing of City of Laredo positions, candidates should also consult the city's official recruitment website.
          </p>
        </section>
      </div>
    </>
  )
}