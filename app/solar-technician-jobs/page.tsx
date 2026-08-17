import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import { Wrench, Sun, Zap, ShieldCheck, Award, DollarSign, TrendingUp, GraduationCap, Settings, HardHat, SearchCheck } from 'lucide-react'
import { getJobs } from '@/lib/getJobs'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Solar Technician Jobs | Service, Field & Repair Technician Roles',
  description: 'Solar technician jobs across the United States. Browse solar service technician, O&M technician, and solar panel repair technician roles.',
  keywords: 'solar technician, solar power technician jobs, solar technician salary, solar technician training, solar panel repair technician, solar field technician jobs, solar service technician jobs, solar technician apprenticeship, solar repair technician, pv technician jobs, solar o&m technician',
  openGraph: {
    title: 'Solar Technician Jobs | Service, Field & Repair Roles Hiring Now',
    description: 'Browse open solar technician positions. Service, field, O&M, and repair roles across residential, commercial, and utility-scale fleets.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solar Technician Jobs',
    description: 'Find solar technician, field service, and solar repair technician openings across the US.',
  },
  alternates: { canonical: 'https://www.solarroles.com/solar-technician-jobs' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Solar Technician Jobs',
  description: 'Solar technician job listings across the United States, covering solar service technician, solar field technician, and solar panel repair technician roles for residential, commercial, and utility-scale employers.',
  url: 'https://www.solarroles.com/solar-technician-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Solar Technician Jobs',
    description: 'Current solar technician, solar service technician, and solar field technician job listings',
  },
}

const technicianRoles = [
  {
    title: 'Solar Service Technician',
    description: 'Responds to service calls on systems already in operation: diagnosing inverter faults, reading monitoring data, swapping failed components, and clearing error codes. The front line for keeping residential and commercial arrays producing.',
    icon: Wrench,
  },
  {
    title: 'Solar Field Technician',
    description: 'Travels a service territory across multiple sites handling scheduled inspections, panel testing, and repairs. Field work is more varied than new construction and rewards troubleshooting over raw installation speed.',
    icon: HardHat,
  },
  {
    title: 'Solar Panel Repair Technician',
    description: 'Focuses on fixing damaged or underperforming panels: replacing cracked modules, reseating connectors, repairing racking and mounting hardware, and verifying output after the repair. A hands-on specialty within the broader solar repair technician role.',
    icon: Settings,
  },
  {
    title: 'PV O&M Technician',
    description: 'Runs the operations and maintenance program for a fleet of systems — production diagnostics, module string testing, thermal scans, and scheduled maintenance routes that keep uptime and revenue high.',
    icon: Sun,
  },
  {
    title: 'Solar Maintenance Technician',
    description: 'Performs preventive maintenance across inverter and panel installations: torque checks, cleaning, firmware updates, and documentation of maintenance history. Steadier schedule than emergency callout work.',
    icon: Zap,
  },
  {
    title: 'Commissioning / Startup Technician',
    description: 'Brings newly built systems online for the first time: functional testing, communication checks between inverters, batteries, and monitoring, and punch list items before handoff to the customer or utility.',
    icon: SearchCheck,
  },
]

const qualifications = [
  {
    name: 'Hands-on PV or electrical experience',
    description: 'Most solar technician postings ask for a year or more of field experience in solar O&M, installation, or an adjacent electrical trade. That background is what makes troubleshooting safe and efficient.',
  },
  {
    name: 'Solar technician training & certifications',
    description: 'NABCEP credentials — the PV Associate for entry-level and the PVIP for experienced techs — are the most requested solar-specific certifications. OSHA 10 or 30 is common, and manufacturer certifications (Tesla, Enphase, SolarEdge) are frequent pluses.',
  },
  {
    name: 'Troubleshooting & diagnostic skills',
    description: 'Work reads multimeter readings, inverter fault logs, and monitoring platforms daily. Strength here separates a repair-style technician from someone who just swaps parts.',
  },
  {
    name: 'Electrical code & safety knowledge',
    description: 'Understanding NEC Article 690 (PV systems), arc flash safety, and proper lockout/tagout on live DC circuits is non-negotiable for service work on energized systems.',
  },
]

