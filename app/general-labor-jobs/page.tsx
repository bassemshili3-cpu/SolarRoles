import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import {
  Hammer,
  TrendingUp,
  DollarSign,
  MapPin,
  ShieldCheck,
  Award,
  AlertTriangle,
  HardHat,
  Briefcase,
  Users,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Urgent: General Labor Jobs Hiring Now | Apply Today, Start This Week',
  description:
    'Hundreds of general labor jobs with immediate openings across the US. No degree required. Competitive pay from $17/hr. Construction, warehousing, manufacturing and more. Apply now and start fast.',
  keywords:
    'general labor jobs, general labor jobs near me, general laborer hiring now, general labor positions, manual labor jobs, general labor work, laborer jobs no experience',
  openGraph: {
    title: 'Urgent: General Labor Jobs Hiring Now | Start This Week',
    description:
      'Immediate openings for general laborers across the US. No experience required for most roles. Apply today.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Now Hiring General Labor – Urgent Need Across the US',
    description:
      'General labor positions available immediately. Competitive hourly pay, flexible shifts, no degree required. Browse and apply now.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/general-labor-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'General Labor Jobs',
  description:
    'Find general labor jobs hiring now across the United States. Browse construction, warehouse, manufacturing, and landscaping positions with immediate openings.',
  url: 'https://www.oh-my-job.com/general-labor-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'General Labor Job Listings',
    description: 'Current general labor job openings across the US',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What does a general laborer do?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'General laborers perform physical tasks that keep job sites and facilities running. Duties vary by industry but typically include loading and unloading materials, moving equipment, cleaning work areas, assisting skilled tradespeople, and operating basic hand tools. The role exists across construction, manufacturing, warehousing, landscaping, and event services.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much do general labor jobs pay per hour?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Average hourly pay for general laborers in the US ranges from $17 to $24 depending on industry, location, and experience. Entry-level warehouse roles typically start near $17/hr, while construction laborers with OSHA certifications or specialized skills can earn $22 to $30/hr or more. Top-paying states include California, Washington, and Massachusetts.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do general labor jobs require experience?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most general labor positions do not require prior experience. Employers prioritize physical stamina, reliability, and a willingness to follow safety protocols. On-the-job training is standard across construction, warehousing, and manufacturing roles.',
      },
    },
    {
      '@type': 'Question',
      name: 'What certifications increase pay for general laborers?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The most impactful certifications are OSHA 10 and OSHA 30 (construction or general industry), forklift operator certification, First Aid/CPR, and flagger certification for road work. These credentials can increase hourly pay by $2 to $6 and significantly expand the number of employers willing to hire.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between a temp general labor job and a direct-hire position?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Temporary assignments are placed through staffing agencies and offer flexibility and quick starts, often with daily or weekly pay. Direct-hire positions are permanent roles where the employer hires you directly, offering benefits, stability, and a clearer path to raises and promotion. Many temp assignments convert to direct hire after 30 to 90 days of consistent performance.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which industries hire the most general laborers?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Construction, warehousing and logistics, manufacturing, landscaping and groundskeeping, and event setup and breakdown are the five largest employers of general laborers in the US. Construction and warehousing are currently the highest-volume sectors due to sustained infrastructure investment and e-commerce growth.',
      },
    },
  ],
}

/* ─── SECTION DATA ──────────────────────────────────────────── */

