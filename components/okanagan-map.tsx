'use client'

import { useEffect, useRef } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import 'leaflet/dist/leaflet.css'

export function OkanaganMap() {
  const mapElement = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadMap() {
      const L = await import('leaflet')
      if (cancelled || !mapElement.current || mapRef.current) return

      const map = L.map(mapElement.current, {
        center: [49.735, -119.35],
        zoom: 9,
        zoomControl: true,
        scrollWheelZoom: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      const markerIcon = L.divIcon({
        className: 'okanagan-marker',
        html: '<span></span>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })
      L.marker([49.735, -118.933], { icon: markerIcon }).addTo(map)
      mapRef.current = map
    }

    loadMap()

    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  return <div ref={mapElement} className="map-live" aria-label="Map of the Okanagan Valley" role="img" />
}
