'use client'

export default function Features() {
  const features = [
    {
      icon: '🤖',
      title: 'AI-powered search',
      description: 'Not a search engine. A conversation. Our agent understands context and finds what filters can\'t.'
    },
    {
      icon: '⚡',
      title: '2 minutes, not 2 hours',
      description: 'Answer 6 questions. Get matched. Done. No endless scrolling through irrelevant listings.'
    },
    {
      icon: '⭐',
      title: 'Verified reviews & ratings',
      description: 'Real feedback from real tenants. Know exactly what you\'re getting before you commit.'
    },
    {
      icon: '🔐',
      title: 'Secure & transparent',
      description: 'Direct owner contact, verified listings, and fair prices. No hidden fees or scams.'
    },
    {
      icon: '💡',
      title: 'Smart recommendations',
      description: 'Personalized matches with explanations. Understand exactly why we recommend each PG.'
    },
    {
      icon: '🎯',
      title: 'Location intelligence',
      description: 'Find PGs near your office, college, or favorite spots. Real proximity, not guesswork.'
    }
  ]

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 bg-ink text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-xs font-semibold text-accent-2 tracking-[2px] uppercase mb-3 sm:mb-4">Why PG Finder</div>
        <h2 className="font-syne text-3xl sm:text-4xl font-black mb-8 sm:mb-12 -tracking-[1px]">
          Everything traditional sites got wrong
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/[0.07] border border-white/[0.07] rounded-xl sm:rounded-2xl overflow-hidden">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-ink p-6 sm:p-8 hover:bg-[#161616] transition-colors"
            >
              <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">{feature.icon}</div>
              <h3 className="font-syne font-bold mb-2 text-base sm:text-lg text-white">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-white/50 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
