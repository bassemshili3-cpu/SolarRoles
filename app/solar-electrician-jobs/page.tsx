import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import { BadgeCheck, Cable, DollarSign, ShieldCheck, Wrench, Zap } from 'lucide-react'
import { getJobs } from '@/lib/getJobs'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Solar Electrician Jobs | PV, Electrical & Commissioning Roles',
  description: 'Solar electrician jobs across the United States. Browse residential, commercial, utility-scale, commissioning, and solar O&M electrical roles.',
  keywords: 'solar electrician jobs, photovoltaic electrician jobs, solar electrical technician jobs, solar journeyman electrician, PV commissioning electrician, solar O&M electrician',
  openGraph: {
    title: 'Solar Electrician Jobs | Now Hiring Nationwide',
    description: 'Browse solar electrician, PV commissioning, electrical service, and O&M roles across the United States.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solar Electrician Jobs',
    description: 'Find solar electrician and PV electrical jobs across the US.',
  },
  alternates: { canonical: 'https://www.solarroles.com/solar-electrician-jobs' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Solar Electrician Jobs',
  description: 'Solar electrician job listings across the United States, including installation, commissioning, service, and operations roles.',
  url: 'https://www.solarroles.com/solar-electrician-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Solar Electrician Jobs',
    description: 'Current solar electrician and photovoltaic electrical job listings',
  },
}

const electricianRoles = [
  {
    title: 'Residential Solar Electrician',
    description: 'Handles the electrical side of rooftop PV: service-panel work, conduit, inverter connections, interconnection, troubleshooting, and inspection corrections. The job often sits between the installation crew, homeowner, utility, and AHJ.',
    icon: Zap,
  },
  {
    title: 'Commercial PV Electrician',
    description: 'Works on larger rooftops, carports, and behind-the-meter systems. Expect more conduit runs, equipment rooms, switchgear coordination, and plan-set work than on a typical residential crew.',
    icon: Cable,
  },
  {
    title: 'Utility-Scale Electrical Technician',
    description: 'Builds, tests, and maintains the electrical systems that turn an array into a generating plant: DC collection, inverters, transformers, controls, and field verification. Travel and per diem are common on construction projects.',
    icon: Wrench,
  },
  {
    title: 'PV Commissioning Electrician',
    description: 'Steps in near the end of a project to verify wiring, polarity, communications, protection settings, and equipment operation before turnover. This is a detail-heavy role where documentation matters as much as installation speed.',
    icon: BadgeCheck,
  },
  {
    title: 'Solar O&M Electrician',
    description: 'Maintains operating sites instead of building new ones. Typical work includes fault isolation, inverter and combiner troubleshooting, preventive maintenance, and responding to monitoring alarms.',
    icon: ShieldCheck,
  },
]

const qualifications = [
  {
    name: 'State electrical license or apprenticeship status',
    description: 'Most electrical work on a solar project is governed by state and local licensing rules. Employers may hire apprentices, journeymen, or master electricians depending on the work scope and required supervision.',
  },
  {
    name: 'PV-specific DC safety knowledge',
    description: 'Solar adds sustained DC arcs, daylight-generated voltage, and equipment-specific isolation procedures to an electrician’s AC foundation. This is especially important on commissioning, service, and utility-scale work.',
  },
  {
    name: 'OSHA 10 or OSHA 30',
    description: 'OSHA 10 is a common construction baseline. OSHA 30 is more typical when the role includes crew leadership, site coordination, or safety responsibility.',
  },
  {
    name: 'NABCEP or manufacturer training',
    description: 'Not every electrician role requires NABCEP. It can still help demonstrate PV fluency, while manufacturer training matters most when the employer works heavily with a specific inverter, battery, or monitoring platform.',
  },
]

const faqs = [
  {
    question: 'What does a solar electrician do that a solar installer does not?',
    answer: 'The overlap depends on the project and local rules. Solar electricians are generally responsible for the electrical scope: conductors, conduit, grounding and bonding, inverters, service equipment, testing, and interconnection. Install crews may handle racking and modules, while the electrician owns the work that requires electrical licensing or supervision.',
  },
  {
    question: 'Do I need to be a licensed electrician to work in solar?',
    answer: 'Not for every solar job. Entry-level installation work can be open to helpers and installers, while electrical tasks may require a license or supervision under one. The exact boundary is set by state and local rules, the project scope, and the employer’s electrical contractor structure.',
  },
  {
    question: 'Can a residential electrician move into solar?',
    answer: 'Yes. Residential service-panel, branch-circuit, conduit, and inspection experience transfers well. The important addition is PV-specific training: DC circuit behavior, inverter and rapid-shutdown systems, array-side isolation, and the site safety procedures used by the employer.',
  },
  {
    question: 'Are solar electrician jobs only construction jobs?',
    answer: 'No. New construction is a large part of the market, but operating sites also need electrical service and O&M technicians. Commissioning roles, warranty work, repowers, battery additions, and troubleshooting can offer a different schedule from installation crews.',
  },
  {
    question: 'How much do solar electricians earn?',
    answer: 'Solar electrician pay is not reported as a separate national occupation, so listings vary by license level, region, union status, travel, overtime, and project type. The BLS reported a $62,350 median annual wage for electricians across all industries in May 2024; solar-specific offers can sit above or below that benchmark depending on those factors.',
  },
  {
    question: 'What should I look for in a solar electrician job posting?',
    answer: 'Look beyond the title. Check whether the work is new installation, commissioning, service, or O&M; the voltage and equipment involved; whether travel or per diem is included; the required license level; and whether the employer provides PV-specific safety and equipment training.',
  },
]

