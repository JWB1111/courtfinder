import type { EnrichedVenue } from '@/types/enriched'
import type { Venue, Court, GymOffer } from '@/types/domain'
import { MockProvider } from '@/lib/availability/providers/mock'
import { OwnSlotsProvider } from '@/lib/availability/providers/own-slots'
import { SlotAggregator } from '@/lib/availability/aggregator'
import { AACHEN_CENTER, haversineKm } from '@/lib/filter/distance'
import { MOCK_VENUES, MOCK_COURTS, MOCK_GYM_OFFERS } from '../../../seed/mock-data'

const IS_MOCK = process.env.NEXT_PUBLIC_IS_MOCK === 'true'

// ── Raw data fetchers ──────────────────────────────────────────────────────

async function fetchVenues(): Promise<Venue[]> {
  if (IS_MOCK) return MOCK_VENUES as unknown as Venue[]
  const { supabase } = await import('@/lib/supabase/client')
  const { data, error } = await supabase.from('venues').select('*').eq('active', true)
  if (error) throw new Error(`fetchVenues: ${error.message}`)
  return data ?? []
}

async function fetchCourts(): Promise<Court[]> {
  if (IS_MOCK) return MOCK_COURTS as unknown as Court[]
  const { supabase } = await import('@/lib/supabase/client')
  const { data, error } = await supabase.from('courts').select('*')
  if (error) throw new Error(`fetchCourts: ${error.message}`)
  return data ?? []
}

async function fetchGymOffers(): Promise<GymOffer[]> {
  if (IS_MOCK) return MOCK_GYM_OFFERS as unknown as GymOffer[]
  const { supabase } = await import('@/lib/supabase/client')
  const { data, error } = await supabase.from('gym_offers').select('*').eq('active', true)
  if (error) throw new Error(`fetchGymOffers: ${error.message}`)
  return data ?? []
}

// ── Enrichment ─────────────────────────────────────────────────────────────

/** Fetch and enrich all venues for a given time window */
export async function getEnrichedVenues(timeWindow: {
  from: Date
  to: Date
}): Promise<EnrichedVenue[]> {
  const [venues, courts, gymOffers] = await Promise.all([
    fetchVenues(),
    fetchCourts(),
    fetchGymOffers(),
  ])

  // Get slots for the time window via the aggregator
  const providers = IS_MOCK ? [new MockProvider()] : [new OwnSlotsProvider()]
  const aggregator = new SlotAggregator(providers)
  const slots = await aggregator.getSlots({
    from: timeWindow.from,
    to: timeWindow.to,
  })

  // Index related data by venue_id for O(1) lookup
  const courtsByVenue = new Map<string, Court[]>()
  for (const court of courts) {
    const list = courtsByVenue.get(court.venue_id) ?? []
    list.push(court)
    courtsByVenue.set(court.venue_id, list)
  }

  const offersByVenue = new Map<string, GymOffer[]>()
  for (const offer of gymOffers) {
    const list = offersByVenue.get(offer.venue_id) ?? []
    list.push(offer)
    offersByVenue.set(offer.venue_id, list)
  }

  // Free slots per court (keyed by court_id)
  const freeSlotsByCourtId = new Map<string, number>()
  for (const slot of slots) {
    if (slot.status !== 'frei' || !slot.court_id) continue
    freeSlotsByCourtId.set(slot.court_id, (freeSlotsByCourtId.get(slot.court_id) ?? 0) + 1)
  }

  return venues.map((v): EnrichedVenue => {
    const venueCourts = courtsByVenue.get(v.id) ?? []
    const venueOffers = offersByVenue.get(v.id) ?? []
    const freeCount = venueCourts.reduce((sum, c) => sum + (freeSlotsByCourtId.get(c.id) ?? 0), 0)

    return {
      ...v,
      courts: venueCourts,
      gym_offers: venueOffers,
      free_slots_count: freeCount,
      distance_km: haversineKm(AACHEN_CENTER.lat, AACHEN_CENTER.lng, v.lat, v.lng),
      has_free_slots: freeCount > 0,
      has_indoor: venueCourts.some((c) => c.indoor),
      has_tageskarte: venueOffers.some((o) => o.type === 'tageskarte' && o.active),
      has_probetraining: venueOffers.some((o) => o.type === 'probetraining' && o.active),
    }
  })
}
