import { NextResponse, type NextRequest } from 'next/server'
import { getCanonicalSlugFromCache } from '@/lib/jobSlugCache'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Match /jobs/:id ou /jobs/:id/:slug
  const match = pathname.match(/^\/jobs\/([^/]+)(?:\/([^/]+))?\/?$/)
  if (!match) return NextResponse.next()

  const [, id, slug] = match

  // Slug présent → on laisse passer, le <link rel="canonical"> de la page fait le job
  if (slug) return NextResponse.next()

  // Pas de slug → lookup dans Vercel KV + 308 vers l'URL canonique
  const canonicalSlug = await getCanonicalSlugFromCache(id)
  if (!canonicalSlug) {
    // Pas en cache (job inexistant ou cache pas encore warm)
    // On laisse Next.js gérer → tombe sur ta 404, c'est OK
    return NextResponse.next()
  }

  return NextResponse.redirect(
    new URL(`/jobs/${id}/${canonicalSlug}`, req.url),
    308
  )
}

export const config = {
  matcher: '/jobs/:id/:slug*',
}