import test from 'node:test'
import assert from 'node:assert/strict'
import { extendAssignments, collectorRampDecision, preferProxy } from '../lib/wayback/parallelFleetPlan.mjs'

test('a configured reinforcement preserves unique lanes above the automatic ramp ceiling', () => {
  const assignments = Object.fromEntries(Array.from({ length: 6 }, (_, i) => [`lot-${i}`, []]))
  assert.throws(() => extendAssignments(assignments, 79), /Invalid collector target/)
  extendAssignments(assignments, 79, 79)
  assert.equal(new Set(Object.values(assignments).flat()).size, 79)
  assert.ok(Object.values(assignments).every(slots => slots.length >= 13 && slots.length <= 14))
  assert.throws(() => extendAssignments(assignments, 80, 79), /Invalid collector target/)
  assert.equal(collectorRampDecision({ responses: 1000, rateLimited: 0 }, 79), 'max_reached')
})

test('25 then 70 lanes have unique stable owners across 23 lot databases', () => {
  const assignments = Object.fromEntries(Array.from({ length: 23 }, (_, i) => [`lot-${i}`, []]))
  extendAssignments(assignments, 25)
  const initial = structuredClone(assignments)
  extendAssignments(assignments, 35)
  extendAssignments(assignments, 70)
  const slots = Object.values(assignments).flat()
  assert.equal(slots.length, 70)
  assert.equal(new Set(slots).size, 70)
  for (const lot of Object.keys(initial)) assert.deepEqual(assignments[lot].slice(0, initial[lot].length), initial[lot])
  assert.ok(Object.values(assignments).every(value => value.length >= 3 && value.length <= 4))
})
test('collector ramp measures transport failures as well as 429s', () => {
  assert.equal(collectorRampDecision({ responses: 1000, rateLimited: 0, transportFailures: 600 }, 25), 'hold_transport_errors')
  assert.equal(collectorRampDecision({ responses: 1000, rateLimited: 6, transportFailures: 0 }, 25), 'hold_429_rate')
  assert.equal(collectorRampDecision({ responses: 1000, rateLimited: 5, transportFailures: 50 }, 65), 'increase')
  assert.equal(collectorRampDecision({ responses: 1000, rateLimited: 0 }, 70), 'max_reached')
  assert.deepEqual(['US', 'GB', 'FR', 'DE'].map(country => ({ country })).sort(preferProxy).map(p => p.country), ['DE', 'FR', 'GB', 'US'])
})
