const entries = new Map<string, { count: number; until: number }>()
export function throttleRequest(request: Request, scope: string, max = 5, duration = 600_000) {
 const now = Date.now()
 for (const [key, value] of entries) if (value.until <= now) entries.delete(key)
 const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
 const key = scope + ':' + ip
 const entry = entries.get(key) || { count: 0, until: now + duration }
 if (entries.size >= 10_000 && !entries.has(key)) return false
 entry.count++; entries.set(key, entry)
 return entry.count <= max
}
