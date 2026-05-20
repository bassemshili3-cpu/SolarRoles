import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, AlertTriangle, BookOpen, Users, TrendingUp, Award, Heart, Sun } from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Summer Camp Counselor Jobs | 2026 Seasonal Positions',
  description: 'Day, sleepaway, and specialty camp counselor positions for summer 2026 — $300 to $1,500/week with housing included at residential programs.',
  keywords: 'summer camp counselor jobs, camp counselor hiring, summer camp jobs, camp counselor salary, sleepaway camp jobs, day camp counselor, seasonal camp positions',
  openGraph: {
    title: 'Summer Camp Counselor Jobs | Camps Urgently Hiring for 2026',
    description: 'Hundreds of camps hiring counselors now. Get paid to lead activities, mentor kids, and spend the summer outdoors.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Summer Camp Counselor Jobs | Positions Filling Fast',
    description: 'Day camps, overnight camps, specialty programs. Room and board included at residential camps. Apply today.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/summer-camp-counselor-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Summer Camp Counselor Jobs',
  description: 'Find summer camp counselor jobs hiring across the United States. Browse day camp, sleepaway camp, and specialty program positions.',
  url: 'https://www.oh-my-job.com/summer-camp-counselor-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Summer Camp Counselor Positions',
    description: 'Current job listings for summer camp counselors across the United States',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How much do summer camp counselors get paid?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pay varies widely by camp type and location. Day camp counselors typically earn $12 to $20 per hour. Residential camp counselors earn $300 to $600 per week but receive free room, board, and meals, which adds substantial value. Specialty and senior counselor roles can exceed $1,000 per week at premium camps.',
      },
    },
    {
      '@type': 'Question',
      name: 'What age do you need to be to work as a camp counselor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most camps require counselors to be at least 16 for junior or counselor-in-training positions and 18 for full counselor roles. Many residential camps prefer applicants who are at least 19 or have completed at least one year of college.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you need certifications to be a camp counselor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'CPR and First Aid certification are required at almost every camp. Waterfront positions require lifeguard certification. Beyond those, specific certifications depend on the activities you lead. Many camps provide training during a pre-camp orientation period at no cost to the counselor.',
      },
    },
    {
      '@type': 'Question',
      name: 'When should you apply for summer camp counselor jobs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most camps begin recruiting between January and March for the upcoming summer. The most competitive positions (specialty roles, head counselors, waterfront staff) fill earliest. Applying by February or March significantly increases your chances of securing your preferred camp and role.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is being a camp counselor good for your resume?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The role develops leadership, crisis management, communication, and team coordination skills that translate directly to professional settings. Employers in education, healthcare, management, and client-facing industries consistently cite camp experience as a differentiator in entry-level candidates.',
      },
    },
  ],
}

/* ─── SECTION DATA ──────────────────────────────────────────── */

