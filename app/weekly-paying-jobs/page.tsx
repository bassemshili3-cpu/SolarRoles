import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, DollarSign, CheckCircle, Shield, Clock, Users, TrendingUp, FileText, Zap, Star, AlertTriangle } from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'

export const metadata: Metadata = {
  title: 'Weekly Paying Jobs Hiring Now | Get Paid Every Week Starting Immediately',
  description: 'Find 1,000+ jobs that pay weekly near you. Get your paycheck every Friday with positions in warehousing, construction, healthcare, delivery, and more. No waiting two weeks. Apply today and start earning fast!',
  keywords: 'weekly paying jobs, jobs that pay weekly, weekly pay jobs hiring now, get paid weekly, jobs with weekly paycheck, weekly pay near me, jobs that pay every week',
  openGraph: {
    title: 'Weekly Paying Jobs Hiring Now | Get Paid Every Week',
    description: 'Stop waiting two weeks for your paycheck. Browse 1,000+ jobs that pay weekly across warehousing, construction, healthcare, and delivery. Immediate openings available. Apply now!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Weekly Paying Jobs | Get Your Paycheck Every Friday',
    description: 'Find jobs that pay weekly across the US. Warehousing, construction, delivery, healthcare, and more. Immediate openings. Apply today and get paid fast.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/weekly-paying-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Weekly Paying Jobs',
  description: 'Find jobs that pay weekly hiring now across the United States. Browse immediate openings in warehousing, construction, delivery, healthcare, and skilled trades with weekly pay cycles.',
  url: 'https://www.oh-my-job.com/weekly-paying-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Weekly Paying Job Opportunities',
    description: 'Current job listings with weekly pay cycles across multiple industries in the United States',
  },
}

const weeklyPayIndustries = [
  {
    title: 'Warehouse and Logistics',
    description: 'Fulfillment center associates, order pickers, forklift operators, and shipping clerks at companies such as Amazon, UPS, and FedEx commonly receive weekly paychecks',
    icon: Briefcase,
  },
  {
    title: 'Construction and Skilled Trades',
    description: 'General laborers, electricians, plumbers, and HVAC technicians in construction frequently receive weekly pay, particularly on project based or union contracts',
    icon: Zap,
  },
  {
    title: 'Healthcare and Home Health',
    description: 'Home health aides, certified nursing assistants, and per diem hospital staff placed through staffing agencies typically receive weekly direct deposits',
    icon: Shield,
  },
  {
    title: 'Delivery and Transportation',
    description: 'Delivery drivers, CDL truck drivers, and courier services including regional carriers and last mile delivery companies commonly offer weekly pay cycles',
    icon: TrendingUp,
  },
  {
    title: 'Manufacturing and Assembly',
    description: 'Production line workers, machine operators, and quality control technicians at manufacturing plants frequently receive weekly wages, especially through temp to hire contracts',
    icon: Star,
  },
  {
    title: 'Staffing Agency Placements',
    description: 'Workers placed through staffing agencies such as Kelly Services, Adecco, and Manpower are typically paid weekly regardless of the industry or role they are assigned to',
    icon: Users,
  },
]

const payFrequencyData = [
  { frequency: 'Weekly', description: 'Paid every 7 days, typically every Friday', share: '~33% of US workers', bestFor: 'Hourly and blue collar roles' },
  { frequency: 'Biweekly', description: 'Paid every 14 days, 26 paychecks per year', share: '~43% of US workers', bestFor: 'Salaried and professional roles' },
  { frequency: 'Semimonthly', description: 'Paid twice per month, 24 paychecks per year', share: '~19% of US workers', bestFor: 'Office and administrative roles' },
  { frequency: 'Monthly', description: 'Paid once per month, 12 paychecks per year', share: '~5% of US workers', bestFor: 'Executive and contract roles' },
]

