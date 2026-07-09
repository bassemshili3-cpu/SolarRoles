import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, BookOpen, Users } from 'lucide-react'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'City of Reno Jobs — Police, Fire, Public Works & Admin Openings in Reno NV',
  description: 'Reno city jobs span public safety, parks, administration, and infrastructure. Salary bands and civil service exam requirements shown per department.',
  keywords: 'city of reno jobs, reno city government careers, city of reno police hiring, reno firefighter jobs, reno public works employment, city of reno NV openings, reno municipal jobs',
  openGraph: {
    title: 'City of Reno Jobs: Public Safety, Admin & Public Works Roles | Oh My Job',
    description: 'Find city of reno jobs with pension-backed retirement, full health coverage, and structured pay scales. Search by department and apply through the official portal.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'City of Reno Jobs — Government Openings Updated Weekly',
    description: 'Police, fire, parks, code enforcement, and city admin — search city of reno jobs with transparent pay grades, pension details, and hiring timelines.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/city-of-reno-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'City of Reno Jobs Board',
  description: 'Searchable feed of city of reno jobs covering sworn public-safety positions, classified civil-service roles, and unclassified administrative appointments across all municipal departments.',
  url: 'https://www.oh-my-job.com/city-of-reno-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Active City of Reno Job Listings',
    description: 'Current directory of city of reno jobs from entry-level maintenance and clerical roles to senior public-safety and department-director positions.',
  },
}

const popularRoles = [
  { title: 'Police Officer', description: 'Complete a POST-certified academy, patrol assigned beats, investigate incidents, engage in community policing programs, and testify in Washoe County court proceedings — all under a union-backed pay scale with overtime and shift differentials.', icon: Shield },
  { title: 'Firefighter / Paramedic', description: 'Staff a 48/96 shift rotation responding to structure fires, medical emergencies, and hazmat incidents across Reno\'s urban and wildland-interface zones. Candidates must hold or obtain EMT-B or Paramedic certification.', icon: Briefcase },
  { title: 'Administrative Specialist', description: 'Support a specific city department — planning, finance, city clerk, or legal — by managing correspondence, processing permits, maintaining public records, and coordinating council-meeting logistics.', icon: FileText },
  { title: 'Public Works Technician', description: 'Maintain roads, stormwater systems, traffic signals, and city-owned buildings. Roles range from heavy-equipment operator and fleet mechanic to civil-engineering technician reviewing capital-improvement plans.', icon: MapPin },
  { title: 'Parks & Recreation Coordinator', description: 'Program seasonal youth camps, manage facility reservations at community centers, oversee trail-maintenance crews, and coordinate special events like the Reno River Festival logistics.', icon: Users },
  { title: 'Code Enforcement Officer', description: 'Investigate citizen complaints, inspect properties for zoning and building-code violations, document findings with photos and reports, and work with property owners on compliance timelines before escalating to municipal court.', icon: CheckCircle },
]

const outlookStats = [
  { label: 'Workforce Stability', value: 'Very High', note: 'Municipal layoffs are rare — budgets are tax-funded' },
  { label: 'Retirement-Driven Turnover', value: '5-8%/yr', note: 'Baby-boomer retirements creating steady vacancies' },
  { label: 'Reno Population Growth', value: '+15%', note: 'Since 2010 — driving demand for more city services' },
]

const salaryBreakdown = [
  { level: 'Entry-Level Classified', amount: '$42,000', source: 'Admin aides, maintenance workers' },
  { level: 'Mid-Career Professional', amount: '$68,000', source: 'Technicians, coordinators, analysts' },
  { level: 'Sworn Public Safety', amount: '$85,000+', source: 'Police officers, firefighters (base + OT)' },
]

