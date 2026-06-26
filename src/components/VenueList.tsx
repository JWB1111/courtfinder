'use client'

import { useMemo } from 'react'
import type { EnrichedVenue } from '@/types/enriched'
import type { VenueFilter } from '@/types/schemas'
import type { SortOrder } from '@/types/enriched'
import { filterAndSort } from '@/lib/filter/venue-filter'
import { withDistances } from '@/lib/filter/venue-filter'
import { VenueCard } from './VenueCard'
import { FilterBar } from './FilterBar'
import { useVenueFilter } from '@/hooks/useVenueFilter'
import { useGeolocation } from '@/hooks/useGeolocation'

interface Props {
  venues: EnrichedVenue[]
}

export function VenueList({ venues }: Props) {
  const { filter, sort, setFilter, setSort, toggleType, resetFilter } = useVenueFilter()
  const geo = useGeolocation()

  // Re-compute distances with real user location once available
  const venuesWithDist = useMemo(() => {
    return withDistances(venues, geo.lat, geo.lng)
  }, [venues, geo.lat, geo.lng])

  // Apply filter + sort (pure, memoised)
  const filtered = useMemo(() => {
    const filterWithGeo: Partial<VenueFilter> = {
      ...filter,
      userLat: geo.lat,
      userLng: geo.lng,
    }
    return filterAndSort(venuesWithDist, filterWithGeo, sort as SortOrder)
  }, [venuesWithDist, filter, sort, geo.lat, geo.lng])

  return (
    <div className="space-y-4">
      <FilterBar
        filter={filter}
        sort={sort}
        onToggleType={toggleType}
        onSetFilter={setFilter}
        onSetSort={setSort}
        onReset={resetFilter}
      />

      {/* Location indicator */}
      {!geo.loading && (
        <p className="text-xs text-gray-400">
          {geo.isActualLocation
            ? 'Standort erkannt – Entfernungen berechnet'
            : 'Kein Standort – Entfernungen ab Aachen-Mitte'}
        </p>
      )}

      {/* Results count */}
      <p className="text-sm font-medium text-gray-700">
        {filtered.length} {filtered.length === 1 ? 'Ergebnis' : 'Ergebnisse'}
      </p>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center">
          <p className="text-gray-500">Keine Venues gefunden.</p>
          <button
            onClick={resetFilter}
            className="mt-2 text-sm text-gray-400 underline-offset-2 hover:underline"
          >
            Filter zurücksetzen
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <VenueCard key={v.id} venue={v} />
          ))}
        </div>
      )}
    </div>
  )
}
