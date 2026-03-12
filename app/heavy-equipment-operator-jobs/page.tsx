import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, BookOpen, Users, TrendingUp } from 'lucide-react'
import { getCachedJobCount, searchJobs } from '@/lib/adzuna'

export const metadata: Metadata = {
  title: 'Urgent Heavy Equipment Operator Jobs Hiring Now | Apply Today',
  description: 'Discover thousands of heavy equipment operator jobs hiring immediately across the United States. Drive bulldozers, excavators, loaders and more with high-paying roles. CDL and union opportunities available. Apply in minutes and start your next construction career today!',
  keywords: 'heavy equipment operator jobs, construction equipment operator jobs, heavy equipment operator hiring now, excavator operator jobs, bulldozer operator jobs, union heavy equipment jobs',
  openGraph: {
    title: 'Heavy Equipment Operator Jobs Hiring Now | Start Today',
    description: 'Explore 500+ heavy equipment operator positions available right now in the US. Top contractors actively hiring. Competitive salaries up to $85k+ and immediate start dates. Apply today!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Heavy Equipment Operator Jobs Hiring Now | Urgent Openings Across the US',
    description: 'Ready to operate heavy machinery? Thousands of heavy equipment operator jobs available immediately. High salaries, union benefits and flexible opportunities. Apply now!',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/heavy-equipment-operator-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Heavy Equipment Operator Jobs',
  description: 'Find urgent heavy equipment operator jobs hiring now across the United States. Browse construction equipment operator positions with immediate openings and competitive pay.',
  url: 'https://www.oh-my-job.com/heavy-equipment-operator-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Heavy Equipment Operator Jobs',
    description: 'Current heavy equipment operator job listings with immediate hiring needs',
  },
}

const keyResponsibilities = [
  { title: 'Operate Heavy Machinery', description: 'Safely drive and control bulldozers, excavators, loaders, backhoes, and graders on construction sites' },
  { title: 'Site Preparation & Grading', description: 'Level ground, move earth, and prepare job sites for roads, buildings, and infrastructure projects' },
  { title: 'Equipment Maintenance', description: 'Perform daily inspections, basic repairs, and preventative maintenance on heavy equipment' },
  { title: 'Safety & Compliance', description: 'Follow OSHA regulations, wear PPE, and maintain a safe work environment at all times' },
  { title: 'Read Blueprints & Plans', description: 'Interpret construction drawings and work with survey markers to meet project specifications' },
  { title: 'Material Handling', description: 'Load and unload materials, haul dirt, and assist with trenching and pipe laying' },
]

const jobOutlookData = [
  { fact: 'Annual Openings', value: '46,200', details: 'Projected each year on average' },
  { fact: 'Current Employment', value: '539,500', details: 'Construction equipment operators nationwide' },
  { fact: 'Growth 2024-2034', value: '4%', details: 'As fast as average for all occupations' },
]

const salaryData = [
  { role: 'Heavy Equipment Operators', salary: '$58,320', note: 'Median annual wage (May 2024)' },
  { role: 'Experienced / Union Operators', salary: '$75,000+', note: 'Top 10% earn more than $85,000' },
]

const faqs = [
  {
    question: 'Do I need a CDL for heavy equipment operator jobs?',
    answer: 'Not always. Many construction companies only require a valid driver’s license and on-the-job training or a certificate from a heavy equipment school. However, some union or specialized roles (dump trucks, cranes) require a Class A CDL.',
  },
  {
    question: 'What is the average salary for heavy equipment operator jobs?',
    answer: 'The U.S. Bureau of Labor Statistics reports a median annual wage of $58,320 for construction equipment operators as of May 2024. Experienced operators, union members, and those working overtime or in high-demand states can easily earn $70,000–$90,000+ per year.',
  },
  {
    question: 'What certifications help me get hired faster?',
    answer: 'NCCER certification, OSHA 10 or 30, and equipment-specific training (Caterpillar, John Deere, Komatsu) are highly valued. Many employers also accept certificates from trade schools or apprenticeship programs.',
  },
  {
    question: 'Are heavy equipment operator jobs available remotely?',
    answer: 'No — these are hands-on field positions. However, many contractors offer travel pay, per diem, and 4/10 or 5/8 schedules. Some operators work on large infrastructure projects across multiple states.',
  },
  {
    question: 'How do I stand out when applying for heavy equipment operator jobs?',
    answer: 'Highlight any seat time on specific machines (excavator, dozer, loader), safety record, and certifications. Union membership (IUOE) or previous experience on federal/state projects is a huge advantage.',
  },
]

