import assert from 'node:assert/strict'
import { ACTIVE_SOURCES, buildJobWhere } from '../lib/job-where'

const expectedSources = [
  'adp', 'adzuna', 'ashby', 'breezy', 'custom-scrape', 'employer',
  'first-party-careers', 'greenhouse', 'hrmdirect', 'icims', 'jazzhr',
  'jobvite', 'lever', 'oraclecloud', 'paycom', 'paylocity', 'pinpoint',
  'qcells', 'rippling', 'saashr', 'smartrecruiters', 'successfactors',
  'ukg', 'workable', 'workday',
]

assert.deepEqual([...ACTIVE_SOURCES].sort(), expectedSources.sort())
assert.equal(ACTIVE_SOURCES.includes('ashby'), true)
assert.equal((ACTIVE_SOURCES as readonly string[]).includes('asby'), false)
assert.equal((ACTIVE_SOURCES as readonly string[]).includes('careerjet'), false)

const where = buildJobWhere({})
assert.deepEqual(where.source, { in: [...ACTIVE_SOURCES] })
assert.equal(where.active, true)
assert.equal(where.deletedAt, null)
assert.equal(where.pausedAt, null)
assert.ok(where.expiresAt && typeof where.expiresAt === 'object')

console.log('Job list sources: passed')
