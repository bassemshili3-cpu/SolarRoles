import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Factory, Clock, Shield, FileText, DollarSign, MapPin, CheckCircle, AlertTriangle, BookOpen, Users, Briefcase, Award, TrendingUp, Wrench, Zap, Settings } from 'lucide-react'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Manufacturing Jobs Hiring Now | Production, Assembly, CNC & Quality Roles Across the US',
  description: 'CNC machinists, production operators, assemblers, and quality inspectors wanted across U.S. plants. Day, swing, and night shifts with pay details listed.',
  keywords: 'manufacturing jobs, production jobs, factory jobs, CNC machinist jobs, assembly jobs, quality inspector jobs, maintenance technician jobs, manufacturing engineer jobs, warehouse manufacturing',
  openGraph: {
    title: 'Manufacturing Jobs Hiring Now | Production & Skilled Trades Across the US',
    description: 'Browse open manufacturing positions including operators, machinists, assemblers, quality inspectors, and maintenance technicians. Strong wages, full benefits, multiple shifts.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Manufacturing Jobs | Production, CNC, Assembly, Quality',
    description: 'Hundreds of manufacturing positions open across the United States. Entry-level to senior roles. Day, swing, night, and weekend shifts available.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/manufacturing-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Manufacturing Jobs',
  description: 'Find manufacturing jobs hiring across the United States in production, CNC, assembly, quality, and maintenance.',
  url: 'https://www.oh-my-job.com/manufacturing-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Manufacturing Jobs',
    description: 'Current manufacturing production, machining, assembly, and quality positions across the US',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What manufacturing jobs are in highest demand in 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'CNC machinists, industrial maintenance technicians, automation technicians, quality inspectors, and welders are the highest-demand roles in 2026. The reshoring of semiconductor and battery manufacturing has created sustained demand for technicians who can operate and maintain automated production lines. Skilled trade shortages mean wages have grown faster in manufacturing than in many office sectors.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you need a degree for a manufacturing job?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, most manufacturing roles do not require a four-year degree. Entry-level production positions require a high school diploma or GED. Skilled trades (CNC machining, welding, industrial maintenance) typically require a technical certificate from a community college or trade school, which takes 6 months to 2 years. Manufacturing engineering and quality engineering roles require an Associate or Bachelor degree.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does a typical manufacturing shift look like?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most manufacturing facilities run three shifts: first shift (typically 6 AM to 2 PM), second shift or swing (2 PM to 10 PM), and third shift or night (10 PM to 6 AM). Some plants run 12-hour shifts in a 2-2-3 rotation (Pitman schedule), giving workers every other weekend off. Shift differentials add 5 to 15 percent to base pay for second and third shifts.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much do manufacturing jobs pay?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Production operators typically earn $17 to $24 per hour. Assemblers earn $16 to $22 per hour. CNC machinists earn $22 to $35 per hour. Industrial maintenance technicians earn $25 to $40 per hour. Quality inspectors earn $20 to $32 per hour. Manufacturing supervisors earn $65,000 to $95,000 per year. Union shops typically pay 15 to 25 percent more than non-union for equivalent roles.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are manufacturing jobs being replaced by automation?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Some manual production work is being automated, but the net effect on employment is more nuanced than the headlines suggest. Routine assembly work is shrinking, but automation has created strong demand for technicians who can program, operate, and maintain robotic systems. The roles disappearing are also the lowest-paying. The roles growing pay significantly more and require technical training.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the best path to start a manufacturing career?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The fastest path is to apply for an entry-level production role at a stable employer, then use their tuition assistance program to earn a technical certificate while working. Most large manufacturers reimburse 80 to 100 percent of community college costs for relevant programs. Within 2 to 3 years, you can move from production operator into a skilled trade role with significantly higher pay and stability.',
      },
    },
  ],
}

