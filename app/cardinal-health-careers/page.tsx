import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Heart, DollarSign, MapPin, CheckCircle, GraduationCap, Users, Award, Building, Truck, HelpCircle, TrendingUp, Shield, Package, Pill } from 'lucide-react'
import { searchJobs, getCachedJobCount, AdzunaSearchResult } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna

export const metadata: Metadata = {
  title: 'Cardinal Health Careers — Warehouse, Pharmacy, IT & Corporate Openings',
  description: 'Search cardinal-health-careers across distribution, clinical pharmacy, technology, and corporate functions. Filter by location, pay band, and work model — remote, hybrid, or on-site.',
  keywords: 'cardinal-health-careers, Cardinal Health warehouse jobs, pharmacy technician Cardinal Health, healthcare supply chain careers, Cardinal Health remote jobs, Dublin Ohio Cardinal Health',
  openGraph: {
    title: 'Cardinal Health Careers: Distribution to Director-Level Roles | Oh My Job',
    description: 'Browse cardinal-health-careers updated daily. Warehouse operators, licensed pharmacists, cloud engineers, and finance analysts — find the division that fits your background.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cardinal Health Careers — New Openings Posted This Week',
    description: 'From fulfillment floors to the Dublin HQ, cardinal-health-careers span six major job families. Search by state, salary, or schedule and apply in minutes.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/cardinal-health-careers',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Cardinal Health Careers Job Board',
  description: 'Daily-refreshed listings of cardinal-health-careers covering pharmaceutical distribution, clinical operations, enterprise technology, and corporate strategy roles across all US states.',
  url: 'https://www.oh-my-job.com/cardinal-health-careers',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Open Cardinal Health Career Listings',
    description: 'Searchable feed of cardinal-health-careers from entry-level warehouse positions to senior director and pharmacist-in-charge openings.',
  },
}

const jobCategories = [
  { title: 'Pharmaceutical Distribution & Fulfillment', description: 'Pick, scan, and route temperature-sensitive medications through automated conveyor systems while meeting same-day dispatch windows that hospitals depend on.', icon: Package },
  { title: 'Clinical & Nuclear Pharmacy', description: 'Compound sterile preparations, verify prescription accuracy under pharmacist supervision, or handle short-half-life radiopharmaceuticals used in diagnostic imaging.', icon: Pill },
  { title: 'End-to-End Supply Chain', description: 'Forecast demand across 30,000+ SKUs, negotiate carrier contracts, and apply continuous-improvement frameworks to shave hours off delivery timelines.', icon: Truck },
  { title: 'Enterprise Technology & Data', description: 'Build the APIs that connect ordering platforms to warehouse management systems, harden networks against ransomware, and turn shipment telemetry into actionable dashboards.', icon: TrendingUp },
  { title: 'Commercial & Customer Solutions', description: 'Consult with hospital procurement teams and independent pharmacy owners to design supply programs that cut their costs without compromising formulary breadth.', icon: Users },
  { title: 'Finance, Legal & People Operations', description: 'Run the FP&A models behind a $200B+ revenue engine, navigate FDA/DEA regulatory filings, or design the talent pipelines that keep 46,000 seats filled.', icon: Building },
]

const benefits = [
  { benefit: 'Day-One Medical Coverage', description: 'Health, dental, and vision plans activate the moment you start — no 90-day waiting period — with multiple tier options to match individual or family needs.' },
  { benefit: '401(k) With Employer Match', description: 'Cardinal matches a percentage of your contributions from your first eligible paycheck, plus offers an employee stock purchase plan at a discount.' },
  { benefit: 'Paid Time Off & Flexibility', description: 'A combined PTO bank covers vacation, personal days, and sick time, alongside paid company holidays and optional volunteer-day credits.' },
  { benefit: 'Tuition Reimbursement', description: 'Up to several thousand dollars annually toward degree programs, professional certifications, or continuing-education credits relevant to your role.' },
  { benefit: 'Wellbeing Programs', description: 'Subsidized gym memberships, a confidential employee-assistance line, and on-site wellness screenings at larger campus locations.' },
  { benefit: 'Internal Mobility & Mentorship', description: 'An open internal job board, formal mentorship pairings, and rotational leadership cohorts designed to move people up — or across — the organization.' },
]

