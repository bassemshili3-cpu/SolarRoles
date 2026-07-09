import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Heart, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, AlertTriangle, BookOpen, Users, Briefcase, Award, Sparkles, Smile } from 'lucide-react'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Preschool Jobs | Teacher, Assistant & Director Positions',
  description: 'Lead teacher, assistant, floater, and director positions at church, Montessori, public Pre-K, and private preschool programs. CDA and associate degree paths welcome.',
  keywords: 'preschool jobs, preschool teacher jobs, preschool assistant jobs, preschool director jobs, daycare preschool teacher, Pre-K teacher jobs, Montessori preschool jobs, head start jobs',
  openGraph: {
    title: 'Preschool Jobs | Teaching Positions in Every Setting',
    description: 'Browse preschool teacher, assistant, and director jobs in church, Montessori, public Pre-K, and private centers. Multiple credential paths welcome.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Preschool Jobs | Lead Teacher, Assistant, Director Roles',
    description: 'Hundreds of preschool positions open across the United States. CDA, Associate, and Bachelor credentials all welcome depending on the role.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/preschool-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Preschool Jobs',
  description: 'Find preschool teacher, assistant, and director jobs hiring across the United States in multiple program types and settings.',
  url: 'https://www.oh-my-job.com/preschool-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Preschool Jobs',
    description: 'Current preschool teacher, assistant, floater, and director positions across the US',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What qualifications do you need for a preschool teaching job?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Requirements vary by role and setting. Assistant positions typically require a high school diploma and on-the-job training. Lead teacher positions usually require a CDA (Child Development Associate) credential, an Associate degree in early childhood education, or a Bachelor degree depending on the state and program. Public Pre-K programs often require a state teaching license.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is a CDA credential and how long does it take?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Child Development Associate (CDA) is a nationally recognized credential issued by the Council for Professional Recognition. Earning it requires 120 hours of formal early childhood education coursework, 480 hours of professional experience working with children, a portfolio, and a verification visit. Most candidates complete it in 9 to 18 months while working.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much do preschool teachers earn?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Annual pay varies significantly by setting and credential level. Preschool assistants typically earn $24,000 to $32,000. Lead teachers with a CDA earn $28,000 to $38,000. Lead teachers with a Bachelor degree earn $35,000 to $48,000. Public Pre-K teachers in school districts earn $42,000 to $65,000 with full benefits and summers off.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between preschool, Pre-K, and daycare?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Preschool generally covers children ages 3 to 5 with a structured curriculum focused on social, cognitive, and emotional development. Pre-K is the year just before kindergarten (typically age 4) and often runs through school districts. Daycare can include children from infancy through preschool age and may or may not include a structured educational component depending on the provider.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do preschool teachers get summers off?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'It depends on the setting. Public Pre-K programs run on a school district calendar with summers off. Private preschools, daycare-based preschool programs, and Head Start often operate year-round with shorter breaks. Church-affiliated programs sometimes follow the local school calendar.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is preschool teaching a good entry point into elementary education?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes for some pathways, no for others. Working in preschool while completing a Bachelor degree in elementary education is a common route. However, preschool experience alone does not satisfy state elementary teaching license requirements. The transition still requires completing a teacher preparation program and passing state certification exams.',
      },
    },
  ],
}

