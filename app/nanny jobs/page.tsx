import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, TrendingUp, DollarSign, FileText, Shield, CheckCircle, Users } from 'lucide-react'
import { getCachedJobCount } from '@/lib/adzuna'

export const metadata: Metadata = {
  title: 'Urgent Nanny Jobs Needed Right Now | Apply Today',
  description: 'Discover thousands of nanny jobs hiring immediately across the United States. Flexible full-time, part-time and live-in roles with great pay. Background-checked families actively hiring. Apply in minutes and start earning today!',
  keywords: 'nanny jobs, nanny careers, babysitter jobs, live-in nanny jobs, part time nanny jobs, full time nanny jobs, hiring now, childcare jobs',
  openGraph: {
    title: 'Urgent Nanny Jobs Hiring Now | Start Today',
    description: 'Explore thousands of nanny positions available right now in the US. Top families actively hiring. Competitive salaries and flexible schedules. Apply today!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nanny Jobs Hiring Now | Urgent Openings Across the US',
    description: 'Ready to become a nanny? Thousands of high-paying nanny jobs available immediately. Flexible hours and great families. Apply now!',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/nanny-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Nanny Jobs',
  description: 'Find urgent nanny jobs hiring now across the United States. Browse full-time, part-time and live-in childcare positions with immediate openings.',
  url: 'https://www.oh-my-job.com/nanny-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Nanny Jobs',
    description: 'Current nanny job listings with immediate hiring needs',
  },
}

const popularNannyRoles = [
  { title: 'Full-Time Nanny', description: 'Daily care for children in a family home with consistent schedule' },
  { title: 'Part-Time Nanny', description: 'Flexible hours after school, evenings or weekends for busy families' },
  { title: 'Live-In Nanny', description: 'Reside with the family and provide round-the-clock childcare' },
  { title: 'Newborn Nanny', description: 'Specialized care for infants including feeding and sleep training' },
  { title: 'After-School Nanny', description: 'Homework help, activities and transportation for school-age kids' },
  { title: 'Twin or Multiples Nanny', description: 'Expert care for twins or multiples with proven experience' },
]

const jobOutlookData = [
  { fact: 'Annual Openings', value: 'Hundreds of thousands', details: 'In childcare occupations' },
  { fact: 'Job Growth', value: '3%', details: 'From 2024 to 2034' },
  { fact: 'Median Salary', value: '$35,900', details: 'For childcare workers nationwide' },
]

const salaryData = [
  { role: 'Full-Time Nannies', salary: '$45,000–$75,000', note: 'Average annual pay 2024' },
  { role: 'Live-In Nannies', salary: '$55,000–$90,000', note: 'Plus room and board' },
]

const faqs = [
  {
    question: 'Do I need experience for nanny jobs?',
    answer: 'Many families prefer nannies with at least 1–2 years of childcare experience. According to the U.S. Bureau of Labor Statistics, childcare workers often start with relevant experience from babysitting, daycare or education programs.',
  },
  {
    question: 'What is the average salary for nanny jobs?',
    answer: 'The U.S. Bureau of Labor Statistics reports a median annual wage of $35,900 for childcare workers as of May 2024. Experienced nannies in major cities or with specialized skills often earn $50,000 to $80,000 per year.',
  },
  {
    question: 'Do nannies need a background check?',
    answer: 'Yes. Most families and agencies require a full background check including criminal history, sex offender registry and driving record. According to the U.S. Department of Health and Human Services, background checks are standard for anyone working with children.',
  },
  {
    question: 'Are certifications required for nanny jobs?',
    answer: 'While not always mandatory, CPR, First Aid and infant care certifications make you more competitive. The American Red Cross and National Safety Council provide widely recognized training programs that many employers request.',
  },
  {
    question: 'Can nannies work part-time or live-in?',
    answer: 'Yes. The U.S. Bureau of Labor Statistics notes that childcare roles include both part-time and live-in positions. Live-in nannies often receive housing and meals in addition to salary.',
  },
]

const applicationTips = [
  {
    title: 'Build a Professional Profile',
    description: 'Create a detailed nanny resume highlighting childcare experience, references and any certifications. Include photos of activities with children when appropriate.',
  },
  {
    title: 'Get Certified',
    description: 'Complete CPR, First Aid and safe sleep training. Many families prioritize nannies with these credentials.',
  },
  {
    title: 'Use Reputable Platforms',
    description: 'Apply through trusted nanny agencies or platforms that perform background checks and verify references.',
  },
  {
    title: 'Prepare for Interviews',
    description: 'Be ready to discuss your philosophy on discipline, daily routines and emergency procedures. Families often ask for real-life examples.',
  },
]

export default async function NannyJobsPage({ searchParams }: any) {
  const params = await searchParams

  const { count } = await getCachedJobCount(
    params.what || 'nanny',
    params.where || '',
    params.salary_min
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
            Nanny Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters />
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
                what={params.what || 'nanny'}
                where={params.where || ''}
                salary_min={params.salary_min}
              />
            </Suspense>
          </div>
        </div>

        {/* Job Outlook Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-900">Nanny Job Outlook</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics, employment of childcare workers is projected to grow 3 percent from 2024 to 2034. Families continue to seek reliable nannies for flexible and personalized care.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {jobOutlookData.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{item.fact}</p>
                <p className="text-emerald-600 text-2xl font-medium">{item.value}</p>
                <p className="text-gray-600 text-sm mt-2">{item.details}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Source: U.S. Bureau of Labor Statistics, Occupational Outlook Handbook, Childcare Workers, updated 2025
          </p>
        </section>

        {/* Popular Roles Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Popular Types of Nanny Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Nanny positions come in many forms to match different family needs. The following roles currently have strong demand across the country.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularNannyRoles.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <Users className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Salary Information Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Nanny Salaries</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics, experienced nannies earn competitive wages, especially in high-cost areas or with additional responsibilities.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {salaryData.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-5 text-center">
                  <p className="text-3xl font-bold text-green-600 mb-1">{item.salary}</p>
                  <p className="font-semibold text-gray-900">{item.role}</p>
                  <p className="text-sm text-gray-600">{item.note}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics, May 2024
            </p>
          </div>
        </section>

        {/* Requirements Section */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <FileText className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements for Nanny Jobs</h2>
              <p className="text-gray-700 mb-4">
                According to the U.S. Department of Health and Human Services and the Bureau of Labor Statistics, most families require nannies to pass background checks and hold basic safety certifications.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Typical Requirements</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>1–2 years of professional childcare experience</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Clean background check and driving record</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>CPR and First Aid certification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Reliable transportation</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Recommended Certifications</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Infant and Child CPR / First Aid</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Safe Sleep and SIDS prevention</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Early childhood education credits</span>
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
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing Nanny Jobs</h2>
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Nanny Jobs</h2>
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
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and is based on data from the U.S. Bureau of Labor Statistics. Job market conditions, salaries and requirements can vary by location and family. Always verify the latest details directly on bls.gov or with the specific family before applying.
          </p>
        </section>
      </div>
    </>
  )
}