'use client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, MapPin } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

interface Suggestion {
  display_name: string
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
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const debouncedWhere = useDebounce(where, 300)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (debouncedWhere.length < 2) {
      setSuggestions([])
      return
    }

    const controller = new AbortController()

    const fetchSuggestions = async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=us&q=${encodeURIComponent(debouncedWhere)}&limit=8&addressdetails=1`,
          {
            headers: {
              'Accept-Language': 'en-US',
              'User-Agent': 'OhMyJob/1.0 (contact@ohmyjob.com)',
            },
            signal: controller.signal,
          }
        )
        const data = await res.json()

        const formatted: Suggestion[] = data
          .filter((item: any) =>
            ['city', 'town', 'village', 'suburb', 'municipality', 'administrative', 'state', 'county', 'postcode'].includes(item.addresstype)
          )
          .map((item: any) => {
            const city =
              item.address?.city ||
              item.address?.town ||
              item.address?.village ||
              item.address?.suburb ||
              item.address?.municipality ||
              item.address?.county ||
              item.address?.state ||
              ''
            const state = item.address?.state || ''
            const label =
              item.addresstype === 'state'
                ? state
                : [city, state].filter(Boolean).join(', ')
            return { display_name: item.display_name, label }
          })
          .filter((s: Suggestion) => s.label)
          .filter((s: Suggestion, i: number, arr: Suggestion[]) =>
            arr.findIndex((x) => x.label === s.label) === i
          )

        setSuggestions(formatted)
        setShowSuggestions(true)
      } catch (e) {
        // abort ou erreur réseau
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestions()
    return () => controller.abort()
  }, [debouncedWhere])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (label: string) => {
    setWhere(label)
    setShowSuggestions(false)
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (what) params.set('what', what)
    if (where) params.set('where', where)
    router.push(`/jobs?${params.toString()}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="max-w-4xl mx-auto bg-card p-3 rounded-3xl shadow-2xl border">
      <div className="flex flex-col md:flex-row gap-3">

        {/* Job title */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-4 text-muted-foreground" size={20} />
          <Input
            placeholder="Job title or keyword"
            value={what}
            onChange={(e) => setWhat(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-12 h-14 text-lg border-0 focus-visible:ring-0"
          />
        </div>

        {/* Location with autocomplete */}
        <div className="flex-1 relative" ref={wrapperRef}>
          <MapPin className="absolute left-4 top-4 text-muted-foreground z-10" size={20} />
          <Input
            placeholder="City, state or ZIP"
            value={where}
            onChange={(e) => {
              setWhere(e.target.value)
              if (e.target.value.length < 2) setShowSuggestions(false)
            }}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            className="pl-12 h-14 text-lg border-0 focus-visible:ring-0"
          />

          {/* Dropdown */}
          {showSuggestions && (suggestions.length > 0 || loading) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
              {loading && (
                <div className="px-4 py-3 text-sm text-gray-400">Searching...</div>
              )}
              {!loading && suggestions.map((s, i) => (
                <button
                  key={i}
                  onMouseDown={() => handleSelect(s.label)}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                >
                  <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button onClick={handleSearch} size="lg" className="h-14 px-12 text-lg font-semibold">
          Search jobs
        </Button>
      </div>
    </div>
  )
}