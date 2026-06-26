import Link from 'next/link'

const SPORTS = [
  {
    type: 'tennis',
    label: 'Tennis',
    desc: 'Freie Sand- & Hallenplätze in deiner Nähe',
    accent: 'text-brand-700',
    ring: 'group-hover:border-brand-300',
    iconBg: 'bg-brand-50 text-brand-700',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M5 5a13 13 0 0 1 0 14M19 5a13 13 0 0 0 0 14" />
      </svg>
    ),
  },
  {
    type: 'padel',
    label: 'Padel',
    desc: 'Buchbare Courts – die Trendsportart',
    accent: 'text-sky-700',
    ring: 'group-hover:border-sky-300',
    iconBg: 'bg-sky-50 text-sky-700',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="8.5" rx="6.5" ry="7" />
        <path d="M12 15.5V22M9 22h6" />
        <circle cx="10" cy="7" r="0.5" fill="currentColor" />
        <circle cx="14" cy="7" r="0.5" fill="currentColor" />
        <circle cx="12" cy="10" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    type: 'gym',
    label: 'Gym',
    desc: 'Tageskarten & Probetraining ohne Vertrag',
    accent: 'text-violet-700',
    ring: 'group-hover:border-violet-300',
    iconBg: 'bg-violet-50 text-violet-700',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11" />
      </svg>
    ),
  },
] as const

const FEATURES = [
  {
    title: 'Echtzeit-Verfügbarkeit',
    desc: 'Freie Slots nach Tageszeit – plus Crowd-Meldungen direkt von Spieler:innen.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
  },
  {
    title: 'In deiner Nähe',
    desc: 'Entfernungen ab deinem Standort – mit Listen- und Kartenansicht.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
  {
    title: 'Ohne Anmeldung',
    desc: 'Kostenlos, keine Registrierung, keine Tracking-Cookies. Einfach loslegen.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 13 4 4L19 7" />
      </svg>
    ),
  },
] as const

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink-100 bg-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-72 max-w-3xl rounded-full bg-brand-100/50 blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:py-24">
          <span className="animate-fade-up inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            Jetzt für Aachen
          </span>
          <h1 className="animate-fade-up mt-5 text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
            Freie Plätze finden —{' '}
            <span className="text-brand-600">sofort.</span>
          </h1>
          <p className="animate-fade-up mx-auto mt-4 max-w-xl text-base text-ink-500 sm:text-lg">
            Tennis, Padel und Gym-Tageskarten in Aachen auf einen Blick. Nach Tageszeit gefiltert,
            in deiner Nähe, ohne Anmeldung.
          </p>
          <div className="animate-fade-up mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/suche"
              className="w-full rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 sm:w-auto"
            >
              Plätze finden
            </Link>
            <Link
              href="/suche?type=gym"
              className="w-full rounded-xl border border-ink-200 bg-white px-6 py-3 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50 sm:w-auto"
            >
              Gym-Angebote ansehen
            </Link>
          </div>
        </div>
      </section>

      {/* Sport entry cards */}
      <section className="mx-auto max-w-5xl px-4 py-14">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-ink-900">Wonach suchst du?</h2>
          <Link href="/suche" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            Alle anzeigen →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {SPORTS.map((s) => (
            <Link
              key={s.type}
              href={`/suche?type=${s.type}`}
              className={`group flex flex-col rounded-2xl border border-ink-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${s.ring}`}
            >
              <span className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${s.iconBg}`}>
                {s.icon}
              </span>
              <span className="text-lg font-semibold text-ink-900">{s.label}</span>
              <span className="mt-1 text-sm text-ink-500">{s.desc}</span>
              <span className={`mt-4 text-sm font-medium ${s.accent}`}>Ansehen →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-ink-100 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <div className="grid gap-8 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title}>
                <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  {f.icon}
                </span>
                <h3 className="text-base font-semibold text-ink-900">{f.title}</h3>
                <p className="mt-1 text-sm text-ink-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="mx-auto max-w-5xl px-4 py-14">
        <div className="rounded-2xl bg-ink-900 px-6 py-10 text-center sm:px-12">
          <h2 className="text-2xl font-bold tracking-tight text-white">Bereit zu spielen?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-300">
            Finde jetzt einen freien Platz – ganz ohne Anmeldung.
          </p>
          <Link
            href="/suche"
            className="mt-6 inline-block rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-400"
          >
            Plätze finden
          </Link>
          <p className="mt-4 text-xs text-ink-500">Alle Verfügbarkeitsangaben ohne Gewähr.</p>
        </div>
      </section>
    </main>
  )
}
