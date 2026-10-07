const assert = require('node:assert/strict')
const http = require('node:http')
const { transformSync } = require('esbuild')
const { readFileSync } = require('node:fs')
const { chromium } = require('playwright')

const source = readFileSync('lib/whatjobsDestination.ts', 'utf8') + '\n' + readFileSync('lib/whatjobsTrackingClient.ts', 'utf8').replace(/^import .*$/gm, '')
const js = transformSync(source, { loader: 'ts', format: 'iife', globalName: 'WhatJobsAudit', target: 'es2020' }).code
const events = new Map()
let unavailable = true
let attempts = 0
const html = `<!doctype html><body>
<article style="height:100px" data-whatjobs-surface="feed" data-whatjobs-impression="job">
 <a data-whatjobs-click data-whatjobs-token="false" href="https://www.whatjobs.com/pub_api__cpl__123__7186?utm_source=7186">Offer</a>
</article>
<form id="search" data-whatjobs-surface="job_search" data-whatjobs-impression="widget" data-whatjobs-search action="https://www.whatjobs.com/searchbox" method="post">
 <input type="hidden" name="utm_source" value="7186"><button>Search</button>
</form>
<form style="display:none" data-whatjobs-surface="job_search" data-whatjobs-impression="widget" data-whatjobs-search action="https://www.whatjobs.com/searchbox"><button>Hidden search</button></form>
<section data-whatjobs-surface="job_box" style="margin-top:2000px;height:150px">
 <div data-whatjobs-impression="job"><a data-whatjobs-click href="https://www.whatjobs.com/pub_api__cpl__456__7186">Related offer</a></div>
</section>
<script>${js}</script><script>
 document.addEventListener('click',e=>{if(e.target.closest('a'))e.preventDefault()});
 document.addEventListener('auxclick',e=>e.preventDefault());
 document.addEventListener('submit',e=>e.preventDefault());
 window.stopTracking=WhatJobsAudit.startWhatJobsTracking('/test');
</script></body>`
const server = http.createServer(async (req, res) => {
 if(req.url === '/api/whatjobs/events') {
  let text='';for await(const chunk of req) text+=chunk
  attempts++
  if(unavailable){unavailable=false;res.writeHead(503);res.end();return}
  for(const event of JSON.parse(text).events) events.set(event.id,event)
  res.writeHead(204);res.end();return
 }
 res.setHeader('Content-Type','text/html');res.end(html)
})
;(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
 const browser=await chromium.launch({headless:true})
 try {
  const page=await browser.newPage()
  const errors=[];page.on('pageerror',e=>errors.push(e.message))
  await page.goto(`http://127.0.0.1:${server.address().port}/?whatjobs_tracking_test=1`)
  await page.waitForTimeout(600)
  assert.equal(events.size,0,'no impression before one second')
  await page.waitForTimeout(2900)
  assert.equal([...events.values()].filter(e=>e.type==='widget_impression'&&e.surface==='feed').length,1)
  assert.equal([...events.values()].filter(e=>e.type==='job_impression'&&e.surface==='feed').length,1)
  assert.equal([...events.values()].filter(e=>e.surface==='job_search').length,1,'hidden search form must not add an impression')
  assert.equal([...events.values()].filter(e=>e.surface==='job_box').length,0,'offscreen offers are not impressions')
  assert.ok(attempts>=2,'503 batch must be retried')
  await page.locator('a').first().click()
  await page.locator('a').first().click({modifiers:['Control']})
  await page.locator('a').first().click({button:'middle'})
  await page.locator('a').first().focus();await page.keyboard.press('Enter')
  await page.locator('#search button').click()
  await page.waitForTimeout(500)
  assert.deepEqual([...events.values()].filter(e=>e.type==='click').map(e=>e.activation),['mouse','mouse','middle','keyboard'])
  assert.equal([...events.values()].filter(e=>e.type==='search_submit').length,1)
  await page.locator('section a').scrollIntoViewIfNeeded();await page.waitForTimeout(2800)
  assert.equal([...events.values()].filter(e=>e.type==='job_impression'&&e.surface==='job_box').length,1)
  await page.locator('a').first().scrollIntoViewIfNeeded();await page.waitForTimeout(2800)
  assert.equal([...events.values()].filter(e=>e.type==='job_impression'&&e.surface==='feed').length,1,'rescrolling does not count twice')
  assert.ok([...events.values()].every(e=>e.isTest),'automated traffic must be excluded from reports')
  assert.equal(errors.length,0)
  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true})
  const mp=await mobile.newPage();await mp.goto(`http://127.0.0.1:${server.address().port}/`)
  await mp.locator('a').first().tap();await mp.waitForTimeout(500)
  assert.ok([...events.values()].some(e=>e.type==='click'&&e.activation==='touch'&&e.device==='mobile'))
  await mobile.close()
  console.log('Browser checks passed: viewability, retry, hidden/offscreen exclusion, deduplication, mouse/Ctrl/middle/Enter/touch, search submit, test exclusion.')
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
})().catch(error=>{console.error(error);process.exitCode=1;server.close()})
