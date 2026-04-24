import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
import {
  Briefcase,
  DollarSign,
  CheckCircle,
  Users,
  GraduationCap,
  TrendingUp,
  Shield,
  Star,
  Building2,
  FileText,
} from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Chase Bank Jobs — Teller, Banker, Tech & Management Openings Near You',
  description:
    'Search chase bank jobs in retail branches, wealth management, software engineering, and corporate operations. Filter by role, location, and salary — new listings refreshed daily.',
  keywords:
    'chase bank jobs, chase bank teller hiring, JPMorgan Chase careers, chase personal banker openings, chase bank software engineer, chase branch manager salary, chase bank apply online',
  openGraph: {
    title: 'Chase Bank Jobs: Branch, Tech & Corporate Roles Hiring Now | Oh My Job',
    description:
      'Browse chase bank jobs from entry-level teller to VP-level management. Compare pay, benefits, and location before you apply — thousands of openings across all 50 states.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chase Bank Jobs — Updated Listings Across Every Division',
    description:
      'Retail banking, wealth advisory, cybersecurity, operations — find the chase bank jobs that match your skill set and apply in minutes.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/chase-bank-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Chase Bank Jobs Board',
  description:
    'Daily-refreshed feed of chase bank jobs spanning retail branches, corporate offices, technology hubs, and remote-eligible positions across the United States.',
  url: 'https://www.oh-my-job.com/chase-bank-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Current Chase Bank Job Openings',
    description: 'Searchable directory of chase bank jobs from teller-level entry points to senior director and engineering leadership roles at JPMorgan Chase & Co.',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What divisions hire the most people for chase bank jobs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Retail banking (tellers, personal bankers, branch managers) accounts for the largest share of chase bank jobs by volume because the network spans nearly 4,800 branches. Technology is the second-largest hiring pool — JPMorgan Chase employs over 55,000 technologists globally. Wealth management, commercial banking, and corporate functions round out the remaining openings.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does it take to get hired at Chase Bank?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Branch-level chase bank jobs typically move fastest — many candidates go from application to first day in two to three weeks. Corporate, technology, and management roles take longer, generally four to six weeks, because they involve multiple interview rounds, technical assessments, and more detailed background verification.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need a finance degree to work at Chase Bank?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Not for most positions. Teller and personal-banker roles require a high school diploma and strong customer-service instincts. Technology roles prioritize demonstrable coding or engineering skills over any specific degree. Finance, accounting, or business degrees become important primarily for wealth-advisory, credit-analyst, and investment-banking tracks.',
      },
    },
    {
      '@type': 'Question',
      name: 'What benefits come with chase bank jobs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Full-time employees receive medical, dental, and vision coverage from day one, a 401(k) with company match, tuition reimbursement up to $5,250 per year, paid parental leave, employee banking perks like waived fees and rate discounts, wellness stipends, and access to internal career-mobility programs. Part-time branch employees qualify for a subset of these benefits after meeting minimum hour thresholds.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Chase Bank hire people with no prior banking experience?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Entry-level chase bank jobs such as teller, customer-service associate, and retail banker are explicitly designed for candidates without banking backgrounds. Chase also runs structured internship, analyst, and apprenticeship pipelines for students and career changers looking to enter financial services for the first time.',
      },
    },
  ],
}

const jobCategories = [
  {
    title: 'Retail Branch Banking',
    description: 'Staff the front line at nearly 4,800 US locations — processing transactions, opening accounts, resolving service issues, and cross-selling products to walk-in and drive-thru customers.',
    icon: Building2,
  },
  {
    title: 'Wealth Management & Advisory',
    description: 'Build and manage portfolios for high-net-worth individuals and families, delivering investment guidance, retirement planning, and trust-administration services under the J.P. Morgan brand.',
    icon: TrendingUp,
  },
  {
    title: 'Technology & Cybersecurity',
    description: 'Write the code behind Chase Mobile, harden payment infrastructure against fraud, and build the machine-learning models that power real-time transaction monitoring for 80+ million digital customers.',
    icon: Shield,
  },
  {
    title: 'Operations, Risk & Compliance',
    description: 'Keep the institution running within regulatory guardrails — managing BSA/AML reviews, operational-risk assessments, audit responses, and process-improvement initiatives across business lines.',
    icon: Briefcase,
  },
  {
    title: 'Commercial & Business Banking',
    description: 'Serve mid-market companies and small-business owners with credit facilities, treasury products, merchant services, and deposit solutions tailored to their cash-flow cycles.',
    icon: DollarSign,
  },
  {
    title: 'Corporate Functions & Marketing',
    description: 'Support the enterprise from the inside — recruiting talent, managing employer branding, running data-driven marketing campaigns, and overseeing the people-operations infrastructure of a 300,000-person firm.',
    icon: Users,
  },
]

