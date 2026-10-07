import assert from 'node:assert/strict'
import { load } from 'cheerio'
import { writeFileSync, readFileSync } from 'node:fs'
const origin = process.argv[2]
assert.ok(origin, 'Usage: node --import tsx scripts/check-canonical-job-urls.mts http://localhost:3107 [result.json] [db-snapshot.json]')
const observations: unknown[] = []
async function request(path: string, expected: number, method = 'GET', location?: string) {
  const response = await fetch(new URL(path, origin), { method, redirect: 'manual', signal: AbortSignal.timeout(120_000) })
  observations.push({ path, method, status: response.status, location: response.headers.get('location') })
  assert.equal(response.status, expected, `${method} ${path}`)
  if (location) assert.equal(new URL(response.headers.get('location')!, origin).pathname, location)
  return method === 'HEAD' ? '' : await response.text()
}
async function main() {
  const xml = await request('/sitemap.xml', 200)
  const sitemap = load(xml, { xml: true })
  const urls = sitemap('loc').map((_, el) => sitemap(el).text()).get()
  assert.ok(urls.length)
  for (const value of urls) {
    const url = new URL(value)
    assert.equal(url.origin, 'https://solarroles.com')
    assert.equal(url.search, '')
    assert.ok(!url.pathname.endsWith('/go'))
    if (url.pathname.startsWith('/jobs/')) assert.match(url.pathname, /^\/jobs\/[^/]+\/[^/]+$/)
  }
  const jobs = urls.filter(url => new URL(url).pathname.startsWith('/jobs/')).slice(0, 3)
  assert.equal(jobs.length, 3)
  const sample = [...new Set([urls[0], ...jobs, ...urls.filter(url => !new URL(url).pathname.startsWith('/jobs/')).filter((_, i) => i % 10 === 0)])]
  for (const url of sample) await request(new URL(url).pathname, 200)
  for (const url of jobs) {
    const path = new URL(url).pathname, short = path.split('/').slice(0, 3).join('/')
    const html = await request(path, 200), $ = load(html)
    assert.equal($('link[rel=canonical]').attr('href'), url)
    assert.equal($('meta[property="og:url"]').attr('content'), url)
    assert.equal($('meta[http-equiv=refresh]').length, 0)
    const schemas = $('script[type="application/ld+json"]').map((_, el) => JSON.parse($(el).text())).get()
    const posting = schemas.find(schema => schema['@type'] === 'JobPosting')
    assert.equal(posting?.url, url)
    function checkSchemaLinks(value: unknown): void {
      if (typeof value === 'string' && /^https?:\/\/(?:www\.)?solarroles\.com(?:\/|$)/.test(value)) {
        assert.equal(new URL(value).origin, 'https://solarroles.com', value)
      } else if (Array.isArray(value)) value.forEach(checkSchemaLinks)
      else if (value && typeof value === 'object') Object.values(value).forEach(checkSchemaLinks)
    }
    schemas.forEach(checkSchemaLinks)
    assert.ok($('h1').length)
    assert.ok(!html.includes('www.solarroles.com'))
    for (const method of ['GET', 'HEAD']) for (const variant of [short, short + '/old-slug', short + '?from=/jobs', path + '?from=/jobs']) await request(variant, 308, method, path)
    await request(path, 200, 'HEAD')
    const go = await fetch(new URL(short + '/go', origin), { method: 'HEAD', redirect: 'manual' })
    assert.equal(go.status, 307)
    assert.equal(go.headers.get('x-robots-tag'), 'noindex, nofollow')
    assert.ok($(`a[href="${short}/go"]`).attr('rel')?.includes('nofollow'))
    assert.equal($(`a[href="${short}/go"]`).attr('target'), '_blank')
  }
  for (const path of ['/jobs/seo-test-missing-20261007', '/jobs/seo-test-missing-20261007/old-slug', '/sitemap-index.xml', '/sitemap/1.xml', '/sitemap/24.xml']) for (const method of ['GET', 'HEAD']) await request(path, 404, method)
  if (process.argv[4]) {
    const snapshot = JSON.parse(readFileSync(process.argv[4], 'utf8'))
    for (const job of [snapshot.inactive, snapshot.expired].filter(Boolean)) {
      const short = `/jobs/${job.id}`
      for (const method of ['GET', 'HEAD']) for (const path of [short, `${short}/${job.canonicalSlug || 'old-slug'}`]) await request(path, 404, method)
    }
  }
  const robots = await request('/robots.txt', 200)
  assert.ok(robots.includes('Sitemap: https://solarroles.com/sitemap.xml'))
  for (const path of ['/', '/jobs', '/jobs?what=solar&where=Texas', '/solar-pv-installer-jobs', '/embed/solar-jobs', '/data/remote-solar-jobs-travel-requirements']) {
    const html = await request(path, 200), $ = load(html)
    assert.ok(!html.includes('www.solarroles.com'), `www in HTML ${path}`)
    for (const el of $('a[href]').toArray()) {
      const href = $(el).attr('href')!
      const url = new URL(href, 'https://solarroles.com')
      if (url.hostname !== 'solarroles.com' || !url.pathname.startsWith('/jobs/')) continue
      assert.ok(!url.searchParams.has('from'), href)
      assert.ok(!/^\/jobs\/[^/]+\/?$/.test(url.pathname), href)
    }
  }
  const result = { at: new Date().toISOString(), origin, sitemapUrls: urls.length, sitemapJobs: urls.filter(url => new URL(url).pathname.startsWith('/jobs/')).length, structuralAnomalies: 0, sampledDirect200: sample.length, observations }
  if (process.argv[3]) writeFileSync(process.argv[3], JSON.stringify(result, null, 2))
  console.log(JSON.stringify({ ...result, observations: undefined }, null, 2))
}
main().catch(error => { console.error(error); if (process.argv[3]) writeFileSync(process.argv[3], JSON.stringify({ error: String(error), observations }, null, 2)); process.exitCode = 1 })
