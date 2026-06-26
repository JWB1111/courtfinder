'use client'

import { useMemo, useState } from 'react'
import type { EnrichedVenue } from '@/types/enriched'
import type { VenueFilter } from '@/types/schemas'
import type { SortOrder } from '@/types/enriched'
import { filterAndSort } from '@/lib/filter/venue-filter'
import { withDistances } from '@/lib/filter/venue-filter'
import { VenueCard } from './VenueCard'
import { FilterBar } from './FilterBar'
import { VenueMap } from './VenueMap'
import { useVenueFilter } from '@/hooks/useVenueFilter'
import { useGeolocation } from '@/hooks/useGeolocation'

type ViewTab = 'list' | 'map'

interface Props {
  venues: EnrichedVenue[]
}

export function VenueList({ venues }: Props) {
  const { filter, sort, setFilter, setSort, toggleType, resetFilter } = useVenueFilter()
  const geo = useGeolocation()
  const [activeTab, setActiveTab] = useState<ViewTab>('list')

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

      {/* Location consent – only requested on explicit user action */}
      <div className="flex items-center gap-3">
        {geo.isActualLocation ? (
          <p className="text-xs text-gray-400">Entfernungen ab deinem Standort</p>
        ) : geo.loading ? (
          <p className="text-xs text-gray-400">Standort wird ermittelt…</p>
        ) : (
          <button
            onClick={geo.requestLocation}
            className="text-xs text-blue-600 hover:underline"
            title="Standortdaten werden nicht gespeichert und nur für diese Sitzung verwendet"
          >
            Standort für Entfernungen aktivieren
          </button>
        )}
      </div>

      {/* Tab toggle + results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">
          {filtered.length} {filtered.length === 1 ? 'Ergebnis' : 'Ergebnisse'}
        </p>

        <div className="flex overflow-hidden rounded-lg border border-gray-200">
          {(['list', 'map'] as ViewTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                'px-4 py-1.5 text-sm font-medium transition-colors',
                activeTab === tab
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50',
              ].join(' ')}
            >
              {tab === 'list' ? 'Liste' : 'Karte'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'map' ? (
        <VenueMap
          venues={filtered}
          userLat={geo.isActualLocation ? geo.lat : undefined}
          userLng={geo.isActualLocation ? geo.lng : undefined}
        />
      ) : filtered.length === 0 ? (
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

      {/* Availability disclaimer */}
      <p className="text-xs text-gray-400 text-right">
        Alle Verfügbarkeitsangaben ohne Gewähr.
      </p>
    </div>
  )
}
