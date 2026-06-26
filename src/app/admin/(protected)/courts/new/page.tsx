import type { Metadata } from 'next'
import { getAdminVenues } from '@/lib/data/admin'
import { CourtForm } from '@/components/admin/CourtForm'

export const metadata: Metadata = { title: 'Admin – Platz anlegen' }

export default async function NewCourtPage() {
  const venues = await getAdminVenues()
  return (
    <main className="space-y-5">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">Platz anlegen</h1>
        <p className="text-sm text-ink-500">Einzelne Plätze für eine Tennis- oder Padel-Venue.</p>
      </header>
      <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-sm">
        <CourtForm venues={venues} />
      </div>
    </main>
  )
}
