import test from 'node:test'
import assert from 'node:assert/strict'
import { buildJobPostingBaseSalary as salary } from '../lib/jobPostingSalary'

for (const [description, low, high, unit] of [
  ['Typical base compensation for the Superintendent role is between $90,000.00 - $160,000.00. In addition to the base salary, discretionary bonus compensation is available.', 90000, 160000, 'YEAR'],
  ['Anticipated base salary range: $87,000- $108,000. This position is bonus eligible.', 87000, 108000, 'YEAR'],
  ['Salary Range: $70,000 – $73,000', 70000, 73000, 'YEAR'],
  ['$152,527.00 - $221,165.00 Individual Compensation to be determined based on experience.', 152527, 221165, 'YEAR'],
  ['Salary: $110,000-$140,000', 110000, 140000, 'YEAR'],
  ['Anticipated base salary range:\\u00A0 $28.79\\u00A0- $35.99', 28.79, 35.99, 'HOUR'],
  ['Anticipated base salary range: $28.79 - $35.99 per hour', 28.79, 35.99, 'HOUR'],
  ['<p>Anticipated base salary range:</p><p>$87,000 &ndash; $108,000</p>', 87000, 108000, 'YEAR'],
  ['Salary range: $5,000 - $7,000 per month', 5000, 7000, 'MONTH'],
  ['Salary range: $90,000 - $90,000', 90000, 90000, 'YEAR'],
  ['Salary Range: $5,000 - $7,000 Salary Basis: Monthly', 5000, 7000, 'MONTH'],
] as const) test('additional employer formulation: ' + description, () => {
  const value = salary({ source: 'workday', description })?.value
  assert.equal(value?.unitText, unit)
  if (low === high) assert.equal(value?.value, low)
  else { assert.equal(value?.minValue, low); assert.equal(value?.maxValue, high) }
})

for (const label of ['32–38 USD/hour', '30–42 USD/hour', '32-38 USD/hr'])
  test('native employer salary label: ' + label, () => {
    const value = salary({ source: 'adp', salary: label, salary_min: 32, salary_max: 38, salaryPeriod: 'HOUR' })?.value
    assert.equal(value?.unitText, 'HOUR')
    assert.equal(value?.minValue, label.startsWith('30') ? 30 : 32)
    assert.equal(value?.maxValue, label.startsWith('30') ? 42 : 38)
  })

// Same classes of disclosure, with unsupported or misleading compensation.
const negatives = [
  'Estimated salary range: $80,000 - $100,000',
  'Market average salary: $80,000 - $100,000',
  'Previous salary: $80,000 - $100,000',
  'Prior salary: $80,000 - $100,000',
  'Former salary: $80,000 - $100,000',
  'Desired salary: $80,000 - $100,000',
  'Expected salary: $80,000 - $100,000',
  'Total salary range: $80,000 - $100,000',
  'OTE salary range: $80,000 - $100,000',
  'On-target earnings salary range: $80,000 - $100,000',
  'Earning potential salary range: $80,000 - $100,000',
  'Commission salary range: $80,000 - $100,000',
  'Bonus salary range: $80,000 - $100,000',
  'Allowance salary range: $80,000 - $100,000',
  'Reimbursement salary range: $80,000 - $100,000',
  'Salary range: $80,000 - $100,000 including commission',
  'Salary range: $80,000 - $100,000 OTE',
  'Salary range: $80,000 - $100,000 + bonus',
  'Up to Salary range: $80,000 - $100,000',
  'Salary range: $80,000 - $100,000 or $110,000 - $120,000',
  'Salary range: $100,000 - $80,000',
  'Salary range: $0 - $80,000',
  'Salary range: $800,000 - $900,000',
  'Salary range: $500 - $800',
  'CAD Salary range: $80,000 - $100,000',
  'Salary range: $80,000 - $100,000 CAD',
  'Anticipated base salary range: $500 - $800',
  '$80,000 - $100,000 reimbursement allowance',
  'We invest $5,000 per employee per year in training.',
  'Salary range: $80,000 - $100,000. Salary range: $120,000 - $140,000.',
]
for (const description of negatives) test('additional formulation guard: ' + description, () => {
  assert.equal(salary({ source: 'workday', description }), undefined)
})

test('native label requires a full match and explicit USD and frequency', () => {
  for (const label of ['32–38 USD', '32–38 CAD/hour', '32–38 USD/hour OTE', '32–38 USD/hour + bonus', '32–38 USD/hour or 40–45 USD/hour']) {
    assert.equal(salary({ source: 'adp', salary: label }), undefined)
  }
})

test('a conflicting native ATS range and salary disclosure require review', () => {
  assert.equal(salary({ source: 'adp', salary: '25.2–29.5 USD/hour',
    description: 'Compensation Package: Salary: $25.20 - $35.00. Night shift premium: $1 per hour.' }), undefined)
  assert.equal(salary({ source: 'adp', salary: '23.5–26 USD/hour',
    description: 'Salary: $23.50 - $26.00 /hr' })?.value.maxValue, 26)
})

