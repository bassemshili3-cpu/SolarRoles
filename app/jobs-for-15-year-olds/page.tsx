import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, AlertTriangle, BookOpen, Users, TrendingUp } from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Jobs for 15 Year Olds Hiring Now | Teen Positions Near You',
  description: 'Find jobs for 15 year olds open right now across the US. Retail, food service, and flexible gigs with hours that fit around school. Browse by location and apply today.',
  keywords: 'jobs for 15 year olds, jobs hiring at 15, teen jobs, part time jobs for 15 year olds, summer jobs for 15 year olds, jobs for teens',
  openGraph: {
    title: 'Jobs for 15 Year Olds | Hiring Now Across the US',
    description: 'Browse teen-friendly positions hiring near you. Retail, food service, and community jobs with flexible scheduling.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jobs for 15 Year Olds | Start Earning Today',
    description: 'Hundreds of positions for 15 year olds. No experience required. Flexible hours that work around school.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/jobs-for-15-year-olds',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Jobs for 15 Year Olds',
  description: 'Find legal jobs for 15 year olds hiring near you. Browse teen-friendly positions with flexible hours and competitive pay.',
  url: 'https://www.oh-my-job.com/jobs-for-15-year-olds',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Jobs for 15 Year Olds',
    description: 'Current job listings suitable for 15 year old workers',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can a 15 year old legally work in the United States?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Federal law permits 15 year olds to hold jobs outside of school hours in approved categories including retail, food service, and office work. Individual states may layer on additional restrictions depending on your location.',
      },
    },
    {
      '@type': 'Question',
      name: 'How many hours can a 15 year old work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'During school weeks, the federal cap is 18 hours total with a maximum of 3 hours on any school day. When school is out, the limits rise to 8 hours per day and 40 hours per week. Some states allow up to 23 hours during school weeks.',
      },
    },
    {
      '@type': 'Question',
      name: 'What jobs can a 15 year old do?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Permitted roles include retail sales, restaurant work that stays away from heat-based cooking equipment, grocery store positions, movie theater jobs, office tasks, library work, and camp counseling. Any occupation where physical safety is at risk is off limits.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do 15 year olds need a work permit?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'In the majority of states, yes. The permit is a short form handled through your school that requires a parent signature and employer signature before you can start. A handful of states skip this step, but most treat it as mandatory for anyone under 16.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the minimum wage for a 15 year old?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The federal floor sits at $7.25 per hour, but what you actually earn depends on your state since most have raised their own minimum well above that number. A separate rule allows $4.25 for the first 90 days, though few employers bother with it in practice.',
      },
    },
  ],
}

/* ─── SECTION DATA ──────────────────────────────────────────── */

const schoolWeekTimeline = [
  { time: '7:00 AM – 3:00 PM', activity: 'School', icon: BookOpen },
  { time: '3:30 PM – 6:30 PM', activity: 'After-school shift (3-hour daily cap on school days)', icon: Briefcase },
  { time: '7:00 PM', activity: 'Federal evening cutoff during the school year', icon: Clock },
  { time: 'Saturday', activity: 'Full shift available (up to 8 hours on non-school days)', icon: Briefcase },
]

const summerTimeline = [
  { time: '9:00 AM – 1:00 PM', activity: 'Morning shift', icon: Briefcase },
  { time: '1:00 PM – 2:00 PM', activity: 'Break', icon: Users },
  { time: '2:00 PM – 5:00 PM', activity: 'Afternoon shift (up to 8 hours total per day)', icon: Briefcase },
  { time: '9:00 PM', activity: 'Extended evening cutoff (June 1 through Labor Day)', icon: Clock },
]

