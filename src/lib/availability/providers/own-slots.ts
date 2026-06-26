/**
 * OwnSlotsProvider – reads from the `slots` table in Supabase.
 * Used for slots entered manually via the internal form (Phase 6).
 */
import { supabase } from '@/lib/supabase/client'
import type { AvailabilityProvider } from './base'
import type { SlotQuery, NormalizedSlot } from '../types'
import { makeSlotKey } from '../types'

export class OwnSlotsProvider implements AvailabilityProvider {
  readonly name = 'own-slots'
  readonly enabled = true

  async getSlots(query: SlotQuery): Promise<NormalizedSlot[]> {
    const { from, to, venueIds, courtIds, status } = query

    let q = supabase
      .from('slots')
      .select('*')
      .eq('source', 'own')
      // Overlap filter: start_time < to AND end_time > from
      .lt('start_time', to.toISOString())
      .gt('end_time', from.toISOString())

    if (status) q = q.eq('status', status)
    if (courtIds?.length) q = q.in('court_id', courtIds)
    else if (venueIds?.length) q = q.in('venue_id', venueIds)

    const { data, error } = await q

    if (error) throw new Error(`OwnSlotsProvider: ${error.message}`)

    return (data ?? []).map((s) => ({
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
