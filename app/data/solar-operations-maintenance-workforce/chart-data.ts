import { SITE_URL } from '@/lib/site-url'

// Single source for the report charts: the report page, the embeddable charts (/embed/solar-om/[chart]) and the downloads
// (PNG and CSV under /data/solar-operations-maintenance-workforce/downloads/) all read these values, so they cannot drift apart.

export const REPORT_PATH = '/data/solar-operations-maintenance-workforce'
export const REPORT_URL = `${SITE_URL}${REPORT_PATH}`
export const SOURCE_LABEL = 'Solar Roles, solar O&M job postings report (2026)'

export type BarRow = { label: string; value: number; count?: string }

// Share of the 387 O&M groups mentioning each of the seven skill areas: automatic detection, unadjusted (research/.../skills-families-20261108,
// F01/F03). ELEC, SAFE, INV: P12/P18 detectors; DIGI, STOR, MECH, HV: new detectors. All seven checked against two blind automated coders
// on 48 sampled postings (F02): precision 0.86-1.00, recall 0.79-1.00. 238 groups (61.5%) mention at least four of the seven.
const SKILL_COUNTS: [string, number][] = [
  ['Electrical work', 326], ['Safety procedures', 264], ['Digital tools and software', 245], ['Inverters', 216],
  ['Mechanical systems', 169], ['Batteries and storage', 166], ['High and medium voltage', 99],
]
export const skills: BarRow[] = SKILL_COUNTS.map(([label, n]) => ({ label, value: Math.round((n / 387) * 100) }))

// Electrical skills versus the electrician licence, 387 O&M groups. Electrical work or knowledge: automatic detection, unadjusted
// (P18 family ELEC, 326 groups). Licence status: blind reading of every licence sentence of the 387 groups by two automated coders,
// disagreements adjudicated (research/.../licence-check-20261108, L02): 148 groups ask for an electrician licence, 36 make it a
// condition of the job (12 of them naming the job's state or city), 72 as a plus, 36 depending on the state, 3 accept an equivalent,
// 1 does not say.
// Human reading 4 (lecture-humaine-4-20261108, H02): 10 of 12 matched; the 2 differences were licences required in the named state or city
// of the job, kept as required; 12 of the 36 required groups name the job's state or city.
export const LICENCE_COUNTS = { electrical: 326, mentioned: 148, required: 36, requiredNamedPlace: 12, preferred: 72, stateDependent: 36, other: 4 }
const pct = (n: number) => Math.round((n / 387) * 100)
export const licence: BarRow[] = [
  { label: 'Electrical skills', value: pct(LICENCE_COUNTS.electrical) },
  { label: 'Electrician licence mentioned', value: pct(LICENCE_COUNTS.mentioned) },
  { label: 'Licence required', value: pct(LICENCE_COUNTS.required) },
]

export const periods: BarRow[] = [
  { label: '2020–2022', count: '102 / 1,751', value: 5.8 },
  { label: '2023', count: '16 / 565', value: 2.8 },
  { label: '2024–2026', count: '269 / 2,209', value: 12.2 },
]

type ChartBase = { id: string; title: string; subtitle: string; pngSubtitle?: string; note: string; alt: string; embedHeight: number }
export type ChartDef =
  | (ChartBase & { kind: 'bars'; rows: BarRow[]; max: number; period?: boolean })

export const CHARTS: Record<string, ChartDef> = {
  'om-share': {
    id: 'om-share', kind: 'bars', rows: periods, max: 15, period: true,
    title: 'O&M share of archived solar postings, by capture period',
    subtitle: 'Posting-text groups classified as O&M, as a share of all selected solar groups captured in each period.',
    note: 'Groups are dated by capture; 2026 is partial, through October 10. These shares describe our archive: about half of the increase reflects which employers it contains.',
    alt: 'Bar chart: operations and maintenance share of archived U.S. solar job-posting groups, 5.8% in 2020–2022, 2.8% in 2023 and 12.2% in 2024–2026.',
    embedHeight: 470,
  },
  skills: {
    id: 'skills', kind: 'bars', rows: skills, max: 100,
    title: 'What O&M postings ask for',
    subtitle: 'Share of 387 O&M posting-text groups mentioning each skill area.',
    note: 'Skill areas overlap and include duties, requirements and preferred qualifications. At least four of the seven are detected in 61.5% of groups. Mentions detected in archived postings; selected cases checked by human review.',
    alt: 'Bar chart: share of 387 U.S. solar O&M posting-text groups mentioning each skill area: electrical work 84%, safety procedures 68%, digital tools and software 63%, inverters 56%, mechanical systems 44%, batteries and storage 43%, high and medium voltage 26%.',
    embedHeight: 600,
  },
  licence: {
    id: 'licence', kind: 'bars', rows: licence, max: 100,
    title: 'From electrical skills to a required licence',
    subtitle: 'Share of 387 O&M posting-text groups.',
    note: 'Mentions detected in archived postings; selected cases checked by human review. "Required": a condition of the job, including 12 groups that name the job\'s state or city; it excludes a licence that is a plus (72 groups) or depends on the state (36).',
    alt: 'Bar chart: 84% of U.S. solar O&M posting-text groups mention electrical skills, 38% ask for an electrician licence and 9% make it a requirement of the job.',
    embedHeight: 440,
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
  const lines: (string | number)[][] = [['label', 'share_pct', ...(chart.period ? ['groups'] : []), 'note', 'source'],
       ...chart.rows.map(r => [r.label, r.value, ...(chart.period ? [r.count ?? ''] : []), chart.subtitle, REPORT_URL])]
  return lines.map(l => l.map(cell).join(',')).join('\n') + '\n'
}