const hiringSteps = [
  {
    step: 'Find and Apply',
    detail: 'Search openings by keyword, location, or division. Submit your application through the Chase careers portal or through a listing on this page — both routes feed into the same applicant-tracking system.',
  },
  {
    step: 'Recruiter Screen',
    detail: 'A talent-acquisition specialist reviews your profile against the role requirements and, if there is a match, schedules a 15-to-20-minute phone call to confirm salary expectations, availability, and basic qualifications.',
  },
  {
    step: 'Interview Rounds',
    detail: 'Branch roles typically involve one in-person conversation with the hiring manager. Corporate and tech positions add a second or third round — often a panel interview, a behavioral deep-dive using the STAR framework, or a live coding exercise.',
  },
  {
    step: 'Background Check & Offer',
    detail: 'Chase runs a multi-layered background review covering criminal history, credit, and employment verification — standard for any FDIC-regulated employer. Once cleared, you receive a written offer with salary, benefits, and your start date.',
  },
]

const salaryRanges = [
  { role: 'Bank Teller', range: '$17 – $23/hr' },
  { role: 'Personal Banker', range: '$48,000 – $68,000/yr' },
  { role: 'Branch Manager', range: '$78,000 – $115,000/yr' },
  { role: 'Financial Advisor (J.P. Morgan)', range: '$75,000 – $140,000/yr' },
  { role: 'Software Engineer', range: '$115,000 – $185,000/yr' },
  { role: 'Data Analyst / Scientist', range: '$70,000 – $120,000/yr' },
]

const benefits = [
  'Medical, dental, and vision coverage effective on your start date',
  '401(k) with dollar-for-dollar employer match on the first 5% of contributions',
  'Paid time off plus 11 company-observed holidays per year',
  'Up to 16 weeks of paid parental leave for birth and adoptive parents',
  'Tuition reimbursement capped at $5,250 annually for approved programs',
  'Employee banking perks: waived checking fees, discounted mortgage rates, and credit-card rewards boosts',
  'Wellness reimbursement for gym memberships, fitness classes, and mental-health apps',
  'Internal mobility platform with thousands of open reqs posted to employees before the public',
]

const tips = [
  {
    title: 'Match Your Resume to the Specific Division',
    description:
      'A branch-teller resume should lead with cash-handling volume and customer-satisfaction metrics. A tech resume should spotlight languages, frameworks, and system-scale numbers. Chase recruiters screen by division — a generic "banking professional" resume gets filtered out fast.',
  },
  {
    title: 'Know the Business Before the Interview',
    description:
      'Read Chase\'s most recent annual letter to shareholders and skim quarterly earnings highlights. Referencing a specific initiative — like the planned branch expansion into new states or the firm\'s AI investment strategy — signals that your interest goes beyond the paycheck.',
  },
  {
    title: 'Prepare STAR Stories With Numbers',
    description:
      'Chase interviewers evaluate behavioral answers on structure and impact. "I resolved 40+ customer escalations per month with a 95% first-call resolution rate" lands harder than "I\'m a great problem solver." Quantify everything you can.',
  },
  {
    title: 'Apply to Early-Career Programs If You Qualify',
    description:
      'Chase runs analyst, associate, and apprenticeship tracks with structured rotations, dedicated mentors, and accelerated promotion timelines. If you are within two years of graduation or changing careers, these pipelines offer faster advancement than applying to individual job postings.',
  },
]

