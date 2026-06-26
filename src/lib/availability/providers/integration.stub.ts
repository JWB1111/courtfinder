/**
 * IntegrationProvider – stub for booking-system APIs (eversports, Playtomic, …).
 *
 * LEGAL NOTE: Before implementing, verify the provider's Terms of Service allow
 * automated API access. Use official APIs where available; document any
 * unofficial endpoints as requiring legal review.
 *
 * TODO: implement per-provider adapters that implement this interface.
 */
import type { AvailabilityProvider } from './base'
import { ProviderNotImplementedError } from './base'
import type { SlotQuery, NormalizedSlot } from '../types'

export interface IntegrationAdapter {
  providerName: string
  fetchSlots(query: SlotQuery): Promise<NormalizedSlot[]>
}

export class IntegrationProvider implements AvailabilityProvider {
  readonly name = 'integration'
  readonly enabled = false // flip to true once an adapter is wired up

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getSlots(_query: SlotQuery): Promise<NormalizedSlot[]> {
    throw new ProviderNotImplementedError(this.name)
  }
}
