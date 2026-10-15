'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface PGMapProps {
  pgs: any[]
  className?: string
}

const HYDERABAD_CENTER: [number, number] = [17.385, 78.4867]

export default function PGMap({ pgs, className = '' }: PGMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: HYDERABAD_CENTER,
      zoom: 11,
      zoomControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer)
      }
    })

    const validPGs = pgs.filter(
      (pg) => pg.latitude != null && pg.longitude != null
    )

    if (validPGs.length === 0) return

    const bounds = L.latLngBounds([])
    const markerIcon = L.divIcon({
      html: '<div style="background:#E8531A;color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,0.3)">📍</div>',
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    })

    validPGs.forEach((pg) => {
      const lat = parseFloat(pg.latitude)
      const lng = parseFloat(pg.longitude)
      if (isNaN(lat) || isNaN(lng)) return

      const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map)
      const rent = pg.rent_single_nonac || pg.rent_double_nonac || ''
      marker.bindPopup(`
        <div style="font-family:sans-serif;min-width:150px">
          <strong style="font-size:14px">${pg.pg_name || 'PG'}</strong><br/>
          <span style="color:#666;font-size:12px">${pg.area || ''}</span>
          ${rent ? `<br/><span style="color:#E8531A;font-weight:bold">₹${rent}/mo</span>` : ''}
        </div>
      `)

      bounds.extend([lat, lng])
    })

    if (validPGs.length === 1) {
      map.setView([validPGs[0].latitude, validPGs[0].longitude], 15)
    } else {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
    }
  }, [pgs])

  return <div ref={mapRef} className={`rounded-xl overflow-hidden ${className}`} style={{ minHeight: 200 }} />
}
