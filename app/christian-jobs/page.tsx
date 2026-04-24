import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
import {
  Briefcase,
  BookOpen,
  Heart,
  DollarSign,
  MapPin,
  Users,
  ShieldCheck,
  Layers,
  TrendingUp,
  FileText,
  School,
  Mic,
  Building2,
} from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Christian Jobs Hiring Now | Faith-Based Positions Open Across the U.S.',
  description:
    'Hundreds of Christian jobs are open right now — from ministry and chaplaincy to education, healthcare, nonprofit, and media. Find a role where your faith and your career align. Browse and apply today.',
  keywords:
    'christian jobs, faith-based jobs, ministry jobs, christian nonprofit jobs, christian school jobs, chaplain jobs, christian organization hiring, christian employer jobs',
  openGraph: {
    title: 'Christian Jobs Open Now | Ministry, Education, Healthcare & More',
    description:
      'Faith-aligned positions are hiring across the United States. Churches, schools, hospitals, nonprofits, and Christian businesses all have openings right now.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Christian Jobs Hiring Now — Find a Role That Matches Your Faith',
    description:
      'Ministry roles, Christian school teachers, nonprofit directors, chaplains, and more. Browse hundreds of faith-based openings across the U.S. and apply today.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/christian-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Christian Jobs',
  description:
    'Browse Christian jobs and faith-based employment opportunities hiring now across the United States. Roles span ministry, education, healthcare, nonprofit, media, and business.',
  url: 'https://www.oh-my-job.com/christian-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Christian Jobs',
    description: 'Current job listings at Christian organizations and faith-based employers in the United States',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What counts as a Christian job?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A Christian job is any position at an organization that operates from a Christian mission, values framework, or faith identity. This includes churches, parachurch ministries, Christian schools and universities, faith-based nonprofits, Christian healthcare systems, Christian media and publishing companies, and businesses owned and operated according to explicitly Christian principles.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can Christian employers legally require employees to share their faith?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, within certain legal boundaries. Religious organizations are exempt from Title VII\'s prohibition on religious discrimination under federal law, meaning they can give hiring preference to candidates who share their faith or lifestyle standards. The scope of this exemption depends on the organization\'s classification, the nature of the role, and state law. Churches and ministry-integrated positions have the broadest exemption; faith-based nonprofits that receive certain government funding have narrower latitude.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do all Christian jobs require a statement of faith?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. The requirement varies significantly by organization type and role. Positions that are central to the ministry mission — pastor, chaplain, ministry director, Christian school teacher — almost universally require a statement of faith agreement. Operational support roles at Christian nonprofits and hospitals (IT, facilities, finance, HR) frequently do not, or require only a general acknowledgment of the organization\'s mission rather than a personal doctrinal affirmation.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the salary range for Christian jobs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Compensation varies enormously by sector. Ministry and church roles often pay below comparable secular positions, particularly at smaller congregations. Christian school teachers typically earn 10 to 20 percent below public school rates in the same market. Christian healthcare systems, major nonprofits, and Christian media companies pay salaries that are competitive with secular peers in the same industry. Large faith-based employers like Ascension Health or Adventist Health offer benefits and compensation on par with major hospital networks.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are there remote Christian jobs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Remote Christian jobs exist across multiple sectors: digital ministry roles, Christian media and content production, remote counseling through faith-based platforms, Christian nonprofit development and fundraising, and operational roles at large faith-based organizations. The volume of remote-eligible Christian jobs has grown substantially since 2020 and continues to expand, particularly in technology, communications, and donor relations.',
      },
    },
  ],
}

/* ─── SECTION DATA ──────────────────────────────────────────── */

