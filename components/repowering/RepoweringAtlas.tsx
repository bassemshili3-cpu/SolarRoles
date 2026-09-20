'use client'

import { useMemo, useRef, useState } from 'react'
import { geoAlbersUsa } from 'd3-geo'
import { Download, Map as MapIcon, RotateCcw, Table2 } from 'lucide-react'
import { US_STATE_PATHS } from '@/lib/data/us-states-paths'
import type {
  AtlasMetric,
  RepoweringAtlas,
  RepoweringPlant,
  RepoweringStateDetail,
  RepoweringStateSummary,
} from '@/lib/repowering/atlasTypes'

type ViewMode = 'map' | 'table'
type SortKey = 'currentDcGW' | 'modeledDcGW' | 'additionalDcGW' | 'headroomPct' | 'modeledFacilities' | 'unableToModelFacilities'
type HoverInfo = { state: RepoweringStateSummary; name: string; x: number; y: number }

const FULL_VIEWBOX = '0 0 960 600'

const HEADROOM_LEGEND = [
  { label: 'No modelable facilities', color: '#e2e8f0' },
  { label: '<10%', color: '#dbeafe' },
  { label: '10–20%', color: '#bfdbfe' },
  { label: '20–30%', color: '#93c5fd' },
  { label: '30–40%', color: '#60a5fa' },
  { label: '40–50%', color: '#3b82f6' },
  { label: '50%+', color: '#1d4ed8' },
]

const ADDITIONAL_LEGEND = [
  { label: 'No modelable facilities', color: '#e2e8f0' },
  { label: '<0.1 GW', color: '#dcfce7' },
  { label: '0.1–0.5 GW', color: '#bbf7d0' },
  { label: '0.5–1 GW', color: '#86efac' },
  { label: '1–2 GW', color: '#4ade80' },
  { label: '2–5 GW', color: '#22c55e' },
  { label: '5 GW+', color: '#15803d' },
]

function stateName(code: string) {
  return US_STATE_PATHS[code]?.name ?? code
}

