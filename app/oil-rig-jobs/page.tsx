import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, AlertTriangle, BookOpen, TrendingUp, ShieldCheck, Wrench } from 'lucide-react'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Oil Rig Jobs | Offshore & Onshore Drilling Positions',
  description: 'Roughneck, driller, roustabout, and engineer roles on U.S. offshore and onshore rigs. Rotational schedules with accommodation provided — entry-level slots included.',
  keywords: 'oil rig jobs, oil rig hiring now, offshore oil rig jobs, onshore oil rig jobs, roughneck jobs, roustabout jobs, oil rig no experience, oil field jobs, drilling jobs',
  openGraph: {
    title: 'Oil Rig Jobs | Gulf Coast, Permian & Bakken Openings',
    description: 'Oil rigs across the US Gulf Coast, Permian Basin, and Bakken are actively hiring. High-paying rotational positions with full room and board. Apply today.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oil Rig Jobs | Roughneck, Driller & Engineer Roles',
    description: 'Find oil rig jobs hiring now. Entry-level to senior drilling positions available offshore and onshore. Top pay, FIFO schedules, and full accommodations provided.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/oil-rig-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Oil Rig Jobs',
  description: 'Find oil rig jobs hiring now across the United States. Browse offshore and onshore drilling positions including roughneck, roustabout, driller, and engineering roles.',
  url: 'https://www.oh-my-job.com/oil-rig-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Oil Rig Jobs',
    description: 'Current oil rig job listings across the United States',
  },
}

const jobRoles = [
  {
    title: 'Roustabout',
    description: 'The most common entry-level position on an oil rig. Roustabouts perform general labor including cleaning, painting, moving equipment, and assisting other crew members. No prior experience is typically required.',
    icon: Wrench,
  },
  {
    title: 'Roughneck',
    description: 'Roughnecks work directly on the drill floor, handling drill pipe connections, maintaining drilling equipment, and operating rig machinery under the direction of the driller. A physically demanding but well-compensated role.',
    icon: ShieldCheck,
  },
  {
    title: 'Driller',
    description: 'Drillers operate the draw works and rotary table, monitor drilling parameters, and are responsible for the safe execution of drilling operations on their shift. Significant experience as a roughneck is typically required.',
    icon: Briefcase,
  },
  {
    title: 'Toolpusher',
    description: 'Toolpushers supervise all drilling operations on the rig, manage crew scheduling, and serve as the primary point of contact between the drilling contractor and the operating company representative.',
    icon: Shield,
  },
  {
    title: 'Mud Engineer',
    description: 'Mud engineers, also called drilling fluids engineers, formulate and monitor drilling fluid properties to ensure wellbore stability and drilling efficiency. A background in chemistry or petroleum engineering is common.',
    icon: TrendingUp,
  },
  {
    title: 'Petroleum Engineer',
    description: 'Petroleum engineers design drilling programs, optimize production strategies, and provide technical oversight on oil and gas operations. These roles typically require a four-year engineering degree and command the highest compensation on the rig.',
    icon: BookOpen,
  },
]

const hiringSteps = [
  {
    step: '1',
    title: 'Meet Basic Physical and Medical Requirements',
    description: 'According to the U.S. Bureau of Labor Statistics and industry standards, oil rig workers must pass a pre-employment physical examination and drug screening before beginning work. Offshore positions additionally require a medical certificate confirming fitness for offshore duty, often assessed against standards set by the International Medical Guide for Ships or equivalent guidelines.',
  },
  {
    step: '2',
    title: 'Complete HUET and Basic Safety Training',
    description: 'Offshore oil rig workers in the United States are required to complete Helicopter Underwater Escape Training (HUET) and Basic Offshore Safety Induction and Emergency Training (BOSIET) before working on an offshore installation. These certifications are governed by the International Well Control Forum (IWCF) and recognized by operators across the U.S. Gulf of Mexico.',
  },
  {
    step: '3',
    title: 'Obtain Your TWIC Card for Offshore and Port Access',
    description: 'A Transportation Worker Identification Credential (TWIC) is required for unescorted access to secure areas of maritime facilities and offshore installations regulated by the U.S. Coast Guard. According to the Transportation Security Administration (TSA), applicants must pass a security threat assessment to receive the credential. The TWIC application process typically takes four to six weeks.',
  },
  {
    step: '4',
    title: 'Apply Through Drilling Contractors and Operators',
    description: 'Major drilling contractors such as Halliburton, Schlumberger, Baker Hughes, Transocean, and Patterson-UTI maintain active recruitment pipelines for rig positions. Applying directly through contractor career portals alongside job board applications maximizes your exposure to open positions.',
  },
]

