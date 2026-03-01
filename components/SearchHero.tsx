'use client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useState } from 'react'

export default function SearchHero() {
  const [what, setWhat] = useState('')
  const [where, setWhere] = useState('')
  const router = useRouter()

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (what) params.set('what', what)
    if (where) params.set('where', where)
    router.push(`/jobs?${params.toString()}`)
  }

  return (
    <div className="max-w-4xl mx-auto bg-card p-3 rounded-3xl shadow-2xl border">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-4 text-muted-foreground" />
          <Input
            placeholder="Job title or keyword"
            value={what}
            onChange={(e) => setWhat(e.target.value)}
            className="pl-12 h-14 text-lg border-0 focus-visible:ring-0"
          />
        </div>
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-4 text-muted-foreground" />
          <Input
            placeholder="City, state or ZIP"
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            className="pl-12 h-14 text-lg border-0 focus-visible:ring-0"
          />
        </div>
        <Button onClick={handleSearch} size="lg" className="h-14 px-12 text-lg font-semibold">
          Search jobs
        </Button>
      </div>
    </div>
  )
}