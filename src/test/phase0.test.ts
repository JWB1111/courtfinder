import { describe, it, expect } from 'vitest'

// Phase 0: sanity checks – environment config, folder structure basics
describe('Phase 0 – Environment', () => {
  it('required env vars are defined (may be placeholder values in CI)', () => {
    // In real deployments these must be non-empty Supabase values
    expect(typeof process.env.NEXT_PUBLIC_SUPABASE_URL).toBe('string')
    expect(typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('string')
  })

  it('city config is set to Aachen', () => {
    expect(process.env.NEXT_PUBLIC_CITY).toBe('Aachen')
    expect(Number(process.env.NEXT_PUBLIC_CITY_LAT)).toBeCloseTo(50.7753, 2)
    expect(Number(process.env.NEXT_PUBLIC_CITY_LNG)).toBeCloseTo(6.0839, 2)
  })

  it('IS_MOCK flag is parseable as boolean', () => {
    const val = process.env.NEXT_PUBLIC_IS_MOCK
    expect(['true', 'false', undefined]).toContain(val)
  })
})
