import assert from 'node:assert/strict'
import { gzipSync } from 'node:zlib'
import {
  extractHistoricalTaxonomy,
  extractHttpPayloadFromWarc,
  isHistoricalSolarRole,
  parseHistoricalJobHtml,
  spreadSample,
  type HistoricalEmployer,
} from '../lib/historical-jobs/commonCrawl'
import { buildUrlIndexSql, surtHostPrefix, targetFromPattern } from '../lib/historical-jobs/urlIndex'

const employer: HistoricalEmployer = {
  employerId: 'example-solar',
  employerName: 'Example Solar',
  atsProvider: 'greenhouse',
  patterns: ['boards.greenhouse.io/examplesolar/*'],
}
const html = `<!doctype html><html><head><script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'JobPosting',
  identifier: { value: 'SOL-42' },
  title: 'Solar Commissioning Technician',
  description: '<p>Commission utility-scale solar and BESS systems. OSHA-30 required. Travel up to 50%. Two years of experience.</p>',
  datePosted: '2020-02-01',
  employmentType: 'FULL_TIME',
  jobLocation: { address: { addressLocality: 'Austin', addressRegion: 'TX', addressCountry: 'US' } },
})}</script></head><body></body></html>`

const parsed = parseHistoricalJobHtml(html, 'https://boards.greenhouse.io/examplesolar/jobs/42?gh_src=test', employer)
assert(parsed)
assert.equal(parsed.sourceJobId, 'SOL-42')
assert.equal(parsed.canonicalUrl, 'https://boards.greenhouse.io/examplesolar/jobs/42')
assert.equal(parsed.state, 'TX')
assert.equal(parsed.taxonomy.bessStorage, true)
assert.equal(parsed.taxonomy.commissioning, true)
assert.equal(parsed.taxonomy.osha, true)
assert.equal(parsed.taxonomy.travel, true)
assert.equal(parsed.taxonomy.minimumExperienceYears, 2)

const taxonomy = extractHistoricalTaxonomy('Solar Electrician', 'NABCEP preferred. Paid training and OSHA 10 are provided.')
assert.equal(taxonomy.electrician, true)
assert.equal(taxonomy.nabcep, true)
assert.equal(taxonomy.paidTraining, true)
assert.equal(extractHistoricalTaxonomy('Transmission Strategist - Solar and Storage Development', '').bessStorage, true)
assert.equal(extractHistoricalTaxonomy('Software Engineer', 'Build cloud object storage systems.').bessStorage, false)
assert.equal(isHistoricalSolarRole('Director, PV Energy & Performance Engineering', 'Lead a utility-scale generation team.'), true)
assert.equal(isHistoricalSolarRole('Senior Project Accountant', 'Work for a solar energy company.'), false)
assert.equal(isHistoricalSolarRole('Wind Field Service Technician III', 'Our portfolio produces renewable energy from wind and solar.'), false)
assert.equal(isHistoricalSolarRole('Dev Ops Engineer', 'We are a global solar energy company building clean energy products.'), false)

const foreignHtml = html.replace(
  'Solar Commissioning Technician',
  'Solar Quality Engineer',
).replace(
  '"addressLocality":"Austin","addressRegion":"TX","addressCountry":"US"',
  '"addressLocality":"Binan, LAG, PH","addressRegion":"","addressCountry":""',
)
assert.equal(parseHistoricalJobHtml(foreignHtml, 'https://boards.greenhouse.io/examplesolar/jobs/43', employer), null)

const warc = Buffer.from(`WARC/1.0\r\nWARC-Type: response\r\nContent-Length: ${html.length}\r\n\r\nHTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n${html}`)
const payload = extractHttpPayloadFromWarc(gzipSync(warc))
assert.match(payload.statusLine, /200 OK/)
assert.match(payload.body.toString(), /JobPosting/)

assert.deepEqual(spreadSample([1, 2, 3, 4, 5], 3), [1, 3, 5])

const target = targetFromPattern(employer, 'https://boards.greenhouse.io/examplesolar/jobs/*')
assert.equal(target.host, 'boards.greenhouse.io')
assert.equal(target.pathPrefix, '/examplesolar/jobs/')
assert.equal(surtHostPrefix('boards.greenhouse.io'), 'io,greenhouse,boards)')
const urlIndexSql = buildUrlIndexSql({
  crawlIds: ['CC-MAIN-2024-30'],
  parquetUrls: ['https://data.commoncrawl.org/cc-index/table/cc-main/warc/crawl=CC-MAIN-2024-30/subset=warc/part-00000.parquet'],
  targets: [target],
  outputDir: 'data/common-crawl-historical-jobs/test-output',
})
assert.match(urlIndexSql, /read_parquet/)
assert.match(urlIndexSql, /url_host_name\) IN/)
assert.match(urlIndexSql, /url_surtkey >= 'io,greenhouse,boards\)'/)
assert.match(urlIndexSql, /warc_record_offset AS VARCHAR/)
assert.match(urlIndexSql, /CC-MAIN-2024-30/)
assert.throws(() => targetFromPattern(employer, '*.greenhouse.io/examplesolar/*'), /exact host/)
console.log('common crawl historical jobs tests passed')
