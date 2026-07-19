/** @type {import('next').NextConfig} */

// Remplace <STORE_HOST> par l'URL publique réelle de ton store Blob
// (Vercel Dashboard → Storage → ton store → clique un fichier existant pour voir son domaine —
// ce n'est PAS la même valeur que BLOB_STORE_ID).
const BLOB_PUBLIC_HOST = 'https://ovj48egcxlaw9gic.public.blob.vercel-storage.com'

const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'adzuna.com' },
      { hostname: 'supabase.co' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'oh-my-job.com' }],
        destination: 'https://www.oh-my-job.com/:path*',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/sitemap-index.xml',
        destination: `${BLOB_PUBLIC_HOST}/sitemaps/index.xml`,
      },
      {
        source: '/sitemap/:id.xml',
        destination: `${BLOB_PUBLIC_HOST}/sitemaps/:id.xml`,
      },
    ]
  },
  experimental: {
    cpus: 1,
    staleTimes: {
      dynamic: 300, // secondes — garde le prefetch en cache le temps que l'utilisateur clique
    },
  },
}

export default nextConfig