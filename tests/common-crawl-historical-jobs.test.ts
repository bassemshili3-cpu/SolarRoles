import assert from 'node:assert/strict'
import { gzipSync } from 'node:zlib'
import {
  buildHistoricalJobFeatures,
  extractHistoricalTaxonomy,
  extractHttpPayloadFromWarc,
  isHistoricalSolarRole,
  parseHistoricalJobHtml,
  parseHistoricalJobHtmlDetailed,
  repairCommonMojibake,
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
const parsedFeatures = buildHistoricalJobFeatures(parsed)
assert.equal(parsedFeatures.taxonomy.bessStorage, true)
assert.equal(parsedFeatures.taxonomy.commissioning, true)
assert.equal(parsedFeatures.taxonomy.osha, true)
assert.equal(parsedFeatures.taxonomy.travel, true)
assert.equal(parsedFeatures.taxonomy.minimumExperienceYears, 2)

const taxonomy = extractHistoricalTaxonomy('Solar Electrician', 'NABCEP preferred. Paid training and OSHA 10 are provided.')
assert.equal(taxonomy.electrician, true)
assert.equal(taxonomy.nabcep, true)
assert.equal(taxonomy.paidTraining, true)
assert.equal(extractHistoricalTaxonomy('Lead Estimator', 'Minimum 5+ years’ experience in construction estimating.').minimumExperienceYears, 5)
assert.equal(extractHistoricalTaxonomy('PV Tech III', 'Report to the operations manager.').management, false)
assert.equal(extractHistoricalTaxonomy('Transmission Strategist - Solar and Storage Development', '').bessStorage, true)
assert.equal(extractHistoricalTaxonomy('Software Engineer', 'Build cloud object storage systems.').bessStorage, false)
assert.equal(isHistoricalSolarRole('Director, PV Energy & Performance Engineering', 'Lead a utility-scale generation team.'), true)
assert.equal(isHistoricalSolarRole('Senior Project Accountant', 'Work for a solar energy company.'), false)
assert.equal(isHistoricalSolarRole('Wind Field Service Technician III', 'Our portfolio produces renewable energy from wind and solar.'), false)
assert.equal(isHistoricalSolarRole('Dev Ops Engineer', 'We are a global solar energy company building clean energy products.'), false)
assert.equal(isHistoricalSolarRole('Finance Operations Manager', 'We are a global solar energy company building clean energy products.'), false)
assert.equal(isHistoricalSolarRole('Project Engineer', 'Design utility-scale photovoltaic systems and solar projects.'), true)
assert.equal(isHistoricalSolarRole(
  'Install Tech I',
  'SunPower is a global solar company. The experience we would expect the ideal person to deliver is: Works within a team to install roof attachments, equipment racking supports and solar panels. Responsible for electrical wiring of solar arrays.',
), true)
assert.equal(isHistoricalSolarRole(
  'Finance Operations Manager',
  'SunPower is a global solar company. The experience we would expect the ideal person to deliver is: Manage general ledger reconciliations, reporting, controls and accounting operations.',
), false)
assert.equal(isHistoricalSolarRole(
  'Title & Survey Manager',
  'You will oversee title and survey needs for utility-scale solar projects in multiple states.',
), true)
assert.equal(repairCommonMojibake('candidateâ€™s â€œsolarâ€\u009d role'), 'candidate’s “solar” role')

const foreignHtml = html.replace(
  'Solar Commissioning Technician',
  'Solar Quality Engineer',
).replace(
  '"addressLocality":"Austin","addressRegion":"TX","addressCountry":"US"',
  '"addressLocality":"Binan, LAG, PH","addressRegion":"","addressCountry":""',
)
const foreignParsed = parseHistoricalJobHtmlDetailed(foreignHtml, 'https://boards.greenhouse.io/examplesolar/jobs/43', employer)
assert(foreignParsed.job)
assert.equal(foreignParsed.isUsJob, false)
assert.equal(foreignParsed.rejectionReason, 'not_us_or_unknown')
assert.equal(parseHistoricalJobHtml(foreignHtml, 'https://boards.greenhouse.io/examplesolar/jobs/43', employer), null)

const boilerplateOnlyHtml = html.replace(
  'Solar Commissioning Technician',
  'Finance Operations Manager',
).replace(
  '<p>Commission utility-scale solar and BESS systems. OSHA-30 required. Travel up to 50%. Two years of experience.</p>',
  '<p>We are a global solar energy company building clean energy products. Manage finance operations and reporting.</p>',
)
const boilerplateParsed = parseHistoricalJobHtmlDetailed(boilerplateOnlyHtml, 'https://boards.greenhouse.io/examplesolar/jobs/44', employer)
assert(boilerplateParsed.job)
assert.equal(boilerplateParsed.isSolarRelated, false)
assert.equal(boilerplateParsed.rejectionReason, 'not_solar_related')
assert.equal(parseHistoricalJobHtml(boilerplateOnlyHtml, 'https://boards.greenhouse.io/examplesolar/jobs/44', employer), null)

const unknownLocationHtml = html.replace(
  '"addressLocality":"Austin","addressRegion":"TX","addressCountry":"US"',
  '"addressLocality":"London","addressRegion":"","addressCountry":""',
)
const unknownLocationParsed = parseHistoricalJobHtmlDetailed(unknownLocationHtml, 'https://boards.greenhouse.io/examplesolar/jobs/45', employer)
assert(unknownLocationParsed.job)
assert.equal(unknownLocationParsed.isUsJob, false)
assert.equal(unknownLocationParsed.rejectionReason, 'not_us_or_unknown')

const foreignPostalHtml = '<html><body><h1>Solar Logistics Coordinator</h1><div class="location">MEYZIEU, 69, FR, 69330</div><div class="job-description">Coordinate solar panel logistics, installation inventory and project deliveries for utility-scale solar projects across the region.</div></body></html>'
const foreignPostalParsed = parseHistoricalJobHtmlDetailed(foreignPostalHtml, 'https://example.com/jobs/foreign-postal', employer)
assert(foreignPostalParsed.job)
assert.equal(foreignPostalParsed.isUsJob, false)
assert.match(foreignPostalParsed.usEvidence.join(','), /location_country_code_fr/)

const sourceUrlLocationHtml = '<html><body><h1>Solar Project Engineer</h1><div class="location">Nearest Major Market: Houston</div><div class="job-description">Design utility-scale solar projects and photovoltaic systems for customers.</div></body></html>'
const sourceUrlLocationParsed = parseHistoricalJobHtmlDetailed(
  sourceUrlLocationHtml,
  'https://careers.example.com/job/Houston-Solar-Project-Engineer-TX-77027/123/',
  employer,
)
assert(sourceUrlLocationParsed.job)
assert.equal(sourceUrlLocationParsed.isUsJob, true)
assert.match(sourceUrlLocationParsed.usEvidence.join(','), /source_url_state_zip/)

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
