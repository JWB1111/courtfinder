export type { AvailabilityProvider } from './providers/base'
export { ProviderNotImplementedError } from './providers/base'
export { MockProvider } from './providers/mock'
export { OwnSlotsProvider } from './providers/own-slots'
export { IntegrationProvider } from './providers/integration.stub'
export { ClubWebsiteScraperProvider } from './providers/scraper.stub'
export { SlotAggregator, resolveTimeWindow } from './aggregator'
export type { TimeOfDay } from './aggregator'
export type { SlotQuery, NormalizedSlot } from './types'
export { makeSlotKey, SOURCE_PRIORITY } from './types'

import { MockProvider } from './providers/mock'
import { OwnSlotsProvider } from './providers/own-slots'
import { IntegrationProvider } from './providers/integration.stub'
import { ClubWebsiteScraperProvider } from './providers/scraper.stub'
import { SlotAggregator } from './aggregator'

/** Default aggregator with all registered providers */
export function createAggregator(): SlotAggregator {
  return new SlotAggregator([
    new MockProvider(),
    new OwnSlotsProvider(),
    new IntegrationProvider(),
    new ClubWebsiteScraperProvider(),
  ])
}
