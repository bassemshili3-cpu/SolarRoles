import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, DollarSign, AlertTriangle, Heart, Users, TrendingUp, GraduationCap, Building2 } from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Childcare Jobs Hiring Now | Daycare, Preschool & Nanny Positions',
  description: 'Daycare teachers, preschool leads, and center directors — childcare roles in every state with salary ranges listed. CDA credentials earn more.',
  keywords: 'childcare jobs, childcare jobs near me, daycare jobs, preschool teacher jobs, childcare worker jobs, nanny jobs, childcare assistant jobs 2026',
  openGraph: {
    title: 'Childcare Jobs | Daycare, Preschool & Nanny Positions Hiring Now',
    description: 'Thousands of childcare positions open. Daycare assistants, lead teachers, preschool directors, nannies. Apply today.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Childcare Jobs 2026 | Centers, Schools & Private Families',
    description: 'Browse childcare positions across the US. Entry-level to director. CDA and degree holders earn premium pay.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/childcare-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Childcare Jobs',
  description: 'Find childcare jobs hiring across the United States. Daycare, preschool, nanny, and after-school positions.',
  url: 'https://www.oh-my-job.com/childcare-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Childcare Jobs',
    description: 'Current childcare, daycare, and early childhood education job listings',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How much do childcare workers make in 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Daycare assistants earn $13 to $17 per hour. Lead teachers with a CDA credential earn $15 to $22 per hour. Preschool teachers with a degree earn $17 to $25 per hour. Center directors earn $45,000 to $75,000 annually. Private nannies in metropolitan areas earn $20 to $35 per hour. Pay varies significantly by state, setting, and credentials.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you need a degree to work in childcare?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Not for all positions. Daycare assistants and aides typically need only a high school diploma and a background check. Lead teacher roles usually require a Child Development Associate credential or college coursework in early childhood education. Director positions generally require a degree. Requirements vary by state licensing regulations.',
      },
    },
    {
      '@type': 'Question',
      name: 'What certifications help you get a childcare job?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Child Development Associate (CDA) credential is the most widely recognized and directly increases both your pay and your hiring prospects. CPR and First Aid certification are required by nearly all employers. Some states require additional training in child abuse prevention, medication administration, or food safety.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is childcare a good career in 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The demand is strong and growing. Federal and state funding for childcare has increased significantly, which is raising wages and improving benefits at many centers. The work is emotionally rewarding but physically demanding and historically underpaid. Workers who obtain credentials and move into lead teacher or director roles reach more sustainable income levels.',
      },
    },
  ],
}

/* ─── SECTION DATA ──────────────────────────────────────────── */

const childcareSettings = [
  {
    setting: 'Licensed Daycare Center',
    pay: '$13 to $22/hr (assistants to lead teachers)',
    hours: 'Full-time, typically 7 AM to 6 PM shifts',
    reality: 'The most common childcare employment setting. Centers are licensed by the state and must maintain specific staff-to-child ratios, which means they are almost always hiring. The work is structured: you follow a daily schedule that includes arrival, breakfast, circle time, outdoor play, lunch, nap, activities, snack, and pickup. The ratio requirements (typically 1:4 for infants, 1:10 for preschoolers) mean your attention is divided across multiple children simultaneously. Centers operated by national chains (KinderCare, Bright Horizons, Learning Care Group) tend to offer better benefits and more consistent pay scales than independent operators.',
    perk: 'Many centers offer free or discounted childcare for employees with children, which is worth $10,000 to $20,000+ per year',
  },
  {
    setting: 'Head Start / Early Head Start',
    pay: '$15 to $25/hr',
    hours: 'Part-time to full-time, school-year calendar with summer options',
    reality: 'Federally funded programs serving low-income families. Head Start pays more than private daycare because the funding comes from federal grants rather than parent tuition. The trade-off is more paperwork: child assessments, family outcome tracking, home visit documentation, and compliance reporting are part of the job. Head Start positions also require more credentials than comparable private center roles. An associate degree in early childhood education is the standard minimum for lead teachers. The benefits (health insurance, retirement, paid time off) are significantly better than private sector childcare.',
    perk: 'Federal funding means more stable employment and better benefits than the private childcare market',
  },
  {
    setting: 'Private Nanny / Family Childcare',
    pay: '$18 to $35/hr (varies dramatically by metro area)',
    hours: 'Negotiable, typically 40 to 50 hours per week',
    reality: 'You work in a family\'s home caring for their children exclusively. The pay ceiling is the highest in childcare because wealthy families in cities like New York, San Francisco, and Washington DC pay premium rates for experienced, credentialed nannies. The work is one-on-one (or one-on-two/three), which means deeper relationships with the children but also complete dependence on one employer. If the family relocates, downsizes, or the children age out, your job ends. Professional nannies use placement agencies (Park Slope Parents, Care.com, Nanny Lane) and build networks to maintain continuous employment.',
    perk: 'One-on-one attention means deeper developmental impact and more autonomy over curriculum and daily schedule',
  },
  {
    setting: 'Before/After School Programs',
    pay: '$13 to $18/hr',
    hours: 'Part-time split shifts (6:30 to 8:30 AM and 3:00 to 6:00 PM)',
    reality: 'You work with school-age children (5 to 13) during the hours before and after school. The work is lighter in terms of physical care (no diapering, no nap routines) but heavier in behavior management because older children test boundaries differently than toddlers. The split-shift schedule is the defining feature: you work early morning, have the middle of the day off, and return in the afternoon. This schedule is ideal for college students, parents with school-age children of their own, or anyone pursuing another commitment during the day. Healthy Kids Programs and YMCA are the largest employers in this space.',
    perk: 'Split shifts leave the middle of the day free for school, second jobs, or personal time',
  },
  {
    setting: 'Preschool (School-Based or Private)',
    pay: '$17 to $25/hr (lead teachers); $35K to $50K salary',
    hours: 'School-day hours, often 8 AM to 3 PM with a school-year calendar',
    reality: 'The closest childcare role to traditional teaching. You follow a curriculum, plan lessons, assess developmental milestones, and communicate with parents through conferences and daily reports. State-funded pre-K programs (like Universal Pre-K in New York or the California State Preschool Program) pay on or near public school salary schedules, which are significantly higher than private center pay. Private preschools set their own scales. The credential bar is the highest in childcare: most preschool lead teacher positions require at minimum a CDA, and many require an associate or bachelor degree in early childhood education.',
    perk: 'School-year calendar with summers off (in most programs) plus school-day hours',
  },
]

