import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { DatabaseSync } from 'node:sqlite'
import { ProxyAgent } from 'undici'
import { createWaybackCloudStore } from '../../lib/wayback/cloudStorage.mjs'
import { createWebshareQuotaGuard } from '../../lib/wayback/webshareQuota.mjs'
import { createFleetUsageReceiver } from '../../lib/wayback/fleetQuotaClient.mjs'
import { proxyIdentity } from '../../lib/wayback/proxyPool.mjs'
import { loadWebshareProxyCatalog } from '../../lib/wayback/webshareProxyCatalog.mjs'
import { extendAssignments, collectorRampDecision, preferProxy } from '../../lib/wayback/parallelFleetPlan.mjs'
import { canResumeAfterDiskPause } from '../../lib/wayback/diskRecovery.mjs'
import { atomicJson } from '../../lib/wayback/core.mjs'

const project = path.resolve(import.meta.dirname, '../..')
const base = path.join(project, 'data/wayback-solar/raw-adaptive-blocks-20261003')
const control = path.join(project, '.tools/wayback-cloud')
const activeFile = path.join(control, 'proxies-active.txt')
const configFile = path.join(control, 'parallel-config.json')
const stopFile = path.join(control, 'fleet-stop.request')
const statusFile = path.join(control, 'fleet-status.json')
const quotaFile = path.join(control, 'fleet-quota.json')
const nodeConfigFile = process.env.WAYBACK_NODE_CONFIG ?? path.join(control, 'node-assignment.json')
const nodeConfig = fs.existsSync(nodeConfigFile) ? JSON.parse(fs.readFileSync(nodeConfigFile, 'utf8')) : null
const allLots = ['aws-2', 'aws-1', 'aws-4', 'aws-3', 'aws-5', 'aws-15', 'aws-6', 'aws-16', 'aws-7', 'aws-17',
  'aws-8', 'aws-18', 'aws-9', 'aws-19', 'aws-10', 'aws-20', 'aws-11', 'aws-21', 'aws-12', 'aws-22', 'aws-13', 'local', 'aws-14']
const lots = nodeConfig?.lots ?? allLots
if (!lots.length || new Set(lots).size !== lots.length || lots.some(lot => !allLots.includes(lot))) throw Error('Invalid node lot ownership')
const lock = new DatabaseSync(path.join(control, 'fleet-lock.sqlite'))
lock.exec('PRAGMA busy_timeout=0; CREATE TABLE IF NOT EXISTS owner(id INTEGER); BEGIN EXCLUSIVE')
const readJson = file => { try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch (error) { if (error.code === 'ENOENT') return null; throw error } }
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
const assignments = Object.fromEntries(lots.map(lot => [lot, []]))
const items = new Map(lots.map(lot => [lot, { lot, child: null, state: 'pending', failures: 0, restartAt: 0 }]))
let catalog, roster = [], collectors = nodeConfig?.collectors ?? 25, triager = null, stopping = false, triageClosing = false
let nodeObservedBytes = 0
let quota = null, quotaTimer = null, quotaWrite = Promise.resolve()
let nextRampAt = null, lastWindow = null, baseline = { responses: 0, rateLimited: 0, transportFailures: 0 }
const totals = { responses: 0, rateLimited: 0, transportFailures: 0 }
const replacements = [], quarantine = new Map(), slotStats = new Map()
const everSelected = new Set()
process.on('SIGINT', () => { stopping = true })
process.on('SIGTERM', () => { stopping = true })
const delta = () => {
  const out = Object.fromEntries(Object.entries(totals).map(([key, value]) => [key, value - baseline[key]]))
  return { ...out, fraction: out.responses ? out.rateLimited / out.responses : null,
    transportFraction: out.responses + out.transportFailures ? out.transportFailures / (out.responses + out.transportFailures) : null }
}
function logged(args, name, output, env = process.env) {
  fs.mkdirSync(output, { recursive: true })
  const out = fs.openSync(path.join(output, `${name}.stdout.log`), 'a')
  const err = fs.openSync(path.join(output, `${name}.stderr.log`), 'a')
  try { return spawn(process.execPath, ['--no-warnings', ...args], { cwd: project, env,
    stdio: ['ignore', out, err, 'ipc'], windowsHide: true }) }
  finally { fs.closeSync(out); fs.closeSync(err) }
}
function send(child, message) { if (child?.connected) child.send(message, () => {}) }
function quotaSnapshot() {
  const current = quota.status()
  const accountedBytes = current.estimatedBytes
  // Reserve for IPC lag, in-flight responses and traffic not observed in body streams.
  const reserveBytes = 1_000_000_000
  return { ...current, updatedAt: new Date().toISOString(), supervisorPid: process.pid, accountedBytes, reserveBytes,
    deploymentId: nodeConfig?.deploymentId ?? null, nodeObservedBytes,
    nodeBudgetBytes: nodeConfig?.budgetMode === 'provider' ? null : nodeConfig?.budgetBytes ?? null,
    budgetMode: nodeConfig?.budgetMode ?? 'node_envelope',
    estimatedBytes: accountedBytes + reserveBytes,
    pauseReason: current.pauseReason ?? (accountedBytes + reserveBytes >= current.stopAtBytes ? 'budget_threshold'
      : nodeConfig?.budgetMode !== 'provider' && nodeConfig?.budgetBytes && nodeObservedBytes * 2 + reserveBytes >= nodeConfig.budgetBytes ? 'node_budget_threshold' : null) }
}
async function publishQuota() {
  const snapshot = quotaSnapshot()
  if (snapshot.pauseReason) stopping = true
  await atomicJson(quotaFile, snapshot)
}

