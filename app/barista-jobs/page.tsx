import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, DollarSign, CheckCircle, Shield, TrendingUp, Star, Coffee, Award } from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna

export const metadata: Metadata = {
  title: 'Barista Jobs | Cafés, Chains & Roastery Openings Near You',
  description: 'Barista openings at independent roasteries, hotel cafés, and drive-thru chains. Filter by shift, pay, and your experience level.',
  keywords: 'barista-jobs, barista openings, coffee shop hiring, espresso bar careers, cafe employment, latte art jobs, morning shift barista, weekend barista positions',
  openGraph: {
    title: 'Barista Jobs: Fresh Openings at Cafés & Roasteries | Oh My Job',
    description: 'From trainee pulls to head-barista leadership, find the barista-jobs that match your skill level and schedule. Compare pay, perks, and commute before you apply.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Barista Jobs Updated Today — Cafés, Chains & More',
    description: 'Scan hundreds of barista-jobs with transparent salary ranges and real employer reviews. Your next coffee career move starts here.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/barista-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Barista Jobs Board',
  description: 'Live feed of barista-jobs sourced from employers nationwide. Includes salary estimates, shift details, and one-click applications for every listing.',
  url: 'https://www.oh-my-job.com/barista-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Active Barista Job Listings',
    description: 'Continuously refreshed collection of barista-jobs spanning entry-level café roles to senior coffee program positions.',
  },
}

const baristaResponsibilities = [
  {
    title: 'Shot Pulling & Brew Method Execution',
    description: 'Calibrate dose, yield, and timing for each espresso recipe while switching between pour-over, cold brew towers, and batch drip setups without missing a ticket.',
  },
  {
    title: 'Menu Storytelling & Upselling',
    description: 'Translate tasting notes into plain language for first-time visitors and recommend pairings that raise average ticket value without feeling pushy.',
  },
  {
    title: 'Rush-Hour Register Flow',
    description: 'Keep the line moving during the 7-9 AM window by memorizing modifier shortcuts, splitting complex mobile orders, and reconciling the till at shift end.',
  },
  {
    title: 'Machine Upkeep & Troubleshooting',
    description: 'Run daily cleaning cycles on group heads and steam wands, swap out water-softener cartridges on schedule, and diagnose pressure drops before they stall service.',
  },
  {
    title: 'Waste-Conscious Stock Rotation',
    description: 'Track expiration windows on oat milks, cold-brew kegs, and baked goods so nothing leaves the display case past its prime and shrinkage stays under target.',
  },
  {
    title: 'Health-Code Readiness',
    description: 'Maintain sanitizer concentrations at every station, log refrigerator temps twice per shift, and keep the allergen binder current so surprise inspections are stress-free.',
  },
]

const salaryData = [
  {
    level: 'Entry-Level / Green Apron',
    salary: '$28,500',
    note: 'Baseline before tips, which typically add $4-$8/hr at busy locations',
  },
  {
    level: 'Experienced Craft Barista',
    salary: '$35,000',
    note: 'Common at single-origin-focused shops in mid-size metro areas',
  },
  {
    level: 'Lead Barista / Bar Captain',
    salary: '$42,500',
    note: 'Includes premium for training oversight and opening/closing accountability',
  },
]

const topEmployers = [
  { name: 'Starbucks', detail: 'Stands out for its "Bean Stock" equity program and full ASU tuition reimbursement, giving even part-time partners a genuine wealth-building path.' },
  { name: 'Dunkin\'', detail: 'A strong pick for people who thrive on speed — the franchise model means scheduling flexibility varies, but volume experience here transfers everywhere.' },
  { name: 'Peet\'s Coffee', detail: 'Leans heavily into origin education and manual brewing, so baristas leave with a palate and skill set that impresses future specialty employers.' },
  { name: 'Dutch Bros Coffee', detail: 'Built around a promote-from-within culture where enthusiastic baristas regularly reach operator-level roles within three to four years.' },
  { name: 'Local Single-Origin Roasters', detail: 'Where you will learn to cup, score, and communicate coffee at a professional level — plus build a personal reputation in your city\'s coffee scene.' },
  { name: 'Hotel & Airport Café Concessions', detail: 'Offer predictable weekday-only schedules, premium base pay to offset fewer tips, and access to hospitality-industry health and travel benefits.' },
]

const careerPath = [
  { role: 'Trainee Barista', timeframe: '0 to 6 months', description: 'Absorb recipes, learn register shortcuts, and build the muscle memory for tamping, steaming, and sequencing drinks under pressure.' },
  { role: 'Bar Lead', timeframe: '6 months to 2 years', description: 'Own the morning dial-in, coach newer teammates on milk texture benchmarks, and flag quality issues before they reach the customer.' },
  { role: 'Shift Manager', timeframe: '2 to 4 years', description: 'Handle daily ordering, control labor cost against sales forecasts, and serve as the first point of escalation for guest recovery situations.' },
  { role: 'Store Director or Roast Specialist', timeframe: '4+ years', description: 'Take full P&L ownership of a location, or pivot into green-buying and roast profiling if the production side of coffee calls to you.' },
]

