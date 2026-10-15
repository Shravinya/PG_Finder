'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { apiClient } from '@/lib/api'

interface PGForm {
  owner_name: string
  pg_name: string
  phone: string
  address: string
  area: string
  city: string
  gender: string
  total_rooms: number
  rooms_available: number
  electricity: string
  electricity_fixed: number | null
  advance_months: number
  advance_fixed: number | null
  food_included: boolean
  food_type: string
  wifi: boolean
  ac_available: boolean
  parking: boolean
  laundry: boolean
  gym: boolean
  hot_water: boolean
  attached_bathroom: boolean
  cctv: boolean
  curfew_time: string
  visitors_allowed: boolean
  cooking_allowed: boolean
  pets_allowed: boolean
  description: string
  nearby_landmarks: string
  rent_single_nonac: number | null
  rent_single_ac: number | null
  rent_double_nonac: number | null
  rent_double_ac: number | null
  rent_triple_nonac: number | null
  rent_triple_ac: number | null
  rent_four_nonac: number | null
  rent_four_ac: number | null
}

const AREAS = [
  'Ameerpet', 'Gachibowli', 'KPHB', 'Madhapur', 'Hitech City',
  'Banjara Hills', 'Kondapur', 'Kukatpally', 'Miyapur', 'JNTU',
]

const initialForm: PGForm = {
  owner_name: '', pg_name: '', phone: '', address: '', area: '', city: 'Hyderabad',
  gender: 'Any', total_rooms: 10, rooms_available: 5,
  electricity: 'included', electricity_fixed: null,
  advance_months: 2, advance_fixed: null,
  food_included: false, food_type: 'veg',
  wifi: false, ac_available: false, parking: false, laundry: false,
  gym: false, hot_water: true, attached_bathroom: false, cctv: false,
  curfew_time: '', visitors_allowed: false, cooking_allowed: false, pets_allowed: false,
  description: '', nearby_landmarks: '',
  rent_single_nonac: null, rent_single_ac: null,
  rent_double_nonac: null, rent_double_ac: null,
  rent_triple_nonac: null, rent_triple_ac: null,
  rent_four_nonac: null, rent_four_ac: null,
}

