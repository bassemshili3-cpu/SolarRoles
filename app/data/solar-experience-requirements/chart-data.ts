// Source: experience-report-20261112, note v4 and audit A01 (12 Nov 2026). v32 strict groups.
// Ranking: out/E23-final-table-v4-published.csv. Installer titles naming a lead, crew lead, foreman or supervisor are excluded from the
// installer row and not shown (73 groups in 2024–26, too few for a stable share; editor's decision, 12 Nov).
// Shares are rounded half-up from the exact counts. One shared set of figures for the report, the PNG and the CSV.
export const REPORT_PATH = '/data/solar-experience-requirements'

export type RankingRow = {
  label: string
  ge3: number
  ge5: number
  groups: number
}

export const RANKING: RankingRow[] = [
  { label: 'Project & construction managers', ge3: 68, ge5: 56, groups: 569 },
  { label: 'Engineers & designers', ge3: 61, ge5: 40, groups: 628 },
  { label: 'Electricians', ge3: 51, ge5: 5, groups: 384 },
  { label: 'Maintenance & service (O&M) roles', ge3: 22, ge5: 9, groups: 276 },
  { label: 'Sales', ge3: 18, ge5: 11, groups: 662 },
  { label: 'Installers', ge3: 4, ge5: 3, groups: 290 },
]

export const RANKING_NOTE = 'Archived US posting-text groups, 2024–2026 (2026 incomplete). Years detected automatically; preferred figures excluded. Shares are approximate. No detected figure does not mean no experience is needed. For electricians, 3+ years is 34% without the top three employers and 38% with equal employer weight. Installers exclude lead installer, crew lead, foreman and supervisor titles (73 groups in 2024–2026), not shown because the group is too small for a stable share.'

// Source: strict groups in R00-rows, R11-metrics-v2b, v3 maintenance decisions and the v4 installer split
// (final_def.final_family) in experience-report-20261112; every cell checked against the data on 12 Nov (audit A01).
// k = groups with a non-preferred experience figure >= 3; n = all groups in the occupation and year.
// The targeted maintenance-scope review did not cover 2023, so that cell is omitted.
export const ANNUAL_YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026] as const
export const SMALL_N = 30
type AnnualCell = { year: number; n: number; k: number; pct: number; small: boolean }
const annualCells = (counts: ([number, number] | null)[]): (AnnualCell | null)[] =>
  counts.map((v, i) => v === null ? null : ({ year: ANNUAL_YEARS[i], n: v[0], k: v[1], pct: Math.round(100 * v[1] / v[0]), small: v[0] < SMALL_N }))

// Pooled periods, 2020–22 vs 2024–26 (same shares as the report's change table). 'rise' only where the report's
// pre-set rule finds a rise: employer-cluster interval above zero and the gap still positive without the top three
// employers, with equal employer weight, on capture dates only and among employers present in both periods.
export type PeriodChange = { early: number; late: number; rise: boolean }

export const ANNUAL_ROWS: { label: string; values: (AnnualCell | null)[]; change: PeriodChange }[] = [
  { label: 'Project & construction managers', values: annualCells([[93, 52], [243, 121], [304, 187], [115, 72], [172, 110], [262, 189], [135, 89]]), change: { early: 56, late: 68, rise: false } },
  { label: 'Engineers & designers', values: annualCells([[124, 62], [345, 144], [300, 132], [149, 73], [198, 120], [251, 156], [179, 110]]), change: { early: 44, late: 61, rise: true } },
  { label: 'Electricians', values: annualCells([[50, 12], [128, 32], [222, 45], [83, 36], [119, 73], [161, 80], [104, 44]]), change: { early: 22, late: 51, rise: true } },
  { label: 'Maintenance & service (O&M) roles', values: annualCells([[21, 8], [79, 23], [76, 11], null, [49, 18], [134, 21], [93, 23]]), change: { early: 24, late: 22, rise: false } },
  { label: 'Sales', values: annualCells([[130, 51], [366, 94], [480, 68], [236, 44], [225, 41], [301, 59], [136, 18]]), change: { early: 22, late: 18, rise: false } },
  { label: 'Installers', values: annualCells([[112, 13], [244, 7], [327, 10], [80, 4], [106, 4], [128, 6], [56, 1]]), change: { early: 4, late: 4, rise: false } },
]

// Changes that do not pass the rule get a double dagger instead of a label; the asterisk is kept for cells
// with fewer than 30 groups (editor's choice, 12 Nov: one sign per meaning).
export const NO_RISE_MARK = '‡'
export const changeLabel = (c: PeriodChange) => `${c.early}% → ${c.late}%${c.rise ? '' : NO_RISE_MARK}`

