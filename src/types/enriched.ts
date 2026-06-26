import type { Venue, Court, GymOffer } from './domain'

/** Venue with pre-joined related data + computed UI fields */
export interface EnrichedVenue extends Venue {
  courts: Court[]
  gym_offers: GymOffer[]
  free_slots_count: number
  distance_km: number | null
  has_free_slots: boolean
  has_indoor: boolean
  has_tageskarte: boolean
  has_probetraining: boolean
}

export type SortOrder = 'distance' | 'free_slots' | 'name'
