'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    const storedUserName = localStorage.getItem('userName')
    const storedUserRole = localStorage.getItem('userRole')
    
    if (token && storedUserName && storedUserRole) {
      setUserName(storedUserName)
      setUserRole(storedUserRole)
    }

    // Handle scroll for navbar collapse
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Show navbar when scrolled to top
      if (currentScrollY < 50) {
        setIsVisible(true)
        setIsScrolled(false)
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down - hide navbar
        setIsVisible(false)
        setIsScrolled(true)
      } else {
        // Scrolling up - show navbar
        setIsVisible(true)
        setIsScrolled(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    localStorage.removeItem('userRole')
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminEmail')
    localStorage.removeItem('adminName')
    setUserName(null)
    setUserRole(null)
    router.push('/')
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 bg-card border-b border-current border-opacity-[0.09] z-50 h-nav-height transition-transform duration-300 ease-in-out ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    } ${isScrolled ? 'shadow-lg' : ''}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-full">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-syne font-black text-lg -tracking-[0.5px]">
          PG<span className="bg-accent text-white px-[7px] py-[2px] rounded text-sm">Finder</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 items-center">
          <Link href="/chat" className="text-sm text-ink-2 font-medium hover:text-accent transition">
            Find a PG
          </Link>
          <Link href="/list" className="text-sm text-ink-2 font-medium hover:text-accent transition">
            Own a PG? 📍
          </Link>
          <Link href="/#about" className="text-sm text-ink-2 font-medium hover:text-accent transition">
            About
          </Link>
          {userRole === 'admin' && (
            <Link href="/admin/dashboard" className="text-sm text-accent font-medium hover:text-accent transition border-b-2 border-accent">
              Admin Dashboard
            </Link>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex gap-2 items-center">
          {userName ? (
            <>
              <span className="text-sm text-ink-2">Hi, {userName}</span>
              <button
                onClick={handleLogout}
                className="btn-ghost"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push('/login')}
                className="btn-ghost"
              >
                Log in
              </button>
              <button
                onClick={() => router.push('/signup')}
                className="btn-primary"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-card border-t border-current border-opacity-[0.09]">
          <div className="px-6 py-4 flex flex-col gap-3">
            <Link href="/chat" className="text-sm text-ink-2 font-medium">Find a PG</Link>
            <Link href="/list" className="text-sm text-ink-2 font-medium">Own a PG? 📍</Link>
            <Link href="/#about" className="text-sm text-ink-2 font-medium">About</Link>
            {userRole === 'admin' && (
              <Link href="/admin/dashboard" className="text-sm text-accent font-medium">Admin Dashboard</Link>
            )}
            {userName ? (
              <>
                <div className="text-sm text-ink-2 border-t border-current border-opacity-[0.09] pt-3 mt-3">Hi, {userName}</div>
                <button onClick={handleLogout} className="btn-ghost w-full text-sm text-left">Logout</button>
              </>
            ) : (
              <>
                <button onClick={() => router.push('/login')} className="btn-ghost w-full text-sm">Log in</button>
                <button onClick={() => router.push('/signup')} className="btn-primary w-full text-sm">Get Started</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
