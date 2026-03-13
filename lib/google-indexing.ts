// lib/google-indexing.ts
// ─── Google Indexing API — Authentification + envoi ──────────────────────────
//
// Utilise le compte de service Google Cloud pour notifier
// l'API d'indexation quand des offres sont publiées ou supprimées.
//
// Variables d'environnement requises (.env.local) :
//   GOOGLE_SERVICE_ACCOUNT_EMAIL=indexing-api@oh-my-job-indexing.iam.gserviceaccount.com
//   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
//
// ⚠️ Dans le .env.local, la clé privée doit garder les \n littéraux.
//     Le code ci-dessous les convertit automatiquement en vrais retours à la ligne.

import crypto from 'crypto'

const INDEXING_API_ENDPOINT = 'https://indexing.googleapis.com/v3/urlNotifications:publish'
const INDEXING_API_BATCH_ENDPOINT = 'https://indexing.googleapis.com/batch'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const SCOPE = 'https://www.googleapis.com/auth/indexing'

// ─── Cache du token (dure ~1h) ──────────────────────────────────────────────
let cachedToken: string | null = null
let tokenExpiresAt = 0

// ─── Génère un JWT signé pour le compte de service ──────────────────────────
function createSignedJwt(): string {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKeyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY

  if (!email || !privateKeyRaw) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')
  }

  // Convertir les \n littéraux en vrais retours à la ligne
  const privateKey = privateKeyRaw.replace(/\\n/g, '\n')

  const now = Math.floor(Date.now() / 1000)
  const expiry = now + 3600 // 1 heure

  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')

  const payload = Buffer.from(
    JSON.stringify({
      iss: email,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: expiry,
    })
  ).toString('base64url')

  const signInput = `${header}.${payload}`
  const signature = crypto.createSign('RSA-SHA256').update(signInput).sign(privateKey, 'base64url')

  return `${signInput}.${signature}`
}

// ─── Échange le JWT contre un access token ──────────────────────────────────
async function getAccessToken(): Promise<string> {
  // Retourne le token en cache s'il est encore valide (marge de 60s)
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken
  }

  const jwt = createSignedJwt()

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Google OAuth token error (${res.status}): ${err}`)
  }

  const data = await res.json()
  cachedToken = data.access_token
  tokenExpiresAt = Date.now() + data.expires_in * 1000

  return cachedToken!
}

// ─── Types ──────────────────────────────────────────────────────────────────
export type IndexingAction = 'URL_UPDATED' | 'URL_DELETED'

export interface IndexingResult {
  url: string
  action: IndexingAction
  success: boolean
  status?: number
  error?: string
}

// ─── Envoi unitaire ─────────────────────────────────────────────────────────
export async function notifyGoogle(
  url: string,
  action: IndexingAction
): Promise<IndexingResult> {
  try {
    const token = await getAccessToken()

    const res = await fetch(INDEXING_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url, type: action }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error(`❌ Indexing API error for ${url}:`, data)
      return { url, action, success: false, status: res.status, error: data.error?.message || 'Unknown error' }
    }

    console.log(`✅ ${action} → ${url} (status: ${res.status})`)
    return { url, action, success: true, status: res.status }
  } catch (err: any) {
    console.error(`💥 Exception notifying ${url}:`, err.message)
    return { url, action, success: false, error: err.message }
  }
}

// ─── Envoi par lot (max 100 par batch, max 200/jour) ────────────────────────
export async function notifyGoogleBatch(
  items: { url: string; action: IndexingAction }[]
): Promise<IndexingResult[]> {
  // Traiter séquentiellement par sécurité (évite les rate limits)
  // Pour un vrai batch HTTP multipart, voir la doc Google Batch API
  const results: IndexingResult[] = []

  for (const item of items) {
    const result = await notifyGoogle(item.url, item.action)
    results.push(result)

    // Petit délai entre chaque requête pour éviter le throttling
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  return results
}