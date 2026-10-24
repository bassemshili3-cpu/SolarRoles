import test from 'node:test'
import assert from 'node:assert/strict'
import { buildJobPostingRequirements as requirements } from '../lib/jobPostingRequirements'
import { buildJobPostingBaseSalary as salary } from '../lib/jobPostingSalary'

for (const [text, months] of [
  ['At least 3 years of solar installation experience required.', 36],
  ['Minimum 18 months of electrical experience.', 18],
  ['Required: 3 to 5 years of experience.', 36],
  ['Required: 3–5 years of commercial solar experience.', 36],
  ["Minimum 3 years' experience in electrical maintenance.", 36],
  ['<h3>Minimum Qualifications</h3><ul><li>two (2) years of solar experience</li></ul>', 24],
  ['Qualifications:\n5+ years of electrical experience\n2 years of supervisory experience', 60],
  ['You must have three years of project management experience.', 36],
  ['Required: 12 months of roofing experience or 24 months of installation experience.', 12],
  ['Required: 12 months of roofing experience and 24 months of installation experience.', 24],
] as const) test('explicit experience: ' + text, () => {
  const result = requirements(text).experienceRequirements
  assert.equal(typeof result, 'object')
  assert.equal((result as { monthsOfExperience: number }).monthsOfExperience, months)
})

test('no experience is explicit, never inferred from entry-level/training/seniority', () => {
  assert.equal(requirements('No prior experience is required.').experienceRequirements, 'no requirements')
  for (const text of ['Senior Solar Engineer', 'Entry-level installer, training provided.', 'Junior technician', 'Will train the right candidate.']) assert.equal(requirements(text).experienceRequirements, undefined)
  assert.equal(requirements('No solar experience required. Minimum 3 years of electrical experience.').experienceRequirements && typeof requirements('No solar experience required. Minimum 3 years of electrical experience.').experienceRequirements, 'object')
})

for (const [text, category] of [
  ["Bachelor's degree in electrical engineering required.", 'bachelor degree'],
  ['High school diploma or GED required.', 'text'],
  ['An associate degree is required.', 'associate degree'],
  ["A master's degree is required.", 'postgraduate degree'],
  ['<h3>Required Qualifications</h3><p>Bachelor’s degree in engineering</p>', 'bachelor degree'],
] as const) test('explicit education: ' + text, () => {
  const value = requirements(text).educationRequirements
  if (category === 'text') assert.equal(typeof value, 'string')
  else assert.equal((value as { credentialCategory: string })?.credentialCategory, category)
})

test('equivalent experience remains an alternative, never a mandatory diploma plus years', () => {
  const text = "Bachelor's degree or equivalent work experience required."
  const value = requirements(text)
  assert.equal(value.educationRequirements, text)
  assert.equal(value.experienceRequirements, text)
  assert.equal(value.experienceInPlaceOfEducation, true)
  assert.equal(requirements('No formal education is required.').educationRequirements, 'no requirements')
  assert.equal(requirements("Electrical engineering/related bachelor's, or at least five years of renewable-energy field experience.").experienceRequirements, undefined)
  const separate = requirements("Bachelor's degree or equivalent work experience required. Minimum 3 years of solar experience required.")
  assert.match(String(separate.experienceRequirements), /3 years/)
})

test('source evidence must agree with the visible rewritten description', () => {
  assert.equal(requirements('Minimum 3 years of experience required.', 'Minimum 5 years of experience required.').experienceRequirements, undefined)
  assert.equal(requirements('Minimum 3 years of experience required.', 'Help deliver solar projects.').experienceRequirements, undefined)
  assert.equal(requirements("Bachelor's degree required.", "A bachelor's degree in engineering is required.").educationRequirements && true, true)
  assert.equal(requirements('No experience required.', 'Training provided.').experienceRequirements, undefined)
})

const negativeRequirements = [
  '5 years of experience preferred.', '3 years of experience desired.',
  'At least 5 years of experience would be a plus.', '2 years of experience is nice to have.',
  'Experience of 3 years is not required.', 'Up to 5 years of experience required.',
  'Less than 3 years of experience required.', 'Our team has 20 years of solar experience.',
  'Our company has 10 years of experience in this market.', 'A 5-year warranty is required.',
  "Bachelor's degree preferred.", "Master's degree desired.", 'High school diploma is optional.',
  "Bachelor's degree is not required.", 'Preferred Qualifications:\n3 years of solar experience',
  "Preferred Qualifications:\nBachelor's degree", 'We reimburse tuition for a bachelor degree.',
  'Degree of travel: 50%.', 'Lead installer', 'Senior engineer',
]
for (const text of negativeRequirements) test('does not invent requirements: ' + text, () => assert.deepEqual(requirements(text), {}))

