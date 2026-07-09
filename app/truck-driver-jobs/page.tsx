import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import {
  Truck, DollarSign, MapPin, Shield, FileText,
  CheckCircle, AlertTriangle, Clock, BarChart2, Wrench
} from 'lucide-react'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Truck Driver Jobs | CDL-A & CDL-B Openings Nationwide',
  description: 'CDL-A, CDL-B, and non-CDL driving positions with local, regional, and OTR schedules. Sign-on bonuses and home-time expectations shown by route and company.',
  keywords: 'truck driver jobs, CDL jobs, CDL-A jobs, truck driving jobs near me, local truck driver jobs, OTR truck driver jobs, no experience truck driver jobs',
  openGraph: {
    title: 'Truck Driver Jobs | CDL & Non-CDL Routes Available',
    description: 'Hundreds of truck driving positions hiring now. CDL-A, CDL-B, local and OTR routes available. Competitive pay and benefits.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Truck Driver Jobs | Local & OTR CDL Positions',
    description: 'Companies urgently need truck drivers nationwide. Browse CDL and non-CDL roles, local and OTR. Top pay, sign-on bonuses, benefits.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/truck-driver-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Truck Driver Jobs',
  description: 'Find truck driver job openings hiring now across the United States. Browse CDL-A, CDL-B, and non-CDL driving roles.',
  url: 'https://www.oh-my-job.com/truck-driver-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Truck Driver Jobs',
    description: 'Current job listings for truck drivers across the U.S.',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How much do truck drivers make in 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'In 2026, truck drivers in the United States earn between $55,000 and $95,000 annually depending on route type, endorsements, and carrier. OTR drivers with a CDL-A and hazmat endorsement frequently exceed $90,000. Local and regional drivers average between $55,000 and $75,000, with some specialized roles in tanker or flatbed paying above that range.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you need a CDL to get a truck driver job?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Not always. CDL-A is required for vehicles over 26,001 lbs with a towed unit over 10,000 lbs, which covers most semi-truck and tractor-trailer roles. CDL-B covers straight trucks and box trucks. However, many delivery, courier, and light freight positions operate vehicles under the CDL threshold and require only a standard driver\'s license.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does it take to get a CDL?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'CDL training programs typically run three to seven weeks for full-time courses. Company-sponsored CDL programs offered by major carriers can compress the timeline further. After completing training, candidates must pass the CDL knowledge test and skills exam administered by their state DMV.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between OTR, regional, and local truck driving jobs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'OTR (over-the-road) drivers cross multiple states and are away from home for extended periods, typically one to three weeks at a time. Regional drivers operate within a defined multi-state area and usually return home weekly. Local drivers stay within a metro area or short radius and return home daily. Pay is generally highest for OTR due to the time away, while local roles offer the best work-life balance.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are sign-on bonuses common for truck driver jobs in 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Sign-on bonuses remain widespread in 2026 as carriers compete for qualified CDL holders. Bonuses of $2,000 to $10,000 are common for experienced OTR and specialized drivers, with some carriers offering higher amounts for hazmat or tanker-endorsed candidates. Bonuses are typically paid out over six to twelve months to incentivize retention.',
      },
    },
  ],
}

/* ─── SECTION DATA ──────────────────────────────────────────── */

const jobTypes = [
  {
    type: 'OTR (Over the Road)',
    license: 'CDL-A required',
    schedule: 'Away 1 to 3 weeks at a time',
    salary: '$70,000 to $95,000/year',
    bestFor: 'Drivers who want maximum earning potential and are comfortable being away from home for extended stretches.',
  },
  {
    type: 'Regional',
    license: 'CDL-A required',
    schedule: 'Home weekly or more often',
    salary: '$62,000 to $82,000/year',
    bestFor: 'Drivers who want strong pay with more predictable home time than OTR.',
  },
  {
    type: 'Local',
    license: 'CDL-A or CDL-B depending on vehicle',
    schedule: 'Home daily',
    salary: '$55,000 to $75,000/year',
    bestFor: 'Drivers who prioritize work-life balance and consistent schedules over maximum mileage pay.',
  },
  {
    type: 'Dedicated',
    license: 'CDL-A typically required',
    schedule: 'Fixed route, often home daily or weekly',
    salary: '$65,000 to $85,000/year',
    bestFor: 'Drivers who want the consistency of a fixed customer, route, and schedule without the variability of general freight.',
  },
  {
    type: 'Tanker',
    license: 'CDL-A with tanker endorsement',
    schedule: 'Varies by carrier and product',
    salary: '$72,000 to $100,000/year',
    bestFor: 'Experienced drivers looking for a specialty premium. Liquid and chemical tanker roles are among the highest-paying in the industry.',
  },
  {
    type: 'Flatbed',
    license: 'CDL-A required',
    schedule: 'OTR or regional',
    salary: '$68,000 to $92,000/year',
    bestFor: 'Drivers comfortable with hands-on loading and securing who want pay above standard dry van rates.',
  },
  {
    type: 'Box Truck / Straight Truck',
    license: 'CDL-B or standard license depending on weight',
    schedule: 'Primarily local and last-mile',
    salary: '$42,000 to $62,000/year',
    bestFor: 'Drivers entering the field without a CDL-A or those transitioning to lighter delivery and distribution work.',
  },
]

