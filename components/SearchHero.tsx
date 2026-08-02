'use client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, MapPin, Sun, Zap, Wrench, HardHat, Settings, Battery, ShieldCheck, Thermometer, Briefcase, type LucideIcon } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

/* ──────────────────────────────────────────────────────────────
   Solar job titles — sourced from solar-taxonomy.ts
   Each entry mirrors the buckets returned by getSolarRoleFamily().
   Update this list when you add/remove INCLUDE_PATTERNS upstream.
   ────────────────────────────────────────────────────────────── */
type SolarJob = { title: string; family: SolarRoleFamily }

const SOLAR_JOB_TITLES: SolarJob[] = [
  // ── installer ─────────────────────────────────────────────
  { title: 'Solar Installer', family: 'installer' },
  { title: 'Solar Panel Installer', family: 'installer' },
  { title: 'PV Installer', family: 'installer' },
  { title: 'Lead Solar Installer', family: 'installer' },
  { title: 'Solar Installation Specialist', family: 'installer' },
  { title: 'Photovoltaic Installer', family: 'installer' },
  { title: 'Solar Apprentice', family: 'installer' },
  { title: 'Solar Mechanic', family: 'installer' },
  { title: 'Solar Helper', family: 'installer' },
  { title: 'Solar Laborer', family: 'installer' },
  { title: 'Residential Solar Installer', family: 'installer' },
  { title: 'Commercial Solar Installer', family: 'installer' },
  { title: 'Rooftop Solar Installer', family: 'installer' },
  { title: 'Solar Racking Installer', family: 'installer' },
  { title: 'Array Installer', family: 'installer' },
  { title: 'Module Installer', family: 'installer' },
  { title: 'BOS Installer', family: 'installer' },
  { title: 'Solar Array Technician', family: 'installer' },
  { title: 'Solar Module Technician', family: 'installer' },
  { title: 'Solar Panel Technician', family: 'installer' },
  { title: 'PV Array Installer', family: 'installer' },
  { title: 'PV Module Installer', family: 'installer' },
  { title: 'Journeyman Solar Installer', family: 'installer' },
  { title: 'Solar Crew', family: 'installer' },
  { title: 'Solar Foreman', family: 'installer' },
  { title: 'Solar Tracker Installer', family: 'installer' },
  { title: 'Solar Tracker Technician', family: 'installer' },
  { title: 'Single-Axis Tracker Installer', family: 'installer' },
  { title: 'Solar Pile Driver', family: 'installer' },
  { title: 'Solar Farm Technician', family: 'installer' },
  { title: 'Solar Farm Construction', family: 'installer' },
  { title: 'Utility-Scale Solar Technician', family: 'installer' },
  { title: 'Utility-Scale PV Construction', family: 'installer' },

  // ── electrician ──────────────────────────────────────────
  { title: 'Solar Electrician', family: 'electrician' },
  { title: 'PV Electrician', family: 'electrician' },
  { title: 'Solar Wireman', family: 'electrician' },
  { title: 'Journeyman Solar Electrician', family: 'electrician' },

  // ── supervisor ───────────────────────────────────────────
  { title: 'Solar Site Supervisor', family: 'supervisor' },
  { title: 'Solar Site Superintendent', family: 'supervisor' },
  { title: 'Solar Field Supervisor', family: 'supervisor' },
  { title: 'Solar Installation Lead', family: 'supervisor' },
  { title: 'Solar Installation Crew Lead', family: 'supervisor' },
  { title: 'Solar Crew Lead', family: 'supervisor' },

  // ── commissioning ────────────────────────────────────────
  { title: 'Solar Commissioning Technician', family: 'commissioning' },
  { title: 'PV Commissioning Technician', family: 'commissioning' },
  { title: 'Commissioning Technician (Solar)', family: 'commissioning' },
  { title: 'Solar Startup Technician', family: 'commissioning' },

  // ── O&M / service / maintenance ──────────────────────────
  { title: 'Solar O&M Technician', family: 'om' },
  { title: 'Solar OM Technician', family: 'om' },
  { title: 'Solar Operations and Maintenance', family: 'om' },
  { title: 'Solar Service Technician', family: 'om' },
  { title: 'Solar Field Service Technician', family: 'om' },
  { title: 'Solar Field Service Engineer', family: 'om' },
  { title: 'Solar Field Technician', family: 'om' },
  { title: 'Solar Maintenance Technician', family: 'om' },
  { title: 'Solar Repair Technician', family: 'om' },
  { title: 'Solar Troubleshooter', family: 'om' },
  { title: 'PV O&M Technician', family: 'om' },
  { title: 'PV Service Technician', family: 'om' },
  { title: 'PV Maintenance Technician', family: 'om' },
  { title: 'PV Field Service', family: 'om' },
  { title: 'String Inverter Technician', family: 'om' },
  { title: 'Solar Inverter Technician', family: 'om' },
  { title: 'Solar Inverter Field Service', family: 'om' },
  { title: 'PV Inverter Technician', family: 'om' },
  { title: 'PV Inverter Specialist', family: 'om' },

  // ── storage / battery ────────────────────────────────────
  { title: 'Battery Storage Installer', family: 'storage' },
  { title: 'Energy Storage Installer', family: 'storage' },
  { title: 'ESS Installer', family: 'storage' },
  { title: 'ESS Installation Technician', family: 'storage' },

  // ── QA/QC / inspector ────────────────────────────────────
  { title: 'Solar QA/QC Technician', family: 'qa_qc' },
  { title: 'Solar QA/QC Inspector', family: 'qa_qc' },
  { title: 'PV System Inspector', family: 'qa_qc' },
  { title: 'Solar Quality Inspector', family: 'qa_qc' },
  { title: 'Solar QC Inspector', family: 'qa_qc' },
  { title: 'NABCEP PV System Inspector', family: 'qa_qc' },

  // ── thermal ──────────────────────────────────────────────
  { title: 'Solar Thermal Installer', family: 'thermal' },
  { title: 'Solar Hot Water Installer', family: 'thermal' },
  { title: 'Solar Water Heater Installer', family: 'thermal' },

  // ── technical sales (NABCEP carve-out) ───────────────────
  { title: 'Solar Technical Sales', family: 'sales' },
  { title: 'PV Technical Sales', family: 'sales' },
  { title: 'Solar Sales Engineer', family: 'sales' },
  { title: 'Solar Design and Sales', family: 'sales' },
]

