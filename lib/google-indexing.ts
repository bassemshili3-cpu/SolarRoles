// lib/google-indexing.ts
// ─── Google Indexing API — Authentification + envoi (2 projets supportés) ────
//
// Support multi-projet : 2 comptes de service = 400 publish requests/jour
// Round-robin automatique entre les deux clés (aucun changement dans ton cron !)
//
// Variables d'environnement (.env.local) :
//   GOOGLE_SERVICE_ACCOUNT_EMAIL=...
//   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=...
//   GOOGLE_SERVICE_ACCOUNT_EMAIL_2=...          ← 2ème projet
//   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_2=...    ← 2ème projet
//
// Les clés privées doivent garder les \n littéraux.

import crypto from 'crypto'

const INDEXING_API_ENDPOINT = 'https://indexing.googleapis.com/v3/urlNotifications:publish'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const SCOPE = 'https://www.googleapis.com/auth/indexing'

// ─── Credentials multi-projets ──────────────────────────────────────────────
interface Credential {
  email: string
  privateKeyRaw: string
}

const credentials: Credential[] = []

// Projet 1 (obligatoire)
if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
  credentials.push({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKeyRaw: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
  })
}

// Projet 2 (pour doubler le quota)
if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL_2 && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_2) {
  credentials.push({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL_2,
    privateKeyRaw: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_2,
  })
}

if (credentials.length === 0) {
  throw new Error('❌ Aucune clé Google configurée. Vérifie GOOGLE_SERVICE_ACCOUNT_EMAIL et PRIVATE_KEY dans .env.local')
}

console.log(`🔑 Google Indexing : ${credentials.length} projet(s) actif(s) → quota total ${credentials.length * 200}/jour`)

// ─── Cache token par projet (chaque projet a son propre token) ───────────────
let cachedTokens: (string | null)[] = new Array(credentials.length).fill(null)
let tokenExpiresAt: number[] = new Array(credentials.length).fill(0)
let currentCredentialIndex = 0 // round-robin

// ─── Génère un JWT signé pour un credential spécifique ──────────────────────
function createSignedJwt(credIndex: number): string {
  const { email, privateKeyRaw } = credentials[credIndex]
  const privateKey = privateKeyRaw.replace(/\\n/g, '\n')

  const now = Math.floor(Date.now() / 1000)
  const expiry = now + 3600

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

// ─── Échange JWT → access token (par projet) ────────────────────────────────
async function getAccessToken(credIndex: number): Promise<string> {
  if (cachedTokens[credIndex] && Date.now() < tokenExpiresAt[credIndex] - 60_000) {
    return cachedTokens[credIndex]!
  }

  const jwt = createSignedJwt(credIndex)

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
    throw new Error(`Google OAuth error (projet ${credIndex}) : ${res.status} - ${err}`)
  }

  const data = await res.json()
  cachedTokens[credIndex] = data.access_token
  tokenExpiresAt[credIndex] = Date.now() + data.expires_in * 1000

  return cachedTokens[credIndex]!
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

// ─── Envoi unitaire (avec rotation automatique) ─────────────────────────────
export async function notifyGoogle(
  url: string,
  action: IndexingAction
): Promise<IndexingResult> {
  try {
    // Rotation round-robin entre les projets
    const credIndex = currentCredentialIndex % credentials.length
    currentCredentialIndex++

    const token = await getAccessToken(credIndex)

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
      console.error(`❌ Indexing API error (projet ${credIndex}) for ${url}:`, data)
      return { url, action, success: false, status: res.status, error: data.error?.message || 'Unknown error' }
    }

    console.log(`✅ ${action} → ${url} (projet ${credIndex}, status: ${res.status})`)
    return { url, action, success: true, status: res.status }
  } catch (err: any) {
    console.error(`💥 Exception notifying ${url}:`, err.message)
    return { url, action, success: false, error: err.message }
  }
}

// ─── Envoi par lot (utilisé par ton cron) ───────────────────────────────────
export async function notifyGoogleBatch(
  items: { url: string; action: IndexingAction }[]
): Promise<IndexingResult[]> {
  const results: IndexingResult[] = []

  for (const item of items) {
    const result = await notifyGoogle(item.url, item.action)
    results.push(result)

    // Petit délai anti-throttling
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  return results
}