import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'A solar sales job—or a business you have to fund? Six selected job descriptions. Solar Roles Research.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(<div style={{ background: '#1C2126', color: 'white', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: 64, fontFamily: 'sans-serif' }}>
    <div style={{ display: 'flex', fontSize: 24, color: '#F2A93B' }}>SOLAR ROLES RESEARCH · SEPTEMBER 2026</div>
    <div style={{ display: 'flex', fontSize: 66, fontWeight: 700, lineHeight: 1.12, marginTop: 42 }}>A solar sales job—or a business you have to fund?</div>
    <div style={{ display: 'flex', fontSize: 30, color: '#F2A93B', marginTop: 36 }}>One listing puts the ad budget on the rep.</div>
    <div style={{ display: 'flex', fontSize: 25, lineHeight: 1.5, color: '#BBC1C6', marginTop: 24 }}>Six selected descriptions · Leads, expenses and company support</div>
  </div>, size)
}
