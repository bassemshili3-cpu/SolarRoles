import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, DollarSign, MapPin, CheckCircle, HardHat, Plane, TrendingUp, ShieldCheck } from 'lucide-react'
import { searchJobs, getCachedJobCount, AdzunaSearchResult } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600

// Liste des keywords qui matchent cette landing page
const FIFO_KEYWORDS = [
  'fifo roster',        
  'fifo rotation',  
  'fifo mining',       
  'fifo oil',         
  'fifo camp',          
]

export const metadata: Metadata = {
  title: 'FIFO Jobs | Fly In Fly Out in Mining, Oil & Gas',
  description: 'Fly-in fly-out positions in mining, oil, gas, and construction — rotation schedules, accommodation details, and pay rates included per role.',
  keywords: 'fifo jobs, fly in fly out jobs, fifo mining jobs, fifo work, fifo positions, fly in fly out mining, fifo oil and gas jobs, remote work fifo',
  openGraph: {
    title: 'FIFO Jobs | Top-Paying Rotational Positions',
    description: 'Find urgent FIFO job openings across the United States. Mining, oil, gas, and construction employers are actively hiring. High pay, flexible rotations, and no relocation required.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FIFO Jobs | Mining, Oil, Gas & Construction Rotations',
    description: 'Ready to earn more with FIFO work? Browse hundreds of fly in fly out jobs paying top wages. Apply now before these positions are filled.',
  },
  alternates: { canonical: 'https://www.oh-my-job.com/fifo-jobs' },
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
    description: "Surface and underground roles — drill and blast operators, shot firers, dump truck drivers, and shift supervisors. Pay premiums are real here, particularly on sites without road access. Most employers run 2/1 or 8/6 rotations, though longer swings exist on newer projects still ramping up.",
    icon: HardHat,
  },
  {
    title: 'Oil & Gas',
    description: "Offshore platform work and onshore rig positions are the bulk of openings. Roustabouts and roughnecks are entry points; experienced derrickmen and toolpushers command significantly higher rates. Offshore rotations are typically 2/2, but that can shift depending on the operator and production phase.",
    icon: TrendingUp,
  },
  {
    title: 'Construction',
    description: "Remote civil and infrastructure builds — pipelines, access roads, mine processing plants — need tradespeople who can handle fly-in logistics and extended stints away. Concrete workers, riggers, scaffolders, and crane operators are consistently in demand. These projects often pay site allowances on top of base rates.",
    icon: Briefcase,
  },
  {
    title: 'Camp Services',
    description: "Every large FIFO site needs people to run it — cooks, camp attendants, cleaners, store hands, and logistics coordinators. These roles are often overlooked by applicants chasing the big trade rates, which means less competition and faster hiring. Some catering companies run their own FIFO rosters across multiple sites.",
    icon: MapPin,
  },
  {
    title: 'Engineering & Technical',
    description: "Mechanical and electrical engineers, metallurgists, process control specialists — technical roles on remote sites typically attract salary packages well above what the same title earns in an office. Most positions require relevant qualifications and prior site exposure. Some employers offer graduate placements with FIFO arrangements from year one.",
    icon: ShieldCheck,
  },
  {
    title: 'Health & Safety',
    description: "Remote medics, HSE officers, and OHS advisors are required on any site above a certain headcount — and regulations have tightened considerably. Site medic roles in particular are hard to fill, which keeps rates high. Paramedic or nursing backgrounds with industrial experience are the most competitive profiles.",
    icon: CheckCircle,
  },
]

const rotationSchedules = [
  { schedule: '2 weeks on / 1 week off', description: 'The most widely used roster in Australian-style mining operations that have spread to US remote sites. Tiring over time, but the income-to-days-off ratio is hard to beat.' },
  { schedule: '2 weeks on / 2 weeks off', description: 'Standard in offshore oil and gas. More sustainable for family life — two weeks home is genuinely time off, not just recovery.' },
  { schedule: '4 weeks on / 1 week off', description: 'Common on remote construction projects in early build phases. The 1-week break feels short after a month on site. Usually compensated with higher daily rates.' },
  { schedule: '8 days on / 6 days off', description: 'Popular in surface mining. The shorter swing means more flight cycles but steadier income rhythm. Works well for people within 2–3 hours of a regional airport.' },
  { schedule: '3 weeks on / 3 weeks off', description: 'Preferred by workers with young children or secondary income sources. Found mostly on long-duration infrastructure and LNG projects.' },
]

