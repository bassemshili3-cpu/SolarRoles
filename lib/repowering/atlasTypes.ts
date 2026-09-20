export type AtlasMetric = 'headroomPct' | 'additionalGw'

export interface RepoweringPlant {
  id: string
  name: string
  state: string
  county: string | null
  year: number | null
  axis: 'fixed' | 'tracker' | 'unknown'
  latitude: number | null
  longitude: number | null
  currentDcMW: number
  modeledDcMW: number
  additionalDcMW: number
  headroomPct: number
  footprintAcres: number
  packedGcrPct: number
  rowPitchM: number | null
  moduleCount: number
}

export interface RepoweringBreakdown {
  label: string
  plants: number
  currentDcMW: number
  modeledDcMW: number
  additionalDcMW: number
  headroomPct: number | null
}

export interface RepoweringStateSummary {
  state: string
  sourceFacilities: number
  modeledFacilities: number
  unableToModelFacilities: number
  currentDcGW: number
  modeledDcGW: number
  additionalDcGW: number
  headroomPct: number | null
  byAxis: RepoweringBreakdown[]
  byVintage: RepoweringBreakdown[]
  unableToModelReasons: Record<string, number>
  topPlants: RepoweringPlant[]
}

export interface RepoweringStateDetail extends RepoweringStateSummary {
  plants: RepoweringPlant[]
}

export interface RepoweringNationalSummary {
  sourceFacilities: number
  modeledFacilities: number
  unableToModelFacilities: number
  currentDcGW: number
  modeledDcGW: number
  additionalDcGW: number
  headroomPct: number | null
}

export interface RepoweringAtlas {
  metadata: {
    dataset: string
    datasetDate: string
    datasetUrl: string
    analysisRun: string
    scenario: string
  }
  national: RepoweringNationalSummary
  states: RepoweringStateSummary[]
}
