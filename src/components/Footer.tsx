import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-ink-100 bg-white px-4 py-8 text-center text-xs text-ink-400">
      <nav className="mb-2 flex flex-wrap justify-center gap-4">
        <Link href="/impressum" className="hover:text-ink-700">
          Impressum
        </Link>
        <Link href="/datenschutz" className="hover:text-ink-700">
          Datenschutz
        </Link>
        <Link href="/agb" className="hover:text-ink-700">
          AGB
        </Link>
      </nav>
      <p>© {new Date().getFullYear()} CourtFinder · Alle Verfügbarkeitsangaben ohne Gewähr</p>
    </footer>
  )
}
