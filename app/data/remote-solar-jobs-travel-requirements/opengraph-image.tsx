import { ImageResponse } from 'next/og'
import report from '@/data/remote-travel/report.json'

export const runtime = 'edge'
export const alt = 'Remote solar jobs can still require 90% travel. Solar Roles description review, September 2026.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(<div style={{ background: '#1C2126', color: 'white', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: 64, fontFamily: 'sans-serif' }}>
    <div style={{ display: 'flex', fontSize: 24, color: '#F2A93B' }}>SOLAR ROLES RESEARCH · SEPTEMBER 2026</div>
    <div style={{ display: 'flex', fontSize: 64, fontWeight: 700, lineHeight: 1.12, marginTop: 38 }}>Remote solar jobs can still require 90% travel</div>
    <div style={{ display: 'flex', fontSize: 74, fontWeight: 700, color: '#F2A93B', marginTop: 36 }}>{report.travelCount} of {report.groups} reviewed roles</div>
    <div style={{ display: 'flex', fontSize: 27, marginTop: 12 }}>mentioned travel or site visits in their descriptions</div>
    <div style={{ display: 'flex', fontSize: 20, color: '#BBC1C6', marginTop: 30 }}>Solar Roles sample · Employer-role groups · Not a national estimate</div>
  </div>, size)
}
