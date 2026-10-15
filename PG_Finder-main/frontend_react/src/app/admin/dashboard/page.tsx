'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Eye, Trash2, Plus, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [pgs, setPgs] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null)
  const [contactCounts, setContactCounts] = useState<Record<string, number>>({})
  const [visitorInfo, setVisitorInfo] = useState<any>(null)

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken')
    if (!adminToken) {
      router.push('/admin/login')
      return
    }
    apiClient.setToken(adminToken)
    setIsAuthorized(true)
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [pgData, statsData, visitorData] = await Promise.all([
        apiClient.listPGs(),
        apiClient.getStats(),
        apiClient.getVisitorStats().catch(() => null),
      ])
      if (visitorData) setVisitorInfo(visitorData)
      const pgsList = pgData.pgs || []
      setPgs(pgsList)
      setStats(statsData)

      // Fetch contact counts for all PGs
      const counts: Record<string, number> = {}
      await Promise.all(
        pgsList.map(async (pg: any) => {
          try {
            const res = await apiClient.getPGContactCount(pg.id)
            counts[pg.id] = res.contact_count || 0
          } catch {
            counts[pg.id] = 0
          }
        })
      )
      setContactCounts(counts)
    } catch (err: any) {
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeactivate = async (pgId: string, name: string) => {
    if (!confirm(`Deactivate "${name}"? It will be hidden from search.`)) return
    setDeactivatingId(pgId)
    try {
      await apiClient.adminDeactivatePG(pgId)
      toast.success(`${name} deactivated`)
      loadData()
    } catch {
      toast.error('Failed to deactivate')
    } finally {
      setDeactivatingId(null)
    }
  }

  if (!isAuthorized) return null

  const activePGs = pgs.filter((p: any) => p.is_active !== 0)
  const totalPGs = pgs.length

  return (
    <div className="min-h-[calc(100vh-60px)] bg-surface p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="font-syne text-3xl font-black mb-2">Admin Dashboard</h1>
            <p className="text-muted">Manage PG listings — add, deactivate, or review</p>
          </div>
          <div className="flex gap-3">
            <button onClick={loadData} className="btn-ghost flex items-center gap-2" disabled={isLoading}>
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <Link href="/admin/add-pg" className="btn-primary flex items-center gap-2">
              <Plus size={20} />
              Add New PG
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-current border-opacity-[0.09] rounded-xl p-6">
            <p className="text-sm text-muted mb-2">Total PGs</p>
            <p className="font-syne text-2xl font-black text-accent">{totalPGs}</p>
          </div>
          <div className="bg-card border border-current border-opacity-[0.09] rounded-xl p-6">
            <p className="text-sm text-muted mb-2">Active Listings</p>
            <p className="font-syne text-2xl font-black text-green-600">{activePGs.length}</p>
          </div>
          <div className="bg-card border border-current border-opacity-[0.09] rounded-xl p-6">
            <p className="text-sm text-muted mb-2">Areas Covered</p>
            <p className="font-syne text-2xl font-black text-blue-600">{stats?.total_areas || 0}</p>
          </div>
          <div className="bg-card border border-current border-opacity-[0.09] rounded-xl p-6">
            <p className="text-sm text-muted mb-2">Price Range</p>
            <p className="font-syne text-2xl font-black text-ink-2">
              ₹{stats?.price_range?.min || '—'} – ₹{stats?.price_range?.max || '—'}
            </p>
          </div>
        </div>

        {/* Visitor Stats */}
        {visitorInfo && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border border-current border-opacity-[0.09] rounded-xl p-6">
              <p className="text-xs text-muted mb-1">Total Visitors</p>
              <p className="font-syne text-2xl font-black">{visitorInfo.total_visitors}</p>
            </div>
            <div className="bg-card border border-current border-opacity-[0.09] rounded-xl p-6">
              <p className="text-xs text-muted mb-1">Today</p>
              <p className="font-syne text-2xl font-black text-accent">{visitorInfo.today_visitors}</p>
            </div>
            <div className="bg-card border border-current border-opacity-[0.09] rounded-xl p-6">
              <p className="text-xs text-muted mb-1">Unique Visitors</p>
              <p className="font-syne text-2xl font-black text-blue-600">{visitorInfo.unique_visitors}</p>
            </div>
            <div className="bg-card border border-current border-opacity-[0.09] rounded-xl p-6">
              <p className="text-xs text-muted mb-1">Total Contact Inquiries</p>
              <p className="font-syne text-2xl font-black text-green-600">{Object.values(contactCounts).reduce((a: number, b: number) => a + b, 0)}</p>
            </div>
          </div>
        )}

        {/* PG List */}
        <div className="bg-card border border-current border-opacity-[0.09] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-current border-opacity-[0.09] flex justify-between items-center">
            <h2 className="font-syne font-bold text-lg">All PG Listings ({totalPGs})</h2>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-muted">Loading...</div>
          ) : pgs.length === 0 ? (
            <div className="p-12 text-center text-muted">
              <p className="mb-4">No PGs found in the database.</p>
              <Link href="/admin/add-pg" className="btn-primary inline-flex items-center gap-2">
                <Plus size={16} /> Add Your First PG
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface border-b border-current border-opacity-[0.09]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-ink-2">PG Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-ink-2">Area</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-ink-2">Rent</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-ink-2">Gender</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-ink-2">Rooms</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-ink-2">Contacts</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-ink-2">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-ink-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pgs.map((pg: any) => {
                    const rent = pg.rent_single_nonac || pg.rent_double_nonac || pg.rent_single_ac || '—'
                    const available = pg.rooms_available ?? '?'
                    const total = pg.total_rooms ?? '?'
                    const isActive = pg.is_active !== 0
                    const contactCount = contactCounts[pg.id] ?? 0
                    return (
                      <tr key={pg.id} className="border-b border-current border-opacity-[0.09] hover:bg-surface transition">
                        <td className="px-6 py-4 font-medium text-ink">{pg.pg_name}</td>
                        <td className="px-6 py-4 text-sm text-muted">{pg.area}</td>
                        <td className="px-6 py-4 font-semibold text-accent">₹{rent}</td>
                        <td className="px-6 py-4 text-sm">{pg.gender}</td>
                        <td className="px-6 py-4 text-sm">{available}/{total}</td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-accent">{contactCount}</span>
                          <span className="text-xs text-muted ml-1">contacts</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            isActive ? 'bg-green-l text-green-700' : 'bg-red-l text-red-600'
                          }`}>
                            {isActive ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          <button
                            onClick={() => router.push(`/pg/${pg.id}`)}
                            className="p-2 hover:bg-surface rounded-lg transition"
                            title="View"
                          >
                            <Eye size={18} className="text-muted" />
                          </button>
                          <button
                            onClick={() => handleDeactivate(pg.id, pg.pg_name)}
                            disabled={deactivatingId === pg.id || !isActive}
                            className="p-2 hover:bg-surface rounded-lg transition disabled:opacity-30"
                            title={isActive ? 'Deactivate' : 'Already deactivated'}
                          >
                            <Trash2 size={18} className="text-red-500" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Link href="/admin/add-pg" className="bg-card border border-current border-opacity-[0.09] rounded-xl p-6 hover:border-accent transition">
            <h3 className="font-semibold text-ink-2 mb-2">+ Add New PG</h3>
            <p className="text-sm text-muted">Add a PG listing with details & amenities</p>
          </Link>
          <Link href="/admin/stats-manager" className="bg-card border border-current border-opacity-[0.09] rounded-xl p-6 hover:border-accent transition">
            <h3 className="font-semibold text-ink-2 mb-2">View Stats</h3>
            <p className="text-sm text-muted">Platform statistics & visitor analytics</p>
          </Link>
          <Link href="/admin/updates" className="bg-card border border-current border-opacity-[0.09] rounded-xl p-6 hover:border-accent transition">
            <h3 className="font-semibold text-ink-2 mb-2">Post Updates</h3>
            <p className="text-sm text-muted">Create user announcements</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
