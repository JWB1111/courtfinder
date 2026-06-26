import Link from 'next/link'
import { requireAdmin } from '@/lib/admin-auth'
import { logout } from '@/actions/admin-auth'

const NAV = [
  { href: '/admin', label: 'Übersicht' },
  { href: '/admin/venues/new', label: 'Venue' },
  { href: '/admin/courts/new', label: 'Platz' },
  { href: '/admin/slots/new', label: 'Slot' },
  { href: '/admin/gym-offers/new', label: 'Gym-Angebot' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 pb-4">
        <nav className="flex flex-wrap gap-1.5">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-800"
          >
            Abmelden
          </button>
        </form>
      </div>
      {children}
    </div>
  )
}
