import { effectiveGcrFromFixedGeometry, moduleDimensionsByOrientation } from '../lib/repowering/calculator'
import { packGeoJSON } from '../lib/repowering/polygonPacking'
import type { CalculatorInput, GeoJSONFeature } from '../lib/repowering/types'
import type {
  RepoweringAtlas,
  RepoweringBreakdown,
  RepoweringPlant,
  RepoweringStateDetail,
  RepoweringStateSummary,
} from '../lib/repowering/atlasTypes'

export interface AtlasConfig {
  module: { powerW: number; lengthM: number; widthM: number; orientation: 'portrait' | 'landscape' }
  layout: {
    modulesAcross: number
    gapCrossM: number
    gapAlongM: number
    phaseSteps: number
    stripSampleCount: number
    maxRows: number
    referenceDcAcRatio: number
    useExistingFixedTilt: boolean
    useExistingFixedAzimuth: boolean
    fixedFallbackAzimuthDeg: number
    trackerRowAzimuthDeg: number
  }
  scenarios: Record<string, {
    boundaryClearanceM: number
    fixedDesignSolarTime: number
    fixedMinEdgeGapM: number
    trackerTargetGcr: number
  }>
}

type AxisClass = 'fixed' | 'tracker' | 'unknown'
type UnableReason =
  | 'GEOMETRY_MISSING_OR_UNSUPPORTED'
  | 'CURRENT_DC_MISSING_OR_INVALID'
  | 'REQUIRED_LAYOUT_PARAMETERS_UNRESOLVED'
  | 'POLYGON_PROCESSING_FAILED'
  | 'FOOTPRINT_AREA_NOT_POSITIVE'
  | 'NO_MODULES_FIT'
  | 'MODELED_CAPACITY_INVALID'

export interface NormalizedRecord {
  feature: GeoJSONFeature
  caseId: unknown
  eiaId: unknown
  name: string
  state: string | null
  county: string | null
  year: number | null
  powerRegion: string | null
  systemType: string | null
  axisRaw: string | null
  axisClass: AxisClass
  azimuthDeg: number | null
  tiltDeg: number | null
  currentDcMW: number | null
  currentAcMW: number | null
  sourceAreaM2: number | null
  latitude: number | null
  longitude: number | null
}

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function stringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null
  const s = String(value).trim()
  return s || null
}

function lower(value: unknown): string { return String(value ?? '').trim().toLowerCase() }
function round(value: number | null | undefined, digits = 3): number | null {
  if (!Number.isFinite(value as number)) return null
  const factor = 10 ** digits
  return Math.round((value as number) * factor) / factor
}

export function classifyAxis(value: unknown): AxisClass {
  const normalized = lower(value).replace(/[_ ]+/g, '-')
  if (!normalized) return 'unknown'
  if ((normalized.includes('single') && normalized.includes('axis')) || normalized.includes('track')) return 'tracker'
  if (normalized.includes('fixed')) return 'fixed'
  return 'unknown'
}

function bboxCenter(geometry: GeoJSONFeature['geometry'] | null | undefined) {
  let minLon = Infinity
  let maxLon = -Infinity
  let minLat = Infinity
  let maxLat = -Infinity
  function walk(node: unknown): void {
    if (!Array.isArray(node)) return
    if (node.length >= 2 && !Array.isArray(node[0]) && Number.isFinite(Number(node[0])) && Number.isFinite(Number(node[1]))) {
      const lon = Number(node[0])
      const lat = Number(node[1])
      minLon = Math.min(minLon, lon)
      maxLon = Math.max(maxLon, lon)
      minLat = Math.min(minLat, lat)
      maxLat = Math.max(maxLat, lat)
      return
    }
    node.forEach(walk)
  }
  walk(geometry?.coordinates)
  return Number.isFinite(minLon)
    ? { lon: (minLon + maxLon) / 2, lat: (minLat + maxLat) / 2 }
    : { lon: null, lat: null }
}