type SolarRoleFamily =
  | 'installer'
  | 'electrician'
  | 'supervisor'
  | 'commissioning'
  | 'om'
  | 'storage'
  | 'qa_qc'
  | 'thermal'
  | 'sales'

const FAMILY_LABEL: Record<SolarRoleFamily, string> = {
  installer: 'Installer',
  electrician: 'Electrician',
  supervisor: 'Supervisor',
  commissioning: 'Commissioning',
  om: 'O&M / Service',
  storage: 'Storage',
  qa_qc: 'QA / QC',
  thermal: 'Thermal',
  sales: 'Technical Sales',
}

const FAMILY_ICON: Record<SolarRoleFamily, LucideIcon> = {

  installer: Wrench,

  electrician: Zap,

  supervisor: HardHat,

  commissioning: Settings,

  om: Sun,

  storage: Battery,

  qa_qc: ShieldCheck,

  thermal: Thermometer,

  sales: Briefcase,

}
const FAMILY_ICON_COLOR: Record<SolarRoleFamily, string> = {
  installer: 'text-[#F5B819]',
  electrician: 'text-[#F5B819]',
  supervisor: 'text-[#F5B819]',
  commissioning: 'text-[#F5B819]',
  om: 'text-[#F5B819]',
  storage: 'text-[#F5B819]',
  qa_qc: 'text-[#F5B819]',
  thermal: 'text-[#F5B819]',
  sales: 'text-[#F5B819]',
}

