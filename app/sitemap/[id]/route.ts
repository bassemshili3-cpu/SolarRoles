import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildJobSlug } from '@/lib/slugify'

export const dynamic = 'force-dynamic'

const BASE_URL = 'https://www.oh-my-job.com'
const JOBS_PER_SITEMAP = 10000

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

  const jobs = await prisma.job.findMany({
    where: {
      active: true,
      expiresAt: { gt: new Date() },
      fetchedAt: { gt: getJobCutoff() },
    },
    select: { id: true, title: true, location: true, fetchedAt: true },
    orderBy: { fetchedAt: 'desc' },
    skip: (id - 1) * JOBS_PER_SITEMAP,
    take: JOBS_PER_SITEMAP,
  })

  const urls = jobs.map((job) => `
  <url>
    <loc>${BASE_URL}/jobs/${job.id}/${buildJobSlug(job)}</loc>
    <lastmod>${job.fetchedAt.toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.4</priority>
  </url>`).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' },
  })
}