import { describe, it, expect } from 'vitest'
import { getVenueDetail } from '@/lib/data/venue-detail'
import { submitCrowdReport } from '@/actions/crowd-report'
import { VENUE_IDS, COURT_IDS } from '../../seed/mock-data'
import { resolveTimeWindow } from '@/lib/availability/aggregator'

// These tests run in mock mode (NEXT_PUBLIC_IS_MOCK=true from .env.local)

describe('getVenueDetail – mock mode', () => {
  it('returns null for an unknown venue ID', async () => {
    const window = resolveTimeWindow('today')
    const result = await getVenueDetail('00000000-0000-4000-8000-000000000000', window)
    expect(result).toBeNull()
  })

  it('returns venue data for a known tennis venue', async () => {
    const window = resolveTimeWindow('today')
    const result = await getVenueDetail(VENUE_IDS.GW_AACHEN, window)
    expect(result).not.toBeNull()
    expect(result!.venue.id).toBe(VENUE_IDS.GW_AACHEN)
    expect(result!.venue.type).toBe('tennis')
  })

  it('returns the venue courts', async () => {
    const window = resolveTimeWindow('today')
    const result = await getVenueDetail(VENUE_IDS.GW_AACHEN, window)
    expect(result!.courts.length).toBeGreaterThan(0)
    expect(result!.courts.every((c) => c.venue_id === VENUE_IDS.GW_AACHEN)).toBe(true)
  })

  it('returns gym offers for a gym venue', async () => {
    const window = resolveTimeWindow('today')
    const result = await getVenueDetail(VENUE_IDS.FITONE_AACHEN, window)
    expect(result!.venue.type).toBe('gym')
    expect(result!.gym_offers.length).toBeGreaterThan(0)
    expect(result!.gym_offers.every((o) => o.venue_id === VENUE_IDS.FITONE_AACHEN)).toBe(true)
  })

  it('returns no courts for a gym', async () => {
    const window = resolveTimeWindow('today')
    const result = await getVenueDetail(VENUE_IDS.FITONE_AACHEN, window)
    expect(result!.courts).toHaveLength(0)
  })

  it('returns slots that belong to the venue courts', async () => {
    const window = resolveTimeWindow('today')
    const result = await getVenueDetail(VENUE_IDS.GW_AACHEN, window)
    const courtIds = new Set(result!.courts.map((c) => c.id))
    // Every slot with a court_id must belong to this venue
    for (const slot of result!.slots) {
      if (slot.court_id) {
        expect(courtIds.has(slot.court_id)).toBe(true)
      }
    }
  })

  it('filters slots by time window', async () => {
    const morning = resolveTimeWindow('morning') // 6–12
    const evening = resolveTimeWindow('evening') // 18–24

    const morningResult = await getVenueDetail(VENUE_IDS.GW_AACHEN, morning)
    const eveningResult = await getVenueDetail(VENUE_IDS.GW_AACHEN, evening)

    // GW_AACHEN has indoor court slots at 18–20 (evening only)
    const morningCourtIds = new Set(morningResult!.slots.map((s) => s.court_id))
    const eveningCourtIds = new Set(eveningResult!.slots.map((s) => s.court_id))

    // GW_3 (Halle) slots are at 18–20 → should appear in evening, not morning
    expect(eveningCourtIds.has(COURT_IDS.GW_3)).toBe(true)
    expect(morningCourtIds.has(COURT_IDS.GW_3)).toBe(false)
  })

  it('returns empty slots for a gym venue', async () => {
    const window = resolveTimeWindow('today')
    const result = await getVenueDetail(VENUE_IDS.MCFIT_AACHEN, window)
    expect(result!.slots).toHaveLength(0)
  })
})

describe('submitCrowdReport – mock mode', () => {
  it('returns ok:true in mock mode', async () => {
    const result = await submitCrowdReport(VENUE_IDS.GW_AACHEN, COURT_IDS.GW_1, 'frei')
    expect(result.ok).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('handles belegt status', async () => {
    const result = await submitCrowdReport(VENUE_IDS.GW_AACHEN, null, 'belegt')
    expect(result.ok).toBe(true)
  })
})
