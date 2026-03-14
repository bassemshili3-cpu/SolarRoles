import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, BookOpen, Users } from 'lucide-react'
import { searchJobs, getCachedJobCount, AdzunaSearchResult } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Urgent Press Association Jobs Needed Right Now | Start Today',
  description: 'Discover hundreds of press association jobs hiring immediately across the United States. Median salary $60,280. Flexible reporting, editing and media roles available now. Apply in minutes and launch your journalism career!',
  keywords: 'press association jobs, press association reporter jobs, press association editor positions, journalism association jobs, media association careers',
  openGraph: {
    title: 'Press Association Jobs Hiring Now | Median $60,280',
    description: 'Flexible press association positions open immediately nationwide. Competitive pay and exciting journalism opportunities. Start your media career today!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Urgent Press Association Jobs | Hiring Immediately',
    description: 'Hundreds of press association jobs available right now. Earn up to the national median of $60,280 with flexible schedules. Apply today!',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/press-association-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Press Association Jobs',
  description: 'Find press association jobs hiring now across the United States. Reporting, editing and media roles with competitive salaries.',
  url: 'https://www.oh-my-job.com/press-association-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Press Association Jobs',
    description: 'Current job listings for press association roles',
  },
}

const popularRoles = [
  { title: 'News Reporter', description: 'Cover local and national stories for press association publications', icon: BookOpen },
  { title: 'Press Association Editor', description: 'Oversee content and ensure accuracy in news releases and articles', icon: FileText },
  { title: 'Photojournalist', description: 'Capture images and visuals for association news and events', icon: Users },
  { title: 'Broadcast Journalist', description: 'Deliver stories on radio, television and digital platforms', icon: Shield },
  { title: 'Communications Specialist', description: 'Manage media relations and press releases for associations', icon: Briefcase },
  { title: 'Membership Coordinator', description: 'Support journalists and manage association member services', icon: MapPin },
]

const outlookStats = [
  { label: 'Median Annual Pay', value: '$60,280', note: 'May 2024 BLS' },
  { label: 'Job Outlook', value: '-4%', note: '2024–2034' },
  { label: 'Annual Openings', value: 'Thousands', note: 'Due to turnover' },
]

const salaryBreakdown = [
  { level: 'Median Annual Wage', amount: '$60,280', source: 'BLS May 2024' },
  { level: 'Mean Hourly Wage', amount: '$28.98', source: 'BLS May 2024' },
  { level: 'Top 10 Percent', amount: '$126,000+', source: 'BLS May 2024' },
]

const faqs = [
  {
    question: 'What is the job outlook for press association jobs?',
    answer: 'According to the official U.S. Bureau of Labor Statistics website, employment of news analysts, reporters, and journalists is projected to decline 4 percent from 2024 to 2034. However, thousands of openings are expected each year due to normal turnover in this dynamic field.',
  },
  {
    question: 'How much can I earn in press association jobs?',
    answer: 'The median annual wage for news analysts, reporters, and journalists was $60,280 in May 2024 according to the U.S. Bureau of Labor Statistics. Earnings vary by location, experience, and whether the role is print, broadcast, or digital.',
  },
  {
    question: 'What qualifications do I need for press association jobs?',
    answer: 'Most positions require a bachelor’s degree in journalism, communications, or a related field. According to the Bureau of Labor Statistics, strong writing skills, digital media knowledge, and previous reporting experience significantly improve your chances of landing these roles.',
  },
  {
    question: 'Do press association jobs require a press pass?',
    answer: 'Many roles benefit from a press pass for event access. Independent associations like the US Press Association provide credentials for members, but official requirements vary by organization and event. Check with the specific press association for details.',
  },
  {
    question: 'How do I get started in press association work?',
    answer: 'Begin by building a portfolio of published work. Apply directly through state and national press associations or major news outlets. Many associations post openings on their official websites and offer networking events for new journalists.',
  },
]

const tips = [
  {
    title: 'Build a Strong Portfolio',
    description: 'Create samples of your writing, photography or video work. Press associations value candidates who can demonstrate real world reporting experience.',
  },
  {
    title: 'Earn a Relevant Degree',
    description: 'Pursue a bachelor’s degree in journalism or communications. Many successful professionals also complete internships with news organizations.',
  },
  {
    title: 'Network Through Associations',
    description: 'Join national and state press associations to attend events and connect with editors and hiring managers.',
  },
  {
    title: 'Master Digital Tools',
    description: 'Learn content management systems, social media analytics and video editing. Digital skills are essential for modern press association roles.',
  },
]

export default async function PressAssociationJobsPage({ searchParams }: any) {
  const params = await searchParams

 const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'press association', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'press association', where: params.where || '', results_per_page: 30, page: 1 })
   .then((data: AdzunaSearchResult) => ({ ...data, results: data.results.map(normalizeAdzuna) })),
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
            Press Association Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="press association" />
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
                what={params.what || 'press association'}
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
            <h2 className="text-2xl font-bold text-gray-900">Job Outlook for Press Association Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the official website of the United States Bureau of Labor Statistics, demand for news analysts, reporters, and journalists remains steady despite overall industry changes. High turnover creates ongoing opportunities in press associations nationwide.
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
            Source: U.S. Bureau of Labor Statistics, Occupational Outlook Handbook, News Analysts, Reporters, and Journalists
          </p>
        </section>

        {/* Popular Roles Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Press Association Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Press associations offer diverse roles in journalism and media relations. The positions below are currently in demand and provide excellent opportunities to work with national and state level news organizations.
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
            <h2 className="text-2xl font-bold text-gray-900">Salary Guide for Press Association Jobs</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics, the median annual wage for news analysts, reporters, and journalists reached $60,280 in May 2024. Top performers and those in major markets often earn significantly more.
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
              Note: Salaries vary by experience, location, and whether the role involves print, broadcast, or digital media.
            </p>
          </div>
        </section>

        {/* Requirements Section */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements for Press Association Jobs</h2>
              <p className="text-gray-700 mb-6">
                Most press association positions require formal education and practical skills. According to the Bureau of Labor Statistics, employers typically look for candidates with strong writing abilities and a solid understanding of media ethics.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Typical Qualifications</h3>
                  <ul className="text-gray-600 text-sm space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Bachelor’s degree in journalism or communications
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Strong writing and research skills
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Digital media and social platform experience
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">How to Get Started</h3>
                  <ul className="text-gray-600 text-sm space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Build a professional portfolio
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Gain experience through internships
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Join state and national press associations
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
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing Press Association Jobs</h2>
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Press Association Jobs</h2>
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
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and does not constitute legal or professional advice. Salary figures and employment projections are based on the latest available data from the U.S. Bureau of Labor Statistics and may change. Always verify current requirements and job details directly with employers and official sources before applying.
          </p>
        </section>
      </div>
    </>
  )
}