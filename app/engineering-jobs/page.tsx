import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, BookOpen, Users, TrendingUp } from 'lucide-react'
import { getCachedJobCount } from '@/lib/adzuna'

export const metadata: Metadata = {
  title: 'Urgent Engineering Jobs Needed Right Now | Apply Today',
  description: 'Discover thousands of engineering jobs hiring immediately across the United States. High-paying software, mechanical, civil, electrical and more roles available now. No experience required for entry-level positions. Apply in minutes and land your next role today!',
  keywords: 'engineering jobs, engineering careers, software engineering jobs, mechanical engineering jobs, civil engineering jobs, electrical engineering jobs, hiring now, high paying engineering jobs',
  openGraph: {
    title: 'Urgent Engineering Jobs Hiring Now | Start Your Career Today',
    description: 'Explore 10,000+ engineering jobs available immediately in the US. Top employers actively hiring software, civil, mechanical and electrical engineers. Apply now and secure your future.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Engineering Jobs Hiring Now | Urgent Openings Across the US',
    description: 'Ready for your next engineering role? Thousands of positions available right now. High salaries, flexible locations, and immediate start dates. Apply today!',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/engineering-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Engineering Jobs',
  description: 'Find urgent engineering jobs hiring now across the United States. Browse software, mechanical, civil, electrical and other high-demand engineering positions.',
  url: 'https://www.oh-my-job.com/engineering-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Engineering Jobs',
    description: 'Current engineering job listings with immediate hiring needs',
  },
}

const popularEngineeringFields = [
  { title: 'Software Engineering', description: 'Build applications, websites and systems using modern coding languages', icon: Briefcase },
  { title: 'Mechanical Engineering', description: 'Design and improve machines, engines and mechanical systems', icon: Briefcase },
  { title: 'Civil Engineering', description: 'Plan and construct roads, bridges and infrastructure projects', icon: MapPin },
  { title: 'Electrical Engineering', description: 'Develop power systems, electronics and control technologies', icon: Shield },
  { title: 'Chemical Engineering', description: 'Create processes for manufacturing chemicals, fuels and materials', icon: BookOpen },
  { title: 'Biomedical Engineering', description: 'Combine engineering principles with medical science for healthcare solutions', icon: Users },
]

const jobGrowthData = [
  { role: 'Software Developers', growth: '25% from 2022 to 2032', details: 'Much faster than average' },
  { role: 'Civil Engineers', growth: '5% from 2022 to 2032', details: 'As fast as average' },
  { role: 'Mechanical Engineers', growth: '10% from 2022 to 2032', details: 'Faster than average' },
  { role: 'Electrical Engineers', growth: '7% from 2022 to 2032', details: 'As fast as average' },
]

const salaryData = [
  { role: 'Software Engineers', salary: '$132,270', note: 'Median annual wage 2023' },
  { role: 'Mechanical Engineers', salary: '$99,510', note: 'Median annual wage 2023' },
  { role: 'Civil Engineers', salary: '$95,890', note: 'Median annual wage 2023' },
  { role: 'Electrical Engineers', salary: '$106,950', note: 'Median annual wage 2023' },
]

const faqs = [
  {
    question: 'Do I need a degree for engineering jobs?',
    answer: 'According to the Bureau of Labor Statistics, most engineering positions require a bachelor’s degree in an engineering discipline. However, some software engineering roles accept relevant experience or certifications in place of a formal degree.',
  },
  {
    question: 'What is the average salary for engineering jobs in the United States?',
    answer: 'The Bureau of Labor Statistics reports that the median annual wage for architecture and engineering occupations was $91,420 in May 2023. Software engineering roles often exceed $130,000 while entry-level positions start around $70,000 depending on location and experience.',
  },
  {
    question: 'Which engineering fields are growing the fastest?',
    answer: 'The Bureau of Labor Statistics projects software developers will see 25% job growth from 2022 to 2032, far above the national average. Renewable energy, biomedical and civil engineering roles tied to infrastructure projects are also experiencing strong demand.',
  },
  {
    question: 'Are engineering jobs available without experience?',
    answer: 'Yes. Many companies actively hire recent graduates and entry-level engineers. Internships, co-op programs and certifications can help you land your first role. According to the U.S. Department of Labor, thousands of entry-level engineering positions open every month.',
  },
  {
    question: 'Do I need a professional engineering license?',
    answer: 'A Professional Engineer (PE) license is required for certain civil, mechanical and electrical roles that involve signing off on public projects. The National Society of Professional Engineers provides details on state-specific requirements through the official NCEES website.',
  },
]

