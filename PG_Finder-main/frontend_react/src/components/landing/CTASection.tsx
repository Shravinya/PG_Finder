'use client'

import { useRouter } from 'next/navigation'

export default function CTASection() {
  const router = useRouter()

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 bg-card">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="font-syne text-3xl sm:text-4xl font-black mb-4 sm:mb-6">
          Ready to find your perfect PG?
        </h2>
        <p className="text-base sm:text-lg text-muted mb-6 sm:mb-8">
          Join 5,000+ happy tenants who found their home in minutes. No commitment, no signup required for a quick chat.
        </p>
        <button
          onClick={() => router.push('/chat')}
          className="btn-lg-primary text-base sm:text-lg w-full sm:w-auto"
        >
          Start Your Journey →
        </button>
      </div>
    </section>
  )
}