const credentialLadder = [
  {
    level: 'No Credential (High School Diploma)',
    roles: 'Daycare aide, childcare assistant, before/after school staff',
    pay: '$13 to $16/hr',
    detail: 'The entry point. You can start working immediately after passing a background check and completing basic orientation training (CPR, First Aid, child abuse prevention). Your role is to support lead teachers with supervision, meals, diaper changes, activity setup, and cleanup. No lesson planning or parent conferences. This level is where most people discover whether childcare work suits them before investing in credentials.',
  },
  {
    level: 'Child Development Associate (CDA)',
    roles: 'Lead teacher (infant, toddler, or preschool classrooms)',
    pay: '$15 to $22/hr',
    detail: 'The CDA is the credential that changes everything. It requires 120 hours of formal education in child development, 480 hours of professional experience working with children, and a portfolio-based assessment. The process takes 6 to 12 months and costs $425 for the national credentialing exam. The return is immediate: CDA holders qualify for lead teacher positions, which pay $2 to $6 more per hour than aide roles, and open the door to director-track positions. If you plan to stay in childcare for more than a year, the CDA is the single highest ROI investment available to you.',
  },
  {
    level: 'Associate Degree in Early Childhood Education',
    roles: 'Lead teacher, Head Start teacher, assistant director',
    pay: '$17 to $25/hr',
    detail: 'A two-year degree from a community college qualifies you for the highest-paying classroom positions and is the minimum requirement for lead teacher roles in many state-funded pre-K programs and all Head Start classrooms. Many community colleges offer evening and weekend programs designed for working childcare professionals. Several states (like Tennessee and New York) offer free or subsidized tuition for early childhood education degrees through workforce development programs. The degree also counts toward director qualifications in most states.',
  },
  {
    level: 'Bachelor Degree + State Certification',
    roles: 'Preschool teacher (public school), center director, program coordinator',
    pay: '$40K to $68K salary (classroom); $50K to $75K (director)',
    detail: 'A bachelor degree in early childhood education or child development with state teacher certification puts you on public school pay scales, which are the highest in the childcare field. Certified pre-K teachers in public school systems earn the same salary as kindergarten through 12th grade teachers: $44,000 to $68,000 depending on district and experience. Director positions at large centers or multi-site operations also require or strongly prefer a bachelor degree. This is the level where childcare becomes a middle-class career in terms of income, benefits, and retirement.',
  },
]

