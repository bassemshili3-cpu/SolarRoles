import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Users, DollarSign, MapPin, CheckCircle, BookOpen, Award, TrendingUp, FileText, Briefcase, Shield, Laptop, Globe, Clock, GraduationCap } from 'lucide-react'
import { searchJobs, getCachedJobCount, AdzunaSearchResult } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Remote HR Jobs | Work-From-Home HR & Recruiting Roles',
  description: 'Hundreds of remote HR jobs hiring immediately. Work from home as a recruiter, HR generalist, benefits specialist and more. Full time and part time positions with top companies. Browse openings and apply now!',
  keywords: 'remote hr jobs, work from home hr jobs, remote human resources jobs, remote recruiter jobs, remote hr generalist, virtual hr positions, remote hr coordinator, telecommute hr jobs',
  openGraph: {
    title: 'Remote HR Jobs | Generalist, Recruiter & Benefits Roles',
    description: 'Companies urgently seeking remote HR professionals. Recruiters, generalists, benefits specialists and more. Find your ideal work from home HR position today!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Remote HR Jobs | Full-Time & Part-Time WFH Positions',
    description: 'Remote HR positions needed ASAP. From recruiting to employee relations, browse hundreds of work from home HR openings. Apply in minutes!',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/remote-hr-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Remote HR Jobs',
  description: 'Find remote HR jobs hiring across the United States. Browse hundreds of work from home positions in human resources, recruiting, and people operations.',
  url: 'https://www.oh-my-job.com/remote-hr-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Remote HR Jobs',
    description: 'Current remote job listings for human resources professionals nationwide',
  },
}

const remoteHRRoles = [
  { title: 'Remote HR Generalist', description: 'Handle a broad range of human resources functions including onboarding, policy administration, employee relations, and compliance from a home office', icon: Users },
  { title: 'Remote Recruiter', description: 'Source, screen, and hire talent for organizations using virtual interview platforms, applicant tracking systems, and online job boards', icon: Briefcase },
  { title: 'Remote Benefits Specialist', description: 'Administer employee benefits programs including health insurance, retirement plans, and leave policies while coordinating with carriers and vendors remotely', icon: Shield },
  { title: 'Remote HR Coordinator', description: 'Provide administrative support to HR teams by managing employee records, scheduling interviews, and processing paperwork through HRIS platforms', icon: FileText },
  { title: 'Remote Compensation Analyst', description: 'Research market salary data, develop pay structures, and conduct equity analyses to help organizations attract and retain talent competitively', icon: DollarSign },
  { title: 'Remote People Operations Manager', description: 'Design and implement people strategies, drive culture initiatives, and optimize HR processes for distributed and hybrid workforces', icon: Globe },
]

const salaryByRole = [
  { role: 'HR Coordinator (Remote)', range: '$42,000 to $55,000', note: 'Entry to mid level, strong demand for HRIS proficiency' },
  { role: 'HR Generalist (Remote)', range: '$55,000 to $75,000', note: 'Broad responsibilities, salary varies by company size' },
  { role: 'Recruiter (Remote)', range: '$50,000 to $80,000', note: 'Base salary plus commission or bonus structures are common' },
  { role: 'Benefits Specialist (Remote)', range: '$55,000 to $72,000', note: 'Higher pay in industries with complex benefits packages' },
  { role: 'Compensation Analyst (Remote)', range: '$65,000 to $90,000', note: 'Specialized role with strong demand in tech and finance' },
  { role: 'HR Manager (Remote)', range: '$80,000 to $120,000+', note: 'Leadership role overseeing teams and strategic initiatives' },
]

