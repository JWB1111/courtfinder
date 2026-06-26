import Link from 'next/link'
import type { Metadata } from 'next'
import { getAdminVenues, getAdminCourts, getAdminGymOffers } from '@/lib/data/admin'

export const metadata: Metadata = { title: 'Admin – Übersicht' }

const TYPE_BADGE: Record<string, string> = {
  tennis: 'bg-emerald-50 text-emerald-700',
  padel: 'bg-sky-50 text-sky-700',
  gym: 'bg-violet-50 text-violet-700',
}

const ACTIONS = [
  { href: '/admin/venues/new', title: 'Venue anlegen', desc: 'Name, Typ, Adresse, Website' },
  { href: '/admin/courts/new', title: 'Platz anlegen', desc: 'Plätze für Tennis/Padel' },
  { href: '/admin/slots/new', title: 'Slot anlegen', desc: 'Verfügbarkeit pro Platz' },
  { href: '/admin/gym-offers/new', title: 'Gym-Angebot', desc: 'Tageskarte / Probetraining' },
]

export default async function AdminHubPage() {
  const [venues, courts, offers] = await Promise.all([
    getAdminVenues(),
    getAdminCourts(),
    getAdminGymOffers(),
  ])

  const courtCount = new Map<string, number>()
  for (const c of courts) courtCount.set(c.venue_id, (courtCount.get(c.venue_id) ?? 0) + 1)
  const offerCount = new Map<string, number>()
  for (const o of offers) offerCount.set(o.venue_id, (offerCount.get(o.venue_id) ?? 0) + 1)

  return (
    <main className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900">Admin</h1>
        <p className="text-sm text-ink-500">Venues, Plätze, Slots & Gym-Angebote verwalten.</p>
      </header>

      {/* Quick actions */}
      <section className="grid gap-3 sm:grid-cols-2">
        {ACTIONS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group flex items-center justify-between rounded-2xl border border-ink-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <span>
              <span className="block font-display text-lg font-semibold tracking-tight text-ink-900 group-hover:text-brand-700">
                {a.title}
              </span>
              <span className="text-sm text-ink-500">{a.desc}</span>
            </span>
            <span className="text-brand-600">→</span>
          </Link>
        ))}
      </section>

      {/* Existing venues */}
      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold tracking-tight text-ink-900">
          Venues ({venues.length})
        </h2>
        {venues.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 py-10 text-center">
            <p className="text-ink-500">Noch keine Venues in der Datenbank.</p>
            <Link
              href="/admin/venues/new"
              className="mt-2 inline-block text-sm font-medium text-brand-600 hover:underline"
            >
              Erste Venue anlegen →
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm">
            <ul className="divide-y divide-ink-100">
              {venues.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TYPE_BADGE[v.type] ?? 'bg-ink-100 text-ink-600'}`}
                      >
                        {v.type}
                      </span>
                      <span className="truncate font-medium text-ink-900">{v.name}</span>
                      {!v.active && (
                        <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs text-ink-500">
                          inaktiv
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-ink-400">{v.address}</p>
                  </div>
                  <div className="shrink-0 text-right text-xs text-ink-500 tabular-nums">
                    {v.type === 'gym'
                      ? `${offerCount.get(v.id) ?? 0} Angebote`
                      : `${courtCount.get(v.id) ?? 0} Plätze`}
                    <Link
                      href={`/venue/${v.id}`}
                      className="ml-3 font-medium text-brand-600 hover:underline"
                    >
                      ansehen
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  )
}