export function normalizeFeature(feature: GeoJSONFeature): NormalizedRecord {
  if (!feature || feature.type !== 'Feature') throw new Error('Expected a GeoJSON Feature.')
  const properties = feature.properties ?? {}
  const center = bboxCenter(feature.geometry)
  const axisRaw = stringOrNull(properties.p_axis ?? properties.axis ?? properties.mount_type)
  return {
    feature,
    caseId: properties.case_id ?? properties.caseId ?? properties.id ?? null,
    eiaId: properties.eia_id ?? properties.eiaId ?? null,
    name: stringOrNull(properties.p_name ?? properties.name) ?? 'Unnamed facility',
    state: stringOrNull(properties.p_state ?? properties.state),
    county: stringOrNull(properties.p_county ?? properties.county),
    year: numberOrNull(properties.p_year ?? properties.year),
    powerRegion: stringOrNull(properties.p_pwr_reg ?? properties.power_region),
    systemType: stringOrNull(properties.p_sys_type ?? properties.system_type),
    axisRaw,
    axisClass: classifyAxis(axisRaw),
    azimuthDeg: numberOrNull(properties.p_azimuth ?? properties.azimuth),
    tiltDeg: numberOrNull(properties.p_tilt ?? properties.tilt),
    currentDcMW: numberOrNull(properties.p_cap_dc ?? properties.current_dc_mw ?? properties.capacity_dc_mw),
    currentAcMW: numberOrNull(properties.p_cap_ac ?? properties.current_ac_mw ?? properties.capacity_ac_mw),
    sourceAreaM2: numberOrNull(properties.p_area ?? properties.area_m2),
    latitude: numberOrNull(properties.ylat ?? properties.p_lat ?? properties.latitude) ?? center.lat,
    longitude: numberOrNull(properties.xlong ?? properties.p_long ?? properties.longitude) ?? center.lon,
  }
}

function unable(record: NormalizedRecord, reason: UnableReason, detail: string | null = null) {
  return { status: 'unable' as const, record, unableReason: reason, unableDetail: detail }
}

