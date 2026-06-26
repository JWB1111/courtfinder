import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-100 bg-white px-4 py-6 text-center text-xs text-gray-400">
      <nav className="mb-2 flex flex-wrap justify-center gap-4">
        <Link href="/impressum" className="hover:text-gray-700">
          Impressum
        </Link>
        <Link href="/datenschutz" className="hover:text-gray-700">
          Datenschutz
        </Link>
        <Link href="/agb" className="hover:text-gray-700">
          AGB
        </Link>
      </nav>
      <p>© {new Date().getFullYear()} CourtFinder · Alle Verfügbarkeitsangaben ohne Gewähr</p>
    </footer>
  )
}
