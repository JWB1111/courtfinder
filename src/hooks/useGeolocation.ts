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
  // Always start with loading:false so server and client render identical HTML.
  // useEffect runs after hydration and handles the browser-only geolocation API.
  const [state, setState] = useState<GeoState>({
    lat: AACHEN_CENTER.lat,
    lng: AACHEN_CENTER.lng,
    loading: false,
    error: null,
    isActualLocation: false,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: 'Geolocation nicht verfügbar' }))
      return
    }

    setState((s) => ({ ...s, loading: true }))

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