function layoutForRecord(record: NormalizedRecord, config: AtlasConfig, scenarioName: string) {
  const scenario = config.scenarios[scenarioName]
  if (!scenario) throw new Error(`Unknown scenario: ${scenarioName}`)
  const moduleConfig = config.module
  const layout = config.layout
  const dims = moduleDimensionsByOrientation(moduleConfig.lengthM, moduleConfig.widthM, moduleConfig.orientation)
  const modulesAcross = Math.max(1, Math.round(layout.modulesAcross))
  const activeCrossWidthM = dims.crossSlopeM * modulesAcross
  const physicalCrossWidthM = activeCrossWidthM + Math.max(0, modulesAcross - 1) * layout.gapCrossM
  const alongPacking = dims.alongRowM / (dims.alongRowM + layout.gapAlongM)

  if (record.axisClass !== 'tracker') {
    const latitude = Math.min(55, Math.max(15, Math.abs(record.latitude ?? 35)))
    const validTilt = record.tiltDeg !== null && record.tiltDeg >= 0 && record.tiltDeg <= 90
    const validAzimuth = record.azimuthDeg !== null && record.azimuthDeg >= 0 && record.azimuthDeg <= 360
    const tiltDeg = record.axisClass === 'fixed' && layout.useExistingFixedTilt && validTilt
      ? record.tiltDeg as number
      : Math.min(latitude, 40)
    const surfaceAzimuthDeg = record.axisClass === 'fixed' && layout.useExistingFixedAzimuth && validAzimuth
      ? record.azimuthDeg as number
      : layout.fixedFallbackAzimuthDeg
    const input = {
      siteName: record.name,
      footprintAcres: 1,
      currentDcMW: 1,
      currentAcMW: 1,
      latitudeDeg: latitude,
      mountType: 'fixed',
      modulePowerW: moduleConfig.powerW,
      moduleLengthM: moduleConfig.lengthM,
      moduleWidthM: moduleConfig.widthM,
      dcAcRatio: layout.referenceDcAcRatio,
      usablePct: 100,
      gcrMode: 'geometry',
      gcrPct: 35,
      orientation: moduleConfig.orientation,
      modulesAcross,
      gapCrossM: layout.gapCrossM,
      gapAlongM: layout.gapAlongM,
      rowAzimuthDeg: 90,
      tiltDeg,
      surfaceAzimuthDeg,
      spacingMode: 'shade-free',
      designSolarTime: scenario.fixedDesignSolarTime,
      minEdgeGapM: scenario.fixedMinEdgeGapM,
      rowPitchM: 6,
    } satisfies CalculatorInput
    const geometry = effectiveGcrFromFixedGeometry(input)
    return {
      geometry,
      rowAzimuthDeg: ((surfaceAzimuthDeg + 90) % 180 + 180) % 180,
      rowStripWidthM: geometry.horizontalProjectionM ?? physicalCrossWidthM,
    }
  }

  const targetGcr = Math.min(0.65, Math.max(0.12, scenario.trackerTargetGcr))
  const rowPitchM = Math.max(physicalCrossWidthM, activeCrossWidthM * alongPacking / targetGcr)
  return {
    geometry: {
      effectiveGcr: (activeCrossWidthM / rowPitchM) * alongPacking,
      rowPitchM,
      activeCrossWidthM,
      physicalCrossWidthM,
      horizontalProjectionM: physicalCrossWidthM,
      rowHeightM: 0,
      alongPacking,
      design: { targetGcr },
    },
    rowAzimuthDeg: ((layout.trackerRowAzimuthDeg % 180) + 180) % 180,
    rowStripWidthM: physicalCrossWidthM,
  }
}

export function runFeature(feature: GeoJSONFeature, config: AtlasConfig, scenarioName: string) {
  const record = normalizeFeature(feature)
  const geometry = record.feature.geometry as GeoJSONFeature['geometry'] | null | undefined
  if (!geometry || !['Polygon', 'MultiPolygon'].includes(geometry.type) || !Array.isArray(geometry.coordinates)) {
    return unable(record, 'GEOMETRY_MISSING_OR_UNSUPPORTED')
  }
  if (!(Number(record.currentDcMW) > 0)) return unable(record, 'CURRENT_DC_MISSING_OR_INVALID')

  let layout: ReturnType<typeof layoutForRecord>
  try {
    layout = layoutForRecord(record, config, scenarioName)
  } catch (error) {
    return unable(record, 'REQUIRED_LAYOUT_PARAMETERS_UNRESOLVED', error instanceof Error ? error.message : String(error))
  }

  const dims = moduleDimensionsByOrientation(config.module.lengthM, config.module.widthM, config.module.orientation)
  let pack: ReturnType<typeof packGeoJSON>
  try {
    pack = packGeoJSON(feature, {
      rowAzimuthDeg: layout.rowAzimuthDeg,
      rowPitchM: layout.geometry.rowPitchM ?? 6,
      rowStripWidthM: layout.rowStripWidthM,
      alongModuleM: dims.alongRowM,
      gapAlongM: config.layout.gapAlongM,
      modulesAcross: config.layout.modulesAcross,
      boundaryClearanceM: config.scenarios[scenarioName].boundaryClearanceM,
      phaseSteps: config.layout.phaseSteps,
      stripSampleCount: config.layout.stripSampleCount,
      maxRows: config.layout.maxRows,
      maxSegmentsStored: 0,
      modulePowerW: config.module.powerW,
      moduleLengthM: config.module.lengthM,
      moduleWidthM: config.module.widthM,
      returnGeometry: false,
    })
  } catch (error) {
    return unable(record, 'POLYGON_PROCESSING_FAILED', error instanceof Error ? error.message : String(error))
  }

  if (!(pack.areaM2 > 0)) return unable(record, 'FOOTPRINT_AREA_NOT_POSITIVE')
  if (!(pack.totalModules > 0)) return unable(record, 'NO_MODULES_FIT')
  if (!(Number.isFinite(pack.dcMW) && pack.dcMW > 0)) return unable(record, 'MODELED_CAPACITY_INVALID')

  const currentDcMW = record.currentDcMW as number
  const modeledDcMW = pack.dcMW
  const additionalDcMW = modeledDcMW - currentDcMW
  return {
    status: 'modeled' as const,
    record,
    result: {
      packedAreaM2: pack.areaM2,
      packedAreaAcres: pack.areaAcres,
      currentDcMW,
      currentAcMW: record.currentAcMW,
      modeledDcMW,
      modeledAcMW: modeledDcMW / config.layout.referenceDcAcRatio,
      headroomDcMW: additionalDcMW,
      headroomPct: additionalDcMW / currentDcMW * 100,
      packedGcrPct: pack.effectiveGcrPct,
      rowPitchM: layout.geometry.rowPitchM,
      rowAzimuthDeg: layout.rowAzimuthDeg,
      moduleCount: pack.totalModules,
      rowCount: pack.totalRows,
    },
  }
}

