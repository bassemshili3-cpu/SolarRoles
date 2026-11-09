import styles from './report-press.module.css'
import type { ReactNode } from 'react'
import type { ChartDef } from './chart-data'

// Same markup as the figures of the report page, for the embeddable charts.
export default function OmChart({ chart, id, children }: { chart: ChartDef; id?: string; children?: ReactNode }) {
  return (
    <figure className={styles.figure} id={id}>
      <figcaption><h3>{chart.title}</h3><p>{chart.subtitle}</p></figcaption>
      {chart.kind === 'bars' ? (
        <>
          <div className={styles.chart}>{chart.rows.map(item => (
            <div className={chart.period ? `${styles.barRow} ${styles.periodRow}` : styles.barRow} key={item.label}>
              <span>{item.label}{chart.period && item.count ? <small>{item.count} groups</small> : null}</span>
              <div className={styles.track}><div className={styles.fill} style={{ width: `${(item.value / chart.max) * 100}%` }} /></div>
              <strong>{item.value}%</strong>
            </div>
          ))}</div>
          {chart.period
            ? <div className={styles.periodScale}><span>0%</span><span>5%</span><span>10%</span><span>15%</span></div>
            : <div className={styles.scale}><span>0%</span><span>50%</span><span>100%</span></div>}
        </>
      ) : null}
      <p className={styles.note}>{chart.note}</p>
      {children}
    </figure>
  )
}
