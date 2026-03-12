import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, TrendingUp, DollarSign, FileText, Shield, CheckCircle } from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'

export const metadata: Metadata = {
  title: 'Urgent Property Management Jobs Needed Right Now | Apply Today',
  description: 'Discover thousands of property management jobs hiring immediately across the United States. Manage residential, commercial and HOA properties with competitive salaries. Entry-level roles available. Apply in minutes and start your next career today!',
  keywords: 'property management jobs, property manager jobs, property management careers, residential property management jobs, commercial property management jobs, HOA manager jobs, hiring now',
  openGraph: {
    title: 'Urgent Property Management Jobs Hiring Now | Start Today',
    description: 'Explore thousands of property management positions available right now in the US. Top companies actively hiring. Competitive salaries and immediate start dates. Apply today!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Property Management Jobs Hiring Now | Urgent Openings Across the US',
    description: 'Ready to manage properties? Thousands of high-paying property management jobs available immediately. Apply now!',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/jobs-at-property-management',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Property Management Jobs',
  description: 'Find urgent property management jobs hiring now across the United States. Browse residential, commercial and community association manager positions with immediate openings.',
  url: 'https://www.oh-my-job.com/jobs-at-property-management',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Property Management Jobs',
    description: 'Current property management job listings with immediate hiring needs',
  },
}

const popularRoles = [
  { title: 'Residential Property Manager', description: 'Oversee apartment complexes, rental homes and tenant relations' },
  { title: 'Commercial Property Manager', description: 'Manage office buildings, retail centers and industrial spaces' },
  { title: 'Community Association Manager', description: 'Handle HOA and condominium board operations and maintenance' },
  { title: 'Assistant Property Manager', description: 'Support senior managers with leasing, maintenance and administrative tasks' },
  { title: 'Leasing Consultant', description: 'Show properties, screen tenants and close lease agreements' },
  { title: 'Facilities Manager', description: 'Maintain building systems and coordinate vendor services' },
]

const jobOutlookData = [
  { fact: 'Annual Openings', value: 'Thousands', details: 'Projected each year through 2034' },
  { fact: 'Job Growth', value: '4%', details: 'From 2024 to 2034' },
  { fact: 'Current Jobs', value: '466,100', details: 'Nationwide in 2024' },
]

const salaryData = [
  { role: 'Property Managers', salary: '$66,700', note: 'Median annual wage (May 2024)' },
  { role: 'Top 10% Earners', salary: '$120,000+', note: 'Experienced managers in major markets' },
]

const faqs = [
  {
    question: 'Do I need a degree for property management jobs?',
    answer: 'According to the U.S. Bureau of Labor Statistics, most property management positions require only a high school diploma or equivalent combined with several years of related work experience. Some employers prefer candidates with an associate or bachelor’s degree in business or real estate.',
  },
  {
    question: 'What is the average salary for property management jobs?',
    answer: 'The U.S. Bureau of Labor Statistics reports a median annual wage of $66,700 for property, real estate, and community association managers as of May 2024. Salaries vary significantly by location, property size and experience.',
  },
  {
    question: 'Do I need a license to work in property management?',
    answer: 'Many states require property managers to hold a real estate license or a specific property management license. According to the U.S. Bureau of Labor Statistics, requirements vary by state and some employers may require certifications such as Certified Property Manager (CPM).',
  },
  {
    question: 'What skills are most important for property managers?',
    answer: 'The U.S. Bureau of Labor Statistics highlights strong communication, customer service, organizational skills and knowledge of building maintenance. Proficiency with property management software and the ability to handle tenant disputes are also essential.',
  },
  {
    question: 'Are property management jobs in high demand?',
    answer: 'Yes. The U.S. Bureau of Labor Statistics projects 4 percent growth for property, real estate, and community association managers from 2024 to 2034, with thousands of openings expected each year due to retirements and new construction.',
  },
]

const applicationTips = [
  {
    title: 'Get Certified',
    description: 'Pursue widely recognized credentials such as Certified Property Manager (CPM) or Real Estate Manager (REM) to stand out to employers.',
  },
  {
    title: 'Gain Hands-On Experience',
    description: 'Start with entry-level roles like leasing agent or maintenance coordinator to build the experience most employers require.',
  },
  {
    title: 'Learn Property Software',
    description: 'Familiarize yourself with popular tools like Yardi, AppFolio or Buildium. Many job postings list software proficiency as a key requirement.',
  },
  {
    title: 'Network Locally',
    description: 'Join local chapters of the Institute of Real Estate Management (IREM) or Building Owners and Managers Association (BOMA) for job leads.',
  },
]



  export default async function PropertyManagementJobsPage(props: {
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

 const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'property management', params.where || '', salaryMinNum),
  searchJobs({ what: params.what || 'property management', where: params.where || '', results_per_page: 30, page: 1 })
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
            Property Management Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="property management" />
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
                what={params.what || 'property management'}
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
            <TrendingUp className="w-7 h-7 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-900">Property Management Job Outlook</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics, employment of property, real estate, and community association managers is projected to grow 4 percent from 2024 to 2034, about as fast as the average for all occupations.
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
            Source: U.S. Bureau of Labor Statistics, Occupational Outlook Handbook, Property, Real Estate, and Community Association Managers, updated 2025
          </p>
        </section>

        {/* Popular Roles Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Popular Types of Property Management Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Property management covers a wide range of roles across residential, commercial and community association sectors. The following positions currently offer the highest number of immediate openings.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularRoles.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <Briefcase className="w-10 h-10 text-blue-600 mb-4" />
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
            <h2 className="text-2xl font-bold text-gray-900">Property Management Salaries</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              The U.S. Bureau of Labor Statistics reports competitive earning potential for property managers, especially those handling large portfolios or commercial properties.
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements for Property Management Jobs</h2>
              <p className="text-gray-700 mb-4">
                According to the U.S. Bureau of Labor Statistics, most property management roles require a high school diploma and several years of experience. Many states also require a real estate license or specific property management certification.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Typical Requirements</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>High school diploma or equivalent</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>1–5 years of related experience</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>State real estate or property management license</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Strong customer service and organizational skills</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Valuable Certifications</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Certified Property Manager (CPM)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Real Estate Manager (REM)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Certified Apartment Manager (CAM)</span>
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
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing Property Management Jobs</h2>
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Property Management Jobs</h2>
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
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and is based on data from the U.S. Bureau of Labor Statistics. Job market conditions, salaries and requirements can vary by location and employer. Always verify the latest details directly on bls.gov or with the specific employer before applying.
          </p>
        </section>
      </div>
    </>
  )
}