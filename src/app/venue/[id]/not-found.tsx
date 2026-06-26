import Link from 'next/link'

export default function VenueNotFound() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-4 py-6">
      <Link
        href="/suche"
        className="inline-flex items-center gap-1 text-sm text-ink-400 hover:text-ink-700"
      >
        ← Zurück zur Übersicht
      </Link>
      <div className="space-y-2 rounded-2xl border border-dashed border-ink-200 bg-white py-16 text-center">
        <p className="font-medium text-ink-900">Venue nicht gefunden</p>
        <p className="text-sm text-ink-400">Diese Anlage existiert nicht oder wurde entfernt.</p>
      </div>
    </main>
  )
}
