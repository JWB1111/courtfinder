import Link from 'next/link'
import type { Metadata } from 'next'
import { getLegalHtml, LEGAL_TITLES } from '@/lib/legal'

export const metadata: Metadata = { title: `${LEGAL_TITLES.impressum} – CourtFinder` }

export default function ImpressumPage() {
  const html = getLegalHtml('impressum')
  return (
    <main className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        ← Zurück
      </Link>
      <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  )
}
