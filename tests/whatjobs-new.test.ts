import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isNewWhatJobsJob } from '../lib/whatjobsNew'

const now = new Date('2026-09-30T12:00:00Z')

test('marks only postings younger than seven days as new', () => {
  assert.equal(isNewWhatJobsJob({ age: null, age_days: 0 }, now), true)
  assert.equal(isNewWhatJobsJob({ age: null, age_days: 6 }, now), true)
  assert.equal(isNewWhatJobsJob({ age: null, age_days: 7 }, now), false)
})

test('recognizes WhatJobs date and relative-age labels when age_days is missing', () => {
  assert.equal(isNewWhatJobsJob({ age: 'September 28th, 2026', age_days: null }, now), true)
  assert.equal(isNewWhatJobsJob({ age: 'September 23rd, 2026', age_days: null }, now), false)
  assert.equal(isNewWhatJobsJob({ age: '2 days ago', age_days: null }, now), true)
  assert.equal(isNewWhatJobsJob({ age: '1 week ago', age_days: null }, now), false)
  assert.equal(isNewWhatJobsJob({ age: null, age_days: null }, now), false)
})
