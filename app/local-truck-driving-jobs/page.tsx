import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Truck, Clock, Home, FileText, DollarSign, MapPin, CheckCircle, AlertTriangle, BookOpen, Users, Shield, Briefcase, Award } from 'lucide-react'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Local Truck Driving Jobs | Home Daily CDL Routes',
  description: 'Find local truck driving jobs hiring now. Home every night, day and night shifts, no overnight stays. CDL A and B routes within 50 to 150 mile radius. Apply today.',
  keywords: 'local truck driving jobs, local CDL jobs, home daily truck driving, local driver jobs, day cab driving jobs, regional truck driving, no overnight truck driving',
  openGraph: {
    title: 'Local Truck Driving Jobs | Home Daily CDL Routes',
    description: 'Browse local CDL truck driving positions across the United States. Home every night, competitive hourly pay, multiple shifts available.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Local Truck Driving Jobs | Home Every Night',
    description: 'Hundreds of local CDL routes hiring now. Day cab, no overnight, home daily. Browse positions and apply.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/local-truck-driving-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Local Truck Driving Jobs',
  description: 'Find local truck driving jobs hiring across the United States with home daily routes and competitive pay.',
  url: 'https://www.oh-my-job.com/local-truck-driving-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Local Truck Driving Jobs',
    description: 'Current local CDL truck driving positions with home daily routes',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the difference between local and OTR truck driving jobs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Local truck driving keeps you within a defined radius (typically 50 to 150 miles from your terminal) and gets you home every night. OTR (over the road) involves multi-day routes across multiple states with sleeper-cab nights away from home. Local jobs trade lower per-mile pay for daily home time and hourly compensation structures.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you need a CDL for local truck driving jobs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, most local truck driving positions require a Class A or Class B Commercial Driver License. Class A covers combination vehicles (tractor-trailers) and Class B covers single straight trucks. Some last-mile delivery roles in box trucks under 26,000 pounds may not require a CDL.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much do local truck drivers actually earn per hour?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Hourly pay for local drivers typically ranges from $22 to $35 per hour depending on the industry, endorsements held, and shift worked. Food and beverage distribution and tanker work pay at the top end. Add stop pay, detention pay, and overtime past 40 hours per week, and annual earnings often fall between $55,000 and $85,000.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is touch freight versus no-touch freight?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No-touch freight means the loading and unloading is done by warehouse staff or lumpers at each location. Touch freight means the driver is responsible for unloading the trailer, often using a hand truck or pallet jack. Touch freight pays more but is physically demanding and accounts for most back injuries in the industry.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can a new CDL holder get a local driving job?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'It depends on the carrier. Many local positions prefer 1 to 2 years of OTR experience first because of the heavier urban driving and tight delivery scheduling involved. Some local employers (waste management, construction materials, beverage distribution) actively hire new CDL graduates and provide training.',
      },
    },
    {
      '@type': 'Question',
      name: 'What endorsements increase pay for local truck drivers?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Hazmat (H), Tanker (N), and Doubles/Triples (T) endorsements typically add $2 to $5 per hour to local driver compensation. The combined Hazmat plus Tanker (X) endorsement opens up fuel hauling routes that are among the highest-paying local positions available.',
      },
    },
  ],
}

const localVsOTR = [
  {
    aspect: 'Home Time',
    local: 'Every night, weekends typically off',
    otr: 'Two to four weeks out, then 2 to 4 days home',
  },
  {
    aspect: 'Pay Structure',
    local: 'Hourly with overtime past 40 hours',
    otr: 'Per mile (typically $0.45 to $0.70 cpm)',
  },
  {
    aspect: 'Typical Annual Income',
    local: '$55,000 to $85,000',
    otr: '$60,000 to $95,000',
  },
  {
    aspect: 'Daily Mileage',
    local: '150 to 300 miles within a radius',
    otr: '500 to 600 miles per shift',
  },
  {
    aspect: 'Physical Demand',
    local: 'Higher (more stops, more touch freight)',
    otr: 'Lower (mostly highway, fewer touches)',
  },
  {
    aspect: 'Lifestyle Compatibility',
    local: 'Suitable for families, hobbies, side work',
    otr: 'Built around extended travel',
  },
  {
    aspect: 'Driving Environment',
    local: 'Urban, suburban, dock backing daily',
    otr: 'Mostly interstates and rural highways',
  },
]

