// These totals are maintained in the capture transaction. FULL/WAL durability
// stays unchanged; reports no longer parse every capture's JSON once a minute.
export function createCaptureMetrics(db) {
  const values = alias => [
    `CASE WHEN ${alias}.status='done' THEN COALESCE(json_extract(${alias}.metadata,'$.bytes'),0) ELSE 0 END`,
    `CASE WHEN json_extract(${alias}.metadata,'$.reused')=1 THEN 1 ELSE 0 END`,
    `CASE WHEN json_extract(${alias}.metadata,'$.contentDeduplicated')=1 THEN 1 ELSE 0 END`,
  ]
  const delta = (column, index) => `${column}+(${values('NEW')[index]})-(${values('OLD')[index]})`
  db.exec('BEGIN IMMEDIATE')
  try {
    db.exec(`CREATE TABLE IF NOT EXISTS capture_report_totals(id INTEGER PRIMARY KEY CHECK(id=1),savedBytes INTEGER NOT NULL,reusedCaptures INTEGER NOT NULL,contentDeduplicated INTEGER NOT NULL)`)
    if (!db.prepare('SELECT 1 FROM capture_report_totals WHERE id=1').get()) {
      db.exec(`INSERT INTO capture_report_totals SELECT 1,
        COALESCE(SUM(CASE WHEN status='done' THEN COALESCE(json_extract(metadata,'$.bytes'),0) ELSE 0 END),0),
        COALESCE(SUM(CASE WHEN json_extract(metadata,'$.reused')=1 THEN 1 ELSE 0 END),0),
        COALESCE(SUM(CASE WHEN json_extract(metadata,'$.contentDeduplicated')=1 THEN 1 ELSE 0 END),0) FROM captures`)
    }
    db.exec(`CREATE TRIGGER IF NOT EXISTS capture_report_insert AFTER INSERT ON captures WHEN NEW.metadata IS NOT NULL BEGIN
      UPDATE capture_report_totals SET
      savedBytes=savedBytes+(${values('NEW')[0]}),
      reusedCaptures=reusedCaptures+(${values('NEW')[1]}),
      contentDeduplicated=contentDeduplicated+(${values('NEW')[2]}) WHERE id=1; END;
      CREATE TRIGGER IF NOT EXISTS capture_report_delete AFTER DELETE ON captures WHEN OLD.metadata IS NOT NULL BEGIN
      UPDATE capture_report_totals SET
      savedBytes=savedBytes-(${values('OLD')[0]}),
      reusedCaptures=reusedCaptures-(${values('OLD')[1]}),
      contentDeduplicated=contentDeduplicated-(${values('OLD')[2]}) WHERE id=1; END;
      CREATE TRIGGER IF NOT EXISTS capture_report_update AFTER UPDATE OF status,metadata ON captures
      WHEN OLD.metadata IS NOT NEW.metadata OR ((OLD.status='done') != (NEW.status='done') AND NEW.metadata IS NOT NULL) BEGIN
      UPDATE capture_report_totals SET savedBytes=${delta('savedBytes',0)},reusedCaptures=${delta('reusedCaptures',1)},contentDeduplicated=${delta('contentDeduplicated',2)} WHERE id=1; END;`)
    db.exec('COMMIT')
  } catch (error) { db.exec('ROLLBACK'); throw error }
  const read = db.prepare('SELECT savedBytes,reusedCaptures,contentDeduplicated FROM capture_report_totals WHERE id=1')
  return () => ({ ...read.get() })
}
