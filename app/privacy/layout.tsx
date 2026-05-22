import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Oh My Job',
  description: 'How Oh My Job collects, uses, and protects your data. GDPR rights, CCPA rights, cookie disclosure, and contact information.',
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
