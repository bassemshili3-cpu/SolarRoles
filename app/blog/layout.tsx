import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Solar Career Advice & Job Market Insights | Solar Roles Blog',
  description:
    'Practical career advice, salary data, interview tips, and solar job market trends. Written for US solar PV installers and solar industry professionals in 2026.',
  keywords: [
    'solar career advice',
    'solar installer salary',
    'solar job market',
    'NABCEP certification guide',
    'solar apprenticeship',
    'PV installer interview tips',
    'solar hiring trends',
    'solar industry 2026',
  ],
  alternates: { canonical: 'https://www.solarroles.com/blog' },
  openGraph: {
    title: 'Solar Career Advice & Job Market Insights | Solar Roles Blog',
    description:
      'Practical career advice, salary data, interview tips, and solar job market trends for US solar PV installers and solar industry professionals.',
    url: 'https://www.solarroles.com/blog',
    siteName: 'Solar Roles',
    type: 'website',
    images: [
      {
        url: 'https://www.solarroles.com/og-blog.png',
        width: 1200,
        height: 630,
        alt: 'Solar Roles Blog — Career advice for solar PV installers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solar Career Advice & Job Market Insights | Solar Roles Blog',
    description:
      'Practical career advice, salary data, interview tips, and solar job market trends for US solar PV installers.',
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}