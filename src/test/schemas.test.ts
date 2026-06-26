import { describe, it, expect } from 'vitest'
import {
  VenueSchema,
  CourtSchema,
  SlotSchema,
  GymOfferSchema,
  CrowdReportInputSchema,
  SlotInputSchema,
  VenueFilterSchema,
} from '@/types/schemas'
import { MOCK_VENUES, MOCK_COURTS, MOCK_SLOTS, MOCK_GYM_OFFERS } from '../../seed/mock-data'

// ── Venue ──────────────────────────────────────────────────────────────────

describe('VenueSchema', () => {
  const validVenue = {
    ...MOCK_VENUES[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  it('accepts a valid venue', () => {
    expect(() => VenueSchema.parse(validVenue)).not.toThrow()
  })

  it('rejects invalid type', () => {
    expect(() => VenueSchema.parse({ ...validVenue, type: 'basketball' })).toThrow()
  })

  it('rejects invalid source', () => {
    expect(() => VenueSchema.parse({ ...validVenue, source: 'unknown' })).toThrow()
  })

  it('rejects out-of-range coordinates', () => {
    expect(() => VenueSchema.parse({ ...validVenue, lat: 200 })).toThrow()
    expect(() => VenueSchema.parse({ ...validVenue, lng: -200 })).toThrow()
  })
})

// ── Court ──────────────────────────────────────────────────────────────────

describe('CourtSchema', () => {
  const validCourt = {
    ...MOCK_COURTS[0],
    created_at: new Date().toISOString(),
  }

  it('accepts a valid court', () => {
    expect(() => CourtSchema.parse(validCourt)).not.toThrow()
  })

  it('allows null surface', () => {
    expect(() => CourtSchema.parse({ ...validCourt, surface: null })).not.toThrow()
  })

  it('rejects invalid surface', () => {
    expect(() => CourtSchema.parse({ ...validCourt, surface: 'gras' })).toThrow()
  })
})

// ── Slot ───────────────────────────────────────────────────────────────────

describe('SlotSchema', () => {
  const now = new Date()
  const validSlot = {
    ...MOCK_SLOTS[0],
    last_updated: now.toISOString(),
    created_at: now.toISOString(),
  }

  it('accepts a valid slot', () => {
    expect(() => SlotSchema.parse(validSlot)).not.toThrow()
  })

  it('rejects invalid status', () => {
    expect(() => SlotSchema.parse({ ...validSlot, status: 'vielleicht' })).toThrow()
  })

  it('rejects negative price', () => {
    expect(() => SlotSchema.parse({ ...validSlot, price_cents: -1 })).toThrow()
  })
})

// ── SlotInput (end > start Validierung) ────────────────────────────────────

describe('SlotInputSchema', () => {
  const base = {
    court_id: MOCK_COURTS[0].id,
    venue_id: null,
    start_time: '2026-07-01T10:00:00+00:00',
    end_time: '2026-07-01T11:00:00+00:00',
    status: 'frei' as const,
    price_cents: 1200,
    source: 'own' as const,
  }

  it('accepts valid slot input', () => {
    expect(() => SlotInputSchema.parse(base)).not.toThrow()
  })

  it('rejects end_time before start_time', () => {
    expect(() =>
      SlotInputSchema.parse({ ...base, end_time: '2026-07-01T09:00:00+00:00' })
    ).toThrow()
  })

  it('rejects when both court_id and venue_id are null', () => {
    // base has court_id set; overriding it to null → both null → should throw
    expect(() => SlotInputSchema.parse({ ...base, court_id: null })).toThrow()
  })

  it('rejects when both IDs are null', () => {
    expect(() => SlotInputSchema.parse({ ...base, court_id: null, venue_id: null })).toThrow()
  })
})

// ── GymOffer ───────────────────────────────────────────────────────────────

describe('GymOfferSchema', () => {
  const validOffer = {
    ...MOCK_GYM_OFFERS[0],
    created_at: new Date().toISOString(),
  }

  it('accepts a valid gym offer', () => {
    expect(() => GymOfferSchema.parse(validOffer)).not.toThrow()
  })

  it('rejects invalid type', () => {
    expect(() => GymOfferSchema.parse({ ...validOffer, type: 'monatskarte' })).toThrow()
  })

  it('allows null price (= free)', () => {
    expect(() => GymOfferSchema.parse({ ...validOffer, price_cents: null })).not.toThrow()
  })
})

// ── CrowdReport ────────────────────────────────────────────────────────────

describe('CrowdReportInputSchema', () => {
  it('accepts report with venue_id', () => {
    expect(() =>
      CrowdReportInputSchema.parse({
        venue_id: MOCK_VENUES[0].id,
        court_id: null,
        reported_status: 'frei',
        reporter_token: null,
      })
    ).not.toThrow()
  })

  it('rejects report with neither venue_id nor court_id', () => {
    expect(() =>
      CrowdReportInputSchema.parse({
        venue_id: null,
        court_id: null,
        reported_status: 'frei',
        reporter_token: null,
      })
    ).toThrow()
  })

  it('rejects invalid reported_status', () => {
    expect(() =>
      CrowdReportInputSchema.parse({
        venue_id: MOCK_VENUES[0].id,
        court_id: null,
        reported_status: 'voll',
        reporter_token: null,
      })
    ).toThrow()
  })
})

// ── VenueFilter ────────────────────────────────────────────────────────────

describe('VenueFilterSchema', () => {
  it('provides sensible defaults', () => {
    const result = VenueFilterSchema.parse({})
    expect(result.types).toEqual([])
    expect(result.onlyFree).toBe(false)
    expect(result.radiusKm).toBe(10)
  })

  it('accepts full filter', () => {
    expect(() =>
      VenueFilterSchema.parse({
        types: ['tennis', 'padel'],
        onlyFree: true,
        indoorOnly: false,
        hasTageskarte: true,
        hasProbetraining: false,
        radiusKm: 5,
        dateFrom: '2026-07-01T09:00:00+00:00',
        dateTo: '2026-07-01T18:00:00+00:00',
      })
    ).not.toThrow()
  })
})

// ── Mock-Daten Konsistenz ──────────────────────────────────────────────────

describe('Mock data consistency', () => {
  it('all mock courts reference existing venues', () => {
    const venueIds = new Set(MOCK_VENUES.map((v) => v.id))
    for (const court of MOCK_COURTS) {
      expect(venueIds.has(court.venue_id), `court ${court.id} → unknown venue`).toBe(true)
    }
  })

  it('all mock slots reference existing courts', () => {
    const courtIds = new Set<string>(MOCK_COURTS.map((c) => c.id))
    for (const slot of MOCK_SLOTS) {
      if (slot.court_id) {
        expect(courtIds.has(slot.court_id), `slot ${slot.id} → unknown court`).toBe(true)
      }
    }
  })

  it('all mock gym_offers reference existing venues', () => {
    const venueIds = new Set(MOCK_VENUES.map((v) => v.id))
    for (const offer of MOCK_GYM_OFFERS) {
      expect(venueIds.has(offer.venue_id), `offer ${offer.id} → unknown venue`).toBe(true)
    }
  })

  it('slot end_time is always after start_time', () => {
    for (const slot of MOCK_SLOTS) {
      expect(
        new Date(slot.end_time) > new Date(slot.start_time),
        `slot ${slot.id}: end not after start`
      ).toBe(true)
    }
  })
})
