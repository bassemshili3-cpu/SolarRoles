import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, DollarSign, MapPin, AlertTriangle, BookOpen, Users, GraduationCap, TrendingUp, Scale } from 'lucide-react'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Social Studies Teacher Jobs Hiring for 2026-2027 | All 50 States',
  description: 'History, civics, and economics teacher positions in districts from $50K to $112K. Shortage designations mean loan forgiveness eligibility and faster interview timelines.',
  keywords: 'social studies teacher jobs, social studies teaching positions, history teacher jobs, civics teacher hiring, social studies teacher salary 2026, teaching jobs social studies',
  openGraph: {
    title: 'Social Studies Teacher Jobs | Positions Open for 2026-2027',
    description: 'School districts across the US are hiring social studies teachers. Shortage designations mean faster hiring and better incentives. Apply now.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Studies Teacher Jobs 2026 | $50K to $112K',
    description: 'Social studies is now a shortage subject in multiple states. Browse open positions and apply directly.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/social-studies-teacher-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Social Studies Teacher Jobs',
  description: 'Find social studies teaching positions across the United States for the 2026-2027 school year.',
  url: 'https://www.oh-my-job.com/social-studies-teacher-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Social Studies Teacher Jobs',
    description: 'Current job listings for social studies, history, civics, and government teachers',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How much do social studies teachers make in 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The national average salary for social studies teachers is approximately $63,000 per year. Starting salaries range from $45,000 to $55,000 depending on the state and district. Experienced teachers with a masters degree in high-cost districts can earn $85,000 to $112,000. Additional pay comes from coaching, department chair roles, and summer curriculum work.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is social studies a shortage subject area?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, in a growing number of states. Social studies has been added to teacher shortage lists in states including California, Nevada, Arizona, and parts of the Southeast. This is a significant shift from a decade ago when social studies was considered oversaturated. The shortage means faster hiring timelines, signing bonuses in some districts, and eligibility for federal loan forgiveness programs.',
      },
    },
    {
      '@type': 'Question',
      name: 'What certification do you need to teach social studies?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Requirements vary by state but typically include a bachelors degree, completion of a state-approved teacher preparation program, passing scores on the Praxis Social Studies Content Knowledge exam or equivalent, and a state teaching license with a social studies endorsement. Many states also accept alternative certification for career changers who hold a degree in history, political science, economics, or a related field.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can you teach social studies with a history degree?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. A history degree qualifies you for social studies certification in most states, since history is the core content area within social studies. You will still need to complete a teacher preparation program and pass the required content exams, but your degree itself meets the content knowledge requirement. Political science, economics, and geography degrees also qualify in many states.',
      },
    },
    {
      '@type': 'Question',
      name: 'When is the best time to apply for social studies teaching jobs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The primary hiring window runs from February through June for positions starting the following August or September. Districts post openings as budget approvals and enrollment projections are finalized. A second, smaller wave of openings appears in July and August when teachers resign late or new positions are created. Applying early in the cycle gives you access to the widest selection of schools and districts.',
      },
    },
  ],
}

/* ─── SECTION DATA ──────────────────────────────────────────── */

const whatYouActuallyTeach = [
  {
    subject: 'US History',
    grades: 'Typically 8th and 11th grade',
    reality: 'The backbone of most social studies departments. You cover colonization through the present, and the curriculum is heavily influenced by state standards that vary dramatically. Teaching US History in Texas and teaching it in Massachusetts are functionally different jobs because the emphasis, the approved materials, and the assessment expectations diverge on politically sensitive topics. Know your state standards before your interview, not after.',
  },
  {
    subject: 'World History / Global Studies',
    grades: 'Typically 9th or 10th grade',
    reality: 'The broadest content load in the department. You are expected to cover 10,000 years of human civilization in 180 instructional days. The challenge is not knowing the content. It is deciding what to cut. New teachers often try to cover everything and end up rushing through the 20th century in May. Experienced teachers build backward from the final assessment and accept that depth beats breadth every time.',
  },
  {
    subject: 'Government / Civics',
    grades: 'Typically 12th grade (senior year)',
    reality: 'The most politically charged course in the building. You teach the Constitution, elections, Supreme Court cases, and civic participation to students who are months away from voting age. The skill required is not political neutrality (which is impossible) but procedural fairness: presenting multiple perspectives with equal rigor and letting students reach their own conclusions. Districts increasingly require a civics course for graduation, which is expanding demand for teachers who can handle the content without generating parent complaints.',
  },
  {
    subject: 'Economics',
    grades: 'Typically 11th or 12th grade',
    reality: 'Often assigned to a social studies teacher as an additional prep rather than hiring a dedicated economics teacher. If you can teach economics competently, you become significantly more valuable to a department because most social studies majors avoided economics coursework in college. A teacher who can cover both US History and Economics fills two scheduling needs with one salary line, which is exactly what budget-constrained principals want.',
  },
  {
    subject: 'AP / IB Courses',
    grades: 'Varies (AP US History, AP Government, AP World History, IB History)',
    reality: 'AP and IB assignments are the prestige courses in social studies departments. They come with higher-performing students, more curriculum autonomy, and in many districts a stipend ($1,000 to $3,000 per year). They also come with the pressure of external exam scores that are published and compared across schools. Getting an AP assignment as a new hire is rare. Most teachers earn it after 2 to 4 years of strong performance in general education courses.',
  },
]