const faqs = [
  {
    question: 'What makes city of reno jobs different from private-sector work?',
    answer: 'Three things: pension-backed retirement through PERS (the Public Employees\' Retirement System of Nevada), job security tied to tax-funded budgets rather than quarterly earnings, and structured pay scales where raises follow a predictable step-and-grade schedule. The trade-off is that hiring timelines are longer and pay ceilings for non-management roles are lower than comparable private-sector positions — but total compensation (pension + health + PTO) often closes the gap.',
  },
  {
    question: 'How much do city of reno jobs pay?',
    answer: 'Pay depends on the classification. Entry-level administrative and maintenance roles start in the low-$40K range. Mid-career professional positions like planners, analysts, and IT specialists land between $60K and $80K. Sworn police officers and firefighters earn $70K-$100K+ when overtime and shift differentials are included. All positions follow published pay grades, so you can see exactly where you start and what each annual step increase looks like before you accept an offer.',
  },
  {
    question: 'Do all city of reno jobs require a civil-service exam?',
    answer: 'No. Classified positions — which include most public-safety and union-covered roles — typically require a written exam, physical agility test, or skills assessment. Unclassified positions in professional and management categories (city attorney staff, department directors, certain IT roles) follow a standard application-and-interview process without a civil-service exam. Each posting specifies which process applies.',
  },
  {
    question: 'What benefits does the City of Reno provide?',
    answer: 'Full-time employees receive PERS pension enrollment (employer contributes a significant percentage of salary), medical-dental-vision coverage with the city covering the majority of premiums, a generous PTO bank that grows with tenure, paid holidays, life insurance, and access to deferred-compensation (457b) plans. Many departments also fund professional-development courses and certification renewals.',
  },
  {
    question: 'How do I actually submit an application for city of reno jobs?',
    answer: 'All applications go through the City of Reno\'s official portal on GovernmentJobs.com (also called NeoGov). You create a profile, upload your resume, and complete a supplemental questionnaire specific to each posting. Some roles require you to attach certifications (POST, EMT, CDL) at the application stage. Postings have firm closing dates — once the window shuts, late submissions are not accepted regardless of qualifications.',
  },
]

const tips = [
  {
    title: 'Start Studying for Civil-Service Exams Early',
    description: 'Reno\'s public-safety exams test reading comprehension, situational judgment, and basic math — skills that improve with practice. The city occasionally posts study guides on its careers page, and free prep resources are available through the NeoGov platform. Scoring in the top band of the eligibility list dramatically improves your chances of an interview.',
  },
  {
    title: 'Mirror the Job Posting Language in Your Application',
    description: 'NeoGov uses keyword matching to screen supplemental questionnaires. If the posting says "experience with stormwater management," use that exact phrase in your response — not a synonym like "drainage systems." Municipal HR teams score applications against the published minimum and desirable qualifications almost word for word.',
  },
  {
    title: 'Check the Portal Weekly — Postings Close Fast',
    description: 'Many city of reno jobs accept applications for only two to three weeks, and some close earlier if the applicant pool reaches a cap. Set up a NeoGov job-alert email for "City of Reno" so you are notified the day a new posting goes live rather than discovering it after the deadline passes.',
  },
  {
    title: 'Quantify Your Public-Service Impact',
    description: 'Municipal hiring panels respond to numbers. "Processed 120 permit applications per month with a 98% accuracy rate" or "Managed a $350K annual parks-maintenance budget" carries far more weight than "responsible for permits" or "oversaw parks budget." Bring this specificity into both your written application and your interview.',
  },
]

