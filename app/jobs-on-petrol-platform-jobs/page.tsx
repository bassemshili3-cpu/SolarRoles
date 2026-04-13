import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, DollarSign, MapPin, AlertTriangle, Anchor, Wrench, Users, Flame, HeartPulse, CalendarDays } from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Urgent: Petrol Platform Jobs Available Now | Offshore Positions Hiring',
  description: 'Petrol platform jobs hiring across the Gulf of Mexico, Alaska, and offshore US operations. $50K to $200K+ depending on role. Rotational schedules, housing included. Browse openings and apply today.',
  keywords: 'petrol platform jobs, oil rig jobs, offshore platform jobs, petroleum platform hiring, offshore oil jobs, gulf of mexico oil jobs, oil rig careers 2026',
  openGraph: {
    title: 'Petrol Platform Jobs | Offshore Positions Hiring Now',
    description: 'Browse offshore petrol platform jobs across the US. High pay, rotational schedules, no rent. Apply directly.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Petrol Platform Jobs | $50K to $200K+ Offshore Careers',
    description: 'Offshore petroleum platform positions hiring now. Entry-level to senior roles. Rotational schedules with extended time off.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/petrol-platform-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Petrol Platform Jobs',
  description: 'Find offshore petrol platform jobs hiring across the United States. Browse positions from entry-level roustabout to senior drilling engineer.',
  url: 'https://www.oh-my-job.com/petrol-platform-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Petrol Platform Jobs',
    description: 'Current job listings on petroleum platforms and offshore rigs',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How much do petrol platform workers make?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Entry-level roustabouts earn $45,000 to $60,000 per year. Experienced roughnecks and mechanics make $65,000 to $90,000. Drillers and toolpushers earn $90,000 to $130,000. Engineers and installation managers can exceed $180,000 to $250,000 annually. Most positions include housing, meals, and transportation to the platform at no cost to the worker.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you need experience to work on a petrol platform?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Entry-level positions such as roustabout and galley hand do not require prior offshore experience. Physical fitness, a willingness to work long shifts, and basic safety certifications are the primary requirements. Many companies provide paid training for new hires.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the typical schedule on an offshore platform?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most US offshore platforms operate on rotational schedules. The standard is 14 days on the platform followed by 14 days off at home. Some operations run 21/21 or 28/28 rotations. During the on period, shifts are typically 12 hours per day, seven days per week.',
      },
    },
    {
      '@type': 'Question',
      name: 'What certifications do petrol platform jobs require?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most offshore employers require a TWIC (Transportation Worker Identification Credential) card, an offshore medical certificate, and BOSIET (Basic Offshore Safety Induction and Emergency Training) or equivalent SafeGulf/HUET certification. Some roles require additional credentials such as welding certifications or a commercial driver license.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where are most US offshore petrol platform jobs located?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The vast majority of US offshore petroleum jobs are in the Gulf of Mexico, with departure ports concentrated along the coasts of Louisiana and Texas. A smaller number of positions exist in Alaska and off the coast of California. Workers typically fly or take a crew boat from port cities like Houma, Lafayette, or Port Fourchon to reach the platform.',
      },
    },
  ],
}

/* ─── SECTION DATA ──────────────────────────────────────────── */

