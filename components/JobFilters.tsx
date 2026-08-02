'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'

import { Slider } from '@/components/ui/slider'

import { useFilterDrawer } from '@/contexts/filter-drawer-context'

import { useState, useEffect, useRef } from 'react'

import {
  Search, MapPin, X, ChevronDown, ChevronUp,
  Clock, Briefcase, Sun, DollarSign, HardHat,
  Award, Building2, Gift, Zap,
} from 'lucide-react'

// Identite visuelle Solar Roles : panneau en graphite doux (degrade legerement
// plus clair en haut qu'en bas) pour ne pas creer une rupture brutale avec
// la page blanche. Le gold reste la signature visuelle uniquement sur les
// points d'interaction cles (CTA principal, pastilles selectionnees, icones
// de section, badge du nombre de filtres actifs), pas en aplat de fond.

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
  { label: 'Any time',      value: '' },
  { label: 'Last 24 hours', value: '1' },
  { label: 'Last 3 days',   value: '3' },
  { label: 'Last 7 days',   value: '7' },
  { label: 'Last 14 days',  value: '14' },
  { label: 'Last 30 days',  value: '30' },
]

const JOB_TYPES = [
  'Full-time', 'Part-time', 'Contract', 'Apprenticeship',
  'Temporary', 'Union', 'Per diem',
]

const ARRANGEMENTS = ['Field / On-site', 'Shop & field', 'Office / Remote']

const EXPERIENCE_LEVELS = [
  { label: 'Any level',            value: '' },
  { label: 'Apprentice / Trainee',  value: 'apprentice' },
  { label: 'Helper / Entry-level',  value: 'entry' },
  { label: 'Installer',             value: 'installer' },
  { label: 'Lead / Crew foreman',   value: 'lead' },
  { label: 'Superintendent',        value: 'superintendent' },
  { label: 'Project manager',       value: 'manager' },
  { label: 'Director / Executive',  value: 'executive' },
]

const CERTIFICATIONS = [
  { label: 'No certification required', value: '' },
  { label: 'OSHA 10',                    value: 'osha10' },
  { label: 'OSHA 30',                    value: 'osha30' },
  { label: 'NABCEP PV Associate',        value: 'nabcep_associate' },
  { label: 'NABCEP PV Installer',        value: 'nabcep_installer' },
  { label: "Journeyman electrician's license", value: 'journeyman' },
]

const COMPANY_SIZES = [
  'Local crew (1-50)',
  'Regional installer (51-200)',
  'Mid-size (201-1k)',
  'National EPC (1k-5k)',
  'Utility-scale (5k+)',
]