export default function AddPGPage() {
  const router = useRouter()
  const [form, setForm] = useState<PGForm>(initialForm)
  const [isLoading, setIsLoading] = useState(false)

  const update = (field: keyof PGForm, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.pg_name || !form.area || !form.owner_name) {
      toast.error('PG Name, Area, and Owner Name are required')
      return
    }

    setIsLoading(true)
    try {
      const result = await apiClient.adminAddPG(form)
      toast.success(`PG "${form.pg_name}" added!`)
      router.push('/admin/dashboard')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to add PG')
    } finally {
      setIsLoading(false)
    }
  }

  const setPrice = (field: keyof PGForm, val: string) =>
    update(field, val === '' ? null : parseInt(val))

  return (
    <div className="min-h-[calc(100vh-60px)] bg-surface p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-syne text-3xl font-black mb-2">Add New PG Listing</h1>
          <p className="text-muted">Field officer: enter verified PG details</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-current border-opacity-[0.09] rounded-2xl p-8 space-y-8">
          {/* Basic Info */}
          <section>
            <h2 className="font-syne font-bold text-lg mb-4">Basic Info</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-2 mb-1">PG Name *</label>
                <input value={form.pg_name} onChange={(e) => update('pg_name', e.target.value)} className="input-field" placeholder="e.g. Green Valley PG" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-2 mb-1">Area *</label>
                <select value={form.area} onChange={(e) => update('area', e.target.value)} className="input-field" required>
                  <option value="">Select Area</option>
                  {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-ink-2 mb-1">Address</label>
                <input value={form.address} onChange={(e) => update('address', e.target.value)} className="input-field" placeholder="Full address" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-2 mb-1">Owner Name *</label>
                <input value={form.owner_name} onChange={(e) => update('owner_name', e.target.value)} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-2 mb-1">Phone</label>
                <input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input-field" placeholder="Contact number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-2 mb-1">Gender</label>
                <select value={form.gender} onChange={(e) => update('gender', e.target.value)} className="input-field">
                  <option value="Any">Any</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink-2 mb-1">Total Rooms</label>
                  <input type="number" value={form.total_rooms} onChange={(e) => update('total_rooms', parseInt(e.target.value))} className="input-field" min={1} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-2 mb-1">Available</label>
                  <input type="number" value={form.rooms_available} onChange={(e) => update('rooms_available', parseInt(e.target.value))} className="input-field" min={0} />
                </div>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section>
            <h2 className="font-syne font-bold text-lg mb-4">Room Pricing (₹/month)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                ['Single Non-AC', 'rent_single_nonac'],
                ['Single AC', 'rent_single_ac'],
                ['Double Non-AC', 'rent_double_nonac'],
                ['Double AC', 'rent_double_ac'],
                ['Triple Non-AC', 'rent_triple_nonac'],
                ['Triple AC', 'rent_triple_ac'],
                ['4-Share Non-AC', 'rent_four_nonac'],
                ['4-Share AC', 'rent_four_ac'],
              ].map(([label, field]) => (
                <div key={field}>
                  <label className="block text-xs text-muted mb-1">{label}</label>
                  <input type="number" value={(form as any)[field] ?? ''} onChange={(e) => setPrice(field as keyof PGForm, e.target.value)} className="input-field" placeholder="—" min={0} />
                </div>
              ))}
            </div>
          </section>

          {/* Advance & Electricity */}
          <section>
            <h2 className="font-syne font-bold text-lg mb-4">Advance & Electricity</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-2 mb-1">Advance (months)</label>
                <input type="number" value={form.advance_months} onChange={(e) => update('advance_months', parseInt(e.target.value))} className="input-field" min={0} />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-2 mb-1">Advance Fixed (₹)</label>
                <input type="number" value={form.advance_fixed ?? ''} onChange={(e) => update('advance_fixed', e.target.value === '' ? null : parseInt(e.target.value))} className="input-field" placeholder="Leave blank if months-based" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-2 mb-1">Electricity</label>
                <select value={form.electricity} onChange={(e) => update('electricity', e.target.value)} className="input-field">
                  <option value="included">Included in rent</option>
                  <option value="extra_actual">Extra (actual usage)</option>
                  <option value="extra_fixed">Extra (fixed monthly)</option>
                </select>
              </div>
              {form.electricity === 'extra_fixed' && (
                <div>
                  <label className="block text-sm font-medium text-ink-2 mb-1">Electricity Fixed Amount</label>
                  <input type="number" value={form.electricity_fixed ?? ''} onChange={(e) => update('electricity_fixed', e.target.value === '' ? null : parseInt(e.target.value))} className="input-field" />
                </div>
              )}
            </div>
          </section>

          {/* Amenities */}
          <section>
            <h2 className="font-syne font-bold text-lg mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ['wifi', 'WiFi'], ['ac_available', 'AC'], ['parking', 'Parking'],
                ['laundry', 'Laundry'], ['gym', 'Gym'], ['hot_water', 'Hot Water'],
                ['attached_bathroom', 'Attached Bathroom'], ['cctv', 'CCTV'],
                ['food_included', 'Food Included'],
              ].map(([field, label]) => (
                <label key={field} className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface cursor-pointer">
                  <input type="checkbox" checked={(form as any)[field]} onChange={(e) => update(field as keyof PGForm, e.target.checked)} className="w-4 h-4" />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
              {form.food_included && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-ink-2 mb-1">Food Type</label>
                  <select value={form.food_type} onChange={(e) => update('food_type', e.target.value)} className="input-field">
                    <option value="veg">Veg</option>
                    <option value="nonveg">Non-Veg</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              )}
            </div>
          </section>

          {/* Rules */}
          <section>
            <h2 className="font-syne font-bold text-lg mb-4">Rules</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-2 mb-1">Curfew Time</label>
                <input value={form.curfew_time} onChange={(e) => update('curfew_time', e.target.value)} className="input-field" placeholder="e.g. 10:00 PM" />
              </div>
              {[
                ['visitors_allowed', 'Visitors Allowed'],
                ['cooking_allowed', 'Cooking Allowed'],
                ['pets_allowed', 'Pets Allowed'],
              ].map(([field, label]) => (
                <label key={field} className="flex items-center gap-2 p-3 rounded-lg hover:bg-surface cursor-pointer border border-current border-opacity-[0.09]">
                  <input type="checkbox" checked={(form as any)[field]} onChange={(e) => update(field as keyof PGForm, e.target.checked)} className="w-4 h-4" />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Extra */}
          <section>
            <h2 className="font-syne font-bold text-lg mb-4">Additional Info</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-2 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => update('description', e.target.value)} className="input-field h-24" placeholder="PG features, nearby facilities..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-2 mb-1">Nearby Landmarks</label>
                <textarea value={form.nearby_landmarks} onChange={(e) => update('nearby_landmarks', e.target.value)} className="input-field h-20" placeholder="Near metro, bus stop, landmarks..." />
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="flex gap-4 pt-4 border-t border-current border-opacity-[0.09]">
            <button type="submit" disabled={isLoading} className="btn-primary flex-1 py-3 font-semibold">
              {isLoading ? 'Adding PG...' : 'Add PG Listing'}
            </button>
            <button type="button" onClick={() => router.push('/admin/dashboard')} className="btn-ghost py-3 font-semibold px-8">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
