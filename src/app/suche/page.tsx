import Link from 'next/link'
import { getEnrichedVenues } from '@/lib/data/venues'
import { VenueListWrapper } from '@/components/VenueListWrapper'
import { resolveTimeWindow } from '@/lib/availability/aggregator'

export default async function SearchPage() {
  const { from, to } = resolveTimeWindow('today')
  const venues = await getEnrichedVenues({ from, to })

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
      <header className="mb-6">
        <Link
          href="/"
          className="mb-3 inline-flex items-center gap-1 text-sm text-ink-400 hover:text-ink-700"
        >
          ← Startseite
        </Link>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900">
          Plätze & Angebote
        </h1>
        <p className="text-sm text-ink-500">Verfügbarkeit in Aachen – heute</p>
      </header>
      <VenueListWrapper venues={venues} />
    </main>
  )
}
