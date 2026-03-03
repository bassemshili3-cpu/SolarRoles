'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, X } from 'lucide-react'

// Comprehensive list of US cities and states for autocomplete
const US_LOCATIONS = [
  // Major Cities
  'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
  'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
  'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC',
  'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Washington, DC', 'Boston, MA',
  'Nashville, TN', 'Baltimore, MD', 'Oklahoma City, OK', 'Louisville, KY', 'Portland, OR',
  'Las Vegas, NV', 'Milwaukee, WI', 'Albuquerque, NM', 'Tucson, AZ', 'Fresno, CA',
  'Sacramento, CA', 'Kansas City, MO', 'Mesa, AZ', 'Atlanta, GA', 'Miami, FL',
  'Raleigh, NC', 'Omaha, NE', 'Colorado Springs, CO', 'Virginia Beach, VA', 'Oakland, CA',
  'Minneapolis, MN', 'Tampa, FL', 'Arlington, TX', 'New Orleans, LA', 'Wichita, KS',
  'Cleveland, OH', 'Bakersfield, CA', 'Aurora, CO', 'Anaheim, CA', 'Honolulu, HI',
  'Santa Ana, CA', 'Corpus Christi, TX', 'Riverside, CA', 'St. Louis, MO', 'Pittsburgh, PA',
  // States (for remote/work from anywhere)
  'Remote', 'Work from Home', 'Anywhere in USA',
  // States
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming',
]

interface JobFiltersProps {
  initialParams?: any
}

export default function JobFilters({ initialParams }: JobFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [keywords, setKeywords] = useState(searchParams.get('what') || '')
  const [location, setLocation] = useState(searchParams.get('where') || '')
  const [salary, setSalary] = useState(
    Number(searchParams.get('salary_min')) || 0
  )
  const [jobTypes, setJobTypes] = useState<string[]>([])

  // Autocomplete state
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const locationInputRef = useRef<HTMLInputElement>(null)

  // Filter suggestions based on input
  useEffect(() => {
    if (location.length > 0) {
      const filtered = US_LOCATIONS.filter(loc =>
        loc.toLowerCase().includes(location.toLowerCase())
      ).slice(0, 8) // Limit to 8 suggestions
      setFilteredSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }, [location])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (locationInputRef.current && !locationInputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLocationSelect = (loc: string) => {
    setLocation(loc)
    setShowSuggestions(false)
  }

  const toggleJobType = (type: string) => {
    setJobTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const applyFilters = () => {
    const params = new URLSearchParams()

    if (keywords) params.set('what', keywords)
    if (location) params.set('where', location)
    if (salary > 30000) params.set('salary_min', salary.toString())
    if (jobTypes.length > 0) params.set('job_type', jobTypes.join(','))

    router.push(`/jobs?${params.toString()}`)
  }

  const clearFilters = () => {
    setKeywords('')
    setLocation('')
    setSalary(80000)
    setJobTypes([])
    router.push('/jobs')
  }

  return (
    <div className="sticky top-20 space-y-6 bg-card p-6 rounded-2xl border shadow-lg">
      {/* Search Bar */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Search Jobs</h2>

        {/* Keywords Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Job title, keywords, or company"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
        </div>

        {/* Location Input with Autocomplete */}
        <div className="relative" ref={locationInputRef}>
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="City, State, or Remote"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onFocus={() => location.length > 0 && setShowSuggestions(true)}
            className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
          {location && (
            <button
              onClick={() => setLocation('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Autocomplete Suggestions */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div
              className="absolute z-[100] w-full mt-1 rounded-lg shadow-2xl max-h-64 overflow-y-auto"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                opacity: 1
              }}
            >
              {filteredSuggestions.map((loc, index) => (
                <button
                  key={index}
                  onClick={() => handleLocationSelect(loc)}
                  className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors border-b border-gray-100 last:border-b-0 hover:bg-blue-50"
                  style={{ color: '#111827' }}
                >
                  <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: '#6b7280' }} />
                  <span className="truncate font-medium">{loc}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <Button onClick={applyFilters} className="w-full py-3 text-base font-semibold">
          <Search className="h-4 w-4 mr-2" />
          Search Jobs
        </Button>
      </div>

      {/* Divider */}
      <div className="border-t" />

      {/* Salary Range - More Visible */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Minimum Salary</h3>
          <span className="text-sm text-muted-foreground">USD</span>
        </div>

        {/* Enhanced Salary Slider */}
        <div className="py-4 px-2 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground whitespace-nowrap">$0k</span>
            <div className="flex-1">
              <Slider
                value={[salary]}
                onValueChange={(value) => setSalary(value[0])}
                min={0}
                max={300000}
                step={5000}
                className="py-2"
              />
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">$300k</span>
          </div>
        </div>

        {/* Salary Display - Single Value */}
        <div className="flex items-center justify-center bg-primary/10 px-4 py-3 rounded-lg border border-primary/20">
          <div className="text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Minimum</div>
            <div className="text-2xl font-medium text-primary">${salary.toLocaleString()}</div>
          </div>
        </div>

        {/* Quick Salary Presets */}
        <div className="flex flex-wrap gap-2">
          {[50000, 75000, 100000, 125000, 150000].map((preset) => (
            <button
              key={preset}
              onClick={() => setSalary(preset)}
              className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              ${(preset / 1000)}k
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t" />

      {/* Job Type */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Job Type</h3>
        <div className="grid grid-cols-2 gap-2">
          {['Full-time', 'Part-time', 'Contract', 'Remote'].map((type) => (
            <div
              key={type}
              className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                jobTypes.includes(type)
                  ? 'bg-primary/10 border-primary'
                  : 'bg-background hover:bg-accent'
              }`}
              onClick={() => toggleJobType(type)}
            >
              <Checkbox
                id={type}
                checked={jobTypes.includes(type)}
                onCheckedChange={() => toggleJobType(type)}
              />
              <label
                htmlFor={type}
                className="text-sm cursor-pointer"
              >
                {type}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <Button
        variant="outline"
        onClick={clearFilters}
        className="w-full"
      >
        Clear All Filters
      </Button>
    </div>
  )
}
