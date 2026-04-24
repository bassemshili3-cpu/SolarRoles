import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, AlertTriangle, BookOpen, Users } from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Jobs for 14 Year Olds Hiring Now | Teen-Friendly Positions Near You',
  description: 'Find jobs for 14 year olds open right now. Legal, safe positions with flexible hours that work around school. No experience needed. Browse by location and apply today.',
  keywords: 'jobs for 14 year olds, jobs hiring at 14, teen jobs, first job for 14 year old, part time jobs for 14 year olds, summer jobs for 14 year olds',
  openGraph: {
    title: 'Jobs for 14 Year Olds | Teen Positions Hiring Now',
    description: 'Browse teen-friendly jobs hiring near you. Safe, legal, flexible hours. Perfect for a first job.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jobs for 14 Year Olds | Start Earning Today',
    description: 'Hundreds of positions open for 14 year olds. No experience required. Flexible schedules that fit around school.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/jobs-for-14-year-olds',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Jobs for 14 Year Olds',
  description: 'Find legal jobs for 14 year olds hiring near you. Browse hundreds of teen-friendly positions with flexible hours.',
  url: 'https://www.oh-my-job.com/jobs-for-14-year-olds',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Jobs for 14 Year Olds',
    description: 'Current job listings suitable for 14 year old workers',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can a 14 year old legally work in the United States?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Federal law permits 14 and 15 year olds to hold jobs outside of school hours in approved categories such as retail, food service, and office work. State-level rules may impose additional restrictions depending on where you live.',
      },
    },
    {
      '@type': 'Question',
      name: 'What jobs are 14 year olds NOT allowed to do?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Any occupation classified as hazardous is off limits. This includes factory work, construction, operating power-driven equipment, mining, and roles involving dangerous materials.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do 14 year olds need a work permit?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most states require an employment certificate for workers under 16. The form is typically available through your school and requires signatures from a parent and the prospective employer.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the minimum wage for a 14 year old?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The federal minimum is $7.25 per hour, though the majority of states enforce a higher rate that takes precedence.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can 14 year olds work during summer vacation?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. When school is not in session, daily and weekly hour limits increase substantially. The permitted evening window also extends during the summer months.',
      },
    },
  ],
}

/* ─── SECTION DATA ──────────────────────────────────────────── */

const weekdayScenario = [
  { time: '7:00 AM – 3:00 PM', activity: 'School', icon: BookOpen },
  { time: '3:30 PM – 6:30 PM', activity: 'Work shift (3 hours max on school days)', icon: Briefcase },
  { time: '7:00 PM', activity: 'Federal cutoff — no work past this point during the school year', icon: Clock },
]

const summerScenario = [
  { time: '8:00 AM – 12:00 PM', activity: 'Morning shift', icon: Briefcase },
  { time: '12:00 PM – 1:00 PM', activity: 'Lunch break', icon: Users },
  { time: '1:00 PM – 4:00 PM', activity: 'Afternoon shift (up to 8 hours total per day)', icon: Briefcase },
  { time: '9:00 PM', activity: 'Extended summer cutoff (June 1 through Labor Day)', icon: Clock },
]

const jobComparison = [
  {
    type: 'Formal Employment',
    examples: 'Grocery stores, ice cream shops, retail chains, restaurants (limited roles)',
    pay: 'State minimum wage ($10–$16/hr in most states)',
    pros: 'Structured schedule, professional reference, employment record, potential for raises',
    cons: 'Requires work permit, less scheduling flexibility, tasks assigned by supervisor',
  },
  {
    type: 'Informal / Self-Directed Work',
    examples: 'Babysitting, pet sitting, lawn care, tutoring, house cleaning, car washing',
    pay: 'Negotiable ($10–$25/hr depending on task and area)',
    pros: 'Set your own hours, negotiate your own rate, start immediately, no permit needed for most',
    cons: 'No formal employment record, income depends on finding clients, no benefits or protections',
  },
]