const applicationTips = [
  {
    title: 'Tailor Your Resume to ATS Systems',
    description: 'Most engineering employers use Applicant Tracking Systems. Include exact keywords from the job description such as “Python”, “AutoCAD” or “project management” to pass initial filters.',
  },
  {
    title: 'Build a Strong Portfolio',
    description: 'Create a personal website or GitHub repository showcasing your projects. Employers in software and mechanical engineering value real-world examples over academic transcripts alone.',
  },
  {
    title: 'Network on LinkedIn',
    description: 'Follow companies and connect with engineering hiring managers. Many positions are filled through referrals before they are even posted publicly.',
  },
  {
    title: 'Prepare for Technical Interviews',
    description: 'Practice coding challenges on LeetCode and review core engineering principles. Companies often test problem-solving skills during the interview process.',
  },
]


  export default async function EngineeringJobsPage(props: {
  searchParams: Promise<{
    what?: string
    where?: string
    salary_min?: string   // ← uniquement string | undefined (natif Next.js)
  }>
}) {
  const params = await props.searchParams

  // 2. Conversion parseInt sécurisée UNIQUEMENT pour getCachedJobCount
  let salaryMinNum: number | undefined = undefined
  if (params.salary_min) {
    const parsed = Number.parseInt(params.salary_min, 10)
    salaryMinNum = Number.isNaN(parsed) ? undefined : parsed
  }

  const { count } = await getCachedJobCount(
    params.what || 'engineering',
    params.where || '',
    salaryMinNum
  )



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
            Engineering Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="engineering" />
          </aside>
          <div className="flex-1">

            {/* Count */}
            {count > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">{count.toLocaleString()}</span> positions available 
              </p>
            )}

            {/* AI Matcher */}
            <AIJobMatcherWrapper />

            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'engineering'}
                where={params.where || ''}
                salary_min={params.salary_min}
              />
            </Suspense>
          </div>
        </div>

        {/* Job Growth Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-900">Engineering Job Growth Projections</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the Bureau of Labor Statistics, an official agency of the United States Department of Labor, engineering occupations are projected to grow steadily through 2032. Software development leads with explosive demand driven by digital transformation and artificial intelligence.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {jobGrowthData.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{item.role}</p>
                <p className="text-emerald-600 font-medium">{item.growth}</p>
                <p className="text-gray-600 text-sm mt-2">{item.details}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Source: U.S. Bureau of Labor Statistics, Occupational Outlook Handbook, 2023-2032 projections
          </p>
        </section>

        {/* Popular Fields Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Popular Types of Engineering Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Engineering spans many disciplines. The following fields currently offer the highest number of immediate openings according to national job market data.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularEngineeringFields.map((job, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <job.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{job.title}</h3>
                <p className="text-gray-600 text-sm">{job.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Salary Information Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Average Salaries for Engineering Jobs</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              The Bureau of Labor Statistics reports strong earning potential across engineering disciplines. Salaries vary by experience, location and specialization but remain well above the national average.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {salaryData.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-5 text-center">
                  <p className="text-3xl font-bold text-green-600 mb-1">{item.salary}</p>
                  <p className="font-semibold text-gray-900">{item.role}</p>
                  <p className="text-sm text-gray-600">{item.note}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Source: U.S. Bureau of Labor Statistics, May 2023 National Occupational Employment and Wage Estimates
            </p>
          </div>
        </section>

        {/* Requirements Section */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <FileText className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Education and Requirements for Engineering Jobs</h2>
              <p className="text-gray-700 mb-4">
                According to the U.S. Department of Labor, the vast majority of engineering positions require at least a bachelor’s degree from an ABET-accredited program. Many employers also value professional certifications and hands-on project experience.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Typical Requirements</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Bachelor’s degree in engineering or related field</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Internship or co-op experience</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Proficiency in industry software (AutoCAD, MATLAB, Python, etc.)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Strong problem-solving and communication skills</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Helpful Certifications</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Professional Engineer (PE) license</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Project Management Professional (PMP)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Certified Scrum Master (CSM)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>CompTIA or vendor-specific tech certifications</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing Your Next Engineering Job</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {applicationTips.map((tip, index) => (
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

        {/* FAQ Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Engineering Jobs</h2>
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

        {/* General Disclaimer */}
        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and is based on data from the U.S. Bureau of Labor Statistics and Department of Labor. Job market conditions, salaries and requirements can vary by location and employer. Always verify the latest details directly on bls.gov or with the specific employer before applying.
          </p>
        </section>
      </div>
    </>
  )
}