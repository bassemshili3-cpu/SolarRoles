import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import JobMap from '@/components/JobMap'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, AlertTriangle, BookOpen, Users } from 'lucide-react'
import { searchJobs } from '@/lib/adzuna'

export const metadata: Metadata = {
  title: 'Urgent Jobs for 14 Year Olds Hiring Now | Start Earning Today',
  description: 'Discover 500+ jobs for 14 year olds hiring immediately near you. Legal, safe positions perfect for teens. No experience needed. Apply in minutes and start earning your first paycheck!',
  keywords: 'jobs for 14 year olds, jobs hiring at 14, teen jobs, first job for 14 year old, part time jobs for 14 year olds, summer jobs for 14 year olds',
  openGraph: {
    title: 'Jobs for 14 Year Olds Hiring Now | Get Your First Job Today',
    description: 'Find safe, legal jobs for 14 year olds in your area. Hundreds of employers actively hiring teens. No experience required. Start your work journey now!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jobs for 14 Year Olds | Hiring Immediately',
    description: 'Ready to earn your own money? Find 500+ jobs for 14 year olds near you. Safe, legal, and teen-friendly positions available now.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/jobs-for-14-year-olds',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Jobs for 14 Year Olds',
  description: 'Find legal jobs for 14 year olds hiring near you. Browse hundreds of teen-friendly positions with flexible hours.',
  url: 'https://www.oh-my-job.com/jobs-for-14-year-olds',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Jobs for 14 Year Olds',
    description: 'Current job listings suitable for 14 year old workers',
  },
}

const allowedJobs = [
  { title: 'Babysitting', description: 'Care for younger children in your neighborhood', icon: Users },
  { title: 'Pet Sitting & Dog Walking', description: 'Look after pets while owners are away', icon: Users },
  { title: 'Lawn Care & Yard Work', description: 'Mowing, raking, and garden maintenance', icon: MapPin },
  { title: 'Grocery Bagging', description: 'Help customers at local grocery stores', icon: Briefcase },
  { title: 'Tutoring', description: 'Help younger students with schoolwork', icon: BookOpen },
  { title: 'House Cleaning', description: 'Light housekeeping and organizing tasks', icon: CheckCircle },
]

const workHourRules = [
  { rule: 'School Days', hours: 'Maximum 3 hours per day' },
  { rule: 'Non School Days', hours: 'Maximum 8 hours per day' },
  { rule: 'School Weeks', hours: 'Maximum 18 hours per week' },
  { rule: 'Non School Weeks', hours: 'Maximum 40 hours per week' },
  { rule: 'Work Hours Window', hours: '7:00 AM to 7:00 PM (9:00 PM June 1 through Labor Day)' },
]

const faqs = [
  {
    question: 'Can a 14 year old legally work in the United States?',
    answer: 'Yes, according to the U.S. Department of Labor, 14 and 15 year olds may be employed outside school hours in certain occupations under specific conditions outlined in the Fair Labor Standards Act (FLSA). Federal law permits employment in retail, food service, and gasoline service establishments, as well as various other non hazardous jobs.',
  },
  {
    question: 'What jobs are 14 year olds NOT allowed to do?',
    answer: 'The Fair Labor Standards Act prohibits 14 year olds from working in manufacturing, mining, or any occupation declared hazardous by the Secretary of Labor. This includes operating power driven machinery, working in construction, and jobs involving exposure to dangerous substances. A complete list is available on the official DOL website.',
  },
  {
    question: 'Do 14 year olds need a work permit?',
    answer: 'Work permit requirements vary by state. Most states require minors under 16 to obtain an employment certificate or work permit before starting a job. Contact your school counselor or local Department of Labor office to learn about your state specific requirements.',
  },
  {
    question: 'What is the minimum wage for a 14 year old?',
    answer: 'Under federal law, 14 year olds must be paid at least the federal minimum wage, which is $7.25 per hour as of 2024. However, many states have higher minimum wages that apply. Some employers may pay a youth minimum wage of $4.25 per hour during the first 90 consecutive calendar days of employment.',
  },
  {
    question: 'Can 14 year olds work during summer vacation?',
    answer: 'Yes, 14 year olds can work during summer vacation with extended hours. According to the Department of Labor, during non school periods, teens aged 14 and 15 may work up to 8 hours per day and 40 hours per week. Work hours can also extend until 9:00 PM from June 1 through Labor Day.',
  },
]

