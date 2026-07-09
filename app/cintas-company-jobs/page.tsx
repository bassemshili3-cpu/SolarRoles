import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, DollarSign, CheckCircle, Shield, TrendingUp, Users, Award, MapPin, FileText } from 'lucide-react'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Cintas Company Jobs — Route Driver, Sales, Production & Management Openings',
  description: 'Cintas posts route service, field sales, plant production, and corporate roles from 480+ U.S. facilities. Filter by location and division.',
  keywords: 'cintas company jobs, cintas route driver hiring, cintas service sales rep, cintas production associate, cintas management trainee, cintas first aid specialist, cintas careers near me',
  openGraph: {
    title: 'Cintas Company Jobs: Route, Sales, Production & Corporate Roles | Oh My Job',
    description: 'Browse cintas company jobs from entry-level production to branch management. Compare pay structures, benefit packages, and promotion timelines before you apply.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cintas Company Jobs — Openings Across All Divisions',
    description: 'Route service, field sales, plant ops, first aid — find cintas company jobs by zip code and role type. Many positions offer same-month start dates.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/cintas-company-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Cintas Company Jobs Board',
  description: 'Daily-refreshed directory of cintas company jobs spanning route service, production, sales, safety services, and corporate functions across 480+ US and Canadian facilities.',
  url: 'https://www.oh-my-job.com/cintas-company-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Current Cintas Company Job Listings',
    description: 'Searchable feed of cintas company jobs from hourly production roles to salaried branch-manager and regional-director positions.',
  },
}

const popularRoles = [
  {
    title: 'Route Service Representative',
    description: 'Load a truck before dawn, run a 30-to-50-stop daily route, swap out soiled uniforms and mats for fresh inventory, restock first-aid cabinets, and build the face-to-face customer relationships that drive route retention rates.',
  },
  {
    title: 'Service Sales Representative',
    description: 'Prospect new accounts in an assigned territory through cold calls and drop-ins, close contracts for uniform rental, facility services, and safety products, and grow wallet share on existing accounts — all with uncapped commission on top of base salary.',
  },
  {
    title: 'Production Associate',
    description: 'Work inside the plant sorting, washing, inspecting, and folding garments on high-speed conveyor lines. Roles cover soil sort, wash, finishing, and quality audit — the physical backbone that keeps every route truck loaded on time.',
  },
  {
    title: 'Management Trainee',
    description: 'A 16-to-18-month rotational program for recent graduates that cycles through route ride-alongs, plant operations, sales shadowing, and branch administration — ending with placement into an operations or sales management seat.',
  },
  {
    title: 'First Aid & Safety Service Rep',
    description: 'Visit client sites to inspect and restock first-aid kits, eyewash stations, and AED units. Demand for this role is climbing as OSHA enforcement tightens and more employers outsource compliance tracking to Cintas.',
  },
  {
    title: 'Office & Branch Support',
    description: 'Handle customer billing inquiries, coordinate route scheduling, process new-hire paperwork, and manage the daily logistics that keep a branch running — the behind-the-scenes roles that rarely appear in headlines but are always hiring.',
  },
]

const benefitsData = [
  { benefit: 'Day-One Health Coverage', detail: 'Medical, dental, and vision plans activate on your start date — no 30- or 90-day waiting period — with multiple tier options for individuals and families.' },
  { benefit: '401(k) + Company Match', detail: 'Cintas matches a percentage of employee contributions from the first eligible paycheck, giving every new hire immediate access to retirement-savings acceleration.' },
  { benefit: 'Profit-Sharing Distributions', detail: 'Eligible employees receive annual profit-sharing payments tied to company performance — a payout that has been funded consistently for decades thanks to Cintas\'s revenue stability.' },
  { benefit: 'Employee Stock Purchase Plan', detail: 'Buy Cintas shares at a discount through payroll deductions, building an ownership stake in an S&P 500 company that has outperformed most industrial peers over the past twenty years.' },
  { benefit: 'Tuition Reimbursement', detail: 'Financial support for degree programs and professional certifications aligned with your role, paid back to you after successful course completion.' },
  { benefit: 'PTO + Paid Holidays', detail: 'A combined bank of vacation days, personal days, and sick time plus company-observed holidays — accrual rates increase with tenure.' },
]