const teachingRoles = [
  {
    role: 'Lead Teacher',
    description: 'Owns curriculum planning, classroom management, parent communication, and assessment for a specific age group. Requires CDA at minimum, often Associate or Bachelor degree depending on state and program type.',
    payRange: '$28,000 to $48,000',
    icon: Award,
  },
  {
    role: 'Assistant Teacher',
    description: 'Supports the lead teacher with activities, supervision, classroom setup, and ratio coverage. Entry point for the field. Many assistants pursue their CDA while working in this role.',
    payRange: '$24,000 to $32,000',
    icon: Users,
  },
  {
    role: 'Floater',
    description: 'Rotates between classrooms to provide ratio coverage during teacher breaks, illness, and high-needs periods. Builds experience across age groups and often becomes the next assistant or lead opening.',
    payRange: '$22,000 to $30,000',
    icon: Sparkles,
  },
  {
    role: 'Center Director',
    description: 'Oversees licensing compliance, enrollment, staff scheduling, parent relations, and budget. Requires significant early childhood experience plus management background. Often a Bachelor degree minimum.',
    payRange: '$45,000 to $75,000',
    icon: Briefcase,
  },
  {
    role: 'Special Needs Aide',
    description: 'Provides one-on-one support for a child with an IEP or developmental need within the preschool classroom. Often requires additional training in behavioral support or specific therapeutic approaches.',
    payRange: '$26,000 to $36,000',
    icon: Heart,
  },
  {
    role: 'Curriculum Coordinator',
    description: 'Designs and aligns curriculum across classrooms in larger centers. Trains teachers on implementation. Typically a senior teacher promoted into the role with strong curriculum expertise.',
    payRange: '$40,000 to $55,000',
    icon: BookOpen,
  },
]

const settings = [
  {
    name: 'Public Pre-K (School District)',
    description: 'Programs run by local school districts, typically serving 4 year olds in the year before kindergarten. Operates on the school year calendar with summers off. Highest pay and best benefits in the field. Usually requires state teaching license.',
    pros: 'School district benefits, summers off, structured curriculum, professional respect',
    cons: 'Requires teaching license, less flexibility, school-year only employment',
  },
  {
    name: 'Private Preschool (Independent or Chain)',
    description: 'Standalone centers or national chains like KinderCare, Bright Horizons, La Petite Academy, Goddard School. Year-round operation. Pay varies widely by company and region. Career advancement paths often well defined at larger chains.',
    pros: 'Year-round income, multiple career paths, structured training programs',
    cons: 'Lower pay than public Pre-K, shorter vacations, ratios feel tighter',
  },
  {
    name: 'Church-Affiliated Preschool',
    description: 'Programs operated by religious institutions, often part-time (mornings only) and following the local school calendar. Lower pay but typically smaller class sizes and a community-focused environment.',
    pros: 'Smaller class sizes, school calendar, faith-aligned mission',
    cons: 'Lower pay, often part-time only, faith requirements at some programs',
  },
  {
    name: 'Montessori, Reggio Emilia, Waldorf',
    description: 'Specialized educational philosophies with distinct curriculum approaches. Montessori and Waldorf often require specific philosophy-based certification beyond standard credentials. Strong identity-driven communities of teachers.',
    pros: 'Distinctive pedagogy, deep professional development, mission-driven communities',
    cons: 'Specialized training required, fewer total job openings, can be ideologically demanding',
  },
  {
    name: 'Head Start',
    description: 'Federally funded program serving children from low-income families. Emphasis on whole-child development including health, nutrition, and family support. Federal pay scales with full benefits and summer programming.',
    pros: 'Federal benefits, mission-driven work, strong professional development funding',
    cons: 'Higher documentation burden, demanding family situations, federal funding cycles',
  },
  {
    name: 'Home-Based or Family Childcare',
    description: 'Small preschool-age programs run from a licensed home setting. Often a single provider with one or two assistants. Mixed-age groupings common. State licensing required even in home settings.',
    pros: 'Small intimate setting, simpler logistics, deep relationships with families',
    cons: 'Limited career growth, no team to share workload, isolation can be challenging',
  },
]

