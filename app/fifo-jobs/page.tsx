import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, DollarSign, MapPin, CheckCircle, HardHat, Plane, TrendingUp, ShieldCheck } from 'lucide-react'
import { searchJobs, getCachedJobCount } from '@/lib/adzuna'

export const metadata: Metadata = {
  title: 'FIFO Jobs Hiring Immediately | Fly In Fly Out Positions Open Now',
  description: 'Hundreds of FIFO jobs available right now. Fly in fly out positions in mining, oil, gas and construction with top pay and rotation schedules. No experience required for some roles. Apply today before positions fill up.',
  keywords: 'fifo jobs, fly in fly out jobs, fifo mining jobs, fifo work, fifo positions, fly in fly out mining, fifo oil and gas jobs, remote work fifo',
  openGraph: {
    title: 'FIFO Jobs Hiring Now | Top Paying Fly In Fly Out Positions',
    description: 'Find urgent FIFO job openings across the United States. Mining, oil, gas, and construction employers are actively hiring. High pay, flexible rotations, and no relocation required.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FIFO Jobs | Fly In Fly Out Positions Hiring Now',
    description: 'Ready to earn more with FIFO work? Browse hundreds of fly in fly out jobs paying top wages. Apply now before these positions are filled.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/fifo-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'FIFO Jobs',
  description: 'Find fly in fly out jobs in mining, oil, gas and construction across the United States. Browse hundreds of FIFO positions hiring now.',
  url: 'https://www.oh-my-job.com/fifo-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available FIFO Jobs',
    description: 'Current fly in fly out job listings across the United States',
  },
}

const fifoSectors = [
  {
    title: 'Mining & Resources',
    description: 'Underground and surface mining roles including drill operators, blasters, and site supervisors with premium FIFO pay.',
    icon: HardHat,
  },
  {
    title: 'Oil & Gas',
    description: 'Offshore and onshore drilling, pipeline inspection, and rig maintenance positions with competitive rotation schedules.',
    icon: TrendingUp,
  },
  {
    title: 'Construction',
    description: 'Large scale infrastructure and civil construction projects in remote areas requiring skilled tradespeople and laborers.',
    icon: Briefcase,
  },
  {
    title: 'Camp Services',
    description: 'Catering, cleaning, administration and logistics roles supporting FIFO work camps across remote project sites.',
    icon: MapPin,
  },
  {
    title: 'Engineering & Technical',
    description: 'Mechanical, electrical, and process engineers required on mine sites and processing plants with fly in fly out arrangements.',
    icon: ShieldCheck,
  },
  {
    title: 'Health & Safety',
    description: 'Site medics, safety officers and occupational health professionals managing workforce wellbeing in remote locations.',
    icon: CheckCircle,
  },
]

const rotationSchedules = [
  { schedule: '2 weeks on / 1 week off', description: 'Most common rotation in mining and oil sectors' },
  { schedule: '2 weeks on / 2 weeks off', description: 'Popular in offshore oil and gas positions' },
  { schedule: '4 weeks on / 1 week off', description: 'Typical for remote construction projects' },
  { schedule: '8 days on / 6 days off', description: 'Frequently used in surface mining operations' },
  { schedule: '3 weeks on / 3 weeks off', description: 'Common in long haul infrastructure projects' },
]

