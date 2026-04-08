import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import { DollarSign, TrendingUp, Briefcase } from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Best Paying Nursing Jobs in 2026 | $85K to $230K by Specialty',
  description: 'Seven nursing specialties ranked by real take-home pay in 2026. From ICU bedside to CRNA autonomy. What each role actually pays, what the path costs, and live openings you can apply to now.',
  keywords: 'best paying nursing jobs 2026, highest paid nurse specialties, CRNA salary, nurse practitioner salary, travel nurse pay, nursing career salary guide',
  openGraph: {
    title: 'Best Paying Nursing Jobs | 2026 Specialty Salary Guide',
    description: 'Seven nursing paths ranked by compensation. Browse openings and apply directly.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Paying Nursing Jobs 2026 | Up to $230K',
    description: 'The nursing specialties where the pay matches the responsibility. Live listings included.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/best-paying-nursing-jobs-2026',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Best Paying Nursing Jobs in 2026',
  description: 'Seven highest-paying nursing specialties in 2026 with salary data and live job listings.',
  url: 'https://www.oh-my-job.com/best-paying-nursing-jobs-2026',
}

const topJobs = [
  {
    rank: 1,
    title: 'Certified Registered Nurse Anesthetist',
    searchTerm: 'nurse anesthetist',
    salary: '$185K to $240K',
    growth: '38%',
    paragraph: 'CRNAs occupy a position in healthcare that is almost impossible to replicate: they perform the same clinical function as physician anesthesiologists in most surgical settings, carry independent practice authority in a growing number of states, and earn a median above $220K with a nursing degree rather than a medical degree. The path is demanding (BSN, minimum two years of ICU experience, then a 3-year doctoral program), but the return on investment is unmatched in nursing. In rural hospitals and ambulatory surgery centers where an anesthesiologist is not on staff, the CRNA is the sole anesthesia provider, which is why the role commands the premium it does. The 38% projected growth rate reflects both an aging surgical population and a nationwide push to expand scope of practice for CRNAs as a cost-effective alternative to physician-led anesthesia teams.',
  },
  {
    rank: 2,
    title: 'Psychiatric Mental Health NP',
    searchTerm: 'psychiatric nurse practitioner',
    salary: '$130K to $180K',
    growth: '40%',
    paragraph: 'The behavioral health workforce shortage is so severe that some counties in the United States have zero psychiatrists. Not a shortage. Zero. PMHNPs are filling that void, and the compensation reflects the urgency. In states with full practice authority, a PMHNP can open an independent practice, prescribe controlled substances, and manage a panel of 100+ patients generating $300K to $500K in annual practice revenue. Even employed PMHNPs at health systems earn $140K to $170K with significantly more schedule control than most medical specialties. The pipeline of new PMHNPs is growing but still cannot keep pace with demand driven by expanded insurance coverage for mental health, post-pandemic anxiety and depression rates, and a cultural shift that has normalized seeking psychiatric care. If you are an RN weighing NP specialties right now, this is the one where the gap between supply and demand is widest.',
  },
  {
    rank: 3,
    title: 'Travel Nurse',
    searchTerm: 'travel nurse',
    salary: '$80K to $150K+ ',
    growth: 'Variable',
    paragraph: 'Travel nursing is not a specialty in the clinical sense. It is a compensation structure, and understanding how that structure works is the key to evaluating whether the numbers in job ads are real. Contracts pay a base hourly rate plus a tax-free housing stipend plus a meals-and-incidentals stipend, and when you combine all three, weekly gross can reach $2,500 to $4,000 depending on location and specialty. The tax-free stipends are the mechanism that makes travel pay appear dramatically higher than staff pay, but they are only tax-free if you maintain a permanent residence (a "tax home") that you actually pay for while on assignment. Nurses who do the math correctly and maintain a tax home can save $50K to $80K per year. Those who do not, or who get audited and cannot document their tax home, face a significant bill. Crisis contracts during acute staffing emergencies pay even more but are unpredictable. The lifestyle trade-off is real: you change cities every 8 to 13 weeks and orient to a new hospital system each time.',
  },
  {
    rank: 4,
    title: 'Family Nurse Practitioner',
    searchTerm: 'family nurse practitioner',
    salary: '$110K to $145K',
    growth: '40%',
    paragraph: 'The FNP is the most broadly trained NP specialty, which makes it the most versatile and, for many, the most practical graduate investment. You can work in primary care, urgent care, retail clinics, occupational health, telehealth, or open your own practice in states with full practice authority. That flexibility is worth more than the salary number alone suggests because it means you are never locked into a single employer or setting. Federal loan repayment programs (NHSC) specifically target NPs in shortage areas, offering up to $50K in loan forgiveness over two years, effectively adding $25K per year to your compensation. The median hovers around $125K, but FNPs who own practices in underserved areas and accept a mix of insurance and cash-pay patients routinely exceed $180K. The 40% growth rate is driven by the same forces across all NP specialties: too many patients, too few primary care providers, and a system that increasingly relies on NPs to close the gap.',
  },
  {
    rank: 5,
    title: 'ICU / Critical Care Nurse',
    searchTerm: 'ICU nurse',
    salary: '$75K to $110K',
    growth: '6%',
    paragraph: 'ICU nursing is the bedside role with the highest compensation floor and the most direct pathway to the two highest-paid positions in the profession (CRNA and acute care NP). Base pay for an experienced ICU nurse ranges from $80K to $100K before differentials, and nurses who pick up overtime or work night shifts routinely exceed $110K. The clinical intensity is significant: you manage ventilators, titrate vasoactive drips, interpret hemodynamic waveforms, and make time-sensitive decisions that directly affect patient survival. That weight is the reason the role pays what it does and the reason it is not for everyone. What most salary articles overlook is that ICU experience is the required prerequisite for CRNA programs, which means every shift you work at the bedside is simultaneously building the clinical hours you need to apply for a $220K career. Two to three years in the ICU followed by a CRNA doctoral program is the single highest-ROI sequence available to any BSN graduate.',
  },
  {
    rank: 6,
    title: 'Certified Nurse Midwife',
    searchTerm: 'nurse midwife',
    salary: '$100K to $140K',
    growth: '35%',
    paragraph: 'Nurse midwifery occupies a unique position in healthcare because the demand for it is driven by patient preference as much as by workforce economics. A growing number of families are choosing midwife-led care specifically because the model emphasizes physiological birth, shared decision making, and longer appointment times, things that the traditional OB-GYN system struggles to offer at scale. CNMs provide prenatal care, attend deliveries, manage postpartum recovery, and offer gynecological care throughout the lifespan. In states with full practice authority, many open independent birth centers that operate outside the hospital system entirely. The median salary sits around $130K, but CNMs who own practices report net income above that depending on patient volume and payer mix. The 35% growth projection is among the highest in nursing, driven by both an aging OB-GYN workforce and expanding Medicaid coverage for midwife-attended births.',
  },
  {
    rank: 7,
    title: 'Nurse Manager',
    searchTerm: 'nurse manager',
    salary: '$85K to $120K',
    growth: '28%',
    paragraph: 'Nurse management is the path for clinicians who realize they want to shape how a unit operates rather than work at the bedside indefinitely. The role involves staffing, scheduling, budgeting, quality metrics, employee relations, and serving as the interface between floor nurses and hospital administration. Pay ranges from $85K to $120K at most facilities, which can actually be less than what a senior staff nurse earns with overtime and differentials, and that is the detail most articles skip. The financial advantage of management is not the immediate salary bump. It is that the role opens a progression into director of nursing ($120K to $160K), VP of patient care services ($150K to $200K), and eventually chief nursing officer ($180K to $300K+), a ladder that bedside nursing does not access regardless of years of experience. If your long-term goal is executive leadership in healthcare, nurse management is the required step that gives you P&L responsibility, committee exposure, and visibility to senior leadership.',
  },
]