const certifications = [
  {
    name: 'SCA Barista Skills (Foundation → Professional)',
    desc: 'A three-tier track from the Specialty Coffee Association that benchmarks your extraction knowledge, sensory acuity, and bar workflow against a global standard.',
  },
  {
    name: 'ServSafe Food Handler / Manager',
    desc: 'Proves to any hiring manager that you understand temperature danger zones, cross-contact protocols, and local health-code requirements — often a hard prerequisite for shift leads.',
  },
  {
    name: 'CQI Q Arabica Grader',
    desc: 'A 22-exam gauntlet in sensory calibration and defect identification — overkill for a first barista gig, but a clear signal if you aim to move into buying or quality control.',
  },
]

const faqs = [
  {
    question: 'What do hiring managers really look for in barista-jobs applicants?',
    answer: 'Technique can be taught in a week; temperament cannot. Managers consistently rank composure under a twelve-drink queue, genuine friendliness at 5:30 AM, and reliability above latte art or coffee trivia. If you can prove you show up on time and stay calm when the grinder jams mid-rush, you are already ahead of most candidates.',
  },
  {
    question: 'Can barista jobs realistically cover living expenses?',
    answer: 'It depends on market and tip culture. In cities where digital tipping is the norm, baristas at high-traffic locations routinely clear $20-$25/hr when tips are factored in. Combine that with employer-sponsored healthcare (available at Starbucks, Peet\'s, and others even for 20-hour weeks) and the total compensation package becomes surprisingly competitive with entry-level office roles.',
  },
  {
    question: 'Is prior coffee knowledge required to land barista jobs?',
    answer: 'Almost never at the entry level. Chains and many independents run structured onboarding programs lasting one to three weeks. What sets you apart without experience is showing you have done even minimal homework — visiting the shop beforehand, trying their signature drink, and being able to articulate why their specific café appeals to you.',
  },
  {
    question: 'What are the true physical demands of barista jobs?',
    answer: 'Expect to stand for the full duration of a five-to-eight-hour shift, repeatedly tamp with roughly 30 pounds of force, and haul milk crates and ice bins that weigh up to 40 pounds. Repetitive wrist strain from tamping is the most common complaint among long-term baristas, so investing in an ergonomic tamper and quality non-slip shoes pays for itself quickly.',
  },
  {
    question: 'Is the job market for barista-jobs growing or shrinking?',
    answer: 'Growing steadily. The U.S. coffee shop count has climbed past 38,000 locations, and the Bureau of Labor Statistics projects food-and-beverage serving roles to expand roughly 7% through the decade. Remote and hybrid work patterns have shifted morning traffic from downtown hubs to suburban neighborhoods, opening fresh hiring pockets in areas that previously had few specialty cafés.',
  },
]

const applicationTips = [
  {
    title: 'Lead With Pace, Not Just Passion',
    description: 'Hiring managers hear "I love coffee" dozens of times a week. Instead, quantify your speed: mention the transaction volume you handled in retail, or the number of covers you served per hour in food service — that speaks directly to rush-hour readiness.',
  },
  {
    title: 'Visit the Shop Before You Apply',
    description: 'Order a drink, observe workflow, and note one specific thing the team does well. Mentioning it in your cover letter or interview proves genuine interest and immediately separates you from copy-paste applicants.',
  },
  {
    title: 'Offer the Shifts Nobody Wants',
    description: 'Early opens (often 4:30 AM) and weekend closings are the hardest slots to fill. Volunteering for them in your application signals low-maintenance reliability — the single trait that gets more callbacks than any certification.',
  },
  {
    title: 'Document Your Pours If You Have Them',
    description: 'A 30-second phone video of a clean rosetta or tulip carries more weight than a paragraph describing your latte art. Attach it to your application or bring it up naturally during the working interview most cafés require.',
  },
]