const companyFacts = [
  { label: 'Founded', value: '1968', detail: 'Cincinnati, Ohio headquarters' },
  { label: 'Workforce', value: '40,000+', detail: 'Employees across the US and Canada' },
  { label: 'Facilities', value: '480+', detail: 'Plants, branches, and distribution points' },
  { label: 'Revenue', value: '$9B+', detail: 'Annual revenue (FY 2024)' },
]

const workCulture = [
  {
    title: 'Promotion Happens From the Inside',
    description: 'Cintas fills the majority of its supervisory and branch-manager seats with internal candidates. A route rep who consistently hits retention targets and demonstrates leadership aptitude is a stronger candidate for ops manager than an outside MBA with no route experience.',
  },
  {
    title: 'Structured Training at Every Level',
    description: 'New hires ride along with experienced reps before running solo. The Management Trainee program is widely regarded as one of the most thorough in the business-services industry — graduates emerge with hands-on exposure to every revenue-generating function in a branch.',
  },
  {
    title: 'Safety as a Daily Operating Standard',
    description: 'Route drivers complete pre-trip vehicle inspections, plant workers follow lockout-tagout protocols on laundry equipment, and every facility tracks incident rates against OSHA benchmarks. Safety is not a poster on the wall — it is baked into the performance scorecard.',
  },
  {
    title: 'Community and Giving Back',
    description: 'The Cintas Foundation funds local disaster-relief efforts, school-supply drives, and employee-matching charitable contributions. Branch teams regularly organize volunteer days that double as team-building events.',
  },
]

const faqs = [
  {
    question: 'What kinds of cintas company jobs are available right now?',
    answer: 'Cintas hires across five main divisions: Uniform Rental (route reps, production, plant management), First Aid & Safety (service reps, compliance specialists), Fire Protection (technicians, inspectors), Facility Services (restroom and hygiene route drivers), and Corporate Support (IT, finance, HR, legal). Because the company serves over one million business customers, turnover and growth create steady openings in all five divisions year-round.',
  },
  {
    question: 'Do I need experience to get hired for entry-level cintas company jobs?',
    answer: 'No prior industry experience is required for production-associate or route-service roles. Cintas provides paid, multi-week training that covers everything from garment inspection standards to vehicle safety and customer-interaction protocols. A clean driving record and valid CDL or DOT medical card may be required for route positions depending on the truck class assigned to your branch.',
  },
  {
    question: 'How much do cintas company jobs pay?',
    answer: 'Pay varies by role and metro area. Production associates typically start between $15 and $19 per hour. Route service reps earn $45K to $65K annually when bonuses for route growth and retention are included. Service sales reps operate on a base-plus-uncapped-commission structure that regularly pushes total comp past $80K for top performers. Management trainees start around $50K to $60K salaried, and branch managers can exceed $120K with bonus.',
  },
  {
    question: 'How does the Management Trainee program work?',
    answer: 'It is a 16-to-18-month rotational track open to recent four-year graduates. Trainees spend time on route trucks, on the plant floor, shadowing sales reps in the field, and sitting in on branch P&L reviews. The goal is to build end-to-end operational fluency so that when you are placed into a management role — typically operations supervisor or sales manager — you understand every function your team performs.',
  },
  {
    question: 'Are any cintas company jobs remote?',
    answer: 'The short answer is: very few. Route, production, first-aid, and fire-protection roles are inherently field- or plant-based. Some corporate-function positions in IT, data analytics, finance, and HR offer hybrid or fully remote arrangements, but they represent a small fraction of total headcount. If remote work is a priority, filter listings by the "Corporate" or "IT" division tags.',
  },
  {
    question: 'How fast does Cintas hire?',
    answer: 'Operational roles move quickly — many candidates go from online application to first day inside of two weeks, especially when a branch has an immediate route or production vacancy. Sales and management-trainee positions take longer (three to five weeks) because they involve additional interview rounds and, in some cases, a ride-along evaluation where you spend a half-day observing an active route.',
  },
]