const credentialLadder = [
  {
    level: 'High School Diploma',
    role: 'Assistant Teacher, Floater',
    timeToEarn: 'Already have it',
    payTier: '$24,000 to $32,000',
    description: 'Sufficient for entry-level support roles in most states. Many programs offer paid CDA training to assistants who want to advance.',
  },
  {
    level: 'CDA Credential',
    role: 'Lead Teacher (in many states), Senior Assistant',
    timeToEarn: '9 to 18 months while working',
    payTier: '$28,000 to $38,000',
    description: 'Nationally recognized credential. 120 hours coursework + 480 hours experience + portfolio + verification visit. Often subsidized by employer.',
  },
  {
    level: 'Associate Degree in ECE',
    role: 'Lead Teacher, Curriculum Coordinator',
    timeToEarn: '2 years (community college)',
    payTier: '$32,000 to $42,000',
    description: 'Opens up roles in higher-end private programs and some public Pre-K positions. Many community colleges offer evening programs.',
  },
  {
    level: 'Bachelor in ECE or Elementary Education',
    role: 'Public Pre-K Teacher, Director, Specialist',
    timeToEarn: '4 years (full degree)',
    payTier: '$38,000 to $65,000',
    description: 'Required for public Pre-K in most states. Opens door to teaching license. Highest earning potential in the field.',
  },
  {
    level: 'State Teaching License',
    role: 'Public Pre-K Teacher (district employed)',
    timeToEarn: 'Bachelor + certification exams',
    payTier: '$42,000 to $70,000+',
    description: 'Combines a Bachelor degree with passing state certification exams (Praxis or state-specific). Required for district-employed teaching roles.',
  },
]

const dayInTheLife = [
  { time: '7:00 AM', activity: 'Arrive, classroom setup, review the day plan, greet first arrivals', icon: Sparkles },
  { time: '8:00 AM to 9:00 AM', activity: 'Free play, breakfast, transition to morning circle', icon: Users },
  { time: '9:00 AM to 10:00 AM', activity: 'Morning circle time, calendar, weather, group activity', icon: BookOpen },
  { time: '10:00 AM to 11:00 AM', activity: 'Centers rotation (art, sensory, blocks, dramatic play, library)', icon: Smile },
  { time: '11:00 AM to 11:45 AM', activity: 'Outdoor play and gross motor activities', icon: Sparkles },
  { time: '11:45 AM to 12:30 PM', activity: 'Lunch, conversation, hand washing routine', icon: Users },
  { time: '12:30 PM to 2:30 PM', activity: 'Nap or quiet rest time, lesson prep during this window', icon: Clock },
  { time: '2:30 PM to 3:30 PM', activity: 'Snack, afternoon centers, small group work', icon: Smile },
  { time: '3:30 PM to 5:00 PM', activity: 'Outdoor or gross motor, dismissal as parents arrive', icon: MapPin },
  { time: '5:00 PM to 6:00 PM', activity: 'Late pickup activities, classroom cleanup, end of shift', icon: Clock },
]

const goodSignsBadSigns = [
  {
    category: 'Staff turnover',
    good: 'Most teachers have been there 2+ years; assistants advance to lead roles internally',
    bad: 'Visible signs of recent staff changes, new teachers introduced every few weeks',
  },
  {
    category: 'Ratio compliance',
    good: 'Ratios meet or exceed state requirements; floaters cover breaks without classroom understaffing',
    bad: 'You are routinely left alone with more children than the state allows, even for short periods',
  },
  {
    category: 'Curriculum support',
    good: 'Time built into the schedule for lesson planning; curriculum coordinator or director provides resources',
    bad: 'Expected to plan curriculum on personal time without compensation or guidance',
  },
  {
    category: 'Parent communication',
    good: 'Clear daily communication systems (apps, notes); director mediates difficult parent conversations',
    bad: 'Teachers handle all parent escalations alone, including angry or aggressive interactions',
  },
  {
    category: 'Materials and environment',
    good: 'Classroom is well stocked; broken materials are replaced; outdoor space is maintained',
    bad: 'Teachers regularly buy supplies with personal money; equipment is visibly deteriorated',
  },
  {
    category: 'Professional development',
    good: 'Paid professional development hours; CDA training subsidized; conference attendance supported',
    bad: 'All training is unpaid, on personal time, and you cover your own credential costs',
  },
]

