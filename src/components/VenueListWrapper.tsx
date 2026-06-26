'use client'

import { Suspense } from 'react'
import type { EnrichedVenue } from '@/types/enriched'
import { VenueList } from './VenueList'

export function VenueListWrapper({ venues }: { venues: EnrichedVenue[] }) {
  return (
    <Suspense fallback={<p className="text-gray-400">Lädt Filter…</p>}>
      <VenueList venues={venues} />
    </Suspense>
  )
}