const jobPathways = [
  {
    category: 'Retail and Customer-Facing',
    roles: 'Clothing store associate, department store cashier, sporting goods floor staff, bookstore clerk',
    whatYouLearn: 'How to interact with customers under pressure, operate a point-of-sale system, manage inventory on a basic level, and work within a team schedule.',
    typicalPay: '$10–$15/hr depending on state minimum',
  },
  {
    category: 'Food Service (Front-of-House and Prep)',
    roles: 'Taking orders at a register, clearing and resetting tables, assembling cold menu items, scooping ice cream, running a smoothie bar, working stadium or event concessions',
    whatYouLearn: 'How to keep pace during a rush, basic hygiene protocols for handling food, counting back change accurately, and functioning in a workspace where standing still means falling behind.',
    typicalPay: '$10–$14/hr plus potential tips at some establishments',
  },
  {
    category: 'Grocery and Supermarket',
    roles: 'Bagging, cart collection, shelf stocking, produce section upkeep, customer carry-out',
    whatYouLearn: 'Physical endurance, attention to detail in product placement, and how to work a shift that involves both customer interaction and independent tasks.',
    typicalPay: 'State minimum to $14/hr, with some chains offering annual raises',
  },
  {
    category: 'Recreation and Entertainment',
    roles: 'Movie theater attendant, bowling alley counter staff, amusement park ride operator (age permitting), mini-golf or batting cage attendant',
    whatYouLearn: 'Customer service in a high-energy environment, managing crowds, and maintaining composure during peak-traffic hours.',
    typicalPay: '$10–$13/hr, often with perks like free admission or discounted concessions',
  },
  {
    category: 'Community and Self-Directed',
    roles: 'Babysitting, pet sitting, dog walking, lawn care, tutoring younger students, car detailing, house cleaning',
    whatYouLearn: 'Client management, pricing your own services, building a referral network, and delivering consistent quality without a supervisor present.',
    typicalPay: '$12–$25/hr depending on the service, location, and client relationship',
  },
]

const earningScenarios = [
  {
    label: 'School Year — Weekend Retail Shift Only',
    hours: '~8 hours/week',
    rate: '$12/hr',
    weekly: '~$96',
    monthly: '~$384',
  },
  {
    label: 'School Year — After-School + Saturday Mix',
    hours: '~16 hours/week',
    rate: '$13/hr',
    weekly: '~$208',
    monthly: '~$832',
  },
  {
    label: 'Summer — Steady Part-Time Schedule',
    hours: '~28 hours/week',
    rate: '$13/hr',
    weekly: '~$364',
    monthly: '~$1,456',
  },
  {
    label: 'Summer — Near Full-Time With Informal Gigs',
    hours: '~36 hours/week',
    rate: '$15/hr blended',
    weekly: '~$540',
    monthly: '~$2,160',
  },
]

const fifteenVsFourteen = [
  {
    difference: 'Wider employer acceptance',
    detail: 'Many national chains that technically hire at 14 only begin actively recruiting at 15. Managers tend to be more comfortable scheduling a 15 year old for closing shifts and weekend coverage.',
  },
  {
    difference: 'More restaurant doors open',
    detail: 'At 15, national fast food and quick-service chains are significantly more willing to bring you on board. Several of these brands set their own internal hiring floor at 15 even though the law technically allows 14.',
  },
  {
    difference: 'Stronger applicant profile',
    detail: 'An extra year of school, extracurriculars, or informal work experience (even babysitting or volunteer hours) gives you more material to draw from in an interview or on a basic resume.',
  },
  {
    difference: 'Closer to the 16-year threshold',
    detail: 'At 16, most federal hour restrictions lift entirely. Employers who invest in training a 15 year old know that within a year, that worker will become significantly more schedulable.',
  },
]

const redFlags = [
  'Your shift is scheduled to end after 7:00 PM on a school night or after 9:00 PM in the summer window',
  'Your total hours for the week go beyond what your state or federal rules allow for your age',
  'You are told to use or clean any machine that cuts, slices, grinds, or has exposed moving components',
  'The job puts you on a raised surface, inside a walk-in cooler, or near industrial cleaning products',
  'The employer tells you a work permit is unnecessary or asks you to begin before yours is processed',
  'You are expected to ride in a company vehicle, assist on a delivery route, or work near freight areas',
  'Your hourly pay does not meet the minimum required in your state after accounting for all hours worked',
  'You are asked to stay after your shift to finish tasks without those minutes appearing on your timecard',
]

