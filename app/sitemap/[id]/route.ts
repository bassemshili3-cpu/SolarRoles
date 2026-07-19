// app/sitemap/[id]/route.ts
import { NextRequest } from 'next/server'
import { serveSitemapBlob } from '@/lib/sitemap-blob'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params
  const id = idParam.replace('.xml', '')
  return serveSitemapBlob(`sitemaps/${id}.xml`)
}