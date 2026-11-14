import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const JOB_DETAIL_PATH = /^\/jobs\/[^/]+\/[^/]+\/?$/

// Refresh cookie-backed sessions before Server Components read them.
// Route layouts and API handlers still enforce account permissions.
export async function middleware(request: NextRequest) {
  // Legacy `?from=` job links: drop the query with the same permanent redirect the
  // page used to issue, so the job page never reads searchParams and stays cached.
  // A wrong slug is still corrected by the page itself.
  const { pathname, searchParams } = request.nextUrl
  if (searchParams.has('from') && JOB_DETAIL_PATH.test(pathname) && !pathname.endsWith('/go')) {
    const target = request.nextUrl.clone()
    target.search = ''
    return NextResponse.redirect(target, 308)
  }

  let response = NextResponse.next({ request })
  if (!request.cookies.getAll().some(cookie => cookie.name.startsWith('sb-') && cookie.name.includes('-auth-token'))) return response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: cookies => {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value))
        const previousCookies = response.cookies.getAll()
        response = NextResponse.next({ request })
        previousCookies.forEach(cookie => response.cookies.set(cookie))
        cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        response.headers.set('Cache-Control', 'private, no-store')
      },
    } },
  )
  await supabase.auth.getUser()
  return response
}
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)'],
}
