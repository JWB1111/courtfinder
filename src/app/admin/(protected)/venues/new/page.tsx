import type { Metadata } from 'next'
import { VenueForm } from '@/components/admin/VenueForm'

export const metadata: Metadata = { title: 'Admin – Venue anlegen' }

export default function NewVenuePage() {
  return (
    <main className="space-y-5">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">Venue anlegen</h1>
        <p className="text-sm text-ink-500">
          Neue Sportstätte eintragen. Adresse eingeben und Koordinaten automatisch suchen lassen.
        </p>
      </header>
      <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-sm">
        <VenueForm />
      </div>
    </main>
  )
}
