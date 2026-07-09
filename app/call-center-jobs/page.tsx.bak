import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Shield, DollarSign, AlertTriangle, Phone, Headphones, TrendingUp, Home } from 'lucide-react'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Call Center Jobs Hiring Now | Remote & On-Site Across All 50 States',
  description: 'Remote and on-site call center roles paying $15–$30/hr. Inbound support, outbound sales, healthcare, and tech lines — no degree required.',
  keywords: 'call center jobs, call center jobs hiring, remote call center jobs, work from home call center, customer service call center jobs, call center representative jobs 2026',
  openGraph: {
    title: 'Call Center Jobs | Remote & On-Site Positions Hiring Now',
    description: 'Thousands of call center positions open across the US. Remote options in 40+ states. No degree required. Apply today.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Call Center Jobs 2026 | $15 to $30/hr, Remote Available',
    description: 'Browse call center positions. Inbound, outbound, tech support, sales. Many work from home. No degree required.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/call-center-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Call Center Jobs',
  description: 'Find call center jobs hiring across the United States. Remote and in-office positions available.',
  url: 'https://www.oh-my-job.com/call-center-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Call Center Jobs',
    description: 'Current call center and customer service representative job listings',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How much do call center jobs pay in 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'General inbound customer service roles pay $15 to $20 per hour. Technical support and specialized lines pay $18 to $28 per hour. Sales roles with commission can reach $55,000 to $85,000 annually. Bilingual agents earn 10% to 15% more than monolingual counterparts across all role types.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can you work from home in a call center job?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. A large share of call center positions are now fully remote. Most require a quiet workspace, a hardwired internet connection with minimum 100 Mbps download speed, and a computer meeting employer specifications. Some companies provide all equipment while others require you to use your own.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you need experience to get a call center job?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most entry-level positions require no prior experience. A high school diploma or GED is the standard requirement. Companies provide paid training lasting 1 to 4 weeks covering phone systems, CRM software, product knowledge, and call handling procedures.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between inbound and outbound call center jobs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Inbound agents answer calls from customers reaching out for help or to make a purchase. Outbound agents make calls to prospects or existing customers for sales, surveys, or collections. Inbound roles tend to be less stressful with lower turnover. Outbound sales roles offer higher earning potential through commissions.',
      },
    },
  ],
}

/* ─── SECTION DATA ──────────────────────────────────────────── */

const callCenterTypes = [
  {
    type: 'Inbound Customer Service',
    pay: '$15 to $20/hr',
    description: 'You answer the phone when customers call with questions, complaints, or requests. The calls come to you. Your job is to resolve the issue on that call or route it to someone who can. This is the most common entry point into call center work and the role with the lowest rejection rate because the customers are the ones who chose to call. The downside is that some percentage of those customers are angry before you pick up, and your metrics (average handle time, first call resolution, customer satisfaction score) are tracked on every interaction.',
    bestFor: 'People who prefer structured work with clear procedures and dislike cold calling',
  },
  {
    type: 'Outbound Sales',
    pay: '$14 to $18/hr base + commission ($45K to $85K OTE)',
    description: 'You call people. Some are warm leads who requested information. Some are cold prospects pulled from a list. Your job is to pitch, overcome objections, and close. The base pay is often lower than inbound roles, but the commission structure means your earning ceiling is dramatically higher. A strong outbound sales agent at an insurance company or SaaS vendor can out-earn their manager within the first year. The trade-off is the psychological weight of daily rejection: even the best closers hear "no" 70% to 80% of the time.',
    bestFor: 'People who are competitive, resilient to rejection, and motivated by uncapped earning potential',
  },
  {
    type: 'Technical Support',
    pay: '$18 to $28/hr',
    description: 'You troubleshoot problems with software, hardware, or services over the phone. The calls are inbound, but the skill required is higher than general customer service because you need to diagnose issues in real time using decision trees, remote access tools, and product-specific knowledge. Tier 1 support handles basic resets and known issues. Tier 2 handles escalations that require deeper investigation. Companies that handle enterprise clients or regulated industries (healthcare IT, financial platforms) pay the most.',
    bestFor: 'Problem solvers who enjoy technology and want higher pay without transitioning to sales',
  },
  {
    type: 'Healthcare and Insurance Lines',
    pay: '$17 to $26/hr',
    description: 'You handle calls related to insurance claims, benefits explanations, appointment scheduling, prior authorizations, or patient billing. These roles pay more than general customer service because HIPAA compliance is required, the information you handle is sensitive, and errors have regulatory consequences. Many healthcare call centers require you to obtain a certification or complete compliance training before you take live calls. Insurance lines that involve sales (Medicare Advantage enrollment, P&C quoting) add commission on top of the hourly rate.',
    bestFor: 'Detail-oriented people who can handle sensitive information accurately and want a path into healthcare administration',
  },
  {
    type: 'Collections',
    pay: '$15 to $22/hr + bonus',
    description: 'You contact people who owe money. The goal is to negotiate payment arrangements, recover outstanding balances, and maintain compliance with the Fair Debt Collection Practices Act. The work is emotionally demanding because the people on the other end of the call are often in financial distress, and the conversation is inherently adversarial. The pay includes a base plus a performance bonus tied to recovery rates. Top collectors at agencies handling medical debt or credit card portfolios earn $50,000 to $70,000 with bonuses. The burnout rate is high, but the earning potential for people who can handle the pressure is real.',
    bestFor: 'People with thick skin, strong negotiation instincts, and comfort with difficult conversations',
  },
]