const careerLadder = [
  {
    role: 'Roustabout',
    salary: '$45K to $60K',
    experience: 'None required',
    description: 'The entry point. You clean decks, move equipment, assist crane operations, and do whatever the crew needs. Every offshore career starts here or in the galley. Physical fitness matters more than any credential. Companies hire based on attitude and a clean safety record, not your resume.',
    timeToNext: '6 to 12 months',
  },
  {
    role: 'Roughneck',
    salary: '$60K to $85K',
    experience: '6 to 18 months as roustabout',
    description: 'You work directly on the drill floor: handling pipe, operating tongs, maintaining drilling equipment, and monitoring the well during active operations. This is where the technical knowledge begins. You learn to read the rig and understand what the well is doing before anyone tells you.',
    timeToNext: '2 to 3 years',
  },
  {
    role: 'Derrickhand',
    salary: '$75K to $100K',
    experience: '2+ years as roughneck',
    description: 'You manage the mud system (drilling fluid), work the derrick during tripping operations, and oversee pipe handling at height. The role requires comfort working 90 feet above the drill floor in conditions that most people would find disorienting. The pay increase reflects the risk.',
    timeToNext: '2 to 4 years',
  },
  {
    role: 'Driller',
    salary: '$90K to $130K',
    experience: '5+ years combined offshore',
    description: 'The driller operates the drawworks, rotary table, and mud pumps, essentially controlling the entire drilling process from the driller\'s chair. You make the decisions that determine whether a well gets drilled safely or becomes a problem. The role carries the heaviest responsibility on the drill floor.',
    timeToNext: '3 to 5 years',
  },
  {
    role: 'Toolpusher / Rig Supervisor',
    salary: '$120K to $160K',
    experience: '8+ years, driller background',
    description: 'You manage the entire drilling crew across both shifts, coordinate with the operating company, handle logistics, and make the call on safety shutdowns. The toolpusher is the highest-ranking person on the rig floor and reports directly to the offshore installation manager.',
    timeToNext: 'Terminal or move to OIM track',
  },
  {
    role: 'Offshore Installation Manager',
    salary: '$180K to $250K+',
    experience: '12+ years, management track',
    description: 'The OIM has absolute authority over the entire platform: every person, every system, every emergency decision. In legal terms, the OIM is the equivalent of a ship captain. The role requires deep technical knowledge, management experience, and the temperament to stay calm when nothing else on the platform is.',
    timeToNext: 'Senior management or consulting',
  },
]

const rotationTypes = [
  {
    schedule: '14/14',
    description: 'Two weeks on the platform, two weeks at home. The most common rotation in the US Gulf of Mexico. You work 12-hour shifts every day during your hitch, then have 14 consecutive days off. Over a full year, you work approximately 182 days.',
    bestFor: 'Standard Gulf of Mexico operations, most drilling contractors',
  },
  {
    schedule: '21/21',
    description: 'Three weeks on, three weeks off. Less common in the US but standard in some international operations and certain production platforms. The longer hitch is harder mentally but the extended break compensates.',
    bestFor: 'Production platforms, some international contracts',
  },
  {
    schedule: '28/28',
    description: 'Four weeks on, four weeks off. Typical for deepwater and remote operations where crew changes are logistically expensive. The month-long hitch is the most demanding, but you effectively work only six months per year.',
    bestFor: 'Deepwater rigs, remote Arctic or sub-Arctic operations',
  },
  {
    schedule: '7/7',
    description: 'One week on, one week off. Found on some inland barges and shallow-water platforms close to shore. The short rotation means more frequent crew changes but less time away from home per hitch.',
    bestFor: 'Inland barges, shallow-water shelf operations, pipeline work',
  },
]

const hiddenBenefits = [
  {
    title: 'Zero Living Expenses During Your Hitch',
    detail: 'Housing, meals, laundry, and transportation to the platform are all provided by the employer. During a 14-day hitch, your entire paycheck is disposable income because you have no rent, no groceries, and no commute to pay for. Over a year, this effective savings is worth $15,000 to $25,000 in after-tax income that land-based workers spend just to exist.',
  },
  {
    title: 'Half the Year Off',
    detail: 'A 14/14 rotation means 182 working days per year. The remaining 183 days are yours. No vacation requests, no PTO accrual, no manager approval. That is more time off than any corporate job offers, and it is built into the schedule from day one. Some workers use the off time to run a side business, earn a degree, or travel.',
  },
  {
    title: 'Overtime Is the Norm, Not the Exception',
    detail: 'A standard 12-hour shift on a platform means 84 hours per week during your hitch. Anything above 40 hours is overtime in most employment structures. That means roughly half of every paycheck is calculated at 1.5x your base rate. The posted salary figures for offshore jobs already assume this, but workers moving from 40-hour-week land jobs are often surprised at how the math works.',
  },
  {
    title: 'Accelerated Retirement Math',
    detail: 'Combine high gross pay, zero living expenses during work periods, and low-cost living during off periods (many offshore workers live in rural areas where housing is cheap), and the savings rate is unlike any other blue-collar profession. A disciplined roughneck earning $80K who banks 50% of his take-home can accumulate a down payment for a house in 18 months. Try doing that on $80K in any city in America.',
  },
]

