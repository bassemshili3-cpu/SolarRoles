import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, DollarSign, CheckCircle, ShieldCheck, BookOpen, Users, TrendingUp, FileText, AlertTriangle } from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Jobs for 16 Year Olds | No Federal Hour Limits',
  description: 'At 16, federal hour restrictions are lifted. Retail, food service, outdoor, and office jobs with real pay listed by location.',
  keywords: 'jobs for 16 year olds, jobs hiring at 16, teen jobs 16, part time jobs 16 year old, jobs near me 16 year old, first job 16, youth employment, summer jobs for 16 year olds',
  openGraph: {
    title: 'Jobs for 16 Year Olds | More Hours, More Roles at 16',
    description: 'At 16, federal hour caps disappear. Browse hundreds of openings with flexible scheduling and competitive pay.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jobs for 16 Year Olds | No Federal Hour Limits',
    description: 'Hundreds of positions for 16 year olds. More hours, more roles, more pay than at 14 or 15. Apply now.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/jobs-for-16-year-olds',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Jobs for 16 Year Olds',
  description: 'Find jobs for 16 year olds hiring near you across the United States. Browse teen-friendly positions with expanded hours and competitive pay.',
  url: 'https://www.oh-my-job.com/jobs-for-16-year-olds',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Jobs for 16 Year Olds',
    description: 'Current job listings suitable for 16 year old workers across the United States',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can a 16 year old legally work in the United States?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. At 16, the federal daily and weekly hour caps that apply to 14 and 15 year olds are removed entirely. The only federal restriction that remains is the prohibition on work classified as hazardous. States may still set their own limits on scheduling during school nights.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does a 16 year old need a work permit?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'There is no federal work permit requirement at any age. However, many states require an employment certificate for anyone under 18. The form is typically handled through your school and takes a few days to process.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the minimum wage for a 16 year old?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The federal floor is $7.25 per hour. Most states set a higher minimum that applies regardless of age. A separate provision allows $4.25 for the first 90 days with a new employer, though few companies use it in practice.',
      },
    },
    {
      '@type': 'Question',
      name: 'What jobs are 16 year olds not allowed to do?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The only federal restriction at 16 is the prohibition on hazardous work. This covers roles involving heavy machinery, roofing, mining, demolition, explosives, and driving as a primary job function. Everything else is open.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can a 16 year old work full time during summer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Under federal law, yes. There is no cap on daily or weekly hours for 16 and 17 year olds. Some states still limit scheduling during certain periods, so check your state rules before committing to a full-time summer schedule.',
      },
    },
  ],
}

/* ─── SECTION DATA ──────────────────────────────────────────── */

const whatChangesAtSixteen = [
  {
    shift: 'Federal hour limits disappear',
    detail: 'At 14 and 15, federal law caps your week at 18 hours during school and 40 during breaks. At 16, those caps are gone at the federal level. You can theoretically work as many hours as an adult. This single change is the reason most national employers set 16 as their preferred hiring age.',
    icon: Clock,
  },
  {
    shift: 'The employer pool expands dramatically',
    detail: 'Most fast food chains, grocery stores, and retail brands that are cautious about scheduling 14 and 15 year olds actively recruit at 16. The removed hour restrictions eliminate the scheduling headaches that made younger teens operationally expensive to manage.',
    icon: Briefcase,
  },
  {
    shift: 'Closing shifts become available',
    detail: 'The 7:00 PM and 9:00 PM evening cutoffs that applied at 14 and 15 no longer exist at the federal level. Many employers will schedule a 16 year old until 10:00 or 11:00 PM, depending on state rules. This unlocks the busiest and highest-tip shifts in food service and entertainment.',
    icon: TrendingUp,
  },
  {
    shift: 'Only hazardous work remains off limits',
    detail: 'At 14 and 15, the list of prohibited job types is long and restrictive. At 16, the only remaining ban is on work that the federal government classifies as physically dangerous. Everything else, from kitchen grills to warehouse shelf stocking, opens up.',
    icon: ShieldCheck,
  },
]

