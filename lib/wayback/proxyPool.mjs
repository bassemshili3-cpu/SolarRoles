import fs from 'node:fs'
import { ProxyAgent } from 'undici'
import { createHash } from 'node:crypto'

export function proxyIdentity(value) {
  const url=new URL(value)
  return url.hostname==='p.webshare.io' ? `${url.host}#${createHash('sha256').update(url.username).digest('hex').slice(0,12)}` : url.host
}

export function createWaybackProxyPool(env = process.env) {
  const readConfigured = () => env.WAYBACK_PROXY_URLS_FILE
    ? fs.readFileSync(env.WAYBACK_PROXY_URLS_FILE, 'utf8').split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith('#'))
    : env.WAYBACK_PROXY_URL ? [env.WAYBACK_PROXY_URL] : []
  let configured = readConfigured()
  if (!configured.length) throw Error('WAYBACK_PROXY_URL or WAYBACK_PROXY_URLS_FILE is required')
  const createAgent = value => {
    const url = new URL(value)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') throw Error('Only HTTP(S) proxy URLs are supported')
    if (!url.hostname) throw Error('Proxy host required')
    return new ProxyAgent(url.toString())
  }
  const cached = new Map(configured.map(value => [value, createAgent(value)]))
  let agents = configured.map(value => cached.get(value))
  const offset = Number(env.WAYBACK_PROXY_OFFSET ?? 0)
  if (!Number.isSafeInteger(offset) || offset < 0) throw Error('Invalid WAYBACK_PROXY_OFFSET')
  let index = offset, lastRefresh = 0
  function refresh(force = false) {
    if (!env.WAYBACK_PROXY_URLS_FILE || (!force && Date.now() - lastRefresh < 5000)) return
    lastRefresh = Date.now()
    const updated = readConfigured()
    if (updated.length === configured.length && updated.every((value, i) => value === configured[i])) return
    if (!env.WAYBACK_MANAGED_PROXY_SLOTS && (updated.length < configured.length || configured.some((value, i) => updated[i] !== value)))
      throw Error('Proxy list must only grow while collectors are running')
    for (const value of updated) if (!cached.has(value)) cached.set(value, createAgent(value))
    agents = updated.map(value => cached.get(value))
    configured = updated
  }
  return {
    get count() { return agents.length },
    refresh,
    next() { refresh(); const agent = agents[index % agents.length]; index++; return agent },
    at(slot) { refresh(); if (!agents[slot]) throw Error('Unconfigured proxy slot'); return agents[slot] },
    identity(slot) { refresh(); if (!configured[slot]) throw Error('Unconfigured proxy slot'); return proxyIdentity(configured[slot]) },
    async close() { await Promise.all([...cached.values()].map(agent => agent.destroy(new Error('proxy pool closed')))) },
  }
}