const whatNobodyTells = [
  {
    title: 'The Helicopter Ride Is Not Optional',
    detail: 'Most deepwater platforms are 100+ miles from shore. You reach them by helicopter, not boat. If you have a severe fear of flying, specifically in a four-seat chopper over open ocean, this career is not compatible with that. Every offshore worker must also complete Helicopter Underwater Escape Training (HUET) and demonstrate they can exit a submerged aircraft cabin while blindfolded. This is a pass/fail requirement before your first hitch.',
  },
  {
    title: 'Communication With Home Is Limited',
    detail: 'Satellite internet on platforms has improved but remains inconsistent. Video calls drop. Streaming does not work. You may have Wi-Fi for messaging and email but not enough bandwidth for anything demanding. Some older platforms have no personal internet access at all. If your relationship, family situation, or mental health depends on constant connectivity, the adjustment is harder than the physical work.',
  },
  {
    title: 'The Weight Gain Is Real',
    detail: 'Platform galleys serve large meals designed for people doing 12 hours of physical labor. The food is available around the clock because crews run on opposite shifts. Most new hires gain 10 to 20 pounds in their first few hitches because they eat like they are working hard even during downtime. The platforms with gyms help. The ones without do not.',
  },
  {
    title: 'Your Social Life Operates on a Calendar Nobody Else Uses',
    detail: 'When you are on a 14/14 rotation, half of all birthdays, holidays, weddings, and family events will fall during your hitch. You do not get to choose which half. Missing Christmas one year and being home for it the next is the rhythm of offshore life. Some people adapt. Others find it erodes their relationships over time. Knowing this upfront is better than discovering it mid-career.',
  },
]

const faqs = [
  {
    question: 'How much do petrol platform workers make in the US?',
    answer: 'Compensation depends heavily on the role. Entry-level roustabouts start between $45,000 and $60,000 per year. Roughnecks and mechanics earn $65,000 to $90,000. Drillers and toolpushers reach $90,000 to $130,000. Senior positions like offshore installation managers and petroleum engineers earn $180,000 to $250,000 or more. All of these figures are before accounting for the fact that housing and meals are provided, which effectively adds $15,000 to $25,000 in annual value.',
  },
  {
    question: 'Can you get an offshore job with no experience?',
    answer: 'Yes. Roustabout and galley hand are designed as entry-level positions that require no prior offshore experience. What you need is physical fitness, a clean background check, a TWIC card, basic safety training (SafeGulf or equivalent), and a willingness to work 12-hour shifts in a confined industrial environment. Many contractors provide the safety training as part of their onboarding process.',
  },
  {
    question: 'What does a day look like on an offshore platform?',
    answer: 'You work one of two 12-hour shifts: day (6 AM to 6 PM) or night (6 PM to 6 AM). The shift starts with a safety meeting, followed by a briefing on the day\'s tasks. The work itself varies by role: roustabouts move equipment and maintain the deck, roughnecks work the drill floor, mechanics service rotating equipment, and so on. Meals are served in the galley at set times. After your shift, you have 12 hours for eating, sleeping, exercising (if a gym is available), and personal time. There is no leaving the platform during your hitch.',
  },
  {
    question: 'Is offshore platform work dangerous?',
    answer: 'The industry has invested billions in safety systems, training, and regulatory compliance since the Macondo blowout in 2010. Modern platforms are significantly safer than they were a generation ago. That said, you are working with heavy machinery, high-pressure systems, and volatile hydrocarbons in an environment surrounded by water 100 miles from the nearest hospital. Injuries happen. The companies that take safety seriously and the workers who follow procedures have strong records. The ones that do not make the news.',
  },
  {
    question: 'What certifications do I need to start?',
    answer: 'At minimum you need a TWIC (Transportation Worker Identification Credential) card issued by the TSA, which requires a background check and costs around $125. You also need an offshore medical certificate confirming fitness for duty. Most employers require SafeGulf or BOSIET basic safety training, which is a multi-day course costing $800 to $1,500. Some employers cover this cost for new hires. Beyond that, additional certifications (rigging, welding, H2S awareness) increase your hiring prospects and starting pay.',
  },
  {
    question: 'Where do I fly out from to reach the platform?',
    answer: 'For Gulf of Mexico operations, helicopter departure points are concentrated along the Louisiana and Texas coasts. Houma, Lafayette, Morgan City, Port Fourchon, and Galveston are the most common departure cities. Your employer arranges and pays for the helicopter transport. For Alaska operations, departure is typically from Anchorage or Kenai. You are generally responsible for getting yourself to the departure city; the company handles everything from there.',
  },
]

