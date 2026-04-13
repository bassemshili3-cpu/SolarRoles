import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, DollarSign, MapPin, AlertTriangle, Zap, Wrench, Users, Flame, TrendingUp, CalendarDays } from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Urgent Demand for Lineman Professionals | 21,800+ Openings in 2026',
  description: 'Lineman jobs hiring now across all 50 states. $70K to $130K+ with overtime. More linemen are retiring than entering the trade, and utilities are desperate. Browse positions and apply today.',
  keywords: 'lineman jobs, lineman jobs hiring, power lineman jobs, journeyman lineman jobs, apprentice lineman, electrical lineman careers, lineworker jobs 2026',
  openGraph: {
    title: 'Lineman Jobs | Urgent Need Across All 50 States',
    description: 'The trade is losing workers faster than it replaces them. Utilities are hiring aggressively. Browse openings now.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lineman Jobs 2026 | $70K to $130K+ With Overtime',
    description: '21,800 lineman positions projected this year alone. Apprentice to journeyman. Apply directly.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/lineman-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Lineman Jobs',
  description: 'Find lineman jobs hiring across the United States. From apprentice groundhand to journeyman lineman and beyond.',
  url: 'https://www.oh-my-job.com/lineman-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Lineman Jobs',
    description: 'Current job listings for power line workers, apprentice and journeyman linemen',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How much do linemen make in 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Apprentice linemen start between $35,000 and $55,000 per year. Journeyman linemen earn $70,000 to $100,000 base, with overtime pushing total compensation to $100,000 to $130,000 or higher. Storm restoration work and travel assignments can add $20,000 to $50,000 annually on top of base pay.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does it take to become a journeyman lineman?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The standard apprenticeship is 7,000 hours of on-the-job training plus classroom instruction, which takes approximately 3.5 to 4 years to complete. Some programs compress this timeline slightly, but most take the full four years.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you need a degree to become a lineman?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. A high school diploma or GED is the minimum educational requirement. Many linemen enter through a pre-apprenticeship program at a community college or trade school, which typically takes 7 to 15 weeks. A CDL (Commercial Driver License) is required by most employers.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is being a lineman dangerous?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Line work is consistently ranked among the most dangerous occupations in the United States. Workers handle live high-voltage systems, work at height on poles and towers, and respond to storm damage in severe weather. Modern safety training, equipment, and regulations have significantly reduced fatality and injury rates, but the inherent risk remains higher than most trades.',
      },
    },
    {
      '@type': 'Question',
      name: 'Why are there so many lineman job openings right now?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Three forces are converging. First, a wave of retirements is hitting the trade as linemen who entered the field in the 1980s and 1990s age out. Second, apprenticeship enrollment dropped significantly between 2012 and 2017, creating a gap in the pipeline. Third, demand is expanding due to wildfire grid hardening, data center construction, renewable energy transmission projects, and general infrastructure investment.',
      },
    },
  ],
}

/* ─── SECTION DATA ──────────────────────────────────────────── */

