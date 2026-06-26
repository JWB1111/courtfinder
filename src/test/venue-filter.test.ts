import { describe, it, expect } from 'vitest'
import { filterVenues, sortVenues, withDistances, filterAndSort } from '@/lib/filter/venue-filter'
import { haversineKm } from '@/lib/filter/distance'
import type { EnrichedVenue } from '@/types/enriched'

// ── Test fixtures ─────────────────────────────────────────────────────────

function venue(overrides: Partial<EnrichedVenue> = {}): EnrichedVenue {
  return {
    id: 'a1000000-0000-4000-8000-000000000001',
    name: 'Test Venue',
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
    free_slots_count: 0,
    distance_km: null,
    has_free_slots: false,
    has_indoor: false,
    has_tageskarte: false,
    has_probetraining: false,
    ...overrides,
  }
}

const AACHEN = { lat: 50.7753, lng: 6.0839 }

// ── Haversine ─────────────────────────────────────────────────────────────

describe('haversineKm', () => {
  it('returns 0 for same point', () => {
    expect(haversineKm(50.7753, 6.0839, 50.7753, 6.0839)).toBe(0)
  })

  it('Aachen → Cologne ≈ 64 km (Luftlinie)', () => {
    // Köln Hbf: 50.9431, 6.9580 – Luftlinie ~64 km
    const dist = haversineKm(50.7753, 6.0839, 50.9431, 6.958)
    expect(dist).toBeGreaterThan(60)
    expect(dist).toBeLessThan(70)
  })

  it('is symmetric', () => {
    const a = haversineKm(50.7753, 6.0839, 51.0, 7.0)
    const b = haversineKm(51.0, 7.0, 50.7753, 6.0839)
    expect(a).toBeCloseTo(b, 10)
  })
})

// ── withDistances ─────────────────────────────────────────────────────────

describe('withDistances', () => {
  it('computes distance_km for each venue', () => {
    const venues = [venue({ lat: 50.7753, lng: 6.0839 })]
    const result = withDistances(venues, AACHEN.lat, AACHEN.lng)
    expect(result[0].distance_km).toBe(0)
  })

  it('does not mutate the input', () => {
    const original = [venue()]
    withDistances(original, AACHEN.lat, AACHEN.lng)
    expect(original[0].distance_km).toBeNull()
  })
})

// ── filterVenues ──────────────────────────────────────────────────────────

describe('filterVenues – type filter', () => {
  const venues = [venue({ type: 'tennis' }), venue({ type: 'padel' }), venue({ type: 'gym' })]

  it('empty types = all pass', () => {
    expect(filterVenues(venues, { types: [] })).toHaveLength(3)
  })

  it('filters to single type', () => {
    const result = filterVenues(venues, { types: ['tennis'] })
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('tennis')
  })

  it('filters to multiple types', () => {
    const result = filterVenues(venues, { types: ['tennis', 'padel'] })
    expect(result).toHaveLength(2)
  })
})

describe('filterVenues – onlyFree', () => {
  const venues = [
    venue({ has_free_slots: true, free_slots_count: 2 }),
    venue({ has_free_slots: false }),
  ]

  it('off: shows all', () => {
    expect(filterVenues(venues, { onlyFree: false })).toHaveLength(2)
  })

  it('on: shows only venues with free slots', () => {
    const result = filterVenues(venues, { onlyFree: true })
    expect(result).toHaveLength(1)
    expect(result[0].has_free_slots).toBe(true)
  })
})

describe('filterVenues – indoorOnly', () => {
  const venues = [
    venue({ type: 'tennis', has_indoor: true }),
    venue({ type: 'tennis', has_indoor: false }),
    venue({ type: 'gym', has_indoor: false }), // gyms always pass
  ]

  it('off: shows all', () => {
    expect(filterVenues(venues, { indoorOnly: false })).toHaveLength(3)
  })

  it('on: hides outdoor courts, keeps gyms', () => {
    const result = filterVenues(venues, { indoorOnly: true })
    expect(result).toHaveLength(2)
    expect(result.every((v) => v.has_indoor || v.type === 'gym')).toBe(true)
  })
})

describe('filterVenues – gym offers', () => {
  const venues = [
    venue({ type: 'gym', has_tageskarte: true, has_probetraining: false }),
    venue({ type: 'gym', has_tageskarte: false, has_probetraining: true }),
    venue({ type: 'gym', has_tageskarte: true, has_probetraining: true }),
    venue({ type: 'tennis' }), // non-gym always passes gym filters
  ]

  it('hasTageskarte: keeps only gyms with Tageskarte + all non-gyms', () => {
    const result = filterVenues(venues, { hasTageskarte: true })
    expect(result).toHaveLength(3) // 2 gyms with tageskarte + 1 tennis
    expect(result.every((v) => v.type !== 'gym' || v.has_tageskarte)).toBe(true)
  })

  it('hasProbetraining: keeps only gyms with Probetraining + all non-gyms', () => {
    const result = filterVenues(venues, { hasProbetraining: true })
    expect(result).toHaveLength(3) // 2 gyms with probetraining + 1 tennis
  })

  it('both: keeps only gyms with both offers', () => {
    const result = filterVenues(venues, { hasTageskarte: true, hasProbetraining: true })
    expect(result).toHaveLength(2) // 1 gym with both + 1 tennis
  })
})

describe('filterVenues – radius', () => {
  const venues = [venue({ distance_km: 3 }), venue({ distance_km: 8 }), venue({ distance_km: 15 })]

  it('filters by radius when userLat/Lng provided', () => {
    const result = filterVenues(venues, {
      radiusKm: 10,
      userLat: AACHEN.lat,
      userLng: AACHEN.lng,
    })
    expect(result).toHaveLength(2)
  })

  it('skips radius filter without user location', () => {
    const result = filterVenues(venues, { radiusKm: 5 })
    expect(result).toHaveLength(3) // no lat/lng → all pass
  })
})

// ── sortVenues ────────────────────────────────────────────────────────────

describe('sortVenues', () => {
  const venues = [
    venue({ name: 'Zoo', distance_km: 5, free_slots_count: 1 }),
    venue({ name: 'Alpha', distance_km: 2, free_slots_count: 3 }),
    venue({ name: 'Mitte', distance_km: 10, free_slots_count: 0 }),
  ]

  it('sort by distance', () => {
    const result = sortVenues(venues, 'distance')
    expect(result.map((v) => v.distance_km)).toEqual([2, 5, 10])
  })

  it('sort by free_slots (descending)', () => {
    const result = sortVenues(venues, 'free_slots')
    expect(result.map((v) => v.free_slots_count)).toEqual([3, 1, 0])
  })

  it('sort by name (alphabetic, de)', () => {
    const result = sortVenues(venues, 'name')
    expect(result.map((v) => v.name)).toEqual(['Alpha', 'Mitte', 'Zoo'])
  })

  it('does not mutate the input', () => {
    const original = [...venues]
    sortVenues(venues, 'name')
    expect(venues.map((v) => v.name)).toEqual(original.map((v) => v.name))
  })
})

// ── filterAndSort ──────────────────────────────────────────────────────────

describe('filterAndSort', () => {
  it('combines filter + sort correctly', () => {
    const venues = [
      venue({ type: 'tennis', distance_km: 8, has_free_slots: true }),
      venue({ type: 'gym', distance_km: 2 }),
      venue({ type: 'tennis', distance_km: 3, has_free_slots: false }),
    ]
    const result = filterAndSort(venues, { types: ['tennis'] }, 'distance')
    expect(result).toHaveLength(2)
    expect(result[0].distance_km).toBe(3)
  })
})
