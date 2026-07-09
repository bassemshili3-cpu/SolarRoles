import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Users, Clock, Shield, FileText, DollarSign, Briefcase, CheckCircle, AlertTriangle, BookOpen, Award, TrendingUp, Building2, Target, Layers } from 'lucide-react'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'HR Jobs | Human Resources, Talent & People Ops Roles',
  description: 'HR Generalist, HRBP, Compensation, and HRIS roles at companies of every size. Specialty, seniority, and remote work options shown per opening.',
  keywords: 'hr jobs, human resources jobs, hr generalist jobs, talent acquisition jobs, people operations jobs, hrbp jobs, hr business partner jobs, compensation analyst jobs, hris jobs',
  openGraph: {
    title: 'HR Jobs | HR Generalist, HRBP & People Ops Positions',
    description: 'Browse open HR positions in talent acquisition, HRBP, people operations, compensation, employee relations, and HRIS across the United States.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HR Jobs | Talent Acquisition, HRBP, People Operations',
    description: 'Hundreds of HR positions hiring now. Specializations include TA, HRBP, comp, ER, people analytics, HRIS, and L&D.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/hr-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'HR Jobs',
  description: 'Find human resources jobs hiring across the United States in talent acquisition, HRBP, people operations, compensation, and HRIS specializations.',
  url: 'https://www.oh-my-job.com/hr-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available HR Jobs',
    description: 'Current HR positions across multiple specializations and company sizes in the United States',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What HR specializations are most in demand right now?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Talent Acquisition, HR Business Partner, People Analytics, HRIS Administration, and Compensation are the highest-demand specializations as of 2026. Companies are moving away from pure HR Generalist roles in favor of specialists who can own a specific function deeply. People Analytics and HRIS in particular have seen explosive growth as HR shifts toward data-driven decision making.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between HR and People Operations?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'People Operations (often called People Ops or PeopleOps) is the modern reframing of HR that emerged from tech companies. The core difference is mindset: traditional HR focuses on policy compliance and risk management, while People Ops focuses on employee experience and operational efficiency. The actual responsibilities overlap significantly. In practice, choosing between an HR title and a People Ops title is often a signal about the company culture you would be joining.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you need an HR certification to get an HR job?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, certifications are not legally required, but they significantly affect salary and advancement. The most recognized credentials are SHRM-CP and SHRM-SCP (issued by SHRM), and PHR, SPHR, and aPHR (issued by HRCI). For entry-level roles, aPHR is sufficient. For HR Business Partner and senior roles, SHRM-CP or PHR is increasingly expected. Certified HR professionals typically earn 10 to 20 percent more than uncertified peers at the same level.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much do HR jobs pay in the United States?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pay varies widely by specialization, company size, and region. Entry-level HR Coordinator roles start at $45,000 to $55,000. HR Generalists earn $55,000 to $75,000. HR Business Partners earn $75,000 to $110,000. Senior specialists in Compensation, People Analytics, or HRIS can earn $90,000 to $140,000. HR Directors and VPs of People earn $130,000 to $250,000+. Tech and finance industries pay at the top of these ranges.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can you transition into HR from another field?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, HR is one of the most accessible fields for career transitions. The most common entry paths are from administrative roles, customer service, recruiting, project management, and operations. Direct paths include HR Coordinator and HR Assistant positions, which require organizational skills and people sensitivity more than formal HR training. Earning an aPHR certification while applying shortens the transition timeline significantly.',
      },
    },
    {
      '@type': 'Question',
      name: 'What HR software should you learn to be competitive?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The most widely used HRIS platforms are Workday (enterprise), ADP (mid-market and enterprise), BambooHR (small to mid), and Rippling (modern startups). For recruiting, Greenhouse, Lever, and Workday Recruiting dominate. For performance and engagement, Lattice, 15Five, and Culture Amp lead. Knowing one HRIS platform deeply matters more than touching all of them. Workday certifications are particularly valuable for enterprise HR roles.',
      },
    },
  ],
}