const cdlPathways = [
  {
    path: 'Private CDL School',
    timeline: '3 to 7 weeks',
    cost: '$3,000 to $10,000',
    outcome: 'Full CDL-A credential. You own your license and are not obligated to any carrier.',
    tradeoff: 'Upfront cost, though financing and veterans benefits can offset this.',
  },
  {
    path: 'Company-Sponsored Training',
    timeline: '3 to 6 weeks',
    cost: '$0 upfront',
    outcome: 'CDL-A paid for by the carrier in exchange for a driving commitment, typically one year.',
    tradeoff: 'You are committed to that carrier for the contract period. Leaving early may require repaying training costs.',
  },
  {
    path: 'Community College Program',
    timeline: '8 to 16 weeks',
    cost: '$1,500 to $5,000 (often subsidized)',
    outcome: 'CDL-A with classroom instruction and behind-the-wheel hours included.',
    tradeoff: 'Longer timeline than private school but often more affordable and more thorough on theory.',
  },
  {
    path: 'Military to CDL',
    timeline: 'Varies (often fast-tracked)',
    cost: 'Covered by GI Bill or state programs in many cases',
    outcome: 'Veterans with military vehicle experience may qualify for CDL skills test waivers in several states.',
    tradeoff: 'Eligibility depends on MOS and state. Worth verifying with your state DMV before enrolling elsewhere.',
  },
]

const payFactors = [
  {
    factor: 'Endorsements',
    detail: 'Hazmat, tanker, doubles/triples, and passenger endorsements each add earning potential. Hazmat combined with tanker is one of the most valuable combinations in the market, with carriers paying a consistent premium.',
  },
  {
    factor: 'Miles driven',
    detail: 'Most OTR and regional carriers pay by the mile, typically between $0.55 and $0.75 per mile in 2026. High-mileage drivers on efficient lanes can substantially outperform base rate estimates.',
  },
  {
    factor: 'Freight type',
    detail: 'Specialized freight — hazmat, oversized loads, temperature-controlled goods, and high-value cargo — commands higher rates than standard dry van. The tradeoff is additional certification and responsibility.',
  },
  {
    factor: 'Experience level',
    detail: 'Entry-level CDL-A drivers typically start between $55,000 and $65,000. Drivers with three or more years of clean record experience frequently move into the $75,000 to $90,000 range without changing carriers.',
  },
  {
    factor: 'Owner-operator vs. company driver',
    detail: 'Owner-operators gross more per mile but carry fuel, maintenance, insurance, and downtime costs. After expenses, net income can exceed or fall below company driver rates depending on route efficiency and business management.',
  },
]

const redFlags = [
  'A carrier cannot produce a current operating authority number (MC number) when asked',
  'Pay structure is described vaguely and refuses to be put in writing before you sign',
  'The sign-on bonus requires you to stay far longer than the standard 6 to 12 months',
  'Home time guarantees are verbal only and not included in the written contract',
  'The truck assigned to you has visible deferred maintenance or a poor inspection history',
  'Dispatch expects you to falsify logbook entries or exceed HOS (hours of service) limits',
  'The carrier has a pattern of safety violations in the FMCSA safety measurement system',
  'Fuel surcharges, lease deductions, or equipment fees are not disclosed upfront',
]

const marketSignals2026 = [
  {
    signal: 'Freight volumes recovering after 2024 correction',
    detail: 'After two years of freight rate compression and carrier exits, 2025 saw a gradual rebalancing. By early 2026, spot market rates have firmed and contract capacity is tightening in key lanes, particularly in the Southeast and Midwest. Carriers that survived the downturn are actively rebuilding driver capacity.',
    icon: BarChart2,
  },
  {
    signal: 'Driver shortage remains structural',
    detail: 'The American Trucking Associations has consistently projected a structural driver deficit driven by an aging workforce and high annual turnover rates at large carriers, which historically exceed 90%. Demand for qualified CDL holders is not a cyclical blip but a persistent feature of the industry.',
    icon: Truck,
  },
  {
    signal: 'Autonomous trucking is not replacing drivers anytime soon',
    detail: 'Despite well-funded pilots, autonomous long-haul freight remains limited to controlled corridors and requires safety operators. The practical impact on driver employment in 2026 is minimal. Human drivers remain the backbone of commercial freight across the overwhelming majority of U.S. lanes.',
    icon: Shield,
  },
  {
    signal: 'ELD compliance raising the bar on compliant carriers',
    detail: 'Electronic logging device mandates have raised operating standards across the industry. Reputable carriers with strong safety scores are attracting drivers who previously worked with less compliant operations, creating a bifurcation in the market between quality employers and those struggling with safety ratings.',
    icon: FileText,
  },
]