async function fetchJobData(searchTerm: string) {
  const [{ count }, data] = await Promise.all([
    getCachedJobCount(searchTerm, '', undefined),
    searchJobs({ what: searchTerm, where: '', results_per_page: 20, page: 1 })
      .then((d: AdzunaSearchResult) => ({ ...d, results: d.results.map(normalizeAdzuna) })),
  ])
  return { count, data }
}

export default async function BestPayingNursingJobsPage() {
  const jobResults = await Promise.all(
    topJobs.map(job => fetchJobData(job.searchTerm))
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-4xl mx-auto px-6 py-16">

        <header className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5">
            Best Paying Nursing Jobs in 2026
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Seven nursing paths ranked by what you actually take home, not what a recruiter puts in the subject line. Each includes the real compensation mechanics, the investment required to get there, and the trade-offs nobody mentions in the job ad. Live openings are embedded below every entry.
          </p>
        </header>

        {topJobs.map((job, index) => {
          const { count, data } = jobResults[index]
          return (
            <section key={job.rank} className="mb-20 scroll-mt-8">
              <div className="flex items-start gap-4 mb-4">
                <span className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-700 font-bold rounded-xl text-lg flex-shrink-0">
                  {job.rank}
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm">
                    <span className="flex items-center gap-1 text-green-700 font-medium">
                      <DollarSign className="w-3.5 h-3.5" /> {job.salary}
                    </span>
                    <span className="flex items-center gap-1 text-blue-600 font-medium">
                      <TrendingUp className="w-3.5 h-3.5" /> {job.growth} projected growth
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed mb-6">
                {job.paragraph}
              </p>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 flex items-center justify-between border-b border-gray-200">
                  <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    {job.title} openings
                  </span>
                  {count > 0 && (
                    <span className="text-xs text-gray-500">
                      {count.toLocaleString()} positions
                    </span>
                  )}
                </div>
                <div className="max-h-[420px] overflow-y-auto">
                  <Suspense fallback={<div className="animate-pulse bg-gray-100 h-48" />}>
                    <InfiniteJobList
                      what={job.searchTerm}
                      where=""
                      salary_min={undefined}
                      initialData={data}
                    />
                  </Suspense>
                </div>
              </div>
            </section>
          )
        })}

        <footer className="mt-10 border-t border-gray-200 pt-8">
          <p className="text-xs text-gray-400 text-center max-w-2xl mx-auto">
            Oh My Job is an independent job search platform and is not affiliated with any hospital, health system, staffing agency, or employer listed on this page. Job listings are sourced from third-party APIs. Salary figures are estimates drawn from publicly available data including BLS, Nurse.org, and NurseJournal and may not reflect specific offers. Licensing, certification, and scope-of-practice rules vary by state. This page is for informational purposes only.
          </p>
        </footer>
      </div>
    </>
  )
}