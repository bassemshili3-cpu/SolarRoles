import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const BASE_URL = 'https://www.oh-my-job.com'
const JOBS_PER_SITEMAP = 10000

function getJobCutoff(): Date {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 14)
  return cutoff
}

export async function GET() {
  const count = await prisma.job.count({
    where: {
      active: true,
      expiresAt: { gt: new Date() },
      fetchedAt: { gt: getJobCutoff() },
    },
  })

  const jobBatchCount = Math.ceil(count / JOBS_PER_SITEMAP)
  const now = new Date().toISOString()

  const sitemapEntries = [
    `<sitemap><loc>${BASE_URL}/sitemap/0.xml</loc><lastmod>${now}</lastmod></sitemap>`,
    ...Array.from({ length: jobBatchCount }, (_, i) =>
      `<sitemap><loc>${BASE_URL}/sitemap/${i + 1}.xml</loc><lastmod>${now}</lastmod></sitemap>`
    ),
  ].join('\n  ')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapEntries}
</sitemapindex>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}