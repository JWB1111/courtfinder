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
          <p className="inline-flex items-center gap-1.5 text-xs text-ink-400">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            Entfernungen ab deinem Standort
          </p>
        ) : geo.loading ? (
          <p className="text-xs text-ink-400">Standort wird ermittelt…</p>
        ) : (
          <button
            onClick={geo.requestLocation}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline"
            title="Standortdaten werden nicht gespeichert und nur für diese Sitzung verwendet"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            Standort für Entfernungen aktivieren
          </button>
        )}
      </div>

      {/* Tab toggle + results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-700">
          {filtered.length} {filtered.length === 1 ? 'Ergebnis' : 'Ergebnisse'}
        </p>

        <div className="flex overflow-hidden rounded-lg border border-ink-200 p-0.5">
          {(['list', 'map'] as ViewTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                'rounded-md px-4 py-1 text-sm font-medium transition-colors',
                activeTab === tab
                  ? 'bg-ink-900 text-white'
                  : 'bg-white text-ink-500 hover:bg-ink-50',
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
        <div className="rounded-2xl border border-dashed border-ink-200 py-12 text-center">
          <p className="text-ink-500">Keine Venues gefunden.</p>
          <button
            onClick={resetFilter}
            className="mt-2 text-sm font-medium text-brand-600 underline-offset-2 hover:underline"
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
      <p className="text-right text-xs text-ink-400">Alle Verfügbarkeitsangaben ohne Gewähr.</p>
    </div>
  )
}
