import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
import { Briefcase, Clock, Heart, DollarSign, GraduationCap, CheckCircle, Users, Award, Coffee, Calendar, Star, HelpCircle } from 'lucide-react'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Chick-fil-A Careers — Team Member, Kitchen, Shift Lead & Manager Openings',
  description: 'Chick-fil-A posts front counter, kitchen, and director roles by Operator location. Filter by zip code, shift preference, and pay range.',
  keywords: 'chick-fil-a careers, chick-fil-a team member jobs, chick-fil-a shift leader, chick-fil-a kitchen jobs, chick-fil-a hiring near me, chick-fil-a manager salary, chick-fil-a apply',
  openGraph: {
    title: 'Chick-fil-A Careers: Front Counter to Director Roles | Oh My Job',
    description: 'Find chick-fil-a careers that match your schedule. Sundays off, scholarship access, and a promotion track that moves fast — search openings by location and apply today.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chick-fil-A Careers — Openings Updated Weekly',
    description: 'Team member, drive-thru, kitchen, or leadership — search chick-fil-a careers near you with transparent pay ranges and schedule details.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/chick-fil-a-careers',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Chick-fil-A Careers Board',
  description: 'Searchable feed of chick-fil-a careers across Operator-owned locations nationwide. Covers entry-level team-member roles through salaried restaurant-director positions.',
  url: 'https://www.oh-my-job.com/chick-fil-a-careers',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Current Chick-fil-A Career Openings',
    description: 'Live directory of chick-fil-a careers at franchise locations in all fifty states, refreshed weekly.',
  },
}

const jobTypes = [
  { title: 'Front-of-House Team Member', description: 'Greet guests at the counter and in the dining room, take orders with accuracy, assemble trays, and reset tables — all while delivering the signature "my pleasure" hospitality standard.', icon: Users },
  { title: 'Drive-Thru & Curbside Specialist', description: 'Manage the outdoor ordering lane that generates the majority of revenue at most locations — taking headset orders, running food to cars, and keeping wait times under the Operator\'s target.', icon: Clock },
  { title: 'Back-of-House Kitchen Team', description: 'Bread and pressure-fry chicken filets, prep produce, maintain oil quality, and keep ticket times tight during peak windows — the engine room of every Chick-fil-A restaurant.', icon: Coffee },
  { title: 'Cashier & Mobile-Order Coordinator', description: 'Process register transactions, handle mobile and third-party delivery pickups, reconcile the drawer at shift close, and troubleshoot POS issues on the fly.', icon: DollarSign },
  { title: 'Shift Leader', description: 'Run the floor during your assigned daypart — directing team-member positioning, monitoring food safety temps, resolving guest complaints, and closing out the register bank.', icon: Award },
  { title: 'Restaurant Director / General Manager', description: 'Partner with the Operator on labor scheduling, food-cost controls, local marketing, and team development while owning day-to-day operational execution across all dayparts.', icon: Briefcase },
]

const benefits = [
  { benefit: 'Guaranteed Sundays Off', description: 'Every Chick-fil-A location closes on Sunday — a guaranteed weekly day off that is rare in the QSR industry and a major draw for work-life balance.' },
  { benefit: 'Remarkable Futures Scholarships', description: 'Team members can apply for $1,000 to $25,000 in tuition assistance regardless of their major, funded by a program that has distributed over $136 million since 1973.' },
  { benefit: 'Schedule Built Around Your Life', description: 'Operators publish shifts one to two weeks out and typically accommodate school, sports, or second-job conflicts — making this one of the most flexible QSR employers for students.' },
  { benefit: 'Free Shift Meals', description: 'Most Operators provide a complimentary meal every shift — a tangible daily savings that adds up to hundreds of dollars per year for part-time and full-time crew alike.' },
  { benefit: 'Structured Leadership Training', description: 'Chick-fil-A invests in multi-week training pathways that teach food safety, conflict resolution, and operational management — skills that transfer to any future employer.' },
  { benefit: 'Culture of Genuine Care', description: 'The Operator model means you work for a local business owner who knows your name — not a distant corporate office — which consistently translates into higher team-member satisfaction scores.' },
]

