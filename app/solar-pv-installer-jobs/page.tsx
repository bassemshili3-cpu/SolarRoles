import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import { Sun, Wrench, DollarSign, ShieldCheck, Award, TrendingUp } from 'lucide-react'
import { getJobs } from '@/lib/getJobs'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Solar PV Installer Jobs | Residential, Commercial & Utility-Scale',
  description: 'Solar photovoltaic installer positions across the United States. Residential, commercial, and utility-scale roles with pay ranges, certification requirements, and career paths.',
  keywords: 'solar installer jobs, solar pv installer, solar technician jobs, nabcep jobs, residential solar installer, utility scale solar jobs, solar panel installer',
  openGraph: {
    title: 'Solar PV Installer Jobs | Now Hiring Nationwide',
    description: 'Browse open solar photovoltaic installer positions. Entry-level to lead installer roles across residential, commercial, and utility-scale projects.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solar PV Installer Jobs',
    description: 'Find solar photovoltaic installer openings across the US. Residential, commercial, and utility-scale employers hiring now.',
  },
  alternates: { canonical: 'https://www.solarroles.com/solar-pv-installer-jobs' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Solar PV Installer Jobs',
  description: 'Solar photovoltaic installer job listings across the United States, covering residential, commercial, and utility-scale employers.',
  url: 'https://www.solarroles.com/solar-pv-installer-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Solar PV Installer Jobs',
    description: 'Current solar photovoltaic installer job listings',
  },
}

const installerRoles = [
  {
    title: 'Residential Installer',
    description: "Rooftop systems on single-family homes, usually 4 to 12kW. Crews of 2 to 4 move between multiple sites in a day. This is where most installers start, and where the bulk of entry-level hiring happens.",
    icon: Sun,
  },
  {
    title: 'Commercial & Industrial Installer',
    description: "Larger rooftop or carport arrays on warehouses, schools, and office buildings. Systems range from 50kW into the megawatts. Work is more structured than residential, often unionized on prevailing-wage projects.",
    icon: Wrench,
  },
  {
    title: 'Utility-Scale Installer',
    description: "Ground-mount arrays on solar farms spanning hundreds of acres. Longer project timelines, higher pay, and often per diem for travel. Crews here work with tracker systems and higher-voltage combiner setups.",
    icon: TrendingUp,
  },
  {
    title: 'Lead Installer / Foreman',
    description: "Runs the crew, manages the daily install schedule, and signs off on quality before inspection. Usually requires 2 to 4 years of field experience plus a track record of clean, code-compliant installs.",
    icon: ShieldCheck,
  },
  {
    title: 'O&M Technician',
    description: "Maintains systems already in the ground: panel cleaning, inverter troubleshooting, monitoring system diagnostics, and warranty repairs. Less physically demanding than new installs, steadier year-round schedule.",
    icon: Award,
  },
  {
    title: 'Battery Storage Installer',
    description: "Installs and commissions residential and commercial battery systems, often paired with a PV install. Demand here is growing fast as storage attaches to a growing share of new solar contracts.",
    icon: DollarSign,
  },
]

const certifications = [
  { name: 'NABCEP PV Associate', description: 'Entry-level credential for people new to the field. Tests core PV knowledge before hands-on field experience. A strong signal to employers that you understand the fundamentals.' },
  { name: 'NABCEP PV Installation Professional', description: "The credential that matters most for advancement. Requires documented field experience plus a technical exam. Most lead installer postings either require it or list it as strongly preferred." },
  { name: 'OSHA 10 / OSHA 30', description: "OSHA 10 is the baseline most employers require before you set foot on a jobsite. OSHA 30 is more common for foreman and supervisory roles, and some commercial general contractors require it site-wide." },
  { name: 'Fall Protection Certification', description: "Required for any roof-based work under OSHA rules once you're above a certain height. Course takes a day, and most employers will cover or reimburse the cost." },
  { name: 'Electrical License', description: "Not required for most installer roles, but a licensed electrician on the team is often mandatory for final connections and inspection. Installers who pursue an electrical license usually see the fastest pay jumps." },
]