const jobSectors = [
  {
    sector: 'Church and Ministry',
    icon: Mic,
    color: 'purple',
    description:
      'The most visible segment of the Christian job market. Church roles span pastoral leadership, worship direction, student and children\'s ministry, administration, communications, and facilities. Parachurch organizations — campus ministries, mission agencies, evangelism programs — add thousands of additional positions across the country in every region.',
    exampleRoles: 'Lead Pastor, Associate Pastor, Worship Director, Youth Director, Church Administrator, Campus Ministry Staff, Missions Coordinator',
    faithRequirement: 'High — doctrinal alignment and active church membership almost universally required',
    salaryRange: '$35,000–$110,000 depending on congregation size and role seniority',
    remoteAvailability: 'Limited; most roles are on-site by nature',
  },
  {
    sector: 'Christian K-12 Education',
    icon: School,
    color: 'blue',
    description:
      'Christian schools represent one of the largest employment sectors in faith-based work. Private Christian K-12 schools operate in every state, enrolling over 4 million students nationally. Demand for teachers, administrators, counselors, and support staff is consistent year-round, with peak hiring in spring for the following academic year.',
    exampleRoles: 'Classroom Teacher (all subjects and grade levels), Principal, Athletic Director, School Counselor, Curriculum Coordinator, Admissions Director',
    faithRequirement: 'High for instructional and leadership roles; moderate for operational positions',
    salaryRange: '$32,000–$75,000; typically 10–20% below comparable public school salaries',
    remoteAvailability: 'Minimal; some administrative and curriculum development roles are hybrid-eligible',
  },
  {
    sector: 'Faith-Based Nonprofit and Social Services',
    icon: Heart,
    color: 'red',
    description:
      'The faith-based nonprofit sector is enormous and widely underappreciated as an employment destination. Organizations like Catholic Charities, Lutheran Social Services, Salvation Army, Bethany Christian Services, and World Vision collectively employ hundreds of thousands of people across social work, healthcare, disaster relief, international development, fundraising, and administration.',
    exampleRoles: 'Social Worker, Case Manager, Development Officer, Grant Writer, Program Director, Volunteer Coordinator, Communications Manager',
    faithRequirement: 'Variable — often lower for direct service and operational roles; higher for leadership',
    salaryRange: '$38,000–$95,000; large national organizations pay competitively with secular peers',
    remoteAvailability: 'Increasingly available for development, communications, and administrative roles',
  },
  {
    sector: 'Christian Healthcare',
    icon: Building2,
    color: 'green',
    description:
      'Faith-based healthcare systems are among the largest hospital networks in the United States. Ascension Health, Providence Health, Adventist Health System, and CommonSpirit Health each operate dozens of facilities nationally, employing nurses, physicians, allied health professionals, and administrative staff at scale. These systems pay at market rates and offer standard clinical benefits.',
    exampleRoles: 'Registered Nurse, Medical Assistant, Chaplain, Social Worker, Physician, Healthcare Administrator, Medical Biller',
    faithRequirement: 'Low to moderate — most clinical and administrative roles require only mission alignment',
    salaryRange: '$42,000–$200,000+; fully competitive with secular healthcare employers',
    remoteAvailability: 'Clinical roles are on-site; administrative, billing, and some consulting roles are remote-eligible',
  },
  {
    sector: 'Christian Media, Publishing, and Communications',
    icon: Mic,
    color: 'orange',
    description:
      'Christian media is a substantial industry. Salem Media Group, HarperCollins Christian Publishing, Lifeway Christian Resources, the Christian Broadcasting Network, and hundreds of smaller publishers, podcast networks, and streaming ministries employ writers, editors, producers, marketers, technologists, and business professionals alongside content-facing staff.',
    exampleRoles: 'Editor, Content Strategist, Podcast Producer, Video Editor, Marketing Manager, Social Media Coordinator, Acquisitions Editor',
    faithRequirement: 'Moderate — content-facing roles typically require faith alignment; technical roles vary',
    salaryRange: '$40,000–$90,000; editorial and senior marketing roles at major publishers are competitive',
    remoteAvailability: 'High — media and publishing roles are frequently fully remote or hybrid',
  },
  {
    sector: 'Christian Higher Education',
    icon: BookOpen,
    color: 'teal',
    description:
      'Over 900 accredited Christian colleges and universities operate in the United States, ranging from small Bible colleges to major research universities. These institutions hire faculty, academic administrators, student affairs professionals, development officers, and full operational staff. Employment at Christian colleges often includes tuition benefits, which is significant for candidates with school-age children.',
    exampleRoles: 'Faculty (all disciplines), Academic Dean, Campus Pastor, Admissions Counselor, Residence Life Director, Director of Giving',
    faithRequirement: 'High for faculty and student-facing roles; moderate for operational and administrative positions',
    salaryRange: '$42,000–$130,000 for faculty depending on rank and institution size',
    remoteAvailability: 'Limited for faculty; moderate for administrative and development roles',
  },
  {
    sector: 'Chaplaincy',
    icon: Users,
    color: 'indigo',
    description:
      'Chaplaincy has expanded far beyond traditional hospital and military settings. Corporate chaplains now serve employees at manufacturing plants, tech companies, and large offices. Prison chaplains work within the federal and state corrections systems. Healthcare chaplains are present at virtually every major hospital network. Military chaplains serve all branches of the armed forces. Each setting has distinct credentialing requirements and employment structures.',
    exampleRoles: 'Hospital Chaplain, Military Chaplain, Prison Chaplain, Corporate Chaplain, Hospice Chaplain, University Chaplain',
    faithRequirement: 'High — endorsement from an ecclesiastical body and ordination are typically required',
    salaryRange: '$45,000–$90,000; military chaplains follow officer pay grades and can earn significantly more',
    remoteAvailability: 'Minimal; presence-based ministry by nature',
  },
  {
    sector: 'Christian Business and Faith-Aligned Companies',
    icon: Briefcase,
    color: 'amber',
    description:
      'A growing number of for-profit companies operate explicitly according to Christian principles and actively seek employees who share those values. Examples include Christian Brothers Automotive (auto repair franchises), Hobby Lobby (retail), Interstate Batteries, and Chick-fil-A (at the franchise level). These companies blend standard business roles with a distinctively faith-grounded workplace culture.',
    exampleRoles: 'Automotive Technician, Retail Associate, Store Manager, Operations Lead, Franchise Owner',
    faithRequirement: 'Moderate — cultural alignment expected; formal doctrinal agreement less common',
    salaryRange: 'Market rate for sector; some Christian businesses offer premium compensation as a competitive differentiator',
    remoteAvailability: 'Limited for most positions; some corporate roles are hybrid-eligible',
  },
]

