'use client'

import { useState, useMemo } from 'react'
import { DollarSign, TrendingDown, ChevronDown } from 'lucide-react'

/* ─── STATE TAX DATA (simplified effective rates for estimation) ─── */

const STATE_TAX_DATA: Record<string, { name: string; rate: number; note?: string }> = {
  AL: { name: 'Alabama', rate: 0.04 },
  AK: { name: 'Alaska', rate: 0, note: 'No state income tax' },
  AZ: { name: 'Arizona', rate: 0.025 },
  AR: { name: 'Arkansas', rate: 0.039 },
  CA: { name: 'California', rate: 0.068 },
  CO: { name: 'Colorado', rate: 0.044 },
  CT: { name: 'Connecticut', rate: 0.05 },
  DE: { name: 'Delaware', rate: 0.048 },
  FL: { name: 'Florida', rate: 0, note: 'No state income tax' },
  GA: { name: 'Georgia', rate: 0.049 },
  HI: { name: 'Hawaii', rate: 0.06 },
  ID: { name: 'Idaho', rate: 0.058 },
  IL: { name: 'Illinois', rate: 0.0495 },
  IN: { name: 'Indiana', rate: 0.0305 },
  IA: { name: 'Iowa', rate: 0.044 },
  KS: { name: 'Kansas', rate: 0.046 },
  KY: { name: 'Kentucky', rate: 0.04 },
  LA: { name: 'Louisiana', rate: 0.0185 },
  ME: { name: 'Maine', rate: 0.054 },
  MD: { name: 'Maryland', rate: 0.0475 },
  MA: { name: 'Massachusetts', rate: 0.05 },
  MI: { name: 'Michigan', rate: 0.0425 },
  MN: { name: 'Minnesota', rate: 0.0535 },
  MS: { name: 'Mississippi', rate: 0.047 },
  MO: { name: 'Missouri', rate: 0.048 },
  MT: { name: 'Montana', rate: 0.059 },
  NE: { name: 'Nebraska', rate: 0.0501 },
  NV: { name: 'Nevada', rate: 0, note: 'No state income tax' },
  NH: { name: 'New Hampshire', rate: 0, note: 'No tax on earned income' },
  NJ: { name: 'New Jersey', rate: 0.054 },
  NM: { name: 'New Mexico', rate: 0.039 },
  NY: { name: 'New York', rate: 0.06 },
  NC: { name: 'North Carolina', rate: 0.045 },
  ND: { name: 'North Dakota', rate: 0.0195 },
  OH: { name: 'Ohio', rate: 0.035 },
  OK: { name: 'Oklahoma', rate: 0.0475 },
  OR: { name: 'Oregon', rate: 0.076 },
  PA: { name: 'Pennsylvania', rate: 0.0307 },
  RI: { name: 'Rhode Island', rate: 0.0475 },
  SC: { name: 'South Carolina', rate: 0.044 },
  SD: { name: 'South Dakota', rate: 0, note: 'No state income tax' },
  TN: { name: 'Tennessee', rate: 0, note: 'No state income tax' },
  TX: { name: 'Texas', rate: 0, note: 'No state income tax' },
  UT: { name: 'Utah', rate: 0.0465 },
  VT: { name: 'Vermont', rate: 0.055 },
  VA: { name: 'Virginia', rate: 0.0475 },
  WA: { name: 'Washington', rate: 0, note: 'No state income tax' },
  WV: { name: 'West Virginia', rate: 0.047 },
  WI: { name: 'Wisconsin', rate: 0.053 },
  WY: { name: 'Wyoming', rate: 0, note: 'No state income tax' },
}

/* ─── FEDERAL TAX BRACKETS 2025 ─── */

type Bracket = { min: number; max: number; rate: number }

