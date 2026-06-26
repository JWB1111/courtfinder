import { describe, it, expect, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import { VENUE_IDS } from '../../seed/mock-data'

// ─────────────────────────────────────────────────────────────────────────────
// RLS-Smoke-Test gegen die ECHTE Supabase-DB.
//
// Verifiziert mit dem ANON-Key (nicht service_role!), dass:
//   1. anonymes INSERT eines Crowd-Reports erlaubt ist,
//   2. UPDATE und DELETE für anon weiterhin blockiert sind.
//
// Läuft nur, wenn Live-Credentials gesetzt sind UND Mock-Mode aus ist:
//   NEXT_PUBLIC_IS_MOCK=false \
//   npx vitest run src/test/crowd-report-rls.smoke.test.ts
//
// Eingefügte Test-Zeilen werden am Ende per service_role-Key wieder gelöscht.
// ─────────────────────────────────────────────────────────────────────────────

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const isMock = process.env.NEXT_PUBLIC_IS_MOCK === 'true'

const shouldRun = Boolean(url && anonKey) && !isMock
const runOrSkip = shouldRun ? describe : describe.skip

const insertedIds: string[] = []

runOrSkip('crowd_reports RLS (anon key, live DB)', () => {
  const anon = createClient(url!, anonKey!)

  it('erlaubt anonymes INSERT und gibt die Zeile zurück', async () => {
    const { data, error } = await anon
      .from('crowd_reports')
      .insert({
        venue_id: VENUE_IDS.GW_AACHEN,
        court_id: null,
        reported_status: 'frei',
        reported_at: new Date().toISOString(),
        trust_score: 1,
      })
      .select()
      .single()

    expect(error).toBeNull()
    expect(data?.id).toBeTruthy()
    expect(data?.reported_status).toBe('frei')
    if (data?.id) insertedIds.push(data.id)
  })

  it('blockiert UPDATE für anon (keine Policy → 0 Zeilen / Fehler)', async () => {
    const { data, error } = await anon
      .from('crowd_reports')
      .update({ reported_status: 'belegt' })
      .eq('venue_id', VENUE_IDS.GW_AACHEN)
      .select()

    // RLS liefert entweder einen Fehler oder einfach keine betroffene Zeile.
    expect(error ? true : (data?.length ?? 0) === 0).toBe(true)
  })

  it('blockiert DELETE für anon (keine Policy → 0 Zeilen / Fehler)', async () => {
    const { data, error } = await anon
      .from('crowd_reports')
      .delete()
      .eq('venue_id', VENUE_IDS.GW_AACHEN)
      .select()

    expect(error ? true : (data?.length ?? 0) === 0).toBe(true)
  })

  afterAll(async () => {
    // Aufräumen: nur möglich mit service_role (umgeht RLS).
    if (!serviceKey || insertedIds.length === 0) return
    const admin = createClient(url!, serviceKey)
    await admin.from('crowd_reports').delete().in('id', insertedIds)
  })
})