const productionRoles = [
  {
    role: 'Production Operator',
    description: 'Runs machines and equipment on the production floor. Loads materials, monitors output, performs basic quality checks, and handles minor adjustments. Entry-level role for most manufacturing careers. High school diploma typically sufficient.',
    payRange: '$17 to $24/hr',
    icon: Settings,
  },
  {
    role: 'CNC Machinist',
    description: 'Operates and programs computer numerical control (CNC) machines that cut precision parts from metal, plastic, and composites. Reads blueprints, sets up tooling, monitors machine performance, and inspects finished parts. Trade school certificate preferred.',
    payRange: '$22 to $35/hr',
    icon: Settings,
  },
  {
    role: 'Assembler',
    description: 'Builds finished products from components following work instructions and assembly diagrams. Common in electronics, automotive, and consumer goods manufacturing. Manual dexterity and attention to detail are core requirements.',
    payRange: '$16 to $22/hr',
    icon: Wrench,
  },
  {
    role: 'Welder',
    description: 'Joins metal parts using MIG, TIG, stick, or flux-core welding processes. Reads blueprints and weld symbols. Works in fabrication, structural construction, and pipefitting environments. Certification through AWS or state programs significantly increases pay.',
    payRange: '$22 to $38/hr',
    icon: Zap,
  },
  {
    role: 'Quality Inspector',
    description: 'Inspects parts and finished products against specifications using calipers, micrometers, gauges, and coordinate measuring machines (CMM). Documents results and flags defects. Bridge role between production and engineering.',
    payRange: '$20 to $32/hr',
    icon: CheckCircle,
  },
  {
    role: 'Industrial Maintenance Technician',
    description: 'Repairs and maintains production equipment including motors, hydraulics, pneumatics, PLCs, and conveyor systems. Highest-demand role in manufacturing right now due to widespread shortages. Requires electrical and mechanical knowledge.',
    payRange: '$25 to $40/hr',
    icon: Wrench,
  },
  {
    role: 'Forklift Operator',
    description: 'Moves materials, components, and finished products around the production facility and warehouse. Forklift certification required. Often combined with other warehouse duties. Many production operators rotate into this role for variety.',
    payRange: '$17 to $24/hr',
    icon: Briefcase,
  },
  {
    role: 'Manufacturing Engineer',
    description: 'Designs production processes, troubleshoots quality issues, drives continuous improvement projects, and manages capital equipment installations. Requires engineering degree (mechanical, industrial, or manufacturing). Strong career advancement path.',
    payRange: '$70,000 to $115,000/yr',
    icon: TrendingUp,
  },
  {
    role: 'Production Supervisor',
    description: 'Manages a shift of 15 to 40 production workers. Handles scheduling, performance management, training, safety compliance, and production targets. Often promoted from senior production roles. Strong people skills required.',
    payRange: '$65,000 to $95,000/yr',
    icon: Users,
  },
]

const sectorsByGrowth = [
  {
    sector: 'Semiconductor Manufacturing',
    growth: 'Explosive (2024 to 2030)',
    description: 'CHIPS Act funding has triggered a major wave of fab construction across Arizona, Texas, Ohio, and New York. TSMC, Intel, Samsung, and Micron are hiring tens of thousands of technicians and engineers. Cleanroom training and electrical aptitude are core requirements.',
    payTier: 'Above average',
  },
  {
    sector: 'Battery and EV Manufacturing',
    growth: 'Strong',
    description: 'Battery plants in Tennessee, Kentucky, Georgia, and Michigan are ramping up. Automotive OEMs and battery cell suppliers (LG, Panasonic, SK On) are hiring production operators, maintenance technicians, and process engineers in volume.',
    payTier: 'Above average',
  },
  {
    sector: 'Aerospace and Defense',
    growth: 'Steady high demand',
    description: 'Boeing, Lockheed Martin, RTX, and tier-one suppliers continue hiring across the country. Strong demand for CNC machinists, composite technicians, welders with aerospace certifications, and quality inspectors familiar with AS9100 standards.',
    payTier: 'Premium',
  },
  {
    sector: 'Food and Beverage Processing',
    growth: 'Stable',
    description: 'Largest manufacturing employer by headcount. Production operator and machine operator roles dominate. Lower entry barriers and pay than other sectors, but stable employment and clear progression paths through plant supervisor and quality roles.',
    payTier: 'Entry level to mid',
  },
  {
    sector: 'Medical Devices and Pharma',
    growth: 'Strong',
    description: 'FDA-regulated environments with strict quality requirements. Cleanroom production, assembly, and quality inspection roles. Pay premium for experience in GMP (Good Manufacturing Practices) environments. Concentrated in Massachusetts, New Jersey, Minnesota, Indiana, and California.',
    payTier: 'Above average',
  },
  {
    sector: 'Industrial Machinery',
    growth: 'Moderate',
    description: 'Heavy equipment, agricultural machinery, and industrial automation OEMs (Caterpillar, John Deere, Rockwell Automation). Strong demand for skilled welders, CNC machinists, and assembly technicians. Concentrated in Illinois, Iowa, Wisconsin, and the Carolinas.',
    payTier: 'Above average',
  },
]

