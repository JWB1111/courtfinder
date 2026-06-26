import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-ink-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M5 5a13 13 0 0 1 0 14M19 5a13 13 0 0 0 0 14" />
            </svg>
          </span>
          <span className="text-base font-bold tracking-tight text-ink-900">CourtFinder</span>
        </Link>

        <Link
          href="/suche"
          className="rounded-lg bg-brand-600 px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Plätze finden
        </Link>
      </div>
    </header>
  )
}