const applicationTips = [
  {
    title: 'Write a Division-Specific Resume',
    description: 'A resume targeting a route-service role should lead with driving record, daily stop counts, and customer-retention results. A sales resume should spotlight quota attainment and new-logo wins. The ATS scores relevance against the specific job description — a generic "operations professional" headline gets filtered out.',
  },
  {
    title: 'Learn the Five Business Lines Before You Interview',
    description: 'Cintas is not just a uniform company. Demonstrating that you understand the First Aid, Fire Protection, Facility Services, and Document Management divisions — and how they cross-sell into the same customer base — tells the hiring manager you did homework that 90% of applicants skip.',
  },
  {
    title: 'Prove Reliability With Concrete Examples',
    description: 'Cintas operates on tight daily schedules: trucks leave the plant by 6 AM, routes must finish before cutoff, and plant shifts run on fixed start times. If you can say "I maintained 98% attendance over two years at my last employer" or "I never missed a delivery window," that specificity resonates more than vague claims about work ethic.',
  },
  {
    title: 'Apply to Multiple Branches in Your Metro',
    description: 'Cintas often runs several facilities within the same metro — a uniform plant, a first-aid branch, and a fire-protection office might all be within a 20-mile radius. Applying to each one separately multiplies your exposure to different hiring managers and different vacancy timelines.',
  },
]