const remoteVsOnSite = [
  { category: 'Commute', remote: 'None. Your commute is 15 seconds from your bed to your desk.', onSite: 'Depends on location. Average call center commute: 20 to 40 minutes.' },
  { category: 'Equipment', remote: 'Some employers ship a full setup. Others require your own PC. Hardwired internet (100+ Mbps) is almost always mandatory.', onSite: 'Everything provided. Desk, phone, headset, computer, monitors.' },
  { category: 'Monitoring', remote: 'Screen recording, keystroke tracking, webcam spot-checks, and random call monitoring are standard. You are observed more intensely than in an office.', onSite: 'Supervisor walks the floor. Call monitoring happens but visual surveillance is less invasive.' },
  { category: 'Schedule flexibility', remote: 'Some remote roles offer split shifts or flexible start times. Others lock you into a fixed window. Ask before accepting.', onSite: 'Fixed shifts assigned by seniority. Less negotiation room.' },
  { category: 'Career visibility', remote: 'Harder to get promoted when management never sees you in person. You need to actively advocate for yourself.', onSite: 'Easier to build relationships with supervisors and get noticed for leadership roles.' },
  { category: 'Social isolation', remote: 'Real. You talk to customers all day but have no coworkers physically around you. This is the #1 reason remote agents cite for leaving.', onSite: 'You have coworkers. Breaks are social. The environment is noisy but human.' },
]

const metricsDecoded = [
  {
    metric: 'Average Handle Time (AHT)',
    target: '4 to 8 minutes (varies by line)',
    reality: 'AHT measures the total time from when you pick up the call to when you finish the after-call work (notes, disposition codes, follow-up tasks). A low AHT means you process calls fast. But rushing customers to hit your AHT target creates poor experiences and tanks your satisfaction scores. The best agents learn to be efficient without being abrupt, which is a skill that takes 3 to 6 months to develop.',
  },
  {
    metric: 'First Call Resolution (FCR)',
    target: '70% to 85%',
    reality: 'FCR tracks whether the customer had to call back about the same issue. A high FCR means you solved the problem the first time. This is the metric that most directly correlates with customer satisfaction and the one managers value most during performance reviews. Some issues genuinely cannot be resolved in one call (backorders, escalations, system limitations), and those still count against your FCR.',
  },
  {
    metric: 'Customer Satisfaction (CSAT)',
    target: '85% to 95% positive',
    reality: 'After the call, the customer receives a survey. Your CSAT score is the percentage of customers who rated the interaction positively. The uncomfortable truth is that CSAT measures the customer\'s mood as much as your performance. A customer who was angry before calling will often give a low score regardless of what you did. Managing your CSAT means understanding which calls to invest extra empathy in and which to handle efficiently.',
  },
  {
    metric: 'Schedule Adherence',
    target: '95%+ (logged in and available when scheduled)',
    reality: 'Adherence measures whether you are at your station, logged in, and available to take calls during your scheduled hours. Every minute you are in "not ready" status is tracked. A 95% adherence target across an 8-hour shift means roughly 24 minutes of unscheduled off-phone time for the entire day. This is the metric that feels most like surveillance, and the one that drives the most frustration among new agents.',
  },
]