const jobPathways = [
  {
    category: 'Retail and Grocery',
    roles: 'Register operator, floor associate, fitting room attendant, click-and-collect fulfillment, shelf merchandising, pharmacy counter assistant',
    whyItMatters: 'Retail teaches you to handle money, manage customer interactions under time pressure, and work within a system of daily targets. It is also the category with the most locations hiring at any given time, which means geographic flexibility.',
    typicalPay: '$11–$16/hr depending on state and chain',
  },
  {
    category: 'Fast Food and Quick Service',
    roles: 'Crew member, drive-through operator, grill and fryer station (now permitted at 16), shift prep, front counter',
    whyItMatters: 'At 16, cooking roles that were off limits at 15 become available. This means higher-responsibility positions, faster advancement to shift lead, and access to the busiest (and most tip-friendly) evening and weekend windows.',
    typicalPay: '$11–$15/hr, some chains offer tuition or meal benefits',
  },
  {
    category: 'Outdoor and Seasonal',
    roles: 'Lifeguard (with certification), camp counselor, golf course attendant, landscaping crew, amusement park ride operator, farm stand worker',
    whyItMatters: 'Seasonal roles at 16 can run full-time hours during summer, which means earning potential that was not possible at 14 or 15. Lifeguarding in particular pays well above minimum wage in most markets and carries certification that stays on your record.',
    typicalPay: '$12–$18/hr, lifeguards often at the higher end',
  },
  {
    category: 'Office and Administrative',
    roles: 'Filing clerk, reception assistant, data entry, appointment scheduling, mail sorting, basic bookkeeping support',
    whyItMatters: 'Office exposure at 16 builds skills that most teens never develop before college: professional email etiquette, scheduling tools, phone communication, and working in a quiet, deadline-driven environment. These roles are less common but disproportionately valuable on future applications.',
    typicalPay: '$12–$15/hr, usually consistent weekday hours',
  },
  {
    category: 'Community and Self-Directed',
    roles: 'Babysitting, pet sitting, tutoring, car detailing, event setup and cleanup, social media management for local businesses',
    whyItMatters: 'Self-directed work at 16 scales better than at 14 or 15 because you can dedicate more hours and take on larger commitments. A 16 year old managing three regular babysitting families or running a weekend car detailing operation is building a client base, not just earning pocket money.',
    typicalPay: '$15–$30/hr depending on service and market',
  },
]

const earningScenarios = [
  {
    label: 'School Year — One Weekend Shift',
    hours: '~8 hrs/week',
    rate: '$13/hr',
    weekly: '~$104',
    monthly: '~$416',
    note: 'Minimal commitment, works alongside heavy course loads',
  },
  {
    label: 'School Year — After-School + Weekends',
    hours: '~20 hrs/week',
    rate: '$13/hr',
    weekly: '~$260',
    monthly: '~$1,040',
    note: 'The most common setup for 16 year olds balancing school and work',
  },
  {
    label: 'Summer — Consistent Part-Time',
    hours: '~30 hrs/week',
    rate: '$14/hr',
    weekly: '~$420',
    monthly: '~$1,680',
    note: 'Leaves time for other activities while earning meaningfully',
  },
  {
    label: 'Summer — Full-Time Schedule',
    hours: '~40 hrs/week',
    rate: '$14/hr',
    weekly: '~$560',
    monthly: '~$2,240',
    note: 'Now possible at 16 since federal weekly caps no longer apply',
  },
]

const redFlags = [
  'Being asked to operate industrial machinery, power saws, meat slicers, or equipment with unguarded moving parts',
  'Any task that involves roofing, excavation, demolition, or working at significant heights',
  'Driving a vehicle as a core part of the job (limited exceptions exist for short daytime trips in some states)',
  'Handling explosives, radioactive materials, or concentrated industrial chemicals',
  'Working in a mining, logging, or sawmill environment regardless of the specific task assigned',
  'Being told that labor law does not apply to you because you are a minor or because the job is seasonal',
  'Hourly pay that falls below your state minimum after accounting for all hours on the clock',
  'Pressure to work past the hours your state permits on school nights, even if federal law has no cap',
]

const employerChecklist = [
  {
    title: 'Lead With Your Availability, Not Your Age',
    description: 'Managers care about when you can work, not how old you are. Open with your full schedule: which days, which time blocks, and whether you can close. At 16, your scheduling flexibility is your strongest selling point because the federal hour restrictions that made younger teens difficult to schedule no longer apply to you.',
  },
  {
    title: 'Highlight Any Track Record of Consistency',
    description: 'Two years of showing up to a school club, a volunteer commitment you maintained through a full semester, or a neighbor you mowed lawns for every Saturday since eighth grade. What employers are screening for at this age is not skill. It is proof that you follow through when you say you will.',
  },
  {
    title: 'Research the Employer Before You Walk In',
    description: 'Knowing one specific thing about the business, whether it is a recent store opening, a product they are known for, or something you noticed during a visit, separates you from every other 16 year old who applied cold. It takes five minutes and changes the entire tone of the conversation.',
  },
  {
    title: 'Apply to Multiple Places in the Same Week',
    description: 'Hiring timelines for teen positions are unpredictable. Some managers call back the same day. Others take three weeks. Submitting five or six applications within a short window ensures you are not waiting on a single outcome. Treat the job search the way you would treat anything else you want to succeed at: with volume and follow-through.',
  },
]

