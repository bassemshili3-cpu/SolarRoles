import { ImageResponse } from 'next/og'
import React from 'react'
import { ANNUAL_ROWS, ANNUAL_YEARS, DISTRIBUTION, DIST_BANDS, DIST_NOTES, type DistBand, csvForDistribution, ELECTRICIAN_COUNT_WAYS, ELECTRICIAN_COUNT_WAYS_NOTE, ENGINEER_PERIODS, NO_RISE_MARK, REPORT_PATH, changeLabel, csvForAnnual, csvForElectricianCounts, csvForEngineerPeriods } from '../../chart-data'

export const runtime = 'edge'

function RankingImage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', padding: '31px 42px 26px', background: '#ffffff', color: '#173b3c', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '5px solid #d77c5e', paddingTop: 14 }}>
        <span style={{ color: '#1f625b', fontSize: 14, fontWeight: 700, letterSpacing: 2 }}>SOLAR ROLES RESEARCH</span>
        <span style={{ color: '#687d79', fontSize: 14, fontWeight: 700, letterSpacing: 1 }}>U.S. · 2020–2026</span>
      </div>
      <div style={{ display: 'flex', fontSize: 34, fontWeight: 700, letterSpacing: -1, marginTop: 13 }}>Share of U.S. solar job postings with 3+ years of experience detected</div>
      <div style={{ display: 'flex', fontSize: 18, color: '#637773', marginTop: 5 }}>By occupation and year · distinct postings in our archive, preferred figures excluded · n = postings analyzed · 2026 incomplete</div>
      <div style={{ display: 'flex', marginTop: 20, height: 38, background: '#173f3e', color: '#ffffff', fontSize: 14, fontWeight: 700, letterSpacing: 0.3, alignItems: 'center' }}>
        <div style={{ display: 'flex', width: 320, paddingLeft: 17 }}>OCCUPATION</div>
        {ANNUAL_YEARS.map(year => <div key={year} style={{ display: 'flex', flex: 1, justifyContent: 'center' }}>{year === 2026 ? '2026†' : year}</div>)}
        <div style={{ display: 'flex', width: 190, justifyContent: 'center' }}>2020–22 → 2024–26</div>
      </div>
      {ANNUAL_ROWS.map((row, index) => (
        <div key={row.label} style={{ display: 'flex', alignItems: 'center', height: 62, borderBottom: '1px solid #d9e6df', background: index % 2 === 0 ? '#f8fbf9' : '#ffffff' }}>
          <div style={{ display: 'flex', width: 320, paddingLeft: 17, paddingRight: 8, fontSize: 18, fontWeight: 600 }}>{row.label}</div>
          {row.values.map((cell, yearIndex) => (
            <div key={ANNUAL_YEARS[yearIndex]} style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#176453', lineHeight: 1.05 }}>{cell ? `${cell.pct}%` : '—'}</span>
              <span style={{ fontSize: 12, color: cell?.small ? '#b45309' : '#6a807a', fontWeight: cell?.small ? 700 : 400, marginTop: 4 }}>{cell ? `n=${cell.n}${cell.small ? '*' : ''}` : 'not reviewed'}</span>
            </div>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', width: 190, height: '100%', alignItems: 'center', justifyContent: 'center', borderLeft: '2px solid #d9e6df', background: '#ffffff' }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: '#2f4a42' }}>{changeLabel(row.change)}</span>
            {row.change.rise && <span style={{ display: 'flex', marginTop: 5, padding: '2px 8px', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, background: '#dff0e6', color: '#176456' }}>RISE</span>}
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', fontSize: 14, lineHeight: 1.4, color: '#2f4a42', marginTop: 11 }}>{`RISE: increase from 2020–22 to 2024–26 that remains positive across the report’s employer and date checks.  ·  ${NO_RISE_MARK} Did not meet the Rise checks.`}</div>
      <div style={{ display: 'flex', fontSize: 14, lineHeight: 1.4, color: '#2f4a42', marginTop: 3 }}><span style={{ color: '#b45309', fontWeight: 700, marginRight: 5 }}>*</span>{'Fewer than 30 postings.  ·  † 2026 is incomplete.  ·  Maintenance 2023 not reviewed.'}</div>
      <div style={{ display: 'flex', fontSize: 14, lineHeight: 1.4, color: '#586e68', marginTop: 5 }}>Years detected automatically. Employers in the archive vary by year. No detected number does not mean no experience is required.</div>
      <div style={{ display: 'flex', fontSize: 14, color: '#176453', fontWeight: 700, marginTop: 10 }}>{`Source: Solar Roles Research  ·  solarroles.com${REPORT_PATH}`}</div>
    </div>
  )
}

// Shared frame for the two smaller figures (1200×630): each one must be readable without the page.
const FRAME = { display: 'flex', flexDirection: 'column', width: '100%', height: '100%', padding: '30px 42px 26px', background: '#ffffff', color: '#173b3c', fontFamily: 'sans-serif' } as const
const NOTE = { display: 'flex', fontSize: 15, lineHeight: 1.4, color: '#586e68', marginTop: 4 } as const

function FigureHead({ period, title, subtitle }: { period: string; title: string; subtitle: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '5px solid #d77c5e', paddingTop: 14 }}>
        <span style={{ color: '#1f625b', fontSize: 14, fontWeight: 700, letterSpacing: 2 }}>SOLAR ROLES RESEARCH</span>
        <span style={{ color: '#687d79', fontSize: 14, fontWeight: 700, letterSpacing: 1 }}>{`U.S. · ${period}`}</span>
      </div>
      <div style={{ display: 'flex', fontSize: 37, fontWeight: 700, letterSpacing: -1, marginTop: 13 }}>{title}</div>
      <div style={{ display: 'flex', fontSize: 18, color: '#637773', marginTop: 5 }}>{subtitle}</div>
    </div>
  )
}

function FigureSource() {
  return <div style={{ display: 'flex', fontSize: 14, color: '#176453', fontWeight: 700, marginTop: 10 }}>{`Source: Solar Roles Research  ·  solarroles.com${REPORT_PATH}`}</div>
}

function ElectriciansImage() {
  return (
    <div style={FRAME}>
      <FigureHead period="2024–2026" title="Solar electrician postings: three ways to count the archive" subtitle="Share of distinct U.S. postings with 3+ years of experience detected · 2024–2026 · 2026 incomplete" />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', marginTop: 34 }}>
          {ELECTRICIAN_COUNT_WAYS.map((way, index) => (
            <div key={way.label} style={{ display: 'flex', flexDirection: 'column', flex: 1, marginLeft: index === 0 ? 0 : 28, borderTop: `5px solid ${index === 0 ? '#366a58' : '#9fc3b3'}`, paddingTop: 16 }}>
              <span style={{ fontSize: 104, fontWeight: 700, letterSpacing: -4, lineHeight: 1, color: '#173b3c' }}>{`${way.pct}%`}</span>
              <div style={{ display: 'flex', height: 14, marginTop: 16, background: '#e9eeea' }}><div style={{ display: 'flex', width: `${way.pct}%`, height: '100%', background: '#366a58' }} /></div>
              <span style={{ display: 'flex', minHeight: 54, fontSize: 21, fontWeight: 700, lineHeight: 1.25, marginTop: 16 }}>{way.label}</span>
              <span style={{ fontSize: 17, color: '#586e68', marginTop: 6 }}>{way.basis}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ ...NOTE, color: '#2f4a42' }}>{ELECTRICIAN_COUNT_WAYS_NOTE}</div>
          <div style={NOTE}>Years detected automatically; figures marked preferred excluded. No detected number does not mean no experience is required.</div>
          <FigureSource />
        </div>
      </div>
    </div>
  )
}

function EngineersImage() {
  return (
    <div style={FRAME}>
      <FigureHead period="2020–2026" title="Solar engineering postings: 44% to 61% with 3+ years detected" subtitle="Share of distinct U.S. engineering and design postings, by period · 2026 incomplete" />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
          {ENGINEER_PERIODS.map((p, index) => (
            <div key={p.period} style={{ display: 'flex', alignItems: 'center', marginTop: index === 0 ? 0 : 26 }}>
              <div style={{ display: 'flex', flexDirection: 'column', width: 190 }}>
                <span style={{ fontSize: 27, fontWeight: 700 }}>{p.period}</span>
                <span style={{ fontSize: 17, color: '#586e68', marginTop: 3 }}>{`${p.n} postings`}</span>
              </div>
              <div style={{ display: 'flex', flex: 1, height: 80, background: '#e9eeea' }}><div style={{ display: 'flex', width: `${p.pct}%`, height: '100%', background: '#366a58' }} /></div>
              <span style={{ display: 'flex', justifyContent: 'flex-end', width: 170, fontSize: 68, fontWeight: 700, letterSpacing: -2, lineHeight: 1 }}>{`${p.pct}%`}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 15, color: '#2f4a42' }}><span style={{ display: 'flex', marginRight: 9, padding: '2px 8px', fontSize: 12, fontWeight: 700, letterSpacing: 0.5, background: '#dff0e6', color: '#176456' }}>RISE</span>Increase from 2020–22 to 2024–26 that remains positive across the report’s employer and date checks.</div>
          <div style={NOTE}>Years detected automatically; figures marked preferred excluded. Years use archive capture dates where available, otherwise provider dates.</div>
          <FigureSource />
        </div>
      </div>
    </div>
  )
}

const BAND_STYLE: Record<DistBand, { background: string; color: string }> = {
  none: { background: '#dde7f0', color: '#2c4a66' },
  under3: { background: '#9ec5e8', color: '#12324f' },
  b34: { background: '#2f74b5', color: '#ffffff' },
  b5: { background: '#1b4a80', color: '#ffffff' },
}

function DistributionImage() {
  return (
    <div style={{ ...FRAME, padding: '28px 42px 24px' }}>
      <FigureHead period="2020–22 vs 2024–26" title="U.S. solar job postings by years of experience" subtitle="Share of distinct postings in each band, by occupation and period · largest non-preferred number per posting · 2026 incomplete" />
      <div style={{ display: 'flex', marginTop: 14 }}>
        {DIST_BANDS.map(b => (
          <div key={b.key} style={{ display: 'flex', alignItems: 'center', marginRight: 24, fontSize: 15, fontWeight: 700, color: '#2c4a66' }}>
            <div style={{ display: 'flex', width: 16, height: 16, marginRight: 8, background: BAND_STYLE[b.key].background, border: '1px solid #c5d4e3' }} />{b.label}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
        {DISTRIBUTION.map(row => (
          <div key={row.label} style={{ display: 'flex', alignItems: 'center', padding: '6px 0', borderTop: '1px solid #e3ebf3' }}>
            <div style={{ display: 'flex', width: 250, paddingRight: 12, fontSize: 17, fontWeight: 600, color: '#1d3550' }}>{row.label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              {row.periods.map(p => (
                <div key={p.period} style={{ display: 'flex', alignItems: 'center', marginTop: 2, marginBottom: 2 }}>
                  <div style={{ display: 'flex', width: 140, fontSize: 14, fontWeight: 700, color: '#2c4a66' }}>{`${p.period}  ·  n=${p.n}`}</div>
                  <div style={{ display: 'flex', flex: 1, height: 27 }}>
                    {DIST_BANDS.map(b => (
                      <div key={b.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: `${100 * p.counts[b.key] / p.n}%`, height: '100%', fontSize: p.pct[b.key] < 5 ? 12 : 14, fontWeight: 700, ...BAND_STYLE[b.key] }}>{p.pct[b.key] >= 3 ? `${p.pct[b.key]}%` : ''}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
        {DIST_NOTES.map(note => <div key={note} style={{ ...NOTE, fontSize: 13, marginTop: 2 }}>{note}</div>)}
        <FigureSource />
      </div>
    </div>
  )
}

const csvHeaders = (name: string) => ({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="solar-roles-experience-${name}.csv"`, 'Cache-Control': 'no-store' })
const pngHeaders = (name: string) => ({ 'Content-Disposition': `inline; filename="solar-roles-experience-${name}.png"`, 'Cache-Control': 'no-store' })

export async function GET(_request: Request, { params }: { params: { file: string } }) {
  if (params.file === 'distribution.csv') return new Response(csvForDistribution(), { headers: csvHeaders('years-stated') })
  if (params.file === 'distribution.png') return new ImageResponse(<DistributionImage />, { width: 1400, height: 820, headers: pngHeaders('years-stated') })
  if (params.file === 'electricians.csv') return new Response(csvForElectricianCounts(), { headers: csvHeaders('electricians') })
  if (params.file === 'engineers.csv') return new Response(csvForEngineerPeriods(), { headers: csvHeaders('engineers') })
  if (params.file === 'electricians.png') return new ImageResponse(<ElectriciansImage />, { width: 1200, height: 630, headers: pngHeaders('electricians') })
  if (params.file === 'engineers.png') return new ImageResponse(<EngineersImage />, { width: 1200, height: 630, headers: pngHeaders('engineers') })
  if (params.file === 'ranking.csv') {
    return new Response(csvForAnnual(), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="solar-roles-experience-ranking.csv"', 'Cache-Control': 'no-store' } })
  }
  if (params.file === 'ranking.png') {
    return new ImageResponse(<RankingImage />, { width: 1400, height: 770, headers: { 'Content-Disposition': 'inline; filename="solar-roles-experience-ranking.png"', 'Cache-Control': 'no-store' } })
  }
  return new Response('Not found', { status: 404 })
}