const specializations = [
  {
    name: 'Talent Acquisition',
    abbreviation: 'TA',
    description: 'Owns recruiting, sourcing, candidate evaluation, and hiring strategy. Splits into Recruiters (handle requisitions) and Sourcers (build candidate pipelines). Tech-heavy role with deep use of LinkedIn Recruiter, Greenhouse, and Lever.',
    payRange: '$60,000 to $130,000',
    icon: Target,
  },
  {
    name: 'HR Business Partner',
    abbreviation: 'HRBP',
    description: 'Embedded with a specific business unit to advise managers on people decisions, drive talent strategy, and resolve complex employee issues. The most strategic generalist role. Strong demand at companies above 200 employees.',
    payRange: '$75,000 to $135,000',
    icon: Briefcase,
  },
  {
    name: 'People Operations',
    abbreviation: 'People Ops',
    description: 'The modern reframing of HR ops, focused on employee experience, internal systems, and lifecycle automation. Common at tech companies. Often combines HRIS administration, onboarding design, and program management.',
    payRange: '$70,000 to $120,000',
    icon: Layers,
  },
  {
    name: 'Compensation and Benefits',
    abbreviation: 'Comp',
    description: 'Designs pay structures, runs market benchmarking, manages bonus and equity programs, and administers health and retirement benefits. Highly analytical, often Excel and Python heavy at larger companies.',
    payRange: '$80,000 to $145,000',
    icon: DollarSign,
  },
  {
    name: 'Employee Relations',
    abbreviation: 'ER',
    description: 'Handles investigations, performance management, terminations, and workplace disputes. The legally sensitive side of HR. Often staffed by HRBPs or dedicated ER specialists at companies above 1000 employees.',
    payRange: '$70,000 to $125,000',
    icon: Shield,
  },
  {
    name: 'Learning and Development',
    abbreviation: 'L&D',
    description: 'Designs and delivers training programs, manager development, and career frameworks. Increasingly tech-enabled with LMS platforms, microlearning, and AI tutors. Strong overlap with internal communications.',
    payRange: '$65,000 to $115,000',
    icon: BookOpen,
  },
  {
    name: 'People Analytics',
    abbreviation: 'PA',
    description: 'Builds dashboards and runs analyses on workforce data: turnover, hiring funnel metrics, engagement, comp equity, and DEIB tracking. Bridges HR and data science. SQL, Python, and Tableau are common requirements.',
    payRange: '$85,000 to $150,000',
    icon: TrendingUp,
  },
  {
    name: 'HRIS Administration',
    abbreviation: 'HRIS',
    description: 'Owns the HR technology stack: Workday, ADP, BambooHR, and integrations between systems. Configures workflows, runs reporting, and supports cross-functional projects. Highest demand specialization in 2026.',
    payRange: '$75,000 to $140,000',
    icon: Layers,
  },
  {
    name: 'DEIB and Culture',
    abbreviation: 'DEIB',
    description: 'Designs and runs diversity, equity, inclusion, and belonging programs. Owns culture surveys, ERG (Employee Resource Group) support, and inclusion training. Often reports into HR or directly to the CEO at progressive companies.',
    payRange: '$80,000 to $140,000',
    icon: Users,
  },
]

const rolesByCompanySize = [
  {
    size: 'Startup (Under 50 employees)',
    description: 'Often one HR person doing everything: recruiting, onboarding, payroll, benefits, employee relations, and culture. Title usually HR Manager or People Ops Lead. Requires comfort with ambiguity and broad responsibility.',
    typicalRoles: 'HR Manager, People Ops Lead, Office Manager (HR responsibilities)',
    avgPay: '$60,000 to $95,000',
  },
  {
    size: 'Small Business (50 to 200)',
    description: 'A small HR team of 2 to 4 people split between an HR Manager (strategic) and HR Coordinator(s) (transactional). Specializations begin to emerge but most people remain generalists. Often a fractional HR consultant supports complex issues.',
    typicalRoles: 'HR Manager, HR Generalist, HR Coordinator',
    avgPay: '$50,000 to $95,000',
  },
  {
    size: 'Mid-Market (200 to 1000)',
    description: 'Specialized HR team of 5 to 15. Recruiting, HRBP, comp, and HRIS roles become distinct. Senior HR Director or VP of People leads. Strong investment in HR tech stack and process documentation.',
    typicalRoles: 'HRBP, TA Manager, Comp Analyst, HRIS Analyst, HR Director',
    avgPay: '$65,000 to $145,000',
  },
  {
    size: 'Enterprise (1000 to 10,000)',
    description: 'Multi-layered HR organization with deep specialization. Separate teams for TA, total rewards, L&D, people analytics, ER, and DEIB. Senior HRBPs embedded with major business units. CHRO sits on executive committee.',
    typicalRoles: 'Senior HRBP, Comp Manager, People Analytics Lead, ER Specialist, Director of TA',
    avgPay: '$75,000 to $200,000',
  },
  {
    size: 'Large Enterprise (10,000+)',
    description: 'Global HR organization with hundreds of practitioners. Centers of Excellence model: dedicated teams for every specialization. HRBP roles often align with executive leaders. Workday or SAP SuccessFactors at the core.',
    typicalRoles: 'VP HRBP, Global Comp Director, Head of People Analytics, CHRO, Chief People Officer',
    avgPay: '$95,000 to $300,000+',
  },
]

