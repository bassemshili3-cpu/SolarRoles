// app/sitemap/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

import { buildJobSlug } from '@/lib/slugify'


// ✅ Revalidate every 1 hour instead of force-dynamic

export const revalidate = 3600


const BASE_URL = 'https://www.oh-my-job.com'

const JOBS_PER_SITEMAP = 5000  // ↓ from 10k to 5k — smaller files, faster parse


function getJobCutoff(): Date {

  const cutoff = new Date()

  cutoff.setDate(cutoff.getDate() - 14)

  return cutoff

}


export async function GET(

  req: NextRequest,

  { params }: { params: Promise<{ id: string }> }

) {

  const { id: idParam } = await params

  const id = parseInt(idParam.replace('.xml', ''), 10)


  if (isNaN(id) || id < 1) {

    return new NextResponse('Invalid sitemap id', { status: 400 })

  }


  // ✅ Cursor-based pagination via cursor token in URL

  // The first request has no cursor; subsequent pages pass ?after=<lastId>

  const afterId = req.nextUrl.searchParams.get('after')


  // Fetch one extra to know if there's a next page

  const jobs = await prisma.job.findMany({

    where: {

      active: true,

      expiresAt: { gt: new Date() },

      fetchedAt: { gt: getJobCutoff() },

      ...(afterId ? { id: { gt: afterId } } : {}),

    },

    select: { id: true, title: true, location: true, fetchedAt: true },

    orderBy: { id: 'asc' },  // ✅ cursor needs stable order

    take: JOBS_PER_SITEMAP + 1,

  })


  const hasNext = jobs.length > JOBS_PER_SITEMAP

  const page = hasNext ? jobs.slice(0, JOBS_PER_SITEMAP) : jobs

  const lastId = page.length > 0 ? page[page.length - 1].id : null

  const nextUrl = hasNext && lastId

    ? `${BASE_URL}/sitemap/${id}.xml?after=${lastId}`

    : null


  const urls = page.map((job) => `

  <url>

    <loc>${BASE_URL}/jobs/${job.id}/${buildJobSlug(job)}</loc>

    <lastmod>${job.fetchedAt.toISOString()}</lastmod>

    <changefreq>daily</changefreq>

    <priority>0.4</priority>

  </url>`).join('')


  const xml = `<?xml version="1.0" encoding="UTF-8"?>

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}

</urlset>${nextUrl ? `\n<!-- next: ${nextUrl} -->` : ''}`


  return new NextResponse(xml, {

    headers: {

      'Content-Type': 'application/xml',

      // ✅ Browser + CDN + Google cache this for 1 hour

      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=7200',

    },

  })

}

