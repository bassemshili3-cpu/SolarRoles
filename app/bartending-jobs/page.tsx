import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import {
  Briefcase,
  DollarSign,
  Star,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Shield,
  Clock,
  Award,
  TrendingUp,
} from 'lucide-react'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna

export const metadata: Metadata = {
  title: 'Top Bartending Jobs Near You | Hiring Now (Updated Daily)',
  description:
    'Ready to shake things up? Discover the best bartending jobs in your area. From local pubs to luxury hotels, find open roles with great tips and flexible hours. Apply today!',
  keywords:
    'bartending jobs, bartender vacancies, mixologist hiring, bar staff jobs, local bartending jobs, high volume bar jobs, cocktail bartender open roles',
  openGraph: {
    title: 'Find Lucrative Bartending Jobs Today | Apply Now',
    description:
      'Explore top-rated bartending jobs hiring near you. Whether you are an entry-level barback or a seasoned mixologist, find your perfect shift and maximize your tips.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bartending Jobs | Competitive Pay & Flexible Shifts',
    description:
      'Browse active bartending jobs in your city. Secure competitive wages, massive tip potential, and the ultimate flexible schedule.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/bartending-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Bartending Jobs',
  description:
    'Search and apply for premium bartending jobs. Discover opportunities across dive bars, upscale dining, resorts, and nightclubs nationwide.',
  url: 'https://www.oh-my-job.com/bartending-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Bartending Jobs',
    description: 'A curated list of active bartending jobs and mixology careers across the United States.',
  },
}

const bartendingRoles = [
  {
    title: 'Neighborhood Pub Bartender',
    description: 'Pour drafts, mix classic drinks, and build lasting relationships with a loyal roster of regular patrons.',
    icon: Briefcase,
  },
  {
    title: 'Fine Dining Bartender',
    description: 'Curate elevated drinking experiences, pair wines with dinner menus, and handle the bustling service bar.',
    icon: Briefcase,
  },
  {
    title: 'Resort & Hotel Bartender',
    description: 'Provide top-tier hospitality to travelers in hotel lobbies or pool bars, often featuring excellent benefits and steady base pay.',
    icon: Star,
  },
  {
    title: 'High-Volume Nightclub Bartender',
    description: 'Thrive in a fast-paced, loud environment where speed and efficiency translate directly into massive tips.',
    icon: TrendingUp,
  },
  {
    title: 'Private Event Bartender',
    description: 'Work independently at weddings and corporate galas. Offers incredible scheduling flexibility and high hourly rates.',
    icon: Award,
  },
  {
    title: 'Cruise Line Bartender',
    description: 'Mix tropical drinks while traveling the world. These roles often include free room and board alongside your wages.',
    icon: Star,
  },
]

const requiredCertifications = [
  {
    name: 'TIPS Certification (Training for Intervention ProcedureS)',
    description:
      'Considered the gold standard for responsible pouring. It mitigates liability for the venue and is highly preferred by hiring managers for premier bartending jobs.',
    source: 'tipsglobal.org',
  },
  {
    name: 'ServSafe Alcohol Certificate',
    description:
      'Crucial for understanding blood alcohol content (BAC) limits, checking IDs accurately, and safely handling over-intoxicated patrons.',
    source: 'servsafe.com',
  },
  {
    name: 'State-Specific ABC Licensing',
    description:
      'Mandatory in heavily regulated regions. For instance, California requires an RBS certification, while Texas mandates a TABC card to legally mix and serve spirits.',
    source: 'State Alcohol Beverage Control Boards',
  },
  {
    name: 'Food Handler Permit',
    description:
      'Essential since modern mixology involves preparing garnishes, squeezing fresh juices, and occasionally cross-handling bar appetizers.',
    source: 'State and local health departments',
  },
]

const salaryData = [
  { label: 'Entry-Level / Barback', range: '$10 to $16/hr + partial tips' },
  { label: 'Seasoned Mixologist', range: '$16 to $25/hr + full tips' },
  { label: 'Luxury Hotel Bartender', range: '$20 to $30/hr + tips & benefits' },
  { label: 'High-Volume Club Bartender', range: '$10 to $18/hr + massive tip potential' },
  { label: 'Freelance / Event Bartender', range: '$25 to $50/hr (often fixed rate)' },
]

const topSkills = [
  {
    skill: 'Mixology & Recipe Memorization',
    description: 'Mastering classic ratios and trendy flavor profiles so you can pour accurately without referencing a recipe book.',
  },
  {
    skill: 'Guest Engagement & Charisma',
    description: 'Building a following of regulars who boost your nightly take-home pay and elevate the atmosphere of the venue.',
  },
  {
    skill: 'High-Volume Efficiency',
    description: 'Pouring multiple drinks accurately while simultaneously taking new orders and closing out tabs during rush hours.',
  },
  {
    skill: 'POS Navigation & Cash Management',
    description: 'Flawless transaction processing, splitting complex checks, and perfectly balancing the register at closing time.',
  },
  {
    skill: 'Situational Awareness',
    description: 'Knowing exactly when to cut a patron off and how to de-escalate conflicts to maintain a safe environment.',
  },
  {
    skill: 'Strategic Upselling',
    description: 'Gently guiding guests toward top-shelf liquors or signature house cocktails to increase the check average.',
  },
]

