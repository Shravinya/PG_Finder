import type { Metadata } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import AnnouncementBanner from '@/components/common/AnnouncementBanner'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '500', '600', '700', '800'],
})

const dm = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm',
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  title: 'PG Finder - AI-Powered PG Discovery in Hyderabad',
  description: 'Find your perfect PG in minutes with our AI assistant. No filters, no scrolling, just conversation.',
  keywords: ['PG', 'hostel', 'Hyderabad', 'AI', 'accommodation', 'students', 'paying guest'],
  authors: [{ name: 'PG Finder Team', url: 'https://pgfinder.com' }],
  creator: 'PG Finder',
  publisher: 'PG Finder',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://pgfinder.com',
    siteName: 'PG Finder',
    title: 'PG Finder - Find Your Perfect PG with AI',
    description: 'AI-powered PG discovery platform for Hyderabad. Chat with our AI to find the perfect accommodation.',
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  colorScheme: 'light',
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${syne.variable} ${dm.variable}`}>
      <head>
        <meta name="theme-color" content="#E8531A" />
        <link rel="canonical" href="https://pgfinder.com" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="bg-surface text-ink font-dm">
        <Navbar />
        <AnnouncementBanner />
        <main className="pt-nav-height">
          {children}
        </main>
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}