const careerPath = [
  {
    role: 'Groundhand / Grunt',
    salary: '$32K to $45K',
    duration: '6 to 12 months',
    description: 'You carry tools, set up the work zone, direct traffic, handle materials on the ground, and learn by watching. Every task you do supports the linemen working above you. The role is physically demanding and unglamorous, but it is the only way most people get their foot into the trade. Some employers hire groundhands with zero experience if you show up on time, pass a drug test, and can lift 50 pounds repeatedly.',
  },
  {
    role: 'Apprentice Lineman (Year 1 to 4)',
    salary: '$40K to $70K (increases each year)',
    duration: '3.5 to 4 years (7,000 OJT hours)',
    description: 'Once accepted into an apprenticeship, you begin climbing, working with energized lines under supervision, learning to frame poles, pull wire, and splice cable. Your pay increases each year as you advance through the program. Classroom instruction runs alongside field work, covering electrical theory, NESC codes, rigging, and safety. By year three, you are performing most tasks independently with a journeyman observing.',
  },
  {
    role: 'Journeyman Lineman',
    salary: '$70K to $130K+ (with OT)',
    duration: 'Career position',
    description: 'The journeyman ticket is the milestone that defines the trade. It means you are qualified to work on any part of the electrical distribution or transmission system without direct supervision. It is the credential that unlocks the highest base pay, qualifies you for storm restoration callouts, and makes you eligible to work for any utility or contractor in the country. A journeyman who is willing to travel and take storm work can earn $150,000 or more in a single year.',
  },
  {
    role: 'Foreman / Line Supervisor',
    salary: '$90K to $140K',
    duration: '5+ years journeyman experience',
    description: 'The foreman runs the crew. You plan the day, assign tasks, coordinate with dispatch and engineering, and carry the responsibility for every person working under you. The role requires both the technical knowledge to make safe work decisions and the leadership ability to manage a crew that operates in high-risk conditions daily.',
  },
  {
    role: 'Line Superintendent / General Foreman',
    salary: '$110K to $160K+',
    duration: '10+ years total experience',
    description: 'Superintendents oversee multiple crews across a region. The role is a mix of logistics, budgeting, scheduling, and serving as the link between field operations and management. Many linemen who reach this level eventually move into utility management, safety director roles, or start their own line construction companies.',
  },
]

const whyShortage = [
  {
    title: 'The Retirement Cliff Is Already Here',
    detail: 'More linemen are leaving the trade each year than are entering it. The workers who built and maintained the grid through the 1980s and 1990s are now reaching retirement age in large numbers. An estimated 21,800 lineman positions will open in 2026 alone, and the pipeline of new apprentices is not deep enough to fill them all. This is not a projected future problem. It is a current one.',
  },
  {
    title: 'The Apprenticeship Gap of 2012 to 2017',
    detail: 'During the years following the Great Recession, enrollment in lineman apprenticeship programs dropped sharply. Fewer young workers entered the trade because construction slowed and utilities froze hiring. That five-year gap is now visible in the workforce: there are significantly fewer linemen in the 8 to 13 year experience range than in any other bracket. The workers who should be filling foreman and senior journeyman roles simply do not exist in the numbers the industry needs.',
  },
  {
    title: 'Demand Is Growing, Not Just Replacing',
    detail: 'Grid hardening in wildfire-prone Western states requires specialized line crews to rebuild and reinforce thousands of miles of transmission and distribution lines. Data center construction is exploding across Virginia, Texas, and the Midwest, each facility requiring new high-voltage feeds. Renewable energy projects need transmission lines connecting remote solar and wind farms to population centers. Every one of these trends creates lineman jobs that did not exist five years ago.',
  },
]

const stormWork = [
  {
    title: 'What Storm Restoration Actually Pays',
    detail: 'When a hurricane, ice storm, or severe weather event takes down power lines, utilities activate mutual aid agreements and call in crews from across the country. Storm restoration pay is typically double time or higher, with 16 to 20 hour shifts for days or weeks straight. A two-week hurricane deployment can add $10,000 to $25,000 to a lineman\'s annual income in a single event. Some journeymen build their entire financial strategy around storm season.',
  },
  {
    title: 'How Storm Callouts Work',
    detail: 'Your employer or union hall contacts you when a mutual aid request comes in. You pack a bag, load your truck, and drive (or fly) to the affected area. Housing is typically provided in hotels or staging areas. You work until the grid is restored, then drive home. Some storms last three days. Some last three weeks. You do not get to pick. If you are on call and your name comes up, declining repeatedly will move you down the list.',
  },
  {
    title: 'The Storm Chaser Career Strategy',
    detail: 'A small but well-compensated subset of linemen work primarily as traveling line workers, moving from one storm or construction project to the next. These workers sign with contractors rather than utilities, accept assignments across multiple states, and earn significantly more per year than their counterparts at a single utility. The trade-off is that home time is unpredictable, the work is physically brutal, and the lifestyle is not compatible with a fixed family schedule. The workers who thrive in it tend to be younger journeymen without children or veterans of the trade who have already paid off their house.',
  },
]