const industriesPaying = [
  {
    industry: 'Food and Beverage Distribution',
    description: 'Routes deliver to grocery chains, restaurants, and convenience stores. Touch freight is common. Day or overnight shifts depending on the receiver. Pay is among the highest local in the country, often $28 to $35 per hour with strong overtime.',
    payRange: '$28 to $35/hr',
    icon: Truck,
  },
  {
    industry: 'Fuel and Tanker Hauling',
    description: 'Requires Hazmat plus Tanker endorsement. Routes deliver gasoline, diesel, propane, or chemicals to retail stations and industrial sites. Physically lighter than freight but demands precision and safety discipline.',
    payRange: '$30 to $40/hr',
    icon: AlertTriangle,
  },
  {
    industry: 'Waste and Recycling',
    description: 'Residential and commercial routes with predictable schedules. Often hires new CDL holders. Early morning starts, typically off by mid-afternoon. Touch work is minimal but compaction equipment requires training.',
    payRange: '$22 to $30/hr',
    icon: Truck,
  },
  {
    industry: 'Construction Materials',
    description: 'Hauling concrete, aggregates, asphalt, or steel to job sites. Seasonal demand peaks spring through fall. Often involves dump trucks (Class B) or end dumps. Day cab work with home time built in.',
    payRange: '$24 to $32/hr',
    icon: Briefcase,
  },
  {
    industry: 'Linen and Uniform Services',
    description: 'Routes deliver clean linens or uniforms to hotels, restaurants, hospitals, and industrial clients. Lower base pay than freight but consistent schedules and route-based bonuses make total compensation competitive.',
    payRange: '$20 to $26/hr',
    icon: Users,
  },
  {
    industry: 'Parcel and LTL Local',
    description: 'Pickup and delivery routes for FedEx Freight, UPS Freight, Old Dominion, and similar carriers. Day cab work with stops at 10 to 30 customers per shift. Strong benefits and pension structures at union carriers.',
    payRange: '$26 to $34/hr',
    icon: MapPin,
  },
]

const dayInTheLife = [
  { time: '4:00 AM', activity: 'Pre-trip inspection (DOT-required 45 minutes)', icon: CheckCircle },
  { time: '4:45 AM', activity: 'Hook up to trailer, review delivery manifest', icon: FileText },
  { time: '5:30 AM', activity: 'First delivery stop, often a grocery distribution center', icon: Truck },
  { time: '7:00 AM to 1:00 PM', activity: 'Five to ten delivery stops within radius', icon: MapPin },
  { time: '1:30 PM', activity: 'Return to terminal, fuel, drop trailer', icon: Home },
  { time: '2:00 PM', activity: 'Post-trip inspection, log completion, end of shift', icon: Clock },
]

const compensationBreakdown = [
  {
    component: 'Base Hourly Rate',
    description: 'The core pay rate for time on duty. Set by the carrier and varies with experience and endorsements.',
    typical: '$22 to $32/hr',
  },
  {
    component: 'Overtime Pay',
    description: 'Time and a half past 40 hours per week. Common for routes that consistently run 45 to 55 hours.',
    typical: '+50% past 40 hrs',
  },
  {
    component: 'Stop Pay',
    description: 'Per-stop bonus paid in addition to hourly. Standard at carriers with high stop counts.',
    typical: '$2 to $8 per stop',
  },
  {
    component: 'Detention Pay',
    description: 'Compensates for time waiting at a customer past a contracted window (often 2 hours).',
    typical: '$15 to $25/hr after wait',
  },
  {
    component: 'Touch Freight Premium',
    description: 'Extra compensation for routes where the driver unloads. Sometimes paid per case or per pallet.',
    typical: '$0.50 to $2 per case',
  },
  {
    component: 'Safety and Performance Bonuses',
    description: 'Quarterly or annual bonuses for accident-free driving, on-time delivery, and fuel economy.',
    typical: '$500 to $3,000/yr',
  },
]

