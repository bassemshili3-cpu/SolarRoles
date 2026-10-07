import { createHmac, timingSafeEqual } from 'node:crypto'
function secret() {
 const key = process.env.AUTH_COOKIE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
 if (!key || key.length < 32) throw new Error('AUTH_COOKIE_SECRET must contain at least 32 characters.')
 return key
}
export function issueRecoveryGrant(userId: string, accessToken: string, now = Date.now()) {
 const expires = now + 600_000
 const signature = createHmac('sha256', secret()).update(userId + ':' + accessToken + ':' + expires).digest('hex')
 return expires + '.' + signature
}
export function validRecoveryGrant(value: string | undefined, userId: string, accessToken: string, now = Date.now()) {
 if (!value) return false
 const [expiry, signature] = value.split('.')
 const expires = Number(expiry)
 if (!Number.isFinite(expires) || expires <= now || expires > now + 600_000 || !/^[a-f0-9]{64}$/.test(signature || '')) return false
 const expected = createHmac('sha256', secret()).update(userId + ':' + accessToken + ':' + expires).digest()
 return timingSafeEqual(expected, Buffer.from(signature, 'hex'))
}
