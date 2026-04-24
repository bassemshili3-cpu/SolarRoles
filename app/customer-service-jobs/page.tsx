import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
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
  Headphones,
  Users,
} from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Customer Service Jobs Hiring Now | Apply Today',
  description:
    'Browse customer service jobs open right now across the US. Remote, hybrid, and on-site roles at companies hiring immediately. Entry-level to senior positions. Filter by pay, location, and shift type.',
  keywords:
    'customer service jobs, customer service jobs near me, customer service representative jobs, remote customer service jobs, call center jobs, customer support jobs hiring now, entry level customer service jobs',
  openGraph: {
    title: 'Customer Service Jobs Hiring Now | Find Openings Near You',
    description:
      'Customer service positions available today. Remote and on-site options across retail, tech, healthcare, and finance. Apply in minutes.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Customer Service Jobs | Hundreds of Openings Right Now',
    description:
      'Find customer service roles hiring immediately. No degree required for most positions. Remote-friendly. Competitive pay.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/customer-service-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Customer Service Jobs',
  description:
    'Find customer service jobs hiring near you. Browse hundreds of openings at call centers, retail companies, banks, tech firms, and more across the United States.',
  url: 'https://www.oh-my-job.com/customer-service-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Customer Service Jobs',
    description: 'Current customer service job listings across the United States',
  },
}

const customerServiceRoles = [
  {
    title: 'Customer Service Representative',
    description:
      'The default entry point for most people. You answer phones, respond to emails, and resolve issues. The role teaches you how to stay calm when someone is upset, how to navigate internal systems under pressure, and how to turn a complaint into a save. Every other role on this list builds on what you learn here.',
    icon: Headphones,
  },
  {
    title: 'Call Center Agent',
    description:
      'Higher volume, tighter metrics. Call centers track your average handle time, first-call resolution rate, and customer satisfaction score after every interaction. The pace is intense, but the structure is clear: you know exactly what is expected and exactly how you are performing at all times.',
    icon: Headphones,
  },
  {
    title: 'Remote Customer Support Specialist',
    description:
      'Same responsibilities as an on-site rep, minus the commute. You work from home handling tickets, chats, or calls through a company-provided laptop. The catch is that remote roles attract more applicants, so the hiring bar tends to be slightly higher. Reliable internet and a quiet workspace are non-negotiable.',
    icon: Briefcase,
  },
  {
    title: 'Technical Support Representative',
    description:
      'This is where customer service meets problem-solving. You walk people through software bugs, hardware failures, and configuration issues. You do not need a computer science degree, but you do need the patience to explain a reboot sequence to someone who is already frustrated. Pay is noticeably higher than standard CSR roles.',
    icon: Award,
  },
  {
    title: 'Client Success Manager',
    description:
      'Less about fixing problems and more about preventing them. You own a portfolio of accounts and your job is to make sure those clients keep paying. The role blends relationship management with light sales and requires you to understand the product deeply enough to spot opportunities the client has not considered yet.',
    icon: TrendingUp,
  },
  {
    title: 'Retail Customer Service Associate',
    description:
      'Face-to-face service on a sales floor. You handle returns, answer product questions, de-escalate complaints, and occasionally restock shelves between customers. The work is physical and social in a way that phone-based roles are not. Some people love that. Others discover they prefer a headset.',
    icon: Users,
  },
]

