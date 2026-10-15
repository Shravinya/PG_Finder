'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    try {
      const { apiClient } = await import('@/lib/api')
      const response = await apiClient.login(email, password)
      apiClient.setToken(response.access_token)
      
      // Store user role
      localStorage.setItem('userRole', response.user?.role || 'user')
      localStorage.setItem('userName', response.user?.name || 'User')
      
      // Check if user is admin
      if (response.user?.role === 'admin') {
        // Store admin session
        localStorage.setItem('adminToken', response.access_token)
        localStorage.setItem('adminEmail', response.user.email)
        localStorage.setItem('adminName', response.user.name)
        toast.success('Welcome Admin!')
        router.push('/admin/dashboard')
      } else {
        // Regular user
        toast.success('Welcome back!')
        router.push('/chat')
      }
    } catch (err) {
      toast.error(error || 'Login failed')
    }
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
            Welcome <em className="text-accent-2 not-italic">back.</em>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="font-syne font-black text-2xl block">5,000+</div>
            <span className="text-xs text-white/45">Happy tenants found their homes</span>
          </div>
          <div>
            <div className="font-syne font-black text-2xl block">1,200+</div>
            <span className="text-xs text-white/45">PGs verified and listed</span>
          </div>
          <div>
            <div className="font-syne font-black text-2xl block">4.7★</div>
            <span className="text-xs text-white/45">Average rating from real tenants</span>
          </div>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h2 className="font-syne text-2xl font-black mb-2 -tracking-[0.5px]">Log in</h2>
          <p className="text-sm text-muted mb-8">Enter your credentials to access your account</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-ink-2 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-2 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="text-xs text-red-500 bg-red-50 p-3 rounded-lg">{error}</div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 font-semibold"
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted">
            Don't have an account?{' '}
            <Link href="/signup" className="text-accent font-medium hover:underline">
              Sign up for free
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
