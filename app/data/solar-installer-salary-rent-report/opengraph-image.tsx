import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Solar installer pay and rent: 41 hours in Albuquerque, 99 in Santa Cruz. 28 US metros compared.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <div style={{ background: '#1C2126', color: 'white', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '64px', fontFamily: 'sans-serif' }}>
      <div style={{ color: '#F2A93B', fontSize: 24, display: 'flex' }}>SOLAR ROLES RESEARCH · 2026</div>
      <div style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.1, marginTop: 32, display: 'flex' }}>Where solar installer pay goes furthest on rent</div>
      <div style={{ display: 'flex', gap: 70, marginTop: 45 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: 76, color: '#F2A93B' }}>41 hours</span><span style={{ fontSize: 25 }}>Albuquerque, NM</span></div>
        <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: 76, color: '#F2A93B' }}>99 hours</span><span style={{ fontSize: 25 }}>Santa Cruz–Watsonville, CA</span></div>
      </div>
      <div style={{ fontSize: 22, color: '#BBC1C6', marginTop: 38, display: 'flex' }}>One-bedroom HUD rent ÷ BLS median gross hourly pay · 28 metros</div>
    </div>, size,
  )
}
