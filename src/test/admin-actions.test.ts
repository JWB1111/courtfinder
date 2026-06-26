import { describe, it, expect, vi } from 'vitest'
import { createVenue } from '@/actions/create-venue'
import { createCourt } from '@/actions/create-court'
import { createGymOffer } from '@/actions/create-gym-offer'

// These tests only exercise the validation/early-return paths, which run
// before any Supabase call – so no DB access and no mocking needed.
vi.mock('next/cache', () => ({ revalidatePath: () => {} }))

function fd(fields: Record<string, string>): FormData {
  const f = new FormData()
  for (const [k, v] of Object.entries(fields)) f.set(k, v)
  return f
}

describe('createVenue – validation', () => {
  it('requires a name', async () => {
    const r = await createVenue(fd({ type: 'tennis', address: 'X', lat: '50', lng: '6' }))
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/name/i)
  })

  it('requires a valid type', async () => {
    const r = await createVenue(fd({ name: 'Test', type: 'football', address: 'X', lat: '50', lng: '6' }))
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/sportart/i)
  })

  it('requires coordinates', async () => {
    const r = await createVenue(fd({ name: 'Test', type: 'tennis', address: 'Teststr. 1' }))
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/koordinaten/i)
  })

  it('rejects out-of-range coordinates', async () => {
    const r = await createVenue(
      fd({ name: 'Test', type: 'tennis', address: 'X', lat: '999', lng: '6' })
    )
    expect(r.ok).toBe(false)
  })

  it('rejects a website without protocol', async () => {
    const r = await createVenue(
      fd({ name: 'Test', type: 'tennis', address: 'X', lat: '50', lng: '6', website: 'example.com' })
    )
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/http/i)
  })
})

describe('createCourt – validation', () => {
  it('requires a venue', async () => {
    const r = await createCourt(fd({ name: 'Platz 1' }))
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/venue/i)
  })

  it('requires a name', async () => {
    const r = await createCourt(fd({ venue_id: 'a1000000-0000-4000-8000-000000000001' }))
    expect(r.ok).toBe(false)
  })
})

describe('createGymOffer – validation', () => {
  it('requires a venue', async () => {
    const r = await createGymOffer(fd({ type: 'tageskarte' }))
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/gym/i)
  })

  it('requires a valid type', async () => {
    const r = await createGymOffer(
      fd({ venue_id: 'a1000000-0000-4000-8000-000000000005', type: 'foo' })
    )
    expect(r.ok).toBe(false)
  })

  it('rejects a negative price', async () => {
    const r = await createGymOffer(
      fd({ venue_id: 'a1000000-0000-4000-8000-000000000005', type: 'tageskarte', price_eur: '-5' })
    )
    expect(r.ok).toBe(false)
  })
})
