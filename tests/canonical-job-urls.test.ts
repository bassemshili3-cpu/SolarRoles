import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getCanonicalJobPath, getCanonicalJobUrl, getPublicJobLink } from '../lib/job-url'
import { isJobAvailable } from '../lib/job-availability'
import { prisma } from '../lib/prisma'
import { GET as legacyGet, HEAD as legacyHead } from '../app/jobs/[id]/route'
import { GET as applyGet, HEAD as applyHead } from '../app/jobs/[id]/go/route'

const now = new Date('2026-10-07T12:00:00Z')
const job = { id: 'ABC', title: 'Changed title', location: 'New city', canonicalSlug: 'persisted-old-title', active: true, expiresAt: new Date('2099-01-01'), applyUrl: 'https://example.com/apply' }

test('all public helpers retain the persisted slug and apex origin', () => {
  assert.equal(getCanonicalJobPath(job), '/jobs/ABC/persisted-old-title')
  assert.equal(getCanonicalJobUrl(job), 'https://solarroles.com/jobs/ABC/persisted-old-title')
  assert.equal(getCanonicalJobPath({ ...job, canonicalSlug: null }), '/jobs/ABC/changed-title-new-city')
  assert.equal(getCanonicalJobPath({ ...job, canonicalSlug: ' persisted-old-title ' }), '/jobs/ABC/persisted-old-title')
})

test('normalizing stored internal URLs preserves external source URLs', () => {
  for (const url of ['/jobs/ABC?from=/jobs', 'http://www.solarroles.com/jobs/ABC', 'https://solarroles.com/jobs/ABC/old']) {
    assert.equal(getPublicJobLink({ ...job, url }), getCanonicalJobUrl(job))
  }
  assert.equal(getPublicJobLink({ ...job, url: 'https://ats.example.com/ABC' }), 'https://ats.example.com/ABC')
})

test('missing, inactive and expired offers are inaccessible, never 410', () => {
  assert.equal(isJobAvailable(null, now), false)
  assert.equal(isJobAvailable({ ...job, active: false }, now), false)
  assert.equal(isJobAvailable({ ...job, expiresAt: now }, now), false)
  assert.equal(isJobAvailable(job, now), true)
})

test('actual legacy GET and HEAD handlers send direct 308 or 404 before rendering', async () => {
  const original = prisma.job.findUnique
  try {
    for (const method of ['GET', 'HEAD'] as const) {
      const handler = method === 'GET' ? legacyGet : legacyHead
      for (const record of [job, null, { ...job, active: false }, { ...job, expiresAt: new Date('2000-01-01') }]) {
        prisma.job.findUnique = (async () => record) as unknown as typeof original
        const response = await handler(new Request('https://solarroles.com/jobs/ABC?from=/jobs', { method }), { params: Promise.resolve({ id: job.id }) })
        assert.equal(response.status, record === job ? 308 : 404)
        assert.equal(response.headers.get('location'), record === job ? getCanonicalJobPath(job) : null)
        assert.equal(response.headers.get('cache-control'), 'no-store')
      }
    }
  } finally { prisma.job.findUnique = original }
})

test('DB failures are errors, not synthetic 404s', async () => {
  const original = prisma.job.findUnique
  try {
    prisma.job.findUnique = (async () => { throw new Error('database unavailable') }) as unknown as typeof original
    await assert.rejects(legacyGet(new Request('https://solarroles.com/jobs/ABC'), { params: Promise.resolve({ id: job.id }) }), /database unavailable/)
  } finally { prisma.job.findUnique = original }
})

test('Apply keeps 307, excludes HEAD/prefetch from counting, and counts ordinary GET', async () => {
  const findOriginal = prisma.job.findUnique, updateOriginal = prisma.job.update
  let clicks = 0
  try {
    prisma.job.findUnique = (async () => job) as unknown as typeof findOriginal
    prisma.job.update = (async () => { clicks++; return job }) as unknown as typeof updateOriginal
    for (const [method, headers] of [['HEAD', {}], ['GET', { purpose: 'prefetch' }], ['GET', { 'sec-purpose': 'prefetch;prerender' }], ['GET', {}]] as const) {
      const response = await (method === 'HEAD' ? applyHead : applyGet)(new Request('https://solarroles.com/jobs/ABC/go', { method, headers }), { params: Promise.resolve({ id: job.id }) })
      assert.equal(response.status, 307)
      assert.equal(response.headers.get('location'), job.applyUrl)
      assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow')
    }
    assert.equal(clicks, 1)
    prisma.job.findUnique = (async () => ({ ...job, active: false })) as unknown as typeof findOriginal
    const response = await applyGet(new Request('https://solarroles.com/jobs/ABC/go'), { params: Promise.resolve({ id: job.id }) })
    assert.equal(response.headers.get('location'), 'https://solarroles.com/jobs')
    assert.equal(clicks, 1)
  } finally { prisma.job.findUnique = findOriginal; prisma.job.update = updateOriginal }
})
