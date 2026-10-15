'use client'

import { useState, useEffect } from 'react'
import { Trash2, Plus, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Stat {
  id: string
  label: string
  value: string
  icon?: string
  color?: string
  order: number
}

const COLORS = ['accent', 'green', 'blue', 'accent-2']
const ICONS = ['📊', '📈', '⭐', '📍', '👥', '🏠', '💬', '✅']

const DEFAULT_STATS: Stat[] = [
  { id: '1', label: 'Total PGs', value: '1,200+', icon: '🏠', color: 'accent', order: 1 },
  { id: '2', label: 'Active Listings', value: '1,156', icon: '✅', color: 'green', order: 2 },
  { id: '3', label: 'Happy Tenants', value: '5,000+', icon: '👥', color: 'blue', order: 3 },
  { id: '4', label: 'Avg Rating', value: '4.7★', icon: '⭐', color: 'accent-2', order: 4 },
]

export default function StatsManagerPage() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [stats, setStats] = useState<Stat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ label: '', value: '', icon: '📊', color: 'accent' })

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken')
    if (!adminToken) {
      window.location.href = '/admin/login'
      return
    }
    setIsAuthorized(true)
    loadStats()
  }, [])

  const loadStats = () => {
    setIsLoading(true)
    const stored = localStorage.getItem('pg_finder_stats')
    setStats(stored ? JSON.parse(stored) : DEFAULT_STATS)
    setIsLoading(false)
  }

  const saveStats = (updated: Stat[]) => {
    setStats(updated)
    localStorage.setItem('pg_finder_stats', JSON.stringify(updated))
  }

  const handleAddStat = () => {
    if (!formData.label || !formData.value) {
      toast.error('Please fill all fields')
      return
    }

    if (editingId) {
      const updated = stats.map((s) =>
        s.id === editingId ? { ...s, label: formData.label, value: formData.value, icon: formData.icon, color: formData.color } : s
      )
      saveStats(updated)
      setEditingId(null)
      toast.success('Stat updated!')
    } else {
      const newStat: Stat = {
        id: Date.now().toString(),
        label: formData.label,
        value: formData.value,
        icon: formData.icon,
        color: formData.color,
        order: stats.length + 1,
      }
      saveStats([...stats, newStat])
      toast.success('Stat added!')
    }

    setFormData({ label: '', value: '', icon: '📊', color: 'accent' })
    setShowForm(false)
  }

  const handleEdit = (stat: Stat) => {
    setFormData({ label: stat.label, value: stat.value, icon: stat.icon || '📊', color: stat.color || 'accent' })
    setEditingId(stat.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this stat?')) {
      saveStats(stats.filter((s) => s.id !== id))
      toast.success('Stat deleted!')
    }
  }

  if (!isAuthorized) return null

  return (
    <div className="min-h-[calc(100vh-60px)] bg-surface p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="font-syne text-3xl font-black mb-2">📊 Stats Manager</h1>
            <p className="text-muted">Manage platform statistics displayed on the landing page</p>
          </div>
          <Link href="/admin/dashboard" className="btn-ghost">← Back to Dashboard</Link>
        </div>

        {showForm && (
          <div className="bg-card border border-current border-opacity-[0.09] rounded-2xl p-8 mb-8">
            <h2 className="font-syne font-bold text-lg mb-6">{editingId ? '✏️ Edit Stat' : '➕ Add New Stat'}</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-ink-2 mb-2">Label *</label>
                <input type="text" value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })} className="input-field" placeholder="e.g., Total PGs" maxLength={30} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-2 mb-2">Value *</label>
                <input type="text" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} className="input-field" placeholder="e.g., 1,200+" maxLength={20} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-2 mb-2">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((icon) => (
                    <button key={icon} onClick={() => setFormData({ ...formData, icon })}
                      className={`w-12 h-12 flex items-center justify-center text-2xl rounded-lg border-2 transition ${formData.icon === icon ? 'border-accent bg-accent/10' : 'border-current border-opacity-[0.09] hover:border-accent'}`}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-2 mb-2">Color</label>
                <div className="flex gap-3">
                  {COLORS.map((color) => (
                    <button key={color} onClick={() => setFormData({ ...formData, color })}
                      className={`px-4 py-2 rounded-lg font-semibold transition border-2 ${formData.color === color ? 'bg-accent text-white border-accent' : 'border-current border-opacity-[0.09] hover:border-accent text-ink-2'}`}>
                      {color}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleAddStat} className="btn-primary flex-1 py-3 font-semibold">{editingId ? '💾 Save Changes' : '➕ Add Stat'}</button>
                <button onClick={() => { setShowForm(false); setEditingId(null); setFormData({ label: '', value: '', icon: '📊', color: 'accent' }) }} className="btn-ghost py-3 font-semibold">Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-card border border-current border-opacity-[0.09] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-current border-opacity-[0.09] flex justify-between items-center">
            <h2 className="font-syne font-bold text-lg">Current Stats ({stats.length})</h2>
            {!showForm && (
              <button onClick={() => setShowForm(true)} className="btn-primary text-sm flex items-center gap-2">
                <Plus size={16} /> Add Stat
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-muted">Loading...</div>
          ) : stats.length === 0 ? (
            <div className="p-8 text-center text-muted">No stats yet. Add your first stat!</div>
          ) : (
            <div className="divide-y divide-current divide-opacity-[0.09]">
              {stats.map((stat) => (
                <div key={stat.id} className="p-6 flex items-center justify-between hover:bg-surface transition">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{stat.icon}</div>
                    <div>
                      <p className="font-semibold text-ink">{stat.label}</p>
                      <p className="font-syne text-xl font-black text-accent">{stat.value}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(stat)} className="p-2 hover:bg-surface rounded-lg transition"><Edit2 size={18} className="text-muted" /></button>
                    <button onClick={() => handleDelete(stat.id)} className="p-2 hover:bg-surface rounded-lg transition"><Trash2 size={18} className="text-red-500" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="mt-8">
          <h2 className="font-syne font-bold text-lg mb-4">📱 Preview (how it looks on homepage)</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.id} className="bg-card border border-current border-opacity-[0.09] rounded-xl p-6 text-center">
                <p className="text-sm text-muted mb-2">{stat.label}</p>
                <div className="text-2xl mb-1">{stat.icon}</div>
                <p className="font-syne text-2xl font-black text-accent">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
