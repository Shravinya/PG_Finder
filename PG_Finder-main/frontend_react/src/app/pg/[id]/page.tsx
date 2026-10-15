'use client'

import { Star, MapPin, Wifi, Wind, Droplet, Shield, Users, Utensils, Navigation, Landmark, Building, ChevronRight, Phone, MessageSquare, Mail, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import apiClient from '@/lib/api'

const AMENITY_ICONS: Record<string, typeof Wifi> = {
  wifi: Wifi, ac_available: Wind, hot_water: Droplet, cctv: Shield,
  parking: Shield, laundry: Users, gym: Users,
}

const AMENITY_LABELS: Record<string, string> = {
  wifi: 'WiFi', ac_available: 'AC', hot_water: 'Hot Water', cctv: 'CCTV',
  parking: 'Parking', laundry: 'Laundry', gym: 'Gym',
}

interface PG {
  id: string; pg_name: string; area: string; address: string; phone: string;
  owner_name: string; description: string | null; nearby_landmarks: string | null;
  rent_single_ac: number | null; rent_single_nonac: number | null;
  rent_double_ac: number | null; rent_double_nonac: number | null;
  rent_triple_ac: number | null; rent_triple_nonac: number | null;
  rent_four_ac: number | null; rent_four_nonac: number | null;
  advance_months: number | null; advance_fixed: number | null; advance_note: string | null;
  electricity: string | null; electricity_fixed: number | null;
  wifi: number; ac_available: number; hot_water: number; cctv: number;
  parking: number; laundry: number; gym: number;
  food_included: number; food_type: string | null;
  curfew_time: string | null; visitors_allowed: number;
  cooking_allowed: number; pets_allowed: number;
  rooms_available: number | null; total_rooms: number | null;
  gender: string; latitude: number | null; longitude: number | null;
}

export default function PGDetailPage() {
  const params = useParams()
  const [pg, setPg] = useState<PG | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    if (!params?.id) return
    setLoading(true)
    apiClient.getPGDetails(params.id as string)
      .then(setPg)
      .catch(() => setError('Failed to load PG details'))
      .finally(() => setLoading(false))
  }, [params?.id])

  if (loading) return (
    <div className="min-h-[calc(100vh-60px)] bg-surface flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-accent" />
    </div>
  )

  if (error || !pg) return (
    <div className="min-h-[calc(100vh-60px)] bg-surface flex items-center justify-center">
      <p className="text-muted">{error || 'PG not found'}</p>
    </div>
  )

  const amenityList = Object.keys(AMENITY_LABELS)
    .filter(k => (pg as any)[k])
    .map(k => ({ name: AMENITY_LABELS[k], icon: AMENITY_ICONS[k] || Shield }))

  const roomTypes = [
    ...(pg.rent_single_nonac ? [{ type: 'Single Non-AC', price: pg.rent_single_nonac }] : []),
    ...(pg.rent_single_ac ? [{ type: 'Single AC', price: pg.rent_single_ac }] : []),
    ...(pg.rent_double_nonac ? [{ type: 'Double Non-AC', price: pg.rent_double_nonac }] : []),
    ...(pg.rent_double_ac ? [{ type: 'Double AC', price: pg.rent_double_ac }] : []),
    ...(pg.rent_triple_nonac ? [{ type: 'Triple Non-AC', price: pg.rent_triple_nonac }] : []),
    ...(pg.rent_triple_ac ? [{ type: 'Triple AC', price: pg.rent_triple_ac }] : []),
    ...(pg.rent_four_nonac ? [{ type: '4-Share Non-AC', price: pg.rent_four_nonac }] : []),
    ...(pg.rent_four_ac ? [{ type: '4-Share AC', price: pg.rent_four_ac }] : []),
  ]

  const landmarks = pg.nearby_landmarks?.split(',').map(s => s.trim()).filter(Boolean) || []

  const genderLabel = pg.gender?.toLowerCase() === 'any' ? 'Co-living (all genders)' : pg.gender === 'Male' ? "Men's PG" : "Women's PG"

  return (
    <div className="min-h-[calc(100vh-60px)] bg-surface pt-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Breadcrumb */}
        <div className="text-xs text-muted mb-6 flex items-center gap-1">
          <span className="cursor-pointer hover:text-accent">Find PG</span>
          <ChevronRight size={12} />
          <span className="text-accent">{pg.area}</span>
          <ChevronRight size={12} />
          <span className="text-muted">{pg.pg_name}</span>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="font-syne text-4xl font-black mb-2">{pg.pg_name}</h1>
            <div className="flex items-center gap-4 text-sm text-muted">
              <span className="flex items-center gap-1">
                <MapPin size={16} /> {pg.area} — {pg.address}
              </span>
              <span className="bg-surface border border-current border-opacity-[0.09] px-2.5 py-0.5 rounded-full text-xs font-medium">
                {genderLabel}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              isFavorite
                ? 'bg-accent text-white'
                : 'border border-accent text-accent hover:bg-accent hover:text-white'
            }`}
          >
            {isFavorite ? '❤️ Saved' : '🤍 Save'}
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left - Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photos */}
            <div className="bg-gradient-to-br from-surface to-blue-l border border-current border-opacity-[0.09] rounded-2xl h-80 flex items-center justify-center">
              <div className="text-center text-muted">
                <Building size={40} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">Photo gallery coming soon</p>
              </div>
            </div>

            {/* Description */}
            {pg.description && (
              <div className="bg-card border border-current border-opacity-[0.09] rounded-2xl p-6">
                <h3 className="font-syne font-bold text-lg mb-3">About</h3>
                <p className="text-sm text-muted leading-relaxed">{pg.description}</p>
              </div>
            )}

            {/* Nearby Landmarks */}
            {landmarks.length > 0 && (
              <div className="bg-card border border-current border-opacity-[0.09] rounded-2xl p-6">
                <h3 className="font-syne font-bold text-lg mb-4 flex items-center gap-2">
                  <Landmark size={18} className="text-accent" /> Nearby Landmarks
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {landmarks.map((lm, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-muted">
                      <Navigation size={14} className="mt-0.5 shrink-0 text-accent opacity-70" />
                      <span>{lm}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            <div className="bg-card border border-current border-opacity-[0.09] rounded-2xl p-6">
              <h3 className="font-syne font-bold text-lg mb-4">Availability & Rules</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted text-xs mb-1">Rooms Available</p>
                  <p className="font-medium">{pg.rooms_available ?? '?'} / {pg.total_rooms ?? '?'}</p>
                </div>
                <div>
                  <p className="text-muted text-xs mb-1">Curfew</p>
                  <p className="font-medium">{pg.curfew_time || 'No curfew'}</p>
                </div>
                <div>
                  <p className="text-muted text-xs mb-1">Visitors</p>
                  <p className="font-medium">{pg.visitors_allowed ? 'Allowed' : 'Not allowed'}</p>
                </div>
                <div>
                  <p className="text-muted text-xs mb-1">Cooking</p>
                  <p className="font-medium">{pg.cooking_allowed ? 'Allowed' : 'Not allowed'}</p>
                </div>
                <div>
                  <p className="text-muted text-xs mb-1">Pets</p>
                  <p className="font-medium">{pg.pets_allowed ? 'Allowed' : 'Not allowed'}</p>
                </div>
                {pg.food_included ? (
                  <div>
                    <p className="text-muted text-xs mb-1">Food</p>
                    <p className="font-medium">{pg.food_type || 'Included'}</p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-card border border-current border-opacity-[0.09] rounded-2xl p-6">
              <h3 className="font-syne font-bold text-lg mb-4">Amenities</h3>
              <div className="grid grid-cols-3 gap-4">
                {amenityList.map((a, i) => (
                  <div key={i} className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 bg-surface rounded-lg flex items-center justify-center">
                      <a.icon size={24} className="text-accent" />
                    </div>
                    <p className="text-xs font-medium">{a.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Room Types */}
            <div className="bg-card border border-current border-opacity-[0.09] rounded-2xl p-6">
              <h3 className="font-syne font-bold text-lg mb-4">Room Types & Pricing</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {roomTypes.map((room, i) => (
                  <div key={i} className="border border-current border-opacity-[0.09] rounded-lg p-4 text-center">
                    <p className="text-sm font-medium mb-2">{room.type}</p>
                    <p className="font-syne font-black text-accent text-lg">₹{room.price}</p>
                    <p className="text-xs text-muted mt-1">/month</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Contact Card */}
          <div>
            <div className="bg-card border border-current border-opacity-[0.09] rounded-2xl p-6 sticky top-24">
              <h3 className="font-syne font-bold text-lg mb-4">Contact Owner</h3>

              <div className="mb-6">
                <p className="text-sm font-medium mb-2">{pg.owner_name}</p>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span>Verified PG</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <a
                  href={`tel:${pg.phone}`}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-accent text-white rounded-lg font-medium hover:bg-[#d0460f] transition"
                >
                  <Phone size={16} /> Call owner
                </a>
                <a
                  href={`https://wa.me/${pg.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition"
                >
                  <MessageSquare size={16} /> WhatsApp
                </a>
              </div>

              <div className="bg-surface border border-current border-opacity-[0.09] rounded-lg p-4 text-xs text-muted">
                <p className="font-medium text-ink-2 mb-2">Why contact now?</p>
                <ul className="space-y-1 text-xs">
                  <li>✓ Get instant availability</li>
                  <li>✓ Ask about flexible terms</li>
                  <li>✓ Schedule a visit</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