const stateLicensingBasics = [
  'Background check including fingerprinting (federal and state)',
  'CPR and First Aid certification (often pediatric specific)',
  'Documented health screening including TB test',
  'Mandated reporter training on recognizing and reporting abuse',
  'Annual continuing education hours (varies by state, typically 15 to 30)',
  'Safe sleep practices certification for infant and toddler rooms',
  'Medication administration training if dispensing medication',
  'Food handler permit in states that require it for snack and meal service',
]

const careerProgression = [
  {
    step: '1',
    title: 'Start as an Assistant Teacher',
    description: 'No experience required at most centers. Get exposure to multiple age groups, classroom routines, and the daily reality of working with young children. Many centers offer paid CDA training while you work.',
  },
  {
    step: '2',
    title: 'Earn Your CDA Credential',
    description: 'The CDA opens the door to lead teacher roles in most states. Centers often subsidize the cost (which runs about $425 for the assessment plus coursework expenses) for committed staff members.',
  },
  {
    step: '3',
    title: 'Move into a Lead Teacher Role',
    description: 'Take ownership of a classroom. Build curriculum design experience, parent communication skills, and assessment practices. Stay at this level long enough to develop expertise (typically 2 to 4 years).',
  },
  {
    step: '4',
    title: 'Decide Your Specialization Path',
    description: 'Three common paths emerge: deepen pedagogy expertise (Montessori certification, curriculum specialist), pursue elementary teaching credentials, or move into program leadership (director track).',
  },
  {
    step: '5',
    title: 'Advance to Director or Specialist Roles',
    description: 'Center director positions require strong operational and people management skills on top of teaching expertise. Curriculum coordinator and education specialist roles deepen instructional expertise without the operations burden.',
  },
]

const faqs = [
  {
    question: 'What is the difference between a CDA and an early childhood education degree?',
    answer: 'The CDA is a competency-based credential earned by completing 120 hours of coursework and 480 hours of supervised work experience, plus a portfolio and verification visit. It typically takes 9 to 18 months and costs $425 plus training expenses. An Associate or Bachelor degree in early childhood education is an academic credential that takes 2 or 4 years and costs significantly more, but opens doors to higher-paying positions including public Pre-K and elementary teaching pathways. The CDA is recognized nationally as a baseline for lead teacher roles in most states, while degrees are required for school district positions and most director roles.',
  },
  {
    question: 'How do preschool teacher salaries compare to elementary teachers?',
    answer: 'There is a significant gap. Preschool teachers in private programs typically earn $28,000 to $42,000. Public Pre-K teachers employed by school districts earn $42,000 to $65,000 with full benefits. Elementary teachers earn $48,000 to $75,000 on average. The pay gap reflects the difference between privately funded childcare and publicly funded education, not the difficulty of the work. Preschool teachers consistently report higher burnout rates and lower compensation despite similar demands on training and emotional labor.',
  },
  {
    question: 'Is preschool teaching emotionally demanding?',
    answer: 'Yes, more than most people outside the field appreciate. Beyond teaching, preschool teachers manage challenging behaviors, support children through emotional development, handle separation anxiety, communicate with parents under stress, and operate within ratios that often leave little margin. Burnout is common and well documented in the research literature. Programs that invest in mental health support, paid planning time, and adequate ratios retain teachers significantly better than those that do not.',
  },
  {
    question: 'What is a typical class size in a preschool classroom?',
    answer: 'State licensing dictates maximum ratios, which vary by age. For 3 year olds, ratios typically range from 1:7 to 1:10 with class sizes capped at 16 to 20 children. For 4 and 5 year olds, ratios range from 1:10 to 1:12 with class sizes up to 24. Programs serving mixed-age groups must follow the ratio for the youngest child present. Smaller class sizes than the legal maximum are widely seen as a marker of a well-run program.',
  },
  {
    question: 'Can preschool teachers transition to elementary school teaching?',
    answer: 'The transition is common but requires additional credentialing. A preschool teacher with a Bachelor degree can typically complete a teacher preparation program and pass state certification exams to become licensed in elementary education. Preschool experience is highly relevant but does not substitute for the formal certification requirements. Many states offer alternative certification pathways that allow working teachers to earn their license while teaching.',
  },
  {
    question: 'What hours do preschool jobs typically require?',
    answer: 'Most full-time preschool positions run 8 to 10 hours per day to cover the operating hours of working parents (typically 6:30 AM to 6:30 PM). Teachers usually work 7 to 9 hours of that span. Part-time positions of 4 to 6 hours per day are common in church-affiliated and morning-only programs. Public Pre-K programs follow the regular school day (typically 7:30 AM to 3:30 PM) with summers off.',
  },
]