const legalRequirements = [
  { state: 'California', minAge: 21, notes: 'Requires completion of a Responsible Beverage Service (RBS) training program.' },
  { state: 'Nevada', minAge: 21, notes: 'Alcohol Awareness Training card (TAM card) and local police registration are mandatory.' },
  { state: 'Texas', minAge: 18, notes: 'TABC certification is essential to legally serve or sell alcoholic beverages.' },
  { state: 'New York', minAge: 18, notes: 'State law allows 18-year-olds to serve, though many premium venues prefer 21+.' },
  { state: 'Florida', minAge: 18, notes: 'No statewide license, but individual counties or employers often mandate specific courses.' },
]

const faqs = [
  {
    question: 'How old do I need to be to apply for bartending jobs?',
    answer:
      'The legal age to serve alcohol fluctuates based on your location. The National Conference of State Legislatures (NCSL) indicates that many states permit 18-year-olds to pour drinks, whereas states like Nevada and California strictly enforce a 21-and-over rule. Always verify with your local Alcohol Beverage Control (ABC) board before seeking bartending jobs.',
  },
  {
    question: 'Are specialized bartending licenses required to get hired?',
    answer:
      'There is no nationwide bartending license. However, landing the best bartending jobs often requires a state-approved responsible alcohol service certificate (like TIPS or ServSafe). Certain states have proprietary mandates, such as the RBS in California or the TABC in Texas. Your future employer will typically guide you on their specific compliance needs.',
  },
  {
    question: 'What is the real earning potential for a bartender?',
    answer:
      'While the U.S. Bureau of Labor Statistics (BLS) reported a median base wage of $31,390 in 2023, this figure rarely paints the full picture. In lucrative bartending jobs at busy nightclubs, high-end steakhouses, or popular local pubs, daily tips can easily push a bartender\'s annual income well past the $50,000 to $70,000 mark.',
  },
  {
    question: 'Can I secure bartending jobs with zero prior experience?',
    answer:
      'Absolutely. The hospitality industry values hustle and personality. Starting your career as a barback is the most strategic move for beginners. You will learn the inventory, master the speed of service, and eventually transition into full bartending roles. Taking an introductory mixology course can also show initiative.',
  },
  {
    question: 'What kind of schedule should I expect in this industry?',
    answer:
      'Bartending jobs are famous for their non-traditional hours. Expect to work nights, weekends, and holidays, as these are peak revenue periods. However, this structure provides incredible flexibility, making it an ideal career for students, artists, or anyone looking to avoid the standard 9-to-5 grind.',
  },
  {
    question: 'How does the tipped minimum wage work for bar staff?',
    answer:
      'Under the Fair Labor Standards Act (FLSA), venues can pay tipped workers a base rate of $2.13 per hour, relying on tips to bridge the gap to the federal minimum wage of $7.25. However, many states have abolished the tip credit entirely (e.g., California, Washington), meaning you receive the full state minimum wage plus all your tips.',
  },
]

const tips = [
  {
    title: 'Secure Your Certifications Early',
    description:
      'Do not wait to be hired to get your TIPS or state-mandated alcohol permit. Having it on your resume immediately moves you to the top of the applicant pile.',
  },
  {
    title: 'Embrace the Barback Route',
    description:
      'If your resume lacks mixology experience, applying to be a barback is your golden ticket. It is the undisputed best way to prove your work ethic to a bar manager.',
  },
  {
    title: 'Master the Modern Classics',
    description:
      'You will be tested. Know the exact specs for an Old Fashioned, a proper Martini, a Margarita, and an Espresso Martini before you walk into your first interview.',
  },
  {
    title: 'Showcase Hospitality Soft Skills',
    description:
      'Anyone can learn to pour a beer, but not everyone can handle an angry customer or a slammed rail. Highlight your past roles in customer service, retail, or conflict resolution.',
  },
]

