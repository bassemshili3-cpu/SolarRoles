import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import * as React from 'react'
import * as jsxRuntime from 'react/jsx-runtime'
import { renderToStaticMarkup } from 'react-dom/server'
import { load } from 'cheerio'
import * as training from '../lib/freeTraining'
import type { TrainingJob, TrainingCategory } from '../lib/freeTraining'

const installer: TrainingJob = { title: 'Solar Installer', description: 'This is an entry-level position. Install modules under supervision.', experienceLevel: 'ENTRY_LEVEL' }
// The employer's explicit sentence, not this title, establishes eligibility.
const entryInstaller = { ...installer, description: 'This position is entry-level. Install modules under supervision.' }

test('beginner titles, apprenticeships and structured levels qualify without a special sentence', () => {
  for (const title of ['Entry Level Solar Installer', 'Junior Solar Installer', 'Solar Installer Trainee', 'Solar Installer Apprentice']) {
    assert.equal(training.getJobTraining({ title, description: 'Join our team.' })?.href, '/free-training#solar-installers', title)
  }
  for (const experienceLevel of ['ENTRY_LEVEL', 'NO_EXPERIENCE_REQUIRED', 'APPRENTICE', 'INTERNSHIP']) {
    assert.ok(training.getJobTraining({ title: 'Solar Installer', experienceLevel, description: '' }))
  }
})

test('natural employer wording and preferred experience no longer suppress beginner recommendations', () => {
  for (const description of [
    'Ipsun Solar is seeking Entry Level Solar Installers to install residential systems.',
    'Green Rack is seeking Entry Level Solar Installers. Experience preferred.',
    'This is an entry-level position. Two years experience preferred.',
    'We train entry-level installers.', 'No prior solar experience is required.', 'Previous experience is not required.',
    '<p>No&nbsp;experience <strong>required</strong>.</p>', '0–1 years of experience.',
  ]) assert.ok(training.getJobTraining({ title: 'Solar Installer', description }), description)
  assert.ok(training.getJobTraining({ title: 'Entry Level BESS Technician', experienceLevel: 'SENIOR_LEVEL', description: 'One year experience preferred.' }))
})

test('senior roles, negations and references to other openings stay excluded', () => {
  for (const title of ['Senior Solar Installer', 'Solar Installer II', 'Lead Solar Installer', 'Journeyman Solar Installer']) {
    assert.equal(training.getJobTraining({ title, description: 'No experience required.', experienceLevel: 'ENTRY_LEVEL' }), null)
  }
  for (const description of ['This position is not entry-level.', 'No experience required for other positions.', 'If no experience is required, ask about training.', 'Provide guidance to entry-level technicians.', 'No experience required?']) {
    assert.equal(training.getJobTraining({ title: 'Solar Installer', description }), null, description)
  }
  assert.equal(training.getJobTraining({ title: 'Solar Installer', description: 'Join our team.', displayDescription: 'No experience required.' }), null)
})

test('every beginner occupation receives a guide link even without a verified occupation-specific course', () => {
  for (const title of ['Payroll Coordinator', 'Solar Electrician', 'Project Coordinator']) {
    const result = training.getJobTraining({ title, experienceLevel: 'ENTRY_LEVEL' })!
    assert.equal(result.href, '/free-training', title)
    assert.equal(result.categoryId, 'general')
  }
  const result = training.getJobTraining({ title: 'Electrician Apprentice', description: '' })!
  assert.equal(result.href, '/free-training')
  assert.doesNotMatch(result.description, /credential|certification|qualif/i)
})

test('no guide is promoted when all provided resources are unpublished or unverified', () => {
  const category = training.getPublishedTrainingCategories()[0]
  const unpublished: TrainingCategory = { id: category.id, displayName: category.displayName, matching: category.matching, status: 'unpublished', reason: 'Pending verification' }
  assert.equal(training.getJobTraining(entryInstaller, [unpublished]), null)
  for (const course of [{ ...category.course, verifiedFree: false }, { ...category.course, beginnerAppropriate: false }]) {
    assert.equal(training.getJobTraining(entryInstaller, [{ ...category, course }]), null)
  }
})

