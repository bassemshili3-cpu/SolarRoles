import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import styles from '@/app/data/solar-operations-maintenance-workforce/report-press.module.css'
import OmChart from '@/app/data/solar-operations-maintenance-workforce/OmChart'
import { CHARTS, CHART_IDS, REPORT_URL, SOURCE_LABEL } from '@/app/data/solar-operations-maintenance-workforce/chart-data'

// Embeddable chart of the solar O&M report. Framing is allowed for /embed/* (next.config.mjs). The backlink comes from the
// attribution link in the embed code, placed outside the iframe; the link inside the frame only lets readers reach the report.
export const dynamicParams = false
export function generateStaticParams() { return CHART_IDS.map(chart => ({ chart })) }

export function generateMetadata({ params }: { params: { chart: string } }): Metadata {
  const chart = CHARTS[params.chart]
  return { title: chart ? `${chart.title} | Solar Roles` : 'Solar Roles chart', robots: { index: false, follow: true } }
}

export default function SolarOmEmbed({ params }: { params: { chart: string } }) {
  const chart = CHARTS[params.chart]
  if (!chart) notFound()
  return (
    <main className={`${styles.report} ${styles.embed}`}>
      <OmChart chart={chart} />
      <p className={styles.embedSource}>Source: <a href={REPORT_URL} target="_blank" rel="noopener">{SOURCE_LABEL}</a></p>
    </main>
  )
}
