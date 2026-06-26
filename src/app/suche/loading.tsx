export default function SearchLoading() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
      <header className="mb-6 space-y-2">
        <div className="h-4 w-24 animate-pulse rounded bg-ink-100" />
        <div className="h-8 w-48 animate-pulse rounded-md bg-ink-200" />
        <div className="h-4 w-40 animate-pulse rounded-md bg-ink-100" />
      </header>

      {/* FilterBar skeleton */}
      <div className="mb-4 h-32 animate-pulse rounded-2xl bg-ink-100" />

      {/* Result count + tab toggle skeleton */}
      <div className="mb-4 flex items-center justify-between">
        <div className="h-4 w-24 animate-pulse rounded bg-ink-100" />
        <div className="h-8 w-32 animate-pulse rounded-lg bg-ink-100" />
      </div>

      {/* Card grid skeleton */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-ink-100" />
        ))}
      </div>
    </main>
  )
}
