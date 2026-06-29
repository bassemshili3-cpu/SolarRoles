import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, DollarSign, MapPin, Building2, Users, TrendingUp, HeartPulse, Wrench } from 'lucide-react'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'City of Grand Rapids Jobs | Municipal Positions Open',
  description: 'Grand Rapids city roles across fire, police, parks, and administration. Michigan pension and full benefits make the pay stretch further.',
  keywords: 'city of grand rapids jobs, grand rapids city jobs, grand rapids municipal jobs, grand rapids government jobs, city of grand rapids careers, grand rapids michigan city employment',
  openGraph: {
    title: 'City of Grand Rapids Jobs | Municipal Positions',
    description: 'Browse open positions with the City of Grand Rapids. Pension, benefits, job security, and one of the most affordable metros in the Midwest.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'City of Grand Rapids Jobs 2026 | Government Careers',
    description: 'Municipal jobs in Grand Rapids, MI. Police, fire, parks, public works, planning, admin. Full pension + benefits.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/city-of-grand-rapids-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'City of Grand Rapids Jobs',
  description: 'Find municipal job openings with the City of Grand Rapids, Michigan. Browse positions across all city departments.',
  url: 'https://www.oh-my-job.com/city-of-grand-rapids-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available City of Grand Rapids Jobs',
    description: 'Current job listings with the City of Grand Rapids and related municipal employers',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I apply for a City of Grand Rapids job?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The City of Grand Rapids posts all openings on governmentjobs.com/careers/grandrapids. You create a profile, upload your resume, and submit applications through the portal. Some positions require supplemental questionnaires or testing. The HR office can be reached at 616-456-3176 for questions about the application process.',
      },
    },
    {
      '@type': 'Question',
      name: 'What benefits do City of Grand Rapids employees receive?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'City employees receive a defined benefit pension through MERS (Municipal Employees Retirement System), medical, dental, and vision insurance, paid vacation and sick leave, paid holidays, life insurance, and a deferred compensation plan. The pension alone is a benefit that most private sector employers in the region do not offer.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much do City of Grand Rapids jobs pay?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pay varies significantly by department and role. Administrative support positions start around $38,000 to $48,000. Skilled trades and public safety roles range from $50,000 to $80,000. Management and professional positions pay $65,000 to $110,000+. All salaries are public record and posted with each job listing.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does the City of Grand Rapids require residency?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The City does not currently require employees to live within city limits for most positions. However, some public safety roles may have residency preferences or response-time requirements. Living within Grand Rapids does subject you to the city income tax (1% for residents versus 0.5% for non-resident workers), which is a factor to consider when comparing net pay.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Grand Rapids a good city to work in government?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Grand Rapids consistently ranks among the best mid-size cities in the US for affordability, livability, and job growth. The cost of living is roughly 15% below the national average, while city government salaries are competitive with regional private sector pay. The combination of a pension, low housing costs, and a growing local economy makes municipal work in Grand Rapids unusually attractive compared to similar roles in larger or more expensive metros.',
      },
    },
  ],
}

/* ─── SECTION DATA ──────────────────────────────────────────── */