test('multiple job levels and geographic bands are not reduced to the first amount', () => {
  for (const description of [
    'Pay Ranges by Job Level: Technician I ($54,000 - $77,000) Technician II ($62,000 - $88,000). Salary Range Across all U.S. Locations $54,000—$107,000 USD',
    'Annual compensation by state: Colorado $74,360 - $124,190. Minnesota $70,980 - $118,545.',
  ]) assert.equal(salary({ source: 'greenhouse', description }), undefined)
})

for (const [description, low, high, unit] of [
  ['The expected salary for this position, at commencement of employment, is between $28.50 and $34.21/per hour; however, base pay may vary.',28.5,34.21,'HOUR'],
  ['Pay Range USD $134,430.00 - USD $201,922.50 /Yr.',134430,201922.5,'YEAR'],
  ['Base Compensation: $110,760 - $165,000',110760,165000,'YEAR'],
  ['Hiring Salary Range of: $142,000 - $211,200',142000,211200,'YEAR'],
  ['Hiring Range: $93,450 - $140,150',93450,140150,'YEAR'],
  ['Salary hiring range: $54,480-$68,100',54480,68100,'YEAR'],
  ['Salary commensurate with experience $135,000 - $155,000, DOE',135000,155000,'YEAR'],
  ['This role offers a base salary of $100,000 – $135,000 (DOE).',100000,135000,'YEAR'],
  ['This position offers a base salary range of $70,000 - $85,000.',70000,85000,'YEAR'],
  ['Base salary ranges from $85,500 – $100,500 USD',85500,100500,'YEAR'],
  ['Pay: $87,500 - $162,500The pay listed is the salary range for this position.',87500,162500,'YEAR'],
] as const) test('further named disclosure: '+description,()=>{
  const result=salary({source:'workday',description})?.value
  assert.equal(result?.unitText,unit);assert.equal(result?.minValue,low);assert.equal(result?.maxValue,high)
})

test('fixed base is separate from a later commission sentence',()=>{
  assert.equal(salary({source:'bamboohr',salary:'Base salary is $75K. Commission is also given for each successful sale without cap'})?.value.value,75000)
  assert.equal(salary({source:'bamboohr',salary:'Base salary is $75K. Commission only.',compensationType:'COMMISSION_ONLY'}),undefined)
})

for(const description of [
  'Estimated Pay Range: $80,000 - $100,000',
  'Total Pay Range: $80,000 - $100,000',
  'OTE Pay Range: $80,000 - $100,000',
  'Commission Pay Range: $80,000 - $100,000',
  'Bonus Pay Range: $80,000 - $100,000',
  'Allowance Pay Range: $80,000 - $100,000',
  'Reimbursement Pay Range: $80,000 - $100,000',
  'Previous Base Compensation: $80,000 - $100,000',
  'Desired Base Compensation: $80,000 - $100,000',
  'Expected Hiring Range: $80,000 - $100,000',
  'Up to Hiring Range: $80,000 - $100,000',
  'Pay Range: $100,000 - $250,000+ per year (Project-Based Contract Rates)',
  'Pay Range: $80,000 - $100,000 CAD',
  'CAD Pay Range: $80,000 - $100,000',
  'Base Compensation: $0 - $100,000',
  'Base Compensation: $100,000 - $80,000',
  'Hiring Range: $500 - $700',
  'Hiring Range: $800,000 - $900,000',
  'Pay: $80,000 - $100,000',
  'Pay Range: $80,000 - $100,000 or $110,000 - $130,000',
  'Pay Range: $80,000 - $100,000 including bonus',
  'Pay Range: $80,000 - $100,000 + commission',
  'Pay Range: $80,000 - $100,000 OTE',
  'Earning potential Pay Range: $80,000 - $100,000',
  'Total compensation Base Compensation: $80,000 - $100,000',
  'Pay Range: $80,000 - $100,000. Pay Range: $120,000 - $140,000.',
  'The expected project budget is between $80,000 and $100,000 per year.',
  'Training expenses range between $80,000 and $100,000 per year.',
  'Salary history ranges from $80,000 to $100,000',
  'Base Compensation: EUR 80,000 - 100,000',
]) test('further disclosure guard: '+description,()=>assert.equal(salary({source:'workday',description}),undefined))

test('between is a range, never a fixed upper endpoint',()=>{
  const value=salary({source:'workday',description:'The expected salary for this position, at commencement of employment, is between $108,000 and $135,150/year; however, base pay may vary.'})?.value
  assert.equal(value?.value,undefined);assert.equal(value?.minValue,108000);assert.equal(value?.maxValue,135150)
})

test('market-data estimates are not promoted by a longer salary label',()=>{
  assert.equal(salary({source:'workday',description:'The salary range for this position is $50,000 - $65,000 per year, which reflects a good-faith estimate based on market data and internal equity.'}),undefined)
})
