/** Public SEO origin; legacy www remains a hosting redirect only. */
export const SITE_URL = 'https://solarroles.com'

export function getSiteUrl(path = ''): string {
  return `${SITE_URL}${path.startsWith('/') || !path ? path : `/${path}`}`
}
