/**
 * MockProvider – returns hard-coded seed data from seed/mock-data.ts.
 * Only active when NEXT_PUBLIC_IS_MOCK=true.
 */
import { MOCK_SLOTS } from '../../../../seed/mock-data'
import type { AvailabilityProvider } from './base'
import type { SlotQuery, NormalizedSlot } from '../types'
import { makeSlotKey } from '../types'

export class MockProvider implements AvailabilityProvider {
  readonly name = 'mock'
  readonly enabled = process.env.NEXT_PUBLIC_IS_MOCK === 'true'

  async getSlots(query: SlotQuery): Promise<NormalizedSlot[]> {
    const { from, to, venueIds, courtIds, status } = query
    const fromMs = from.getTime()
    const toMs = to.getTime()

    return MOCK_SLOTS.filter((s) => {
      const start = new Date(s.start_time).getTime()
      const end = new Date(s.end_time).getTime()

      // Overlap: slot overlaps [from, to)
      if (start >= toMs || end <= fromMs) return false

      if (venueIds?.length && !s.court_id) {
        if (!s.venue_id || !venueIds.includes(s.venue_id)) return false
      }
      if (courtIds?.length && s.court_id && !courtIds.includes(s.court_id)) return false
      if (status && s.status !== status) return false

      return true
    }).map((s) => ({
      key: makeSlotKey(s.court_id, s.venue_id, s.start_time),
      court_id: s.court_id,
      venue_id: s.venue_id,
      start_time: s.start_time,
      end_time: s.end_time,
      status: s.status,
      price_cents: s.price_cents,
      source: s.source,
      last_updated: s.last_updated,
      provider: this.name,
      db_id: s.id,
    }))
  }
}
