import type { Metadata } from 'next'
import { getAdminVenues } from '@/lib/data/admin'
import { GymOfferForm } from '@/components/admin/GymOfferForm'

export const metadata: Metadata = { title: 'Admin – Gym-Angebot anlegen' }

export default async function NewGymOfferPage() {
  const venues = await getAdminVenues()
  return (
    <main className="space-y-5">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">
          Gym-Angebot anlegen
        </h1>
        <p className="text-sm text-ink-500">Tageskarte oder Probetraining für ein Gym.</p>
      </header>
      <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-sm">
        <GymOfferForm venues={venues} />
      </div>
    </main>
  )
}
