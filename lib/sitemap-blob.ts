// lib/sitemap-blob.ts
//
// Sert le contenu XML déjà généré par le cron (app/api/cron/generate-sitemaps)
// et stocké sur Vercel Blob. Utilise le SDK @vercel/blob (auth OIDC automatique
// via BLOB_STORE_ID, déjà connecté au projet) — pas besoin de connaître ou de
// deviner l'URL publique du store.

import { NextResponse } from 'next/server'
import { get } from '@vercel/blob'

export async function serveSitemapBlob(pathname: string) {
  try {
    // Si ton store Blob est en mode "private" plutôt que "public", change
    // access: 'public' → access: 'private' ci-dessous.
    const result = await get(pathname, { access: 'public' })

    if (!result || result.statusCode !== 200 || !result.stream) {
      // Le cron n'a probablement encore jamais tourné pour ce fichier —
      // arrive surtout juste après le premier déploiement.
      return NextResponse.json(
        {
          error:
            'Sitemap not generated yet — trigger POST /api/cron/generate-sitemaps once',
        },
        { status: 503 }
      )
    }

    return new NextResponse(result.stream, {
      headers: {
        'Content-Type': result.blob.contentType || 'application/xml',
        // Cache CDN par-dessus, aligné sur la fréquence du cron de génération.
        'Cache-Control': 'public, max-age=0, s-maxage=21600',
      },
    })
  } catch (err) {
    console.error('[sitemap-blob] get() failed', err)
    return NextResponse.json({ error: 'Sitemap fetch failed' }, { status: 502 })
  }
}