const departments = [
  {
    name: 'Police Department',
    roles: 'Police Officer, Detective, Community Policing Specialist, Records Clerk, Crime Analyst, Dispatch',
    salary: '$52K to $82K (sworn officers)',
    insight: 'Grand Rapids PD runs a 16-week academy for new recruits followed by a field training program. The department has invested heavily in community policing and de-escalation training, which means the hiring process evaluates communication skills and temperament as heavily as physical fitness. Lateral transfers from other Michigan departments are common and come with accelerated onboarding.',
  },
  {
    name: 'Fire Department',
    roles: 'Firefighter/Paramedic, Fire Inspector, Fire Prevention Specialist, Apparatus Operator',
    salary: '$48K to $78K (plus overtime)',
    insight: 'GR Fire operates out of 11 stations and runs roughly 30,000 calls per year. The department requires paramedic certification for all new firefighter hires, which narrows the applicant pool but increases starting pay compared to fire departments that hire at the EMT-Basic level. The 24-on/48-off schedule gives firefighters the equivalent of 122 days off per year, not counting vacation or holidays.',
  },
  {
    name: 'Public Works',
    roles: 'Equipment Operator, Maintenance Worker, Fleet Mechanic, Traffic Signal Technician, Water Systems Operator',
    salary: '$40K to $68K',
    insight: 'Public Works maintains 850+ lane miles of road, 900+ miles of water and sewer lines, and the city vehicle fleet. Seasonal hiring peaks in spring for road maintenance and in fall for leaf collection, but permanent positions open throughout the year. CDL holders and workers with water/wastewater operator licenses are in the highest demand.',
  },
  {
    name: 'Parks and Recreation',
    roles: 'Recreation Program Coordinator, Park Maintenance Worker, Urban Forestry Technician, Facility Attendant',
    salary: '$36K to $58K (permanent); $14 to $18/hr (seasonal)',
    insight: 'The city manages 74 parks, 3 public pools, 2 golf courses, and 100+ miles of trails. Summer seasonal hiring starts in March for positions that run June through August. Permanent roles in urban forestry and park maintenance are year-round and require physical endurance plus familiarity with equipment like chainsaws, mowers, and aerial lifts.',
  },
  {
    name: 'Planning & Development',
    roles: 'City Planner, Zoning Administrator, Building Inspector, Economic Development Specialist, Code Compliance Officer',
    salary: '$52K to $95K',
    insight: 'Grand Rapids is in the middle of a sustained development cycle driven by medical corridor expansion, downtown residential construction, and neighborhood revitalization projects. This department is busier now than at any point in the city\'s recent history, which means more openings and faster hiring timelines than you would see in a city with a slower development pipeline.',
  },
  {
    name: 'Administration & Support',
    roles: 'Administrative Aide, Finance Analyst, HR Specialist, IT Systems Administrator, Communications Coordinator, Legal Staff',
    salary: '$38K to $85K',
    insight: 'These roles span City Hall and every department. They are the positions that keep the machinery of government functioning: payroll, budgets, public records, internal communications, and technology systems. The hiring bar for admin roles at the City is generally lower than private sector equivalents in terms of specialized experience, but the benefit package is significantly stronger.',
  },
]

const benefitsComparison = [
  { benefit: 'Retirement', city: 'Defined benefit pension (MERS) with employer contributions', private: '401(k) with typical 3% to 6% employer match (if offered)' },
  { benefit: 'Health insurance', city: 'Full medical, dental, and vision with employer covering 80% to 90% of premiums', private: 'Varies widely. Average employee share: $6,000 to $8,000/year for family coverage' },
  { benefit: 'Paid time off', city: 'Vacation (2 to 5 weeks based on tenure), 12+ sick days, 13 paid holidays', private: 'Average of 10 PTO days in first year, 6 to 8 holidays' },
  { benefit: 'Job security', city: 'Civil service protections. Layoffs are rare and follow seniority rules', private: 'At-will employment in Michigan. No seniority protections' },
  { benefit: 'Overtime rules', city: 'Strict adherence to FLSA. OT paid at 1.5x for eligible positions', private: 'Compliance varies. Exempt classifications sometimes misapplied' },
  { benefit: 'Tuition assistance', city: 'Available for job-related education at many municipal employers', private: 'Offered by some large employers; rare at small and mid-size companies' },
]