const interviewChecklist = [
  {
    title: 'Verify the True Home Time',
    description: 'Carriers often advertise "home daily" but bury exceptions in the offer letter. Ask directly how many nights per month the schedule could keep you out and what the late-arrival policy looks like when a customer runs over. The answer reveals whether the position genuinely matches the lifestyle you are looking for.',
  },
  {
    title: 'Understand the Touch Freight Reality',
    description: 'No-touch freight on the job posting can still mean lumping in practice when a receiver refuses to unload. Ask what percentage of the route involves the driver physically moving freight and whether lumper fees are reimbursed. The answer often separates carriers that respect drivers from those that download liability.',
  },
  {
    title: 'Check the Equipment Age and Maintenance',
    description: 'A poorly maintained tractor turns every shift into a battle with the truck instead of the route. Ask the average age of the fleet, who handles roadside repairs, and how breakdowns are compensated. Carriers with newer fleets and clear breakdown pay policies typically run cleaner operations across the board.',
  },
  {
    title: 'Get Detention and Stop Pay in Writing',
    description: 'Verbal promises about extra pay rarely materialize when the paychecks start arriving. Ask for the detention and stop pay structure in writing before accepting. If a recruiter is reluctant to put it on paper, that is your answer about how the policy actually gets applied.',
  },
]

const redFlags = [
  'The recruiter cannot give a clear answer about average weekly hours',
  'Pay rate quoted is significantly above market without explanation',
  'No mention of how detention pay works on the job listing',
  'Equipment is described as "well-maintained" without specifics on fleet age',
  'The carrier asks you to start without a clear training and ride-along plan',
  'Health benefits do not begin for 90 days or longer at a company hiring experienced drivers',
  'The route is described vaguely without a specific radius or terminal location',
  'Driver reviews on Glassdoor or Indeed consistently mention unpaid time at the dock',
]

const cdlPathway = [
  {
    step: '1',
    title: 'Get Your CDL Permit',
    description: 'Study the state CDL manual, take the written exam at your DMV. The permit allows behind-the-wheel practice with a licensed driver.',
  },
  {
    step: '2',
    title: 'Complete an FMCSA Approved Training Program',
    description: 'As of February 2022, all new CDL applicants must complete Entry-Level Driver Training (ELDT) through a registered provider. Programs run 3 to 8 weeks and cost $3,000 to $7,000.',
  },
  {
    step: '3',
    title: 'Pass the CDL Skills Test',
    description: 'Three components: vehicle inspection, basic controls (backing maneuvers), and a road test. Pass all three to receive your Class A or Class B license.',
  },
  {
    step: '4',
    title: 'Add Endorsements Strategically',
    description: 'For local work, the most valuable endorsements are Tanker (N), Hazmat (H), and Doubles/Triples (T). The Hazmat endorsement requires a TSA background check.',
  },
  {
    step: '5',
    title: 'Apply to Carriers That Hire New Drivers',
    description: 'Waste management, beverage distribution, and dump truck operations typically hire freshly licensed drivers. Plan to spend 6 to 12 months in this entry tier before moving to higher-paying routes.',
  },
]

