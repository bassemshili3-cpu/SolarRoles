import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Solar Roles',
  description:
    'Read the terms that govern access to and use of the Solar Roles website, accounts, job listings, and employer services.',
  alternates: { canonical: 'https://www.solarroles.com/terms' },
  openGraph: {
    title: 'Terms of Service | Solar Roles',
    description:
      'Terms governing access to and use of Solar Roles, including job seeker and employer services.',
    url: 'https://www.solarroles.com/terms',
    type: 'website',
  },
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
