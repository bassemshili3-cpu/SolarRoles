import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import { Compass, DraftingCompass, Building2, Cable, Calculator, Sun, Zap, BadgeCheck, DollarSign, ShieldCheck } from 'lucide-react'
import { getJobs } from '@/lib/getJobs'
import { formatSalaryK, getRoleSalaryStats, MIN_SALARY_LISTINGS } from '@/lib/roleSalary'
import { getLandingCanonical, getLandingJobCount, getLandingPageNumber, withLandingJobCount } from '@/lib/landingJobTitle'

export const revalidate = 3600

const ENGINEER_LANDING_FILTERS = {
  titleContainsAny: ['engineer'],
  excludePhrases: ['bess'],
}

export async function generateMetadata({ searchParams }: any): Promise<Metadata> {
  const params = await searchParams
  const [stats, jobCount] = await Promise.all([
    getRoleSalaryStats('solar-engineer'),
    getLandingJobCount(ENGINEER_LANDING_FILTERS),
  ])
  const salarySuffix =
    stats && stats.count >= MIN_SALARY_LISTINGS && stats.avgMax > 0
      ? ` — Up to ${formatSalaryK(stats.avgMax)}/yr`
      : ''

  return {
    title: withLandingJobCount(
      salarySuffix
        ? `Solar Engineer Jobs${salarySuffix}`
        : 'Solar Engineer Jobs | PV Design, Systems & Electrical Roles',
      jobCount,
    ),
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
    alternates: { canonical: getLandingCanonical('https://www.solarroles.com/solar-engineer-jobs', params) },
  }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Solar Engineer Jobs',
  description: 'Solar engineer job listings across the United States, including PV design, systems engineering, project engineering, electrical, and BESS roles.',
  url: 'https://www.solarroles.com/solar-engineer-jobs',
}

const engineerRoles = [
  {
    title: 'Solar Design Engineer',
    description: 'Design engineers turn a site into a buildable system. They handle array layout, string sizing and shading analysis. Production models and permit drawings complete the package. This is a common engineering entry point.',
    icon: DraftingCompass,
  },
  {
    title: 'PV Systems Engineer',
    description: 'Systems engineers own the overall architecture. Their work covers DC and AC design, structural coordination and equipment selection. They also review technical decisions across several projects.',
    icon: Sun,
  },
  {
    title: 'Solar Project Engineer',
    description: 'Project engineers connect the design office with the field crew. They manage RFIs, submittals and as-built drawings. They also solve problems uncovered during construction. Design engineers often move into this role for more site exposure.',
    icon: Building2,
  },
  {
    title: 'Electrical Engineer (Solar)',
    description: 'Electrical engineers handle one-line diagrams and grounding design. Protection studies and interconnection applications also fall within the role. The work follows NEC Articles 690 and 705.',
    icon: Cable,
  },
  {
    title: 'BESS / Energy Storage Engineer',
    description: 'BESS engineers design the storage system. They size batteries and select inverters or power-conversion systems. Thermal management, NFPA 855 fire safety and dispatch controls shape the rest of the work.',
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
    answer: 'A design engineer turns a site into a buildable PV system. The work includes layout, electrical sizing and racking selection. Shading analysis, production estimates and permit drawings follow. Most of the job is office-based and software-heavy.',
  },
  {
    question: 'Do I need an engineering degree for solar engineer jobs?',
    answer: 'Not for every role. Some residential and small-commercial employers accept field experience, software skills and NABCEP certification. Utility-scale and PE-track positions are more likely to require an ABET-accredited engineering degree.',
  },
  {
    question: 'What software do solar engineers use?',
    answer: 'PVsyst handles production modeling. Helioscope and Aurora Solar cover layout and shading, while AutoCAD supports plan sets. Utility-scale teams may add PVCase or PlantPredict. Electrical roles often use ETAP or SKM.',
  },
  {
    question: 'What is the difference between a solar engineer and a solar installer?',
    answer: 'Installers build the system on a roof or ground mount. Engineers design it before construction begins. Their work covers layout, electrical calculations, production and equipment. An installer can move into design after learning the software and code requirements.',
  },
  {
    question: 'What is the salary range for solar engineer jobs?',
    answer: 'Aggregated postings place residential design roles around $60,000 to $85,000. Commercial and utility-scale roles run from $80,000 to $120,000. Senior or PE-licensed engineers can reach $110,000 to $150,000+. Employer, region and scope affect the offer.',
  },
  {
    question: 'Which states hire the most solar engineers?',
    answer: 'Large solar markets produce the most engineering postings. California, Texas and Florida lead in residential and commercial volume. Texas, Arizona, Nevada and the Southeast also create utility-scale demand.',
  },
  {
    question: 'How do I get my first solar engineer job?',
    answer: 'Residential design is often the most accessible entry point. Learn PVsyst or Aurora Solar, then target junior roles that accept technician backgrounds. NABCEP certification can help. Installer or electrician experience is a strong advantage.',
  },
]