const industryBreakdown = [
  {
    industry: 'Construction',
    icon: HardHat,
    color: 'text-orange-600',
    bg: 'bg-orange-50 border-orange-200',
    typicalTasks: 'Site cleanup, material handling, trench digging, concrete mixing, scaffolding assembly',
    payRange: '$18 – $28/hr',
    demandLevel: 'Very High',
    notes:
      'Infrastructure bills passed in recent years continue to generate consistent openings. Night and weekend shifts often carry a premium of $1 to $3/hr.',
  },
  {
    industry: 'Warehousing & Logistics',
    icon: Briefcase,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    typicalTasks: 'Picking, packing, loading, unloading, inventory movement, order staging',
    payRange: '$17 – $23/hr',
    demandLevel: 'Very High',
    notes:
      'E-commerce fulfillment centers are the single largest source of general labor openings nationwide. Peak hiring windows occur in Q3 and Q4 each year.',
  },
  {
    industry: 'Manufacturing',
    icon: Hammer,
    color: 'text-gray-700',
    bg: 'bg-gray-50 border-gray-200',
    typicalTasks: 'Assembly line support, machine tending, quality checks, material feeding, packaging',
    payRange: '$17 – $25/hr',
    demandLevel: 'High',
    notes:
      'The reshoring of domestic manufacturing is creating sustained demand in the Midwest and Southeast. Overnight shifts typically pay $1 to $2/hr more than day shifts.',
  },
  {
    industry: 'Landscaping & Groundskeeping',
    icon: MapPin,
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-200',
    typicalTasks: 'Mowing, planting, debris removal, irrigation installation, snow removal in winter',
    payRange: '$16 – $22/hr',
    demandLevel: 'Seasonal / Steady',
    notes:
      'Strongest demand from spring through fall. Employers in the Sun Belt hire year-round. Spanish fluency is a meaningful differentiator in many markets.',
  },
  {
    industry: 'Events & Venue Services',
    icon: Users,
    color: 'text-purple-600',
    bg: 'bg-purple-50 border-purple-200',
    typicalTasks: 'Stage setup, crowd barrier placement, equipment transport, venue cleanup, load-in and load-out',
    payRange: '$16 – $24/hr',
    demandLevel: 'Moderate / Flexible',
    notes:
      'Highly flexible with weekend-heavy scheduling. Stadium, arena, and convention center work pays well for short bursts and suits people who prefer irregular schedules.',
  },
]

const careerLadder = [
  {
    level: 'General Laborer (Entry)',
    timeframe: 'Day 1',
    pay: '$17 – $19/hr',
    what:
      'Physical tasks assigned by a lead or supervisor. No prior experience required. On-the-job safety training provided by the employer.',
  },
  {
    level: 'Experienced Laborer',
    timeframe: '6 – 18 months',
    pay: '$19 – $23/hr',
    what:
      'Familiarity with job-site protocols earns more complex assignments and higher hourly pay. Forklift or equipment certification often achieved at this stage.',
  },
  {
    level: 'Lead Laborer / Crew Lead',
    timeframe: '1 – 3 years',
    pay: '$23 – $28/hr',
    what:
      'Responsible for directing a small team, tracking materials, and communicating with the site supervisor. No management degree required — performance is what earns this.',
  },
  {
    level: 'Foreperson / Site Supervisor',
    timeframe: '3 – 7 years',
    pay: '$28 – $40/hr',
    what:
      'Full responsibility for a crew, safety compliance, daily reporting, and coordination with project managers. Salary packages often include benefits and vehicle allowance.',
  },
  {
    level: 'Specialized Trade or Management',
    timeframe: '5+ years',
    pay: '$40/hr+',
    what:
      'Laborers who pursue apprenticeships in carpentry, electrical, plumbing, or heavy equipment operation can earn $50 to $80/hr as journeymen or masters. This path is entirely accessible without a college degree.',
  },
]

const certifications = [
  {
    name: 'OSHA 10 (Construction or General Industry)',
    cost: '$30 – $80 online',
    payImpact: '+$1 – $3/hr',
    description:
      'The single most effective credential for unlocking construction and manufacturing roles. Many job sites require it before workers can begin. Takes roughly 10 hours to complete online.',
  },
  {
    name: 'OSHA 30',
    cost: '$150 – $250 online',
    payImpact: '+$2 – $5/hr',
    description:
      'The 30-hour version is required for lead laborer and crew lead roles on federally funded projects. Demonstrates a higher level of safety knowledge and is seen as a supervisory credential.',
  },
  {
    name: 'Forklift Operator Certification',
    cost: '$50 – $200 (often paid by employer)',
    payImpact: '+$2 – $4/hr',
    description:
      'Required by OSHA for anyone operating a powered industrial truck. Opens up the majority of warehouse and distribution center roles that offer higher base pay.',
  },
  {
    name: 'Flagger Certification (Traffic Control)',
    cost: '$30 – $60',
    payImpact: '+$1 – $3/hr',
    description:
      'Required for road and highway construction work. Short to obtain, widely applicable, and often listed as a required qualification in municipal and state road contracts.',
  },
  {
    name: 'First Aid / CPR / AED',
    cost: '$50 – $120',
    payImpact: 'Tie-breaker in hiring, path to crew lead roles',
    description:
      'Not a pay-bump credential on its own, but it distinguishes applicants in competitive markets and is often listed as preferred in crew lead and foreperson postings.',
  },
]