const majorLocations = [
  { location: 'Dublin, Ohio', type: 'Corporate Headquarters', description: 'The central decision-making campus where strategy, finance, legal, and technology teams converge to steer the company globally.' },
  { location: 'La Vergne, Tennessee', type: 'Primary Distribution Center', description: 'One of the highest-throughput pharmaceutical fulfillment sites in the US, processing millions of units per week for southeastern hospital networks.' },
  { location: 'Valencia, California', type: 'West Coast Distribution', description: 'Serves as the time-zone-forward shipping hub ensuring next-morning delivery windows for Pacific-region healthcare providers.' },
  { location: 'Groveport, Ohio', type: 'Specialty Fulfillment', description: 'Handles cold-chain biologics and high-value specialty medications requiring strict temperature monitoring from shelf to truck.' },
  { location: 'Denver, Colorado', type: 'Regional Operations', description: 'A growing site supporting specialty pharmacy services, nuclear pharmacy preparation, and mountain-west clinical logistics.' },
  { location: 'Remote / Nationwide', type: 'Distributed Roles', description: 'Eligible IT, analytics, sales, and corporate-function positions operate fully remote or on a hybrid schedule across all fifty states.' },
]

const faqs = [
  {
    question: 'What makes cardinal-health-careers different from other healthcare employers?',
    answer: 'Cardinal Health sits behind the scenes of patient care rather than at the bedside. That means you work in pharmaceutical logistics, data infrastructure, or commercial strategy — fields where the pace is driven by supply-chain deadlines and regulatory precision rather than clinical shift rotations. For people who want healthcare impact without direct patient contact, it is a distinct niche.',
  },
  {
    question: 'What education do I need to qualify for entry-level cardinal-health-careers?',
    answer: 'Warehouse and fulfillment roles require a high school diploma or GED and no prior experience — Cardinal trains you on material-handling equipment, scanning systems, and safety protocols. Pharmacy technician positions need an active state license and ideally PTCB certification. Corporate and tech roles typically ask for a bachelor\'s degree, though equivalent professional experience is accepted for many engineering and analyst openings.',
  },
  {
    question: 'Which cardinal-health-careers can be done remotely?',
    answer: 'Most technology, data-analytics, finance, HR, and inside-sales roles are eligible for hybrid or fully remote arrangements. Distribution-center, pharmacy, and fleet-logistics positions require physical presence because the work involves handling regulated products that cannot leave the facility.',
  },
  {
    question: 'How long does the Cardinal Health hiring process take from application to start date?',
    answer: 'Warehouse roles often move fastest — application to first shift can happen in two to three weeks. Corporate and technical positions typically span four to six weeks due to additional interview rounds and, in some cases, security-clearance or DEA background checks. Pharmacy roles fall somewhere in between, depending on license verification timelines in your state.',
  },
  {
    question: 'Do I need healthcare industry experience to apply?',
    answer: 'Not for most positions. Cardinal actively recruits logistics professionals from retail and e-commerce, software engineers from fintech or SaaS, and finance analysts from banking or consulting. The regulated healthcare context is taught during onboarding — what matters at the application stage is whether your core skill set maps to the job requirements.',
  },
  {
    question: 'Can I switch departments after I am hired?',
    answer: 'Yes, and it happens frequently. Cardinal posts every open requisition on an internal job board visible to all employees. A warehouse associate who earns a supply-chain certificate through the tuition-reimbursement program, for example, can apply to an inventory-planning analyst role without leaving the company. Managers are evaluated partly on how well they develop talent for the broader organization, not just their own team.',
  },
]

const careerPaths = [
  {
    title: 'Distribution Floor to Facility Leadership',
    description: 'Start as a warehouse associate learning pick-pack-ship workflows, earn forklift and hazmat certifications on the job, move into team-lead, then operations supervisor — with facility-director seats opening for people who master throughput and safety metrics.',
  },
  {
    title: 'Pharmacy Tech to Pharmacist-in-Charge',
    description: 'Enter as a certified technician handling order verification and compounding, use tuition reimbursement to complete a PharmD program, and return as a licensed pharmacist overseeing an entire clinical or nuclear pharmacy site.',
  },
  {
    title: 'Analyst to VP in Corporate Functions',
    description: 'Join as a financial analyst or HR coordinator, rotate through two or three business units over five years, and build the cross-functional fluency that qualifies you for director and VP-level strategy roles at headquarters.',
  },
  {
    title: 'Junior Engineer to Principal or CISO',
    description: 'Begin in application support or QA automation, deepen into cloud architecture or cybersecurity, and advance along a defined technical ladder that leads to principal-engineer or chief-security-officer titles without requiring a management switch.',
  },
]

const industryStats = [
  { stat: 'Fortune 15', label: 'By Annual Revenue' },
  { stat: '$205B+', label: 'Revenue (FY 2024)' },
  { stat: '46,500+', label: 'Employees Worldwide' },
  { stat: '~90%', label: 'Of US Hospitals Served' },
]