const salaryByExperience = [
  {
    level: 'First Year (BA, no experience)',
    range: '$45,000 to $55,000',
    note: 'Starting salaries vary by district wealth and cost of living. Urban districts in the Northeast and West Coast start higher. Rural and Southern districts start lower but often have dramatically lower housing costs.',
  },
  {
    level: 'Years 3 to 5 (BA + credits)',
    range: '$50,000 to $65,000',
    note: 'Most salary schedules reward accumulated graduate credits even before you finish a masters degree. Each credit block (typically 15 or 30 credits) moves you to a higher column on the pay scale. Strategic course selection here compounds over your entire career.',
  },
  {
    level: 'Years 5 to 10 (MA completed)',
    range: '$60,000 to $80,000',
    note: 'The masters degree bump is the single largest salary increase available to teachers outside of changing districts. In most schedules it adds $5,000 to $12,000 per year permanently. The degree pays for itself within 2 to 4 years and then generates returns for the remaining 20+ years of your career.',
  },
  {
    level: 'Years 15+ (MA + 30 or higher)',
    range: '$75,000 to $112,000',
    note: 'Top-step teachers in well-funded suburban and urban districts reach six figures. The highest-paying states for experienced teachers are New York, California, Massachusetts, Connecticut, and New Jersey. A teacher at the top of the New York City DOE salary schedule with a masters plus 30 credits and 22 years of experience earns over $128,000.',
  },
]

const hiddenIncomeStreams = [
  {
    title: 'Coaching and Extracurricular Stipends',
    detail: 'Social studies teachers are disproportionately recruited to coach because the content area attracts candidates with athletics backgrounds. Coaching stipends range from $3,000 to $12,000 per season depending on the sport and district. Head coaching positions for football, basketball, and baseball pay the most. Advising Model UN, debate, or student government adds $1,000 to $4,000.',
  },
  {
    title: 'Curriculum Writing (Summer)',
    detail: 'Districts regularly pay teachers to write or revise curriculum during summer months. The rate is typically your per diem daily rate ($250 to $500/day) for 5 to 15 days of work. Social studies curriculum revision is particularly common right now because multiple states have updated their standards in the past three years, creating a backlog of alignment work.',
  },
  {
    title: 'National Board Certification',
    detail: 'Achieving National Board Certification in Social Studies typically adds $2,000 to $10,000 per year to your salary depending on the state. Some states (like North Carolina and Washington) pay the highest supplements. The certification process takes 1 to 3 years and requires a portfolio of student work and a content knowledge assessment. It is the closest thing teaching has to a professional credential that directly increases pay.',
  },
  {
    title: 'Teaching Dual Enrollment or Community College Courses',
    detail: 'If you hold a masters degree with 18+ graduate credits in history or a related field, you may qualify to teach dual enrollment courses at your high school (where students earn college credit) or adjunct courses at a local community college. Adjunct pay ranges from $2,000 to $4,000 per course per semester. Some teachers add $8,000 to $12,000 per year this way without leaving their building.',
  },
]

