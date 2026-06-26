import { getEnrichedVenues } from '@/lib/data/venues'
import { VenueListWrapper } from '@/components/VenueListWrapper'
import { resolveTimeWindow } from '@/lib/availability/aggregator'

export default async function Home() {
  const { from, to } = resolveTimeWindow('today')
  const venues = await getEnrichedVenues({ from, to })

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">CourtFinder</h1>
        <p className="text-sm text-gray-500">Freie Plätze & Gym-Angebote in Aachen</p>
      </header>
      <VenueListWrapper venues={venues} />
    </main>
  )
}
