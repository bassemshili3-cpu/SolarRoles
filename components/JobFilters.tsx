'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

import { useState, useEffect, useRef } from 'react'
import {
  Search, MapPin, X, ChevronDown, ChevronUp,
  Clock, Briefcase, Monitor, DollarSign, TrendingUp,
  GraduationCap, Building2, Gift, Zap,
} from 'lucide-react'

// Data

const US_LOCATIONS = [
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
  'Remote', 'Work from Home', 'Anywhere in USA',
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming',
]

const DATE_OPTIONS = [
  { label: 'Any time',     value: '' },
  { label: 'Last 24 hours', value: '1' },
  { label: 'Last 3 days',   value: '3' },
  { label: 'Last 7 days',   value: '7' },
  { label: 'Last 14 days',  value: '14' },
  { label: 'Last 30 days',  value: '30' },
]

const JOB_TYPES = [
  'Full-time', 'Part-time', 'Contract', 'Internship',
  'Temporary', 'Freelance', 'Per diem',
]

const ARRANGEMENTS = ['On-site', 'Hybrid', 'Remote']

const EXPERIENCE_LEVELS = [
  { label: 'Any level',        value: '' },
  { label: 'Internship',       value: 'internship' },
  { label: 'Entry / Junior',   value: 'entry' },
  { label: 'Mid-Level',        value: 'mid' },
  { label: 'Senior',           value: 'senior' },
  { label: 'Manager / Lead',   value: 'manager' },
  { label: 'Director',         value: 'director' },
  { label: 'Executive / VP+',  value: 'executive' },
]

const EDUCATION_LEVELS = [
  { label: 'No requirement',   value: '' },
  { label: 'High school',      value: 'high_school' },
  { label: 'Associate degree', value: 'associate' },
  { label: "Bachelor's degree", value: 'bachelor' },
  { label: "Master's degree",  value: 'master' },
  { label: 'PhD / Doctorate',  value: 'phd' },
]

const COMPANY_SIZES = [
  'Startup (1-50)',
  'Small (51-200)',
  'Mid-size (201-1k)',
  'Large (1k-5k)',
  'Enterprise (5k+)',
]

const BENEFITS = [
  'Health insurance',
  'Dental & Vision',
  '401(k) match',
  'Paid time off',
  'Stock options / RSU',
  'Remote stipend',
  'Tuition reimbursement',
  'Parental leave',
  'Wellness perks',
]

// Sub-components

function Section({
  icon,
  title,
  children,
  defaultOpen = true,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t pt-4">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full mb-3 group"
      >
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{icon}</span>
          <span className="font-semibold text-sm">{title}</span>
        </div>
        {open
          ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
          : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="space-y-1.5">{children}</div>}
    </div>
  )
}

// Classes 100% statiques des deux cotes de chaque etat (jamais de concatenation
// partielle dans un template literal). Tailwind JIT scanne le code source pour
// decider quelles classes generer dans le CSS final : une classe comme
// "border-primary" assemblee dynamiquement via `${checked ? 'border-primary' : ...}`
// peut etre purgee si elle n'apparait nulle part ailleurs en clair dans le projet.
// En ecrivant la classe complete en dur a chaque branche, le scanner la voit
// systematiquement et la genere, peu importe le contexte d'execution.