const campTypes = [
  {
    type: 'Day Camp Counselor',
    schedule: 'Monday to Friday, roughly 8 AM to 4 PM',
    pay: '$12 to $22/hr depending on location',
    housing: 'None (you go home each evening)',
    commitment: '6 to 10 weeks, June through August',
    bestFor: 'College students or local residents who want a summer job with predictable hours and evenings free. Day camps are the largest employer category for counselors nationally.',
    consideration: 'Lower pay ceiling than residential camps. The experience is less immersive, which means the personal growth and community bonding aspects are less pronounced.',
  },
  {
    type: 'Residential / Sleepaway Camp Counselor',
    schedule: '24/7 on duty with structured breaks (typically 1 to 2 hours off per day plus one full day off per week)',
    pay: '$300 to $700/week (plus free room, board, and meals)',
    housing: 'On-site cabin or bunk with campers',
    commitment: '7 to 10 weeks, early June through mid-August',
    bestFor: 'People who want a fully immersive experience. You live where you work, eat with campers, and are part of a tight-knit staff community. This is the format that produces the strongest personal connections and the most transferable leadership skills.',
    consideration: 'Privacy is minimal. Your day starts when campers wake up and does not truly end until they are asleep. Burnout is possible if you do not use your time off intentionally.',
  },
  {
    type: 'Specialty / Activity Counselor',
    schedule: 'Varies (day or residential)',
    pay: '$15 to $30/hr (day) or $500 to $1,500/week (residential)',
    housing: 'Depends on camp format',
    commitment: '4 to 10 weeks',
    bestFor: 'People with a specific skill: swimming, rock climbing, horseback riding, archery, theater, music, STEM, visual arts, or outdoor adventure. Specialty counselors are paid more because their expertise directly shapes the camp program.',
    consideration: 'Your role is defined by your skill area, which means less variety in daily activities. Some camps expect you to develop curriculum and manage equipment inventory in addition to instruction.',
  },
  {
    type: 'Counselor-in-Training (CIT) / Junior Counselor',
    schedule: 'Mirrors full counselor schedule with additional training components',
    pay: '$0 to $200/week (some programs charge tuition instead of paying)',
    housing: 'On-site at residential camps',
    commitment: '2 to 6 weeks',
    bestFor: 'Teens aged 15 to 17 who want camp experience on their resume before applying for paid counselor roles. CIT programs build skills but are not employment in the traditional sense.',
    consideration: 'Some CIT programs are paid, some are unpaid, and some charge a fee. Clarify the financial arrangement before committing. The value is in the training and reference, not the paycheck.',
  },
]

const dailyScheduleResidential = [
  { time: '7:00 AM', activity: 'Wake-up call. Get campers out of bed, supervise hygiene routines, cabin cleanup', icon: Sun },
  { time: '7:45 AM', activity: 'Breakfast in the dining hall with your cabin group', icon: Users },
  { time: '8:30 AM to 12:00 PM', activity: 'Morning activity blocks. You either lead your specialty activity or accompany campers to scheduled programs', icon: Briefcase },
  { time: '12:15 PM', activity: 'Lunch followed by a short rest period. This may be your only quiet window until evening', icon: Clock },
  { time: '1:30 PM to 5:00 PM', activity: 'Afternoon activities: free swim, electives, team competitions, or off-site trips', icon: MapPin },
  { time: '5:30 PM', activity: 'Dinner with campers', icon: Users },
  { time: '6:30 PM to 8:30 PM', activity: 'Evening program: campfire, talent show, night hike, or themed event', icon: Heart },
  { time: '9:00 PM to 10:00 PM', activity: 'Cabin time. Wind-down conversations, bedtime routine, lights out. You remain on duty until campers are asleep.', icon: Shield },
]

const payComparison = [
  { category: 'Day Camp (municipal/YMCA)', weeklyPay: '$480 to $800', perks: 'Evenings and weekends free, steady hourly rate, local employment', totalValue: '$480 to $800/week (cash only)' },
  { category: 'Day Camp (private/specialty)', weeklyPay: '$600 to $1,100', perks: 'Higher hourly rate, often includes lunch, sometimes tips from parents', totalValue: '$650 to $1,200/week' },
  { category: 'Residential Camp (standard)', weeklyPay: '$300 to $600', perks: 'Free housing, 3 meals/day, laundry, use of camp facilities on days off', totalValue: '$700 to $1,100/week (when room and board value is included)' },
  { category: 'Residential Camp (premium/specialty)', weeklyPay: '$500 to $1,500', perks: 'Same as above plus travel allowance, end-of-summer bonus, gratuities from families', totalValue: '$1,000 to $2,000+/week' },
]

