import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, DollarSign, CheckCircle, Shield, Clock, Users, TrendingUp, FileText, Award, Star, AlertTriangle } from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Quality Assurance Jobs Needed ASAP | QA Professionals Urgently Hiring',
  description: 'Quality assurance positions are critically needed across the US! Browse 1,000+ immediate openings in software, manufacturing, pharma, and food production. Competitive salaries, remote options, and strong career growth. Apply today!',
  keywords: 'quality assurance jobs, QA jobs, quality assurance engineer jobs, software QA jobs, QA analyst jobs, quality control jobs, QA tester jobs, quality assurance hiring now',
  openGraph: {
    title: 'Quality Assurance Jobs Needed ASAP | Urgent QA Openings Nationwide',
    description: 'QA professionals are urgently needed across software, manufacturing, pharma, and food industries. 1,000+ openings with competitive pay and remote options. Apply now!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quality Assurance Jobs | Urgently Hiring Nationwide',
    description: 'Urgent demand for QA professionals across the US. Software, manufacturing, pharma, and more. Find your role and apply today.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/quality-assurance-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Quality Assurance Jobs',
  description: 'Find quality assurance jobs hiring now across the United States. Browse QA engineer, QA analyst, quality control, and software testing positions across all industries.',
  url: 'https://www.oh-my-job.com/quality-assurance-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Quality Assurance Job Opportunities',
    description: 'Current quality assurance job listings across software, manufacturing, pharmaceutical, and food industries in the United States',
  },
}

const qaRoles = [
  {
    title: 'QA Engineer',
    description: 'Design and execute test plans, identify defects, and ensure software or product quality meets defined standards before release',
    icon: Shield,
  },
  {
    title: 'QA Analyst',
    description: 'Analyze requirements, develop test cases, and document defects to support continuous improvement across development and production cycles',
    icon: FileText,
  },
  {
    title: 'Automation QA Engineer',
    description: 'Build and maintain automated testing frameworks using tools such as Selenium, Cypress, or TestNG to accelerate quality validation at scale',
    icon: Star,
  },
  {
    title: 'Quality Control Inspector',
    description: 'Physically inspect products, materials, and components in manufacturing or production environments to ensure conformance with specifications',
    icon: CheckCircle,
  },
  {
    title: 'Pharmaceutical QA Specialist',
    description: 'Ensure compliance with FDA regulations, Good Manufacturing Practices (GMP), and internal quality standards in drug and medical device production',
    icon: Award,
  },
  {
    title: 'Food Safety and Quality Auditor',
    description: 'Conduct internal and external audits to verify compliance with USDA, FDA, and HACCP food safety standards across production facilities',
    icon: Briefcase,
  },
]

const keyDuties = [
  'Develop, document, and execute test plans and test cases based on product or software requirements',
  'Identify, log, and track defects through to resolution using tools such as Jira or Azure DevOps',
  'Conduct regression, integration, system, and user acceptance testing',
  'Review product specifications and design documents for testability and compliance',
  'Collaborate with development, production, and regulatory teams on quality standards',
  'Maintain traceability matrices and quality documentation for audits and compliance reviews',
  'Analyze quality metrics and report findings to stakeholders',
  'Support root cause analysis and corrective and preventive action (CAPA) processes',
]

const salaryData = [
  { role: 'QA Analyst (Entry Level)', low: '$50,000', high: '$75,000', median: '$62,000' },
  { role: 'QA Engineer', low: '$65,000', high: '$110,000', median: '$85,000' },
  { role: 'Automation QA Engineer', low: '$80,000', high: '$135,000', median: '$105,000' },
  { role: 'Senior QA Engineer', low: '$95,000', high: '$150,000', median: '$120,000' },
  { role: 'QC Inspector (Manufacturing)', low: '$38,000', high: '$65,000', median: '$50,000' },
  { role: 'Pharma QA Specialist', low: '$60,000', high: '$105,000', median: '$80,000' },
]

