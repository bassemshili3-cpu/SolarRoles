export const AUTH_REDIRECT_COOKIE = 'solarroles_auth_redirect'
export const AUTH_CONSENT_COOKIE = 'solarroles_auth_consent'
export const AUTH_ACCOUNT_TYPE_COOKIE = 'solarroles_auth_account_type'

export type AuthAccountType = 'candidate' | 'employer'

export function safeAuthAccountType(value: unknown): AuthAccountType | null {
  return value === 'candidate' || value === 'employer' ? value : null
}

export function safeAuthRedirect(value: string | null | undefined, fallback = '/dashboard') {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback

  try {
    const parsed = new URL(value, 'https://solarroles.com')
    if (parsed.origin !== 'https://solarroles.com') return fallback
    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return fallback
  }
}
