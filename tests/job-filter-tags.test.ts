import assert from 'node:assert/strict'
// Node's native type stripping requires explicit extensions; the application
// itself keeps extensionless imports for Next.js' bundler.
// @ts-expect-error Explicit .ts extension is required by this test runner.
import { matchesEntryLevelJob } from '../lib/entry-level-filter.ts'
// @ts-expect-error Explicit .ts extension is required by this test runner.
import { getPopularJobFilterTags, isPopularJobFilterActive, isPromotedDrawerValue, togglePopularJobFilter } from '../lib/popular-job-filters.ts'

const expectedTags: Record<string, string[]> = {
  '/jobs': ['New', '$80k+', 'Entry-level', 'Per diem'],
  '/solar-pv-installer-jobs': ['New', '$60k+', 'Entry-level', 'Full-time'],
  '/lead-solar-installer-jobs': ['New', '$60k+', 'Company vehicle', 'Per diem'],
  '/solar-electrician-jobs': ['New', '$80k+', 'Apprenticeship', 'OSHA 10'],
  '/solar-technician-jobs': ['New', '$70k+', 'Entry-level', 'Company vehicle'],
  '/bess-technician-jobs': ['New', '$70k+', 'OSHA 10', 'Per diem'],
  '/solar-engineer-jobs': ['New', '$100k+', 'Full-time', 'Remote'],
  '/solar-sales-jobs': ['New', '$100k+', 'Full-time', 'Remote'],
  '/solar-jobs-no-experience': ['New', '$60k+', 'Full-time', 'Company vehicle'],
}

for (const [pathname, labels] of Object.entries(expectedTags)) {
  assert.deepEqual(
    getPopularJobFilterTags(pathname).map((tag) => tag.label),
    labels,
    `${pathname} should expose exactly its four configured tags`,
  )
}

assert.deepEqual(
  getPopularJobFilterTags('/unknown-jobs').map((tag) => tag.label),
  expectedTags['/jobs'],
  'unknown listing routes should use the /jobs defaults',
)
assert.equal(isPromotedDrawerValue('/solar-sales-jobs', 'job_type', 'Full-time'), true)
assert.equal(isPromotedDrawerValue('/solar-sales-jobs', 'benefits', 'Per diem / travel pay'), false)
assert.equal(isPromotedDrawerValue('/solar-electrician-jobs', 'certification', 'osha10'), true)

const installerTags = getPopularJobFilterTags('/solar-pv-installer-jobs')
const [newTag, salaryTag, entryTag, fullTimeTag] = installerTags
let params = new URLSearchParams('q=installer&where=Texas&page=4&benefits=401k')
params = togglePopularJobFilter(params, newTag)
params = togglePopularJobFilter(params, entryTag)
params = togglePopularJobFilter(params, fullTimeTag)
assert.equal(params.get('sort'), 'newest')
assert.equal(params.get('experience'), 'entry')
assert.equal(params.get('job_type'), 'Full-time')
assert.equal(params.get('q'), 'installer')
assert.equal(params.get('where'), 'Texas')
assert.equal(params.get('benefits'), '401k')
assert.equal(params.has('page'), false)
assert.equal(isPopularJobFilterActive(params, newTag), true)

params = togglePopularJobFilter(params, salaryTag)
assert.equal(params.get('salary_min'), '60000')
params = togglePopularJobFilter(params, fullTimeTag)
assert.equal(params.has('job_type'), false)

const perDiemTag = getPopularJobFilterTags('/jobs')[3]
params.set('benefits', '401k')
params = togglePopularJobFilter(params, perDiemTag)
assert.equal(params.get('benefits'), '401k,Per diem / travel pay')
params = togglePopularJobFilter(params, perDiemTag)
assert.equal(params.get('benefits'), '401k')
assert.equal(isPopularJobFilterActive(params, perDiemTag), false)

assert.equal(matchesEntryLevelJob('Field Maintenance Technician, Entry Level', ''), true)
assert.equal(matchesEntryLevelJob('Solar Technician Apprentice', ''), true)
assert.equal(matchesEntryLevelJob('Solar Laborer', ''), true)
assert.equal(matchesEntryLevelJob('Solar Installer', 'No experience required. Training provided.'), true)
assert.equal(matchesEntryLevelJob('Lead Solar Installer', 'Entry-level candidates welcome.'), false)
assert.equal(matchesEntryLevelJob('Senior Solar Associate', 'We will train the right candidate.'), false)
assert.equal(matchesEntryLevelJob('Advanced Solar Technician', 'Training provided.'), false)
assert.equal(matchesEntryLevelJob('Solar Technician III', 'Entry-level program available.'), false)
assert.equal(matchesEntryLevelJob('Solar Installer', 'Requires 3+ years of installation experience.'), false)

console.log('Popular job filter and entry-level regression tests passed')