export type FeatureRun = ReturnType<typeof runFeature>
type ModeledRun = Extract<FeatureRun, { status: 'modeled' }>

export function flatResult(run: FeatureRun): Record<string, unknown> {
  const record = run.record
  if (run.status === 'unable') {
    return {
      status: 'unable_to_model',
      case_id: record.caseId,
      eia_id: record.eiaId,
      name: record.name,
      state: record.state,
      county: record.county,
      year: record.year,
      axis_class: record.axisClass,
      reason: run.unableReason,
      detail: run.unableDetail,
    }
  }
  const result = run.result
  return {
    status: 'modeled',
    case_id: record.caseId,
    eia_id: record.eiaId,
    name: record.name,
    state: record.state,
    county: record.county,
    year: record.year,
    axis_class: record.axisClass,
    latitude: round(record.latitude, 6),
    longitude: round(record.longitude, 6),
    source_area_m2: round(record.sourceAreaM2, 2),
    packed_area_m2: round(result.packedAreaM2, 2),
    packed_area_acres: round(result.packedAreaAcres, 3),
    current_dc_mw: round(result.currentDcMW, 4),
    current_ac_mw: round(result.currentAcMW, 4),
    modeled_dc_mw: round(result.modeledDcMW, 4),
    modeled_ac_mw_reference: round(result.modeledAcMW, 4),
    headroom_dc_mw: round(result.headroomDcMW, 4),
    headroom_pct: round(result.headroomPct, 3),
    packed_gcr_pct: round(result.packedGcrPct, 3),
    row_pitch_m: round(result.rowPitchM, 3),
    row_azimuth_deg: round(result.rowAzimuthDeg, 2),
    module_count: result.moduleCount,
    row_count: result.rowCount,
  }
}

function sum<T>(rows: T[], getter: (row: T) => number): number {
  return rows.reduce((total, row) => total + (Number.isFinite(getter(row)) ? getter(row) : 0), 0)
}

function quantile(values: number[], q: number): number | null {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b)
  if (!sorted.length) return null
  const position = (sorted.length - 1) * q
  const base = Math.floor(position)
  const remainder = position - base
  return sorted[base + 1] !== undefined
    ? sorted[base] + remainder * (sorted[base + 1] - sorted[base])
    : sorted[base]
}

function totals(rows: ModeledRun[]) {
  const current = sum(rows, (run) => run.result.currentDcMW)
  const modeled = sum(rows, (run) => run.result.modeledDcMW)
  return {
    facilities: rows.length,
    current_dc_mw: round(current, 3),
    modeled_dc_mw: round(modeled, 3),
    net_headroom_dc_mw: round(modeled - current, 3),
    net_headroom_pct: current > 0 ? round((modeled - current) / current * 100, 3) : null,
    median_plant_headroom_pct: round(quantile(rows.map((run) => run.result.headroomPct), 0.5), 3),
  }
}

