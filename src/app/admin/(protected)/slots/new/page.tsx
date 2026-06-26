import type { Metadata } from 'next'
import { getAdminVenues, getAdminCourts } from '@/lib/data/admin'
import { SlotForm } from '@/components/admin/SlotForm'

export const metadata: Metadata = { title: 'Admin – Slot anlegen' }

export default async function NewSlotPage() {
  const [venues, courts] = await Promise.all([getAdminVenues(), getAdminCourts()])
  return (
    <main className="space-y-5">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">Slot anlegen</h1>
        <p className="text-sm text-ink-500">Verfügbarkeit (frei/belegt) für einen Platz eintragen.</p>
      </header>
      <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-sm">
        <SlotForm venues={venues} courts={courts} />
      </div>
    </main>
  )
}
