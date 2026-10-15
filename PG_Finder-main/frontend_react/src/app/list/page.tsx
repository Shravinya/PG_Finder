'use client'

import type { Metadata } from 'next'
import { Phone, Mail, MapPin } from 'lucide-react'

// Note: Metadata export needed in server component, see note below
// export const metadata: Metadata = {
//   title: 'List Your PG - PG Finder',
//   description: 'Own a PG? Get verified by our field officers and list your property for free.',
// }

export default function ListYourPGPage() {
  return (
    <div className="min-h-[calc(100vh-60px)] bg-surface py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="font-syne text-4xl font-black mb-4">📍 List Your PG</h1>
          <p className="text-lg text-muted mb-8">
            Own a PG? Let us help you reach quality tenants
          </p>

          {/* Call to Action Card */}
          <div className="bg-accent text-white rounded-2xl p-12 mb-12">
            <h2 className="font-syne text-3xl font-black mb-8">We Handle Everything!</h2>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                {
                  icon: '📸',
                  title: 'Professional Photos',
                  desc: 'Our field officers visit and take quality photos',
                },
                {
                  icon: '📝',
                  title: 'Accurate Details',
                  desc: 'We verify all info to ensure tenant satisfaction',
                },
                {
                  icon: '✅',
                  title: 'Verified Listing',
                  desc: 'Your PG gets verified badge for credibility',
                },
              ].map((item, i) => (
                <div key={i} className="text-white/90">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-sm bg-white/20 border border-white/30 rounded-lg p-6">
              <p className="mb-4">
                Why this approach?
              </p>
              <ul className="space-y-2 text-left inline-block">
                <li>✓ Prevents fake/scam listings</li>
                <li>✓ Ensures accurate PG information</li>
                <li>✓ Builds trust with quality tenants</li>
                <li>✓ Reduces disputes and issues</li>
              </ul>
            </div>
          </div>

          {/* Contact Section */}
          <div className="space-y-8">
            <div className="bg-card border border-current border-opacity-[0.09] rounded-2xl p-12">
              <h3 className="font-syne text-2xl font-black mb-8">Ready to List?</h3>

              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <Phone size={32} className="text-accent flex-shrink-0 mt-1" />
                  <div className="text-left flex-1">
                    <p className="text-sm text-muted mb-1">Call or WhatsApp</p>
                    <p className="font-syne text-2xl font-black text-ink">
                      +91 7981366747
                    </p>
                    <p className="text-xs text-muted mt-2">Available 9 AM - 9 PM, 7 days a week</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail size={32} className="text-accent flex-shrink-0 mt-1" />
                  <div className="text-left">
                    <p className="text-sm text-muted mb-1">Email</p>
                    <p className="font-syne text-xl font-black text-ink">
                      owners@pgfinder.com
                    </p>
                    <p className="text-xs text-muted mt-2">Response within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin size={32} className="text-accent flex-shrink-0 mt-1" />
                  <div className="text-left">
                    <p className="text-sm text-muted mb-1">Location</p>
                    <p className="font-syne text-lg font-black text-ink">
                      Hyderabad, India
                    </p>
                    <p className="text-xs text-muted mt-2">Field officers across all major areas</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => window.open('tel:+917981366747')}
                  className="btn-primary py-4 px-8 text-lg font-semibold flex-1"
                >
                  📞 Call Now
                </button>
                <button
                  onClick={() => window.open('https://wa.me/917981366747')}
                  className="btn-ghost py-4 px-8 text-lg font-semibold border-2 border-accent text-accent flex-1"
                >
                  💬 WhatsApp
                </button>
              </div>
            </div>

            {/* Process */}
            <div className="bg-surface border border-current border-opacity-[0.09] rounded-2xl p-12">
              <h3 className="font-syne text-2xl font-black mb-8">Our Process</h3>

              <div className="space-y-6">
                {[
                  {
                    step: '1️⃣',
                    title: 'You Call Us',
                    desc: 'Reach out with your PG details and location',
                  },
                  {
                    step: '2️⃣',
                    title: 'We Schedule Visit',
                    desc: 'Field officer schedules verification visit at your convenience',
                  },
                  {
                    step: '3️⃣',
                    title: 'Verification & Photos',
                    desc: 'Officer visits, verifies details, and takes professional photos',
                  },
                  {
                    step: '4️⃣',
                    title: 'Live & Earning',
                    desc: 'Your verified PG appears in search - ready for tenants!',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-3xl flex-shrink-0">{item.step}</span>
                    <div className="text-left">
                      <h4 className="font-semibold text-ink-2 mb-1">{item.title}</h4>
                      <p className="text-sm text-muted">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-blue-l border border-blue rounded-2xl p-12">
              <h3 className="font-syne text-2xl font-black mb-8 text-blue">Frequently Asked Questions</h3>

              <div className="space-y-6">
                {[
                  {
                    q: 'How long does verification take?',
                    a: 'Usually 3-7 days from initial call to listing going live',
                  },
                  {
                    q: 'Is there any fee to list?',
                    a: 'Free during our launch phase. We\'ll notify you before introducing any charges in the future.',
                  },
                  {
                    q: 'What if I have multiple PGs?',
                    a: 'Great! We can list all of them. Just call and we\'ll handle everything.',
                  },
                  {
                    q: 'Can I edit details after listing?',
                    a: 'Yes! Call us anytime to update prices, amenities, or other details.',
                  },
                ].map((item, i) => (
                  <div key={i}>
                    <h4 className="font-semibold text-blue mb-2">{item.q}</h4>
                    <p className="text-sm text-blue/70">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-accent to-accent-2 text-white rounded-2xl p-12 text-center">
              <h3 className="font-syne text-2xl font-black mb-4">
                Ready to Connect with Quality Tenants?
              </h3>
              <p className="mb-8 text-white/90">
                Join 1,200+ verified PG owners on PG Finder
              </p>
              <button
                onClick={() => window.open('tel:+917981366747')}
                className="bg-white text-accent font-semibold py-4 px-12 rounded-lg hover:bg-white/90 transition"
              >
                📞 Call +91 7981366747
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
