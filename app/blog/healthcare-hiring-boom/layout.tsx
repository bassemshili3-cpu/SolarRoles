import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Healthcare Hiring Is Booming — But Not Where You\'d Expect | Oh My Job',
  description: 'The healthcare job market is on fire, but the growth is not happening in big city hospitals. Rural clinics, telehealth platforms, and eldercare facilities are leading the charge.',
  alternates: { canonical: 'https://www.oh-my-job.com/blog/healthcare-hiring-boom' },
  openGraph: {
    title: 'Healthcare Hiring Is Booming — But Not Where You\'d Expect',
    description: 'The healthcare job market is on fire, but the growth is happening in unexpected places.',
    url: 'https://www.oh-my-job.com/blog/healthcare-hiring-boom',
    type: 'article',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