const faqs = [
  {
    question: 'What does "local" actually mean in trucking?',
    answer: 'Local generally means routes within a 50 to 150 mile radius of the home terminal, with the driver returning home at the end of each shift. Some carriers stretch the definition to a 250 mile radius, which can mean longer shifts of 11 to 12 hours but still no overnight stays. When a job listing says local, ask for the specific radius and the typical shift length before assuming the schedule matches what you want.',
  },
  {
    question: 'Why does local truck driving pay hourly instead of per mile?',
    answer: 'Local routes involve significant time off the highway: loading, unloading, waiting at docks, urban traffic, and multiple stops. Mileage-based pay would penalize drivers for time they cannot control. The hourly model compensates for the time-intensive nature of local work and aligns the carrier and driver on efficiency rather than racing miles. Most local drivers prefer hourly because it captures detention and dock time that mileage pay would miss.',
  },
  {
    question: 'Is a CDL Class A or Class B better for local routes?',
    answer: 'Class A opens more opportunities because it covers both combination vehicles (tractor-trailers) and single straight trucks, while Class B is limited to straight trucks. Class A holders can work Class B jobs, but not the other way around. If you are entering the industry and want maximum local job options including beverage distribution, food service, and parcel freight, Class A is the better investment.',
  },
  {
    question: 'What does a typical local truck driving shift look like?',
    answer: 'Most local shifts run 10 to 12 hours including the pre-trip inspection, driving, multiple stops, and post-trip paperwork. The Federal Motor Carrier Safety Administration limits driving to 11 hours within a 14-hour on-duty window, with mandatory breaks every 8 hours. Day shifts typically start between 4:00 AM and 7:00 AM. Night shifts (common in grocery and parcel) start between 6:00 PM and 10:00 PM.',
  },
  {
    question: 'Can local truck drivers work part-time?',
    answer: 'Part-time local positions exist but are less common than full-time. They show up most frequently in dump truck work (project-based), seasonal construction hauling, and weekend-only routes at parcel carriers. Most full-time local schedules can be negotiated to four 10-hour days, which gives a three-day weekend without sacrificing income. This arrangement is widely used in food distribution.',
  },
  {
    question: 'How long does it take to get hired for a local route?',
    answer: 'For experienced drivers with a clean MVR, the hiring process at most carriers is 7 to 14 days from application to first day. New CDL holders typically need 30 to 60 days because of additional training requirements and the smaller pool of carriers willing to accept zero-experience candidates. The fastest hiring happens in industries with chronic driver shortages such as waste, fuel, and concrete.',
  },
]

