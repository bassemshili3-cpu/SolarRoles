import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Career Advice & Job Market Insights | Oh My Job Blog',
  description:
    'Practical career advice, salary data, interview tips, and job market trends. Written for US job seekers in 2026.',
  alternates: { canonical: 'https://www.oh-my-job.com/blog' },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
