import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, AlertTriangle, BookOpen, Users, TrendingUp, Award, Heart, Truck } from 'lucide-react'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'School Bus Driver Jobs | Paid CDL Training & Benefits',
  description: 'National driver shortage, paid CDL training, and sign-on bonuses up to $5,000. School bus openings listed by district across every state.',
  keywords: 'school bus driver jobs, school bus driver hiring, CDL bus driver jobs, school bus driver salary, school bus driver near me, school district bus driver openings',
  openGraph: {
    title: 'School Bus Driver Jobs | Openings in Every State',
    description: 'Districts urgently hiring school bus drivers. Paid training, benefits, summers off. Apply now.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'School Bus Driver Jobs | CDL Training & Paid Benefits',
    description: 'National driver shortage means fast hiring timelines, paid CDL training, and competitive hourly rates. Start today.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/school-bus-driver-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'School Bus Driver Jobs',
  description: 'Find school bus driver jobs hiring across the United States. Browse positions with paid CDL training, benefits, and flexible schedules.',
  url: 'https://www.oh-my-job.com/school-bus-driver-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available School Bus Driver Positions',
    description: 'Current job listings for school bus drivers across the United States',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What license do you need to drive a school bus?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You need a Commercial Driver\'s License (CDL) with a Class B designation and both a Passenger (P) endorsement and a School Bus (S) endorsement. Many districts and contractors offer paid CDL training programs that cover the full cost of obtaining this license.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much do school bus drivers earn?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The national median hourly wage is approximately $22.45. Annual earnings vary widely based on hours worked, district, and state, ranging from roughly $25,000 for part-time split-shift roles to over $55,000 for full-time drivers with overtime and activity routes.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is there really a school bus driver shortage?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. As of 2025, employment in the field remains approximately 9.5% below 2019 levels despite modest recent gains. Over 91% of school districts report experiencing a driver shortage, making this one of the most in-demand roles in the education sector.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do school bus drivers get benefits?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Benefits vary by employer. Public school district drivers typically receive health insurance, retirement pension contributions, and paid time off. Drivers employed by private contractors may receive more limited benefits depending on hours worked and contract terms.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do school bus drivers get summers off?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most school bus drivers follow the academic calendar, meaning they do not work during summer break, winter break, or spring break. Some districts offer optional summer routes for camps or summer school programs for drivers who want year-round income.',
      },
    },
  ],
}

/* ─── SECTION DATA ──────────────────────────────────────────── */

const dailySchedule = [
  { time: '5:30 AM to 6:00 AM', activity: 'Arrive at the bus yard, complete a pre-trip vehicle inspection covering lights, brakes, mirrors, tires, and emergency equipment', icon: Truck },
  { time: '6:15 AM to 8:00 AM', activity: 'Morning route pickup. Multiple stops across your assigned zone, delivering students to one or more schools', icon: MapPin },
  { time: '8:15 AM to 1:30 PM', activity: 'Mid-day break. Most drivers are off during these hours. Some take a second job, handle personal errands, or pick up a mid-day shuttle route for preschool or special education programs', icon: Clock },
  { time: '2:00 PM to 4:00 PM', activity: 'Afternoon route. Reverse of the morning with adjusted stops based on after-school programs and early releases', icon: MapPin },
  { time: '4:00 PM to 4:30 PM', activity: 'Post-trip inspection and paperwork. Log mileage, note any student behavior incidents, and report mechanical issues', icon: FileText },
]

