export default function HomeLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-6 space-y-1">
        <div className="h-8 w-40 animate-pulse rounded-md bg-gray-200" />
        <div className="h-4 w-56 animate-pulse rounded-md bg-gray-100" />
      </header>

      {/* FilterBar skeleton */}
      <div className="mb-6 flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-20 animate-pulse rounded-full bg-gray-100" />
        ))}
      </div>

      {/* Result count + tab toggle skeleton */}
      <div className="mb-4 flex items-center justify-between">
        <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
        <div className="h-8 w-32 animate-pulse rounded-lg bg-gray-100" />
      </div>

      {/* Card grid skeleton */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    </main>
  )
}