const politicalNavigationGuide = [
  {
    title: 'The Content Is Inherently Political and That Is the Point',
    detail: 'Social studies exists to prepare students for democratic participation. The subjects you teach (government, history, economics, geography) are political by definition. The challenge is not avoiding politics. It is teaching politically charged material in a way that develops critical thinking rather than advancing a personal agenda. The teachers who succeed at this over a full career are the ones who can articulate the strongest version of every perspective in the room, not just their own.',
  },
  {
    title: 'Document Everything, Especially Controversial Lessons',
    detail: 'Before teaching a lesson on a topic that could generate parent pushback (civil rights, immigration, religious history, current elections), ensure your lesson is aligned to a specific state standard and that you can identify which standard it addresses if asked. Save your lesson plans, the sources you used, and any student work that demonstrates balanced engagement. A parent complaint that reaches the principal is manageable when you can produce documentation showing curricular alignment. A complaint without documentation is a credibility problem.',
  },
  {
    title: 'Your State Standards Are Your Shield and Your Constraint',
    detail: 'In any disagreement about what should or should not be taught, the state standards are the document that matters. If a topic is in the standards, you have both the authority and the obligation to teach it. If a topic is not in the standards, teaching it is a choice that you should be prepared to defend on educational (not personal) grounds. Knowing your standards thoroughly is not just good teaching practice. It is career self-preservation in a politically charged discipline.',
  },
]

const certificationPaths = [
  {
    path: 'Traditional (Education Degree)',
    timeline: '4 years (bachelors in education with social studies concentration)',
    detail: 'You complete a teacher preparation program as part of your undergraduate degree, including student teaching. You graduate with a degree and a teaching license. This is the most common path and the one with the smoothest transition into the classroom because you have been trained specifically for the job.',
  },
  {
    path: 'Alternative Certification (Career Changers)',
    timeline: '1 to 2 years',
    detail: 'If you already hold a bachelors degree in history, political science, economics, sociology, or a related field, most states offer alternative routes to certification. Programs like Teach For America, TNTP Teaching Fellows, and state-specific alternative programs place you in a classroom within months while you complete certification coursework concurrently. The trade-off is a steeper learning curve in your first year since you are teaching and training simultaneously.',
  },
  {
    path: 'Masters in Teaching (MAT)',
    timeline: '1 to 2 years post-bachelors',
    detail: 'A masters program in teaching designed for people who hold a content degree but not an education degree. You complete pedagogical coursework, student teaching, and earn both a masters degree and a teaching license. The advantage over alternative certification is that you enter the classroom with a masters on the salary schedule from day one, which means higher starting pay that compounds over your entire career.',
  },
]

const faqs = [
  {
    question: 'How much do social studies teachers make?',
    answer: 'The national average is approximately $63,000 per year. Starting salaries range from $45,000 to $55,000 depending on state and district. Experienced teachers with a masters degree in well-funded districts earn $80,000 to $112,000. The highest-paying states are New York, California, Massachusetts, Connecticut, and New Jersey. Additional income from coaching, curriculum writing, and dual enrollment teaching can add $5,000 to $15,000 per year.',
  },
  {
    question: 'Is social studies teaching oversaturated or in demand?',
    answer: 'The narrative that social studies is oversaturated is outdated. Multiple states now list social studies as a shortage area, including California, Nevada, Arizona, and several Southeastern states. The shortage is driven by retirements, early-career attrition, and declining enrollment in education programs. In shortage-designated areas, candidates often receive multiple offers, signing bonuses, and eligibility for loan forgiveness.',
  },
  {
    question: 'What is the hiring timeline for social studies teaching jobs?',
    answer: 'The primary hiring window is February through June for positions starting in August or September. Budget approvals and enrollment projections drive posting timelines. A second wave of openings appears in July and August when teachers resign late or unexpected enrollment growth creates new positions. Candidates who apply early in the cycle have the widest selection. Late-summer applicants may find fewer options but also face less competition.',
  },
  {
    question: 'Can I teach social studies with a history or political science degree?',
    answer: 'Yes. History, political science, economics, geography, and sociology degrees all qualify for social studies certification in most states. You will need to complete a teacher preparation program (either traditional or alternative) and pass the required content knowledge exam (typically Praxis 5081 or a state equivalent). Your content degree satisfies the subject matter knowledge requirement.',
  },
  {
    question: 'What makes a social studies teacher candidate stand out in an interview?',
    answer: 'Three things consistently differentiate strong candidates. First, the ability to describe how you teach students to analyze primary sources rather than memorize facts. Second, a clear strategy for handling controversial topics with procedural fairness. Third, willingness to contribute beyond the classroom through coaching, advising, or committee work. Principals are hiring a colleague, not just a content expert.',
  },
  {
    question: 'Is social studies teaching a good long-term career?',
    answer: 'For someone who values intellectual engagement, schedule predictability, job security, and retirement benefits, yes. The salary trajectory with a masters degree and longevity on the schedule reaches comfortable middle-class income in most markets. The pension (in states that still offer defined benefit plans) is a significant financial asset. The summers, while not truly "off" for most teachers, provide schedule flexibility that few other professions offer. The downsides are well documented: high emotional labor, increasing politicization of content, and the frustration of decisions made by people who have never stood in front of a classroom.',
  },
]

export default async function SocialStudiesTeacherJobsPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'social studies teacher', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'social studies teacher', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {count > 0 ? count.toLocaleString() : ''} Social Studies Teacher Jobs Open for the 2026-2027 School Year
          </h1>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="social studies teacher" />
          </aside>
          <div className="flex-1">
            {count > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">{count.toLocaleString()}</span> positions available
              </p>
            )}
            <AIJobMatcherWrapper />
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList what={params.what || 'social studies teacher'} where={params.where || ''} salary_min={params.salary_min} initialData={initialData} />
            </Suspense>
          </div>
        </div>

        {/* ── WHAT YOU ACTUALLY TEACH ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">What You Actually Teach: Five Courses and What Each One Demands</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            "Social studies teacher" is a job title that covers at least five distinct courses, each with its own content load, political sensitivity level, and classroom dynamic. Which courses you are assigned shapes your daily experience more than almost any other variable.
          </p>
          <div className="space-y-4">
            {whatYouActuallyTeach.map((course, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h3 className="font-bold text-gray-900 text-lg">{course.subject}</h3>
                  <span className="text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full">{course.grades}</span>
                </div>
                <p className="text-gray-600 text-sm">{course.reality}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SALARY BY EXPERIENCE ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">The Real Salary Trajectory: What Each Stage of Your Career Pays</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Teacher salaries follow a schedule, not a negotiation. Your pay is determined by two variables: years of experience (rows) and level of education (columns). Understanding how to move across columns, not just down rows, is the key to maximizing your lifetime earnings.
          </p>
          <div className="space-y-4">
            {salaryByExperience.map((level, i) => (
              <div key={i} className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{level.level}</h3>
                  <span className="text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">{level.range}</span>
                </div>
                <p className="text-gray-600 text-sm">{level.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── HIDDEN INCOME STREAMS ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Income Beyond the Salary Schedule That Nobody Mentions in the Job Posting</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            The base salary is one number. The total compensation, including stipends, summer work, and supplemental teaching, tells a different story. Social studies teachers have more access to these additional income streams than most other content areas.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {hiddenIncomeStreams.map((stream, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <h3 className="font-semibold text-gray-900 mb-2">{stream.title}</h3>
                <p className="text-gray-600 text-sm">{stream.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── NAVIGATING POLITICS ── */}
        <section className="mt-20">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <Scale className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Teaching in a Politically Charged Era: What They Do Not Cover in Ed School</h2>
                <p className="text-gray-700 mb-6">
                  Social studies is the only content area where a parent can object not just to how you teach but to what you teach. No math teacher faces a school board complaint about the content of algebra. Social studies teachers face this routinely. Here is how the ones who build long careers navigate it.
                </p>
                <div className="space-y-4">
                  {politicalNavigationGuide.map((item, i) => (
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

        {/* ── CERTIFICATION PATHS ── */}
        <section className="mt-20">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <GraduationCap className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Three Paths to the Social Studies Classroom</h2>
                <p className="text-gray-700 mb-6">
                  There is no single route into social studies teaching. The right path depends on where you are starting from: a college freshman choosing a major, a history graduate considering a career change, or someone who wants a masters degree from the outset.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  {certificationPaths.map((path, i) => (
                    <div key={i} className="bg-white rounded-lg p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 font-bold rounded-full text-xs">{i + 1}</span>
                        <h3 className="font-semibold text-gray-900 text-sm">{path.path}</h3>
                      </div>
                      <p className="text-xs text-blue-600 font-medium mb-2">{path.timeline}</p>
                      <p className="text-gray-600 text-sm">{path.detail}</p>
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Social Studies Teaching Jobs</h2>
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
            <strong>Disclaimer:</strong> Oh My Job is an independent job search platform and is not affiliated with any school district, state department of education, or certification body. Job listings are sourced from third-party APIs and may not reflect all current openings. Salary figures are estimates based on publicly available salary schedules and industry data. Certification requirements, shortage designations, and hiring timelines vary by state and district. Consult your state department of education for current licensing requirements. This page is for informational purposes only.
          </p>
        </section>
      </div>
    </>
  )
}