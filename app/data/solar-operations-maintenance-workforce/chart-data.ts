import { SITE_URL } from '@/lib/site-url'

// Single source for the report charts: the report page, the embeddable charts (/embed/solar-om/[chart]) and the downloads
// (PNG and CSV under /data/solar-operations-maintenance-workforce/downloads/) all read these values, so they cannot drift apart.

export const REPORT_PATH = '/data/solar-operations-maintenance-workforce'
export const REPORT_URL = `${SITE_URL}${REPORT_PATH}`
export const SOURCE_LABEL = 'Solar Roles, solar O&M job postings report (2026)'

export type BarRow = { label: string; value: number; count?: string }
export type PairRow = { label: string; maintenance: number; service: number }

export const conditions: BarRow[] = [
  { label: 'Diagnosis or repair', value: 90 },
  { label: 'Travel', value: 64 },
  { label: 'Lifting', value: 48 },
  { label: 'Work at height', value: 40 },
  { label: 'Electrician licence', value: 30 },
]

export const profiles: PairRow[] = [
  { label: 'Electrical work or knowledge', maintenance: 95, service: 82 },
  { label: 'Travel', maintenance: 73, service: 62 },
  { label: 'Lifting or work at height', maintenance: 43, service: 75 },
]

export const periods: BarRow[] = [
  { label: '2020–2022', count: '102 / 1,751', value: 5.8 },
  { label: '2023', count: '16 / 565', value: 2.8 },
  { label: '2024–2026', count: '269 / 2,209', value: 12.2 },
]

type ChartBase = { id: string; title: string; subtitle: string; pngSubtitle?: string; note: string; alt: string; embedHeight: number }
export type ChartDef =
  | (ChartBase & { kind: 'bars'; rows: BarRow[]; max: number; period?: boolean })
  | (ChartBase & { kind: 'pairs'; rows: PairRow[] })

export const CHARTS: Record<string, ChartDef> = {
  'om-share': {
    id: 'om-share', kind: 'bars', rows: periods, max: 15, period: true,
    title: '12.2% of groups captured in 2024–26 were classified as O&M',
    subtitle: 'Share of selected solar posting-text groups, by capture period.',
    note: 'Groups are dated by capture; 2026 is partial, through October 10. These shares describe the archive, not national hiring: about half of the increase reflects which employers the archive contains.',
    alt: 'Bar chart: operations and maintenance share of archived U.S. solar job-posting groups, 5.8% in 2020–2022, 2.8% in 2023 and 12.2% in 2024–2026.',
    embedHeight: 470,
  },
  conditions: {
    id: 'conditions', kind: 'bars', rows: conditions, max: 100,
    title: 'Fixing faults is near-universal; physical demands are common',
    subtitle: 'Estimated shares across 387 O&M posting-text groups, adjusted for detector precision.',
    note: 'A mention may be required, preferred or state-dependent. These estimates are based on small precision-check samples.',
    alt: 'Bar chart: estimated shares of U.S. solar O&M job postings mentioning diagnosis or repair (90%), travel (64%), lifting (48%), work at height (40%) and an electrician licence (30%).',
    embedHeight: 500,
  },
  'role-profiles': {
    id: 'role-profiles', kind: 'pairs', rows: profiles,
    title: '75% of service groups mention lifting or work at height',
    subtitle: 'Unadjusted automatic detections, including preferred qualifications. Maintenance: 167 groups; service: 179 groups.',
    pngSubtitle: 'Unadjusted automatic detections. Maintenance: 167 groups; service: 179 groups.',
    note: 'Many maintenance postings concern large sites; service includes work on customer systems and equipment-maker support.',
    alt: 'Paired bar chart comparing maintenance and service solar O&M postings: electrical work 95% vs 82%, travel 73% vs 62%, lifting or work at height 43% vs 75%.',
    embedHeight: 520,
  },
}

export const CHART_IDS = Object.keys(CHARTS)

export function embedCode(id: string): string {
  const chart = CHARTS[id]
  return [
    `<iframe src="${SITE_URL}/embed/solar-om/${id}" title="${chart.title} (Solar Roles)" width="100%" height="${chart.embedHeight}" style="border:0;max-width:760px" loading="lazy"></iframe>`,
    `<p style="font:12px/1.4 Arial,sans-serif;margin:6px 0 0">Source: <a href="${REPORT_URL}">${SOURCE_LABEL}</a></p>`,
  ].join('\n')
}

const cell = (v: string | number) => {
  const s = String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function csvFor(id: string): string {
  const chart = CHARTS[id]
  const lines: (string | number)[][] = chart.kind === 'pairs'
    ? [['category', 'maintenance_pct', 'service_pct', 'note', 'source'], ...chart.rows.map(r => [r.label, r.maintenance, r.service, chart.subtitle, REPORT_URL])]
    : [['label', 'share_pct', ...(chart.period ? ['groups'] : []), 'note', 'source'],
       ...chart.rows.map(r => [r.label, r.value, ...(chart.period ? [r.count ?? ''] : []), chart.subtitle, REPORT_URL])]
  return lines.map(l => l.map(cell).join(',')).join('\n') + '\n'
}
