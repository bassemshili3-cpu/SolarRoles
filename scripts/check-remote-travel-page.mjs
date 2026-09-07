import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { load } from 'cheerio'
import { readFileSync } from 'node:fs'

const origin = process.argv[2] || 'http://localhost:3012'
const path = '/data/remote-solar-jobs-travel-requirements'
const report = JSON.parse(readFileSync('data/remote-travel/report.json', 'utf8'))
const response = await fetch(origin + path)
assert.equal(response.status, 200)
const $ = load(await response.text())
assert.equal($('h1').length, 1)
assert.match($('title').text(), /Remote Solar Jobs Can Still Require 90% Travel/)
assert.equal($('link[rel=canonical]').attr('href'), `https://www.solarroles.com${path}`)
assert.ok($('meta[name=description]').attr('content').includes(`${report.travelCount} of ${report.groups}`))
const graph = JSON.parse($('script[type="application/ld+json"]').toArray().map(el => $(el).html()).find(text => text.includes('"@type":"Report"')))['@graph']
assert.ok(graph.some(node => node['@type'] === 'Dataset'))
assert.equal($('tbody tr').length, report.groups, 'All evidence rows must be rendered on the server')
const concentration = $('#employer-concentration').text()
assert.match(concentration, /SOLV Energy accounts for 12 of the 54 employer-role combinations \(22\.2%\)/)
assert.match(concentration, /74\.1%.*40 of 54/)
assert.match(concentration, /71\.4%.*30 of 42/)
assert.match(concentration, /-2\.6 percentage points/)
assert.match($('#methodology').text(), /SOLV Energy contributes 12 of 54 combinations \(22\.2%\)/)
const csv = await fetch(`${origin}/data/remote-solar-travel-${report.date}.csv`)
assert.equal(csv.status, 200)
assert.match(await csv.text(), /travelEvidence/)
const social = await fetch(origin + path + '/opengraph-image')
assert.equal(social.status, 200)
assert.match(social.headers.get('content-type'), /image\/png/)

const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(origin + path)
  await page.getByRole('combobox').selectOption('quantified')
  assert.equal(await page.locator('tbody tr').count(), report.categoryCounts.quantified)
  await page.getByLabel('Find a company or role').fill('ENGIE')
  assert.equal(await page.locator('tbody tr').count(), 1)
  await page.getByText('Read the evidence', { exact: true }).click()
  assert.ok(await page.locator('tbody').getByText('Must be available to travel domestically up to 85% of the time', { exact: false }).isVisible())
  await page.getByLabel('Find a company or role').fill('zz-no-match')
  assert.equal(await page.locator('tbody tr').count(), 0)
  assert.ok(await page.getByText('No matching roles.', { exact: false }).isVisible())
  await page.getByLabel('Find a company or role').fill('')
  await page.getByRole('combobox').selectOption('all')
  await page.setViewportSize({ width: 390, height: 844 })
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'No page-level mobile overflow')
  await page.screenshot({ path: 'data/remote-travel/mobile-check.png', fullPage: false })
  assert.deepEqual(errors, [])
  console.log('PASS: SSR, metadata, Dataset JSON-LD, all rows, CSV, social image, filters, evidence, empty state and mobile overflow')
} finally { await browser.close() }

