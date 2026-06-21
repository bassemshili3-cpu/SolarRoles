'use client'

import { useState } from 'react'
import { Calculator, ChevronDown, DollarSign } from 'lucide-react'
import PaycheckCalculator from './PaycheckCalculator'

interface Props {
  salary?: number | null
  state?: string
  compact?: boolean
}

export default function PaycheckCalculatorCard({ salary, state, compact = false }: Props) {
  const [open, setOpen] = useState(false)

  // Try to detect state abbreviation from location string
  const detectedState = state?.match(/\b([A-Z]{2})\b/)?.[1] || ''

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* ── Collapsed card ── */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 border border-green-200 rounded-xl flex items-center justify-center">
            <Calculator className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900">Paycheck Calculator</p>
            <p className="text-xs text-gray-500">
              {salary
                ? `Estimate take-home on ~$${Math.round(salary).toLocaleString()}/yr`
                : 'Estimate your take-home pay'
              }
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* ── Expanded calculator ── */}
      {open && (
        <div className="border-t border-gray-100 p-5">
          <PaycheckCalculator defaultState={detectedState} compact={compact} />
        </div>
      )}
    </div>
  )
}