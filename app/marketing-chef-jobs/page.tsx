import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import {
  Briefcase,
  ChefHat,
  TrendingUp,
  DollarSign,
  MapPin,
  Layers,
  Star,
  AlertCircle,
  BookOpen,
  Camera,
  FlaskConical,
  Megaphone,
  Users,
  Award,
} from 'lucide-react'
import { AdzunaSearchResult, getCachedJobCount, searchJobs } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Marketing Chef Jobs | Culinary & Brand Roles',
  description:
    'CPG brands, foodservice companies, and restaurant groups need marketing chefs for demo cooking, test kitchen, and culinary brand strategy work.',
  keywords:
    'marketing chef jobs, marketing chef hiring, demo chef jobs, culinary brand ambassador, test kitchen chef, active marketing chef, foodservice marketing chef, culinary marketing jobs',
  openGraph: {
    title: 'Marketing Chef Jobs | Demo Chef & Brand Ambassador Roles',
    description:
      'CPG brands and foodservice companies are urgently hiring marketing chefs. Browse open roles in demo cooking, brand strategy, and test kitchen development.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marketing Chef Jobs | CPG, Foodservice & Test Kitchen',
    description:
      'Hundreds of marketing chef roles are open right now. From active demo chefs to corporate culinary strategists — find your fit and apply today.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/marketing-chef-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Marketing Chef Jobs',
  description:
    'Browse marketing chef jobs hiring now across the United States. Roles span demo cooking, test kitchen development, culinary brand strategy, and foodservice sales support.',
  url: 'https://www.oh-my-job.com/marketing-chef-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Marketing Chef Jobs',
    description: 'Current job listings for marketing chef professionals in the United States',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What does a marketing chef do?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A marketing chef is a culinary professional who uses their kitchen expertise to support brand, sales, or product goals. Responsibilities typically include live product demonstrations, recipe development for marketing campaigns, trade show appearances, menu consulting for retail or foodservice clients, and on-camera content creation for a brand.',
      },
    },
    {
      '@type': 'Question',
      name: 'What industries hire marketing chefs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Marketing chefs are most commonly hired by consumer packaged goods companies, ingredient and spice brands, commercial kitchen equipment manufacturers, foodservice distributors, restaurant chains at the corporate level, culinary media platforms, and grocery retailers developing private-label products.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much do marketing chefs earn?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Compensation varies by specialization and employer size. Entry-level demo chef roles typically start between $45,000 and $55,000 per year. Mid-level corporate marketing chefs earn $65,000 to $90,000. Senior culinary brand strategists at major CPG companies can exceed $120,000 annually, particularly in metro markets.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you need a culinary degree to be a marketing chef?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A formal culinary degree is beneficial but not universally required. Most employers prioritize professional kitchen experience, a demonstrable ability to translate food into compelling narratives, and comfort in front of audiences or cameras. Certifications from organizations like the Research Chefs Association can strengthen a candidate\'s profile significantly.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is an "active marketing chef" specifically?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The "active marketing chef" title is used most often in foodservice distribution and ingredient sales. In this role, a chef travels a defined territory to demonstrate products directly to restaurant operators, institutional kitchens, and food buyers. The position blends culinary skill with relationship-driven sales and is one of the most field-intensive marketing chef roles available.',
      },
    },
  ],
}

/* ─── SECTION DATA ──────────────────────────────────────────── */