const whatYouActuallyLearn = [
  {
    skill: 'Crisis Decision Making Under Pressure',
    detail: 'When a camper has an allergic reaction during a hike two miles from the nearest road, you are the first responder. When two campers get into a physical altercation during free swim, you are the one who intervenes. These are not hypothetical scenarios. They are Tuesday. The ability to assess a situation, prioritize safety, and act within seconds is a skill that transfers directly to emergency medicine, management, law enforcement, and any field that involves high-stakes decision making.',
  },
  {
    skill: 'Behavioral Management Without Formal Authority',
    detail: 'You cannot send a camper to detention. You cannot call their parents to pick them up at 2 PM. You are responsible for managing the behavior of 8 to 15 children for 16 hours a day with nothing but your communication skills, your relationship, and your ability to redirect. This is the purest form of leadership training available to someone in their late teens or early twenties.',
  },
  {
    skill: 'Operating on Minimal Sleep and Maximal Accountability',
    detail: 'Residential camp counselors routinely function on 6 to 7 hours of sleep while being responsible for the physical and emotional safety of a group of minors around the clock. The ability to maintain professionalism, patience, and good judgment while tired is a skill that medical residents, new parents, startup founders, and military officers all recognize immediately.',
  },
  {
    skill: 'Designing Engaging Experiences From Scratch',
    detail: 'Rain cancels the outdoor program. The supply shipment is late. A camper with anxiety cannot participate in the planned activity. You improvise. You build a new plan in 10 minutes using whatever is available. This kind of creative problem solving under constraints is exactly what event planners, teachers, product managers, and UX designers do professionally.',
  },
]

const applicationTimeline = [
  { month: 'January to February', action: 'Research camps and submit applications', detail: 'This is when the largest volume of positions open. Browse camp directories (ACA, CampChannel), identify camps that match your interests, and submit applications with a resume, references, and cover letter. Many camps conduct video interviews for out-of-state applicants.' },
  { month: 'March', action: 'Interviews and offers', detail: 'Most camps extend offers by mid-March. Popular camps and specialty roles fill first. If you have not applied by March, your options narrow significantly, especially for residential positions.' },
  { month: 'April', action: 'Accept offer, complete paperwork', detail: 'Background checks, health forms, emergency contact information, and any required certifications (CPR/First Aid, lifeguard) need to be completed before you arrive. Some camps require a physical exam.' },
  { month: 'May', action: 'Pre-camp training (staff week)', detail: 'Residential camps typically bring staff on-site 5 to 10 days before campers arrive for orientation, team building, safety training, activity setup, and practice scenarios.' },
  { month: 'June to August', action: 'Camp is in session', detail: 'This is the actual work period. Day camps usually run weekday hours. Residential camps operate continuously with structured days off for staff.' },
]

const redFlags = [
  'The camp does not have ACA accreditation and cannot explain why',
  'Staff-to-camper ratios exceed 1:10 for general activities or 1:6 for waterfront',
  'There is no pre-camp training period or orientation for new staff',
  'The camp cannot provide proof of liability insurance when asked',
  'Pay is described as "stipend" but the hours worked clearly constitute full-time employment',
  'Days off are described as "flexible" but in practice are rarely granted',
  'Health and safety protocols are vague or nonexistent in the staff manual',
  'Former staff reviews consistently mention unsafe conditions, inadequate food, or hostile management',
]

const whoShouldApply = [
  {
    profile: 'College Students Looking for a Meaningful Summer',
    why: 'Camp counseling builds a resume that stands out. Hiring managers in education, healthcare, management consulting, and client-facing roles consistently rank camp leadership experience above retail or food service work. You also get a built-in community for an entire summer, which is harder to find in most seasonal jobs.',
  },
  {
    profile: 'Education or Social Work Majors',
    why: 'Camp is a practicum in everything your program teaches: child development, behavioral intervention, group facilitation, conflict resolution, and inclusive programming. Many education and social work programs accept camp experience toward practicum or field hours. Confirm with your advisor before committing.',
  },
  {
    profile: 'Gap Year or Career Transition Candidates',
    why: 'If you are between jobs, between degrees, or reconsidering your career direction, a summer at camp gives you time to think while building skills and earning money. The compressed, immersive format accelerates personal growth in a way that few other seasonal positions can match.',
  },
  {
    profile: 'International Applicants on J-1 Visas',
    why: 'The Camp Counselor program through the U.S. Department of State J-1 visa category is specifically designed for international applicants. Sponsor organizations handle placement, and the visa covers the summer employment period plus additional travel time in the U.S.',
  },
]

