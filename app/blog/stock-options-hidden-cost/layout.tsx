import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The Hidden Cost of Stock Options: A Cautionary Tale for Job Hoppers | Oh My Job',
  description: 'Stock options sound like a lottery ticket. For most job hoppers, they end up being an expensive lesson in tax law and timing. Here is what to understand before you leave money on the table.',
  alternates: { canonical: 'https://www.oh-my-job.com/blog/stock-options-hidden-cost' },
  openGraph: {
    title: 'The Hidden Cost of Stock Options: A Cautionary Tale for Job Hoppers',
    description: 'Before you accept that offer with 50,000 options, read this.',
    url: 'https://www.oh-my-job.com/blog/stock-options-hidden-cost',
    type: 'article',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
