import type { Venue, Court, GymOffer } from '@/types/domain'
import type { NormalizedSlot } from '@/lib/availability/types'
import { MockProvider } from '@/lib/availability/providers/mock'
import { OwnSlotsProvider } from '@/lib/availability/providers/own-slots'
import { SlotAggregator } from '@/lib/availability/aggregator'
import { MOCK_VENUES, MOCK_COURTS, MOCK_GYM_OFFERS } from '../../../seed/mock-data'

const IS_MOCK = process.env.NEXT_PUBLIC_IS_MOCK === 'true'

export interface VenueDetail {
  venue: Venue
  courts: Court[]
  gym_offers: GymOffer[]
  slots: NormalizedSlot[]
}

export async function getVenueDetail(
  venueId: string,
  timeWindow: { from: Date; to: Date }
): Promise<VenueDetail | null> {
  let venue: Venue | null = null
  let courts: Court[] = []
  let gymOffers: GymOffer[] = []

  if (IS_MOCK) {
    venue = (MOCK_VENUES.find((v) => v.id === venueId) as unknown as Venue) ?? null
    courts = (MOCK_COURTS as unknown as Court[]).filter((c) => c.venue_id === venueId)
    gymOffers = (MOCK_GYM_OFFERS as unknown as GymOffer[]).filter((o) => o.venue_id === venueId)
  } else {
    const { createServerClient } = await import('@/lib/supabase/server')
    const supabase = createServerClient()
    const [venueRes, courtsRes, offersRes] = await Promise.all([
      supabase.from('venues').select('*').eq('id', venueId).single(),
      supabase.from('courts').select('*').eq('venue_id', venueId),
      supabase.from('gym_offers').select('*').eq('venue_id', venueId).eq('active', true),
    ])
    if (venueRes.error || !venueRes.data) return null
    venue = venueRes.data
    courts = courtsRes.data ?? []
    gymOffers = offersRes.data ?? []
  }

  if (!venue) return null

  // Gyms have offers (tageskarte / probetraining) but no bookable time slots
  if (courts.length === 0) {
    return { venue, courts, gym_offers: gymOffers, slots: [] }
  }

  const providers = IS_MOCK ? [new MockProvider()] : [new OwnSlotsProvider()]
  const aggregator = new SlotAggregator(providers)
  const slots = await aggregator.getSlots({
    from: timeWindow.from,
    to: timeWindow.to,
    courtIds: courts.map((c) => c.id),
    venueIds: [venueId],
  })

  return { venue, courts, gym_offers: gymOffers, slots }
}
