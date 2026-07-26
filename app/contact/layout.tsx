import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | Solar Roles',
  description: 'Get in touch with the Solar Roles team. Questions about job listings, partnerships, or anything else',
  alternates: { canonical: 'https://www.solarroles.com/contact' },
  openGraph: {
    title: 'Contact Us | Solar Roles',
    description: 'Get in touch with the Oh My Job team.',
    url: 'https://www.solarroles.com/contact',
    type: 'website',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
