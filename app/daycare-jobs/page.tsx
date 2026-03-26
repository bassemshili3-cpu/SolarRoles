import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, DollarSign, CheckCircle, Shield, TrendingUp, Users, Award, FileText, Heart, BookOpen } from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Daycare Jobs — Teacher, Assistant, Director & Before/After School Openings',
  description: 'Search daycare jobs at licensed centers, Head Start programs, and private preschools. Filter by age group, credential level, and schedule — new listings posted from every US state daily.',
  keywords: 'daycare jobs, daycare teacher hiring, childcare assistant openings, daycare director salary, infant room jobs, preschool teacher positions, before after school counselor, CDA credential jobs',
  openGraph: {
    title: 'Daycare Jobs: Infant Room to Center Director Roles | Oh My Job',
    description: 'Find daycare jobs that match your credentials and preferred age group. Compare pay, benefits, and center philosophy before you apply — openings at chains and independents alike.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daycare Jobs — Openings at Licensed Centers Nationwide',
    description: 'Lead teacher, assistant, inclusion aide, or director — search daycare jobs by zip code and age group. Part-time and full-time schedules available.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/daycare-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Daycare Jobs Board',
  description: 'Daily-refreshed feed of daycare jobs spanning infant-care, toddler, preschool, and school-age programs at licensed childcare centers, Head Start sites, and private preschools across all fifty states.',
  url: 'https://www.oh-my-job.com/daycare-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Active Daycare Job Listings',
    description: 'Searchable directory of daycare jobs from entry-level classroom aide to center-director and program-coordinator positions.',
  },
}

const popularRoles = [
  {
    title: 'Infant & Toddler Room Teacher',
    description: 'Manage a classroom of children aged six weeks to thirty months — feeding, diapering, tracking developmental milestones, and designing sensory-rich activities that build attachment security and early motor skills.',
  },
  {
    title: 'Preschool Lead Teacher',
    description: 'Plan weekly lesson cycles aligned with your state\'s early-learning standards, run circle time and small-group rotations, assess kindergarten readiness, and write progress reports shared with families each quarter.',
  },
  {
    title: 'Classroom Assistant / Aide',
    description: 'Support the lead teacher during transitions, meals, and outdoor play. Prepare craft materials, sanitize surfaces between activities, and step in as primary caregiver when ratios require a second adult in the room.',
  },
  {
    title: 'Before & After School Counselor',
    description: 'Supervise school-age children from drop-off through the morning bell and again from dismissal through evening pickup — running homework clubs, gym games, and art projects in a licensed out-of-school-time program.',
  },
  {
    title: 'Center Director / Program Administrator',
    description: 'Own the P&L, enrollment pipeline, staffing schedule, licensing-inspection readiness, and family-communication strategy for an entire center — the person the state auditor and every parent calls first.',
  },
  {
    title: 'Inclusion Aide / Special Needs Support',
    description: 'Provide one-on-one or small-group support to children with IEPs or developmental delays, adapting classroom activities so they can participate alongside peers while meeting therapy goals set by the child\'s care team.',
  },
]

const jobOutlookData = [
  { label: '10-Year Growth Projection', value: '6%', detail: 'Matching the all-occupations average through 2033' },
  { label: 'Yearly Openings Nationwide', value: '174,800', detail: 'Mostly from turnover — workers leaving for K-12 or other fields' },
  { label: 'Employed Childcare Workers', value: '1.4M', detail: 'The fourth-largest care-economy workforce in the US' },
]

const salaryData = [
  { role: 'Childcare Worker / Aide', salary: '$31,800', note: 'BLS national median — entry point with no degree required' },
  { role: 'Preschool Lead Teacher', salary: '$38,500', note: 'BLS median — CDA or associate degree typically expected' },
  { role: 'Center Director', salary: '$52,400', note: 'BLS median — ranges from $40K (small private) to $75K+ (chain/Head Start)' },
]

const requirements = [
  {
    title: 'Education & Credentials',
    items: [
      'High school diploma or GED is the minimum for most aide and assistant roles — no degree needed to start',
      'Child Development Associate (CDA) credential opens the door to lead-teacher positions in nearly every state',
      'Associate or bachelor\'s in Early Childhood Education required for Head Start lead teachers and many state Pre-K programs',
      'Specific child-development coursework hours mandated by some states even for non-degreed workers',
    ],
  },
  {
    title: 'Background Clearances & Safety Certs',
    items: [
      'Pediatric CPR and First Aid — required before your first unsupervised shift at virtually every licensed center',
      'Federal FBI fingerprint check plus state criminal-history clearance',
      'Child Abuse History Clearance (separate from criminal check in most states)',
      'Mandated Reporter training — legally required in all 50 states for anyone working with children in a licensed setting',
    ],
  },
]