const roleSubtypes = [
  {
    title: 'Active Marketing Chef',
    icon: Megaphone,
    color: 'orange',
    description:
      'The most field-facing of all marketing chef roles. Active marketing chefs travel a defined sales territory to demonstrate products — typically ingredients, seasonings, or kitchen equipment — directly to operators, buyers, and culinary decision-makers. The job is equal parts cooking and relationship management.',
    typicalEmployers: 'Foodservice distributors, ingredient suppliers, spice and sauce brands',
    travel: 'High (30–60% of the time)',
    salaryRange: '$55,000–$85,000 + commission or bonus',
  },
  {
    title: 'Test Kitchen Chef',
    icon: FlaskConical,
    color: 'blue',
    description:
      'Test kitchen chefs develop, iterate, and standardize recipes that will be used in marketing campaigns, packaging, digital content, or product launches. The role requires both precision and creativity — a recipe that photographs well, scales reliably, and represents the brand is not easy to build, and employers pay accordingly.',
    typicalEmployers: 'CPG companies, meal kit brands, grocery retailers with private-label programs',
    travel: 'Low (office or facility-based)',
    salaryRange: '$60,000–$100,000',
  },
  {
    title: 'Culinary Brand Ambassador',
    icon: Star,
    color: 'purple',
    description:
      'Brand ambassadors represent a company publicly — at trade shows, press events, media appearances, and consumer activations. They are the face of the brand in culinary contexts, and employers look for professionals who combine genuine kitchen authority with the confidence to perform in front of an audience or camera.',
    typicalEmployers: 'Kitchen equipment brands, premium food and beverage labels, culinary media',
    travel: 'Variable (event-driven)',
    salaryRange: '$65,000–$110,000',
  },
  {
    title: 'Corporate R&D Marketing Chef',
    icon: ChefHat,
    color: 'green',
    description:
      'This role sits at the intersection of food science and brand strategy. Corporate R&D marketing chefs develop new products with both technical integrity and commercial viability in mind. They work directly with product developers, marketers, and retailers to ensure that what gets launched is both culinarily credible and strategically positioned.',
    typicalEmployers: 'Large CPG companies, foodservice chains, flavor and ingredient manufacturers',
    travel: 'Low to moderate',
    salaryRange: '$80,000–$130,000',
  },
  {
    title: 'Culinary Content Chef',
    icon: Camera,
    color: 'pink',
    description:
      'A growing and increasingly formalized role. Culinary content chefs create recipe videos, photography content, and written guides for brand channels — social media, e-commerce listings, brand websites, and email campaigns. The ideal candidate combines strong cooking fundamentals with a self-starter instinct for digital storytelling.',
    typicalEmployers: 'DTC food brands, meal kit companies, culinary media platforms',
    travel: 'Minimal',
    salaryRange: '$50,000–$85,000',
  },
  {
    title: 'Foodservice Sales Chef',
    icon: Users,
    color: 'teal',
    description:
      'Foodservice sales chefs support a distributor or manufacturer\'s sales team by providing culinary credibility to commercial pitches. When a sales rep is selling a new protein or sauce to a restaurant group, the sales chef demonstrates how it can be used, menu-fits it for the customer\'s concept, and helps close the deal with practical kitchen knowledge.',
    typicalEmployers: 'Food and beverage distributors, commercial food manufacturers',
    travel: 'High',
    salaryRange: '$60,000–$95,000 + incentives',
  },
]

const colorMap: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    icon: 'text-orange-500',
  },
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'text-blue-500' },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    icon: 'text-purple-500',
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    icon: 'text-green-500',
  },
  pink: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', icon: 'text-pink-500' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', icon: 'text-teal-500' },
}

