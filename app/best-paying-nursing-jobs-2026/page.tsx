import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import { DollarSign, TrendingUp, Briefcase } from 'lucide-react'
import { getJobs } from '@/lib/getJobs'

async function fetchJobData (searchTerm: string) {
  const { results, count } = await getJobs({ what: searchTerm, resultsPerPage: 20, page: 1 })
  return { count, data: { results, count } }
}

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
    paragraph: 'CRNAs hold a position in healthcare that is almost impossible to replicate. They perform the same clinical function as physician anesthesiologists in most surgical settings, carry independent practice authority in a growing number of states, and earn a median above $220,000 with a nursing degree rather than a medical degree. The path is demanding: a BSN, at least two years of ICU experience, then a three-year doctoral program. The return on that investment is unmatched in nursing. In rural hospitals and ambulatory surgery centers without an anesthesiologist on staff, the CRNA is the sole anesthesia provider, which is why the role commands this premium. The 38 percent projected growth rate reflects an aging surgical population and a nationwide push to expand CRNA scope of practice as a cost-effective alternative to physician-led anesthesia teams.',
  },
  {
    rank: 2,
    title: 'Psychiatric Mental Health NP',
    searchTerm: 'psychiatric nurse practitioner',
    salary: '$130K to $180K',
    growth: '40%',
    paragraph: 'The behavioral health workforce shortage is severe enough that some US counties have zero psychiatrists. PMHNPs are filling that gap, and compensation reflects the urgency. In states with full practice authority, a PMHNP can open an independent practice, prescribe controlled substances, and manage a panel of 100 or more patients, generating $300,000 to $500,000 in annual practice revenue. Even employed PMHNPs at health systems earn $140,000 to $170,000, with more schedule control than most medical specialties. The pipeline of new PMHNPs is growing but still cannot keep pace with demand, driven by expanded insurance coverage for mental health, higher post-pandemic anxiety and depression rates, and a cultural shift toward seeking psychiatric care. If you are an RN weighing NP specialties, this is the one with the widest gap between supply and demand.',
  },
  {
    rank: 3,
    title: 'Travel Nurse',
    searchTerm: 'travel nurse',
    salary: '$80K to $150K+ ',
    growth: 'Variable',
    paragraph: 'Travel nursing is not a clinical specialty. It is a compensation structure, and understanding that structure is the key to evaluating whether the numbers in job ads are real. Contracts pay a base hourly rate plus a tax-free housing stipend plus a meals-and-incidentals stipend. Combined, weekly gross can reach $2,500 to $4,000 depending on location and specialty. The tax-free stipends are what make travel pay look dramatically higher than staff pay, but they only stay tax-free if you maintain a permanent residence, a "tax home," that you actually pay for while on assignment. Nurses who track this correctly can save $50,000 to $80,000 a year. Those who do not, or who get audited without documentation, face a real bill. Crisis contracts during acute staffing emergencies pay even more but are unpredictable. The lifestyle trade-off is real too: you change cities every 8 to 13 weeks and orient to a new hospital system each time.',
  },
  {
    rank: 4,
    title: 'Family Nurse Practitioner',
    searchTerm: 'family nurse practitioner',
    salary: '$110K to $145K',
    growth: '40%',
    paragraph: 'The FNP is the most broadly trained NP specialty, which makes it the most versatile and, for many, the most practical graduate investment. You can work in primary care, urgent care, retail clinics, occupational health, telehealth, or open your own practice in states with full practice authority. That flexibility matters more than the salary number alone suggests, since it means you are never locked into a single employer or setting. Federal loan repayment programs through the NHSC target NPs in shortage areas, offering up to $50,000 in loan forgiveness over two years, effectively adding $25,000 a year to your compensation. The median sits around $125,000, but FNPs who own practices in underserved areas and accept a mix of insurance and cash-pay patients routinely exceed $180,000. The 40 percent growth rate is driven by the same forces across all NP specialties: too many patients, too few primary care providers, and a system that relies more and more on NPs to close the gap.',
  },
  {
    rank: 5,
    title: 'ICU / Critical Care Nurse',
    searchTerm: 'ICU nurse',
    salary: '$75K to $110K',
    growth: '6%',
    paragraph: 'ICU nursing is the bedside role with the highest pay floor and the most direct path to the two highest-paid positions in nursing: CRNA and acute care NP. Base pay for an experienced ICU nurse runs $80,000 to $100,000 before differentials, and nurses who pick up overtime or night shifts routinely exceed $110,000. The clinical intensity is real. You manage ventilators, titrate vasoactive drips, interpret hemodynamic waveforms, and make time-sensitive decisions that directly affect patient survival. That weight is why the role pays what it does, and why it is not for everyone. What most salary articles skip is that ICU experience is the required prerequisite for CRNA programs. Every shift you work at the bedside also builds the clinical hours you need to apply for a $220,000 career. Two to three years in the ICU followed by a CRNA doctoral program is the highest-ROI sequence available to any BSN graduate.',
  },
  {
    rank: 6,
    title: 'Certified Nurse Midwife',
    searchTerm: 'nurse midwife',
    salary: '$100K to $140K',
    growth: '35%',
    paragraph: 'Nurse midwifery occupies a unique position in healthcare because demand for it comes from patient preference as much as workforce economics. More families are choosing midwife-led care specifically because the model emphasizes physiological birth, shared decision making, and longer appointment times, things the traditional OB-GYN system struggles to offer at scale. CNMs provide prenatal care, attend deliveries, manage postpartum recovery, and offer gynecological care across the lifespan. In states with full practice authority, many open independent birth centers that operate entirely outside the hospital system. The median salary sits around $130,000, but CNMs who own practices often report higher net income depending on patient volume and payer mix. The 35 percent growth projection is among the highest in nursing, driven by an aging OB-GYN workforce and expanding Medicaid coverage for midwife-attended births.',
  },
  {
    rank: 7,
    title: 'Nurse Manager',
    searchTerm: 'nurse manager',
    salary: '$85K to $120K',
    growth: '28%',
    paragraph: 'Nurse management is the path for clinicians who want to shape how a unit operates rather than work at the bedside indefinitely. The role covers staffing, scheduling, budgeting, quality metrics, employee relations, and serving as the interface between floor nurses and hospital administration. Pay ranges from $85,000 to $120,000 at most facilities, which can be less than what a senior staff nurse earns with overtime and differentials, a detail most articles skip. The financial advantage of management is not the immediate salary bump. It is that the role opens a progression into director of nursing ($120,000 to $160,000), VP of patient care services ($150,000 to $200,000), and eventually chief nursing officer ($180,000 to $300,000 or more), a ladder bedside nursing does not access regardless of years of experience. If your long-term goal is executive leadership in healthcare, nurse management is the required step that gives you P&L responsibility, committee exposure, and visibility to senior leadership.',
  },
]

