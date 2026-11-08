import styles from './report-press.module.css'
import { REPORT_PATH, embedCode } from './chart-data'

// Download and embed links under each chart. No client JavaScript: plain links and a read-only textarea to copy from.
export default function ChartTools({ id }: { id: string }) {
  return (
    <div className={styles.chartTools}>
      <div className={styles.chartToolLinks}>
        <a href={`${REPORT_PATH}/downloads/${id}.png`} download>Download PNG</a>
        <a href={`${REPORT_PATH}/downloads/${id}.csv`} download>Download data (CSV)</a>
      </div>
      <details className={styles.embedBox}>
        <summary>Embed this chart</summary>
        <p>Copy this code into your page. Please keep the source link below the chart.</p>
        <textarea readOnly rows={5} defaultValue={embedCode(id)} aria-label="Embed code" />
      </details>
    </div>
  )
}
