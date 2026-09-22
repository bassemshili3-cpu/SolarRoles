import type { EiaExpansionData, RepoweringStateSummary } from './atlasTypes'

export interface ExpansionHeadroomPoint {
  state: string
  headroomPct: number
  headroomAcMW: number
  shareBeyond5KmPct: number
  beyond5KmPipelineMW: number
  plannedSolarMW: number
  projects: number
  matchedOutputCoveragePct: number
}

export const REPOWERING_REFERENCE_DC_AC_RATIO = 1.32

export function median(values: number[]) {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle]
}

export function buildExpansionHeadroomPoints(
  atlasStates: RepoweringStateSummary[],
  expansion: EiaExpansionData,
) {
  const headroomByState = new Map(atlasStates.map((state) => [state.state, state.headroomPct]))

  return expansion.states.flatMap((state): ExpansionHeadroomPoint[] => {
    const atlasState = atlasStates.find((candidate) => candidate.state === state.state)
    const headroomPct = headroomByState.get(state.state)
    if (!atlasState || headroomPct === null || headroomPct === undefined || state.plannedSolarMW <= 0) return []

    // USPVDB headroom is modeled in DC. EIA generator capacity is reported in AC,
    // so both sides must be on an AC basis before comparing annual-output proxies.
    const headroomAcMW = Math.max(0, atlasState.additionalDcGW) * 1000 / REPOWERING_REFERENCE_DC_AC_RATIO
    const beyond5KmPipelineMW = state.plannedSolarMW * state.shareBeyond5KmPct / 100
    const matchedOutputCoveragePct = beyond5KmPipelineMW > 0
      ? headroomAcMW / beyond5KmPipelineMW * 100
      : 0

    return [{
      ...state,
      headroomPct,
      headroomAcMW,
      beyond5KmPipelineMW,
      matchedOutputCoveragePct,
    }]
  })
}
