import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import { BatteryCharging, Zap, DollarSign, ShieldCheck, Award, Wrench, TrendingUp } from 'lucide-react'
import { getJobs } from '@/lib/getJobs'
import Link from 'next/link'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'BESS Technician Jobs | Battery Energy Storage Installer & Service Roles',
  description: 'Battery Energy Storage System technician positions across the United States. Installation, commissioning, and maintenance roles with pay ranges, certification requirements, and what the job involves day to day.',
  keywords: 'bess technician jobs, battery energy storage jobs, battery storage technician, bess field technician, energy storage installer jobs, battery storage commissioning technician',
  openGraph: {
    title: 'BESS Technician Jobs | Now Hiring Nationwide',
    description: 'Browse open Battery Energy Storage System technician positions. Installation, commissioning, and field service roles across residential, commercial, and utility scale projects.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BESS Technician Jobs',
    description: 'Find Battery Energy Storage System technician openings across the US. Residential, commercial, and utility scale employers hiring now.',
  },
  alternates: { canonical: 'https://www.solarroles.com/bess-technician-jobs' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'BESS Technician Jobs',
  description: 'Battery Energy Storage System technician job listings across the United States, covering residential, commercial, and utility scale employers.',
  url: 'https://www.solarroles.com/bess-technician-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available BESS Technician Jobs',
    description: 'Current BESS technician job listings',
  },
}

const bessRoles = [
  {
    title: 'Residential Battery Installer',
    description: "Residential installers wire home batteries such as Powerwall or Enphase systems. The storage may arrive with solar or be added later. A system usually takes one to two days, with an electrician handling final interconnection.",
    icon: BatteryCharging,
  },
  {
    title: 'Commercial BESS Technician',
    description: "Commercial technicians install larger cabinets or containers behind a facility. Many systems reduce peak-demand charges. The work covers mounting and DC wiring. It also requires coordination with inverter and switchgear teams.",
    icon: Wrench,
  },
  {
    title: 'Utility Scale BESS Field Technician',
    description: "Utility technicians work on containerized arrays beside solar or wind plants. They install modules and check thermal management. Rack-level connections are completed under a lead technician or commissioning engineer.",
    icon: TrendingUp,
  },
  {
    title: 'Commissioning Technician',
    description: "Commissioning technicians bring completed systems online. They run functional tests and verify communication between the battery controls and inverter. They also close punch-list items before handoff.",
    icon: Zap,
  },
  {
    title: 'BESS O&M / Service Technician',
    description: "Service technicians maintain operating systems. They diagnose faults and replace failed modules or contactors. Scheduled inspections provide steadier year-round work, with occasional emergency callouts.",
    icon: ShieldCheck,
  },
]

const certifications = [
  {
    name: 'OSHA 10',
    description: (
      <>
        The baseline most employers expect before you set foot on site — a {' '}
        <Link href="/certifications/osha-10" className="text-blue-600 hover:underline font-medium">
          10-hour
        construction safety course, 
        </Link> covering general jobsite hazards.
      </>
    ),
  },
  {
    name: 'OSHA 30',
    description: (
      <>
        {' '}
        <Link href="/certifications/osha-30" className="text-blue-600 hover:underline font-medium">
          OSHA 30 certification 
        </Link> comes up more often for BESS work specifically, since employers want documented
        awareness of the broader hazard set on an active electrical site.
      </>
    ),
  },
  {
    name: 'NFPA 70E (Arc Flash Safety)',
    description: "Battery systems operate at high DC voltage and carry real arc flash risk. Most employers either require this training before hire or put new technicians through it in the first weeks on the job.",
  },
  {
    name: 'Manufacturer Certification',
    description: "Major BESS manufacturers run their own training programs. Tesla, Fluence and LG credentials appear in postings tied to their equipment. Employers may require the relevant certification for warranty work.",
  },
  {
    name: 'Electrical License',
    description: (
      <>
        Many technician roles do not require a license. Final connections and
        utility interconnection still commonly require a licensed electrician.
        Technicians who hold one see faster pay progression. See our guide to learn more about{' '}
        <Link href="/resources/do-you-need-to-be-an-electrician-for-bess" className="text-blue-600 hover:underline font-medium">
           bess technician entry paths 
        </Link>
      </>
    ),
  },
  {
    name: 'First Responder / Thermal Runaway Awareness',
    description: "Some employers require training on lithium battery fire behavior and emergency shutdown procedures, particularly for utility scale sites where a thermal event has different protocols than a standard electrical fire.",
  },
]