const salaryByRole = [
  { role: 'Roustabout', salary: '$40,000 to $58,000' },
  { role: 'Roughneck', salary: '$55,000 to $78,000' },
  { role: 'Driller', salary: '$80,000 to $110,000' },
  { role: 'Toolpusher', salary: '$100,000 to $140,000' },
  { role: 'Mud Engineer', salary: '$90,000 to $130,000' },
  { role: 'Petroleum Engineer', salary: '$120,000 to $180,000+' },
]

const oilfieldRegions = [
  { region: 'Gulf of Mexico (Offshore)', note: 'The largest offshore oil producing region in the US, regulated by the Bureau of Safety and Environmental Enforcement (BSEE). Home to hundreds of active platforms and the highest concentration of offshore rig jobs.' },
  { region: 'Permian Basin, Texas and New Mexico', note: 'The most productive onshore oil basin in the United States and one of the most active in the world. Midland and Odessa are major hub cities for oilfield employment.' },
  { region: 'Bakken Formation, North Dakota', note: 'A major shale oil producing region that drove significant hiring growth during the shale boom. Active rig counts fluctuate with oil prices but remain substantial.' },
  { region: 'Eagle Ford Shale, Texas', note: 'One of the most prolific tight oil plays in the United States, spanning 400 miles across south Texas. San Antonio and Corpus Christi serve as major support hubs.' },
  { region: 'DJ Basin, Colorado', note: 'A major oil producing basin centered around the Wattenberg Gas Field, with significant activity from operators including Civitas Resources and Chevron.' },
  { region: 'Marcellus and Utica Shale, Appalachia', note: 'Primarily natural gas producing formations spanning Pennsylvania, Ohio, and West Virginia. Offers stable employment for rig workers in gas-focused drilling operations.' },
]

const faqs = [
  {
    question: 'Can I get an oil rig job with no experience?',
    answer: 'Yes. Roustabout and general laborer positions are specifically designed as entry points for workers with no prior oil and gas experience. According to the U.S. Bureau of Labor Statistics, most entry-level oilfield workers receive on-the-job training. Employers look for physical fitness, a willingness to work rotational schedules, and a clean background and drug test rather than prior industry experience for these roles.',
  },
  {
    question: 'How much do oil rig workers earn on average in the United States?',
    answer: 'According to the U.S. Bureau of Labor Statistics Occupational Employment and Wage Statistics program, the median annual wage for rotary drill operators in oil and gas was $63,170 in May 2023. Derrick operators earned a median of $57,280, while service unit operators earned $52,980. Senior roles such as toolpushers and petroleum engineers can earn well above $100,000 annually, particularly on offshore installations where day rates are significantly higher than onshore positions.',
  },
  {
    question: 'What is the typical work schedule on an oil rig?',
    answer: 'Most oil rig positions operate on rotational schedules rather than traditional Monday-to-Friday arrangements. Common rotations in the U.S. industry include 14 days on and 14 days off, 28 days on and 28 days off, and 7 days on and 7 days off. During the on period, workers typically work 12-hour shifts every day. Room, board, and transportation to and from the rig are covered by the employer during the on rotation, which significantly reduces living expenses.',
  },
  {
    question: 'Is oil rig work dangerous?',
    answer: 'Oil and gas extraction is classified by the U.S. Bureau of Labor Statistics as one of the higher-risk occupations in terms of workplace fatality rates. However, the industry has significantly improved its safety record over the past two decades through stricter OSHA enforcement, mandatory safety training, and operator safety management systems. According to the Occupational Safety and Health Administration (OSHA), employers are required to maintain a comprehensive safety program, provide PPE, and ensure workers are trained for all hazardous tasks they perform.',
  },
  {
    question: 'What certifications do I need to work on an offshore oil rig?',
    answer: 'For offshore operations in the United States, the core certifications required are a Transportation Worker Identification Credential (TWIC) from the TSA, HUET certification for helicopter underwater egress, and BOSIET or equivalent basic offshore safety training. Many employers additionally require H2S safety training, first aid and CPR certification, and well control certification through IWCF or IADC for senior drilling roles. Some certifications must be renewed every few years.',
  },
  {
    question: 'What is the job outlook for oil rig workers?',
    answer: 'According to the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, employment of rotary drill operators in oil and gas is projected to decline modestly over the next decade as automation and efficiency improvements reduce crew sizes on individual rigs. However, overall demand for oil and gas extraction workers remains tied to commodity prices and domestic production levels. The U.S. Energy Information Administration projects continued strong domestic oil production through the 2030s, supporting sustained hiring demand in active basins.',
  },
]