const employerChecklist = [
  {
    title: 'Show Up Prepared',
    description: 'Bring your work permit (if you have one), know your available hours, and have a parent\'s phone number ready. Employers hiring 14 year olds expect to deal with some logistics. Making that process easy for them is the fastest way to stand out.',
  },
  {
    title: 'Communicate Availability Clearly',
    description: 'Managers scheduling teens need to know exactly when you can and cannot work. Write out your available days and time blocks before the interview. Vague answers like "whenever" are less useful than "Tuesdays, Thursdays after 3:30, and all day Saturday."',
  },
  {
    title: 'Emphasize Reliability Over Experience',
    description: 'No employer expects a 14 year old to have a resume. What they care about is whether you will show up on time and finish what you start. If you can point to anything in your life where you demonstrated consistency — a school commitment, a volunteer role, a family responsibility — mention it.',
  },
  {
    title: 'Follow Up After You Apply',
    description: 'Most teen applicants submit an application and wait. A polite follow-up one week later, in person or by phone, puts your name back in front of the hiring manager. At this age, initiative is rare and noticed.',
  },
]

const earningScenarios = [
  {
    scenario: 'School Year — One Retail Shift Per Week',
    hours: '~6 hours/week (one Saturday shift)',
    rate: '$12/hr (state minimum example)',
    weekly: '~$72/week',
    monthly: '~$288/month',
  },
  {
    scenario: 'School Year — Max Hours With Informal Work',
    hours: '~15 hours/week (mix of after-school and weekend gigs)',
    rate: '$15/hr (babysitting/lawn care average)',
    weekly: '~$225/week',
    monthly: '~$900/month',
  },
  {
    scenario: 'Summer — Part-Time Formal Job',
    hours: '~25 hours/week',
    rate: '$13/hr',
    weekly: '~$325/week',
    monthly: '~$1,300/month',
  },
  {
    scenario: 'Summer — Full Schedule, Mixed Income',
    hours: '~35 hours/week (formal + informal combined)',
    rate: '$14/hr blended average',
    weekly: '~$490/week',
    monthly: '~$1,960/month',
  },
]

const safetyRedFlags = [
  'You are asked to work past 7:00 PM on a school night (or past 9:00 PM in summer)',
  'Your total weekly hours exceed 18 during school or 40 during breaks',
  'You are told to operate any equipment with blades, motors, or moving parts',
  'The job involves climbing above ground level, entering cold storage, or handling chemicals',
  'The employer pressures you to skip the work permit process or says you do not need one',
  'You are asked to drive, ride in a delivery vehicle, or work near loading docks',
  'Pay is consistently below your state minimum wage or is withheld without explanation',
  'The work environment feels physically unsafe and concerns are dismissed when raised',
]

const faqs = [
  {
    question: 'Can a 14 year old legally work in the United States?',
    answer: 'Yes. Teens in the 14 to 15 age group are permitted to hold jobs in a range of non-hazardous fields, provided the work takes place outside of school hours and stays within federally mandated time limits. The exact scope of permitted work varies by state, as some states layer additional requirements on top of the federal baseline.',
  },
  {
    question: 'What is the real difference between formal and informal work at 14?',
    answer: 'Formal employment means working for a registered business that issues a paycheck, withholds taxes, and maintains a record of your employment. Informal work means private arrangements like babysitting, pet care, or yard maintenance where you are paid directly by the client. Both are legal. Formal work builds an official employment history. Informal work offers more flexibility and often higher hourly rates, but without the paper trail.',
  },
  {
    question: 'How does the work permit process actually work in practice?',
    answer: 'In most states, you pick up a one-page form from your school, fill in your details, get a parent signature and an employer signature, and submit it for approval. The turnaround is usually a few days. Some states handle it entirely through the school district; others route it through the state labor office. A small number of states skip the requirement entirely. Your school guidance office can confirm what applies in your area.',
  },
  {
    question: 'How much money can a 14 year old realistically earn?',
    answer: 'It depends on the type of work and the number of hours. A single weekend retail shift during the school year might bring in $70 to $100 per week. A teen running a steady babysitting or lawn care operation after school and on weekends could earn $800 to $900 per month. During summer, with expanded hours available, monthly income can approach $1,500 to $2,000 for teens working close to the weekly cap.',
  },
  {
    question: 'Do summer work rules differ from the school-year rules?',
    answer: 'Substantially. When school is out, the daily ceiling rises from 3 hours to 8, and the weekly ceiling goes from 18 to 40. The evening cutoff extends by two hours during the summer months as well. This makes summer the primary earning window for most working teens, and the best time to take on a more structured job if you want the experience.',
  },
  {
    question: 'Will a job at 14 affect school performance?',
    answer: 'The federal time limits are calibrated to prevent exactly that. A teen working the maximum 18 hours during a school week still has more than enough time for homework, extracurriculars, and sleep. Problems tend to arise when the work is informal and exceeds legal hour caps, or when the teen takes on too many commitments simultaneously. If grades start slipping, the work schedule is the first variable to adjust.',
  },
]

