import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, DollarSign, CheckCircle, Shield, TrendingUp, Award, MapPin, AlertTriangle, Flame, Wrench } from 'lucide-react'
import { getCachedJobCount, searchJobs } from '@/lib/adzuna'

export const metadata: Metadata = {
  title: 'Urgently Hiring: Welding Jobs Near You | Apply Today',
  description: 'Find welding jobs hiring immediately across the United States. MIG, TIG, stick, and structural welding positions at top manufacturers, shipyards, and construction firms. Competitive pay up to $35/hr and beyond. Apply in minutes and start your welding career today!',
  keywords: 'welding jobs, welding jobs near me, welder hiring now, MIG welder jobs, TIG welder jobs, structural welder jobs, pipe welder jobs, welding careers, entry level welding jobs',
  openGraph: {
    title: 'Immediate Opening: Welding Jobs Hiring Now | Oh My Job',
    description: 'Hundreds of welding positions available now across manufacturing, construction, and energy. MIG, TIG, and pipe welding roles with competitive pay. Apply today!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Now Hiring: Welding Jobs | High Pay, Immediate Start',
    description: 'Browse welding jobs hiring immediately near you. Skilled trades in high demand nationwide. Competitive salaries and career advancement. Apply now!',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/welding-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Welding Jobs',
  description: 'Find welding jobs hiring now across the United States. Browse MIG, TIG, pipe, and structural welding positions with immediate openings.',
  url: 'https://www.oh-my-job.com/welding-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Welding Jobs',
    description: 'Current welding job listings with immediate hiring needs',
  },
}

const weldingSpecialties = [
  {
    title: 'MIG Welder',
    description: 'Metal Inert Gas welding is the most widely used process in manufacturing and fabrication. MIG welders are in demand at auto plants, metal fabrication shops, and structural steel facilities.',
  },
  {
    title: 'TIG Welder',
    description: 'Tungsten Inert Gas welding requires a higher skill level and is used for precision work on stainless steel, aluminum, and exotic alloys in aerospace, food processing, and pharmaceutical industries.',
  },
  {
    title: 'Stick Welder: SMAW',
    description: 'Shielded Metal Arc Welding is used extensively in heavy construction, shipbuilding, and pipeline maintenance. Stick welders are highly valued for outdoor and field work.',
  },
  {
    title: 'Pipe Welder',
    description: 'Pipe welders work on pressurized systems in oil and gas, power generation, and water treatment plants. This specialty commands some of the highest wages in the welding trade.',
  },
  {
    title: 'Structural Welder',
    description: 'Join beams, columns, and steel components for bridges, buildings, and infrastructure projects. Structural welding positions are closely tied to the construction industry.',
  },
  {
    title: 'Underwater and Hyperbaric Welder',
    description: 'A highly specialized field combining commercial diving and welding for offshore platforms, ship hulls, and underwater pipelines. Among the highest paid welding roles in the country.',
  },
]

const jobOutlookData = [
  { label: 'Projected Job Growth (2023 to 2033)', value: '2%', detail: 'Steady demand with strong replacement needs' },
  { label: 'Annual Job Openings', value: '49,600', detail: 'Average openings per year from growth and turnover' },
  { label: 'Median Annual Wage', value: '$50,490', detail: 'For welders, cutters, solderers, and brazers (May 2024)' },
]

const salaryBySpecialty = [
  { role: 'MIG Welder', salary: '$44,000 to $58,000', note: 'Varies by industry and location' },
  { role: 'TIG Welder', salary: '$50,000 to $70,000', note: 'Higher for aerospace and precision work' },
  { role: 'Pipe Welder', salary: '$60,000 to $95,000', note: 'Top earners in oil, gas, and power' },
  { role: 'Structural Welder', salary: '$52,000 to $72,000', note: 'Infrastructure and heavy construction' },
  { role: 'Underwater Welder', salary: '$75,000 to $200,000+', note: 'Highly specialized and hazardous duty pay' },
  { role: 'Welding Inspector (CWI)', salary: '$65,000 to $95,000', note: 'AWS Certified Welding Inspector credential required' },
]