test('fixed salary and a range use the correct Google value forms', () => {
  const fixed = salary({ source: 'employer', salary_min: 80000, salary_max: 80000, salaryPeriod: 'year' })
  assert.deepEqual(fixed?.value, { '@type': 'QuantitativeValue', unitText: 'YEAR', value: 80000 })
  assert.deepEqual(salary({ source: 'greenhouse', salary_min: 80000, salary_max: 100000, salaryPeriod: 'year' })?.value,
    { '@type': 'QuantitativeValue', unitText: 'YEAR', minValue: 80000, maxValue: 100000 })
})

for (const [unit, factor, amount] of [['HOUR', 2080, 25], ['DAY', 260, 250], ['WEEK', 52, 1500], ['MONTH', 12, 5000], ['YEAR', 1, 80000]] as const)
  test('annualized source salary is converted back exactly once: ' + unit, () => {
    assert.equal(salary({ source: 'lever', salary_min: amount * factor, salary_max: amount * factor, salaryPeriod: unit })?.value.value, amount)
  })

test('explicit salary text supports fixed hourly/yearly rates and real ranges', () => {
  assert.equal(salary({ source: 'workday', salary: '$28.50/hour' })?.value.value, 28.5)
  assert.equal(salary({ source: 'greenhouse', description: 'Base salary: $90,000 per year.' })?.value.value, 90000)
  assert.equal(salary({ source: 'ashby', salary: '$25 - $35/hour' })?.value.minValue, 25)
  assert.equal(salary({ source: 'ashby', salary: '$25 - $35/hour' })?.value.maxValue, 35)
  assert.equal(salary({ source: 'employer', compensationType: 'BASE_COMMISSION', salary_min: 52000, salary_max: 62400, salaryPeriod: 'hour', salary: '$25 - $30 an hour + commission' })?.value.minValue, 25)
  assert.equal(salary({ source: 'jazzhr', salary: 'USD 25–32/HOUR', salary_min: 25, salary_max: 32, salaryPeriod: 'HOUR' })?.value.minValue, 25)
  assert.equal(salary({ source: 'jazzhr', salary_min: 25, salary_max: 32, salaryPeriod: 'HOUR' }), undefined)
})

const negativeSalaries = [
  { salary: '$80,000/year (est.)' }, { salary: 'Estimated salary: $80,000/year' },
  { salary: '$100,000/year OTE' }, { salary: 'Total compensation $100,000/year' },
  { salary: 'Commission $100,000/year' }, { salary: 'CAD $80,000/year' },
  { salary: '$80,000 - $90,000' }, { description: 'Signing bonus: $5,000 per year.' },
  { description: 'Reimbursement: $100 per month.' }, { salary: 'Minimum salary: $25/hour' },
  { salary: 'Up to $25/hour' }, { salary: '$25/hour minimum' },
  { salary: '$25/hour or $30/hour' }, { salary_min: 80000, salary_max: 80000 },
]
for (const input of negativeSalaries) test('does not publish estimates/variable pay/ambiguous salary: ' + JSON.stringify(input), () => {
  assert.equal(salary({ source: 'employer', ...input }), undefined)
})

test('commission-only and aggregator salaries are not employer base salaries', () => {
  const input = { salary_min: 80000, salary_max: 90000, salaryPeriod: 'YEAR' }
  assert.equal(salary({ source: 'employer', ...input, compensationType: 'COMMISSION_ONLY' }), undefined)
  assert.equal(salary({ source: 'adzuna', ...input }), undefined)
  assert.equal(salary({ source: 'employer', ...input, salary: 'Estimated salary' }), undefined)
})