const workEnvironment = [
  { environment: 'Automated Fulfillment Centers', description: 'Climate-controlled floors with conveyor sortation, robotic picking assists, and OSHA-exceeding safety infrastructure across every shift.', icon: Package },
  { environment: 'Corporate Campuses', description: 'Open-plan offices with bookable focus rooms, on-site cafeterias, and collaboration zones built around hybrid attendance patterns.', icon: Building },
  { environment: 'Sterile Pharmacy Labs', description: 'ISO-classified cleanrooms equipped with laminar-flow hoods, automated dispensing cabinets, and real-time environmental monitoring.', icon: Pill },
  { environment: 'Remote-First Digital Teams', description: 'Fully distributed squads using cloud dev environments, async standups, and quarterly in-person offsites to maintain team cohesion.', icon: MapPin },
]

export default async function CardinalHealthCareersPage({ searchParams }: any) {
  const params = await searchParams

 const [{ count }, initialData] = await Promise.all([
  getMergedJobCount(params.what || 'cardinal health', params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
  searchMergedJobs({ what: params.what || 'cardinal health', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
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
            Cardinal Health Careers — Distribution, Pharmacy, Tech & Corporate Roles Hiring Now
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="cardinal health" />
          </aside>
          <div className="flex-1">
            {count > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">{count.toLocaleString()}</span> positions currently open
              </p>
            )}

            <AIJobMatcherWrapper />
            
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'cardinal health'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Company Overview Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-7 h-7 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">Why Cardinal Health Careers Sit at the Center of US Healthcare</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Most patients never see the company name on a pill bottle, yet Cardinal Health touches nearly every prescription filled in the country. The company operates the distribution backbone that moves pharmaceuticals, surgical supplies, and lab products from manufacturers to the point of care — a logistics machine generating over $200 billion in annual revenue. Exploring cardinal-health-careers means joining an organization where a single routing decision in a Tennessee fulfillment center can determine whether a rural hospital in Montana has the medication its ICU needs by morning.
          </p>
          <div className="grid md:grid-cols-4 gap-4">
            {industryStats.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-red-50 to-white border border-red-200 rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-red-600 mb-1">{item.stat}</p>
                <p className="text-gray-600 text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Job Categories Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Cardinal Health Careers by Job Family</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Cardinal Health is not a single-track employer. The organization runs six broad job families, each with its own skill requirements, advancement ladder, and daily rhythm. Scanning all six before you apply ensures you land in the division where your existing strengths translate fastest — and where the growth direction aligns with your five-year plan.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobCategories.map((category, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <category.icon className="w-10 h-10 text-red-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{category.title}</h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Work Environments Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Building className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Day-to-Day Work Settings Across Cardinal Health Careers</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Where you physically work shapes everything from dress code to break rhythm. Cardinal Health operates four distinct environment types, and understanding the one attached to your target role avoids first-week surprises — especially the difference between a temperature-controlled warehouse floor and a quiet corporate campus.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {workEnvironment.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <item.icon className="w-8 h-8 text-purple-600 mb-3" />
                <p className="font-semibold text-gray-900 mb-1">{item.environment}</p>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Locations Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Where Cardinal Health Careers Are Concentrated</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Cardinal Health runs facilities in dozens of states, but hiring volume clusters around a handful of major hubs. If relocation is on the table, these are the metros with the deepest bench of open requisitions. If it is not, the remote-eligible category has expanded steadily since 2021 and now covers most non-physical-handling roles.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {majorLocations.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 text-lg mb-1">{item.location}</p>
                <p className="text-red-600 font-medium text-sm mb-2">{item.type}</p>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-yellow-600" />
            <h2 className="text-2xl font-bold text-gray-900">Benefits Package Breakdown for Cardinal Health Careers</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Compensation is more than the number on your offer letter. Cardinal Health structures its total-rewards package to cover the financial, educational, and personal-wellness dimensions that keep people engaged beyond the first year. Here is what the standard benefits envelope includes for full-time hires.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{item.benefit}</p>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Career Paths Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Realistic Growth Tracks Inside Cardinal Health Careers</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            One of the clearest advantages of cardinal-health-careers is that the promotion path is visible before you accept the offer. Each division publishes its own leveling framework, so you can map the skills, certifications, and tenure needed to reach the next rung. Below are four common trajectories employees actually follow — not theoretical possibilities.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {careerPaths.map((path, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-green-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 font-bold rounded-full text-sm mb-4">
                  {index + 1}
                </span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{path.title}</h3>
                <p className="text-gray-600 text-sm">{path.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Requirements Section */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <GraduationCap className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Qualifications by Division</h2>
              <p className="text-gray-700 mb-6">
                Because cardinal-health-careers span regulated pharmaceutical handling to corporate strategy, qualification expectations vary sharply by division. Use the guide below to gauge where you stand before investing time in an application.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Fulfillment & Logistics</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>High school diploma or GED — no degree required</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Ability to lift 50 lbs repeatedly and stand for full shifts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Forklift and powered-jack training provided on site</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Clinical Pharmacy</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Active pharmacy-technician license for your state</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>PTCB or ExCPT national certification strongly preferred</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>PharmD required for pharmacist and PIC-level roles</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Corporate & Technology</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Bachelor's degree or equivalent hands-on experience</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Relevant certifications valued (CPA, PMP, AWS, CISSP)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Cross-industry experience welcomed for most non-clinical seats</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Compliance and Safety Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-amber-600" />
            <h2 className="text-2xl font-bold text-gray-900">Regulatory Reality of Cardinal Health Careers</h2>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              Working inside a pharmaceutical supply chain means every employee — not just pharmacists — operates under federal scrutiny. The DEA, FDA, and state boards of pharmacy audit Cardinal Health facilities regularly, and that regulatory pressure shapes hiring standards, daily procedures, and the compliance training you will complete multiple times a year. Understanding this upfront helps you decide whether the structured environment is a fit.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Facility-Level Requirements</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>DEA-compliant chain-of-custody tracking on every controlled substance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>Good Distribution Practice (GDP) protocols governing storage and transit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>State Board of Pharmacy licensing and inspection readiness</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>HIPAA-grade data handling for patient and provider records</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">What This Means for You as an Applicant</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>Multi-state criminal background check before any offer is finalized</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>Pre-employment drug screen plus random testing throughout employment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>Annual compliance recertification modules completed on company time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>OSHA safety training mandatory for all warehouse and lab personnel</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Salary Information Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Salary Ranges You Can Expect Across Cardinal Health Careers</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              Pay at Cardinal Health varies widely because the company employs everyone from first-shift warehouse associates to vice presidents of global supply chain. The bands below are national medians compiled from federal labor data and verified employee-reported figures — your actual offer will factor in metro cost-of-living, years of relevant experience, and any specialized licensure you hold.
            </p>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-green-600 mb-2">$36K – $52K</p>
                <p className="text-sm text-gray-600">Warehouse & Distribution</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-green-600 mb-2">$40K – $62K</p>
                <p className="text-sm text-gray-600">Pharmacy Technicians</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-green-600 mb-2">$80K – $135K</p>
                <p className="text-sm text-gray-600">IT, Finance & Analysts</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-green-600 mb-2">$120K+</p>
                <p className="text-sm text-gray-600">Pharmacists & Directors</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Ranges reflect base salary only. Many cardinal-health-careers include annual bonuses, shift differentials for overnight or weekend work, and sign-on incentives for hard-to-fill locations or licensure categories.
            </p>
          </div>
        </section>

        {/* Application Process Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Step-by-Step: How Hiring Works for Cardinal Health Careers</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Cardinal Health uses a structured pipeline that balances speed with regulatory thoroughness. Knowing each stage in advance lets you prepare the right documents and references before the recruiter asks — shaving days off the overall timeline.
          </p>
          <div className="space-y-4">
            {[
              { step: 'Online Application', description: 'Submit your resume through the careers portal, tagging the specific requisition number. Use keywords from the job description — the ATS scores relevance before a human ever sees your file.' },
              { step: 'Recruiter Phone Screen', description: 'A talent-acquisition specialist confirms your salary expectations, availability, and baseline qualifications in a fifteen-to-twenty-minute call.' },
              { step: 'Hiring Manager Interview', description: 'A deeper conversation — usually video — focused on behavioral questions and role-specific scenarios. For technical roles, expect a live problem-solving exercise or take-home assessment.' },
              { step: 'Panel or Peer Interview', description: 'Senior and cross-functional positions add a panel round where future colleagues evaluate collaboration fit and domain depth.' },
              { step: 'Background & Compliance Checks', description: 'Multi-state criminal record review, employment verification, and a drug screen. DEA-regulated roles may include additional federal database checks.' },
              { step: 'Offer & Onboarding', description: 'You receive a written offer with salary, benefits summary, and start date. Onboarding includes compliance modules, system-access provisioning, and a first-week orientation with your team.' },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4 bg-white border border-gray-200 rounded-xl p-5">
                <span className="inline-flex items-center justify-center w-10 h-10 bg-purple-100 text-purple-700 font-bold rounded-full text-lg flex-shrink-0">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{item.step}</h3>
                  <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Cardinal Health Careers — Frequently Asked Questions</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Straight answers to the questions job seekers ask most when researching cardinal-health-careers for the first time.
          </p>
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
            <strong>Disclaimer:</strong> Oh My Job is an independent job search platform and is not affiliated with, endorsed by, or operated by Cardinal Health, Inc. or any of its subsidiaries. "Cardinal Health" is a registered trademark of Cardinal Health, Inc. Job listings displayed on this page are sourced from publicly available feeds and third-party data providers. All hiring decisions, compensation terms, benefit eligibility, and employment conditions are determined solely by Cardinal Health or its authorized agents. Verify all details directly with the employer before accepting any offer.
          </p>
        </section>
      </div>
    </>
  )
}