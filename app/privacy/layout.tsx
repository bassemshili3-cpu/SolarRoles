import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Solar Roles',
  description:
    "Solar Roles's privacy policy details what personal data we collect, how we use it, and your rights as a US resident or GDPR-protected user. Last updated 2026.",
  alternates: { canonical: 'https://www.solarroles.com/privacy' },
  openGraph: {
    title: 'Privacy Policy | Solar Roles',
    description:
      'Learn what personal data Solar Roles collects, how it is used, and what privacy rights are available to you.',
    url: 'https://www.solarroles.com/privacy',
    type: 'website',
  },
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
