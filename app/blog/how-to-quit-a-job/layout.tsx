import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How to Quit a Job in 2026 | The Right Way to Resign | Oh My Job',
  description:
    'Walking away from a paycheck involves more than writing a letter. A complete guide to quitting without burning bridges or losing benefits. Updated for 2026.',
  alternates: { canonical: 'https://www.oh-my-job.com/blog/how-to-quit-a-job' },
  openGraph: {
    title: 'How to Quit a Job in 2026 | The Right Way to Resign',
    description:
      'A complete guide to resigning without burning bridges, losing your health coverage, or sabotaging your next opportunity.',
    type: 'article',
    url: 'https://www.oh-my-job.com/blog/how-to-quit-a-job',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