export default async function BaristaJobsPage({ searchParams }: any) {
  const params = await searchParams

 const [{ count }, initialData] = await Promise.all([
  getMergedJobCount(params.what || 'Barista', params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
  searchMergedJobs({ what: params.what || 'Barista', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
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
            Barista Jobs Hiring This Week — Chain, Indie & Specialty Café Openings
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="barista" />
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
                what={params.what || 'barista'}
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
            <h2 className="text-2xl font-bold text-gray-900">Barista Jobs Market Pulse</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Two converging trends are fueling demand for barista jobs right now. First, the number of independent coffee shops in the US has risen by roughly 40% over the past decade, creating thousands of new positions outside the traditional chain ecosystem. Second, hybrid work schedules have redistributed morning foot traffic into suburban corridors, prompting brands like Dutch Bros and Blank Street to open aggressively in neighborhoods that had little specialty coffee presence before 2020. For job seekers, this means more openings, shorter commutes, and stronger negotiating leverage on hourly rates.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: 'Decade Job Growth Rate', value: '~7%', detail: 'Outpacing the all-occupations average through 2032' },
              { label: 'Yearly Openings Nationwide', value: '470K+', detail: 'Turnover plus net-new locations combined' },
              { label: 'US Specialty Coffee Revenue', value: '$52B', detail: 'The spending wave that keeps barista hiring strong' },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{item.label}</p>
                <p className="text-emerald-600 text-2xl font-medium">{item.value}</p>
                <p className="text-gray-500 text-sm mt-1">{item.detail}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Source: U.S. Bureau of Labor Statistics, Occupational Outlook Handbook — Food and Beverage Serving Workers, 2024 edition
          </p>
        </section>

        {/* What Baristas Do */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Coffee className="w-7 h-7 text-amber-600" />
            <h2 className="text-2xl font-bold text-gray-900">What a Typical Barista Shift Actually Looks Like</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Barista jobs sit at the intersection of manual craft and rapid-fire hospitality. On any given morning you might re-calibrate grind size three times before 8 AM, coach a new hire through their first milk-steaming attempt, and troubleshoot a card reader — all while keeping a smile for the tenth person who orders an oat-milk latte with extra foam. Here is a breakdown of the core duties most employers expect you to own from day one.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {baristaResponsibilities.map((item, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <Coffee className="w-10 h-10 text-amber-500 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Salary */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">How Much Do Barista Jobs Actually Pay?</h2>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              Raw hourly wages only tell half the story for barista jobs. The national median sits near $14/hr, but the real take-home number hinges on two variables: tip volume and employer benefits. A barista pulling 30 hours a week at a high-traffic café with strong digital-tipping adoption can realistically gross $800-$1,000/week once gratuities are included. On top of that, several major employers now extend health coverage, mental-health stipends, and tuition assistance to staff working as few as 20 hours — benefits that add thousands in annual value without showing up on a pay stub.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {salaryData.map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-5 text-center">
                  <p className="text-3xl font-bold text-amber-600 mb-1">{item.salary}</p>
                  <p className="font-semibold text-gray-900 text-sm">{item.level}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.note}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics, May 2024 release
            </p>
          </div>
        </section>

        {/* Top Employers */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-7 h-7 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Employer Profiles: Who Is Hiring Baristas Right Now?</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Not all barista jobs deliver the same day-to-day experience. A corporate chain emphasizes speed and consistency; a neighborhood roaster prizes palate development and guest education. Knowing the difference helps you target applications toward the culture and growth track that actually fits your goals — rather than applying everywhere and hoping for the best.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topEmployers.map((emp, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-2">{emp.name}</p>
                <p className="text-gray-600 text-sm">{emp.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Award className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Certifications That Give Your Barista Application an Edge</h2>
              <p className="text-gray-700 mb-6">
                No café will reject you for lacking a certificate, but holding one tells a hiring manager you invested personal time and money into the craft before anyone asked you to. Each credential below targets a different stage of the barista career ladder — pick the one that matches where you are headed next.
              </p>
              <div className="space-y-4">
                {certifications.map((cert, i) => (
                  <div key={i} className="bg-white rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-1">{cert.name}</h3>
                    <p className="text-gray-600 text-sm">{cert.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Career Path */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">From First Apron to Full Ownership: The Barista Career Ladder</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            One of the most underrated aspects of barista jobs is the speed of upward mobility. Hospitality rewards consistency and leadership faster than most white-collar fields — it is common to see a reliable barista move into a salaried management role within three years. And because the skills transfer cleanly into event catering, food-and-beverage directing, or even opening your own shop, the ceiling is as high as your ambition.
          </p>
          <div className="relative">
            <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-indigo-100 hidden md:block" />
            <div className="space-y-4">
              {careerPath.map((step, i) => (
                <div key={i} className="flex gap-5 items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm z-10">
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
          </div>
        </section>

        {/* Application Tips */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Four Moves That Get You Hired Faster for Barista Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Most barista applications look identical: a one-page resume, a line about loving coffee, and open availability. The candidates who land callbacks do something slightly different — they show evidence of reliability, speed, and genuine curiosity about the specific shop they are applying to. Here is exactly how to do that.
          </p>
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
            <h2 className="text-2xl font-bold text-gray-900">Common Questions About Barista Jobs, Answered</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Whether you are weighing your first café application or considering a switch from a desk job, these are the practical questions that come up most often when people research barista-jobs online. We have kept the answers blunt and data-backed so you can make a decision without the fluff.
          </p>
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
            <strong>Disclaimer:</strong> All salary ranges and market projections referenced on this barista-jobs page draw from publicly available data published by the U.S. Bureau of Labor Statistics and O*NET OnLine. Actual pay, benefits, and hiring requirements vary by employer, location, and individual negotiation. Always confirm compensation details directly with the hiring company before accepting any offer.
          </p>
        </section>

      </div>
    </>
  )
}