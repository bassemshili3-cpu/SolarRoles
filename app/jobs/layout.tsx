import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search Solar Roles Jobs in The US | Filter by Salary, Type & Experience | Solar Roles',
  description:
    'Browse thousands of solar photovoltaic installer positions in the US across all 50 states, updated daily.',
}

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
