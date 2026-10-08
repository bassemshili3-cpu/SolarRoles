export function createBridgeLimiter(limit) {
 if (!Number.isSafeInteger(limit) || limit < 1) throw Error('Invalid bridge limit')
 let active = 0; const waiting = []
 const release = () => { const next = waiting.shift(); if (next) next(); else active-- }
 return { get active() { return active }, get waiting() { return waiting.length }, async run(task) {
  if (active >= limit) await new Promise(resolve => waiting.push(resolve))
  else active++
  try { return await task() } finally { release() }
 } }
}
export function createStageMetrics() {
 const stages = {}
 return { stages, async measure(name, task) {
  const s = stages[name] ??= {calls:0, failures:0, totalMs:0, maxMs:0}; const start=performance.now();s.calls++
  try { return await task() } catch(e) { s.failures++;throw e } finally { const ms=performance.now()-start;s.totalMs+=ms;s.maxMs=Math.max(s.maxMs,ms) }
 } }
}
