import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, BookOpen, Users } from 'lucide-react'
import { searchJobs, getCachedJobCount, AdzunaSearchResult } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Substitute Teacher Jobs | Flexible Daily Teaching Openings',
  description: 'Discover thousands of substitute teacher jobs hiring immediately across the United States. Flexible schedules, pay up to $200 per day, many positions need no prior experience. Apply in minutes and make a real difference in classrooms!',
  keywords: 'substitute teacher jobs, substitute teaching jobs, substitute teacher positions, daily substitute teacher jobs, long term substitute teacher jobs',
  openGraph: {
    title: 'Substitute Teacher Jobs | Earn Up to $200 Per Day',
    description: 'Flexible substitute teacher positions open immediately nationwide. Competitive pay and easy application process. Start your teaching career today!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Substitute Teacher Jobs | Flexible Schedules, $200/Day',
    description: 'Thousands of substitute teacher jobs available right now. Earn up to $200 daily with flexible schedules. Apply today and join classrooms across America!',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/substitute-teacher-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Substitute Teacher Jobs',
  description: 'Find substitute teacher jobs hiring now across the United States. Flexible daily and long term positions in schools nationwide.',
  url: 'https://www.oh-my-job.com/substitute-teacher-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Substitute Teacher Jobs',
    description: 'Current job listings for substitute teachers',
  },
}

const popularRoles = [
  { title: 'Daily Substitute Teacher', description: 'Cover classes on short notice when regular teachers are absent', icon: Briefcase },
  { title: 'Long Term Substitute Teacher', description: 'Take full responsibility for a classroom over weeks or months', icon: Clock },
  { title: 'Special Education Substitute', description: 'Support students with special needs in inclusive settings', icon: Users },
  { title: 'Elementary School Substitute', description: 'Work with young learners in kindergarten through fifth grade', icon: BookOpen },
  { title: 'High School Substitute', description: 'Teach advanced subjects to secondary students', icon: Shield },
  { title: 'Floating Substitute', description: 'Move between multiple classrooms and grade levels as needed', icon: MapPin },
]

const outlookStats = [
  { label: 'High Demand', value: 'Nationwide', note: 'Ongoing teacher shortages' },
  { label: 'Mean Annual Wage', value: '$43,570', note: 'BLS 2023' },
  { label: 'Typical Daily Rate', value: '$100-$200', note: 'Most school districts' },
]

const salaryBreakdown = [
  { level: 'Mean Annual Wage', amount: '$43,570', source: 'BLS May 2023' },
  { level: 'Mean Hourly Wage', amount: '$20.95', source: 'BLS May 2023' },
  { level: 'Top Daily Rates', amount: '$200+', source: 'District postings' },
]

const faqs = [
  {
    question: 'What qualifications do I need for substitute teacher jobs?',
    answer: 'Requirements vary by state and district. According to official state departments of education, many areas require only a high school diploma while others ask for a bachelor’s degree and a substitute teaching permit or license. A clean background check is almost always mandatory.',
  },
  {
    question: 'How much can substitute teachers earn?',
    answer: 'According to the U.S. Bureau of Labor Statistics, the mean annual wage for short term substitute teachers was $43,570 in May 2023 with a mean hourly wage of $20.95. Daily rates commonly range from $100 to $200 depending on location and experience.',
  },
  {
    question: 'Do substitute teachers need a teaching degree?',
    answer: 'Not in every state. Some districts accept candidates with 60 college credits or even a high school diploma plus training. However, many prefer or require a bachelor’s degree. Always check your local district or state education department website for exact rules.',
  },
  {
    question: 'Is substitute teaching considered full time work?',
    answer: 'Most substitute positions are part time and on call. However, long term assignments can become full time for weeks or months. Many professionals combine daily substituting with other flexible work to create steady income.',
  },
  {
    question: 'How do I get started as a substitute teacher?',
    answer: 'The first step is applying through your local school district or county office of education. Most require an online application, background check, and sometimes a short training session. Official district websites list current openings and application instructions.',
  },
]

const tips = [
  {
    title: 'Apply to Multiple Districts',
    description: 'Sign up with several nearby school districts to increase your daily opportunities. Most substitutes work across multiple schools.',
  },
  {
    title: 'Complete Required Training',
    description: 'Finish any mandatory online or in person training sessions offered by the district. This helps you get approved faster.',
  },
  {
    title: 'Build Strong Relationships',
    description: 'Introduce yourself to school staff and be reliable. Teachers and administrators often request favorite substitutes for future assignments.',
  },
  {
    title: 'Prepare Your Sub Folder',
    description: 'Create a ready to go folder with lesson plan templates, classroom management ideas, and emergency contacts for every assignment.',
  },
]

export default async function SubstituteTeacherJobsPage({ searchParams }: any) {
  const params = await searchParams

  const [{ count }, initialData] = await Promise.all([
  getMergedJobCount(params.what || 'substitute teacher', params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
  searchMergedJobs({ what: params.what || 'substitute teacher', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
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
            Substitute Teacher Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="substitute teacher" />
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
                what={params.what || 'substitute teacher'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Job Outlook Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Job Outlook for Substitute Teacher Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Substitute teachers remain in very high demand nationwide. School districts across the United States continue to face ongoing teacher shortages, creating daily opportunities for qualified substitutes.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {outlookStats.map((stat, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
                <p className="text-4xl font-bold text-blue-600 mb-1">{stat.value}</p>
                <p className="font-semibold text-gray-900 mb-1">{stat.label}</p>
                <p className="text-sm text-gray-500">{stat.note}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics
          </p>
        </section>

        {/* Popular Roles Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Substitute Teacher Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Substitute teaching offers a variety of roles to match different interests and availability. The positions below are currently in high demand and provide excellent flexibility.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularRoles.map((role, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <role.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Salary Expectations Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Salary Guide for Substitute Teacher Jobs</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics, the mean annual wage for short term substitute teachers reached $43,570 in May 2023. Actual daily earnings vary widely by location and assignment length.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {salaryBreakdown.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-5 text-center">
                  <p className="text-3xl font-bold text-green-600 mb-2">{item.amount}</p>
                  <p className="font-semibold text-gray-900 text-sm mb-1">{item.level}</p>
                  <p className="text-xs text-gray-500">{item.source}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Note: Pay rates are set by each school district and often increase with experience or for long term assignments.
            </p>
          </div>
        </section>

        {/* Requirements Section */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements for Substitute Teacher Jobs</h2>
              <p className="text-gray-700 mb-6">
                Qualifications vary significantly by state and school district. According to official state departments of education, most positions require a background check and some level of education or training.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Common Requirements</h3>
                  <ul className="text-gray-600 text-sm space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      High school diploma or higher (varies by state)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Clean criminal background check
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Substitute teaching permit or license (in many states)
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">How to Get Approved</h3>
                  <ul className="text-gray-600 text-sm space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Submit online district application
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Pass fingerprint background check
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Complete district orientation or training
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
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing Substitute Teacher Jobs</h2>
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

        {/* FAQ Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Substitute Teacher Jobs</h2>
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
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and does not constitute legal or professional advice. Requirements, pay rates, and hiring processes vary by state and school district. Always verify the latest information directly with your local school district or state department of education before applying.
          </p>
        </section>
      </div>
    </>
  )
}