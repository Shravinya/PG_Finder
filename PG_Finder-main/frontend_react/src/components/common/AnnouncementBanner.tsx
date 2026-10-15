'use client'

import { X } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Update {
  id: string
  title: string
  message: string
  type: 'announcement' | 'feature' | 'maintenance' | 'alert'
  isActive: boolean
  createdAt: string
}

const ICONS: Record<string, string> = {
  announcement: '📢',
  feature: '✨',
  maintenance: '🔧',
  alert: '⚠️',
}

export default function AnnouncementBanner() {
  const [updates, setUpdates] = useState<Update[]>([])
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem('pg_finder_updates')
    if (stored) {
      try {
        const all = JSON.parse(stored)
        const active = all.filter((u: Update) => u.isActive)
        if (active.length > 0) {
          setUpdates(active)
        }
      } catch (error) {
        // Silent fail
      }
    }
  }, [])

  const latestUpdate = updates[0]

  if (!latestUpdate || !isVisible) return null

  const getBackgroundColor = () => {
    switch (latestUpdate.type) {
      case 'announcement':
        return 'bg-gradient-to-r from-green-50 to-green-50/50 border-green-200'
      case 'feature':
        return 'bg-gradient-to-r from-blue-50 to-blue-50/50 border-blue-200'
      case 'maintenance':
        return 'bg-gradient-to-r from-yellow-50 to-yellow-50/50 border-yellow-200'
      case 'alert':
        return 'bg-gradient-to-r from-red-50 to-red-50/50 border-red-200'
      default:
        return 'bg-gradient-to-r from-accent/10 to-accent-2/10 border-accent/20'
    }
  }

  const getTextColor = () => {
    switch (latestUpdate.type) {
      case 'announcement':
        return 'text-green-900'
      case 'feature':
        return 'text-blue-900'
      case 'maintenance':
        return 'text-yellow-900'
      case 'alert':
        return 'text-red-900'
      default:
        return 'text-ink'
    }
  }

  return (
    <div className={`${getBackgroundColor()} border-b px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-50`}>
      <div className="flex items-start gap-2 sm:gap-3 max-w-4xl mx-auto flex-1">
        <span className="text-lg sm:text-xl flex-shrink-0 mt-0.5">{ICONS[latestUpdate.type]}</span>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm sm:text-base ${getTextColor()}`}>{latestUpdate.title}</p>
          <p className={`text-xs sm:text-sm ${getTextColor()} opacity-80 mt-0.5 line-clamp-2`}>{latestUpdate.message}</p>
        </div>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className={`p-1 hover:opacity-80 rounded-lg transition flex-shrink-0 ml-2 ${getTextColor()}`}
        aria-label="Dismiss announcement"
      >
        <X size={18} />
      </button>
    </div>
  )
}