const certificationLadder = [
  {
    name: 'aPHR (Associate Professional in Human Resources)',
    issuer: 'HRCI',
    level: 'Entry',
    eligibility: 'No experience required; designed for new entrants',
    cost: '~$395 exam fee',
    description: 'Best certification for those entering HR with no prior experience. Demonstrates baseline knowledge and signals commitment to the field. Often earned while interviewing for first HR roles.',
  },
  {
    name: 'SHRM-CP (Certified Professional)',
    issuer: 'SHRM',
    level: 'Mid-level',
    eligibility: 'HR experience or HR-related degree required',
    cost: '~$410 for SHRM members',
    description: 'Most widely recognized HR certification in the US. Required or strongly preferred for HRBP and HR Manager roles. Competency-based exam covering both knowledge and behavioral application.',
  },
  {
    name: 'PHR (Professional in Human Resources)',
    issuer: 'HRCI',
    level: 'Mid-level',
    eligibility: '1 to 4 years of HR experience depending on education',
    cost: '~$495 exam fee',
    description: 'Traditional alternative to SHRM-CP. Tactical focus on HR operations and program implementation. Still strongly recognized, particularly at companies with established HR functions.',
  },
  {
    name: 'SHRM-SCP (Senior Certified Professional)',
    issuer: 'SHRM',
    level: 'Senior',
    eligibility: 'Significant HR leadership experience',
    cost: '~$410 for SHRM members',
    description: 'Senior credential demonstrating strategic HR leadership capability. Increasingly expected at Director and VP levels. Focus on policy development, organizational effectiveness, and HR strategy.',
  },
  {
    name: 'SPHR (Senior Professional in Human Resources)',
    issuer: 'HRCI',
    level: 'Senior',
    eligibility: '4 to 7 years of HR experience plus education',
    cost: '~$495 exam fee',
    description: 'HRCI senior credential focused on strategic and policy-level HR. Strong recognition in legacy industries and government. Some HR leaders hold both SHRM-SCP and SPHR for maximum credibility.',
  },
  {
    name: 'Specialty Certifications',
    issuer: 'Various',
    level: 'Specialized',
    eligibility: 'Varies by specialty',
    cost: '$200 to $2,000',
    description: 'CCP (Certified Compensation Professional), CEBS (Certified Employee Benefits Specialist), and Workday Certifications are highly valued for specialized roles. Often paid for by employers.',
  },
]

const careerLadder = [
  {
    step: '1',
    title: 'HR Coordinator or HR Assistant',
    description: 'Entry point. Handle scheduling, paperwork, onboarding logistics, and basic employee questions. Build foundational knowledge of HR operations and the company. Typically 1 to 2 years in role.',
  },
  {
    step: '2',
    title: 'HR Generalist or Specialist',
    description: 'First full-scope HR role. Handle multiple functions or specialize in one (recruiting, benefits, training). Earn first certification (aPHR or SHRM-CP). Typically 2 to 4 years in role.',
  },
  {
    step: '3',
    title: 'HR Business Partner or Senior Specialist',
    description: 'Advise managers on people decisions, lead complex projects, own a function deeply. Most common pivot point in HR careers: continue toward leadership or deepen as a specialist. Typically 3 to 5 years.',
  },
  {
    step: '4',
    title: 'HR Manager, Senior HRBP, or Functional Lead',
    description: 'Manage other HR professionals, own strategic outcomes for a business unit or function. SHRM-SCP or SPHR typically expected. Strong overlap with operations and finance leaders at this level.',
  },
  {
    step: '5',
    title: 'HR Director, VP of People, CHRO',
    description: 'Executive HR leadership. Set HR strategy, lead organizational design, advise CEO on people decisions. Often a member of the executive team. Compensation includes equity at venture-backed and public companies.',
  },
]