const topEmployers = [
  { name: 'Amazon', type: 'Technology / E-Commerce', positions: 'QA Engineer, Software Development Engineer in Test, QC Associate' },
  { name: 'Microsoft', type: 'Technology', positions: 'Software QA Engineer, SDET, Quality Program Manager' },
  { name: 'Johnson and Johnson', type: 'Pharmaceutical', positions: 'QA Specialist, Validation Engineer, Regulatory QA Analyst' },
  { name: 'General Motors', type: 'Automotive Manufacturing', positions: 'Quality Engineer, QC Inspector, Manufacturing Quality Analyst' },
  { name: 'Abbott Laboratories', type: 'Medical Devices', positions: 'QA Engineer, Compliance Specialist, Quality Systems Analyst' },
  { name: 'Tyson Foods', type: 'Food Production', positions: 'Food Safety QA Technician, HACCP Coordinator, Quality Auditor' },
]

const certifications = [
  {
    name: 'Certified Quality Engineer (CQE)',
    issuer: 'American Society for Quality (ASQ)',
    description: 'One of the most widely recognized QA credentials in the US, covering quality principles, statistical methods, and process improvement. According to ASQ, CQE holders consistently report higher salaries and faster career advancement.',
  },
  {
    name: 'Certified Software Quality Engineer (CSQE)',
    issuer: 'American Society for Quality (ASQ)',
    description: 'Specifically designed for professionals in software quality assurance, covering the full software development lifecycle, testing methodologies, and quality metrics.',
  },
  {
    name: 'ISTQB Certified Tester',
    issuer: 'International Software Testing Qualifications Board (ISTQB)',
    description: 'The globally recognized standard certification for software testers. The Foundation Level certification is widely required or preferred by software employers hiring QA analysts and engineers.',
  },
  {
    name: 'Certified Quality Auditor (CQA)',
    issuer: 'American Society for Quality (ASQ)',
    description: 'Validates expertise in auditing quality management systems. Particularly valued in pharmaceutical, medical device, and regulated manufacturing sectors where FDA and ISO compliance audits are mandatory.',
  },
]

const industryStandards = [
  {
    standard: 'ISO 9001',
    context: 'Manufacturing, services, and general industry',
    description: 'The international standard for quality management systems. According to the International Organization for Standardization, ISO 9001 certification is held by over one million organizations worldwide, making familiarity with its requirements essential for QA professionals across most industries.',
  },
  {
    standard: '21 CFR Part 820',
    context: 'Medical devices (FDA)',
    description: 'The U.S. Food and Drug Administration\'s Quality System Regulation for medical device manufacturers. QA professionals in the medical device sector must be thoroughly familiar with this regulation and its requirements for design controls, corrective actions, and documentation.',
  },
  {
    standard: 'HACCP',
    context: 'Food and beverage production',
    description: 'Hazard Analysis and Critical Control Points is a systematic approach to food safety mandated by the U.S. Food and Drug Administration and the U.S. Department of Agriculture. QA professionals in food manufacturing are typically required to hold HACCP certification.',
  },
  {
    standard: 'Good Manufacturing Practice (GMP)',
    context: 'Pharmaceutical and biotech',
    description: 'Enforced by the U.S. Food and Drug Administration under 21 CFR Parts 210 and 211, GMP regulations govern the manufacturing, testing, and quality control of pharmaceutical products. Knowledge of GMP is a baseline requirement for pharma QA roles.',
  },
]