test('specific courses are used for clear matches; hybrid roles link to the whole guide', () => {
  for (const [title, anchor] of [['PV Installer', 'solar-installers'], ['BESS Technician', 'energy-storage'], ['Battery Installer', 'energy-storage'], ['Commercial Solar Sales Representative', 'solar-sales']]) {
    assert.equal(training.getJobTraining({ title, description: 'No experience required.' })?.href, '/free-training#' + anchor)
  }
  assert.equal(training.getJobTraining({ ...entryInstaller, title: 'Solar and Battery Installer' })?.href, '/free-training')
})

function compile(path: string, dependencies: Record<string, unknown>) {
  const source = ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
  const exports: Record<string, any> = {}
  vm.runInNewContext('(function(require,exports){' + source + '\n})')((id: string) => {
    if (!(id in dependencies)) throw new Error(`Unexpected dependency ${id}`)
    return dependencies[id]
  }, exports)
  return exports
}

test('new occupation sections map beginner job pages to their own internal anchors', () => {
  const cases = [
    ['Junior PV Designer', 'solar-designers'], ['Solar Design Engineer', 'solar-designers'],
    ['Solar Engineer', 'solar-designers'], ['Residential Solar Sales Advisor', 'residential-solar-sales'],
    ['Solar Appointment Setter', 'residential-solar-sales'], ['Solar Sales Representative', 'residential-solar-sales'],
    ['Solar QA/QC Inspector', 'solar-inspection'], ['PV Quality Technician', 'solar-inspection'],
    ['Solar O&M Technician', 'solar-technicians'], ['Solar Field Service Technician', 'solar-technicians'],
  ]
  for (const [title, category] of cases) {
    const result = training.getJobTraining({ title, experienceLevel: 'ENTRY_LEVEL' })!
    assert.equal(result?.href, '/free-training#' + category, title)
    assert.doesNotMatch(JSON.stringify(result), /heatspring\.com|aff_id=/)
  }
  assert.equal(training.getJobTraining({ title: 'Junior Designer', description: 'Design utility-scale solar PV systems.' })?.categoryId, 'solar-designers')
  assert.equal(training.getJobTraining({ title: 'Field Service Technician', experienceLevel: 'ENTRY_LEVEL', description: 'Service commercial solar PV systems.' })?.categoryId, 'solar-technicians')
  assert.equal(training.getJobTraining({ title: 'Field Service Technician', experienceLevel: 'ENTRY_LEVEL', description: 'Service telecom equipment.' })?.categoryId, 'general')
  assert.equal(training.getJobTraining({ title: 'BESS Technician', experienceLevel: 'ENTRY_LEVEL', description: 'Solar and battery systems.' })?.categoryId, 'energy-storage')
  assert.equal(training.getJobTraining({ title: 'Commercial Solar Sales Representative', experienceLevel: 'ENTRY_LEVEL' })?.categoryId, 'solar-sales')
  assert.equal(training.getJobTraining({ title: 'Senior Solar Designer', description: 'No experience required.' }), null)
})

const deps = { 'react/jsx-runtime': jsxRuntime, react: React, 'next/link': { default: (props: any) => React.createElement('a', props) }, '@/lib/freeTraining': training, '@/lib/trainingAnalytics': { trackTrainingEvent() {} } }
const AffiliateLink = compile('components/click_affiliate_link.tsx', deps).AffiliateLink
const pageModule = compile('app/free-training/page.tsx', { ...deps, '@/lib/site-url': { SITE_URL: 'https://solarroles.com' }, '@/components/click_affiliate_link': { AffiliateLink } })

