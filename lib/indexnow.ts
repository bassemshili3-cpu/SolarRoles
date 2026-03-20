// lib/indexnow.ts

const INDEXNOW_KEY = process.env.INDEXNOW_API_KEY!
const HOST = 'https://www.oh-my-job.com'
const KEY_LOCATION = `${HOST}/${INDEXNOW_KEY}.txt`

export async function submitToIndexNow(urls: string[]) {
  // IndexNow accepte max 10 000 URLs par requête
  const batch = urls.slice(0, 10000)

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      host: 'www.oh-my-job.com',
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: batch,
    }),
  })

  // 200 = OK, 202 = accepted (les deux sont bons)
  if (res.status === 200 || res.status === 202) {
    console.log(`✅ IndexNow: ${batch.length} URLs soumises`)
    return { success: true, count: batch.length }
  }

  console.error(`❌ IndexNow error: ${res.status} ${res.statusText}`)
  return { success: false, status: res.status }
}