const applicationSteps = [
  { step: 'Search by Location', description: 'Use your zip code to find which nearby Chick-fil-A restaurants have open positions. Each location hires independently, so availability varies street by street.' },
  { step: 'Complete the Application', description: 'Fill out a short online form with your contact info, availability grid, and any prior work experience. Most applications take under ten minutes.' },
  { step: 'Interview With the Operator or Leader', description: 'Expect a face-to-face conversation — often one-on-one with the Operator or a senior director. Chick-fil-A interviews focus on attitude and reliability more than resume credentials.' },
  { step: 'Background Screening', description: 'Some Operators run a basic background check before extending an offer, especially for shift-leader and management candidates.' },
  { step: 'Training and First Shift', description: 'New hires complete a paid onboarding program covering food safety, POS operation, and hospitality standards before their first solo shift on the floor.' },
]

const faqs = [
  {
    question: 'How old do you have to be to start a chick-fil-a career?',
    answer: 'Federal law allows employment at 14 for non-hazardous work, but the vast majority of Chick-fil-A Operators set their minimum hiring age at 16 because of equipment restrictions (pressure fryers, slicers) and state-level labor regulations. A small number of locations in states with more permissive youth-employment laws will hire 14- and 15-year-olds for front-counter-only roles with limited hours. Management positions universally require applicants to be 18 or older.',
  },
  {
    question: 'How does the Remarkable Futures Scholarship actually work?',
    answer: 'Any Chick-fil-A team member — part-time or full-time — can apply once per year. Awards range from a $1,000 True Inspiration scholarship to a $25,000 Leadership Scholarship, and the money can be used at any accredited two- or four-year institution regardless of major. Since 1973 the program has awarded over $136 million, making it one of the largest employer-funded education initiatives in the restaurant industry.',
  },
  {
    question: 'What hours does a typical Chick-fil-A operate?',
    answer: 'Most locations open between 6:00 and 6:30 AM and close around 10:00 PM, Monday through Saturday. Every Chick-fil-A is closed on Sunday — no exceptions. Shift lengths typically run four to eight hours, and Operators generally ask team members to commit to at least two or three shifts per week, though true part-time flexibility is a hallmark of chick-fil-a careers.',
  },
  {
    question: 'What does Chick-fil-A pay compared to other fast-food chains?',
    answer: 'Team-member pay varies by Operator and metro area, but the range for most markets falls between $13 and $18 per hour — often a dollar or two above competing QSR brands in the same zip code. Shift leaders typically earn $16 to $22 per hour, and salaried directors can reach $50K to $70K annually. Because Operators set their own pay scales, the best way to confirm rates is to ask during the application or interview.',
  },
  {
    question: 'What should I wear and bring to a Chick-fil-A interview?',
    answer: 'Business-casual is the sweet spot: clean khakis or slacks, a tucked-in collared shirt, and closed-toe shoes. Leave the ripped jeans, athleisure, and graphic tees at home. Bring a printed copy of your resume (even if you applied online) and a list of two or three references. Arriving five minutes early and greeting the team with eye contact and a firm handshake goes a long way — Operators evaluate hospitality instincts from the moment you walk in.',
  },
  {
    question: 'Do I need any experience to get hired?',
    answer: 'Not for team-member or kitchen roles. Chick-fil-A runs one of the most thorough paid-training programs in the QSR industry, so Operators hire primarily on attitude, reliability, and coachability. If you have never held a job before, you are in good company — a large share of Chick-fil-A hires are first-time workers, especially high-school students. Shift-leader and director roles do expect some prior food-service or supervisory experience.',
  },
]

