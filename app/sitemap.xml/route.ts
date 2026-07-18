// app/sitemap.xml/route.ts

import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'


export const revalidate = 3600


const BASE_URL = 'https://www.oh-my-job.com'

const JOBS_PER_SITEMAP = 5000


function getJobCutoff(): Date {

  const cutoff = new Date()

  cutoff.setDate(cutoff.getDate() - 14)

  return cutoff

}


export async function GET() {

  // ✅ Cursor-based count: just count, don't load rows

  const count = await prisma.job.count({

    where: {

      active: true,

      expiresAt: { gt: new Date() },

      fetchedAt: { gt: getJobCutoff() },

    },

  })

  const jobBatchCount = Math.ceil(count / JOBS_PER_SITEMAP)


  const entries = [

    `${BASE_URL}/sitemap-pages.xml`,

    // ✅ First page only — cursor-based next pages are discovered dynamically

    ...Array.from({ length: Math.min(jobBatchCount, 1) }, (_, i) => `${BASE_URL}/sitemap/${i + 1}.xml`),

  ]


  // If you want ALL sitemap files in the index (not just first page),

  // you can list them all here. The downside: index gets bigger but

  // it's all static so no perf impact.

  // ...Array.from({ length: jobBatchCount }, (_, i) => `${BASE_URL}/sitemap/${i + 1}.xml`),


  const xml = `<?xml version="1.0" encoding="UTF-8"?>

<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${entries.map((url) => `  <sitemap><loc>${url}</loc><lastmod>${new Date().toISOString()}</lastmod></sitemap>`).join('\n')}

</sitemapindex>`


  return new NextResponse(xml, {

    headers: {

      'Content-Type': 'application/xml',

      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=7200',

    },

  })

}

