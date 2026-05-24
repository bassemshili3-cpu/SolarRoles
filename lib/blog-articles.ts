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
]

export function getNextArticleForSubscriber(sentSlugs: string[]): BlogArticle | null {
  const unsent = BLOG_ARTICLES.filter(a => !sentSlugs.includes(a.slug))
  if (unsent.length === 0) return null
  return unsent[0]
}