const physicalRealities = [
  {
    title: 'The Weight Limit Nobody Advertises',
    detail: 'OSHA fall protection standards require that a lineman\'s total weight (body plus tools plus equipment) does not exceed the rating of the climbing and fall arrest systems in use. In practice, most employers enforce a body weight limit of 265 pounds, and some climbing equipment is rated lower. If you weigh more than that, you cannot be issued the gear required to do the job. This is not a fitness preference. It is a regulatory constraint that is checked during onboarding.',
  },
  {
    title: 'Climbing Is Not Something You Get Used To. It Is Something You Do or You Do Not.',
    detail: 'Lineman work involves climbing wood poles with gaffs (sharp spikes strapped to your boots) and a body belt. The first time you climb a 40-foot pole and lean back with nothing but a strap between you and the ground, your body will fight you. Some people acclimate within a few climbs. Others never get past the instinctive fear response. Pre-apprenticeship programs exist specifically to test this before you commit years to an apprenticeship you cannot complete.',
  },
  {
    title: 'The Weather Does Not Cancel Your Shift',
    detail: 'Line work happens in the conditions that create the need for it. When a storm knocks out power, the crew deploys into the storm. When temperatures drop below zero, the crew works through it because the lines are failing because of the cold. Summer heat in the South means climbing a pole that has been absorbing direct sunlight for eight hours. The trade selects for people who can function at a high physical and cognitive level regardless of the conditions around them.',
  },
  {
    title: 'The Cumulative Toll on Your Body',
    detail: 'Lineman work is physically sustainable for a career, but it takes a toll that accumulates. Shoulders bear the strain of overhead work. Knees absorb the impact of climbing. Backs carry the weight of tools and equipment over decades. The linemen who reach their 50s in the trade without major issues are typically the ones who invested in core strength, stretching, and recovery from the beginning of their career rather than relying on youth to absorb the punishment.',
  },
]

const unionVsNonUnion = [
  {
    type: 'Union (IBEW)',
    pay: '$38 to $65/hr journeyman scale (varies by local)',
    benefits: 'Full medical, dental, vision, defined-benefit pension, annuity, paid training, dispatch hall system',
    tradeOff: 'Must complete IBEW/NJATC apprenticeship (competitive entry), work is dispatched through the hall (less control over assignment), dues are deducted from every check, some locals have slow dispatch during low-demand periods',
  },
  {
    type: 'Non-Union Contractor',
    pay: '$25 to $50/hr journeyman (varies widely by employer)',
    benefits: 'Varies. Some offer 401(k), medical, per diem. Others offer little beyond the hourly rate.',
    tradeOff: 'Faster hiring process, more geographic flexibility, but no pension, less consistent benefits, and pay is negotiated individually rather than set by a collective agreement. The best non-union contractors pay competitively. The worst pay significantly less for the same risk.',
  },
]

