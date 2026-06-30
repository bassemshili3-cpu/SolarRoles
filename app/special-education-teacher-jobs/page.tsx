import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, AlertTriangle, BookOpen, Users, TrendingUp, Award, Heart, GraduationCap } from 'lucide-react'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Special Education Teacher Jobs | SPED Openings in 45 States',
  description: 'SPED teacher openings in self-contained, resource, and inclusion classrooms across 39+ shortage states. IEP experience valued — sign-on bonuses and relocation packages available.',
  keywords: 'special education teacher jobs, sped teacher jobs, special ed teacher hiring, special education positions, IEP teacher jobs, resource room teacher openings, special education career',
  openGraph: {
    title: 'Special Education Teacher Jobs | Openings in 45 States',
    description: 'Districts across 45 states urgently need special education teachers. Competitive pay, loan forgiveness, mentorship programs. Apply now.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Special Education Teacher Jobs | Critical Shortage = Fast Hiring',
    description: 'National shortage means faster hiring, sign-on bonuses, and relocation support. Find your next SPED position.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/special-education-teacher-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Special Education Teacher Jobs',
  description: 'Find special education teacher jobs hiring across the United States. Browse positions in public schools, private schools, and specialized programs.',
  url: 'https://www.oh-my-job.com/special-education-teacher-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Special Education Teacher Positions',
    description: 'Current job listings for special education teachers across the United States',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What qualifications do you need to become a special education teacher?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most states require a bachelor\'s degree, completion of a teacher preparation program with a special education focus, student teaching experience, and passing scores on state licensure exams. Some states offer alternative certification routes for career changers with a bachelor\'s in another field.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much do special education teachers earn?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The national median salary for special education teachers is approximately $65,000 to $68,000 annually. Pay varies significantly by state and district, with top-paying states exceeding $85,000. Many districts offer additional stipends of $2,000 to $10,000 specifically for special education roles.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is there a shortage of special education teachers?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Special education has been the most commonly reported shortage area since the U.S. Department of Education began tracking the data in 1990. As of the 2024 to 2025 school year, 45 states reported special education teacher shortages, and 21% of schools had at least one unfilled special education vacancy.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can you become a special education teacher without an education degree?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Most states offer alternative certification pathways that allow individuals with a bachelor\'s degree in any field to earn a teaching license while working in the classroom. These programs typically include coursework, mentoring, and a supervised teaching period.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between a resource room teacher and a self-contained classroom teacher?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A resource room teacher pulls students out of general education for targeted instruction in specific skill areas, typically serving multiple students across grade levels. A self-contained classroom teacher works with a smaller group of students who receive the majority of their instruction in a separate setting due to more intensive support needs.',
      },
    },
  ],
}

/* ─── SECTION DATA ──────────────────────────────────────────── */

const roleTypes = [
  {
    role: 'Resource Room / Pull-Out',
    caseload: '15 to 30 students across multiple grades',
    schedule: 'Rotates throughout the day; students come to you for specific periods',
    description: 'You work with students who spend most of their day in general education but need targeted support in reading, math, writing, or executive function skills. Each session is short (30 to 45 minutes), and you manage multiple IEPs with varying goals.',
    bestFor: 'Teachers who thrive on variety and want to see a broad range of students. The pace is fast and organizational skills matter more here than in any other SPED setting.',
  },
  {
    role: 'Self-Contained Classroom',
    caseload: '6 to 12 students',
    schedule: 'Full day with the same group; you are the primary instructor',
    description: 'Students in your room receive most or all of their academic instruction from you, often with the support of one or more paraprofessionals. Curriculum is modified significantly, and you design individualized learning plans for each student.',
    bestFor: 'Teachers who prefer deep, consistent relationships with a smaller group of students. This setting demands patience, creativity, and strong behavior management skills.',
  },
  {
    role: 'Inclusion / Co-Teaching',
    caseload: '8 to 15 students with IEPs within a larger general education class',
    schedule: 'Embedded in general education classrooms throughout the day',
    description: 'You partner with a general education teacher to deliver instruction that meets the needs of both students with disabilities and their peers. Co-planning is essential, and the dynamic depends heavily on the working relationship between both teachers.',
    bestFor: 'Collaborative educators who are comfortable sharing classroom authority. Success depends as much on interpersonal skills as on instructional expertise.',
  },
  {
    role: 'Transition Specialist (Ages 14 to 22)',
    caseload: '15 to 25 students',
    schedule: 'Mix of classroom instruction, community-based outings, and job coaching',
    description: 'You prepare older students with disabilities for life after school, covering vocational skills, independent living, self-advocacy, and community navigation. Work often extends beyond the school building into job sites and community settings.',
    bestFor: 'Teachers who want to see direct, tangible impact on students\' futures. This role is less about academic instruction and more about functional skill development and real-world application.',
  },
  {
    role: 'Early Childhood Special Education (Birth to 5)',
    caseload: '8 to 15 children',
    schedule: 'Varies: center-based, home visits, or itinerant across multiple sites',
    description: 'You work with the youngest learners who have developmental delays or disabilities, often collaborating closely with families, speech therapists, and occupational therapists. Early intervention focus means measurable progress happens quickly.',
    bestFor: 'Teachers who want to work at the stage where intervention has the highest documented impact. Strong family communication skills are essential because parents are active participants in every plan.',
  },
]