const employerChecklist = [
  {
    title: 'Know Your Availability Before the Interview',
    description: 'Write down every day and time block you can work before you walk in. Managers scheduling teens need precision, not flexibility promises. "I can work Tuesdays, Thursdays 3:30 to 6:30, and Saturdays 9 to 5" is far more useful than "I am available most days."',
  },
  {
    title: 'Bring Something That Shows Consistency',
    description: 'No employer expects a resume from a 15 year old. What they want to see is evidence that you can commit to something and follow through. A school activity you stuck with for a year, a volunteer role, regular babysitting clients — anything that demonstrates you show up when expected.',
  },
  {
    title: 'Ask a Question at the End of the Interview',
    description: 'Most teen applicants sit quietly until the manager says they can leave. Asking one relevant question, such as "What does a typical shift look like?" or "How is the schedule communicated each week?" signals engagement and maturity that hiring managers remember.',
  },
  {
    title: 'Follow Up Within a Week',
    description: 'A brief, polite check-in by phone or in person one week after applying puts your name back in front of the decision-maker. Most teens never follow up. The ones who do are disproportionately likely to get the call.',
  },
]

const faqs = [
  {
    question: 'Can a 15 year old legally work in the United States?',
    answer: 'Yes. Teens aged 14 and 15 are permitted to hold jobs in a range of fields that do not involve physical danger, provided the work takes place outside of school hours and stays within federally set time limits. States can narrow the list of approved industries or tighten hour caps beyond the federal baseline, so the exact rules depend on where you live.',
  },
  {
    question: 'How many hours can a 15 year old actually work per week?',
    answer: 'During school weeks, the federal cap is 18 hours with a 3-hour daily limit on school days. Some states, including a few that set the school-week cap at 23 hours, offer slightly more flexibility. When school is out, the ceiling rises to 8 hours per day and 40 per week. The evening cutoff is 7:00 PM during the school year and 9:00 PM from June 1 through Labor Day.',
  },
  {
    question: 'What types of work are available at 15?',
    answer: 'Retail positions, front-of-house restaurant work that stays away from heat-based cooking equipment, grocery roles, movie theaters, office tasks, library positions, and seasonal camp work all fall within the approved range. On the informal side, babysitting, lawn care, and tutoring operate outside the same regulatory structure. The boundary is physical safety: if the role involves heavy machinery, industrial environments, or tasks that could cause serious physical harm, it is off the table.',
  },
  {
    question: 'Is 15 better than 14 for getting hired?',
    answer: 'In practice, yes. While the federal rules are identical for 14 and 15 year olds, many employers set their own hiring minimum at 15. National fast food chains, retail stores, and grocery chains are more likely to actively recruit 15 year olds than 14 year olds. The additional year also gives you more material for an interview, whether from school, volunteer work, or informal jobs.',
  },
  {
    question: 'How much can a 15 year old realistically earn?',
    answer: 'During the school year, a teen working one weekend shift per week at a state minimum of $12 per hour brings in roughly $380 per month. A more active schedule mixing after-school shifts with weekend work can push that above $800. During summer, with the expanded hour limits, monthly earnings between $1,400 and $2,100 are realistic depending on the rate and the number of hours worked.',
  },
  {
    question: 'Does a 15 year old need a work permit?',
    answer: 'In most states, yes. The process is handled through your school: pick up the form, get a parent to sign, bring it to the employer for their section, and submit for approval. Turnaround is typically a few days, not weeks. Having the completed permit in hand before you start applying eliminates the most common bottleneck in the teen hiring timeline.',
  },
  {
    question: 'Can working at 15 hurt academic performance?',
    answer: 'The federal hour limits are designed to prevent that. A schedule capped at 18 hours during school weeks leaves ample time for homework, extracurriculars, and rest. Issues tend to appear when teens take on informal work with no hour structure or when they overcommit across multiple responsibilities simultaneously. If grades start slipping, the work schedule is the first variable to reassess.',
  },
]