const keySkills = [
  {
    skill: 'Active Listening',
    detail:
      'Most customers do not articulate their real problem on the first try. The ability to hear past the frustration and identify what actually needs fixing is what separates adequate reps from the ones who get promoted.',
  },
  {
    skill: 'Clear Communication',
    detail:
      'Saying the right thing in too many words is almost as bad as saying the wrong thing. Whether you are writing an email or explaining a policy over the phone, clarity and brevity reduce callbacks and escalations.',
  },
  {
    skill: 'Problem Solving Under Constraints',
    detail:
      'You rarely have the power to give customers exactly what they want. The skill is finding a resolution that satisfies them within the boundaries your company sets. That middle ground is where the best reps operate.',
  },
  {
    skill: 'Emotional Steadiness',
    detail:
      'You will be yelled at. Not occasionally. Regularly. The people who last in this field are not the ones who do not feel it. They are the ones who feel it and still respond professionally. That is a skill, not a personality trait, and it can be developed.',
  },
  {
    skill: 'CRM and Ticketing Tools',
    detail:
      'Salesforce, Zendesk, Freshdesk, HubSpot, Intercom. You will use at least one of these daily. You do not need to be an expert before you start, but knowing your way around a ticketing dashboard makes your first week dramatically less overwhelming.',
  },
  {
    skill: 'Managing Multiple Conversations',
    detail:
      'Chat support agents routinely handle three to five conversations simultaneously. That requires a specific kind of focus: the ability to context-switch without dropping the thread of any single interaction.',
  },
]

const salaryData = [
  { label: 'Entry-Level Customer Service Rep', range: '$14 to $18/hr' },
  { label: 'Call Center Agent', range: '$15 to $20/hr' },
  { label: 'Remote Customer Support Specialist', range: '$16 to $22/hr' },
  { label: 'Technical Support Representative', range: '$18 to $28/hr' },
  { label: 'Client Success Manager', range: '$50,000 to $85,000/yr' },
  { label: 'Customer Service Team Lead', range: '$20 to $30/hr' },
]

const industryBreakdown = [
  {
    industry: 'Retail and E-Commerce',
    notes: 'The largest hiring pool by volume. Seasonal spikes around Q4 create thousands of temporary roles that frequently convert to permanent positions.',
  },
  {
    industry: 'Banking and Financial Services',
    notes: 'Expect a background check and potentially a credit check. In return, you get above-average pay, strong benefits, and a structured promotion ladder.',
  },
  {
    industry: 'Healthcare',
    notes:
      'Patient-facing service roles and insurance support desks are expanding as the system digitizes. HIPAA awareness is often required but typically taught during onboarding.',
  },
  {
    industry: 'Technology and SaaS',
    notes:
      'Technical support and customer success roles pay the most in this category. Companies invest heavily in onboarding because product knowledge takes time to build.',
  },
  {
    industry: 'Telecommunications',
    notes:
      'High volume, high structure. Telecom companies run some of the most sophisticated training programs in the industry and promote aggressively from within.',
  },
]

const remoteWorkFacts = [
  'Customer service is one of the job categories with the highest share of fully remote positions in the country. Insurance, fintech, and SaaS companies lead the way.',
  'Most remote roles ship you a laptop and headset. Some also provide a monthly stipend for internet. The expectation in return is a dedicated workspace and consistent availability during your scheduled shift.',
  'Remote does not mean flexible hours for most companies. You are typically assigned a fixed schedule, including breaks, and your availability is tracked through the same workforce management tools used in physical call centers.',
  'The legal protections you have as a remote worker are identical to those of on-site employees. Wage laws, anti-discrimination protections, and overtime rules apply regardless of where your desk sits.',
]