const tips = [
  {
    title: 'Get Your TWIC Card Before You Apply',
    description: 'A Transportation Worker Identification Credential is mandatory for offshore work and takes four to six weeks to process through the TSA. Starting your TWIC application before you begin job searching means you will be ready to accept an offer immediately, while applicants who apply without one face delays that employers are often unwilling to accommodate.',
  },
  {
    title: 'Complete H2S Safety Training',
    description: 'Hydrogen sulfide (H2S) awareness training is required at virtually every oil and gas work site in the United States. The one-day course covers H2S properties, detection, escape procedures, and self-contained breathing apparatus use. Having this certification on your resume signals basic oilfield safety literacy and is expected by most hiring managers before a first interview.',
  },
  {
    title: 'Be Flexible on Location and Rotation',
    description: 'Candidates who indicate willingness to work in any active basin and across multiple rotation schedules receive significantly more callbacks than those who restrict themselves to a single region or shift pattern. The most active hiring markets, including the Permian Basin and the Gulf of Mexico, often require relocation or extended commutes that many local applicants are unwilling to accept.',
  },
  {
    title: 'Apply Directly to Drilling Contractors as Well as Operators',
    description: 'Most oil rig positions are employed by drilling contractors rather than the oil company whose name is on the well. Major contractors including Patterson-UTI, Precision Drilling, and Nabors Industries maintain large entry-level hiring programs that run independently of operator job boards. Targeting both simultaneously maximizes the number of active opportunities you are being considered for at any given time.',
  },
]

