'use client'

import { useState, useEffect } from 'react'
import { AACHEN_CENTER } from '@/lib/filter/distance'

interface GeoState {
  lat: number
  lng: number
  loading: boolean
  error: string | null
  isActualLocation: boolean
}

export function useGeolocation(): GeoState {
  // Lazy initializer avoids synchronous setState inside effect
  const [state, setState] = useState<GeoState>(() => {
    const supported = typeof navigator !== 'undefined' && Boolean(navigator.geolocation)
    return {
      lat: AACHEN_CENTER.lat,
      lng: AACHEN_CENTER.lng,
      loading: supported,
      error: supported ? null : 'Geolocation nicht verfügbar',
      isActualLocation: false,
    }
  })

  useEffect(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          loading: false,
          error: null,
          isActualLocation: true,
        })
      },
      () => {
        // Fallback to city center silently
        setState((s) => ({
          ...s,
          loading: false,
          isActualLocation: false,
        }))
      },
      { timeout: 5000, maximumAge: 60_000 }
    )
  }, [])

  return state
}
