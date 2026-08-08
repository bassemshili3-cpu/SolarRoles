import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import { HardHat, ClipboardCheck, DollarSign, ShieldCheck, GraduationCap, Users, TrendingUp } from 'lucide-react'
import { getJobs } from '@/lib/getJobs'


export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Solar Jobs No Experience Required | Entry-Level Installer Openings',
  description: 'Entry-level solar jobs that don\u2019t require prior experience \u2014 helper, apprentice, and trainee roles across the United States. Pay ranges, what employers actually screen for, and what the work involves.',
  keywords: 'solar jobs no experience, entry level solar installer jobs, solar apprentice jobs, solar helper jobs, no experience solar technician jobs, solar trainee jobs',
  openGraph: {
    title: 'Solar Jobs No Experience Required | Now Hiring Nationwide',
    description: 'Browse open entry-level solar positions \u2014 helper, apprentice, and trainee roles with no prior experience required.',
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
    description: "Works alongside the crew carrying panels, staging racking components, and handling material on site. The most common no-experience entry point \u2014 you're trained on the tools and the process as you go.",
    icon: HardHat,
  },
  {
    title: 'Solar Apprentice',
    description: "A structured path toward becoming a full installer, often paired with an OSHA 10 or 30 course paid for by the employer. Pay usually steps up at set milestones as you take on more of the install yourself.",
    icon: GraduationCap,
  },
  {
    title: 'Racking Crew Member',
    description: "Focused specifically on assembling and mounting the racking system before panels go on. Physical, repetitive, and one of the fastest ways to learn the mechanical side of an install.",
    icon: Users,
  },
  {
    title: 'Warehouse / Logistics Associate',
    description: "Pulls and stages equipment for install crews, tracks inventory, and loads trucks. Not on the roof, but a real foot in the door at a solar company \u2014 several postings prioritize warehouse staff for installer openings internally.",
    icon: ClipboardCheck,
  },
  {
    title: 'Trainee Field Technician',
    description: "Shadows a licensed technician on O&M and service calls rather than new installs. Slower-paced entry than a install crew, and a common path in for people coming from general electrical or HVAC backgrounds.",
    icon: TrendingUp,
  },
]

const faqs = [
  {
    question: 'Can you really get a solar job with zero experience?',
    answer: "Yes \u2014 helper, apprentice, and warehouse roles are built for it. Most crews expect to train new hires on the actual installation work; what they're screening for going in is reliability, physical ability, and a willingness to learn, not a resume.",
  },
  {
    question: 'Do I need any certifications before applying?',
    answer: "Usually not on day one. Employers commonly cover OSHA 10 during onboarding, and NABCEP certification typically comes after a year or more in the field, once you've got install hours to qualify for the exam.",
  },
  {
    question: 'How much do entry-level solar jobs pay?',
    answer: "Helper and apprentice roles commonly start around $17 to $20 an hour, with pay stepping up as you take on more of the install independently. For comparison, the Bureau of Labor Statistics put the national median for solar PV installers overall at $51,860 as of May 2024.",
  },
  {
    question: 'What does the job actually involve day to day?',
    answer: "Mostly physical work: carrying and staging panels and racking, running conduit, cleanup, and handing tools to more experienced installers. Expect full days outdoors, on rooftops or ground-mount sites, in varying weather.",
  },
  {
    question: 'How fast can you move up from helper to installer?',
    answer: "Many postings mention 6 months to a year for helpers to move into a full installer role, faster on crews that are actively expanding. Progression usually tracks directly with how much of the install you can be trusted to do unsupervised.",
  },
  {
    question: 'Is a background in construction or electrical work helpful?',
    answer: "It helps but isn't required \u2014 plenty of postings list it as preferred, not mandatory. General comfort with hand and power tools, working at heights, and physical labor matters more than the specific trade background.",
  },
]

export default async function SolarJobsNoExperiencePage({ searchParams }: any) {
  const params = await searchParams

 const initialData = await getJobs({
  // Scopes this landing page to entry-level roles via a keyword
  // AND-filter, independent of the user's own `what` search box below —
  // same pattern used on /lead-solar-installer-jobs.
  descriptionContainsAny: ['no experience', 'entry level', 'entry-level', 'apprentice', 'helper', 'trainee'],
  // Écarte les offres qui matchent un des mots-clés ci-dessus (ex: "apprentice")
  // mais sont en réalité des postes senior/confirmés exigeant de l'expérience.
  excludePhrases: [
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
  ],
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
                initialData={initialData}
              />
            </Suspense>
          </div>
        </div>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><HardHat className="w-7 h-7 text-orange-500" /><h2 className="text-2xl font-bold text-gray-900">Types of No-Experience Solar Jobs</h2></div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Solar companies hire for entry points below "installer" more often than the job titles suggest. These are the roles that show up most often in postings that don't require prior solar experience.
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
            No prior solar experience needed, but postings still screen for a specific set of things: the ability to lift 40 to 50 pounds repeatedly, comfort working at heights and on rooftops, a valid driver's license, and reliable attendance. Most crews handle OSHA 10 training internally once you're hired rather than expecting it going in.
          </p>
          <p className="text-gray-600 max-w-4xl">
            Requirements vary more by role than by company: warehouse and logistics postings rarely ask for anything beyond a clean driving record and physical stamina, while apprentice and trainee roles increasingly mention a structured pay progression tied to specific milestones \u2014 first solo install, first crew lead-assist, and so on.
          </p>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><DollarSign className="w-7 h-7 text-green-600" /><h2 className="text-2xl font-bold text-gray-900">Entry-Level Solar Pay</h2></div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Entry-level pay sits below the national median for solar PV installers overall, which the Bureau of Labor Statistics put at $51,860 as of May 2024 \u2014 that figure reflects licensed, experienced installers, not day-one hires.
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
            The Bureau of Labor Statistics projects 42% employment growth for solar photovoltaic installers between 2024 and 2034, among the fastest-growing occupations it tracks. That growth is a large part of why so many postings skip the experience requirement \u2014 crews are expanding faster than the pool of already-trained installers.
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

        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> Salary and outlook figures are drawn from Bureau of Labor Statistics data and represent national averages. Actual pay varies by employer, region, and role. Verify training and certification expectations directly with employers.
          </p>
        </section>
      </div>
    </>
  )
}