import { ImageResponse } from 'next/og'
import { CHARTS, REPORT_URL, SOURCE_LABEL, csvFor, type ChartDef } from '../../chart-data'

// Downloads of the report charts: /data/solar-operations-maintenance-workforce/downloads/<chart>.png (1200x675, source printed on the
// image) and <chart>.csv (values, note and source URL on every row).
export const runtime = 'edge'

const GREEN = '#366a58', COPPER = '#b67545', TRACK = '#e9eeea', INK = '#171b1b', MUTED = '#59655e'

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div style={{ display: 'flex', flex: 1, height: 26, background: TRACK }}>
      <div style={{ display: 'flex', width: `${(value / max) * 100}%`, height: '100%', background: color }} />
    </div>
  )
}

function Png({ chart }: { chart: ChartDef }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: '#ffffff', color: INK, padding: '48px 60px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', fontSize: 18, letterSpacing: 2, color: GREEN, fontWeight: 700 }}>SOLAR ROLES RESEARCH</div>
      <div style={{ display: 'flex', fontSize: 38, fontWeight: 700, lineHeight: 1.2, marginTop: 14 }}>{chart.title}</div>
      <div style={{ display: 'flex', fontSize: 20, color: MUTED, marginTop: 10 }}>{chart.pngSubtitle ?? chart.subtitle}</div>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', marginTop: 18 }}>
        {chart.kind === 'bars'
          ? chart.rows.map(r => (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', margin: '9px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', width: 290 }}>
                <div style={{ display: 'flex', fontSize: 24 }}>{r.label}</div>
                {chart.period && r.count ? <div style={{ display: 'flex', fontSize: 16, color: MUTED }}>{`${r.count} groups`}</div> : null}
              </div>
              <Bar value={r.value} max={chart.max} color={GREEN} />
              <div style={{ display: 'flex', width: 110, justifyContent: 'flex-end', fontSize: 28, fontWeight: 700 }}>{`${r.value}%`}</div>
            </div>))
          : [
            <div key="legend" style={{ display: 'flex', fontSize: 18, color: MUTED, marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginRight: 28 }}><div style={{ display: 'flex', width: 16, height: 16, background: GREEN, marginRight: 8 }} />Maintenance</div>
              <div style={{ display: 'flex', alignItems: 'center' }}><div style={{ display: 'flex', width: 16, height: 16, background: COPPER, marginRight: 8 }} />Service</div>
            </div>,
            ...chart.rows.map(r => (
              <div key={r.label} style={{ display: 'flex', alignItems: 'center', margin: '12px 0' }}>
                <div style={{ display: 'flex', width: 290, fontSize: 22, fontWeight: 700, paddingRight: 16 }}>{r.label}</div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', margin: '3px 0' }}><Bar value={r.maintenance} max={100} color={GREEN} /><div style={{ display: 'flex', width: 90, justifyContent: 'flex-end', fontSize: 22, fontWeight: 700 }}>{`${r.maintenance}%`}</div></div>
                  <div style={{ display: 'flex', alignItems: 'center', margin: '3px 0' }}><Bar value={r.service} max={100} color={COPPER} /><div style={{ display: 'flex', width: 90, justifyContent: 'flex-end', fontSize: 22, fontWeight: 700 }}>{`${r.service}%`}</div></div>
                </div>
              </div>))]}
      </div>
      <div style={{ display: 'flex', fontSize: 15, color: MUTED, lineHeight: 1.4, marginTop: 10 }}>{chart.note}</div>
      <div style={{ display: 'flex', fontSize: 16, color: INK, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${TRACK}` }}>{`Source: ${SOURCE_LABEL} · ${REPORT_URL.replace('https://', '')}`}</div>
    </div>
  )
}

export async function GET(_req: Request, { params }: { params: { file: string } }) {
  const m = /^([a-z-]+)\.(png|csv)$/.exec(params.file)
  const chart = m ? CHARTS[m[1]] : undefined
  if (!m || !chart) return new Response('Not found', { status: 404 })
  const name = `solar-roles-${chart.id}.${m[2]}`
  if (m[2] === 'csv') {
    return new Response(csvFor(chart.id), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${name}"`, 'Cache-Control': 'public, max-age=3600' } })
  }
  return new ImageResponse(<Png chart={chart} />, { width: 1200, height: 675, headers: { 'Content-Disposition': `inline; filename="${name}"`, 'Cache-Control': 'public, max-age=3600' } })
}
