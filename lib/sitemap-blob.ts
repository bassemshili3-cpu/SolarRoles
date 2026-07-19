// lib/sitemap-blob.ts
//
// Sert le contenu XML déjà généré par le cron (app/api/cron/generate-sitemaps)
// et stocké sur Vercel Blob. Aucune requête DB ici — juste un fetch vers le
// CDN Blob, donc réponse quasi instantanée pour Googlebot.

import { NextResponse } from 'next/server'

// URL de base de ton Blob store, dispo dans le dashboard Vercel
// (Storage > ton store > Base URL), ex :
//   https://xxxxxxxxxxxx.public.blob.vercel-storage.com
const BLOB_BASE_URL = process.env.BLOB_BASE_URL

export async function serveSitemapBlob(pathname: string) {
  if (!BLOB_BASE_URL) {
    console.error('[sitemap-blob] BLOB_BASE_URL is not set')
    return NextResponse.json(
      { error: 'Sitemap storage misconfigured' },
      { status: 500 }
    )
  }

  try {
    const res = await fetch(`${BLOB_BASE_URL}/${pathname}`, {
      // Cache Next par-dessus le CDN Blob (optionnel, gratuit en vitesse).
      // Aligné sur la fréquence du cron de génération.
      next: { revalidate: 21600 },
    })

    if (!res.ok) {
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

    const xml = await res.text()
    return new NextResponse(xml, {
      headers: { 'Content-Type': 'application/xml' },
    })
  } catch (err) {
    console.error('[sitemap-blob] fetch failed', err)
    return NextResponse.json({ error: 'Sitemap fetch failed' }, { status: 502 })
  }
}