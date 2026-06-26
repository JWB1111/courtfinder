'use client'

import Link from 'next/link'

export default function VenueDetailError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        ← Zurück zur Übersicht
      </Link>
      <div className="rounded-xl border border-red-100 bg-red-50 px-6 py-10 text-center space-y-4">
        <p className="font-medium text-red-700">Fehler beim Laden der Venue.</p>
        {process.env.NODE_ENV === 'development' && (
          <p className="text-sm text-red-500">{error.message}</p>
        )}
        <button
          onClick={unstable_retry}
          className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm text-red-700 hover:bg-red-50"
        >
          Erneut versuchen
        </button>
      </div>
    </main>
  )
}