test('server-rendered page exposes only published anchors and readable semantic navigation', () => {
  const $ = load(renderToStaticMarkup(React.createElement(pageModule.default)))
  assert.equal($('h1').length, 1)
  assert.equal($('main').length, 1)
  assert.equal($('nav[aria-label="Training by occupation"]').length, 1)
  const categories = training.getPublishedTrainingCategories()
  const destinations = $('nav a').toArray().map(element => $(element).attr('href'))
  assert.deepEqual(destinations, categories.map(category => `#${category.id}`))
  for (const category of categories) {
    assert.equal($(`section#${category.id}`).length, 1)
    assert.equal($(`section#${category.id} h2`).length, 1)
    assert.ok($(`section#${category.id}`).hasClass('scroll-mt-9'))
    const link = $(`section#${category.id} a[rel*="sponsored"]`)
    assert.equal(link.length, 1)
    assert.equal(link.attr('href'), category.course.affiliateUrl)
    for (const rel of ['sponsored', 'nofollow', 'noopener', 'noreferrer']) assert.ok(link.attr('rel')?.includes(rel))
    assert.equal(link.prev('p').text(), training.TRAINING_AFFILIATE_DISCLOSURE)
    assert.ok(link.text().trim().length > 10)
  }
  assert.equal($('#electricians, #solar-engineers, #project-managers').length, 0)
  assert.equal(categories.length, 7)
  assert.equal(pageModule.metadata.alternates.canonical, 'https://solarroles.com/free-training')
})

test('job component blends the internal link into its sentence with no heading or repeated disclosure', () => {
  const Component = compile('components/JobTrainingRecommendation.tsx', deps).default
  const $ = load(renderToStaticMarkup(React.createElement(Component, { recommendation: training.getJobTraining(entryInstaller) })))
  assert.equal($('a').length, 1)
  assert.equal($('a').attr('href'), '/free-training#solar-installers')
  assert.doesNotMatch($.text(), /HeatSpring/i)
  assert.equal($('h2').length, 0)
  assert.doesNotMatch($.text(), /commission|Explore free training/)
  assert.equal($('p').text(), training.getJobTraining(entryInstaller)!.description)
  assert.equal($('a').text(), 'take a free introductory course')
  assert.equal($('aside[aria-label="Free training resources"]').length, 1)
  const source = fs.readFileSync('app/jobs/[id]/[slug]/page.tsx', 'utf8')
  assert.equal((source.match(/<JobTrainingRecommendation\b/g) || []).length, 1)
  assert.ok(source.indexOf('<JobTrainingRecommendation') > source.indexOf('className="job-description"'))
  assert.doesNotMatch(source, /training\.url|heatspring\.com|aff_id=/)
  assert.match(fs.readFileSync('app/sitemap.ts', 'utf8'), /routes: \['\/free-training', \.\.\.resourcePages\]/)
  assert.match(fs.readFileSync('app/resources/page.tsx', 'utf8'), /href: "\/free-training"/)
})

test('analytics uses the existing provider and sends only category and eligibility context', () => {
  const events: any[] = []
  const analytics = compile('lib/trainingAnalytics.ts', { '@vercel/analytics': { track: (...args: any[]) => events.push(args) } })
  analytics.trackTrainingEvent('training_recommendation_impression', 'solar-installers', 'explicit-no-experience')
  analytics.trackTrainingEvent('training_course_click', 'energy-storage')
  assert.deepEqual(JSON.parse(JSON.stringify(events)), [
    ['training_recommendation_impression', { occupation_category: 'solar-installers', experience_signal: 'explicit-no-experience', page_kind: 'job-detail' }],
    ['training_course_click', { occupation_category: 'energy-storage', page_kind: 'free-training' }],
  ])
  const unavailable = compile('lib/trainingAnalytics.ts', { '@vercel/analytics': { track() { throw new Error('Offline') } } })
  assert.doesNotThrow(() => unavailable.trackTrainingEvent('training_resource_click', 'solar-sales', 'explicit-entry-level'))
})
