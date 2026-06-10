export interface BlogArticle {
  slug: string
  title: string
  category: string
  excerpt: string
  url: string
  date: string
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: 'how-to-quit-a-job',
    title: 'How to Quit a Job in 2026: The Complete Guide to Resigning the Right Way',
    category: 'Career Advice',
    excerpt: "Walking away from a paycheck is never just about the job. Here's how to resign without putting your financial safety net at risk.",
    url: '/blog/how-to-quit-a-job',
    date: '2026-03-08',
  },
  {
    slug: 'job-interview-questions',
    title: 'Job Interview Questions in 2026: What Employers Are Really Asking',
    category: 'Interview Tips',
    excerpt: 'The questions have changed. The right way to answer them has too. A practical prep guide for what hiring managers actually want to hear.',
    url: '/blog/job-interview-questions',
    date: '2026-03-07',
  },
  {
    slug: 'the-30-second-rule',
    title: 'The 30-Second Rule: How First Impressions Still Decide Who Gets the Offer',
    category: 'Interview Tips',
    excerpt: "Recruiters form an opinion faster than most people finish a sentence. Here's what that means for how you walk in the room.",
    url: '/blog/the-30-second-rule',
    date: '2026-03-06',
  },
  {
    slug: 'what-six-figures-really-means',
    title: 'What Six Figures Really Means in New York, San Francisco, and Austin',
    category: 'Salary Insights',
    excerpt: 'A $100k salary feels very different depending on where you cash the check. The math behind cost-of-living and what to negotiate.',
    url: '/blog/what-six-figures-really-means',
    date: '2026-03-07',
  },
  {
    slug: 'return-to-office-mandates-backfiring',
    title: 'Return-to-Office Mandates Are Backfiring. Here Is the Data.',
    category: 'Remote Work',
    excerpt: 'Companies pushing RTO are seeing higher attrition and lower morale. The numbers tell a story that boardrooms are still ignoring.',
    url: '/blog/return-to-office-mandates-backfiring',
    date: '2026-03-05',
  },
  {
    slug: 'ai-talent-war',
    title: 'Inside the AI Talent War: How Startups Are Luring Engineers Away From Big Tech',
    category: 'Tech Jobs',
    excerpt: 'Google, Meta, and Amazon built their empires on attracting the best engineers in the world. Now a new generation of AI startups is poaching them — and the playbook is working.',
    url: '/blog/ai-talent-war',
    date: '2026-03-07',
  },
  {
    slug: 'healthcare-hiring-boom',
    title: 'Healthcare Hiring Is Booming — But Not Where You\'d Expect',
    category: 'Industry Trends',
    excerpt: 'The fastest growth in healthcare jobs is not in major cities. It is in rural systems, telehealth platforms, and eldercare — and the compensation reflects it.',
    url: '/blog/healthcare-hiring-boom',
    date: '2026-03-06',
  },
  {
    slug: 'personal-practice-not-brand',
    title: "You Don't Need a Personal Brand. You Need a Personal Practice.",
    category: 'Career Advice',
    excerpt: 'LinkedIn is full of people performing expertise they do not have. The professionals who actually advance their careers are doing something quieter and far more durable.',
    url: '/blog/personal-practice-not-brand',
    date: '2026-03-05',
  },
  {
    slug: 'stock-options-hidden-cost',
    title: 'The Hidden Cost of Stock Options: A Cautionary Tale for Job Hoppers',
    category: 'Salary Insights',
    excerpt: 'Startups use equity to close compensation gaps and inspire loyalty. What they rarely explain is that accepting those options often creates a financial trap that is very hard to escape.',
    url: '/blog/stock-options-hidden-cost',
    date: '2026-03-04',
  },
  {
    slug: 'digital-nomad-visas-2026',
    title: 'The 2026 Guide to Digital Nomad Visas: Where to Go, What It Actually Costs, and What Nobody Tells You',
    category: 'Remote Work',
    excerpt: 'Remote work made location irrelevant. A new wave of visa programs is making it legal. Here is what you need to know before you book the flight.',
    url: '/blog/digital-nomad-visas-2026',
    date: '2026-03-03',
  },
  {
    slug: 'why-should-we-hire-you',
    title: "When the Interviewer Asks 'Why Should We Hire You?' — The Only Answer That Works",
    category: 'Interview Tips',
    excerpt: 'Most candidates answer this question by listing their strengths. That is exactly wrong. Here is the framework that actually lands offers.',
    url: '/blog/why-should-we-hire-you',
    date: '2026-03-02',
  },
]

export function getNextArticleForSubscriber(sentSlugs: string[]): BlogArticle | null {
  const unsent = BLOG_ARTICLES.filter(a => !sentSlugs.includes(a.slug))
  if (unsent.length === 0) return null
  return unsent[0]
}