async function publish() {
  const temp = `${activeFile}.${process.pid}.tmp`
  fs.writeFileSync(temp, roster.map(proxy => proxy.url).join('\n') + '\n', { mode: 0o600 })
  fs.renameSync(temp, activeFile)
  await atomicJson(configFile, { assignments, collectors })
}
function onResult(message) {
  if (message.type !== 'proxy_result') return
  const proxy = roster[message.slot]
  if (!proxy || message.identity !== proxyIdentity(proxy.url)) return
  const stats = slotStats.get(message.slot) ?? { responses: 0, rateLimited: 0, failures: 0, consecutiveFailures: 0, since: Date.now() }
  if (message.status == null) {
    totals.transportFailures++; stats.failures++; stats.consecutiveFailures++
    stats.lastError = message.error
  } else {
    totals.responses++; stats.responses++; stats.consecutiveFailures = 0
    if (message.status === 429) { totals.rateLimited++; stats.rateLimited++ }
  }
  slotStats.set(message.slot, stats)
}
function startCollector(item) {
  const output = path.join(base, 'cloud-runs', item.lot)
  item.state = 'running'; item.restartAt = 0
  const startedAt = Date.now()
  item.child = logged(['scripts/wayback/run-raw-archive-lot.mjs', '--manifest', path.join(base, `${item.lot}.json`),
    '--rules', path.join(base, 'ats-tenant-rules.json'), '--output', output, '--cloud', '--proxy', '--spool',
    '--parallel-config', configFile, '--min-free-gb', String(nodeConfig?.minFreeGb ?? 20)], 'cloud-worker', output,
    { ...process.env, WAYBACK_REMOTE_TRIAGE: nodeConfig?.remoteTriage ? '1' : '0', WAYBACK_PROXY_URLS_FILE: activeFile, WAYBACK_MANAGED_PROXY_SLOTS: '1', WAYBACK_FLEET_QUOTA_FILE: quotaFile })
  fs.writeFileSync(path.join(output, 'cloud-worker.pid'), String(item.child.pid) + '\n')
  const receiveUsage = createFleetUsageReceiver(bytes => { quota.observe(bytes); nodeObservedBytes += bytes })
  item.child.on('message', message => {
    if (message.type === 'quota_usage') {
      receiveUsage(message)
    } else onResult(message)
  })
  item.child.on('exit', (code, signal) => {
    item.child = null; item.exit = { code, signal, at: new Date().toISOString() }
    const report = readJson(path.join(output, 'report.json'))
    if (stopping) item.state = 'stopped'
    else if (report?.complete || report?.finished) { item.state = report.complete ? 'complete' : 'finished_with_errors'; send(triager, { type: 'producer_done', lot: item.lot }) }
    else if (report?.state === 'paused_disk_space') { item.state = 'waiting_disk_space'; item.restartAt = Date.now() + 30000 }
    else if (report?.state === 'paused_proxy_budget') { item.state = report.state; stopping = true }
    else {
      item.failures = Date.now()-startedAt>=600000 ? 1 : item.failures+1
      item.state = item.failures < 4 ? 'retry_wait' : 'failed'
      item.restartAt = Date.now() + 60000
      if (item.state === 'failed') send(triager, { type: 'producer_done', lot: item.lot })
    }
  })
}
async function probe(proxy) {
  const agent = new ProxyAgent(proxy.url)
  try {
    const r = await fetch('https://web.archive.org/', { dispatcher: agent, signal: AbortSignal.timeout(10000) })
    const ok = r.status >= 200 && r.status < 400
    await r.body?.cancel()
    return ok
  } catch { return false }
  finally { await agent.destroy() }
}
async function selectUnused(count) {
  const chosen = []
  const candidates = [...catalog.entries].sort(preferProxy)
  for (const proxy of candidates) {
    if (everSelected.has(proxy.id) || chosen.some(p => p.id === proxy.id) || (quarantine.get(proxy.id) ?? 0) > Date.now()) continue
    if (!await probe(proxy)) { quarantine.set(proxy.id, Date.now() + 1800000); continue }
    chosen.push(proxy)
    if (chosen.length === count) return chosen
  }
  return chosen
}
async function replaceBadSlots() {
  let changed = false, count = 0
  for (const [slot, stats] of slotStats) {
    // 429s retain the current IP and its own Retry-After cooldown. Only transport failures trigger replacement.
    if (stats.rateLimited || stats.responses + stats.failures < 10 ||
      (stats.consecutiveFailures < 3 && stats.failures / (stats.responses + stats.failures) < 0.5)) continue
    const replacement = (await selectUnused(1))[0]
    if (!replacement) break
    const old = roster[slot]
    quarantine.set(old.id, Date.now() + 1800000)
    roster[slot] = replacement; everSelected.add(replacement.id); slotStats.delete(slot)
    replacements.push({ at: new Date().toISOString(), slot, oldId: old.id, oldCountry: old.country,
      newId: replacement.id, newCountry: replacement.country, failures: stats.failures, responses: stats.responses })
    changed = true
    if (++count >= 2) break
  }
  if (changed) await publish()
}
async function report(state = 'running') {
  const countries = {}
  for (const p of roster) countries[p.country] = (countries[p.country] ?? 0) + 1
  await atomicJson(statusFile, { updatedAt: new Date().toISOString(), pid: process.pid, state,
    deploymentId: nodeConfig?.deploymentId ?? null, nodeId: nodeConfig?.id ?? 'pc',
    collectors, activeIPs: roster.length, availableIPs: catalog?.entries.length ?? 0, countries,
    activeLots: [...items.values()].filter(item => item.child).length, queuedLots: 0,
    triagePid: triager?.pid ?? null, nextRampAt: nextRampAt ? new Date(nextRampAt).toISOString() : null,
    totals, proxyQuota: quota ? quotaSnapshot() : null, currentWindow: delta(), lastWindow, replacements: replacements.slice(-100),
    proxyHealth: roster.map((p, slot) => ({ slot, id: p.id, country: p.country, ...(slotStats.get(slot) ?? {}) })),
    lots: Object.fromEntries([...items.values()].map(item => {
      const root = path.join(base, 'cloud-runs', item.lot)
      const r = readJson(path.join(root, 'report.json'))
      return [item.lot, { state: item.state, collectorPid: item.child?.pid ?? null, triagePid: triager?.pid ?? null,
        downloadLanes: assignments[item.lot].length, exit: item.exit ?? null,
        report: r ? { updatedAt: r.updatedAt, state: r.state, requests: r.requests, waybackResponses: r.waybackResponses,
          http429Responses: r.http429Responses, completedPartitions: r.completedPartitions,
          plannedPartitions: r.plannedPartitions, captures: r.captures, spool: r.spool } : null }]
    })) })
}