const shiftTypes = [
  {
    name: 'First Shift (Day)',
    hours: '6:00 AM to 2:00 PM or 7:00 AM to 3:00 PM',
    description: 'The default shift at most facilities. Highest competition for positions because of the traditional schedule. Base pay rate with no shift differential. Best for workers with children in school or other daytime commitments.',
    differential: 'None (base rate)',
  },
  {
    name: 'Second Shift (Swing)',
    hours: '2:00 PM to 10:00 PM or 3:00 PM to 11:00 PM',
    description: 'Common at facilities running two or three shifts. Easier to get hired than first shift. Suits workers who want mornings free for appointments, school, or family. Modest pay premium over first shift.',
    differential: '+5 to +10 percent',
  },
  {
    name: 'Third Shift (Night)',
    hours: '10:00 PM to 6:00 AM or 11:00 PM to 7:00 AM',
    description: 'The most physically demanding shift due to sleep disruption. Usually pays the highest differential. Easier to get hired because fewer workers want night work. Some workers stay on nights for years because they prefer the quieter environment and pay bump.',
    differential: '+10 to +15 percent',
  },
  {
    name: 'Pitman Schedule (2-2-3)',
    hours: '12-hour shifts, alternating days and nights',
    description: 'Used by continuous-operation plants. You work 2 days on, 2 off, 3 on, then flip. Results in every other weekend completely off. Brutal physically but loved by workers who value extended time off.',
    differential: 'Built into schedule design',
  },
  {
    name: 'Weekend Shift (Baylor)',
    hours: 'Friday, Saturday, Sunday, 12 hours each',
    description: 'Three 12-hour shifts over the weekend at full-time pay (36 hours paid as 40). Mon-Thu off entirely. Hugely popular with workers in school, with second jobs, or balancing childcare. Limited availability at most facilities.',
    differential: 'Full-time pay for 36 hours',
  },
]

const certifications = [
  {
    name: 'OSHA 10 or OSHA 30',
    purpose: 'Workplace safety fundamentals',
    timeToEarn: '10 or 30 hours of online training',
    payImpact: 'Often required to be hired',
    cost: '$60 to $180',
  },
  {
    name: 'Forklift Certification',
    purpose: 'Operate industrial powered trucks safely',
    timeToEarn: '1 to 2 days',
    payImpact: '+$1 to +$3 per hour',
    cost: '$50 to $150 (often employer-provided)',
  },
  {
    name: 'AWS Certified Welder',
    purpose: 'Validates welding skill in specific processes',
    timeToEarn: 'Practical test (skills already required)',
    payImpact: '+$3 to +$8 per hour',
    cost: '$300 to $1,000 per test',
  },
  {
    name: 'CNC Operator Certificate',
    purpose: 'Operate computer-controlled machine tools',
    timeToEarn: '6 to 12 months at community college',
    payImpact: '+$5 to +$10 per hour vs production',
    cost: '$2,000 to $6,000 (often employer-reimbursed)',
  },
  {
    name: 'NIMS Machining Credentials',
    purpose: 'Industry-recognized machinist competencies',
    timeToEarn: 'Varies by credential level',
    payImpact: '+$2 to +$6 per hour per credential',
    cost: '$50 to $200 per exam',
  },
  {
    name: 'Six Sigma (Yellow, Green, Black Belt)',
    purpose: 'Process improvement and quality methodology',
    timeToEarn: '1 week to 6 months depending on belt',
    payImpact: 'Significant for engineering/supervisor roles',
    cost: '$200 to $4,500 depending on level',
  },
  {
    name: 'PLC Programming Certificate',
    purpose: 'Program industrial automation controllers',
    timeToEarn: '3 to 6 months',
    payImpact: '+$5 to +$15 per hour for maintenance',
    cost: '$500 to $3,000',
  },
]