for (const [text, low, high, unit] of [
  ['Compensation Range: $105,795.00 - $132,244.00 Pay Rate Type: Salary', 105795, 132244, 'YEAR'],
  ['PAY EQUITY STATEMENT: $120,000–$160,000 This compensation range is based on a full-time schedule.', 120000, 160000, 'YEAR'],
  ['PAY EQUITY $160,000 - $230,000', 160000, 230000, 'YEAR'],
  ['Starting salary/wage for this opportunity: $23.99 to $31.99 Compensation decisions will not be based on salary history.', 23.99, 31.99, 'HOUR'],
  ['The anticipated base salary range for this role is $121,000 - $194,000 (presented in good faith). In addition to base pay, employees may receive bonuses or commissions.', 121000, 194000, 'YEAR'],
  ['<p>Compensation Range:</p><p>$80,000 &ndash; $100,000</p><p>Pay Rate Type: Salary</p>', 80000, 100000, 'YEAR'],
  ['Compensation Range: $25 - $35 Pay Rate Type: Hourly', 25, 35, 'HOUR'],
  ['PAY EQUITY STATEMENT: $5,000 - $7,000 per month', 5000, 7000, 'MONTH'],
  ['Compensation Range: $1,000 - $1,500 Pay Frequency: Weekly', 1000, 1500, 'WEEK'],
  ['Compensation Range: $80 - $100 per hour', 80, 100, 'HOUR'],
  ['Base salary range for this role is $80K - $100K', 80000, 100000, 'YEAR'],
  ['Base salary range for this role is $80 - $100K', 80000, 100000, 'YEAR'],
  ['Base salary range for this role is $80,000 - $80,000', 80000, 80000, 'YEAR'],
] as const) test('employer pay disclosure: ' + text, () => {
  const result = salary({ source: 'workday', description: text })?.value
  assert.equal(result?.unitText, unit)
  if (low === high) assert.equal(result?.value, low)
  else { assert.equal(result?.minValue, low); assert.equal(result?.maxValue, high) }
})

const negativeDisclosures = [
  'Earning Potential: $100,000 - $300,000+ per year',
  'On-Target Earnings: $65,000 - $120,000 per year',
  'Top performers earn $200,000 annually.',
  'Commission only. Earning Potential: $100,000 - $300,000 per year',
  'Total compensation range: $100,000 - $300,000 per year',
  'Total earnings compensation range: $100,000 - $300,000 per year',
  'Estimated compensation range: $100,000 - $150,000',
  'Market average compensation range: $100,000 - $150,000',
  'CAD Compensation Range: $100,000 - $150,000',
  'Compensation Range: $100,000 - $150,000 CAD',
  'Compensation Range: $100,000 - $150,000 including commissions',
  'Compensation Range: $100,000 - $150,000 + bonus',
  'Compensation Range: $100,000 - $150,000 OTE',
  'On-target earnings Compensation Range: $100,000 - $150,000',
  'Up to Compensation Range: $100,000 - $150,000',
  'We invest $5,000 per employee per year in training.',
  'Compensation Range: $500 - $700',
  'Starting salary/wage for this opportunity: $500 - $700',
  'PAY EQUITY STATEMENT: $0 - $90,000',
  'Compensation Range: $100,000 - $80,000',
  'PAY EQUITY: $800,000 - $900,000',
  'Starting salary/wage for this opportunity: $1 - $2',
  'Base salary range for this role is $100,000 - $150,000 or $160,000 - $200,000',
  'Compensation Range: $80,000 - $100,000. Compensation Range: $120,000 - $140,000.',
  'Salary history: $80,000 - $100,000',
  'Pay equity statement will be available after hiring. Training costs $5,000 per year.',
  'Compensation Range: EUR 80,000 - 100,000',
  'Earning Potential: $80,000 - $100,000. This is not a guaranteed base salary.',
  'Annual sales targets: $100,000 - $150,000',
  'Base salary range for this role is $100,000 - $150,000 in commission',
]
for (const text of negativeDisclosures) test('disclosure guard: ' + text, () => {
  assert.equal(salary({ source: 'workday', description: text }), undefined)
})

test('earning potential can coexist with a separately identified base salary', () => {
  const result = salary({ source: 'workday', description: 'Earning Potential: $100,000 - $300,000 per year. Base salary range for this role is $50,000 - $60,000. Additional commissions may apply.' })
  assert.equal(result?.value.minValue, 50000)
  assert.equal(result?.value.maxValue, 60000)
})

test('compensation disclosures for benefits and variable amounts are excluded', () => {
  for (const prefix of ['Bonus', 'Commission', 'Reimbursement', 'Per diem', 'Allowance', 'Sign-on']) {
    assert.equal(salary({ source: 'workday', description: `${prefix} compensation range: $80,000 - $100,000` }), undefined)
  }
})
