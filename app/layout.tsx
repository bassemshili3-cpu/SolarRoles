import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Providers } from './providers'
import { FilterDrawerProvider } from '@/contexts/filter-drawer-context'
import CookieBanner from '@/components/CookieBanner'
import SiteChrome from '@/components/SiteChrome'


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
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "ysgu5lr18v");
            `,
          }}
        />
     

         <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      

      </head>
      <body className={inter.className}>
        <Providers>
          <FilterDrawerProvider>
            <SiteChrome
              header={
                <>
                  <CookieBanner />
                  <Navbar />
                </>
              }
              footer={<Footer />}
            >
              {children}
            </SiteChrome>
          </FilterDrawerProvider>
        </Providers>
      </body>
    </html>
  )
}