const essentialTools = [
  { tool: 'HRIS Platforms', examples: 'Workday, BambooHR, ADP, UKG', description: 'Human Resource Information Systems are the backbone of remote HR work, used to manage employee data, payroll, benefits enrollment, and compliance documentation' },
  { tool: 'Applicant Tracking Systems', examples: 'Greenhouse, Lever, iCIMS, Workable', description: 'ATS platforms enable remote recruiters to manage the full hiring pipeline from job posting through offer letter, with collaboration features for distributed teams' },
  { tool: 'Video Conferencing', examples: 'Zoom, Microsoft Teams, Google Meet', description: 'Essential for conducting virtual interviews, employee check ins, team meetings, and delivering training sessions across multiple time zones' },
  { tool: 'Communication and Collaboration', examples: 'Slack, Microsoft Teams, Asana, Monday', description: 'Remote HR professionals rely on chat, project management, and task tracking tools to stay connected with employees and leadership teams' },
  { tool: 'E Signature and Document Management', examples: 'DocuSign, Adobe Sign, PandaDoc', description: 'Facilitate remote onboarding, contract signing, policy acknowledgments, and other document workflows without physical paperwork' },
  { tool: 'Learning Management Systems', examples: 'Cornerstone, LinkedIn Learning, Lessonly', description: 'Used to create, deliver, and track employee training programs, compliance courses, and professional development content remotely' },
]

const certifications = [
  { name: 'SHRM Certified Professional (SHRM CP)', provider: 'Society for Human Resource Management', description: 'According to SHRM, the SHRM CP is designed for HR professionals who implement policies, serve as the point of contact for staff and stakeholders, and perform operational HR functions. It is one of the most widely recognized HR credentials in the United States.' },
  { name: 'Professional in Human Resources (PHR)', provider: 'HR Certification Institute (HRCI)', description: 'According to HRCI, the PHR demonstrates mastery of the technical and operational aspects of HR management, including U.S. employment laws and regulations. It is ideal for professionals focused on program implementation.' },
  { name: 'SHRM Senior Certified Professional (SHRM SCP)', provider: 'Society for Human Resource Management', description: 'Designed for senior HR leaders who develop strategies, lead the HR function, and align HR activities with organizational goals. Requires significant professional experience.' },
  { name: 'Certified Compensation Professional (CCP)', provider: 'WorldatWork', description: 'A specialized certification for professionals focused on compensation strategy, pay structure design, and total rewards. Increasingly valuable in remote roles that manage distributed workforce compensation.' },
]

const remoteWorkLaws = [
  { topic: 'Multi State Tax Compliance', description: 'According to the IRS and individual state tax authorities, remote employees may create tax nexus in the state where they physically work. Remote HR professionals must understand state income tax withholding requirements when employees work across state lines.' },
  { topic: 'FLSA and Remote Work', description: 'According to the U.S. Department of Labor, the Fair Labor Standards Act (FLSA) applies to remote workers the same as on site employees. Employers must track hours worked, ensure minimum wage compliance, and pay overtime for non exempt remote employees.' },
  { topic: 'OSHA and Home Office Safety', description: 'According to the Occupational Safety and Health Administration (OSHA), employers are generally not responsible for inspecting home offices. However, they remain responsible for ensuring that the work being performed at home is safe and compliant with OSHA standards.' },
  { topic: 'I 9 Verification for Remote Hires', description: 'According to U.S. Citizenship and Immigration Services (USCIS), employers must complete Form I 9 for all new hires. For remote employees, authorized representatives may examine identity and employment eligibility documents on behalf of the employer.' },
  { topic: 'ADA Accommodations for Remote Workers', description: 'According to the U.S. Equal Employment Opportunity Commission (EEOC), employers must consider remote work as a reasonable accommodation under the Americans with Disabilities Act when it would not create an undue hardship for the organization.' },
]

const topHiringIndustries = [
  { industry: 'Technology', detail: 'Tech companies were early adopters of remote work and consistently offer the highest volume of fully remote HR positions across all levels' },
  { industry: 'Healthcare and Insurance', detail: 'Large health systems and insurance providers hire remote HR professionals to manage benefits administration, credentialing, and compliance for distributed staff' },
  { industry: 'Financial Services', detail: 'Banks, fintech companies, and financial institutions employ remote HR teams for talent acquisition, compensation analysis, and regulatory compliance' },
  { industry: 'Professional Services and Consulting', detail: 'Consulting firms and staffing agencies rely on remote HR and recruiting specialists to source and manage talent for clients nationwide' },
  { industry: 'E Commerce and Retail', detail: 'Online retailers with large seasonal and warehouse workforces hire remote HR coordinators and recruiters to manage high volume onboarding' },
  { industry: 'Education and EdTech', detail: 'Universities and educational technology companies increasingly offer remote HR roles to support distributed faculty and administrative teams' },
]

