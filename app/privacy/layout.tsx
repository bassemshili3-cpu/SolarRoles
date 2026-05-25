import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Oh My Job',
  description:
    "Oh My Job's privacy policy details what personal data we collect, how we use it, and your rights as a US resident or GDPR-protected user. Last updated 2026.",
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
