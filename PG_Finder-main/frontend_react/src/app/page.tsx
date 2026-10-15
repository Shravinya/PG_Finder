import type { Metadata } from 'next'
import { Suspense } from 'react'
import HeroSection from '@/components/landing/HeroSection'
import HowItWorks from '@/components/landing/HowItWorks'
import Features from '@/components/landing/Features'
import CTASection from '@/components/landing/CTASection'

export const metadata: Metadata = {
  title: 'PG Finder - Find Your Perfect PG in Hyderabad with AI',
  description: 'Stop calling 10 PGs. Just chat. AI-powered PG discovery for Hyderabad students and professionals.',
  openGraph: {
    title: 'PG Finder - AI-Powered PG Discovery',
    description: 'Find your perfect accommodation with our intelligent chat assistant',
    url: 'https://pgfinder.com',
    type: 'website',
  },
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <HowItWorks />
      <Features />
      <CTASection />
    </>
  )
}