const certifications = [
  {
    name: 'AWS Certified Welder (CW)',
    org: 'American Welding Society',
    desc: 'The most recognized performance qualification in the industry. Validates your ability to produce welds that meet specific code requirements. Required or preferred by most major employers.',
  },
  {
    name: 'AWS Certified Welding Inspector (CWI)',
    org: 'American Welding Society',
    desc: 'Qualifies professionals to inspect welds for compliance with codes and standards. A CWI credential significantly increases earning potential and opens doors to quality assurance and supervisory roles.',
  },
  {
    name: 'API 1104 Pipeline Welding Certification',
    org: 'American Petroleum Institute',
    desc: 'Required for welders working on oil and gas transmission pipelines. One of the most valuable credentials in the trade, particularly for those pursuing high paying pipe welding work.',
  },
]

const topIndustries = [
  { industry: 'Manufacturing', detail: 'Automotive, aerospace, heavy equipment, and consumer goods manufacturers are among the largest employers of welders in the United States' },
  { industry: 'Construction', detail: 'Structural steel erection, bridge fabrication, and commercial building construction drive sustained demand for certified structural welders' },
  { industry: 'Oil, Gas, and Pipelines', detail: 'Upstream drilling, midstream pipeline, and downstream refining operations employ large numbers of pipe welders and require strict certification compliance' },
  { industry: 'Shipbuilding and Maritime', detail: 'US Navy shipyards and commercial shipbuilders consistently rank among the top welding employers, with positions at facilities in Virginia, Mississippi, and Maine' },
  { industry: 'Power Generation', detail: 'Nuclear, natural gas, and renewable energy facilities require certified welders for pressure vessel work, boiler maintenance, and new plant construction' },
]

const safetyRequirements = [
  'Proper personal protective equipment including welding helmet, gloves, and flame resistant clothing',
  'Adequate ventilation to control welding fumes, which the U.S. Department of Labor identifies as a significant occupational health hazard',
  'Eye and face protection rated for the specific welding process and arc intensity',
  'Compliance with OSHA Standard 29 CFR 1910.252 governing welding, cutting, and brazing in general industry',
  'Grounding and electrical safety procedures to prevent arc flash and electrocution',
  'Fire prevention measures including hot work permits in designated facilities',
]

const careerPath = [
  { role: 'Welding Helper or Apprentice', timeframe: 'Starting out', description: 'Assist experienced welders, learn safety procedures, and build foundational skills through a vocational program or employer sponsored apprenticeship' },
  { role: 'Welder (Journey Level)', timeframe: '1 to 3 years', description: 'Independently perform qualified welds in one or more processes, meet production standards, and begin earning industry certifications' },
  { role: 'Senior Welder or Lead Welder', timeframe: '3 to 7 years', description: 'Train junior staff, read complex blueprints, work on high value or safety critical applications, and pursue specialty certifications' },
  { role: 'Welding Inspector or Supervisor', timeframe: '7 to 12 years', description: 'Obtain CWI certification, oversee quality compliance, manage welding teams, and serve as the technical authority on welding procedures and code compliance' },
]

const applicationTips = [
  {
    title: 'Get AWS Certified Before You Apply',
    description: 'Obtaining an AWS Certified Welder qualification through a local community college or technical school dramatically increases your hirability. Many employers require or prioritize CW certified candidates for positions above entry level.',
  },
  {
    title: 'Specify Your Processes and Positions',
    description: 'Welding job postings are highly specific. Clearly list the processes you are qualified in (MIG, TIG, Stick, Flux Core), the positions you can weld (1G through 6G), and the materials you have worked with. Vague resumes are filtered out quickly.',
  },
  {
    title: 'Target High Paying Sectors Early',
    description: 'Pipeline, shipbuilding, and power generation pay significantly more than general fabrication shops. If you are building your career, choosing your first employer strategically based on industry can accelerate your wage growth by years.',
  },
  {
    title: 'Consider Union Apprenticeships',
    description: 'The International Brotherhood of Boilermakers and the United Association of Plumbers and Pipefitters both offer apprenticeship programs that combine paid on the job training with classroom instruction and lead directly to union scale wages and benefits.',
  },
]

