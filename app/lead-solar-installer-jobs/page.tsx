import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import { HardHat, ClipboardCheck, DollarSign, ShieldCheck, Award, Users } from 'lucide-react'
import { getJobs } from '@/lib/getJobs'
import Link from 'next/link'
import { formatSalaryK, getRoleSalaryStats, MIN_SALARY_LISTINGS } from '@/lib/roleSalary'


export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const stats = await getRoleSalaryStats('lead-solar-installer')
  const salarySuffix =
    stats && stats.count >= MIN_SALARY_LISTINGS && stats.avgMax > 0
      ? ` — Up to ${formatSalaryK(stats.avgMax)}/yr`
      : ''

  return {
    title: salarySuffix
      ? `Lead Solar Installer Jobs${salarySuffix}`
      : 'Lead Solar Installer Jobs | Foreman & Crew Lead Positions',
    description: 'Lead solar installer and foreman positions across the United States. Crew leadership roles with pay ranges, certification requirements, and what the job involves day to day.',
    keywords: 'lead solar installer jobs, solar foreman jobs, solar crew lead, installation supervisor solar, solar installation foreman, nabcep installation professional jobs',
    openGraph: {
      title: 'Lead Solar Installer Jobs | Now Hiring Nationwide',
      description: 'Browse open lead installer and foreman positions in solar. Crew leadership across residential, commercial, and utility-scale projects.',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Lead Solar Installer Jobs',
      description: 'Find lead installer and foreman openings in solar across the US. Residential, commercial, and utility-scale employers hiring now.',
    },
    alternates: { canonical: 'https://www.solarroles.com/lead-solar-installer-jobs' },
  }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Lead Solar Installer Jobs',
  description: 'Lead solar installer and foreman job listings across the United States, covering residential, commercial, and utility-scale employers.',
  url: 'https://www.solarroles.com/lead-solar-installer-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Lead Solar Installer Jobs',
    description: 'Current lead installer and foreman job listings',
  },
}

const leadRoles = [
  {
    title: 'Residential Crew Lead',
    description: "A residential lead runs a two- to four-person crew through one system per day. The lead assigns work and handles the homeowner walkthrough. Quality is checked before inspection.",
    icon: HardHat,
  },
  {
    title: 'Commercial Crew Lead',
    description: "Commercial leads oversee larger rooftops and carports for days or weeks. They coordinate with the project manager and track the schedule. Material deliveries also fall within the role.",
    icon: ClipboardCheck,
  },
  {
    title: 'Utility-Scale Foreman',
    description: "Utility foremen manage crews on ground-mount projects and report to a superintendent. They own daily production and safety. They also check tracker or combiner installation quality.",
    icon: Users,
  },
  {
    title: 'Working Foreman',
    description: "A working foreman stays on the tools while owning crew output and quality. This is the most common first leadership role. Promotion usually follows two to four years as an installer.",
    icon: Award,
  },
  {
    title: 'Installation Supervisor',
    description: "An installation supervisor oversees several crews instead of running one. The job centers on scheduling and quality audits. Training new installers replaces much of the physical work.",
    icon: ShieldCheck,
  },
]

const certifications = [
  {
    name: 'NABCEP PV Installation Professional',
    href: 'certifications/nabcep-pv-installation-professional',
    description: "Most employers expect this credential at the lead level. It requires documented field experience and a technical exam. The result supports responsibility for checking a crew's work.",
  },
  {
    name: 'OSHA 30',
    href: 'certifications/osha-30',
    description: "The standard for supervisory roles. Covers a broader range of jobsite hazards than OSHA 10 and is often required specifically for anyone directing other workers on site.",
  },
  {
    name: 'Competent Person (Fall Protection)',
    description: "OSHA requires a designated competent person to inspect fall protection systems and stop unsafe work. Lead installers are frequently the ones holding this designation on a residential or commercial crew.",
  },
  {
    name: 'Electrical License',
    description: "An electrical license appears more often at lead level, especially when crews handle final connections. A licensed crew lead can complete the hookup without waiting for a separate electrician.",
  },
  {
    name: 'First Aid / CPR',
    description: "Commonly required alongside OSHA 30 for whoever is designated crew lead, since they're the one responsible for handling an on-site injury before anyone else arrives.",
  },
]