const colorMap: Record<string, { bg: string; border: string; icon: string; pill: string; pillText: string }> = {
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-500', pill: 'bg-purple-100', pillText: 'text-purple-700' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500', pill: 'bg-blue-100', pillText: 'text-blue-700' },
  red: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500', pill: 'bg-red-100', pillText: 'text-red-700' },
  green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-500', pill: 'bg-green-100', pillText: 'text-green-700' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-500', pill: 'bg-orange-100', pillText: 'text-orange-700' },
  teal: { bg: 'bg-teal-50', border: 'border-teal-200', icon: 'text-teal-500', pill: 'bg-teal-100', pillText: 'text-teal-700' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'text-indigo-500', pill: 'bg-indigo-100', pillText: 'text-indigo-700' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-500', pill: 'bg-amber-100', pillText: 'text-amber-700' },
}

const salaryComparison = [
  {
    role: 'Associate Pastor (mid-size church)',
    low: '$42,000',
    mid: '$58,000',
    high: '$78,000',
    note: 'Housing allowance is often tax-advantaged for ordained clergy under the parsonage allowance',
  },
  {
    role: 'Christian School Teacher',
    low: '$32,000',
    mid: '$46,000',
    high: '$65,000',
    note: 'Tuition discounts at the employing school are a meaningful benefit for families with children',
  },
  {
    role: 'Nonprofit Development Officer',
    low: '$48,000',
    mid: '$67,000',
    high: '$95,000',
    note: 'Major gift officers at large Christian nonprofits can earn above this range based on portfolio size',
  },
  {
    role: 'Hospital Chaplain',
    low: '$46,000',
    mid: '$62,000',
    high: '$82,000',
    note: 'Board-certified chaplains at major health systems earn at the higher end; union hospitals add benefits',
  },
  {
    role: 'Christian Media Producer',
    low: '$42,000',
    mid: '$60,000',
    high: '$88,000',
    note: 'Senior producers and editors at national Christian networks approach secular media compensation',
  },
  {
    role: 'Faith-Based Healthcare RN',
    low: '$68,000',
    mid: '$88,000',
    high: '$115,000',
    note: 'Fully competitive with secular hospital networks; large systems match or exceed market rates',
  },
  {
    role: 'University Faculty (Christian College)',
    low: '$48,000',
    mid: '$72,000',
    high: '$110,000',
    note: 'Research-oriented positions at larger universities carry full secular academic salary expectations',
  },
  {
    role: 'Corporate Chaplain',
    low: '$45,000',
    mid: '$62,000',
    high: '$85,000',
    note: 'Some corporate chaplains work as independent contractors, adding flexibility but removing benefits',
  },
]

