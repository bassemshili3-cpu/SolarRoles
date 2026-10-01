import assert from 'node:assert/strict'
import { test } from 'node:test'
import { resolveJobSalary } from '../lib/resolveJobSalary'

test('a listing with salary only in its description shows the same salary as its detail page', () => {
  const result = resolveJobSalary({
    title: 'In Home Solar Consultant - Suffolk County, NY',
    description: 'Compensation: $100,000 - $175,000 per year, base plus commission.',
    salary: null,
    salary_min: null,
    salary_max: null,
  })

  assert.match(result.salary || '', /\$100,000.*\$175,000\/year/)
  assert.equal(result.salary_min, 100_000)
  assert.equal(result.salary_max, 175_000)
})

test('a structured salary takes precedence over unrelated amounts in the description', () => {
  const result = resolveJobSalary({
    title: 'Solar Installer',
    description: 'Equipment allowance: $50 per week.',
    salary_min: 70_000,
    salary_max: 90_000,
  })

  assert.equal(result.salary, '$70,000 - $90,000/year')
})
