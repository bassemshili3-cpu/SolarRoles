import test from 'node:test'
import assert from 'node:assert/strict'
import { buildJobPostingLocation } from '../lib/jobPostingLocation'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { resolveStateName } from '../lib/usStates'
import { buildJobPostingRequirements } from '../lib/jobPostingRequirements'

const singleAddress = (job: Parameters<typeof buildJobPostingLocation>[0]) => {
  const result = buildJobPostingLocation(job)
  assert.ok(!Array.isArray(result.jobLocation))
  return result.jobLocation.address
}

test('missing structured state falls back to the published city, full state name and country', () => {
  assert.deepEqual(singleAddress({ location: 'San Francisco, California, United States' }), {
    '@type': 'PostalAddress', addressCountry: 'US', addressRegion: 'CA', addressLocality: 'San Francisco',
  })
  assert.equal(singleAddress({ location: 'United States - Maryland - Baltimore, US' }).addressLocality, 'Baltimore')
  assert.equal(singleAddress({ location: 'Austin, TX, US' }).addressRegion, 'TX')
  // Exact location format reported as missing jobLocation in GSC.
  assert.deepEqual(singleAddress({ location: 'Naperville, Illinois, United States', addressRegion: '', locationRegions: [] }), {
    '@type': 'PostalAddress', addressCountry: 'US', addressRegion: 'IL', addressLocality: 'Naperville',
  })
})

test('known city without state stays usable without guessing its state', () => {
  assert.deepEqual(singleAddress({ location: 'Chandler, US' }), {
    '@type': 'PostalAddress', addressCountry: 'US', addressLocality: 'Chandler',
  })
})

test('country-only or missing locality never produces an empty jobLocation or fake city', () => {
  for (const location of ['United States', 'US', 'Nationwide', 'Remote', 'Remote, US', 'Multiple Locations', '']) {
    assert.deepEqual(singleAddress({ location }), { '@type': 'PostalAddress', addressCountry: 'US' })
  }
})

test('stored states, multiple locations and postal codes are preserved', () => {
  const result = buildJobPostingLocation({ location: 'Austin, TX', addressRegion: 'TX', locationRegions: ['TX', 'AZ'], postalCode: '78701' })
  assert.ok(Array.isArray(result.jobLocation))
  assert.equal(result.jobLocation.length, 2)
  assert.deepEqual(result.jobLocation[0].address, {
    '@type': 'PostalAddress', addressCountry: 'US', addressRegion: 'TX', addressLocality: 'Austin', postalCode: '78701',
  })
  assert.equal('addressLocality' in result.jobLocation[1].address, false)
})

test('remote sentinel is never emitted as a state; state/city names do not match as substrings', () => {
  assert.equal('addressRegion' in singleAddress({ location: 'Remote, US', addressRegion: 'REMOTE_US' }), false)
  assert.equal('addressRegion' in singleAddress({ location: 'Kansas City, US' }), false)
  assert.equal(singleAddress({ location: 'Georgia, VT' }).addressRegion, 'VT')
  assert.equal(singleAddress({ location: 'Washington, DC' }).addressRegion, 'DC')
})

test('the actual page schema builder uses the fallback and preserves the full-remote exception', () => {
  const source = readFileSync('app/jobs/[id]/[slug]/page.tsx', 'utf8')
  const ast = ts.createSourceFile('page.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const names = new Set(['resolveEmploymentType', 'parseLocationForSchema', 'inferExperienceRequirements', 'toSchemaExperienceRequirements', 'buildJobPostingSchema'])
  const functions = ast.statements.filter(node => ts.isFunctionDeclaration(node) && names.has(node.name?.text || ''))
    .map(node => node.getText(ast)).join('\n')
  const compiled = ts.transpileModule(functions, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText
  const build = vm.runInNewContext(`(function(){${compiled};return buildJobPostingSchema})()`, {
    buildJobPostingLocation, resolveStateName, buildJobPostingRequirements,
    buildSchemaDescription: (input: { description: string }) => input.description,
    getCanonicalJobUrl: () => 'https://solarroles.com/jobs/example/engineer',
  })
  const job = { id: 'example', title: 'Engineer', source: 'greenhouse', description: 'Job description', postedAt: '2026-10-23', expiresAt: '2026-12-01' }
  const physical = build({ ...job, location: 'San Francisco, California, United States', addressRegion: '' })
  assert.equal(physical.jobLocation.address.addressRegion, 'CA')
  assert.equal(physical.jobLocation.address.addressLocality, 'San Francisco')
  assert.equal(build({ ...job, location: 'United States', addressRegion: '' }).jobLocation.address.addressCountry, 'US')
  const remote = build({ ...job, location: 'Remote US', addressRegion: 'REMOTE_US' })
  assert.equal(remote.jobLocation, undefined)
  assert.equal(remote.jobLocationType, 'TELECOMMUTE')
  assert.equal(remote.applicantLocationRequirements['@type'], 'Country')
  const supplied = { '@type': 'MonetaryAmount', currency: 'USD', value: { '@type': 'QuantitativeValue', unitText: 'HOUR', value: 25 } }
  const requirements = build({ ...job, title: 'Senior Engineer', location: 'Austin, TX',
    description: "Minimum 3 years of solar experience required. Bachelor's degree required.",
    schemaBaseSalary: supplied, salary_min: 999999, salary_max: 999999, salaryPeriod: 'YEAR' })
  assert.equal(requirements.experienceRequirements.monthsOfExperience, 36)
  assert.equal(requirements.educationRequirements.credentialCategory, 'bachelor degree')
  assert.equal(requirements.baseSalary.value.value, 25)
  assert.equal(requirements.baseSalary.value.unitText, 'HOUR')
  assert.equal(build({ ...job, title: 'Senior Engineer', salary_min: 999999, salary_max: 999999 }).baseSalary, undefined)
  assert.equal(build({ ...job, title: 'Senior Engineer' }).experienceRequirements, undefined)
})
