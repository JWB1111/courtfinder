import type { SlotQuery, NormalizedSlot } from '../types'

export interface AvailabilityProvider {
  /** Unique identifier shown in NormalizedSlot.provider */
  readonly name: string
  /** Whether this provider is currently enabled */
  readonly enabled: boolean
  /** Fetch slots matching the query */
  getSlots(query: SlotQuery): Promise<NormalizedSlot[]>
}

/** Thrown by stub providers that are not yet implemented */
export class ProviderNotImplementedError extends Error {
  constructor(providerName: string) {
    super(`Provider "${providerName}" is not yet implemented.`)
    this.name = 'ProviderNotImplementedError'
  }
}