const faqs = [
  {
    question: 'What is quality assurance and how does it differ from quality control?',
    answer: 'According to the American Society for Quality (ASQ), quality assurance (QA) refers to the proactive processes designed to prevent defects from occurring, while quality control (QC) involves the reactive inspection of finished products or outputs to identify defects after they occur. In practice, QA professionals focus on building quality into processes, whereas QC inspectors verify that the final output meets standards.',
  },
  {
    question: 'What education do I need for a quality assurance job?',
    answer: 'Requirements vary by industry. For software QA roles, a bachelor\'s degree in computer science, information technology, or a related field is commonly required. For manufacturing and pharmaceutical QA positions, degrees in engineering, chemistry, biology, or life sciences are preferred. According to the U.S. Bureau of Labor Statistics, employers increasingly value relevant certifications such as the ASQ CQE or ISTQB alongside formal education.',
  },
  {
    question: 'How much do quality assurance professionals earn?',
    answer: 'According to the U.S. Bureau of Labor Statistics Occupational Employment and Wage Statistics program, quality assurance and quality control professionals earn median annual salaries ranging from approximately $50,000 for entry level QC inspectors to over $120,000 for senior automation QA engineers at technology companies. Industry, location, and specialized certifications significantly influence compensation.',
  },
  {
    question: 'Are quality assurance jobs available remotely?',
    answer: 'Remote QA roles are widely available, particularly in software quality assurance. QA analysts, automation engineers, and quality program managers at technology companies frequently work fully remotely or in hybrid arrangements. According to the U.S. Department of Labor, the expansion of software development and digital product teams has made software QA one of the most remote friendly specializations in the field. Physical inspection roles in manufacturing remain predominantly on site.',
  },
  {
    question: 'Is quality assurance a growing field?',
    answer: 'Yes. According to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, employment in quality assurance and related technical fields is projected to grow steadily, driven by increasing regulatory requirements, the expansion of software development, and growing consumer and industry expectations for product safety and reliability. Healthcare, pharmaceutical, and technology sectors are generating particularly strong demand.',
  },
  {
    question: 'What tools do quality assurance engineers typically use?',
    answer: 'Software QA professionals commonly use tools such as Jira, TestRail, Selenium, Cypress, Postman, and Azure DevOps for test management, automation, and defect tracking. Manufacturing and pharmaceutical QA roles rely on statistical process control (SPC) software, enterprise resource planning (ERP) systems, and document management platforms. According to O*NET OnLine, managed by the U.S. Department of Labor, proficiency in relevant testing and quality management tools is consistently listed among the top skill requirements for QA positions.',
  },
]

const applicationTips = [
  {
    title: 'Earn an ASQ or ISTQB Certification',
    description: 'Credentials from the American Society for Quality or the International Software Testing Qualifications Board are among the most recognized in the field. Holding a relevant certification validates your expertise and directly differentiates you from uncertified candidates, particularly for senior and specialized roles.',
  },
  {
    title: 'Build Hands On Experience With QA Tools',
    description: 'Employers consistently prioritize practical tool experience. For software QA roles, build a portfolio demonstrating proficiency in test automation frameworks such as Selenium or Cypress. For manufacturing roles, highlight experience with statistical process control, FMEA, or ISO 9001 documentation.',
  },
  {
    title: 'Highlight Regulatory and Compliance Knowledge',
    description: 'In pharmaceutical, medical device, and food production sectors, knowledge of FDA regulations, GMP, HACCP, and ISO standards is essential and should be prominently featured on your resume. Demonstrating specific audit experience or regulatory submission support sets candidates significantly apart.',
  },
  {
    title: 'Quantify Your Quality Impact',
    description: 'Frame your experience in terms of measurable outcomes. Examples such as reducing defect escape rates by a specific percentage, improving test coverage, or leading a CAPA that eliminated a recurring non conformance are far more compelling to employers than general descriptions of responsibilities.',
  },
]

