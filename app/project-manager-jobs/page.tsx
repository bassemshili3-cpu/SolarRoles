import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, AlertTriangle, BookOpen, TrendingUp, ShieldCheck, Users } from 'lucide-react'
import { searchJobs, getCachedJobCount, AdzunaSearchResult } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'

export const metadata: Metadata = {
  title: 'Project Manager Jobs Hiring Now | PM Positions Open Across the US',
  description: 'Companies across the United States are urgently hiring project managers right now. IT, construction, healthcare, and finance PM roles available with six-figure salaries and remote options. PMP certification preferred but not always required. Apply today before these positions are filled.',
  keywords: 'project manager jobs, project manager hiring now, PM jobs, PMP jobs, IT project manager jobs, construction project manager, remote project manager jobs, senior project manager positions',
  openGraph: {
    title: 'Project Manager Jobs Hiring Immediately | PM Positions Needed Urgently',
    description: 'Hundreds of companies are actively hiring project managers across all industries. Competitive salaries, remote options, and fast hiring timelines. Apply today.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Project Manager Jobs | Hiring Immediately Across the US',
    description: 'Find project manager jobs hiring now near you. IT, construction, healthcare, and finance PM roles available with top pay and remote flexibility.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/project-manager-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Project Manager Jobs',
  description: 'Find project manager jobs hiring now across the United States. Browse IT, construction, healthcare, finance, and operations PM positions.',
  url: 'https://www.oh-my-job.com/project-manager-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Project Manager Jobs',
    description: 'Current project manager job listings across the United States',
  },
}

const industries = [
  {
    title: 'Information Technology',
    description: 'IT project managers oversee software development, infrastructure deployments, and digital transformation initiatives. Agile and Scrum fluency is highly valued, and remote work is widely available in this sector.',
    icon: ShieldCheck,
  },
  {
    title: 'Construction and Engineering',
    description: 'Construction project managers coordinate site operations, subcontractors, budgets, and schedules on building and infrastructure projects. A background in civil engineering or construction management is common.',
    icon: Briefcase,
  },
  {
    title: 'Healthcare',
    description: 'Healthcare project managers lead clinical system implementations, regulatory compliance programs, and facility expansion projects within hospital systems, insurance companies, and health tech firms.',
    icon: Users,
  },
  {
    title: 'Finance and Banking',
    description: 'Financial services firms hire project managers to lead system migrations, regulatory change programs, and product launches. Strong stakeholder management and risk assessment skills are essential.',
    icon: DollarSign,
  },
  {
    title: 'Government and Defense',
    description: 'Federal, state, and local government agencies as well as defense contractors employ project managers to oversee public infrastructure, IT modernization, and program management office functions.',
    icon: Shield,
  },
  {
    title: 'Manufacturing and Supply Chain',
    description: 'Manufacturing project managers drive process improvement initiatives, new product introductions, and facility upgrades. Lean and Six Sigma methodologies are frequently required alongside PMP certification.',
    icon: TrendingUp,
  },
]

const certificationSteps = [
  {
    step: '1',
    title: 'Meet the PMP Eligibility Requirements',
    description: 'According to the Project Management Institute (PMI), candidates for the Project Management Professional (PMP) certification must hold either a four-year degree with 36 months of project management experience, or a high school diploma with 60 months of experience. All candidates must additionally complete 35 hours of project management education or training before applying.',
  },
  {
    step: '2',
    title: 'Apply Through the PMI Portal',
    description: 'Applications are submitted through the PMI online portal and are subject to an audit process. PMI may request supporting documentation including employer verification of your project management experience hours. The application review process typically takes five to ten business days if you are not selected for audit.',
  },
  {
    step: '3',
    title: 'Pass the PMP Examination',
    description: 'The PMP exam consists of 180 questions covering predictive, agile, and hybrid project management approaches. According to PMI, the exam reflects the updated Examination Content Outline (ECO) which emphasizes people, process, and business environment domains. The exam is available at Pearson VUE test centers and online with remote proctoring.',
  },
  {
    step: '4',
    title: 'Maintain Your Certification with PDUs',
    description: 'PMP certification must be renewed every three years by earning 60 Professional Development Units (PDUs) through continuing education and professional contributions. According to PMI, at least eight PDUs must come from education activities, ensuring certified project managers remain current with evolving methodologies.',
  },
]

const salaryByIndustry = [
  { industry: 'Information Technology', salary: '$110,000 to $150,000' },
  { industry: 'Construction', salary: '$85,000 to $120,000' },
  { industry: 'Healthcare', salary: '$90,000 to $130,000' },
  { industry: 'Finance and Banking', salary: '$105,000 to $145,000' },
  { industry: 'Government and Defense', salary: '$95,000 to $135,000' },
  { industry: 'Manufacturing', salary: '$88,000 to $118,000' },
]

