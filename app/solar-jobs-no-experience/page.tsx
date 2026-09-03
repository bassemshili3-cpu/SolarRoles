import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import { HardHat, ClipboardCheck, DollarSign, ShieldCheck, GraduationCap, Users, TrendingUp } from 'lucide-react'
import { getJobs } from '@/lib/getJobs'
import Link from 'next/link'


export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Solar Jobs No Experience Required | Entry-Level Installer Openings',
  description: 'Entry-level solar jobs that don\u2019t require prior experience, helper, apprentice, and trainee roles across the United States. Pay ranges, what employers screen for, and what the work involves.',
  keywords: 'solar jobs no experience, entry level solar installer jobs, solar apprentice jobs, solar helper jobs, no experience solar technician jobs, solar trainee jobs',
  openGraph: {
    title: 'Solar Jobs No Experience Required | Now Hiring Nationwide',
    description: 'Browse open entry-level solar positions, helper, apprentice, and trainee roles with no prior experience required.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solar Jobs No Experience Required',
    description: 'Find entry-level solar installer openings across the US. No prior experience required, training provided on the job.',
  },
  alternates: { canonical: 'https://www.solarroles.com/solar-jobs-no-experience' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Solar Jobs No Experience Required',
  description: 'Entry-level solar job listings across the United States that do not require prior installation experience, including helper, apprentice, and trainee roles.',
  url: 'https://www.solarroles.com/solar-jobs-no-experience',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Entry-Level Solar Jobs',
    description: 'Current no-experience-required solar job listings',
  },
}

const entryRoles = [
  {
    title: 'Solar Installer Helper',
    description: "Helpers carry panels, stage racking and move material around the site. It is the most common entry point without experience. The crew teaches the tools and process on the job.",
    icon: HardHat,
  },
  {
    title: 'Solar Apprentice',
    description: "An apprenticeship provides a structured path to full installer work. Employers may pay for OSHA 10 or 30. Wages usually rise at set milestones as the apprentice takes on more of the installation.",
    icon: GraduationCap,
  },
  {
    title: 'Racking Crew Member',
    description: "Racking crews assemble the mounting system before panels arrive. The work is physical and repetitive. It is also a fast way to learn the mechanical side of an installation.",
    icon: Users,
  },
  {
    title: 'Warehouse / Logistics Associate',
    description: "Warehouse associates pull equipment, track inventory and load crew trucks. They stay off the roof while learning the materials. Some companies promote reliable warehouse staff into installer openings.",
    icon: ClipboardCheck,
  },
  {
    title: 'Trainee Field Technician',
    description: "Trainees shadow licensed technicians on service calls and O&M work. The pace is often steadier than new construction. Electrical or HVAC experience can make this route easier to enter.",
    icon: TrendingUp,
  },
]

const faqs = [
  {
    question: 'Can you really get a solar job with zero experience?',
    answer: "Yes. Helper, apprentice and warehouse roles are built for beginners. Crews teach the installation process. Employers screen first for reliability, physical ability and willingness to learn.",
  },
  {
    question: 'Do I need any certifications before applying?',
    answer: "Usually not on day one. Employers often cover OSHA 10 during onboarding. NABCEP certification comes later, after you have enough field experience for the chosen credential.",
  },
  {
    question: 'How much do entry-level solar jobs pay?',
    answer: "Helper and apprentice roles commonly start around $17 to $20 an hour. Pay rises as workers complete more of the installation independently. BLS reported a $51,860 national median for all PV installers in May 2024.",
  },
  {
    question: 'What does the job involve day to day?',
    answer: "The work is mostly physical. Beginners carry panels, stage racking and clean the site. They may also run conduit or assist experienced installers. Expect full days outdoors in changing weather.",
  },
  {
    question: 'How fast can you move up from helper to installer?',
    answer: "Many postings suggest six months to a year. Expanding crews may promote faster. Progress depends on how much of an installation you can complete safely without close supervision.",
  },
  {
    question: 'Is a background in construction or electrical work helpful?',
    answer: "It helps, but many postings treat trade experience as preferred rather than required. Comfort with tools, heights and physical work matters more than a specific background.",
  },
]

// Kept in sync with the server-side filter so the client pagination cannot
// reintroduce senior or experience-required postings after page one.
const NO_EXPERIENCE_EXCLUDE_PHRASES = [
  'years of experience required', 'years experience required',
  '1+ years', '2+ years', '3+ years', '4+ years', '5+ years', '6+ years', '7+ years', '8+ years', '10+ years',
  '1 year of experience', '2 years of experience', '3 years of experience', '4 years of experience', '5 years of experience',
  '2-3 years', '3-5 years', '5-7 years', '2 to 3 years', '3 to 5 years', '5 to 7 years',
  'minimum of 2 years', 'minimum of 3 years', 'minimum of 5 years',
  'prior experience required', 'prior installation experience required',
  'must have experience', 'must have prior experience', 'must have solar experience',
  'solar experience required', 'solar experience is required', 'previous solar experience',
  'prior solar experience', 'solar installation experience',
  'senior installer', 'senior technician', 'lead installer', 'crew lead',
  'not an entry level', 'not an entry-level', 'all experience levels',
]