const faqs = [
  {
    question: 'What does FIFO actually mean in a job context?',
    answer: "FIFO — Fly In Fly Out — is a work arrangement where the employer flies you to a remote site for a fixed roster period, then flies you home for your time off. You don't relocate. Housing and meals on site are covered. The appeal is that your home life stays where it is — your work just happens somewhere else entirely.",
  },
  {
    question: 'How much do FIFO workers actually earn?',
    answer: "It varies more than the headline numbers suggest. Entry roles in camp services or as a laborer might clear $75,000 to $90,000 all-in. Experienced tradespeople — boilermakers, electricians, instrumentation techs — routinely earn $120,000 to $160,000. Engineering and supervisory roles push higher. The numbers look better than comparable city jobs partly because your living costs drop to near zero during on-swing.",
  },
  {
    question: 'Who pays for flights and accommodation?',
    answer: "The employer covers all of it during your rostered on-period — flights from the agreed point of hire, accommodation, and three meals a day. Some employers are strict about the point of hire (meaning they fly you from a specific city, not your actual home). If you live outside that catchment, factor in the travel cost to the departure point.",
  },
  {
    question: 'What do I actually need to get hired?',
    answer: "For entry-level camp services or labouring roles, a White Card (construction safety induction), a valid ID, and a clean medical are often enough to get started. Trades roles need a current ticket. Any site-facing role will require a pre-employment medical — some companies are stricter than others on blood pressure, BMI, and hearing. Get yours done early; it's the most common thing that delays start dates.",
  },
  {
    question: 'Are FIFO workers covered by standard employment law?',
    answer: "Yes. OSHA standards, federal wage protections, and state labor law all apply regardless of how remote the site is. Your employer is still responsible for safe working conditions, PPE, and minimum entitlements. Some FIFO workers are also covered by enterprise agreements that set conditions above the legal minimum — worth checking before you sign.",
  },
  {
    question: 'Is FIFO work sustainable long-term?',
    answer: "For some people, yes — especially those who use the off-swing strategically and keep their finances in order. For others, the relationship and mental health toll adds up over years. Most experienced FIFO workers say the first few rotations are the hardest adjustment. After that, it tends to either click or it doesn't. There's no middle ground after a few years.",
  },
]