const statementOfFaithGuide = [
  {
    level: 'Full Doctrinal Agreement',
    whoRequires: 'Evangelical and denominational churches, Bible colleges, parachurch ministries',
    whatItMeans:
      'The employer expects the candidate to affirm a specific set of theological beliefs — typically covering the authority of Scripture, salvation through Christ, the Trinity, and often secondary doctrines relevant to the denomination. Candidates who cannot affirm these points in good conscience should not apply.',
    howToApproach:
      'Read the statement of faith carefully before applying. If you agree substantively, say so clearly and specifically in your cover letter. Vague affirmations are noticed.',
  },
  {
    level: 'Mission Alignment',
    whoRequires: 'Large faith-based nonprofits, Christian healthcare systems, some Christian schools',
    whatItMeans:
      'The employer does not require specific doctrinal agreement but expects candidates to affirm and support the organization\'s faith-grounded mission. Personal theological conviction is respected but not formally assessed. Candidates of different faith backgrounds or varying levels of personal practice are often welcome.',
    howToApproach:
      'Address the organization\'s mission directly in your application. Show that you understand why the faith dimension of their work matters and how your own values or convictions connect to it.',
  },
  {
    level: 'Cultural Fit Only',
    whoRequires: 'Faith-aligned businesses, some operational roles at larger Christian organizations',
    whatItMeans:
      'The employer operates with Christian values but does not require formal religious commitment from all employees. Candidates are expected to work respectfully within a faith-oriented culture — attending optional chapel, being comfortable with prayer in meetings, or adhering to behavior standards — without making personal faith a condition of employment.',
    howToApproach:
      'Demonstrate respect for and genuine interest in the organization\'s culture. Focus on mission fit and professional qualifications rather than theological positioning.',
  },
]

const majorEmployers = [
  { name: 'Ascension Health', sector: 'Healthcare', size: '~150,000 employees', notes: 'One of the largest Catholic health systems in the U.S.; hires across clinical, administrative, and support roles at scale' },
  { name: 'Salvation Army', sector: 'Nonprofit / Social Services', size: '~60,000 employees (U.S.)', notes: 'One of the largest faith-based employers in the country; social work, addiction recovery, disaster relief, administration' },
  { name: 'Catholic Charities USA', sector: 'Nonprofit', size: '~65,000 employees + volunteers', notes: 'Social services network with affiliates in every diocese; social work, counseling, housing, immigration services' },
  { name: 'Adventist Health System', sector: 'Healthcare', size: '~80,000 employees', notes: 'Seventh-day Adventist hospital network; competitive healthcare salaries with Sabbath observance as cultural norm' },
  { name: 'Lifeway Christian Resources', sector: 'Publishing / Retail', size: 'Several thousand', notes: 'Southern Baptist publishing and retail arm; editorial, marketing, technology, and retail operations' },
  { name: 'Focus on the Family', sector: 'Nonprofit / Media', size: 'Several hundred', notes: 'Colorado Springs-based ministry; media production, communications, family counseling resources, donor relations' },
  { name: 'World Vision U.S.', sector: 'International Development', size: '~1,000+ U.S. based', notes: 'Christian relief and development organization; fundraising, communications, program management, advocacy' },
  { name: 'Hobby Lobby', sector: 'Retail', size: '~43,000 employees', notes: 'Privately held; closed Sundays, starting wages above sector average, explicitly Christian corporate culture' },
]

