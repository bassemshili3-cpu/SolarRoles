import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, AlertTriangle, BookOpen, TrendingUp, ShieldCheck, Heart } from 'lucide-react'
import { searchJobs, getCachedJobCount, AdzunaSearchResult } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Dignity Health Jobs Hiring Now | Clinical and Non-Clinical Positions Open Across the US',
  description: 'Dignity Health is actively hiring across its hospitals, medical foundations, and care centers right now. Nursing, allied health, administrative, and technical positions available with competitive pay and full benefits. Browse open roles and apply today before positions in your area are filled.',
  keywords: 'dignity health jobs, dignity health hiring, dignity health careers, dignity health nurse jobs, dignity health hospital jobs, commonspirit dignity health jobs, dignity health positions, dignity health job openings',
  openGraph: {
    title: 'Dignity Health Jobs Hiring Immediately | Positions Needed Urgently Across the US',
    description: 'Dignity Health is hiring clinical and non-clinical staff across California, Arizona, Nevada, and beyond. Competitive pay, mission-driven culture, and strong benefits. Apply today.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dignity Health Jobs | Hiring Immediately at Hospitals and Care Centers',
    description: 'Find Dignity Health jobs hiring now near you. Nursing, allied health, IT, and administrative roles available across dozens of hospitals and medical foundations.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/dignity-health-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Dignity Health Jobs',
  description: 'Find Dignity Health jobs hiring now across the United States. Browse clinical, administrative, and support positions at Dignity Health hospitals, medical foundations, and care centers.',
  url: 'https://www.oh-my-job.com/dignity-health-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Dignity Health Jobs',
    description: 'Current Dignity Health job listings across the United States',
  },
}

const jobCategories = [
  {
    title: 'Registered Nursing',
    description: 'Dignity Health employs registered nurses across ICU, emergency, medical-surgical, labor and delivery, oncology, and telemetry units. RN positions represent the largest category of open roles and are available at nearly every facility in the system.',
    icon: Heart,
  },
  {
    title: 'Allied Health and Clinical Support',
    description: 'Positions including respiratory therapist, physical therapist, radiologic technologist, sonographer, surgical technologist, and laboratory technician are consistently open across Dignity Health facilities and medical foundations.',
    icon: ShieldCheck,
  },
  {
    title: 'Physician and Advanced Practice',
    description: 'Dignity Health Medical Foundation employs physicians, nurse practitioners, and physician assistants across primary care and specialty practices. Employed provider roles offer stable compensation models with full administrative support.',
    icon: Briefcase,
  },
  {
    title: 'Healthcare Administration',
    description: 'Administrative professionals including patient access representatives, medical coders, health information specialists, and department coordinators support Dignity Health operations at the facility and system level.',
    icon: FileText,
  },
  {
    title: 'Information Technology and Systems',
    description: 'Dignity Health and its parent system CommonSpirit Health employ IT professionals in clinical informatics, Epic implementation, cybersecurity, data analytics, and infrastructure roles across both on-site and remote positions.',
    icon: TrendingUp,
  },
  {
    title: 'Environmental Services and Support',
    description: 'Dietary, environmental services, patient transport, sterile processing, and facilities maintenance positions offer stable hospital employment with consistent scheduling and access to the full Dignity Health benefits package.',
    icon: MapPin,
  },
]

const hiringSteps = [
  {
    step: '1',
    title: 'Search and Apply Through the CommonSpirit Health Careers Portal',
    description: 'Dignity Health is part of CommonSpirit Health, one of the largest nonprofit hospital systems in the United States. All Dignity Health positions are posted through the CommonSpirit Health careers portal. Creating a profile and setting up job alerts for your target role and location ensures you are notified as soon as a matching position is posted.',
  },
  {
    step: '2',
    title: 'Complete License and Credential Verification',
    description: 'Clinical positions at Dignity Health require verification of active state licensure, certifications, and education credentials before an offer can be extended. According to the California Department of Consumer Affairs and equivalent agencies in Arizona and Nevada, healthcare licenses must be in good standing and free of disciplinary action. Ensuring your credentials are current before applying eliminates the most common delay in the Dignity Health hiring process.',
  },
  {
    step: '3',
    title: 'Pass Pre-Employment Screening',
    description: 'All Dignity Health candidates are subject to a background check, drug screening, and occupational health clearance including immunization verification. According to The Joint Commission and applicable state health department regulations, healthcare workers must demonstrate immunity to or vaccination for tuberculosis, hepatitis B, influenza, MMR, and varicella before beginning patient-facing work.',
  },
  {
    step: '4',
    title: 'Complete New Employee Orientation and Department Onboarding',
    description: 'Dignity Health provides a structured new employee orientation covering the organization\'s mission, values, compliance requirements, and safety protocols before department-specific onboarding begins. Clinical staff additionally complete unit-based competency validation and preceptorship programs aligned with their role and patient population.',
  },
]