const faqs = [
  {
    question: 'What qualifications do I need to get a customer service job?',
    answer:
      'A high school diploma is enough for the majority of entry-level positions. What actually gets you hired is how you communicate during the interview. Employers care far more about your ability to stay composed under pressure and explain things clearly than about your educational background. Some sectors like finance or healthcare layer on additional requirements like background checks or industry-specific training, but those are provided after you are hired.',
  },
  {
    question: 'Are customer service jobs available remotely?',
    answer:
      'Yes, and the number of remote openings has grown substantially since 2020 with no sign of contracting. Insurance companies, SaaS businesses, and e-commerce platforms are the most active remote hirers. Most provide equipment and run their entire onboarding process virtually. Geography matters less than it used to, though some companies still restrict hiring to specific states for tax and compliance reasons.',
  },
  {
    question: 'What is the average salary for a customer service representative?',
    answer:
      'The national median lands around $37,800 per year, but that figure blurs a wide range. A chat support agent at a small e-commerce company might earn $15 an hour while a technical support specialist at a SaaS company in a major metro clears $60,000 or more. The biggest pay levers are industry, technical complexity, and whether the role involves revenue retention or upselling.',
  },
  {
    question: 'Is customer service a dying field because of AI and automation?',
    answer:
      'Chatbots have absorbed a chunk of simple, repetitive inquiries like order tracking and password resets. But every time automation handles the easy questions, the remaining ones that reach a human get harder. Companies still need people who can navigate complex situations, show genuine empathy, and make judgment calls that a script cannot cover. The role is evolving, not disappearing.',
  },
  {
    question: 'Can customer service experience lead to career advancement?',
    answer:
      'It is one of the most reliable on-ramps into a professional career. Customer service teaches you how to communicate under pressure, how to use CRM systems, how to negotiate within constraints, and how to manage difficult personalities. Those skills translate directly into sales, operations, account management, and people leadership. A significant number of operations managers and sales directors started by answering phones.',
  },
  {
    question: 'What rights do I have as a customer service employee?',
    answer:
      'Every right that any other employee has. Federal minimum wage and overtime protections apply. Discrimination based on race, gender, age, disability, or religion is illegal. If you work remotely, those protections follow you home. If your employer asks you to perform work off the clock, such as finishing call notes after your shift ends without pay, that is a wage violation you can report to your state labor board or the federal Department of Labor.',
  },
]

const tips = [
  {
    title: 'Lead Your Resume With Numbers, Not Adjectives',
    description:
      'Every applicant writes "excellent communicator" and "team player." What stands out is specificity: "Handled 80+ inbound calls per shift with a 94% satisfaction rating." Even if your numbers are approximate, they signal that you understand what the job actually measures.',
  },
  {
    title: 'Prepare Three Stories Before the Interview',
    description:
      'Customer service interviews run on scenario questions. "Tell me about a time you dealt with an angry customer." "Describe a situation where you went above and beyond." Have three concrete stories ready, structured as situation, action, result. Rehearse them out loud until they sound natural, not memorized.',
  },
  {
    title: 'Learn One CRM Tool Before You Apply',
    description:
      'Zendesk and Freshdesk both offer free tiers or sandbox environments. Spend two hours clicking around, creating fake tickets, and learning the interface. When your interviewer asks if you have CRM experience, "I taught myself Zendesk last week" is a better answer than "No, but I am a fast learner."',
  },
  {
    title: 'Target Companies That Promote From Within',
    description:
      'Some companies treat customer service as a cost center and staff it with contractors. Others treat it as a talent pipeline and actively promote into sales, operations, and management. Before you apply, check Glassdoor reviews or LinkedIn profiles of current managers at the company. If multiple managers started as reps, that tells you something.',
  },
]