const employerTypes = [
  {
    type: 'Public School District (Direct Hire)',
    payRange: '$18 to $28/hr depending on state',
    benefits: 'Health insurance, pension, paid holidays, sick leave, union representation in most states',
    hiringSpeed: 'Moderate (background check, drug screening, CDL process)',
    bestFor: 'Drivers seeking long-term stability, strong benefits, and retirement security. Districts employ roughly 80% of all school bus drivers nationally.',
    consideration: 'Pay scales are often fixed by union contract, leaving less room for individual negotiation. Seniority determines route selection in many districts.',
  },
  {
    type: 'Private Contractor (First Student, National Express, etc.)',
    payRange: '$16 to $25/hr depending on region',
    benefits: 'Varies widely. Large contractors offer health plans for full-time drivers. Part-time drivers may receive limited or no benefits.',
    hiringSpeed: 'Often faster than districts. Contractors facing acute shortages may expedite the onboarding timeline.',
    bestFor: 'Drivers who want quicker entry into the field, especially in areas where the local district contracts out transportation entirely.',
    consideration: 'Contract renewal cycles can affect job continuity. When a district switches contractors, drivers may need to reapply under the new company.',
  },
  {
    type: 'Charter and Activity Routes',
    payRange: '$20 to $35/hr for activity and field trip assignments',
    benefits: 'Usually supplemental to a base position. Overtime rates often apply.',
    hiringSpeed: 'Available to current drivers on a sign-up or seniority basis',
    bestFor: 'Experienced drivers looking to increase income beyond the standard split-shift schedule. Athletic events, field trips, and summer camp routes offer additional paid hours.',
    consideration: 'Schedules are irregular and often confirmed with short notice. Evening and weekend availability is typically required.',
  },
]

const cdlProcess = [
  { step: 'Meet the basic eligibility requirements', detail: 'You must be at least 18 years old (21 in some states), hold a valid standard driver\'s license, and have a clean driving record. Most employers require no more than 2 moving violations in the past 3 to 5 years and no DUI or reckless driving convictions.' },
  { step: 'Pass the DOT physical examination', detail: 'A Department of Transportation medical exam confirms you meet the vision, hearing, and general health standards required to operate a commercial vehicle. The exam is conducted by a certified medical examiner and must be renewed every 2 years.' },
  { step: 'Obtain your CDL learner\'s permit', detail: 'Study for and pass the written knowledge tests at your state DMV covering general CDL knowledge, passenger transport, school bus operations, and air brakes (if applicable). A study guide is usually provided by the employer or available through your state DOT.' },
  { step: 'Complete behind-the-wheel training', detail: 'Most districts and contractors provide 40 to 80 hours of hands-on driving instruction at no cost to you. Training covers vehicle control, defensive driving, student loading and unloading procedures, railroad crossing protocol, and emergency evacuation drills.' },
  { step: 'Pass the CDL skills test', detail: 'A three-part exam consisting of a pre-trip vehicle inspection, a basic control skills test (backing, parking, turning), and an on-road driving test conducted with a state examiner. Your employer typically arranges the test date and provides the vehicle.' },
  { step: 'Clear background checks and drug screening', detail: 'Federal law requires a fingerprint-based criminal background check, a pre-employment drug test, and enrollment in a random drug and alcohol testing program for the duration of your employment. A disqualifying offense will prevent certification.' },
]

const salaryByRegion = [
  { region: 'Northeast (NY, NJ, CT, MA)', range: '$22 to $32/hr', annual: '$38,000 to $55,000+', note: 'Highest nominal pay nationally. Strong union contracts in the Northeast lock in annual step increases, health coverage, and pension contributions. New York City area drivers can exceed $30/hr with overtime.' },
  { region: 'West Coast (CA, WA, OR)', range: '$20 to $28/hr', annual: '$35,000 to $50,000', note: 'California mandates specific training hours and pays accordingly. Washington and Oregon have seen aggressive wage increases driven by shortage-related competition between districts.' },
  { region: 'Midwest (IL, OH, MI, MN, WI)', range: '$17 to $24/hr', annual: '$28,000 to $42,000', note: 'Lower cost of living increases purchasing power. Many rural Midwest districts offer sign-on bonuses of $2,000 to $5,000 to attract candidates willing to drive longer routes.' },
  { region: 'South (TX, FL, GA, NC, VA)', range: '$15 to $22/hr', annual: '$25,000 to $38,000', note: 'Fastest-growing school populations in the country, fueling persistent demand. Some Southern districts supplement low hourly rates with free CDL training, fuel cards, or take-home bus privileges.' },
  { region: 'Mountain West (CO, AZ, UT, NV)', range: '$18 to $25/hr', annual: '$30,000 to $44,000', note: 'Rapid suburban growth is creating new routes and new positions. Districts in metro Denver, Phoenix, and Las Vegas are expanding fleets and actively recruiting.' },
]

