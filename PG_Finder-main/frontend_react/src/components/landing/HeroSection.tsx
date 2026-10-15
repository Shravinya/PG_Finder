'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface Stat {
  label: string
  value: string
}

export default function HeroSection() {
  const router = useRouter()
  const [stats, setStats] = useState<Stat[]>([
    { label: 'PGs listed', value: '1,200+' },
    { label: 'Happy tenants', value: '5,000+' },
    { label: 'Avg. rating', value: '4.7★' },
  ])

  useEffect(() => {
    // Load stats from localStorage (managed by admin)
    try {
      const stored = localStorage.getItem('pg_finder_stats')
      if (stored) {
        const allStats = JSON.parse(stored) as Stat[]
        // Take first 3 stats for hero display
        setStats(allStats.slice(0, 3))
      }
    } catch (error) {
      // Fallback to defaults
    }
  }, [])

  return (
    <section className="pt-20 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 bg-card relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-surface border border-current border-opacity-[0.09] rounded-full px-4 py-1.5 text-xs font-medium text-muted mb-6 sm:mb-8 animate-fade-in">
              <span className="w-[7px] h-[7px] bg-accent rounded-full animate-pulse-subtle"></span>
              AI-powered PG discovery · Hyderabad
            </div>

            <h1 className="font-syne text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-4 sm:mb-6 -tracking-[2px]">
              Stop calling 10 PGs. <em className="text-accent not-italic">Just chat.</em>
            </h1>

            <p className="text-base sm:text-lg text-muted leading-relaxed mb-6 sm:mb-8 font-light">
              Just have a conversation. Our AI asks the right questions and finds your perfect match — no filters, no scrolling, no stress.
            </p>

            <div className="flex gap-2 sm:gap-3 mb-8 sm:mb-12 flex-col sm:flex-row">
              <button
                onClick={() => router.push('/chat')}
                className="btn-lg-primary w-full sm:w-auto"
              >
                Start Searching Free
              </button>
              <button
                onClick={() => router.push('/signup')}
                className="btn-lg-ghost w-full sm:w-auto"
              >
                List Your PG →
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 sm:gap-8">
              {stats.map((stat, idx) => (
                <div key={idx}>
                  <div className="font-syne text-2xl sm:text-3xl font-black">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Visual - Chat Preview */}
          <div className="hidden md:block">
            <div className="bg-card border border-current border-opacity-[0.09] rounded-2xl p-5 shadow-lg-subtle">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <div className="font-syne text-sm font-bold">PG Buddy · Online</div>
              </div>

              <div className="space-y-3">
                <div className="bg-surface rounded-3xl px-4 py-3 max-w-xs text-sm">
                  Hi Priya! Which area in Hyderabad are you looking in? 🏠
                </div>

                <div className="flex justify-end">
                  <div className="bg-accent text-white rounded-3xl px-4 py-3 max-w-xs text-sm">
                    Gachibowli, near my office
                  </div>
                </div>

                <div className="bg-surface rounded-3xl px-4 py-3 max-w-xs text-sm">
                  Got it! What's your monthly budget? 💰
                </div>

                <div className="flex justify-end">
                  <div className="bg-accent text-white rounded-3xl px-4 py-3 max-w-xs text-sm">
                    Around ₹8,000
                  </div>
                </div>

                <div className="bg-surface rounded-3xl px-4 py-3 inline-flex gap-1">
                  <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce-light"></span>
                  <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce-light" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce-light" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
