import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search 400,000+ US Job Listings | Filter by Salary, Type & Experience | Oh My Job',
  description:
    'Browse thousands of US job listings across all 50 states, updated daily. Filter by salary, job type, experience level, and remote work. No account needed.',
}

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
