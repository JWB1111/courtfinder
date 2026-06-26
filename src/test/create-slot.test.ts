import { describe, it, expect, vi, beforeEach } from 'vitest'

// createSlot now always writes to Supabase via the service-role client.
// We mock the DB client and next/cache so the unit test never touches a
// real database or the Next runtime.

const insertedRows: unknown[] = []

vi.mock('next/cache', () => ({ revalidatePath: () => {} }))

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => ({
    from: () => ({
      insert: (row: unknown) => {
        insertedRows.push(row)
        return {
          select: () => ({
            single: async () => ({ data: { id: 'd1000000-0000-4000-8000-000000000abc' }, error: null }),
          }),
        }
      },
    }),
  }),
}))

import { createSlot } from '@/actions/create-slot'

function fd(fields: Record<string, string>): FormData {
  const f = new FormData()
  for (const [k, v] of Object.entries(fields)) f.set(k, v)
  return f
}

const TODAY = new Date().toISOString().slice(0, 10)

describe('createSlot', () => {
  beforeEach(() => {
    insertedRows.length = 0
  })

  it('rejects missing date/time without touching the DB', async () => {
    const result = await createSlot(fd({ court_id: 'c1000000-0000-4000-8000-000000000001', status: 'frei' }))
    expect(result.ok).toBe(false)
    expect(insertedRows).toHaveLength(0)
  })

  it('rejects end_time before start_time', async () => {
    const result = await createSlot(
      fd({
        court_id: 'c1000000-0000-4000-8000-000000000001',
        date: TODAY,
        start_time: '10:00',
        end_time: '09:00',
        status: 'frei',
      })
    )
    expect(result.ok).toBe(false)
    expect(insertedRows).toHaveLength(0)
  })

  it('inserts a valid slot and returns ok', async () => {
    const result = await createSlot(
      fd({
        court_id: 'c1000000-0000-4000-8000-000000000001',
        venue_id: 'a1000000-0000-4000-8000-000000000001',
        date: TODAY,
        start_time: '09:00',
        end_time: '10:00',
        status: 'frei',
        price_eur: '12.00',
      })
    )
    expect(result.ok).toBe(true)
    expect(result.id).toBeTruthy()
    expect(insertedRows).toHaveLength(1)
    expect(insertedRows[0]).toMatchObject({ status: 'frei', price_cents: 1200, source: 'own' })
  })
})

// SlotInputSchema validation (pure)
import { SlotInputSchema } from '@/types/schemas'

describe('SlotInputSchema', () => {
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

  it('rejects end before start', () => {
    expect(
      SlotInputSchema.safeParse({
        ...base,
        start_time: `${TODAY}T10:00:00.000Z`,
        end_time: `${TODAY}T09:00:00.000Z`,
      }).success
    ).toBe(false)
  })

  it('rejects when both court_id and venue_id are null', () => {
    expect(SlotInputSchema.safeParse({ ...base, court_id: null, venue_id: null }).success).toBe(false)
  })

  it('accepts null price_cents', () => {
    expect(SlotInputSchema.safeParse({ ...base, price_cents: null }).success).toBe(true)
  })

  it('rejects negative price_cents', () => {
    expect(SlotInputSchema.safeParse({ ...base, price_cents: -1 }).success).toBe(false)
  })
})