const hiddenPerks = [
  {
    perk: 'Paid CDL Training',
    detail: 'The CDL with passenger and school bus endorsements is a commercially valuable credential that typically costs $3,000 to $7,000 to obtain independently. Most employers cover this cost entirely, which means you gain a transferable professional license at no expense.',
  },
  {
    perk: 'School Calendar Schedule',
    detail: 'Drivers follow the academic calendar: summers off, winter break, spring break, and all holidays. For parents with school-age children, this alignment eliminates childcare logistics. For retirees or anyone seeking seasonal flexibility, it provides months of unstructured time annually.',
  },
  {
    perk: 'Split-Shift Mid-Day Freedom',
    detail: 'The standard schedule creates a 5 to 6 hour block in the middle of the day when you are not working. Many drivers use this time for a second part-time job, freelance work, appointments, or personal projects. Few other jobs offer this structure.',
  },
  {
    perk: 'Pension Eligibility (Public Districts)',
    detail: 'Drivers employed directly by public school districts are typically enrolled in the state retirement system. After 10 to 20 years of service, this translates into a guaranteed monthly pension, a benefit that has largely disappeared from most private-sector jobs.',
  },
  {
    perk: 'Activity Route Income',
    detail: 'Field trips, athletic events, and summer camp routes are paid separately from your base route and often at a higher rate or with overtime. Drivers who consistently pick up activity routes can add $3,000 to $8,000 in annual earnings.',
  },
  {
    perk: 'Community Standing',
    detail: 'This is not a financial benefit, but it is real. School bus drivers build relationships with families over years. In many communities, drivers are recognized as trusted figures in the daily lives of children. That social value shows up in retention: many drivers stay in the role for over a decade.',
  },
]

const dealBreakers = [
  'The district or contractor does not provide paid CDL training and expects you to pay out of pocket before starting',
  'The posted hourly rate is significantly below $18/hr unless the position includes substantial non-wage benefits (housing, fuel, or a take-home vehicle)',
  'No health insurance is offered for a position listed as full-time',
  'You are told the route will take 2 hours but actual drive time consistently exceeds 3, and you are only paid for scheduled hours',
  'The fleet shows visible signs of poor maintenance: bald tires, broken mirrors, warning lights on the dashboard, or seats in disrepair',
  'The employer discourages you from reporting mechanical problems or filing incident reports after student behavior issues',
  'Background check and drug testing procedures are described as "flexible" or "handled later"',
  'There is no structured training program for new drivers beyond a brief ride-along',
]

const whoThrivesHere = [
  {
    profile: 'Retirees Seeking Structure Without Full-Time Pressure',
    why: 'The split-shift format offers a daily routine without the grind of an 8 hour day. The work is physically manageable, the schedule aligns with grandchildren\'s availability, and the pension contribution (in public districts) adds to retirement security.',
  },
  {
    profile: 'Parents of School-Age Children',
    why: 'Your hours mirror your children\'s school day almost exactly. You drop off your students, handle your personal day, and pick them up in the afternoon. Summers, holidays, and snow days are off. No other job matches the school calendar this closely.',
  },
  {
    profile: 'Career Changers Looking for a CDL Entry Point',
    why: 'The free CDL training opens a door to the broader commercial driving industry. After 1 to 2 years as a school bus driver, you hold a credential that qualifies you for transit, charter, motor coach, and delivery positions if you decide to move on.',
  },
  {
    profile: 'People Who Want Predictable Hours and Community Connection',
    why: 'Routes are consistent. The kids on your bus become familiar faces. Parents wave from driveways. The job is repetitive in a way that some people find grounding rather than monotonous. If you prefer people-facing work with geographic familiarity, this is a fit.',
  },
]