const salaryData = [
  { role: 'Warehouse Associate (Weekly Pay)', low: '$15/hr', high: '$22/hr', median: '$18/hr' },
  { role: 'Construction Laborer (Weekly Pay)', low: '$17/hr', high: '$28/hr', median: '$22/hr' },
  { role: 'Home Health Aide (Weekly Pay)', low: '$13/hr', high: '$20/hr', median: '$16/hr' },
  { role: 'Delivery Driver (Weekly Pay)', low: '$18/hr', high: '$30/hr', median: '$23/hr' },
  { role: 'CDL Truck Driver (Weekly Pay)', low: '$22/hr', high: '$38/hr', median: '$29/hr' },
  { role: 'Manufacturing Operator (Weekly Pay)', low: '$16/hr', high: '$26/hr', median: '$20/hr' },
]

const topEmployers = [
  { name: 'Amazon', type: 'Warehouse and Fulfillment', positions: 'Fulfillment Associate, Delivery Driver, Sortation Associate' },
  { name: 'UPS', type: 'Package Delivery', positions: 'Package Handler, Driver Helper, Delivery Driver' },
  { name: 'FedEx Ground', type: 'Logistics', positions: 'Package Handler, Delivery Driver, Dock Worker' },
  { name: 'Kelly Services', type: 'Staffing Agency', positions: 'All industries including manufacturing, warehouse, and office roles' },
  { name: 'Adecco', type: 'Staffing Agency', positions: 'Light industrial, healthcare, clerical, and logistics placements' },
  { name: 'XPO Logistics', type: 'Freight and Transportation', positions: 'CDL Driver, Dock Worker, Warehouse Associate' },
]

const flsaPayRules = [
  {
    rule: 'Minimum Pay Frequency',
    detail: 'According to the U.S. Department of Labor, the Fair Labor Standards Act (FLSA) does not specify how often employees must be paid, but it does require that pay periods be regular and predictable. State laws set specific minimum pay frequency requirements, and many states require at least semi-monthly pay for most workers.',
  },
  {
    rule: 'State Weekly Pay Laws',
    detail: 'Several states including Massachusetts, Connecticut, New Hampshire, and Rhode Island require most employers to pay manual workers on a weekly basis by state law. According to the U.S. Department of Labor, workers should check their state labor department for the specific pay frequency requirements that apply to their occupation.',
  },
  {
    rule: 'Overtime and Weekly Pay',
    detail: 'According to the U.S. Department of Labor, the FLSA requires that overtime pay for hours worked over 40 in a workweek be paid on the regular payday for the period in which the overtime was worked. Weekly pay cycles make overtime calculations straightforward and transparent for workers.',
  },
  {
    rule: 'Direct Deposit Rights',
    detail: 'According to the U.S. Department of Labor, employers may require direct deposit as a condition of employment as long as the employee can access their wages without cost. Workers receiving weekly pay via direct deposit typically have access to their funds on Friday mornings or by end of business.',
  },
]

const faqs = [
  {
    question: 'What does weekly pay mean?',
    answer: 'Weekly pay means your employer processes payroll every seven days and you receive your wages once per week, typically on a Friday. According to the U.S. Bureau of Labor Statistics National Compensation Survey, approximately one third of American workers are paid on a weekly basis. Weekly pay is most common in industries such as construction, warehousing, manufacturing, and healthcare staffing.',
  },
  {
    question: 'Is weekly pay better than biweekly pay?',
    answer: 'Whether weekly pay is better depends on your personal financial situation. According to the U.S. Consumer Financial Protection Bureau, more frequent pay cycles can help workers manage cash flow, cover recurring weekly expenses such as groceries and transportation, and reduce reliance on high interest credit products between paychecks. Many workers living paycheck to paycheck particularly benefit from weekly pay schedules.',
  },
  {
    question: 'Which industries are most likely to offer weekly pay?',
    answer: 'According to the U.S. Bureau of Labor Statistics National Compensation Survey, weekly pay is most prevalent in construction, natural resources, and maintenance occupations, where approximately 50 to 60 percent of workers are paid weekly. Manufacturing, transportation, and healthcare support roles are also commonly paid on weekly cycles, particularly when workers are placed through staffing agencies.',
  },
  {
    question: 'Can I negotiate for weekly pay?',
    answer: 'Yes, in some cases. While pay frequency is often dictated by company policy or state law, workers in hourly positions and those working through staffing agencies may have more flexibility to request or negotiate weekly pay arrangements. According to the U.S. Department of Labor, the key legal requirement is that the pay frequency be regular, consistent, and in compliance with applicable state pay day laws.',
  },
  {
    question: 'Do staffing agencies always pay weekly?',
    answer: 'Most major staffing agencies in the United States pay their temporary and contract workers on a weekly basis. This is one of the primary reasons many workers seek placements through agencies such as Adecco, Kelly Services, Manpower, and Robert Half, even when the underlying employer might otherwise pay biweekly. Weekly pay is a standard feature of temporary staffing arrangements and is typically disclosed upfront in your assignment paperwork.',
  },
  {
    question: 'Are taxes different if I am paid weekly?',
    answer: 'Your total annual tax liability is not affected by how frequently you are paid. However, according to the Internal Revenue Service, employers use payroll withholding tables that are calibrated to the pay period frequency, meaning weekly paychecks will have a proportionally smaller withholding amount per check than a biweekly paycheck covering the same pay. Your total withholding over the year should be equivalent regardless of whether you are paid weekly or biweekly.',
  },
]