const faqs = [
  {
    question: 'What is the job outlook for welders in the United States?',
    answer: 'According to the U.S. Bureau of Labor Statistics, employment of welders, cutters, solderers, and brazers is projected to grow 2 percent from 2023 to 2033. While this is slower than average, about 49,600 openings are projected each year on average due to the need to replace workers who retire or leave the occupation. Demand is particularly strong in pipeline, shipbuilding, and aerospace sectors.',
  },
  {
    question: 'How much do welders make per hour?',
    answer: 'The U.S. Bureau of Labor Statistics reports a median annual wage of $50,490 for welders, cutters, solderers, and brazers as of May 2024, which equates to approximately $24.27 per hour. Wages vary significantly by specialty and industry. Pipe welders and underwater welders consistently earn well above the median, while entry level fabrication shop welders may start closer to $18 to $20 per hour.',
  },
  {
    question: 'What certifications do welders need?',
    answer: 'Most professional welding positions require or prefer certification from the American Welding Society. The AWS Certified Welder program tests performance on specific welding procedures and codes. For pipeline work, the American Petroleum Institute API 1104 certification is widely required. Welding inspectors typically need the AWS Certified Welding Inspector credential. Some employers also accept certifications from the American Society of Mechanical Engineers for pressure vessel work.',
  },
  {
    question: 'Is welding a dangerous job?',
    answer: 'According to the U.S. Bureau of Labor Statistics, welding has above average injury and illness rates compared to other occupations. The primary hazards include exposure to ultraviolet radiation from the arc, inhalation of welding fumes and gases, burns, and electrical hazards. The U.S. Department of Labor\'s OSHA has established comprehensive standards under 29 CFR 1910.252 governing safe welding practices in general industry. Proper PPE, ventilation, and adherence to safety protocols significantly reduce risk.',
  },
  {
    question: 'How do I become a welder without experience?',
    answer: 'According to the official website of the United States Government, the most common pathway into welding is through vocational or technical training, which typically takes six months to two years and leads directly to entry level employment. Community colleges, trade schools, and union apprenticeship programs all offer welding training. The U.S. Department of Labor\'s Job Corps program also provides free welding training to eligible young adults ages 16 to 24.',
  },
  {
    question: 'What is the difference between MIG and TIG welding?',
    answer: 'According to the American Welding Society, MIG welding (Gas Metal Arc Welding) uses a continuously fed wire electrode and is known for speed and versatility, making it the most common process in manufacturing and fabrication. TIG welding (Gas Tungsten Arc Welding) uses a non consumable tungsten electrode and filler rod applied separately, offering greater precision and cleaner welds. TIG is preferred for thin materials, stainless steel, aluminum, and applications where weld appearance and integrity are critical. TIG welding requires more skill and commands higher wages.',
  },
]