const faqs = [
  {
    question: 'How much do truck drivers make in 2026?',
    answer: 'Truck driver compensation in 2026 ranges widely by route type and specialization. Local drivers in metro areas typically earn between $55,000 and $75,000 annually. Regional drivers with CDL-A credentials fall in the $62,000 to $82,000 range. OTR and specialized drivers — particularly those with hazmat, tanker, or oversized load endorsements — regularly earn between $80,000 and $100,000. Owner-operators gross more per mile but carry significantly higher operating costs.',
  },
  {
    question: 'Do you need a CDL to get a truck driver job?',
    answer: 'Not for every driving role. CDL-A is required for tractor-trailers and most long-haul freight operations. CDL-B covers straight trucks and some delivery vehicles. However, a substantial number of delivery, courier, and light freight positions operate vehicles under the CDL threshold and require only a standard commercial or Class D license. These roles are a viable entry point for drivers who want to build experience before pursuing a CDL.',
  },
  {
    question: 'How long does it take to get a CDL?',
    answer: 'Private CDL training programs run three to seven weeks for full-time students. Company-sponsored programs offered by major carriers can compress the timeline and cover costs in exchange for a driving commitment. Community college programs take longer — eight to sixteen weeks — but are often more affordable. After training, candidates must pass both a knowledge test and a skills examination administered by their state DMV.',
  },
  {
    question: 'What is the difference between OTR, regional, and local truck driving jobs?',
    answer: 'OTR drivers operate across multiple states and spend one to three weeks away from home per trip, earning the highest mileage rates as a result. Regional drivers cover a defined multi-state territory and typically return home weekly. Local drivers operate within a metro area or short radius and are home daily. The right choice depends on whether you prioritize earnings, schedule predictability, or home time.',
  },
  {
    question: 'Are sign-on bonuses common for truck driver jobs in 2026?',
    answer: 'Yes, and they remain a standard recruiting tool at most mid-size and large carriers. Experienced CDL-A drivers can expect offers of $2,000 to $10,000, with higher amounts for specialized endorsements. Bonuses are structured to pay out over six to twelve months, which functions as a retention mechanism. Always confirm bonus terms in writing before signing, including what happens if you leave before the payout period ends.',
  },
  {
    question: 'What does a typical day look like for a local truck driver?',
    answer: 'Local drivers typically report to a terminal or distribution center in the early morning, receive their route and manifest, complete a pre-trip inspection, and begin deliveries. Depending on the cargo and number of stops, a local shift runs eight to ten hours. Post-trip inspection and paperwork close out the day. Most local routes follow a predictable structure, which makes scheduling and personal commitments considerably easier to manage than OTR.',
  },
]

