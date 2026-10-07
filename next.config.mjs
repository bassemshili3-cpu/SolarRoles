/** @type {import('next').NextConfig} */

const nextConfig = {
  // Allow isolated local verification without disturbing an existing dev server.
  distDir: process.env.SOLARROLES_BUILD_DIR || '.next',
  typescript: { tsconfigPath: process.env.SOLARROLES_TYPECHECK_CONFIG || 'tsconfig.json' },
  images: {
    remotePatterns: [
      { hostname: 'adzuna.com' },
      { hostname: 'supabase.co' },
    ],
  },
  async headers() {
    return [
      {
        source: '/embed/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: 'frame-ancestors *' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ]
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
  experimental: {
    cpus: 1,
    staleTimes: {
      dynamic: 300, // secondes — garde le prefetch en cache le temps que l'utilisateur clique
    },
  },
}

export default nextConfig