const contractTypes = [
  {
    type: 'Temporary (Staffing Agency)',
    pros: [
      'Fast start — sometimes same-day or next-day placement',
      'Daily or weekly pay options',
      'Try different industries before committing',
      'Agency handles payroll, benefits not required',
    ],
    cons: [
      'No guaranteed hours',
      'Lower likelihood of benefits',
      'Pay ceiling limited by agency markup',
    ],
    bestFor: 'Workers who need income immediately, are between jobs, or are testing a new industry.',
  },
  {
    type: 'Temp-to-Hire',
    pros: [
      'Built-in trial period for both sides',
      'Converts to direct hire after 30 – 90 days',
      'Access to stable employer with benefits once converted',
      'Lower barrier to entry than a direct hire role',
    ],
    cons: [
      'No guarantee of conversion',
      'May receive lower pay than equivalent direct hire during temp phase',
    ],
    bestFor: 'Workers who want a permanent job but lack the specific experience the employer typically requires.',
  },
  {
    type: 'Direct Hire (Permanent)',
    pros: [
      'Full benefits (health, PTO, 401k) from day one',
      'Higher base pay than equivalent temp roles',
      'Clear path for raises and promotion',
      'More predictable scheduling',
    ],
    cons: [
      'Longer hiring process',
      'Higher bar for experience or references',
    ],
    bestFor: 'Workers ready for stability who have at least 6 to 12 months of relevant experience.',
  },
]

const redFlags = [
  'The posting lists no company name, no address, and no verifiable contact information',
  'Pay is described as "competitive" or "negotiable" with no stated range — ask before applying',
  'The role requires you to supply your own PPE (hard hat, safety vest, gloves) from day one without reimbursement',
  'The posting promises extremely high pay for completely unskilled work with no explanation of duties',
  'You are asked to complete a background check or medical exam before receiving a written offer',
  'The shift schedule is described as "as needed" with no minimum hours guarantee',
  'The posting mixes general labor with CDL driving or heavy equipment operation but lists no licensing requirements',
  'The employer cannot or will not confirm OSHA compliance when asked directly',
]

const hotRegions = [
  {
    region: 'Gulf Coast (TX, LA, MS)',
    driver: 'LNG infrastructure, port expansion, petrochemical plant construction',
    avgPay: '$20 – $32/hr',
    trend: 'Growing',
  },
  {
    region: 'Midwest (IL, IN, OH, MI)',
    driver: 'EV battery plant builds, semiconductor facilities, legacy auto manufacturing',
    avgPay: '$18 – $26/hr',
    trend: 'Growing',
  },
  {
    region: 'Sun Belt (AZ, TX, FL, NC)',
    driver: 'Residential construction boom, data center builds, warehouse development',
    avgPay: '$17 – $25/hr',
    trend: 'Very Active',
  },
  {
    region: 'Pacific Coast (CA, WA, OR)',
    driver: 'Port logistics, tech campus construction, wildfire recovery and rebuild',
    avgPay: '$22 – $35/hr',
    trend: 'Active',
  },
  {
    region: 'Northeast (NY, NJ, MA, CT)',
    driver: 'Urban infrastructure upgrades, transit expansion, commercial real estate rehab',
    avgPay: '$20 – $30/hr',
    trend: 'Steady / High-wage',
  },
]

const interviewTips = [
  {
    title: 'Lead With Physical Capability',
    description:
      'Employers hiring general laborers care less about your resume and more about whether you can do the work safely and consistently. Be direct about your physical fitness, your experience lifting or carrying loads, and your history of showing up on time.',
  },
  {
    title: 'Know Your Certifications Status',
    description:
      'If you hold an OSHA card, forklift certification, or any trade-related credential, name it immediately. If you do not yet hold one, stating that you are prepared to get OSHA 10 certified within the first week signals initiative that most applicants do not show.',
  },
  {
    title: 'Ask About the Shift Structure Before Accepting',
    description:
      'General labor positions come in day, swing, and overnight variants. Ask about start time, end time, expected overtime, and the day-to-day reporting structure. This prevents surprises and shows the hiring manager you are thinking like a professional.',
  },
  {
    title: 'Have Two References Ready',
    description:
      'A former supervisor or crew lead willing to confirm you showed up on time and worked without incident is worth more than any resume credential in this field. A neighbor, coach, or any adult who can speak to your reliability also works if work history is limited.',
  },
]

