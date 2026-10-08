import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateBoundedRewrite } from '../lib/seo/rewrite-long-ats'
import { ATS_JOB_SOURCES } from '../lib/ats-sources'

const valid = '<p>PV installer in Texas.</p><h3>Responsibilities</h3><ul><li>Install PV modules.</li></ul><h3>Requirements</h3><ul><li>OSHA 10.</li></ul>'
test('HTML tags count toward the strict 3000-character ceiling', () => {
  assert.equal(validateBoundedRewrite(valid), valid.length)
  assert.equal(validateBoundedRewrite(valid, valid.length), valid.length)
  assert.throws(() => validateBoundedRewrite(valid, valid.length - 1))
  assert.throws(() => validateBoundedRewrite(valid + ' '.repeat(3000)))
})
test('Unicode characters are counted like PostgreSQL char_length', () => {
  const html = valid.replace('Texas', 'Texas ☀️')
  assert.equal(validateBoundedRewrite(html), Array.from(html).length)
})
test('unsafe HTML, unexpected headings and prose requirements are rejected', () => {
  for (const html of [valid + '<script>alert(1)</script>', valid.replace('<p>', '<p onclick="alert(1)">'), valid.replace('Responsibilities', 'Culture'), valid.replace('<ul><li>OSHA 10.</li></ul>', '<p>OSHA 10.</p>'), '<p>Incomplete output</p>']) assert.throws(() => validateBoundedRewrite(html))
})
test('banned marketing hooks are rejected', () => {
  assert.throws(() => validateBoundedRewrite(valid.replace('PV installer in Texas.', 'Not just a job, a mission.')))
})
test('ATS scope includes newer providers but excludes aggregators and direct scraping', () => {
  for (const source of ['hrmdirect', 'saashr', 'workable', 'workday']) assert.ok((ATS_JOB_SOURCES as readonly string[]).includes(source))
  for (const source of ['adzuna', 'whatjobs', 'custom-scrape', 'employer', 'first-party-careers', 'qcells']) assert.ok(!(ATS_JOB_SOURCES as readonly string[]).includes(source))
})
