import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Providers } from './providers'
import CookieBanner from '@/components/CookieBanner'
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Oh My Job - Smart Job Search USA',
  description: 'Search and compare real job listings across the U.S. Salary ranges shown upfront — no account or sign-up required.',
  icons: { icon: '/logo.svg' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <CookieBanner />
          <Navbar />
          {children}
          <Footer />
         
          
        </Providers>
        <Analytics/>
      </body>
    </html>
  )
}