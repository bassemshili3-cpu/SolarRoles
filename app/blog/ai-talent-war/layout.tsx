import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Inside the AI Talent War: How Startups Are Luring Engineers Away From Big Tech | Oh My Job',
  description: 'AI startups are offering equity, autonomy, and mission-driven work to pull engineers away from Google, Meta, and Amazon. Here is how the war for AI talent is reshaping the job market.',
  alternates: { canonical: 'https://www.oh-my-job.com/blog/ai-talent-war' },
  openGraph: {
    title: 'Inside the AI Talent War: How Startups Are Luring Engineers Away From Big Tech',
    description: 'AI startups are offering equity, autonomy, and mission-driven work to pull engineers away from Google, Meta, and Amazon.',
    url: 'https://www.oh-my-job.com/blog/ai-talent-war',
    type: 'article',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
