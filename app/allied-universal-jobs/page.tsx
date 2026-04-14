import { Suspense } from 'react' 
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, BookOpen, TrendingUp, Users } from 'lucide-react'

import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Allied Universal Jobs Hiring Now | Security & Specialized Roles Across the US',
  description: 'Explore allied universal jobs currently open across the United States, including security officer, canine team roles, technology and event services. Discover diverse career paths and apply.',
  keywords: 'allied universal jobs, allied universal careers, allied universal hiring, security jobs allied universal, allied universal canine careers, allied universal tech jobs',
  openGraph: {
    title: 'Allied Universal Jobs Open Now | Security & Professional Positions',
    description: 'Browse current allied universal jobs in security, event services, canine teams and technology sectors across the US.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Allied Universal Jobs | Nationwide Openings in Security & Specialist Tracks',
    description: 'Find allied universal jobs in multiple domains including security, canine units, tech and event operations. Apply where you qualify.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/allied-universal-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Allied Universal Jobs',
  description: 'Comprehensive overview of allied universal jobs available nationwide in security, canine units, event services and more.',
  url: 'https://www.oh-my-job.com/allied-universal-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Allied Universal Jobs',
    description: 'Active positions open under allied universal jobs with multiple specializations.',
  },
}

const jobCategories = [
  {
    title: 'Security Officer & Patrol Roles',
    description: 'Frontline security positions responsible for safeguarding people and property at commercial, industrial, and residential sites.',
    icon: Shield,
  },
  {
    title: 'Canine (K9) Security Specialist',
    description: 'Work with trained dogs to provide detection, patrol and deterrence services in high‑priority environments, unique among allied universal jobs.',
    icon: Users,
  },
  {
    title: 'Event and Crowd Management',
    description: 'Roles supporting large events, venues, and spectator safety, combining hospitality with security operations.',
    icon: Briefcase,
  },
  {
    title: 'Security Technology & Systems',
    description: 'Positions in installation, monitoring, and servicing of security technology and integrated risk systems.',
    icon: TrendingUp,
  },
  {
    title: 'Supervisory & Management',
    description: 'Sites and regional supervisory roles overseeing security teams, performance, and client engagement.',
    icon: Users,
  },
  {
    title: 'Corporate Support Careers',
    description: 'Corporate allied universal jobs in HR, finance, compliance, and operations that support field functions.',
    icon: MapPin,
  },
]

const hiringSteps = [
  {
    step: '1',
    title: 'Search Allied Universal Jobs Online',
    description: 'Use the Allied Universal careers portal to filter allied universal jobs by role, location, and specialization.',
  },
  {
    step: '2',
    title: 'Initial Screening and Assessment',
    description: 'After application, Allied Universal reviews your profile for minimum requirements and relevant experience across chosen allied universal jobs categories.',
  },
  {
    step: '3',
    title: 'Background Investigation',
    description: 'Federal, state, and local background checks are part of the security clearance process for allied universal jobs.',
  },
  {
    step: '4',
    title: 'Role‑Specific Orientation and Training',
    description: 'Successful candidates receive role‑dependent orientation and training modules, including specialized units such as canine or technology functions.',
  },
]

const salaryByRole = [
  { role: 'Unarmed Security Officer', salary: '$32,000 to $40,000' },
  { role: 'Armed Security Officer', salary: '$38,000 to $52,000' },
  { role: 'Site Supervisor', salary: '$42,000 to $58,000' },
  { role: 'Account Manager', salary: '$55,000 to $75,000' },
  { role: 'Flex Officer', salary: '$34,000 to $44,000' },
  { role: 'Corporate Roles', salary: '$50,000 to $90,000+' },
]

const faqs = [
  {
    question: 'What kinds of allied universal jobs are currently available?',
    answer: 'Open positions range from unarmed and armed security officers to specialized tracks like canine security, event services, security technology, and corporate support roles.',
  },
  {
    question: 'Do I need experience to apply for allied universal jobs?',
    answer: 'Many allied universal jobs accept applicants with little to no prior security experience, while other specialized tracks may require certifications or relevant background.',
  },
  {
    question: 'Can working at Allied Universal lead to long‑term career development?',
    answer: 'Internal career progression is a key part of allied universal jobs culture, with many leaders beginning in frontline roles and advancing through structured development paths.',
  },
  {
    question: 'Are there opportunities outside traditional security roles?',
    answer: 'Yes, allied universal jobs also include careers in technology services, risk consulting, event operations and canine programs, broadening pathways beyond conventional guard roles.',
  },
]

const tips = [
  {
    title: 'Obtain Your State Guard Card Early',
    description: 'Starting the licensing process before applying shortens your time to hire.',
  },
  {
    title: 'Highlight Communication Skills',
    description: 'Allied Universal values officers with strong interpersonal skills in addition to security training.',
  },
  {
    title: 'Be Flexible Across Roles and Locations',
    description: 'Availability for multiple sites or specialties can accelerate your placement.',
  },
  {
    title: 'Ask About DailyPay and Weekly Pay Options',
    description: 'Financial flexibility programs are highly appreciated by employees and can affect your onboarding experience.',
  },
]

const stateRequirements = [
  { state: 'California', note: 'BSIS Guard Card required; 8-hour training before assignment, 16 hours on-the-job training within first 30 days' },
  { state: 'Texas', note: 'Level II or Level III (armed) license from the Texas DPS required before starting work' },
  { state: 'Florida', note: 'Class D (unarmed) or Class G (armed) license from the Florida Department of Agriculture required' },
  { state: 'New York', note: 'Security Guard Registration through the DCJS required; 8-hour pre-assignment and 16-hour on-the-job training mandated' },
  { state: 'Illinois', note: 'PERC card from the Illinois Department of Financial and Professional Regulation required' },
  { state: 'Washington', note: 'Security Guard license from the Washington Department of Licensing required prior to employment' },
]

export default async function AlliedUniversalJobsPage({ searchParams }: any) {
  const params = await searchParams

// Corrigé (pour que le filtre salary fonctionne si un visiteur l'utilise)
const [{ count }, initialData] = await Promise.all([
  getMergedJobCount(params.what || 'Allied Universal', params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
  searchMergedJobs({ what: params.what || 'Allied Universal', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Allied Universal Jobs Hiring Across the United States
          </h1>
          <p className="text-gray-700">
            Discover allied universal jobs spanning frontline security work, specialized units like canine teams, event operations, tech services, and corporate functions. Browse opportunities and apply today.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="Allied Universal" />
          </aside>
          <div className="flex-1">
            {count > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">{count.toLocaleString()}</span> allied universal jobs available
              </p>
            )}

            <AIJobMatcherWrapper />

            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'Allied Universal'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData}
              />
            </Suspense>
          </div>
        </div>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Role Categories Within Allied Universal Jobs</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobCategories.map((cat, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <cat.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{cat.title}</h3>
                <p className="text-gray-600 text-sm">{cat.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">How to Get Hired at Allied Universal</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {hiringSteps.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-green-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 font-bold rounded-full text-sm mb-4">
                  {item.step}
                </span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Salary Information for Allied Universal Employees</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <div className="grid md:grid-cols-3 gap-3">
              {salaryByRole.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-3 flex justify-between items-center">
                  <span className="text-sm text-gray-700 font-medium">{item.role}</span>
                  <span className="text-sm font-bold text-green-600">{item.salary}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Getting Hired Quickly</h2>
          </div>
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

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Allied Universal Jobs</h2>
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
      </div>
    </>
  )
}