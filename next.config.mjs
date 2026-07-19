/** @type {import('next').NextConfig} */
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
  experimental: {
    cpus: 1,
     staleTimes: {
      dynamic: 300, // secondes — garde le prefetch en cache le temps que l'utilisateur clique
    },
  },
}

export default nextConfig