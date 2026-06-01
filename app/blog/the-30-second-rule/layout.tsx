import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The 30 Second Rule: First Impressions in Job Interviews | Oh My Job',
  description:
    'The first 30 seconds of an interview can outweigh everything that follows. What the research says, and what to do about it before your next interview.',
  alternates: { canonical: 'https://www.oh-my-job.com/blog/the-30-second-rule' },
  openGraph: {
    title: 'The 30 Second Rule: First Impressions Still Decide Who Gets the Offer',
    description:
      'Decades of hiring research confirm what candidates suspect. Here is how to use those 30 seconds in your favor.',
    type: 'article',
    url: 'https://www.oh-my-job.com/blog/the-30-second-rule',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
