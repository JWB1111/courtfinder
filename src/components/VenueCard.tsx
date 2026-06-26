import Link from 'next/link'
import type { EnrichedVenue } from '@/types/enriched'

const TYPE_LABEL: Record<string, string> = {
  tennis: 'Tennis',
  padel: 'Padel',
  gym: 'Gym',
}

const TYPE_BADGE: Record<string, string> = {
  tennis: 'bg-brand-50 text-brand-700',
  padel: 'bg-sky-50 text-sky-700',
  gym: 'bg-violet-50 text-violet-700',
}

const TYPE_BAR: Record<string, string> = {
  tennis: 'bg-brand-500',
  padel: 'bg-sky-500',
  gym: 'bg-violet-500',
}

interface Props {
  venue: EnrichedVenue
  href?: string
}

function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
}

export function VenueCard({ venue, href = `/venue/${venue.id}` }: Props) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white p-4 pl-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Category accent bar */}
      <span
        className={`absolute inset-y-0 left-0 w-1 ${TYPE_BAR[venue.type] ?? 'bg-ink-300'}`}
        aria-hidden
      />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${TYPE_BADGE[venue.type] ?? 'bg-ink-100 text-ink-600'}`}
            >
              {TYPE_LABEL[venue.type] ?? venue.type}
            </span>
            {venue.has_indoor && (
              <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-600">
                Halle
              </span>
            )}
          </div>
          <h3 className="mt-1.5 truncate font-semibold text-ink-900 transition-colors group-hover:text-brand-700">
            {venue.name}
          </h3>
          <p className="truncate text-sm text-ink-500">{venue.address}</p>
        </div>

        {venue.distance_km !== null && (
          <span className="shrink-0 rounded-md bg-ink-50 px-2 py-0.5 text-xs font-medium text-ink-500">
            {formatDistance(venue.distance_km)}
          </span>
        )}
      </div>

      {/* Tennis / Padel: free slots */}
      {venue.type !== 'gym' && (
        <div className="mt-3">
          {venue.has_free_slots ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
              <span className="h-2 w-2 rounded-full bg-brand-500" />
              {venue.free_slots_count} freie {venue.free_slots_count === 1 ? 'Stunde' : 'Stunden'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-3 py-1 text-sm text-ink-500">
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
            <span className="text-sm text-ink-400">Keine Tagesangebote</span>
          )}
        </div>
      )}
    </Link>
  )
}