const faqs = [
  {
    question: 'What license do you need to drive a school bus?',
    answer: 'A Commercial Driver\'s License (CDL) Class B with a Passenger (P) endorsement and a School Bus (S) endorsement. If the bus has air brakes, an air brake endorsement is also required. Most employers provide the training and cover the testing costs, so you do not need to have the CDL before applying.',
  },
  {
    question: 'How long does it take to become a school bus driver from start to finish?',
    answer: 'The typical timeline from application to first solo route is 6 to 12 weeks. This includes the background check (2 to 4 weeks), CDL classroom and behind-the-wheel training (3 to 6 weeks), the skills test, and a brief orientation period. Districts with acute shortages sometimes compress this to 4 to 5 weeks.',
  },
  {
    question: 'How much do school bus drivers actually earn?',
    answer: 'The national median is approximately $22 per hour. Annual earnings depend heavily on whether you work a standard split-shift (roughly 5 to 6 paid hours per day) or add activity routes, mid-day shuttles, and overtime. A part-time split-shift schedule during the school year might produce $25,000 to $35,000 annually. Drivers who maximize their hours through extras can reach $45,000 to $55,000.',
  },
  {
    question: 'Do school bus drivers get health insurance and retirement?',
    answer: 'Drivers employed directly by public school districts typically receive health insurance, dental and vision coverage, sick leave, and enrollment in the state pension system. Private contractor benefits vary. Large national contractors generally offer health plans for full-time drivers, but part-time or hourly drivers may receive limited coverage.',
  },
  {
    question: 'Is the school bus driver shortage real?',
    answer: 'Yes. As of late 2025, the number of employed school bus drivers remains roughly 9.5% below where it was in 2019 according to the Economic Policy Institute. Over 90% of school districts surveyed report ongoing driver shortages. This translates directly into faster hiring timelines, sign-on bonuses, and paid training programs for candidates entering the field.',
  },
  {
    question: 'Can I drive a school bus as a second job?',
    answer: 'The split-shift structure makes this common. Many school bus drivers hold mid-day jobs in retail, food service, delivery, or freelance work during the 5 to 6 hour gap between morning and afternoon routes. Some districts explicitly accommodate this by keeping mid-day hours flexible. Just confirm with the employer that a second job does not conflict with DOT rest requirements or their scheduling policies.',
  },
]

export default async function SchoolBusDriverJobsPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'school bus driver', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'school bus driver', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {count > 0 ? count.toLocaleString('en-US') : 'Thousands of'} School Bus Driver Jobs Available Across the United States
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="school bus driver" />
          </aside>
          <div className="flex-1">
            
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList what={params.what || 'school bus driver'} where={params.where || ''} salary_min={params.salary_min} initialData={initialData} />
            </Suspense>
          </div>
        </div>

        {/* ── WHAT THE DAY ACTUALLY LOOKS LIKE ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">What a School Bus Driver's Day Actually Looks Like</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Most job listings describe the role in abstract terms. Here is the concrete sequence of a typical weekday for a school bus driver working a standard morning and afternoon split shift. The mid-day gap is the structural feature that makes this job compatible with other commitments.
          </p>
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="space-y-4">
              {dailySchedule.map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <item.icon className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.time}</p>
                    <p className="text-sm text-gray-600">{item.activity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Times vary by district and route length. Rural routes tend to start earlier and run longer. Urban routes are shorter but involve more stops and traffic navigation.
          </p>
        </section>

        {/* ── EMPLOYER TYPES ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Three Types of Employers and What Each One Offers</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Not all school bus driver jobs are the same. Who signs your paycheck determines your pay scale, benefits, job security, and how much control you have over your route. Understanding these three employer categories helps you target the right type of position.
          </p>
          <div className="space-y-4">
            {employerTypes.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <h3 className="font-bold text-gray-900 text-lg mb-3">{item.type}</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Pay Range</p>
                    <p className="font-medium text-green-700">{item.payRange}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Benefits</p>
                    <p className="font-medium text-gray-800">{item.benefits}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Hiring Speed</p>
                    <p className="font-medium text-gray-800">{item.hiringSpeed}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3">{item.bestFor}</p>
                <p className="text-sm text-amber-700 mt-2">{item.consideration}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CDL PROCESS ── */}
        <section className="mt-20 bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <FileText className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Get Your CDL: The Complete Process From Zero to Licensed</h2>
              <p className="text-gray-700 mb-6">
                You do not need a CDL to apply for most school bus driver positions. Employers hire you first, then train you. Here is the full sequence from application to your first solo route, broken into the steps you will actually experience.
              </p>
              <div className="space-y-4">
                {cdlProcess.map((item, i) => (
                  <div key={i} className="bg-white rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-amber-100 text-amber-700 font-bold rounded-full text-xs flex-shrink-0 mt-0.5">{i + 1}</span>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{item.step}</p>
                        <p className="text-gray-600 text-sm mt-1">{item.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── SALARY BY REGION ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">School Bus Driver Pay by Region: Hourly Rates and Annual Estimates</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Hourly rates for school bus drivers vary by as much as $15 per hour across states. Cost of living explains part of the difference, but not all of it. Shortage intensity, union coverage, and whether you work for a district or a private contractor also play significant roles.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {salaryByRegion.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-1">{item.region}</h3>
                <p className="text-green-700 font-bold text-lg">{item.range}</p>
                <p className="text-sm text-gray-500 mb-3">Annual estimate: {item.annual}</p>
                <p className="text-gray-600 text-sm">{item.note}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Annual estimates assume a standard split-shift schedule during the academic year (approximately 180 days). Drivers who add activity routes, mid-day shuttles, or summer programs earn more. Data compiled from BLS, ZipRecruiter, Salary.com, and Economic Policy Institute analysis (2025).
          </p>
        </section>

        {/* ── HIDDEN PERKS ── */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Award className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Six Benefits Most Job Listings Do Not Mention</h2>
              <p className="text-gray-700 mb-6">
                The headline compensation for school bus drivers often looks modest when reduced to an hourly rate. What that number misses is a set of structural advantages that make the total value of the position significantly higher than it appears on paper.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {hiddenPerks.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm">{item.perk}</h3>
                    <p className="text-gray-600 text-sm">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── WHO THRIVES HERE ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Who Actually Thrives as a School Bus Driver</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            This is not the right job for everyone. The split shift, the early mornings, and the daily responsibility of transporting children suit specific lifestyles and temperaments better than others. The profiles below represent the people who tend to stay in the role for years rather than months.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {whoThrivesHere.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 font-bold rounded-full text-sm mb-4">{index + 1}</span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.profile}</h3>
                <p className="text-gray-600 text-sm">{item.why}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── DEAL BREAKERS ── */}
        <section className="mt-20">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Red Flags When Evaluating a School Bus Driver Position</h2>
                <p className="text-gray-700 mb-4">
                  The driver shortage means more positions are available, but not all of them are worth taking. The following warning signs indicate an employer that may not invest in driver safety, fair compensation, or proper training.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {dealBreakers.map((item, index) => (
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

        {/* ── FAQ ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About School Bus Driver Jobs</h2>
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
            <strong>Disclaimer:</strong> Oh My Job is an independent job search platform and is not affiliated with, endorsed by, or connected to any school district, transportation contractor, or employer listed on this page. Job listings are sourced from third-party APIs and partner networks. Salary figures are estimates based on publicly available data from the Bureau of Labor Statistics, the Economic Policy Institute, ZipRecruiter, and Salary.com and may not reflect specific offers. CDL requirements, training programs, and background check procedures vary by state and employer. Verify all details directly with the hiring organization before making employment decisions. This page is for informational purposes only and does not constitute career, legal, or financial advice.
          </p>
        </section>
      </div>
    </>
  )
}