const whatNobodyTells = [
  {
    title: 'The Emotional Labor Is the Job',
    detail: 'You will be yelled at by people who are frustrated with a company, not with you. Your role is to absorb that frustration, remain calm, and solve the problem while the customer vents. This is not an occasional occurrence. It is a daily reality on most customer service lines. The agents who last are the ones who develop the ability to separate the caller\'s anger from their own emotional state. This skill is learnable, but no amount of training fully prepares you for the first time a customer says something genuinely cruel.',
  },
  {
    title: 'Your Bathroom Breaks Are Tracked',
    detail: 'Call centers run on schedule adherence. If you are supposed to be on the phone from 9:00 to 10:15 and you log out at 9:47 for a bathroom break, that 4-minute absence is recorded and counted against your adherence metric. Most centers build in scheduled breaks (a 15-minute morning break, a 30-minute lunch, and a 15-minute afternoon break), and the expectation is that personal needs are handled during those windows. The rigidity is the most commonly cited reason new agents quit within the first 90 days.',
  },
  {
    title: 'The Promotion Path Is Real but Narrow',
    detail: 'Call centers have a defined ladder: agent to senior agent to team lead to supervisor to operations manager to center director. The pay increases are meaningful (team leads earn $40K to $55K, supervisors $50K to $70K, operations managers $65K to $90K). The catch is that there are 20 to 50 agents for every team lead position and 4 to 8 team leads for every supervisor role. Promotion timelines average 12 to 24 months per level for top performers. Patience and consistent metrics are the currency.',
  },
  {
    title: 'The Bilingual Premium Is Underpriced',
    detail: 'If you speak Spanish and English fluently, you are worth 10% to 20% more than a monolingual agent doing the same job. That premium is baked into the hourly rate at most companies. What is less obvious is that bilingual agents also have faster promotion timelines because bilingual team leads and supervisors are even rarer than bilingual agents. If you are bilingual and considering call center work, lead with that skill on your application. It changes the math of every offer you receive.',
  },
]

const homeSetup = [
  {
    requirement: 'Dedicated workspace',
    detail: 'A room with a door that closes, or at minimum a workspace where background noise (children, pets, television, roommates) will not be audible on customer calls. Quality assurance teams listen to random calls, and background noise results in coaching or corrective action.',
  },
  {
    requirement: 'Hardwired internet',
    detail: 'Minimum 100 Mbps download, 20 Mbps upload. Must be cable, fiber, or DSL. Satellite internet (Starlink, HughesNet) and mobile hotspots are rejected by virtually every employer due to latency issues that cause call quality degradation. Test your speeds at speedtest.net before applying.',
  },
  {
    requirement: 'Computer specifications',
    detail: 'Requirements vary by employer but typically include Windows 10 or later, 8GB+ RAM, and a wired Ethernet connection (not Wi-Fi). Some employers ship a dedicated workstation. Others require you to use your own PC and run a system check during onboarding. Macs are not accepted at many call centers due to software compatibility.',
  },
  {
    requirement: 'USB headset with noise-canceling microphone',
    detail: 'Some employers provide one. Others expect you to purchase your own ($30 to $80 for a quality option). Wireless headsets are sometimes prohibited due to connection reliability concerns. A good noise-canceling mic is not optional: it is what separates a professional call from one that sounds like you are working from a kitchen.',
  },
]

const faqs = [
  {
    question: 'How much do call center jobs pay in 2026?',
    answer: 'General customer service roles pay $15 to $20 per hour. Technical support and healthcare lines pay $18 to $28 per hour. Sales roles with commission structures can reach $55,000 to $85,000 annually for top performers. Bilingual agents earn 10% to 15% more across all role types. Remote and on-site positions pay similarly at most companies.',
  },
  {
    question: 'Can you work from home in a call center job?',
    answer: 'Yes. A large share of call center positions are now fully remote. Requirements include a quiet dedicated workspace, hardwired internet with minimum 100 Mbps download speed, and a computer meeting employer specifications. Some companies provide all equipment. Others require your own. Satellite and mobile internet are not accepted by most employers.',
  },
  {
    question: 'Do you need experience or a degree?',
    answer: 'No degree is required for most call center positions. A high school diploma or GED is the standard requirement. Prior customer service or retail experience helps but is not mandatory. Companies provide paid training lasting 1 to 4 weeks that covers phone systems, CRM software, product knowledge, and call handling procedures.',
  },
  {
    question: 'What is the difference between inbound and outbound call center work?',
    answer: 'Inbound agents answer calls from customers seeking help or information. The calls come to you. Outbound agents initiate calls to prospects or customers for sales, surveys, or collections. Inbound roles are generally less stressful with lower turnover. Outbound sales roles offer higher earning potential through commissions but involve significantly more rejection.',
  },
  {
    question: 'What is the hardest part of call center work?',
    answer: 'The emotional labor of handling frustrated or angry callers while maintaining composure and meeting performance metrics. The schedule rigidity (bathroom breaks tracked, adherence measured to the minute) is the second most cited challenge. Both are manageable with practice but are the primary reasons turnover in the industry runs between 30% and 45% annually.',
  },
  {
    question: 'How do I move up from an entry-level call center position?',
    answer: 'The standard path is agent to senior agent (6 to 12 months) to team lead (12 to 24 months after that) to supervisor to operations manager. Promotion is driven by consistent performance metrics (handle time, satisfaction scores, adherence), reliability, and willingness to take on additional responsibilities like training new agents or handling escalated calls.',
  },
]

