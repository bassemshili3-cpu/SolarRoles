// Route de ton index sitemap (celui qui produit le <sitemapindex> —
// adapte au chemin de fichier existant, ex. app/sitemap.xml/route.ts)
import { serveSitemapBlob } from '@/lib/sitemap-blob'

export const dynamic = 'force-dynamic'

export async function GET() {
  return serveSitemapBlob('sitemaps/index.xml')
}