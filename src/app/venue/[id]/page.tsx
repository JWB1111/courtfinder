import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Court } from '@/types/domain'
import type { NormalizedSlot } from '@/lib/availability/types'
import { getVenueDetail } from '@/lib/data/venue-detail'
import { resolveTimeWindow } from '@/lib/availability/aggregator'
import type { TimeOfDay } from '@/lib/availability/aggregator'
import { TimeFilter } from '@/components/TimeFilter'
import { CrowdReportButton } from '@/components/CrowdReportButton'

// ── Helpers ────────────────────────────────────────────────────────────────

const VALID_TIMES = new Set<string>(['now', 'morning', 'afternoon', 'evening', 'today'])

function parseTime(raw: string | undefined): TimeOfDay {
  return raw && VALID_TIMES.has(raw) ? (raw as TimeOfDay) : 'today'
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

function formatPrice(cents: number | null): string | null {
  if (cents === null) return null
  if (cents === 0) return 'Kostenlos'
  return (cents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
}

function surfaceLabel(surface: string | null): string | null {
  const map: Record<string, string> = {
    sand: 'Sand',
    hartplatz: 'Hartplatz',
    kunstrasen: 'Kunstrasen',
    teppich: 'Teppich',
    beton: 'Beton',
  }
  return surface ? (map[surface] ?? surface) : null
}

const TYPE_BADGE_STYLE: Record<string, string> = {
  tennis: 'bg-green-100 text-green-800',
  padel: 'bg-blue-100 text-blue-800',
  gym: 'bg-purple-100 text-purple-800',
}

const TYPE_LABEL: Record<string, string> = {
  tennis: 'Tennis',
  padel: 'Padel',
  gym: 'Gym',
}

// ── Sub-components (server-rendered) ──────────────────────────────────────

function CourtSlotRow({ slot }: { slot: NormalizedSlot }) {
  const statusStyle =
    slot.status === 'frei'
      ? 'bg-green-100 text-green-800'
      : slot.status === 'belegt'
        ? 'bg-red-100 text-red-700'
        : 'bg-gray-100 text-gray-500'
  const statusLabel =
    slot.status === 'frei' ? 'Frei' : slot.status === 'belegt' ? 'Belegt' : 'Unbekannt'

  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-sm text-gray-700">
        {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
      </span>
      <div className="flex items-center gap-3">
        {formatPrice(slot.price_cents) && (
          <span className="text-xs text-gray-400">{formatPrice(slot.price_cents)}</span>
        )}
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle}`}>
          {statusLabel}
        </span>
      </div>
    </div>
  )
}

function CourtCard({ court, slots }: { court: Court; slots: NormalizedSlot[] }) {
  const meta = [court.indoor ? 'Halle' : 'Outdoor', surfaceLabel(court.surface)]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2.5">
        <span className="font-medium text-gray-900">{court.name}</span>
        {meta && <span className="text-xs text-gray-400">{meta}</span>}
      </div>
      {slots.length === 0 ? (
        <div className="px-4 py-3 text-sm text-gray-400">Keine Daten für dieses Zeitfenster</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {slots.map((slot) => (
            <CourtSlotRow key={slot.key} slot={slot} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default async function VenueDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ time?: string }>
}) {
  const { id } = await params
  const { time } = await searchParams
  const timeOfDay = parseTime(time)
  const timeWindow = resolveTimeWindow(timeOfDay)

  const detail = await getVenueDetail(id, timeWindow)
  if (!detail) notFound()

  const { venue, courts, gym_offers, slots } = detail
  const isGym = venue.type === 'gym'

  // Group slots by court_id, sorted by start_time
  const slotsByCourt = new Map<string, NormalizedSlot[]>()
  for (const slot of [...slots].sort((a, b) => a.start_time.localeCompare(b.start_time))) {
    const key = slot.court_id ?? ''
    if (!key) continue
    const list = slotsByCourt.get(key) ?? []
    list.push(slot)
    slotsByCourt.set(key, list)
  }

  const hasIndoor = courts.some((c) => c.indoor)

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        ← Zurück zur Übersicht
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_BADGE_STYLE[venue.type] ?? 'bg-gray-100 text-gray-600'}`}
          >
            {TYPE_LABEL[venue.type] ?? venue.type}
          </span>
          {hasIndoor && (
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              Halle verfügbar
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{venue.name}</h1>
        <p className="text-gray-500">{venue.address}</p>
        {(venue.phone || venue.website) && (
          <div className="flex flex-wrap gap-4 text-sm">
            {venue.phone && <span className="text-gray-500">{venue.phone}</span>}
            {venue.website && (
              <a
                href={venue.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Website →
              </a>
            )}
          </div>
        )}
      </div>

      {/* Gym offers */}
      {isGym && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Tagesangebote</h2>
          {gym_offers.length === 0 ? (
            <p className="text-sm text-gray-400">Keine Tagesangebote bekannt.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {gym_offers.map((offer) => (
                <div key={offer.id} className="space-y-2 rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        offer.type === 'tageskarte'
                          ? 'bg-orange-50 text-orange-700'
                          : 'bg-teal-50 text-teal-700'
                      }`}
                    >
                      {offer.type === 'tageskarte' ? 'Tageskarte' : 'Probetraining'}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatPrice(offer.price_cents) ?? '–'}
                    </span>
                  </div>
                  {offer.conditions && (
                    <p className="text-sm text-gray-500">{offer.conditions}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Slot availability for tennis / padel */}
      {!isGym && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Verfügbarkeit</h2>
          <TimeFilter current={timeOfDay} venueId={venue.id} />
          {slots.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center">
              <p className="text-gray-500">Keine Daten für dieses Zeitfenster.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {courts.map((court) => (
                <CourtCard
                  key={court.id}
                  court={court}
                  slots={slotsByCourt.get(court.id) ?? []}
                />
              ))}
            </div>
          )}

          <p className="text-right text-xs text-gray-400">Angaben ohne Gewähr.</p>
        </section>
      )}

      {/* Crowd report */}
      <section className="space-y-2 rounded-xl border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700">Aktuellen Status melden</h2>
        <p className="text-xs text-gray-400">
          Etwas stimmt nicht? Hilf anderen mit einer Echtzeit-Meldung.
        </p>
        <CrowdReportButton venueId={venue.id} />
      </section>
    </main>
  )
}
