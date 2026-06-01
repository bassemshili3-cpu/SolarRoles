import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'What Six Figures Really Means in NYC, San Francisco & Austin | Oh My Job',
  description:
    'A $100,000 salary sounds impressive until you run the numbers. What that paycheck actually buys in three of the biggest US job markets, after rent and taxes.',
  alternates: { canonical: 'https://www.oh-my-job.com/blog/what-six-figures-really-means' },
  openGraph: {
    title: 'What Six Figures Really Means in New York, San Francisco, and Austin',
    description:
      'Rent, taxes, and the real cost of living erode a six-figure salary fast. Here is the breakdown by city.',
    type: 'article',
    url: 'https://www.oh-my-job.com/blog/what-six-figures-really-means',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
