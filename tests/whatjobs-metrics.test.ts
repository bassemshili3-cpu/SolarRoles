import { test } from 'node:test'
import assert from 'node:assert/strict'
import { whatJobsMetricBatchSchema } from '../lib/whatjobsMetrics'
import { whatJobsDestination } from '../lib/whatjobsDestination'

const event = { id: '12345678-1234-4234-8234-123456789012', viewId: '22345678-1234-4234-8234-123456789012',
  type: 'click', surface: 'feed', pagePath: '/solar-pv-installer-jobs', jobId: '3097958301', publisher: '7186',
  device: 'desktop', activation: 'keyboard', pnpAvailable: false, tokenPresent: false, isTest: true }

test('only supported WhatJobs destinations expose identifiers', () => {
  assert.deepEqual(whatJobsDestination('https://www.whatjobs.com/pub_api__cpl__3097958301__7186?secret=ignored'), { jobId: '3097958301', publisher: '7186' })
  assert.equal(whatJobsDestination('https://www.whatjobs.com.evil.test/pub_api__cpl__123__7186'), null)
  assert.equal(whatJobsDestination('http://www.whatjobs.com/pub_api__cpl__123__7186'), null)
})
test('collector rejects unknown payload fields and query strings in page paths', () => {
  assert.equal(whatJobsMetricBatchSchema.safeParse({ events: [event] }).success, true)
  assert.equal(whatJobsMetricBatchSchema.safeParse({ events: [{ ...event, ip: '192.0.2.1' }] }).success, false)
  assert.equal(whatJobsMetricBatchSchema.safeParse({ events: [{ ...event, pagePath: '/jobs?email=visitor@example.com' }] }).success, false)
  assert.equal(whatJobsMetricBatchSchema.safeParse({ events: Array(41).fill(event) }).success, false)
})
test('job actions require an offer identifier and searches are classified separately', () => {
  assert.equal(whatJobsMetricBatchSchema.safeParse({ events: [{ ...event, jobId: null }] }).success, false)
  assert.equal(whatJobsMetricBatchSchema.safeParse({ events: [{ ...event, type: 'search_submit', jobId: null, surface: 'job_search', activation: 'submit' }] }).success, true)
  assert.equal(whatJobsMetricBatchSchema.safeParse({ events: [{ ...event, type: 'search_submit', surface: 'feed' }] }).success, false)
})

test('API validates same-origin events and persists only the validated payload', async () => {
  const { prisma } = await import('../lib/prisma')
  const { POST } = await import('../app/api/whatjobs/events/route')
  const { NextRequest } = await import('next/server')
  const previous = prisma.$executeRaw
  let stored: unknown = null
  prisma.$executeRaw = (async (_query: unknown, ...values: unknown[]) => {
    stored = JSON.parse(String(values[0]))
    return 1
  }) as typeof prisma.$executeRaw
  try {
    const request = (body: unknown, origin = 'https://solarroles.com') => new NextRequest('https://solarroles.com/api/whatjobs/events', {
      method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body),
    })
    assert.equal((await POST(request({ events: [event] }, 'https://other.test'))).status, 403)
    assert.equal((await POST(request({ events: [{ ...event, secret: 'not-stored' }] }))).status, 400)
    assert.equal(stored, null)
    assert.equal((await POST(request({ events: [event] }))).status, 204)
    assert.deepEqual(stored, [event])
  } finally { prisma.$executeRaw = previous }
})