const applicationTips = [
  {
    title: 'Get Hands-On Experience',
    description: 'Even entry-level roles prefer candidates with 6–12 months of seat time. Consider a short heavy equipment training program if you’re new to the field.',
  },
  {
    title: 'Build a Strong Resume',
    description: 'List specific machines you can operate (e.g., “Cat 336 Excavator – 1,200 hours”) and any safety certifications or union affiliations.',
  },
  {
    title: 'Join a Union',
    description: 'The International Union of Operating Engineers (IUOE) offers excellent pay, benefits, and training programs. Many high-paying jobs are only posted through union halls.',
  },
  {
    title: 'Prepare for the Skills Test',
    description: 'Most employers require a practical test on an excavator or loader. Practice precision digging, trenching, and loading before the interview.',
  },
]

interface PageProps {
  searchParams: Promise<{
    what?: string
    where?: string
    salary_min?: string   // ← Correction : toujours string (ou undefined) dans Next.js
  }>
}

export default async function HeavyEquipmentOperatorJobsPage({ searchParams }: PageProps) {
  const params = await searchParams

  // Conversion sécurisée pour getCachedJobCount (qui attend un number)
  const salaryMinNumber = params.salary_min 
    ? parseInt(params.salary_min, 10) 
    : undefined

 const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'heavy equipment operator', params.where || '', salaryMinNumber),
  searchJobs({ what: params.what || 'heavy equipment operator', where: params.where || '', results_per_page: 30, page: 1 }),
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
            Heavy Equipment Operator Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="heavy equipment operator" />
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
                what={params.what || 'heavy equipment operator'}
                where={params.where || ''}
                salary_min={params.salary_min}   // ← reste en string (comme attendu par le composant)
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Job Outlook Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-900">Heavy Equipment Operator Job Outlook</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics, overall employment of construction equipment operators is projected to grow 4% from 2024 to 2034 — as fast as average for all occupations. About 46,200 openings are expected each year due to retirements and infrastructure projects.
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
            Source: U.S. Bureau of Labor Statistics, Occupational Outlook Handbook, Construction Equipment Operators, updated August 2025
          </p>
        </section>

        {/* Key Responsibilities Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">What Heavy Equipment Operators Do</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics, construction equipment operators drive, maneuver, or control heavy machinery used to construct roads, buildings, and other structures.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyResponsibilities.map((item, index) => (
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
            <h2 className="text-2xl font-bold text-gray-900">Heavy Equipment Operator Salaries</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              The U.S. Bureau of Labor Statistics reports strong earning potential for experienced heavy equipment operators, especially with union benefits or overtime on large infrastructure projects.
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

        {/* Qualifications Section */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <FileText className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements for Heavy Equipment Operator Jobs</h2>
              <p className="text-gray-700 mb-4">
                According to the U.S. Bureau of Labor Statistics, most positions require a high school diploma and on-the-job training. Many employers prefer candidates with formal training or certifications.
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
                      <span>Valid driver’s license (CDL often preferred)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Ability to pass drug test and background check</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Physical stamina and ability to work outdoors</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Valuable Certifications</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>NCCER Heavy Equipment Certification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>OSHA 10 / OSHA 30</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>IUOE Union Apprenticeship</span>
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
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing Heavy Equipment Operator Jobs</h2>
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Heavy Equipment Operator Jobs</h2>
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
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and is based on data from the U.S. Bureau of Labor Statistics. Job market conditions, salaries, and requirements can vary by location and employer. Always verify the latest details directly on bls.gov or with the specific employer before applying.
          </p>
        </section>
      </div>
    </>
  )
}