const faqs = [
  {
    question: 'Which divisions post the most chase bank jobs?',
    answer:
      'Retail banking generates the highest volume of openings because Chase operates nearly 4,800 branches and experiences natural turnover in teller and personal-banker seats. Technology is the second-largest hiring area — JPMorgan Chase employs upwards of 55,000 technologists and continues to grow that number. Wealth management, commercial banking, and back-office operations fill out the remainder.',
  },
  {
    question: 'How quickly can I start working after I apply?',
    answer:
      'Branch-level chase bank jobs move fast — application to first day on the floor can happen inside of three weeks. Corporate, technology, and management roles typically take four to six weeks because they involve additional interview rounds and, in some cases, FINRA registration or security-clearance verification on top of the standard background check.',
  },
  {
    question: 'Is a finance degree required for chase bank jobs?',
    answer:
      'No. Teller and personal-banker positions ask for a high school diploma and customer-service aptitude. Software-engineering roles care about your coding ability, not your major. A finance, accounting, or economics degree becomes relevant mainly for wealth-advisory, credit-underwriting, and investment-banking tracks where regulatory licensing (Series 7, Series 66, CFA) comes into play.',
  },
  {
    question: 'What does the benefits package look like for full-time employees?',
    answer:
      'Full-time hires receive medical, dental, and vision coverage from day one, a 401(k) with a 5% company match, up to 16 weeks of paid parental leave, $5,250 annual tuition reimbursement, employee banking discounts on mortgages and checking accounts, wellness stipends, and access to an internal job-mobility platform. Part-time branch staff qualify for a scaled-down version of these benefits once they meet weekly-hour thresholds.',
  },
  {
    question: 'Can I get hired at Chase with no prior banking or finance experience?',
    answer:
      'Absolutely. Entry-level chase bank jobs — teller, customer-service representative, retail banker — are built as on-ramps for people coming from retail, hospitality, food service, or any customer-facing background. Chase also runs formal apprenticeship and early-career analyst programs specifically designed to bring career-changers and recent graduates into the financial-services industry with structured training.',
  },
]

