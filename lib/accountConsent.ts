export const TERMS_VERSION = '2026-05-18'
export const PRIVACY_VERSION = '2026-03-03'

export function accountConsentPath(redirectTo: string) {
  return `/auth/consent?redirectTo=${encodeURIComponent(redirectTo)}`
}