const salaryByState = [
  { tier: 'Highest Paying', states: 'New York, California, Connecticut, Massachusetts, New Jersey, Oregon', range: '$70,000 to $95,000+', context: 'Strong unions, high cost of living, and mandatory special education stipends drive these figures. New York City offers some of the highest starting salaries for SPED teachers nationally.' },
  { tier: 'Above Average', states: 'Washington, Illinois, Maryland, Virginia, Colorado, Minnesota', range: '$58,000 to $75,000', context: 'Growing suburban districts in these states compete aggressively for certified special educators. Many offer signing bonuses of $3,000 to $10,000 for hard-to-fill positions.' },
  { tier: 'National Average Range', states: 'Texas, Florida, Ohio, Pennsylvania, Michigan, North Carolina, Georgia', range: '$48,000 to $65,000', context: 'Large student populations create high volumes of openings. Texas districts report that 73% offer a dedicated special education stipend, the most common stipend category statewide.' },
  { tier: 'Below Average (by nominal pay)', states: 'Mississippi, West Virginia, Oklahoma, South Dakota, Arkansas', range: '$40,000 to $55,000', context: 'Lower cost of living makes these salaries more competitive than they appear. Several states in this tier are introducing supplemental pay bills specifically for special education teachers in 2026.' },
]

const certificationPaths = [
  {
    path: 'Traditional University Program',
    duration: '4 years (bachelor\'s) or 1 to 2 years (master\'s add-on)',
    description: 'A degree program at an accredited college of education that includes coursework in disability categories, assessment methods, behavioral intervention, and IEP development, plus a supervised student teaching placement in a special education setting.',
    pros: 'Most comprehensive preparation. Graduates are fully licensed from day one and generally report higher confidence in their first year.',
    cons: 'Longest timeline and highest upfront cost. Student teaching is typically unpaid.',
  },
  {
    path: 'Alternative Certification (Teach For America, TNTP, state programs)',
    duration: '1 to 2 years of coursework completed while teaching',
    description: 'Designed for career changers with a bachelor\'s degree in any field. You begin teaching on a provisional license while completing required coursework and mentored practice hours. Programs vary significantly in quality and support structure.',
    pros: 'Start earning a salary immediately. Many programs place candidates directly into shortage districts where hiring is fast.',
    cons: 'The learning curve is steep. Teaching full-time while completing certification coursework is demanding, and support quality depends heavily on the specific program and school placement.',
  },
  {
    path: 'Add-On Endorsement (for current general education teachers)',
    duration: '6 months to 2 years of additional coursework',
    description: 'If you already hold a general education teaching license, most states allow you to add a special education endorsement by completing a set number of credit hours in SPED-specific courses. Some districts cover the tuition cost as a retention incentive.',
    pros: 'Fastest route for existing teachers. No student teaching required in most states since you are already a licensed classroom teacher.',
    cons: 'Coursework alone may not fully prepare you for the paperwork, legal, and behavioral dimensions of the role. A strong mentor at your school makes a significant difference.',
  },
]