const whyGrandRapids = [
  {
    title: 'A City Government That Is Actually Growing',
    detail: 'Grand Rapids is not a shrinking Rust Belt city managing decline. Its population has grown steadily over the past decade, driven by healthcare expansion (Spectrum Health/Corewell, now one of Michigan\'s largest employers), a manufacturing sector that pivoted to advanced materials and food processing, and a downtown that has added thousands of residential units. A growing city means a growing city workforce: more infrastructure to maintain, more parks to manage, more services to deliver, and more positions to fill.',
  },
  {
    title: 'The Cost of Living Equation',
    detail: 'A City of Grand Rapids employee earning $55,000 has more purchasing power than someone earning $70,000 in Chicago or $85,000 in the DC suburbs. Median rent for a one-bedroom in Grand Rapids sits around $1,100. A three-bedroom house in the Eastown, Midtown, or Creston neighborhoods can be purchased for $200,000 to $280,000. When you combine those housing numbers with a pension and full benefits, the total compensation of a municipal job in Grand Rapids is competitive with roles that appear to pay 30% to 40% more in higher-cost metros.',
  },
  {
    title: 'The Pension Is the Number Nobody Talks About',
    detail: 'Michigan\'s MERS defined benefit pension is the single largest financial advantage of municipal employment that does not appear on a pay stub. A city employee who works 25 years and retires at a multiplier of 2.25% receives a pension equal to approximately 56% of their final average compensation, every year, for life. No 401(k) can replicate this with any certainty because pensions eliminate market risk and longevity risk simultaneously. A private sector worker would need to accumulate roughly $1.2 to $1.5 million in retirement savings to generate equivalent income. The pension alone is worth the math of comparing a city salary to a private sector offer.',
  },
]

const applicationProcess = [
  {
    step: 'Find the posting',
    detail: 'All City of Grand Rapids jobs are posted on governmentjobs.com/careers/grandrapids. Positions are listed with salary range, department, closing date, and required qualifications. Some positions remain open until filled; others have firm application deadlines. Check weekly because new postings are added on a rolling basis.',
  },
  {
    step: 'Create a profile and apply',
    detail: 'The portal requires a profile that includes your work history, education, and contact information. You can save a master application and reuse it. Most postings also require a supplemental questionnaire with job-specific questions. These questionnaires are scored and used to screen candidates, so generic answers will hurt you. Reference the specific duties listed in the job posting when you write your responses.',
  },
  {
    step: 'Testing and interviews',
    detail: 'Many City positions include a civil service exam, a skills test, or both. Police and fire roles involve physical agility testing, a written exam, an oral board interview, a background investigation, and a medical exam. Administrative and professional roles typically involve a panel interview and may include a work sample exercise. Applicants living 250+ miles from Grand Rapids may be offered remote testing options.',
  },
  {
    step: 'Hiring and onboarding',
    detail: 'The City\'s hiring timeline runs longer than private sector processes. Expect 4 to 8 weeks from application close to interview, and another 2 to 4 weeks from interview to offer for non-public-safety roles. Public safety hiring can take 3 to 6 months due to background investigations and academy scheduling. Patience is part of the process; it is not an indication of disinterest.',
  },
]

const faqs = [
  {
    question: 'How do I apply for a City of Grand Rapids job?',
    answer: 'All positions are posted on the City\'s portal at governmentjobs.com/careers/grandrapids. You create a free profile, build your application with work history and education, complete any supplemental questionnaires, and submit. The City\'s HR office at 616-456-3176 can answer questions about the process or specific postings.',
  },
  {
    question: 'What benefits come with a City of Grand Rapids position?',
    answer: 'Full-time employees receive a defined benefit pension through MERS, medical/dental/vision insurance with the city covering the majority of premiums, 2 to 5 weeks of vacation (based on tenure), 12+ sick days, 13 paid holidays, life insurance, and access to a deferred compensation (457) plan. The pension is the standout benefit: it provides guaranteed retirement income for life, which is increasingly rare in the broader job market.',
  },
  {
    question: 'How much do City of Grand Rapids employees make?',
    answer: 'Pay varies by role and department. Administrative aides start around $38,000. Skilled trades and public works roles range from $42,000 to $68,000. Police officers earn $52,000 to $82,000. Planning and professional positions pay $52,000 to $95,000. Management roles can exceed $100,000. All salary ranges are public and listed on each job posting.',
  },
  {
    question: 'Do I have to live in Grand Rapids to work for the City?',
    answer: 'No residency requirement applies to most positions. However, living in the city subjects you to the 1% city income tax (versus 0.5% for non-residents who work in Grand Rapids). Some public safety roles may have response-time expectations that effectively favor living nearby. The financial difference between living inside versus outside city limits on a $60,000 salary is approximately $300 per year in additional city tax.',
  },
  {
    question: 'How long does the City of Grand Rapids hiring process take?',
    answer: 'For administrative and professional roles, expect 6 to 12 weeks from application submission to offer. For public safety (police and fire), the process takes 3 to 6 months due to physical testing, written exams, oral boards, background investigations, and medical clearance. Seasonal and part-time positions are hired faster, typically within 2 to 4 weeks.',
  },
  {
    question: 'Is a government job in Grand Rapids worth it compared to the private sector?',
    answer: 'On base salary alone, the private sector often pays 10% to 20% more for comparable roles. When you factor in the pension, full health coverage, paid time off, job security through civil service protections, and Grand Rapids\' low cost of living, the total compensation picture shifts. A city employee earning $55,000 with a pension and benefits is building long-term financial security that a private sector employee earning $70,000 with a 401(k) and at-will employment may never match.',
  },
]

export default async function CityOfGrandRapidsJobsPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'city of grand rapids', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'city of grand rapids', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {count > 0 ? count.toLocaleString() : ''} City of Grand Rapids Jobs Available Now
          </h1>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="city of grand rapids" />
          </aside>
          <div className="flex-1">
            {count > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">{count.toLocaleString()}</span> positions available
              </p>
            )}
            <AIJobMatcherWrapper />
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList what={params.what || 'city of grand rapids'} where={params.where || ''} salary_min={params.salary_min} initialData={initialData} />
            </Suspense>
          </div>
        </div>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Why Grand Rapids Municipal Jobs Are Worth More Than the Salary Suggests</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            City government salaries look modest on paper. What they do not show is the pension, the benefits, and the purchasing power of a paycheck in one of the most affordable metros in the Midwest. Here is why the math works differently than you expect.
          </p>
          <div className="space-y-6">
            {whyGrandRapids.map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                <h3 className="font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Every Department, What They Pay, and What It Is Actually Like to Work There</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            The City of Grand Rapids employs over 1,700 people across departments that range from policing to urban forestry. Each one operates differently in terms of culture, hiring cycle, and career trajectory.
          </p>
          <div className="space-y-4">
            {departments.map((dept, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h3 className="font-bold text-gray-900 text-lg">{dept.name}</h3>
                  <span className="text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">{dept.salary}</span>
                </div>
                <p className="text-gray-500 text-xs mb-2">Typical roles: {dept.roles}</p>
                <p className="text-gray-600 text-sm">{dept.insight}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">City Benefits vs. Private Sector: The Comparison Nobody Makes</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            The salary line on a city job posting tells you one number. The total compensation, including the pension, health coverage, and time off, tells a completely different story.
          </p>
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 gap-px bg-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="bg-white px-5 py-3">Benefit</div>
              <div className="bg-white px-5 py-3">City of Grand Rapids</div>
              <div className="bg-white px-5 py-3">Typical Private Sector</div>
            </div>
            {benefitsComparison.map((row, i) => (
              <div key={i} className="grid grid-cols-3 gap-px bg-gray-100">
                <div className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-5 py-4 text-sm font-medium text-gray-800`}>{row.benefit}</div>
                <div className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-5 py-4 text-sm text-gray-600`}>{row.city}</div>
                <div className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-5 py-4 text-sm text-gray-500`}>{row.private}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">How the City of Grand Rapids Hiring Process Works</h2>
                <p className="text-gray-700 mb-6">
                  Municipal hiring moves differently than private sector recruiting. The process is more structured, more transparent, and slower. Understanding each phase in advance helps you navigate it without frustration.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {applicationProcess.map((item, i) => (
                    <div key={i} className="bg-white rounded-lg p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 font-bold rounded-full text-xs">{i + 1}</span>
                        <h3 className="font-semibold text-gray-900 text-sm">{item.step}</h3>
                      </div>
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
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About City of Grand Rapids Jobs</h2>
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
            <strong>Disclaimer:</strong> Oh My Job is an independent job search platform and is not affiliated with the City of Grand Rapids, the State of Michigan, or any municipal entity. Job listings are sourced from third-party APIs and may not reflect all current openings. For the most complete and up-to-date list of City positions, visit governmentjobs.com/careers/grandrapids directly. Salary figures and benefit descriptions are estimates based on publicly available data and may not reflect specific offers. This page is for informational purposes only.
          </p>
        </section>
      </div>
    </>
  )
}