export default async function QualityAssuranceJobsPage({ searchParams }: any) {
  const params = await searchParams

  const [{ count }, initialData] = await Promise.all([
  getMergedJobCount(params.what || 'quality assurance', params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
  searchMergedJobs({ what: params.what || 'quality assurance', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
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
            Quality Assurance Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="quality assurance" />
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
                what={params.what || 'quality assurance'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Types of QA Roles */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Quality Assurance Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics, quality assurance professionals are employed across virtually every industry in the United States. From validating software releases to ensuring pharmaceutical compliance and food safety, QA roles span a wide range of technical disciplines and regulatory environments.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {qaRoles.map((role, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <role.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Key Duties */}
        <section className="mt-20">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Core Responsibilities in Quality Assurance</h2>
                <p className="text-gray-700 mb-5">
                  According to O*NET OnLine, managed by the U.S. Department of Labor, quality assurance professionals perform a consistent set of core functions across industries. Understanding these responsibilities helps candidates align their experience with employer expectations from the first point of contact.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {keyDuties.map((duty, index) => (
                    <div key={index} className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{duty}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Salary Data */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Quality Assurance Salaries by Role</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics Occupational Employment and Wage Statistics (OEWS) program, compensation for quality assurance professionals varies widely by sector, specialization, and geographic location. The following figures reflect approximate national annual salary ranges.
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 font-semibold text-gray-900">Role</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-900">Low End</th>
                  <th className="text-center px-6 py-4 font-semibold text-green-700">Median</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-900">High End</th>
                </tr>
              </thead>
              <tbody>
                {salaryData.map((row, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{row.role}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{row.low}</td>
                    <td className="px-6 py-4 text-center font-bold text-green-600">{row.median}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{row.high}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics. Figures are approximate annual salary ranges and may vary by industry, location, and certification level.
          </p>
        </section>

        {/* Top Employers */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Top Employers Hiring Quality Assurance Professionals</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Quality assurance talent is in demand across every major industry sector. The following companies and organizations represent some of the most consistent and high volume employers of QA professionals in the United States.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {topEmployers.map((employer, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{employer.name}</p>
                <span className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full mb-2">{employer.type}</span>
                <p className="text-gray-600 text-sm">{employer.positions}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-amber-600" />
            <h2 className="text-2xl font-bold text-gray-900">Key Certifications for Quality Assurance Professionals</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Earning a recognized QA certification is one of the most effective ways to advance your career and increase your earning potential. The following credentials are the most widely respected by employers across software, manufacturing, pharmaceutical, and regulated industries.
          </p>
          <div className="space-y-4">
            {certifications.map((cert, index) => (
              <div key={index} className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <Award className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-0.5">{cert.name}</p>
                    <p className="text-xs text-amber-700 font-medium mb-2">Issued by: {cert.issuer}</p>
                    <p className="text-gray-600 text-sm">{cert.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Industry Standards */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-7 h-7 text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-900">Key Regulatory Standards QA Professionals Must Know</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Quality assurance in regulated industries is governed by federal law and international standards. The U.S. Food and Drug Administration, the U.S. Department of Agriculture, and the International Organization for Standardization each publish binding requirements that QA professionals must understand and apply in their daily work.
          </p>
          <div className="space-y-4">
            {industryStandards.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 text-orange-700 font-bold rounded-xl text-xs text-center leading-tight px-1">
                      {item.standard}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">{item.context}</p>
                    <p className="text-gray-700 text-sm">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Career Growth */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-teal-600" />
            <h2 className="text-2xl font-bold text-gray-900">Career Growth in Quality Assurance</h2>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, employment in quality assurance and quality engineering roles is projected to remain stable with growth driven by expanding regulatory requirements, the global proliferation of software products, and increasing consumer demand for product safety. QA offers a well defined advancement ladder across both technical and managerial tracks.
            </p>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { step: '1', title: 'QA Analyst', desc: 'Manual testing, test case writing, and defect reporting' },
                { step: '2', title: 'QA Engineer', desc: 'Test automation, process design, and quality metrics' },
                { step: '3', title: 'Senior QA Engineer', desc: 'Architecture of test frameworks, team mentoring' },
                { step: '4', title: 'QA Manager / Director', desc: 'Quality strategy, team leadership, and executive reporting' },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Tips */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-7 h-7 text-rose-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing a Quality Assurance Job</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {applicationTips.map((tip, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-rose-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-rose-100 text-rose-700 font-bold rounded-full text-sm mb-4">
                  {index + 1}
                </span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{tip.title}</h3>
                <p className="text-gray-600 text-sm">{tip.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Quality Assurance Jobs</h2>
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
            <strong>Disclaimer:</strong> The salary figures, employment projections, and regulatory information cited on this page are sourced from publicly available reports by the U.S. Bureau of Labor Statistics, the U.S. Department of Labor, O*NET OnLine, the U.S. Food and Drug Administration, and the American Society for Quality. Actual wages and job availability may vary by industry, location, and credential level. Oh My Job is an independent job search platform and aggregates listings from third party sources. Always verify job details, qualifications, and compensation directly with the hiring organization before applying.
          </p>
        </section>
      </div>
    </>
  )
}