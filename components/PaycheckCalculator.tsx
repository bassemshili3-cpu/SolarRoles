'use client'

import { useState, useMemo } from 'react'
import { DollarSign, ChevronDown, HardHat, Award, Plane } from 'lucide-react'

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

/* ─── SOLAR-SPECIFIC DATA ───
   Role salary presets are national-average estimates drawn from industry
   salary guides (BLS, solar workforce reports). Meant as a starting point,
   not a guarantee — actual pay varies by state, employer, and project type. */

const SOLAR_ROLES: { key: string; label: string; salary: number }[] = [
  { key: 'installer', label: 'PV Installer', salary: 52000 },
  { key: 'lead', label: 'Lead Installer / Foreman', salary: 68000 },
  { key: 'omtech', label: 'O&M Technician', salary: 58000 },
  { key: 'electrician', label: 'Licensed Electrician', salary: 78000 },
  { key: 'designer', label: 'System Designer', salary: 72000 },
  { key: 'pm', label: 'Project Manager', salary: 92000 },
]

// Average annual pay increase reported for NABCEP-certified workers.
// Source: nabcep.org — "on average leads to an $11,000 salary increase."
const NABCEP_BUMP = 11000

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

export default function PaycheckCalculator({
  defaultState = '',
  compact = false,
}: { defaultState?: string; compact?: boolean }) {
  const [grossInput, setGrossInput] = useState('52000')
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [payFrequency, setPayFrequency] = useState('biweekly')
  const [filingStatus, setFilingStatus] = useState('single')
  const [stateCode, setStateCode] = useState(defaultState || 'TX')
  const [isNabcep, setIsNabcep] = useState(false)
  const [isTraveling, setIsTraveling] = useState(false)
  const [perDiemMonthly, setPerDiemMonthly] = useState('1500')

  const baseGrossAnnual = useMemo(() => {
    const raw = parseFloat(grossInput.replace(/,/g, '')) || 0
    return raw
  }, [grossInput])

  // NABCEP bump is real, taxable wages — it feeds into the tax calculation.
  const grossAnnual = baseGrossAnnual + (isNabcep ? NABCEP_BUMP : 0)

  const results = useMemo(
    () => calculate(grossAnnual, stateCode, filingStatus),
    [grossAnnual, stateCode, filingStatus]
  )

  // Per diem is typically a non-taxable stipend under IRS accountable-plan
  // rules, so it's added straight to take-home rather than to taxable gross.
  const perDiemAnnual = useMemo(() => {
    if (!isTraveling) return 0
    const monthly = parseFloat(perDiemMonthly.replace(/,/g, '')) || 0
    return monthly * 12
  }, [isTraveling, perDiemMonthly])

  const netAnnualTotal = results.netAnnual + perDiemAnnual

  const periods = PAY_PERIODS[payFrequency]?.periods || 26
  const periodLabel =
    payFrequency === 'annual' ? 'year'
    : payFrequency === 'monthly' ? 'month'
    : payFrequency === 'semimonthly' ? 'paycheck'
    : payFrequency === 'biweekly' ? 'paycheck'
    : 'week'

  const stateInfo = STATE_TAX_DATA[stateCode]

  const handleRoleSelect = (role: { key: string; salary: number }) => {
    setSelectedRole(role.key)
    setGrossInput(String(role.salary))
  }

  return (
    <div className="w-full">
      <div className={compact ? 'flex flex-col gap-6' : 'grid lg:grid-cols-5 gap-8'}>

        {/* ── INPUTS ── */}
        <div className={compact ? 'space-y-5' : 'lg:col-span-2 space-y-5'}>

          {/* Solar Role */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <HardHat className="w-3.5 h-3.5 text-[#B45309]" />
              Role
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SOLAR_ROLES.map((role) => (
                <button
                  key={role.key}
                  onClick={() => handleRoleSelect(role)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    selectedRole === role.key
                      ? 'bg-[#0B1A2E] text-white border-[#0B1A2E]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#0B1A2E]/40'
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              Fills in a national-average starting salary — edit it below to match your offer.
            </p>
          </div>

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
                  setSelectedRole(null)
                }}
                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-lg font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent"
                placeholder="52000"
              />
            </div>
          </div>

          {/* NABCEP toggle */}
          <button
            type="button"
            onClick={() => setIsNabcep(!isNabcep)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
              isNabcep
                ? 'bg-[#FEF3C7] border-[#F5B819]'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
              isNabcep ? 'bg-[#F5B819]/25' : 'bg-gray-100'
            }`}>
              <Award className={isNabcep ? 'text-[#B45309]' : 'text-gray-400'} size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900">NABCEP certified</p>
              <p className="text-[11px] text-gray-500">
                Adds an estimated +${fmt(NABCEP_BUMP)}/yr, per NABCEP&apos;s own data
              </p>
            </div>
            <div className={`flex-shrink-0 w-9 h-5 rounded-full transition-colors relative ${
              isNabcep ? 'bg-[#F5B819]' : 'bg-gray-200'
            }`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                isNabcep ? 'left-4' : 'left-0.5'
              }`} />
            </div>
          </button>

          {/* Traveling crew / per diem toggle */}
          <div>
            <button
              type="button"
              onClick={() => setIsTraveling(!isTraveling)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                isTraveling
                  ? 'bg-[#EAF1F1] border-[#1E3A5F]/40'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                isTraveling ? 'bg-[#1E3A5F]/15' : 'bg-gray-100'
              }`}>
                <Plane className={isTraveling ? 'text-[#1E3A5F]' : 'text-gray-400'} size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">Traveling / utility-scale crew</p>
                <p className="text-[11px] text-gray-500">Add a non-taxable per diem to take-home pay</p>
              </div>
              <div className={`flex-shrink-0 w-9 h-5 rounded-full transition-colors relative ${
                isTraveling ? 'bg-[#1E3A5F]' : 'bg-gray-200'
              }`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                  isTraveling ? 'left-4' : 'left-0.5'
                }`} />
              </div>
            </button>

            {isTraveling && (
              <div className="mt-2 pl-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Per diem, per month
                </label>
                <div className="relative max-w-[160px]">
                  <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={perDiemMonthly}
                    onChange={(e) => setPerDiemMonthly(e.target.value.replace(/[^0-9.]/g, ''))}
                    className="w-full pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Per diem is usually untaxed under IRS accountable-plan rules for work travel — check with your employer or a tax pro for your situation.
                </p>
              </div>
            )}
          </div>

          {/* Pay Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Pay Frequency</label>
            <div className="relative">
              <select
                value={payFrequency}
                onChange={(e) => setPayFrequency(e.target.value)}
                className="w-full appearance-none px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent bg-white"
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
            <div className={`grid gap-2 ${compact ? 'grid-cols-1' : 'grid-cols-3'}`}>
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
                      ? 'bg-[#0B1A2E] text-white border-[#0B1A2E]'
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
                className="w-full appearance-none px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent bg-white"
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
              <p className="text-xs text-emerald-600 mt-1">{stateInfo.note}</p>
            )}
          </div>
        </div>

        {/* ── RESULTS ── */}
        <div className={compact ? '' : 'lg:col-span-3'}>

          {/* Net Pay Highlight */}
          <div className="bg-gradient-to-br from-[#0B1A2E] to-[#1E3A5F] rounded-2xl p-6 mb-6">
            <p className="text-sm text-white/60 mb-1">Your estimated take-home pay</p>
            <div className="flex items-baseline gap-3 flex-wrap">
              <p className="text-4xl font-bold text-[#F5B819]">
                ${fmt(netAnnualTotal / periods)}
              </p>
              <p className="text-white/60">per {periodLabel}</p>
            </div>
            <p className="text-sm text-white/50 mt-2">
              ${fmt(netAnnualTotal)} annually · Effective tax rate: {fmtPct(results.effectiveRate)}
              {isNabcep && <> · includes +${fmt(NABCEP_BUMP)} NABCEP bump</>}
              {isTraveling && perDiemAnnual > 0 && <> · includes ${fmt(perDiemAnnual)} per diem</>}
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

              {/* Take-Home Pay */}
              <div className="grid grid-cols-3 gap-px bg-gray-100">
                <div className="bg-[#FEF3C7] px-3 sm:px-5 py-4 text-sm font-bold text-[#0B1A2E] border-t-2 border-[#F5B819]/40">Take-Home Pay</div>
                <div className="bg-[#FEF3C7] px-3 sm:px-5 py-4 text-sm text-right font-bold text-[#0B1A2E] border-t-2 border-[#F5B819]/40">
                  ${fmt(results.netAnnual / periods)}
                </div>
                <div className="bg-[#FEF3C7] px-3 sm:px-5 py-4 text-sm text-right font-bold text-[#0B1A2E] border-t-2 border-[#F5B819]/40">
                  ${fmt(results.netAnnual)}
                </div>
              </div>

              {/* Per diem, if applicable */}
              {isTraveling && perDiemAnnual > 0 && (
                <>
                  <div className="grid grid-cols-3 gap-px bg-gray-100">
                    <div className="bg-white px-3 sm:px-5 py-3.5 text-sm text-[#1E3A5F] font-medium border-t border-gray-200">
                      + Per diem (non-taxable)
                    </div>
                    <div className="bg-white px-3 sm:px-5 py-3.5 text-sm text-right text-[#1E3A5F] font-medium border-t border-gray-200">
                      +${fmt(perDiemAnnual / periods)}
                    </div>
                    <div className="bg-white px-3 sm:px-5 py-3.5 text-sm text-right text-[#1E3A5F] font-medium border-t border-gray-200">
                      +${fmt(perDiemAnnual)}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-px bg-gray-100">
                    <div className="bg-[#0B1A2E] px-3 sm:px-5 py-4 text-sm font-bold text-[#F5B819] border-t-2 border-[#F5B819]/40">
                      Total Take-Home
                    </div>
                    <div className="bg-[#0B1A2E] px-3 sm:px-5 py-4 text-sm text-right font-bold text-[#F5B819] border-t-2 border-[#F5B819]/40">
                      ${fmt(netAnnualTotal / periods)}
                    </div>
                    <div className="bg-[#0B1A2E] px-3 sm:px-5 py-4 text-sm text-right font-bold text-[#F5B819] border-t-2 border-[#F5B819]/40">
                      ${fmt(netAnnualTotal)}
                    </div>
                  </div>
                </>
              )}
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
                    className="bg-[#F5B819] transition-all duration-300"
                    style={{ width: `${(results.netAnnual / results.grossAnnual) * 100}%` }}
                    title={`Take-home: ${fmtPct(results.netAnnual / results.grossAnnual)}`}
                  />
                  <div
                    className="bg-[#1E3A5F] transition-all duration-300"
                    style={{ width: `${(results.federalTax / results.grossAnnual) * 100}%` }}
                    title={`Federal: ${fmtPct(results.federalTax / results.grossAnnual)}`}
                  />
                  <div
                    className="bg-[#B45309] transition-all duration-300"
                    style={{ width: `${(results.stateTax / results.grossAnnual) * 100}%` }}
                    title={`State: ${fmtPct(results.stateTax / results.grossAnnual)}`}
                  />
                  <div
                    className="bg-slate-400 transition-all duration-300"
                    style={{ width: `${(results.socialSecurity / results.grossAnnual) * 100}%` }}
                    title={`SS: ${fmtPct(results.socialSecurity / results.grossAnnual)}`}
                  />
                  <div
                    className="bg-slate-300 transition-all duration-300"
                    style={{ width: `${(results.medicare / results.grossAnnual) * 100}%` }}
                    title={`Medicare: ${fmtPct(results.medicare / results.grossAnnual)}`}
                  />
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#F5B819]" /> Take-home</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#1E3A5F]" /> Federal</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#B45309]" /> State</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Social Security</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Medicare</span>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 mt-4">
            Role salaries and the NABCEP premium are national-average estimates from industry
            salary data — actual pay varies by state, employer, and experience. Not tax advice.
          </p>
        </div>
      </div>
    </div>
  )
}