const faqs = [
  {
    question: 'What does FIFO stand for in employment?',
    answer: 'FIFO stands for Fly In Fly Out. It refers to a work arrangement where employees are flown to a remote job site for a set number of days or weeks, then flown back home for their rostered time off. This model is widely used in industries like mining, oil and gas, and large scale construction where project sites are located far from major population centers.',
  },
  {
    question: 'How much do FIFO workers typically earn?',
    answer: 'FIFO workers generally earn significantly more than equivalent roles based in cities, largely due to the remote location allowance, site allowances, and the nature of the work. According to the U.S. Bureau of Labor Statistics, workers in extraction and mining occupations earn a median annual wage well above the national average, with experienced FIFO workers in oil and gas often earning between $80,000 and $180,000 per year depending on the role and employer.',
  },
  {
    question: 'Do employers pay for flights in FIFO jobs?',
    answer: 'Yes, in the vast majority of FIFO arrangements, the employer covers all travel costs including flights to and from the site, as well as accommodation and meals while on site. This is one of the key financial advantages of FIFO work, as employees effectively have no living expenses during their rostered on period.',
  },
  {
    question: 'What qualifications do I need for a FIFO job?',
    answer: 'Qualifications vary widely depending on the role. Entry level positions such as laborers or camp services roles may require only a valid drivers license and a willingness to pass a pre employment medical. Skilled trade roles typically require relevant certifications, while engineering and supervisory positions require formal qualifications. Many employers also require a valid medical clearance and, for mining roles, a site safety induction card.',
  },
  {
    question: 'Are FIFO jobs regulated in the United States?',
    answer: 'Yes. FIFO workers in the United States are protected under federal and state labor law. The Occupational Safety and Health Administration (OSHA), part of the U.S. Department of Labor, sets and enforces workplace safety standards that apply to all remote and fly in fly out job sites. Employers are legally required to provide safe working conditions, appropriate personal protective equipment, and emergency response capabilities on all FIFO sites.',
  },
]

const tips = [
  {
    title: 'Get Your Medical Clearance Early',
    description: 'Most FIFO employers require a pre employment medical before you can start on site. Book this in advance as it can take time to schedule and receive results.',
  },
  {
    title: 'Research the Rotation Before You Apply',
    description: 'Different rotations suit different lifestyles. A 2 on 1 off schedule works well for some, while others prefer longer breaks. Make sure the roster aligns with your family and personal commitments.',
  },
  {
    title: 'Obtain Relevant Safety Certifications',
    description: 'Certificates such as first aid, confined space entry, and working at heights significantly increase your employability for FIFO roles and may be required before site access is granted.',
  },
  {
    title: 'Understand Your Entitlements',
    description: 'According to the U.S. Department of Labor, remote workers are entitled to the same minimum wage, overtime protections, and workplace safety standards as any other employee. Always review your contract carefully before signing.',
  },
]

export default async function FifoJobsPage({ searchParams }: any) {
  const params = await searchParams

  const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'fly in fly out jobs', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'fly in fly out jobs', where: params.where || '', results_per_page: 30, page: 1 }),
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
            Fly In Fly Out Jobs Available Now
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="fly in fly out jobs" />
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
                what={params.what || 'fly in fly out jobs'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* FIFO Sectors */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Plane className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Industries Hiring FIFO Workers Right Now</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Fly in fly out employment spans a wide range of industries operating in remote locations across the United States. Whether you are a tradesperson, engineer, or looking for your first site role, there is a FIFO position suited to your background.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fifoSectors.map((sector, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <sector.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{sector.title}</h3>
                <p className="text-gray-600 text-sm">{sector.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Rotation Schedules */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Common FIFO Rotation Schedules</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            FIFO jobs operate on a roster system that alternates between time on site and time at home. Understanding the different rotation schedules helps you find an arrangement that fits your lifestyle before you apply.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rotationSchedules.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{item.schedule}</p>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Salary Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">How Much Can You Earn in a FIFO Job?</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics, workers in extraction and resource industries consistently rank among the highest paid occupational groups in the country. FIFO workers benefit from site allowances, remote location bonuses, and the absence of day to day living costs while on roster, which significantly increases effective take home pay.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">$75K+</p>
                <p className="text-sm text-gray-600">Entry Level Annual Salary</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-blue-600 mb-2">$120K+</p>
                <p className="text-sm text-gray-600">Skilled Trades Average</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-purple-600 mb-2">$180K+</p>
                <p className="text-sm text-gray-600">Engineering and Supervisory</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Note: Salaries vary by employer, location, experience, and role. The figures above are indicative ranges based on industry data. Always verify compensation details directly with the hiring employer.
            </p>
          </div>
        </section>

        {/* Tips Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">How to Land Your First FIFO Job</h2>
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
            <ShieldCheck className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About FIFO Jobs</h2>
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
            <strong>Disclaimer:</strong> The salary figures and employment information provided on this page are for general informational purposes only and do not constitute financial or legal advice. Compensation and working conditions vary by employer, location, and role. Always review your employment contract carefully and consult the U.S. Department of Labor at dol.gov or OSHA at osha.gov for current workplace regulations applicable to remote and FIFO work arrangements.
          </p>
        </section>
      </div>
    </>
  )
}