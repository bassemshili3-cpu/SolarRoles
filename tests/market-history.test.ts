import assert from 'node:assert/strict'

import {
  compareHistory,
  findComparisonPoint,
  mergeCurrentHistoryPoint,
  observedDayCount,
  pointsForPeriod,
  splitHistorySegments,
  type MarketHistoryPoint,
} from '../lib/marketHistory'

const history: MarketHistoryPoint[] = [
  { date: '2026-08-20', value: 20, numerator: 20, denominator: 100 },
  { date: '2026-09-12', value: 25, numerator: 30, denominator: 120 },
  { date: '2026-09-18', value: 29, numerator: 58, denominator: 200 },
]

const merged = mergeCurrentHistoryPoint(
  history,
  { value: 30, numerator: 90, denominator: 300 },
  '2026-09-19T14:00:00.000Z',
)
assert.equal(merged.length, 4)
assert.deepEqual(merged.at(-1), { date: '2026-09-19', value: 30, numerator: 90, denominator: 300 })

const replaced = mergeCurrentHistoryPoint(merged, { value: 31 }, '2026-09-19')
assert.equal(replaced.length, 4)
assert.deepEqual(replaced.at(-1), { date: '2026-09-19', value: 31 })

assert.deepEqual(pointsForPeriod(merged, 7, '2026-09-19').map((point) => point.date), [
  '2026-09-12',
  '2026-09-18',
  '2026-09-19',
])
assert.equal(findComparisonPoint(merged, 7, '2026-09-19')?.date, '2026-09-12')
assert.equal(findComparisonPoint(merged, 30, '2026-09-19')?.date, '2026-08-20')
assert.equal(findComparisonPoint(history.slice(1), 30, '2026-09-19'), null)

const rateChange = compareHistory(30, merged, 7, '2026-09-19', 'percentage-points')
assert.equal(rateChange?.delta, 5)
assert.equal(rateChange?.point.denominator, 120)

const relativeChange = compareHistory(30, merged, 7, '2026-09-19', 'relative-percent')
assert.equal(relativeChange?.delta, 20)
assert.equal(compareHistory(10, [{ date: '2026-09-12', value: 0 }], 7, '2026-09-19', 'relative-percent'), null)

const absoluteChange = compareHistory(30, merged, 7, '2026-09-19', 'absolute')
assert.equal(absoluteChange?.delta, 5)
assert.equal(compareHistory(null, merged, 7, '2026-09-19', 'absolute'), null)

assert.equal(observedDayCount(merged, 7, '2026-09-19'), 3)
assert.deepEqual(splitHistorySegments(merged).map((segment) => segment.map((point) => point.date)), [
  ['2026-08-20'],
  ['2026-09-12'],
  ['2026-09-18', '2026-09-19'],
])

console.log('market history tests passed')