export default async function PetrolPlatformJobsPage({ searchParams }: any) {
  const params = await searchParams

  const [{ count }, initialData] = await Promise.all([
    getCachedJobCount(params.what || 'petrol platform', params.where || '', params.salary_min),
    searchJobs({ what: params.what || 'petrol platform', where: params.where || '', results_per_page: 30, page: 1 })
      .then((data: AdzunaSearchResult) => ({ ...data, results: data.results.map(normalizeAdzuna) })),
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {count > 0 ? count.toLocaleString() : ''} Petrol Platform Jobs Available Across the United States
          </h1>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="petrol platform" />
          </aside>
          <div className="flex-1">
            {count > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">{count.toLocaleString()}</span> positions available
              </p>
            )}
            <AIJobMatcherWrapper />
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList what={params.what || 'petrol platform'} where={params.where || ''} salary_min={params.salary_min} initialData={initialData} />
            </Suspense>
          </div>
        </div>

        {/* ── THE CAREER LADDER NOBODY MAPS OUT ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Wrench className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">The Offshore Career Ladder from Zero Experience to Platform Command</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Every person running a petroleum platform started somewhere. Most of them started as roustabouts. The career progression in offshore drilling is one of the most clearly defined advancement paths in any industry, and it operates almost entirely on demonstrated competence rather than credentials. Here is the sequence, including what each jump actually requires.
          </p>
          <div className="space-y-4">
            {careerLadder.map((step, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex flex-wrap items-center gap-4 mb-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 font-bold rounded-full text-sm">{i + 1}</span>
                  <h3 className="font-bold text-gray-900 text-lg">{step.role}</h3>
                  <span className="text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">{step.salary}</span>
                  <span className="text-sm text-gray-500">{step.experience}</span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{step.description}</p>
                {step.timeToNext && (
                  <p className="text-xs text-blue-600 font-medium">Typical time to next level: {step.timeToNext}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── ROTATION SCHEDULES DECODED ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CalendarDays className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Rotation Schedules Decoded</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            The rotation schedule determines how much time you spend on the platform and how much time you spend at home. It also determines the rhythm of your entire life outside of work. Most job postings list the rotation in shorthand. Here is what each format actually means for your calendar.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {rotationTypes.map((rotation, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{rotation.schedule}</h3>
                <p className="text-gray-600 text-sm mb-3">{rotation.description}</p>
                <p className="text-xs text-gray-500"><span className="font-medium text-gray-700">Typical for:</span> {rotation.bestFor}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── THE FINANCIAL ADVANTAGES NOBODY QUANTIFIES ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">The Financial Advantages That Never Appear on the Job Posting</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Offshore petroleum jobs pay well by any standard. But the real financial advantage is not the salary itself. It is the combination of high income with near-zero living costs during work periods. No other profession offers this structure at scale.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {hiddenBenefits.map((benefit, i) => (
              <div key={i} className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── WHAT NOBODY TELLS YOU BEFORE YOUR FIRST HITCH ── */}
        <section className="mt-20">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What Nobody Tells You Before Your First Hitch</h2>
                <p className="text-gray-700 mb-6">
                  Offshore recruiting materials show the salary, the schedule, and the career path. They do not show you the parts that cause people to quit after one rotation. Knowing these in advance separates the people who build long careers from the ones who wash out.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  {whatNobodyTells.map((item, i) => (
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

        {/* ── WHERE THE JOBS ARE ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Where US Offshore Petroleum Jobs Are Concentrated</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The geography of offshore petroleum work in the United States is not evenly distributed. Understanding where the operations are tells you where to position yourself for the fastest hiring timeline.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Anchor className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">Gulf of Mexico</h3>
              </div>
              <p className="text-gray-600 text-sm mb-2">Accounts for roughly 97% of all US offshore oil production. Over 1,800 active platforms operate in federal waters off Louisiana, Texas, Mississippi, and Alabama.</p>
              <p className="text-xs text-gray-500"><span className="font-medium">Key departure cities:</span> Houma, Lafayette, Port Fourchon, Galveston, Morgan City</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Anchor className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">Alaska</h3>
              </div>
              <p className="text-gray-600 text-sm mb-2">Cook Inlet and the North Slope support a smaller number of offshore operations. The extreme conditions command a premium on pay, and rotations tend to be longer (28/28 is standard). Positions are fewer but the compensation per role is among the highest in the industry.</p>
              <p className="text-xs text-gray-500"><span className="font-medium">Key departure cities:</span> Anchorage, Kenai, Deadhorse</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Anchor className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">California (Limited)</h3>
              </div>
              <p className="text-gray-600 text-sm mb-2">A small number of production platforms operate in federal waters off the California coast, primarily in the Santa Barbara Channel. No new drilling leases have been issued in decades, and existing operations are in maintenance or decommissioning phases. Opportunities exist but are sparse and declining.</p>
              <p className="text-xs text-gray-500"><span className="font-medium">Key area:</span> Santa Barbara Channel, Platform Holly area</p>
            </div>
          </div>
        </section>

        {/* ── CERTIFICATIONS ROADMAP ── */}
        <section className="mt-20">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Certification Roadmap: What to Get, in What Order, and What It Costs</h2>
                <p className="text-gray-700 mb-6">
                  The certification requirements for offshore work sound overwhelming until you break them into the sequence that actually matters. Here is the order most successful candidates follow, from most essential to most advantageous.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { title: 'TWIC Card (Required)', detail: 'Transportation Worker Identification Credential. Issued by TSA after a background check. Takes 8 to 12 weeks to process. Cost: ~$125. Without this, you cannot access any offshore facility, marine terminal, or port area. Apply early; this is the longest bottleneck.', order: '1' },
                    { title: 'Offshore Medical Certificate (Required)', detail: 'A physician confirms you are physically fit for offshore duty. Includes vision, hearing, cardiovascular screening, and a drug test. Cost: $150 to $300. Valid for two years. Fail this and nothing else matters.', order: '2' },
                    { title: 'SafeGulf / BOSIET (Required by most)', detail: 'Basic safety training covering helicopter underwater escape, sea survival, firefighting, and first aid. Two to four day course. Cost: $800 to $1,500. Some employers cover this for new hires, so ask before paying out of pocket.', order: '3' },
                    { title: 'H2S Awareness (Strongly Recommended)', detail: 'Hydrogen sulfide is present in many drilling operations and is lethal at low concentrations. This half-day course teaches detection, response, and use of breathing apparatus. Cost: $100 to $200. Nearly every drilling contractor expects this.', order: '4' },
                    { title: 'Rigging & Slinging (Advantageous)', detail: 'Covers safe lifting, crane signals, and load calculations. Makes you more versatile on the platform from day one. Cost: $300 to $500. Not required for entry but significantly increases your chances of being hired over another candidate who does not have it.', order: '5' },
                    { title: 'Welding Certifications (Role-Specific)', detail: 'If you have welding skills, a 6G or 6GR pipe welding certification opens the door to maintenance welder positions that pay $30 to $45/hour on a platform. Cost varies by school. This is the single highest-ROI trade skill for offshore work.', order: '6' },
                  ].map((cert, i) => (
                    <div key={i} className="bg-white rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 font-bold rounded-full text-xs">{cert.order}</span>
                        <h3 className="font-semibold text-gray-900 text-sm">{cert.title}</h3>
                      </div>
                      <p className="text-gray-600 text-sm">{cert.detail}</p>
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Petrol Platform Jobs</h2>
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
            <strong>Disclaimer:</strong> Oh My Job is an independent job search platform and is not affiliated with any petroleum company, offshore contractor, or regulatory body. Job listings are sourced from third-party APIs. Salary figures are estimates based on industry data and may not reflect specific offers. Certification requirements, safety regulations, and hiring standards vary by employer and jurisdiction. Offshore petroleum work involves inherent physical risks; consult employers directly for current safety policies and requirements. This page is for informational purposes only.
          </p>
        </section>
      </div>
    </>
  )
}