export default async function JobsFor15YearOldsPage({ searchParams }: any) {
  const params = await searchParams

  const [{ count }, initialData] = await Promise.all([
  getMergedJobCount(params.what || 'jobs for 15 year olds', params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
  searchMergedJobs({ what: params.what || 'jobs for 15 year olds', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Jobs for 15 Year Olds Hiring Now Across the United States
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="jobs for 15 year olds" />
          </aside>
          <div className="flex-1">
            {count > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">{count.toLocaleString()}</span> positions available
              </p>
            )}
            <AIJobMatcherWrapper />
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList what={params.what || 'jobs for 15 year olds'} where={params.where || ''} salary_min={params.salary_min} initialData={initialData} />
            </Suspense>
          </div>
        </div>

        {/* ── WHAT A WEEK LOOKS LIKE ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">What a Working Week Looks Like at 15</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            The amount of time a 15 year old can spend working shifts depends on whether school is in session. Below is what those boundaries look like mapped onto a real schedule, rather than listed as abstract rules.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" /> School Year Schedule
              </h3>
              <p className="text-gray-500 text-sm mb-4">Max 18 hours/week · Max 3 hours on school days · Evening cutoff at 7:00 PM</p>
              <div className="space-y-3">
                {schoolWeekTimeline.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <item.icon className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.time}</p>
                      <p className="text-xs text-gray-500">{item.activity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" /> Summer Break Schedule
              </h3>
              <p className="text-gray-500 text-sm mb-4">Max 40 hours/week · Max 8 hours/day · Evening cutoff at 9:00 PM (June 1 – Labor Day)</p>
              <div className="space-y-3">
                {summerTimeline.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <item.icon className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.time}</p>
                      <p className="text-xs text-gray-500">{item.activity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">Federal limits shown. Some states cap hours below these levels or extend the evening window differently. Verify your state rules before committing to a schedule.</p>
        </section>

        {/* ── JOB PATHWAYS ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Where 15 Year Olds Are Getting Hired Right Now</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The range of jobs open to a 15 year old is broader than most teens realize. Each category below represents a distinct working environment with its own pace, pay structure, and skill set. Choosing between them is less about which pays the most and more about which experience prepares you for what you want to do next.
          </p>
          <div className="space-y-4">
            {jobPathways.map((path, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <h3 className="font-bold text-gray-900 text-lg mb-3">{path.category}</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Typical roles</p>
                    <p className="text-gray-500">{path.roles}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 mb-1">What you learn</p>
                    <p className="text-gray-500">{path.whatYouLearn}</p>
                  </div>
                </div>
                <div className="mt-3 inline-block bg-green-50 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                  {path.typicalPay}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 15 vs 14 ── */}
        <section className="mt-20">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <TrendingUp className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What Changes Between 14 and 15</h2>
                <p className="text-gray-700 mb-4">
                  On paper, 14 and 15 year olds share the same federal classification and the same hour restrictions. In practice, turning 15 opens doors that were technically available a year earlier but rarely accessible. Here is what actually shifts.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  {fifteenVsFourteen.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm">{item.difference}</h3>
                      <p className="text-gray-600 text-sm">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── EARNING SCENARIOS ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Realistic Earning Scenarios at 15</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Hourly rates alone do not tell you what you will actually take home. The number that matters is what lands in your pocket at the end of a month, given the hours you are allowed to work. These four scenarios reflect common setups for 15 year old workers.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {earningScenarios.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">{item.label}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><p className="text-gray-500">Hours</p><p className="font-medium text-gray-800">{item.hours}</p></div>
                  <div><p className="text-gray-500">Rate</p><p className="font-medium text-gray-800">{item.rate}</p></div>
                  <div><p className="text-gray-500">Weekly</p><p className="font-medium text-green-700">{item.weekly}</p></div>
                  <div><p className="text-gray-500">Monthly</p><p className="font-bold text-green-700">{item.monthly}</p></div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">Estimates are illustrative. Actual earnings depend on state minimum wage, job type, and hours worked. Federal minimum is $7.25/hr; most states set a higher floor.</p>
        </section>

        {/* ── WORK PERMIT ── */}
        <section className="mt-20 bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <FileText className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Your Work Permit</h2>
              <p className="text-gray-700 mb-4">
                Most states require a permit for workers under 16 (some extend the requirement to 18). The process takes a few days and involves four steps. Having the permit in hand before you start applying removes the most common delay in the teen hiring process.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Four Steps to Approval</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    {['Request the form from your school office or guidance counselor', 'Complete your section and get a parent or guardian signature', 'Bring the form to the prospective employer for their details and signature', 'Submit the completed form for approval through the school or your state labor office'].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-amber-100 text-amber-700 font-bold rounded-full text-xs flex-shrink-0 mt-0.5">{i + 1}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Documentation to Prepare</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    {['Age verification (birth certificate, passport, or school ID with date of birth)', 'Social Security number', 'Proof of current school enrollment', 'Written consent from a parent or guardian'].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHAT EMPLOYERS LOOK FOR ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">What Hiring Managers Look for in a 15 Year Old Applicant</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The criteria for hiring a 15 year old are not about credentials. They center on whether you will show up reliably, communicate your schedule clearly, and handle yourself professionally in a work environment. Here is what tips the balance in your favor.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {employerChecklist.map((item, index) => (
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Red Flags: When a Job Is Not Operating Within the Rules</h2>
                <p className="text-gray-700 mb-4">
                  The majority of employers who hire teens follow the law. But not all. The following situations indicate that a job either exceeds legal boundaries or creates conditions that are inappropriate for a 15 year old worker. If any of these apply, stop working and inform a parent or guardian.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {redFlags.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PARENT SECTION ── */}
        <section className="mt-20">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Guidance for Parents and Guardians</h2>
                <p className="text-gray-700 mb-4">
                  A 15 year old entering the workforce is crossing a meaningful developmental threshold. The parental role at this stage is to confirm that the job meets legal requirements, that the schedule is sustainable alongside school, and that the experience builds rather than depletes.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  {[
                    { title: 'Confirm the employer understands the rules', detail: 'A brief conversation with the manager about scheduling limits is usually enough. An employer who does not know the hour restrictions for minors or who is evasive about them is a concern.' },
                    { title: 'Verify your state\'s specific requirements', detail: 'Some states cap hours below the federal maximum, restrict specific industries, or require documentation beyond the standard work permit. Your state labor department website has the definitive list.' },
                    { title: 'Track the impact on school and sleep', detail: 'Working 18 hours per week during school is manageable for most teens. The warning signs are grade decline, chronic fatigue, and withdrawal from activities that previously mattered to them. If those appear, the schedule needs adjustment.' },
                    { title: 'Make it a financial learning opportunity', detail: 'A first paycheck is the most effective introduction to saving, budgeting, and understanding payroll deductions. Setting up a bank account together and reviewing the first pay stub builds financial awareness that sticks.' },
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Jobs for 15 Year Olds</h2>
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
            <strong>Disclaimer:</strong> This page provides general information about teen employment and does not constitute legal advice. Child labor regulations vary by state. Some states enforce stricter requirements than the federal baseline. Before any minor begins work, verify the applicable rules through your state labor department. Parents and guardians are responsible for ensuring compliance with all relevant laws.
          </p>
        </section>
      </div>
    </>
  )
}