export default async function SolarElectricianJobsPage({ searchParams }: any) {
  const params = await searchParams
  const descriptionContainsAny = [
    'solar electrician',
    'photovoltaic electrician',
    'pv electrician',
    'electrical technician',
    'journeyman electrician',
    'licensed electrician',
  ]

  const initialData = await getJobs({
    descriptionContainsAny,
    requiredDomainTerms: ['solar', 'photovoltaic', ' pv ', 'electrician', 'Electrician',],
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Solar Electrician Jobs</h1>
          <p className="text-gray-600 max-w-3xl">Find electrical roles across solar installation, commissioning, service, and operations &amp; maintenance.</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80"><JobFilters /></aside>
          <div className="flex-1">
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || ''}
                searchLabel="solar electrician "
                where={params.where || ''}
                salary_min={params.salary_min}
                descriptionContainsAny={descriptionContainsAny}
                requiredDomainTerms={['solar', 'photovoltaic', ' pv ']}
                initialData={initialData}
              />
            </Suspense>
          </div>
        </div>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><Zap className="w-7 h-7 text-orange-500" /><h2 className="text-2xl font-bold text-gray-900">Types of Solar Electrician Roles</h2></div>
          <p className="text-gray-600 mb-6 max-w-4xl">“Solar electrician” is not one job. The work changes substantially between a residential interconnection, a commercial electrical room, a utility-scale commissioning package, and an operating site.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {electricianRoles.map((role) => (
              <div key={role.title} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <role.icon className="w-10 h-10 text-orange-500 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><Cable className="w-7 h-7 text-blue-600" /><h2 className="text-2xl font-bold text-gray-900">The Part of Solar Work Most Electricians Underestimate</h2></div>
          <div className="max-w-4xl space-y-4 text-gray-600">
            <p>Solar work is not simply AC electrical work installed outdoors. The DC side of a PV system stays a source while modules are in daylight, and DC arcs do not behave like AC arcs. That changes how electricians read the system, isolate equipment, and plan work around energized conductors.</p>
            <p><Link href="/resources/solar-dc-safety-for-electricians" className="text-blue-700 underline hover:text-blue-900">Why Solar DC Safety Is Different for Electricians</Link> explains the shift from conventional AC work to photovoltaic DC hazards, including why “off” does not always mean every circuit is de-energized.</p>
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><BadgeCheck className="w-7 h-7 text-green-600" /><h2 className="text-2xl font-bold text-gray-900">Licensing, Scope, and the Electrical Contractor Question</h2></div>
          <div className="max-w-4xl space-y-4 text-gray-600">
            <p>A job ad can split a project into “DC-side” and “AC-side” tasks. That language describes a crew’s workflow; it does not automatically determine what unlicensed workers may perform. Licensing and supervision rules still come from the jurisdiction where the project is located.</p>
            <p>For a concrete example, our guide to <Link href="/resources/solar-installer-vs-electrician-texas" className="text-green-700 underline hover:text-green-900">solar installer versus electrician requirements in Texas</Link> shows why the legal scope can be broader than a job-posting label suggests.</p>
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><ShieldCheck className="w-7 h-7 text-blue-600" /><h2 className="text-2xl font-bold text-gray-900">Qualifications Employers Look For</h2></div>
          <div className="grid md:grid-cols-2 gap-5">
            {qualifications.map((qualification) => (
              <div key={qualification.name} className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-1">{qualification.name}</h3>
                <p className="text-gray-600 text-sm">{qualification.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><DollarSign className="w-7 h-7 text-green-600" /><h2 className="text-2xl font-bold text-gray-900">Solar Electrician Pay: What Changes the Offer</h2></div>
          <p className="text-gray-600 mb-6 max-w-4xl">Solar electrician pay is shaped less by the word “solar” in the title than by your license level, the project type, travel requirements, overtime, and whether the role is construction or operating-site work.</p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-5 text-center border border-gray-200">
              <p className="text-3xl font-bold text-green-600 mb-2">Apprentice</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">Training wage progression</p>
              <p className="text-xs text-gray-500">Pay usually rises by program period as supervised hours and responsibilities accumulate.</p>
            </div>
            <div className="bg-white rounded-xl p-5 text-center border border-gray-200">
              <p className="text-3xl font-bold text-blue-600 mb-2">$62,350</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">Electrician median pay</p>
              <p className="text-xs text-gray-500">National 2024 median for electricians across all industries, not a solar-only wage.</p>
            </div>
            <div className="bg-white rounded-xl p-5 text-center border border-gray-200">
              <p className="text-3xl font-bold text-purple-600 mb-2">Project premium</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">Travel, overtime, and scope</p>
              <p className="text-xs text-gray-500">Utility-scale, commissioning, union, and per-diem work can change the total package substantially.</p>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><ShieldCheck className="w-7 h-7 text-blue-600" /><h2 className="text-2xl font-bold text-gray-900">Solar Electrician Job FAQ</h2></div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.question} className="group bg-white border border-gray-200 rounded-xl overflow-hidden">
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
      </div>
    </>
  )
}
