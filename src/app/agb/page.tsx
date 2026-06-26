import Link from 'next/link'
import type { Metadata } from 'next'
import { getLegalHtml, LEGAL_TITLES } from '@/lib/legal'

export const metadata: Metadata = { title: `${LEGAL_TITLES.agb} – CourtFinder` }

export default function AgbPage() {
  const html = getLegalHtml('agb')
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-4 px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-ink-400 hover:text-ink-700">
        ← Zurück
      </Link>
      <article
        className="prose rounded-2xl border border-ink-200 bg-white p-6 shadow-sm sm:p-8"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </main>
  )
}