const salaryByRole = [
  { role: 'Registered Nurse', salary: '$80,000 to $130,000' },
  { role: 'Respiratory Therapist', salary: '$65,000 to $90,000' },
  { role: 'Radiologic Technologist', salary: '$62,000 to $88,000' },
  { role: 'Physical Therapist', salary: '$78,000 to $105,000' },
  { role: 'Medical Laboratory Tech', salary: '$55,000 to $78,000' },
  { role: 'Physician Assistant', salary: '$115,000 to $155,000' },
]

const facilities = [
  { name: 'California', note: 'Dignity Health operates more than 30 hospitals in California including St. Mary\'s Medical Center in San Francisco, Mercy General in Sacramento, and Northridge Hospital Medical Center in Los Angeles.' },
  { name: 'Arizona', note: 'Dignity Health facilities in Arizona include Chandler Regional Medical Center, Mercy Gilbert Medical Center, and St. Joseph\'s Hospital and Medical Center in Phoenix, one of the leading neuroscience and bariatric surgery centers in the Southwest.' },
  { name: 'Nevada', note: 'St. Rose Dominican Hospitals across Henderson and Las Vegas serve the fast-growing Southern Nevada market and are among the most active hiring facilities in the Dignity Health network.' },
  { name: 'Pacific Northwest and Mountain West', note: 'Dignity Health operates hospitals in Washington, Montana, Idaho, and Alaska, including St. Patrick Hospital in Missoula and Providence St. Joseph Medical Center in Polson.' },
]

const faqs = [
  {
    question: 'What is the relationship between Dignity Health and CommonSpirit Health?',
    answer: 'Dignity Health merged with Catholic Health Initiatives in 2019 to form CommonSpirit Health, which is now one of the largest nonprofit health systems in the United States with more than 140 hospitals across 24 states. Dignity Health facilities continue to operate under the Dignity Health brand within the CommonSpirit Health system. All hiring, benefits, and HR functions are administered through CommonSpirit Health. According to CommonSpirit Health corporate communications, the combined system employs approximately 150,000 people nationwide.',
  },
  {
    question: 'Does Dignity Health require COVID-19 vaccination for employees?',
    answer: 'Healthcare worker vaccination requirements are determined by state law, federal regulations, and individual employer policy. According to the Centers for Medicare and Medicaid Services (CMS), healthcare facilities that participate in Medicare and Medicaid are subject to federal healthcare worker vaccination requirements. CommonSpirit Health and Dignity Health maintain their own policies consistent with applicable federal and state mandates. Candidates should review current requirements posted on the CommonSpirit Health careers portal at the time of application, as policies are subject to change.',
  },
  {
    question: 'What benefits does Dignity Health offer its employees?',
    answer: 'Dignity Health employees receive benefits administered through CommonSpirit Health, which include medical, dental, and vision insurance, a 403(b) retirement plan with employer matching, paid time off, tuition reimbursement, and employee assistance programs. Clinical staff may also be eligible for loan forgiveness through Dignity Health\'s participation in the Public Service Loan Forgiveness program, as many Dignity Health hospitals are designated nonprofit public service employers under the U.S. Department of Education program criteria.',
  },
  {
    question: 'Does working at Dignity Health qualify for Public Service Loan Forgiveness?',
    answer: 'According to the U.S. Department of Education, Public Service Loan Forgiveness (PSLF) is available to employees of qualifying nonprofit organizations under Section 501(c)(3) of the Internal Revenue Code. Many Dignity Health hospitals and medical foundations are organized as nonprofit entities and therefore qualify as eligible PSLF employers. Employees must confirm the tax-exempt status of their specific employing entity through the PSLF employer search tool on studentaid.gov, as individual facility designations may vary within the CommonSpirit Health system.',
  },
  {
    question: 'Are travel nurse positions available at Dignity Health?',
    answer: 'Dignity Health facilities utilize both permanent staff and contracted travel nurses depending on census, seasonal demand, and specialty needs. Travel nurse contracts at Dignity Health hospitals are typically placed through third-party staffing agencies rather than directly through CommonSpirit Health recruitment. Traveling nurses interested in Dignity Health assignments should work with a healthcare staffing agency that maintains active vendor agreements with the CommonSpirit Health system.',
  },
  {
    question: 'What is the work culture like at Dignity Health?',
    answer: 'Dignity Health was founded in 1986 by the Sisters of Mercy and operates under a mission of delivering compassionate, high-quality, affordable health services. According to CommonSpirit Health, the organization is guided by a commitment to the poor and vulnerable that shapes its approach to community benefit programs, charity care, and employee relations. Dignity Health has received recognition from Becker\'s Hospital Review and other healthcare industry publications for its workplace culture and nursing environment in multiple years.',
  },
]