const tipsForRemoteHR = [
  { title: 'Master HRIS Technology', description: 'Proficiency in platforms like Workday, BambooHR, or ADP is often a baseline requirement. Invest time in tutorials, certifications, or free trials to build hands on experience before applying.' },
  { title: 'Understand Multi State Compliance', description: 'Remote HR professionals frequently manage employees across multiple states. Familiarity with varying state labor laws, tax requirements, and leave policies will set you apart from other candidates.' },
  { title: 'Highlight Virtual Communication Skills', description: 'Demonstrate your ability to build relationships, resolve conflicts, and deliver sensitive information through video calls, chat, and email. Remote HR requires exceptional written and verbal communication.' },
  { title: 'Get Certified', description: 'Credentials like SHRM CP or PHR signal to employers that you have verified knowledge of HR practices and U.S. employment law. Many remote HR job postings list certification as preferred or required.' },
]

const faqs = [
  {
    question: 'Are remote HR jobs legitimate full time positions?',
    answer: 'Yes, remote HR jobs are fully legitimate positions offered by established companies of all sizes. According to the Society for Human Resource Management (SHRM), the shift to remote and hybrid work models has permanently expanded the number of HR roles that can be performed entirely from home. Major employers including Fortune 500 companies regularly post fully remote HR positions for recruiters, generalists, benefits specialists, and HR managers.',
  },
  {
    question: 'What qualifications do I need for a remote HR job?',
    answer: 'According to the Bureau of Labor Statistics, most human resources specialist positions require a bachelor\'s degree in human resources, business administration, or a related field. For remote roles specifically, employers also look for proficiency in HRIS platforms, strong written communication skills, and self discipline. Professional certifications such as SHRM CP or PHR are highly valued and often listed as preferred qualifications in remote HR job postings.',
  },
  {
    question: 'How much do remote HR professionals earn?',
    answer: 'According to the Bureau of Labor Statistics, the median annual wage for human resources specialists was approximately $67,650 as of the most recent data. Remote HR salaries are generally comparable to on site positions and can be higher in industries like technology and finance. Compensation varies based on role seniority, specialization, geographic cost of living adjustments, and whether the employer applies location based or national pay scales.',
  },
  {
    question: 'Do remote HR jobs offer benefits?',
    answer: 'Most full time remote HR positions include comprehensive benefits packages similar to on site roles. According to SHRM, common benefits for remote employees include health insurance, retirement plan contributions, paid time off, professional development budgets, and home office stipends. However, benefits vary by employer, so it is important to review the full compensation package during the interview process.',
  },
  {
    question: 'What is the job outlook for remote HR positions?',
    answer: 'According to the Bureau of Labor Statistics, employment of human resources specialists is projected to grow 6 percent from 2022 to 2032, about as fast as the average for all occupations. The continued normalization of remote work has expanded the pool of available HR positions that are location independent. SHRM research indicates that HR departments are among the most likely to maintain remote and hybrid arrangements long term.',
  },
]

