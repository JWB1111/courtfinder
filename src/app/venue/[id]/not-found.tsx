import Link from 'next/link'

export default function VenueNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        ← Zurück zur Übersicht
      </Link>
      <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center space-y-2">
        <p className="text-gray-900 font-medium">Venue nicht gefunden</p>
        <p className="text-sm text-gray-400">Diese Anlage existiert nicht oder wurde entfernt.</p>
      </div>
    </main>
  )
}