export default async function ChaseBankJobsPage({ searchParams }: any) {
  const params = await searchParams

 const [{ count }, initialData] = await Promise.all([
  getMergedJobCount(params.what || 'chase bank', params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
  searchMergedJobs({ what: params.what || 'chase bank', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
])


  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Simple Header */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Chase Bank Jobs — Branch, Technology, Wealth & Corporate Openings Nationwide
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="chase bank" />
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
                what={params.what || 'chase bank'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* About Chase as Employer */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Why Chase Bank Jobs Attract 300,000+ Employees</h2>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-4">
              Chase is the consumer-facing arm of JPMorgan Chase & Co., a firm that has ranked inside the top five of the Fortune 500 for over a decade. The scale is hard to overstate: nearly 4,800 branches, more than 80 million digitally active customers, and a technology budget that rivals most standalone software companies. That combination of physical reach and digital ambition creates a hiring engine that posts thousands of new chase bank jobs every month — from a part-time teller in a suburban strip mall to a principal machine-learning engineer in the firm's Manhattan tech hub.
            </p>
            <p className="text-gray-700 mb-4">
              What makes the employer stand out beyond sheer size is its investment in internal mobility. Chase publicly reports that a significant share of its management seats are filled from within, and the company's internal job board gives current employees first access to open requisitions before they go public. For candidates weighing chase bank jobs against other financial-services employers, that promote-from-within track record is one of the clearest differentiators.
            </p>
            <p className="text-gray-700">
              The Bureau of Labor Statistics projects steady employment growth in financial activities through 2032, and Chase's ongoing branch-expansion plans into states like Ohio, Pennsylvania, and the Carolinas are adding net-new positions to markets that historically had limited JPMorgan Chase presence.
            </p>
          </div>
        </section>

        {/* Job Categories */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Six Job Families Inside Chase Bank</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Chase bank jobs span six broad divisions, each with its own skill requirements, compensation structure, and promotion timeline. Understanding which family your background maps to is the fastest way to narrow your search and write a resume that actually clears the ATS.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobCategories.map((cat, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <cat.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{cat.title}</h3>
                <p className="text-gray-600 text-sm">{cat.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Salary Ranges */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">What Chase Bank Jobs Pay by Position</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              Pay at Chase varies by division, metro area, and internal leveling. Branch roles are compensated hourly with performance incentives tied to account openings and customer-satisfaction scores. Corporate and tech roles carry annual salaries that widen considerably at senior levels due to stock-based compensation and annual bonuses. The ranges below reflect national medians from BLS data cross-referenced with employer-reported figures — treat them as a benchmark, not a ceiling.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {salaryRanges.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-5 text-center border border-green-100">
                  <p className="text-xl font-bold text-green-600 mb-1">{item.range}</p>
                  <p className="text-sm text-gray-600">{item.role}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Ranges reflect base compensation only. Many chase bank jobs include variable pay — branch-performance bonuses, wealth-AUM incentives, or engineering stock grants — that can add 10-30% on top of base at mid-to-senior levels.
            </p>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Star className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Benefits That Come With Chase Bank Jobs</h2>
              <p className="text-gray-700 mb-6">
                JPMorgan Chase structures its benefits to retain employees across career stages — from a 22-year-old teller opening their first 401(k) to a senior engineer negotiating parental leave. The package below applies to full-time hires; part-time branch staff access a scaled version after meeting weekly-hour minimums.
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Hiring Process */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">How the Hiring Pipeline Works for Chase Bank Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Chase runs a structured recruitment process that is faster for branch roles and more involved for corporate or regulated positions. Knowing the steps in advance lets you prep the right documents and references before the recruiter asks — shaving days off the overall timeline.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {hiringSteps.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 font-bold rounded-full text-sm mb-4">
                  {index + 1}
                </span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.step}</h3>
                <p className="text-gray-600 text-sm">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Qualifications Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">What Chase Actually Requires — Entry-Level vs. Professional</h2>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              Qualification bars shift dramatically depending on the division you are targeting. Branch-side chase bank jobs are designed as true entry points — you can start with a GED and no banking background. Professional tracks in wealth advisory, risk, or technology expect domain credentials or demonstrable project experience. Here is where the lines fall.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">For Teller & Retail Banker Roles</h3>
                <ul className="space-y-3 text-gray-600 text-sm">
                  {[
                    'High school diploma or GED — no college degree needed',
                    'Any customer-facing experience: retail, food service, hospitality all count',
                    'Comfort handling cash and reconciling a drawer at shift end',
                    'Consistent attendance record — branch managers prioritize reliability above almost everything else',
                    'Basic proficiency with a computer and willingness to learn Chase\'s internal systems on the job',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">For Corporate, Tech & Advisory Roles</h3>
                <ul className="space-y-3 text-gray-600 text-sm">
                  {[
                    'Bachelor\'s degree in a relevant field — or equivalent professional experience for engineering roles',
                    'FINRA licenses (Series 6/7/63/66) or willingness to obtain within 120 days for wealth-advisory seats',
                    'Demonstrated track record in client management, financial modeling, or software delivery',
                    'Ability to pass an enhanced background check including credit review (FDIC requirement for banking employees)',
                    'Professional certifications valued: CFA, CFP, PMP, AWS, or CISSP depending on the function',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900">Four Moves That Improve Your Odds on Chase Bank Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Chase receives millions of applications per year. The candidates who advance past the ATS and into interview rooms do a few things differently — here is what separates a callback from silence.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {tips.map((tip, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-colors"
              >
                <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-700 font-bold rounded-full text-sm mb-4">
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
            <Shield className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Chase Bank Jobs — Questions Applicants Ask Most</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Straight answers to the five questions that come up most often when people start researching chase bank jobs for the first time.
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
                <div className="px-6 pb-6 text-gray-600">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>

        {/* Legal Disclaimer */}
        <section className="mt-20 border-t border-gray-200 pt-10 space-y-4">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> Salary ranges, hiring timelines, and benefit details on this page are compiled from BLS Occupational Employment & Wage Statistics, publicly available JPMorgan Chase disclosures, and employer-reported data. Actual compensation, role requirements, and benefits eligibility for chase bank jobs are determined solely by JPMorgan Chase & Co. and may change at any time. Always verify details directly with the recruiter or on the official JPMorgan Chase careers portal before making employment decisions.
          </p>
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Affiliation notice:</strong> Oh My Job is an independent job search platform with no corporate affiliation to JPMorgan Chase & Co., Chase Bank, or any of their subsidiaries. All trademarks and brand names referenced on this page belong to their respective owners.
          </p>
        </section>
      </div>
    </>
  )
}