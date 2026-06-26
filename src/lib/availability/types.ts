import type { SlotStatus, SlotSource } from '@/types/domain'

// Query passed to every provider
export interface SlotQuery {
  venueIds?: string[] // empty = all venues
  courtIds?: string[] // empty = all courts
  from: Date // window start (inclusive)
  to: Date // window end (exclusive)
  status?: SlotStatus // optional pre-filter
}

// Common slot shape returned by all providers (no DB id required)
export interface NormalizedSlot {
  // Stable key for dedup: generated from (court_id ?? venue_id) + start_time
  key: string
  court_id: string | null
  venue_id: string | null
  start_time: string // ISO 8601
  end_time: string
  status: SlotStatus
  price_cents: number | null
  source: SlotSource
  last_updated: string
  provider: string // which provider returned this
  db_id?: string // present when the slot already exists in our DB
}

// Lower number = higher priority when deduplicating
export const SOURCE_PRIORITY: Record<SlotSource, number> = {
  own: 1,
  integration: 2,
  scraper: 3,
  crowdsourced: 4,
}

export function makeSlotKey(
  courtId: string | null,
  venueId: string | null,
  startTime: string
): string {
  return `${courtId ?? venueId ?? 'unknown'}::${startTime}`
}