async function main() {
  await createWaybackCloudStore().checkBucket()
  quota = createWebshareQuotaGuard(process.env, fetch, { allowCachedUsage: true })
  const savedQuota = readJson(quotaFile)
  if (!nodeConfig || savedQuota?.deploymentId === nodeConfig.deploymentId) {
    quota.restore(savedQuota ? { ...savedQuota, estimatedBytes: savedQuota.accountedBytes ?? savedQuota.estimatedBytes } : null)
    nodeObservedBytes = savedQuota?.nodeObservedBytes ?? 0
  }
  try { await quota.refresh() } catch (error) { console.error(JSON.stringify({ event: 'quota_api_unavailable', error: String(error) })) }
  quota.check()
  await publishQuota()
  if (stopping) throw Error('Webshare budget threshold reached')
  quota.startPolling()
  quotaTimer = setInterval(() => {
    quotaWrite = quotaWrite.then(publishQuota).catch(error => {
      stopping = true; console.error(JSON.stringify({ event: 'quota_checkpoint_failure', error: String(error) }))
    })
  }, 1000)
  quotaTimer.unref()
  try { catalog = nodeConfig ? readJson(path.join(control, 'proxy-catalog.json')) : await loadWebshareProxyCatalog() }
  catch (error) {
    catalog = readJson(path.join(control, 'proxy-catalog.json'))
    if (!catalog?.entries?.length || catalog.planId !== quota.status().planId) throw error
    console.error(JSON.stringify({ event: 'proxy_catalog_cached', error: String(error) }))
  }
  if (nodeConfig) catalog = { ...catalog, entries: catalog.entries.filter(p => nodeConfig.proxyIds.includes(p.id)) }
  if (catalog.entries.length < collectors) throw Error('Not enough proxies for this node')
  const seen = new Set()
  for (const lot of lots) {
    const manifest = readJson(path.join(base, `${lot}.json`))
    if (!manifest || manifest.id !== lot) throw Error(`Missing manifest: ${lot}`)
    for (const part of manifest.partitions) { if (seen.has(part.id)) throw Error(`Duplicate partition: ${part.id}`); seen.add(part.id) }
    if (!fs.existsSync(path.join(base, 'cloud-runs', lot, 'checkpoint.sqlite'))) throw Error(`Missing checkpoint: ${lot}`)
  }
  const tested = readJson(path.join(control, 'proxy-country-probe.json'))
  const healthy = new Set(tested?.complete ? tested.results.filter(r => r.healthy).map(r => r.id) : [])
  if (!healthy.size) throw Error('Run probe-proxy-countries.mjs before starting')
  roster = nodeConfig ? nodeConfig.initialProxyIds.map(id => catalog.entries.find(p => p.id === id))
    : catalog.entries.filter(p => healthy.has(p.id)).sort(preferProxy).slice(0, 25)
  if (roster.length !== collectors || roster.some(p => !p) || new Set(roster.map(p => p.id)).size !== collectors) throw Error('Invalid verified node roster')
  const previous = readJson(statusFile)
  if (previous && (!nodeConfig || previous.deploymentId === nodeConfig.deploymentId) && ['stopped', 'failed'].includes(previous.state) && previous.collectors >= (nodeConfig ? 1 : 25) && previous.collectors <= Math.max(70, nodeConfig?.collectors ?? 70)) {
    const saved = previous.proxyHealth?.map(p => catalog.entries.find(entry => entry.id === p.id)) ?? []
    if (saved.length === previous.collectors && saved.every(Boolean) && new Set(saved.map(p => p.id)).size === saved.length) {
      roster = saved; collectors = saved.length
      for (const key of Object.keys(totals)) totals[key] = previous.totals?.[key] ?? 0
      baseline = Object.fromEntries(Object.keys(totals).map(key => [key, totals[key] - (previous.currentWindow?.[key] ?? 0)]))
      lastWindow = previous.lastWindow ?? null
      const savedRampAt = Date.parse(previous.nextRampAt)
      if (Number.isFinite(savedRampAt) && savedRampAt > Date.now()) nextRampAt = savedRampAt
      for (const change of previous.replacements ?? []) if (change.oldId) everSelected.add(change.oldId)
      replacements.push(...(previous.replacements ?? []))
    }
  }
  for (const p of catalog.entries) if (!healthy.has(p.id)) quarantine.set(p.id, Date.now() + 1800000)
  for (const p of roster) everSelected.add(p.id)
  extendAssignments(assignments, collectors, Math.max(70, nodeConfig?.collectors ?? 70))
  await publish()
  if (fs.existsSync(stopFile)) fs.unlinkSync(stopFile)
  fs.writeFileSync(path.join(control, 'fleet.pid'), String(process.pid) + '\n')
  if (nodeConfig) nextRampAt = null
  else nextRampAt ??= Date.now() + 3600000
  triager = logged(['scripts/wayback/triage-cloud-fleet.mjs', '--config', configFile], 'triage-fleet', control,
    { ...process.env, WAYBACK_REMOTE_TRIAGE: nodeConfig?.remoteTriage ? '1' : '0' })
  triager.on('message', message => {
    const item = items.get(message.lot)
    if (message.type === 'triage_failed' && item) { item.triageFailed = true; send(item.child, { type: 'stop' }) }
  })
  triager.on('exit', (code, signal) => { triager = null; if (!triageClosing) { stopping = true; console.error(JSON.stringify({ event: 'triage_fleet_exit', code, signal })) } })
  for (const item of items.values()) { startCollector(item); await sleep(500) }
  let nextHealthCheck = Date.now() + 60000
  while (true) {
    if (fs.existsSync(stopFile)) stopping = true
    if (stopping) for (const item of items.values()) send(item.child, { type: 'stop' })
    for (const item of items.values()) if (!stopping && item.state === 'waiting_disk_space' && Date.now() >= item.restartAt) {
      const disk = fs.statfsSync(base)
      if (canResumeAfterDiskPause(Number(disk.bavail) * Number(disk.bsize), (nodeConfig?.minFreeGb ?? 20) * 1024 ** 3)) startCollector(item)
      else item.restartAt = Date.now() + 30000
    }
    for (const item of items.values()) if (!stopping && item.state === 'retry_wait' && Date.now() >= item.restartAt) {
      if (item.triageFailed) { send(triager, { type: 'start_lot', lot: item.lot }); item.triageFailed = false }
      startCollector(item)
    }
    if (!stopping && Date.now() >= nextHealthCheck) { await replaceBadSlots(); nextHealthCheck = Date.now() + 60000 }
    if (!stopping && nextRampAt !== null && Date.now() >= nextRampAt) {
      const window = delta()
      let decision = collectorRampDecision(window, collectors)
      if (decision === 'increase') {
        const count = Math.min(10, 70 - collectors)
        const extra = await selectUnused(count)
        if (extra.length === count) {
          roster.push(...extra); for (const p of extra) everSelected.add(p.id)
          collectors += count; extendAssignments(assignments, collectors); await publish()
          decision = `increase_${count}`
        } else decision = 'hold_insufficient_healthy_proxies'
      }
      lastWindow = { endedAt: new Date().toISOString(), ...window, decision }
      baseline = { ...totals }; nextRampAt = Date.now() + 3600000
    }
    if (![...items.values()].some(item => item.child || (!stopping && ['retry_wait', 'waiting_disk_space'].includes(item.state)))) {
      if (!triageClosing) { triageClosing = true; send(triager, { type: 'producer_done' }) }
      if (!triager) break
    }
    await report(stopping ? 'stopping' : 'running')
    await sleep(5000)
  }
  await report(stopping ? 'stopped' : 'finished')
}
try { await main() }
catch (error) {
  stopping = true
  for (const item of items.values()) send(item.child, { type: 'stop' })
  // Drain collectors before allowing triage to finalize the checkpoint.
  while ([...items.values()].some(item => item.child)) await sleep(1000)
  triageClosing = true; send(triager, { type: 'producer_done' })
  while (triager) await sleep(1000)
  await report('failed').catch(() => {})
  console.error(JSON.stringify({ event: 'fleet_failure', error: String(error) })); process.exitCode = 1
} finally {
  clearInterval(quotaTimer); quota?.stopPolling()
  await quotaWrite
  if (quota) await publishQuota().catch(() => {})
  lock.exec('ROLLBACK'); lock.close()
}
