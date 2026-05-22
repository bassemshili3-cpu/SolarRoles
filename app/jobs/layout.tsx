import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Job Search | Oh My Job',
  description: 'Browse thousands of U.S. job openings by role, location, and pay range. Real listings, no sponsored clutter, no login wall.',
}

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
