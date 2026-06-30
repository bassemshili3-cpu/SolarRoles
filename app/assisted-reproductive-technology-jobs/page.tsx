import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, AlertTriangle, BookOpen, Users, Heart, Award, TrendingUp, Building2, GraduationCap, Microscope } from 'lucide-react'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600 // Cache ISR 1h — reduces Adzuna calls

export const metadata: Metadata = {
  title: 'ART & Fertility Jobs: Find Your Next Role in Reproductive Medicine',
  description: 'IVF coordinators, embryologists, and REI physicians are in short supply at fertility clinics nationwide. Salary data and clinic details included.',
  keywords: 'ART jobs, fertility clinic careers, REI fellowship, embryologist jobs, IVF specialist, reproductive endocrinology, reproductive medicine careers',
  openGraph: {
    title: 'Careers in Assisted Reproductive Technology (ART)',
    description: 'The fertility industry is booming, but there is a critical talent shortage. Connect with clinics actively hiring embryologists, REI specialists, and IVF professionals.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fertility & ART Careers: High Demand, Great Opportunities',
    description: 'Clinics nationwide are searching for skilled ART professionals. See who is hiring in the rapidly growing fertility sector.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/assisted-reproductive-technology-jobs',
  },
}

// ─── Fixed JSON-LD: ItemList with ListItem (not JobPosting) ──────────────────
// JobPosting requires hiringOrganization, jobLocation, datePosted.
// These entries are illustrative role categories, not real job postings,
// so ListItem is the correct type and avoids GSC validation errors.
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Assisted Reproductive Technology (ART) Jobs Board',
  description: 'Your destination for finding top roles in the fertility and ART industry. Connect with clinics looking to hire skilled embryologists, REI specialists, and laboratory directors.',
  url: 'https://www.oh-my-job.com/assisted-reproductive-technology-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Current Openings in Reproductive Medicine',
    description: 'Explore high-demand clinical and laboratory roles across the ART sector.',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Embryologist',
        description: 'Laboratory roles requiring hands-on expertise in IVF, ICSI, and modern cryopreservation protocols.',
        url: 'https://www.oh-my-job.com/assisted-reproductive-technology-jobs',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Reproductive Endocrinology Specialist',
        description: 'Highly sought-after REI positions at top fertility clinics nationwide.',
        url: 'https://www.oh-my-job.com/assisted-reproductive-technology-jobs',
      },
    ],
  },
}

const artRoles = [
  { title: 'Embryologist', description: 'Get hands-on with cutting-edge lab tech—like time-lapse embryo imaging and AI selection—to directly boost IVF success rates.', icon: Microscope },
  { title: 'REI Fellowship Track', description: 'Join highly competitive reproductive endocrinology programs. With so few graduates each year, you essentially get to write your own ticket.', icon: GraduationCap },
  { title: 'AI Embryo Analyst', description: 'Bridge the gap between tech and biology. Use emerging AI tools to revolutionize how we predict IVF outcomes.', icon: TrendingUp },
  { title: 'Fertility Clinic Director', description: 'Take the helm at rapidly growing, often PE-backed clinic networks. You will need both clinical know-how and serious business chops.', icon: Building2 },
  { title: 'Cryopreservation Specialist', description: 'Focus on the fastest-growing side of the field: egg and embryo freezing. Vitrification experts are incredibly sought after right now.', icon: Shield },
  { title: 'Genetic Counseling Professional', description: 'Help patients navigate the complex world of PGT-A and genetic screening, a crucial and growing part of modern IVF.', icon: BookOpen },
]

const marketInsights = [
  { stat: '$32.6B', label: "The global ART market value in 2024. It is growing fast, expected to hit $89.4B by 2034.", source: 'Emergen Research 2024' },
  { stat: '17.5%', label: "Roughly 1 in 6 adults globally experience infertility, creating a huge need for compassionate care.", source: 'World Health Organization 2023' },
  { stat: '60 Fellows', label: "The estimated number of REI grads in 2024, compared to 50+ clinics fighting to hire them.", source: 'Fertility Bridge 2024 Report' },
  { stat: '36%', label: "North America's share of the global market revenue, driving highly competitive salaries.", source: 'Emergen Market Analysis' },
]