export default async function CallCenterJobsPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'Call center', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'Call center', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
  ])


  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {count > 0 ? count.toLocaleString('en-US') : ''} Call Center Jobs Available Across the United States
          </h1>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="call center" />
          </aside>
          <div className="flex-1">
            <AIJobMatcherWrapper />
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList what={params.what || 'call center'} where={params.where || ''} salary_min={params.salary_min} initialData={initialData} />
            </Suspense>
          </div>
        </div>

        {/* ── FIVE TYPES OF CALL CENTER WORK ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Phone className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Five Types of Call Center Work and What Each One Actually Pays</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            "Call center job" is a label that covers roles as different as answering billing questions and selling life insurance to strangers. The pay, the stress level, and the career trajectory vary dramatically depending on which type of line you work.
          </p>
          <div className="space-y-4">
            {callCenterTypes.map((type, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h3 className="font-bold text-gray-900 text-lg">{type.type}</h3>
                  <span className="text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">{type.pay}</span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{type.description}</p>
                <p className="text-xs text-blue-700 font-medium">Best for: {type.bestFor}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── REMOTE vs ON-SITE ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Home className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Remote vs. On-Site Call Center Work: The Honest Comparison</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Remote call center work eliminates the commute but introduces trade-offs that job postings do not mention. Here is what each setting actually looks like day to day.
          </p>
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 gap-px bg-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="bg-white px-5 py-3">Factor</div>
              <div className="bg-white px-5 py-3">Remote / Work From Home</div>
              <div className="bg-white px-5 py-3">On-Site / Office</div>
            </div>
            {remoteVsOnSite.map((row, i) => (
              <div key={i} className="grid grid-cols-3 gap-px bg-gray-100">
                <div className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-5 py-4 text-sm font-medium text-gray-800`}>{row.category}</div>
                <div className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-5 py-4 text-sm text-gray-600`}>{row.remote}</div>
                <div className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-5 py-4 text-sm text-gray-500`}>{row.onSite}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── METRICS DECODED ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">The Four Metrics That Determine Your Performance Review and Your Job Security</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Call center performance is measured with surgical precision. Every call, every minute, every interaction generates data your manager reviews weekly. Understanding what is tracked and what "good" looks like gives you a head start over agents who learn this on the job.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {metricsDecoded.map((item, i) => (
              <div key={i} className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{item.metric}</h3>
                  <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Target: {item.target}</span>
                </div>
                <p className="text-gray-600 text-sm">{item.reality}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── WHAT NOBODY TELLS YOU ── */}
        <section className="mt-20">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What Nobody Tells You Before Your First Day on the Phones</h2>
                <p className="text-gray-700 mb-6">
                  Call center job postings emphasize flexibility, competitive pay, and career growth. They leave out the parts that cause 30% to 45% annual turnover. Knowing these in advance puts you ahead of every other new hire in your training class.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  {whatNobodyTells.map((item, i) => (
                    <div key={i} className="bg-white rounded-lg p-5">
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOME OFFICE SETUP ── */}
        <section className="mt-20">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <Headphones className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">The Home Office Setup You Need Before Applying to a Remote Call Center Job</h2>
                <p className="text-gray-700 mb-6">
                  Remote call center employers run a technical check during onboarding. If your setup does not pass, the offer is rescinded. Get these in place before you apply, not after.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {homeSetup.map((item, i) => (
                    <div key={i} className="bg-white rounded-lg p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 font-bold rounded-full text-xs">{i + 1}</span>
                        <h3 className="font-semibold text-gray-900 text-sm">{item.requirement}</h3>
                      </div>
                      <p className="text-gray-600 text-sm">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Call Center Jobs</h2>
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
            <strong>Disclaimer:</strong> Oh My Job is an independent job search platform and is not affiliated with any call center operator, BPO provider, or employer. Job listings are sourced from third-party APIs and may not reflect all current openings. Salary figures are estimates based on industry data and may vary by employer, location, and role type. Work-from-home requirements vary by company. This page is for informational purposes only.
          </p>
        </section>
      </div>
    </>
  )
}