export default async function BestPayingNursingJobsPage() {
  const jobResults = await Promise.all(
    topJobs.map(job => fetchJobData(job.searchTerm))
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-4xl mx-auto px-6 py-16">

        <header className="text-center mb-16">
          <p className="text-xs font-bold tracking-widest text-teal-600 uppercase mb-3">2026 Ranking</p>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1a2340] mb-5 tracking-tight">
            Best Paying Nursing Jobs in 2026
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Seven nursing paths ranked by what you actually take home, not what a recruiter puts in the subject line. Each includes the real compensation mechanics, the investment required to get there, and the trade-offs nobody mentions in the job ad. Live openings are embedded below every entry.
          </p>
        </header>

        {topJobs.map((job, index) => {
          const { data } = jobResults[index]
          return (
            <section key={job.rank} className="mb-16 scroll-mt-8">
              <div className="flex items-start gap-4 mb-4">
                <span className="inline-flex items-center justify-center w-10 h-10 bg-indigo-50 text-indigo-600 font-bold rounded-xl text-lg flex-shrink-0">
                  {job.rank}
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-[#1a2340]">{job.title}</h2>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm">
                    <span className="flex items-center gap-1 text-teal-700 font-medium">
                      <DollarSign className="w-3.5 h-3.5" /> {job.salary}
                    </span>
                    <span className="flex items-center gap-1 text-indigo-600 font-medium">
                      <TrendingUp className="w-3.5 h-3.5" /> {job.growth} projected growth
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed mb-6">
                {job.paragraph}
              </p>

              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 flex items-center justify-between border-b border-gray-100">
                  <span className="text-sm font-semibold text-[#1a2340] flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    {job.title} openings
                  </span>
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

        <footer className="mt-10 border-t border-gray-100 pt-8">
          <p className="text-xs text-gray-400 text-center max-w-2xl mx-auto">
            Oh My Job is an independent job search platform and is not affiliated with any hospital, health system, staffing agency, or employer listed on this page. Job listings are sourced from third-party APIs. Salary figures are estimates drawn from publicly available data including BLS, Nurse.org, and NurseJournal and may not reflect specific offers. Licensing, certification, and scope-of-practice rules vary by state. This page is for informational purposes only.
          </p>
        </footer>
      </div>
    </>
  )
}