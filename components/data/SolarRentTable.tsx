'use client'

import { useMemo, useState } from 'react'

type Row = {
  area: string; metro: string; annualWage: number; hourlyWage: number
  monthlyRent: number; rentHours: number; rentShare: number; hudSource: string
}
const dollars = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export default function SolarRentTable({ rows }: { rows: Row[] }) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('hours')
  const visible = useMemo(() => rows
    .filter(row => row.metro.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => sort === 'salary' ? b.annualWage - a.annualWage : sort === 'highest' ? b.rentHours - a.rentHours : a.rentHours - b.rentHours), [rows, query, sort])

  return <div>
    <div className="mb-5 grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-semibold">Find a metro
        <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="City or state, e.g. Albuquerque or CA" className="mt-2 block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-normal focus:outline-none focus:ring-2 focus:ring-amber-600" />
      </label>
      <label className="text-sm font-semibold">Sort by
        <select value={sort} onChange={event => setSort(event.target.value)} className="mt-2 block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-normal focus:outline-none focus:ring-2 focus:ring-amber-600">
          <option value="hours">Fewest hours to cover rent</option>
          <option value="highest">Most hours to cover rent</option>
          <option value="salary">Highest annual salary</option>
        </select>
      </label>
    </div>
    <p className="mb-3 text-sm text-gray-600" aria-live="polite">{visible.length} of {rows.length} metros shown. Scroll horizontally to see every column.</p>
    <div className="overflow-x-auto rounded-xl border border-gray-200" tabIndex={0} role="region" aria-label="Solar installer pay and rent by metro">
      <table className="w-full min-w-[760px] text-left text-sm">
        <caption className="sr-only">May 2025 median installer pay and FY 2026 one-bedroom Fair Market Rent. All calculations use gross pay.</caption>
        <thead className="bg-[#1C2126] text-white"><tr>
          {['Metro area', 'Annual pay', 'Hourly pay', 'Monthly rent', 'Hours for rent', 'Rent / gross pay'].map(label => <th scope="col" key={label} className="px-4 py-4 font-semibold">{label}</th>)}
        </tr></thead>
        <tbody>{visible.map(row => <tr key={row.area} className="border-t border-gray-200 odd:bg-white even:bg-[#F7F7F4]">
          <th scope="row" className="px-4 py-4 font-medium"><a href={row.hudSource} className="underline decoration-gray-300 underline-offset-4 hover:decoration-amber-600">{row.metro}</a></th>
          <td className="whitespace-nowrap px-4 py-4 tabular-nums">{dollars(row.annualWage)}</td>
          <td className="px-4 py-4 tabular-nums">${row.hourlyWage.toFixed(2)}</td>
          <td className="px-4 py-4 tabular-nums">{dollars(row.monthlyRent)}</td>
          <td className="px-4 py-4 font-bold tabular-nums">{row.rentHours.toFixed(1)}</td>
          <td className="px-4 py-4 tabular-nums">{row.rentShare.toFixed(1)}%</td>
        </tr>)}</tbody>
      </table>
      {visible.length === 0 && <p className="p-6 text-gray-600">No matching metro in this report. Try another city or a two-letter state abbreviation.</p>}
    </div>
  </div>
}