const dayInTheLife = [
  { time: '8:30 AM', activity: 'Inbox triage, review urgent employee requests, calendar check', icon: Clock },
  { time: '9:00 AM to 10:00 AM', activity: 'Manager 1:1: support a leader through a difficult team situation', icon: Users },
  { time: '10:00 AM to 11:00 AM', activity: 'Interview panel: final-round candidate for a senior engineering role', icon: Target },
  { time: '11:00 AM to 12:00 PM', activity: 'Compensation review: analyze pay equity data for upcoming promotion cycle', icon: DollarSign },
  { time: '12:00 PM to 1:00 PM', activity: 'Lunch (often working) and async Slack/Teams responses', icon: Clock },
  { time: '1:00 PM to 2:30 PM', activity: 'Project work: design new onboarding program for a department of 40', icon: Layers },
  { time: '2:30 PM to 3:30 PM', activity: 'Sensitive employee conversation: performance issue documentation', icon: Shield },
  { time: '3:30 PM to 4:30 PM', activity: 'HRIS update meeting with IT: troubleshoot reporting issue in Workday', icon: FileText },
  { time: '4:30 PM to 5:30 PM', activity: 'Catch up on documentation, prep tomorrow agenda, follow-up emails', icon: CheckCircle },
]

const techStackByRole = [
  {
    role: 'Talent Acquisition',
    tools: 'LinkedIn Recruiter, Greenhouse or Lever, Gem (sourcing), HireVue (interviews), Calendly',
  },
  {
    role: 'HRBP / Generalist',
    tools: 'Workday, ADP, BambooHR, Lattice (performance), Culture Amp (engagement)',
  },
  {
    role: 'People Operations',
    tools: 'Rippling or Justworks, Notion, Slack, Zapier, Lattice',
  },
  {
    role: 'Compensation',
    tools: 'Excel (always), Radford or Mercer (benchmarking), Pave or CompTool, Workday Comp module',
  },
  {
    role: 'People Analytics',
    tools: 'SQL, Tableau or Looker, Python (pandas), Workday reporting, Visier',
  },
  {
    role: 'HRIS',
    tools: 'Workday or ADP (deep expertise), SQL, Boomi or Workato (integrations), Excel',
  },
  {
    role: 'L&D',
    tools: 'LMS (Cornerstone, Docebo), Articulate or Vyond (course building), Zoom, Notion',
  },
  {
    role: 'DEIB',
    tools: 'Culture Amp, Glint, Tableau, ERG platforms (Cherry, Mogul), survey tools',
  },
]

const interviewSignals = [
  {
    title: 'How is HR Positioned in the Org Chart?',
    description: 'If HR reports through Finance or Legal rather than directly to the CEO, the function is treated as overhead rather than strategic. Companies where the top HR leader is on the executive team and the company tells you who their CHRO or VP of People is signal that HR has real influence. Ask explicitly: "Who does the head of HR report to, and are they on the executive team?"',
  },
  {
    title: 'What is the HR to Employee Ratio?',
    description: 'A common benchmark is one HR person per 100 employees. Above 150 to 1, you will be overwhelmed and unable to do strategic work. Below 80 to 1, the function is well resourced. The ratio reveals more about working conditions than any cultural value statement. Ask: "How many HR team members support how many employees?"',
  },
  {
    title: 'Do They Invest in HR Technology?',
    description: 'Companies still running HR on spreadsheets and email at 200+ employees signal that they undervalue the function. Modern HR teams use Workday, Rippling, BambooHR, or similar. Ask what HRIS, ATS, and performance tools the company uses. Vague answers usually mean homegrown systems and process gaps.',
  },
  {
    title: 'How Are Difficult Decisions Handled?',
    description: 'Layoffs, terminations, harassment investigations, and pay equity disputes are unavoidable. Ask how the company has handled difficult HR situations in the past 12 months. A leader who can speak honestly about specifics signals a culture where HR has standing. Evasive answers signal HR exists to protect the company from employees rather than to support both.',
  },
]