const faqs = [
  {
    question: 'What does a lead installer do that a regular installer doesn\'t?',
    answer: "A lead assigns crew work and checks racking or wiring before it is covered. The lead also speaks with the customer, inspector and project manager. On residential crews, leads usually continue installing panels.",
  },
  {
    question: 'How much do lead installers and foremen earn?',
    answer: "Lead installer pay often starts around $58,000 to $65,000. BLS reported a $51,860 median for all PV installers in May 2024. Experienced commercial or utility foremen commonly earn $75,000 to $90,000. Multi-crew supervisors can clear $95,000, especially with an electrical license or prevailing-wage work.",
  },
  {
    question: 'Do you need NABCEP to become a lead installer?',
    answer: "Most employers require NABCEP PV Installation Professional or expect it during the first year. The credential verifies enough code knowledge to catch mistakes before inspection.",
  },
  {
    question: 'How many years of experience does it usually take to get promoted to lead?',
    answer: "Most postings ask for 2 to 4 years as an installer. Utility-scale foreman roles and multi-crew supervisor positions tend to ask for more, often 4 to 6 years, plus prior experience directing other workers.",
  },
  {
    question: 'Is lead installer a step toward project management?',
    answer: "For a lot of people, yes. Time spent running a crew, reading plan sets, and dealing directly with inspectors and customers is exactly the experience employers look for when hiring project managers or superintendents from within.",
  },
  {
    question: 'What\'s the difference between a foreman and an installation supervisor?',
    answer: "A foreman is usually still hands-on with one crew day to day. A supervisor oversees several crews at once, spending more time on scheduling and quality checks across sites than on the tools themselves.",
  },
]

