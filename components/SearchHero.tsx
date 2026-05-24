'use client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, MapPin } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

const JOB_TITLES = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'DevOps Engineer', 'Data Engineer', 'Machine Learning Engineer', 'Cloud Architect',
  'iOS Developer', 'Android Developer', 'QA Engineer', 'Cybersecurity Analyst',
  'Product Manager', 'Project Manager', 'Scrum Master', 'Business Analyst',
  'Data Scientist', 'Data Analyst', 'UX Designer', 'UI Designer', 'Graphic Designer',
  'Product Designer', 'Creative Director', 'Content Writer', 'Copywriter',
  'Marketing Manager', 'Growth Manager', 'SEO Specialist', 'Social Media Manager',
  'Brand Manager', 'Performance Marketing Manager', 'PR Manager',
  'Sales Representative', 'Account Executive', 'Account Manager', 'Sales Manager',
  'Business Development Manager', 'Customer Success Manager',
  'Financial Analyst', 'Accountant', 'Controller', 'CFO', 'Investment Banker',
  'Portfolio Manager', 'Risk Analyst', 'Auditor',
  'Operations Manager', 'Supply Chain Manager', 'Logistics Coordinator',
  'Warehouse Manager', 'Procurement Manager',
  'HR Manager', 'HR Business Partner', 'Recruiter', 'Talent Acquisition Specialist',
  'Registered Nurse', 'Nurse Practitioner', 'Physician', 'Physician Assistant',
  'Physical Therapist', 'Occupational Therapist', 'Medical Assistant',
  'Pharmacist', 'Dental Hygienist', 'Veterinarian',
  'Teacher', 'Instructional Designer', 'Academic Advisor', 'School Counselor',
  'Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer', 'Chemical Engineer',
  'Architect', 'Construction Manager', 'Estimator',
  'Lawyer', 'Paralegal', 'Legal Counsel', 'Compliance Officer',
  'Executive Assistant', 'Administrative Assistant', 'Office Manager',
  'Customer Service Representative', 'Call Center Agent', 'Help Desk Technician',
  'Truck Driver', 'Delivery Driver', 'Electrician', 'Plumber', 'HVAC Technician',
  'Carpenter', 'Welder', 'Machinist',
  'Chef', 'Sous Chef', 'Restaurant Manager', 'Bartender', 'Server',
  'Real Estate Agent', 'Property Manager', 'Insurance Agent',
  'Social Worker', 'Case Manager', 'Therapist', 'Psychologist',
  'Security Guard', 'Firefighter', 'Police Officer',
  'Barista', 'Retail Associate', 'Store Manager',
]

interface LocationSuggestion {
  label: string
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export default function SearchHero() {
  const [what, setWhat] = useState('')
  const [where, setWhere] = useState('')
  const [attempted, setAttempted] = useState(false)

  // Job title autocomplete
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([])
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false)
  const titleRef = useRef<HTMLDivElement>(null)

  // Location autocomplete
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([])
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const locationRef = useRef<HTMLDivElement>(null)

  const debouncedWhere = useDebounce(where, 300)
  const router = useRouter()

  // Job title filter
  useEffect(() => {
    if (what.trim().length < 1) {
      setTitleSuggestions([])
      setShowTitleSuggestions(false)
      return
    }
    const q = what.toLowerCase()
    const matches = JOB_TITLES.filter(t => t.toLowerCase().includes(q)).slice(0, 7)
    setTitleSuggestions(matches)
    setShowTitleSuggestions(matches.length > 0)
  }, [what])

