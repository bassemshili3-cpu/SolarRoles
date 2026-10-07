import type { WhatJobsMetric } from './whatjobsMetrics'
import { whatJobsDestination } from './whatjobsDestination'

/** One measurement view per route visit; no cookies or persistent visitor ID. */
export function startWhatJobsTracking(pagePath: string): () => void {
  const viewId = crypto.randomUUID()
  const seen = new Set<string>()
  const timers = new Map<Element, ReturnType<typeof setTimeout>>()
  const visible = new Set<Element>()
  const observed = new Set<Element>()
  let queue: WhatJobsMetric[] = []
  let stopped = false
  const isTest = navigator.webdriver || new URLSearchParams(location.search).get('whatjobs_tracking_test') === '1'

  function metadata(element: Element) {
    const source = element.closest<HTMLElement>('[data-whatjobs-surface]')
    const surface = source?.dataset.whatjobsSurface
    if (surface !== 'feed' && surface !== 'job_box' && surface !== 'job_search') return null
    const destination = element instanceof HTMLAnchorElement ? element : element.querySelector<HTMLAnchorElement>('a[data-whatjobs-click]')
    const form = element instanceof HTMLFormElement ? element : null
    const info = whatJobsDestination(destination?.dataset.whatjobsDestination || destination?.href || form?.action || 'https://www.whatjobs.com/searchbox')
    if (!info) return null
    const publisher = info.publisher || form?.querySelector<HTMLInputElement>('input[name="utm_source"]')?.value || null
    return { surface, jobId: info.jobId, publisher, tokenPresent: (destination?.dataset.whatjobsToken || element.getAttribute('data-whatjobs-token')) === 'true' } as const
  }

  async function flush() {
    if (!queue.length) return
    const events = queue.splice(0, 40)
    try {
      const response = await fetch('/api/whatjobs/events', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }), keepalive: true, credentials: 'omit',
      })
      if (!response.ok && (response.status >= 500 || response.status === 429) && !stopped) queue = [...events, ...queue].slice(0, 120)
    } catch { if (!stopped) queue = [...events, ...queue].slice(0, 120) }
  }

  function emit(element: Element, type: WhatJobsMetric['type'], activation: WhatJobsMetric['activation'] = null) {
    const data = metadata(element)
    if (!data || (['click', 'job_impression'].includes(type) && !data.jobId)) return
    queue.push({ ...data, id: crypto.randomUUID(), viewId, type, pagePath,
      device: matchMedia('(min-width: 1024px)').matches ? 'desktop' : 'mobile', activation,
      pnpAvailable: typeof (window as Window & { pnpClick?: unknown }).pnpClick === 'function', isTest })
    queue = queue.slice(-120)
    if (activation) void flush()
  }

  function impression(element: Element) {
    const data = metadata(element)
    if (!data) return
    const widgetKey = `widget:${data.surface}`
    if (!seen.has(widgetKey)) { seen.add(widgetKey); emit(element, 'widget_impression') }
    if (element.getAttribute('data-whatjobs-impression') === 'job' && data.jobId) {
      const key = `${data.surface}:${data.publisher}:${data.jobId}`
      if (!seen.has(key)) { seen.add(key); emit(element, 'job_impression') }
    }
  }

  function schedule(element: Element) {
    if (timers.has(element) || document.visibilityState !== 'visible') return
    timers.set(element, setTimeout(() => {
      timers.delete(element)
      if (element.isConnected && visible.has(element) && document.visibilityState === 'visible') impression(element)
    }, 1000))
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) { visible.add(entry.target); schedule(entry.target) }
      else { visible.delete(entry.target); clearTimeout(timers.get(entry.target)); timers.delete(entry.target) }
    }
  }, { threshold: [0, 0.5] })
  function scan() {
    for (const element of observed) if (!element.isConnected) {
      observer.unobserve(element); observed.delete(element); visible.delete(element)
      clearTimeout(timers.get(element)); timers.delete(element)
    }
    document.querySelectorAll('[data-whatjobs-impression]').forEach(element => {
      if (!observed.has(element)) { observed.add(element); observer.observe(element) }
    })
  }
  scan()
  const mutations = new MutationObserver(scan)
  mutations.observe(document.body, { childList: true, subtree: true })

  function click(event: MouseEvent) {
    if (!event.isTrusted || (event.type === 'auxclick' ? event.button !== 1 : event.button !== 0)) return
    const element = (event.target as Element)?.closest?.('a[data-whatjobs-click]')
    if (!element) return
    const pointer = (event as PointerEvent).pointerType
    emit(element, 'click', event.button === 1 ? 'middle' : event.detail === 0 ? 'keyboard' : pointer === 'touch' ? 'touch' : 'mouse')
  }
  function submit(event: SubmitEvent) {
    if (event.isTrusted && event.target instanceof HTMLFormElement && event.target.matches('[data-whatjobs-search]')) emit(event.target, 'search_submit', 'submit')
  }
  function visibility() {
    if (document.visibilityState !== 'visible') {
      for (const timer of timers.values()) clearTimeout(timer)
      timers.clear(); void flush()
    } else for (const element of visible) schedule(element)
  }
  const interval = setInterval(() => { void flush() }, 1500)
  const leave = () => { void flush() }
  document.addEventListener('click', click, true)
  document.addEventListener('auxclick', click, true)
  document.addEventListener('submit', submit, true)
  document.addEventListener('visibilitychange', visibility)
  window.addEventListener('pagehide', leave)
  return () => {
    stopped = true; clearInterval(interval)
    for (const timer of timers.values()) clearTimeout(timer)
    observer.disconnect(); mutations.disconnect()
    document.removeEventListener('click', click, true); document.removeEventListener('auxclick', click, true)
    document.removeEventListener('submit', submit, true); document.removeEventListener('visibilitychange', visibility)
    window.removeEventListener('pagehide', leave); void flush()
  }
}
