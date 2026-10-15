'use client'

import { useState, useEffect } from 'react'
import { Trash2, Plus, Edit2, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Update {
  id: string
  title: string
  message: string
  type: 'announcement' | 'feature' | 'maintenance' | 'alert'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function UpdatesManagerPage() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [updates, setUpdates] = useState<Update[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<{
    title: string
    message: string
    type: 'announcement' | 'feature' | 'maintenance' | 'alert'
    isActive: boolean
  }>({
    title: '',
    message: '',
    type: 'announcement',
    isActive: true,
  })

  const TYPES = [
    { value: 'announcement', label: '📢 Announcement', color: 'accent' },
    { value: 'feature', label: '✨ New Feature', color: 'green' },
    { value: 'maintenance', label: '🔧 Maintenance', color: 'blue' },
    { value: 'alert', label: '⚠️ Alert', color: 'red' },
  ]

  useEffect(() => {
    // Check admin authorization
    const adminToken = localStorage.getItem('adminToken')

    if (!adminToken) {
      window.location.href = '/admin/login'
      return
    }

    setIsAuthorized(true)
    loadUpdates()
  }, [])

  const loadUpdates = async () => {
    try {
      setIsLoading(true)
      // Load from localStorage for MVP
      const stored = localStorage.getItem('pg_finder_updates')
      if (stored) {
        setUpdates(JSON.parse(stored))
      }
    } catch (error) {
      toast.error('Failed to load updates')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddUpdate = () => {
    if (!formData.title || !formData.message) {
      toast.error('Please fill all fields')
      return
    }

    const now = new Date().toISOString()

    if (editingId) {
      // Update existing
      setUpdates(
        updates.map((u) =>
          u.id === editingId
            ? {
                ...u,
                title: formData.title,
                message: formData.message,
                type: formData.type,
                isActive: formData.isActive,
                updatedAt: now,
              }
            : u
        )
      )
      setEditingId(null)
      toast.success('Update updated!')
    } else {
      // Add new
      const newUpdate: Update = {
        id: Date.now().toString(),
        title: formData.title,
        message: formData.message,
        type: formData.type,
        isActive: formData.isActive,
        createdAt: now,
        updatedAt: now,
      }
      setUpdates([newUpdate, ...updates])
      toast.success('Update posted!')
    }

    // Save to localStorage
    const updatedList = editingId
      ? updates.map((u) =>
          u.id === editingId
            ? {
                ...u,
                title: formData.title,
                message: formData.message,
                type: formData.type,
                isActive: formData.isActive,
              }
            : u
        )
      : [
          {
            id: Date.now().toString(),
            title: formData.title,
            message: formData.message,
            type: formData.type,
            isActive: formData.isActive,
            createdAt: now,
            updatedAt: now,
          },
          ...updates,
        ]

    localStorage.setItem('pg_finder_updates', JSON.stringify(updatedList))

    setFormData({
      title: '',
      message: '',
      type: 'announcement',
      isActive: true,
    })
    setShowForm(false)
  }

  const handleEdit = (update: Update) => {
    setFormData({
      title: update.title,
      message: update.message,
      type: update.type,
      isActive: update.isActive,
    })
    setEditingId(update.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this update?')) {
      const filtered = updates.filter((u) => u.id !== id)
      setUpdates(filtered)
      localStorage.setItem('pg_finder_updates', JSON.stringify(filtered))
      toast.success('Update deleted!')
    }
  }

  const handleToggleActive = (id: string) => {
    const updated = updates.map((u) =>
      u.id === id ? { ...u, isActive: !u.isActive } : u
    )
    setUpdates(updated)
    localStorage.setItem('pg_finder_updates', JSON.stringify(updated))
    toast.success('Update status changed!')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    } as any)
  }

  if (!isAuthorized) return null

  const activeUpdates = updates.filter((u) => u.isActive)
  const inactiveUpdates = updates.filter((u) => !u.isActive)

  return (
    <div className="min-h-[calc(100vh-60px)] bg-surface p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="font-syne text-3xl font-black mb-2">📢 Updates & Announcements</h1>
            <p className="text-muted">Post updates that users see on the homepage and chat interface</p>
          </div>
          <Link href="/admin/dashboard" className="btn-ghost">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-card border border-current border-opacity-[0.09] rounded-2xl p-8 mb-8">
            <h2 className="font-syne font-bold text-lg mb-6">
              {editingId ? '✏️ Edit Update' : '➕ Post New Update'}
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-ink-2 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="input-field"
                  placeholder="e.g., New PGs in Madhapur"
                  maxLength={80}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-2 mb-2">Message *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="input-field h-32"
                  placeholder="Write your update message here..."
                  maxLength={500}
                />
                <p className="text-xs text-muted mt-1">
                  {formData.message.length}/500 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-2 mb-2">Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() =>
                        setFormData({ ...formData, type: type.value as any })
                      }
                      className={`p-3 rounded-lg border-2 text-left font-medium transition ${
                        formData.type === type.value
                          ? `border-${type.color} bg-${type.color}/10 text-${type.color}`
                          : 'border-current border-opacity-[0.09] text-ink-2 hover:border-accent'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-ink-2">
                  Publish immediately (users will see this update)
                </label>
              </div>

              <div className="flex gap-3">
                <button onClick={handleAddUpdate} className="btn-primary flex-1 py-3 font-semibold">
                  {editingId ? '💾 Save Changes' : '📤 Post Update'}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                    setFormData({
                      title: '',
                      message: '',
                      type: 'announcement',
                      isActive: true,
                    })
                  }}
                  className="btn-ghost py-3 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Updates */}
        {!showForm && (
          <div className="mb-8">
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary text-sm flex items-center gap-2 mb-6"
            >
              <Plus size={16} />
              Post New Update
            </button>
          </div>
        )}

        {/* Active Updates Section */}
        {activeUpdates.length > 0 && (
          <div className="mb-8">
            <h2 className="font-syne font-bold text-lg mb-4">🟢 Live Updates ({activeUpdates.length})</h2>
            <div className="space-y-4">
              {activeUpdates.map((update) => {
                const typeInfo = TYPES.find((t) => t.value === update.type)
                return (
                  <div
                    key={update.id}
                    className="bg-card border border-current border-opacity-[0.09] rounded-xl p-6"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{typeInfo?.label.split(' ')[0]}</span>
                          <h3 className="font-semibold text-ink">{update.title}</h3>
                        </div>
                        <p className="text-sm text-muted whitespace-pre-wrap">{update.message}</p>
                      </div>

                      <div className="flex gap-2 flex-shrink-0 ml-4">
                        <button
                          onClick={() => handleEdit(update)}
                          className="p-2 hover:bg-surface rounded-lg transition"
                        >
                          <Edit2 size={18} className="text-muted" />
                        </button>
                        <button
                          onClick={() => handleDelete(update.id)}
                          className="p-2 hover:bg-surface rounded-lg transition"
                        >
                          <Trash2 size={18} className="text-red-500" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted">
                      <Clock size={14} />
                      {formatDate(update.updatedAt)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Inactive Updates Section */}
        {inactiveUpdates.length > 0 && (
          <div>
            <h2 className="font-syne font-bold text-lg mb-4">⚪ Draft Updates ({inactiveUpdates.length})</h2>
            <div className="space-y-4">
              {inactiveUpdates.map((update) => {
                const typeInfo = TYPES.find((t) => t.value === update.type)
                return (
                  <div
                    key={update.id}
                    className="bg-card border border-current border-opacity-[0.09] rounded-xl p-6 opacity-60"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{typeInfo?.label.split(' ')[0]}</span>
                          <h3 className="font-semibold text-ink">{update.title}</h3>
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Draft</span>
                        </div>
                        <p className="text-sm text-muted whitespace-pre-wrap">{update.message}</p>
                      </div>

                      <div className="flex gap-2 flex-shrink-0 ml-4">
                        <button
                          onClick={() => handleToggleActive(update.id)}
                          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                        >
                          Publish
                        </button>
                        <button
                          onClick={() => handleEdit(update)}
                          className="p-2 hover:bg-surface rounded-lg transition"
                        >
                          <Edit2 size={18} className="text-muted" />
                        </button>
                        <button
                          onClick={() => handleDelete(update.id)}
                          className="p-2 hover:bg-surface rounded-lg transition"
                        >
                          <Trash2 size={18} className="text-red-500" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted">
                      <Clock size={14} />
                      Created: {formatDate(update.createdAt)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12 text-muted">Loading...</div>
        )}

        {!isLoading && activeUpdates.length === 0 && inactiveUpdates.length === 0 && !showForm && (
          <div className="text-center py-12">
            <p className="text-muted mb-4">No updates yet. Create your first one!</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus size={16} />
              Post First Update
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
