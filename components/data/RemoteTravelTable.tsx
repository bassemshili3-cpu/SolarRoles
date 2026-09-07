'use client'

import { useState } from 'react'

type Row = {
  id: string; company: string; title: string; travelKind: string; travelLabel: string;
  remoteEvidence: string; remoteSource: string; travelEvidence: string;
  notes: string; listingCount: number; sourceUrl: string; jobUrl: string;
}

export default function RemoteTravelTable({ rows }: { rows: Row[] }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const filtered = rows.filter(row => `${row.company} ${row.title}`.toLowerCase().includes(query.toLowerCase()) && (filter === 'all' || (filter === 'travel' ? ['quantified', 'unquantified', 'conflicting'].includes(row.travelKind) : row.travelKind === filter)))
  return <div>
    <div className="my-6 grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-semibold">Find a company or role<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search the reviewed descriptions" className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-normal focus:outline-amber-600" /></label>
      <label className="text-sm font-semibold">Travel disclosure<select value={filter} onChange={event => setFilter(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-normal focus:outline-amber-600">
        <option value="all">All reviewed roles</option><option value="travel">Travel or site visits mentioned</option><option value="quantified">Consistent travel percentage stated</option><option value="conflicting">Conflicting percentages</option><option value="not_stated">No requirement identified</option><option value="field">Field work without a travel schedule</option><option value="office">Ambiguous office attendance</option>
      </select></label>
    </div>
    <p className="mb-4 text-sm text-gray-600" role="status">{filtered.length} of {rows.length} employer-role combinations</p>
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full min-w-[580px] text-left text-sm">
        <caption className="sr-only">Remote offers and travel disclosures in Solar Roles job descriptions, September 6, 2026</caption>
        <thead className="bg-[#F7F7F4]"><tr><th scope="col" className="p-4">Company and role</th><th scope="col" className="p-4">What the description says</th></tr></thead>
        <tbody className="divide-y divide-gray-200">{filtered.map(row => <tr key={row.id} className="align-top">
          <th scope="row" className="w-[38%] p-4 font-normal"><span className="block font-bold">{row.company}</span><a href={row.jobUrl} className="mt-1 block text-[#744600] underline underline-offset-2">{row.title}</a><span className="mt-2 block text-xs text-gray-500">{row.listingCount} listing{row.listingCount > 1 ? 's' : ''} grouped</span></th>
          <td className="p-4"><p className="font-semibold">{row.travelLabel}</p><details className="mt-3"><summary className="cursor-pointer text-[#744600] underline underline-offset-2">Read the evidence</summary>
            <div className="mt-3 space-y-3 text-sm leading-6 text-gray-700"><p><strong>Remote signal ({row.remoteSource === 'description' ? 'description excerpt' : 'title / location'}):</strong> {row.remoteEvidence}</p>
              {row.travelEvidence ? <p><strong>Attendance or travel excerpt:</strong> “{row.travelEvidence}”</p> : <p>No explicit travel, site-visit or office-attendance requirement was identified. This does not establish that travel is prohibited or unnecessary.</p>}
              {row.notes && <p>{row.notes}</p>}<a href={row.sourceUrl} className="inline-block text-[#744600] underline">Source listing</a>
            </div>
          </details></td>
        </tr>)}</tbody>
      </table>
      {filtered.length === 0 && <p className="p-6 text-sm">No matching roles. Try another company or travel disclosure.</p>}
    </div>
  </div>
}