const faqs = [
  {
    question: 'What does a BESS technician do day to day?',
    answer: "BESS technicians install racks or cabinets and complete DC or low-voltage wiring. They also test communication between battery controls and the inverter. On active sites, the work shifts to diagnostics, module replacement and scheduled maintenance.",
  },
  {
    question: 'Do I need solar experience to get hired as a BESS technician?',
    answer: "Yes. Electricians, HVAC technicians and military electronics specialists bring transferable skills. Wiring and troubleshooting matter more than a solar background. Employers usually teach the product-specific work.",
  },
  {
    question: 'How much do BESS technicians earn?',
    answer: "Entry-level installation roles commonly pay $22 to $28 per hour. Commissioning and O&M technicians with experience often reach $30 to $42 per hour. Certified or licensed utility-scale technicians can earn $75,000 to $95,000 a year. Traveling roles may add per diem.",
  },
  {
    question: 'Is BESS technician work physically demanding?',
    answer: "Installation work is physically demanding. Battery modules are heavy, and crews spend full days mounting equipment outdoors. Service roles involve less material handling. Technicians still lift components and work inside tight enclosures.",
  },
  {
    question: 'Is this a growing field?',
    answer: "US battery capacity has expanded as renewable projects add storage. Each new site needs installation and commissioning crews. Operating systems then create recurring service work.",
  },
  {
    question: 'Can BESS technician work lead to other roles?',
    answer: "Commissioning and O&M can lead to project engineering or EPC field supervision. Manufacturers also hire experienced technicians for support and training. Site-level troubleshooting is the key evidence for those moves.",
  },
]

export default async function BessTechnicianJobsPage({ searchParams }: any) {
  const params = await searchParams

  const initialData = await getJobs({
    // Scopes this landing page to battery storage roles via a keyword
    // AND filter, independent of the user's own `what` search box below,
    // same pattern used on /solar-pv-installer-jobs and /lead-solar-installer-jobs.
  
    titleContainsAny: ['bess technician', 'Sr. Service Technician', 'solar & bess technician'],
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">BESS Technician Jobs</h1>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80"><JobFilters /></aside>
          <div className="flex-1">
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || ''}
                searchLabel="BESS technician "
                where={params.where || ''}
                salary_min={params.salary_min}
              titleContainsAny={['bess technician', 'Sr. Service Technician', 'solar & bess technician']}
              whatJobsTitleIncludesAny={['bess technician', 'battery storage technician', 'energy storage technician']}
              initialData={initialData}
              />
            </Suspense>
          </div>
        </div>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><BatteryCharging className="w-7 h-7 text-orange-500" /><h2 className="text-2xl font-bold text-gray-900">Types of BESS Technician Roles</h2></div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            BESS work ranges from home backup batteries to grid-scale plants.
            The role changes with the size and purpose of the system.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bessRoles.map((role, index) => (
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
            Most employers teach the details of their battery product. These
            credentials appear most often in postings and support progression
            into higher-paying work.
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
          <div className="flex items-center gap-3 mb-6"><DollarSign className="w-7 h-7 text-green-600" /><h2 className="text-2xl font-bold text-gray-900">BESS Technician Pay Ranges</h2></div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Project scale and region shape pay. Utility-scale work and
            manufacturer credentials usually command more than entry-level
            installation.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-5 text-center border border-gray-200">
              <p className="text-3xl font-bold text-green-600 mb-2">$22 to $28/hr</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">Entry Level Installer</p>
              <p className="text-xs text-gray-500">Residential and light commercial installs</p>
            </div>
            <div className="bg-white rounded-xl p-5 text-center border border-gray-200">
              <p className="text-3xl font-bold text-blue-600 mb-2">$30 to $42/hr</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">Commissioning / O&M Technician</p>
              <p className="text-xs text-gray-500">A year or more of field experience</p>
            </div>
            <div className="bg-white rounded-xl p-5 text-center border border-gray-200">
              <p className="text-3xl font-bold text-purple-600 mb-2">$75K to $95K+</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">Utility Scale / Certified Technician</p>
              <p className="text-xs text-gray-500">Manufacturer certification or electrical license, per diem common</p>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><TrendingUp className="w-7 h-7 text-orange-500" /><h2 className="text-2xl font-bold text-gray-900">Job Outlook</h2></div>
          <p className="text-gray-600 max-w-4xl">
            US battery capacity has grown rapidly as solar and wind projects add
            storage. Those systems shift output to periods of higher demand.
            The buildout creates steady work in installation, commissioning and
            service.
          </p>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><ShieldCheck className="w-7 h-7 text-blue-600" /><h2 className="text-2xl font-bold text-gray-900">BESS Technician Job FAQ</h2></div>
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
            Battery technician pay follows the broader service market. See the{' '}
            <Link href="/data/salaries/solar-technician" className="text-blue-700 underline hover:text-blue-900">Solar Technician Salary by State</Link>{' '}
            and the{' '}
            <Link href="/data" className="text-blue-700 underline hover:text-blue-900">job market data center</Link>.
            For entry requirements, read{' '}
            <Link href="/resources/do-you-need-to-be-an-electrician-for-bess" className="text-blue-700 underline hover:text-blue-900">BESS technician requirements</Link>.
            Compare that path with{' '}
            <Link href="/solar-technician-jobs" className="text-blue-700 underline hover:text-blue-900">solar technician jobs</Link>{' '}
            or{' '}
            <Link href="/solar-engineer-jobs" className="text-blue-700 underline hover:text-blue-900">solar engineer jobs</Link>.
          </p>
        </section>

        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> Pay figures reflect general market ranges and vary by employer, region, and experience. Verify certification and safety requirements directly with employers and OSHA.
          </p>
        </section>
      </div>
    </>
  )
}