const remoteChristianJobs = [
  {
    category: 'Digital Ministry',
    roles: 'Online campus pastor, digital discipleship coordinator, virtual small group facilitator, ministry podcast host',
    outlook: 'Growing rapidly as churches invest in distributed congregation models post-2020',
  },
  {
    category: 'Christian Publishing and Editorial',
    roles: 'Remote acquisitions editor, freelance theological writer, content strategist for faith-based brands, Bible curriculum developer',
    outlook: 'Publishing has broadly normalized remote work; many editorial roles are fully location-agnostic',
  },
  {
    category: 'Nonprofit Development and Fundraising',
    roles: 'Remote major gift officer, grant writer, donor relations coordinator, annual fund manager',
    outlook: 'Strong and growing; large nonprofits have accepted that development staff can build donor relationships remotely',
  },
  {
    category: 'Faith-Based Counseling and Mental Health',
    roles: 'Telehealth Christian counselor, virtual chaplain, online pastoral care provider',
    outlook: 'Telehealth licensing complexity varies by state but the market is expanding; compact licensure helps',
  },
  {
    category: 'Christian Media and Communications',
    roles: 'Remote social media manager, content producer, video editor, podcast coordinator, SEO specialist',
    outlook: 'Fully remote is standard at many digital-first Christian media organizations',
  },
]

const careerPaths = [
  {
    background: 'Seminary Graduate',
    naturalEntry: 'Associate pastoral role, campus ministry staff, church administration',
    longerTerm: 'Lead pastoral position, denominational leadership, nonprofit executive director, Christian higher education administrator',
    note: 'An MDiv remains the most versatile credential in the Christian job market, opening doors across ministry, chaplaincy, and higher education simultaneously.',
  },
  {
    background: 'Education Professional',
    naturalEntry: 'Christian school teacher, curriculum coordinator, admissions counselor at a Christian college',
    longerTerm: 'Principal, academic dean, head of school, Christian school accreditation consultant',
    note: 'State teaching licensure remains valuable even at private Christian schools — many states require it and salary schedules often reference it.',
  },
  {
    background: 'Healthcare Professional',
    naturalEntry: 'Clinician at a faith-based hospital, hospital chaplain, healthcare administrator at a Christian system',
    longerTerm: 'Department leadership, healthcare ministry director, senior chaplain, faith-based health equity roles',
    note: 'Clinical credentials transfer directly; the faith-based component adds a mission layer rather than replacing professional requirements.',
  },
  {
    background: 'Business or Communications Professional',
    naturalEntry: 'Communications role at a nonprofit, development officer, marketing manager at a Christian media company',
    longerTerm: 'Nonprofit executive director, Christian publishing imprint leader, COO at a faith-based organization',
    note: 'Business skills are frequently in short supply at faith-based organizations, and professionals who combine competence with mission alignment move quickly into leadership.',
  },
]