const dayInTheLife = [
  { time: '5:45 AM', activity: 'Arrive early, change into PPE (steel-toe boots, safety glasses, hearing protection)', icon: Shield },
  { time: '6:00 AM', activity: 'Shift handover meeting: outgoing shift briefs on machine status and issues', icon: Users },
  { time: '6:15 AM', activity: 'Pre-shift safety walkthrough and machine inspection', icon: CheckCircle },
  { time: '6:30 AM to 9:30 AM', activity: 'Run production cycles, monitor quality, log output every hour', icon: Settings },
  { time: '9:30 AM to 9:45 AM', activity: 'First 15-minute break', icon: Clock },
  { time: '9:45 AM to 11:30 AM', activity: 'Continue production, handle a brief tooling changeover', icon: Wrench },
  { time: '11:30 AM to 12:00 PM', activity: 'Lunch break (30 minutes, often in plant cafeteria or break room)', icon: Clock },
  { time: '12:00 PM to 1:45 PM', activity: 'Afternoon production, quality samples sent to lab', icon: Settings },
  { time: '1:45 PM to 2:00 PM', activity: 'Final break, prep for shift handover', icon: Clock },
  { time: '2:00 PM', activity: 'Handover to second shift, document final production numbers, clean workstation', icon: FileText },
]

const careerProgression = [
  {
    step: '1',
    title: 'Entry as Production Operator',
    description: 'Apply directly to any production facility with no prior experience. Most employers train on the job. Focus on building reliability, learning the equipment, and observing which skilled trades match your interests.',
  },
  {
    step: '2',
    title: 'Use Tuition Assistance to Earn a Trade Certificate',
    description: 'Most manufacturers reimburse community college tuition for production workers (80 to 100 percent). Pursue a CNC, welding, or industrial maintenance certificate while working full-time. This typically takes 1 to 2 years.',
  },
  {
    step: '3',
    title: 'Move into a Skilled Trade Role',
    description: 'Once certified, transition internally into a skilled trade position. Internal transfers happen faster than external hiring because the company already knows your work ethic. Expect a pay increase of $4 to $10 per hour at this step.',
  },
  {
    step: '4',
    title: 'Specialize and Build Senior Skills',
    description: 'Spend 3 to 5 years deepening expertise. CNC machinists move to programming or 5-axis work. Maintenance technicians add PLC programming. Welders pursue certifications in aerospace or pressure vessel work. Each specialization adds significant pay.',
  },
  {
    step: '5',
    title: 'Advance to Lead, Supervisor, or Engineering',
    description: 'Three common paths: become a shift lead or supervisor (people management), move into manufacturing engineering (requires Associate or Bachelor degree, often employer-funded), or become a maintenance lead/reliability engineer for senior technical roles.',
  },
]

const evaluatingEmployers = [
  {
    title: 'How Old is the Equipment?',
    description: 'A facility with 30-year-old machines breaking down constantly is a different job than a modern automated plant. Ask about the average age of production equipment and the capital investment plans for the next 2 to 3 years. Companies that reinvest in equipment also tend to reinvest in their workers.',
  },
  {
    title: 'What is the Tuition Assistance Policy?',
    description: 'The single most important benefit for career growth in manufacturing. Companies offering 80 to 100 percent tuition reimbursement for relevant technical programs are signaling commitment to internal advancement. Ask for the specific policy in writing, including any service commitment after completion.',
  },
  {
    title: 'How is Overtime Distributed?',
    description: 'Some facilities mandate overtime constantly, eating into personal time. Others have stable schedules with optional OT. Some pay double-time on Sundays, others pay only time-and-a-half. Ask current employees if you get a chance during the interview process. Overtime culture varies dramatically and affects quality of life.',
  },
  {
    title: 'What Does Internal Promotion Look Like?',
    description: 'Ask how many of the current supervisors started in production roles at the company. A facility where 60 percent of supervisors were promoted internally signals real opportunity. A facility where all supervisors were hired externally signals a glass ceiling for production workers.',
  },
]