const faqs = [
  {
    question: 'What actually changes at 16 compared to 14 and 15?',
    answer: 'The biggest shift is scheduling. At 14 and 15, federal law limits you to 3 hours on school days, 18 hours during school weeks, and a 7:00 PM cutoff (9:00 PM in summer). At 16, all of those federal caps disappear. You can work evenings, close a store, pick up back-to-back shifts, and work a full 40-hour week during the summer without hitting a federal ceiling. The only thing that stays restricted is hazardous work, which remains off limits until 18. Your state may still have its own rules on school-night hours, so check locally.',
  },
  {
    question: 'Do I still need a work permit at 16?',
    answer: 'There is no federal permit requirement at any age. But most states require one for anyone under 18. The process is the same as at 15: pick up the form from school, get a parent and employer signature, submit it. If you already had one for a previous job, check whether your state requires a new permit for each employer or if the existing one carries over.',
  },
  {
    question: 'What will I realistically earn at 16?',
    answer: 'Your hourly rate will be whatever your state minimum is, which ranges from about $10 to $16 depending on where you live. The real difference at 16 is not the rate per hour but the number of hours you can work. A 16 year old working 20 hours per week during school at $13 per hour takes home roughly $1,040 per month. During summer at 40 hours, that figure doubles. Informal work like tutoring, pet sitting, or car detailing can push the effective hourly rate well above any minimum.',
  },
  {
    question: 'Can I work full-time hours during summer at 16?',
    answer: 'Under federal rules, yes. There is no daily or weekly hour cap for 16 and 17 year olds. That means 40-hour weeks during school breaks are fully permitted at the federal level. Some states still limit hours for minors on school nights or set evening cutoffs even during summer, so confirm your state rules before committing to a full-time schedule.',
  },
  {
    question: 'What work is still off limits at 16?',
    answer: 'The only remaining prohibition is on jobs the federal government classifies as hazardous. In practical terms that means no roofing, no mining, no demolition, no operating heavy industrial equipment, no logging, no work with explosives, and no driving as the primary function of the job. Cooking on a grill, using a commercial fryer, and stocking heavy items on shelves all become permitted at 16, which is why the range of available food service and warehouse-adjacent roles expands significantly at this age.',
  },
  {
    question: 'Is it worth working during the school year or should I wait for summer?',
    answer: 'Working a moderate schedule during the school year, typically 15 to 20 hours per week, builds a track record that makes your summer applications stronger. Employers filling summer positions prefer candidates who already have some work experience over those applying for the first time. It also means you enter summer with an established role and schedule rather than starting the job search from scratch in June.',
  },
]