const interviewTips = [
  {
    title: 'Visit the Restaurant Before Your Interview',
    description: 'Order a meal, observe the team\'s energy, and note one specific thing the location does well. Mentioning it during the conversation shows the Operator you did your homework and signals genuine interest — not just a need for any paycheck.',
  },
  {
    title: 'Lead With Hospitality Examples, Not Just Work History',
    description: 'Chick-fil-A hires for warmth first. If your only experience is school or volunteering, talk about a time you helped someone under pressure — tutoring a classmate before an exam, organizing a fundraiser, or calming a frustrated parent at a sports event. Those stories resonate more than listing register skills.',
  },
  {
    title: 'Be Specific About Your Availability',
    description: 'Operators build schedules around coverage gaps. Saying "I can work opens Monday through Wednesday and any closing shift on Friday and Saturday" is vastly more useful than "I\'m pretty flexible." The more concrete your availability, the easier it is for the Operator to slot you in — and the faster the offer comes.',
  },
  {
    title: 'Prepare a STAR Answer for "Tell Me About a Conflict"',
    description: 'Behavioral questions are standard at Chick-fil-A. Have one polished story ready using the Situation-Task-Action-Result framework — ideally about resolving a disagreement or handling an unhappy person. Keep it under 90 seconds and end on a positive outcome.',
  },
]