function format(value: number | null, digits = 1) {
  if (value === null || !Number.isFinite(value)) return '—'
  return value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

function signed(value: number | null, suffix: string, digits = 1) {
  if (value === null || !Number.isFinite(value)) return `—${suffix}`
  return `${value >= 0 ? '+' : ''}${format(value, digits)}${suffix}`
}

function fillForState(state: RepoweringStateSummary | undefined, metric: AtlasMetric) {
  if (!state || state.modeledFacilities === 0 || state.headroomPct === null) return '#e2e8f0'
  if (metric === 'additionalGw') {
    const value = state.additionalDcGW
    if (value < 0.1) return '#dcfce7'
    if (value < 0.5) return '#bbf7d0'
    if (value < 1) return '#86efac'
    if (value < 2) return '#4ade80'
    if (value < 5) return '#22c55e'
    return '#15803d'
  }
  const value = state.headroomPct
  if (value < 10) return '#dbeafe'
  if (value < 20) return '#bfdbfe'
  if (value < 30) return '#93c5fd'
  if (value < 40) return '#60a5fa'
  if (value < 50) return '#3b82f6'
  return '#1d4ed8'
}

function plantAuditHref(plant: RepoweringPlant, metadata: RepoweringAtlas['metadata']) {
  return `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify({ metadata, plant }, null, 2))}`
}

function metricValue(state: RepoweringStateSummary, key: SortKey) {
  return Number(state[key] ?? Number.NEGATIVE_INFINITY)
}

export default function RepoweringAtlasMap({ atlas }: { atlas: RepoweringAtlas }) {
  const [metric, setMetric] = useState<AtlasMetric>('headroomPct')
  const [view, setView] = useState<ViewMode>('map')
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const [selectedDetail, setSelectedDetail] = useState<RepoweringStateDetail | null>(null)
  const [selectedPlant, setSelectedPlant] = useState<RepoweringPlant | null>(null)
  const [hovered, setHovered] = useState<HoverInfo | null>(null)
  const [viewBox, setViewBox] = useState(FULL_VIEWBOX)
  const [sortKey, setSortKey] = useState<SortKey>('additionalDcGW')
  const [sortDesc, setSortDesc] = useState(true)
  const panelRef = useRef<HTMLDivElement>(null)
  const stateMap = useMemo(() => new Map(atlas.states.map((state) => [state.state, state])), [atlas.states])
  const selectedSummary = selectedCode ? stateMap.get(selectedCode) ?? null : null
  const projection = useMemo(() => geoAlbersUsa().translate([480, 300]), [])

  const sortedStates = useMemo(
    () => [...atlas.states].sort((a, b) => (metricValue(a, sortKey) - metricValue(b, sortKey)) * (sortDesc ? -1 : 1)),
    [atlas.states, sortDesc, sortKey],
  )

  const markerClusters = useMemo(() => {
    if (!selectedDetail) return []
    const clusters = new Map<string, { x: number; y: number; plants: RepoweringPlant[] }>()
    selectedDetail.plants.forEach((plant) => {
      if (plant.longitude === null || plant.latitude === null) return
      const point = projection([plant.longitude, plant.latitude])
      if (!point) return
      const key = `${Math.round(point[0] / 10)}:${Math.round(point[1] / 10)}`
      const cluster = clusters.get(key)
      if (cluster) cluster.plants.push(plant)
      else clusters.set(key, { x: point[0], y: point[1], plants: [plant] })
    })
    return Array.from(clusters.values())
  }, [projection, selectedDetail])

  async function selectState(code: string, path: SVGPathElement, pointerType?: string) {
    const box = path.getBBox()
    const padding = Math.max(10, Math.max(box.width, box.height) * 0.12)
    setViewBox(`${box.x - padding} ${box.y - padding} ${box.width + padding * 2} ${box.height + padding * 2}`)
    setSelectedCode(code)
    setSelectedPlant(null)
    const summary = stateMap.get(code)
    try {
      const response = await fetch(`/data/repowering/states/${code}.json`)
      if (!response.ok) throw new Error(String(response.status))
      setSelectedDetail((await response.json()) as RepoweringStateDetail)
    } catch {
      setSelectedDetail(summary ? { ...summary, plants: [] } : null)
    }
    if (pointerType === 'touch' || window.matchMedia('(max-width: 767px)').matches) {
      window.setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
    }
  }

  function resetMap() {
    setSelectedCode(null)
    setSelectedDetail(null)
    setSelectedPlant(null)
    setViewBox(FULL_VIEWBOX)
  }

  function changeSort(next: SortKey) {
    if (sortKey === next) setSortDesc((current) => !current)
    else {
      setSortKey(next)
      setSortDesc(true)
    }
  }

  const legend = metric === 'headroomPct' ? HEADROOM_LEGEND : ADDITIONAL_LEGEND
  const analysisDate = Number.isNaN(Date.parse(atlas.metadata.analysisRun))
    ? atlas.metadata.analysisRun
    : new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(atlas.metadata.analysisRun))
  const national = atlas.national

  return (
    <section className="mt-14 border-t border-slate-200 pt-10" aria-labelledby="repowering-atlas-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-teal-700">National screening atlas</p>
          <h2 id="repowering-atlas-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            How much more solar could fit inside existing U.S. footprints?
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Every USPVDB facility that the model can process is included. Select a state to see its facilities, assumptions and results.
          </p>
        </div>
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1" aria-label="Map metric">
          {([['headroomPct', '% Headroom'], ['additionalGw', 'Additional GWdc']] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={metric === value}
              onClick={() => setMetric(value)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${metric === value ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-950'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Facilities modeled" value={national.modeledFacilities.toLocaleString('en-US')} detail={`${national.unableToModelFacilities.toLocaleString('en-US')} unable to model`} />
        <Stat label="Current capacity" value={`${format(national.currentDcGW)} GWdc`} />
        <Stat label="Reference repowering" value={`${format(national.modeledDcGW)} GWdc`} />
        <Stat label="Technical headroom" value={`${signed(national.additionalDcGW, ' GWdc')} · ${signed(national.headroomPct, '%')}`} accent />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-xs font-medium text-slate-600">
          <a href={atlas.metadata.datasetUrl} target="_blank" rel="noreferrer" className="font-bold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:text-teal-700">{atlas.metadata.dataset}</a> · {atlas.metadata.datasetDate} · Analysis run: {analysisDate} · Scenario: {atlas.metadata.scenario[0]?.toUpperCase() + atlas.metadata.scenario.slice(1)}
        </p>
        {selectedCode ? (
          <button type="button" onClick={resetMap} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-950">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> National view
          </button>
        ) : null}
      </div>

      <div className={`mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-5 ${view === 'table' ? 'hidden' : ''}`}>
        <div className={`grid gap-5 ${selectedCode ? 'lg:grid-cols-[1.45fr_0.85fr]' : ''}`}>
          <div className="relative min-w-0 self-start overflow-hidden rounded-xl border border-slate-200 bg-white">
            <svg viewBox={viewBox} className="h-auto w-full select-none transition-all duration-500" role="img" aria-label="U.S. solar repowering headroom by state">
              {Object.entries(US_STATE_PATHS).map(([code, state]) => {
                const summary = stateMap.get(code)
                const selected = selectedCode === code
                const description = summary?.modeledFacilities
                  ? `${format(summary.headroomPct)} percent headroom based on ${summary.modeledFacilities} facilities`
                  : 'no modelable facilities'
                return (
                  <path
                    key={code}
                    d={state.d}
                    fill={fillForState(summary, metric)}
                    stroke={selected ? '#0f172a' : '#ffffff'}
                    strokeWidth={selected ? 2.4 : 0.9}
                    tabIndex={0}
                    role="button"
                    aria-label={`${state.name}: ${description}`}
                    onPointerMove={(event) => {
                      if (event.pointerType === 'touch' || !summary) return
                      const rect = event.currentTarget.ownerSVGElement?.getBoundingClientRect()
                      if (!rect) return
                      setHovered({ state: summary, name: state.name, x: event.clientX - rect.left, y: event.clientY - rect.top })
                    }}
                    onPointerLeave={() => setHovered(null)}
                    onPointerUp={(event) => void selectState(code, event.currentTarget, event.pointerType)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        void selectState(code, event.currentTarget, 'keyboard')
                      }
                    }}
                    className="cursor-pointer transition-opacity hover:opacity-80 focus:outline-none"
                  />
                )
              })}
              {selectedCode ? markerClusters.map((cluster) => {
                const plant = cluster.plants[0]
                return (
                  <g key={`${cluster.x}-${cluster.y}`} onClick={() => setSelectedPlant(plant)} className="cursor-pointer">
                    <circle cx={cluster.x} cy={cluster.y} r={cluster.plants.length > 1 ? 5.5 : 3.8} fill="#f59e0b" stroke="#78350f" strokeWidth={0.8} vectorEffect="non-scaling-stroke" />
                    {cluster.plants.length > 1 ? <text x={cluster.x} y={cluster.y + 1.8} textAnchor="middle" fontSize="5" fontWeight="700" fill="#451a03">{cluster.plants.length}</text> : null}
                  </g>
                )
              }) : null}
            </svg>

            {hovered ? (
              <div className="pointer-events-none absolute z-10 min-w-56 rounded-xl bg-slate-950 px-3 py-2.5 text-xs text-white shadow-xl" style={{ left: hovered.x, top: hovered.y - 12, transform: 'translate(-50%, -100%)' }}>
                <p className="font-bold">{hovered.name}</p>
                {hovered.state.modeledFacilities > 0 ? (
                  <>
                    <p className="mt-1 text-slate-300">Current: {format(hovered.state.currentDcGW)} GWdc</p>
                    <p className="text-slate-300">Reference repowering: {format(hovered.state.modeledDcGW)} GWdc</p>
                    <p className="mt-1 font-bold text-emerald-300">{signed(hovered.state.additionalDcGW, ' GWdc')} · {signed(hovered.state.headroomPct, '%')}</p>
                    <p className="mt-1 text-slate-300">Based on {hovered.state.modeledFacilities} facilities</p>
                  </>
                ) : <p className="mt-1 font-semibold text-slate-200">No modelable facilities</p>}
              </div>
            ) : null}
          </div>

          {selectedCode ? (
            <div ref={panelRef} className="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-5 lg:max-h-[520px] lg:self-start lg:overflow-y-auto">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Selected state</p>
                  <h3 className="mt-1 text-2xl font-semibold text-slate-950">{stateName(selectedCode)}</h3>
                </div>
              </div>
              {selectedSummary ? (
                <>
                  <p className="mt-3 text-sm font-semibold text-slate-800">{selectedSummary.modeledFacilities} facilities modeled</p>
                  <p className="mt-1 text-xs text-slate-500">Based on {selectedSummary.modeledFacilities} facilities. Sample size does not determine whether a state is shown.</p>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <Metric label="Current" value={`${format(selectedSummary.currentDcGW)} GWdc`} />
                    <Metric label="Reference repowering" value={`${format(selectedSummary.modeledDcGW)} GWdc`} />
                    <Metric label="Additional" value={signed(selectedSummary.additionalDcGW, ' GWdc')} />
                    <Metric label="Headroom" value={signed(selectedSummary.headroomPct, '%')} />
                  </div>

                  {selectedDetail ? (
                    <div className="mt-5 space-y-5 border-t border-slate-200 pt-5">
                      <Breakdown title="Mounting type" rows={selectedDetail.byAxis} />
                      <Breakdown title="Vintage" rows={selectedDetail.byVintage} />
                      <CountList title="Unable to model" values={selectedDetail.unableToModelReasons} empty="Every source facility in this state was modeled." />
                      <div>
                        <h4 className="text-sm font-semibold text-slate-950">Top facilities by headroom</h4>
                        <div className="mt-2 space-y-1.5">
                          {selectedDetail.topPlants.map((plant) => (
                            <button key={plant.id} type="button" onClick={() => setSelectedPlant(plant)} className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 text-left text-xs hover:bg-slate-50">
                              <span className="truncate font-medium text-slate-800">{plant.name}</span>
                              <span className="shrink-0 font-bold text-emerald-700">{signed(plant.additionalDcMW, ' MW')}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : <p className="mt-5 text-sm text-slate-500">Loading state detail…</p>}
                </>
              ) : <p className="mt-4 text-sm text-slate-500">No USPVDB facilities are available for this state.</p>}
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
          {legend.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm border border-slate-300" style={{ background: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {view === 'table' ? <StateTable states={sortedStates} sortKey={sortKey} sortDesc={sortDesc} onSort={changeSort} /> : null}

      <aside className="mt-5 rounded-xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-600">
        <p className="font-bold text-slate-900">Data &amp; methodology note</p>
        <p className="mt-1">Results are modeled estimates based on facility boundaries and attributes published in the U.S. Large-Scale Solar Photovoltaic Database (USPVDB v4.0, April 2026). USPVDB records are compiled from EIA data, verified against aerial imagery and quality-checked by USGS/LBNL. Any errors, omissions or boundary inaccuracies in the source data may therefore propagate into these estimates. Modeled capacity represents technical same-footprint DC nameplate potential under the stated design assumptions, not economically feasible or interconnection-approved repowering capacity.</p>
      </aside>

      {selectedPlant ? <PlantCard plant={selectedPlant} metadata={atlas.metadata} onClose={() => setSelectedPlant(null)} /> : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1" aria-label="Atlas view">
          <button type="button" onClick={() => setView('map')} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${view === 'map' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}><MapIcon className="h-4 w-4" /> Map</button>
          <button type="button" onClick={() => setView('table')} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${view === 'table' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}><Table2 className="h-4 w-4" /> Table</button>
        </div>
        <a href={`/data/repowering/plant-results-${atlas.metadata.scenario}.csv`} download className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-900"><Download className="h-4 w-4" /> Export modeled facilities (CSV)</a>
      </div>
    </section>
  )
}

function Stat({ label, value, detail, accent = false }: { label: string; value: string; detail?: string; accent?: boolean }) {
  return <div className={`rounded-xl border p-4 ${accent ? 'border-teal-200 bg-teal-50' : 'border-slate-200 bg-white'}`}><p className="text-xs font-medium text-slate-500">{label}</p><p className={`mt-1 text-xl font-bold ${accent ? 'text-teal-800' : 'text-slate-950'}`}>{value}</p>{detail ? <p className="mt-1 text-xs text-slate-500">{detail}</p> : null}</div>
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-slate-50 p-3"><span className="block text-xs text-slate-500">{label}</span><strong>{value}</strong></div>
}

function Breakdown({ title, rows }: { title: string; rows: RepoweringStateDetail['byAxis'] }) {
  if (!rows.length) return null
  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-950">{title}</h4>
      <div className="mt-2 space-y-1.5 text-xs text-slate-600">
        {rows.map((row) => <div key={row.label} className="flex justify-between gap-3"><span>{row.label} · {row.plants} facilities</span><strong className="text-slate-800">{signed(row.headroomPct, '%')}</strong></div>)}
      </div>
    </div>
  )
}

function CountList({ title, values, empty }: { title: string; values: Record<string, number>; empty: string }) {
  const rows = Object.entries(values).sort((a, b) => b[1] - a[1])
  return <div><h4 className="text-sm font-semibold text-slate-950">{title}</h4>{rows.length ? <div className="mt-2 space-y-1 text-xs text-slate-600">{rows.map(([label, count]) => <div key={label} className="flex justify-between gap-3"><span>{label.replaceAll('_', ' ').toLowerCase()}</span><strong>{count}</strong></div>)}</div> : <p className="mt-1 text-xs text-slate-500">{empty}</p>}</div>
}

function PlantCard({ plant, metadata, onClose }: { plant: RepoweringPlant; metadata: RepoweringAtlas['metadata']; onClose: () => void }) {
  const mounting = plant.axis === 'fixed' ? 'Fixed tilt' : plant.axis === 'tracker' ? 'Single-axis tracker' : 'Unknown axis (fixed-layout fallback)'
  return (
    <article className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/40 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-amber-800">Facility detail</p><h3 className="mt-1 text-xl font-semibold text-slate-950">{plant.name}</h3><p className="mt-1 text-sm text-slate-600">{plant.county ? `${plant.county} County, ` : ''}{stateName(plant.state)}{plant.year ? ` · ${plant.year}` : ''}</p></div>
        <button type="button" onClick={onClose} className="text-sm font-semibold text-slate-600 hover:text-slate-950">Close</button>
      </div>
      <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Current', `${format(plant.currentDcMW)} MWdc`],
          ['Reference repowering', `${format(plant.modeledDcMW)} MWdc`],
          ['Additional', signed(plant.additionalDcMW, ' MWdc')],
          ['Headroom', signed(plant.headroomPct, '%')],
          ['Footprint', `${format(plant.footprintAcres)} acres`],
          ['Mounting', mounting],
          ['Packed GCR', `${format(plant.packedGcrPct)}%`],
          ['Row pitch', plant.rowPitchM === null ? '—' : `${format(plant.rowPitchM)} m`],
          ['Modules', plant.moduleCount.toLocaleString('en-US')],
        ].map(([label, value]) => <div key={label} className="rounded-lg border border-amber-100 bg-white p-3"><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{value}</dd></div>)}
      </dl>
      <a href={plantAuditHref(plant, metadata)} download={`repowering-${plant.id}.json`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-900"><Download className="h-4 w-4" /> Download auditable calculation record</a>
    </article>
  )
}

const TABLE_COLUMNS: Array<{ key: SortKey; label: string }> = [
  { key: 'currentDcGW', label: 'Current GWdc' },
  { key: 'modeledDcGW', label: 'Reference GWdc' },
  { key: 'additionalDcGW', label: 'Additional GWdc' },
  { key: 'headroomPct', label: 'Headroom %' },
  { key: 'modeledFacilities', label: 'Facilities modeled' },
  { key: 'unableToModelFacilities', label: 'Unable to model' },
]

function StateTable({ states, sortKey, sortDesc, onSort }: { states: RepoweringStateSummary[]; sortKey: SortKey; sortDesc: boolean; onSort: (key: SortKey) => void }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-[850px] w-full border-collapse text-sm">
        <thead className="bg-slate-50 text-left text-xs text-slate-600"><tr><th className="px-4 py-3">State</th>{TABLE_COLUMNS.map((column) => <th key={column.key} className="px-3 py-3 text-right"><button type="button" onClick={() => onSort(column.key)} className="font-semibold hover:text-slate-950">{column.label}{sortKey === column.key ? (sortDesc ? ' ↓' : ' ↑') : ''}</button></th>)}</tr></thead>
        <tbody>{states.map((state) => <tr key={state.state} className="border-t border-slate-200"><th className="px-4 py-3 text-left font-semibold text-slate-900">{stateName(state.state)}</th><td className="px-3 py-3 text-right">{format(state.currentDcGW)}</td><td className="px-3 py-3 text-right">{format(state.modeledDcGW)}</td><td className="px-3 py-3 text-right">{format(state.additionalDcGW)}</td><td className="px-3 py-3 text-right">{format(state.headroomPct)}%</td><td className="px-3 py-3 text-right">{state.modeledFacilities}</td><td className="px-3 py-3 text-right">{state.unableToModelFacilities}</td></tr>)}</tbody>
      </table>
    </div>
  )
}
