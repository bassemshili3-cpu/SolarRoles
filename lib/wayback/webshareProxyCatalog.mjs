import fs from 'node:fs'
import path from 'node:path'

export async function loadWebshareProxyCatalog(env = process.env, fetchImpl = fetch) {
  if (!env.WAYBACK_API_KEY) throw Error('WAYBACK_API_KEY is required')
  const base = 'https://proxy.webshare.io'
  const headers = { Authorization: `Token ${env.WAYBACK_API_KEY}` }
  const get = async url => {
    const response = await fetchImpl(url, { headers, signal: AbortSignal.timeout(20000) })
    if (!response.ok) throw Error(`Webshare API HTTP ${response.status}`)
    return response.json()
  }
  const plans = await get(`${base}/api/v2/subscription/plan/`)
  if (plans.next) throw Error('Webshare plans are paginated; plan selection is ambiguous')
  const active = (plans.results ?? []).filter(p => p.status === 'active')
  if (active.length !== 1) throw Error('Expected exactly one active Webshare plan')
  const plan = active[0]
  const proxies = []
  let next = `${base}/api/v2/proxy/list/?mode=direct&page_size=100&plan_id=${plan.id}`
  while (next) {
    const url = new URL(next, base)
    if (url.origin !== base || !url.pathname.startsWith('/api/v2/proxy/list/')) throw Error('Unsafe Webshare pagination URL')
    const page = await get(url.toString())
    proxies.push(...(page.results ?? []))
    next = page.next
    if (proxies.length > 10000) throw Error('Unexpected Webshare proxy-list size')
  }
  const seen = new Set()
  const urls = []
  const entries = []
  for (const proxy of proxies) {
    if (!proxy.valid || !proxy.proxy_address || !Number.isInteger(Number(proxy.port)) || !proxy.username || !proxy.password) continue
    const identity = `${proxy.proxy_address}:${proxy.port}`
    if (seen.has(identity)) continue
    seen.add(identity)
    const url = `http://${encodeURIComponent(proxy.username)}:${encodeURIComponent(proxy.password)}@${identity}`
    urls.push(url)
    entries.push({ id: proxy.id ?? identity, country: proxy.country_code ?? 'unknown', address: proxy.proxy_address, url })
  }
  return { planId: plan.id, planGB: Number(plan.bandwidth_limit), advertisedCount: Number(plan.proxy_count), urls, entries }
}

export function writeProxyFile(file, urls, count) {
  if (!Number.isSafeInteger(count) || count < 1 || count > urls.length) throw Error('Invalid active proxy count')
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').trim().split(/\r?\n/).filter(Boolean) : []
  const selected = urls.slice(0, count)
  if (current.length && selected.length >= current.length && current.some((value, i) => selected[i] !== value))
    throw Error('Active proxy list changed while workers may be running')
  const temp = `${file}.${process.pid}.tmp`
  fs.writeFileSync(temp, selected.join('\n') + '\n', { mode: 0o600 })
  fs.renameSync(temp, file)
}