const salaryEvolution = [
  { role: 'AI Embryology Specialist', range: '$125,000 – $185,000', note: "Tech meets biology. Clinics pay top dollar if you know how to leverage machine learning for embryo selection." },
  { role: 'Cryopreservation Director', range: '$95,000 – $140,000', note: "Lead the charge in the booming egg-freezing space. Advanced certifications really pay off here." },
  { role: 'REI Fellowship Graduate', range: '$450,000 – $650,000+', note: "Starting salaries are through the roof because there simply aren't enough grads to go around." },
  { role: 'Genetic Counselor - ART', range: '$85,000 – $120,000', note: "Having specialized PGT-A knowledge easily bumps your pay over general genetic counseling." },
  { role: 'Private Equity Clinic Leader', range: '$200,000 – $350,000', note: "Big networks need leaders who understand both patient care and bottom-line growth." },
  { role: 'Cross-Border ART Coordinator', range: '$70,000 – $95,000', note: "Managing international patients and the logistics of reproductive tourism is a highly valued niche." },
]

const industryRevolution = [
  {
    question: "How is AI actually changing day-to-day ART jobs?",
    answer: "AI is completely shaking up the lab. We're seeing predictive algorithms that can boost IVF success rates noticeably. If you're an embryologist today, you aren't just looking through a microscope; you're often interpreting data from time-lapse imaging systems. It's creating this new hybrid role where traditional lab skills meet tech literacy, and clinics are paying a premium for people who can do both.",
  },
  {
    question: "Why is it such a candidate's market right now?",
    answer: "It comes down to simple math: the industry is exploding, but the talent pool isn't. While the global market is growing by double digits, we're only seeing a handful of REI fellows graduate each year. When you have 50 clinics fighting over 60 graduates, the candidates hold all the cards. The same goes for specialized lab roles—traditional training programs just haven't caught up with the demand for skills in genetic screening and cryopreservation.",
  },
  {
    question: "How is private equity changing clinic careers?",
    answer: "Private equity now backs a massive portion of fertility networks, which has changed the career ladder. It's no longer just about moving from a junior to a senior clinician. There are now executive roles that require you to manage multiple locations, understand P&L, and lead regional teams. It also means clinics generally have deeper pockets for new tech, which is great if you want to work with the latest equipment.",
  },
  {
    question: "Where are the best locations for fertility jobs?",
    answer: 'North America is still the heavyweight champ when it comes to compensation and market size. However, the Asia Pacific region is growing incredibly fast. We\'re also seeing a boom in "reproductive tourism" in places like Eastern Europe and Mexico, creating a need for professionals who can handle cross-border care. Meanwhile, the Middle East offers some heavily government-subsidized opportunities with great stability.',
  },
  {
    question: "Why is cryopreservation suddenly everywhere?",
    answer: "Social egg freezing has gone mainstream, and vitrification techniques have gotten so good that egg and embryo banking is now the fastest-growing segment of the industry. This means we need dedicated lab directors to run large-scale biobanks, and coordinators who can handle the logistics of long-term storage and multi-cycle planning.",
  },
  {
    question: "Which certifications actually matter to employers?",
    answer: "For lab leadership, the HCLD (High Complexity Laboratory Director) is still the gold standard. But beyond that, we're seeing a big push for specialized credentials. Genetic counselors with PGT-A expertise are highly sought after. Even in administrative roles, having a background in healthcare management or cross-cultural patient care will make your resume jump to the top of the pile.",
  },
]

const strategicAdvantages = [
  {
    title: 'Lean into AI & Tech',
    description: "Get comfortable with embryo imaging algorithms and machine learning. Clinics are pouring money into AI, and they want staff who aren't intimidated by data-driven tools.",
  },
  {
    title: 'Master the Freeze',
    description: "Vitrification is booming. If you can specialize in advanced cryopreservation and egg banking, you'll easily find leadership opportunities.",
  },
  {
    title: 'Understand the Business Side',
    description: "With so many clinics backed by private equity, having a grasp on operational management and clinic financials makes you prime management material.",
  },
  {
    title: 'Think Globally',
    description: "Reproductive tourism is growing. Experience in managing international patients or navigating cross-border compliance is a massive plus on your resume.",
  },
]

export default async function AssistedReproductiveTechnologyJobsPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'Assisted Reproductive Technology', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'Assisted Reproductive Technology', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
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
            Careers in Assisted Reproductive Technology: Find Your Place in a Booming Field
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="assisted reproductive technology" />
          </aside>
          <div className="flex-1">
            

            <AIJobMatcherWrapper />

            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList 
                what={params.what || 'assisted reproductive technology'} 
                where={params.where || ''} 
                salary_min={params.salary_min}
                initialData={initialData}
              />
            </Suspense>
          </div>
        </div>

        {/* Market Revolution Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">A Market Expanding Faster Than Its Talent Pool</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The fertility sector is going through a massive growth phase, expected to nearly triple in size over the next decade. Because educational pipelines haven't kept pace, clinics are fiercely competing for skilled embryologists, physicians, and lab technicians. If you have the right expertise, it's entirely a candidate's market.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketInsights.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 text-center hover:shadow-md transition-shadow">
                <p className="text-3xl font-bold text-blue-600 mb-2">{item.stat}</p>
                <p className="text-gray-700 text-sm mb-2">{item.label}</p>
                <p className="text-gray-400 text-xs">{item.source}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Advanced ART Roles */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">The Next Generation of Fertility Careers</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Innovation is rewriting the job descriptions. We are seeing entirely new roles pop up that blend traditional medicine with tech—think AI integration, genetic screening, and advanced cryogenics.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artRoles.map((role, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <role.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Strategic Salary Evolution */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">What to Expect: Compensation & Salary Trends</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Because demand heavily outpaces supply, compensation packages have gotten incredibly competitive. Niche skills—especially anything involving AI or running a cryo lab—easily command a 25% to 40% premium over standard roles. 
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {salaryEvolution.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{item.role}</p>
                <p className="text-2xl font-bold text-green-600 mb-2">{item.range}</p>
                <p className="text-gray-500 text-sm">{item.note}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Keep in mind that salaries fluctuate based on where you live, the size of the clinic, and whether it's an independent practice or part of a larger network. 
          </p>
        </section>

        {/* Industry Revolution Insights */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div className="w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Insider Knowledge: Navigating the ART Landscape</h2>
              <p className="text-gray-700 mb-6">
                Whether you're just finishing your fellowship or you're a seasoned lab tech looking to pivot, understanding the business forces shaping the fertility industry will help you make smarter career moves.
              </p>
              <div className="space-y-4">
                {industryRevolution.map((insight, index) => (
                  <details 
                    key={index} 
                    className="bg-white rounded-lg overflow-hidden group"
                  >
                    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                      <h3 className="font-semibold text-gray-900 pr-4">{insight.question}</h3>
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-4 pb-4 text-gray-600 text-sm">
                      {insight.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Strategic Career Advancement */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">How to Stand Out to Employers</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {strategicAdvantages.map((advantage, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 font-bold rounded-full text-sm mb-4">
                  {index + 1}
                </span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{advantage.title}</h3>
                <p className="text-gray-600 text-sm">{advantage.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Global Market Opportunities */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">A Look at the Global Job Market</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Where you choose to work can dramatically impact your career trajectory. North America currently pays the best, but international markets are catching up fast and offer incredible opportunities for growth.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { region: 'North America', detail: 'The premium market. It holds 36% of the global share and is usually the first to adopt expensive new AI and cryo tech.' },
              { region: 'Asia Pacific', detail: 'The growth engine. Expanding rapidly, with China alone performing over a million cycles annually.' },
              { region: 'Europe', detail: 'The innovation hub. Thanks to better reimbursement frameworks, Europe leads the charge in genetic counseling and cross-border care.' },
              { region: 'Middle East', detail: 'The investment focus. Places like the UAE and Israel offer heavily subsidized IVF, resulting in very stable clinic jobs.' },
              { region: 'Latin America', detail: 'The emerging market. Brazil is quickly becoming a major hub for patients traveling for more affordable care.' },
              { region: 'Cross-Border Networks', detail: 'The logistical side. International clinic chains are actively hunting for bilingual staff to manage traveling patients.' },
            ].map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-2">{item.region}</p>
                <p className="text-gray-600 text-sm">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Technology Disruption Section */}
        <section className="mt-20 bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">The Tech Skills You Need Right Now</h2>
              <p className="text-gray-700 mb-4">
                The old ways of running a lab are fading. If you want to future-proof your career and negotiate a better salary, these are the two areas you need to be paying attention to.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">AI & Machine Learning</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Familiarity with predictive embryo selection software.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Comfortable interpreting cycle analytics and lab data.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Experience with time-lapse incubator imaging systems.</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Advanced Cryopreservation</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Mastery of the latest vitrification protocols.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Experience managing large-scale biobanking logistics.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Knowledge of multi-cycle planning and thaw coordination.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Legal Disclaimer */}
        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>A Quick Note:</strong> The job market and salary data discussed here are based on current industry trends and research, but things move quickly! Always verify specific role requirements, compensation, and certification necessities directly with the hiring clinic or organizations like ASRM and SART.
          </p>
        </section>
      </div>
    </>
  )
}