  // Location autocomplete via Nominatim
  useEffect(() => {
    if (debouncedWhere.length < 2) {
      setLocationSuggestions([])
      return
    }
    const controller = new AbortController()
    setLocationLoading(true)
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&countrycodes=us&q=${encodeURIComponent(debouncedWhere)}&limit=8&addressdetails=1`,
      {
        headers: { 'Accept-Language': 'en-US', 'User-Agent': 'OhMyJob/1.0' },
        signal: controller.signal,
      }
    )
      .then(r => r.json())
      .then((data: any[]) => {
        const formatted = data
          .filter(item =>
            ['city', 'town', 'village', 'suburb', 'municipality', 'administrative', 'state', 'county', 'postcode'].includes(item.addresstype)
          )
          .map(item => {
            const city = item.address?.city || item.address?.town || item.address?.village || item.address?.suburb || item.address?.county || item.address?.state || ''
            const state = item.address?.state || ''
            const label = item.addresstype === 'state' ? state : [city, state].filter(Boolean).join(', ')
            return { label }
          })
          .filter((s: LocationSuggestion) => s.label)
          .filter((s: LocationSuggestion, i: number, arr: LocationSuggestion[]) => arr.findIndex(x => x.label === s.label) === i)
        setLocationSuggestions(formatted)
        setShowLocationSuggestions(formatted.length > 0)
      })
      .catch(() => {})
      .finally(() => setLocationLoading(false))
    return () => controller.abort()
  }, [debouncedWhere])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (titleRef.current && !titleRef.current.contains(e.target as Node)) setShowTitleSuggestions(false)
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) setShowLocationSuggestions(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = () => {
    setAttempted(true)
    if (!what.trim() || !where.trim()) return
    const params = new URLSearchParams()
    params.set('what', what.trim())
    params.set('where', where.trim())
    router.push(`/jobs?${params.toString()}`)
  }

  const canSearch = what.trim().length > 0 && where.trim().length > 0
  const showWhatError = attempted && !what.trim()
  const showWhereError = attempted && !where.trim()

  return (
    <div className="max-w-4xl mx-auto bg-card p-3 rounded-3xl shadow-2xl border">
      <div className="flex flex-col md:flex-row gap-3">

        {/* Job title with autocomplete */}
        <div className="flex-1 relative" ref={titleRef}>
          <Search className="absolute left-4 top-4 text-muted-foreground z-10" size={20} />
          <Input
            placeholder="Job title or keyword"
            value={what}
            onChange={e => setWhat(e.target.value)}
            onFocus={() => titleSuggestions.length > 0 && setShowTitleSuggestions(true)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className={`pl-12 h-14 text-base border-0 focus-visible:ring-0 ${showWhatError ? 'ring-2 ring-red-400 rounded-xl' : ''}`}
          />
          {showWhatError && (
            <p className="absolute -bottom-5 left-1 text-xs text-red-400 font-medium">Please enter a job title or keyword</p>
          )}
          {showTitleSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
              {titleSuggestions.map((title, i) => (
                <button
                  key={i}
                  onMouseDown={() => { setWhat(title); setShowTitleSuggestions(false) }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                >
                  <Search size={13} className="text-gray-400 flex-shrink-0" />
                  {title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Location with autocomplete */}
        <div className="flex-1 relative" ref={locationRef}>
          <MapPin className="absolute left-4 top-4 text-muted-foreground z-10" size={20} />
          <Input
            placeholder="City, state or ZIP"
            value={where}
            onChange={e => { setWhere(e.target.value); if (e.target.value.length < 2) setShowLocationSuggestions(false) }}
            onFocus={() => locationSuggestions.length > 0 && setShowLocationSuggestions(true)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className={`pl-12 h-14 text-base border-0 focus-visible:ring-0 ${showWhereError ? 'ring-2 ring-red-400 rounded-xl' : ''}`}
          />
          {showWhereError && (
            <p className="absolute -bottom-5 left-1 text-xs text-red-400 font-medium">Please enter a city, state or ZIP</p>
          )}
          {showLocationSuggestions && (locationSuggestions.length > 0 || locationLoading) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
              {locationLoading && <div className="px-4 py-3 text-sm text-gray-400">Searching...</div>}
              {!locationLoading && locationSuggestions.map((s, i) => (
                <button
                  key={i}
                  onMouseDown={() => { setWhere(s.label); setShowLocationSuggestions(false) }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                >
                  <MapPin size={13} className="text-gray-400 flex-shrink-0" />
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          onClick={handleSearch}
          size="lg"
          disabled={attempted && !canSearch}
          className={`h-14 px-10 text-base font-semibold transition-all ${!canSearch ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          Search jobs
        </Button>
      </div>
    </div>
  )
}
