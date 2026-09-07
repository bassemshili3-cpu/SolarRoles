import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const base = 'data/remote-travel'
const snapshot = JSON.parse(readFileSync(`${base}/candidates.json`, 'utf8'))
const reviewed = JSON.parse(readFileSync(`${base}/review.json`, 'utf8'))
const excluded = JSON.parse(readFileSync(`${base}/exclusions.json`, 'utf8'))
const candidates = new Map(snapshot.candidates.map(j => [j.id, j]))
const covered = [...reviewed.flatMap(r => r.ids), ...excluded.map(r => r.id)]
assert.equal(new Set(covered).size, covered.length, 'Each candidate must have exactly one review decision')
assert.equal(covered.length, candidates.size, 'All keyword candidates must be accounted for')
const kinds = ['quantified', 'unquantified', 'conflicting', 'not_stated', 'field', 'office', 'incomplete']
const cleanUrl = value => {
  const url = new URL(value)
  assert.ok(['https:', 'http:'].includes(url.protocol))
  for (const key of [...url.searchParams.keys()]) if (key.startsWith('utm_')) url.searchParams.delete(key)
  return url.toString()
}
const rows = reviewed.map((r, index) => {
  assert.ok(r.reviewed && kinds.includes(r.travelKind), `Unreviewed group ${index}`)
  const jobs = r.ids.map(id => { assert.ok(candidates.has(id)); return candidates.get(id) })
  assert.ok(!jobs.some(j => /Remote Ontario|Remote Nova Scotia/.test(j.location)))
  if (r.travelKind !== 'not_stated' && r.travelKind !== 'incomplete') assert.ok(r.travelEvidence)
  assert.ok(!r.travelEvidence || jobs[0].text.includes(r.travelEvidence), `Evidence mismatch: ${r.company} / ${r.title}`)
  for (const n of [r.min, r.max]) assert.ok(n === null || (n >= 0 && n <= 100))
  if (r.qualifier === 'ceiling') assert.equal(r.min, null, 'A ceiling is not a minimum')
  return {
    ...r,
    id: `role-${String(index + 1).padStart(2, '0')}`,
    listingCount: jobs.length,
    sourceUrl: cleanUrl(jobs[0].applyUrl || jobs[0].url),
    jobUrl: `https://www.solarroles.com/jobs/${jobs[0].id}`,
    sources: jobs.map(j => ({ id: j.id, url: cleanUrl(j.applyUrl || j.url), location: j.location.replace(/\s+/g, ' ').trim(), source: j.source, fetchedAt: j.fetchedAt, textSha256: createHash('sha256').update(j.text).digest('hex') })),
  }
})
const analytical = rows.filter(r => r.travelKind !== 'incomplete')
const categoryCounts = Object.fromEntries(kinds.map(kind => [kind, analytical.filter(r => r.travelKind === kind).length]))
const travelCount = categoryCounts.quantified + categoryCounts.unquantified + categoryCounts.conflicting
const advertiser = company => company === 'Moss Construction' ? 'Moss' : company
const advertisers = [...new Set(analytical.map(r => advertiser(r.company)))].length
const recordCount = analytical.reduce((n,r) => n + r.listingCount, 0)
const recordTravelCount = analytical.filter(r => ['quantified', 'unquantified', 'conflicting'].includes(r.travelKind)).reduce((n,r) => n + r.listingCount, 0)
const report = { date: snapshot.extractedAt.slice(0,10), extractedAt: snapshot.extractedAt, activeJobs: snapshot.activeJobs, keywordCandidates: candidates.size, excludedCandidates: excluded.length, screenedGroups: rows.length, incompleteGroups: rows.length - analytical.length, groups: analytical.length, advertisers, recordCount, recordTravelCount, travelCount, travelShare: Math.round(travelCount / analytical.length * 1000) / 10, categoryCounts, rows: analytical }
assert.equal(report.screenedGroups - report.incompleteGroups, report.groups, 'Published denominator must exclude incomplete groups')
assert.equal(report.rows.length, report.groups)
assert.equal(Object.values(categoryCounts).reduce((sum, count) => sum + count, 0), report.groups, 'Chart categories must use the published denominator')
const share = (count, total) => total ? Math.round(count / total * 1000) / 10 : null
report.employerConcentration = [...new Set(analytical.map(r => advertiser(r.company)))].map(company => {
  const companyRows = analytical.filter(r => advertiser(r.company) === company)
  return { company, groups: companyRows.length, share: share(companyRows.length, analytical.length), travelCount: companyRows.filter(r => ['quantified', 'unquantified', 'conflicting'].includes(r.travelKind)).length }
}).sort((a, b) => b.groups - a.groups || a.company.localeCompare(b.company))
const topEmployer = report.employerConcentration[0]
const remainingGroups = analytical.length - topEmployer.groups
const remainingTravelCount = travelCount - topEmployer.travelCount
report.withoutTopEmployer = { excludedCompany: topEmployer.company, groups: remainingGroups, travelCount: remainingTravelCount, travelShare: share(remainingTravelCount, remainingGroups), percentagePointChange: remainingGroups ? Math.round((remainingTravelCount / remainingGroups - travelCount / analytical.length) * 1000) / 10 : null }
assert.equal(report.employerConcentration.reduce((sum, row) => sum + row.groups, 0), analytical.length)
assert.equal(report.employerConcentration.reduce((sum, row) => sum + row.travelCount, 0), travelCount)
mkdirSync('public/data', { recursive: true })
writeFileSync(`${base}/report.json`, JSON.stringify(report, null, 2) + '\n')
const columns = ['company','title','travelKind','travelLabel','qualifier','min','max','remoteSource','remoteEvidence','travelEvidence','notes','listingCount','sourceUrl','jobUrl']
const cell = value => '"' + String(value ?? '').replace(/^[=+@-]/, "'$&").replace(/"/g, '""') + '"'
writeFileSync(`public/data/remote-solar-travel-${report.date}.csv`, '\ufeff' + [columns.join(','), ...analytical.map(r => columns.map(k => cell(r[k])).join(','))].join('\r\n') + '\r\n')
console.log(JSON.stringify({ ...report, rows: undefined }, null, 2))