export function summarize(runs: FeatureRun[]) {
  const modeled = runs.filter((run): run is ModeledRun => run.status === 'modeled')
  const unableRuns = runs.filter((run) => run.status === 'unable')
  const group = (key: (run: ModeledRun) => string) => {
    const groups = new Map<string, ModeledRun[]>()
    modeled.forEach((run) => {
      const name = key(run) || 'Unknown'
      groups.set(name, [...(groups.get(name) ?? []), run])
    })
    return Array.from(groups.entries())
      .map(([name, rows]) => ({ group: name, ...totals(rows) }))
      .sort((a, b) => Number(b.current_dc_mw) - Number(a.current_dc_mw))
  }
  return {
    generated_at: new Date().toISOString(),
    counts: {
      input_features: runs.length,
      modeled: modeled.length,
      unable_to_model: unableRuns.length,
    },
    modeled: totals(modeled),
    unable_to_model_reasons: countValues(unableRuns.map((run) => run.unableReason)),
    by_state: group((run) => run.record.state ?? 'Unknown'),
    by_axis: group((run) => run.record.axisClass),
    by_year: group((run) => run.record.year === null ? 'Unknown' : String(run.record.year)),
  }
}

function countValues(values: string[]) {
  return values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1
    return counts
  }, {})
}

function plantFromRun(run: ModeledRun, fallbackIndex: number): RepoweringPlant {
  const { record, result } = run
  return {
    id: String(record.caseId ?? record.eiaId ?? `${record.state ?? 'unknown'}-${fallbackIndex}`),
    name: record.name,
    state: record.state ?? 'Unknown',
    county: record.county,
    year: record.year,
    axis: record.axisClass,
    latitude: round(record.latitude, 6),
    longitude: round(record.longitude, 6),
    currentDcMW: round(result.currentDcMW, 4) ?? 0,
    modeledDcMW: round(result.modeledDcMW, 4) ?? 0,
    additionalDcMW: round(result.headroomDcMW, 4) ?? 0,
    headroomPct: round(result.headroomPct, 3) ?? 0,
    footprintAcres: round(result.packedAreaAcres, 3) ?? 0,
    packedGcrPct: round(result.packedGcrPct, 3) ?? 0,
    rowPitchM: round(result.rowPitchM, 3),
    moduleCount: result.moduleCount,
  }
}

function breakdown(label: string, runs: ModeledRun[]): RepoweringBreakdown {
  const current = sum(runs, (run) => run.result.currentDcMW)
  const modeled = sum(runs, (run) => run.result.modeledDcMW)
  return {
    label,
    plants: runs.length,
    currentDcMW: round(current, 3) ?? 0,
    modeledDcMW: round(modeled, 3) ?? 0,
    additionalDcMW: round(modeled - current, 3) ?? 0,
    headroomPct: current > 0 ? round((modeled - current) / current * 100, 3) : null,
  }
}

function axisLabel(axis: AxisClass) {
  if (axis === 'fixed') return 'Fixed tilt'
  if (axis === 'tracker') return 'Single-axis tracker'
  return 'Unknown axis (fixed-layout fallback)'
}

function vintageLabel(year: number | null) {
  if (year === null) return 'Unknown'
  if (year < 2005) return 'Before 2005'
  if (year < 2010) return '2005–2009'
  if (year < 2015) return '2010–2014'
  if (year < 2020) return '2015–2019'
  return '2020 or later'
}