const faqs = [
  {
    question: 'What is the actual scope of the Christian job market?',
    answer:
      'The Christian job market is far larger than most candidates assume. It encompasses churches and parachurch ministries, over 12,000 Christian K-12 schools, more than 900 accredited Christian colleges and universities, major faith-based hospital networks with over 600 facilities nationwide, thousands of nonprofit organizations, a multi-billion dollar Christian media and publishing industry, and a growing number of for-profit businesses that operate according to explicitly Christian values. Together these sectors employ millions of workers across virtually every professional discipline.',
  },
  {
    question: 'Do I need to be ordained to work in a Christian organization?',
    answer:
      'Ordination is required for specific roles — primarily pastoral positions, hospital and military chaplaincy, and certain denominational leadership roles. The vast majority of Christian jobs do not require ordination. Teaching at a Christian school, working in nonprofit development, managing communications at a Christian media company, or holding an administrative role at a faith-based healthcare system typically requires professional credentials and faith alignment, not formal ordination.',
  },
  {
    question: 'How do lifestyle agreements at Christian employers actually work?',
    answer:
      'Many Christian employers — particularly schools, churches, and parachurch ministries — ask employees to sign a lifestyle agreement or code of conduct that reflects the organization\'s understanding of Christian living. These agreements vary significantly in scope. Some are limited to conduct directly related to the role (for example, a youth pastor agreeing not to engage in behaviors that would undermine their ministry credibility). Others extend into personal life conduct. Candidates should read these agreements carefully before signing and ask clarifying questions during the hiring process if the scope is unclear. Agreements that extend beyond what the law permits or into areas unrelated to the role are worth discussing with an employment attorney.',
  },
  {
    question: 'Is pay at Christian employers significantly lower than at secular employers?',
    answer:
      'It depends entirely on the sector. Church and small ministry roles are frequently below comparable secular positions, and this gap is most pronounced at smaller congregations where budgets are limited. Christian K-12 schools typically pay 10 to 20 percent below comparable public school salaries in the same market. In contrast, large faith-based hospital networks, major Christian nonprofits, and Christian publishing companies at scale pay salaries that are competitive with their secular counterparts. Compensation at faith-based employers has been moving upward across most sectors as organizations have recognized that mission alone does not replace financial security for employees with mortgages and families.',
  },
  {
    question: 'What is the parsonage allowance and does it apply to my role?',
    answer:
      'The parsonage allowance — also called the housing allowance — is a provision of U.S. tax law that allows ordained ministers to exclude from federal income tax the portion of their salary designated for housing expenses. It applies to pastors, ordained chaplains, and qualifying ministers who are considered "ministers of the gospel" under IRS definitions. The allowance can represent a significant effective pay increase — often $5,000 to $15,000 annually in tax savings depending on housing costs and tax rate. It is specific to ordained clergy; lay employees at Christian organizations, even in ministry-adjacent roles, do not qualify.',
  },
  {
    question: 'Can I find Christian jobs outside of traditional ministry roles?',
    answer:
      'Absolutely, and this is one of the most underappreciated aspects of this job market. Christian organizations of all types need accountants, IT professionals, HR managers, legal counsel, facilities directors, graphic designers, data analysts, and virtually every other business function. A faith-based hospital network needs nurses, physicians, and billing specialists. A major Christian nonprofit needs data-driven fundraisers and CRM administrators. A Christian media company needs video producers and SEO strategists. The demand for professionally skilled Christians who want to apply their vocation within a faith-aligned employer is consistent and growing across essentially every field.',
  },
]

