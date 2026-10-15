'use client'

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      icon: '💬',
      title: 'Chat with PG Buddy',
      description: 'Answer 6 simple questions in plain language. No confusing forms or filters to figure out.',
      bgColor: '#FEF0EA'
    },
    {
      num: '02',
      icon: '🏠',
      title: 'Get personalized matches',
      description: 'Our AI instantly finds PGs that fit your exact needs — budget, location, amenities, and more.',
      bgColor: '#E8F5EE'
    },
    {
      num: '03',
      icon: '📞',
      title: 'Connect and move in',
      description: 'View full details, read verified reviews, and contact owners directly. Move in fast.',
      bgColor: '#E8EEFA'
    }
  ]

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="text-xs font-semibold text-accent tracking-[2px] uppercase mb-3 sm:mb-4">How it works</div>
        <h2 className="font-syne text-3xl sm:text-4xl font-black mb-8 sm:mb-12 -tracking-[1px]">
          Three steps to your new home
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {steps.map((step, i) => (
            <div
              key={i}
              className="bg-card border border-current border-opacity-[0.09] rounded-xl sm:rounded-2xl p-6 sm:p-8 relative animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="absolute top-4 sm:top-6 right-4 sm:right-6 font-syne text-5xl sm:text-6xl font-black text-surface opacity-50 pointer-events-none">
                {step.num}
              </div>

              <div
                className="w-10 sm:w-11 h-10 sm:h-11 rounded-xl flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4"
                style={{ backgroundColor: step.bgColor }}
              >
                {step.icon}
              </div>

              <h3 className="font-syne text-base sm:text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
