import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Providers } from './providers'
import { FilterDrawerProvider } from '@/contexts/filter-drawer-context'
import CookieBanner from '@/components/CookieBanner'
import { Analytics } from "@vercel/analytics/next"
import Script from 'next/script'


const inter = Inter({ subsets: ['latin'] })

const SITE_URL = 'https://www.oh-my-job.com'

export const metadata = {
  title: 'Oh My Job - Smart Job Search USA',
  description: 'Search and compare real job listings across the U.S. Salary ranges shown upfront — no account or sign-up required.',
  metadataBase: new URL(SITE_URL),
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Oh My Job',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/logo-square.svg`,
    width: 512,
    height: 512,
  },
  sameAs: [
    'https://www.facebook.com/ohmyjob',
  ],
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>

         <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3314706503607251"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

      </head>
      <body className={inter.className}>
        <Providers>
          <FilterDrawerProvider>
            <CookieBanner />
            <Navbar />
            {children}
            <Footer />
          </FilterDrawerProvider>
        </Providers>
        <Analytics/>
      </body>
    </html>
  )
}