const hiddenBenefits = [
  {
    title: 'Free or Discounted Childcare for Your Own Kids',
    detail: 'This is the benefit that transforms the economics of childcare work for parents. Most daycare centers and preschools offer free or heavily discounted enrollment for employees\' children. If you have a toddler in full-time care, the market rate in most metros is $1,000 to $2,500 per month. A childcare job that pays $16/hr but includes free care for your child is effectively paying you the equivalent of $22 to $30/hr when you factor in the value of the benefit. For working parents comparing job offers, this calculation changes which offer is actually better.',
  },
  {
    title: 'Federal Funding Is Raising Wages Right Now',
    detail: 'The childcare sector has received unprecedented federal investment since 2021, and states are using that funding to raise wages. Programs like the Child Care Stabilization grants and state-level wage supplements are adding $1 to $5 per hour on top of employer-paid wages in many states. North Carolina, New Mexico, Kentucky, and Illinois have among the most aggressive wage supplement programs. Check your state childcare resource and referral agency to see what supplements are currently available in your area.',
  },
  {
    title: 'The CDA Scholarship Pipeline Nobody Talks About',
    detail: 'The cost of earning a CDA ($425 exam fee plus training costs) is covered entirely by employer scholarships, state grants, or T.E.A.C.H. Early Childhood scholarships in the majority of states. T.E.A.C.H. (Teacher Education and Compensation Helps) operates in 22 states and the District of Columbia. It covers tuition, books, and provides a travel stipend while you work toward your CDA or degree. Most childcare workers who pay out of pocket for their CDA could have gotten it funded if they had known to ask.',
  },
  {
    title: 'Year-Round Employment in a Sector That Cannot Outsource',
    detail: 'Childcare is recession-resistant and cannot be offshored, automated, or performed remotely. Parents need physical care for their children every working day. This gives childcare workers a level of job security that many higher-paying industries cannot match. Licensed centers operate year-round (unlike schools), and the chronic staffing shortage means that experienced, credentialed workers can move between employers with minimal downtime if they choose to.',
  },
]

const physicalRealities = [
  {
    title: 'Your Back, Knees, and Voice',
    detail: 'You will spend hours sitting on child-sized furniture, kneeling on hard floors, lifting children (who weigh 15 to 45 pounds depending on age), and projecting your voice across a room. Back pain and knee strain are the most commonly reported physical complaints among childcare workers. Investing in supportive shoes, practicing proper lifting technique, and requesting adult-height furniture for your workspace are not luxuries. They are occupational necessities that directly affect how many years you can do this work.',
  },
  {
    title: 'The Illness Exposure Is Constant',
    detail: 'Young children in group settings spread respiratory infections, stomach viruses, and conjunctivitis at a rate that no other work environment matches. Your first year in a childcare center, you will likely get sick more frequently than at any point in your adult life as your immune system adapts. By year two, the frequency drops significantly. Hand washing between every activity transition (not just bathroom visits) is the single most effective defense.',
  },
  {
    title: 'The Emotional Weight of Mandatory Reporting',
    detail: 'Childcare workers are mandated reporters in every state. This means that if you observe signs of abuse or neglect in a child, you are legally required to report it to child protective services. The observation might be obvious (unexplained bruises, a child\'s disclosure) or ambiguous (behavioral changes, hygiene patterns). Making a report is emotionally difficult even when you are certain, and agonizing when you are not. Every childcare worker encounters this at some point. Knowing your state reporting procedures before the situation arises is essential preparation.',
  },
]

const faqs = [
  {
    question: 'How much do childcare workers make?',
    answer: 'It ranges widely by role and credential. Daycare aides earn $13 to $16 per hour. CDA holders in lead teacher roles earn $15 to $22 per hour. Degreed preschool teachers in public pre-K programs earn $40,000 to $68,000 per year. Center directors earn $45,000 to $75,000. Private nannies in major metros earn $20 to $35 per hour. The free childcare benefit (worth $12,000 to $30,000 per year) significantly changes the effective compensation for workers with children.',
  },
  {
    question: 'Do you need a degree to work in childcare?',
    answer: 'Not for entry-level positions. Daycare aides and before/after school staff need a high school diploma and a clean background check. Lead teacher roles require a CDA or college coursework (typically 6 to 12 credits in early childhood education). Head Start and public pre-K teacher positions require an associate or bachelor degree. Director positions require a degree in most states. Requirements are set by state childcare licensing, so they vary.',
  },
  {
    question: 'What is the CDA and is it worth getting?',
    answer: 'The Child Development Associate credential is the most widely recognized professional credential in early childhood education. It requires 120 hours of training, 480 hours of work experience, and a portfolio-based assessment. It typically takes 6 to 12 months and costs $425 for the exam (often covered by employer or state scholarships). The pay increase ($2 to $6 per hour more than non-credentialed positions) makes it the highest-ROI investment in the childcare field.',
  },
  {
    question: 'Is childcare a stable career?',
    answer: 'Demand is high and growing. The US has a structural childcare shortage that no foreseeable trend reverses. Centers are chronically understaffed, and credentialed workers can find employment in any metro area with minimal search time. The sector cannot be automated, outsourced, or shifted to remote work. Wages have been rising due to federal investment and state supplement programs. The primary career risk is burnout from the physical and emotional demands of the work, not unemployment.',
  },
  {
    question: 'What is the best way to start a childcare career with no experience?',
    answer: 'Start as a daycare aide or before/after school staff member. These positions require only a high school diploma and background check. While working, begin your CDA coursework (many employers pay for it). The CDA takes 6 to 12 months and qualifies you for lead teacher positions. From there, pursue an associate degree using T.E.A.C.H. scholarships. This path takes 2 to 3 years and moves you from $13/hr to $20+/hr while working and earning the entire time.',
  },
  {
    question: 'Are there childcare jobs with good benefits?',
    answer: 'Head Start programs (federally funded) offer the best benefits: health insurance, dental, retirement contributions, and paid time off comparable to public school systems. Large national chains (Bright Horizons, KinderCare) offer benefits packages for full-time employees that include health insurance, tuition reimbursement, and free childcare. Small independent centers typically offer minimal benefits beyond the free childcare perk. Public school pre-K positions carry full district benefit packages including pensions.',
  },
]