export default async function ChickFilACareersPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'chick-fil-a', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'chick-fil-a', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
  ])


  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Simple Header */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Chick-fil-A Careers — Team Member, Kitchen, Drive-Thru & Leadership Openings
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="chick-fil-a" />
          </aside>
          <div className="flex-1">

            <AIJobMatcherWrapper />
            
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'chick-fil-a'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Why Work at Chick-fil-A Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-7 h-7 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">What Makes Chick-fil-A Careers Different From Other QSR Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Chick-fil-A operates under a franchise model that is unlike any other major chain. Each restaurant is run by a single Operator who personally invested in a selection process, not just a franchise fee — which means your direct boss is a small-business owner with skin in the game, not a regional manager three states away. That ownership structure is the reason chick-fil-a careers consistently score higher in team-member satisfaction surveys than comparable fast-food employers. Add in guaranteed Sundays off, an industry-leading scholarship fund, and a promotion culture that regularly moves crew members into leadership within twelve months, and the appeal is concrete — not just corporate marketing.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{item.benefit}</p>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Job Types Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Positions You Will Find in Chick-fil-A Careers Listings</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            A single Chick-fil-A location staffs six core roles, each with a distinct rhythm and skill emphasis. Understanding the differences before you apply helps you target the position where your natural strengths shine — and signals to the Operator that you know what you are signing up for, which immediately sets you apart from applicants who just check "any position."
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobTypes.map((job, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <job.icon className="w-10 h-10 text-red-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{job.title}</h3>
                <p className="text-gray-600 text-sm">{job.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Application Process Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">How Hiring Works for Chick-fil-A Careers</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Because every Chick-fil-A is independently operated, the Operator — not a corporate HR department — makes every hiring decision. That means the process is personal, fast, and highly localized. Here is the typical sequence from search to first shift.
          </p>
          <div className="space-y-4">
            {applicationSteps.map((item, index) => (
              <div key={index} className="flex items-start gap-4 bg-white border border-gray-200 rounded-xl p-5">
                <span className="inline-flex items-center justify-center w-10 h-10 bg-green-100 text-green-700 font-bold rounded-full text-lg flex-shrink-0">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{item.step}</h3>
                  <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Scholarship Program Section */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <GraduationCap className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">The Scholarship Advantage of Chick-fil-A Careers</h2>
              <p className="text-gray-700 mb-4">
                Few QSR employers can match what Chick-fil-A puts behind education funding. The Remarkable Futures Scholarship is open to every team member — part-time closers and full-time directors alike — and the money follows you to any accredited school in any field of study. For students balancing tuition bills with work schedules, this single benefit can offset thousands of dollars in annual education costs and is often the deciding factor when choosing between competing fast-food offers.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-blue-600 mb-2">$136M+</p>
                  <p className="text-sm text-gray-600">Awarded to Team Members Since 1973</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-blue-600 mb-2">$25,000</p>
                  <p className="text-sm text-gray-600">Maximum Leadership Scholarship</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-blue-600 mb-2">Any Major</p>
                  <p className="text-sm text-gray-600">No Field-of-Study Restriction</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-6">
                Applications open annually and are evaluated on leadership, community involvement, and academic commitment — not GPA cutoffs. Team members who have worked at least 20 hours per week for a qualifying period are eligible.
              </p>
            </div>
          </div>
        </section>

        {/* Interview Tips Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-7 h-7 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Four Ways to Stand Out in a Chick-fil-A Interview</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Chick-fil-A Operators often say they hire the person, not the resume. That sounds vague until you realize what it means in practice: they are watching how you treat the team members you pass on the way in, whether you make eye contact, and how you respond to an unexpected question. These four moves help you project the warmth and reliability they are scanning for.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {interviewTips.map((tip, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-yellow-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-yellow-100 text-yellow-700 font-bold rounded-full text-sm mb-4">
                  {index + 1}
                </span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{tip.title}</h3>
                <p className="text-gray-600 text-sm">{tip.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Age Requirements Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Age Requirements & Work Permits for Chick-fil-A Careers</h2>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-4">
              Age minimums for chick-fil-a careers depend on two factors: federal labor law (which sets the floor at 14 for non-hazardous work) and the individual Operator's policy (which is usually stricter). Most locations require team members to be at least 16 because pressure fryers and commercial slicers are classified as hazardous equipment under the Fair Labor Standards Act. Here is how the age brackets typically break down.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="bg-white rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Hiring Age by Role</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Front-counter and dining-room roles: 16+ at most locations (some states allow 14-15 for limited duties)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Kitchen and drive-thru positions: 16+ universally due to equipment restrictions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Shift leader and management: 18+ required at every Chick-fil-A location</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Work Permit Details for Minors</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Most states require a work permit for employees under 16 — your school guidance office typically issues them</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Federal law caps work at 3 hours on school days and 18 hours per school week for 14-15 year olds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Some states impose stricter limits — check your state labor department page before applying</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Pay and Compensation Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">What Chick-fil-A Careers Pay in Practice</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              Because every Chick-fil-A is independently operated, the Operator sets pay — not a corporate wage grid. In practice, that means hourly rates at a busy urban location can be several dollars higher than at a smaller suburban restaurant twenty minutes away. The ranges below reflect what most markets currently offer, but the best way to confirm is to ask during the interview. Many Operators also layer on shift-meal benefits and periodic performance bonuses that do not show up in the advertised hourly rate.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">$13 – $18</p>
                <p className="text-sm text-gray-600">Team Member Hourly Range</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">$16 – $22</p>
                <p className="text-sm text-gray-600">Shift Leader Hourly Range</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">$48K – $70K</p>
                <p className="text-sm text-gray-600">Director / Manager Annual Salary</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Ranges compiled from BLS fast-food wage data and Operator-reported figures. Actual pay is determined by the individual Operator based on local market conditions, your experience, and role responsibilities.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Chick-fil-A Careers — Questions People Ask Before Applying</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Whether this is your first job ever or you are comparing chick-fil-a careers against other QSR offers, these are the practical questions that come up most — answered without the corporate spin.
          </p>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group bg-white border border-gray-200 rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                  <h3 className="font-semibold text-gray-900 pr-4">{faq.question}</h3>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Legal Disclaimer */}
        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> Oh My Job is an independent job search platform with no affiliation to Chick-fil-A, Inc., CFA Properties, Inc., or any individual Chick-fil-A Operator. "Chick-fil-A" is a registered trademark of CFA Properties, Inc. Each Chick-fil-A restaurant is independently owned and operated by a franchised Operator who sets their own pay rates, benefit offerings, scheduling policies, and hiring criteria. The information on this page — including salary ranges, scholarship details, and age requirements — is compiled from publicly available sources and may not reflect the specific terms at every location. Always confirm employment details directly with the Operator at your target restaurant.
          </p>
        </section>
      </div>
    </>
  )
}