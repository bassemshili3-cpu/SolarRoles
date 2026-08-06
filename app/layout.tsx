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

const SITE_URL = 'https://www.solarroles.com'

export const metadata = {
  title: 'Solar Roles - Solar installers Jobs USA',
  description: 'Search and compare Solar installers across the U.S.',
  metadataBase: new URL(SITE_URL),
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Solar Roles',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/logo-square.svg`,
    width: 512,
    height: 512,
  },
  
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
     
<Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5WTYHBH69G"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5WTYHBH69G');
          `}
        </Script>

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