function RadioOption({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  // Un <input type="radio"> natif ne declenche jamais onChange si on clique
  // dessus alors qu'il est deja checked - c'est un comportement du navigateur,
  // pas une question de logique React. Pour permettre le "clic pour deselectionner",
  // le gestionnaire de clic est donc place sur le <label> (qui recoit le clic
  // a chaque fois, meme quand le radio est deja coche), et l'input devient
  // purement visuel/accessible, sans son propre onChange actif sur le clic.
  return (
    <label
      onClick={(e) => {
        e.preventDefault()
        onChange()
      }}
      className={
        checked
          ? 'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer text-sm transition-colors bg-gray-100 text-gray-900 font-medium'
          : 'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer text-sm transition-colors hover:bg-accent text-foreground'
      }
    >
      <span
        className={
          checked
            ? 'w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center border-gray-900 bg-white'
            : 'w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center border-gray-300 bg-white'
        }
      >
        {checked && <span className="w-2 h-2 rounded-full bg-gray-900" />}
      </span>
      <input type="radio" className="sr-only" checked={checked} readOnly />
      {label}
    </label>
  )
}

function CheckOption({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: () => void
}) {
  return (
    <div
      onClick={onChange}
      className={
        checked
          ? 'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer text-sm transition-colors select-none bg-gray-100 text-gray-900 font-medium'
          : 'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer text-sm transition-colors select-none hover:bg-accent text-foreground'
      }
    >
      <div
        className={
          checked
            ? 'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors bg-white border-gray-900'
            : 'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors bg-white border-gray-300'
        }
      >
        {checked && (
          <svg className="w-3.5 h-3.5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span>{label}</span>
    </div>
  )
}

// Main Component

interface JobFiltersProps {
  defaultWhat?: string
}

export default function JobFilters({ defaultWhat = '' }: JobFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // Search
  const [keywords, setKeywords] = useState('')
  const [location, setLocation] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const locationInputRef = useRef<HTMLInputElement>(null)

  // Filters
  const [postedWithin, setPostedWithin] = useState('')
  const [jobTypes, setJobTypes] = useState<string[]>([])
  const [arrangements, setArrangements] = useState<string[]>([])
  const [salary, setSalary] = useState(0)
  const [experience, setExperience] = useState('')
  const [education, setEducation] = useState('')
  const [companySizes, setCompanySizes] = useState<string[]>([])
  const [benefits, setBenefits] = useState<string[]>([])
  const [easyApply, setEasyApply] = useState(false)
  const [visaSponsorship, setVisaSponsorship] = useState(false)

  // Sync from URL
  useEffect(() => {
    setKeywords(searchParams.get('what') || defaultWhat || '')
    setLocation(searchParams.get('where') || '')
    setSalary(Number(searchParams.get('salary_min')) || 0)
    setPostedWithin(searchParams.get('posted_within') || '')
    setJobTypes(splitParam(searchParams.get('job_type')))
    setArrangements(splitParam(searchParams.get('arrangement')))
    setExperience(searchParams.get('experience') || '')
    setEducation(searchParams.get('education') || '')
    setCompanySizes(splitParam(searchParams.get('company_size')))
    setBenefits(splitParam(searchParams.get('benefits')))
    setEasyApply(searchParams.get('easy_apply') === 'true')
    setVisaSponsorship(searchParams.get('visa_sponsorship') === 'true')
  }, [searchParams, defaultWhat])

  // Location autocomplete
  useEffect(() => {
    if (location.length > 0) {
      setFilteredSuggestions(
        US_LOCATIONS.filter(loc => loc.toLowerCase().includes(location.toLowerCase())).slice(0, 8)
      )
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }, [location])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (locationInputRef.current && !locationInputRef.current.contains(e.target as Node))
        setShowSuggestions(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Helpers
  const toggleArr = (arr: string[], val: string, set: (v: string[]) => void) =>
    set(arr.includes(val) ? arr.filter(t => t !== val) : [...arr, val])

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    setOrDelete(params, 'what', keywords.trim())
    setOrDelete(params, 'where', location.trim())
    setOrDelete(params, 'salary_min', salary > 0 ? salary.toString() : '')
    setOrDelete(params, 'posted_within', postedWithin)
    setOrDelete(params, 'job_type', jobTypes.join(','))
    setOrDelete(params, 'arrangement', arrangements.join(','))
    setOrDelete(params, 'experience', experience)
    setOrDelete(params, 'education', education)
    setOrDelete(params, 'company_size', companySizes.join(','))
    setOrDelete(params, 'benefits', benefits.join(','))
    setOrDelete(params, 'easy_apply', easyApply ? 'true' : '')
    setOrDelete(params, 'visa_sponsorship', visaSponsorship ? 'true' : '')
    const qs = params.toString()
    router.push(`${pathname}${qs ? `?${qs}` : ''}`)
    router.refresh()
  }

  const clearFilters = () => {
    setKeywords(defaultWhat)
    setLocation('')
    setSalary(0)
    setPostedWithin('')
    setJobTypes([])
    setArrangements([])
    setExperience('')
    setEducation('')
    setCompanySizes([])
    setBenefits([])
    setEasyApply(false)
    setVisaSponsorship(false)
    router.push(defaultWhat ? `${pathname}?what=${encodeURIComponent(defaultWhat)}` : pathname)
    router.refresh()
  }

  const activeCount = [
    postedWithin, ...jobTypes, ...arrangements, experience, education,
    ...companySizes, ...benefits,
    easyApply ? 'ea' : '', visaSponsorship ? 'vs' : '', salary > 0 ? 's' : '',
  ].filter(Boolean).length

  return (
    <div className="sticky top-20 space-y-0 bg-card rounded-2xl border shadow-lg overflow-y-auto max-h-[calc(100vh-6rem)]">

      {/* Header */}
      <div className="p-4 md:p-5 pb-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-foreground">Filter Jobs</h2>
          {activeCount > 0 && (
            <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5 font-semibold">
              {activeCount}
            </span>
          )}
        </div>

        {/* Keywords */}
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Job title, keywords, or company"
            value={keywords}
            onChange={e => setKeywords(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applyFilters()}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
        </div>

        {/* Location */}
        <div className="relative mb-4" ref={locationInputRef}>
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="City, State, or Remote"
            value={location}
            onChange={e => setLocation(e.target.value)}
            onFocus={() => location.length > 0 && setShowSuggestions(true)}
            onKeyDown={e => e.key === 'Enter' && applyFilters()}
            className="w-full pl-10 pr-8 py-2.5 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
          {location && (
            <button
              onClick={() => setLocation('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-[100] w-full mt-1 rounded-lg shadow-2xl max-h-64 overflow-y-auto bg-white border border-gray-200">
              {filteredSuggestions.map((loc, i) => (
                <button
                  key={i}
                  onClick={() => { setLocation(loc); setShowSuggestions(false) }}
                  className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 text-gray-900"
                >
                  <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  <span className="truncate font-medium">{loc}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          onClick={applyFilters}
          className="w-full py-2.5 text-sm font-semibold active:scale-[0.97] transition-all"
        >
          <Search className="h-4 w-4 mr-2" />
          Search Jobs
        </Button>
      </div>

      {/* Filter sections */}
      <div className="p-4 md:p-5 space-y-0">

        {/* Date Posted */}
        <Section icon={<Clock className="h-4 w-4" />} title="Date Posted">
          {DATE_OPTIONS.map(opt => (
            <RadioOption
              key={opt.value}
              label={opt.label}
              checked={postedWithin === opt.value}
              onChange={() => setPostedWithin(p => (p === opt.value ? '' : opt.value))}
            />
          ))}
        </Section>

        {/* Job Type */}
        <Section icon={<Briefcase className="h-4 w-4" />} title="Job Type">
          {JOB_TYPES.map(type => (
            <CheckOption
              key={type}
              label={type}
              checked={jobTypes.includes(type)}
              onChange={() => toggleArr(jobTypes, type, setJobTypes)}
            />
          ))}
        </Section>

        {/* Work Arrangement */}
        <Section icon={<Monitor className="h-4 w-4" />} title="Work Arrangement">
          {ARRANGEMENTS.map(arr => (
            <CheckOption
              key={arr}
              label={arr}
              checked={arrangements.includes(arr)}
              onChange={() => toggleArr(arrangements, arr, setArrangements)}
            />
          ))}
        </Section>

        {/* Salary */}
        <Section icon={<DollarSign className="h-4 w-4" />} title="Minimum Salary">
          <div className="py-2 px-2 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground whitespace-nowrap">$0</span>
              <div className="flex-1">
                <Slider
                  value={[salary]}
                  onValueChange={v => setSalary(v[0])}
                  min={0}
                  max={300000}
                  step={5000}
                  className="py-2"
                />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">$300k</span>
            </div>
          </div>
          <div className="flex items-center justify-center bg-primary/10 px-3 py-2 rounded-lg border border-primary/20">
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Min.</div>
              <div className="text-xl font-semibold text-primary">${salary.toLocaleString('en-US')}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[50000, 75000, 100000, 125000, 150000, 200000].map(p => (
              <button
                key={p}
                onClick={() => setSalary(p === salary ? 0 : p)}
                className={`text-xs px-2.5 py-1 rounded-full transition-all ${
                  salary === p
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                ${p / 1000}k
              </button>
            ))}
          </div>
        </Section>

        {/* Experience Level */}
        <Section icon={<TrendingUp className="h-4 w-4" />} title="Experience Level">
          {EXPERIENCE_LEVELS.map(opt => (
            <RadioOption
              key={opt.value}
              label={opt.label}
              checked={experience === opt.value}
              onChange={() => setExperience(p => (p === opt.value ? '' : opt.value))}
            />
          ))}
        </Section>

        {/* Education */}
        <Section icon={<GraduationCap className="h-4 w-4" />} title="Education Required" defaultOpen={false}>
          {EDUCATION_LEVELS.map(opt => (
            <RadioOption
              key={opt.value}
              label={opt.label}
              checked={education === opt.value}
              onChange={() => setEducation(p => (p === opt.value ? '' : opt.value))}
            />
          ))}
        </Section>

        {/* Company Size */}
        <Section icon={<Building2 className="h-4 w-4" />} title="Company Size" defaultOpen={false}>
          {COMPANY_SIZES.map(size => (
            <CheckOption
              key={size}
              label={size}
              checked={companySizes.includes(size)}
              onChange={() => toggleArr(companySizes, size, setCompanySizes)}
            />
          ))}
        </Section>

        {/* Benefits */}
        <Section icon={<Gift className="h-4 w-4" />} title="Benefits & Perks" defaultOpen={false}>
          {BENEFITS.map(b => (
            <CheckOption
              key={b}
              label={b}
              checked={benefits.includes(b)}
              onChange={() => toggleArr(benefits, b, setBenefits)}
            />
          ))}
        </Section>

        {/* Quick Filters */}
        <Section icon={<Zap className="h-4 w-4" />} title="Quick Filters">
          <CheckOption
            label="Easy Apply"
            checked={easyApply}
            onChange={() => setEasyApply(v => !v)}
          />
          <CheckOption
            label="Visa Sponsorship"
            checked={visaSponsorship}
            onChange={() => setVisaSponsorship(v => !v)}
          />
        </Section>

      </div>

      {/* Footer */}
      <div className="p-4 md:p-5 pt-2">
        <Button
          variant="outline"
          onClick={clearFilters}
          className="w-full text-sm active:scale-[0.97] transition-all"
        >
          {activeCount > 0 ? `Clear ${activeCount} filter${activeCount > 1 ? 's' : ''}` : 'Clear All Filters'}
        </Button>
      </div>

    </div>
  )
}

// Utils

function splitParam(v: string | null) {
  return v ? v.split(',').map(s => s.trim()).filter(Boolean) : []
}

function setOrDelete(params: URLSearchParams, key: string, value: string) {
  value ? params.set(key, value) : params.delete(key)
}