const faqs = [
  {
    question: 'How much do summer camp counselors actually get paid?',
    answer: 'It depends on the camp type. Day camp counselors earn $12 to $22 per hour, which translates to $480 to $880 per week for a standard 40 hour schedule. Residential camp counselors earn $300 to $700 per week in cash, but receive free housing, meals, and laundry that add $400 to $600 in value per week. Specialty and senior counselors at premium camps can earn $1,000 to $1,500 per week.',
  },
  {
    question: 'When should I apply for summer camp jobs?',
    answer: 'January through March is the primary hiring window. The most desirable positions, especially at well-known residential camps and specialty roles, fill by mid-March. Applying in April or May limits your options to camps that are still filling gaps. Some camps hire on a rolling basis, but early applicants get priority for role selection and session preferences.',
  },
  {
    question: 'What certifications do I need?',
    answer: 'CPR and First Aid certification are required at virtually every camp. If you will be working at a waterfront (pool, lake, or ocean), lifeguard certification is mandatory. Ropes course, archery, horseback riding, and wilderness positions may require activity-specific certifications. Many camps provide or pay for these during pre-camp training, so check before spending your own money.',
  },
  {
    question: 'Is being a camp counselor worth it financially?',
    answer: 'On a pure hourly basis, residential camp pay can look low. But when you factor in zero expenses for housing, food, and transportation for 7 to 10 weeks, the effective savings rate is very high. A counselor earning $500/week at a residential camp who saves 90% of their paycheck will bank $3,500 to $5,000 over the summer. A day camp counselor earning $18/hr who pays rent and food will often save less in the same period.',
  },
  {
    question: 'Do camp counselor jobs help with future employment?',
    answer: 'Significantly. Camp counseling develops leadership, crisis management, communication, adaptability, and team coordination, all of which rank among the most sought-after soft skills in hiring surveys. The role also provides a compelling interview narrative because the stories are vivid and specific. Employers in education, consulting, healthcare, and management consistently rate camp experience favorably.',
  },
  {
    question: 'Can international students work as camp counselors in the U.S.?',
    answer: 'Yes, through the J-1 Camp Counselor visa program administered by the U.S. Department of State. You must apply through an approved sponsor organization, which handles the visa paperwork and camp placement. The visa covers the summer work period plus up to 30 days of travel within the U.S. afterward. This is one of the most accessible work-travel programs available to international applicants.',
  },
]

