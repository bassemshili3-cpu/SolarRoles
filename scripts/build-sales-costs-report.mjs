import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const read = path => JSON.parse(readFileSync(path, 'utf8'))
const snapshot = read('data/sales-costs/snapshot.json')
const review = read('data/sales-costs/review.json')
assert.equal(new Set(review.map(row => row.id)).size, review.length, 'Duplicate selected records')
assert.equal(review.length, 6, 'Review changes require updating the editorial scope')
const rows = review.map(entry => {
  const source = snapshot.rows.find(row => row.id === entry.id)
  assert.ok(source, `Missing source: ${entry.id}`)
  for (const quote of entry.evidence) assert.ok(source.text.includes(quote), `Unmatched quote: ${entry.id}: ${quote}`)
  const url = new URL(source.applyUrl || source.url)
  if (url.hostname.endsWith('adzuna.com')) url.search = ''
  return { ...entry, title: source.title, location: source.location, source: source.source,
    sourceUrl: url.href, fetchedAt: source.fetchedAt,
    descriptionSha256: createHash('sha256').update(source.text).digest('hex') }
})
const report = { date: '2026-09-07', extractedAt: snapshot.extractedAt,
  activeRecordsScreened: snapshot.activeRecords, titleCandidates: snapshot.rows.length,
  titleRule: snapshot.titleRule, caseCount: rows.length,
  samplingMethod: 'Six purposively selected illustrative cases; not a prevalence estimate or a representative sample.', rows }
mkdirSync('public/data', { recursive: true })
writeFileSync('data/sales-costs/report.json', JSON.stringify(report, null, 2) + '\n')
const columns = ['id', 'advertiser', 'title', 'location', 'category', 'worker', 'support', 'unknown', 'evidence', 'interpretation', 'source', 'sourceUrl', 'fetchedAt', 'descriptionSha256', 'snapshotAt', 'samplingMethod']
const cell = value => `"${String(value ?? '').replaceAll('"', '""')}"`
const lines = rows.map(row => ({ ...row, evidence: row.evidence.join(' | '), snapshotAt: report.extractedAt, samplingMethod: report.samplingMethod }))
writeFileSync(`public/data/solar-sales-business-expenses-${report.date}.csv`, '\ufeff' + [columns.join(','), ...lines.map(row => columns.map(key => cell(row[key])).join(','))].join('\r\n') + '\r\n')
console.log(`Validated and generated ${rows.length} cases with exact source excerpts, hashes and CSV.`)