export default async function JobsFor16YearOldsPage({ searchParams }: any) {
  const params = await searchParams

  const [{ count }, initialData] = await Promise.all([
  getMergedJobCount(params.what || 'jobs for 16 year olds', params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
  searchMergedJobs({ what: params.what || 'jobs for 16 year olds', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
])
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Jobs for 16 Year Olds Hiring Now Across the United States
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="jobs for 16 year olds" />
          </aside>
          <div className="flex-1">
            {count > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">{count.toLocaleString()}</span> positions available
              </p>
            )}
            <AIJobMatcherWrapper />
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList what={params.what || 'jobs for 16 year olds'} where={params.where || ''} salary_min={params.salary_min} initialData={initialData} />
            </Suspense>
          </div>
        </div>

        {/* ── WHAT CHANGES AT 16 ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">What Changes When You Turn 16</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Turning 16 is the single biggest inflection point in teen employment. The federal restrictions that governed your working life at 14 and 15 fall away almost entirely, and the job market treats you fundamentally differently as a result. Here is exactly what shifts.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {whatChangesAtSixteen.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <item.icon className="w-6 h-6 text-blue-600" />
                  <h3 className="font-bold text-gray-900">{item.shift}</h3>
                </div>
                <p className="text-gray-600 text-sm">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── JOB PATHWAYS ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Where 16 Year Olds Are Getting Hired Right Now</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            At 16, the range of available work expands in two directions simultaneously: more employers are willing to hire you, and the roles within each employer that you can fill become broader. The cooking station, the closing shift, the Saturday double — all of these open up. Here is how the landscape breaks down.
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
                    <p className="font-medium text-gray-700 mb-1">Why this matters at 16</p>
                    <p className="text-gray-500">{path.whyItMatters}</p>
                  </div>
                </div>
                <div className="mt-3 inline-block bg-green-50 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                  {path.typicalPay}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── EARNING SCENARIOS ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Realistic Earning Scenarios at 16</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The earning jump between 15 and 16 is not primarily about pay rate — it is about volume. Without federal hour caps, a 16 year old can work roughly twice as many hours during the school year and has access to full-time summer schedules that were previously off limits. Here is what that looks like in practice.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {earningScenarios.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-1">{item.label}</h3>
                <p className="text-xs text-gray-500 mb-3">{item.note}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><p className="text-gray-500">Hours</p><p className="font-medium text-gray-800">{item.hours}</p></div>
                  <div><p className="text-gray-500">Rate</p><p className="font-medium text-gray-800">{item.rate}</p></div>
                  <div><p className="text-gray-500">Weekly</p><p className="font-medium text-green-700">{item.weekly}</p></div>
                  <div><p className="text-gray-500">Monthly</p><p className="font-bold text-green-700">{item.monthly}</p></div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">Estimates are illustrative. Actual earnings depend on state minimum wage, job type, and hours worked. The federal wage floor is $7.25/hr; most states enforce a higher minimum.</p>
        </section>

        {/* ── WORK PERMIT ── */}
        <section className="mt-20 bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <FileText className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Work Permits at 16: What You Need to Know</h2>
              <p className="text-gray-700 mb-4">
                Federal law does not require a work permit at any age. But most states have their own rules, and many extend the permit requirement to anyone under 18. If you already obtained a permit for a job at 14 or 15, check whether your state requires a new one for each employer or allows the existing permit to carry forward. The process is identical either way: school form, parent signature, employer signature, submit for approval.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">If You Have Had a Permit Before</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    {['Check if your state ties permits to the employer or to the worker', 'If employer-specific, you will need a fresh form for each new job', 'If worker-specific, your existing permit may still be valid', 'When in doubt, ask your school office — they process these routinely'].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">If This Is Your First Permit</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    {['Pick up the form from your school main office or guidance department', 'Complete your section and have a parent or guardian sign', 'Bring the form to the prospective employer for their portion', 'Submit the finished form for processing (typically a few business days)'].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-amber-100 text-amber-700 font-bold rounded-full text-xs flex-shrink-0 mt-0.5">{i + 1}</span>
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
            <h2 className="text-2xl font-bold text-gray-900">What Hiring Managers Evaluate in a 16 Year Old</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            At 16, you are competing for positions with other teens and, increasingly, with adults applying for the same entry-level roles. The differentiators at this stage are not credentials. They are preparation, communication, and evidence that you take the opportunity seriously.
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Work That Remains Off Limits at 16</h2>
                <p className="text-gray-700 mb-4">
                  The removal of hour restrictions at 16 does not mean all work is permitted. A specific set of roles classified as physically dangerous remain prohibited for anyone under 18 regardless of consent, experience, or employer size. If a job asks you to do any of the following, it is operating outside the law.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {redFlags.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  If you are unsure whether a task falls within the permitted range, your state labor department can clarify before you accept the assignment.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── PARENT SECTION ── */}
        <section className="mt-20">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <ShieldCheck className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Guidance for Parents and Guardians</h2>
                <p className="text-gray-700 mb-4">
                  At 16, federal law treats your teen much closer to an adult worker. The hour caps are gone, the range of permitted work is broad, and many employers will schedule aggressively if allowed. Your role shifts from gatekeeper to advisor: ensuring the schedule is sustainable and that the balance between work, school, and personal development holds.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  {[
                    { title: 'Set a household hour cap even if the law does not', detail: 'Federal hour limits disappearing does not mean a 30-hour school week is a good idea. Most research on teen work performance suggests that exceeding 20 hours per week during school begins to affect grades and sleep. Agree on a ceiling together before the first schedule is set.' },
                    { title: 'Verify state-level protections', detail: 'Many states retain school-night curfews and maximum shift lengths for minors even after federal caps expire. These rules vary widely and change periodically. Your state labor department website has the current version.' },
                    { title: 'Discuss money management early', detail: 'A 16 year old working 20 hours per week can earn over $1,000 per month. Without guidance, that money disappears fast. Setting up a savings split, reviewing pay stubs together, and discussing tax filing basics while the amounts are small builds habits that compound.' },
                    { title: 'Watch for employer overreach', detail: 'Some managers will schedule a reliable teen for as many hours as they will accept, regardless of whether it serves the teen\'s interests. If your 16 year old is being asked to cover adult shifts regularly, close multiple nights per week, or work during exam periods, intervene early.' },
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
            <ShieldCheck className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Jobs for 16 Year Olds</h2>
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
            <strong>Disclaimer:</strong> This page provides general information about teen employment and does not constitute legal advice. Labor regulations for minors vary by state, and some states enforce rules that are stricter than the federal baseline. Verify the requirements applicable to your situation through your state labor department before beginning work. Parents and guardians are responsible for ensuring compliance with all relevant laws.
          </p>
        </section>
      </div>
    </>
  )
}