const stateRegulations = [
  { aspect: 'Who Issues the License', detail: 'Your state\'s Department of Health, Education, or Social Services — the agency name varies but the function is the same: annual inspections, ratio enforcement, and complaint investigations.' },
  { aspect: 'Staff-to-Child Ratios', detail: 'The tightest ratios apply to the youngest children: federal Head Start standards call for 1 adult per 4 infants, 1:5 for toddlers, and 1:10 for preschoolers. Many states set stricter numbers than the federal floor.' },
  { aspect: 'Minimum Working Age', detail: 'Most states require childcare employees to be at least 16 for aide roles and 18 for any position with sole-supervision responsibility. Some states set the floor at 18 across the board.' },
  { aspect: 'Annual Training Hours', detail: 'Expect 15 to 24 hours of state-approved continuing education per year covering topics like safe sleep, allergy management, trauma-informed care, and developmental screening.' },
]

const applicationTips = [
  {
    title: 'Get CPR and First Aid Done Before You Apply',
    description: 'A current pediatric CPR/First Aid card removes the most common hiring bottleneck in daycare jobs. Centers can place you on the floor immediately instead of waiting weeks for a certification class to open up — and that speed-to-start is often the tiebreaker between two otherwise equal candidates.',
  },
  {
    title: 'Name the Age Groups You Have Worked With',
    description: 'Infant care, toddler classrooms, and Pre-K programs require different skill sets. Saying "I have 18 months of experience in a toddler room with a 1:5 ratio" gives the director a precise picture of where you fit — which is far more useful than a generic "I love working with kids."',
  },
  {
    title: 'Ask About the Center\'s Curriculum Approach',
    description: 'Montessori, Reggio Emilia, HighScope, play-based, and academic-readiness models each structure the teacher\'s day differently. Mentioning the center\'s approach by name in your cover letter — and explaining why it appeals to you — proves you researched the program instead of mass-applying.',
  },
  {
    title: 'Start the CDA Process Now, Even If You Have Not Finished',
    description: 'You do not need to hold the credential before applying. Many directors will hire a candidate who can say "I am 60 hours into my CDA coursework and expect to sit for the exam in three months" because it signals long-term commitment to the profession and eliminates a future training cost for the center.',
  },
]

const faqs = [
  {
    question: 'What qualifications do I actually need to start working daycare jobs?',
    answer: 'For aide and assistant roles at most licensed centers, the baseline is a high school diploma, a clean background check, and a current pediatric CPR/First Aid card. That is enough to get on the classroom floor in the majority of states. Lead-teacher positions raise the bar — most states require a CDA credential, an associate degree, or a specific number of college credits in child development. Director roles add administrative coursework or a state-issued Director Credential on top of the education requirements.',
  },
  {
    question: 'How much do daycare jobs pay — and why is the range so wide?',
    answer: 'The BLS national median for childcare workers is about $31,800 per year, which works out to roughly $15.30 an hour. But that median masks enormous variation. A private home-based daycare in a rural county might pay $12/hr with no benefits, while a Head Start center or public Pre-K program in a metro area can pay $18-$22/hr with full health coverage and a pension. Credentials drive pay too: holding a CDA or associate degree typically adds $2-$4/hr over the no-degree baseline at the same center.',
  },
  {
    question: 'Am I legally required to report suspected child abuse if I work at a daycare?',
    answer: 'Yes, without exception. Every state classifies childcare workers as mandatory reporters under its child-protection statutes. If you have reasonable cause to suspect abuse or neglect, you are required by law to file a report with your state\'s child-protective-services hotline — typically within 24 to 48 hours. Failure to report can result in criminal penalties. Most states require you to complete a Mandated Reporter training module before or shortly after your first day of work.',
  },
  {
    question: 'Is the job market for daycare jobs growing or shrinking?',
    answer: 'Growing at about the national average. The BLS projects a 6% increase in childcare-worker employment between 2023 and 2033, driven by working-parent demand for licensed care. But the bigger hiring driver is turnover: roughly 174,800 positions open each year because workers leave for K-12 teaching, healthcare, or non-childcare fields. That churn means centers are almost always hiring — the challenge for the industry is retention, not a lack of open seats.',
  },
  {
    question: 'Do daycare centers test for drugs during the hiring process?',
    answer: 'Many do, especially centers that receive federal funding (Head Start, CCDF subsidy programs) or operate under corporate-chain policies. Pre-employment drug screens are the most common, but some employers also conduct random testing throughout employment. Requirements vary by state and by individual center policy — the job posting or offer letter will specify if a drug screen is part of the clearance process.',
  },
  {
    question: 'Can I get a daycare job with no degree and no prior childcare experience?',
    answer: 'Yes — and it happens every day. Entry-level aide and assistant positions at most licensed centers require only a high school diploma and the willingness to complete CPR, background checks, and on-the-job training. If you have any experience caring for children — babysitting, camp counseling, coaching, tutoring, or even helping raise younger siblings — mention it specifically. Directors hire for warmth, reliability, and patience first; credentials and technique can be taught.',
  },
]