const faqs = [
  {
    question: 'What does a general laborer do exactly?',
    answer:
      'The scope depends entirely on the industry. On a construction site, a general laborer might clear debris, move materials between workers, mix concrete, or hold equipment in place while a tradesperson works. In a warehouse, the same title means picking orders, loading trucks, and keeping aisles clear. In manufacturing, it means feeding raw materials into machines, inspecting finished goods, and managing waste. The common thread is that general laborers handle the physical support work that keeps the specialized workers on task. Every industry needs this function, which is why the category is one of the most consistently in-demand in the US labor market.',
  },
  {
    question: 'How do general labor pay rates actually vary by location?',
    answer:
      'The federal minimum wage floor is $7.25/hr, but no general labor employer is paying anywhere near that in the current market. The practical floor in most states is $15 to $17/hr. From there, pay climbs with state minimums, cost of living, and project type. California and Washington state average $22 to $28/hr for construction laborers. Texas and the Gulf Coast average $18 to $26/hr, pushed higher by energy and infrastructure work. The Midwest averages $17 to $22/hr with notable spikes near new manufacturing facilities. The Northeast consistently pays above $20/hr with New York City projects often hitting $30/hr or more under prevailing wage rules.',
  },
  {
    question: 'Can a general labor job actually turn into a real career?',
    answer:
      'Yes, and it is one of the more underappreciated career entry points in the US. The path works like this: a laborer who performs reliably, picks up certifications, and learns site or facility operations becomes a lead within one to three years. Lead laborers who show supervisory instincts become forepersons. Forepersons on large projects can earn $30 to $40/hr within five to seven years, with no college degree required at any step. Separately, general labor is the traditional entry point into the trades — electricians, plumbers, carpenters, and ironworkers all started by doing labor work before entering apprenticeship programs.',
  },
  {
    question: 'What is the difference between general labor and skilled labor?',
    answer:
      'Skilled labor refers to roles that require specific technical training, a license, or a formal apprenticeship to perform legally and safely — electricians, plumbers, welders, HVAC technicians, and heavy equipment operators are examples. General labor refers to the supporting physical work that does not require that level of credentialing. In practice, the distinction can blur. A general laborer who gets forklift-certified is performing a semi-skilled function. One who completes an OSHA 30 and manages site safety documentation is doing supervisory work. The category is better understood as a spectrum than a fixed definition.',
  },
  {
    question: 'Is general labor harder to find work in than other fields?',
    answer:
      'The opposite. General labor is one of the easiest categories to get hired in because the hiring process is short, the entry requirements are minimal, and demand is consistently high. The challenge is not finding a job — it is finding a good one. The market includes a significant number of low-paying temp roles alongside competitive direct-hire positions at well-run companies. The difference in total annual income between the two can exceed $10,000 for the same number of hours worked. Knowing how to distinguish between them before applying is where the real research pays off.',
  },
  {
    question: 'How quickly can I start a general labor job after applying?',
    answer:
      'Through a staffing agency, placement can happen within 24 to 48 hours for many industrial and warehousing roles. Direct-hire positions at construction companies or manufacturers typically involve a one to two week process covering an application, a brief interview, a background check, and drug screening. Some employers run orientation and safety inductions on a rolling basis, which means you can go from applying to working within five business days even for a direct-hire role. Coming prepared with a valid photo ID, your Social Security card or authorization documents, and any certifications you hold shortens the process considerably.',
  },
]

