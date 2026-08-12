import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import { Compass, DraftingCompass, Building2, Cable, Calculator, Sun, Zap, BadgeCheck, DollarSign, ShieldCheck } from 'lucide-react'
import { getJobs } from '@/lib/getJobs'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Solar Engineer Jobs | PV Design, Systems & Electrical Roles',
  description: 'Solar engineer jobs across the United States. Browse PV design, solar systems, project, electrical engineering, and BESS engineering roles.',
  keywords: 'solar engineer jobs, solar design engineer jobs, PV systems engineer jobs, solar project engineer, BESS engineer jobs, photovoltaic engineering roles',
  openGraph: {
    title: 'Solar Engineer Jobs | Now Hiring Nationwide',
    description: 'Browse solar engineer, PV design, systems engineering, project engineering, and battery storage roles across the United States.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solar Engineer Jobs',
    description: 'Find solar engineer and PV design jobs across the US.',
  },
  alternates: { canonical: 'https://www.solarroles.com/solar-engineer-jobs' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Solar Engineer Jobs',
  description: 'Solar engineer job listings across the United States, including PV design, systems engineering, project engineering, electrical, and BESS roles.',
  url: 'https://www.solarroles.com/solar-engineer-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Solar Engineer Jobs',
    description: 'Current solar engineer and photovoltaic engineering job listings',
  },
}

const engineerRoles = [
  {
    title: 'Solar Design Engineer',
    description: 'Turns a roof, parking lot, or ground mount into a buildable system: array layout, string sizing, shading analysis, production modeling, and the drawing set that goes to permitting. The most common engineering entry point in solar.',
    icon: DraftingCompass,
  },
  {
    title: 'PV Systems Engineer',
    description: 'Owns the whole system architecture. DC and AC electrical design, structural coordination, equipment selection (inverters, transformers, trackers), and technical reviews across multiple projects.',
    icon: Sun,
  },
  {
    title: 'Solar Project Engineer',
    description: 'Sits between the design office and the field crew: RFIs, submittals, as-builts, and solving the problems that only show up once construction starts. A common lateral move for design engineers who want site exposure.',
    icon: Building2,
  },
  {
    title: 'Electrical Engineer (Solar)',
    description: 'Focuses on the licensed-track electrical side: one-line diagrams, protection and coordination studies, grounding design, interconnection applications, and code compliance under NEC Articles 690 and 705.',
    icon: Cable,
  },
  {
    title: 'BESS / Energy Storage Engineer',
    description: 'Designs the battery storage side of solar: battery sizing, inverter and PCS selection, thermal management, fire safety per NFPA 855, and the controls that make a system dispatchable.',
    icon: Zap,
  },
]

const qualifications = [
  {
    name: 'PVsyst, Helioscope, or Aurora Solar proficiency',
    description: 'Production modeling and layout software is the core skill across most solar design roles. Utility-scale roles add PVCase or PlantPredict for large-array optimization.',
  },
  {
    name: 'AutoCAD or AutoCAD Electrical',
    description: 'Plan sets, one-line diagrams, and as-built drawings are built in CAD. Electrical-focused roles may also use ETAP or SKM for protection studies.',
  },
  {
    name: 'NEC Article 690 and 705 knowledge',
    description: 'PV-specific code knowledge separates solar engineers from general engineers. Understanding string sizing, rapid shutdown, and interconnection rules is the technical foundation of the role.',
  },
  {
    name: 'NABCEP certification or EIT/PE track',
    description: 'NABCEP PVIP is the most commonly requested solar credential on engineering postings. EIT and PE matter for stamping roles at utility scale and for certain commercial permits.',
  },
]

