import type { EnrichedVenue, SortOrder } from '@/types/enriched'
import type { VenueFilter } from '@/types/schemas'
import { haversineKm } from './distance'

/**
 * Attach distance_km to each venue based on user or fallback position.
 * Pure function – does not mutate the input array.
 */
export function withDistances(
  venues: EnrichedVenue[],
  userLat: number,
  userLng: number
): EnrichedVenue[] {
  return venues.map((v) => ({
    ...v,
    distance_km: haversineKm(userLat, userLng, v.lat, v.lng),
  }))
}

/**
 * Apply all active filters. Returns a new array (never mutates).
 *
 * Filter rules:
 *  - types: venue must match at least one selected type (empty = all)
 *  - onlyFree: venue must have ≥1 free slot
 *  - indoorOnly: venue must have ≥1 indoor court (gyms always pass)
 *  - hasTageskarte: gym must offer a Tageskarte
 *  - hasProbetraining: gym must offer Probetraining
 *  - radiusKm: distance_km must be ≤ radius (skipped if no distance)
 */
export function filterVenues(
  venues: EnrichedVenue[],
  filter: Partial<VenueFilter>
): EnrichedVenue[] {
  const {
    types = [],
    onlyFree = false,
    indoorOnly = false,
    hasTageskarte = false,
    hasProbetraining = false,
    radiusKm,
    userLat,
    userLng,
  } = filter

  return venues.filter((v) => {
    // Type filter
    if (types.length > 0 && !types.includes(v.type)) return false

    // Only free slots
    if (onlyFree && !v.has_free_slots) return false

    // Indoor only (gyms don't have courts, always pass this filter)
    if (indoorOnly && v.type !== 'gym' && !v.has_indoor) return false

    // Gym-specific filters only apply to gyms
    if (hasTageskarte && v.type === 'gym' && !v.has_tageskarte) return false
    if (hasProbetraining && v.type === 'gym' && !v.has_probetraining) return false

    // Radius filter (only when user location is known)
    if (radiusKm && userLat !== undefined && userLng !== undefined) {
      if (v.distance_km !== null && v.distance_km > radiusKm) return false
    }

    return true
  })
}

/**
 * Sort venues. Always puts venues with free slots first within same sort key.
 */
export function sortVenues(
  venues: EnrichedVenue[],
  order: SortOrder = 'distance'
): EnrichedVenue[] {
  return [...venues].sort((a, b) => {
    if (order === 'distance') {
      const dA = a.distance_km ?? Infinity
      const dB = b.distance_km ?? Infinity
      return dA - dB
    }
    if (order === 'free_slots') {
      return b.free_slots_count - a.free_slots_count
    }
    return a.name.localeCompare(b.name, 'de')
  })
}

/** Convenience: filter + sort in one call */
export function filterAndSort(
  venues: EnrichedVenue[],
  filter: Partial<VenueFilter>,
  order: SortOrder = 'distance'
): EnrichedVenue[] {
  return sortVenues(filterVenues(venues, filter), order)
}
