import Link from 'next/link'
import type { EnrichedVenue } from '@/types/enriched'

const TYPE_LABEL: Record<string, string> = {
  tennis: 'Tennis',
  padel: 'Padel',
  gym: 'Gym',
}

const TYPE_COLOR: Record<string, string> = {
  tennis: 'bg-green-100 text-green-800',
  padel: 'bg-blue-100 text-blue-800',
  gym: 'bg-purple-100 text-purple-800',
}

interface Props {
  venue: EnrichedVenue
  href?: string
}

export function VenueCard({ venue, href = `/venue/${venue.id}` }: Props) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${TYPE_COLOR[venue.type] ?? ''}`}
            >
              {TYPE_LABEL[venue.type] ?? venue.type}
            </span>
            {venue.has_indoor && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                Halle
              </span>
            )}
          </div>
          <h3 className="mt-1 truncate font-semibold text-gray-900">{venue.name}</h3>
          <p className="truncate text-sm text-gray-500">{venue.address}</p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          {venue.distance_km !== null && (
            <span className="text-sm text-gray-500">
              {venue.distance_km < 1
                ? `${Math.round(venue.distance_km * 1000)} m`
                : `${venue.distance_km.toFixed(1)} km`}
            </span>
          )}
        </div>
      </div>

      {/* Tennis / Padel: free slots */}
      {venue.type !== 'gym' && (
        <div className="mt-3">
          {venue.has_free_slots ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              {venue.free_slots_count} freie {venue.free_slots_count === 1 ? 'Stunde' : 'Stunden'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-500">
              Keine freien Plätze
            </span>
          )}
        </div>
      )}

      {/* Gym: offers */}
      {venue.type === 'gym' && (
        <div className="mt-3 flex flex-wrap gap-2">
          {venue.has_tageskarte && (
            <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700">
              Tageskarte
            </span>
          )}
          {venue.has_probetraining && (
            <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
              Probetraining
            </span>
          )}
          {!venue.has_tageskarte && !venue.has_probetraining && (
            <span className="text-sm text-gray-400">Keine Tagesangebote</span>
          )}
        </div>
      )}
    </Link>
  )
}
