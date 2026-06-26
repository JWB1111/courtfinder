/**
 * Seed-Skript – befüllt Supabase mit Mock-Daten für Entwicklung.
 *
 * Voraussetzung: SUPABASE_SERVICE_ROLE_KEY in .env.local (Service-Role umgeht RLS).
 * Alternativ: SQL direkt im Supabase Dashboard einfügen.
 *
 * Ausführen:
 *   npx tsx seed/run.ts
 *
 * WICHTIG: Nur auf dem Entwicklungs-Projekt ausführen, nie auf Produktion.
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'
import { MOCK_VENUES, MOCK_COURTS, MOCK_SLOTS, MOCK_GYM_OFFERS } from './mock-data'

config({ path: resolve(process.cwd(), '.env.local') })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error(
    '❌  SUPABASE_SERVICE_ROLE_KEY fehlt in .env.local.\n' +
      '   Supabase Dashboard → Project Settings → API → service_role key.'
  )
  process.exit(1)
}

const sb = createClient(url, serviceKey, { auth: { persistSession: false } })

async function upsert(table: string, rows: unknown[]) {
  const { error, count } = await sb
    .from(table)
    .upsert(rows as Record<string, unknown>[], { onConflict: 'id' })
    .select('id')
  if (error) throw new Error(`${table}: ${error.message}`)
  console.log(`  ✓ ${table.padEnd(15)} ${count ?? rows.length} Zeilen`)
}

async function main() {
  console.log('\n🌱  Seeding CourtFinder (Aachen Mock-Daten) …\n')
  await upsert('venues', MOCK_VENUES)
  await upsert('courts', MOCK_COURTS)
  await upsert('slots', MOCK_SLOTS)
  await upsert('gym_offers', MOCK_GYM_OFFERS)
  console.log('\n✅  Seed abgeschlossen.\n')
}

main().catch((e) => {
  console.error('❌  Seed fehlgeschlagen:', e.message)
  process.exit(1)
})
