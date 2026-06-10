import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Digital Nomad Visas: Which Countries Are Actually Worth It in 2026? | Oh My Job',
  description: 'Over 50 countries now offer digital nomad visas. Most are not worth the paperwork. Here is a clear-eyed look at which ones actually make sense for remote workers in 2026.',
  alternates: { canonical: 'https://www.oh-my-job.com/blog/digital-nomad-visas-2026' },
  openGraph: {
    title: 'Digital Nomad Visas: Which Countries Are Actually Worth It in 2026?',
    description: 'Over 50 countries offer digital nomad visas. Most are not worth the paperwork.',
    url: 'https://www.oh-my-job.com/blog/digital-nomad-visas-2026',
    type: 'article',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
