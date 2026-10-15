'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-ink text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-syne font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/careers">Careers</Link></li>
              <li><Link href="/press">Press</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-syne font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/find">Find PG</Link></li>
              <li><Link href="/list">List PG</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="/features">Features</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-syne font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/help">Help Center</Link></li>
              <li><Link href="/community">Community</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-syne font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/terms">Terms</Link></li>
              <li><Link href="/privacy">Privacy</Link></li>
              <li><Link href="/cookies">Cookies</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex justify-between items-center">
          <p className="text-sm text-white/40">© 2026 PG Finder. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="text-white/40 hover:text-white transition">Twitter</a>
            <a href="#" className="text-white/40 hover:text-white transition">Instagram</a>
            <a href="#" className="text-white/40 hover:text-white transition">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
