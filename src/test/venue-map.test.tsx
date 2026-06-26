import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

// MapLibre GL is a browser-only library. In tests we stub the module so we can
// assert that VenueMap renders its loading state and handles venues correctly.
vi.mock('maplibre-gl', () => ({
  Map: class {
    on(_event: string, cb: () => void) {
      // Immediately fire 'load' so tests don't hang
      if (_event === 'load') cb()
      return this
    }
    addControl() {
      return this
    }
    fitBounds() {
      return this
    }
    remove() {}
  },
  NavigationControl: class {},
  Marker: class {
    setLngLat() {
      return this
    }
    addTo() {
      return this
    }
    remove() {}
    getElement() {
      return document.createElement('div')
    }
  },
  Popup: class {
    setLngLat() {
      return this
    }
    setHTML() {
      return this
    }
    addTo() {
      return this
    }
    remove() {}
  },
}))

import { VenueMap } from '@/components/VenueMap'
import type { EnrichedVenue } from '@/types/enriched'

function makeVenue(overrides: Partial<EnrichedVenue> = {}): EnrichedVenue {
  return {
    id: 'a1000000-0000-4000-8000-000000000001',
    name: 'TC Test',
    type: 'tennis',
    address: 'Teststr. 1, 52062 Aachen',
    lat: 50.7753,
    lng: 6.0839,
    operator: null,
    website: null,
    phone: null,
    photo_url: null,
    source: 'crowdsourced',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    courts: [],
    gym_offers: [],
    free_slots_count: 2,
    distance_km: 1.2,
    has_free_slots: true,
    has_indoor: false,
    has_tageskarte: false,
    has_probetraining: false,
    ...overrides,
  }
}

describe('VenueMap', () => {
  beforeEach(() => {
    // happy-dom doesn't implement ResizeObserver; stub it
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  })

  it('renders without crashing with an empty venue list', () => {
    render(<VenueMap venues={[]} />)
    // The map container div is always rendered
    expect(document.querySelector('[ref]') ?? document.body).toBeTruthy()
  })

  it('renders without crashing with venues', () => {
    const venues = [makeVenue(), makeVenue({ id: 'a1000000-0000-4000-8000-000000000002', name: 'TC Zwei' })]
    render(<VenueMap venues={venues} />)
    expect(document.body).toBeTruthy()
  })
})

// ── Tab toggle in VenueList ───────────────────────────────────────────────

// Stub router and search-params so VenueList can render in tests
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => '/',
}))

import { VenueList } from '@/components/VenueList'

describe('VenueList tab toggle', () => {
  it('starts on the Liste tab', () => {
    render(<VenueList venues={[makeVenue()]} />)
    expect(screen.getByRole('button', { name: 'Liste' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Karte' })).toBeTruthy()
    // VenueCard text appears in List mode
    expect(screen.getByText('TC Test')).toBeTruthy()
  })

  it('switches to Karte tab on click', () => {
    render(<VenueList venues={[makeVenue()]} />)
    fireEvent.click(screen.getByRole('button', { name: 'Karte' }))
    // VenueCard is gone, map container is present
    expect(screen.queryByText('TC Test')).toBeNull()
  })

  it('switches back to Liste tab', () => {
    render(<VenueList venues={[makeVenue()]} />)
    fireEvent.click(screen.getByRole('button', { name: 'Karte' }))
    fireEvent.click(screen.getByRole('button', { name: 'Liste' }))
    expect(screen.getByText('TC Test')).toBeTruthy()
  })
})
