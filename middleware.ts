// middleware.ts (à la racine de oh-my-job10)
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { CookieOptions } from '@supabase/ssr'   // ← type officiel Supabase

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ 
          name: string
          value: string
          options?: CookieOptions 
        }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Mise à jour pour la requête entrante
            request.cookies.set(name, value)
            
            // Création d'une nouvelle réponse avec les cookies mis à jour
            response = NextResponse.next({
              request,
            })
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // IMPORTANT : rafraîchit la session (obligatoire)
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}