export default async function SolarJobsNoExperiencePage({ searchParams }: any) {
  const params = await searchParams

 const initialData = await getJobs({
  // Scopes this landing page to entry-level roles via a keyword
  // AND-filter, independent of the user's own `what` search box below —
  // same pattern used on /lead-solar-installer-jobs.
  entryLevel: true,
  // Écarte les offres qui matchent un des mots-clés ci-dessus (ex: "apprentice")
  // mais sont en réalité des postes senior/confirmés exigeant de l'expérience.
   excludePhrases: NO_EXPERIENCE_EXCLUDE_PHRASES,
   /* Legacy list kept here temporarily for reference:
   'experienced',                         // couvre "Experienced X" en titre, très fréquent
  'years of experience required',
  'years experience required',
  '2+ years', '3+ years', '4+ years', '5+ years', '6+ years', '7+ years', '8+ years', '10+ years',
  '2-3 years', '3-5 years', '5-7 years', '2 to 3 years', '3 to 5 years', '5 to 7 years',
  'minimum of 2 years', 'minimum of 3 years', 'minimum of 5 years',
  'prior experience required', 'prior installation experience required',
  'must have experience', 'must have prior experience', 'must have solar experience',
  'senior installer', 'senior technician', 'lead installer', 'crew lead',
  'not an entry level', 'not an entry-level',
  'nabcep certified required', 'nabcep certification required',
   */
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Solar Jobs No Experience Required</h1>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">

          <aside className="lg:w-80"><JobFilters /></aside>
          <div className="flex-1">
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || ''}
                searchLabel="solar no experience "
                where={params.where || ''}
                salary_min={params.salary_min}
                entryLevel
                excludePhrases={NO_EXPERIENCE_EXCLUDE_PHRASES}
                includeWhatJobs={false}
                initialData={initialData}
              />
            </Suspense>
          </div>
        </div>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><HardHat className="w-7 h-7 text-orange-500" /><h2 className="text-2xl font-bold text-gray-900">Types of No-Experience Solar Jobs</h2></div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Solar companies hire below the full installer level. These five roles
            appear most often in postings that accept candidates without solar
            experience.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entryRoles.map((role, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <role.icon className="w-10 h-10 text-orange-500 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><GraduationCap className="w-7 h-7 text-blue-600" /><h2 className="text-2xl font-bold text-gray-900">What These Jobs Actually Require</h2></div>
          <p className="text-gray-600 mb-4 max-w-4xl">
            Experience may be optional, but physical requirements are not. Many
            postings ask candidates to lift 40 to 50 pounds and work at height.
            A valid driver&apos;s license and reliable attendance also matter.
            Crews often provide OSHA 10 training after hire.
          </p>
          <p className="text-gray-600 max-w-4xl">
            Warehouse roles usually emphasize driving history and stamina.
            Apprenticeships add formal pay milestones. Those steps may include a
            first independent installation or a first crew-lead assist.
          </p>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><DollarSign className="w-7 h-7 text-green-600" /><h2 className="text-2xl font-bold text-gray-900">Entry-Level Solar Pay</h2></div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            BLS reported a $51,860 median for PV installers in May 2024. That
            figure covers all experience levels. Beginner wages usually start
            below it.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-5 text-center border border-gray-200">
              <p className="text-3xl font-bold text-green-600 mb-2">$17-20/hr</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">Helper / Apprentice</p>
              <p className="text-xs text-gray-500">Starting pay, no experience required</p>
            </div>
            <div className="bg-white rounded-xl p-5 text-center border border-gray-200">
              <p className="text-3xl font-bold text-blue-600 mb-2">$20-25/hr</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">Apprentice, 6-12 Months In</p>
              <p className="text-xs text-gray-500">After step-up milestones on structured programs</p>
            </div>
            <div className="bg-white rounded-xl p-5 text-center border border-gray-200">
              <p className="text-3xl font-bold text-purple-600 mb-2">$51,860</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">Installer National Median</p>
              <p className="text-xs text-gray-500">BLS, May 2024, all experience levels</p>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><TrendingUp className="w-7 h-7 text-orange-500" /><h2 className="text-2xl font-bold text-gray-900">Job Outlook</h2></div>
          <p className="text-gray-600 max-w-4xl">
            BLS projects 42% growth for PV installers from 2024 to 2034. That is
            among the fastest rates it tracks. Expanding crews cannot rely only
            on experienced candidates, so many employers train new hires.
          </p>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><ShieldCheck className="w-7 h-7 text-blue-600" /><h2 className="text-2xl font-bold text-gray-900">No-Experience Solar Jobs FAQ</h2></div>
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Starting Out: More Resources</h2>
          <p className="text-gray-600 max-w-3xl mx-auto mb-6">
            Most beginners start on an installation crew. Check the{' '}
            <Link href="/data/salaries/solar-photovoltaic-installer" className="text-blue-700 underline hover:text-blue-900">Solar PV Installer Salary by State</Link>{' '}
            before comparing offers. Our guides explain{' '}
            <Link href="/resources/how-to-become-a-solar-installer" className="text-blue-700 underline hover:text-blue-900">how to become an installer</Link>{' '}
            and{' '}
            <Link href="/resources/how-to-get-a-solar-apprenticeship" className="text-blue-700 underline hover:text-blue-900">how to find an apprenticeship</Link>.
            Ready to apply? Browse{' '}
            <Link href="/solar-pv-installer-jobs" className="text-blue-700 underline hover:text-blue-900">solar PV installer jobs</Link>{' '}
            or{' '}
            <Link href="/solar-technician-jobs" className="text-blue-700 underline hover:text-blue-900">solar technician jobs</Link>.
          </p>
        </section>

        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> Salary and outlook figures use Bureau
            of Labor Statistics data and national averages. Pay varies by
            employer, region and role. Confirm training requirements with each
            employer.
          </p>
        </section>
      </div>
    </>
  )
}