const tips = [
  {
    title: 'Filter Specifically for Weekly Pay in Your Search',
    description: 'When applying to jobs, explicitly ask about pay frequency during the screening call or interview. Many job postings do not list pay cycle information, but recruiters and hiring managers can confirm it quickly. Searching for roles through staffing agencies is one of the most reliable ways to secure weekly pay.',
  },
  {
    title: 'Target Staffing Agency Placements',
    description: 'Staffing agencies are the most consistent source of weekly pay in the US job market. Registering with agencies such as Adecco, Kelly Services, Manpower, or Randstad gives you access to a large volume of placements that almost always come with weekly direct deposit payroll.',
  },
  {
    title: 'Prioritize Industries With High Weekly Pay Rates',
    description: 'Construction, warehousing, manufacturing, and home health aide roles are statistically the most likely to offer weekly pay according to the U.S. Bureau of Labor Statistics National Compensation Survey. Focusing your job search on these industries increases your chances of finding a weekly pay position quickly.',
  },
  {
    title: 'Confirm Direct Deposit Setup Before Day One',
    description: 'To receive your first weekly paycheck without delay, bring your bank account and routing numbers to onboarding or complete your direct deposit setup as early as possible. Many employers require one full pay cycle before your direct deposit activates, meaning your first check may arrive as a paper check.',
  },
]