const faqs = [
  {
    question: 'Is the HR Generalist role still relevant in 2026?',
    answer: 'Yes at small and mid-sized companies, increasingly less so at enterprises. Companies under 200 employees still need generalists who can handle a broad scope. Above that size, specialization has become the dominant model. HRBP has effectively replaced the senior Generalist title at most large companies. If you are early in your career, generalist experience is still valuable as a foundation, but plan to specialize within 5 to 7 years to maximize earning potential.',
  },
  {
    question: 'What is the actual difference between HRBP and HR Generalist?',
    answer: 'HR Generalists handle a broad range of HR functions across the company or a small business unit, often more transactional and operational. HRBPs are embedded with a specific business unit or function (engineering, sales, etc.) and operate as strategic advisors to that leader. The HRBP role is more consultative, less hands-on with paperwork, and requires stronger business acumen. HRBPs typically earn 20 to 35 percent more than HR Generalists at the same company.',
  },
  {
    question: 'Which industries pay HR professionals the most?',
    answer: 'Technology, finance, and biotech consistently top HR compensation surveys. A senior HRBP at a major tech company often earns 40 to 60 percent more than the same role at a manufacturing or retail company. Compensation specialists at financial services firms can clear $200,000+ at senior levels. Healthcare, education, and nonprofit sectors pay at the lower end but offer more stable employment and stronger benefits.',
  },
  {
    question: 'How long does it take to become an HR Director?',
    answer: 'The typical path takes 10 to 15 years from entry-level Coordinator to Director. Faster paths exist for high performers who specialize early and join high-growth companies. Some HR professionals reach Director title at 8 to 10 years of experience by joining startups that grow rapidly. The CHRO path typically requires 15 to 25 years and at least one prior VP-level role at a comparable company.',
  },
  {
    question: 'Can you work in HR remotely?',
    answer: 'Many HR roles support fully remote or hybrid work, particularly Talent Acquisition, People Analytics, HRIS, Compensation, and L&D. Roles requiring face-to-face employee interaction (Employee Relations, frontline HRBP) more often require hybrid presence. Companies vary widely. As of 2026, about 35 percent of HR job postings advertise remote-eligibility according to industry data.',
  },
  {
    question: 'What is the future of HR as AI advances?',
    answer: 'AI is reshaping HR work rather than replacing it. Recruiting automation, predictive analytics, conversational AI for employee questions, and automated documentation are taking over routine work. The roles growing fastest are those requiring judgment, relationships, and strategic thinking: HRBP, People Analytics, ER, and DEIB. Roles centered on transactional work (basic coordination, manual reporting) are shrinking. The path forward is to develop specialization, analytical fluency, and business acumen.',
  },
]

