import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, AlertTriangle, BookOpen, Users, TrendingUp } from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Urgent Jobs for 15 Year Olds Hiring Now | Earn Up to $15/Hour',
  description: 'Discover hundreds of jobs for 15 year olds hiring immediately near you. Legal, safe positions with flexible hours. Apply today and start earning your first paycheck with top employers actively recruiting teens!',
  keywords: 'jobs for 15 year olds, jobs hiring at 15, teen jobs, part time jobs for 15 year olds, summer jobs for 15 year olds, jobs for teens',
  openGraph: {
    title: 'Jobs for 15 Year Olds Hiring Now | Apply Today',
    description: 'Find safe, legal jobs for 15 year olds in your area. Hundreds of employers actively hiring teens with no experience required. Start your work journey now!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jobs for 15 Year Olds | Hiring Immediately',
    description: 'Ready to earn your own money? Find hundreds of jobs for 15 year olds near you. Safe, legal, and teen-friendly positions available now.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/jobs-for-15-year-olds',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Jobs for 15 Year Olds',
  description: 'Find legal jobs for 15 year olds hiring near you. Browse teen-friendly positions with flexible hours and competitive pay.',
  url: 'https://www.oh-my-job.com/jobs-for-15-year-olds',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Jobs for 15 Year Olds',
    description: 'Current job listings suitable for 15 year old workers',
  },
}

// ✅ FAQPage schema — active les rich snippets dépliables dans Google
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can a 15 year old legally work in the United States?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, according to the U.S. Department of Labor, 15 year olds may be employed outside school hours in non hazardous occupations under the Fair Labor Standards Act (FLSA). The law permits teens aged 14 and 15 to work in retail, food service, and various other positions with specific hour restrictions designed to protect their education and well being.',
      },
    },
    {
      '@type': 'Question',
      name: 'How many hours can a 15 year old work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'According to the official website of the United States Government, during school weeks, 15 year olds may work up to 23 hours per week, with no more than 3 hours on school days. During non school periods such as summer vacation, they can work up to 8 hours per day and 40 hours per week.',
      },
    },
    {
      '@type': 'Question',
      name: 'What jobs can a 15 year old do?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The U.S. Department of Labor allows 15 year olds to work in offices, retail stores, restaurants (not involving open flame cooking), grocery stores, movie theaters, libraries, and camp counseling. They cannot work in manufacturing, mining, construction, or any hazardous occupations as defined by the Fair Labor Standards Act.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do 15 year olds need a work permit?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Work permit requirements vary significantly by state. According to the U.S. Department of Labor, while federal law does not mandate work permits, individual states have the authority to establish their own requirements. Many states including California, New York, and Massachusetts require work permits for minors under 18.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the minimum wage for a 15 year old?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Under federal law, employers must pay at least $7.25 per hour, which is the federal minimum wage. However, according to the official wage and hour division, many states have established higher minimum wages that supersede federal law. Additionally, employers may pay $4.25 per hour during the first 90 consecutive calendar days of employment for workers under 20.',
      },
    },
  ],
}

const jobOpportunities = [
  { title: 'Retail Associate', description: 'Work at clothing stores, department stores, and retail shops', icon: Briefcase },
  { title: 'Food Service', description: 'Prepare food at restaurants, cafeterias, and fast food outlets', icon: TrendingUp },
  { title: 'Grocery Store Clerk', description: 'Stock shelves, assist customers, and maintain store cleanliness', icon: MapPin },
  { title: 'Movie Theater Attendant', description: 'Sell tickets, concessions, and assist guests', icon: Users },
  { title: 'Library Assistant', description: 'Help organize books and assist patrons with research', icon: BookOpen },
  { title: 'Camp Counselor', description: 'Supervise younger children at summer camps', icon: CheckCircle },
]

const workHourRules = [
  { rule: 'School Days', hours: 'Maximum 3 hours per day' },
  { rule: 'Non School Days', hours: 'Maximum 8 hours per day' },
  { rule: 'School Weeks', hours: 'Maximum 23 hours per week' },
  { rule: 'Non School Weeks', hours: 'Maximum 40 hours per week' },
  { rule: 'Work Hours Window', hours: '7:00 AM to 7:00 PM (9:00 PM June 1 through Labor Day)' },
]

const stateExamples = [
  { state: 'California', minWage: '$16.00', notes: 'Highest state minimum wage' },
  { state: 'New York', minWage: '$15.00', notes: 'Multiple wage tiers by region' },
  { state: 'Texas', minWage: '$7.25', notes: 'Follows federal minimum' },
  { state: 'Florida', minWage: '$13.00', notes: 'Indexed to inflation annually' },
]

const faqs = [
  {
    question: 'Can a 15 year old legally work in the United States?',
    answer: 'Yes, according to the U.S. Department of Labor, 15 year olds may be employed outside school hours in non hazardous occupations under the Fair Labor Standards Act (FLSA). The law permits teens aged 14 and 15 to work in retail, food service, and various other positions with specific hour restrictions designed to protect their education and well being.',
  },
  {
    question: 'How many hours can a 15 year old work?',
    answer: 'According to the official website of the United States Government, during school weeks, 15 year olds may work up to 23 hours per week, with no more than 3 hours on school days. During non school periods such as summer vacation, they can work up to 8 hours per day and 40 hours per week.',
  },
  {
    question: 'What jobs can a 15 year old do?',
    answer: 'The U.S. Department of Labor allows 15 year olds to work in offices, retail stores, restaurants (not involving open flame cooking), grocery stores, movie theaters, libraries, and camp counseling. They cannot work in manufacturing, mining, construction, or any hazardous occupations as defined by the Fair Labor Standards Act.',
  },
  {
    question: 'Do 15 year olds need a work permit?',
    answer: 'Work permit requirements vary significantly by state. According to the U.S. Department of Labor, while federal law does not mandate work permits, individual states have the authority to establish their own requirements. Many states including California, New York, and Massachusetts require work permits for minors under 18.',
  },
  {
    question: 'What is the minimum wage for a 15 year old?',
    answer: 'Under federal law, employers must pay at least $7.25 per hour, which is the federal minimum wage. However, according to the official wage and hour division, many states have established higher minimum wages that supersede federal law. Additionally, employers may pay $4.25 per hour during the first 90 consecutive calendar days of employment for workers under 20.',
  },
]