const FEDERAL_BRACKETS: Record<string, Bracket[]> = {
  single: [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
  married: [
    { min: 0, max: 23850, rate: 0.10 },
    { min: 23850, max: 96950, rate: 0.12 },
    { min: 96950, max: 206700, rate: 0.22 },
    { min: 206700, max: 394600, rate: 0.24 },
    { min: 394600, max: 501050, rate: 0.32 },
    { min: 501050, max: 751600, rate: 0.35 },
    { min: 751600, max: Infinity, rate: 0.37 },
  ],
  head: [
    { min: 0, max: 17000, rate: 0.10 },
    { min: 17000, max: 64850, rate: 0.12 },
    { min: 64850, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250500, rate: 0.32 },
    { min: 250500, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
}

const STANDARD_DEDUCTION: Record<string, number> = {
  single: 15000,
  married: 30000,
  head: 22500,
}

const SS_RATE = 0.062
const SS_CAP = 176100
const MEDICARE_RATE = 0.0145
const MEDICARE_ADDITIONAL_RATE = 0.009
const MEDICARE_ADDITIONAL_THRESHOLD_SINGLE = 200000
const MEDICARE_ADDITIONAL_THRESHOLD_MARRIED = 250000

const PAY_PERIODS: Record<string, { label: string; periods: number }> = {
  annual: { label: 'Annually', periods: 1 },
  monthly: { label: 'Monthly', periods: 12 },
  semimonthly: { label: 'Semi-Monthly (24x)', periods: 24 },
  biweekly: { label: 'Bi-Weekly (26x)', periods: 26 },
  weekly: { label: 'Weekly (52x)', periods: 52 },
}

/* ─── CALCULATION ─── */

function calculateFederalTax(taxableIncome: number, filingStatus: string): number {
  const brackets = FEDERAL_BRACKETS[filingStatus] || FEDERAL_BRACKETS.single
  let tax = 0
  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) break
    const taxable = Math.min(taxableIncome, bracket.max) - bracket.min
    tax += taxable * bracket.rate
  }
  return tax
}

function calculate(grossAnnual: number, stateCode: string, filingStatus: string) {
  const deduction = STANDARD_DEDUCTION[filingStatus] || STANDARD_DEDUCTION.single
  const taxableIncome = Math.max(0, grossAnnual - deduction)

  const federalTax = calculateFederalTax(taxableIncome, filingStatus)
  const stateRate = STATE_TAX_DATA[stateCode]?.rate || 0
  const stateTax = taxableIncome * stateRate

  const socialSecurity = Math.min(grossAnnual, SS_CAP) * SS_RATE
  const medicareThreshold = filingStatus === 'married'
    ? MEDICARE_ADDITIONAL_THRESHOLD_MARRIED
    : MEDICARE_ADDITIONAL_THRESHOLD_SINGLE
  const medicare = grossAnnual * MEDICARE_RATE +
    Math.max(0, grossAnnual - medicareThreshold) * MEDICARE_ADDITIONAL_RATE

  const totalDeductions = federalTax + stateTax + socialSecurity + medicare
  const netAnnual = grossAnnual - totalDeductions

  return {
    grossAnnual,
    federalTax,
    stateTax,
    socialSecurity,
    medicare,
    totalDeductions,
    netAnnual,
    effectiveRate: grossAnnual > 0 ? totalDeductions / grossAnnual : 0,
  }
}

/* ─── FORMAT ─── */

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function fmtPct(n: number): string {
  return (n * 100).toFixed(1) + '%'
}

/* ─── COMPONENT ─── */

export default function PaycheckCalculator({ defaultState = '' }: { defaultState?: string }) {
  const [grossInput, setGrossInput] = useState('75000')
  const [payFrequency, setPayFrequency] = useState('biweekly')
  const [filingStatus, setFilingStatus] = useState('single')
  const [stateCode, setStateCode] = useState(defaultState || 'TX')

  const grossAnnual = useMemo(() => {
    const raw = parseFloat(grossInput.replace(/,/g, '')) || 0
    return raw
  }, [grossInput])

  const results = useMemo(
    () => calculate(grossAnnual, stateCode, filingStatus),
    [grossAnnual, stateCode, filingStatus]
  )

  const periods = PAY_PERIODS[payFrequency]?.periods || 26

  const stateInfo = STATE_TAX_DATA[stateCode]

  return (
    <div className="w-full">
      <div className="grid lg:grid-cols-5 gap-8">

        {/* ── INPUTS ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Gross Salary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Annual Gross Salary</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                inputMode="numeric"
                value={grossInput}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9.]/g, '')
                  setGrossInput(v)
                }}
                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-lg font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="75000"
              />
            </div>
          </div>

          {/* Pay Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Pay Frequency</label>
            <div className="relative">
              <select
                value={payFrequency}
                onChange={(e) => setPayFrequency(e.target.value)}
                className="w-full appearance-none px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {Object.entries(PAY_PERIODS).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Filing Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Filing Status</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'single', label: 'Single' },
                { value: 'married', label: 'Married' },
                { value: 'head', label: 'Head of Household' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilingStatus(opt.value)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    filingStatus === opt.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
            <div className="relative">
              <select
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value)}
                className="w-full appearance-none px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {Object.entries(STATE_TAX_DATA)
                  .sort(([, a], [, b]) => a.name.localeCompare(b.name))
                  .map(([code, data]) => (
                    <option key={code} value={code}>
                      {data.name}{data.rate === 0 ? ' (no income tax)' : ''}
                    </option>
                  ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {stateInfo?.note && (
              <p className="text-xs text-green-600 mt-1">{stateInfo.note}</p>
            )}
          </div>
        </div>

        {/* ── RESULTS ── */}
        <div className="lg:col-span-3">

          {/* Net Pay Highlight */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-6">
            <p className="text-sm text-gray-500 mb-1">Your estimated take-home pay</p>
            <div className="flex items-baseline gap-3">
              <p className="text-4xl font-bold text-gray-900">${fmt(results.netAnnual / periods)}</p>
              <p className="text-gray-500">per {payFrequency === 'annual' ? 'year' : payFrequency === 'monthly' ? 'month' : payFrequency === 'semimonthly' ? 'paycheck' : payFrequency === 'biweekly' ? 'paycheck' : 'week'}</p>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              ${fmt(results.netAnnual)} annually · Effective tax rate: {fmtPct(results.effectiveRate)}
            </p>
          </div>

          {/* Breakdown */}
          <div className="overflow-x-auto">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden min-w-[340px]">
            <div className="grid grid-cols-3 gap-px bg-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="bg-white px-3 sm:px-5 py-3">Deduction</div>
              <div className="bg-white px-3 sm:px-5 py-3 text-right">Per {payFrequency === 'annual' ? 'Year' : payFrequency === 'monthly' ? 'Month' : 'Paycheck'}</div>
              <div className="bg-white px-3 sm:px-5 py-3 text-right">Annual</div>
            </div>

            {[
              { label: 'Gross Pay', per: results.grossAnnual / periods, annual: results.grossAnnual, highlight: true },
              { label: 'Federal Income Tax', per: results.federalTax / periods, annual: results.federalTax },
              { label: `${stateInfo?.name || 'State'} Tax`, per: results.stateTax / periods, annual: results.stateTax },
              { label: 'Social Security (6.2%)', per: results.socialSecurity / periods, annual: results.socialSecurity },
              { label: 'Medicare (1.45%)', per: results.medicare / periods, annual: results.medicare },
            ].map((row, i) => (
              <div key={i} className={`grid grid-cols-3 gap-px ${row.highlight ? 'bg-gray-50' : 'bg-gray-100'}`}>
                <div className={`${row.highlight ? 'bg-gray-50' : 'bg-white'} px-3 sm:px-5 py-3.5 text-sm ${row.highlight ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                  {row.label}
                </div>
                <div className={`${row.highlight ? 'bg-gray-50' : 'bg-white'} px-3 sm:px-5 py-3.5 text-sm text-right ${row.highlight ? 'font-semibold text-gray-900' : 'text-red-600'}`}>
                  {row.highlight ? '' : '-'}${fmt(row.per)}
                </div>
                <div className={`${row.highlight ? 'bg-gray-50' : 'bg-white'} px-3 sm:px-5 py-3.5 text-sm text-right ${row.highlight ? 'font-semibold text-gray-900' : 'text-red-600'}`}>
                  {row.highlight ? '' : '-'}${fmt(row.annual)}
                </div>
              </div>
            ))}

            {/* Total Deductions */}
            <div className="grid grid-cols-3 gap-px bg-gray-100">
              <div className="bg-white px-3 sm:px-5 py-3.5 text-sm font-semibold text-gray-900 border-t border-gray-200">Total Deductions</div>
              <div className="bg-white px-3 sm:px-5 py-3.5 text-sm text-right font-semibold text-red-700 border-t border-gray-200">
                -${fmt(results.totalDeductions / periods)}
              </div>
              <div className="bg-white px-3 sm:px-5 py-3.5 text-sm text-right font-semibold text-red-700 border-t border-gray-200">
                -${fmt(results.totalDeductions)}
              </div>
            </div>

            {/* Net Pay */}
            <div className="grid grid-cols-3 gap-px bg-gray-100">
              <div className="bg-green-50 px-3 sm:px-5 py-4 text-sm font-bold text-green-800 border-t-2 border-green-200">Take-Home Pay</div>
              <div className="bg-green-50 px-3 sm:px-5 py-4 text-sm text-right font-bold text-green-800 border-t-2 border-green-200">
                ${fmt(results.netAnnual / periods)}
              </div>
              <div className="bg-green-50 px-3 sm:px-5 py-4 text-sm text-right font-bold text-green-800 border-t-2 border-green-200">
                ${fmt(results.netAnnual)}
              </div>
            </div>
          </div>
          </div>

          {/* Visual Bar */}
          <div className="mt-6">
            <div className="flex text-xs text-gray-500 mb-2 justify-between">
              <span>Tax burden breakdown</span>
              <span>{fmtPct(results.effectiveRate)} total</span>
            </div>
            <div className="h-4 rounded-full overflow-hidden flex bg-gray-100">
              {results.grossAnnual > 0 && (
                <>
                  <div
                    className="bg-green-500 transition-all duration-300"
                    style={{ width: `${(results.netAnnual / results.grossAnnual) * 100}%` }}
                    title={`Take-home: ${fmtPct(results.netAnnual / results.grossAnnual)}`}
                  />
                  <div
                    className="bg-blue-400 transition-all duration-300"
                    style={{ width: `${(results.federalTax / results.grossAnnual) * 100}%` }}
                    title={`Federal: ${fmtPct(results.federalTax / results.grossAnnual)}`}
                  />
                  <div
                    className="bg-purple-400 transition-all duration-300"
                    style={{ width: `${(results.stateTax / results.grossAnnual) * 100}%` }}
                    title={`State: ${fmtPct(results.stateTax / results.grossAnnual)}`}
                  />
                  <div
                    className="bg-amber-400 transition-all duration-300"
                    style={{ width: `${(results.socialSecurity / results.grossAnnual) * 100}%` }}
                    title={`SS: ${fmtPct(results.socialSecurity / results.grossAnnual)}`}
                  />
                  <div
                    className="bg-red-400 transition-all duration-300"
                    style={{ width: `${(results.medicare / results.grossAnnual) * 100}%` }}
                    title={`Medicare: ${fmtPct(results.medicare / results.grossAnnual)}`}
                  />
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Take-home</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Federal</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> State</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Social Security</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Medicare</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}