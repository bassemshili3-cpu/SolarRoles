import SearchHero from '@/components/SearchHero'

export default function Home() {
  return (
    <>
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white pt-24 pb-32">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-7xl font-bold tracking-tighter mb-6">
            Your next big opportunity<br />is one click away
          </h1>
          <p className="text-2xl max-w-2xl mx-auto mb-10">Search +5M million+ jobs • Salary transparency • Smart matching</p>
          <SearchHero />
        </div>
      </div>
      <div className="py-12 text-center text-sm text-muted-foreground">• Trusted by 50,000+ companies in the USA</div>
    </>
  )
}