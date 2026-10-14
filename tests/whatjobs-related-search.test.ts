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

test('solar sales uses normalized keywords and city/state locations, including trailing country codes', () => {
  assert.deepEqual(getRelatedWhatJobsSearches('Solar Sales Advisor', 'Greenville, SC, US'), [
    { keyword: 'solar sales', location: 'Greenville' },
    { keyword: 'solar sales', location: 'South Carolina' },
    { keyword: 'solar', location: 'Greenville' },
    { keyword: 'solar', location: 'South Carolina' },
  ])
  assert.deepEqual(getRelatedWhatJobsSearches('Solar Appointment Setter', 'SC'), [
    { keyword: 'solar sales', location: 'SC' },
    { keyword: 'solar sales', location: 'South Carolina' },
    { keyword: 'solar', location: 'SC' },
    { keyword: 'solar', location: 'South Carolina' },
  ])
})

test('sales recommendations require both a commercial role and explicit solar context', () => {
  const job = (title: string, snippet = '') => ({ title, snippet }) as WhatJobsJob
  for (const source of ['Solar Sales Advisor', 'Solar Energy Consultant', 'Solar Appointment Setter', 'Solar Account Executive']) {
    for (const title of ['Solar Sales Representative', 'Solar Energy Advisor', 'Commercial Solar Account Executive', 'Solar Canvasser', 'Solar Appointment Setter']) {
      assert.equal(isRelatedWhatJobsResult(job(title), source), true, title)
    }
    assert.equal(isRelatedWhatJobsResult(job('Sales Representative', 'Sell residential solar systems to homeowners.'), source), true)
    assert.equal(isRelatedWhatJobsResult(job('Appointment Setter', 'Qualify leads for solar panel installations.'), source), true)
    for (const title of ['Hybrid Pharmacist - Retail/Remote', 'Underwriting Specialist - Renewable Energy', 'Land Solutions Project Manager, Remote (Renewable Energy)', 'Solar Installer', 'Solar Sales Engineer', 'Retail Sales Advisor', 'Remote Regional Sales Manager - Solar Energy Storage - Texas', 'Solar Sales Director']) {
      assert.equal(isRelatedWhatJobsResult(job(title), source), false, title)
    }
    assert.equal(isRelatedWhatJobsResult(job('Insurance Sales Advisor', 'Solar customers welcome.'), source), false)
    assert.equal(isRelatedWhatJobsResult(job('Sales Representative', 'Renewable energy and wind solutions.'), source), false)
    assert.equal(isRelatedWhatJobsResult(job('Sales Representative'), source), false)
  }
  assert.equal(isRelatedWhatJobsResult(job('Solar Sales Manager'), 'Solar Sales Manager'), true)
})