// Two more figures that can be downloaded on their own. Exact counts: experience-report-20261112, scripts/E25_downloadable_figures.py
// (out/E25-downloadable-figures.json), same definitions as the table. Shares rounded half-up from the exact counts.
// Electricians, 2024–2026: the 3+ years share counted three ways. 'basis' is the denominator shown under each share.
export const ELECTRICIAN_COUNT_WAYS = [
  { label: 'All distinct postings', pct: 51, k: 197 as number | null, n: 384, unit: 'distinct postings', basis: '197 of 384 postings' },
  { label: 'Without the three largest advertisers', pct: 34, k: 69 as number | null, n: 204, unit: 'distinct postings', basis: '69 of 204 postings' },
  { label: 'Each identified employer weighted equally', pct: 38, k: null as number | null, n: 79, unit: 'employers (average of employer shares)', basis: 'Average across 79 employers' },
]
export const ELECTRICIAN_COUNT_WAYS_NOTE = 'These are different ways of counting the same archive, not bounds on the share.'

// Engineers & designers, pooled periods: the same shares as the last column of the annual table.
export const ENGINEER_PERIODS = [
  { period: '2020–2022', n: 769, k: 338, pct: 44 },
  { period: '2024–2026', n: 628, k: 386, pct: 61 },
]

// Years stated, by occupation and period (blue chart). Exact counts: experience-report-20261112, scripts/E27_distribution_periods.py
// (out/E27-distribution-periods.json), same groups as the table. Each group is placed by the largest eligible (non-preferred) figure
// detected. 'none' also covers groups where years appear only as preferred; 'under3' includes the rare explicit zeros.
// The 3+ part (b34 + b5) equals the table's period shares. Shares are rounded half-up from the exact counts, so a bar can total 99–101%.
export const DIST_BANDS = [
  { key: 'none', label: 'No non-preferred number detected' },
  { key: 'under3', label: 'Under 3 years' },
  { key: 'b34', label: '3–4 years' },
  { key: 'b5', label: '5+ years' },
] as const
export type DistBand = typeof DIST_BANDS[number]['key']
type DistCounts = Record<DistBand, number>
export const pctHalfUp = (k: number, n: number) => Math.floor((200 * k + n) / (2 * n))
const distPeriod = (period: string, c: DistCounts) => {
  const n = c.none + c.under3 + c.b34 + c.b5
  return { period, n, counts: c, pct: { none: pctHalfUp(c.none, n), under3: pctHalfUp(c.under3, n), b34: pctHalfUp(c.b34, n), b5: pctHalfUp(c.b5, n) } }
}
export const DISTRIBUTION = [
  { label: 'Project & construction managers', periods: [distPeriod('2020–22', { none: 205, under3: 75, b34: 112, b5: 248 }), distPeriod('2024–26', { none: 139, under3: 42, b34: 70, b5: 318 })] },
  { label: 'Engineers & designers', periods: [distPeriod('2020–22', { none: 276, under3: 155, b34: 134, b5: 204 }), distPeriod('2024–26', { none: 153, under3: 89, b34: 136, b5: 250 })] },
  { label: 'Electricians', periods: [distPeriod('2020–22', { none: 244, under3: 67, b34: 66, b5: 23 }), distPeriod('2024–26', { none: 116, under3: 71, b34: 177, b5: 20 })] },
  { label: 'Maintenance & service (O&M) roles', periods: [distPeriod('2020–22', { none: 92, under3: 42, b34: 20, b5: 22 }), distPeriod('2024–26', { none: 171, under3: 43, b34: 36, b5: 26 })] },
  { label: 'Sales', periods: [distPeriod('2020–22', { none: 534, under3: 229, b34: 106, b5: 107 }), distPeriod('2024–26', { none: 377, under3: 167, b34: 42, b5: 76 })] },
  { label: 'Installers', periods: [distPeriod('2020–22', { none: 468, under3: 185, b34: 18, b5: 12 }), distPeriod('2024–26', { none: 196, under3: 83, b34: 3, b5: 8 })] },
]
export const DIST_NOTES = [
  'Each distinct posting is placed by the largest non-preferred number of years detected in it. “No non-preferred number detected” also covers postings where years appear only as preferred; “Under 3 years” includes the rare explicit zeros.',
  'In 2020–22, 35% to 55% of distinct postings come from data-provider records, which show no non-preferred number more often than archived postings.',
  'Shares are rounded from exact counts, so a bar can total 99% or 101%.',
]

