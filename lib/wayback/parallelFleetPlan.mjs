export function extendAssignments(assignments, target, maximum = 70) {
  const lots = Object.keys(assignments)
  if (!Number.isSafeInteger(maximum) || maximum < 1 || !lots.length || !Number.isInteger(target) || target < 1 || target > maximum) throw Error('Invalid collector target')
  const used = Object.values(assignments).flat()
  if (new Set(used).size !== used.length) throw Error('Proxy slot ownership overlaps')
  for (let slot = used.length; slot < target; slot++) {
    const lot = lots.reduce((best, candidate) => assignments[candidate].length < assignments[best].length ? candidate : best)
    assignments[lot].push(slot)
  }
  return assignments
}

export function collectorRampDecision({ responses, rateLimited, transportFailures = 0 }, collectors) {
  if (collectors >= 70) return 'max_reached'
  if (responses < 200) return 'hold_insufficient_responses'
  if (rateLimited / responses > 0.005) return 'hold_429_rate'
  if (transportFailures / (responses + transportFailures) > 0.1) return 'hold_transport_errors'
  return 'increase'
}

export function preferProxy(a, b) {
  const rank = country => ({ DE: 0, FR: 1, GB: 2, US: 4 }[country] ?? 3)
  return rank(a.country) - rank(b.country)
}