const applicationTips = [
  {
    title: 'Prepare Your Documents',
    description: 'Gather required documents including proof of age (birth certificate or passport), Social Security card, and if required by your state, a work permit application signed by a parent or guardian.',
  },
  {
    title: 'Create a Simple Resume',
    description: 'Even without work experience, highlight academic achievements, volunteer work, extracurricular activities, and skills like communication, responsibility, and teamwork that demonstrate your value to employers.',
  },
  {
    title: 'Dress Appropriately',
    description: 'When applying in person, dress neatly and professionally. First impressions matter, and showing you take the opportunity seriously helps you stand out from other applicants.',
  },
  {
    title: 'Follow Up',
    description: 'After submitting your application, wait a few days then follow up in person or by phone. This demonstrates initiative and keeps your application fresh in the employer mind.',
  },
]

export default async function JobsFor15YearOldsPage({ searchParams }: any) {
  const params = await searchParams

const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'jobs for 15 year olds', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'jobs for 15 year olds', where: params.where || '', results_per_page: 30, page: 1 })
   .then((data: AdzunaSearchResult) => ({ ...data, results: data.results.map(normalizeAdzuna) })),
])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ✅ FAQPage schema — active les rich snippets dépliables dans Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {count > 0 ? count.toLocaleString() : 'Hundreds of'} Jobs for 15 Year Olds Available Across the United States
          </h1>
          {count > 0 && (
            <p className="mt-3 text-sm text-gray-500">
              <span className="font-semibold text-gray-800">{count.toLocaleString()}</span> positions available
            </p>
          )}
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="jobs for 15 year olds" />
          </aside>
          <div className="flex-1">
            <AIJobMatcherWrapper />
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'jobs for 15 year olds'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Work Hour Rules for 15 Year Olds</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Department of Labor, the Fair Labor Standards Act establishes specific guidelines for minor workers aged 14 and 15. These regulations ensure teens can work and earn money while protecting their education and well being.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workHourRules.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{item.rule}</p>
                <p className="text-gray-600 text-sm">{item.hours}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Source: U.S. Department of Labor, Wage and Hour Division, Child Labor Provisions of the Fair Labor Standards Act
          </p>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Popular Jobs for 15 Year Olds</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Department of Labor, 15 year olds are permitted to work in various non hazardous occupations. These positions offer great opportunities to earn money, develop professional skills, and build a strong work ethic.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobOpportunities.map((job, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <job.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{job.title}</h3>
                <p className="text-gray-600 text-sm">{job.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20 bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <FileText className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">State by State Work Permit Requirements</h2>
              <p className="text-gray-700 mb-4">
                Work permit requirements vary by state. According to the U.S. Department of Labor, while federal law does not require work permits, individual states have the authority to establish their own requirements. Contact your school counselor or state labor department to understand the specific requirements in your area.
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {stateExamples.map((state, index) => (
                  <div key={index} className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{state.state}</h3>
                    <p className="text-2xl font-bold text-green-600 mb-1">{state.minWage}</p>
                    <p className="text-xs text-gray-500">{state.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Jobs 15 Year Olds Cannot Do</h2>
                <p className="text-gray-700 mb-4">
                  The U.S. Department of Labor strictly prohibits minors aged 14 and 15 from working in hazardous occupations. According to Child Labor Bulletin 101, the following types of work are NOT permitted for 15 year olds under any circumstances.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    'Manufacturing or mining operations',
                    'Operating power driven machinery or equipment',
                    'Working in construction or demolition',
                    'Driving motor vehicles or serving as helpers',
                    'Warehousing and storage work',
                    'Working with ladders or scaffolds over 6 feet',
                    'Cooking over open flames',
                    'Working in freezers or meat coolers',
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">How to Land Your First Job</h2>
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

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Earning Potential for 15 Year Olds</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Department of Labor, wage requirements for minor workers depend on federal and state laws. Many states have established minimum wages higher than the federal requirement, giving 15 year olds the opportunity to earn more depending on where they live and work.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">$7.25</p>
                <p className="text-sm text-gray-600">Federal Minimum Wage</p>
                <p className="text-xs text-gray-400 mt-1">Baseline requirement</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-blue-600 mb-2">$4.25</p>
                <p className="text-sm text-gray-600">Youth Training Wage</p>
                <p className="text-xs text-gray-400 mt-1">First 90 days, under 20 years old</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-purple-600 mb-2">$15-20</p>
                <p className="text-sm text-gray-600">High Demand Roles</p>
                <p className="text-xs text-gray-400 mt-1">Plus tips in service roles</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Note: State minimum wages vary significantly. Check your state labor department for current rates in your area. Some positions, especially those involving tips, can significantly increase your earning potential.
            </p>
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Jobs for 15 Year Olds</h2>
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

        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and does not constitute legal advice. Child labor laws vary significantly by state, and some states have stricter requirements than federal law. Always consult the U.S. Department of Labor website at dol.gov or your state labor department for the most current and applicable regulations. Parents and guardians should verify all employment conditions before allowing minors to begin work.
          </p>
        </section>
      </div>
    </>
  )
}