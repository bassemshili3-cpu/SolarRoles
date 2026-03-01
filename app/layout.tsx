import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import DoNotSellBanner from '@/components/DoNotSellBanner'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Oh My Job - Premium Job Search USA',
  description: 'Fastest job search in the United States with salary transparency',
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
          <Navbar />
          {children}
          <Footer />
          <DoNotSellBanner />
          {/* ← SUPPRIME LA LIGNE <Toaster ... /> ICI */}
        </Providers>
      </body>
    </html>
  )
}