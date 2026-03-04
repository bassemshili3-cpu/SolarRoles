'use client'

import { useState } from 'react'

type AIFilters = {
  title?: string
  location?: string
  remote?: boolean
  minSalary?: number
  keywords?: string[]
}

interface Props {
  onFiltersChange: (filters: AIFilters | null) => void
}

export default function AIJobMatcher({ onFiltersChange }: Props) {
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const MAX = 300

  const handleSearch = async () => {
    if (description.trim().length < 5) return
    setLoading(true)

    try {
      const res = await fetch('/api/ai-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      })

      if (!res.ok) throw new Error('AI request failed')

      const { filters } = await res.json()
      onFiltersChange(filters ?? null)
    } catch (err) {
      console.error(err)
      onFiltersChange(null)
    } finally {
      setLoading(false)
    }
  }

  const charCountPercent = (description.length / MAX) * 100
  const isNearLimit = description.length > MAX * 0.85

  return (
    <div className="mt-4 mb-6">
      {/* max-w-sm → max-w-md, p-3 → p-4 */}
      <div className="group relative rounded-xl bg-slate-50/80 backdrop-blur-sm p-4 shadow-sm ring-1 ring-gray-200/60 max-w-md">

        {/* Header */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              {/* Logo h-6 w-6 → h-7 w-7 */}
              <div className="flex h-7 w-7 items-center justify-center rounded-md shadow-sm">
                <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="48" height="48" rx="10" fill="url(#gradient_logo)"/>
                  <circle cx="20" cy="20" r="10" stroke="white" strokeWidth="4" fill="none"/>
                  <path d="M30 30L42 42" stroke="white" strokeWidth="5" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="gradient_logo" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#3B82F6"/>
                      <stop offset="1" stopColor="#8B5CF6"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              {/* text-sm → text-base */}
              <h3 className="text-base font-semibold text-gray-800 tracking-wide">
                Describe your dream job
              </h3>
            </div>

            {/* Badge px-2 py-0.5 → px-2.5 py-1 */}
            <div className="flex items-center   bg-indigo-50 px-2 py-1  ring-indigo-200/50">
              <span className="relative flex h-2 w-2">
                </span>
              {/* text-[10px] → text-xs */}
              <span className="text-xs font-medium text-indigo-600">
                New: Try our AI
              </span>
            </div>
          </div>

          {/* text-xs → text-sm */}
          <p className="text-sm text-gray-500">
            In a few words, AI finds the perfect matches for you.
          </p>
        </div>

        {/* Textarea — rows 3 → 4, px-3 py-2.5 → px-3.5 py-3 */}
        <div className="relative">
          <div className={`
            relative rounded-lg border bg-white transition-all duration-200
            ${isFocused
              ? 'border-blue-400 ring-1 ring-blue-400/20'
              : 'border-gray-200 hover:border-gray-300'}
            ${loading ? 'opacity-50' : ''}
          `}>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, MAX))}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Example: Senior React Developer in New York, remote friendly..."
              disabled={loading}
              className="w-full resize-none rounded-lg bg-white px-3.5 py-3 pr-12 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
              rows={4}
            />

            {/* text-[10px] → text-xs */}
            <div className={`
              absolute bottom-2.5 right-3.5 text-xs font-medium transition-colors duration-200
              ${isNearLimit ? 'text-amber-500' : 'text-gray-400'}
              ${description.length >= MAX ? 'text-red-500' : ''}
            `}>
              <span className={description.length > MAX ? 'text-red-500' : ''}>
                {Math.min(description.length, MAX)}
              </span>
              <span className="text-gray-300">/{MAX}</span>
            </div>
          </div>

          {/* Progress bar h-0.5 → h-1 */}
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full transition-all duration-300 ${
                isNearLimit ? 'bg-gradient-to-r from-amber-400 to-red-400' : 'bg-gradient-to-r from-blue-400 to-purple-400'
              }`}
              style={{ width: `${Math.min(charCountPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Button mt-2.5 → mt-3, px-3.5 py-1.5 text-xs → px-4 py-2 text-sm */}
        <div className="mt-3 flex items-center justify-end">
          <button
            onClick={handleSearch}
            disabled={loading || description.trim().length < 5}
            className={`
              relative overflow-hidden rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all duration-200
              ${loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 hover:shadow-md hover:shadow-blue-500/20'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <span className="relative flex items-center gap-2">
              {loading ? (
                <>
                  {/* h-3 w-3 → h-4 w-4 */}
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  {/* h-3.5 w-3.5 → h-4 w-4 */}
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Find matches</span>
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}