export const PPA_RENEWAL_PROFILE = {
  edition: 'Berkeley Lab Utility-Scale Solar 2025 Data Update',
  sampleSize: 546,
  medianTermYears: 20,
  coreTermMinYears: 20,
  coreTermMaxYears: 25,
  coreTermCount: 420,
  coreTermSharePct: 76.9,
  shortTermYears: 15,
  shortTermOrLessCount: 74,
  shortTermOrLessSharePct: 13.6,
  cohortExecutionYears: '2008–2013',
  cohortExecutionSampleSize: 114,
  cohortExecutionCapacityGWac: 7.185,
  cohortExecutionMedianTermYears: 20,
  cohortExecutionCoreTermCount: 97,
  cohortExecutionCoreTermSharePct: 85.1,
  cohortExecutionShortTermOrLessCount: 6,
  cohortExecutionShortTermOrLessSharePct: 5.3,
  typicalExecutionLeadMinYears: 1.5,
  typicalExecutionLeadMaxYears: 3,
  screeningYear: 2026,
  sourceUrl: 'https://emp.lbl.gov/utility-scale-solar',
} as const

export type PpaTimingStatus =
  | 'Post-core window'
  | 'Core renewal window'
  | 'Approaching typical PPA window'
  | 'Long-range planning'

export interface PpaRenewalEstimate {
  codYear: number
  shortTermMarker: number
  medianTermMarker: number
  coreWindowStart: number
  coreWindowEnd: number
  status: PpaTimingStatus
}

export function estimatePpaRenewal(
  codYear: number,
  screeningYear = PPA_RENEWAL_PROFILE.screeningYear,
): PpaRenewalEstimate {
  const shortTermMarker = codYear + PPA_RENEWAL_PROFILE.shortTermYears
  const coreWindowStart = codYear + PPA_RENEWAL_PROFILE.coreTermMinYears
  const coreWindowEnd = codYear + PPA_RENEWAL_PROFILE.coreTermMaxYears

  let status: PpaTimingStatus = 'Long-range planning'
  if (screeningYear > coreWindowEnd) status = 'Post-core window'
  else if (screeningYear >= coreWindowStart) status = 'Core renewal window'
  else if (coreWindowStart - screeningYear <= 4) status = 'Approaching typical PPA window'

  return {
    codYear,
    shortTermMarker,
    medianTermMarker: coreWindowStart,
    coreWindowStart,
    coreWindowEnd,
    status,
  }
}

export const PPA_RENEWAL_CALENDAR_2010_2014 = [
  { codYear: 2010, facilities: 63, currentDcGW: 0.291, additionalDcGW: 0.322, headroomPct: 110.7 },
  { codYear: 2011, facilities: 151, currentDcGW: 1.05, additionalDcGW: 0.422, headroomPct: 40.2 },
  { codYear: 2012, facilities: 210, currentDcGW: 1.655, additionalDcGW: 0.807, headroomPct: 48.8 },
  { codYear: 2013, facilities: 240, currentDcGW: 2.684, additionalDcGW: 1.451, headroomPct: 54 },
  { codYear: 2014, facilities: 313, currentDcGW: 4.919, additionalDcGW: 2.934, headroomPct: 59.7 },
].map((row) => ({ ...row, ...estimatePpaRenewal(row.codYear) }))