const employerSegments = [
  {
    segment: 'Consumer Packaged Goods (CPG)',
    examples: 'McCormick, Kraft Heinz, Conagra Brands, Campbell Soup Company',
    rolesFocused: 'Test kitchen, R&D marketing chef, culinary content',
    hiringFrequency: 'Consistent year-round; spikes during product launch cycles',
    whyTheyHire:
      'CPG companies need chefs who can develop recipes that showcase their products in realistic home-cooking contexts — both for packaging and for retail buyer presentations.',
  },
  {
    segment: 'Foodservice Distributors',
    examples: 'Sysco, US Foods, Performance Food Group',
    rolesFocused: 'Active marketing chef, foodservice sales chef',
    hiringFrequency: 'Frequent; high turnover in territory-based roles',
    whyTheyHire:
      'Distributors compete on relationship quality and culinary support. A skilled marketing chef helps their sales team win — and keep — restaurant, hotel, and institutional accounts.',
  },
  {
    segment: 'Commercial Kitchen Equipment',
    examples: 'Vulcan, Alto-Shaam, Rational, Vitamix Commercial',
    rolesFocused: 'Brand ambassador, demo chef, corporate trainer',
    hiringFrequency: 'Selective hiring; roles are fewer but well-compensated',
    whyTheyHire:
      'Operators want to see equipment perform before they commit to a capital purchase. Chefs who can demonstrate under real kitchen conditions are essential to the sales cycle.',
  },
  {
    segment: 'Restaurant Chains (Corporate Level)',
    examples: 'Darden, Yum! Brands, Bloomin\' Brands, Panda Restaurant Group',
    rolesFocused: 'Culinary marketing manager, menu innovation chef',
    hiringFrequency: 'Project-driven; strongest during menu refresh periods',
    whyTheyHire:
      'Corporate culinary teams at chains need professionals who understand both execution at scale and how a menu item will be positioned in a marketing campaign.',
  },
  {
    segment: 'Culinary Media and Publishing',
    examples: 'Bon Appétit, Food Network, Tastemade, Meredith Food Studios',
    rolesFocused: 'Culinary content chef, on-camera chef, recipe developer',
    hiringFrequency: 'Competitive; roles are high-profile and lower in volume',
    whyTheyHire:
      'Content that features real cooking authority outperforms content that does not. Media companies hire chefs who can develop and execute recipes that function well on screen.',
  },
]

const portfolioItems = [
  {
    item: 'Documented Recipe Development Process',
    detail:
      'Marketing chefs are expected to develop recipes with intention — not just taste, but cost, scalability, and brand fit. Showing a documented development trail (draft recipes, testing notes, final versions) demonstrates professionalism that generic cooking portfolios lack.',
  },
  {
    item: 'Brand-Context Writing or Content',
    detail:
      'Whether it is a product description, a recipe headnote, or a social caption that accompanied a dish you developed — any writing that shows you can put your culinary work into marketing language is valuable. Employers in CPG and media are hiring your communication instincts as much as your cooking.',
  },
  {
    item: 'Live Demonstration Experience',
    detail:
      'A video of you presenting a dish — at a farmers market, a brand event, a trade show, or even a filmed class — is the most direct evidence of your comfort performing under pressure. Employers hiring for demo-facing roles review this before anything else.',
  },
  {
    item: 'Cross-Functional Project Examples',
    detail:
      'Marketing chef roles require coordination across departments. If you have worked on a project that involved a sales team, a marketing team, or a product development group — describe it. Show that you know how to operate outside the kitchen while your culinary expertise remains the anchor.',
  },
  {
    item: 'Product or Menu Launch Contribution',
    detail:
      'If you have played any role in bringing a product or menu item to market — even at a small restaurant or a local brand — that experience is more relevant than years of line cooking in isolation. Name the product, describe your contribution, and quantify the outcome if you can.',
  },
]