export default async function BartendingJobsPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'Bartending', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'Bartending', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
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
            Bartending Jobs Hiring Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="bartending" />
          </aside>
          <div className="flex-1">
            {count > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">{count.toLocaleString()}</span> open roles discovered
              </p>
            )}

            <AIJobMatcherWrapper />

            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'bartending'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Types of Bartending Roles */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Discover Diverse Bartending Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Landing the right bartending jobs means understanding that no two venues are exactly alike. Whether you thrive in the organized chaos of a dance club or prefer crafting artisanal infusions at a quiet speakeasy, the establishment dictates your shift flow, clientele, and tip ceiling. Explore the main categories below.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bartendingRoles.map((role, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <role.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Minimum Age and Legal Requirements */}
        <section className="mt-20 bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">State-by-State Minimum Age Limits</h2>
              <p className="text-gray-700 mb-6">
                State laws heavily regulate bartending jobs. The National Conference of State Legislatures (NCSL) outlines that the legal age to mix and serve alcohol shifts dramatically depending on your zip code. Review the breakdown of major markets below, and always double-check with local authorities before applying for your next gig.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-amber-100">
                      <th className="text-left p-3 font-semibold text-gray-800 rounded-tl-lg">State</th>
                      <th className="text-left p-3 font-semibold text-gray-800">Minimum Age</th>
                      <th className="text-left p-3 font-semibold text-gray-800 rounded-tr-lg">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {legalRequirements.map((row, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-amber-50'}>
                        <td className="p-3 font-medium text-gray-900">{row.state}</td>
                        <td className="p-3 text-gray-700">{row.minAge}</td>
                        <td className="p-3 text-gray-600">{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Source: National Conference of State Legislatures (NCSL) and state-specific liquor control databases.
              </p>
            </div>
          </div>
        </section>

        {/* Certifications Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Credentials That Elevate Your Resume</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            While federal law doesn’t enforce a universal bartending license, competitive bartending jobs often require proof that you understand alcohol compliance. Holding these key certifications shows bar managers that you are a liability-conscious professional.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {requiredCertifications.map((cert, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <h3 className="font-semibold text-gray-900 text-lg">{cert.name}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-2">{cert.description}</p>
                <p className="text-xs text-gray-400">Source: {cert.source}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Skills Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-7 h-7 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Essential Traits for High-Earning Bartenders</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Succeeding in premium bartending jobs takes more than a charming smile. The modern hospitality sector demands a blend of technical mixology, intense focus, and revenue-driving sales tactics to thrive behind the stick.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topSkills.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{item.skill}</p>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Salary Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Salary & Tip Expectations</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              Official BLS data puts the median annual wage for bartenders at $31,390 (May 2023), but anyone in the industry knows this excludes the cash economy. Real-world earnings from bartending jobs depend heavily on shift volume and venue prestige, with top performers frequently doubling their base pay through gratuities.
            </p>
            <div className="space-y-3">
              {salaryData.map((row, index) => (
                <div key={index} className="flex items-center justify-between bg-white rounded-xl px-5 py-4">
                  <span className="font-medium text-gray-800">{row.label}</span>
                  <span className="text-green-700 font-semibold text-sm">{row.range}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-5">
              Source: Bureau of Labor Statistics (BLS) OEWS data (May 2023), augmented with industry tip standard projections.
            </p>
          </div>
        </section>

        {/* Prohibited Conduct Warning */}
        <section className="mt-20">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Critical Liability & Safety Rules</h2>
                <p className="text-gray-700 mb-4">
                  Bartending jobs come with serious legal responsibilities. The U.S. Department of Justice and local authorities actively monitor compliance. Engaging in any of the following infractions can result in immediate termination, massive fines, or personal criminal charges:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    'Pouring for guests under the legal drinking age (21+)',
                    'Overserving patrons displaying visible signs of intoxication',
                    'Permitting minors to linger in restricted bar spaces',
                    'Failing to spot or confiscate fake identification',
                    'Serving drinks past the state\'s mandatory last call',
                    'Comping drinks off the books (theft of inventory)',
                    'Violating open-container laws when guests exit',
                    'Working shifts without a current, valid venue liquor permit',
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

        {/* Career Growth Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Climbing the Hospitality Ladder</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Securing entry-level bartending jobs is just the beginning. The BLS projects steady growth in this sector through 2032. Those who excel at inventory management, team leadership, and cocktail innovation frequently graduate to higher-paying administrative and creative roles.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Lead Mixologist', detail: 'Design signature cocktail menus and guide the creative direction of the bar.' },
              { title: 'General Bar Manager', detail: 'Control labor costs, order inventory, and ensure seamless daily operations.' },
              { title: 'Corporate Beverage Director', detail: 'Standardize drink programs across multiple restaurant or hotel locations.' },
              { title: 'Venue Owner', detail: 'Leverage your front-of-house expertise to launch your own successful concept.' },
            ].map((role, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-blue-700 mb-1">{role.title}</p>
                <p className="text-gray-600 text-sm">{role.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tips Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Strategies to Win Your First Interview</h2>
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
            <Clock className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Common Queries About Bartending Jobs</h2>
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
                <div className="px-6 pb-6 text-gray-600">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>

        {/* Legal Disclaimer */}
        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> This content is strictly for informational purposes and should not be construed as legal counsel. Regulations regarding bartending jobs, tipped minimum wages, and alcohol certifications are subject to rapid legislative changes. We urge you to verify all requirements with your local Department of Labor (dol.gov) and your state\'s liquor control board. Oh My Job aggregates postings and assumes no liability for the details within individual job descriptions.
          </p>
        </section>
      </div>
    </>
  )
}