export default async function SummerCampCounselorJobsPage({ searchParams }: any) {
  const params = await searchParams

   const [{ count }, initialData] = await Promise.all([
  getMergedJobCount(params.what || 'summer camp counselor', params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
  searchMergedJobs({ what: params.what || 'summer camp counselor', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {count > 0 ? count.toLocaleString() : 'Hundreds of'} Summer Camp Counselor Jobs Available Across the United States
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="summer camp counselor" />
          </aside>
          <div className="flex-1">
            {count > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">{count.toLocaleString()}</span> positions available
              </p>
            )}
            <AIJobMatcherWrapper />
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList what={params.what || 'summer camp counselor'} where={params.where || ''} salary_min={params.salary_min} initialData={initialData} />
            </Suspense>
          </div>
        </div>

        {/* ── CAMP TYPES ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Sun className="w-7 h-7 text-amber-500" />
            <h2 className="text-2xl font-bold text-gray-900">Four Types of Camp Counselor Positions and What Each One Involves</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            The term "camp counselor" covers positions that range from a 9 to 5 local day job to living in a cabin with ten children for two months straight. Understanding the four main categories helps you apply for the right type and set accurate expectations for your summer.
          </p>
          <div className="space-y-4">
            {campTypes.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <h3 className="font-bold text-gray-900 text-lg mb-3">{item.type}</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-gray-500">Schedule</p>
                    <p className="font-medium text-gray-800">{item.schedule}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Pay</p>
                    <p className="font-medium text-green-700">{item.pay}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Housing</p>
                    <p className="font-medium text-gray-800">{item.housing}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Commitment</p>
                    <p className="font-medium text-gray-800">{item.commitment}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{item.bestFor}</p>
                <p className="text-sm text-amber-700">{item.consideration}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── DAILY SCHEDULE ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">What a Day Actually Looks Like at a Residential Camp</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Job listings describe the role in broad terms. Here is the hour-by-hour reality of a residential camp counselor's day. The pace is relentless but structured, and every hour serves a purpose in the camper experience.
          </p>
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="space-y-4">
              {dailyScheduleResidential.map((item, i) => (
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
            Schedules vary by camp. Day camps follow a standard workday structure. The schedule above reflects a typical residential camp weekday.
          </p>
        </section>

        {/* ── PAY COMPARISON ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Camp Counselor Pay: Cash vs. Total Compensation</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Residential camp pay looks low until you account for the value of free housing and meals. A counselor earning $400/week at a sleepaway camp with zero living expenses can save more over the summer than a day camp counselor earning $18/hr who pays rent and buys groceries. The table below breaks down what each category actually delivers.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {payComparison.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-2">{item.category}</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-500">Weekly Cash Pay</p>
                    <p className="font-medium text-gray-800">{item.weeklyPay}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Additional Perks</p>
                    <p className="font-medium text-gray-800">{item.perks}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Estimated Total Weekly Value</p>
                    <p className="font-bold text-green-700">{item.totalValue}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── WHAT YOU ACTUALLY LEARN ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Four Skills You Build That No Other Summer Job Teaches</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The professional development value of camp counseling is underestimated because the setting is informal. But the skill set it produces is anything but casual. Here is what the experience actually trains you to do, described in terms that translate directly to post-camp career conversations.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {whatYouActuallyLearn.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 font-bold rounded-full text-sm mb-4">{index + 1}</span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.skill}</h3>
                <p className="text-gray-600 text-sm">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── APPLICATION TIMELINE ── */}
        <section className="mt-20 bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <FileText className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">The Hiring Timeline: When to Apply and What to Expect</h2>
              <p className="text-gray-700 mb-6">
                Camp hiring follows a predictable annual cycle. Applying at the right time is as important as having the right qualifications. Here is the month-by-month breakdown of how the process works.
              </p>
              <div className="space-y-4">
                {applicationTimeline.map((item, i) => (
                  <div key={i} className="bg-white rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-amber-100 text-amber-700 font-bold rounded-full text-xs flex-shrink-0 mt-0.5">{i + 1}</span>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{item.month}: {item.action}</p>
                        <p className="text-gray-600 text-sm mt-1">{item.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── WHO SHOULD APPLY ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Who Thrives as a Camp Counselor</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Camp counseling is not for everyone. The hours are long, the privacy is limited, and the emotional demands are real. But for the right person, it is the most formative summer job available. Here are the profiles of people who tend to get the most out of it.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {whoShouldApply.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.profile}</h3>
                <p className="text-gray-600 text-sm">{item.why}</p>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Red Flags When Evaluating a Camp Employer</h2>
                <p className="text-gray-700 mb-4">
                  Most camps operate responsibly, but the industry includes a wide range of organizations. The following warning signs indicate a camp that may not prioritize staff wellbeing or camper safety.
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

        {/* ── FAQ ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Summer Camp Counselor Jobs</h2>
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
            <strong>Disclaimer:</strong> Oh My Job is an independent job search platform and is not affiliated with, endorsed by, or connected to any camp, camp organization, or employer listed on this page. Job listings are sourced from third-party APIs and partner networks. Salary figures are estimates based on publicly available data from ZipRecruiter, Salary.com, Indeed, and the American Camp Association and may not reflect specific offers. Camp accreditation status, certification requirements, and visa eligibility vary by organization and jurisdiction. Verify all details directly with the hiring camp before making employment or travel decisions. This page is for informational purposes only and does not constitute career, legal, or financial advice.
          </p>
        </section>
      </div>
    </>
  )
}