export default async function CintasCompanyJobsPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'cintas company', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'cintas company', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
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
            Cintas Company Jobs — Route, Production, Sales & Corporate Openings Nationwide
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="cintas company" />
          </aside>
          <div className="flex-1">


            

            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'cintas company'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Company Overview */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Why Cintas Company Jobs Are Worth a Closer Look</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Most people encounter Cintas without realizing it — the logo on a delivery driver's uniform, the first-aid cabinet in an office kitchen, the floor mats inside a restaurant entrance. Behind those everyday touchpoints sits a $9-billion-revenue S&P 500 company that serves over one million business customers from more than 480 facilities across the US and Canada. What makes cintas company jobs distinctive is the business model: recurring-revenue service contracts create route density that keeps trucks full and headcount stable even during economic downturns. For job seekers, that translates into unusually consistent hiring volume and low layoff risk compared to most industrial employers.
          </p>
          <div className="grid md:grid-cols-4 gap-4">
            {companyFacts.map((fact, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow text-center">
                <p className="text-blue-600 text-2xl font-bold mb-1">{fact.value}</p>
                <p className="font-semibold text-gray-900 text-sm">{fact.label}</p>
                <p className="text-gray-500 text-xs mt-1">{fact.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Roles */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Roles You Will Find in Cintas Company Jobs Listings</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Cintas hires year-round across five revenue divisions, but the six roles below account for the overwhelming majority of open requisitions at any given time. Each one has a different daily rhythm, physical demand level, and pay structure — understanding those differences before you apply helps you target the position where your strengths map most directly.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularRoles.map((role, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <Briefcase className="w-10 h-10 text-indigo-500 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-900">Benefits Package Breakdown for Cintas Company Jobs</h2>
          </div>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              Cintas structures its total-rewards package around three pillars: health coverage that starts immediately, retirement savings with employer amplification, and an ownership stake via stock purchase and profit sharing. That last piece is rare at the hourly level — a production associate making $17/hr still receives a profit-sharing check and can buy discounted Cintas stock, which means even entry-level cintas company jobs come with wealth-building tools typically reserved for salaried professionals.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {benefitsData.map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-5">
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">{item.benefit}</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Salary */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">What Cintas Company Jobs Pay by Position</h2>
          </div>
          <p className="text-gray-600 mb-4 max-w-4xl">
            Pay structures at Cintas vary sharply by role type. Production is straight hourly, route service blends hourly with performance bonuses tied to stop efficiency and customer retention, and sales runs on a base-plus-uncapped-commission model where top reps routinely double their base. The table below shows national medians — your actual offer will depend on metro cost-of-living and the specific branch's volume tier.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-5 py-3 font-semibold text-gray-900 border-b border-gray-200">Role</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-900 border-b border-gray-200">Typical Range</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-900 border-b border-gray-200">Pay Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ['Production Associate', '$32,000 – $42,000', 'Hourly'],
                  ['Route Service Representative', '$46,000 – $66,000', 'Hourly + Route Bonus'],
                  ['Service Sales Representative', '$55,000 – $95,000+', 'Base + Uncapped Commission'],
                  ['First Aid & Safety Rep', '$44,000 – $62,000', 'Hourly + Service Bonus'],
                  ['Management Trainee', '$52,000 – $62,000', 'Salary'],
                  ['Branch / General Manager', '$85,000 – $130,000+', 'Salary + P&L Bonus'],
                ].map(([role, range, type], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-5 py-3 font-medium text-gray-900">{role}</td>
                    <td className="px-5 py-3 text-green-700 font-semibold">{range}</td>
                    <td className="px-5 py-3 text-gray-500">{type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Ranges compiled from BLS Occupational Employment & Wage Statistics and verified employee-reported data. Actual compensation varies by branch volume, geographic market, and individual performance. Profit-sharing distributions and stock-plan gains are not reflected in these figures.
          </p>
        </section>

        {/* Work Culture */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Users className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What the Day-to-Day Culture Feels Like at Cintas</h2>
              <p className="text-gray-700 mb-6">
                Cintas operates with a blue-collar intensity that rewards consistency over flash. Routes leave on time, plants hit throughput targets, and safety incidents are tracked at the individual level — but underneath that operational rigor is a genuine promote-from-within ethos that gives hourly workers a visible path to six-figure management roles. Here are the four cultural pillars that shape the employee experience.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {workCulture.map((item, i) => (
                  <div key={i} className="bg-white rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Locations */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-7 h-7 text-rose-500" />
            <h2 className="text-2xl font-bold text-gray-900">Where Cintas Company Jobs Are Concentrated</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Cintas positions its 480+ facilities to mirror where American businesses cluster — which means the densest hiring happens in metro areas with high concentrations of restaurants, medical offices, manufacturing plants, and corporate parks. If your city has an industrial corridor or a suburban office ring, there is almost certainly a Cintas branch within commuting distance.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX',
              'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'Dallas, TX',
              'San Diego, CA', 'Jacksonville, FL', 'Austin, TX', 'Columbus, OH',
            ].map((city, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-center text-sm text-gray-700 hover:border-blue-300 transition-colors">
                {city}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            This is a sample of high-volume hiring markets. Use the search filters above to find cintas company jobs open near your specific zip code.
          </p>
        </section>

        {/* Application Tips */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Four Moves That Improve Your Odds on Cintas Company Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Cintas receives a high volume of applications because the brand is visible on virtually every commercial street in America. The candidates who get callbacks do a few things that the mass-apply crowd skips — here is what separates a quick hire from radio silence.
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
            <h2 className="text-2xl font-bold text-gray-900">Cintas Company Jobs — Questions Applicants Ask Most</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Practical answers to the six questions that come up most when people research cintas company jobs for the first time.
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
        <section className="mt-20 border-t border-gray-200 pt-10 space-y-3">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> Salary ranges, benefit descriptions, and hiring-process details on this page are compiled from BLS Occupational Employment & Wage Statistics, publicly available Cintas Corporation disclosures, and employee-reported data. Actual compensation, benefits eligibility, and role requirements for cintas company jobs are determined solely by Cintas Corporation and may vary by facility, division, and individual negotiation. Always verify details directly with the hiring branch or recruiter before accepting an offer.
          </p>
          <p className="text-sm text-gray-500 max-w-4xl">
            Oh My Job is an independent job search platform with no corporate affiliation to Cintas Corporation or any of its subsidiaries. "Cintas" and related marks are registered trademarks of Cintas Corporation. Job listings displayed on this page are sourced from publicly available feeds and third-party data providers.
          </p>
        </section>

      </div>
    </>
  )
}