const iepRealities = [
  {
    myth: 'IEP paperwork is manageable',
    reality: 'Paperwork is the single most cited reason special education teachers leave the field. The average IEP document runs 15 to 30 pages. A resource room teacher managing 25 IEPs is responsible for writing, reviewing, and updating hundreds of pages per year, plus scheduling and running annual meetings for each student with parents, administrators, and related service providers.',
  },
  {
    myth: 'You just need to be patient with the kids',
    reality: 'Patience matters, but so does legal literacy. You are the person responsible for ensuring the district complies with IDEA (the Individuals with Disabilities Education Act) for every student on your caseload. Errors in documentation, missed timelines, or inadequate services can result in formal complaints and due process hearings.',
  },
  {
    myth: 'Special education teachers work the same hours as other teachers',
    reality: 'The contractual hours may be the same, but the workload distribution is different. IEP meetings are often scheduled before or after school. Progress monitoring requires ongoing data collection. And coordinating with general education teachers, therapists, and families adds communication layers that general education roles do not typically involve.',
  },
  {
    myth: 'All special education classrooms look the same',
    reality: 'A resource room serving students with specific learning disabilities operates nothing like a self-contained classroom for students with significant cognitive impairments, which in turn looks nothing like a transition program for 18 to 22 year olds. The skill set, curriculum, and daily rhythm vary enormously across settings.',
  },
]

const retentionFactors = [
  { factor: 'Administrative Support', detail: 'The single strongest predictor of whether a special education teacher stays or leaves is the quality of support from their building principal. Principals who protect planning time, attend IEP meetings, back teacher decisions on behavioral interventions, and advocate for reasonable caseloads retain their SPED staff at dramatically higher rates.' },
  { factor: 'Caseload Size', detail: 'There is a threshold beyond which the quality of instruction degrades and burnout accelerates. Research consistently shows that caseloads above 25 students per teacher correlate with higher turnover. When evaluating a position, ask for the specific caseload number rather than accepting vague descriptions like "manageable."' },
  { factor: 'Paraprofessional Staffing', detail: 'In self-contained and many resource settings, paraprofessionals are not optional. They are essential to safe, effective instruction. Ask during your interview how many paraprofessionals are assigned to your classroom, what their training looks like, and what happens when one calls out sick.' },
  { factor: 'Mentorship for New Teachers', detail: 'First-year special education teachers who receive consistent mentoring from an experienced SPED colleague are significantly more likely to remain in the profession. If the district does not offer a formal mentoring program, ask whether informal arrangements can be made.' },
  { factor: 'Compensation Beyond Base Salary', detail: 'Stipends, loan forgiveness eligibility, tuition reimbursement for advanced degrees, and paid professional development days all factor into the real compensation package. A district paying $3,000 less in base salary but offering $10,000 in annual loan repayment is the better financial deal.' },
  { factor: 'Scheduling Autonomy', detail: 'Resource room teachers who control their own pull-out schedule report higher job satisfaction than those whose schedules are dictated entirely by administration. Even modest scheduling flexibility improves the ability to cluster similar skill groups and reduce transition time.' },
]

const loanForgiveness = [
  { program: 'Teacher Loan Forgiveness (Federal)', amount: 'Up to $17,500', requirement: 'Five consecutive years teaching in a low-income school. Special education teachers qualify for the maximum forgiveness amount ($17,500) rather than the standard $5,000 if they are considered "highly qualified."' },
  { program: 'Public Service Loan Forgiveness (PSLF)', amount: 'Full remaining balance forgiven', requirement: '120 qualifying monthly payments (10 years) while working full-time for a qualifying public employer, which includes public school districts. Payments made under income-driven repayment plans count toward the 120.' },
  { program: 'State-Level Programs', amount: 'Varies ($2,000 to $20,000+ per year)', requirement: 'Many states offer loan repayment assistance specifically for teachers in shortage areas. Special education almost universally qualifies. Check your state education agency for current programs.' },
  { program: 'District-Specific Incentives', amount: 'Varies ($1,000 to $10,000 sign-on or annual)', requirement: 'Individual districts facing acute shortages may offer their own loan assistance, sign-on bonuses, or tuition reimbursement for SPED-endorsed teachers. These are often negotiable and not always advertised publicly.' },
]

