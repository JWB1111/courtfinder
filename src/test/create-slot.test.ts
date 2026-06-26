import { describe, it, expect } from 'vitest'
import { createSlot } from '@/actions/create-slot'

// createSlot runs as a server action – in test mode IS_MOCK=true so it
// should always return an explanatory error rather than touching the DB.

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value)
  }
  return fd
}

const TODAY = new Date().toISOString().slice(0, 10) // "YYYY-MM-DD"

describe('createSlot – mock mode', () => {
  it('returns ok:false with a helpful message in mock mode', async () => {
    const fd = makeFormData({
      venue_id: 'a1000000-0000-4000-8000-000000000001',
      date: TODAY,
      start_time: '09:00',
      end_time: '10:00',
      status: 'frei',
    })
    const result = await createSlot(fd)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/mock/i)
  })
})

// Validate the underlying SlotInputSchema used by createSlot
// (production path not reachable in tests, but we verify schema correctness)
import { SlotInputSchema } from '@/types/schemas'

describe('SlotInputSchema – used by createSlot', () => {
  const base = {
    court_id: 'c1000000-0000-4000-8000-000000000001',
    venue_id: null,
    start_time: `${TODAY}T09:00:00.000Z`,
    end_time: `${TODAY}T10:00:00.000Z`,
    status: 'frei' as const,
    price_cents: 1200,
    source: 'own' as const,
  }

  it('accepts valid input', () => {
    expect(SlotInputSchema.safeParse(base).success).toBe(true)
  })

  it('rejects end_time before start_time', () => {
    const result = SlotInputSchema.safeParse({
      ...base,
      start_time: `${TODAY}T10:00:00.000Z`,
      end_time: `${TODAY}T09:00:00.000Z`,
    })
    expect(result.success).toBe(false)
  })

  it('rejects when both court_id and venue_id are null', () => {
    const result = SlotInputSchema.safeParse({ ...base, court_id: null, venue_id: null })
    expect(result.success).toBe(false)
  })

  it('accepts null price_cents', () => {
    expect(SlotInputSchema.safeParse({ ...base, price_cents: null }).success).toBe(true)
  })

  it('rejects negative price_cents', () => {
    expect(SlotInputSchema.safeParse({ ...base, price_cents: -1 }).success).toBe(false)
  })
})