const safetyConsiderations = [
  'Heavy lifting requirements (often 25 to 50 pounds repeatedly throughout the shift)',
  'Standing or walking for 8 to 12 hour shifts on concrete floors',
  'Exposure to noise above 85 decibels (hearing protection required)',
  'Working near or with hot materials, sharp tools, or moving machinery',
  'Potential exposure to chemicals, solvents, or cutting fluids depending on the role',
  'Temperature extremes in some environments (foundries hot, cold storage cold)',
  'Repetitive motion that can lead to long-term injuries without proper rotation',
  'Eye strain from precision inspection work in some quality and assembly roles',
]

const faqs = [
  {
    question: 'How does shift differential actually affect take-home pay?',
    answer: 'A 10 percent shift differential on a $20 per hour base rate adds $2 per hour, bringing your effective rate to $22 per hour. Over a 40-hour week, that is an extra $80 before tax, or roughly $4,000 per year. Combined with overtime pay (which compounds on the higher rate), workers on second or third shift often earn $5,000 to $10,000 more per year than first-shift peers with identical roles. This is one reason experienced workers sometimes prefer night shifts despite the lifestyle trade-offs.',
  },
  {
    question: 'Is union or non-union manufacturing better?',
    answer: 'Both have trade-offs. Union shops typically pay 15 to 25 percent more for equivalent roles, offer stronger pensions, and have grievance procedures that protect workers from arbitrary decisions. Non-union shops tend to have more flexibility in scheduling, faster internal promotions, and sometimes profit-sharing or stock plans. Union dues run 1 to 3 percent of wages. In high cost-of-living areas, union shops are often financially better; in lower cost areas, the comparison is closer. The cultural fit matters as much as the compensation.',
  },
  {
    question: 'What is the difference between a CNC operator and a CNC machinist?',
    answer: 'A CNC operator loads parts, starts the machine, monitors production, and changes tooling when prompted. The role can be learned in weeks. A CNC machinist also reads blueprints, programs the machine, sets up tooling from scratch, troubleshoots quality issues, and modifies programs to optimize cycle time. Machinists earn $8 to $15 more per hour than operators. The transition from operator to machinist is one of the highest-ROI moves in manufacturing.',
  },
  {
    question: 'Can I make a career change into manufacturing from another field?',
    answer: 'Yes, manufacturing is one of the most accessible fields for career transitions because most roles do not require specific prior experience. People coming from retail, food service, military, or warehousing often transition successfully into production operator roles, then advance from there. Veterans in particular tend to do well in manufacturing because of the structure and team-based work. The main adjustment is the physical demands and the shift schedule.',
  },
  {
    question: 'How concerning is the long-term automation trend?',
    answer: 'The automation conversation has been ongoing for decades and the reality has consistently been more nuanced than predictions. Routine assembly work has shrunk. Skilled technical roles have grown. The total manufacturing workforce has remained relatively stable despite massive productivity gains because output has expanded. What matters most is positioning yourself in roles that work alongside automation (maintenance, programming, quality engineering) rather than roles that compete with it (manual repetitive tasks).',
  },
  {
    question: 'What benefits do most manufacturing employers offer?',
    answer: 'Standard benefits at mid to large manufacturers include health insurance (often available day one or after 30 days), dental and vision, 401(k) with company match (typically 3 to 6 percent), paid time off (usually starting at 2 weeks per year), tuition reimbursement, and uniform or PPE allowance. Larger employers and union shops often add pension plans, more generous PTO accrual, employee assistance programs, and on-site clinics. Manufacturing benefits are typically stronger than retail or hospitality benefits at the same wage level.',
  },
]