const careerPaths = [
  {
    path: 'Line Cook or Sous Chef to Active Marketing Chef',
    timeline: '3–6 years kitchen experience typical',
    pivot: 'Seek out in-house demo or training opportunities. Foodservice distributors often recruit experienced cooks who have strong interpersonal skills and can handle a territory.',
    firstStep: 'Apply to demo chef or culinary specialist roles at regional distributors before targeting national brands.',
  },
  {
    path: 'Restaurant Chef to Corporate Test Kitchen',
    timeline: '5–8 years culinary track record',
    pivot:
      'Standardize your own recipes to restaurant-scale documentation standards. Build a portfolio of menu development work. Target CPG or meal kit companies that value restaurant pedigree.',
    firstStep:
      'Look for "recipe developer" or "culinary specialist" contract roles as a bridge into the corporate test kitchen environment.',
  },
  {
    path: 'Culinary School Graduate to Content Chef',
    timeline: '1–3 years experience plus demonstrated content output',
    pivot:
      'Build a self-directed content portfolio — shoot and style your own recipes, publish consistently, and learn basic food photography fundamentals. DTC food brands hire culinary content chefs who have already proven their content instinct.',
    firstStep:
      'Target smaller DTC brands or culinary media startups where the content chef role is broader and more accessible to early-career candidates.',
  },
  {
    path: 'Executive Chef to Culinary Brand Ambassador',
    timeline: 'Senior experience with public-facing track record',
    pivot:
      'Leverage existing media appearances, press coverage, or industry recognition. Equipment manufacturers and premium food brands want culinary authority that the market already respects.',
    firstStep:
      'Build your public profile through industry associations, speaking engagements, or local press before pursuing brand ambassador contracts.',
  },
]

const salaryData = [
  {
    role: 'Demo Chef / Active Marketing Chef I',
    low: '$45,000',
    mid: '$62,000',
    high: '$80,000',
    notes: 'Commission or performance bonus adds $5,000–$20,000 for top territory performers',
  },
  {
    role: 'Test Kitchen Chef / Recipe Developer',
    low: '$58,000',
    mid: '$78,000',
    high: '$100,000',
    notes: 'Higher at CPG majors; meal kit platforms tend toward mid-range',
  },
  {
    role: 'Culinary Content Chef',
    low: '$50,000',
    mid: '$68,000',
    high: '$88,000',
    notes: 'Freelance/contract arrangements common; day rates of $500–$1,200 for project work',
  },
  {
    role: 'Foodservice Sales Chef',
    low: '$60,000',
    mid: '$80,000',
    high: '$98,000',
    notes: 'Vehicle allowance and expense account standard; incentives tied to territory revenue',
  },
  {
    role: 'Corporate R&D Marketing Chef',
    low: '$78,000',
    mid: '$100,000',
    high: '$130,000',
    notes: 'Senior titles at Tier 1 CPG companies reach $140,000+ with bonus',
  },
  {
    role: 'Culinary Brand Ambassador',
    low: '$65,000',
    mid: '$92,000',
    high: '$120,000',
    notes: 'Equity or profit-sharing arrangements appear at premium brand and media roles',
  },
]

const faqs = [
  {
    question: 'What does a marketing chef do day-to-day?',
    answer:
      'The daily reality varies significantly by role type. An active marketing chef might spend Monday prepping product demos for a Tuesday sales call at a hotel purchasing office, then drive three hours to attend a distributor trade show on Wednesday. A test kitchen chef at a CPG brand is more likely to spend the day iterating on a sauce recipe that needs to hit a specific flavor profile at a set cost-per-serving before a packaging deadline. A culinary content chef could be shooting a recipe video in the morning and writing product copy in the afternoon. What all of these roles share is the requirement that culinary skill be applied in service of a commercial goal rather than in service of a kitchen service.',
  },
  {
    question: 'Is a marketing chef different from a corporate chef?',
    answer:
      'The two overlap significantly but are not identical. A corporate chef typically oversees culinary operations across multiple locations — training staff, standardizing recipes, and maintaining quality consistency at scale. A marketing chef focuses outward: on communicating the value of a product or brand through culinary demonstration, content, or strategy. Many senior marketing chef roles borrow from both categories, requiring both operational literacy and marketing fluency.',
  },
  {
    question: 'Do marketing chef jobs require travel?',
    answer:
      'It depends on the specific role. Active marketing chefs and foodservice sales chefs typically operate within a geographic territory and may travel 30 to 60 percent of the time. Test kitchen chefs and culinary content chefs are almost entirely facility-based. Brand ambassadors travel in bursts aligned to events and trade shows. When evaluating a job listing, the travel expectation is usually stated clearly — and it is a fair topic to clarify during an initial interview.',
  },
  {
    question: 'What certifications help a marketing chef stand out?',
    answer:
      'The Research Chefs Association offers the Certified Research Chef (CRC) and Certified Culinary Scientist (CCS) credentials, both of which carry significant weight in CPG and R&D contexts. ServSafe manager certification is expected as a baseline in virtually every professional kitchen role. For content-facing positions, demonstrated proficiency in food styling and basic photography fundamentals is increasingly treated as a practical credential even without formal documentation.',
  },
  {
    question: 'Can a chef with only restaurant experience land a marketing chef job?',
    answer:
      'Yes, but the transition benefits from deliberate preparation. Restaurant experience demonstrates execution skill and composure under pressure — both valuable. What it typically does not demonstrate is recipe documentation at a commercial standard, comfort presenting to non-kitchen audiences, or awareness of how culinary decisions intersect with brand or sales objectives. Candidates who close those gaps proactively — through a strong demo video, a documented recipe portfolio, or a volunteer role at a food event — are more competitive than those who rely on kitchen tenure alone.',
  },
  {
    question: 'Where are marketing chef jobs most concentrated geographically?',
    answer:
      'Corporate test kitchen and R&D marketing chef roles tend to cluster near CPG headquarters — cities like Chicago, Minneapolis, New York, and the Bay Area. Foodservice sales and active marketing chef roles are distributed nationally because they follow territory structures, making them accessible regardless of where a candidate is based. Culinary content roles are increasingly remote-eligible, particularly at DTC and digital-first brands.',
  },
]

