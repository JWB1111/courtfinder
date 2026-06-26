import Link from 'next/link'
import type { Venue, Court } from '@/types/domain'
import { NewSlotForm } from '@/components/NewSlotForm'
import { MOCK_VENUES, MOCK_COURTS } from '../../../../seed/mock-data'

const IS_MOCK = process.env.NEXT_PUBLIC_IS_MOCK === 'true'

async function getAdminData(): Promise<{
  venues: Pick<Venue, 'id' | 'name' | 'type'>[]
  courts: Pick<Court, 'id' | 'venue_id' | 'name'>[]
}> {
  if (IS_MOCK) {
    return {
      venues: MOCK_VENUES.map(({ id, name, type }) => ({ id, name, type })),
      courts: MOCK_COURTS.map(({ id, venue_id, name }) => ({ id, venue_id, name })),
    }
  }

  const { createServerClient } = await import('@/lib/supabase/server')
  const supabase = createServerClient()
  const [venuesRes, courtsRes] = await Promise.all([
    supabase.from('venues').select('id, name, type').eq('active', true).order('name'),
    supabase.from('courts').select('id, venue_id, name').order('name'),
  ])
  return {
    venues: (venuesRes.data ?? []) as Pick<Venue, 'id' | 'name' | 'type'>[],
    courts: (courtsRes.data ?? []) as Pick<Court, 'id' | 'venue_id' | 'name'>[],
  }
}

export default async function AdminNewSlotPage() {
  const { venues, courts } = await getAdminData()

  return (
    <main className="mx-auto max-w-xl space-y-6 px-4 py-6">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        ← Zurück zur App
      </Link>

      <div className="space-y-1">
        <h1 className="text-xl font-bold text-gray-900">Slot anlegen</h1>
        <p className="text-sm text-gray-500">
          Intern – Zeitslot manuell in die Datenbank eintragen.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 p-6">
        <NewSlotForm venues={venues} courts={courts} isMock={IS_MOCK} />
      </div>
    </main>
  )
}