export default async function PreschoolJobsPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'preschool', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'preschool', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Preschool Jobs Hiring Now Across the United States
          </h1>
          <p className="text-gray-700">
            Browse open preschool teaching, assistant, floater, and director positions across public Pre-K, Montessori, church-based, Head Start, and private programs nationwide.
          </p>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="preschool" />
          </aside>
          <div className="flex-1">
            
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList what={params.what || 'preschool'} where={params.where || ''} salary_min={params.salary_min} initialData={initialData} />
            </Suspense>
          </div>
        </div>

        {/* ── ROLES IN A PRESCHOOL ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">The Six Roles Inside a Preschool Classroom Team</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Preschool jobs are often listed under a single category, but the work inside a center splits across six distinct roles with different responsibilities, credentials, and pay tiers. Understanding the structure helps you target the role that fits your experience and where you want to grow.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachingRoles.map((role, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <role.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{role.role}</h3>
                <p className="text-gray-600 text-sm mb-3">{role.description}</p>
                <p className="text-sm font-bold text-green-700">{role.payRange}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SETTINGS ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Where Preschool Teachers Actually Work: Six Settings Compared</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The setting matters more than most candidates realize. A lead teacher position at a public Pre-K, a Montessori school, a church-affiliated program, and a private chain all involve teaching three and four year olds, but the daily experience, pay structure, and career trajectory diverge sharply. Here is what changes by setting.
          </p>
          <div className="space-y-4">
            {settings.map((setting, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                <h3 className="font-bold text-gray-900 text-lg mb-3">{setting.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{setting.description}</p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-green-700 mb-1">Advantages</p>
                    <p className="text-gray-600">{setting.pros}</p>
                  </div>
                  <div>
                    <p className="font-medium text-amber-700 mb-1">Trade-offs</p>
                    <p className="text-gray-600">{setting.cons}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CREDENTIAL LADDER ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">The Credential Ladder: From High School to Public Pre-K</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Preschool is one of the few teaching fields where you can start without a degree and still build a real career. Each rung of the credential ladder opens specific roles and raises the pay ceiling. This is what the progression actually looks like.
          </p>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 gap-px bg-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="bg-white px-4 py-3">Credential Level</div>
              <div className="bg-white px-4 py-3">Roles Available</div>
              <div className="bg-white px-4 py-3">Time to Earn</div>
              <div className="bg-white px-4 py-3 text-right">Pay Tier</div>
            </div>
            {credentialLadder.map((item, i) => (
              <div key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-4 py-4`}>
                <div className="grid grid-cols-4 gap-4 mb-2">
                  <div className="text-sm font-semibold text-gray-900">{item.level}</div>
                  <div className="text-sm text-gray-700">{item.role}</div>
                  <div className="text-sm text-gray-600">{item.timeToEarn}</div>
                  <div className="text-sm font-bold text-green-700 text-right">{item.payTier}</div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── DAY IN THE LIFE ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">A Real Day in a Preschool Classroom</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Job descriptions for preschool teaching tend to be vague about what the work actually involves moment to moment. Here is a typical day in a full-day preschool classroom, mapped hour by hour. The exact schedule varies, but the structure is consistent across most settings.
          </p>
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="space-y-4">
              {dayInTheLife.map((item, i) => (
                <div key={i} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <item.icon className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.time}</p>
                    <p className="text-sm text-gray-600">{item.activity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── GOOD SIGNS BAD SIGNS ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">How to Spot a Preschool Worth Working For</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The preschool industry has wide variation in working conditions. A center that pays $28,000 with strong support and reasonable ratios is often a better job than one paying $32,000 with chronic understaffing. These six markers separate the centers worth your time from the ones that will burn you out.
          </p>
          <div className="space-y-4">
            {goodSignsBadSigns.map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 font-semibold text-gray-900 text-sm">{item.category}</div>
                <div className="grid md:grid-cols-2 divide-x divide-gray-100">
                  <div className="p-5">
                    <p className="text-xs font-medium text-green-700 mb-2 uppercase tracking-wider">Good sign</p>
                    <p className="text-sm text-gray-700">{item.good}</p>
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-medium text-red-700 mb-2 uppercase tracking-wider">Warning sign</p>
                    <p className="text-sm text-gray-700">{item.bad}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CAREER PROGRESSION ── */}
        <section className="mt-20 bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Sparkles className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">The Five-Step Career Progression in Preschool Teaching</h2>
              <p className="text-gray-700 mb-6">
                Preschool teaching is often presented as a flat career with limited growth. The reality is that there is a clear progression path for teachers who want to advance, with multiple specialization options after the first few years. Here is how that path actually plays out.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {careerProgression.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-5">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-amber-100 text-amber-700 font-bold rounded-full text-sm mb-3">{item.step}</span>
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── STATE LICENSING ── */}
        <section className="mt-20">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">State Licensing Requirements You Should Expect</h2>
                <p className="text-gray-700 mb-4">
                  Every state regulates childcare and preschool programs. Some requirements are universal across states; others vary considerably. Below are the credentials and clearances that most preschool teachers complete before stepping into a classroom, plus the ongoing requirements that maintain compliance.
                </p>
                <div className="grid md:grid-cols-2 gap-3 mt-4">
                  {stateLicensingBasics.map((item, index) => (
                    <div key={index} className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Specific requirements vary by state. Verify with your state Department of Early Childhood or licensing authority before applying for positions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── EMOTIONAL DEMANDS ── */}
        <section className="mt-20">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <Heart className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">The Emotional Side of the Job Nobody Talks About in Interviews</h2>
                <p className="text-gray-700 mb-4">
                  Preschool teachers handle emotional labor that few other professions encounter at the same volume. Children at this age are still building emotional regulation, dealing with separation from parents, processing big feelings, and navigating their first social conflicts. Teachers are the first responders for all of it.
                </p>
                <p className="text-gray-700 mb-4">
                  The work also exposes teachers to challenging family situations. Children carry their home environment into the classroom, and preschool teachers regularly become aware of food insecurity, custody conflicts, mental health crises among parents, and sometimes signs of neglect or abuse. As mandated reporters, teachers also carry the weight of when and how to report concerns.
                </p>
                <p className="text-gray-700">
                  Programs that take this seriously provide reflective supervision, regular debriefs after difficult days, paid mental health days, and access to employee assistance programs. Centers that ignore the emotional dimension of the work see burnout rates above 40 percent annually. When you evaluate a preschool position, ask directly how the program supports teachers through emotionally demanding situations. The answer reveals a lot about how the leadership thinks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Preschool Jobs</h2>
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
            <strong>Disclaimer:</strong> This page provides general information about preschool careers in the United States. Credential requirements, ratios, and licensing standards vary by state and may change. Pay figures are illustrative and reflect typical ranges reported by industry sources; actual compensation depends on the employer, location, role, and credentials. Before pursuing a credential or accepting a position, verify the specific requirements through your state Department of Early Childhood Education or licensing authority. The CDA credential is administered by the Council for Professional Recognition; current requirements and fees are listed on their official website.
          </p>
        </section>
      </div>
    </>
  )
}