export default async function JobsFor14YearOldsPage({ searchParams }: any) {
  const params = await searchParams

   const [{ count }, initialData] = await Promise.all([
  getMergedJobCount(params.what || 'jobs for 14 year olds', params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
  searchMergedJobs({ what: params.what || 'jobs for 14 year olds', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Jobs for 14 Year Olds Hiring Now Across the United States
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="jobs for 14 year olds" />
          </aside>
          <div className="flex-1">
            {count > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">{count.toLocaleString()}</span> positions available
              </p>
            )}
            <AIJobMatcherWrapper />
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList what={params.what || 'jobs for 14 year olds'} where={params.where || ''} salary_min={params.salary_min} initialData={initialData} />
            </Suspense>
          </div>
        </div>

        {/* ── WHAT A TYPICAL WEEK LOOKS LIKE ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">What a Working Week Looks Like at 14</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            The number of hours a 14 year old can work depends on whether school is in session. Rather than listing rules in a table, here is what those limits look like mapped onto an actual week.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* School year */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" /> During the School Year
              </h3>
              <p className="text-gray-500 text-sm mb-4">Max 18 hours/week · Max 3 hours on school days · No work past 7:00 PM</p>
              <div className="space-y-3">
                {weekdayScenario.map((item, i) => (
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

            {/* Summer */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" /> During Summer Break
              </h3>
              <p className="text-gray-500 text-sm mb-4">Max 40 hours/week · Max 8 hours/day · Extended to 9:00 PM (June 1 – Labor Day)</p>
              <div className="space-y-3">
                {summerScenario.map((item, i) => (
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
          <p className="text-sm text-gray-500 mt-4">
            These reflect federal limits. Some states enforce tighter caps. Check your state labor department for local rules.
          </p>
        </section>

        {/* ── FORMAL vs INFORMAL WORK ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Two Paths: Formal Employment vs. Working for Yourself</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            At 14, your job options split into two distinct categories, and each one works differently in terms of pay structure, scheduling freedom, and what it adds to your record. Understanding the trade-off helps you choose the path that fits your goals.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {jobComparison.map((path, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                <h3 className="font-bold text-gray-900 text-lg mb-3">{path.type}</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Common roles</p>
                    <p className="text-gray-500">{path.examples}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Typical pay</p>
                    <p className="text-gray-500">{path.pay}</p>
                  </div>
                  <div>
                    <p className="font-medium text-green-700">Advantages</p>
                    <p className="text-gray-500">{path.pros}</p>
                  </div>
                  <div>
                    <p className="font-medium text-amber-700">Trade-offs</p>
                    <p className="text-gray-500">{path.cons}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── REALISTIC EARNING SCENARIOS ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Realistic Earning Scenarios at 14</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Minimum wage numbers on their own are not very useful. What matters is how much you can actually earn given the hour limits you are working within. Below are four scenarios that reflect common setups for working teens, from a single weekend shift to a full summer schedule.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {earningScenarios.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">{item.scenario}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Hours</p>
                    <p className="font-medium text-gray-800">{item.hours}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Rate</p>
                    <p className="font-medium text-gray-800">{item.rate}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Weekly earnings</p>
                    <p className="font-medium text-green-700">{item.weekly}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Monthly estimate</p>
                    <p className="font-bold text-green-700">{item.monthly}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Figures are illustrative. Actual earnings depend on your state minimum wage, the type of work, and hours worked. The federal wage floor is $7.25/hr; most states set a higher minimum.
          </p>
        </section>

        {/* ── WORK PERMIT ── */}
        <section className="mt-20 bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <FileText className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Your Work Permit: A Step-by-Step Walkthrough</h2>
              <p className="text-gray-700 mb-4">
                If your state requires a work permit (most do for anyone under 16), the process involves four steps and usually takes less than a week. Having it done before you start job hunting avoids the most common bottleneck in the teen hiring process.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">The Four Steps</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    {[
                      'Pick up the form from your school\'s main office or guidance department',
                      'Fill in your section and get a parent or guardian to sign',
                      'Bring the form to the employer so they can add their details',
                      'Submit the completed form for approval (school district or state labor office)',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-amber-100 text-amber-700 font-bold rounded-full text-xs flex-shrink-0 mt-0.5">{i + 1}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">What to Have Ready</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    {[
                      'Age verification (birth certificate, passport, or school ID showing your date of birth)',
                      'Social Security number',
                      'Proof of school enrollment (a recent report card or enrollment letter)',
                      'A parent or guardian available to provide written consent',
                    ].map((item, i) => (
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
            <h2 className="text-2xl font-bold text-gray-900">What Employers Actually Look for in a 14 Year Old Applicant</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Nobody expects a 14 year old to have professional experience. The hiring criteria at this age are entirely about readiness, communication, and follow-through. Here is what moves the needle when you are competing for your first position.
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

        {/* ── SAFETY RED FLAGS ── */}
        <section className="mt-20">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Red Flags: When to Walk Away From a Job</h2>
                <p className="text-gray-700 mb-4">
                  Most employers who hire teens operate fully within the law. But not all. The following situations indicate that a job either violates federal or state regulations or creates conditions that are not appropriate for a 14 year old worker. If any of these apply, the right move is to stop working and inform a parent or guardian.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {safetyRedFlags.map((item, index) => (
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
                  Supporting a teen through their first job is a balancing act between encouragement and oversight. The goal is to ensure the arrangement is legal, safe, and compatible with their academic and personal development.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  {[
                    { title: 'Verify the employer\'s compliance', detail: 'Confirm that the business follows the applicable hour limits and does not assign tasks that fall outside what is legally permitted for this age group. A quick conversation with the manager is usually sufficient.' },
                    { title: 'Understand your state\'s specific rules', detail: 'The federal framework sets a minimum standard. Many states add restrictions that go further, including limits on certain industries, additional documentation requirements, or tighter hour caps during the school year.' },
                    { title: 'Watch for signs of overcommitment', detail: 'Working within the legal hour limits should leave ample room for school and rest. If academic performance or sleep quality declines, the first adjustment to consider is reducing work hours rather than dropping extracurriculars or social time.' },
                    { title: 'Use it as a financial teaching moment', detail: 'Opening a bank account together, setting up a simple savings split, and reviewing a first pay stub are practical introductions to financial management that tend to stick longer than any theoretical lesson.' },
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Jobs for 14 Year Olds</h2>
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
            <strong>Disclaimer:</strong> This page provides general information about teen employment and does not constitute legal advice. Child labor regulations vary by state, and some states enforce stricter rules than the federal baseline. Before any minor begins work, verify the applicable requirements through your state labor department. Parents and guardians are responsible for ensuring compliance with all relevant laws.
          </p>
        </section>
      </div>
    </>
  )
}