/* ──────────────────────────────────────────────────────────────
   Location autocomplete (unchanged — already on-brand via Nominatim)
   ────────────────────────────────────────────────────────────── */
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

  const [titleSuggestions, setTitleSuggestions] = useState<SolarJob[]>([])
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false)
  const titleRef = useRef<HTMLDivElement>(null)

  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([])
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const locationRef = useRef<HTMLDivElement>(null)

  const debouncedWhere = useDebounce(where, 300)
  const router = useRouter()

  // Job title filter — matches against the solar taxonomy list
  useEffect(() => {
    if (what.trim().length < 1) {
      setTitleSuggestions([])
      setShowTitleSuggestions(false)
      return
    }
    const q = what.toLowerCase()
    const matches = SOLAR_JOB_TITLES
      .filter(j => j.title.toLowerCase().includes(q))
      .slice(0, 7)
    setTitleSuggestions(matches)
    setShowTitleSuggestions(matches.length > 0)
  }, [what])

  // Location autocomplete via Nominatim (unchanged)
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
    <div className="max-w-4xl mx-auto bg-white p-3 rounded-3xl shadow-2xl border border-gray-200">
      <div className="flex flex-col md:flex-row gap-3">

        {/* Job title with taxonomy-aware autocomplete */}
        <div className="flex-1 relative" ref={titleRef}>
          <Search className="absolute left-4 top-4 text-[#0B1A2E]/40 z-10" size={20} />
          <Input
            placeholder="Solar job title or keyword"
            value={what}
            onChange={e => setWhat(e.target.value)}
            onFocus={() => titleSuggestions.length > 0 && setShowTitleSuggestions(true)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className={`pl-12 h-14 text-base border-0 focus-visible:ring-0 bg-white text-[#0B1A2E] placeholder:text-[#0B1A2E]/40 ${showWhatError ? 'ring-2 ring-red-400 rounded-xl' : ''}`}
          />
          {showWhatError && (
            <p className="absolute -bottom-5 left-1 text-xs text-red-400 font-medium">Please enter a job title or keyword</p>
          )}
          {showTitleSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
              {titleSuggestions.map((job, i) => {
                const Icon = FAMILY_ICON[job.family]
                return (
                  <button
                    key={i}
                    onMouseDown={() => { setWhat(job.title); setShowTitleSuggestions(false) }}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#0B1A2E] hover:bg-[#F5B819]/10 hover:text-[#0B1A2E] flex items-center gap-3 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <Icon size={14} className="text-[#F5B819] flex-shrink-0" />
                    <span className="flex-1">{job.title}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B1A2E]/50 group-hover:text-[#0B1A2E]/70">
                      {FAMILY_LABEL[job.family]}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Location with autocomplete */}
        <div className="flex-1 relative" ref={locationRef}>
          <MapPin className="absolute left-4 top-4 text-[#0B1A2E]/40 z-10" size={20} />
          <Input
            placeholder="City, state or ZIP"
            value={where}
            onChange={e => { setWhere(e.target.value); if (e.target.value.length < 2) setShowLocationSuggestions(false) }}
            onFocus={() => locationSuggestions.length > 0 && setShowLocationSuggestions(true)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className={`pl-12 h-14 text-base border-0 focus-visible:ring-0 bg-white text-[#0B1A2E] placeholder:text-[#0B1A2E]/40 ${showWhereError ? 'ring-2 ring-red-400 rounded-xl' : ''}`}
          />
          {showWhereError && (
            <p className="absolute -bottom-5 left-1 text-xs text-red-400 font-medium">Please enter a city, state or ZIP</p>
          )}
          {showLocationSuggestions && (locationSuggestions.length > 0 || locationLoading) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
              {locationLoading && <div className="px-4 py-3 text-sm text-[#0B1A2E]/40">Searching...</div>}
              {!locationLoading && locationSuggestions.map((s, i) => (
                <button
                  key={i}
                  onMouseDown={() => { setWhere(s.label); setShowLocationSuggestions(false) }}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#0B1A2E] hover:bg-[#F5B819]/10 hover:text-[#0B1A2E] flex items-center gap-3 transition-colors border-b border-gray-100 last:border-0"
                >
                  <MapPin size={13} className="text-[#F5B819] flex-shrink-0" />
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
          className={`h-14 px-10 text-base font-semibold bg-[#F5B819] hover:bg-[#E5A810] text-[#0B1A2E] transition-all ${!canSearch ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <Sun size={18} className="mr-2" strokeWidth={2.5} />
          Search jobs
        </Button>
      </div>
    </div>
  )
}