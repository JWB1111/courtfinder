'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { Map as MapLibreMap, Marker, Popup } from 'maplibre-gl'
import type { EnrichedVenue } from '@/types/enriched'
import { AACHEN_CENTER } from '@/lib/filter/distance'

interface Props {
  venues: EnrichedVenue[]
  userLat?: number
  userLng?: number
}

const TYPE_COLOR: Record<string, string> = {
  tennis: '#16a34a', // green-600
  padel: '#2563eb', // blue-600
  gym: '#9333ea', // purple-600
}

function markerEl(venue: EnrichedVenue): HTMLDivElement {
  const el = document.createElement('div')
  const color = TYPE_COLOR[venue.type] ?? '#6b7280'
  const hasFree = venue.has_free_slots
  el.style.cssText = `
    width: 28px; height: 28px; border-radius: 50%;
    background: ${color}; border: 3px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    cursor: pointer; transition: transform .15s;
    ${hasFree ? `box-shadow: 0 0 0 3px ${color}44, 0 2px 6px rgba(0,0,0,0.3);` : ''}
  `
  el.title = venue.name
  return el
}

function popupHtml(venue: EnrichedVenue): string {
  const typeLabel = { tennis: 'Tennis', padel: 'Padel', gym: 'Gym' }[venue.type] ?? venue.type
  const dist =
    venue.distance_km !== null
      ? venue.distance_km < 1
        ? `${Math.round(venue.distance_km * 1000)} m`
        : `${venue.distance_km.toFixed(1)} km`
      : ''

  const badge =
    venue.type !== 'gym'
      ? venue.has_free_slots
        ? `<span style="color:#16a34a;font-weight:600">● ${venue.free_slots_count} frei</span>`
        : '<span style="color:#9ca3af">Keine freien Plätze</span>'
      : [
          venue.has_tageskarte ? '<span style="color:#ea580c">Tageskarte</span>' : '',
          venue.has_probetraining ? '<span style="color:#0d9488">Probetraining</span>' : '',
        ]
          .filter(Boolean)
          .join(' · ') || '<span style="color:#9ca3af">Keine Tagesangebote</span>'

  return `
    <div style="font-family:system-ui,sans-serif;min-width:180px;padding:2px 0">
      <div style="font-size:11px;color:#6b7280;margin-bottom:2px">${typeLabel}${dist ? ` · ${dist}` : ''}</div>
      <div style="font-size:14px;font-weight:600;margin-bottom:4px">${venue.name}</div>
      <div style="font-size:12px;color:#6b7280;margin-bottom:6px">${venue.address}</div>
      <div style="font-size:12px;margin-bottom:8px">${badge}</div>
      <a href="/venue/${venue.id}"
         style="display:inline-block;font-size:12px;color:#2563eb;text-decoration:underline">
        Details →
      </a>
    </div>
  `
}

export function VenueMap({ venues, userLat, userLng }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markersRef = useRef<Marker[]>([])
  const popupRef = useRef<Popup | null>(null)
  const [mapReady, setMapReady] = useState(false)

  const centerLat = userLat ?? AACHEN_CENTER.lat
  const centerLng = userLng ?? AACHEN_CENTER.lng

  // Initialise map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    let map: MapLibreMap
    let cancelled = false

    import('maplibre-gl').then(({ Map, NavigationControl }) => {
      if (cancelled || !containerRef.current) return

      map = new Map({
        container: containerRef.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors',
            },
          },
          layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
        },
        center: [centerLng, centerLat],
        zoom: 12,
      })

      map.addControl(new NavigationControl(), 'top-right')
      map.on('load', () => {
        if (!cancelled) {
          mapRef.current = map
          setMapReady(true)
        }
      })
    })

    return () => {
      cancelled = true
      map?.remove()
      mapRef.current = null
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update markers whenever venues or map readiness changes
  const updateMarkers = useCallback(() => {
    const map = mapRef.current
    if (!map) return

    import('maplibre-gl').then(({ Marker, Popup }) => {
      // Clear existing markers
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      popupRef.current?.remove()

      const popup = new Popup({ closeButton: true, maxWidth: '260px', offset: 16 })
      popupRef.current = popup

      venues.forEach((venue) => {
        const el = markerEl(venue)
        const marker = new Marker({ element: el })
          .setLngLat([venue.lng, venue.lat])
          .addTo(map)

        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.2)'
        })
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)'
        })
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          popup.setLngLat([venue.lng, venue.lat]).setHTML(popupHtml(venue)).addTo(map)
        })

        markersRef.current.push(marker)
      })

      // Fit map to all markers if there are any
      if (venues.length > 0) {
        const lngs = venues.map((v) => v.lng)
        const lats = venues.map((v) => v.lat)
        map.fitBounds(
          [
            [Math.min(...lngs) - 0.01, Math.min(...lats) - 0.01],
            [Math.max(...lngs) + 0.01, Math.max(...lats) + 0.01],
          ],
          { padding: 48, maxZoom: 14, duration: 500 }
        )
      }
    })
  }, [venues])

  useEffect(() => {
    if (mapReady) updateMarkers()
  }, [mapReady, updateMarkers])

  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-xl border border-gray-200">
      <div ref={containerRef} className="h-full w-full" />
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <p className="text-sm text-gray-400">Karte lädt…</p>
        </div>
      )}
      {venues.length === 0 && mapReady && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-lg bg-white/90 px-4 py-2 shadow text-sm text-gray-500">
            Keine Venues gefunden
          </div>
        </div>
      )}
    </div>
  )
}
