import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MockProvider } from '@/lib/availability/providers/mock'
import { SlotAggregator, resolveTimeWindow } from '@/lib/availability/aggregator'
import { ProviderNotImplementedError } from '@/lib/availability/providers/base'
import { IntegrationProvider } from '@/lib/availability/providers/integration.stub'
import { ClubWebsiteScraperProvider } from '@/lib/availability/providers/scraper.stub'
import { makeSlotKey, SOURCE_PRIORITY } from '@/lib/availability/types'
import type { NormalizedSlot, SlotQuery } from '@/lib/availability/types'
import type { AvailabilityProvider } from '@/lib/availability/providers/base'
import { MOCK_SLOTS } from '../../seed/mock-data'

// ── Helpers ────────────────────────────────────────────────────────────────

function makeSlot(overrides: Partial<NormalizedSlot> = {}): NormalizedSlot {
  const base: NormalizedSlot = {
    key: 'court-x::2026-07-01T10:00:00.000Z',
    court_id: 'c1000000-0000-4000-8000-000000000001',
    venue_id: null,
    start_time: '2026-07-01T10:00:00.000Z',
    end_time: '2026-07-01T11:00:00.000Z',
    status: 'frei',
    price_cents: 1200,
    source: 'own',
    last_updated: new Date().toISOString(),
    provider: 'test',
  }
  return { ...base, ...overrides }
}

// Minimal stub provider for testing aggregator logic
function stubProvider(slots: NormalizedSlot[], name = 'stub'): AvailabilityProvider {
  return {
    name,
    enabled: true,
    getSlots: async () => slots,
  }
}

// Supabase crowd_report call returns empty (no DB in unit tests)
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        gte: () => ({
          or: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
    }),
  },
}))

// ── makeSlotKey ────────────────────────────────────────────────────────────

describe('makeSlotKey', () => {
  it('uses court_id when present', () => {
    const key = makeSlotKey('court-1', 'venue-1', '2026-07-01T10:00:00Z')
    expect(key).toBe('court-1::2026-07-01T10:00:00Z')
  })

  it('falls back to venue_id when court_id is null', () => {
    const key = makeSlotKey(null, 'venue-1', '2026-07-01T10:00:00Z')
    expect(key).toBe('venue-1::2026-07-01T10:00:00Z')
  })
})

// ── SOURCE_PRIORITY ────────────────────────────────────────────────────────

describe('SOURCE_PRIORITY', () => {
  it('own beats everything', () => {
    expect(SOURCE_PRIORITY.own).toBeLessThan(SOURCE_PRIORITY.integration)
    expect(SOURCE_PRIORITY.own).toBeLessThan(SOURCE_PRIORITY.scraper)
    expect(SOURCE_PRIORITY.own).toBeLessThan(SOURCE_PRIORITY.crowdsourced)
  })

  it('integration beats scraper', () => {
    expect(SOURCE_PRIORITY.integration).toBeLessThan(SOURCE_PRIORITY.scraper)
  })
})

// ── Deduplication ──────────────────────────────────────────────────────────

describe('SlotAggregator – deduplication', () => {
  it('keeps higher-priority source when two providers return same key', async () => {
    const ownSlot = makeSlot({ source: 'own', status: 'frei', provider: 'own' })
    const scrapedSlot = makeSlot({ source: 'scraper', status: 'belegt', provider: 'scraper' })

    const agg = new SlotAggregator([stubProvider([ownSlot]), stubProvider([scrapedSlot])])
    const query: SlotQuery = {
      from: new Date('2026-07-01T09:00:00Z'),
      to: new Date('2026-07-01T12:00:00Z'),
    }
    const result = await agg.getSlots(query)

    expect(result).toHaveLength(1)
    expect(result[0].source).toBe('own')
    expect(result[0].status).toBe('frei')
  })

  it('keeps both slots when keys differ', async () => {
    const slot1 = makeSlot({ key: 'court-1::10:00', start_time: '2026-07-01T10:00:00Z' })
    const slot2 = makeSlot({ key: 'court-1::11:00', start_time: '2026-07-01T11:00:00Z' })

    const agg = new SlotAggregator([stubProvider([slot1, slot2])])
    const result = await agg.getSlots({
      from: new Date('2026-07-01T09:00:00Z'),
      to: new Date('2026-07-01T13:00:00Z'),
    })

    expect(result).toHaveLength(2)
  })

  it('returns empty when no providers enabled', async () => {
    const disabled: AvailabilityProvider = { name: 'off', enabled: false, getSlots: async () => [] }
    const agg = new SlotAggregator([disabled])
    const result = await agg.getSlots({
      from: new Date('2026-07-01T09:00:00Z'),
      to: new Date('2026-07-01T12:00:00Z'),
    })
    expect(result).toHaveLength(0)
  })

  it('continues when one provider throws', async () => {
    const failing: AvailabilityProvider = {
      name: 'bad',
      enabled: true,
      getSlots: async () => {
        throw new Error('network error')
      },
    }
    const slot = makeSlot()
    const agg = new SlotAggregator([failing, stubProvider([slot])])
    const result = await agg.getSlots({
      from: new Date('2026-07-01T09:00:00Z'),
      to: new Date('2026-07-01T12:00:00Z'),
    })
    expect(result).toHaveLength(1)
  })
})