const faqs = [
  {
    question: 'What does a solar PV installer actually do day to day?',
    answer: "Mounting racking systems, running conduit, placing and wiring panels, and connecting the array to an inverter and the electrical panel. Most of the work happens on a roof or a ground-mount frame, often in direct sun. A residential crew typically completes one system per day.",
  },
  {
    question: 'How much do solar installers earn?',
    answer: "The median annual wage for solar photovoltaic installers was $51,860 as of May 2024, according to the Bureau of Labor Statistics. Entry-level helpers on residential crews tend to start closer to $35,000 to $40,000. Lead installers and workers on utility-scale projects with several years of experience commonly clear $65,000 to $75,000, and licensed electricians working solar installs earn more on top of that.",
  },
  {
    question: 'Do I need a certification to get hired?',
    answer: "Not for an entry-level helper role. Most employers train on the job and expect you to pick up NABCEP PV Associate or OSHA 10 within the first months. For lead installer or foreman roles, NABCEP PV Installation Professional is commonly required or strongly preferred.",
  },
  {
    question: 'Is solar installer work physically demanding?',
    answer: "Yes. Expect to carry panels up ladders, work on sloped roofs, and spend full days outdoors in heat or cold depending on region and season. It's a trade job, closer in physical demand to roofing or general construction than to an electrician's bench work.",
  },
  {
    question: 'Is the job growing or shrinking?',
    answer: "Growing quickly. BLS projects 42% employment growth for solar photovoltaic installers between 2024 and 2034, among the fastest of any occupation tracked, with about 4,100 openings projected each year nationally.",
  },
  {
    question: 'Can I move from installer into a different solar career?',
    answer: "Field experience as an installer is a common entry point into project management, system design, sales, or an electrician apprenticeship. Employers value the on-roof experience even for roles that later move indoors.",
  },
]

export default async function SolarPvInstallerJobsPage({ searchParams }: any) {
  const params = await searchParams

  const initialData = await getJobs({
    // Scopes this landing page to installer roles via a keyword AND-filter,
    // independent of the user's own `what` search box below — same pattern
    // used elsewhere for niche landing pages (see job-where.ts comment).
    descriptionContainsAny: ['installer', 'installation technician', 'pv installer'],
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Solar PV Installer Jobs</h1>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80"><JobFilters /></aside>
          <div className="flex-1">
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || ''}
                searchLabel="solar pv installer "
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData}
              />
            </Suspense>
          </div>
        </div>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><Sun className="w-7 h-7 text-orange-500" /><h2 className="text-2xl font-bold text-gray-900">Types of Solar Installer Roles</h2></div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            "Solar installer" covers a wide range of work. A residential crew and a utility-scale crew do fundamentally different jobs, with different pay, schedules, and physical demands.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {installerRoles.map((role, index) => (
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
            Most employers will hire and train a motivated entry-level candidate. These credentials are what move you from helper to lead installer, and what employers screen for on higher-paying postings.
          </p>
          <div className="space-y-4">
            {certifications.map((cert, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="font-semibold text-gray-900 mb-1">{cert.name}</p>
                <p className="text-gray-600 text-sm">{cert.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><DollarSign className="w-7 h-7 text-green-600" /><h2 className="text-2xl font-bold text-gray-900">Solar Installer Salary Ranges</h2></div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The median annual wage for solar photovoltaic installers was $51,860 as of May 2024, per the Bureau of Labor Statistics. Actual pay depends heavily on region, project type, and experience.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-5 text-center border border-gray-200">
              <p className="text-3xl font-bold text-green-600 mb-2">$35K+</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">Entry Level</p>
              <p className="text-xs text-gray-500">Residential helper, no certification required to start</p>
            </div>
            <div className="bg-white rounded-xl p-5 text-center border border-gray-200">
              <p className="text-3xl font-bold text-blue-600 mb-2">$52K+</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">Experienced Installer</p>
              <p className="text-xs text-gray-500">National median, 2+ years field experience</p>
            </div>
            <div className="bg-white rounded-xl p-5 text-center border border-gray-200">
              <p className="text-3xl font-bold text-purple-600 mb-2">$70K+</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">Lead Installer / Utility-Scale</p>
              <p className="text-xs text-gray-500">Foreman roles, licensed electricians, commercial and utility projects</p>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><TrendingUp className="w-7 h-7 text-orange-500" /><h2 className="text-2xl font-bold text-gray-900">Job Outlook</h2></div>
          <p className="text-gray-600 max-w-4xl">
            The Bureau of Labor Statistics projects 42% employment growth for solar photovoltaic installers between 2024 and 2034, among the fastest growth rates of any tracked occupation, with roughly 4,100 openings projected annually nationwide.
          </p>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><ShieldCheck className="w-7 h-7 text-blue-600" /><h2 className="text-2xl font-bold text-gray-900">Solar Installer Job FAQ</h2></div>
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

        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> Salary and outlook figures are drawn from Bureau of Labor Statistics data and represent national averages. Actual pay varies by employer, region, and experience. Verify certification requirements and safety standards directly with employers and OSHA.
          </p>
        </section>
      </div>
    </>
  )
}