// React 18 does not recognise the camelCase `fetchPriority` prop, but it passes the
// lowercase HTML attribute through untouched (next/image does the same under React 18).
// Spread it on the one image per page that is the Largest Contentful Paint candidate.
export const highFetchPriority: Record<string, string> = { fetchpriority: 'high' }