export default async function ManufacturingJobsPage({ searchParams }: any) {
  const params = await searchParams

  const [{ count }, initialData] = await Promise.all([
    getMergedJobCount(params.what || 'manufacturing', params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
    searchMergedJobs({ what: params.what || 'manufacturing', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Manufacturing Jobs Hiring Now Across the United States
          </h1>
          <p className="text-gray-700">
            Browse open manufacturing positions including production operators, CNC machinists, welders, assemblers, quality inspectors, and maintenance technicians. Multiple shifts and skill levels available.
          </p>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="manufacturing" />
          </aside>
          <div className="flex-1">
            {count > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">{count.toLocaleString()}</span> manufacturing positions available
              </p>
            )}
            <AIJobMatcherWrapper />
            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList what={params.what || 'manufacturing'} where={params.where || ''} salary_min={params.salary_min} initialData={initialData} />
            </Suspense>
          </div>
        </div>

        {/* ── PRODUCTION ROLES MAP ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Factory className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">The Nine Roles That Run a Modern Manufacturing Plant</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            "Manufacturing" sounds like a single job category until you walk through a real production facility. Inside, there are nine distinct roles with different skill requirements, pay tiers, and growth paths. Understanding the map helps you target the right entry point and plan your career trajectory.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productionRoles.map((role, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <role.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{role.role}</h3>
                <p className="text-gray-600 text-sm mb-3">{role.description}</p>
                <p className="text-sm font-bold text-green-700">{role.payRange}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTORS BY GROWTH ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Six Manufacturing Sectors and Where Hiring is Strongest</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Manufacturing is not one industry. The semiconductor boom triggered by the CHIPS Act looks completely different from food and beverage processing in terms of pay, training requirements, and geographic concentration. Knowing which sector you are targeting changes everything from where to apply to which certifications matter.
          </p>
          <div className="space-y-4">
            {sectorsByGrowth.map((sector, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-3">
                  <h3 className="font-bold text-gray-900 text-lg">{sector.sector}</h3>
                  <div className="flex flex-col md:items-end gap-1">
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded">{sector.growth}</span>
                    <span className="text-xs font-semibold text-green-700">{sector.payTier}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{sector.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SHIFTS ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Five Shift Patterns That Define Manufacturing Work</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The shift you work in manufacturing affects pay, family life, and physical health more than almost any other variable. Most workers do not realize how much shift selection matters until they have done multiple. Here are the five patterns you will encounter and what each one trades off.
          </p>
          <div className="space-y-4">
            {shiftTypes.map((shift, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{shift.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{shift.hours}</p>
                  </div>
                  <span className="text-sm font-bold text-green-700 whitespace-nowrap">{shift.differential}</span>
                </div>
                <p className="text-gray-600 text-sm">{shift.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CERTIFICATIONS ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-amber-600" />
            <h2 className="text-2xl font-bold text-gray-900">Manufacturing Certifications That Pay Off</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Unlike most fields, manufacturing certifications translate directly into hourly wage increases that are easy to quantify. Pursuing the right credential at the right career stage can add several dollars per hour. Most are achievable in 6 to 18 months while working, and many are fully reimbursed by employers.
          </p>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 gap-px bg-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="bg-white px-4 py-3">Certification</div>
              <div className="bg-white px-4 py-3">Time to Earn</div>
              <div className="bg-white px-4 py-3">Pay Impact</div>
              <div className="bg-white px-4 py-3 text-right">Typical Cost</div>
            </div>
            {certifications.map((cert, i) => (
              <div key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} px-4 py-4`}>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{cert.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{cert.purpose}</p>
                  </div>
                  <div className="text-sm text-gray-700">{cert.timeToEarn}</div>
                  <div className="text-sm font-bold text-green-700">{cert.payImpact}</div>
                  <div className="text-sm text-gray-600 text-right">{cert.cost}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CAREER PROGRESSION ── */}
        <section className="mt-20 bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <TrendingUp className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">From Production Floor to Six Figures: The Real Path</h2>
              <p className="text-gray-700 mb-6">
                Manufacturing is one of the few remaining career fields where you can start without a degree and reach six-figure earnings within 10 years. The path is well established but rarely explained clearly. Here are the five steps that consistently work.
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

        {/* ── DAY IN THE LIFE ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">A First Shift in a Production Facility, Hour by Hour</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Manufacturing shifts have a structured rhythm that is very different from office work. Below is a typical first shift for a production operator at a mid-sized facility. The exact tasks vary by industry, but the structure (handover, run cycles, breaks, handover) is consistent across most plants.
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

        {/* ── EVALUATING EMPLOYERS ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Four Questions That Reveal a Good Manufacturing Employer</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            The gap between a good manufacturing employer and a bad one is enormous, and you cannot tell from the job posting. Both will pay similar wages and offer similar benefits. The differences show up in equipment quality, advancement opportunity, and how they actually treat production workers. These four questions surface the truth fast.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {evaluatingEmployers.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-green-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 font-bold rounded-full text-sm mb-4">{index + 1}</span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SAFETY AND PHYSICAL DEMANDS ── */}
        <section className="mt-20">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">The Physical Reality of Manufacturing Work</h2>
                <p className="text-gray-700 mb-4">
                  Manufacturing pays well in part because the work is physically demanding in ways that office jobs are not. Most job postings glossover this reality. Here is what to expect in terms of physical demands so you can evaluate whether the trade-off makes sense for you. These conditions vary by role and sector, but most production environments include several of them.
                </p>
                <div className="grid md:grid-cols-2 gap-3 mt-4">
                  {safetyConsiderations.map((item, index) => (
                    <div key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  Modern facilities have made significant safety improvements over the past decade. PPE requirements, ergonomic redesigns, and automation of dangerous tasks have all reduced injury rates. But the work remains physical, and the body adjustments take 30 to 60 days for new workers entering the field.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── BENEFITS LANDSCAPE ── */}
        <section className="mt-20">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">The Benefits Landscape: What Manufacturing Really Offers</h2>
                <p className="text-gray-700 mb-4">
                  Manufacturing benefits tend to be stronger than retail or hospitality at the same wage level, which significantly affects total compensation. The headline hourly rate often understates what you actually take home in real value once benefits are factored in.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  {[
                    { title: 'Health insurance starting fast', detail: 'Many manufacturers offer health coverage starting day one or after 30 days, with the company covering 70 to 90 percent of the premium. Family coverage typically adds $200 to $500 per month out of pocket.' },
                    { title: '401(k) with meaningful match', detail: 'Typical match is 50 percent of contributions up to 6 percent of salary, sometimes higher at union shops and large employers. Vesting periods range from immediate to 5 years cliff vesting.' },
                    { title: 'Tuition reimbursement is real', detail: 'Most large manufacturers offer $5,000 to $10,000 per year in tuition reimbursement for relevant programs. This is one of the most underused benefits in the field.' },
                    { title: 'Pension plans still exist', detail: 'Union shops and some legacy manufacturers still offer defined-benefit pension plans, increasingly rare elsewhere in the economy. These can add significant value to long-term compensation.' },
                  ].map((item, index) => (
                    <div key={index} className="bg-white rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm">{item.title}</h3>
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
            <BookOpen className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Manufacturing Jobs</h2>
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
            <strong>Disclaimer:</strong> This page provides general information about manufacturing careers in the United States. Pay figures are illustrative and reflect typical ranges reported by industry sources; actual compensation depends on the employer, location, role, shift, and experience level. Certification programs, costs, and pay impacts vary by region and industry sector. Workplace safety standards are set by OSHA at the federal level, with additional state-level requirements in some jurisdictions. Before accepting a position, verify specific terms with the prospective employer. Oh My Job is not affiliated with any of the manufacturers or certification bodies mentioned on this page.
          </p>
        </section>
      </div>
    </>
  )
}