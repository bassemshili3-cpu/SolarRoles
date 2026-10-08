import fs from 'node:fs'

export class WebshareQuotaPause extends Error {
  constructor(reason) { super(reason); this.name = 'WebshareQuotaPause' }
}

/** The Webshare API is authoritative; local response bytes only bridge polling intervals. */
export function createWebshareQuotaGuard(env = process.env, fetchImpl = fetch, { allowCachedUsage = false } = {}) {
  const token = env.WAYBACK_API_KEY
  if (!token) throw Error('WAYBACK_API_KEY is required for proxied collection')
  const configuredFraction = env.WEBSHARE_STOP_FRACTION == null ? null : Number(env.WEBSHARE_STOP_FRACTION)
  if (configuredFraction != null && !(configuredFraction >= 0.1 && configuredFraction <= 0.95)) throw Error('Invalid WEBSHARE_STOP_FRACTION')
  const configuredPlanId = env.WEBSHARE_PLAN_ID ? Number(env.WEBSHARE_PLAN_ID) : null
  let planId = configuredPlanId
  let limitBytes = 0, officialBytes = 0, localBytes = 0, localAtPoll = 0
  let checkedAt = 0, failure = null, transientFailure = false, refreshPromise = null, timer = null
  let estimateFloor = 0, polling = false, failedPolls = 0, nextPollAt = null
  const get = async url => {
    const response = await fetchImpl(url, { headers: { Authorization: `Token ${token}` }, signal: AbortSignal.timeout(15000) })
    if (!response.ok) {
      const error = Error(`Webshare API HTTP ${response.status}`)
      error.transient = response.status === 429 || response.status >= 500
      throw error
    }
    return response.json()
  }
  async function refresh() {
    if (refreshPromise) return refreshPromise
    refreshPromise = (async () => {
      try {
        const localAtStart = localBytes
        const previousEstimate = status().estimatedBytes
        const recovering = Boolean(failure)
        let nextLimit
        if (!configuredPlanId) {
          const plans = await get('https://proxy.webshare.io/api/v2/subscription/plan/')
          const active = (plans.results ?? []).filter(plan => plan.status === 'active')
          if (active.length !== 1) throw Error('Expected exactly one active Webshare plan; set WEBSHARE_PLAN_ID')
          planId = active[0].id
          nextLimit = Math.floor(Number(active[0].bandwidth_limit) * 1e9)
        } else {
          const plan = await get(`https://proxy.webshare.io/api/v2/subscription/plan/${planId}/`)
          if (plan.status !== 'active') throw Error('Webshare plan is not active')
          nextLimit = Math.floor(Number(plan.bandwidth_limit) * 1e9)
        }
        if (!(nextLimit > 0)) throw Error('Webshare plan has no finite positive quota; configure a plan-specific cap')
        const stats = await get(`https://proxy.webshare.io/api/v2/stats/aggregate/?plan_id=${planId}`)
        const used = Number(stats.bandwidth_total)
        if (!Number.isFinite(used) || used < 0) throw Error('Webshare returned invalid bandwidth usage')
        officialBytes = used
        limitBytes = nextLimit
        if (allowCachedUsage && recovering) estimateFloor = Math.max(estimateFloor, previousEstimate)
        localAtPoll = localAtStart
        checkedAt = Date.now()
        failure = null
        transientFailure = false
        return status()
      } catch (error) {
        failure = String(error)
        transientFailure = error.transient === true || ['TimeoutError', 'AbortError'].includes(error.name) || error instanceof TypeError
        throw error
      }
    })().finally(() => { refreshPromise = null })
    return refreshPromise
  }
  function status() {
    const estimatedBytes = Math.max(estimateFloor, officialBytes) + Math.max(0, localBytes - localAtPoll) * 2
    const fraction = configuredFraction ?? (limitBytes >= 100e9 ? 0.95 : 0.8)
    return { planId, limitBytes, officialBytes, estimatedBytes,
      stopFraction: fraction, stopAtBytes: Math.floor(limitBytes * fraction), checkedAt: checkedAt ? new Date(checkedAt).toISOString() : null,
      refreshError: failure,
      trackingMode: failure || Date.now() - checkedAt > 120000 ? 'local_estimate' : 'api', nextPollAt,
      pauseReason: !checkedAt ? 'uninitialized'
        : !allowCachedUsage && failure && (!transientFailure || Date.now() - checkedAt > 120000) ? failure
        : !allowCachedUsage && Date.now() - checkedAt > 120000 ? 'usage_stale'
        : estimatedBytes >= limitBytes * fraction ? 'budget_threshold' : null }
  }
  function check() {
    const current = status()
    if (failure && (!checkedAt || (!allowCachedUsage && !transientFailure))) throw new WebshareQuotaPause(`Webshare usage refresh failed: ${failure}`)
    if (!checkedAt || (!allowCachedUsage && Date.now() - checkedAt > 120000)) throw new WebshareQuotaPause('Webshare usage is stale')
    if (current.estimatedBytes >= current.stopAtBytes) throw new WebshareQuotaPause('Webshare budget threshold reached')
  }
  function observe(bytes) { if (Number.isFinite(bytes) && bytes > 0) localBytes += bytes }
  function startPolling() {
    if (polling) return
    polling = true
    const schedule = () => {
      if (!polling) return
      const delay = Math.min(300000, 30000 * 2 ** Math.min(failedPolls, 4))
      nextPollAt = new Date(Date.now() + delay).toISOString()
      timer = setTimeout(async () => {
        try { await refresh(); failedPolls = 0 } catch { failedPolls++ }
        schedule()
      }, delay)
      timer.unref()
    }
    schedule()
  }
  function stopPolling() { polling = false; if (timer) clearTimeout(timer); timer = null; nextPollAt = null }
  function restore(saved) {
    if (!allowCachedUsage || !saved || !Number.isFinite(saved.limitBytes) || !(saved.limitBytes > 0)
      || !Number.isFinite(saved.officialBytes) || saved.officialBytes < 0 || !Number.isFinite(saved.estimatedBytes)
      || saved.estimatedBytes < 0 || !Number.isFinite(Date.parse(saved.checkedAt))) return false
    planId = saved.planId; limitBytes = saved.limitBytes; officialBytes = saved.officialBytes
    estimateFloor = saved.estimatedBytes; checkedAt = Date.parse(saved.checkedAt)
    return true
  }
  function writeStatus(file) { fs.writeFileSync(file, JSON.stringify(status()) + '\n') }
  return { refresh, check, observe, status, startPolling, stopPolling, writeStatus, restore }
}
