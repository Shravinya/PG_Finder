'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const router = useRouter()
  const { signup, isLoading, error } = useAuthStore()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
  })

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    try {
      const { apiClient } = await import('@/lib/api')
      const response = await apiClient.signup(formData.email, formData.password, formData.name, formData.phone)
      apiClient.setToken(response.access_token)
      
      // Store user role
      localStorage.setItem('userRole', response.user?.role || 'user')
      localStorage.setItem('userName', response.user?.name || formData.name)
      
      toast.success('Account created! Welcome aboard!')
      router.push('/chat')
    } catch (err) {
      toast.error(error || 'Signup failed')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="min-h-[calc(100vh-60px)] flex">
      {/* Left Brand Side */}
      <div className="hidden lg:flex flex-1 bg-ink text-white p-12 flex-col justify-between">
        <div>
          <div className="font-syne font-black text-2xl mb-2">
            PG<span className="bg-accent text-white px-2 py-1 rounded ml-1">Finder</span>
          </div>
          <div className="text-4xl font-syne font-black leading-tight mt-8">
            Find your <em className="text-accent-2 not-italic">perfect PG.</em>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="font-syne font-black text-2xl block">100% Free</div>
            <span className="text-xs text-white/45">No hidden charges. Real, verified listings only.</span>
          </div>
          <div>
            <div className="font-syne font-black text-2xl block">2 min setup</div>
            <span className="text-xs text-white/45">Start searching your perfect PG immediately</span>
          </div>
          <div>
            <div className="font-syne font-black text-2xl block">1,200+</div>
            <span className="text-xs text-white/45">Verified PGs with accurate information</span>
          </div>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h2 className="font-syne text-2xl font-black mb-2 -tracking-[0.5px]">Create account</h2>
          <p className="text-sm text-muted mb-6">Join thousands finding their perfect PG</p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink-2 mb-1.5">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-2 mb-1.5">Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-2 mb-1.5">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-2 mb-1.5">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
                placeholder="Your phone number"
              />
            </div>

            {/* Info Box */}
            <div className="bg-green-l border border-green rounded-lg p-3 text-xs text-green">
              ✓ Searching for PG? Create account and start chatting with our AI
            </div>

            {error && (
              <div className="text-xs text-red-500 bg-red-50 p-3 rounded-lg">{error}</div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 font-semibold"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted">
            Already have an account?{' '}
            <Link href="/login" className="text-accent font-medium hover:underline">
              Log in
            </Link>
          </div>

          {/* Own a PG? */}
          <div className="mt-8 pt-6 border-t border-current border-opacity-[0.09]">
            <p className="text-center text-xs text-muted mb-3">Own a PG?</p>
            <Link
              href="/list"
              className="block w-full py-2.5 border-2 border-accent text-accent rounded-lg font-medium text-center hover:bg-accent hover:text-white transition"
            >
              📍 List Your PG
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
