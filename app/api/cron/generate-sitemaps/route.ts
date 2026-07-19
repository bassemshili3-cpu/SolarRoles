// app/api/cron/generate-sitemaps/route.ts
//
// Génère l'index + tous les batches de sitemaps jobs et les upload sur
// Vercel Blob (accès public, pathname stable, overwrite à chaque run).
// Les routes publiques ne font plus aucune requête DB : elles sont désormais
// remplacées par un rewrite Vercel direct vers le CDN Blob (next.config.js) —
// aucune Function n'est même invoquée pour les servir.
//
// Setup :
//   1. Connecte un Blob store à ton projet Vercel (Storage > Create Store
//      > Blob). BLOB_STORE_ID est alors injecté automatiquement.
//   2. Ajoute un cron dans vercel.json :
//        { "path": "/api/cron/generate-sitemaps", "schedule": "0 */6 * * *" }
//   3. Juste après ce déploiement, déclenche-le une fois à la main
//      (curl ci-dessous) pour que les fichiers existent avant le premier
//      hit d'un crawler.
//
// Test manuel :
//   curl -X POST -H "Authorization: Bearer $CRON_SECRET" \
//        https://oh-my-job.com/api/cron/generate-sitemaps

import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'
import { buildJobSlug } from '@/lib/slugify'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
// Ajuste selon ton plan Vercel si la génération de tous les batches
// dépasse la durée max d'une function (par défaut plus large sur Pro+).
export const maxDuration = 60

const BASE_URL = 'https://www.oh-my-job.com'
const JOBS_PER_SITEMAP = 10000

function getJobCutoff(): Date {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 14)
  return cutoff
}

function jobWhereClause() {
  return {
    active: true,
    expiresAt: { gt: new Date() },
    fetchedAt: { gt: getJobCutoff() },
  }
}

async function uploadXml(pathname: string, xml: string) {
  await put(pathname, xml, {
    access: 'public',
    addRandomSuffix: false, // pathname stable, sinon les routes proxy ne le retrouvent plus
    allowOverwrite: true, // on régénère le même fichier à chaque run du cron
    // text/xml (et pas application/xml) : c'est le seul des deux que Vercel Blob
    // reconnaît pour un Content-Disposition 'inline' — sinon le navigateur force
    // le téléchargement du fichier au lieu de l'afficher.
    contentType: 'text/xml',
    cacheControlMaxAge: 21600, // 6h, aligné sur la fréquence du cron
  })
}

async function handle(req: NextRequest) {
  // ─── Auth ───────────────────────────────────────────────────────────────
  const authHeader = req.headers.get('authorization')
  const expected = process.env.CRON_SECRET
    ? `Bearer ${process.env.CRON_SECRET}`
    : null
  if (expected && authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const count = await prisma.job.count({ where: jobWhereClause() })
  const batchCount = Math.max(1, Math.ceil(count / JOBS_PER_SITEMAP))

  // ─── Batches de jobs ────────────────────────────────────────────────────
  for (let i = 0; i < batchCount; i++) {
    const jobs = await prisma.job.findMany({
      where: jobWhereClause(),
      select: { id: true, title: true, location: true, fetchedAt: true },
      orderBy: { fetchedAt: 'desc' },
      skip: i * JOBS_PER_SITEMAP,
      take: JOBS_PER_SITEMAP,
    })

    const urls = jobs
      .map(
        (job) => `
  <url>
    <loc>${BASE_URL}/jobs/${job.id}/${buildJobSlug(job)}</loc>
    <lastmod>${job.fetchedAt.toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.4</priority>
  </url>`
      )
      .join('')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`

    await uploadXml(`sitemaps/${i + 1}.xml`, xml)
  }

  // ─── Index ──────────────────────────────────────────────────────────────
  const entries = [
    `${BASE_URL}/sitemap-pages.xml`,
    ...Array.from(
      { length: batchCount },
      (_, i) => `${BASE_URL}/sitemap/${i + 1}.xml`
    ),
  ]
  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((url) => `  <sitemap><loc>${url}</loc></sitemap>`).join('\n')}
</sitemapindex>`

  await uploadXml('sitemaps/index.xml', indexXml)

  return NextResponse.json({
    success: true,
    jobCount: count,
    batchCount,
    timestamp: new Date().toISOString(),
  })
}

export async function GET(req: NextRequest) {
  return handle(req)
}
export async function POST(req: NextRequest) {
  return handle(req)
}