const faqs = [
  {
    question: 'What does a solar design engineer do?',
    answer: 'A solar design engineer takes a site and turns it into a buildable PV system: array layout in software, string and conductor sizing, racking selection, shading analysis, production estimates, and a permit-ready drawing set. The role is software-heavy and office-based compared to field installation work.',
  },
  {
    question: 'Do I need an engineering degree for solar engineer jobs?',
    answer: 'Not for every role. Many residential and small-commercial design postings accept a technician background plus software proficiency and NABCEP certification in lieu of a 4-year engineering degree. PE-track and utility-scale roles more consistently require an ABET-accredited engineering degree.',
  },
  {
    question: 'What software do solar engineers use?',
    answer: 'The core tools are PVsyst for production modeling, Helioscope or Aurora Solar for layout and shading, and AutoCAD for plan sets. Utility-scale roles add PVCase or PlantPredict, and electrical-focused roles may use ETAP or SKM for protection studies.',
  },
  {
    question: 'What is the difference between a solar engineer and a solar installer?',
    answer: 'A solar installer physically builds the system on the roof or ground mount. A solar engineer designs it in software before anything is built — system layout, electrical calculations, production modeling, and equipment. Installers can move into engineering roles after learning the software and code requirements.',
  },
  {
    question: 'What is the salary range for solar engineer jobs?',
    answer: 'Based on aggregated job postings, residential solar design engineers typically range from $60,000 to $85,000, commercial and utility-scale design engineers from $80,000 to $120,000, and senior or PE-licensed engineers from $110,000 to $150,000+. Exact figures vary by employer, region, and scope.',
  },
  {
    question: 'Which states hire the most solar engineers?',
    answer: 'The states with the largest solar buildouts tend to have the most engineering postings — California, Texas, and Florida lead on residential and commercial volume, while utility-scale states like Texas, Arizona, Nevada, and the Southeast (Georgia, Florida, the Carolinas) drive demand for systems and project engineers.',
  },
  {
    question: 'How do I get my first solar engineer job?',
    answer: 'The most accessible on-ramp is residential design: learn PVsyst and Aurora-based solar (Aurora Solar), get NABCEP certified, and apply for junior design roles that accept technician backgrounds. Field experience as a solar installer or electrician is a strong differentiator.',
  },
]

