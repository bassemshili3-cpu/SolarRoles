import { Metadata } from 'next'
import SearchHero from '@/components/SearchHero'

export const metadata: Metadata = {
  title: 'Oh My Job | Find Your Next Job in the USA',
  description: 'Search 5M+ job listings across the United States. Salary transparency, smart matching, and instant applications. Find your next opportunity today.',
  alternates: {
    canonical: 'https://www.oh-my-job.com',
  },
}

export default function Home() {
  return (
    <>
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white pt-24 pb-32">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-7xl font-bold tracking-tighter mb-6">
            Your next big opportunity<br />is one click away
          </h1>
          <p className="text-2xl max-w-2xl mx-auto mb-10">Search 5M+ jobs • Salary transparency • Smart matching</p>
          <SearchHero />
        </div>
      </div>
      <div className="py-12 text-center text-sm text-muted-foreground">• Trusted by 50,000+ companies in the USA</div>
    </>
  )
}