export default async function WeldingJobsPage({ searchParams }: any) {
  const params = await searchParams

const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'welding jobs', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'welding jobs', where: params.where || '', results_per_page: 30, page: 1 }),
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
            Welding Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="welding jobs" />
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
                what={params.what || 'welding jobs'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Job Outlook */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-900">Welding Job Outlook in the United States</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics, approximately 49,600 welding job openings are projected each year through 2033, driven primarily by the need to replace experienced workers retiring from the trade. Skilled welders remain in strong demand across manufacturing, infrastructure, energy, and defense.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {jobOutlookData.map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{item.label}</p>
                <p className="text-emerald-600 text-2xl font-medium">{item.value}</p>
                <p className="text-gray-500 text-sm mt-1">{item.detail}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Source: U.S. Bureau of Labor Statistics, Occupational Outlook Handbook, Welders, Cutters, Solderers, and Brazers, updated 2024
          </p>
        </section>

        {/* Specialties */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Flame className="w-7 h-7 text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-900">Welding Specialties in Demand</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Welding encompasses a wide range of processes, each suited to different materials, industries, and applications. Understanding which specialty aligns with your skills and career goals helps you target the right openings and command the right wage.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weldingSpecialties.map((item, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <Wrench className="w-10 h-10 text-orange-400 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Salary by Specialty */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Welding Salaries by Specialty</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              The U.S. Bureau of Labor Statistics reports a median annual wage of $50,490 for welders as of May 2024. However, earnings vary dramatically by specialty, industry, and location. Pipe welders and underwater welders consistently earn far above the median, while shop fabrication roles typically fall below it.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-green-200 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-green-100">
                    <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-green-200">Specialty</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-green-200">Typical Range</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-green-200">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-green-100">
                  {salaryBySpecialty.map(({ role, salary, note }, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-green-50/40'}>
                      <td className="px-4 py-3 font-medium text-gray-900">{role}</td>
                      <td className="px-4 py-3 text-green-700 font-semibold">{salary}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics, May 2024 data
            </p>
          </div>
        </section>

        {/* Top Industries */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Top Industries Hiring Welders</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics, the industries employing the largest number of welders include manufacturing, construction, transportation equipment fabrication, and the oil and gas sector. Each offers distinct pay structures, working conditions, and career trajectories.
          </p>
          <div className="space-y-3">
            {topIndustries.map((item, i) => (
              <div key={i} className="flex gap-4 bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                <div className="flex-shrink-0 w-2 rounded-full bg-blue-200 self-stretch" />
                <div>
                  <p className="font-semibold text-gray-900 mb-1">{item.industry}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-amber-500" />
            <h2 className="text-2xl font-bold text-gray-900">Welding Certifications That Increase Your Earning Power</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Certification is one of the most direct ways to increase wages and access higher paying welding roles. The American Welding Society and major industry bodies issue credentials that are widely recognized by employers across all sectors.
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {certifications.map((cert, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <Award className="w-8 h-8 text-amber-500 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">{cert.name}</h3>
                <p className="text-xs text-amber-600 font-medium mb-2">{cert.org}</p>
                <p className="text-gray-600 text-sm">{cert.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Safety */}
        <section className="mt-20">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Welding Safety and OSHA Requirements</h2>
                <p className="text-gray-700 mb-4">
                  According to the U.S. Department of Labor, welding is classified as a hazardous occupation. OSHA Standard 29 CFR 1910.252 establishes mandatory safety requirements for welding, cutting, and brazing operations in general industry. All workers are entitled to safe working conditions regardless of employment status.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {safetyRequirements.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-gray-700">
                      <span className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0 mt-1.5" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Source: U.S. Department of Labor, OSHA, Welding, Cutting, and Brazing Standard 29 CFR 1910.252
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Career Path */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Welding Career Progression</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Welding offers a clear and well compensated career ladder. Workers who invest in certifications and specialty skills can progress from entry level helper to welding inspector or supervisor within a decade, often without requiring a four year degree.
          </p>
          <div className="space-y-4">
            {careerPath.map((step, i) => (
              <div key={i} className="flex gap-5 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                  {i + 1}
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5 flex-1 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{step.role}</h3>
                    <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{step.timeframe}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Application Tips */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Landing a Welding Job</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {applicationTips.map((tip, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 font-bold rounded-full text-sm mb-4">
                  {i + 1}
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Welding Jobs</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
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

        {/* Disclaimer */}
        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and is based on data from the U.S. Bureau of Labor Statistics, the U.S. Department of Labor, OSHA, and the American Welding Society. Salary ranges, certification requirements, and safety regulations are subject to change. Always verify current requirements with your state labor agency, the relevant certification body, or the hiring employer before applying.
          </p>
        </section>

      </div>
    </>
  )
}