export default async function GeneralLaborJobsPage({ searchParams }: any) {
  const params = await searchParams

  const [{ count }, initialData] = await Promise.all([
    getCachedJobCount(params.what || 'general labor', params.where || '', params.salary_min),
    searchJobs({
      what: params.what || 'general labor',
      where: params.where || '',
      results_per_page: 30,
      page: 1,
    }).then((data: AdzunaSearchResult) => ({
      ...data,
      results: data.results.map(normalizeAdzuna),
    })),
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            General Labor Jobs Hiring Now Across the United States
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="general labor" />
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
                what={params.what || 'general labor'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData}
              />
            </Suspense>
          </div>
        </div>

        {/* ── INDUSTRY BREAKDOWN ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Hammer className="w-7 h-7 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900">Where General Labor Jobs Actually Are: Industry by Industry</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            The phrase "general labor" covers vastly different work depending on the industry. Understanding where the openings are and what each environment actually involves lets you target the right postings and walk into interviews knowing what to expect.
          </p>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {industryBreakdown.map((item, index) => (
              <div key={index} className={`border rounded-2xl p-5 ${item.bg}`}>
                <div className="flex items-center gap-2 mb-3">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <h3 className="font-bold text-gray-900">{item.industry}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Typical tasks</p>
                    <p className="text-gray-600">{item.typicalTasks}</p>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <p className="font-medium text-gray-700">Pay range</p>
                      <p className="font-semibold text-gray-900">{item.payRange}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Demand</p>
                      <p className="font-semibold text-gray-900">{item.demandLevel}</p>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs pt-1">{item.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CAREER LADDER ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">The General Laborer Career Ladder: Where This Job Can Actually Take You</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            General labor is not a dead end. It is one of the few entry points in the US economy where consistent performance and targeted certifications reliably translate into a 2x or 3x pay increase within five years, without a college degree. Here is what that progression looks like in practice.
          </p>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-blue-200 hidden md:block" />
            <div className="space-y-4">
              {careerLadder.map((step, index) => (
                <div key={index} className="relative flex gap-6">
                  <div className="hidden md:flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm z-10 flex-shrink-0">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{step.level}</h3>
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{step.timeframe}</span>
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">{step.pay}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{step.what}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CERTIFICATIONS ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-yellow-600" />
            <h2 className="text-2xl font-bold text-gray-900">Certifications That Raise Your General Labor Pay Rate</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Most general labor roles require no credentials. That also means the workers who do hold one or two certifications consistently get called back first, earn more per hour, and access jobs that are closed to everyone else. These five are the highest-return credentials available for the cost and time required.
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            {certifications.map((cert, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                  <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full whitespace-nowrap">{cert.payImpact}</span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{cert.description}</p>
                <p className="text-xs text-gray-400">Typical cost: {cert.cost}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CONTRACT TYPES ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Three Types of General Labor Contracts and Which One Fits Your Situation</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Not all general labor job postings are the same. The difference between a temp placement, a temp-to-hire role, and a direct-hire position can mean thousands of dollars in annual income and access to completely different benefits. Here is how to read the distinction before you apply.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {contractTypes.map((ct, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col">
                <h3 className="font-bold text-gray-900 text-lg mb-4">{ct.type}</h3>
                <div className="space-y-3 flex-1">
                  <div>
                    <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Advantages</p>
                    <ul className="space-y-1">
                      {ct.pros.map((pro, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Trade-offs</p>
                    <ul className="space-y-1">
                      {ct.cons.map((con, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 flex-shrink-0" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500"><span className="font-medium text-gray-700">Best for:</span> {ct.bestFor}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── REGIONAL DEMAND ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-7 h-7 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">Where Demand for General Labor Is Highest Right Now</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            General labor jobs exist in every state, but the concentration of high-paying, high-volume openings is driven by specific economic forces. These five regions are currently generating the most activity, with distinct reasons why.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 pr-6 font-semibold text-gray-700">Region</th>
                  <th className="text-left py-3 pr-6 font-semibold text-gray-700">What is driving demand</th>
                  <th className="text-left py-3 pr-6 font-semibold text-gray-700">Avg. pay range</th>
                  <th className="text-left py-3 font-semibold text-gray-700">Trend</th>
                </tr>
              </thead>
              <tbody>
                {hotRegions.map((region, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 pr-6 font-medium text-gray-900">{region.region}</td>
                    <td className="py-4 pr-6 text-gray-600">{region.driver}</td>
                    <td className="py-4 pr-6 font-semibold text-green-700">{region.avgPay}</td>
                    <td className="py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {region.trend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── RED FLAGS ── */}
        <section className="mt-20">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Red Flags in General Labor Job Postings</h2>
                <p className="text-gray-700 mb-6">
                  The general labor market contains a higher proportion of low-quality or misleading postings than most other job categories, largely because the low barrier to entry attracts opportunistic employers. These are the patterns that signal a posting is worth skipping.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {redFlags.map((flag, index) => (
                    <div key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1.5" />
                      <span className="text-sm">{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── INTERVIEW TIPS ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-7 h-7 text-teal-600" />
            <h2 className="text-2xl font-bold text-gray-900">How to Stand Out When Applying for General Labor Positions</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            General labor hiring decisions happen fast. Most employers decide within a single conversation. The candidates who get hired consistently do four things that most applicants skip.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {interviewTips.map((tip, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-teal-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-teal-100 text-teal-700 font-bold rounded-full text-sm mb-4">
                  {index + 1}
                </span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{tip.title}</h3>
                <p className="text-gray-600 text-sm">{tip.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <HardHat className="w-7 h-7 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About General Labor Jobs</h2>
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

        {/* ── DISCLAIMER ── */}
        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> Salary figures and pay ranges cited on this page are derived from aggregated public data sources and employer postings and are provided for informational purposes only. Actual compensation varies by employer, location, experience, and contract type. Job availability is subject to change. oh-my-job.com makes no guarantee of employment or earnings outcomes.
          </p>
        </section>
      </div>
    </>
  )
}