export default async function WeeklyPayingJobsPage({ searchParams }: any) {
  const params = await searchParams

  const [{ count }, initialData] = await Promise.all([
    getCachedJobCount(params.what || 'weekly paying jobs', params.where || '', params.salary_min),
    searchJobs({ what: params.what || 'weekly paying jobs', where: params.where || '', results_per_page: 30, page: 1 })
     .then((data: AdzunaSearchResult) => ({ ...data, results: data.results.map(normalizeAdzuna) })),
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
            Weekly Paying Jobs Available Now Across the United States
          </h1>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="weekly paying jobs" />
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
                what={params.what || 'weekly paying jobs'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Industries With Weekly Pay */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Industries That Commonly Offer Weekly Pay</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics National Compensation Survey, weekly pay is most prevalent in blue collar, hourly, and trade occupations. The following industries represent the most consistent sources of weekly pay jobs in the United States.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weeklyPayIndustries.map((industry, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <industry.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{industry.title}</h3>
                <p className="text-gray-600 text-sm">{industry.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pay Frequency Comparison */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Pay Frequency Options: How Weekly Pay Compares</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics National Compensation Survey, employers in the United States use four main pay frequency schedules. Understanding the differences helps workers evaluate job offers and negotiate preferred payment arrangements.
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 font-semibold text-gray-900">Frequency</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-900">Schedule</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-900">Share of Workers</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-900">Most Common For</th>
                </tr>
              </thead>
              <tbody>
                {payFrequencyData.map((row, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index === 0 ? 'bg-green-50' : ''}`}
                  >
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {row.frequency}
                      {index === 0 && (
                        <span className="ml-2 inline-block text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">This page</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{row.description}</td>
                    <td className="px-6 py-4 text-center text-gray-700 font-medium">{row.share}</td>
                    <td className="px-6 py-4 text-gray-600">{row.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Source: U.S. Bureau of Labor Statistics, National Compensation Survey, Employee Benefits in the United States.
          </p>
        </section>

        {/* Salary Data */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Typical Hourly Wages for Weekly Paying Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Bureau of Labor Statistics Occupational Employment and Wage Statistics (OEWS) program, the following hourly wage ranges are representative of roles most commonly associated with weekly pay cycles in the United States.
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 font-semibold text-gray-900">Role</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-900">Low End</th>
                  <th className="text-center px-6 py-4 font-semibold text-green-700">Median</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-900">High End</th>
                </tr>
              </thead>
              <tbody>
                {salaryData.map((row, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{row.role}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{row.low}</td>
                    <td className="px-6 py-4 text-center font-bold text-green-600">{row.median}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{row.high}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics. Hourly figures are approximate national ranges and may vary by location, employer, and experience level.
          </p>
        </section>

        {/* Top Employers */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Top Employers Known for Weekly Pay</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The following employers and staffing agencies are well known for offering weekly pay cycles to their hourly and contract workers in the United States.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {topEmployers.map((employer, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{employer.name}</p>
                <span className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full mb-2">{employer.type}</span>
                <p className="text-gray-600 text-sm">{employer.positions}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FLSA and State Pay Laws */}
        <section className="mt-20">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Federal and State Laws Governing Pay Frequency</h2>
                <p className="text-gray-700 mb-5">
                  Pay frequency in the United States is regulated at both the federal and state levels. Understanding these rules helps workers know their rights and hold employers accountable for timely, regular payment of wages.
                </p>
                <div className="space-y-4">
                  {flsaPayRules.map((item, index) => (
                    <div key={index} className="bg-white rounded-xl p-5">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">{item.rule}</p>
                          <p className="text-gray-600 text-sm">{item.detail}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Source: U.S. Department of Labor, Wage and Hour Division. Fair Labor Standards Act (FLSA).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Financial Benefits */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-teal-600" />
            <h2 className="text-2xl font-bold text-gray-900">Financial Benefits of Working a Weekly Pay Job</h2>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Consumer Financial Protection Bureau, financial stress is one of the leading sources of workplace distraction and absenteeism in the United States. More frequent pay cycles directly address this by giving workers faster access to the wages they have already earned.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: DollarSign, title: 'Better Cash Flow', desc: 'Cover weekly expenses like groceries and gas without waiting 14+ days' },
                { icon: Shield, title: 'Reduced Debt Risk', desc: 'Less need to rely on credit cards or payday loans between pay cycles' },
                { icon: CheckCircle, title: 'Faster Overtime Access', desc: 'Weekly overtime pay means you see premium pay sooner after working it' },
                { icon: Star, title: 'Transparent Earnings', desc: 'Easier to track your income week by week and spot payroll errors quickly' },
              ].map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-5 text-center">
                  <item.icon className="w-8 h-8 text-teal-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 text-sm mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Tips */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-7 h-7 text-rose-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Finding and Landing a Weekly Paying Job</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {tips.map((tip, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-rose-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-rose-100 text-rose-700 font-bold rounded-full text-sm mb-4">
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
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Weekly Paying Jobs</h2>
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
            <strong>Disclaimer:</strong> The pay frequency statistics, wage figures, and legal information cited on this page are sourced from publicly available reports by the U.S. Bureau of Labor Statistics, the U.S. Department of Labor, the U.S. Consumer Financial Protection Bureau, and the Internal Revenue Service. Actual pay frequencies, wages, and employer policies may vary. State pay day laws differ and workers should verify requirements with their state labor department. Oh My Job is an independent job search platform that aggregates listings from third party sources. Always verify pay frequency, compensation, and employment terms directly with the hiring employer before accepting any offer.
          </p>
        </section>
      </div>
    </>
  )
}