export default async function SolarEngineerJobsPage({ searchParams }: any) {
  const params = await searchParams
  const descriptionContainsAny = [
    'solar design engineer',
    'pv design engineer',
    'solar systems engineer',
    'pv systems engineer',
    'solar project engineer',
    'solar engineer',
    'bess engineer',
    'energy storage engineer',
    'photovoltaic engineer',
  ]

  const initialData = await getJobs({
    descriptionContainsAny,
    requiredDomainTerms: ['solar','engineer'],
    titleContainsAny: ['solar','engineer'],
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Solar Engineer Jobs</h1>
          <p className="text-gray-600 max-w-3xl">Find engineering roles across solar design, systems, project, electrical, and battery storage — updated daily from real employer postings.</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80"><JobFilters /></aside>
          <div className="flex-1">
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what ?? ''}
                searchLabel="solar engineer "
                where={params.where ?? ''}
                salary_min={params.salary_min}
                descriptionContainsAny={descriptionContainsAny}
                requiredDomainTerms={['solar', 'photovoltaic', ' pv ']}
                initialData={initialData}
              />
            </Suspense>
          </div>
        </div>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><DraftingCompass className="w-7 h-7 text-orange-500" /><h2 className="text-2xl font-bold text-gray-900">Types of Solar Engineer Roles</h2></div>
          <p className="text-gray-600 mb-6 max-w-4xl">&ldquo;Solar engineer&rdquo;'s job changes substantially between a residential design desk, a utility-scale systems role, a construction-facing project position, and the licensed-track electrical side. The same title can mean different things at a 200-person installer versus a national EPC.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {engineerRoles.map((role) => (
              <div key={role.title} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <role.icon className="w-10 h-10 text-orange-500 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><Compass className="w-7 h-7 text-blue-600" /><h2 className="text-2xl font-bold text-gray-900">Solar Engineer Job Titles Are Confusing — Here's Why</h2></div>
          <div className="max-w-4xl space-y-4 text-gray-600">
            <p>If you've searched &ldquo;solar engineer&rdquo; on any job board, you already know the problem: one posting calls the role &ldquo;Solar Design Engineer,&rdquo; the next &ldquo;PV Systems Engineer,&rdquo; and a third &ldquo;Electrical Engineer — Solar.&rdquo; They're not always the same job, and the differences aren't obvious from the titles alone.</p>
            <p>Part of it is structural. The Bureau of Labor Statistics tracks electrical engineers and mechanical engineers, but there is no &ldquo;solar engineer&rdquo; occupational code — so every EPC, installer, and utility names the role however their internal structure dictates.</p>
            <p>We built a practical guide that maps every major title to what the job involves, what's required, and what it pays: <Link href="/resources/solar-engineer-jobs" className="text-blue-700 underline hover:text-blue-900">Types of Solar Engineer Jobs — the full title mapping guide</Link>. It covers PV design, systems engineering, project engineering, electrical, and BESS roles in depth, with salary ranges and honest degree requirements.</p>
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><Calculator className="w-7 h-7 text-green-600" /><h2 className="text-2xl font-bold text-gray-900">Software and Skills Employers Actually Ask For</h2></div>
          <div className="max-w-4xl space-y-4 text-gray-600">
            <p>Unlike general engineering roles, solar engineering postings are unusually specific about software. PVsyst, Helioscope, and Aurora Solar are the industry-standard design tools, and proficiency in at least one is usually the first screening criterion. AutoCAD follows for plan sets and one-line diagrams. On the electrical side, ETAP and SKM show up on protection-study roles.</p>
            <p>The electrical side of solar has its own safety considerations. If you're coming from conventional AC engineering, our guide to <Link href="/resources/solar-dc-safety-for-electricians" className="text-green-700 underline hover:text-green-900">why solar DC safety is different for electricians</Link> explains the DC-specific hazards that don't exist in standard AC design work — sustained arcs, daylight-generated voltage, and array-side isolation.</p>
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><BadgeCheck className="w-7 h-7 text-green-600" /><h2 className="text-2xl font-bold text-gray-900">Qualifications Employers Look For</h2></div>
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
          <div className="flex items-center gap-3 mb-6"><DollarSign className="w-7 h-7 text-green-600" /><h2 className="text-2xl font-bold text-gray-900">Solar Engineer Pay: What Changes the Offer</h2></div>
          <p className="text-gray-600 mb-6 max-w-4xl">Solar engineering pay is shaped by scope, software depth, license status, and market segment. Aggregated from real job postings, residential design roles tend to sit at the lower end while PE-licensed utility-scale roles sit at the top.</p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-5 text-center border border-gray-200">
              <p className="text-3xl font-bold text-orange-600 mb-2">$60–85K</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">Residential design</p>
              <p className="text-xs text-gray-500">Entry-level design roles often accept technician backgrounds plus software proficiency.</p>
            </div>
            <div className="bg-white rounded-xl p-5 text-center border border-gray-200">
              <p className="text-3xl font-bold text-blue-600 mb-2">$80–120K</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">Commercial & utility-scale</p>
              <p className="text-xs text-gray-500">Systems and project engineering at EPCs and integrators, mid-level.</p>
            </div>
            <div className="bg-white rounded-xl p-5 text-center border border-gray-200">
              <p className="text-3xl font-bold text-purple-600 mb-2">$110–150K+</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">Senior / PE-licensed</p>
              <p className="text-xs text-gray-500">Utility-scale electrical and systems engineering with stamping responsibility.</p>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><Zap className="w-7 h-7 text-purple-600" /><h2 className="text-2xl font-bold text-gray-900">The BESS Angle: Where Solar Engineering Is Heading</h2></div>
          <div className="max-w-4xl space-y-4 text-gray-600">
            <p>Battery storage is being added to residential, commercial, and utility-scale projects across the country, and it's pulling engineers from every part of the solar stack. BESS engineers design the storage side: battery sizing, inverter and PCS selection, thermal management, fire safety per NFPA 855, and the controls that make a system dispatchable.</p>
            <p>The labor shortage is even more acute on the technician side. Our guide to <Link href="/resources/do-you-need-to-be-an-electrician-for-bess" className="text-purple-700 underline hover:text-purple-900">BESS technician requirements</Link> covers the honest answer about entering storage without a solar background, and you can browse <Link href="/bess-technician-jobs" className="text-purple-700 underline hover:text-purple-900">BESS technician jobs</Link> separately if the field side appeals to you more than the desk.</p>
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><ShieldCheck className="w-7 h-7 text-blue-600" /><h2 className="text-2xl font-bold text-gray-900">Solar Engineer Job FAQ</h2></div>
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

        <section className="mt-20 bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">From Design Desk to Field: Explore Related Roles</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">Solar engineering is part of a broader career ecosystem. If you're exploring the physical side of the industry, see <Link href="/solar-pv-installer-jobs" className="text-blue-700 underline hover:text-blue-900">solar PV installer jobs</Link>, <Link href="/solar-electrician-jobs" className="text-blue-700 underline hover:text-blue-900">solar electrician jobs</Link>, or <Link href="/lead-solar-installer-jobs" className="text-blue-700 underline hover:text-blue-900">lead solar installer roles</Link>. And if you're starting from zero, our guide on <Link href="/resources/how-to-become-a-solar-installer" className="text-blue-700 underline hover:text-blue-900">how to become a solar installer</Link> is a solid first read.</p>
        </section>
      </div>
    </>
  )
}