export default async function LeadSolarInstallerJobsPage({ searchParams }: any) {
  const params = await searchParams

  const initialData = await getJobs({
    // Scopes this landing page to leadership-level roles via a keyword
    // AND-filter, independent of the user's own `what` search box below —
    // same pattern used on /solar-pv-installer-jobs.
    descriptionContainsAny: ['lead installer', 'installation foreman', 'crew lead', 'installation supervisor'],
    titleContainsAny: ['lead', 'Lead'],
    ...(params.what ? { what: params.what } : {}),
    where: params.where || '',
    resultsPerPage: 30,
    salaryMin: params.salary_min ? Number(params.salary_min) : undefined,
    postedWithin: params.posted_within ? Number(params.posted_within) : undefined,
    jobTypes: params.job_type ? params.job_type.split(',') : undefined,
    arrangements: params.arrangement ? params.arrangement.split(',') : undefined,
    experience: params.experience || undefined,
    education: params.education || undefined,
    companySizes: params.company_size ? params.company_size.split(',') : undefined,
    benefits: params.benefits ? params.benefits.split(',') : undefined,
    easyApply: params.easy_apply === 'true',
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Lead Solar Installer Jobs</h1>
        </header>

        

        <div className="flex flex-col lg:flex-row gap-10">
          
          <aside className="lg:w-80"><JobFilters /></aside>
          <div className="flex-1">
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || ''}
                searchLabel="lead solar installer "
                where={params.where || ''}
                salary_min={params.salary_min}
                descriptionContainsAny= {['lead installer', 'installation foreman', 'crew lead', 'installation supervisor']}
    titleContainsAny= {['lead', 'Lead']}
                whatJobsTitleIncludesAll={['lead', 'installer']}
                initialData={initialData}
              />
            </Suspense>
          </div>
        </div>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><HardHat className="w-7 h-7 text-orange-500" /><h2 className="text-2xl font-bold text-gray-900">Types of Lead Installer Roles</h2></div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            "Lead installer" and "foreman" mean different things depending on the project. A residential crew lead is still on the roof most of the day. A multi-crew supervisor rarely is.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leadRoles.map((role, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <role.icon className="w-10 h-10 text-orange-500 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><Award className="w-7 h-7 text-blue-600" /><h2 className="text-2xl font-bold text-gray-900">Certifications That Matter</h2></div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Lead-level postings screen for certifications directly. These are
            the credentials that appear most often for installers and foremen.
          </p>
          <div className="space-y-4">
          {certifications.map((cert, index) => (
  <div key={index} className="bg-white border border-gray-200 rounded-xl p-5">
    <p className="font-semibold text-gray-900 mb-1">
      {cert.href ? (
        <a href={cert.href} className="text-blue-700 hover:underline">
          {cert.name}
        </a>
      ) : (
        cert.name
      )}
    </p>
    <p className="text-gray-600 text-sm">{cert.description}</p>
  </div>
))}
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><DollarSign className="w-7 h-7 text-green-600" /><h2 className="text-2xl font-bold text-gray-900">Lead Installer Salary Ranges</h2></div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Lead roles pay above the $51,860 national installer median reported
            by BLS in May 2024. Crew size and project type change the offer.
            Region matters too.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-5 text-center border border-gray-200">
              <p className="text-3xl font-bold text-green-600 mb-2">$58K+</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">Working Foreman</p>
              <p className="text-xs text-gray-500">Residential crew lead, still on the tools daily</p>
            </div>
            <div className="bg-white rounded-xl p-5 text-center border border-gray-200">
              <p className="text-3xl font-bold text-blue-600 mb-2">$75K+</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">Commercial / Utility-Scale Foreman</p>
              <p className="text-xs text-gray-500">Larger crews, longer projects, NABCEP typically required</p>
            </div>
            <div className="bg-white rounded-xl p-5 text-center border border-gray-200">
              <p className="text-3xl font-bold text-purple-600 mb-2">$95K+</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">Multi-Crew Supervisor</p>
              <p className="text-xs text-gray-500">Overseeing several crews, often with an electrical license</p>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><ClipboardCheck className="w-7 h-7 text-orange-500" /><h2 className="text-2xl font-bold text-gray-900">Job Outlook</h2></div>
          <p className="text-gray-600 max-w-4xl">
            BLS projects 42% growth for solar PV installers from 2024 to 2034.
            More crews create more lead and foreman openings. Every crew needs
            someone responsible for the work.
          </p>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><ShieldCheck className="w-7 h-7 text-blue-600" /><h2 className="text-2xl font-bold text-gray-900">Lead Solar Installer Job FAQ</h2></div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group bg-white border border-gray-200 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                  <h3 className="font-semibold text-gray-900 pr-4">{faq.question}</h3>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-20 bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Related Roles &amp; Resources</h2>
          <p className="text-gray-600 max-w-3xl mx-auto mb-6">
            Lead-installer pay changes by state and project type. See the
            numbers on our{' '}
            <Link href="/data/salaries/lead-solar-installer" className="text-blue-700 underline hover:text-blue-900">Lead Solar Installer Salary by State</Link>{' '}
            page. Explore adjacent paths through{' '}
            <Link href="/solar-pv-installer-jobs" className="text-blue-700 underline hover:text-blue-900">solar PV installer jobs</Link>.
            You can also browse{' '}
            <Link href="/solar-electrician-jobs" className="text-blue-700 underline hover:text-blue-900">solar electrician jobs</Link>{' '}
            or{' '}
            <Link href="/solar-technician-jobs" className="text-blue-700 underline hover:text-blue-900">solar technician jobs</Link>.
          </p>
          <p className="text-gray-600 max-w-3xl mx-auto mb-6">
            To map the credentials for a lead role, read{' '}
            <Link href="/resources/solar-certifications-by-job-role" className="text-blue-700 underline hover:text-blue-900">certifications by job role</Link>{' '}
            and the{' '}
            <Link href="/resources/nabcep-pvis-vs-pvip" className="text-blue-700 underline hover:text-blue-900">NABCEP PVIS vs PVIP comparison</Link>{' '}
            .
          </p>
        </section>

        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> Salary and outlook figures use Bureau
            of Labor Statistics national data. Actual pay varies by employer,
            region and experience. Verify certification and OSHA requirements
            directly with employers.
          </p>
        </section>
      </div>
    </>
  )
}
