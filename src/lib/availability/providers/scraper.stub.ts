/**
 * ClubWebsiteScraperProvider – stub for per-club HTML scrapers.
 *
 * LEGAL NOTE: Before implementing any scraper:
 *   1. Check the club website's robots.txt and Terms of Service.
 *   2. Implement rate-limiting and respectful caching (TTL ≥ 15 min).
 *   3. Mark scraped data with source='scraper' so users know it may be stale.
 *   4. DSGVO: do not scrape or store personal data.
 *
 * Architecture when implemented:
 *   - One ClubScrapeAdapter per venue (registered by venueId)
 *   - Results cached in Supabase `slots` table with source='scraper'
 *   - Scrape job runs server-side (Next.js route handler or cron)
 *
 * TODO: implement first adapter for a specific Aachen club website.
 */
import type { AvailabilityProvider } from './base'
import { ProviderNotImplementedError } from './base'
import type { SlotQuery, NormalizedSlot } from '../types'

export class ClubWebsiteScraperProvider implements AvailabilityProvider {
  readonly name = 'scraper'
  readonly enabled = false // flip to true once a scraper adapter exists

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getSlots(_query: SlotQuery): Promise<NormalizedSlot[]> {
    throw new ProviderNotImplementedError(this.name)
  }
}