export default async function TruckDriverJobsPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'truck driver', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'truck driver', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Truck Driver Jobs Hiring Now Across the United States
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="truck driver" />
          </aside>
          <div className="flex-1">
            
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'truck driver'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData}
              />
            </Suspense>
          </div>
        </div>

        {/* ── JOB TYPES ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Truck className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Every Type of Truck Driver Job, Explained</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Truck driving is not a single job category. The route type, vehicle class, and freight specialty you choose will determine your schedule, your earnings, and your daily experience behind the wheel. Here is what each option actually looks like.
          </p>
          <div className="space-y-4">
            {jobTypes.map((job, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                  <h3 className="font-bold text-gray-900 text-lg">{job.type}</h3>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1">
                    <DollarSign className="w-4 h-4" /> {job.salary}
                  </span>
                </div>
                <div className="grid md:grid-cols-3 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-gray-500 font-medium">License</p>
                    <p className="text-gray-700">{job.license}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Schedule</p>
                    <p className="text-gray-700">{job.schedule}</p>
                  </div>
                </div>
                <p className="text-sm text-blue-700 bg-blue-50 rounded-lg px-3 py-2">{job.bestFor}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── PAY FACTORS ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">What Actually Determines Your Pay as a Truck Driver</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Advertised pay rates are starting points, not ceilings. The gap between a $58,000 and a $92,000 trucking career often comes down to a handful of specific decisions made early on. These are the variables that move the number.
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            {payFactors.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-green-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 font-bold rounded-full text-sm mb-4">{index + 1}</span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.factor}</h3>
                <p className="text-gray-600 text-sm">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CDL PATHWAYS ── */}
        <section className="mt-20 bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <FileText className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div className="w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Four Ways to Get Your CDL in 2026</h2>
              <p className="text-gray-700 mb-6">
                The path you choose to obtain your CDL affects your starting pay, which carrier you can work for immediately, and what obligations you carry into your first job. Each option involves real trade-offs worth understanding before you enroll anywhere.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {cdlPathways.map((item, index) => (
                  <div key={index} className="bg-white rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-3">{item.path}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Timeline</span>
                        <span className="font-medium text-gray-800">{item.timeline}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Cost</span>
                        <span className="font-medium text-gray-800">{item.cost}</span>
                      </div>
                      <p className="text-gray-600 pt-2 border-t border-gray-100">{item.outcome}</p>
                      <p className="text-amber-700 text-xs">{item.tradeoff}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── MARKET SIGNALS 2026 ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <BarChart2 className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">The Trucking Job Market in 2026: What the Data Is Showing</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            The trucking industry has moved through a significant correction since 2022. Understanding where the market stands now is useful context for negotiating pay, evaluating carriers, and timing your job search.
          </p>
          <div className="space-y-4">
            {marketSignals2026.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.signal}</h3>
                  <p className="text-gray-600 text-sm">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── WHAT TO CHECK BEFORE SIGNING ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">What to Verify Before Accepting a Trucking Job Offer</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Not all carrier offers are equal. The trucking industry has a well-documented history of compensation structures that look attractive on paper but erode significantly once fuel surcharges, equipment fees, and deductions are applied. These are the questions worth asking before you sign anything.
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { title: 'Confirm the pay structure in writing', detail: 'Whether you are paid per mile, per load, hourly, or on a percentage, get the full structure in writing with all deductions itemized. Verbal pay quotes from recruiters are not binding and frequently differ from what drivers experience on their first paycheck.' },
              { title: 'Look up the carrier\'s FMCSA safety score', detail: 'The FMCSA Safety Measurement System (SMS) is publicly accessible and shows a carrier\'s out-of-service rates, crash history, and safety violations. A carrier with serious red flags in the system is a risk to your CDL and your record.' },
              { title: 'Understand the home time policy exactly', detail: 'Home time guarantees should specify the frequency, the minimum duration, and what the carrier does when freight needs move on your scheduled home time. "We try to get you home weekly" is not a guarantee.' },
              { title: 'Clarify lease-to-own terms if applicable', detail: 'Owner-operator lease agreements from carriers can contain unfavorable terms including inflated equipment costs, forced dispatch, and penalties for early exit. Have any lease agreement reviewed independently before signing.' },
            ].map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── RED FLAGS ── */}
        <section className="mt-20">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Red Flags When Evaluating a Trucking Employer</h2>
                <p className="text-gray-700 mb-4">
                  The majority of carriers operate legitimately and treat drivers fairly. But the industry does have bad actors, and the cost of signing with the wrong carrier can follow you in the form of a tarnished driving record or an unexpected debt. These are the warning signs worth acting on.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {redFlags.map((item, index) => (
                    <div key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── MAINTENANCE AND INSPECTION ── */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Wrench className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Pre-Trip Inspections and Why They Matter More Than Most New Drivers Expect</h2>
              <p className="text-gray-700 mb-4">
                DOT pre-trip and post-trip inspections are federal requirements, not suggestions. An out-of-service violation discovered during a roadside inspection goes on the carrier's safety record and can go on yours. Drivers who treat inspections as a formality tend to accumulate violations that follow them across employers.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                {[
                  { heading: 'What gets checked', points: ['Brakes and brake adjustment', 'Tires, wheels, and lug nuts', 'Lights and reflectors', 'Coupling devices and fifth wheel', 'Steering components', 'Fuel system for leaks'] },
                  { heading: 'What violations cost you', points: ['Out-of-service orders halt your load immediately', 'CSA points accumulate on the carrier and driver PSP', 'Pattern of violations can flag you in hiring screens', 'Serious violations can trigger audit of your carrier'] },
                  { heading: 'What separates good drivers', points: ['Consistent documentation of defects found and corrected', 'Knowing which items trigger automatic OOS status', 'Communicating issues to dispatch before departure', 'Clean inspection history as a negotiating asset'] },
                ].map((col, i) => (
                  <div key={i} className="bg-white rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm">{col.heading}</h3>
                    <ul className="space-y-2">
                      {col.points.map((point, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Truck Driver Jobs</h2>
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
            <strong>Disclaimer:</strong> This page aggregates publicly available job listings from third-party sources. Salary ranges and market data are provided for informational purposes and reflect general industry trends as of 2026. Oh My Job is an independent job search platform and is not affiliated with any carrier, trucking company, or CDL training provider listed or referenced on this page. Always verify compensation, licensing requirements, and carrier safety records directly before accepting any offer.
          </p>
        </section>
      </div>
    </>
  )
}