export default async function MarketingChefJobsPage({ searchParams }: any) {
  const params = await searchParams

   const [{ count }, initialData] = await Promise.all([
  getMergedJobCount(params.what || 'marketing chef', params.where || '', params.salary_min ? Number(params.salary_min) : undefined),
  searchMergedJobs({ what: params.what || 'marketing chef', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
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
            Marketing Chef Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="marketing chef" />
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
                what={params.what || 'marketing chef'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData}
              />
            </Suspense>
          </div>
        </div>

        {/* ── WHAT IS A MARKETING CHEF ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <ChefHat className="w-7 h-7 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              What a Marketing Chef Actually Is — and Why the Role Is Growing
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4 text-gray-600">
              <p>
                A marketing chef is a trained culinary professional whose primary function is to advance a brand, product, or sales strategy — not to run a kitchen service. The title appears across dozens of industries, from global CPG companies to regional foodservice distributors, and the specific responsibilities vary considerably by employer type and seniority.
              </p>
              <p>
                What all marketing chef roles share is a core requirement: the ability to make food do commercial work. That might mean demonstrating a new sauce to a restaurant buyer in a way that closes a distribution deal, developing a recipe that communicates a product benefit on packaging, shooting a video that converts a home cook into a loyal customer, or presenting at a trade show with the kind of fluency that earns media coverage.
              </p>
              <p>
                The demand for this profile has expanded steadily as food brands have shifted toward content-led marketing strategies and as foodservice sales has become increasingly relationship-driven and product-demonstrative. Companies have come to recognize that a chef who understands marketing is worth far more than a marketer who learned to cook.
              </p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-gray-900">
                The Dual Skill Set That Defines the Role
              </h3>
              <div className="space-y-3">
                {[
                  {
                    label: 'Culinary foundation',
                    detail:
                      'Technique, recipe development, cost control, food safety, and the ability to adapt in real time under pressure.',
                  },
                  {
                    label: 'Commercial awareness',
                    detail:
                      'Understanding of brand positioning, sales cycle dynamics, audience communication, and how culinary decisions translate to business outcomes.',
                  },
                  {
                    label: 'Presentation fluency',
                    detail:
                      'Comfort performing — whether for an audience of two buyers in a hotel kitchen or two thousand attendees at a trade show floor.',
                  },
                  {
                    label: 'Cross-functional collaboration',
                    detail:
                      'The ability to work productively with marketers, sales reps, product developers, and creative teams who do not share your kitchen vocabulary.',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0 mt-2" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {item.label}
                      </p>
                      <p className="text-sm text-gray-600">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── ROLE SUBTYPES ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Layers className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Six Types of Marketing Chef Roles — and What Separates Them
            </h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            "Marketing chef" is an umbrella term that covers substantially different day-to-day realities. Before applying, it is worth identifying which of the six primary subtypes aligns with your experience and working style — each has distinct demands on your time, skills, and geography.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {roleSubtypes.map((role, index) => {
              const colors = colorMap[role.color]
              return (
                <div
                  key={index}
                  className={`bg-white border ${colors.border} rounded-2xl p-6 hover:shadow-md transition-all`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <role.icon className={`w-6 h-6 ${colors.icon}`} />
                    <h3 className="font-bold text-gray-900 text-lg">
                      {role.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    {role.description}
                  </p>
                  <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Typical employers</span>
                      <span className="text-gray-700 font-medium text-right max-w-[55%]">
                        {role.typicalEmployers}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Travel requirement</span>
                      <span className="text-gray-700 font-medium">
                        {role.travel}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Salary range</span>
                      <span className={`font-semibold ${colors.text}`}>
                        {role.salaryRange}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── WHERE MARKETING CHEFS WORK ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-7 h-7 text-teal-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Which Industries Hire Marketing Chefs — and Why
            </h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            Marketing chef roles are not confined to restaurants or media. The demand spans a wide range of industries, each with different hiring patterns and expectations. Understanding where jobs originate tells you where to focus your search — and how to frame your experience for each audience.
          </p>
          <div className="space-y-4">
            {employerSegments.map((seg, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-teal-300 transition-colors"
              >
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="md:col-span-1">
                    <h3 className="font-bold text-gray-900 text-base mb-1">
                      {seg.segment}
                    </h3>
                    <p className="text-xs text-gray-400">{seg.examples}</p>
                  </div>
                  <div className="md:col-span-1">
                    <p className="text-xs text-gray-500 mb-1 font-medium">
                      Roles focused on
                    </p>
                    <p className="text-sm text-gray-700">{seg.rolesFocused}</p>
                  </div>
                  <div className="md:col-span-1">
                    <p className="text-xs text-gray-500 mb-1 font-medium">
                      Hiring pattern
                    </p>
                    <p className="text-sm text-gray-700">
                      {seg.hiringFrequency}
                    </p>
                  </div>
                  <div className="md:col-span-1">
                    <p className="text-xs text-gray-500 mb-1 font-medium">
                      Why they hire chefs
                    </p>
                    <p className="text-sm text-gray-600">{seg.whyTheyHire}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SALARY BREAKDOWN ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Marketing Chef Salaries by Role — What the Market Is Actually Paying
            </h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Compensation in marketing chef roles tends to exceed what comparable experience earns in traditional kitchen environments, because employers are effectively paying for two skill sets rather than one. The ranges below reflect current U.S. market data across role types, with notes on additional compensation components that often accompany each category.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                    Role
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                    Entry
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                    Mid
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                    Senior
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {salaryData.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {row.role}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {row.low}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {row.mid}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-green-700">
                      {row.high}
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-500 max-w-xs">
                      {row.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Figures are based on advertised compensation ranges and industry reporting as of 2025. Actual pay varies by employer size, geographic market, and candidate background. Metro markets including New York, Chicago, and San Francisco typically pay 15–25% above these ranges.
          </p>
        </section>

        {/* ── PORTFOLIO SECTION ── */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <BookOpen className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div className="w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Building a Portfolio That Gets Marketing Chef Interviews
              </h2>
              <p className="text-gray-700 mb-6">
                Marketing chef hiring managers review candidates differently than restaurant employers do. They are not looking at a list of kitchens you have worked in — they are looking for evidence that your culinary work has served a purpose beyond the plate. These are the five portfolio elements that move the needle in this market.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {portfolioItems.map((item, index) => (
                  <div key={index} className="bg-white rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-700 font-bold rounded-full text-sm flex-shrink-0">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {item.item}
                        </h3>
                        <p className="text-sm text-gray-600">{item.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CAREER PATHS ── */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              How Culinary Professionals Transition into Marketing Chef Roles
            </h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-4xl">
            There is no single career path into marketing chef work. The transition looks different depending on where you are starting from and which role type you are targeting. Below are four of the most common routes, with specific guidance on how to make each one work.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {careerPaths.map((path, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <Award className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <h3 className="font-semibold text-gray-900">{path.path}</h3>
                </div>
                <div className="space-y-2 text-sm pl-8">
                  <div>
                    <span className="text-gray-500">Typical timeline: </span>
                    <span className="text-gray-700">{path.timeline}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">
                      How to make the pivot:
                    </span>
                    <span className="text-gray-600">{path.pivot}</span>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 mt-2">
                    <span className="text-purple-700 font-medium text-xs block mb-1">
                      First concrete step
                    </span>
                    <span className="text-gray-700">{path.firstStep}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CERTIFICATIONS ── */}
        <section className="mt-20">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Certifications That Strengthen a Marketing Chef Application
                </h2>
                <p className="text-gray-700 mb-6">
                  Formal credentials are not required for most marketing chef roles, but they do accelerate hiring decisions — particularly for corporate and R&D-facing positions where the employer is vetting both culinary authority and professional seriousness.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    {
                      cert: 'Certified Research Chef (CRC)',
                      body: 'Research Chefs Association',
                      relevance:
                        'Essential for CPG and R&D marketing chef roles. Signals cross-disciplinary competency in both culinary arts and food science.',
                    },
                    {
                      cert: 'Certified Culinary Scientist (CCS)',
                      body: 'Research Chefs Association',
                      relevance:
                        'More science-oriented than the CRC. Valued at ingredient manufacturers and flavor companies that need culinary staff with technical product knowledge.',
                    },
                    {
                      cert: 'ACF Certifications (CC, CPC, CEC)',
                      body: 'American Culinary Federation',
                      relevance:
                        'Industry baseline credentialing. Most relevant for demonstrating professional kitchen legitimacy to employers hiring from outside the CPG or media world.',
                    },
                    {
                      cert: 'ServSafe Manager Certification',
                      body: 'National Restaurant Association',
                      relevance:
                        'Expected in virtually every professional culinary role. Absence is a red flag. Renew every five years to keep it current.',
                    },
                    {
                      cert: 'WSET Qualifications (Level 2+)',
                      body: 'Wine & Spirit Education Trust',
                      relevance:
                        'Valuable for marketing chefs working in premium hospitality, fine dining brand contexts, or beverage-adjacent product lines.',
                    },
                    {
                      cert: 'Food Styling or Photography Training',
                      body: 'Workshop or self-directed',
                      relevance:
                        'Increasingly treated as a practical credential for culinary content chef roles. A demonstrable body of styled food photography can outperform a certificate.',
                    },
                  ].map((item, i) => (
                    <div key={i} className="bg-white rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">
                        {item.cert}
                      </h3>
                      <p className="text-xs text-amber-700 mb-2">{item.body}</p>
                      <p className="text-xs text-gray-600">{item.relevance}</p>
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
            <Briefcase className="w-7 h-7 text-gray-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Frequently Asked Questions About Marketing Chef Jobs
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group bg-white border border-gray-200 rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                  <h3 className="font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
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

        {/* ── DISCLAIMER ── */}
        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> Salary figures and market data presented on this page are based on publicly available job postings and industry sources. Actual compensation varies by employer, location, experience level, and individual negotiation. Job availability is subject to change. Oh My Job does not guarantee employment outcomes and is not affiliated with any listed employer.
          </p>
        </section>
      </div>
    </>
  )
}