const BENEFITS = [
  'Health insurance',
  'Dental & Vision',
  '401(k) match',
  'Paid time off',
  'Per diem / travel pay',
  'Tool allowance',
  'Company vehicle',
  'Certification reimbursement',
  'Overtime / prevailing wage',
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
    <div className="border-t border-black/[0.08] pt-4">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full mb-3 group"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-6 h-6 rounded-[4px] bg-[#F2A93B]/15 text-[#F2A93B]">
            {icon}
          </span>
          <span className="font-semibold text-[11px] uppercase tracking-[0.14em] text-white/90">
            {title}
          </span>
        </div>
        {open
          ? <ChevronUp className="h-4 w-4 text-white/40" />
          : <ChevronDown className="h-4 w-4 text-white/40" />}
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
//
// Etat "checked" rendu en pastille or PLEINE (fond clair, texte graphite) :
// sur un panneau graphite doux, un simple changement de teinte de texte
// ne suffit plus a signaler la selection, il faut un vrai contraste de fond.

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
          ? 'flex items-center gap-2.5 px-2.5 py-1.5 rounded-[6px] cursor-pointer text-sm transition-colors bg-[#F2A93B] text-[#1C2126] font-medium'
          : 'flex items-center gap-2.5 px-2.5 py-1.5 rounded-[6px] cursor-pointer text-sm transition-colors hover:bg-white/[0.06] text-white/80'
      }
    >
      <span
        className={
          checked
            ? 'w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center border-[#1C2126] bg-white'
            : 'w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center border-white/30 bg-transparent'
        }
      >
        {checked && <span className="w-2 h-2 rounded-full bg-[#1C2126]" />}
      </span>
      {label}
      <input type="radio" className="sr-only" checked={checked} readOnly />
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
          ? 'flex items-center gap-2.5 px-2.5 py-1.5 rounded-[6px] cursor-pointer text-sm transition-colors select-none bg-[#F2A93B] text-[#1C2126] font-medium'
          : 'flex items-center gap-2.5 px-2.5 py-1.5 rounded-[6px] cursor-pointer text-sm transition-colors select-none hover:bg-white/[0.06] text-white/80'
      }
    >
      <div
        className={
          checked
            ? 'w-[18px] h-[18px] rounded-[3px] border flex items-center justify-center flex-shrink-0 transition-colors bg-[#1C2126] border-[#1C2126]'
            : 'w-[18px] h-[18px] rounded-[3px] border flex items-center justify-center flex-shrink-0 transition-colors bg-transparent border-white/30'
        }
      >
        {checked && (
          <svg className="w-3 h-3 text-[#F2A93B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
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
  const { isOpen, close } = useFilterDrawer()

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
  const [certification, setCertification] = useState('')
  const [companySizes, setCompanySizes] = useState<string[]>([])
  const [benefits, setBenefits] = useState<string[]>([])
  const [easyApply, setEasyApply] = useState(false)
  const [visaSponsorship, setVisaSponsorship] = useState(false)
const [sectionsExpanded, setSectionsExpanded] = useState(false)

  // Sync from URL
  useEffect(() => {
    setKeywords(searchParams.get('what') || defaultWhat || '')
    setLocation(searchParams.get('where') || '')
    setSalary(Number(searchParams.get('salary_min')) || 0)
    setPostedWithin(searchParams.get('posted_within') || '')
    setJobTypes(splitParam(searchParams.get('job_type')))
    setArrangements(splitParam(searchParams.get('arrangement')))
    setExperience(searchParams.get('experience') || '')
    setCertification(searchParams.get('certification') || '')
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

  // Lock du scroll body + fermeture via Echap quand le drawer mobile est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') close()
      }
      document.addEventListener('keydown', handleEsc)
      return () => {
        document.body.style.overflow = ''
        document.removeEventListener('keydown', handleEsc)
      }
    }
  }, [isOpen, close])

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
    setOrDelete(params, 'certification', certification)
    setOrDelete(params, 'company_size', companySizes.join(','))
    setOrDelete(params, 'benefits', benefits.join(','))
    setOrDelete(params, 'easy_apply', easyApply ? 'true' : '')
    setOrDelete(params, 'visa_sponsorship', visaSponsorship ? 'true' : '')
    const qs = params.toString()
    router.push(`${pathname}${qs ? `?${qs}` : ''}`)
    router.refresh()
    close() // referme le drawer sur mobile apres la recherche (no-op sur desktop)
  }

  const clearFilters = () => {
    setKeywords(defaultWhat)
    setLocation('')
    setSalary(0)
    setPostedWithin('')
    setJobTypes([])
    setArrangements([])
    setExperience('')
    setCertification('')
    setCompanySizes([])
    setBenefits([])
    setEasyApply(false)
    setVisaSponsorship(false)
    router.push(defaultWhat ? `${pathname}?what=${encodeURIComponent(defaultWhat)}` : pathname)
    router.refresh()
    close()
  }

  const activeCount = [
    postedWithin, ...jobTypes, ...arrangements, experience, certification,
    ...companySizes, ...benefits,
    easyApply ? 'ea' : '', visaSponsorship ? 'vs' : '', salary > 0 ? 's' : '',
  ].filter(Boolean).length

  return (
    <>
      {/* Backdrop - visible uniquement sur mobile quand le drawer est ouvert */}
      <div
        onClick={close}
        aria-hidden="true"
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Panneau : drawer plein ecran depuis la droite sur mobile, sidebar sticky sur desktop.
          Graphite doux en degrade plutot que noir dur, avec un ring + ombre subtile
          pour le faire respirer sans rupture brutale sur la page blanche. */}
      <div
        className={`
          fixed top-0 right-0 z-[70] h-full w-[85vw] max-w-sm
          bg-gradient-to-b from-[#2E3540] to-[#262D36] border-l border-black/[0.08]
          shadow-[0_4px_32px_-4px_rgba(0,0,0,0.18)] overflow-y-auto
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          md:sticky md:top-20 md:right-auto md:z-auto md:h-auto
          md:w-auto md:max-w-none md:translate-x-0 md:transition-none
          md:bg-gradient-to-b md:from-[#2E3540] md:to-[#262D36]
          md:rounded-xl md:border md:border-black/[0.08]
          md:shadow-[0_2px_28px_-4px_rgba(0,0,0,0.10),0_0_0_1px_rgba(0,0,0,0.04)]
          md:max-h-[calc(100vh-6rem)]
        `}
      >
        {/* Header : meme fond graphite que le reste, separe par une ligne fine
            plutot qu'un bloc de couleur distinct */}
        <div className="px-4 md:px-5 py-4 border-b border-black/[0.08]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-white">
              <Sun className="h-4 w-4 text-[#F2A93B]" />
              Filter Jobs
            </h2>
            <div className="flex items-center gap-2">
              {activeCount > 0 && (
                <span className="text-xs bg-[#F2A93B] text-[#1C2126] rounded-[4px] px-2 py-0.5 font-bold">
                  {activeCount}
                </span>
              )}
              <button
                type="button"
                onClick={close}
                aria-label="Fermer les filtres"
                className="md:hidden p-1.5 -mr-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Keywords */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/45" />
            <input
              type="text"
              placeholder="Installer, electrician, foreman..."
              value={keywords}
              onChange={e => setKeywords(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.08] border border-white/[0.12] rounded-lg text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-[#F2A93B] focus:border-transparent text-sm"
            />
          </div>

          {/* Location */}
          <div className="relative mb-4" ref={locationInputRef}>
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/45" />
            <input
              type="text"
              placeholder="City, State, or Remote"
              value={location}
              onChange={e => setLocation(e.target.value)}
              onFocus={() => location.length > 0 && setShowSuggestions(true)}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              className="w-full pl-10 pr-8 py-2.5 bg-white/[0.08] border border-white/[0.12] rounded-lg text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-[#F2A93B] focus:border-transparent text-sm"
            />
            {location && (
              <button
                onClick={() => setLocation('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-[100] w-full mt-1 rounded-lg shadow-[0_8px_32px_-4px_rgba(0,0,0,0.20)] max-h-64 overflow-y-auto bg-[#2C333B] border border-white/[0.08]">
                {filteredSuggestions.map((loc, i) => (
                  <button
                    key={i}
                    onClick={() => { setLocation(loc); setShowSuggestions(false) }}
                    className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-white/[0.05] border-b border-white/[0.05] last:border-b-0 text-white"
                  >
                    <MapPin className="h-4 w-4 flex-shrink-0 text-white/40" />
                    <span className="truncate font-medium">{loc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={applyFilters}
            className="mx-auto block py-2 px-6 text-sm font-semibold bg-[#F2A93B] hover:bg-[#E0A030] text-[#1C2126] active:scale-[0.97] transition-all"
          >
            <Search className="h-3.5 w-3.5 mr-2 inline" />
            Search Jobs
          </Button>
        </div>



          {/* Toggle qui replie l'ensemble des sections de filtres pour ne pas
              monopoliser toute la hauteur de la sidebar (une bannière ou
              d'autres modules peuvent alors s'afficher juste en dessous) */}
          <button
            type="button"
            onClick={() => setSectionsExpanded(v => !v)}
            className="w-full flex items-center justify-center gap-1.5 mt-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white/70 hover:text-white transition-colors"
          >
            {sectionsExpanded ? 'Hide filters' : 'More filters'}
            {activeCount > 0 && !sectionsExpanded && (
              <span className="text-[10px] bg-[#F2A93B] text-[#1C2126] rounded-[4px] px-1.5 py-0.5 font-bold ml-1">
                {activeCount}
              </span>
            )}
            {sectionsExpanded
              ? <ChevronUp className="h-3.5 w-3.5" />
              : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          
        {/* Filter sections */}
        {sectionsExpanded && (
        <div className="p-4 md:p-5 space-y-0">

          {/* Date Posted */}
          <Section icon={<Clock className="h-3.5 w-3.5" />} title="Date Posted">
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
          <Section icon={<Briefcase className="h-3.5 w-3.5" />} title="Job Type">
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
          <Section icon={<HardHat className="h-3.5 w-3.5" />} title="Work Setting">
            {ARRANGEMENTS.map(arr => (
              <CheckOption
                key={arr}
                label={arr}
                checked={arrangements.includes(arr)}
                onChange={() => toggleArr(arrangements, arr, setArrangements)}
              />
            ))}
          </Section>

          {/* Salary : jauge "gain solaire", conteneur legerement plus fonce
              que le panneau pour se detacher malgre le fond deja graphite */}
          <Section icon={<DollarSign className="h-3.5 w-3.5" />} title="Minimum Pay">
            <div className="py-3 px-3 bg-black/[0.18] border border-white/[0.06] rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-white/45 whitespace-nowrap">$0</span>
                <div className="flex-1">
                  <Slider
                    value={[salary]}
                    onValueChange={v => setSalary(v[0])}
                    min={0}
                    max={150000}
                    step={2500}
                    className="py-2 [&_[role=slider]]:bg-[#F2A93B] [&_[role=slider]]:border-[#F2A93B] [&_.bg-primary]:bg-[#F2A93B]"
                  />
                </div>
                <span className="text-[10px] font-mono text-white/45 whitespace-nowrap">$150k</span>
              </div>
              <div className="mt-2 text-center">
                <span className="text-lg font-mono font-semibold text-[#F2A93B]">
                  ${salary.toLocaleString('en-US')}
                </span>
                <span className="text-[10px] uppercase tracking-wide text-white/40 ml-1.5">/ yr min.</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[22, 30, 45, 65, 85, 110].map(k => (
                <button
                  key={k}
                  onClick={() => setSalary(k * 1000 === salary ? 0 : k * 1000)}
                  className={`text-xs font-mono px-2.5 py-1 rounded-[4px] transition-all ${
                    salary === k * 1000
                      ? 'bg-[#F2A93B] text-[#1C2126] font-semibold'
                      : 'bg-white/[0.06] text-white/60 hover:bg-white/[0.10]'
                  }`}
                >
                  ${k}k
                </button>
              ))}
            </div>
          </Section>

          {/* Experience Level */}
          <Section icon={<Zap className="h-3.5 w-3.5" />} title="Experience Level">
            {EXPERIENCE_LEVELS.map(opt => (
              <RadioOption
                key={opt.value}
                label={opt.label}
                checked={experience === opt.value}
                onChange={() => setExperience(p => (p === opt.value ? '' : opt.value))}
              />
            ))}
          </Section>

          {/* Certification */}
          <Section icon={<Award className="h-3.5 w-3.5" />} title="Certification" defaultOpen={false}>
            {CERTIFICATIONS.map(opt => (
              <RadioOption
                key={opt.value}
                label={opt.label}
                checked={certification === opt.value}
                onChange={() => setCertification(p => (p === opt.value ? '' : opt.value))}
              />
            ))}
          </Section>

          {/* Company Size */}
          <Section icon={<Building2 className="h-3.5 w-3.5" />} title="Company Size" defaultOpen={false}>
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
          <Section icon={<Gift className="h-3.5 w-3.5" />} title="Benefits & Perks" defaultOpen={false}>
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
          <Section icon={<Sun className="h-3.5 w-3.5" />} title="Quick Filters">
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
        )}
        

        {/* Footer */}
        <div className="p-4 md:p-5 pt-2">
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full text-sm border-white/[0.15] text-white hover:bg-white/[0.06] active:scale-[0.97] transition-all"
          >
            {activeCount > 0 ? `Clear ${activeCount} filter${activeCount > 1 ? 's' : ''}` : 'Clear All Filters'}
          </Button>
        </div>

      </div>
    </>
  )
}

// Utils

function splitParam(v: string | null) {
  return v ? v.split(',').map(s => s.trim()).filter(Boolean) : []
}

function setOrDelete(params: URLSearchParams, key: string, value: string) {
  value ? params.set(key, value) : params.delete(key)
}