const methodologies = [
  'Agile and Scrum frameworks for iterative software delivery',
  'Waterfall methodology for sequential, phase-based projects',
  'Hybrid approaches combining predictive and adaptive elements',
  'PRINCE2 for structured project governance in enterprise environments',
  'Lean and Six Sigma for process improvement and waste reduction',
  'SAFe (Scaled Agile Framework) for large-scale enterprise agile programs',
  'Critical Path Method (CPM) for schedule optimization in construction',
  'PMBOK Guide standards published by the Project Management Institute',
]

const faqs = [
  {
    question: 'Is PMP certification required to get a project manager job?',
    answer: 'PMP certification is not universally required, but it is the most widely recognized and requested credential in the project management profession. According to the Project Management Institute, PMP-certified professionals earn a median salary 33 percent higher than non-certified peers in the United States. Many employers list PMP as a preferred rather than required qualification for mid-level roles, while senior and director-level positions increasingly treat it as a baseline expectation.',
  },
  {
    question: 'How much do project managers earn on average in the United States?',
    answer: 'According to the U.S. Bureau of Labor Statistics Occupational Employment and Wage Statistics program, the median annual wage for project management specialists was $98,580 in May 2023. The top 10 percent of earners exceeded $159,140 annually. Compensation varies significantly by industry, with technology and financial services project managers consistently earning above the national median. PMP certification and years of experience are the two strongest predictors of salary at the individual level.',
  },
  {
    question: 'What is the job outlook for project managers in the United States?',
    answer: 'According to the Project Management Institute Talent Gap Report, employers will need approximately 2.3 million new project-oriented professionals each year through 2030 to keep pace with demand. The U.S. Bureau of Labor Statistics projects employment of project management specialists to grow 6 percent from 2022 to 2032, faster than the average for all occupations. Technology, healthcare, and infrastructure investment are cited as the primary drivers of sustained hiring demand.',
  },
  {
    question: 'What is the difference between a project manager and a program manager?',
    answer: 'A project manager is responsible for the delivery of a single, defined project with a specific scope, timeline, and budget. A program manager oversees a group of related projects that together contribute to a broader strategic objective. According to PMI, program managers focus on the interdependencies and benefits realization across multiple projects rather than the day-to-day execution of any single one. Program manager roles typically require several years of prior project management experience and command higher compensation.',
  },
  {
    question: 'Can project managers work remotely?',
    answer: 'Remote project manager roles are among the most widely available in the profession. According to multiple labor market analyses, project management is consistently listed in the top ten occupations by volume of remote job postings. IT and software project manager roles in particular are frequently offered as fully remote positions, while construction and manufacturing project managers typically require on-site presence for at least part of their time due to the nature of physical project delivery.',
  },
  {
    question: 'What tools do project managers use on the job?',
    answer: 'Project managers work with a range of planning, collaboration, and reporting tools depending on their industry and organization. Commonly required tools include Microsoft Project for scheduling, Jira and Confluence for agile software teams, Smartsheet for cross-functional tracking, Asana and Monday.com for task management, and Salesforce or ServiceNow for enterprise project portfolio management. Proficiency in Microsoft Excel and PowerPoint for reporting and executive presentations is expected in virtually every project manager role.',
  },
]

const tips = [
  {
    title: 'Lead with Measurable Outcomes on Your Resume',
    description: 'Project manager resumes that quantify results consistently outperform those that describe responsibilities. Hiring managers respond to statements that specify budget managed, team size, delivery timeline, and cost or efficiency outcome. For example, stating that you delivered a $4.2M infrastructure modernization project three weeks ahead of schedule is significantly more compelling than describing your duties in general terms.',
  },
  {
    title: 'Obtain a Foundational Certification if You Are Entering the Field',
    description: 'If you do not yet meet the experience requirements for the PMP, the PMI Certified Associate in Project Management (CAPM) is available to candidates with a high school diploma and 23 hours of project management education. The CAPM demonstrates foundational knowledge and is widely accepted by employers as a credible entry-level qualification while you accumulate the experience hours needed for the full PMP.',
  },
  {
    title: 'Demonstrate Agile Fluency Regardless of Industry',
    description: 'According to the PMI Pulse of the Profession survey, the majority of organizations now use hybrid or agile approaches on at least some of their projects. Even project managers working in traditionally waterfall environments are increasingly expected to understand agile concepts. Adding a PMI-ACP, Certified ScrumMaster, or SAFe Agilist credential to your profile significantly broadens the range of roles you will be considered for.',
  },
  {
    title: 'Target Industries with Active Hiring Programs',
    description: 'Federal government IT modernization programs, healthcare system integrations, and infrastructure investment driven by the Infrastructure Investment and Jobs Act are generating sustained demand for project managers with sector-specific experience. Candidates who align their application materials and keywords to these active hiring markets consistently report faster response rates than those applying with generic positioning.',
  },
]

