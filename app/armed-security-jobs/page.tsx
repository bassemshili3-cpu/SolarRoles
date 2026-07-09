import { Suspense } from 'react'
import type { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import {
  Briefcase,
  Clock,
  Shield,
  FileText,
  DollarSign,
  MapPin,
  CheckCircle,
  BookOpen,
  Users,
} from 'lucide-react'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600

type SearchValue = string | string[] | undefined

type RawSearchParams = {
  what?: SearchValue
  where?: SearchValue
  salary_min?: SearchValue
}

type PageProps = {
  searchParams: Promise<RawSearchParams> | RawSearchParams
}

const canonicalUrl = 'https://www.oh-my-job.com/armed-security-jobs'

const getSingleValue = (value: SearchValue): string | undefined => {
  if (Array.isArray(value)) return value[0]
  return value
}

const parseOptionalNumber = (value: SearchValue): number | undefined => {
  const single = getSingleValue(value)?.trim()
  if (!single) return undefined
  const parsed = Number(single)
  return Number.isFinite(parsed) ? parsed : undefined
}

export const metadata: Metadata = {
  title: 'Armed Security Jobs | Licensed Roles Hiring Nationwide',
  description:
    'Armed security roles at hospitals, campuses, and patrol sites — state permit required. Pay bands and licensing tier noted per job.',
  keywords:
    'armed security jobs, armed security officer jobs, armed security guard jobs, armed guard jobs, hospital armed security jobs, executive protection jobs',
  openGraph: {
    title: 'Armed Security Jobs | Search Licensed Roles Nationwide',
    description:
      'Explore armed security jobs across the United States with live openings, pay guidance, role comparisons, and practical licensing insight.',
    type: 'website',
    url: canonicalUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Armed Security Jobs | Search Licensed Roles Nationwide',
    description:
      'Find armed security jobs, compare pay, understand licensing, and discover what employers look for before they interview candidates.',
  },
  alternates: {
    canonical: canonicalUrl,
  },
}

// ─── HIRING SIGNALS ───────────────────────────────────────────────────────────
// Fully rewritten — previous version used generic phrasing that matched
// common industry content on police1.com and thebalancemoney.com.
const hiringSignals = [
  {
    title: 'License status front and center',
    description:
      'Recruiters often filter on permit validity before reading anything else. An active, state-issued armed credential with a clear expiration date moves an application past the first cut. A vague mention of "in process" rarely does.',
    icon: Shield,
  },
  {
    title: 'Incident documentation that holds up',
    description:
      'Armed posts generate paperwork — use-of-force logs, trespass records, shift handover notes. Supervisors and clients both rely on these being accurate. Candidates who can show they write reports that don\'t need to be rewritten tend to stand out.',
    icon: FileText,
  },
  {
    title: 'Working knowledge of site tech',
    description:
      'Most modern posts mix foot patrol with some level of system monitoring. Knowing how to log badge exceptions, pull clips from a DVR, or reset an access point after a fault is increasingly expected — not a bonus.',
    icon: BookOpen,
  },
  {
    title: 'Schedule that actually fits the post',
    description:
      'Overnight and weekend slots are the hardest to fill consistently. Candidates who state explicitly that they can cover those windows — and follow through — tend to get placed faster than better-credentialed applicants who are only available during business hours.',
    icon: Clock,
  },
]

// ─── POPULAR ROLES ────────────────────────────────────────────────────────────
// Fully rewritten — previous version used phrases and structures found
// verbatim on several security career sites.
const popularRoles = [
  {
    title: 'Armed Security Officer',
    description:
      'The most common title in the field. Responsibilities shift significantly depending on site type — a warehouse post looks nothing like a hospital assignment. Most openings are full-time, require state licensure, and expect candidates who can handle long stationary shifts without losing focus.',
    icon: Shield,
  },
  {
    title: 'Hospital and Clinic Security',
    description:
      'Emergency departments and behavioral health units are the hardest environments in this category. Officers here interact with patients in crisis, frustrated family members, and clinical staff simultaneously. De-escalation matters more than intimidation — employers in healthcare are explicit about this.',
    icon: Users,
  },
  {
    title: 'Place of Worship Security',
    description:
      'Demand for this role has grown significantly over the past several years. The challenge is balancing a welcoming presence with genuine readiness. Most congregations want officers who blend into the environment rather than dominate it. Prior community outreach or volunteer experience can be as relevant as tactical training.',
    icon: MapPin,
  },
  {
    title: 'Federal and Critical Infrastructure',
    description:
      'Government and utility site posts often have the most detailed post orders of any assignment. Officers are expected to follow them precisely, document everything, and escalate through the right channels rather than improvise. Security clearance may be required depending on the facility.',
    icon: Briefcase,
  },
  {
    title: 'Cash Transport and ATM Service',
    description:
      'Route work is different from static guard work. Officers move constantly, work with technicians who are focused on their own tasks, and need to maintain situational awareness across changing environments. Physical stamina and vehicle comfort matter here.',
    icon: DollarSign,
  },
  {
    title: 'Executive Protection',
    description:
      'The gap between what this role looks like in job listings and what it actually requires is significant. Most legitimate EP work is logistical, repetitive, and requires a professional appearance at all times. Candidates who come from dignitary protection, law enforcement escort details, or prior corporate security backgrounds are the strongest fits.',
    icon: Briefcase,
  },
]

// ─── OUTLOOK STATS ────────────────────────────────────────────────────────────
// Source data unchanged (BLS); phrasing around the stats is original.
const outlookStats = [
  { label: 'Median Annual Pay', value: '$38,370', note: 'BLS May 2024' },
  { label: 'Average Annual Openings', value: '162,300', note: 'BLS each year' },
  { label: 'Job Outlook', value: 'Steady', note: '2024 to 2034 BLS' },
]

// ─── SALARY BREAKDOWN ─────────────────────────────────────────────────────────
// BLS figures kept (public data). The surrounding text is original.
const salaryBreakdown = [
  { level: 'Security guard median annual pay', amount: '$38,370', source: 'BLS May 2024' },
  { level: 'Security guard mean hourly pay', amount: '$18.46', source: 'BLS May 2024' },
  { level: 'Armed security market range', amount: '$21 to $25+', source: 'Common market range' },
]

// ─── LICENSING EXAMPLES ───────────────────────────────────────────────────────
// Fully rewritten — previous version had phrasing that closely mirrored
// content found on thebalancemoney.com and online.hilbert.edu about state
// licensing pathways.
const licensingExamples = [
  {
    state: 'Texas',
    title: 'Level III commissioned officer',
    description:
      'Texas runs one of the more structured armed pathways. The Level III designation requires completing a specific training curriculum approved by DPS, passing a written exam, and qualifying at the range. Employers hiring in Texas know exactly what this credential means — showing up with it already in hand shortens the onboarding process considerably.',
    source: 'Texas DPS, Private Security Program',
  },
  {
    state: 'Florida',
    title: 'Class G statewide firearms license',
    description:
      'Florida separates unarmed (Class D) from armed (Class G) licensing. The Class G adds firearms training and range qualification on top of the base requirements. Some employers in Florida will start the Class D paperwork before offering an armed post — so having the G already sorted removes a common bottleneck.',
    source: 'Florida DBPR licensing guidance',
  },
  {
    state: 'California',
    title: 'BSIS guard registration + firearms permit',
    description:
      'California requires both a base guard registration and a separate BSIS-issued firearms permit to work armed. The psychological evaluation requirement for the firearms permit catches some applicants off guard. Processing times in California run longer than most other states — budget extra time if you\'re new to the state.',
    source: 'California Bureau of Security and Investigative Services',
  },
]

// ─── FAQS ─────────────────────────────────────────────────────────────────────
// Fully rewritten — previous version included answers that matched phrasing
// found on police1.com and online.hilbert.edu.
const faqs = [
  {
    question: 'What does the day-to-day work actually look like?',
    answer:
      "It depends heavily on the post. A static hospital assignment involves a lot of public interaction, de-escalation, and documentation. A remote warehouse post might be mostly perimeter checks, gate logs, and solo hours. A transport route is entirely different again. The title 'armed security officer' covers a wider range of actual work than most people expect going in.",
  },
  {
    question: 'Is a military or law enforcement background required?',
    answer:
      "No, but it helps in specific contexts. Federal sites and executive protection roles will often prioritize applicants with prior service. Hospital and retail-adjacent security is more likely to value communication skills and composure over tactical background. If you don't have military or LE experience, focus on what you do have — incident documentation, public-facing roles, or any prior security work at any level.",
  },
  {
    question: 'What actually makes one application stronger than another?',
    answer:
      "Three things consistently come up: license status is current and clearly stated, the resume reflects experience relevant to the specific post type, and availability covers the shifts the site actually needs. Generic applications that could apply to any security job tend to get skipped in favor of ones that show the candidate has read the posting.",
  },
  {
    question: 'Why is the pay range so wide?',
    answer:
      "State laws, union agreements, shift differentials, and site risk all pull in different directions. An overnight armed post at a federal facility in California will pay very differently from a daytime armed post at a small office park in the Midwest. The BLS median is a useful baseline — actual armed market rates typically run higher than the broad security guard average because of the added licensing requirement and liability.",
  },
  {
    question: 'Can I apply before my permit is active?',
    answer:
      "You can, and for some employers it's fine — especially if you're early in the licensing process and the role won't start immediately. The practical reality is that most hiring teams rank licensed candidates first when the roster is tight. If your permit is pending, say so clearly and give a realistic timeline rather than leaving it vague.",
  },
  {
    question: "Why doesn't my license transfer automatically between states?",
    answer:
      "Because armed security is regulated at the state level, not federally. Each state sets its own training standards, permit categories, and background check requirements. A Texas Level III doesn't automatically satisfy Florida's Class G requirements, even though both cover armed security work. If you're moving or applying across state lines, assume you'll need to meet the new state's process from scratch.",
  },
]

// ─── TIPS ─────────────────────────────────────────────────────────────────────
// Rewritten — previous version used generic resume advice that appeared
// across multiple career sites including thebalancemoney.com.
const tips = [
  {
    title: 'Lead with your permit, not your job title',
    description:
      'The first thing a recruiter checks for an armed role is whether you hold the right credential in the right state. Make it easy — put the permit name, issuing state, and expiration date in the header or summary of your resume, not buried in a certifications section at the bottom.',
  },
  {
    title: 'Write for the post, not for the industry',
    description:
      "A hospital security resume and a federal site resume should not look the same. Pull the language from the actual job posting and reflect it in your bullets. If the posting mentions behavioral health units, patient interaction, or de-escalation — and you have that experience — say so explicitly. Don't make the recruiter infer it.",
  },
  {
    title: 'Replace adjectives with incidents',
    description:
      '"Reliable and detail-oriented" appears on every application. "Logged 340 incident-free shifts across two hospital posts over 18 months" does not. Wherever you can swap a personality claim for a concrete example — a specific post, a documented outcome, a measurable stretch of time — do it.',
  },
  {
    title: 'Say what shifts you can actually work',
    description:
      "Coverage gaps drive a lot of urgent hiring in this field. If you're available for nights, weekends, or on-call coverage, list it explicitly. Recruiters filling hard-to-staff slots will prioritize a candidate who names the availability over one who's more qualified but silent on scheduling.",
  },
]

const collectionPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Armed Security Jobs',
  description:
    'Search armed security jobs across the United States and learn how pay, licensing, and job type vary by post.',
  url: canonicalUrl,
  inLanguage: 'en-US',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Types of Armed Security Jobs',
    itemListElement: popularRoles.map((role, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: role.title,
    })),
  },
}

const faqPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
}

const structuredData = [collectionPageJsonLd, faqPageJsonLd]

export default async function ArmedSecurityJobsPage({ searchParams }: PageProps) {
  const params = await Promise.resolve(searchParams)


    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'Armed Security', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'Armed Security', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Armed Security Jobs Hiring Now Across the United States
          </h1>
          <p className="text-gray-600 max-w-4xl">
            Armed security work ranges from hospital emergency departments and federal facilities
            to executive protection and cash transport routes. The credential requirements, daily
            work, and pay differ significantly by post type and state. Search live openings below
            — and use the guidance on this page to understand what actually gets candidates hired.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat={getSingleValue(params.what) || 'Armed Security'} />
          </aside>

          <div className="flex-1">
            {typeof count === 'number' && count > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">{count.toLocaleString('en-US')}</span> live
                positions found
              </p>
            )}

            

           <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
  <InfiniteJobList
    what={getSingleValue(params.what) || 'Armed Security'}
    where={getSingleValue(params.where) || ''}
    salary_min={getSingleValue(params.salary_min)}
    initialData={initialData}
  />
</Suspense>
          </div>
        </div>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-7 h-7 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              What Employers Notice First in Armed Security Jobs
            </h2>
          </div>

          <p className="text-gray-600 mb-6 max-w-4xl">
            Most armed security postings list the same requirements. What actually separates
            shortlisted candidates is usually more specific — it comes down to a few signals that
            tell a recruiter the applicant is ready for the post, not just the category.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {hiringSignals.map((signal, index) => {
              const Icon = signal.icon
              return (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <Icon className="w-9 h-9 text-indigo-600 mb-4" />
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">{signal.title}</h3>
                  <p className="text-gray-600 text-sm">{signal.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Job Outlook for Armed Security Jobs
            </h2>
          </div>

          <p className="text-gray-600 mb-6 max-w-4xl">
            This is a high-turnover field. The large number of annual openings isn't driven by
            explosive growth — it's driven by churn. That's actually useful to understand as a
            candidate: persistent demand means hiring is ongoing, but it also means employers have
            seen a lot of unreliable people. Showing up consistently is a competitive advantage.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            {outlookStats.map((stat, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-md transition-shadow"
              >
                <p className="text-4xl font-bold text-blue-600 mb-1">{stat.value}</p>
                <p className="font-semibold text-gray-900 mb-1">{stat.label}</p>
                <p className="text-sm text-gray-500">{stat.note}</p>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Source: U.S. Bureau of Labor Statistics, Security Guards and Gambling Surveillance
            Officers
          </p>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Armed Security Jobs</h2>
          </div>

          <p className="text-gray-600 mb-6 max-w-4xl">
            The title is the same but the work isn't. Site environment shapes everything — the
            pace, the public interaction, the documentation requirements, and what employers
            actually value in a candidate. Applying by environment rather than just by title makes
            a material difference.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularRoles.map((role, index) => {
              const Icon = role.icon
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                >
                  <Icon className="w-10 h-10 text-green-600 mb-4" />
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">{role.title}</h3>
                  <p className="text-gray-600 text-sm">{role.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-900">Salary Guide for Armed Security Jobs</h2>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6 max-w-4xl">
              The broad security guard median is the most widely cited figure, but armed roles
              typically pay above it. The licensing requirement, added liability, and stricter
              background screening all push rates higher — particularly on overnight shifts,
              federal posts, and any assignment that carries a formal use-of-force policy.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {salaryBreakdown.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-5 text-center">
                  <p className="text-3xl font-bold text-emerald-600 mb-2">{item.amount}</p>
                  <p className="font-semibold text-gray-900 text-sm mb-1">{item.level}</p>
                  <p className="text-xs text-gray-500">{item.source}</p>
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-500 mt-6">
              Executive protection, federal facility work, and transport routes typically command
              the highest rates in this category. State and city also matter — California and
              New York tend to run higher than the national median.
            </p>
          </div>
        </section>

        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />

            <div className="w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Licensing and Requirements for Armed Security Jobs
              </h2>

              <p className="text-gray-700 mb-6 max-w-4xl">
                There is no federal armed security license. Every state runs its own program, sets
                its own training hours, and defines its own permit categories. What this means
                practically: your credential from one state does not transfer automatically to
                another, and the job title can be the same while the compliance path is completely
                different.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    What employers generally screen for
                  </h3>

                  <ul className="text-gray-600 text-sm space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      A current, state-issued armed permit or documented progress toward one
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Clean background check — felonies and most violent misdemeanors are
                      disqualifying in every state
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Availability that actually covers the post schedule being filled
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Prior experience relevant to the site type, even if not in an armed role
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Common reasons applications don't advance
                  </h3>

                  <ul className="text-gray-600 text-sm space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      Permit listed without state, expiration, or current status — looks
                      unverified
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      Resume is too generic — nothing in it signals fit for the specific post
                      type
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      Availability doesn't cover the shift — especially overnight and weekend
                      gaps
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      Out-of-state permit with no acknowledgment of local licensing requirements
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-semibold text-gray-900 text-lg mb-4">
                  How three major states handle armed licensing
                </h3>

                <div className="grid lg:grid-cols-3 gap-6">
                  {licensingExamples.map((item) => (
                    <div key={item.state} className="bg-white rounded-xl p-6 border border-blue-100">
                      <p className="text-sm font-semibold text-blue-600 mb-2">{item.state}</p>
                      <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                      <p className="text-xs text-gray-500">{item.source}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Tips for Getting Hired Faster in Armed Security Jobs
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {tips.map((tip, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors"
              >
                <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 font-bold rounded-full text-sm mb-4">
                  {index + 1}
                </span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{tip.title}</h3>
                <p className="text-gray-600 text-sm">{tip.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Frequently Asked Questions About Armed Security Jobs
            </h2>
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </summary>

                <div className="px-6 pb-6 text-gray-600">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> This page is for general informational purposes only and
            does not replace legal, licensing, or employer specific guidance. Armed security jobs,
            pay, training, and permit rules vary by state and by client site. Always confirm the
            latest requirements with the relevant state authority before applying or carrying on
            duty.
          </p>
        </section>
      </div>
    </>
  )
}