const tips = [
  {
    title: 'Apply Directly Through the CommonSpirit Health Portal',
    description: 'All Dignity Health positions are exclusively posted and processed through the CommonSpirit Health careers website. Applications submitted through third-party job boards are typically redirected back to the CommonSpirit portal for processing. Creating your profile directly on the official system and applying there ensures your application is received, tracked, and reviewed by the appropriate recruiter without delay.',
  },
  {
    title: 'Highlight Mission Alignment in Your Application Materials',
    description: 'Dignity Health is a Catholic-sponsored health system with a defined mission of serving the poor and vulnerable. Candidates who demonstrate awareness of and alignment with this mission in their cover letters and interviews consistently report stronger recruiter engagement. Referencing community service experience, patient advocacy work, or your personal commitment to equitable healthcare access directly addresses what Dignity Health hiring managers are trained to look for.',
  },
  {
    title: 'Confirm Your License Reciprocity Before Applying Across State Lines',
    description: 'Dignity Health operates hospitals in California, Arizona, Nevada, and several other states. If you are applying to a facility in a state where you are not currently licensed, confirm whether your license is eligible for endorsement or expedited review before submitting your application. According to the National Council of State Boards of Nursing, the Nurse Licensure Compact (NLC) allows multistate licensure in participating states, but California is not currently an NLC member, which requires separate licensure for nurses relocating to or from that state.',
  },
  {
    title: 'Set Up Job Alerts for Your Target Role and Location',
    description: 'Dignity Health and CommonSpirit Health post a high volume of new positions across their network each week. Setting up saved search alerts on the CommonSpirit careers portal ensures you are notified immediately when a position matching your criteria is posted. Applying within the first 48 to 72 hours of a posting is consistently associated with higher callback rates, as recruiter attention is typically highest in the early days of a new requisition.',
  },
]