const tips = [
  {
    title: 'Book your pre-employment medical before you even apply',
    description: "Almost every FIFO employer requires one, and they don't accept results from your GP. You need to use their approved provider. Wait times can run 2–3 weeks in some areas. Getting this done speculatively — before you have an offer — means you can move fast when one comes through.",
  },
  {
    title: 'Pick your rotation based on your life, not the pay rate',
    description: "A 4/1 roster pays more per year than a 2/2, but spending four weeks straight on a remote site with one week to decompress is brutal if you have kids, a partner, or any life admin to manage. Be honest about what schedule you can actually sustain. Burning out after six months and quitting helps no one.",
  },
  {
    title: 'Stack your certifications before you start looking',
    description: "White Card is the baseline. First aid and CPR push you ahead of unqualified candidates. Working at heights, confined space entry, and forklift tickets each open a different category of role. None of these take long to obtain and most cost under $300. They pay for themselves on the first paycheck.",
  },
  {
    title: 'Understand what "point of hire" actually means',
    description: "Employers fly you from a designated city — Perth, Darwin, Townsville, Houston, depending on the project. If that's not where you live, the travel to get there is usually on you. Some employers are flexible on this and some aren't. Clarify before you accept, not after.",
  },
]
export default async function FifoJobsPage({ searchParams }: any) {
  const params = await searchParams

  // Si l'utilisateur a tapé une recherche custom dans le filtre, on respecte sa requête
  // Sinon, on passe l'array de keywords FIFO pour matcher toutes les variantes seedées
  const whatQuery = params.what || FIFO_KEYWORDS

  const [{ count }, initialData] = await Promise.all([
    getMergedJobCount(whatQuery, params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
    searchMergedJobs({ what: whatQuery, where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Fly In Fly Out Jobs Available Now</h1>
          <p className="text-gray-700">
            FIFO work is one of the fastest ways to earn well without relocating. Mining, oil and gas, remote construction, and camp services are all hiring. Rotations, pay structures, and requirements vary significantly by industry and employer. The listings below are updated regularly.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80"><JobFilters defaultWhat="fifo" /></aside>
          <div className="flex-1">
            {count > 0 && <p className="text-sm text-gray-500 mb-4"><span className="font-semibold text-gray-800">{count.toLocaleString()}</span> positions available</p>}
            <AIJobMatcherWrapper />
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList what={params.what || 'fifo roster'} where={params.where || ''} salary_min={params.salary_min} initialData={initialData} />
            </Suspense>
          </div>
        </div>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><Plane className="w-7 h-7 text-blue-600" /><h2 className="text-2xl font-bold text-gray-900">Industries Hiring FIFO Workers</h2></div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Most people think FIFO means mining. It does — but that's maybe half the picture. Oil and gas, remote construction, and the support services keeping those sites running all hire on fly-in arrangements, often with less competition than the headline mining roles.
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

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><Clock className="w-7 h-7 text-blue-600" /><h2 className="text-2xl font-bold text-gray-900">Common FIFO Rotation Schedules</h2></div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The roster you work matters as much as the pay rate. Some schedules look great on paper and wreck your personal life. Others feel slow but are actually more sustainable over years. Here's what each rotation looks like in practice.
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

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><DollarSign className="w-7 h-7 text-green-600" /><h2 className="text-2xl font-bold text-gray-900">FIFO Job Salary Ranges</h2></div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            These figures reflect total package including allowances, not base rate alone. On-site living costs being covered means take-home income goes further than the same number would in a city role.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-5 text-center border border-gray-200">
              <p className="text-3xl font-bold text-green-600 mb-2">$75K+</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">Entry Level</p>
              <p className="text-xs text-gray-500">Camp services, labouring, general site support</p>
            </div>
            <div className="bg-white rounded-xl p-5 text-center border border-gray-200">
              <p className="text-3xl font-bold text-blue-600 mb-2">$120K+</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">Skilled Trades</p>
              <p className="text-xs text-gray-500">Electricians, boilermakers, instrumentation techs</p>
            </div>
            <div className="bg-white rounded-xl p-5 text-center border border-gray-200">
              <p className="text-3xl font-bold text-purple-600 mb-2">$180K+</p>
              <p className="text-sm font-semibold text-gray-700 mb-1">Engineering & Supervisory</p>
              <p className="text-xs text-gray-500">Process engineers, shift supervisors, project leads</p>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><CheckCircle className="w-7 h-7 text-purple-600" /><h2 className="text-2xl font-bold text-gray-900">Tips for Landing a FIFO Job</h2></div>
          <div className="grid md:grid-cols-2 gap-6">
            {tips.map((tip, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 font-bold rounded-full text-sm mb-4">{index + 1}</span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{tip.title}</h3>
                <p className="text-gray-600 text-sm">{tip.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6"><ShieldCheck className="w-7 h-7 text-blue-600" /><h2 className="text-2xl font-bold text-gray-900">FIFO Job FAQ</h2></div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group bg-white border border-gray-200 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                  <h3 className="font-semibold text-gray-900 pr-4">{faq.question}</h3>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> Salaries, rotations, and employment conditions vary by employer, location, and experience. Verify all details with the hiring company and consult OSHA and the U.S. Department of Labor for regulations applicable to remote and FIFO work.
          </p>
        </section>
      </div>
    </>
  )
}