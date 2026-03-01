/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: "adzuna.com" }, { hostname: "supabase.co" }],
  },
}

export default nextConfig