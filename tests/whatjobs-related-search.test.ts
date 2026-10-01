import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getRelatedWhatJobsSearches, isRelatedWhatJobsResult } from '../lib/whatjobsRelatedSearch'
import type { WhatJobsJob } from '../lib/whatjobs'

test('solar installer search widens from the city to the state without using the full job title', () => {
  assert.deepEqual(
    getRelatedWhatJobsSearches('Solar Installer – Residential Rooftop Solar', 'Corpus Christi, TX'),
    [
      { keyword: 'solar installer', location: 'Corpus Christi' },
      { keyword: 'solar installer', location: 'Texas' },
    ],
  )
})

test('installer suggestions exclude unrelated jobs returned by the provider', () => {
  const job = (title: string) => ({ title }) as WhatJobsJob
  const sourceTitle = 'Solar Installer – Residential Rooftop Solar'

  assert.equal(isRelatedWhatJobsResult(job('PV Installer'), sourceTitle), true)
  assert.equal(isRelatedWhatJobsResult(job('Solar Field Technician'), sourceTitle), true)
  assert.equal(isRelatedWhatJobsResult(job('Market Research Participant'), sourceTitle), false)
  assert.equal(isRelatedWhatJobsResult(job('Cabinet Installer'), sourceTitle), false)
})
