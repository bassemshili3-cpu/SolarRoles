import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | Oh My Job',
  description: 'Get in touch with the Oh My Job team. Questions about job listings, partnerships, or anything else — we read every message.',
  alternates: { canonical: 'https://www.oh-my-job.com/contact' },
  openGraph: {
    title: 'Contact Us | Oh My Job',
    description: 'Get in touch with the Oh My Job team.',
    url: 'https://www.oh-my-job.com/contact',
    type: 'website',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