export default async function OilRigJobsPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'oil rig', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'oil rig', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
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
            Oil Rig Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="oil rig" />
          </aside>
          <div className="flex-1">

             {/* Client wrapper isolé — pas de use client sur la page */}
                        
            
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'oil rig'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Job Roles */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Oil Rig Job Roles and What They Involve</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics, the oil and gas extraction industry employs over 150,000 workers across onshore and offshore operations in the United States. Positions range from entry-level labor roles requiring no prior experience to highly specialized engineering and supervisory positions commanding six-figure compensation.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobRoles.map((role, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <role.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How to Get Hired */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">How to Get Hired on an Oil Rig in the United States</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Getting hired on an oil rig requires more preparation than most job applications. Safety certifications, background checks, and physical fitness standards are non-negotiable requirements that must be completed before an offer can be finalized. Understanding this process before you apply puts you significantly ahead of the competition.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {hiringSteps.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-green-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 font-bold rounded-full text-sm mb-4">
                  {item.step}
                </span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Salary Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">How Much Do Oil Rig Workers Earn?</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics Occupational Employment and Wage Statistics program, oil and gas extraction workers are among the highest-paid blue-collar workers in the United States. Offshore positions command a premium over equivalent onshore roles due to the remoteness of the work location, and all rig workers benefit from employer-provided room and board during their on rotation, which significantly increases the effective value of their compensation.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">$63,170</p>
                <p className="text-sm text-gray-600">Median Annual Wage, Rotary Drill Operators (BLS 2023)</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-blue-600 mb-2">$30.37</p>
                <p className="text-sm text-gray-600">Median Hourly Rate</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-purple-600 mb-2">$180,000+</p>
                <p className="text-sm text-gray-600">Senior Engineering and Supervisory Roles</p>
              </div>
            </div>
            <h3 className="font-semibold text-gray-800 mb-4">Estimated Annual Pay Range by Oil Rig Role</h3>
            <div className="grid md:grid-cols-3 gap-3">
              {salaryByRole.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-3 flex justify-between items-center">
                  <span className="text-sm text-gray-700 font-medium">{item.role}</span>
                  <span className="text-sm font-bold text-green-600">{item.salary}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics, May 2023. Figures are estimates and vary by operator, contractor, basin, and experience level.
            </p>
          </div>
        </section>

        {/* Active Oilfield Regions */}
        <section className="mt-20">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <MapPin className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Where Oil Rig Jobs Are Concentrated in the United States</h2>
                <p className="text-gray-700 mb-6">
                  According to the U.S. Energy Information Administration, domestic oil production is concentrated in a handful of major basins that account for the majority of active drilling activity and therefore the majority of oil rig employment. Understanding where the work is located is essential for job seekers targeting this sector.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {oilfieldRegions.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg p-4">
                      <p className="font-semibold text-gray-900 mb-1">{item.region}</p>
                      <p className="text-gray-600 text-sm">{item.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Career Ladder */}
        <section className="mt-20">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <TrendingUp className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">The Oil Rig Career Ladder</h2>
                <p className="text-gray-700 mb-4">
                  The oil and gas drilling industry has one of the most clearly defined internal advancement pathways of any blue-collar sector. Most senior drillers and toolpushers began as roustabouts or roughnecks and advanced through demonstrated competency and safety performance. The industry rewards tenure and experience in a way that makes it possible to significantly increase earnings within a five to ten year period without a formal degree.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-6 flex-wrap">
                  {['Roustabout', 'Roughneck', 'Derrickman', 'Driller', 'Toolpusher', 'Rig Superintendent'].map((level, index, arr) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="bg-white border border-blue-200 rounded-lg px-4 py-2 text-sm font-semibold text-blue-700">
                        {level}
                      </div>
                      {index < arr.length - 1 && (
                        <span className="text-blue-400 font-bold hidden sm:block">→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* OSHA Safety */}
        <section className="mt-20">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">OSHA and BSEE Safety Requirements for Oil Rig Workers</h2>
                <p className="text-gray-700 mb-4">
                  Oil rig work is subject to some of the most comprehensive safety regulations in U.S. industry. Onshore operations fall under OSHA standards, particularly 29 CFR Part 1910 and 1926. Offshore operations are additionally regulated by the Bureau of Safety and Environmental Enforcement (BSEE), which administers the Safety and Environmental Management Systems (SEMS) rule requiring all offshore operators to maintain a formal safety management program.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Mandatory Safety Certifications</h3>
                    <ul className="text-gray-600 text-sm space-y-2">
                      {[
                        'TWIC card for all offshore and port access (TSA)',
                        'HUET for all helicopter-transported offshore workers',
                        'BOSIET or equivalent basic offshore safety training',
                        'H2S awareness and self-rescue training',
                        'First Aid and CPR certification',
                        'Well control (IWCF or IADC) for drilling supervisors',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Your Rights as an Oil Rig Worker Under OSHA</h3>
                    <ul className="text-gray-600 text-sm space-y-2">
                      {[
                        'Right to receive training in a language you understand',
                        'Right to request an OSHA inspection without fear of retaliation',
                        'Right to refuse work you reasonably believe poses imminent danger',
                        'Right to receive copies of workplace injury and illness records',
                        'Whistleblower protections under Section 11(c) of the OSH Act',
                        'Right to PPE at no cost for hazards covered by OSHA standards',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Rotation Schedules */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Oil Rig Work Schedules and Rotations</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Oil rig positions operate on rotational schedules that alternate between time on the rig and time at home. All meals, accommodation, and transport to and from the rig are provided by the employer during the on rotation, which means workers have essentially zero living expenses during their working period.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { shift: '14 and 14', time: '14 days on / 14 days off', note: 'Most common rotation for Gulf of Mexico offshore positions' },
              { shift: '28 and 28', time: '28 days on / 28 days off', note: 'Standard for deepwater and international offshore assignments' },
              { shift: '7 and 7', time: '7 days on / 7 days off', note: 'Common in onshore shale plays including the Permian Basin' },
              { shift: 'Hitch Work', time: 'Variable by operator', note: 'Shorter hitches used in some onshore and completion operations' },
            ].map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{item.shift}</p>
                <p className="text-blue-600 text-sm font-medium mb-2">{item.time}</p>
                <p className="text-gray-500 text-xs">{item.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Getting Your First Oil Rig Job</h2>
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

        {/* FAQ */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Oil Rig Jobs</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group bg-white border border-gray-200 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                  <h3 className="font-semibold text-gray-900 pr-4">{faq.question}</h3>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> The salary figures, employment projections, safety requirements, and regulatory information provided on this page are for general informational purposes only and do not constitute legal or career advice. Oil rig working conditions, pay rates, and certification requirements vary by operator, contractor, location, and role. Always consult the U.S. Bureau of Labor Statistics at bls.gov, the Occupational Safety and Health Administration at osha.gov, the Bureau of Safety and Environmental Enforcement at bsee.gov, and the Transportation Security Administration at tsa.gov for the most current and applicable information before beginning employment in the oil and gas sector.
          </p>
        </section>
      </div>
    </>
  )
}