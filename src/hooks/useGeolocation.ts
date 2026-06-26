'use client'

import { useState, useCallback } from 'react'
import { AACHEN_CENTER } from '@/lib/filter/distance'

interface GeoState {
  lat: number
  lng: number
  loading: boolean
  error: string | null
  isActualLocation: boolean
}

export interface GeoResult extends GeoState {
  /** Call this after the user explicitly consents to share their location. */
  requestLocation: () => void
}

export function useGeolocation(): GeoResult {
  // Always start with the city centre so server and client render identically.
  // Location is only fetched when the user explicitly calls requestLocation().
  // Coordinates live exclusively in React state – never written to
  // localStorage, sessionStorage, or any persistent store.
  const [state, setState] = useState<GeoState>({
    lat: AACHEN_CENTER.lat,
    lng: AACHEN_CENTER.lng,
    loading: false,
    error: null,
    isActualLocation: false,
  })

  const requestLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setState((s) => ({ ...s, error: 'Standortdienste nicht verfügbar', loading: false }))
      return
    }
    setState((s) => ({ ...s, loading: true, error: null }))
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
        setState((s) => ({ ...s, loading: false, isActualLocation: false }))
      },
      { timeout: 8000, maximumAge: 120_000 }
    )
  }, [])

  return { ...state, requestLocation }
}