const faqs = [
  {
    question: 'What does a solar technician do?',
    answer: 'A solar technician maintains and repairs solar systems already in the field. Daily work centers on diagnosing inverter faults, running production diagnostics, replacing failed components, and completing scheduled inspections across a service territory.',
  },
  {
    question: 'What is the difference between a solar installer and a solar technician?',
    answer: 'A solar installer builds new systems on rooftops or ground mounts. A solar technician services systems that are already producing — troubleshooting, repairing, and maintaining them over their 25+ year lifespan.',
  },
  {
    question: 'What is a solar technician salary?',
    answer: 'Based on aggregated job postings, entry-level solar technicians typically range from about $20 to $26 an hour, experienced field and service technicians from $28 to $38 an hour, and senior or licensed O&M techs can exceed $40 an hour plus per diem. See our state-by-state solar technician salary breakdown for live figures.',
  },
  {
    question: 'How do I become a solar technician without experience?',
    answer: 'The most common entry path is starting as a solar installer or taking an entry-level service support role, then completing solar technician training. Earning a NABCEP PV Associate credential and OSHA certification signals readiness, and a solar technician apprenticeship is a structured way to earn while you learn.',
  },
  {
    question: 'What certifications do solar technicians need?',
    answer: 'NABCEP PV Associate (entry) and PVIP (experienced) are the most recognized, alongside OSHA 10/30 and manufacturer certifications from Tesla, Enphase, or SolarEdge. Some employers prefer or require a state electrical license for troubleshooting work beyond basic component swaps.',
  },
  {
    question: 'Are solar repair technicians in demand?',
    answer: 'Yes. As the installed base of solar grows, the fleet of systems needing maintenance and repair grows with it. The Bureau of Labor Statistics projects strong growth for the occupation, and service roles are often steadier than construction work because they follow a recurring maintenance and repair schedule.',
  },
  {
    question: 'Which states hire the most solar technicians?',
    answer: 'States with large installed solar fleets drive the most service demand — California, Texas, and Florida lead, with strong technician hiring in Arizona, Nevada, the Carolinas, and the Northeast. Utility-scale states also hire heavily for field and O&M technicians covering large arrays.',
  },
]
export default async function SolarTechnicianJobsPage({ searchParams }: any) {
  const params = await searchParams

  const initialData = await getJobs({
    // Scopes this landing page to solar technician / service / repair / O&M
    // roles via a keyword AND-filter, independent of the user's own `what`
    // search box below — same pattern used on the other niche landing pages.
    titleContainsAny: ['technician', 'tech', 'service', 'field', 'o&m', 'maintenance', 'repair'],
    excludePhrases: ['bess', 'engineer', 'sales', 'supervisor', 'manager'],
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Solar Technician Jobs</h1>
          <p className="text-gray-600 max-w-3xl">
            Solar power technician jobs — solar service technicians, O&M, and field technicians.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80"><JobFilters /></aside>
          <div className="flex-1">
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what ?? ''}
                searchLabel="solar technician "
                where={params.where ?? ''}
                salary_min={params.salary_min}
                descriptionContainsAny={[
                  'solar technician', 'solar service technician', 'solar field technician',
                  'solar repair technician', 'solar panel repair', 'pv technician',
                  'solar o&m technician', 'solar maintenance technician',
                ]}
                titleContainsAny={['technician', 'Tech', 'service', 'field', 'repair', 'o&m', 'maintenance', 'service tech', 'field service']}
                excludePhrases={['bess', 'engineer', 'sales']}
                initialData={initialData}
              />
            </Suspense>
          </div>
        </div>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><Wrench className="w-7 h-7 text-orange-500" /><h2 className="text-2xl font-bold text-gray-900">Types of Solar Technician Roles</h2></div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            &ldquo;Solar technician&rdquo; covers a range of service work that keeps systems producing after they are
            installed. The day-to-day differs a lot between a residential service route and a utility-scale O&M
            crew, so it helps to know which flavor matches your experience.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technicianRoles.map((role, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <role.icon className="w-10 h-10 text-orange-500 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><GraduationCap className="w-7 h-7 text-blue-600" /><h2 className="text-2xl font-bold text-gray-900">Solar Technician Training &amp; Skills</h2></div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Solar technician training is more about field troubleshooting than classroom theory. These are the
            qualifications that show up most often on solar technician postings and that set a solar repair
            technician apart from a general maintenance hire.
          </p>
          <div className="space-y-4">
            {qualifications.map((qual, index) => (
              <div key={index} className="flex gap-4 bg-white border border-gray-200 rounded-xl p-5">
                <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 mb-1">{qual.name}</p>
                  <p className="text-gray-600 text-sm">{qual.description}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-gray-600 max-w-4xl mt-6">
            If you are starting from zero, a solar technician apprenticeship is one of the most practical
            ways in — you get paid field experience while working toward certification. See our guide to{' '}
            <Link href="/resources/how-to-get-a-solar-apprenticeship" className="text-blue-700 underline hover:text-blue-900">
              how to get a solar apprenticeship
            </Link>{' '}
            and browse{' '}
            <Link href="/resources/solar-installer-apprenticeship-programs" className="text-blue-700 underline hover:text-blue-900">
              solar apprenticeship programs
            </Link>{' '}
            to map a route. For the full credential picture, our{' '}
            <Link href="/resources/solar-certifications-by-job-role" className="text-blue-700 underline hover:text-blue-900">
              solar certifications by job role
            </Link>{' '}
            guide lays out what is expected at each level.
          </p>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><Award className="w-7 h-7 text-blue-600" /><h2 className="text-2xl font-bold text-gray-900">Certifications That Matter</h2></div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Most employers will train a motivated hire on the specifics of a given inverter or panel brand. These
            are the credentials that come up most often in solar technician postings and that open the door to
            better-paying solar service technician jobs.
          </p>
          <div className="space-y-4">
            {[
              { name: 'NABCEP PV Associate (PVAS)', description: 'The standard entry credential for new solar technicians. Covers PV system fundamentals, safety, and basic troubleshooting.' },
              { name: 'NABCEP PV Installation Professional (PVIP)', description: 'The advanced credential for experienced techs. Validates hands-on competency with conductors, raceways, and system monitoring — documented field hours matter.' },
              { name: 'OSHA 10 / OSHA 30', description: 'Construction and safety compliance training. OSHA 30 is frequently required on commercial and utility-scale service work.' },
              { name: 'Manufacturer certifications', description: 'Product-specific training from Tesla, Enphase, SolarEdge, and others. Increasingly required for warranty work and repair claims.' },
            ].map((cert, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="font-semibold text-gray-900 mb-1">{cert.name}</p>
                <p className="text-gray-600 text-sm">{cert.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><DollarSign className="w-7 h-7 text-green-600" /><h2 className="text-2xl font-bold text-gray-900">Solar Technician Salary &amp; Pay Ranges</h2></div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Solar technician salary varies by region, project scale, and certifications. Service and repair roles
            generally pay above entry-level installation because they require troubleshooting skill. Track live
            pay by state on our{' '}
            <Link href="/data/salaries/solar-technician" className="text-green-700 underline hover:text-green-900">
              Solar Technician Salary by State
            </Link>{' '}
            page, built from real job listing data.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-5 text-center border border-gray-200">
              <p className="text-3xl font-bold text-green-600 mb-2">$20 to $26/hr</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">Entry Level Technician</p>
              <p className="text-xs text-gray-500">Residential service support and apprentice roles</p>
            </div>
            <div className="bg-white rounded-xl p-5 text-center border border-gray-200">
              <p className="text-3xl font-bold text-blue-600 mb-2">$28 to $38/hr</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">Field / Service Technician</p>
              <p className="text-xs text-gray-500">A year or more of hands-on troubleshooting experience</p>
            </div>
            <div className="bg-white rounded-xl p-5 text-center border border-gray-200">
              <p className="text-3xl font-bold text-purple-600 mb-2">$40/hr+</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">Senior / Licensed Technician</p>
              <p className="text-xs text-gray-500">Electrical license or NABCEP PVIP, per diem common</p>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><TrendingUp className="w-7 h-7 text-orange-500" /><h2 className="text-2xl font-bold text-gray-900">Job Outlook</h2></div>
          <p className="text-gray-600 max-w-4xl">
            The Bureau of Labor Statistics projects strong growth for solar photovoltaic installers and
            technicians over the coming decade, with tens of thousands of openings annually. As the installed
            base of solar grows, the fleet of systems needing solar maintenance, service, and repair grows with
            it — driving steady demand for solar field technician jobs and solar service technician jobs
            nationwide, well beyond the initial construction boom.
          </p>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><ShieldCheck className="w-7 h-7 text-blue-600" /><h2 className="text-2xl font-bold text-gray-900">Solar Technician Job FAQ</h2></div>
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
            Solar technician work sits between construction and operations. If you are exploring the build side,
            see{' '}
            <Link href="/solar-pv-installer-jobs" className="text-blue-700 underline hover:text-blue-900">solar PV installer jobs</Link>
            {' '}or{' '}
            <Link href="/solar-electrician-jobs" className="text-blue-700 underline hover:text-blue-900">solar electrician jobs</Link>.
            Storage is one of the fastest-growing technician fields — browse{' '}
            <Link href="/bess-technician-jobs" className="text-blue-700 underline hover:text-blue-900">BESS technician jobs</Link>{' '}
            if battery systems appeal to you. And if you are just getting started, our guide on{' '}
            <Link href="/resources/how-to-become-a-solar-installer" className="text-blue-700 underline hover:text-blue-900">how to become a solar installer</Link>{' '}
            is a solid first read.
          </p>
        </section>

        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> Pay figures reflect general market ranges and vary by employer, region,
            and experience. Verify certification and safety requirements directly with employers and OSHA.
          </p>
        </section>
      </div>
    </>
  )
}