export default async function ChristianJobsPage({ searchParams }: any) {
  const params = await searchParams

  const [{ count }, initialData] = await Promise.all([
  getMergedJobCount(params.what || 'christian', params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
  searchMergedJobs({ what: params.what || 'christian', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
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
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Christian Jobs Hiring Now Across the United States
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="christian" />
          </aside>
          <div className="flex-1">
            {count > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">
                  {count.toLocaleString()}
                </span>{' '}
                positions available
              </p>
            )}
            <AIJobMatcherWrapper />
            <Suspense
              fallback={
                <div className="animate-pulse bg-gray-100 rounded-lg h-96" />
              }
            >
              <InfiniteJobList
                what={params.what || 'christian'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData}
              />
            </Suspense>
          </div>
        </div>

        {/* ── SCOPE OF THE MARKET ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Layers className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Eight Sectors That Hire for Christian Jobs — Not Just Church Roles
            </h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            The Christian job market is routinely underestimated because most people think of it as synonymous with church ministry. In reality, it is one of the largest faith-aligned employment ecosystems in the world. Here is where the roles actually are — broken down by sector, with an honest account of faith requirements, compensation, and remote availability.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {jobSectors.map((s, index) => {
              const c = colorMap[s.color]
              return (
                <div
                  key={index}
                  className={`bg-white border ${c.border} rounded-2xl p-6 hover:shadow-md transition-all`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <s.icon className={`w-6 h-6 ${c.icon}`} />
                    <h3 className="font-bold text-gray-900 text-lg">{s.sector}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{s.description}</p>
                  <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                    <div>
                      <span className="text-gray-500 text-xs block mb-0.5">Example roles</span>
                      <span className="text-gray-700">{s.exampleRoles}</span>
                    </div>
                    <div className="flex justify-between items-start gap-2 pt-1">
                      <div>
                        <span className="text-gray-500 text-xs block mb-0.5">Faith requirement</span>
                        <span className="text-gray-700 text-xs">{s.faithRequirement}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className={`text-xs font-medium ${c.pillText} ${c.pill} px-2 py-0.5 rounded-full`}>
                        {s.salaryRange}
                      </span>
                      <span className="text-xs text-gray-400">{s.remoteAvailability}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── SALARY TABLE ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Christian Job Salaries by Role — What the Market Is Paying
            </h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Compensation in the Christian job market varies more by sector and organization size than by the faith-based nature of the employer. The figures below reflect current U.S. market data for roles commonly found in faith-based organizations, with notes on tax advantages or benefits that meaningfully affect total compensation.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Role</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Entry</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Mid</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Senior</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Compensation notes</th>
                </tr>
              </thead>
              <tbody>
                {salaryComparison.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{row.role}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{row.low}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{row.mid}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-green-700">{row.high}</td>
                    <td className="px-4 py-4 text-xs text-gray-500 max-w-xs">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Salary data reflects 2024 to 2025 U.S. market figures. Clergy housing allowances, tuition benefits, and mission-trip budgets are non-cash benefits that do not appear in base salary figures but add meaningful compensation value at many Christian employers.
          </p>
        </section>

        {/* ── STATEMENT OF FAITH ── */}
        <section className="mt-20">
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <FileText className="w-8 h-8 text-purple-600 flex-shrink-0 mt-1" />
              <div className="w-full">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Statements of Faith and Lifestyle Agreements — What They Actually Mean
                </h2>
                <p className="text-gray-700 mb-6">
                  One of the most misunderstood elements of Christian hiring is the range of faith expectations employers actually hold. These are not monolithic. The requirement varies dramatically by organization type, role, and denominational tradition. Understanding where a prospective employer sits on this spectrum before you apply saves significant time on both sides.
                </p>
                <div className="space-y-4">
                  {statementOfFaithGuide.map((tier, index) => (
                    <div key={index} className="bg-white rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="inline-flex items-center justify-center w-7 h-7 bg-purple-100 text-purple-700 font-bold rounded-full text-xs flex-shrink-0">
                          {index + 1}
                        </span>
                        <h3 className="font-semibold text-gray-900">{tier.level}</h3>
                      </div>
                      <div className="pl-10 space-y-2 text-sm">
                        <p>
                          <span className="text-gray-500 font-medium">Who requires it: </span>
                          <span className="text-gray-700">{tier.whoRequires}</span>
                        </p>
                        <p>
                          <span className="text-gray-500 font-medium">What it means in practice: </span>
                          <span className="text-gray-700">{tier.whatItMeans}</span>
                        </p>
                        <p>
                          <span className="text-gray-500 font-medium">How to approach it: </span>
                          <span className="text-gray-700">{tier.howToApproach}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── MAJOR EMPLOYERS ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Major Christian and Faith-Based Employers Hiring at Scale
            </h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Beyond local churches and small ministries, a set of large national organizations hire Christian professionals in volume. These employers offer competitive compensation, structured career development, and the scale of resources that smaller faith-based organizations cannot match.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {majorEmployers.map((employer, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{employer.name}</h3>
                  <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full flex-shrink-0">
                    {employer.sector}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-1">{employer.size}</p>
                <p className="text-sm text-gray-600">{employer.notes}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── REMOTE CHRISTIAN JOBS ── */}
        <section className="mt-20">
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <MapPin className="w-8 h-8 text-teal-600 flex-shrink-0 mt-1" />
              <div className="w-full">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Remote Christian Jobs — Where Location-Independent Faith-Based Work Actually Exists
                </h2>
                <p className="text-gray-700 mb-6">
                  Remote work in the Christian job market is more available than most candidates realize, though it is concentrated in specific categories. The table below maps the strongest remote opportunity areas, including the roles most likely to be fully location-agnostic and the hiring outlook for each.
                </p>
                <div className="space-y-3">
                  {remoteChristianJobs.map((item, index) => (
                    <div key={index} className="bg-white rounded-xl p-4">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm mb-1">
                            {item.category}
                          </h3>
                          <p className="text-gray-600 text-xs">{item.roles}</p>
                        </div>
                        <div className="md:max-w-xs">
                          <p className="text-teal-700 text-xs bg-teal-50 rounded-lg p-2">{item.outlook}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CAREER PATHS ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Career Paths Into Christian Employment — Four Starting Points
            </h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            The path into Christian employment looks different depending on your professional background. What nearly all paths share is that professional competence remains the baseline — faith alignment adds to it but does not substitute for it. Here is how four common backgrounds typically enter and advance in this market.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {careerPaths.map((path, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-700 font-bold rounded-full text-sm flex-shrink-0">
                    {index + 1}
                  </span>
                  <h3 className="font-semibold text-gray-900 text-lg">{path.background}</h3>
                </div>
                <div className="space-y-2 text-sm pl-11">
                  <div>
                    <span className="text-gray-500">Natural entry points: </span>
                    <span className="text-gray-700">{path.naturalEntry}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Longer-term trajectory: </span>
                    <span className="text-gray-700">{path.longerTerm}</span>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 mt-2">
                    <p className="text-orange-700 text-xs">{path.note}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── LEGAL FRAMEWORK ── */}
        <section className="mt-20">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <ShieldCheck className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  The Legal Framework Behind Faith-Based Hiring — What Candidates Should Know
                </h2>
                <p className="text-gray-700 mb-6">
                  Faith-based hiring involves a legal framework that is genuinely different from secular employment. Understanding the basics helps candidates evaluate whether a job\'s faith requirements are standard, unusual, or worth seeking clarification on.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    {
                      title: 'Title VII religious organization exemption',
                      detail:
                        'Section 702 of Title VII allows religious organizations to give hiring preference to members of their religion without violating federal anti-discrimination law. This applies to churches, religious schools, and organizations "substantially controlled" by a religious entity. The exemption covers religion-based hiring decisions but not discrimination on other grounds such as race, sex, or disability.',
                    },
                    {
                      title: 'The ministerial exception',
                      detail:
                        'The Supreme Court\'s ministerial exception doctrine gives religious employers broad discretion over who fills "ministerial" roles — positions that involve religious leadership, teaching, or the transmission of faith. Courts have interpreted "ministerial" expansively in recent rulings, which has extended hiring discretion to some teachers at religious schools and lay leaders at churches.',
                    },
                    {
                      title: 'RFRA and state equivalents',
                      detail:
                        'The Religious Freedom Restoration Act protects religious organizations from government action that substantially burdens their religious exercise. Some states have their own RFRA equivalents with varying scope. These laws affect how courts evaluate disputes between employees and faith-based employers, particularly around lifestyle agreements and conduct standards.',
                    },
                    {
                      title: 'Government funding and nondiscrimination',
                      detail:
                        'Faith-based organizations that receive certain types of federal funding face restrictions on religious hiring discrimination for positions funded by those dollars. The practical effect varies by program and has been the subject of ongoing policy and legal evolution. Organizations receiving significant government grants should review their current obligations carefully.',
                    },
                  ].map((item, i) => (
                    <div key={i} className="bg-white rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.detail}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  This section provides general background only and does not constitute legal advice. Employment law in this area is evolving and state-specific. Candidates with specific concerns should consult an employment attorney.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-7 h-7 text-gray-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Frequently Asked Questions About Christian Jobs
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
            <strong>Disclaimer:</strong> Salary figures on this page are based on publicly available job postings and industry reporting as of 2024 to 2025. The legal overview provided is general background only and does not constitute legal advice. Faith-based employment law is subject to ongoing judicial and legislative change. Candidates and employers with specific questions should consult qualified legal counsel. Oh My Job is not affiliated with any listed organization and does not guarantee employment outcomes.
          </p>
        </section>
      </div>
    </>
  )
}