export default async function RemoteHRJobsPage({ searchParams }: any) {
  const params = await searchParams

  const [{ count }, initialData] = await Promise.all([
  getMergedJobCount(params.what || 'remote hr', params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
  searchMergedJobs({ what: params.what || 'remote hr', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
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
            Remote HR Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="remote hr" />
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
                what={params.what || 'remote hr'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Types of Remote HR Roles */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Laptop className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Remote HR Positions</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The human resources field has embraced remote work more rapidly than most industries. According to the Society for Human Resource Management (SHRM), a growing majority of HR functions can now be performed entirely from home, opening up opportunities for professionals at every career stage across the country.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {remoteHRRoles.map((role, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <role.icon className="w-10 h-10 text-purple-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Salary by Role */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Remote HR Salaries by Role</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the Bureau of Labor Statistics, the median annual wage for human resources specialists was approximately $67,650. Remote HR salaries are generally comparable to on site positions, and some employers offer location based pay adjustments. The following figures represent typical salary ranges for remote HR roles across the United States.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {salaryByRole.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-5">
                  <p className="font-semibold text-gray-900 mb-1">{item.role}</p>
                  <p className="text-xl font-bold text-green-600 mb-2">{item.range}</p>
                  <p className="text-gray-500 text-sm">{item.note}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics. Figures are approximate and reflect national averages for remote positions.
            </p>
          </div>
        </section>

        {/* Essential Tools */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Essential Tools for Remote HR Professionals</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Remote HR work relies heavily on technology to manage employee data, facilitate hiring, and maintain compliance. Familiarity with the following categories of tools is expected by most employers hiring for remote human resources positions.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {essentialTools.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors">
                <h3 className="font-semibold text-gray-900 text-lg mb-1">{item.tool}</h3>
                <p className="text-blue-600 text-xs font-medium mb-2">{item.examples}</p>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Remote Work Legal Considerations */}
        <section className="mt-20 bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Legal Considerations for Remote HR Work</h2>
              <p className="text-gray-700 mb-6">
                Remote HR professionals must navigate a complex legal landscape that spans federal and state employment regulations. Understanding these requirements is essential for both performing the role effectively and ensuring organizational compliance.
              </p>
              <div className="space-y-4">
                {remoteWorkLaws.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-5">
                    <h3 className="font-semibold text-gray-900 mb-2">{item.topic}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Award className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Top Certifications for Remote HR Professionals</h2>
              <p className="text-gray-700 mb-6">
                Professional certifications demonstrate verified knowledge of HR practices and U.S. employment law, which is particularly important in remote roles where independent judgment and compliance expertise are essential. According to SHRM, certified HR professionals report higher earning potential and faster career advancement.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {certifications.map((cert, index) => (
                  <div key={index} className="bg-white rounded-lg p-5">
                    <h3 className="font-semibold text-gray-900 mb-1">{cert.name}</h3>
                    <p className="text-blue-600 text-xs font-medium mb-2">Provider: {cert.provider}</p>
                    <p className="text-gray-600 text-sm">{cert.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Top Hiring Industries */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-teal-600" />
            <h2 className="text-2xl font-bold text-gray-900">Top Industries Hiring Remote HR Professionals</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to SHRM workforce research, remote HR positions are available across virtually every industry, though certain sectors hire at significantly higher volumes due to their distributed workforce models and rapid growth.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topHiringIndustries.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-teal-500" />
                  <p className="font-semibold text-gray-900">{item.industry}</p>
                </div>
                <p className="text-gray-600 text-sm">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tips for Landing a Remote HR Job */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing a Remote HR Job</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {tipsForRemoteHR.map((tip, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-indigo-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-700 font-bold rounded-full text-sm mb-4">
                  {index + 1}
                </span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{tip.title}</h3>
                <p className="text-gray-600 text-sm">{tip.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Job Market Outlook */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-rose-600" />
            <h2 className="text-2xl font-bold text-gray-900">Remote HR Job Market Outlook</h2>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the Bureau of Labor Statistics, employment of human resources specialists is projected to grow steadily through 2032. The widespread adoption of remote and hybrid work models has permanently expanded the share of HR roles that are fully location independent, creating more opportunities for professionals across the country regardless of where they live.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <p className="text-3xl font-bold text-rose-600 mb-2">+6%</p>
                <p className="text-sm text-gray-600">Projected growth for HR specialist roles through 2032, with about 78,700 annual openings according to the BLS</p>
              </div>
              <div className="text-center p-4">
                <p className="text-3xl font-bold text-rose-600 mb-2">$67,650</p>
                <p className="text-sm text-gray-600">Median annual wage for HR specialists per the Bureau of Labor Statistics</p>
              </div>
              <div className="text-center p-4">
                <p className="text-3xl font-bold text-rose-600 mb-2">70%+</p>
                <p className="text-sm text-gray-600">Share of HR leaders who report their teams will maintain remote or hybrid work arrangements long term, per SHRM surveys</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Sources: U.S. Bureau of Labor Statistics and Society for Human Resource Management (SHRM)
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Remote HR Jobs</h2>
          </div>
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
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and does not constitute professional, legal, or tax advice. Salary figures, job growth projections, and legal considerations are based on publicly available data and may vary by employer, state, and individual circumstances. Always consult the U.S. Bureau of Labor Statistics at bls.gov, the U.S. Department of Labor at dol.gov, and the relevant regulatory agencies for the most current and applicable information. Job seekers should verify all position requirements directly with the hiring organization before applying.
          </p>
        </section>
      </div>
    </>
  )
}