export default async function ProjectManagerJobsPage({ searchParams }: any) {
  const params = await searchParams

const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'project manager', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'project manager', where: params.where || '', results_per_page: 30, page: 1 })
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
            Project Manager Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="project manager" />
          </aside>
          <div className="flex-1">
            {count > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">{count.toLocaleString()}</span> positions available
              </p>
            )}

             {/* Client wrapper isolé — pas de use client sur la page */}
                        <AIJobMatcherWrapper />
           
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'project manager'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Industries */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Industries Actively Hiring Project Managers</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the Project Management Institute Talent Gap Report, project management roles are among the fastest-growing professional positions in the United States economy. Demand spans virtually every major industry, with technology, construction, healthcare, and government leading hiring volume.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <industry.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{industry.title}</h3>
                <p className="text-gray-600 text-sm">{industry.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PMP Certification */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">How to Earn Your PMP Certification</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            The Project Management Professional (PMP) certification, issued by the Project Management Institute (PMI), is the globally recognized standard for project management competency. According to PMI, more than one million professionals worldwide hold the PMP designation, making it the most widely sought credential in the profession.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {certificationSteps.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-green-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 font-bold rounded-full text-sm mb-4">
                  {item.step}
                </span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Salary Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">How Much Do Project Managers Earn?</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics Occupational Employment and Wage Statistics program, the median annual wage for project management specialists was $98,580 in May 2023. PMP-certified project managers earn a median of 33 percent more than their non-certified peers according to PMI research, with compensation in technology and financial services consistently outpacing other sectors.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">$98,580</p>
                <p className="text-sm text-gray-600">Median Annual Wage (BLS 2023)</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-blue-600 mb-2">$47.39</p>
                <p className="text-sm text-gray-600">Median Hourly Rate</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-purple-600 mb-2">$159,000+</p>
                <p className="text-sm text-gray-600">Top 10% of Earners</p>
              </div>
            </div>
            <h3 className="font-semibold text-gray-800 mb-4">Average Project Manager Salary by Industry</h3>
            <div className="grid md:grid-cols-3 gap-3">
              {salaryByIndustry.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-3 flex justify-between items-center">
                  <span className="text-sm text-gray-700 font-medium">{item.industry}</span>
                  <span className="text-sm font-bold text-green-600">{item.salary}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics, May 2023. Industry salary ranges are estimates based on publicly reported compensation data and vary by location, employer, and experience level.
            </p>
          </div>
        </section>

        {/* Career Ladder */}
        <section className="mt-20">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <TrendingUp className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">The Project Manager Career Ladder</h2>
                <p className="text-gray-700 mb-4">
                  Project management offers one of the clearest career progression pathways in the professional workforce. Entry-level coordinators can advance to senior program managers and PMO directors within a decade, particularly when PMP certification is combined with demonstrated delivery results. Many project managers also move laterally into product management, operations leadership, or consulting roles.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-6 flex-wrap">
                  {['Project Coordinator', 'Associate PM', 'Project Manager', 'Senior PM', 'Program Manager', 'PMO Director'].map((level, index, arr) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="bg-white border border-blue-200 rounded-lg px-4 py-2 text-sm font-semibold text-blue-700">
                        {level}
                      </div>
                      {index < arr.length - 1 && (
                        <span className="text-blue-400 font-bold hidden sm:block">→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Methodologies */}
        <section className="mt-20">
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <FileText className="w-8 h-8 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Management Methodologies Employers Require</h2>
                <p className="text-gray-700 mb-6">
                  According to the PMI Pulse of the Profession survey, the majority of organizations use hybrid approaches that blend predictive and agile methodologies. Employers across industries increasingly expect project managers to be fluent in multiple frameworks rather than a single approach. The following methodologies appear most frequently in U.S. project manager job postings:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {methodologies.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Work Arrangements */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Project Manager Work Arrangements</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Project management is one of the most flexible professional roles in terms of work arrangement. Remote, hybrid, and on-site positions are all actively advertised, with availability varying significantly by industry and employer type.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { type: 'Fully Remote', note: 'Most common in IT and software sectors; increasingly available in finance and healthcare', icon: MapPin },
              { type: 'Hybrid', note: '2 to 3 days on-site per week; standard arrangement at enterprise employers and government contractors', icon: Clock },
              { type: 'On-Site', note: 'Required for construction, manufacturing, and government facility projects where physical presence is essential', icon: Briefcase },
              { type: 'Contract and Consulting', note: 'High-demand PMs frequently work on fixed-term contracts at daily or hourly rates, often earning above salaried equivalents', icon: FileText },
            ].map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-2">{item.type}</p>
                <p className="text-gray-500 text-xs">{item.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing a Project Manager Job</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {tips.map((tip, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 font-bold rounded-full text-sm mb-4">
                  {index + 1}
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
            <Shield className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Project Manager Jobs</h2>
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

        {/* Disclaimer */}
        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> The salary figures, employment projections, and certification information provided on this page are for general informational purposes only and do not constitute legal or career advice. Project manager compensation and certification requirements vary by employer, industry, location, and experience level. Always consult the U.S. Bureau of Labor Statistics at bls.gov, the Project Management Institute at pmi.org, and individual employer requirements for the most current and applicable information.
          </p>
        </section>
      </div>
    </>
  )
}