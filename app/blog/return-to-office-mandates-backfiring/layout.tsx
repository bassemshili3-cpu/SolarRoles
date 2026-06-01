import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Return to Office Mandates Are Backfiring | Oh My Job',
  description:
    'Companies demanded their workers come back. The ones who left were the ones they could least afford to lose. A data-driven look at RTO in 2026.',
  alternates: { canonical: 'https://www.oh-my-job.com/blog/return-to-office-mandates-backfiring' },
  openGraph: {
    title: 'Return to Office Mandates Are Backfiring',
    description:
      'The data on who actually left when RTO was enforced — and why companies are quietly reversing course.',
    type: 'article',
    url: 'https://www.oh-my-job.com/blog/return-to-office-mandates-backfiring',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