export default async function DignityHealthJobsPage({ searchParams }: any) {
  const params = await searchParams

 const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'dignity health', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'dignity health', where: params.where || '', results_per_page: 30, page: 1 })
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
            Dignity Health Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="dignity health" />
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
                what={params.what || 'dignity health'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Job Categories */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Roles Available at Dignity Health</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            As part of CommonSpirit Health, one of the largest nonprofit health systems in the United States with more than 140 hospitals across 24 states, Dignity Health hires across a broad spectrum of clinical, administrative, and support functions. Whether you are a seasoned clinician or beginning your healthcare career, Dignity Health maintains active recruitment across all major job families.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobCategories.map((cat, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <cat.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{cat.title}</h3>
                <p className="text-gray-600 text-sm">{cat.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How to Get Hired */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">How to Get Hired at Dignity Health</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            The Dignity Health hiring process follows CommonSpirit Health's centralized recruitment workflow. Understanding the steps in advance allows candidates to prepare required documentation, prevent credential-related delays, and move from application to first shift as efficiently as possible.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {hiringSteps.map((item, index) => (
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
            <h2 className="text-2xl font-bold text-gray-900">How Much Do Dignity Health Employees Earn?</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics Occupational Employment and Wage Statistics program, healthcare occupations span a wide compensation range depending on role, licensure, and geographic market. Dignity Health operates primarily in California, which has some of the highest healthcare worker wages in the country due to state minimum wage laws, union agreements, and the high cost of living in major metropolitan markets.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">$95,000+</p>
                <p className="text-sm text-gray-600">Median RN Salary in California (BLS 2023)</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-blue-600 mb-2">140+</p>
                <p className="text-sm text-gray-600">CommonSpirit Hospitals Nationwide</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-purple-600 mb-2">150,000+</p>
                <p className="text-sm text-gray-600">Employees Across the System</p>
              </div>
            </div>
            <h3 className="font-semibold text-gray-800 mb-4">Estimated Pay Range by Role at Dignity Health</h3>
            <div className="grid md:grid-cols-3 gap-3">
              {salaryByRole.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-3 flex justify-between items-center">
                  <span className="text-sm text-gray-700 font-medium">{item.role}</span>
                  <span className="text-sm font-bold text-green-600">{item.salary}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics, May 2023. Dignity Health pay ranges are estimates based on publicly reported compensation data and vary by facility, state, union status, and experience level.
            </p>
          </div>
        </section>

        {/* Facility Locations */}
        <section className="mt-20">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <MapPin className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Where Dignity Health Operates Across the United States</h2>
                <p className="text-gray-700 mb-6">
                  Dignity Health operates hospitals, medical foundations, urgent care centers, and physician practice groups across multiple states. The system is most concentrated in California, where it was founded, but has expanded significantly through the CommonSpirit Health merger to provide hiring opportunities across the Western United States and beyond.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {facilities.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg p-4">
                      <p className="font-semibold text-gray-900 mb-1">{item.name}</p>
                      <p className="text-gray-600 text-sm">{item.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Career Ladder */}
        <section className="mt-20">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <TrendingUp className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Career Growth Within Dignity Health and CommonSpirit</h2>
                <p className="text-gray-700 mb-4">
                  The scale of CommonSpirit Health means that internal mobility opportunities are exceptionally broad. Employees who begin in entry-level roles at a single Dignity Health facility have access to advancement opportunities across more than 140 hospitals, 1,000 care sites, and dozens of corporate and administrative functions. CommonSpirit Health invests in leadership development programs specifically designed to promote internal candidates into management and executive roles.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-6 flex-wrap">
                  {['Entry Level Support', 'Clinical Technician', 'Staff Clinician', 'Lead / Charge', 'Department Manager', 'Director / VP'].map((level, index, arr) => (
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

        {/* Benefits and PSLF */}
        <section className="mt-20">
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <FileText className="w-8 h-8 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Public Service Loan Forgiveness Eligibility at Dignity Health</h2>
                <p className="text-gray-700 mb-4">
                  Many Dignity Health hospitals are organized as nonprofit entities under Section 501(c)(3) of the Internal Revenue Code and qualify as eligible employers for the Public Service Loan Forgiveness (PSLF) program administered by the U.S. Department of Education. According to the official Federal Student Aid website at studentaid.gov, PSLF cancels the remaining balance on eligible Direct Loans after 120 qualifying monthly payments made while working full time for a qualifying employer.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Key PSLF Requirements</h3>
                    <ul className="text-gray-600 text-sm space-y-2">
                      {[
                        'Must work full time (at least 30 hours per week) for a qualifying nonprofit employer',
                        'Must have Direct Loans or consolidate other federal loans into the Direct program',
                        'Must be enrolled in an income-driven repayment plan',
                        'Must make 120 qualifying payments while meeting all other requirements',
                        'Employer must be verified through the PSLF employer certification form',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Additional Dignity Health Benefits</h3>
                    <ul className="text-gray-600 text-sm space-y-2">
                      {[
                        'Medical, dental, and vision coverage for employees and eligible dependents',
                        '403(b) retirement plan with employer contribution matching',
                        'Tuition reimbursement for continuing education and degree programs',
                        'Employee assistance program including mental health counseling',
                        'Paid time off, sick leave, and paid holidays per facility policy',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Shift Types */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Dignity Health Work Schedules and Shift Options</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Dignity Health facilities operate 24 hours a day, 7 days a week, offering a full range of shift options for clinical and support staff. Many nursing and allied health positions are offered in multiple shift configurations, allowing candidates to indicate their scheduling preferences during the application process.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { shift: 'Day Shift', time: '7:00 AM to 7:30 PM', note: '12-hour shifts most common for nursing; 8-hour shifts available in clinic and administrative roles' },
              { shift: 'Night Shift', time: '7:00 PM to 7:30 AM', note: 'Night differential pay applies; common in ICU, ED, and telemetry units' },
              { shift: 'Per Diem', time: 'Variable by unit need', note: 'Higher base pay; flexibility required; used to supplement core staffing during high census periods' },
              { shift: 'Part Time', time: '0.5 to 0.8 FTE', note: 'Benefits-eligible at many facilities; common in ambulatory, clinic, and outpatient settings' },
            ].map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{item.shift}</p>
                <p className="text-blue-600 text-sm font-medium mb-2">{item.time}</p>
                <p className="text-gray-500 text-xs">{item.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Getting Hired at Dignity Health Quickly</h2>
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Dignity Health Jobs</h2>
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
            <strong>Disclaimer:</strong> The salary figures, employment information, benefits descriptions, and regulatory details provided on this page are for general informational purposes only and do not constitute legal, financial, or career advice. This page is not affiliated with or endorsed by Dignity Health or CommonSpirit Health. Employment conditions, pay rates, benefits, and licensing requirements vary by facility, state, and role. Always consult the CommonSpirit Health careers portal, your state healthcare licensing board, the U.S. Bureau of Labor Statistics at bls.gov, and the Federal Student Aid office at studentaid.gov for the most current and applicable information. PSLF eligibility must be verified through the official employer certification process.
          </p>
        </section>
      </div>
    </>
  )
}