export default async function ChildcareJobsPage({ searchParams }: any) {
  const params = await searchParams

  const [{ count }, initialData] = await Promise.all([
  getMergedJobCount(params.what || 'childcare', params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
  searchMergedJobs({ what: params.what || 'childcare', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
])


  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {count > 0 ? count.toLocaleString() : ''} Childcare Jobs Available Across the United States
          </h1>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="childcare" />
          </aside>
          <div className="flex-1">
            {count > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">{count.toLocaleString()}</span> positions available
              </p>
            )}
            <AIJobMatcherWrapper />
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList what={params.what || 'childcare'} where={params.where || ''} salary_min={params.salary_min} initialData={initialData} />
            </Suspense>
          </div>
        </div>

        {/* ── FIVE SETTINGS ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Five Childcare Settings and What Each One Actually Pays, Demands, and Offers</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            "Childcare job" covers everything from changing diapers at a daycare center to running a $2 million preschool program. The pay, the hours, and the daily experience vary dramatically depending on where you work.
          </p>
          <div className="space-y-4">
            {childcareSettings.map((s, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h3 className="font-bold text-gray-900 text-lg">{s.setting}</h3>
                  <span className="text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">{s.pay}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{s.hours}</span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{s.reality}</p>
                <p className="text-xs text-blue-700 font-medium bg-blue-50 px-3 py-2 rounded-lg">{s.perk}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CREDENTIAL LADDER ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">The Credential Ladder: From $13/hr to $65K+ in Four Steps</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Childcare is one of the few fields where every credential you earn produces an immediate, measurable pay increase. The ladder is clear, the steps are defined, and each one unlocks roles that the previous level cannot access.
          </p>
          <div className="space-y-4">
            {credentialLadder.map((level, i) => (
              <div key={i} className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 bg-purple-100 text-purple-700 font-bold rounded-full text-sm">{i + 1}</span>
                  <h3 className="font-semibold text-gray-900">{level.level}</h3>
                  <span className="text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">{level.pay}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">Opens: {level.roles}</p>
                <p className="text-gray-600 text-sm">{level.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── HIDDEN BENEFITS ── */}
        <section className="mt-20">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <DollarSign className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">The Hidden Benefits That Change the Real Math of a Childcare Salary</h2>
                <p className="text-gray-700 mb-6">
                  The hourly rate on a childcare job posting is one number. The total compensation, including the childcare benefit for your own kids, wage supplements, and funded credentials, tells a different story.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  {hiddenBenefits.map((item, i) => (
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

        {/* ── PHYSICAL REALITIES ── */}
        <section className="mt-20">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">The Physical and Emotional Realities Nobody Puts in the Job Posting</h2>
                <p className="text-gray-700 mb-6">
                  Childcare is physically and emotionally demanding work that job descriptions consistently understate. Knowing what the job actually feels like day to day helps you prepare and helps you decide whether the work is right for you.
                </p>
                <div className="space-y-4">
                  {physicalRealities.map((item, i) => (
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

        {/* ── FAQ ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Childcare Jobs</h2>
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
            <strong>Disclaimer:</strong> Oh My Job is an independent job search platform and is not affiliated with any childcare center, preschool, Head Start program, or staffing agency. Job listings are sourced from third-party APIs and may not reflect all current openings. Salary figures are estimates based on industry data and vary by state, setting, and credentials. Licensing requirements and credential mandates differ by state. Consult your state childcare licensing authority for current regulations. This page is for informational purposes only.
          </p>
        </section>
      </div>
    </>
  )
}