export default async function CustomerServiceJobsPage({ searchParams }: any) {
  const params = await searchParams

  const [{ count }, initialData] = await Promise.all([
  getMergedJobCount(params.what || 'customer service', params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
  searchMergedJobs({ what: params.what || 'customer service', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
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
            Customer Service Jobs Hiring Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="customer service" />
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
                what={params.what || 'customer service'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData}
              />
            </Suspense>
          </div>
        </div>

        {/* Types of Roles */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Headphones className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Customer Service Jobs Available</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Customer service is not one job. It is a category that spans everything from answering phones at a local insurance office to managing a portfolio of enterprise software accounts worth seven figures. The title stays the same but the day-to-day, the pay, and the ceiling look completely different depending on where you land.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customerServiceRoles.map((role, index) => (
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

        {/* Salary Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">How Much Do Customer Service Jobs Pay?</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              The pay gap within customer service is wider than most people realize. An entry-level phone rep at a retail chain and a client success manager at a SaaS company both fall under "customer service" on paper, but the compensation difference can be $40,000 or more. Geography, industry, shift timing, and whether the role involves any form of revenue responsibility are the biggest variables. The figures below reflect ranges currently observed across U.S. job postings.
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
              Ranges are approximate and reflect current market conditions. Actual compensation varies by employer, location, and experience level.
            </p>
          </div>
        </section>

        {/* Key Skills */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-7 h-7 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Skills That Make You Stand Out as a Candidate</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Every job posting lists "strong communication skills" as a requirement, which tells you almost nothing. Here is what actually separates the candidates who get callbacks from the ones who do not.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {keySkills.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{item.skill}</p>
                <p className="text-gray-600 text-sm">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Industries Hiring */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Briefcase className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Industries Actively Hiring Customer Service Professionals</h2>
              <p className="text-gray-700 mb-6">
                Customer service exists in every industry, but the experience of doing it varies enormously depending on the sector. The pace, the tools, the type of customer you interact with, and the upward mobility all change based on where you work. Here is what to expect from the sectors hiring the most right now.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="text-left p-3 font-semibold text-gray-800 rounded-tl-lg">Industry</th>
                      <th className="text-left p-3 font-semibold text-gray-800 rounded-tr-lg">What to Expect</th>
                    </tr>
                  </thead>
                  <tbody>
                    {industryBreakdown.map((row, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                        <td className="p-3 font-medium text-gray-900">{row.industry}</td>
                        <td className="p-3 text-gray-600">{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Remote Work Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Remote Customer Service Jobs: What You Need to Know</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Working from home in customer service sounds like freedom until you realize the metrics are the same, the schedule is fixed, and your manager can see your screen activity in real time. That said, cutting the commute and working in your own space is a genuine quality-of-life upgrade for a lot of people. Here is what the reality looks like.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {remoteWorkFacts.map((fact, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-3 hover:shadow-md transition-shadow">
                <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-600 text-sm">{fact}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Career Growth */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Where Can a Customer Service Job Take You?</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Nobody dreams of answering phones forever. The real value of a customer service role is what it teaches you and where it leads. You learn how a company actually works by sitting at the point where every broken process, confusing policy, and product flaw surfaces first. That knowledge is career capital, and it transfers into roles most people do not associate with customer service.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Team Lead or Supervisor', detail: 'The first promotion most CSRs aim for. You manage a small team, handle escalations, and start learning workforce management.' },
              { title: 'Sales Representative', detail: 'If you can de-escalate a complaint, you can close a deal. Customer service to sales is one of the most common lateral moves in the corporate world.' },
              { title: 'Operations Manager', detail: 'Understanding frontline workflows from the inside gives you credibility that outside hires lack. Many ops managers started by doing the work they now oversee.' },
              { title: 'Account Manager', detail: 'Client-facing, revenue-tied, and relationship-driven. If you enjoy the relationship side of service but want a higher ceiling, account management is the natural next step.' },
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
            <h2 className="text-2xl font-bold text-gray-900">Tips for Getting Hired in Customer Service</h2>
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

        {/* Workers Rights Warning */}
        <section className="mt-20">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Know Your Rights as a Customer Service Worker</h2>
                <p className="text-gray-700 mb-4">
                  Customer service workers are covered by the same federal and state labor protections as every other employee. That includes remote workers. If any of the following are happening at your workplace, you have legal grounds to act.
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    'Being paid below federal or state minimum wage for all hours worked',
                    'Working more than 40 hours per week without receiving overtime compensation',
                    'Being asked to perform tasks off the clock, including post-shift call documentation',
                    'Experiencing hiring or promotion decisions based on race, gender, age, disability, or religion',
                    'Being classified as an independent contractor while working a fixed schedule with company equipment',
                    'Facing retaliation for reporting wage violations or unsafe working conditions',
                    'Being denied legally required breaks during your shift (rules vary by state)',
                    'Having a request for reasonable disability accommodation ignored or denied',
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

        {/* FAQ Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Customer Service Jobs</h2>
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
            <strong>Disclaimer:</strong> The information on this page is for general reference only and does not constitute legal or professional advice. Wage rates, labor protections, and remote work policies vary by state and employer. For current regulations applicable to your situation, consult the U.S. Department of Labor at dol.gov, the Equal Employment Opportunity Commission at eeoc.gov, or your state labor department. Oh My Job is a job search platform and is not responsible for the accuracy of individual job listings.
          </p>
        </section>
      </div>
    </>
  )
}