// lib/indexnow.ts

const INDEXNOW_KEY = process.env.INDEXNOW_API_KEY!
const HOST = 'https://www.oh-my-job.com'
const KEY_LOCATION = `${HOST}/${INDEXNOW_KEY}.txt`
const MAX_URLS_PER_BATCH = 10000
const FETCH_TIMEOUT_MS = 15000 // 15s : largement suffisant pour un ping IndexNow, évite de manger le budget du cron

type BatchResult = { success: boolean; count: number; status?: number }

type BulkResult = {
  success: boolean
  submitted: number
  failed: number
  batches: number
}

async function submitBatch(urls: string[]): Promise<BatchResult> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: 'www.oh-my-job.com',
        key: INDEXNOW_KEY,
        keyLocation: KEY_LOCATION,
        urlList: urls,
      }),
      signal: controller.signal,
    })

    // 200 = OK, 202 = accepted (les deux sont bons)
    if (res.status === 200 || res.status === 202) {
      console.log(`✅ IndexNow: ${urls.length} URLs soumises`)
      return { success: true, count: urls.length }
    }

    console.error(`❌ IndexNow error: ${res.status} ${res.statusText}`)
    return { success: false, count: 0, status: res.status }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.error(`⏱️ IndexNow timeout après ${FETCH_TIMEOUT_MS}ms (${urls.length} URLs abandonnées)`)
    } else {
      console.error(`❌ IndexNow fetch error: ${err.message}`)
    }
    return { success: false, count: 0 }
  } finally {
    clearTimeout(timeoutId)
  }
}

// Découpe en lots de 10 000 (max IndexNow) et soumet séquentiellement,
// avec une pause entre chaque lot pour rester raisonnable côté rate limit.
// À utiliser pour les pings en masse (ex: refonte de template touchant
// toutes les pages job actives).
export async function submitAllToIndexNow(urls: string[]): Promise<BulkResult> {
  const batches: string[][] = []
  for (let i = 0; i < urls.length; i += MAX_URLS_PER_BATCH) {
    batches.push(urls.slice(i, i + MAX_URLS_PER_BATCH))
  }

  let totalSubmitted = 0
  let totalFailed = 0

  for (const [index, batch] of batches.entries()) {
    const result = await submitBatch(batch)
    if (result.success) {
      totalSubmitted += result.count
    } else {
      totalFailed += batch.length
    }

    // Pause entre les lots (sauf après le dernier)
    if (index < batches.length - 1) {
      await new Promise((r) => setTimeout(r, 1000))
    }
  }

  console.log(
    `✅ IndexNow batch complete: ${totalSubmitted} soumises, ${totalFailed} échouées, ${batches.length} lot(s)`
  )

  return {
    success: totalFailed === 0,
    submitted: totalSubmitted,
    failed: totalFailed,
    batches: batches.length,
  }
}

// Garde la même signature qu'avant : usage simple pour un petit nombre d'URLs
// (ex: ping ponctuel après publication d'un job unique ou d'une poignée de pages).
// Si on lui passe plus de 10 000 URLs, elle délègue automatiquement au batching.
export async function submitToIndexNow(urls: string[]): Promise<BatchResult | BulkResult> {
  if (urls.length <= MAX_URLS_PER_BATCH) {
    return submitBatch(urls)
  }
  return submitAllToIndexNow(urls)
}