// ── MockProvider ───────────────────────────────────────────────────────────

describe('MockProvider', () => {
  let provider: MockProvider

  beforeEach(() => {
    provider = new MockProvider()
  })

  it('returns slots within the time window', async () => {
    // Use a very wide window to get all mock slots
    const slots = await provider.getSlots({
      from: new Date(0),
      to: new Date('2099-01-01'),
    })
    expect(slots.length).toBeGreaterThan(0)
    expect(slots.length).toBe(MOCK_SLOTS.length)
  })

  it('filters out slots outside the window', async () => {
    // Past window – none of our mock slots should match
    const slots = await provider.getSlots({
      from: new Date('2000-01-01'),
      to: new Date('2000-01-02'),
    })
    expect(slots).toHaveLength(0)
  })

  it('filters by status', async () => {
    const slots = await provider.getSlots({
      from: new Date(0),
      to: new Date('2099-01-01'),
      status: 'frei',
    })
    expect(slots.every((s) => s.status === 'frei')).toBe(true)
  })

  it('filters by courtIds', async () => {
    const targetCourtId = 'c1000000-0000-4000-8000-000000000001'
    const slots = await provider.getSlots({
      from: new Date(0),
      to: new Date('2099-01-01'),
      courtIds: [targetCourtId],
    })
    expect(slots.every((s) => s.court_id === targetCourtId)).toBe(true)
    expect(slots.length).toBeGreaterThan(0)
  })

  it('assigns correct provider name and db_id', async () => {
    const slots = await provider.getSlots({ from: new Date(0), to: new Date('2099-01-01') })
    expect(slots[0].provider).toBe('mock')
    expect(slots[0].db_id).toBeDefined()
  })
})

// ── resolveTimeWindow ──────────────────────────────────────────────────────

describe('resolveTimeWindow', () => {
  it('now: returns 2h window from current time', () => {
    const before = Date.now()
    const { from, to } = resolveTimeWindow('now')
    expect(from.getTime()).toBeGreaterThanOrEqual(before)
    expect(to.getTime() - from.getTime()).toBeCloseTo(2 * 60 * 60 * 1000, -3)
  })

  it('morning: 06:00–12:00 today', () => {
    const { from, to } = resolveTimeWindow('morning')
    expect(from.getHours()).toBe(6)
    expect(to.getHours()).toBe(12)
  })

  it('afternoon: 12:00–18:00 today', () => {
    const { from, to } = resolveTimeWindow('afternoon')
    expect(from.getHours()).toBe(12)
    expect(to.getHours()).toBe(18)
  })

  it('evening: 18:00–23:59 today', () => {
    const { from, to } = resolveTimeWindow('evening')
    expect(from.getHours()).toBe(18)
    expect(to.getHours()).toBe(23)
  })

  it('custom: uses provided dates', () => {
    const f = new Date('2026-07-01T09:00:00Z')
    const t = new Date('2026-07-01T11:00:00Z')
    const { from, to } = resolveTimeWindow('custom', f, t)
    expect(from).toBe(f)
    expect(to).toBe(t)
  })

  it('custom: throws without dates', () => {
    expect(() => resolveTimeWindow('custom')).toThrow()
  })
})

// ── Stub providers ─────────────────────────────────────────────────────────

describe('Stub providers', () => {
  it('IntegrationProvider is disabled', () => {
    expect(new IntegrationProvider().enabled).toBe(false)
  })

  it('ClubWebsiteScraperProvider is disabled', () => {
    expect(new ClubWebsiteScraperProvider().enabled).toBe(false)
  })

  it('IntegrationProvider throws ProviderNotImplementedError when called directly', async () => {
    await expect(
      new IntegrationProvider().getSlots({ from: new Date(), to: new Date() })
    ).rejects.toThrow(ProviderNotImplementedError)
  })
})

// ── End-to-End: aggregator with MockProvider ───────────────────────────────

describe('E2E: aggregator with MockProvider', () => {
  it('returns combined, deduped slots from mock data', async () => {
    const agg = new SlotAggregator([new MockProvider()])
    const slots = await agg.getSlots({
      from: new Date(0),
      to: new Date('2099-01-01'),
    })

    expect(slots.length).toBeGreaterThan(0)
    // No duplicate keys
    const keys = slots.map((s) => s.key)
    expect(new Set(keys).size).toBe(keys.length)
    // All have a provider name
    expect(slots.every((s) => typeof s.provider === 'string')).toBe(true)
  })

  it('time filter: only slots overlapping [from, to)', async () => {
    const agg = new SlotAggregator([new MockProvider()])
    const from = new Date(0)
    const to = new Date('2000-01-01') // nothing in the past
    const slots = await agg.getSlots({ from, to })
    expect(slots).toHaveLength(0)
  })
})