const faqs = [
  {
    question: 'What qualifications do you need to become a special education teacher?',
    answer: 'The baseline requirement is a bachelor\'s degree, completion of a state-approved teacher preparation program (with a special education focus or endorsement), student teaching in a SPED setting, and passing your state\'s licensure exams (often the Praxis in Special Education). Alternative certification routes exist in most states for individuals who hold a bachelor\'s degree in another field and want to transition into teaching.',
  },
  {
    question: 'How severe is the special education teacher shortage?',
    answer: 'It is the most persistent shortage category in American education. As of the 2024 to 2025 school year, 45 states reported shortages of special education teachers to the U.S. Department of Education. Twenty-one percent of schools reported at least one unfilled SPED vacancy, and 55% reported difficulty filling special education positions. The shortage has been continuous since tracking began in 1990.',
  },
  {
    question: 'What is the salary range for special education teachers?',
    answer: 'National median salary falls between $65,000 and $68,000 depending on the data source. The actual range is wide: starting salaries in lower-paying states begin around $40,000, while experienced teachers in high-paying districts can exceed $90,000. Many districts add stipends of $2,000 to $10,000 specifically for special education certification, which are separate from the base salary schedule.',
  },
  {
    question: 'Can I switch from general education to special education?',
    answer: 'Yes, and many districts actively incentivize this transition. Most states require an add-on endorsement, which involves completing a set of graduate-level courses in special education topics. Some districts cover the tuition cost. Evidence suggests that teachers with dual certification (general and special education) are often more effective because they bring content area expertise alongside SPED skills.',
  },
  {
    question: 'What does a typical day look like for a special education teacher?',
    answer: 'It depends entirely on the setting. A resource room teacher might see 6 different groups of students throughout the day for targeted instruction sessions. A self-contained classroom teacher spends the full day with the same small group, covering all subjects. An inclusion teacher moves between general education classrooms, co-teaching alongside content area teachers. No two SPED positions have the same daily rhythm.',
  },
  {
    question: 'Why is the turnover rate so high in special education?',
    answer: 'Multiple factors converge: heavy paperwork and compliance demands (IEP writing, progress monitoring, meeting coordination), large caseloads relative to staffing, emotional intensity of the work, insufficient administrative support, and compensation that does not always reflect the additional responsibilities. About 15% of special education teachers leave their school each year, compared to lower rates in general education.',
  },
]

export default async function SpecialEducationTeacherJobsPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'special education teacher', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'special education teacher', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {count > 0 ? count.toLocaleString('en-US') : 'Thousands of'} Special Education Teacher Jobs Available Across the United States
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="special education teacher" />
          </aside>
          <div className="flex-1">
            <AIJobMatcherWrapper />
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList what={params.what || 'special education teacher'} where={params.where || ''} salary_min={params.salary_min} initialData={initialData} />
            </Suspense>
          </div>
        </div>

        {/* ── ROLE TYPES ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Five Distinct Roles Within Special Education Teaching</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            A job listing that says "special education teacher" could refer to radically different positions. The setting, caseload, daily structure, and required skill set vary so much across roles that two SPED teachers in the same building may have almost nothing in common in their day to day work. Understanding these distinctions before applying saves you from landing in a role that does not match your strengths.
          </p>
          <div className="space-y-4">
            {roleTypes.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{item.role}</h3>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    <p className="text-sm text-blue-700">{item.bestFor}</p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm lg:min-w-[280px]">
                    <div className="min-w-[120px]">
                      <p className="text-gray-500">Caseload</p>
                      <p className="font-medium text-gray-800">{item.caseload}</p>
                    </div>
                    <div className="min-w-[120px]">
                      <p className="text-gray-500">Schedule</p>
                      <p className="font-medium text-gray-800">{item.schedule}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SALARY BY STATE ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Special Education Teacher Salary by State Tier</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Base salary is only part of the equation. Stipends for special education endorsement, sign-on bonuses, and loan forgiveness eligibility can add $5,000 to $20,000 in annual value beyond what appears on the salary schedule. Evaluate total compensation, not just the starting number.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {salaryByState.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-1">{item.tier}</h3>
                <p className="text-green-700 font-bold text-lg mb-1">{item.range}</p>
                <p className="text-xs text-gray-500 mb-3">{item.states}</p>
                <p className="text-gray-600 text-sm">{item.context}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Ranges reflect base salary for certified special education teachers. Stipends, bonuses, and loan forgiveness are not included. Sources: BLS, state salary schedules, TASB District Personnel Salary Survey (2025 to 2026).
          </p>
        </section>

        {/* ── CERTIFICATION PATHS ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Three Routes to Special Education Certification</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            There is no single path into special education teaching. Whether you are a college student choosing a major, a career changer with a different bachelor's degree, or a general education teacher looking to add an endorsement, a certification route exists for your situation.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {certificationPaths.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-purple-300 transition-colors">
                <span className="text-sm font-medium text-purple-600 mb-2 block">{item.duration}</span>
                <h3 className="font-bold text-gray-900 text-lg mb-3">{item.path}</h3>
                <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="font-medium text-green-700">Advantages</p>
                    <p className="text-gray-500">{item.pros}</p>
                  </div>
                  <div>
                    <p className="font-medium text-amber-700">Trade-offs</p>
                    <p className="text-gray-500">{item.cons}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── IEP REALITIES ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-7 h-7 text-amber-600" />
            <h2 className="text-2xl font-bold text-gray-900">What Job Listings Do Not Tell You About the IEP Workload</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The compliance and documentation side of special education is the single largest reason teachers cite for leaving the field. Understanding what the paperwork actually entails, before you accept a position, is more important than any other piece of job research you will do.
          </p>
          <div className="space-y-4">
            {iepRealities.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Common belief: &ldquo;{item.myth}&rdquo;</h3>
                    <p className="text-gray-600 text-sm">{item.reality}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── RETENTION FACTORS ── */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Heart className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Six Factors That Determine Whether You Stay or Leave</h2>
              <p className="text-gray-700 mb-6">
                About 15% of special education teachers leave their school each year. The factors below are the most reliable predictors of whether a position will be sustainable long-term. Ask about each one during the interview process. The answers will tell you more about the job than any listing ever could.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {retentionFactors.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm">{item.factor}</h3>
                    <p className="text-gray-600 text-sm">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── LOAN FORGIVENESS ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Loan Forgiveness Programs for Special Education Teachers</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Student loan debt is one of the largest financial barriers facing new teachers. Special education teachers are uniquely positioned to benefit from multiple overlapping forgiveness programs. Used strategically, these programs can eliminate $50,000 to $100,000 or more in debt over the course of a career.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {loanForgiveness.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-1">{item.program}</h3>
                <p className="text-green-700 font-bold text-lg mb-2">{item.amount}</p>
                <p className="text-gray-600 text-sm">{item.requirement}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Program details and eligibility criteria change. Verify current requirements through the Federal Student Aid website (studentaid.gov) and your state education agency before making financial decisions based on expected forgiveness.
          </p>
        </section>

        {/* ── FAQ ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Special Education Teacher Jobs</h2>
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
            <strong>Disclaimer:</strong> Oh My Job is an independent job search platform and is not affiliated with, endorsed by, or connected to any school district, education agency, or employer listed on this page. Job listings are sourced from third-party APIs and partner networks. Salary figures are estimates based on publicly available data from the Bureau of Labor Statistics, state salary schedules, and aggregated job posting platforms and may not reflect specific offers. Certification requirements, loan forgiveness eligibility, and SPED endorsement rules vary by state. Verify all details directly with the hiring district and your state department of education before making career or financial decisions. This page is for informational purposes only and does not constitute career, legal, or financial advice.
          </p>
        </section>
      </div>
    </>
  )
}