const faqs = [
  {
    question: 'How much do linemen make in 2026?',
    answer: 'Apprentice linemen start between $35,000 and $55,000 depending on the year of their apprenticeship and the region. Journeyman linemen earn $70,000 to $100,000 in base pay, with overtime pushing total annual compensation to $100,000 to $130,000 at most utilities. Linemen who travel for storm work or accept contractor assignments can exceed $150,000 in high-demand years.',
  },
  {
    question: 'How long does it take to become a journeyman lineman?',
    answer: 'The standard path is a 4-year apprenticeship consisting of approximately 7,000 hours of on-the-job training plus classroom instruction. Before the apprenticeship, most candidates complete a pre-apprenticeship or lineman training program lasting 7 to 15 weeks. From the day you start training to the day you receive your journeyman ticket, expect 4.5 to 5 years total.',
  },
  {
    question: 'Do I need a degree to become a lineman?',
    answer: 'No. A high school diploma or GED is the baseline. Most employers require a valid CDL (Commercial Driver License) Class A, which you can obtain during or before your apprenticeship. A pre-apprenticeship certificate from a recognized lineman school strengthens your application but is not universally required.',
  },
  {
    question: 'Is line work dangerous?',
    answer: 'Yes. Electrical line work is consistently ranked among the ten most dangerous occupations in the country. The primary risks are electrocution, falls from height, and being struck by equipment. Modern safety training, rubber gloving techniques, and protective equipment have reduced fatality rates significantly over the past two decades, but the inherent exposure to high-voltage systems and elevated work positions means the risk is always present. The workers and employers who take safety seriously have strong records. The ones who cut corners end up in incident reports.',
  },
  {
    question: 'What is the difference between a distribution lineman and a transmission lineman?',
    answer: 'Distribution linemen work on the lines that deliver power from substations to homes and businesses, typically at voltages below 35 kV. Transmission linemen work on the high-voltage lines (69 kV to 765 kV) that move power from generating stations to substations. Transmission work involves taller structures, higher voltage, and different safety procedures. Transmission linemen generally earn more because the technical demands and risk profile are higher.',
  },
  {
    question: 'Can I become a lineman at 30, 35, or 40?',
    answer: 'Yes, though the physical demands become more relevant as age increases. Many apprenticeship programs accept candidates into their late 30s or early 40s if they are in strong physical condition and can pass the climbing and fitness assessments. Career changers from construction, military, and other physically demanding fields often transition successfully. The key constraint is not age but whether your body can sustain the work for enough years to justify the training investment.',
  },
]