export default async function DaycareJobsPage({ searchParams }: any) {
  const params = await searchParams

 const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'daycare jobs', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'daycare jobs', where: params.where || '', results_per_page: 30, page: 1 })
  .then((data: AdzunaSearchResult) => ({ ...data, results: data.results.map(normalizeAdzuna) })),
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-6 py-12">

        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Daycare Jobs — Infant Room, Preschool, School-Age & Director Openings Nationwide
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
           <JobFilters defaultWhat="daycare jobs" />
          </aside>
          <div className="flex-1">

            {count > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">{count.toLocaleString()}</span> positions available
              </p>
            )}

            <AIJobMatcherWrapper />

            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'daycare jobs'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Job Outlook */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-900">Hiring Outlook for Daycare Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The childcare workforce is the fourth-largest care-economy segment in the United States, employing roughly 1.4 million people. Demand is underpinned by a structural reality: as long as parents work, someone needs to care for their children during business hours. But the story behind the numbers is less about growth and more about churn — the BLS projects a healthy 6% employment increase through 2033, yet nearly 175,000 positions open every single year because workers leave for K-12 teaching, healthcare, or better-paying service jobs. For applicants, that turnover is an opportunity: daycare jobs are among the easiest care-sector roles to land quickly, especially if you arrive with CPR certification and a clean background check already in hand.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {jobOutlookData.map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{item.label}</p>
                <p className="text-emerald-600 text-2xl font-medium">{item.value}</p>
                <p className="text-gray-500 text-sm mt-1">{item.detail}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Source: U.S. Bureau of Labor Statistics, Occupational Outlook Handbook — Childcare Workers, 2024 edition
          </p>
        </section>

        {/* Popular Roles */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-7 h-7 text-rose-500" />
            <h2 className="text-2xl font-bold text-gray-900">Six Core Positions Inside Daycare Jobs Listings</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            A single daycare center can employ half a dozen different role types depending on its license capacity and the age groups it serves. The responsibilities — and the credentials required — shift significantly from room to room. An infant-room teacher spends most of her day on feeding schedules and safe-sleep checks; a preschool lead is writing lesson plans and assessing kindergarten readiness. Understanding these differences before you apply ensures you target the classroom where your experience and temperament fit best.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularRoles.map((role, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <Users className="w-10 h-10 text-rose-400 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Salary */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">What Daycare Jobs Pay — And What Drives the Gap</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              Childcare pay is notoriously variable. A home-based daycare aide in a rural county and a Head Start lead teacher in a metro school district both fall under "daycare jobs," yet their compensation can differ by $15,000 or more. Three factors explain most of the gap: employer type (public-school-affiliated and Head Start programs pay the most, small private centers the least), credentials (holding a CDA or associate degree adds $2-$4/hr at the same employer), and geography (states with higher minimum wages and cost-of-living naturally push hourly rates up). The BLS medians below are a starting point — always check the specific posting for the center's actual range.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {salaryData.map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-5 text-center">
                  <p className="text-3xl font-bold text-green-600 mb-1">{item.salary}</p>
                  <p className="font-semibold text-gray-900 text-sm">{item.role}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.note}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics, May 2024 release
            </p>
          </div>
        </section>

        {/* Requirements */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <FileText className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div className="w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What You Need to Qualify for Daycare Jobs</h2>
              <p className="text-gray-700 mb-6">
                Qualification bars for daycare jobs are set by a combination of state licensing rules and individual center policies — not a single national standard. The good news is that the entry point is low: a high school diploma, a background check, and a willingness to learn can get you into an aide seat. From there, each credential you add opens the next tier. Here is what the two main qualification categories look like.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                {requirements.map((section, i) => (
                  <div key={i} className="bg-white rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-3">{section.title}</h3>
                    <ul className="space-y-2">
                      {section.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* State Regulations */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Licensing Rules That Shape Every Daycare Job</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Every licensed childcare center in the US operates under a state-issued license that dictates staff-to-child ratios, worker age minimums, annual training requirements, and health-and-safety protocols. These rules are not optional — violating them can result in fines, probation, or license revocation. As a daycare employee, you will interact with these regulations daily, from counting heads after outdoor play to logging your continuing-education hours. Here are the four regulatory pillars that matter most.
          </p>
          <div className="space-y-3">
            {stateRegulations.map((item, i) => (
              <div key={i} className="flex gap-4 bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                <div className="flex-shrink-0 w-2 rounded-full bg-indigo-200 self-stretch" />
                <div>
                  <p className="font-semibold text-gray-900 mb-1">{item.aspect}</p>
                  <p className="text-gray-600 text-sm">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Source: U.S. Department of Health and Human Services, Office of Child Care — childcare.gov
          </p>
        </section>

        {/* Certifications */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-amber-500" />
            <h2 className="text-2xl font-bold text-gray-900">Three Credentials That Unlock Higher-Paying Daycare Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            In a field where many applicants share the same baseline qualifications, a recognized credential is the clearest way to move from aide pay to lead-teacher or director-level compensation. Each one below targets a different rung on the career ladder — choose the one that matches where you want to be in two years.
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                name: 'Child Development Associate (CDA)',
                org: 'Council for Professional Recognition',
                desc: 'The most portable entry-level credential in early childhood education — recognized in all 50 states and often the minimum requirement for lead-teacher roles. Requires 120 hours of formal training, 480 hours of childcare experience, and a verification visit. Many employers sponsor the $425 application fee.',
              },
              {
                name: 'Associate Degree in ECE',
                org: 'Accredited Community Colleges',
                desc: 'A two-year program covering child development theory, curriculum design, family engagement, and inclusive practices. Graduates qualify for lead-teacher positions at most licensed centers and meet the educational requirement for Head Start classroom staff.',
              },
              {
                name: 'State Director Credential',
                org: 'Varies by State Child Care Agency',
                desc: 'Required to serve as the licensed administrator of a childcare center in most states. Criteria typically combine college coursework in business or ECE administration with a minimum number of years directing or managing a licensed program.',
              },
            ].map((cert, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <BookOpen className="w-8 h-8 text-amber-500 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">{cert.name}</h3>
                <p className="text-xs text-amber-600 font-medium mb-2">{cert.org}</p>
                <p className="text-gray-600 text-sm">{cert.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Application Tips */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Four Moves That Get You Hired Faster for Daycare Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Centers are almost always hiring, but the candidates who get placed within days — rather than weeks — share a few habits that reduce the director's risk and onboarding time. Here is the playbook.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {applicationTips.map((tip, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 font-bold rounded-full text-sm mb-4">
                  {i + 1}
                </span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{tip.title}</h3>
                <p className="text-gray-600 text-sm">{tip.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Daycare Jobs — Straight Answers to Common Questions</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Whether you are considering your first daycare position or weighing a move from K-12 back into early childhood, these are the practical questions that come up most — answered with data and without the fluff.
          </p>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
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

        {/* Disclaimer */}
        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> Salary figures, credential requirements, and labor-market projections on this page are compiled from the U.S. Bureau of Labor Statistics (Occupational Employment & Wage Statistics, Occupational Outlook Handbook), the U.S. Department of Health and Human Services (Office of Child Care), and publicly available state licensing resources. Childcare regulations, pay scales, and hiring standards for daycare jobs vary by state, employer type, and individual center policy. Always verify current requirements with your state child-care licensing agency and the hiring employer before applying.
          </p>
        </section>

      </div>
    </>
  )
}