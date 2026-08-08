import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import { BatteryCharging, Zap, DollarSign, ShieldCheck, Award, Wrench, TrendingUp } from 'lucide-react'
import { getJobs } from '@/lib/getJobs'

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
    description: "Installs and wires home battery systems such as a Powerwall or Enphase unit, usually paired with a solar install already on site or added after the fact. One to two days per system, working alongside an electrician for the final interconnection.",
    icon: BatteryCharging,
  },
  {
    title: 'Commercial BESS Technician',
    description: "Installs and commissions larger battery cabinets or containers behind a business or facility, often sized to shave peak demand charges. Work spans mechanical mounting, DC wiring, and coordination with the inverter and switchgear teams on site.",
    icon: Wrench,
  },
  {
    title: 'Utility Scale BESS Field Technician',
    description: "Works on containerized battery arrays at a storage plant, frequently colocated with a solar or wind farm. Handles module installation, thermal management checks, and rack level electrical connections under a lead technician or commissioning engineer.",
    icon: TrendingUp,
  },
  {
    title: 'Commissioning Technician',
    description: "Brings a completed battery system online: functional testing, communication checks between the battery management system and the inverter, and punch list items before the site is handed off to the customer or utility.",
    icon: Zap,
  },
  {
    title: 'BESS O&M / Service Technician',
    description: "Maintains systems already in operation. Diagnoses fault codes, replaces failed modules or contactors, and performs scheduled inspections. Steadier year round schedule than new installs, with occasional emergency callouts.",
    icon: ShieldCheck,
  },
]

const certifications = [
  { name: 'OSHA 10 / OSHA 30', description: "OSHA 10 is the baseline most employers expect before you set foot on site. OSHA 30 comes up more often for BESS work specifically, since employers want documented awareness of the broader hazard set on an active electrical site." },
  { name: 'NFPA 70E (Arc Flash Safety)', description: "Battery systems operate at high DC voltage and carry real arc flash risk. Most employers either require this training before hire or put new technicians through it in the first weeks on the job." },
  { name: 'Manufacturer Certification', description: "Tesla, Fluence, LG, and other major BESS manufacturers run their own installer and technician certification programs. Postings frequently name a specific manufacturer cert as required or strongly preferred for their product line." },
  { name: 'Electrical License', description: "Not required for every technician role, but a licensed electrician on the crew is commonly mandatory for final connections and utility interconnection. Technicians who hold one see faster pay progression." },
  { name: 'First Responder / Thermal Runaway Awareness', description: "Some employers require training on lithium battery fire behavior and emergency shutdown procedures, particularly for utility scale sites where a thermal event has different protocols than a standard electrical fire." },
]

const faqs = [
  {
    question: 'What does a BESS technician actually do day to day?',
    answer: "Mechanical installation of battery racks or cabinets, DC and low voltage wiring, and testing communication between the battery management system and the inverter. On active sites, expect fault diagnosis, module swaps, and scheduled maintenance checks rather than new installs.",
  },
  {
    question: 'Do I need solar experience to get hired as a BESS technician?',
    answer: "It helps but isn't the only path in. Electricians, HVAC technicians, and former military electronics techs regularly move into BESS roles, since a lot of the skill set (wiring, reading schematics, troubleshooting) transfers directly. Employers typically train on the battery specific parts of the job.",
  },
  {
    question: 'How much do BESS technicians earn?',
    answer: "Entry level installation roles commonly start in the $22 to $28 per hour range. Commissioning and O&M technicians with a year or more of experience often move into the $30 to $42 per hour range, and utility scale roles with a manufacturer certification or electrical license can clear $75,000 to $95,000 annually with per diem for travel.",
  },
  {
    question: 'Is BESS technician work physically demanding?',
    answer: "Yes, particularly on the installation side. Battery modules are heavy, and crews spend full days moving and mounting equipment, often outdoors. O&M and service roles are lighter physically but still involve lifting and working in confined equipment enclosures.",
  },
  {
    question: 'Is this a growing field?',
    answer: "Battery storage capacity in the US has expanded rapidly over the past several years as more solar and wind projects pair with storage to firm up their output. That buildout is driving steady hiring for installation, commissioning, and service technicians, closely tracking the broader growth in solar and renewable energy jobs.",
  },
  {
    question: 'Can BESS technician work lead to other roles?',
    answer: "Commissioning and O&M experience is a common path into project engineering, EPC field supervision, or a manufacturer's technical support and training team. The site level troubleshooting experience is exactly what those roles screen for.",
  },
]

export default async function BessTechnicianJobsPage({ searchParams }: any) {
  const params = await searchParams

  const initialData = await getJobs({
    // Scopes this landing page to battery storage roles via a keyword
    // AND filter, independent of the user's own `what` search box below,
    // same pattern used on /solar-pv-installer-jobs and /lead-solar-installer-jobs.
    descriptionContainsAny: ['bess', 'battery energy storage', 'battery storage technician', 'energy storage technician', 'battery technician'],
    titleContainsAny: ['bess', 'BESS', 'techncian', 'Technician', 'tech', 'Tech', 'battery storage', 'Battery Storage', 'energy storage', 'Energy Storage'],
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
              descriptionContainsAny={['bess', 'battery energy storage', 'battery storage technician', 'energy storage technician', 'battery technician']}
              titleContainsAny= {['bess', 'BESS', 'techncian', 'Technician', 'tech', 'Tech', 'battery storage', 'Battery Storage', 'energy storage', 'Energy Storage']}
                initialData={initialData}
              />
            </Suspense>
          </div>
        </div>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><BatteryCharging className="w-7 h-7 text-orange-500" /><h2 className="text-2xl font-bold text-gray-900">Types of BESS Technician Roles</h2></div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Battery Energy Storage System work spans residential backup batteries and grid scale storage plants. The scope of the job changes a lot depending on which end of that range you're working on.
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
            Most employers will train a motivated hire on the specifics of a given battery product. These are the credentials that come up most often in postings and open doors to higher paying roles.
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
            Pay varies significantly by project scale and region. Utility scale and manufacturer certified roles pay well above entry level installation work.
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
            Battery storage capacity in the United States has grown rapidly as more solar and wind projects pair with storage to firm up output and shift power to when it's needed most. That buildout is driving steady demand for installation, commissioning, and service technicians, tracking closely with the broader growth in solar and renewable energy hiring nationwide.
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

        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> Pay figures reflect general market ranges and vary by employer, region, and experience. Verify certification and safety requirements directly with employers and OSHA.
          </p>
        </section>
      </div>
    </>
  )
}