export function csvForDistribution() {
  const note = `Unit: distinct U.S. solar job postings in the archive (identical or near-identical postings from the same employer and year counted once); same postings as the report's table. ${DIST_NOTES.join(' ')} The 2026 data are incomplete.`
  const rows = [
    ['occupation', 'period', 'band', 'share_percent', 'postings_in_band', 'distinct_postings', 'note', 'source'],
    ...DISTRIBUTION.flatMap(row => row.periods.flatMap(p => DIST_BANDS.map(b => [row.label, p.period.replace('–', '-'), b.label, p.pct[b.key], p.counts[b.key], p.n, note, REPORT_PATH]))),
  ]
  return rows.map(row => row.map(csvCell).join(',')).join('\n') + '\n'
}

const MEASURE_NOTE ='Measure: 3+ years detected, meaning an automatically detected experience figure of three years or more that is not marked preferred. The 2026 data are incomplete.'

export function csvForElectricianCounts() {
  const note = `Unit: distinct U.S. solar job postings with an electrician title, 2024-2026 (identical or near-identical postings from the same employer and year counted once). ${MEASURE_NOTE} ${ELECTRICIAN_COUNT_WAYS_NOTE} Equal weight: each identified employer counts once, whatever its number of postings; 8 postings with no identified employer are left out of that count.`
  const rows = [
    ['occupation', 'period', 'count_method', 'share_3plus_years_detected_percent', 'postings_3plus_years_detected', 'denominator', 'denominator_unit', 'note', 'source'],
    ...ELECTRICIAN_COUNT_WAYS.map(way => ['Electricians', '2024-2026', way.label, way.pct, way.k ?? '', way.n, way.unit, note, REPORT_PATH]),
  ]
  return rows.map(row => row.map(csvCell).join(',')).join('\n') + '\n'
}

export function csvForEngineerPeriods() {
  const note = `Unit: distinct U.S. solar job postings with an engineering or design title (identical or near-identical postings from the same employer and year counted once). ${MEASURE_NOTE} Years use archive capture dates where available, otherwise provider-created dates. Period change: "rise" means the increase stayed positive across the report's employer and date checks.`
  const rows = [
    ['occupation', 'period', 'share_3plus_years_detected_percent', 'postings_3plus_years_detected', 'distinct_postings', 'period_change', 'note', 'source'],
    ...ENGINEER_PERIODS.map(p => ['Engineers & designers', p.period.replace('–', '-'), p.pct, p.k, p.n, 'rise', note, REPORT_PATH]),
  ]
  return rows.map(row => row.map(csvCell).join(',')).join('\n') + '\n'
}

function csvCell(value: string | number) {
  const text = String(value)
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function csvForRanking() {
  const rows = [
    ['occupation', 'at_least_3_years_percent', 'at_least_5_years_percent', 'posting_groups', 'note', 'source'],
    ...RANKING.map(row => [row.label, row.ge3, row.ge5, row.groups, RANKING_NOTE, REPORT_PATH]),
  ]
  return rows.map(row => row.map(csvCell).join(',')).join('\n') + '\n'
}

export function csvForAnnual() {
  const note = 'Unit: distinct U.S. solar job postings in the archive (identical or near-identical postings from the same employer and year counted once). Measure: 3+ years detected, meaning an automatically detected experience figure of three years or more that is not marked preferred. The 2026 data are incomplete. Cells with fewer than 30 postings are imprecise. Maintenance 2023 is omitted because the targeted scope review did not cover that year. Annual shares describe the archive; its employers and sources change from year to year. Period change compares 2020-22 with 2024-26: "rise" means the increase stayed positive across the report\'s employer and date checks; "did not meet rise checks" covers all other comparisons.'
  const rows = [
    ['occupation', 'year', 'share_3plus_years_detected_percent', 'postings_3plus_years_detected', 'distinct_postings', 'fewer_than_30_postings', 'share_2020_22_percent', 'share_2024_26_percent', 'period_change', 'note', 'source'],
    ...ANNUAL_ROWS.flatMap(row => row.values.map((cell, i) => [row.label, ANNUAL_YEARS[i], cell?.pct ?? '', cell?.k ?? '', cell?.n ?? '', cell ? (cell.small ? 'yes' : 'no') : '',
      row.change.early, row.change.late, row.change.rise ? 'rise' : 'did not meet rise checks', note, REPORT_PATH])),
  ]
  return rows.map(row => row.map(csvCell).join(',')).join('\n') + '\n'
}