const tips = [
  {
    title: 'Get Your Work Permit First',
    description: 'Most states require work permits for 14 year olds. Visit your school office or state labor department to obtain the necessary paperwork before applying to jobs.',
  },
  {
    title: 'Start with Your Network',
    description: 'Let family, friends, and neighbors know you are looking for work. Many first jobs for 14 year olds come through personal connections like babysitting or yard work.',
  },
  {
    title: 'Focus on Transferable Skills',
    description: 'Highlight skills like responsibility, communication, and reliability. Even without work experience, school projects and extracurricular activities demonstrate valuable abilities.',
  },
  {
    title: 'Know Your Rights',
    description: 'Familiarize yourself with federal and state labor laws. Understanding work hour limits and prohibited tasks protects you and ensures a positive first job experience.',
  },
]

export default async function JobsFor14YearOldsPage({ searchParams }: any) {
  const params = await searchParams

  const { count } = await searchJobs({
    what: params.what || 'jobs for 14 year olds',
    where: params.where || '',
    ...(params.salary_min && { salary_min: params.salary_min }),
    results_per_page: 1,
  })

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
            Jobs for 14 Year Olds Available Now Across the United States
          </h1>
       
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters />
          </aside>
          <div className="flex-1">

            {/* ✅ Count ici, à droite, au-dessus de la map */}
            {count > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">{count.toLocaleString()}</span> positions available 
              </p>
            )}

            <JobMap jobs={[]} />
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'jobs for 14 year olds'}
                where={params.where || ''}
                salary_min={params.salary_min}
              />
            </Suspense>
          </div>
        </div>

        {/* Legal Working Hours Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Federal Work Hour Limits for 14 Year Olds</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Department of Labor, the Fair Labor Standards Act (FLSA) establishes strict guidelines for when and how long 14 and 15 year olds may work. These rules are designed to protect young workers while allowing them to gain valuable work experience.
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

        {/* Jobs 14 Year Olds Can Do */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Jobs 14 Year Olds Can Legally Do</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Under federal child labor laws, 14 year olds are permitted to work in a variety of non hazardous occupations. The following jobs are popular choices that comply with FLSA regulations and offer great opportunities for teens to earn money and build experience.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allowedJobs.map((job, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <job.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{job.title}</h3>
                <p className="text-gray-600 text-sm">{job.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Work Permit Information */}
        <section className="mt-20 bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <FileText className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Work Permits for 14 Year Olds</h2>
              <p className="text-gray-700 mb-4">
                Most states require minors under the age of 16 to obtain a work permit (also called an employment certificate or age certificate) before beginning employment. According to the U.S. Department of Labor, while federal law does not require work permits, individual states have the authority to establish their own requirements.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">How to Get a Work Permit</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Obtain the application from your school office</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Have your parent or guardian sign the form</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Get employer information and signature</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Submit to your school or state labor department</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Documents You May Need</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Proof of age (birth certificate or passport)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Social Security card</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>School enrollment verification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Parental consent form</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Prohibited Jobs Warning */}
        <section className="mt-20">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Jobs 14 Year Olds Cannot Do</h2>
                <p className="text-gray-700 mb-4">
                  The U.S. Department of Labor strictly prohibits minors aged 14 and 15 from working in hazardous occupations. According to Child Labor Bulletin 101, the following types of work are NOT permitted for 14 year olds:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    'Manufacturing or mining operations',
                    'Operating power driven machinery',
                    'Working in construction or demolition',
                    'Driving motor vehicles or serving as helpers',
                    'Warehousing and storage work',
                    'Working with ladders or scaffolds above 6 feet',
                    'Cooking over open flames (except at soda fountains)',
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

        {/* Tips Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Finding Your First Job at 14</h2>
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

        {/* Minimum Wage Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">How Much Can a 14 Year Old Earn?</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Department of Labor, all covered, nonexempt workers are entitled to a minimum wage of not less than $7.25 per hour effective July 24, 2009. However, many states have established higher minimum wage rates that employers must follow.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">$7.25</p>
                <p className="text-sm text-gray-600">Federal Minimum Wage</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-blue-600 mb-2">$4.25</p>
                <p className="text-sm text-gray-600">Youth Minimum (First 90 Days)</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-purple-600 mb-2">$15+</p>
                <p className="text-sm text-gray-600">Some State Minimums</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Note: State minimum wages vary. Check your state labor department for current rates. Some cities also have local minimum wage ordinances that may be higher than state rates.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Jobs for 14 Year Olds</h2>
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
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and does not constitute legal advice. Child labor laws vary by state, and some states have stricter requirements than federal law. Always consult the U.S. Department of Labor website at dol.gov or your state labor department for the most current and applicable regulations. Parents and guardians should verify all employment conditions before allowing minors to begin work.
          </p>
        </section>
      </div>
    </>
  )
}