export default async function HRJobsPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'human resources', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'human resources', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            HR Jobs Hiring Now Across the United States
          </h1>
          <p className="text-gray-700">
            Browse open human resources positions across talent acquisition, HRBP, people operations, compensation, HRIS, and specialist tracks at companies of every size.
          </p>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="human resources" />
          </aside>
          <div className="flex-1">
            
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList what={params.what || 'human resources'} where={params.where || ''} salary_min={params.salary_min} initialData={initialData} />
            </Suspense>
          </div>
        </div>

        {/* ── SPECIALIZATIONS MAP ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Layers className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">The Nine HR Specializations You Need to Know</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            HR is no longer one job. Over the past decade, the field has split into nine distinct specializations, each with its own skill set, tools, and pay ceiling. Choosing where to focus matters more than ever because Generalist roles are slowly being replaced by deep specialists. Here is the current map.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specializations.map((spec, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-3">
                  <spec.icon className="w-10 h-10 text-blue-600" />
                  <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">{spec.abbreviation}</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{spec.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{spec.description}</p>
                <p className="text-sm font-bold text-green-700">{spec.payRange}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── ROLES BY COMPANY SIZE ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Same Title, Different Job: HR Roles by Company Size</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            An HR Manager at a 30-person startup does completely different work than an HR Manager at a 5,000-person company. The title is the same. The job is not. Understanding the company-size landscape is critical when evaluating where to take your career. Here is what HR work actually looks like at each scale.
          </p>
          <div className="space-y-4">
            {rolesByCompanySize.map((tier, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-3">
                  <h3 className="font-bold text-gray-900 text-lg">{tier.size}</h3>
                  <span className="text-sm font-bold text-green-700 whitespace-nowrap">{tier.avgPay}</span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{tier.description}</p>
                <div className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">Common titles:</span> {tier.typicalRoles}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CERTIFICATION LADDER ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-amber-600" />
            <h2 className="text-2xl font-bold text-gray-900">HR Certifications: SHRM vs HRCI, and Which to Pursue When</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The HR certification market is dominated by two competing bodies: SHRM (Society for Human Resource Management) and HRCI (HR Certification Institute). Both are recognized, but they emphasize different things and certain industries prefer one over the other. Picking the right certification at the right career stage matters more than collecting alphabet soup.
          </p>
          <div className="space-y-4">
            {certificationLadder.map((cert, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{cert.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">Issued by {cert.issuer} · {cert.level} · Cost: {cert.cost}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{cert.description}</p>
                <p className="text-xs text-gray-500"><span className="font-semibold">Eligibility:</span> {cert.eligibility}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CAREER LADDER ── */}
        <section className="mt-20 bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <TrendingUp className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">The Five-Step HR Career Ladder</h2>
              <p className="text-gray-700 mb-6">
                HR careers follow a relatively predictable structure, with a critical pivot point around years 3 to 5 where most professionals decide between continuing as a generalist toward leadership or specializing deeply in one function. Here is the path most HR careers actually follow.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {careerLadder.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-5">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-amber-100 text-amber-700 font-bold rounded-full text-sm mb-3">{item.step}</span>
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── DAY IN THE LIFE ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">A Real Day in HR: Hour by Hour</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            HR work is famously fragmented. A typical day for an HR Business Partner at a mid-sized company involves switching between strategic projects, employee conversations, manager coaching, and operational tasks. Below is what that actually looks like when mapped onto a calendar.
          </p>
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="space-y-4">
              {dayInTheLife.map((item, i) => (
                <div key={i} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <item.icon className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.time}</p>
                    <p className="text-sm text-gray-600">{item.activity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TECH STACK ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Layers className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">HR Tech Stack: What to Learn for Each Specialization</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Modern HR roles increasingly require fluency with specific tools. The platforms vary by specialization. Knowing one HRIS deeply matters more than touching all of them, but knowing which tools are common in your target specialization helps you focus your learning. Below is the current tool landscape by HR function.
          </p>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-2 gap-px bg-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="bg-white px-5 py-3">Specialization</div>
              <div className="bg-white px-5 py-3">Common Tools</div>
            </div>
            {techStackByRole.map((row, i) => (
              <div key={i} className="grid grid-cols-2 gap-px bg-gray-100">
                <div className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-5 py-3.5 text-sm font-medium text-gray-800`}>{row.role}</div>
                <div className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-5 py-3.5 text-sm text-gray-600`}>{row.tools}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── INTERVIEW SIGNALS ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Four Signals That Tell You if HR Is Respected at a Company</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            HR is positioned very differently across companies. At some organizations, HR is a strategic partner with real influence on business decisions. At others, HR is treated as an administrative function that exists to process paperwork. The difference dramatically affects your day-to-day experience and career trajectory. These four signals reveal where on that spectrum a company sits.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {interviewSignals.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 font-bold rounded-full text-sm mb-4">{index + 1}</span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── AI IMPACT SECTION ── */}
        <section className="mt-20">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <TrendingUp className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">AI is Reshaping HR Work: What Changes and What Does Not</h2>
                <p className="text-gray-700 mb-4">
                  Artificial intelligence has hit HR harder than most fields realized would happen by 2026. Recruiting screening, employee policy chatbots, automated documentation, and predictive analytics on turnover are now mainstream tools at companies above 500 employees. Understanding what AI changes (and what it does not) is critical for positioning your career.
                </p>
                <p className="text-gray-700 mb-4">
                  The roles being reduced are those built around routine processing: HR coordinators who handle basic question-answering, junior recruiters who do early-stage candidate screening, and L&D specialists who build training decks from scratch. Companies are running leaner in these areas because AI handles the bulk of the work.
                </p>
                <p className="text-gray-700">
                  The roles growing fastest require judgment, trust, and strategic thinking: HR Business Partners advising executives, People Analytics professionals translating data into action, Employee Relations specialists handling sensitive situations, and DEIB leaders driving cultural change. These roles depend on context, relationships, and ethical reasoning that AI cannot replicate. Building expertise in these areas is the safest career bet in HR right now.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About HR Jobs</h2>
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
            <strong>Disclaimer:</strong> This page provides general information about HR careers in the United States. Salary figures are illustrative and reflect typical ranges reported by industry sources; actual compensation depends on the employer, location, specialization, and experience level. Certification names, fees, and eligibility requirements are subject to change and should be verified directly with SHRM and HRCI. Tool and platform recommendations reflect the current market landscape but evolve continuously. Oh My Job is not affiliated with SHRM, HRCI, or any of the HR technology vendors mentioned on this page.
          </p>
        </section>
      </div>
    </>
  )
}