export default async function CityOfRenoJobsPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'city of reno', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'city of reno', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
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
            City of Reno Jobs — Public Safety, Administration, Parks & Public Works Openings
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="city of reno" />
          </aside>
          <div className="flex-1">


            

            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'city of reno'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Job Outlook Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Hiring Outlook for City of Reno Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Reno's population has grown roughly 15% since 2010, fueled by tech-company relocations, warehouse-logistics expansion along the I-80 corridor, and a steady influx of remote workers from the Bay Area. That growth puts direct pressure on city services — more residents means more 911 calls, more building permits, more park acreage to maintain, and more code complaints to investigate. At the same time, a wave of baby-boomer retirements is opening vacancies in departments that have had low turnover for decades. The result is a hiring window for city of reno jobs that is wider right now than it has been in years.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {outlookStats.map((stat, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
                <p className="text-4xl font-bold text-blue-600 mb-1">{stat.value}</p>
                <p className="font-semibold text-gray-900 mb-1">{stat.label}</p>
                <p className="text-sm text-gray-500">{stat.note}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Sources: U.S. Census Bureau population estimates; U.S. Bureau of Labor Statistics, State and Local Government employment projections; City of Reno annual budget documents.
          </p>
        </section>

        {/* Popular Roles Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Departments Hiring Most Often for City of Reno Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The City of Reno employs roughly 1,800 people across more than a dozen departments. The six roles below represent the positions that appear most frequently on the NeoGov portal — either because of high retirement-driven turnover (police, fire) or because growing demand creates net-new headcount (public works, parks). Understanding what each role involves day to day helps you decide which department aligns with your background before you invest time in an application and exam prep.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularRoles.map((role, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <role.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Salary Expectations Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">What City of Reno Jobs Pay — Base Salary Plus Total Compensation</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              Municipal pay in Reno follows published step-and-grade schedules, which means you know your starting salary and every future raise before you accept an offer — a transparency rare in the private sector. Base numbers may look modest next to tech-sector salaries in the Reno-Sparks metro, but the total-compensation picture changes significantly when you add PERS pension contributions (the employer match alone can equal 15-30% of salary depending on the tier), subsidized family health coverage, and PTO banks that grow with seniority.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {salaryBreakdown.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-5 text-center">
                  <p className="text-3xl font-bold text-green-600 mb-2">{item.amount}</p>
                  <p className="font-semibold text-gray-900 text-sm mb-1">{item.level}</p>
                  <p className="text-xs text-gray-500">{item.source}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Figures reflect approximate base-salary midpoints. Sworn positions include overtime and shift-differential earnings. Pension value, health-insurance subsidy, and PTO are not included in these numbers but can add 30-50% to effective total compensation.
            </p>
          </div>
        </section>

        {/* Requirements Section */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Qualifications & Hiring Process for City of Reno Jobs</h2>
              <p className="text-gray-700 mb-6">
                Reno uses two hiring tracks. Classified positions (most union-covered and public-safety roles) go through a civil-service process with scored exams and ranked eligibility lists. Unclassified positions (professional staff, department heads, certain IT and legal roles) follow a conventional application-interview-offer sequence. Every posting on NeoGov specifies which track applies — read it carefully before you start.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Common Minimum Qualifications</h3>
                  <ul className="text-gray-600 text-sm space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      High school diploma or GED for maintenance, clerical, and entry-level roles
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Valid Nevada driver license (or ability to obtain within 30 days of hire) for field positions
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      POST certification for police; EMT-B or Paramedic card for fire — both can be obtained through the city academy
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">What the Hiring Pipeline Looks Like</h3>
                  <ul className="text-gray-600 text-sm space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Submit application and supplemental questionnaire through NeoGov before the firm closing date
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Pass a written exam, physical agility test, or skills assessment (classified roles only)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Interview with department panel, then clear a background check and pre-employment medical/drug screen
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Four Strategies That Improve Your Odds on City of Reno Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Municipal hiring is slower and more procedural than the private sector, but the candidates who navigate it successfully share a few habits. Here is what separates applicants who land on the eligibility list from those who get screened out before an interview.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {tips.map((tip, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 font-bold rounded-full text-sm mb-4">
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
            <h2 className="text-2xl font-bold text-gray-900">City of Reno Jobs — Questions Applicants Ask Most</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Municipal hiring comes with its own vocabulary (classified, unclassified, PERS, NeoGov) and timelines that feel unfamiliar if you have only worked in the private sector. These five answers cover the practical questions that trip people up most when researching city of reno jobs.
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
            <strong>Disclaimer:</strong> Oh My Job is an independent job search platform with no affiliation to the City of Reno, Washoe County, or the State of Nevada. Salary ranges, benefit descriptions, and hiring-process details on this page are compiled from publicly available City of Reno budget documents, NeoGov postings, BLS wage data, and U.S. Census population estimates. Actual compensation, qualification requirements, and exam schedules for city of reno jobs are determined solely by the City of Reno Human Resources Department. Always verify current openings, closing dates, and application requirements on the official City of Reno careers portal before applying.
          </p>
        </section>
      </div>
    </>
  )
}