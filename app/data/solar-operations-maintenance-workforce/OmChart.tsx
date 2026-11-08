import styles from './report-press.module.css'
import type { ChartDef } from './chart-data'

// Same markup as the figures of the report page, for the embeddable charts.
export default function OmChart({ chart }: { chart: ChartDef }) {
  return (
    <figure className={styles.figure}>
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
      ) : (
        <>
          <div className={styles.legend}><span><i className={styles.maintenanceSwatch} /> Maintenance</span><span><i className={styles.serviceSwatch} /> Service</span></div>
          {chart.rows.map(item => (
            <div className={styles.pair} key={item.label}>
              <div className={styles.pairLabel}>{item.label}</div>
              <div className={styles.pairLine}><div className={styles.track}><div className={styles.fill} style={{ width: `${item.maintenance}%` }} /></div><strong>{item.maintenance}%</strong></div>
              <div className={styles.pairLine}><div className={styles.track}><div className={styles.serviceFill} style={{ width: `${item.service}%` }} /></div><strong>{item.service}%</strong></div>
            </div>
          ))}
        </>
      )}
      <p className={styles.note}>{chart.note}</p>
    </figure>
  )
}