export function buildRepoweringAtlas(
  runs: FeatureRun[],
  metadata: RepoweringAtlas['metadata'],
) {
  const byState = new Map<string, FeatureRun[]>()
  runs.forEach((run) => {
    const state = run.record.state?.trim().toUpperCase()
    if (!state || state.length !== 2) return
    byState.set(state, [...(byState.get(state) ?? []), run])
  })

  const details: RepoweringStateDetail[] = Array.from(byState.entries())
    .map(([state, stateRuns]) => {
      const modeled = stateRuns.filter((run): run is ModeledRun => run.status === 'modeled')
      const unableRuns = stateRuns.filter((run) => run.status === 'unable')
      const currentDcMW = sum(modeled, (run) => run.result.currentDcMW)
      const modeledDcMW = sum(modeled, (run) => run.result.modeledDcMW)
      const axisGroups = new Map<string, ModeledRun[]>()
      const vintageGroups = new Map<string, ModeledRun[]>()
      modeled.forEach((run) => {
        const axis = axisLabel(run.record.axisClass)
        axisGroups.set(axis, [...(axisGroups.get(axis) ?? []), run])
        const vintage = vintageLabel(run.record.year)
        vintageGroups.set(vintage, [...(vintageGroups.get(vintage) ?? []), run])
      })
      const plants = modeled.map(plantFromRun).sort((a, b) => b.additionalDcMW - a.additionalDcMW)
      return {
        state,
        sourceFacilities: stateRuns.length,
        modeledFacilities: modeled.length,
        unableToModelFacilities: unableRuns.length,
        currentDcGW: round(currentDcMW / 1000, 4) ?? 0,
        modeledDcGW: round(modeledDcMW / 1000, 4) ?? 0,
        additionalDcGW: round((modeledDcMW - currentDcMW) / 1000, 4) ?? 0,
        headroomPct: currentDcMW > 0 ? round((modeledDcMW - currentDcMW) / currentDcMW * 100, 2) : null,
        byAxis: Array.from(axisGroups.entries()).map(([label, groupRuns]) => breakdown(label, groupRuns)),
        byVintage: Array.from(vintageGroups.entries()).map(([label, groupRuns]) => breakdown(label, groupRuns)),
        unableToModelReasons: countValues(unableRuns.map((run) => run.unableReason)),
        topPlants: plants.slice(0, 10),
        plants,
      } satisfies RepoweringStateDetail
    })
    .sort((a, b) => a.state.localeCompare(b.state))

  const states: RepoweringStateSummary[] = details.map(({ plants: _plants, ...summary }) => summary)
  const nationalModeled = runs.filter((run): run is ModeledRun => run.status === 'modeled')
  const nationalCurrentDcMW = sum(nationalModeled, (run) => run.result.currentDcMW)
  const nationalModeledDcMW = sum(nationalModeled, (run) => run.result.modeledDcMW)
  return {
    atlas: {
      metadata,
      national: {
        sourceFacilities: runs.length,
        modeledFacilities: nationalModeled.length,
        unableToModelFacilities: runs.length - nationalModeled.length,
        currentDcGW: round(nationalCurrentDcMW / 1000, 3) ?? 0,
        modeledDcGW: round(nationalModeledDcMW / 1000, 3) ?? 0,
        additionalDcGW: round((nationalModeledDcMW - nationalCurrentDcMW) / 1000, 3) ?? 0,
        headroomPct: nationalCurrentDcMW > 0
          ? round((nationalModeledDcMW - nationalCurrentDcMW) / nationalCurrentDcMW * 100, 2)
          : null,
      },
      states,
    } satisfies RepoweringAtlas,
    details,
  }
}

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return ''
  const stringValue = String(value)
  return /[",\n\r]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue
}

export function rowsToCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return ''
  const keys = Array.from(rows.reduce((set, row) => {
    Object.keys(row).forEach((key) => set.add(key))
    return set
  }, new Set<string>()))
  return `${[keys.map(csvEscape).join(','), ...rows.map((row) => keys.map((key) => csvEscape(row[key])).join(','))].join('\n')}\n`
}
