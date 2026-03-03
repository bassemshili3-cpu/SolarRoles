'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, X } from 'lucide-react'

const US_LOCATIONS = [ /* ... ton tableau reste identique ... */ ]

interface JobFiltersProps {
  initialParams?: any
}

export default function JobFilters({ initialParams }: JobFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [keywords, setKeywords] = useState(searchParams.get('what') || '')
  const [location, setLocation] = useState(searchParams.get('where') || '')
  const [salary, setSalary] = useState(Number(searchParams.get('salary_min')) || 0)
  const [jobTypes, setJobTypes] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const locationInputRef = useRef<HTMLInputElement>(null)

  // ... tous tes useEffect restent exactement les mêmes ...

  const toggleJobType = (type: string) => {
    setJobTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const applyFilters = () => { /* ... inchangé ... */ }
  const clearFilters = () => { /* ... inchangé ... */ }

  return (
    <div className="sticky top-20 space-y-3 md:space-y-6 bg-card p-3 md:p-6 rounded-2xl border shadow-lg">

      {/* Search Bar */}
      <div className="space-y-2 md:space-y-4">
        <h2 className="text-base md:text-lg font-bold text-foreground">Search Jobs</h2>

        {/* inputs restent identiques */}

        {/* BOUTON SEARCH → feedback au clic */}
        <Button 
          onClick={applyFilters} 
          className="w-full py-2 md:py-3 text-sm md:text-base font-semibold active:bg-primary/90 active:scale-[0.97] transition-all duration-150"
        >
          <Search className="h-4 w-4 mr-2" />
          Search Jobs
        </Button>
      </div>

      <div className="border-t" />

      {/* Salary Range */}
      <div className="space-y-2 md:space-y-4">
        {/* ... slider et affichage restent identiques ... */}

        {/* BOUTONS PRESETS SALARY → feedback au clic */}
        <div className="flex flex-wrap gap-1.5 md:gap-2">
          {[50000, 75000, 100000, 125000, 150000].map((preset) => (
            <button
              key={preset}
              onClick={() => setSalary(preset)}
              className="text-xs px-2 md:px-3 py-1 rounded-full bg-secondary text-secondary-foreground 
                         hover:bg-secondary/80 active:bg-secondary/70 active:scale-95 
                         transition-all duration-150"
            >
              ${preset / 1000}k
            </button>
          ))}
        </div>
      </div>

      <div className="border-t" />

      {/* Job Type */}
      <div className="space-y-2 md:space-y-3">
        <h3 className="font-semibold text-base md:text-lg">Job Type</h3>
        <div className="grid grid-cols-2 gap-1.5 md:gap-2">
          {['Full-time', 'Part-time', 'Contract', 'Remote'].map((type) => (
            <div
              key={type}
              className={`flex items-center gap-2 p-2 md:p-3 rounded-lg border cursor-pointer transition-all duration-150
                ${jobTypes.includes(type)
                  ? 'bg-primary/10 border-primary'
                  : 'bg-background hover:bg-accent active:bg-accent/70 active:scale-[0.97]'
              }`}
              onClick={() => toggleJobType(type)}
            >
              <Checkbox
                id={type}
                checked={jobTypes.includes(type)}
                onCheckedChange={() => toggleJobType(type)}
              />
              <label htmlFor={type} className="text-xs md:text-sm cursor-pointer">
                {type}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* BOUTON CLEAR ALL → feedback */}
      <Button 
        variant="outline" 
        onClick={clearFilters} 
        className="w-full text-sm active:bg-destructive/10 active:scale-[0.97] transition-all duration-150"
      >
        Clear All Filters
      </Button>
    </div>
  )
}