export default async function SolarEngineerJobsPage({ searchParams }: any) {
  const params = await searchParams
  const page = getLandingPageNumber(params.page)
 

  const initialData = await getJobs({
  
    ...ENGINEER_LANDING_FILTERS,
    ...(params.what ? { what: params.what } : {}),
    where: params.where || '',
    page,
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
          <p className="text-gray-600 max-w-3xl">Find engineering roles across solar design, systems, project, electrical, and battery storage.</p>
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
                titleContainsAny={['engineer']}
                excludePhrases={['bess']}
                requiredDomainTerms={['solar','engineer']}
                whatJobsTitleIncludesAll={['solar', 'engineer']}
                whatJobsTitleExcludes={['bess']}
                initialData={initialData}
                initialPage={page}
                landingPageSeo
              />
            </Suspense>
          </div>
        </div>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><DraftingCompass className="w-7 h-7 text-orange-500" /><h2 className="text-2xl font-bold text-gray-900">Types of Solar Engineer Roles</h2></div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            A solar-engineering title can describe very different work. A
            residential design desk does not operate like a utility-scale EPC.
            The cards below map the main titles to their actual scope.
          </p>
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
            <p>Job boards use &ldquo;Solar Design Engineer,&rdquo; &ldquo;PV Systems Engineer&rdquo; and &ldquo;Electrical Engineer — Solar&rdquo; for distinct jobs. The title alone rarely reveals the scope.</p>
            <p>BLS tracks electrical and mechanical engineers, but it has no separate solar-engineer occupation. Each EPC, installer and utility therefore applies its own naming system.</p>
            <p>Our <Link href="/resources/solar-engineer-jobs" className="text-blue-700 underline hover:text-blue-900">solar-engineering title guide</Link> maps the work, requirements and pay behind each title. It covers design, systems, project, electrical and BESS roles.</p>
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><Calculator className="w-7 h-7 text-green-600" /><h2 className="text-2xl font-bold text-gray-900">Software and Skills Employers Actually Ask For</h2></div>
          <div className="max-w-4xl space-y-4 text-gray-600">
            <p>Solar postings name software early. PVsyst, Helioscope or Aurora Solar is often the first screening criterion. AutoCAD follows for plan sets and one-line diagrams. Protection-study roles may require ETAP or SKM.</p>
            <p>Engineers moving from conventional AC work also face different hazards. Our <Link href="/resources/solar-dc-safety-for-electricians" className="text-green-700 underline hover:text-green-900">solar DC safety guide</Link> covers sustained arcs, daylight-generated voltage and array-side isolation.</p>
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
          <p className="text-gray-600 mb-6 max-w-4xl">Scope, software depth and license status shape the offer. Residential design roles usually sit at the lower end. PE-licensed utility-scale work commands the highest pay.</p>
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
            <p>Battery storage now appears across residential, commercial and utility-scale projects. BESS engineers size batteries and select power-conversion equipment. They also address thermal controls, NFPA 855 and dispatch strategy.</p>
            <p>Field roles follow a different path. Our <Link href="/resources/do-you-need-to-be-an-electrician-for-bess" className="text-purple-700 underline hover:text-purple-900">BESS technician guide</Link> explains the entry requirements. You can also browse <Link href="/bess-technician-jobs" className="text-purple-700 underline hover:text-purple-900">open BESS technician jobs</Link>.</p>
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
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Prefer field work? Explore <Link href="/solar-pv-installer-jobs" className="text-blue-700 underline hover:text-blue-900">solar PV installer jobs</Link>,{' '}
            <Link href="/solar-electrician-jobs" className="text-blue-700 underline hover:text-blue-900">solar electrician jobs</Link> or{' '}
            <Link href="/lead-solar-installer-jobs" className="text-blue-700 underline hover:text-blue-900">lead installer roles</Link>. New to solar? Start with our guide to{' '}
            <Link href="/resources/how-to-become-a-solar-installer" className="text-blue-700 underline hover:text-blue-900">becoming an installer</Link>.
          </p>
        </section>
      </div>
    </>
  )
}
