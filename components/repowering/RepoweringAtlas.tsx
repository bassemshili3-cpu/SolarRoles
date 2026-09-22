'use client'

import { useMemo, useRef, useState } from 'react'
import { geoAlbersUsa } from 'd3-geo'
import { Download, Map as MapIcon, RotateCcw, Table2 } from 'lucide-react'
import { US_STATE_PATHS } from '@/lib/data/us-states-paths'
import {
  buildExpansionHeadroomPoints,
  median,
  type ExpansionHeadroomPoint,
} from '@/lib/repowering/expansionChart'
import {
  estimatePpaRenewal,
  PPA_RENEWAL_CALENDAR_2010_2014,
  PPA_RENEWAL_PROFILE,
} from '@/lib/repowering/ppaRenewal'
import type {
  AtlasMetric,
  EiaExpansionData,
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

export default function RepoweringAtlasMap({ atlas, expansion }: { atlas: RepoweringAtlas; expansion: EiaExpansionData }) {
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
            Every USPVDB facility that the model can process is included. The result is physical density headroom; fleet age and estimated PPA timing are shown separately to screen when that headroom could become commercially relevant.
          </p>
        </div>
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1" aria-label="Map metric">
          {([['headroomPct', '% Density headroom'], ['additionalGw', 'Headroom GWdc']] as const).map(([value, label]) => (
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
        <Stat label="Modern-density scenario" value={`${format(national.modeledDcGW)} GWdc`} detail="Physical fit, not a project pipeline" />
        <Stat label="Total density headroom" value={`${signed(national.additionalDcGW, ' GWdc')} · ${signed(national.headroomPct, '%')}`} detail="All vintages, including recent plants" accent />
      </div>

      <ExpansionHeadroomChart atlas={atlas} expansion={expansion} />

      <VintageAnalysis national={national} />

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
                    <p className="text-slate-300">Modern-density scenario: {format(hovered.state.modeledDcGW)} GWdc</p>
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
                    <Metric label="Modern-density scenario" value={`${format(selectedSummary.modeledDcGW)} GWdc`} />
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

function ExpansionHeadroomChart({ atlas, expansion }: { atlas: RepoweringAtlas; expansion: EiaExpansionData }) {
  const points = useMemo(
    () => buildExpansionHeadroomPoints(atlas.states, expansion),
    [atlas.states, expansion],
  )
  const [activePoint, setActivePoint] = useState<ExpansionHeadroomPoint | null>(null)
  const width = 860
  const height = 500
  const margin = { top: 28, right: 24, bottom: 78, left: 82 }
  const plotWidth = width - margin.left - margin.right
  const plotHeight = height - margin.top - margin.bottom
  const xMin = -25
  const xMax = 80
  const xTicks = [-20, 0, 20, 40, 60, 80]
  const yTicks = [0, 20, 40, 60, 80, 100]
  const medianHeadroom = median(points.map((point) => point.headroomPct))
  const medianExpansion = median(points.map((point) => point.shareBeyond5KmPct))
  const upperRightCount = points.filter(
    (point) => point.headroomPct >= medianHeadroom && point.shareBeyond5KmPct >= medianExpansion,
  ).length
  const fullCoveragePoints = [...points]
    .filter((point) => point.matchedOutputCoveragePct >= 100)
    .sort((a, b) => b.beyond5KmPipelineMW - a.beyond5KmPipelineMW)
  const nextClosestPoints = [...points]
    .filter((point) => point.matchedOutputCoveragePct >= 50 && point.matchedOutputCoveragePct < 100)
    .sort((a, b) => b.matchedOutputCoveragePct - a.matchedOutputCoveragePct)
  const nationalHeadroomAcMW = points.reduce((total, point) => total + point.headroomAcMW, 0)
  const nationalBeyond5KmPipelineMW = points.reduce((total, point) => total + point.beyond5KmPipelineMW, 0)
  const nationalMatchedOutputCoveragePct = nationalBeyond5KmPipelineMW > 0
    ? nationalHeadroomAcMW / nationalBeyond5KmPipelineMW * 100
    : 0
  const maxPlannedMW = Math.max(...points.map((point) => point.plannedSolarMW), 1)
  const x = (value: number) => margin.left + ((value - xMin) / (xMax - xMin)) * plotWidth
  const y = (value: number) => margin.top + (1 - value / 100) * plotHeight
  const radius = (value: number) => 4 + Math.sqrt(value / maxPlannedMW) * 12
  const labels = new Set(['TX', 'CA', 'AZ', 'OR', 'GA', 'MI'])

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white" aria-labelledby="expansion-headroom-title">
      <div className="border-b border-slate-200 px-5 py-6 sm:px-7">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">Planned-build geography</p>
        <h3 id="expansion-headroom-title" className="mt-2 max-w-4xl text-2xl font-semibold tracking-tight text-slate-950">
          77.7% of planned solar MW sits more than 5 km from existing solar
        </h3>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Across {points.length} states with both measures, the planned fleet continues to spread beyond today&apos;s solar footprint even where the existing fleet retains modeled density headroom. The upper-right quadrant contains {upperRightCount} states above both state medians.
        </p>
      </div>

      <div className="p-4 sm:p-6">
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[700px] w-full" role="img" aria-labelledby="expansion-headroom-svg-title expansion-headroom-svg-desc">
            <title id="expansion-headroom-svg-title">Existing-site solar headroom compared with planned solar expansion by state</title>
            <desc id="expansion-headroom-svg-desc">A scatter plot of 48 states. The horizontal axis shows modeled existing-site headroom. The vertical axis shows the share of planned solar megawatts more than five kilometers from existing solar. Circle size represents planned solar megawatts.</desc>

            <rect
              x={x(medianHeadroom)}
              y={margin.top}
              width={x(xMax) - x(medianHeadroom)}
              height={y(medianExpansion) - margin.top}
              fill="#fef3c7"
              opacity="0.55"
            />

            {yTicks.map((tick) => (
              <g key={`y-${tick}`}>
                <line x1={margin.left} x2={width - margin.right} y1={y(tick)} y2={y(tick)} stroke="#e2e8f0" />
                <text x={margin.left - 12} y={y(tick) + 4} textAnchor="end" fontSize="12" fill="#64748b">{tick}%</text>
              </g>
            ))}
            {xTicks.map((tick) => (
              <g key={`x-${tick}`}>
                <line x1={x(tick)} x2={x(tick)} y1={margin.top} y2={height - margin.bottom} stroke="#e2e8f0" />
                <text x={x(tick)} y={height - margin.bottom + 24} textAnchor="middle" fontSize="12" fill="#64748b">{tick}%</text>
              </g>
            ))}

            <line x1={x(medianHeadroom)} x2={x(medianHeadroom)} y1={margin.top} y2={height - margin.bottom} stroke="#475569" strokeDasharray="6 5" />
            <line x1={margin.left} x2={width - margin.right} y1={y(medianExpansion)} y2={y(medianExpansion)} stroke="#475569" strokeDasharray="6 5" />
            <text x={x(medianHeadroom) + 7} y={height - margin.bottom - 8} fontSize="11" fontWeight="600" fill="#475569">State median {format(medianHeadroom)}%</text>
            <text x={margin.left + 7} y={y(medianExpansion) - 8} fontSize="11" fontWeight="600" fill="#475569">State median {format(medianExpansion)}%</text>
            <text x={width - margin.right - 8} y={margin.top + 18} textAnchor="end" fontSize="11" fontWeight="700" fill="#92400e">High headroom · high geographic expansion</text>

            {[...points].sort((a, b) => b.plannedSolarMW - a.plannedSolarMW).map((point) => {
              const active = activePoint?.state === point.state
              const highlighted = point.headroomPct >= medianHeadroom && point.shareBeyond5KmPct >= medianExpansion
              return (
                <g key={point.state}>
                  <circle
                    cx={x(point.headroomPct)}
                    cy={y(point.shareBeyond5KmPct)}
                    r={radius(point.plannedSolarMW)}
                    fill={highlighted ? '#f59e0b' : '#0d9488'}
                    fillOpacity={active ? 0.95 : 0.72}
                    stroke={active ? '#0f172a' : '#ffffff'}
                    strokeWidth={active ? 2.5 : 1.3}
                    tabIndex={0}
                    role="button"
                    aria-label={`${stateName(point.state)}: ${format(point.headroomPct)} percent headroom; ${format(point.shareBeyond5KmPct)} percent of planned solar megawatts more than five kilometers from existing solar; ${format(point.plannedSolarMW, 0)} planned megawatts`}
                    onMouseEnter={() => setActivePoint(point)}
                    onMouseLeave={() => setActivePoint(null)}
                    onFocus={() => setActivePoint(point)}
                    onBlur={() => setActivePoint(null)}
                    onClick={() => setActivePoint(point)}
                    className="cursor-pointer outline-none transition-opacity hover:opacity-100"
                  >
                    <title>{stateName(point.state)}: {format(point.headroomPct)}% headroom, {format(point.shareBeyond5KmPct)}% beyond 5 km, {format(point.plannedSolarMW, 0)} MW planned</title>
                  </circle>
                  {labels.has(point.state) ? (
                    <text x={x(point.headroomPct) + radius(point.plannedSolarMW) + 4} y={y(point.shareBeyond5KmPct) + 4} fontSize="11" fontWeight="700" fill="#334155">{point.state}</text>
                  ) : null}
                </g>
              )
            })}

            <text x={margin.left + plotWidth / 2} y={height - 18} textAnchor="middle" fontSize="13" fontWeight="700" fill="#334155">Modeled existing-site headroom (%)</text>
            <text transform={`translate(20 ${margin.top + plotHeight / 2}) rotate(-90)`} textAnchor="middle" fontSize="13" fontWeight="700" fill="#334155">Share of planned solar MW &gt;5 km from existing solar (%)</text>
          </svg>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600">
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-teal-600" />Each circle is a state</span>
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-amber-500" />Above both state medians</span>
            <span>Circle area scales with planned solar MW</span>
          </div>
          <p className="text-xs font-semibold text-slate-700">{format(expansion.national.plannedSolarMW / 1000)} GW · {expansion.national.projects.toLocaleString('en-US')} planned projects</p>
        </div>

        <div className="mt-5 min-h-24 rounded-xl border border-slate-200 bg-slate-50 p-4" aria-live="polite">
          {activePoint ? (
            <div>
              <p className="font-semibold text-slate-950">{stateName(activePoint.state)}</p>
              <div className="mt-2 grid gap-2 text-sm text-slate-600 sm:grid-cols-4">
                <p><strong className="text-slate-900">{format(activePoint.headroomPct)}%</strong><br />modeled headroom</p>
                <p><strong className="text-slate-900">{format(activePoint.shareBeyond5KmPct)}%</strong><br />of planned MW beyond 5 km</p>
                <p><strong className="text-slate-900">{format(activePoint.plannedSolarMW, 0)} MW</strong><br />across {activePoint.projects} planned projects</p>
                <p><strong className="text-slate-900">{format(activePoint.matchedOutputCoveragePct)}%</strong><br />matched-output coverage</p>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-6 text-slate-600">Hover, tap or focus a state to inspect its headroom, geographic expansion share and planned capacity.</p>
          )}
        </div>

        <section className="mt-6 overflow-hidden rounded-xl border border-slate-200" aria-labelledby="matched-output-title">
          <div className="bg-slate-950 px-5 py-5 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-300">Equivalent annual-output screen</p>
            <h4 id="matched-output-title" className="mt-2 text-xl font-semibold tracking-tight">
              {fullCoveragePoints.length} states have enough modeled headroom to match their pipeline beyond 5 km
            </h4>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">
              On a matched state-level solar-output basis, existing-site headroom equals {format(nationalMatchedOutputCoveragePct)}% of the pipeline located more than 5 km from existing solar across the 48-state sample.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[680px] w-full border-collapse text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">State</th>
                  <th className="px-3 py-3 text-right font-semibold">Headroom equivalent</th>
                  <th className="px-3 py-3 text-right font-semibold">Pipeline &gt;5 km</th>
                  <th className="px-4 py-3 text-right font-semibold">Coverage</th>
                </tr>
              </thead>
              <tbody>
                {fullCoveragePoints.map((point) => (
                  <tr key={point.state} className="border-t border-slate-200">
                    <th className="px-4 py-3 text-left font-semibold text-slate-950">{stateName(point.state)}</th>
                    <td className="px-3 py-3 text-right text-slate-600">{format(point.headroomAcMW, 0)} MWac</td>
                    <td className="px-3 py-3 text-right text-slate-600">{format(point.beyond5KmPipelineMW, 0)} MWac</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700">{format(point.matchedOutputCoveragePct)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="border-t border-slate-200 bg-slate-50 px-5 py-4 text-xs leading-5 text-slate-600">
            <strong className="text-slate-900">Next closest:</strong>{' '}
            {nextClosestPoints.map((point) => `${point.state} ${format(point.matchedOutputCoveragePct)}%`).join(' · ')}.
          </p>
        </section>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 text-xs leading-5 text-slate-600 sm:px-7">
        <strong className="text-slate-900">Calculation.</strong> Headroom GWdc × 1,000 ÷ 1.32 gives an equivalent MWac value. Pipeline MWac × share beyond 5 km gives the comparison capacity. Converting both to annual MWh with the same state-level capacity factor multiplies each by the same 8,760-hour and capacity-factor terms, so those terms cancel in the ratio. Negative modeled headroom is treated as zero. This is an equivalent-output siting screen—not proof that a project can move to an existing site. It does not test interconnection, land control, hourly generation, curtailment or project economics.
        {' '}<a href="https://www.eia.gov/todayinenergy/detail.php?id=35372" target="_blank" rel="noreferrer" className="font-semibold text-teal-800 underline decoration-teal-300 underline-offset-2">EIA reports utility-scale PV capacity in AC</a>; its <a href="https://www.eia.gov/electricity/data/eia860m/" target="_blank" rel="noreferrer" className="font-semibold text-teal-800 underline decoration-teal-300 underline-offset-2">monthly generator inventory</a> is preliminary and does not represent a capacity commitment.
      </div>
    </section>
  )
}

function VintageAnalysis({ national }: { national: RepoweringAtlas['national'] }) {
  const pre2010 = national.vintageCohorts.find((cohort) => cohort.label === 'Before 2010')
  const nextWave = national.vintageCohorts.find((cohort) => cohort.label === '2010–2014')
  const post2014Headroom = national.vintageCohorts
    .filter((cohort) => cohort.label === '2015–2019' || cohort.label === '2020–2026')
    .reduce((total, cohort) => total + cohort.additionalDcGW, 0)
  const post2014HeadroomShare = national.additionalDcGW > 0
    ? (post2014Headroom / national.additionalDcGW) * 100
    : 0
  const highestRelative = national.vintageCohorts.reduce((highest, cohort) => (
    (cohort.headroomPct ?? Number.NEGATIVE_INFINITY) > (highest.headroomPct ?? Number.NEGATIVE_INFINITY) ? cohort : highest
  ))

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white" aria-labelledby="fleet-age-title">
      <div className="border-b border-slate-200 bg-slate-950 px-5 py-6 text-white sm:px-7">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-300">Fleet age analysis</p>
        <h3 id="fleet-age-title" className="mt-2 text-2xl font-semibold tracking-tight">How much density headroom belongs to assets old enough to matter?</h3>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
          The national model finds {format(national.additionalDcGW)} GWdc of physical headroom, but {format(post2014HeadroomShare)}% sits in facilities commissioned since 2015. Fleet age changes the commercial reading of the headline number.
        </p>
      </div>

      <div className="border-b border-slate-200 bg-slate-50 px-5 py-6 sm:px-7">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Density is not opportunity</p>
        <h4 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
          {format(national.additionalDcGW)} GW could physically fit; only a fraction belongs to the nearer review pool
        </h4>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-700">
          The model answers how much more PV could fit inside today&apos;s footprints. It does not say that every owner should replace modules now. A plant commissioned in 2023 can contribute density headroom while remaining years away from a plausible repowering decision.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Stat label="Pre-2010 headroom" value={signed(pre2010?.additionalDcGW ?? null, ' GWdc')} detail="Oldest fleet; nearest current review pool" accent />
          <Stat label="2010–2014 headroom" value={signed(nextWave?.additionalDcGW ?? null, ' GWdc')} detail="Next wave; estimated core PPA windows begin in 2030" />
          <Stat label="Headroom since 2015" value={signed(post2014Headroom, ' GWdc')} detail="Longer-dated physical potential, not near-term opportunity" />
        </div>
        <p className="mt-4 max-w-4xl text-xs leading-5 text-slate-600">
          These buckets are timing screens, not investable-pipeline estimates. Actual opportunity also depends on degradation, equipment condition, remaining contract term, incentives, interconnection, curtailment, redevelopment cost and owner strategy.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full border-collapse text-sm">
          <thead className="bg-slate-50 text-left text-xs text-slate-600">
            <tr>
              <th className="px-5 py-3 font-semibold">Commissioning cohort</th>
              <th className="px-3 py-3 text-right font-semibold">Facilities</th>
              <th className="px-3 py-3 text-right font-semibold">Current GWdc</th>
              <th className="px-3 py-3 text-right font-semibold">Modeled modern GWdc</th>
              <th className="px-3 py-3 text-right font-semibold">Headroom GWdc</th>
              <th className="px-5 py-3 text-right font-semibold">Headroom %</th>
            </tr>
          </thead>
          <tbody>
            {national.vintageCohorts.map((cohort) => (
              <tr key={cohort.label} className="border-t border-slate-200">
                <th className="px-5 py-4 text-left font-semibold text-slate-950">{cohort.label}</th>
                <td className="px-3 py-4 text-right text-slate-600">{cohort.facilities.toLocaleString('en-US')}</td>
                <td className="px-3 py-4 text-right text-slate-600">{format(cohort.currentDcGW)}</td>
                <td className="px-3 py-4 text-right text-slate-600">{format(cohort.modeledDcGW)}</td>
                <td className="px-3 py-4 text-right font-semibold text-slate-900">{signed(cohort.additionalDcGW, '')}</td>
                <td className="px-5 py-4 text-right font-bold text-teal-700">{signed(cohort.headroomPct, '%')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-200 bg-amber-50/50 px-5 py-6 sm:px-7">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-800">PPA renewal calendar</p>
        <h4 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
          The 2010–2014 fleet is approaching—not yet inside—the core PPA renewal window
        </h4>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-700">
          <strong>None of the {format(national.vintageCohorts.find((cohort) => cohort.label === '2010–2014')?.facilities ?? null)} modeled facilities is inside the estimated 20–25-year window in 2026.</strong> The first boundary is 2030, four years away, and it applies to just 63 facilities commissioned in 2010. The 2013–2014 vintages hold 71.7% of the cohort&apos;s current capacity, pushing most of the capacity-weighted wave toward 2033–2039.
        </p>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-700">
          The cohort with the strongest measured density headroom is also approaching the 20–25-year window observed most often in Berkeley Lab&apos;s PPA sample—a natural point for reviewing equipment and offtake options, not a forecast that repowering will occur. Some plants may have different contract terms, amended agreements, or merchant exposure rather than a PPA.
        </p>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-700">
          <strong>The period-matched result holds.</strong> Among {PPA_RENEWAL_PROFILE.cohortExecutionSampleSize} PPAs signed in {PPA_RENEWAL_PROFILE.cohortExecutionYears}, totaling {format(PPA_RENEWAL_PROFILE.cohortExecutionCapacityGWac, 3)} GWac, the median term is still {PPA_RENEWAL_PROFILE.cohortExecutionMedianTermYears} years and {PPA_RENEWAL_PROFILE.cohortExecutionCoreTermCount} contracts ({format(PPA_RENEWAL_PROFILE.cohortExecutionCoreTermSharePct)}%) run for 20–25 years. Annual medians are either 20 or 25 years, but the 2008 observation rests on only three contracts. The pooled signing-period subset, rather than the all-years median alone, anchors the estimated calendar below.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Stat label="2010–2014 headroom" value={signed(national.vintageCohorts.find((cohort) => cohort.label === '2010–2014')?.headroomPct ?? null, '%')} detail="Technical same-footprint estimate" accent />
          <Stat label="First estimated boundary" value="2030" detail="63 facilities from the 2010 vintage" />
          <Stat label="Capacity-weighted wave" value="2033–2039" detail="71.7% of cohort capacity entered service in 2013–2014" />
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border border-amber-200 bg-white">
          <table className="min-w-[720px] w-full border-collapse text-sm">
            <thead className="bg-amber-100/60 text-left text-xs text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Solar COD</th>
                <th className="px-3 py-3 text-right font-semibold">Facilities</th>
                <th className="px-3 py-3 text-right font-semibold">Current GWdc</th>
                <th className="px-3 py-3 text-right font-semibold">Headroom</th>
                <th className="px-4 py-3 text-right font-semibold">Estimated PPA window</th>
              </tr>
            </thead>
            <tbody>
              {PPA_RENEWAL_CALENDAR_2010_2014.map((row) => (
                <tr key={row.codYear} className="border-t border-amber-100">
                  <th className="px-4 py-3 text-left font-semibold text-slate-950">{row.codYear}</th>
                  <td className="px-3 py-3 text-right text-slate-600">{format(row.facilities)}</td>
                  <td className="px-3 py-3 text-right text-slate-600">{format(row.currentDcGW, 3)}</td>
                  <td className="px-3 py-3 text-right font-semibold text-slate-900">{signed(row.headroomPct, '%')}</td>
                  <td className="px-4 py-3 text-right font-semibold text-amber-800">{row.coreWindowStart}–{row.coreWindowEnd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 max-w-4xl text-xs leading-5 text-slate-600">
          Berkeley Lab&apos;s full 546-contract sample covers 41.6 GWac, but it is a documented-contract subset rather than the national universe: Berkeley Lab includes contracts only when key variables can be verified, excludes merchant plants and several other sales structures, and says corporate PPAs are not well represented. The {PPA_RENEWAL_PROFILE.cohortExecutionYears} subset inherits those limitations. Berkeley Lab also observes that original PPAs are usually signed {PPA_RENEWAL_PROFILE.typicalExecutionLeadMinYears}–{PPA_RENEWAL_PROFILE.typicalExecutionLeadMaxYears} years before COD; used only as directional context, an analogous lead time ahead of the earliest 2030 boundary would point to 2027–2028. The contract sample is not joined to USPVDB facilities, so every date here is a cohort estimate.{' '}
          <a href={PPA_RENEWAL_PROFILE.sourceUrl} target="_blank" rel="noreferrer" className="font-semibold text-teal-800 underline decoration-teal-300 underline-offset-2">Review the Berkeley Lab source</a>.
        </p>
      </div>

      <div className="border-t border-slate-200 px-5 py-4 text-xs leading-5 text-slate-600 sm:px-7">
        <strong className="text-slate-900">What the data says:</strong> {highestRelative.label} has the highest modeled density headroom relative to its current capacity. Most absolute headroom comes from newer cohorts because they contain far more installed capacity; that does not make it a near-term repowering pipeline.
        {national.facilitiesWithoutCohortYear > 0 ? ` ${national.facilitiesWithoutCohortYear} modeled facilities are omitted from the cohort table because their commissioning year is unavailable or outside 1985–2026.` : ' Every modeled facility has a commissioning year and is included in one of the four cohorts.'}
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
  const ppaRenewal = plant.year ? estimatePpaRenewal(plant.year) : null
  return (
    <article className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/40 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-amber-800">Facility detail</p><h3 className="mt-1 text-xl font-semibold text-slate-950">{plant.name}</h3><p className="mt-1 text-sm text-slate-600">{plant.county ? `${plant.county} County, ` : ''}{stateName(plant.state)}{plant.year ? ` · ${plant.year}` : ''}</p></div>
        <button type="button" onClick={onClose} className="text-sm font-semibold text-slate-600 hover:text-slate-950">Close</button>
      </div>
      <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Current', `${format(plant.currentDcMW)} MWdc`],
          ['Modern-density scenario', `${format(plant.modeledDcMW)} MWdc`],
          ['Additional', signed(plant.additionalDcMW, ' MWdc')],
          ['Headroom', signed(plant.headroomPct, '%')],
          ['Footprint', `${format(plant.footprintAcres)} acres`],
          ['Mounting', mounting],
          ['Packed GCR', `${format(plant.packedGcrPct)}%`],
          ['Row pitch', plant.rowPitchM === null ? '—' : `${format(plant.rowPitchM)} m`],
          ['Modules', plant.moduleCount.toLocaleString('en-US')],
          ...(ppaRenewal ? [
            ['Estimated PPA core window', `${ppaRenewal.coreWindowStart}–${ppaRenewal.coreWindowEnd}`],
            ['Commercial timing', ppaRenewal.status],
          ] : []),
        ].map(([label, value]) => <div key={label} className="rounded-lg border border-amber-100 bg-white p-3"><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{value}</dd></div>)}
      </dl>
      {ppaRenewal ? (
        <p className="mt-4 max-w-4xl text-xs leading-5 text-slate-600">
          Commercial timing assumes an original PPA beginning near the reported COD and applies Berkeley Lab&apos;s 20–25-year core term range. Verify the actual offtake agreement, amendments and renewal rights before treating this as a project date.
        </p>
      ) : null}
      <a href={plantAuditHref(plant, metadata)} download={`repowering-${plant.id}.json`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-900"><Download className="h-4 w-4" /> Download auditable calculation record</a>
    </article>
  )
}

const TABLE_COLUMNS: Array<{ key: SortKey; label: string }> = [
  { key: 'currentDcGW', label: 'Current GWdc' },
  { key: 'modeledDcGW', label: 'Reference GWdc' },
  { key: 'additionalDcGW', label: 'Density headroom GWdc' },
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