export default async function LinemanJobsPage({ searchParams }: any) {
  const params = await searchParams

  const [{ count }, initialData] = await Promise.all([
    getCachedJobCount(params.what || 'lineman', params.where || '', params.salary_min),
    searchJobs({ what: params.what || 'lineman', where: params.where || '', results_per_page: 30, page: 1 })
      .then((data: AdzunaSearchResult) => ({ ...data, results: data.results.map(normalizeAdzuna) })),
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {count > 0 ? count.toLocaleString() : ''} Lineman Jobs Available Across the United States
          </h1>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="lineman" />
          </aside>
          <div className="flex-1">
            {count > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">{count.toLocaleString()}</span> positions available
              </p>
            )}
            <AIJobMatcherWrapper />
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList what={params.what || 'lineman'} where={params.where || ''} salary_min={params.salary_min} initialData={initialData} />
            </Suspense>
          </div>
        </div>

        {/* ── WHY THERE'S A SHORTAGE ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">Why America Cannot Hire Linemen Fast Enough</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            There are an estimated 21,800 lineman positions to fill in 2026 alone. The shortage is not a forecast. It is a headcount problem that utilities and contractors are dealing with right now. Three forces created it.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {whyShortage.map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                <h3 className="font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── THE CAREER PATH ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Wrench className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">From Groundhand to Superintendent: The Full Career Ladder</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            The lineman career is one of the most structured progressions in the trades. Each step has a defined timeline, a pay increase, and a clear set of skills you must demonstrate before advancing. Here is the full sequence.
          </p>
          <div className="space-y-4">
            {careerPath.map((step, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex flex-wrap items-center gap-4 mb-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 font-bold rounded-full text-sm">{i + 1}</span>
                  <h3 className="font-bold text-gray-900 text-lg">{step.role}</h3>
                  <span className="text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">{step.salary}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{step.duration}</span>
                </div>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── STORM WORK ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-7 h-7 text-amber-600" />
            <h2 className="text-2xl font-bold text-gray-900">Storm Restoration: The Paycheck Multiplier Nobody Explains</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Storm work is the single largest variable in a lineman's annual income. A journeyman who never chases storms earns a strong salary. A journeyman who deploys to two or three major events per year can earn 30% to 50% more. Here is how the system works.
          </p>
          <div className="space-y-6">
            {stormWork.map((item, i) => (
              <div key={i} className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── UNION vs NON-UNION ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Union vs. Non-Union: The Two Worlds of Line Work</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The lineman trade operates across two parallel systems with different pay structures, benefits, hiring processes, and career dynamics. The choice between them shapes your entire career experience.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {unionVsNonUnion.map((path, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                <h3 className="font-bold text-gray-900 text-lg mb-3">{path.type}</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Typical pay</p>
                    <p className="text-gray-500">{path.pay}</p>
                  </div>
                  <div>
                    <p className="font-medium text-green-700">Benefits</p>
                    <p className="text-gray-500">{path.benefits}</p>
                  </div>
                  <div>
                    <p className="font-medium text-amber-700">Trade-offs</p>
                    <p className="text-gray-500">{path.tradeOff}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PHYSICAL REALITIES ── */}
        <section className="mt-20">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">The Physical Realities of Line Work That Job Postings Skip</h2>
                <p className="text-gray-700 mb-6">
                  Recruiting materials show the salary, the truck, and the brotherhood. They do not show you the parts that determine whether you can sustain this career for 20 years or wash out after 2.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  {physicalRealities.map((item, i) => (
                    <div key={i} className="bg-white rounded-lg p-5">
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW TO GET IN ── */}
        <section className="mt-20">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Break Into the Trade with Zero Experience</h2>
                <p className="text-gray-700 mb-6">
                  The lineman trade has a defined entry process. Following it in order eliminates guesswork and puts you ahead of candidates who apply randomly.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { title: 'Complete a pre-apprenticeship program', detail: 'Lineman training programs run 7 to 15 weeks and teach climbing, rigging, electrical fundamentals, and CPR/First Aid. Graduates have a dramatically higher acceptance rate into formal apprenticeships. Programs are offered at community colleges and dedicated trade schools (NLC, SLTC, NW Lineman College) for $5,000 to $15,000 tuition.' },
                    { title: 'Get your CDL Class A', detail: 'Nearly every lineman employer requires a Commercial Driver License because you will operate bucket trucks, digger derricks, and other heavy vehicles. Many pre-apprenticeship programs include CDL training. If yours does not, budget an additional $3,000 to $7,000 and 3 to 6 weeks to obtain it separately.' },
                    { title: 'Apply to apprenticeships and groundhand positions simultaneously', detail: 'IBEW/NJATC apprenticeships are competitive and accept cohorts on a schedule. Contractor groundhand positions hire continuously. Applying to both gives you the best chance of starting quickly. If you land a groundhand job first, the field experience strengthens your apprenticeship application.' },
                    { title: 'Prepare for the physical assessment', detail: 'Apprenticeship programs test climbing ability, upper body strength, and fitness. The climb test typically involves ascending a 30 to 40 foot pole with gaffs and a body belt. If you have never climbed before, attend a climbing orientation session (most training schools offer them) before your test date. Arriving unprepared is the most common reason candidates are rejected.' },
                  ].map((item, i) => (
                    <div key={i} className="bg-white rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 font-bold rounded-full text-xs">{i + 1}</span>
                        <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                      </div>
                      <p className="text-gray-600 text-sm">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Flame className="w-7 h-7 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Lineman Jobs</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group bg-white border border-gray-200 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                  <h3 className="font-semibold text-gray-900 pr-4">{faq.question}</h3>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>

        {/* ── DISCLAIMER ── */}
        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> Oh My Job is an independent job search platform and is not affiliated with any utility company, electrical contractor, union local, or training institution. Job listings are sourced from third-party APIs. Salary figures are estimates based on industry data and may not reflect specific offers. Apprenticeship requirements, certification standards, and safety regulations vary by employer and jurisdiction. Line work involves inherent physical risks including electrocution and falls from height. Consult employers and training providers directly for current requirements. This page is for informational purposes only.
          </p>
        </section>
      </div>
    </>
  )
}