export default async function LocalTruckDrivingJobsPage({ searchParams }: any) {
  const params = await searchParams

  const [{ count }, initialData] = await Promise.all([
    getMergedJobCount(params.what || 'local truck driving', params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
    searchMergedJobs({ what: params.what || 'local truck driving', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Local Truck Driving Jobs Hiring Now Across the United States
          </h1>
          <p className="text-gray-700">
            Browse local CDL truck driving positions with home daily routes, hourly pay structures, and shifts that fit around family life. Filter by location and apply directly.
          </p>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="local truck driving" />
          </aside>
          <div className="flex-1">
            {count > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">{count.toLocaleString()}</span> local truck driving positions available
              </p>
            )}
            <AIJobMatcherWrapper />
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList what={params.what || 'local truck driving'} where={params.where || ''} salary_min={params.salary_min} initialData={initialData} />
            </Suspense>
          </div>
        </div>

        {/* ── LOCAL VS OTR COMPARISON ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Home className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Local vs Over-the-Road: What Actually Changes</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The choice between local and OTR is not about which path is better. It is about which trade-offs match your life. The differences cut across pay structure, daily mileage, physical demand, and lifestyle. Below is what changes day to day when you choose local routes.
          </p>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 gap-px bg-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="bg-white px-5 py-3">Aspect</div>
              <div className="bg-white px-5 py-3">Local</div>
              <div className="bg-white px-5 py-3">OTR</div>
            </div>
            {localVsOTR.map((row, i) => (
              <div key={i} className="grid grid-cols-3 gap-px bg-gray-100">
                <div className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-5 py-3.5 text-sm font-medium text-gray-800`}>{row.aspect}</div>
                <div className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-5 py-3.5 text-sm text-blue-700`}>{row.local}</div>
                <div className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-5 py-3.5 text-sm text-gray-600`}>{row.otr}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── INDUSTRIES PAYING ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Six Industries Driving Local CDL Hiring Right Now</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Local truck driving is not one job. It splits across half a dozen industries, each with its own pay ceiling, physical demands, and daily rhythm. Knowing which sector matches your priorities helps you target the carriers that are hiring for the kind of route you actually want.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industriesPaying.map((sector, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <sector.icon className="w-10 h-10 text-green-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{sector.industry}</h3>
                <p className="text-gray-600 text-sm mb-3">{sector.description}</p>
                <p className="text-sm font-bold text-green-700">{sector.payRange}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── DAY IN THE LIFE ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">A Day on a Local Route, Hour by Hour</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Local truck driving schedules can sound abstract until you see them mapped onto an actual day. Below is what a typical food distribution route looks like, from the pre-trip inspection to the post-trip log entry. Other industries shift the start time but the structure is similar.
          </p>
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="space-y-4">
              {dayInTheLife.map((item, i) => (
                <div key={i} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <item.icon className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.time}</p>
                    <p className="text-sm text-gray-600">{item.activity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMPENSATION BREAKDOWN ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">What Makes Up a Local Driver Paycheck</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Local driver compensation is rarely a single number. The advertised hourly rate is the foundation, but real take-home depends on five or six additional pay components that vary by carrier and route. Reading a local truck driving offer means understanding all of them.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {compensationBreakdown.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-2">{item.component}</h3>
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                <p className="text-sm font-bold text-green-700">{item.typical}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CDL PATHWAY ── */}
        <section className="mt-20 bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Award className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">From Zero to Local CDL Job: The Realistic Path</h2>
              <p className="text-gray-700 mb-6">
                If you are starting without a CDL, the path from "interested in trucking" to "first paycheck on a local route" usually takes 3 to 6 months. The investment is real but the return is fast compared to most career changes. Here are the five steps that get you there.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {cdlPathway.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-5">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-amber-100 text-amber-700 font-bold rounded-full text-sm mb-3">{item.step}</span>
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── INTERVIEW CHECKLIST ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">What to Ask Before Accepting a Local Route</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The local trucking market has carriers that respect their drivers and carriers that do not. The interview is where you find out which one you are dealing with. Four questions reveal more about a position than any job posting can.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {interviewChecklist.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 font-bold rounded-full text-sm mb-4">{index + 1}</span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Red Flags in Local Trucking Job Listings</h2>
                <p className="text-gray-700 mb-4">
                  Not every local CDL job is what it claims to be. Some listings hide working conditions that make the role unsustainable within months. The patterns below show up consistently in carriers with high driver turnover. If three or more apply to a position you are considering, treat it as a serious warning.
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

        {/* ── DOT PHYSICAL ── */}
        <section className="mt-20">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">The DOT Physical and Medical Card Requirement</h2>
                <p className="text-gray-700 mb-4">
                  Every commercial driver in the United States must hold a valid DOT medical certificate. The exam is straightforward for most candidates but knowing what is checked, what disqualifies, and how often the renewal happens helps you avoid surprises that could pause your hiring process.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  {[
                    { title: 'What the exam covers', detail: 'Vision (20/40 corrected), hearing (forced whisper at 5 feet), blood pressure (under 140/90 without medication), urinalysis, and a general physical. Sleep apnea screening is added for higher BMI candidates.' },
                    { title: 'Common conditions that complicate certification', detail: 'Insulin-dependent diabetes, severe sleep apnea, recent heart events, and uncontrolled hypertension can require additional documentation or limit certification to shorter renewal periods (3 to 12 months instead of 24).' },
                    { title: 'How often you renew', detail: 'Most drivers receive a 24-month card. Medical exceptions or borderline conditions may result in 12-month, 6-month, or even 3-month renewals depending on the certifying medical examiner.' },
                    { title: 'Where to get it done', detail: 'Only examiners listed on the FMCSA National Registry can issue valid certificates. Many urgent care clinics, occupational health offices, and DOT-specific clinics offer same-day exams for $80 to $150.' },
                  ].map((item, index) => (
                    <div key={index} className="bg-white rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm">{item.title}</h3>
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
            <Shield className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Local Truck Driving Jobs</h2>
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
            <strong>Disclaimer:</strong> This page provides general information about local truck driving careers in the United States. CDL requirements, hours-of-service regulations, and medical certification standards are set by the Federal Motor Carrier Safety Administration and may change. Salary figures are illustrative and reflect typical ranges reported by industry sources; actual compensation depends on the carrier, location, endorsements, and experience level. Before accepting any position, confirm the specific terms with the prospective employer and review the latest FMCSA guidance through your state Department of Motor Vehicles.
          </p>
        </section>
      </div>
    </>
  )
}